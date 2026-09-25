# FIXnGO — Enterprise Field Service, Manpower Supply & Heavy Plant Rental ERP

[![Next.js](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black.svg)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10.4-red.svg)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-blue.svg)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS%20Spatial-336791.svg)](https://postgis.net)
[![Neon](https://img.shields.io/badge/Database-Neon%20Serverless-00E599.svg)](https://neon.tech)
[![AI Assistant](https://img.shields.io/badge/AI%20Assistant-Gemini%203.6%20Flash-blue.svg)](https://deepmind.google/technologies/gemini/)

---

##  Executive Overview

**FIXnGO** is a modern, enterprise-grade Field Operations, Manpower Supply, and Heavy Plant Rental ERP engineered specifically for UAE MEP contractors, technical service providers, facilities management companies, and labor agencies. 

Designed for high-concurrency dispatch, real-time spatial telematics, UAE regulatory standards, and mission-critical field workflows, FIXnGO unifies:
1. **On-Demand & Emergency Field Maintenance** (AC, Electrical, Plumbing, Handyman).
2. **Construction Site Labor Supply & Manpower Requisitions** with daily digital timesheets.
3. **Heavy Plant & Equipment Rental Fleet** with inspection logs and deposit accounting.
4. **Mobile Van Depots & Multi-Warehouse Inventory** with auto-replenishment.
5. **UAE Federal Tax Authority (FTA) 5% VAT Tax Invoicing** with QR code generation.
6. **Automated Double-Entry General Ledger** for accounts receivable, payable, and payroll.

---

##  Architecture & Technology Stack

The platform is structured as an enterprise **pnpm Monorepo** ensuring strict separation of concerns, end-to-end type safety, and zero drift across client and server boundaries:

```
FIXnGO/
├── apps/
│   ├── web/                     # Next.js 14 App Router, React 18, Tailwind CSS, Leaflet OpenStreetMap
│   │   ├── src/app/[locale]/    # Bilingual Routing (en, ar RTL)
│   │   │   ├── admin/           # Enterprise Operations ERP & Command Center
│   │   │   │   ├── customers/[id] # Customer 360 Deep-Link Dossiers
│   │   │   │   ├── work-orders/[id] # Work Order Telematics & Execution Inspector
│   │   │   │   └── invoices/[id]    # Bilingual Tax Invoice Inspector
│   │   │   ├── tech/            # Field Technician Mobile PWA (Van stock, digital signature)
│   │   │   ├── app/             # Customer Self-Service Booking & Live Tracking
│   │   │   │   ├── bookings/    # Customer Bookings List & Order History
│   │   │   │   ├── shop/        # Parts & Consumables Catalog (Add to Quote)
│   │   │   │   └── account/     # Customer Profile & Dubai Saved Addresses
│   │   │   └── auth/signin/     # Secure Session Sign-In & Role Gate
│   │   └── src/middleware.ts    # Edge RBAC Session & Cookie Guard
│   │
│   └── api/                     # NestJS 10 REST API & Realtime Backend
│       ├── prisma/              # Relational & PostGIS Spatial Schema + Seed
│       └── src/modules/         # Domain-Driven Modules (Dispatch, Billing, Manpower, Assistant, etc.)
│
├── packages/
│   └── shared/                  # Shared TypeScript Contracts, Zod Schemas, UAE Constants, Demo Data
│
└── docs/                        # Complete System Architecture, Security, ADRs, & Deployment Guides
```

### Technology Highlights
- **Frontend (`@fieldops/web`)**: Next.js 14 App Router, React 18, Tailwind CSS, Lucide Icons, Leaflet / OpenStreetMap, Canvas Confetti.
- **Backend (`@fieldops/api`)**: NestJS 10, TypeScript 5, Prisma ORM 6, PostGIS native SQL queries (`ST_DistanceSphere`, `ST_DWithin`), Swagger/OpenAPI.
- **Shared Contracts (`@fieldops/shared`)**: Single source of truth for Zod validation schemas, UAE constants, telephone patterns, and canonical demo records.
- **Database & Storage**: PostgreSQL 16 with PostGIS extensions (Neon Serverless), Appwrite Cloud Storage with unified vault bucket.
- **Internationalization**: `next-intl` with full LTR (English) and native RTL (Arabic - العربية) support.

---

##  Three Dedicated User Experiences

### 1. 🏢 Admin Operations & Executive Command (`/[locale]/admin`)
- **Realtime UAE Fleet Map**: Live telematics displaying technician vans across Dubai (Downtown, Business Bay, Al Quoz, JLT), Sharjah, and Abu Dhabi.
- **PostGIS Spatial Dispatch**: Automated nearest-engineer recommendation and 1-click dispatch based on spatial coordinates.
- **Interactive Deep-Link Inspectors**:
  - `/[locale]/admin/work-orders/[id]`: Full work order life-cycle, technician timeline, parts consumed, and customer signature.
  - `/[locale]/admin/invoices/[id]`: Printable, bilingual tax invoice with TRN and 5% VAT itemization.
  - `/[locale]/admin/customers/[id]`: 360° customer dossier including active properties, contract SLAs, and billing history.
- **Specialized Modules**:
  - **Manpower Supply**: Track 30+ deployed tradesmen across construction sites, approve daily timesheets, and generate consolidated monthly contractor invoices.
  - **Equipment Rental**: Fleet tracking for diesel generators, scaffolding towers, and scissor lifts with pre/post inspection logs.
  - **Warehouse & Inventory**: Multi-depot stock control, automatic reordering when safety stock levels are breached, and van transfers.
  - **Finance & General Ledger**: Live P&L, balance sheet, trial balance, and receivables aging.

### 2.  Technician Field Mobile PWA (`/[locale]/tech`)
- **Engineered for Mobile Touch**: Large, thumb-friendly tap buttons for field engineers on the go.
- **Job Life-Cycle Control**: Real-time status transitions (*Accept $\to$ En Route $\to$ Arrived $\to$ In Progress $\to$ Complete*).
- **Safety Risk Checklist**: Interactive pre-work hazards and pressure checks before execution.
- **Asset Inspector**: "View Asset" modal displaying equipment model, serial numbers, install dates, and maintenance logs.
- **Team & Helpers**: Assigned assistant technician contacts with direct calling integration.
- **SLA Countdown**: Visual timer indicating remaining SLA response window.
- **Van Stock Deduction**: Select spare parts used on-site with automatic van inventory decrement.
- **Digital Sign-Off**: Capture customer signature and photographic proof of completion.

### 3.  Customer On-Demand App (`/[locale]/app`)
- **Instant Booking**: Choose from AC Diagnosis, Plumbing Leak Repairs, Electrical Tripping, and Handyman services.
- **Dedicated Sub-Routes**:
  - `/[locale]/app/bookings`: Active & past bookings with status pills (Scheduled, In Progress, Completed).
  - `/[locale]/app/shop`: Parts & consumables catalog (AC filters, water pumps, circuit breakers) with "Add to Quote" workflow.
  - `/[locale]/app/account`: User profile, saved Dubai locations, language toggle, and global sign-out.
- **Emergency Dispatch Toggle**: Expedited 15-30 minute emergency callout SLA.
- **Live Van Tracking**: Interactive map tracking the technician van in real time with dynamic ETA countdown.

---

##  Google Gemini Operations Assistant ("Ask FIXnGO")

FIXnGO features an intelligent operational copilot accessible directly from the Admin ERP:
- **Model**: Powered by Google Gemini 3.6 Flash (`gemini-3.6-flash`).
- **Operational Intelligence**: Live evaluation of SLA breaches, job profitability diagnostics, accounts receivable aging, and fleet telematics.
- **Bilingual Dialogue**: Conversational in both Arabic (العربية) and English with automatic language detection.
- **Prompt Injection Defense & RBAC**: Sanitizes untrusted user inputs, enforces role-based data isolation, and formats record identifiers (`WO-2026-xxxxx`, `INV-2026-xxxxx`, `TECH-xxx-xx`) as navigable links.

---

##  Security Architecture & UAE Regulatory Alignment

The codebase is designed to adhere to enterprise security and Middle East operational requirements:

### 1. Strict Role-Based Access Control (RBAC) & Middleware Guard
- Edge middleware enforces cryptographic cookie validation (`fixngo_session`) across all `/[locale]/admin`, `/[locale]/tech`, and `/[locale]/app` routes.
- Unauthorized or unauthenticated requests are safely redirected to `/[locale]/auth/signin?returnUrl=...`.
- Role isolation guarantees that Customers access only `/app`, Technicians access only `/tech`, and Administrators access only `/admin`.
- In-portal cross-role switchers are removed; persona switching is restricted to admin sub-roles inside the admin portal.

### 2. Designed for UAE Personal Data Protection Law (PDPL) Alignment
- Sensitive PII (Emirates ID) is masked on public endpoints (`784-****-*****-*`).
- Client contact phone numbers are sanitized and formatted to standard UAE notation (`+971 50 000 01xx`).
- Payment credentials are never stored in plain text; transactions use tokenized mock or Stripe PaymentIntents.

### 3. Designed for UAE Federal Tax Authority (FTA) 5% VAT Requirements
- Standardized FTA-formatted invoice numbering (`INV-2026-00001` through `INV-2026-00400`).
- Registered demo entity: **FIXnGO Technical Services LLC — demo** (TRN: `100000000000003 (demo)`).
- Cent-accurate decimal arithmetic preventing floating-point rounding discrepancies.
- Bilingual English and Arabic invoice layouts featuring FTA QR code payloads.

### 4. Search Engine Indexing & Bot Protection
- Production `robots.txt` disallows all web crawlers (`User-agent: * Disallow: /`).
- `X-Robots-Tag: noindex, nofollow, noarchive` security header applied across all portal routes.

---

##  Demo Personas

For sales demonstrations, executive walkthroughs, and evaluation:

| Persona | Role | Email | Primary Portal |
|---|---|---|---|
| **Sultan Al-Falasi** | Super Admin | `admin@fixngo.example` | [Admin Operations](/en/admin) |
| **Mariam Al-Husseini** | Senior Accountant | `finance@fixngo.example` | [Finance & Ledger](/en/admin/finance) |
| **Sara Al-Hashimi** | Operations Dispatcher | `dispatch@fixngo.example` | [Live Dispatch](/en/admin/dispatch) |
| **Tariq Al-Mansoor** | Lead Field Specialist | `tech.tariq@fixngo.example` | [Technician PWA](/en/tech) |
| **Khalid Al-Mansoor** | Residential Client | `customer@fixngo.example` | [Customer Portal](/en/app) |

> [!NOTE]
> Passwords are not exposed in plaintext. For demonstration convenience, authentication is conducted via the 1-click persona gateway at `/[locale]/auth/signin`.

---

##  Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or higher (or `corepack enable pnpm`)
- **PostgreSQL**: `16+` with `postgis` extension enabled (or Neon Serverless instance)

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
- `DATABASE_URL`: PostgreSQL connection string with PostGIS enabled (e.g. Neon Serverless).
- `DIRECT_URL`: Direct database connection for Prisma migrations.
- `GEMINI_API_KEY`: Google GenAI API key for the "Ask FIXnGO" assistant.
- `APPWRITE_ENDPOINT` & `APPWRITE_PROJECT_ID`: Appwrite Cloud storage vault credentials.

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

##  Production Deployment Matrix

| Component | Target Platform | Live Deployment URL / Environment Notes |
|---|---|---|
| **Web Frontend (`@fieldops/web`)** | [Render](https://render.com) | Live at `https://fixngo-tdju.onrender.com`. Built with Next.js 14 App Router. |
| **Backend API (`@fieldops/api`)** | [Render](https://render.com) | REST API & WebSocket Telematics (`render.yaml`). |
| **Database** | [Neon](https://neon.tech) | Serverless PostgreSQL with native PostGIS spatial extensions. Project ID: `crimson-rice-27516269`. |
| **Object Storage** | [Appwrite Cloud](https://cloud.appwrite.io) | Single storage vault (`fixngo-vault`) for job photos and digital signatures. |

For detailed step-by-step production configuration instructions, see [docs/DEPLOY.md](docs/DEPLOY.md).

---

##  Technical Documentation Index

For in-depth architectural and operational guides:
- [Architecture & Sequence Diagrams](docs/ARCHITECTURE.md)
- [Database Schema & Data Dictionary](docs/DATABASE.md)
- [15-Minute Clickable Sales Demo Script](docs/DEMO_GUIDE.md)
- [Architecture Decision Records (ADRs)](docs/adr/)
- [Security Rulebook & Threat Model](docs/SECURITY.md)
- [Production Deployment Guide](docs/DEPLOY.md)

---

##  License & Attribution

Proprietary enterprise software developed for **FIXnGO Technical Services LLC — demo**. All rights reserved. Built with modern TypeScript and open web standards.
