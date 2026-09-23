# FIXnGO Production Deployment Guide

This guide details the complete deployment process for the **FIXnGO** monorepo using the enterprise multi-cloud free/serverless topology:

| Layer | Provider | Tier / Plan | Region | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | **Vercel** | Hobby / Pro | Global Edge | Next.js 14 App Router, Bilingual Arabic RTL, PWA |
| **Backend API** | **Render** | Free Web Service | Frankfurt (`frankfurt`) | NestJS 10, OpenAPI, SSE streaming, Socket.IO |
| **Relational DB** | **Neon** | Free Tier | EU Central (Frankfurt) | PostgreSQL 16 + PostGIS 3.4 (Pooled & Direct) |
| **Cache & Queue** | **Upstash** | Free Serverless | EU (Frankfurt) | Redis (TLS `rediss://`) + BullMQ background jobs |
| **File Storage** | **Appwrite Cloud** | Free Tier | Singapore (`sgp`) | Single Bucket (`fixngo-vault`) with path prefixes |
| **AI Assistant** | **Google Cloud** | Pay-as-you-go / Free | Global | Google Gen AI (`gemini-3.6-flash`) |

---

## 1. Neon Database Setup (PostgreSQL + PostGIS)

Neon provides serverless PostgreSQL with connection pooling via PgBouncer.

