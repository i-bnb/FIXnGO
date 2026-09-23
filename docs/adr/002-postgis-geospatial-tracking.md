# ADR 002: PostGIS for Geospatial Tracking and Dispatch Proximity

## Status
Accepted

## Context
FieldOps ERP requires high-precision geospatial capabilities:
1. **Live Technician Telematics**: Mobile technicians report GPS coordinates periodically while on duty and driving.
2. **Proximity-Based Dispatch**: When an emergency AC or plumbing job arrives, the system must instantly recommend the closest available technician to the customer site in Dubai, Sharjah, or Abu Dhabi.
3. **Site Geofencing**: Validating that employee attendance check-ins occur within acceptable boundaries of designated customer sites or construction projects.

Standard SQL Euclidean distance math (`SQRT(dx^2 + dy^2)`) ignores the spherical curvature of the Earth and lacks spatial indexing, resulting in slow full-table scans.

## Decision
We leverage **PostgreSQL 16 with PostGIS 3.4**:
- Native `geography(Point, 4326)` columns on `customer_sites` and `technician_locations`.
- Generalized Search Tree (`GIST`) spatial indexing on location columns for ultra-fast spatial range queries (`ST_DWithin`) and spatial nearest-neighbor searches (`<->`).
- Proximity calculation using `ST_DistanceSphere(loc1, loc2)`:
  ```sql
  SELECT e.id, e.first_name, e.last_name,
         ST_DistanceSphere(tl.location, cs.location) / 1000.0 AS distance_km
  FROM employees e
  JOIN v_last_known_technician_locations tl ON tl.employee_id = e.id
  JOIN customer_sites cs ON cs.id = $siteId
  WHERE e.status = 'ACTIVE' AND e.trade = $requiredTrade
  ORDER BY distance_km ASC;
  ```
- Fast reporting view `v_last_known_technician_locations` utilizing `DISTINCT ON (employee_id) ... ORDER BY employee_id, recorded_at DESC`.

## Consequences
- **Positive**: Blazing fast nearest-technician suggestions, real-world kilometer calculations accurate for UAE coordinates, no external paid geocoding/distance matrix API dependencies.
- **Negative**: Requires PostGIS extension installed in the PostgreSQL container image (`postgis/postgis:16-3.4`).
