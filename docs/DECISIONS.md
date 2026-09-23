# Decisions & Trade-Offs Log

This document records pragmatic decisions made during the design and implementation of FieldOps ERP to maximize demo reliability, business compliance, and code maintainability.

---

## 1. Monorepo Architecture: pnpm Workspaces
- **Context**: The project combines a Next.js 14 frontend, a NestJS backend, and shared domain models/contracts.
- **Decision**: Used pnpm workspaces with `@fieldops/shared`, `@fieldops/api`, and `@fieldops/web`.
- **Trade-off**: Sharing code directly via workspace links eliminates code drift between frontend forms and backend validation while avoiding publishing private packages.

---

## 2. ORM and PostGIS Geospatial Queries
- **Context**: Need standard relational modeling with audit trails alongside PostGIS geospatial calculations (technician proximity, nearest neighbor, distance in km).
- **Decision**: Use Prisma ORM for relational queries, migrations, and schema definition, paired with PostGIS native SQL queries (`ST_DistanceSphere`, `ST_DWithin`, `ST_MakePoint`) for spatial proximity dispatch. Latitudes and longitudes are stored as indexed decimals and spatial points.
- **Trade-off**: Prisma gives excellent TypeScript types and migration safety; spatial SQL queries provide ultra-fast PostGIS native performance.

---

## 3. UAE VAT 5% Compliance and TRN Invoicing
- **Context**: UAE Federal Tax Authority (FTA) requires 5% standard VAT on taxable supplies, compliant Tax Invoice layouts, and registration numbers (TRN).
- **Decision**: Monetary amounts are stored in PostgreSQL as `numeric(14, 2)`. Calculations use strict cent-accurate decimal arithmetic (`vatAmount = round(subtotal * 0.05, 2)`). The platform generates bilingual tax invoices featuring company TRN `100482910300003`.
- **Trade-off**: Avoids JavaScript floating-point rounding errors and ensures FTA compliance.

---

## 4. Dual-Mode Payment Architecture
- **Context**: A sales demo must support live Stripe checkout in test mode if configured, but must never fail or block a demo if Stripe credentials are not configured or if internet access is interrupted.
- **Decision**: Abstract payments behind a `PaymentProvider` interface with two implementations:
  1. `StripePaymentProvider`: Creates PaymentIntents using test cards.
  2. `MockPaymentProvider`: Generates instant test approvals with simulated card/Apple Pay/Cash on Delivery.
- **Trade-off**: Complete resilience during live sales walkthroughs.

---

## 5. Storage Abstraction (Appwrite + Local/Memory Provider)
- **Context**: Appwrite Storage is used for job photos, customer signatures, invoices, and avatars.
- **Decision**: Built a storage service interface. If Appwrite Cloud credentials are provided, files upload to Appwrite buckets; otherwise, the local static file mock serves and persists files seamlessly.
- **Trade-off**: Zero demo downtime even without external cloud services.

---

## 6. Realtime Gateway via Socket.IO
- **Context**: Customers need to see the technician moving towards their location; dispatchers need a live dispatch map.
- **Decision**: NestJS Socket.IO gateway broadcasting `tech:location:update` and `job:status:change` events to authenticated rooms. A simulation ticker is provided for demos to animate technician movement smoothly along UAE roads.
- **Trade-off**: No external third-party paid subscriptions needed for demonstration.