### 1.1 Create Database & Enable PostGIS
1. Sign up / log in to [Neon Console](https://console.neon.tech).
2. Create a new project:
   - **Name**: `fixngo-production`
   - **Region**: `AWS / eu-central-1 (Frankfurt)` (minimizes latency to Render Frankfurt).
   - **Postgres version**: `16`
3. Navigate to **SQL Editor** in Neon Console and ensure PostGIS is installed:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

### 1.2 Obtain Dual Connection Strings
Neon provides two distinct connection URLs:
1. **Pooled Connection URL (for Runtime)**:
   - Check the **Connection Pooling** checkbox in the Neon dashboard.
   - Format: `postgresql://[user]:[password]@[endpoint]-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require`
   - Assign to: `DATABASE_URL`
2. **Direct Connection URL (for Migrations)**:
   - Uncheck the **Connection Pooling** checkbox (port `5432`).
   - Format: `postgresql://[user]:[password]@[endpoint].eu-central-1.aws.neon.tech/neondb?sslmode=require`
   - Assign to: `DIRECT_URL`

---

## 2. Upstash Redis & BullMQ Setup

Upstash provides serverless Redis with per-request billing and a generous free tier.

### 2.1 Create Redis Instance
1. Log in to [Upstash Console](https://console.upstash.com).
2. Click **Create Database**:
   - **Name**: `fixngo-redis`
   - **Region**: `eu-central-1 (Frankfurt)`
   - **TLS (SSL)**: **Enabled** (Mandatory)
   - **Eviction**: None / Default
3. Under the **Details** tab, locate the **Node.js (ioredis)** connection URL:
   - It will start with the TLS scheme: `rediss://default:[password]@[endpoint].upstash.io:6379`
   - Assign to: `REDIS_URL`

### 2.2 BullMQ Optimizations for Upstash Free Tier
The API has been pre-configured specifically for Upstash limits:
- `maxRetriesPerRequest: null` (Prevents client crashes on queue initialization).
- `concurrency: 1` (Single worker processing).
- `drainDelay: 30` (Waits 30 seconds when queue is empty, avoiding continuous polling requests that deplete free tier limits).

---

## 3. Appwrite Cloud Storage Setup

Appwrite Cloud free tier allows **1 bucket per project**. The codebase uses a unified single-bucket architecture with categorized path prefixes.

### 3.1 Project & Bucket Creation
1. Log in to [Appwrite Cloud](https://cloud.appwrite.io).
2. Create or select an organization in the **Singapore (`sgp`)** region (best latency for UAE).
3. Create Project:
   - **Project Name**: `FIXnGO`
   - Note the **Project ID** (e.g. `6ab39ac100341b093fed`).
4. Navigate to **Storage** $\to$ **Create Bucket**:
   - **Bucket ID**: `fixngo-vault`
   - **Bucket Name**: `FIXnGO Enterprise Vault`
   - **Permissions**: Public (Read Any: `["*"]` or authenticated).
   - **Max File Size**: `50 MB`
   - **Allowed Extensions**: `jpg`, `jpeg`, `png`, `webp`, `pdf`, `mp4`.

### 3.2 Canonical Path Prefixes
All file uploads automatically route into sub-namespaces within `fixngo-vault`:
- `jobs/` — Before/after repair photos and customer touchscreen signatures.
- `invoices/` — Generated FTA UAE 5% VAT tax invoices and receipts.
- `documents/` — Supplier delivery notes, rate cards, and contracts.
- `avatars/` — Technician and staff profile photographs.

### 3.3 Create Server API Key
1. Go to **Project Settings** $\to$ **API Keys** $\to$ **Create API Key**.
2. **Name**: `Render Backend Server Key`.
3. **Scopes**: Check `files.read` and `files.write`.
4. Copy the secret key (starts with `standard_...`) and assign to `APPWRITE_API_KEY`.

---

## 4. Render Web Service Deployment (`apps/api`)

### Option A: 1-Click Blueprint Deploy (`render.yaml`)
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** $\to$ **Blueprint**.
2. Select your GitHub repository: `https://github.com/i-bnb/FIXnGO`.
3. Render reads [`render.yaml`](file:///f:/FIXnGO/render.yaml) automatically:
   - **Service Name**: `fixngo-api`
   - **Region**: `Frankfurt`
   - **Plan**: `Free`
   - **Build Command**: `corepack enable && pnpm install --frozen-lockfile && pnpm --filter api db:migrate && pnpm --filter api build`
   - **Start Command**: `pnpm --filter api start:prod`
   - **Health Check Path**: `/api/health`
4. Populate the required environment variables prompted by the blueprint:
   - `DATABASE_URL` (Neon pooled URL)
   - `DIRECT_URL` (Neon direct URL)
   - `REDIS_URL` (Upstash TLS URL)
   - `CORS_ORIGINS` (e.g. `https://fixngo.vercel.app`)
   - `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, `APPWRITE_BUCKET_ID`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `GEMINI_API_KEY`

### Option B: Manual Web Service Setup
If not using Blueprints:
1. Click **New +** $\to$ **Web Service**.
2. Connect repository.
3. Configure settings:
   - **Runtime**: `Node`
   - **Region**: `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Build Command**: `corepack enable && pnpm install --frozen-lockfile && pnpm --filter api db:migrate && pnpm --filter api build`
   - **Start Command**: `pnpm --filter api start:prod`
   - **Health Check Path**: `/api/health`
4. Add all environment variables from [`apps/api/.env.example`](file:///f:/FIXnGO/apps/api/.env.example).

> [!NOTE]
> **Render Free Tier Spin-Down**:
> Render's free instances spin down after 15 minutes of inactivity. When a request arrives, spinning up takes **30–50 seconds**. The frontend automatically handles this by displaying the friendly **"Waking up the server…"** banner with an active progress indicator and retry button.

---

## 5. Vercel Web Deployment (`apps/web`)

The repository includes a root `vercel.json` and an `apps/web/vercel.json` configured for zero-friction monorepo deployment.

### 5.1 Project Import & Zero-Config Setup
1. Go to [Vercel Dashboard](https://vercel.com) $\to$ **Add New Project**.
2. Select your repository: `https://github.com/i-bnb/FIXnGO`.
3. **Leave all defaults as-is**:
   - **Framework Preset**: `Next.js` (automatically detected).
   - **Root Directory**: `./` (leave default, handled by root `vercel.json`).
   - *Note: Even if you select `apps/web` as Root Directory, the included `apps/web/vercel.json` and package `prebuild` script automatically compile `@fieldops/shared` seamlessly.*

### 5.2 Environment Variables on Vercel
Add the following in **Settings** $\to$ **Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Your Render service URL (e.g. `https://fixngo-api.onrender.com` — **No trailing slash**).
- `NEXT_PUBLIC_SOCKET_URL`: Your Render service URL (e.g. `https://fixngo-api.onrender.com`).
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_test_...` (or placeholder for mock mode).

### 5.3 Deploy
Click **Deploy**. Vercel will:
1. Run `pnpm install` across workspace packages.
2. Build `@fieldops/shared` (TypeScript definitions and security matrix).
3. Build `@fieldops/web` (Next.js 14 App Router with 63 SSG pages).
4. Serve the application globally with optimized edge caching.

> [!IMPORTANT]
> **No Localhost Fallbacks**: In production builds, the frontend strictly forbids falling back to `localhost:4000`. You must specify `NEXT_PUBLIC_API_URL` in Vercel to connect to your live backend.

---

## 6. Remote Database Seeding

Once migrations are applied to Neon, seed the deterministic 6-month operational dataset (*FIXnGO Technical Services LLC*, TRN: `100482910300003`):

```bash
# Run against remote Neon database from your local terminal:
DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require" \
corepack pnpm --filter @fieldops/api db:seed
```

The seed script is **fully idempotent** and can be safely re-run at any time.

---

## 7. Verification & Smoke Test Checklist

| Step | Verification Command / URL | Expected Result |
| :--- | :--- | :--- |
| **API Health Probe** | `GET https://fixngo-api.onrender.com/api/health` | Returns `{"status":"ok","db":true,"redis":true}` |
| **Swagger OpenAPI** | `GET https://fixngo-api.onrender.com/api/docs` | Interactive Swagger documentation renders |
| **Cold Start UI** | Open web app while Render is sleeping | "Waking up the server…" banner appears with timer |
| **One-Click Logins** | Visit `/en/admin` and log in as `admin@fieldops.ae` | Dashboard loads with live KPI cards |
| **Ask FIXnGO Assistant**| Click "Ask FIXnGO" in header $\to$ "What needs attention today?" | SSE typewriter response streams with tool badges |
| **Vercel Previews** | Open a PR on GitHub | Preview URL automatically passes CORS checks |
