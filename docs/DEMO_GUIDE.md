# FieldOps ERP - 15-Minute Clickable Sales Demo Script

A guided walkthrough for sales presentations and executive reviews demonstrating the all-in-one UAE field-service, maintenance, manpower supply, and equipment rental ERP platform.

---

## 🔑 Demo Personas & Credentials

| Persona | Role | Default Email | Password | Primary Portal |
|---|---|---|---|---|
| **Sultan Al-Mansoor** | Super Admin | `admin@fieldops.ae` | `DemoPassword123!` | `/en/admin` |
| **Sarah Jenkins** | Dispatcher | `dispatch@fieldops.ae` | `DemoPassword123!` | `/en/admin` (Dispatch) |
| **Rashid Al-Nuaimi** | Senior HVAC Tech | `tech.rashid@fieldops.ae` | `DemoPassword123!` | `/en/tech` |
| **Fatima Al-Zahra** | Chief Accountant | `finance@fieldops.ae` | `DemoPassword123!` | `/en/admin/billing` |
| **Zaid Al-Harbi** | Residential Client | `customer@fieldops.ae` | `DemoPassword123!` | `/en/app` |

---

## 🚀 15-Minute End-to-End Walkthrough Script

### 1. The Customer On-Demand Experience (Minutes 0 - 3)
1. Navigate to `http://localhost:3000/en/app` (or click **Customer App** in the top navigation).
2. **Select Service**:
   - Choose **AC & Cooling** (or Plumbing / Electrical).
   - Select package: **AC Diagnosis & Gas Top-up** (150.00 AED + 5% VAT).
   - Note the **Emergency Dispatch** toggle (highlighting rapid 15-30 min response).
   - Select area: **Downtown Dubai (Burj Crown Tower)**.
3. Observe the dynamic UAE price summary:
   - Base Callout: `150.00 AED`
   - UAE VAT (5%): `7.50 AED`
   - Total Payable: `157.50 AED`
4. Click **Confirm & Track Van →**.
5. **Live Technician Tracking**:
   - Observe the interactive Leaflet OpenStreetMap showing the customer pin in Downtown Dubai and technician van approaching in real time.
   - Inspect the technician card: *Rashid Al-Nuaimi, 4.95 ⭐ rating, 142 completed Dubai jobs*.
   - Use the **Demo Controls: Advance Status** button to progress through *Arrived*, *In Progress*, and *Completed*.
6. **Payment & Tax Invoice**:
   - Click **Proceed to Payment & Invoice**.
   - Select **1-Click Mock Checkout (Offline Resilient)** or **Stripe Test Mode**.
   - Click **Pay 157.50 AED Now**. Enjoy the celebration confetti!
   - Review the official **Tax Invoice / فاتورة ضريبية** featuring company TRN `100000000000003 (demo)`, line items, and VAT breakdown.
---

### 2. Admin Dispatch Center & PostGIS Spatial Matching (Minutes 3 - 6)
1. Navigate to `http://localhost:3000/en/admin` (or click **Admin ERP** in top navigation).
2. **Review High-Level KPIs**:
   - Active Work Orders, On-Duty Technicians, MTD Revenue in AED, Deployed Manpower.
3. **Inspect Realtime UAE Fleet Map**:
   - View all mobile technicians positioned across Dubai (Downtown, Business Bay, Al Quoz, JLT), Sharjah (Al Nahda), and Abu Dhabi (Musaffah).
   - Markers are color-coded: Teal (Available), Amber (En Route), Red (Emergency Pending Job).
4. **PostGIS Proximity Dispatching**:
   - Click on any pending work order in the right sidebar (e.g. `WO-2026-003: Short Circuit in Downtown`).
   - Observe the **PostGIS Distance Proximity Match**:
     - Automatically ranks on-duty technicians by exact driving distance and ETA.
   - Click **Assign** to immediately dispatch the closest engineer.

---

### 3. Technician Field Mobile PWA (Minutes 6 - 9)
1. Switch to mobile viewport or open `http://localhost:3000/en/tech`.
2. Inspect the touch-friendly interface designed for phone screens.
3. Review the on-duty status toggle (**On Duty** vs **Clocked Out**).
4. Review active emergency order `WO-2026-002: Kitchen Main Supply Pipe Severe Leak`.
5. Tap big touch button: **TAP: I Have Arrived at Site**.
6. Tap big touch button: **TAP: Start Execution**.
7. **Checklist & Van Stock Deduction**:
   - Check off mandatory safety risk assessment and pipe joint pressure tests.
   - Click **Add Part** to deduct a replacement *PPR Socket* or *Grohe Valve* from van stock.
   - Observe automatic real-time bill recalculation with 5% VAT.
8. **Digital Customer Sign-Off**:
   - Review digital customer signature capture and photo proof.
   - Tap **Complete Job & Trigger VAT Invoice**.

---

### 4. Manpower Supply to UAE Construction Sites (Minutes 9 - 11)
1. Navigate to `http://localhost:3000/en/admin/manpower`.
2. Review the **Skilled Workers Roster**:
   - Master Electricians, Plumbers, HVAC Technicians, Pipe Fitters deployed at *Crescent Bay Commercial Complex* and *Desert Rose Logistics Hub*.
3. Switch to **Site Requisitions & Contracts**:
   - See active contractor requisitions with daily rates and total contract values (e.g. 118,800 AED).
4. Test the **Export CSV** button to download the live labour roster.
5. Click **New Site Requisition** to simulate creating a 10-worker electrical team request for a new contractor.

---

### 5. Heavy Equipment Rental & Plant Fleet (Minutes 11 - 13)
1. Navigate to `http://localhost:3000/en/admin/equipment`.
2. Review the fleet:
   - *Caterpillar 100 kVA Diesel Generator*, *6m Aluminium Scaffolding Tower*, *12m Electric Scissor Lift*, *Hilti Heavy Breaker*.
3. Click **Rent Out** on an available machine (e.g. Scissor Lift):
   - Select contractor (*Palm Crest MEP Contracting LLC*), project site (*Crescent Bay Tower 1*), and monthly billing terms.
   - Note the automatic 5% VAT calculation and instant contract activation.
4. Click **Export CSV** to demonstrate equipment audit capabilities.

---

### 6. Materials Inventory & Van Stock (Minutes 13 - 14)
1. Navigate to `http://localhost:3000/en/admin/inventory`.
2. Observe multi-location inventory tracking:
   - Stock is clearly delineated between **Central Al Quoz Warehouse** and **Mobile Van Fleet**.
3. Test **Transfer to Van Stock**:
   - Move 5 units of *Dual Run Capacitors* from Central Warehouse to *Van 01 (Rashid)*.
   - Observe instant warehouse deduction and van stock increment.

---

### 7. Bilingual Arabic Layout & Compliance Audit (Minute 14 - 15)
1. In the top navigation, click the language switcher button **العربية**.
2. Observe the complete mirror right-to-left layout (`dir="rtl"`):
   - Sidebar docks to the right, tables align appropriately, and all metrics/terms render in natural Arabic.
3. Open `http://localhost:3000/ar/admin/audit-logs`.
4. Inspect the immutable audit trail displaying every dispatch, work order creation, payment, and status transition with actor name, role, timestamp, and JSON diff.
