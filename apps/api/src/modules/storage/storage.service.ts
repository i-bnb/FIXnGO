import { Injectable, Logger } from '@nestjs/common';
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
    const prefix = resolvePathPrefix(category);
    const prefixedName = `${prefix}${originalName.replace(/^.*[\\\/]/, '')}`;

    // 1. Attempt Appwrite Cloud Upload if API key is configured (single bucket with path prefixes)
    if (this.isAppwriteAvailable) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
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
            mimeType,
            sizeBytes: buffer.length,
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
    const ext = path.extname(originalName) || (mimeType.includes('jpeg') ? '.jpg' : '.png');
    const safeFilename = `${fileId}${ext}`;

    const cleanFolder = prefix.replace(/\/$/, '');
    const folderPath = path.join(this.localUploadDir, cleanFolder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, safeFilename);
    await fs.promises.writeFile(filePath, buffer);

    const apiBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    const publicUrl = `${apiBase}/uploads/${cleanFolder}/${safeFilename}`;
    const previewUrl = `${apiBase}/uploads/${cleanFolder}/${safeFilename}?preview=true&v=${Date.now()}`;

    return {
      bucket: this.bucketId,
      fileId,
      fileName: prefixedName,
      url: publicUrl,
      previewUrl,
      mimeType,
      sizeBytes: buffer.length,
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
