# FieldOps ERP - System Architecture

FieldOps ERP is an enterprise-grade field-service, maintenance, construction site manpower supply, and equipment rental ERP platform tailored for UAE MEP contractors and service companies.

---

## 1. System Context Diagram

The following Mermaid diagram illustrates the system context, actors, client portals, external cloud services, and the core backend modular monolith:

```mermaid
flowchart TB
    subgraph Users ["Client & User Personas"]
        CustomerUser["👤 Residential & Commercial Client"]
        TechUser["👷 Field Technician / Lead"]
        AdminUser["👔 Admin / Dispatcher / Accountant / Storekeeper"]
    end

    subgraph Frontend ["Unified Next.js 14 Frontend (App Router + next-intl)"]
        CustomerPortal["📱 Customer Portal (/app)\nOn-Demand Booking & Live Map Tracking"]
        TechPWA["📱 Technician PWA (/tech)\nTouch Tasks, Checklists, Signatures"]
        AdminERP["🖥️ Admin Portal (/admin)\nDispatch, Inventory, Manpower, Billing"]
    end

    subgraph Backend ["NestJS Modular Monolith API (/api)"]
        APIGateway["REST API & OpenAPI Swagger (/api/docs)"]
        RealtimeWS["Socket.IO Realtime Gateway (/socket.io)"]
        QueueWorker["BullMQ Job & Reminder Processor"]
        DomainServices["24 Domain Service Modules"]
    end

    subgraph DataStorage ["Data & Infrastructure Layer"]
        PostgresDB[("🐘 PostgreSQL 16 + PostGIS 3.4\nSystem of Record & Spatial GIST")]
        RedisCache[("⚡ Redis 7\nBullMQ Queues & Pub/Sub")]
    end

    subgraph ExternalServices ["External & Cloud Providers"]
        AppwriteCloud["☁️ Appwrite Storage\nBuckets: Photos, Invoices, Signatures"]
        StripeGateway["💳 Stripe Payment Gateway\nTest Mode (Payment Intents) / Mock Fallback"]
        OSMTiles["🗺️ OpenStreetMap / Leaflet\nFree Open Tile Server"]
    end

    CustomerUser -->|HTTPS| CustomerPortal
    TechUser -->|HTTPS / PWA| TechPWA
    AdminUser -->|HTTPS| AdminERP

    CustomerPortal -->|REST & WebSockets| APIGateway
    CustomerPortal -->|Live Location Stream| RealtimeWS
    TechPWA -->|REST & GPS Telematics| APIGateway
    TechPWA -->|Location Broadcast| RealtimeWS
    AdminERP -->|REST & Realtime Dispatch| APIGateway
    AdminERP -->|Fleet Stream| RealtimeWS

    CustomerPortal -.->|Map Tiles| OSMTiles
    AdminERP -.->|Map Tiles| OSMTiles

    APIGateway --> DomainServices
    RealtimeWS --> DomainServices
    QueueWorker --> DomainServices

    DomainServices -->|Prisma ORM & PostGIS SQL| PostgresDB
    DomainServices -->|Job Queue & Caching| RedisCache
    DomainServices -->|Upload / Download Blobs| AppwriteCloud
    DomainServices -->|Payment Intents| StripeGateway
```

---

## 2. NestJS Module Map (24 Domain Modules)

FieldOps ERP enforces strict modular boundaries within a modular monolith. Each domain module encapsulates its own controllers, services, repositories, and business logic:

| # | NestJS Module | Responsibility | Key Entities & Relations |
|---|---|---|---|
| **1** | `AuthModule` | JWT auth, refresh token rotation, bcrypt password hashing, and RBAC guards. | `User`, `Role`, `Permission`, `RefreshToken` |
| **2** | `UsersModule` | Internal staff user accounts, role assignment, and profile management. | `User`, `UserRole`, `Role` |
| **3** | `CustomersModule` | CRM for residential owners, B2B property managers, and contractor clients (TRN). | `Customer`, `CustomerContact`, `CustomerAsset` |
| **4** | `SitesModule` | Customer site locations, GIS coordinates, Makani numbers, and building details. | `CustomerSite` (PostGIS `geography(Point,4326)`) |
| **5** | `ServiceCatalogModule` | MEP service packages (AC, Plumbing, Electrical), rate types, and price lists. | `ServiceCategory`, `Service`, `PriceList`, `PriceListItem` |
| **6** | `ServiceRequestsModule` | Intake of customer requests (App, WhatsApp, phone) and SLA triage. | `ServiceRequest`, `Complaint` |
| **7** | `WorkOrdersModule` | Core FSM state machine, tasks, removed/fitted parts tracking, and expenses. | `WorkOrder`, `WorkOrderTask`, `WorkOrderPart`, `WorkOrderLabour`, `WorkOrderExpense` |
| **8** | `DispatchModule` | Auto/manual job allocation and PostGIS spatial proximity ranking. | `WorkOrderAssignment`, `TechnicianLocation` |
| **9** | `TrackingModule` | Realtime GPS telematics ingestion, speed, heading, and last-known location views. | `TechnicianLocation` (PostGIS GIST), `v_last_known_technician_locations` |
| **10** | `TechniciansModule` | Field technicians, helpers, supervisors, skills, and vehicle assignments. | `Employee`, `EmployeeSkill`, `Warehouse` (Van) |
| **11** | `AttendanceModule` | Mobile check-in/out with GPS location validation and leave tracking. | `EmployeeAttendance`, `EmployeeLeave` |
| **12** | `InventoryModule` | Stock levels across Central Al Quoz Warehouse, Mobile Vans, and stock movements. | `Item`, `Warehouse`, `StockLevel`, `StockMovement` |
| **13** | `PurchasingModule` | Supplier purchase orders, goods receipt notes (GRN), and supplier bills. | `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `SupplierInvoice` |
| **14** | `SuppliersModule` | MEP vendor directory, TRN validation, payment terms, and vendor performance. | `Supplier`, `SupplierPayment` |
| **15** | `MaterialSalesModule` | Counter and POS direct sales of plumbing, electrical, and HVAC components. | `MaterialSalesOrder`, `MaterialSalesOrderLine` |
| **16** | `EquipmentRentalModule` | Heavy equipment asset register, rental contracts, mobilization, and returns. | `RentalEquipment`, `RentalContract`, `RentalContractLine`, `RentalDispatchReturn` |
| **17** | `QuotationsModule` | Estimation, versioned quotations, discount approval workflows, and terms. | `Quotation`, `QuotationLine` |
| **18** | `InvoicesModule` | UAE FTA-compliant 5% VAT Tax Invoices, credit notes, and balance due tracking. | `Invoice`, `InvoiceLine`, `CreditNote` |
| **19** | `PaymentsModule` | Payment capture (Stripe Test / Mock Card / Cash / Cheque) and multi-invoice allocations. | `Payment`, `PaymentAllocation` |
| **20** | `FinanceModule` | Double-entry general ledger, UAE chart of accounts, and automated journal postings. | `ChartOfAccounts`, `JournalEntry`, `JournalLine`, `BankAccount` |
| **21** | `ReportsModule` | Analytical reporting views (Job profitability, tech performance, aging, P&L). | `v_job_profitability`, `v_monthly_pnl`, `v_receivables_aging` |
| **22** | `NotificationsModule` | Bilingual (EN/AR) in-app alerts, simulated WhatsApp, and email fan-out. | `NotificationTemplate`, `Notification`, `Reminder` |
| **23** | `AutomationModule` | Rule engine: event triggers, threshold conditions, and approval workflows. | `ApprovalRequest`, `AutomationRule` |
| **24** | `AuditModule` | Immutable audit log capturing actor, action, timestamp, and JSON diffs. | `AuditLog` |

---

## 3. End-to-End Sequence Diagrams

### (a) Customer AC Repair On-Demand Flow
*Customer books emergency repair in Downtown Dubai -> Dispatcher assigns closest tech via PostGIS -> Tech travels with live Leaflet map updates -> Tech completes job with before/after photos and parts -> Customer pays 5% VAT invoice via Stripe/Mock.*

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Customer (Mobile App)
    participant WebApp as 📱 Customer Web App
    participant API as ⚙️ NestJS API Gateway
    participant Dispatcher as 👔 Admin Dispatcher
    participant PostGIS as 🗺️ PostGIS Spatial Engine
    actor Tech as 👷 Technician (PWA)
    participant Storage as ☁️ Appwrite Storage
    participant Stripe as 💳 Stripe / Mock Gateway
    participant Ledger as 📚 General Ledger (Finance)

    Customer->>WebApp: Select AC Repair ("AC Not Cooling", Downtown Dubai)
    WebApp->>API: POST /api/service-requests (Emergency, Lat/Lng)
    API-->>WebApp: 201 Created (SR-2026-104)

    Dispatcher->>API: GET /api/dispatch/suggest?serviceRequestId=104
    API->>PostGIS: ST_DistanceSphere(TechLocations, SiteLocation)
    PostGIS-->>API: Ranked Technicians by Distance & ETA
    API-->>Dispatcher: [Rashid Al-Nuaimi (1.4 km, 6 min ETA), Vikram Sharma (3.2 km)]
    Dispatcher->>API: POST /api/work-orders/assign (Tech: Rashid)
    API->>Tech: Push Alert ("New Emergency AC Repair Assigned")
    API->>WebApp: WebSocket "job:status:changed" (ASSIGNED)

    Tech->>API: PATCH /api/work-orders/104/status ("EN_ROUTE")
    loop Live GPS Broadcast
        Tech->>API: WebSocket "tech:location:update" (Lat/Lng)
        API->>WebApp: Stream GPS Coordinates
        WebApp->>Customer: Animate Van on Leaflet Map (ETA Countdown)
    end

    Tech->>API: PATCH /api/work-orders/104/status ("ON_SITE")
    Tech->>Storage: Upload Pre-work Photo ("Damaged Capacitor")
    Tech->>API: POST /api/work-orders/104/parts (Add "Dual Capacitor 45uF" from Van Stock)
    API->>API: Deduct Van Inventory & Log StockMovement
    Tech->>Storage: Upload Post-work Photo ("Replaced & Running at 55 psi")
    Tech->>Customer: Present Digital Sign-off Pad
    Customer->>Tech: Sign Canvas ("Zaid Al-Harbi", 5-star rating)
    Tech->>Storage: Upload Customer Signature (PNG)
    Tech->>API: POST /api/work-orders/104/complete

    API->>API: Generate Tax Invoice INV-2026-0082 (Subtotal 365 AED + 5% VAT 18.25 AED)
    API->>Ledger: Auto-post Journal (DR Accounts Receivable 383.25, CR Revenue 365, CR Output VAT 18.25)
    API->>WebApp: Display Payment Screen (Total: 383.25 AED)

    Customer->>WebApp: Tap "Pay with Card"
    WebApp->>Stripe: Process PaymentIntent (or 1-Click Mock Checkout)
    Stripe-->>WebApp: Payment Succeeded (pi_3Mtw...)
    WebApp->>API: POST /api/billing/pay (Transaction ID)
    API->>Ledger: Auto-post Journal (DR Bank Account 383.25, CR Accounts Receivable 383.25)
    API-->>WebApp: Deliver Official UAE Tax Invoice with FTA TRN & QR Code
```

