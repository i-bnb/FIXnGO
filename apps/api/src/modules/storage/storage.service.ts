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
    const buckets = ['job-photos', 'signatures', 'invoices', 'avatars', 'documents', 'receipts'];
    for (const bucket of buckets) {
      const bucketPath = path.join(this.localUploadDir, bucket);
      if (!fs.existsSync(bucketPath)) {
        fs.mkdirSync(bucketPath, { recursive: true });
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
      this.logger.log(`Appwrite Storage active. Target project: ${this.projectId} (Region: sgp)`);
    } else {
      this.logger.warn(`Appwrite API Key not set. Project ID: ${this.projectId}. Using local storage fallback at /uploads.`);
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    bucket = 'job-photos',
    userId?: string,
  ): Promise<UploadResult> {
    // 1. Attempt Appwrite Cloud Upload if API key is configured
    if (this.isAppwriteAvailable) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
        formData.append('fileId', 'unique()');
        formData.append('file', blob, originalName);

        const targetBucket = this.bucketId || bucket;
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

          this.logger.log(`Uploaded file ${originalName} to Appwrite Cloud (${fileId})`);
          return {
            bucket: targetBucket,
            fileId,
            fileName: originalName,
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

    const bucketPath = path.join(this.localUploadDir, bucket);
    if (!fs.existsSync(bucketPath)) {
      fs.mkdirSync(bucketPath, { recursive: true });
    }

    const filePath = path.join(bucketPath, safeFilename);
    await fs.promises.writeFile(filePath, buffer);

    const apiBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    const publicUrl = `${apiBase}/uploads/${bucket}/${safeFilename}`;
    const previewUrl = `${apiBase}/uploads/${bucket}/${safeFilename}?preview=true&v=${Date.now()}`;

    return {
      bucket,
      fileId,
      fileName: originalName,
      url: publicUrl,
      previewUrl,
      mimeType,
      sizeBytes: buffer.length,
    };
  }

  async uploadBase64(
    base64Data: string,
    filename: string,
    bucket = 'job-photos',
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

    return this.uploadBuffer(buffer, filename, mimeType, bucket, userId);
  }
}
