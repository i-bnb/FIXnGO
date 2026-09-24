import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface UploadResult {
  bucket: string;
  fileId: string;
  url: string;
  previewUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB Limit (OWASP ASVS)

/**
 * Validates binary header signatures (magic bytes) to prevent renamed executables and malicious files.
 */
export function detectMagicBytes(buffer: Buffer): { isValid: boolean; detectedMime?: string; isMalicious?: boolean } {
  if (!buffer || buffer.length < 4) {
    return { isValid: false };
  }

  // 1. Detect executable binaries and script payloads
  // Windows DOS/PE executable ('MZ' = 0x4D 0x5A)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return { isValid: false, isMalicious: true };
  }
  // Unix ELF executable (0x7F 'E' 'L' 'F')
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    return { isValid: false, isMalicious: true };
  }
  // Script / HTML payloads
  const textPrefix = buffer.subarray(0, Math.min(buffer.length, 50)).toString('utf8').toLowerCase();
  if (textPrefix.includes('<script') || textPrefix.includes('<?php') || textPrefix.startsWith('#!/bin/')) {
    return { isValid: false, isMalicious: true };
  }

  // 2. Validate allowed MIME signatures
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { isValid: true, detectedMime: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { isValid: true, detectedMime: 'image/png' };
  }
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { isValid: true, detectedMime: 'image/gif' };
  }
  // WebP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { isValid: true, detectedMime: 'image/webp' };
  }
  // PDF: %PDF (25 50 44 46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { isValid: true, detectedMime: 'application/pdf' };
  }
  // MP4: ....ftyp
  if (buffer.length >= 12 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return { isValid: true, detectedMime: 'video/mp4' };
  }

  return { isValid: false };
}

/**
 * Strips EXIF metadata (specifically GPS coordinates in APP1 marker) from JPEG images
 * to enforce UAE PDPL privacy compliance.
 */
export function stripExifMetadata(buffer: Buffer, mime: string): Buffer {
  if (mime !== 'image/jpeg' || buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer;
  }

  try {
    let offset = 2;
    const cleanChunks: Buffer[] = [buffer.subarray(0, 2)];

    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];

      if (marker === 0xd9 || marker === 0xda) {
        cleanChunks.push(buffer.subarray(offset));
        break;
      }

      if (offset + 4 > buffer.length) break;
      const length = buffer.readUInt16BE(offset + 2);

      // APP1 marker contains EXIF metadata
      if (marker === 0xe1) {
        offset += 2 + length;
        continue;
      }

      cleanChunks.push(buffer.subarray(offset, offset + 2 + length));
      offset += 2 + length;
    }

    return Buffer.concat(cleanChunks);
  } catch {
    return buffer;
  }
}

const BUCKET_PREFIX_MAP: Record<string, string> = {
  'job-photos': 'jobs/',
  signatures: 'jobs/',
  jobs: 'jobs/',
  invoices: 'invoices/',
  receipts: 'invoices/',
  documents: 'documents/',
  avatars: 'avatars/',
};