---

### (b) Equipment Rental Contract & Mobilization Lifecycle
*Contractor books 100 kVA Diesel Generator -> Contract created with 5% VAT -> Pre-dispatch inspection photos -> Site mobilization -> Equipment return with hours meter check -> Final rental tax invoice.*

```mermaid
sequenceDiagram
    autonumber
    actor Client as 🏗️ Contractor (Arabtec)
    actor Ops as 👔 Operations Manager
    participant API as ⚙️ NestJS API
    participant Yard as 🚜 Equipment Yard / Storekeeper
    participant Storage as ☁️ Appwrite Storage
    participant Ledger as 📚 General Ledger

    Client->>Ops: Request 100 kVA Diesel Generator for 30 days (Yas Island Site)
    Ops->>API: POST /api/equipment/rentals
    Note over API: Applied Rate: 7,500 AED/mo<br/>Deposit: 2,000 AED<br/>VAT 5%: 375 AED
    API-->>Ops: Rental Contract RNT-2026-042 Created (Status: DRAFT)
    Ops->>API: PATCH /api/equipment/rentals/042/approve

    Yard->>Storage: Upload Pre-Dispatch Inspection Photos & Fuel Log
    Yard->>API: POST /api/equipment/rentals/042/dispatch (Condition: Good, Meter: 1,420 hrs)
    API->>API: Update Equipment Status -> "RENTED" (Location: Yas Island)
    API->>Ledger: Auto-post Deposit Journal (DR Bank 2000, CR Customer Deposit Liability 2000)

    Note over Client, Yard: Generator operates on site for 30 days...

    Client->>Ops: Demobilize & Return Generator to Central Yard
    Yard->>Storage: Upload Return Inspection Photos (Check body & oil levels)
    Yard->>API: POST /api/equipment/rentals/042/return (Meter: 1,660 hrs, No Damages)
    API->>API: Update Equipment Status -> "AVAILABLE" (Location: Al Quoz Yard)

    API->>API: Generate Final Rental Invoice (7,875 AED incl. 5% VAT)
    API->>Ledger: Auto-post Rental Revenue (DR Accounts Receivable 7875, CR Rental Rev 7500, CR Output VAT 375)
    API->>Ledger: Settle Deposit against Invoice Balance
```

