# FIXnGO — Enterprise Field Service, Manpower Supply & Heavy Plant Rental ERP

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/i-bnb/FIXnGO)
[![Tests](https://img.shields.io/badge/tests-68%2F68%20passing-success.svg)](https://github.com/i-bnb/FIXnGO)
[![Next.js](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black.svg)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red.svg)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.11-blue.svg)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS%20Spatial-336791.svg)](https://postgis.net)
[![UAE FTA VAT](https://img.shields.io/badge/UAE%20FTA-5%25%20VAT%20Compliant-gold.svg)](https://tax.gov.ae)
[![UAE PDPL](https://img.shields.io/badge/UAE%20PDPL-PII%20Hardened-blueviolet.svg)](https://ai.gov.ae)

---

## 📌 Executive Overview

**FIXnGO** is a modern, enterprise-grade Field Operations, Manpower Supply, and Heavy Plant Rental ERP engineered specifically for UAE MEP contractors, technical service providers, facilities management companies, and labor agencies. 

Designed for high-concurrency dispatch, real-time spatial telematics, strict regulatory compliance, and mission-critical field workflows, FIXnGO unifies:
1. **On-Demand & Emergency Field Maintenance** (AC, Electrical, Plumbing, Handyman).
2. **Construction Site Labor Supply & Manpower Requisitions** with daily digital timesheets.
3. **Heavy Plant & Equipment Rental Fleet** with inspection logs and deposit accounting.
4. **Mobile Van Depots & Multi-Warehouse Inventory** with auto-replenishment.
5. **UAE Federal Tax Authority (FTA) 5% VAT Tax Invoicing** with QR code generation.
6. **Automated Double-Entry General Ledger** for accounts receivable, payable, and payroll.

---

## 🏗️ Architecture & Technology Stack

The platform is structured as an enterprise **pnpm Monorepo** ensuring strict separation of concerns, end-to-end type safety, and zero drift across client and server boundaries:

```
FIXnGO/
├── apps/
│   ├── web/                     # Next.js 14 App Router, React 18, Tailwind CSS, Leaflet OpenStreetMap
│   │   ├── src/app/[locale]/    # Bilingual Routing (en, ar RTL)
│   │   │   ├── admin/           # Enterprise Operations ERP & Command Center
│   │   │   │   ├── customers/[id] # Customer 360 Deep-Link Dossiers
│   │   │   │   ├── work-orders/[id] # Work Order Telematics & Execution Inspector
│   │   │   │   └── invoices/[id]    # Official FTA Bilingual Tax Invoice Inspector
│   │   │   ├── tech/            # Field Technician Mobile PWA (Offline-ready, van stock)
│   │   │   ├── app/             # Customer Self-Service Booking & Live Tracking
│   │   │   └── auth/signin/     # Secure Session Sign-In & Role Gate
│   │   └── src/middleware.ts    # Edge RBAC Session & Cookie Guard
│   │
│   └── api/                     # NestJS 10 REST API & Realtime Backend
│       ├── prisma/              # Relational & PostGIS Spatial Schema + Seed
│       └── src/modules/         # Domain-Driven Modules (Dispatch, Billing, Manpower, etc.)
│
├── packages/
│   └── shared/                  # Shared TypeScript Contracts, Zod Schemas, UAE Constants, Demo Data
│
└── docs/                        # Complete System Architecture, Security, ADRs, & Deployment Guides
```

### Technology Highlights
- **Frontend (`@fieldops/web`)**: Next.js 14 App Router, React 18, Tailwind CSS, Lucide Icons, Leaflet / OpenStreetMap, Canvas Confetti.
- **Backend (`@fieldops/api`)**: NestJS 10, TypeScript 5, Prisma ORM 5, PostGIS native SQL queries (`ST_DistanceSphere`, `ST_DWithin`), Swagger/OpenAPI.
- **Shared Contracts (`@fieldops/shared`)**: Single source of truth for Zod validation schemas, UAE constants, telephone patterns, and canonical demo records.
- **Database & Storage**: PostgreSQL 16 with PostGIS extensions (Neon Serverless), Appwrite Cloud Storage with local memory failover provider.
- **Internationalization**: `next-intl` with full LTR (English) and native RTL (Arabic - العربية) support.

---

## 🌐 Three Dedicated User Experiences

### 1. 🏢 Admin Operations & Executive Command (`/[locale]/admin`)
- **Realtime UAE Fleet Map**: Live telematics displaying technician vans across Dubai (Downtown, Business Bay, Al Quoz, JLT), Sharjah, and Abu Dhabi.
- **PostGIS Distance Proximity Dispatch**: Automated nearest-engineer recommendation and 1-click dispatch based on true driving coordinates.
- **Interactive Deep-Link Inspectors**:
  - `/[locale]/admin/work-orders/[id]`: Full work order life-cycle, technician timeline, parts consumed, and customer signature.
  - `/[locale]/admin/invoices/[id]`: Printable, FTA-compliant bilingual tax invoice with TRN and 5% VAT itemization.
  - `/[locale]/admin/customers/[id]`: 360° customer dossier including active properties, contract SLAs, and billing history.
- **Specialized Modules**:
  - **Manpower Supply**: Track 30+ deployed tradesmen across construction sites, approve daily timesheets, and generate consolidated monthly contractor invoices.
  - **Equipment Rental**: Fleet tracking for diesel generators, scaffolding towers, and scissor lifts with pre/post inspection logs.
  - **Warehouse & Inventory**: Multi-depot stock control, automatic reordering when safety stock levels are breached, and van transfers.
  - **Finance & General Ledger**: Live P&L, balance sheet, trial balance, and receivables aging.

### 2. 📱 Technician Field Mobile PWA (`/[locale]/tech`)
- **Engineered for Mobile Touch**: Large, thumb-friendly tap buttons for field engineers on the go.
- **Job Life-Cycle Control**: Real-time status transitions (*Accept $\to$ En Route $\to$ Arrived $\to$ In Progress $\to$ Complete*).
- **Safety Risk Checklist**: Mandatory pre-work hazards and pressure checks before execution.
- **Van Stock Deduction**: Select spare parts used on-site with automatic van inventory decrement.
- **Digital Sign-Off**: Capture customer signature and photographic proof of completion.

### 3. 🏠 Customer On-Demand App (`/[locale]/app`)
- **Instant Booking**: Choose from AC Diagnosis, Plumbing Leak Repairs, Electrical Tripping, and Handyman services.
- **Emergency Dispatch Toggle**: Expedited 15-30 minute emergency callout SLA.
- **Live Van Tracking**: Interactive map tracking the technician van in real time with dynamic ETA countdown.
- **Dual-Mode Checkout**: 1-click resilient test card / offline mock checkout or live Stripe mode with celebration feedback.

---

## 🔒 Security Hardening & UAE Compliance

The codebase has undergone a pre-production security audit and hardening pass:

### 1. Strict Role-Based Access Control (RBAC) & Middleware Guard
- Edge middleware enforces cryptographic cookie validation (`session_token`) across all `/[locale]/admin`, `/[locale]/tech`, and `/[locale]/app` routes.
- Unauthorized or unauthenticated requests are safely redirected to `/[locale]/auth/signin` with preserved `returnUrl`.
- Role matrix guarantees Super Admins, Dispatchers, Technicians, and Clients access only authorized resources.

### 2. UAE Personal Data Protection Law (PDPL) Hardening
- Sensitive PII (Emirates ID) is strictly masked on public endpoints (`784-****-*****-*`).
- Client contact phone numbers are sanitized and formatted to UAE standards (`+971 50 000 01xx`).
- Payment credentials are never stored in plain text; transactions use tokenized mock or Stripe PaymentIntents.

### 3. UAE Federal Tax Authority (FTA) 5% VAT Compliance
- Certified FTA-compliant invoice numbering (`INV-2026-00001` through `INV-2026-00400`).
- Registered company entity: **FIXnGO Technical Services LLC — demo** (TRN: `100000000000003 (demo)`).
- Cent-accurate decimal arithmetic preventing JavaScript floating-point rounding discrepancies.
- Bilingual English and Arabic invoice layouts featuring FTA QR code payloads.

### 4. Search Engine Indexing & Bot Protection
- Production `robots.txt` disallowing web crawlers from indexing administrative, dispatch, telematics, and technician portals.

---

## 🧪 Comprehensive Test Suite (68/68 Tests Passing)

The project enforces automated test coverage across shared validation rules and backend business logic:

```bash
# Run shared contract & schema tests (26 passed)
corepack pnpm --filter @fieldops/shared test

# Run backend unit, integration, & seed tests (42 passed)
corepack pnpm --filter @fieldops/api test

# Total Test Coverage: 68/68 Passing (100% Green)
```

Test suites verify:
- UAE phone number normalization and Emirates ID validation.
- FTA 5% VAT calculation formulas and line-item aggregations.
- Double-entry ledger balanced debit/credit invariants.
- Canonical demo seed deterministic data consistency across all 60 customers, 400 work orders, and 200 items.

---

## 🔑 Demo Personas & Credentials

For sales demonstrations, executive walkthroughs, and security reviews:

| Persona | Role | Email | Password | Primary Portal |
|---|---|---|---|---|
| **Sultan Al-Mansoor** | Super Admin | `admin@fieldops.ae` | `DemoPassword123!` | `http://localhost:3000/en/admin` |
| **Sarah Jenkins** | Dispatcher | `dispatch@fieldops.ae` | `DemoPassword123!` | `http://localhost:3000/en/admin/dispatch` |
| **Rashid Al-Nuaimi** | Senior HVAC Tech | `tech.rashid@fieldops.ae` | `DemoPassword123!` | `http://localhost:3000/en/tech` |
| **Fatima Al-Zahra** | Chief Accountant | `finance@fieldops.ae` | `DemoPassword123!` | `http://localhost:3000/en/admin/billing` |
| **Zaid Al-Harbi** | Residential Client | `customer@fieldops.ae` | `DemoPassword123!` | `http://localhost:3000/en/app` |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` (or use `corepack enable pnpm`)
- **PostgreSQL**: `16+` with `postgis` extension enabled (or a free Neon Serverless instance)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/i-bnb/FIXnGO.git
cd FIXnGO
corepack pnpm install
```

### 2. Configure Environment Variables
Copy the example environment templates:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string with PostGIS enabled (e.g. `postgresql://user:pass@ep-xyz.neon.tech/fixngo?sslmode=require`).
- `PORT`: API server port (default: `4000`).
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:4000`).
- `APPWRITE_ENDPOINT` & `APPWRITE_PROJECT_ID` (optional, defaults to local memory storage provider).

### 3. Run Database Migrations & Deterministic Seed
```bash
# Push Prisma schema to your PostgreSQL database
corepack pnpm --filter @fieldops/api db:migrate

# Seed 6 months of deterministic operational data (60 customers, 400 work orders, 200 items)
corepack pnpm --filter @fieldops/api db:seed
```

### 4. Start Development Servers
```bash
# Run both Web (port 3000) and API (port 4000) concurrently
corepack pnpm dev
```

Open your browser:
- **Admin ERP**: [http://localhost:3000/en/admin](http://localhost:3000/en/admin)
- **Technician Field PWA**: [http://localhost:3000/en/tech](http://localhost:3000/en/tech)
- **Customer Booking App**: [http://localhost:3000/en/app](http://localhost:3000/en/app)
- **API Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## ☁️ Multi-Cloud Deployment Guide

The platform is optimized for seamless deployment on serverless infrastructure:

| Component | Target Platform | Environment Notes |
|---|---|---|
| **Web Frontend (`@fieldops/web`)** | [Vercel](https://vercel.com) | Framework preset: Next.js. Set Root Directory to `apps/web`. Configure `NEXT_PUBLIC_API_URL`. |
| **Backend API (`@fieldops/api`)** | [Render](https://render.com) | Web Service (Node.js). Build command: `corepack pnpm --filter @fieldops/api build`. Start command: `node dist/main.js`. |
| **Database** | [Neon](https://neon.tech) | Serverless PostgreSQL 16 with native `CREATE EXTENSION postgis;` support. |
| **Object Storage** | [Appwrite Cloud](https://cloud.appwrite.io) | Buckets for job photos, customer signatures, and equipment inspection logs. |

For detailed step-by-step production configuration instructions, see [docs/DEPLOY.md](docs/DEPLOY.md).

---

## 📚 Technical Documentation Index

For in-depth architectural and operational guides:
- [Architecture & Sequence Diagrams](docs/ARCHITECTURE.md)
- [Database Schema & Data Dictionary](docs/DATABASE.md)
- [15-Minute Clickable Sales Demo Script](docs/DEMO_GUIDE.md)
- [Architecture Decision Records (ADRs)](docs/adr/)
- [Security Rulebook & Threat Model](docs/SECURITY.md)
- [Production Deployment Guide](docs/DEPLOY.md)

---

## 📄 License & Attribution

Proprietary enterprise software developed for **FIXnGO Technical Services LLC — demo**. All rights reserved. Built with modern TypeScript and open web standards.