function resolvePathPrefix(category = 'jobs'): string {
  const normalized = category.toLowerCase().trim();
  if (BUCKET_PREFIX_MAP[normalized]) {
    return BUCKET_PREFIX_MAP[normalized];
  }
  if (normalized.includes('invoice') || normalized.includes('receipt')) return 'invoices/';
  if (normalized.includes('avatar') || normalized.includes('profile')) return 'avatars/';
  if (normalized.includes('doc') || normalized.includes('cert') || normalized.includes('report')) return 'documents/';
  return 'jobs/';
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly localUploadDir = path.join(process.cwd(), 'uploads');
  private isAppwriteAvailable = false;

  private endpoint = process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
  private apiKey = process.env.APPWRITE_API_KEY || '';
  private projectId = process.env.APPWRITE_PROJECT_ID || '6ab39ac100341b093fed';
  private bucketId = process.env.APPWRITE_BUCKET_ID || 'fixngo-vault';

  constructor(private prisma: PrismaService) {
    this.ensureLocalStorage();
    this.checkAppwriteConfig();
  }

  private ensureLocalStorage() {
    const folders = ['jobs', 'invoices', 'documents', 'avatars', 'job-photos', 'signatures', 'receipts'];
    for (const folder of folders) {
      const folderPath = path.join(this.localUploadDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    }
  }

  private checkAppwriteConfig() {
    this.endpoint = process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
    this.apiKey = process.env.APPWRITE_API_KEY || '';
    this.projectId = process.env.APPWRITE_PROJECT_ID || '6ab39ac100341b093fed';
    this.bucketId = process.env.APPWRITE_BUCKET_ID || 'fixngo-vault';

    if (this.endpoint && this.apiKey && this.projectId && this.apiKey.length > 10) {
      this.isAppwriteAvailable = true;
      this.logger.log(`Appwrite Storage active with bucket "${this.bucketId}". Target project: ${this.projectId}`);
    } else {
      this.logger.warn(`Appwrite API Key not set. Using local storage fallback at /uploads.`);
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    category = 'jobs',
    userId?: string,
  ): Promise<UploadResult> {
    // 1. Enforce 10 MB Maximum File Size
    if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
      throw new BadRequestException(
        `Security Violation: File size (${Math.round(buffer.length / 1024 / 1024)}MB) exceeds maximum allowed limit of 10 MB.`
      );
    }

    // 2. Binary Magic Bytes Verification (Rejects renamed .exe / malicious payloads)
    const magic = detectMagicBytes(buffer);
    if (!magic.isValid || magic.isMalicious) {
      this.logger.warn(`Security Violation: Upload blocked for file "${originalName}". Signature is invalid or executable binary detected.`);
      throw new BadRequestException(
        'Security Violation: Invalid file signature or forbidden executable file format. Renamed .exe or script files are strictly rejected.'
      );
    }

    // 3. Strip EXIF Metadata from Images (UAE PDPL GPS Privacy)
    const effectiveMime = magic.detectedMime || mimeType;
    const sanitizedBuffer = stripExifMetadata(buffer, effectiveMime);

    const prefix = resolvePathPrefix(category);
    const prefixedName = `${prefix}${originalName.replace(/^.*[\\\/]/, '')}`;

    // 1. Attempt Appwrite Cloud Upload if API key is configured (single bucket with path prefixes)
    if (this.isAppwriteAvailable) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(sanitizedBuffer)], { type: effectiveMime });
        formData.append('fileId', 'unique()');
        formData.append('file', blob, prefixedName);

        const targetBucket = this.bucketId;
        const res = await fetch(`${this.endpoint}/storage/buckets/${targetBucket}/files`, {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': this.projectId,
            'X-Appwrite-Key': this.apiKey,
          },
          body: formData,
        });

        if (res.ok) {
          const fileData: any = await res.json();
          const fileId = fileData.$id;
          const publicUrl = `${this.endpoint}/storage/buckets/${targetBucket}/files/${fileId}/view?project=${this.projectId}`;
          const previewUrl = `${this.endpoint}/storage/buckets/${targetBucket}/files/${fileId}/preview?project=${this.projectId}&width=400&height=400`;

          this.logger.log(`Uploaded file ${prefixedName} to Appwrite Cloud bucket "${targetBucket}" (${fileId})`);
          return {
            bucket: targetBucket,
            fileId,
            fileName: prefixedName,
            url: publicUrl,
            previewUrl,
            mimeType: effectiveMime,
            sizeBytes: sanitizedBuffer.length,
          };
        } else {
          const errText = await res.text();
          this.logger.warn(`Appwrite upload failed (HTTP ${res.status}): ${errText}. Using local fallback.`);
        }
      } catch (err: any) {
        this.logger.warn(`Appwrite upload error: ${err.message}. Using local filesystem fallback.`);
      }
    }

    // 2. Local Filesystem Fallback
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const ext = path.extname(originalName) || (effectiveMime.includes('jpeg') ? '.jpg' : '.png');
    const safeFilename = `${fileId}${ext}`;

    const cleanFolder = prefix.replace(/\/$/, '');
    const folderPath = path.join(this.localUploadDir, cleanFolder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, safeFilename);
    await fs.promises.writeFile(filePath, sanitizedBuffer);

    const apiBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    const publicUrl = `${apiBase}/uploads/${cleanFolder}/${safeFilename}`;
    const previewUrl = `${apiBase}/uploads/${cleanFolder}/${safeFilename}?preview=true&v=${Date.now()}`;

    return {
      bucket: this.bucketId,
      fileId,
      fileName: prefixedName,
      url: publicUrl,
      previewUrl,
      mimeType: effectiveMime,
      sizeBytes: sanitizedBuffer.length,
    };
  }

  async uploadBase64(
    base64Data: string,
    filename: string,
    category = 'jobs',
    userId?: string,
  ): Promise<UploadResult> {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let mimeType = 'image/png';

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    return this.uploadBuffer(buffer, filename, mimeType, category, userId);
  }
}
