# ADR 003: Appwrite Storage for Unstructured Files Only

## Status
Accepted

## Context
Field-service operations generate high volumes of unstructured files:
- Pre-work and post-work photos for quality control and dispute prevention
- Digital customer signatures on completion
- PDF Tax Invoices and Quotation documents
- Heavy equipment dispatch/return condition inspection photos
- Employee identity documents (Emirates ID, visa copies, trade licenses)

Storing raw image and PDF binaries directly in PostgreSQL as `bytea` causes database bloat, slows backups, and impacts memory caching.
Conversely, using an external BaaS like Appwrite for structured business entities (Work Orders, Customers, Invoices) would fragment data, eliminate foreign key constraints, and break relational integrity.

## Decision
1. **Separation of Concerns**:
   - **PostgreSQL 16** is the sole system of record for all business data, relationships, audit logs, and accounting.
   - **Appwrite Storage** is used exclusively as an object storage repository for binary assets (files, images, PDFs).
2. **Dedicated Appwrite Buckets**:
   - `job-photos`: Before/after work verification images
   - `signatures`: Customer sign-off digital canvas captures
   - `invoices`: Generated PDF tax invoices and receipts
   - `equipment-inspections`: Heavy plant pre-dispatch and return condition photos
   - `avatars`: User and employee profile avatars
3. **Database Representation**:
   - The PostgreSQL database stores the metadata: `file_id` (Appwrite file ID), `file_name`, `file_size_bytes`, `mime_type`, `bucket_id`, and `public_url`.
4. **Resilient Local Fallback**:
   - If Appwrite Cloud credentials are not configured or offline during a demo, a local static filesystem provider seamlessly stores files in `./uploads` and serves them via `/uploads` HTTP route without error.

## Consequences
- **Positive**: Clean database architecture with fast backups. Zero demo downtime in offline environments. Compliance with the client specification.
- **Negative**: Requires maintaining a storage abstraction layer in NestJS (`StorageService`).
