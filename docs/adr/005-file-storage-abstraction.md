# ADR 005: File Storage Abstraction (Appwrite & Local Fallback)

## Status
Accepted

## Context
Technicians must upload before & after work photos, digital signature signatures, and customers/accountants need to access PDF invoices.
The primary requirement specifies Appwrite Storage buckets (`job-photos`, `signatures`, `invoices`, `avatars`), with PostgreSQL maintaining the system of record.
However, during offline demo runs or local setups without Appwrite Cloud keys, the application must not crash or fail photo uploads.

## Decision
1. Abstract file operations behind `StorageService` interface:
   - `uploadFile(file: Buffer, filename: string, bucket: string): Promise<string>`
   - `getFileUrl(bucket: string, fileId: string): string`
2. Provide two implementations:
   - `AppwriteStorageProvider`: uses official `node-appwrite` SDK when `APPWRITE_ENDPOINT` and `APPWRITE_API_KEY` are provided.
   - `LocalStorageProvider`: saves files to local static storage (`uploads/`) and serves them via `/uploads` HTTP route.
3. Database records store bucket, fileKey, publicUrl, fileSizeBytes, and mimeType.

## Consequences
- 100% compliance with Appwrite integration requirement while guaranteeing uninterrupted demo walkthroughs.
