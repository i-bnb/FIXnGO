# ADR 001: Monorepo Structure and Tooling

## Status
Accepted

## Context
FieldOps ERP contains three main software components:
1. `apps/web`: Next.js 14 frontend serving three distinct portals (Customer `/app`, Technician `/tech`, Admin `/admin`).
2. `apps/api`: NestJS modular monolith REST API + OpenAPI Swagger + Socket.IO realtime server.
3. `packages/shared`: Shared TypeScript types, Zod validation schemas, UAE business constants, and enums.

We require fast local development, zero drift between client and server validation, and unified script execution.

## Decision
We adopt a monorepo structure managed by `pnpm workspaces`:
- `packages/shared` exports compiled CommonJS/ESM modules and TypeScript definitions.
- `apps/api` and `apps/web` declare `"@fieldops/shared": "workspace:*"` in their dependencies.
- Shared Zod validation ensures every user input is validated identically on the frontend form and backend API controller.

## Consequences
- **Positive**: Single source of truth for DTOs and Zod validation schemas. Instant type feedback across client and server.
- **Negative**: Requires shared package compilation step before building consumer apps.
