# ADR 006: Shared Contracts, Enums, and Zod Validation

## Status
Accepted

## Context
Validation rules must match identically on:
1. Client-side forms (React Hook Form with Zod resolver) for fast user feedback.
2. Server-side request bodies (NestJS ValidationPipe with Zod) for tamper-proof API security.
Duplicating types and schemas leads to divergence and brittle code.

## Decision
Create `@fieldops/shared` package exporting:
- TypeScript Enums: `UserRole`, `JobStatus`, `ServiceType`, `Priority`, `PaymentStatus`, `RentalStatus`, `LabourTrade`.
- Zod Schemas: `LoginSchema`, `CreateBookingSchema`, `UpdateJobStatusSchema`, `AddMaterialUsageSchema`, `CreateRequisitionSchema`, `CreateRentalContractSchema`, `ProcessPaymentSchema`.
- Types generated via `z.infer<typeof Schema>` ensuring type synchronicity.

## Consequences
- Single canonical place for business invariants and rules.
- Guaranteed compile-time and run-time contract validation between frontend and backend.
