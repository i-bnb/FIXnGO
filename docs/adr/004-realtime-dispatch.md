# ADR 004: Realtime Dispatch and Live Location Architecture

## Status
Accepted

## Context
A key selling point of the platform is an Uber/Pronto-like experience:
- The customer tracks the technician moving on Leaflet map in real time.
- The admin dispatcher dashboard sees live locations of all technicians and vans across Dubai/UAE.
- Status changes (En Route, Arrived, In Progress, Completed) trigger instant UI state transitions.

## Decision
1. Implement a **NestJS Socket.IO Gateway** (`/socket.io`).
2. Technicians broadcast `tech:location:update` containing `{ technicianId, lat, lng, heading, speed }`.
3. The server broadcasts location updates to the customer's job room `job:<jobId>` and to the dispatcher channel `admin:dispatch`.
4. Provide a background GPS simulation runner that smoothly interpolates technician positions along Dubai routes (e.g. Sheikh Zayed Road, Al Khail Road) during sales walkthroughs.

## Consequences
- Dynamic, interactive live tracking demo without requiring third-party map subscription costs.
- Low-latency state propagation across customer, technician, and admin portals.