---

### (c) Construction Site Labour Supply & Monthly Timesheet Billing
*Contractor requisitions 10 Electricians for 30 days -> Workers deployed to Emaar Creek Harbour -> Daily timesheets logged by site supervisor -> Monthly consolidated tax invoice generated & posted to ledger.*

```mermaid
sequenceDiagram
    autonumber
    actor Contractor as 🏗️ Emaar Project Manager
    actor Ops as 👔 Operations Manager
    participant API as ⚙️ NestJS API
    actor Supervisor as 👷 Site Lead / Supervisor
    participant Accountant as 💼 Accountant
    participant Ledger as 📚 General Ledger

    Contractor->>Ops: Submit Labour Requisition (10 Electricians, 30 Days, Emaar Creek)
    Ops->>API: POST /api/manpower/requisitions (Rate: 55 AED/hr or 440 AED/day)
    API-->>Ops: Requisition REQ-2026-081 Created

    Ops->>API: POST /api/manpower/deployments/allocate (Assign 10 Certified Electricians)
    API->>API: Update Worker Status -> "DEPLOYED" (Site: Emaar Creek)

    loop Daily Timesheet Logging (Day 1 to 30)
        Supervisor->>API: POST /api/manpower/timesheets/daily
        Note over Supervisor, API: Record hours worked per employee (e.g. 8h regular + 2h OT)<br/>Supervisor digital sign-off
        API->>API: Validate & Mark Timesheet Approved
    end

    Note over Accountant, API: End of Monthly Billing Cycle...

    Accountant->>API: POST /api/manpower/deployments/generate-invoice (Deployment ID)
    API->>API: Aggregate 30 Days Timesheets: 2,400 Hours × 55 AED = 132,000 AED
    API->>API: Calculate UAE VAT 5%: 6,600 AED (Total: 138,600 AED)
    API-->>Accountant: Generated Tax Invoice INV-2026-0095

    API->>Ledger: Auto-post Monthly Labour Revenue:
    Note over API, Ledger: DR Accounts Receivable (Emaar): 138,600 AED<br/>CR Labour Supply Revenue: 132,000 AED<br/>CR Output VAT Payable (5%): 6,600 AED
    API->>Ledger: Auto-post Payroll Direct Labour Cost:
    Note over API, Ledger: DR Direct Labour Cost: 60,000 AED<br/>CR Accrued Wages Payable: 60,000 AED
```
