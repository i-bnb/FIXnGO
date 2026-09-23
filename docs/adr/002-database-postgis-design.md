# ADR 002: Database Schema and PostGIS Geospatial Architecture

## Status
Accepted

## Context
Field-service dispatch requires spatial proximity queries:
- Find technicians within a given radius (e.g., 10 km) of a customer site.
- Rank available technicians by real road/great-circle distance (`ST_DistanceSphere`).
- Track live GPS coordinates (latitude/longitude) with spatial index support.

At the same time, enterprise ERP rules require:
- Universal UUID primary keys (`id` as UUID).
- Audit fields on every table (`created_at`, `updated_at`, `created_by`, `deleted_at`).
- Centralized `AuditLog` table capturing actor, action (`CREATE`, `UPDATE`, `DELETE`), target table, record ID, and change diff.
- Monetary amounts stored in `numeric(14,2)` to prevent floating point inaccuracies.

## Decision
1. We use **PostgreSQL 16 + PostGIS 3.4**.
2. Prisma ORM models all relational tables, relations, constraints, and audit fields.
3. Latitudes and longitudes are stored as `Decimal(10, 7)`. For spatial proximity, we use PostGIS native queries:
   ```sql
   SELECT id, name,
          ST_DistanceSphere(ST_MakePoint(longitude, latitude), ST_MakePoint($customerLng, $customerLat)) / 1000.0 AS distance_km
   FROM "TechnicianProfile"
   WHERE is_available = true AND deleted_at IS NULL
   ORDER BY distance_km ASC;
   ```
4. All soft-deleted records have `deleted_at` set rather than physically dropped.

## Consequences
- Fast, indexed PostGIS geospatial calculations combined with full Prisma type safety.
- Full compliance with audit trail non-negotiables.
