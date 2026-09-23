# ADR 001: Modular Monolith vs Microservices Architecture

## Status
Accepted

## Context
FieldOps ERP powers a wide range of interconnected operations for a UAE MEP and contracting business:
- On-demand residential field service dispatch
- Construction site manpower supply and timesheet tracking
- Heavy equipment fleet rentals
- Counter/POS sales of electrical and plumbing materials
- Double-entry accounting, VAT 5% compliance, and inventory management

An early temptation in enterprise ERP development is decomposing each vertical into microservices (e.g. `service-work-orders`, `service-manpower`, `service-equipment`, `service-billing`, `service-inventory`). However:
1. Cross-service transactional consistency (e.g. deducting inventory when completing a work order, generating an invoice, and auto-posting general ledger entries) requires complex distributed sagas or two-phase commits.
2. Latency, network failure points, and deployment overhead would dramatically increase without business benefit.
3. This is a sales demo requiring high stability, fast live walkthroughs, and single-click local development.

## Decision
We adopt a **Modular Monolith** architecture built on **NestJS (TypeScript)**:
- High cohesion and loose coupling: Each domain (e.g. `WorkOrdersModule`, `ManpowerModule`, `EquipmentModule`, `BillingModule`, `FinanceModule`) is an independent NestJS module with explicit service boundaries, controllers, and data access.
- Single unified relational database: PostgreSQL 16 with PostGIS 3.4 as the single source of truth, enforcing ACID transactions across modules.
- Shared domain contracts: Shared DTOs, Zod schemas, and enums reside in `@fieldops/shared`.
- In-process event bus and asynchronous background jobs: NestJS event emitters and Redis BullMQ handle notification fan-out, reminder schedules, and automated rules.

## Consequences
- **Positive**: Atomic database transactions across work orders, inventory, and accounting ledger. Simpler deployment (single container/binary), zero network hops between ERP modules, rapid iteration during sales demonstrations.
- **Negative**: Requires strict module boundary discipline in code reviews to prevent tight coupling across module internals.
