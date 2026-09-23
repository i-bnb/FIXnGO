# FIXnGO — All-in-One UAE Field-Service, Maintenance & Operations ERP

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20PostGIS%203.4-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10%20Modular%20Monolith-E0234E.svg?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14%20App%20Router-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.6%20Flash%20AI-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime%20Telematics-010101.svg?logo=socket.io&logoColor=white)](https://socket.io/)
[![UAE VAT](https://img.shields.io/badge/UAE%20VAT-5%25%20FTA%20TRN%20Compliant-007A3D.svg)](https://tax.gov.ae/)
[![Tests](https://img.shields.io/badge/Tests-33%2F33%20Passing-brightgreen.svg)]()

**FIXnGO** is an all-in-one, enterprise-grade field service management, maintenance, heavy equipment rental, and manpower supply ERP platform engineered specifically for the United Arab Emirates (Dubai, Sharjah, Abu Dhabi).

The platform unifies 4 major operational dimensions into a cohesive, bilingual (English & Arabic RTL) ecosystem:
1. **Consumer On-Demand Service App** (`/app`): 4-step diagnostic wizard, live Leaflet turn-by-turn map tracking, and instant Stripe payment.
2. **Technician Mobile PWA** (`/tech`): Real-time dispatch alerts, van stock deduction, before/after photo capture, and touchscreen customer signoff.
3. **Back-Office Executive ERP & Live Dispatch Board** (`/admin`): PostGIS KNN spatial technician matching, 16 business modules, double-entry General Ledger with UAE 5% VAT compliance, and real-time fleet telematics.
4. **"Ask FIXnGO" AI Operations Assistant**: Native Google Gemini Flash assistant with 13 read-only parameterized tools, strict RBAC isolation (Accountant vs. Dispatcher), SSE streaming, and audit logging.

---

## 🏛 Monorepo Architecture

Managed via `pnpm` workspaces:

```
FIXnGO/
├── apps/
│   ├── api/                     # NestJS 10 Modular Monolith + Socket.IO + Prisma ORM + BullMQ
│   │   ├── prisma/              # PostgreSQL + PostGIS schema & deterministic seed
│   │   └── src/
│   │       ├── common/          # PrismaService, VAT/Geospatial utilities, Guards, Decorators
│   │       └── modules/
│   │           ├── assistant/   # Phase 7B: Google Gemini AI Assistant, 13 Read-Only Tools, RBAC, SSE
│   │           ├── audit/       # Central Audit Logging Service (audit_logs table)
│   │           ├── auth/        # JWT Authentication Strategy & Role Management
│   │           ├── billing/     # UAE Tax Invoices (5% VAT), Stripe Payments & Mock Provider
│   │           ├── dispatch/    # PostGIS KNN Spatial Matcher & Haversine Distance Calculator
│   │           ├── equipment/   # Heavy Machinery Rental Contracts & Utilization
│   │           ├── finance/     # Double-Entry General Ledger, Chart of Accounts & P&L Rollup
│   │           ├── inventory/   # Multi-Warehouse & Mobile Van Stock Replenishment
│   │           ├── manpower/    # Construction Labour Supply Deployments & Timesheets
│   │           ├── reports/     # 7 SQL Views (Profitability, Tech Performance, A/R Aging, etc.)
│   │           ├── storage/     # Appwrite Cloud Media Vault Integration
│   │           └── work-orders/ # Work Order Lifecycle State Machine & Completion Gates
│   └── web/                     # Next.js 14 App Router + TailwindCSS + Leaflet + i18n
│       ├── src/
│       │   ├── app/[locale]/    # Localized Routes: en (English), ar (Arabic RTL), hi (Hindi)
│       │   │   ├── admin/       # 16 Desktop-First Executive ERP Screens
│       │   │   ├── app/         # Customer Mobile-First On-Demand Booking App
│       │   │   └── tech/        # Field Technician Mobile PWA
│       │   └── components/      # AskFixngoDrawer, NotificationBell, LeafletMap, DemoScenarios
├── packages/
│   └── shared/                  # Zod validation schemas, TypeScript interfaces, UAE VAT rules
├── docs/
│   ├── ARCHITECTURE.md          # C4 Architecture diagram, NestJS module map, sequence flows
│   ├── DATABASE.md              # Complete PostgreSQL / PostGIS data dictionary
│   ├── DECISIONS.md             # Architecture Decision Records (ADRs 001 - 008)
│   └── DEMO_SCRIPT.md           # 20-Minute client walkthrough script (15m Hero Story + 5m Tour)
├── docker-compose.yml           # Local PostGIS 16 + Redis 7 alpine services
└── .env.example                 # Environment configuration template
```

---

## 🤖 "Ask FIXnGO" AI Operations Assistant (Google Gemini Flash)

Built with the official Google Gen AI SDK (`@google/genai`) and `gemini-3.6-flash`, accessible via the **"Ask FIXnGO"** button in the Admin header.

### Key Capabilities:
- **13 Read-Only Parameterized Tools**:
  - `getKpiSummary(dateFrom?, dateTo?)` — Active jobs, completed jobs, gross revenue, SLA compliance rate.
  - `getJobsByStatus(status?, date?)` — Filter orders by status (`NEW`, `ASSIGNED`, `EN_ROUTE`, `COMPLETED`, etc.).
  - `getSlaBreaches()` — Identify emergency breaches like `WO-24825` (2h 10m overdue).
  - `getJobDetails(workOrderNo)` — Detailed record for specific order (e.g. `WO-24817`), customer, parts, and invoice.
  - `getJobProfitability(dateFrom?, dateTo?, onlyLossMaking?)` — Revenue, parts/labour costs, gross profit, and margin % (`WO-2025-0089`, `WO-2025-0142`, `WO-2025-0218`).
  - `getTechnicianStatus(name?)` — Live GPS position, status, van code, and active assignment.
  - `getTechnicianPerformance(dateFrom?, dateTo?)` — Jobs completed, hours worked, labour revenue billed, CSAT rating.
  - `getLowStockItems()` — Warehouse and van stock below safety threshold (R410A Cylinders, Capacitors).
  - `getEquipmentUtilization()` — Heavy machinery fleet rental utilization rates and revenue generated.
  - `getReceivablesAging()` — Customer A/R aging summary (Current, 1-30, 31-60, 61-90, 90+ days).
  - `getOverdueInvoices(minAmount?)` — Invoices past credit terms with customer contact and balance due (`INV-2026-0003`).
  - `getPnl(month?)` — Monthly statement of profit and loss (revenue, COGS, gross margin, OPEX, net profit).
  - `getCustomerHistory(customerName)` — Customer lifetime service history and spend (`Fatima Al Mansoori`, `Emaar`).
- **Strict Role-Based Access Control (RBAC)**:
  - Finance tools strictly require `finance.view` permission.
  - An **Accountant** can inspect financial figures, margins, and P&L.
  - A **Dispatcher** receives `"not permitted: user lacks required finance.view permission"`, and the assistant clearly explains the boundary.
- **Server-Sent Events (SSE) Streaming**:
  - `POST /api/assistant/chat` yields real-time token chunks for typewriter UI rendering.
  - Rate-limited to **30 queries per user per hour**.
  - All queries, tools executed, and responses are logged to `audit_logs`.
- **Demo Mode Fallback**:
  - If `GEMINI_API_KEY` is missing or offline, the assistant seamlessly returns canned answers for the 4 suggested questions in both English and Arabic.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0+ or v20+ / v22+
- **pnpm**: v9+ or v10+ (`corepack enable pnpm`)
- **Docker & Docker Compose**: For local PostgreSQL/PostGIS and Redis

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your Gemini API key (GEMINI_API_KEY) and Appwrite credentials
```

### 3. Launch with 3 Simple Commands
```bash
# 1. Start local PostgreSQL (PostGIS) and Redis
docker compose up -d

# 2. Populate deterministic UAE operational demo dataset
corepack pnpm seed

# 3. Start NestJS API (port 4000) and Next.js Web App (port 3000) concurrently
corepack pnpm dev
```

Visit **`http://localhost:3000/en`** to access the portal landing page and switcher.

---

## 👥 Seeded Demo Accounts (One-Click Logins)

The deterministic database seed script (`pnpm seed`) initializes a believable UAE operational dataset (*FIXnGO Technical Services LLC*, TRN: `100482910300003`):

| Role | Name & Title | Demo Email | Password | Primary Portal URL |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Sultan Al-Falasi (CEO) | `admin@fieldops.ae` | `DemoPassword123!` | [`/en/admin`](http://localhost:3000/en/admin) |
| **Operations Manager** | Tariq Mansoor | `ops@fieldops.ae` | `DemoPassword123!` | [`/en/admin/dispatch`](http://localhost:3000/en/admin/dispatch) |
| **Senior Accountant** | Fatima Al-Zahra | `finance@fieldops.ae` | `DemoPassword123!` | [`/en/admin/finance`](http://localhost:3000/en/admin/finance) |
| **Dispatcher** | Mariam Al-Kaabi | `dispatch@fieldops.ae` | `DemoPassword123!` | [`/en/admin/dispatch`](http://localhost:3000/en/admin/dispatch) |
| **Storekeeper** | Bilal Al-Masri | `inventory@fieldops.ae` | `DemoPassword123!` | [`/en/admin/inventory`](http://localhost:3000/en/admin/inventory) |
| **Lead HVAC Technician** | Rashid Khan (Van DXB-12) | `tech.rashid@fieldops.ae` | `DemoPassword123!` | [`/en/tech`](http://localhost:3000/en/tech) |
| **Senior Plumber** | Joseph Mathew (Van DXB-08) | `tech.mahmoud@fieldops.ae` | `DemoPassword123!` | [`/en/tech`](http://localhost:3000/en/tech) |
| **Customer (Homeowner)** | Fatima Al Mansoori | `client@dubaimall.ae` | `DemoPassword123!` | [`/en/app`](http://localhost:3000/en/app) |

*Tip: Use the persona switcher inside the top-header **Notification Bell** or inside **Ask FIXnGO** to switch roles on the fly.*

---

## ⚡ Admin "Demo Scenarios" Panel

Accessible from the top header button **`⚡ Demo Scenarios`** or via [`/en/admin/automation`](http://localhost:3000/en/admin/automation):

1. **🔄 Reset Demo Data**: Clears temporary test tickets and resets technician coordinates to initial depot baselines.
2. **📡 Start / Stop GPS Telematics Sim**: Toggles live movement of 5 service vans along realistic Dubai routes (Sheikh Zayed Rd, Business Bay, Al Khail Rd, Palm Jumeirah).
3. **🚨 Emergency Job**: Generates an instant high-priority `EMERGENCY` chiller breakdown ticket (`WO-2026-XXXX`) with audio-visual fleet alerts.
4. **⏰ Overdue Reminders**: Scans accounts receivable ledger for invoices past credit terms and dispatches WhatsApp/Email dunning notices.
5. **🚜 Fast-Forward Rental**: Advances active heavy equipment contract `RC-2026-0005` to off-hire date, generating return notifications and inspection tasks.

---

## 💳 Payment Gateway Test Credentials

- **Success Payment Card**: `4242 4242 4242 4242` (Any future expiration date, any 3-digit CVC).
- **Simulated Card Decline**: `4000 0000 0000 0002` (Triggers graceful decline error for demoing dispute/retry flows).
- **Offline Mock Provider**: Fallback simulation issuing valid receipt tokens and posting balanced double-entry journal entries.

---

## 🧪 Automated Testing & Verification

```bash
# Run all monorepo unit & integration tests
corepack pnpm test

# Run full monorepo build (shared + api + web)
corepack pnpm build
```

### Verified Test Suites:
- **Phase 7B AI Assistant Suite** (7 tests): Tool schema validation, loss-making jobs verification, RBAC security isolation (Accountant allowed, Dispatcher forbidden), hero record identification, and low stock alert thresholds.
- **Automation Scenarios & Payment Flows** (7 tests): Stripe test cards, card declines, partial payments, refund reversal double-entry balance, and 9 scenario definitions.
- **UAE VAT & Geospatial Utilities** (3 tests): 5% VAT precision without floating point drift, Haversine distance, and traffic-adjusted ETA.
- **Phase 2 API E2E Lifecycle** (9 tests): Full job lifecycle state machine, completion gates (AFTER photo + customer signature), stock deduction, equipment rental date overlap rejection, and nearest technician ranking.
- **Deterministic Seed & Financial Invariants** (6 tests): 400 work orders across 6 months, 3 intentional loss-making jobs, General Ledger double-entry balance, equipment utilization, and UAE bounding box coordinates.

**Total**: **33/33 tests passing (100%)** with **0 build errors** across 63 static Next.js pages.

---

## 📄 License & Attribution

Copyright © 2026 FIXnGO Technical Services LLC, Dubai, United Arab Emirates. All rights reserved. Built for enterprise commercial demonstration.
Repository: [https://github.com/i-bnb/FIXnGO](https://github.com/i-bnb/FIXnGO)
