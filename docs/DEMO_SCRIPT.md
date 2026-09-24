# FieldOps ERP - Client Sales Demo Script (20 Minutes)

> **Company Profile**: FieldOps Technical Services LLC, Al Quoz Industrial Area 3, Dubai, UAE  
> **Tax Registration Number (TRN)**: `100482910400003`  
> **Audience**: C-Suite, Managing Directors, Head of Operations, Facility Managers, Chief Financial Officers  
> **Total Duration**: 20 Minutes (15-Minute Hero Story + 5-Minute Module Tour)

---

## 🎭 Cast of Personas & Quick Switch Logins

| Persona / Role | Name & Title | Credentials (Email / Pass) | Portal & Target URL |
| :--- | :--- | :--- | :--- |
| **Homeowner / Client** | Zaid Al-Harbi | `customer.demo@fieldops.ae` / `Demo@12345` | Customer App: `http://localhost:3000/en/app` |
| **Operations Manager** | Tariq Mansoor | `manager.demo@fieldops.ae` / `Demo@12345` | Admin Portal: `http://localhost:3000/en/admin` |
| **Dispatcher** | Omar Farooq | `dispatch.demo@fieldops.ae` / `Demo@12345` | Dispatch Board: `http://localhost:3000/en/admin/dispatch` |
| **Lead HVAC Technician** | Rashid Al-Nuaimi (Van-01) | `tech.demo@fieldops.ae` / `Demo@12345` | Technician PWA: `http://localhost:3000/en/tech` |
| **Financial Controller / Accountant** | Fatima Al-Zahra | `finance.demo@fieldops.ae` / `Demo@12345` | Billing & GL: `http://localhost:3000/en/admin/billing` |
| **Chief Executive / Super Admin** | Sultan Al-Falasi | `admin.demo@fieldops.ae` / `Demo@12345` | Executive Dashboard: `http://localhost:3000/en/admin` |

---

## ⏱ Part 1: The 15-Minute Hero Story (AC Breakdown to P&L Impact)

### Chapter 1: The Breakdown & Instant Customer Booking (0:00 - 3:00)
**Narrative**: *"It is 2:30 PM on a sweltering 46°C Dubai summer afternoon. The master chiller in Zaid Al-Harbi's Palm Jumeirah villa suddenly stops cooling. Instead of waiting on hold with call centers, Zaid pulls out his phone and opens the FieldOps Customer On-Demand App."*

1. **Open Customer Portal**:
   - Navigate to [`http://localhost:3000/en/app`](http://localhost:3000/en/app) (or click Customer App from the switcher).
   - *Presenter Point*: Note the clean, consumer-grade aesthetic modeled after premium on-demand platforms like Pronto and Careem Home Services.
2. **Select Service**:
   - Click on the **Air Conditioning (HVAC)** service category tile.
   - Select **Emergency AC Breakdown & Chiller Diagnostics** (Base rate: AED 350.00).
3. **Capture Issue Details**:
   - Description: *"Master rooftop inverter compressor tripping on high pressure. Villa ambient temp 34°C."*
   - Urgency: Select **Emergency / High Priority**.
   - Inspection Photo: Click to attach simulated thermal diagnostic snapshot.
4. **Pin-Drop Geolocation & Timeslot**:
   - Confirm site address: **Villa 42, Frond K, Palm Jumeirah, Dubai**.
   - Time Slot: **Immediate Dispatch / Within 60 Mins**.
5. **Confirm Booking**:
   - Click **Book Emergency Service**.
   - *Presenter Point*: Notice the simulated WhatsApp notification chime and ticket confirmation banner: **Ticket #SR-2026-0812 Created**.

---

### Chapter 2: Intelligent Dispatch & Telematics Assignment (3:00 - 6:00)
**Narrative**: *"Back at FieldOps Headquarters in Al Quoz, the dispatch team receives the urgent notification on their real-time dispatch wall."*

1. **Open Admin Dispatch Board**:
   - Navigate to [`http://localhost:3000/en/admin/dispatch`](http://localhost:3000/en/admin/dispatch).
   - Point out the interactive Leaflet GIS Map tracking **12 active technician vans across Dubai, Sharjah, and Abu Dhabi**.
2. **Review the New Ticket**:
   - In the unassigned queue on the left sidebar, click on **WO-2026-0002 / SR-0812: Emergency Chiller Breakdown**.
3. **Run "Suggest Nearest Technician"**:
   - Click the **"Suggest Nearest Technician"** button.
   - The engine executes a PostGIS KNN / `ST_DWithin` spatial query filtered by trade license (`HVAC_TECH`) and current availability.
   - The algorithm highlights **Rashid Al-Nuaimi (Van-01)** stationed nearby at Dubai Marina (Distance: 4.8 km, ETA: 14 mins).
4. **Dispatch the Team**:
   - Assign Rashid as **In-Charge Lead Technician** + helper **Sajid Khan**.
   - Click **Assign & Dispatch Job**.
5. **Trigger Live Telematics**:
   - Click the **"⚡ Demo Scenarios"** button in the top navigation bar.
   - Click **"Start GPS Sim"** (or click Scenario 3: *"Tech En Route: Arriving in 18 Min"*).
   - Switch to the Live Map: Watch Van-01's marker lerp smoothly along the road towards Palm Jumeirah with animated pulse and trail line!

---

### Chapter 3: Live Customer Tracking (6:00 - 8:00)
**Narrative**: *"The customer is never left wondering where the technician is or when they will arrive."*

1. **Switch back to the Customer App**:
   - Return to [`http://localhost:3000/en/app`](http://localhost:3000/en/app).
   - The active job card now displays: **"Technician On The Way"**.
2. **View Live Tracking Page**:
   - Click **"Track Technician"**.
   - See Rashid's profile card: Photo, Star Rating (**4.95 ★ from 142 reviews**), Van Code **Van-01**, and phone call button.
   - View the live countdown: **"Arriving in 12 Minutes"** with the van marker approaching the customer's villa pin on the road vector.

---

### Chapter 4: Technician Mobile PWA Execution (8:00 - 11:00)
**Narrative**: *"Rashid arrives on-site. Everything he needs—customer history, chiller serial numbers, van spare parts, checklist, and signoff pad—is on his mobile PWA."*

1. **Open Technician PWA**:
   - Navigate to [`http://localhost:3000/en/tech`](http://localhost:3000/en/tech).
2. **Operational Status Progression**:
   - Click **"Arrived on Site"** (GPS coordinates timestamped).
   - Click **"Start Diagnostics"** (Work timer begins ticking).
3. **Execute Job Checklist & Parts Replacement**:
   - Check off diagnostics tasks: *Check suction pressure*, *Inspect contactor*, *Test run capacitor*.
   - Click **"Issue Part from Van Stock"**: Select **Dual Run Capacitor 50+5µF 450V** (Stock decrements from Van-01; AED 85.00 cost logged).
   - Top-up refrigerant: Select **R410A Refrigerant 2.5 kg** (AED 120.00).
4. **Upload Evidence**:
   - Capture **BEFORE Photo**: Burned capacitor and iced-up copper line.
   - Capture **AFTER Photo**: Brand new capacitor wired cleanly, digital manifold showing optimal 120 PSI suction pressure.
5. **Customer Sign-Off**:
   - Hand the device to Zaid (or switch to customer signoff modal).
   - Collect digital signature on the touchscreen pad.
   - Rate service: **5 Stars ★★★★★**.
   - Click **"Complete Work Order"**.
   - *Presenter Point*: Emphasize that the API prevents completion without both an AFTER photo and a signature.

---

### Chapter 5: Automated Invoicing, Stripe Payment & General Ledger (11:00 - 15:00)
**Narrative**: *"Within 10 seconds of completion, a compliant UAE FTA Tax Invoice is generated and paid online, updating the back-office general ledger in real time."*

1. **Check Customer Instant Payment Link**:
   - Return to the Customer Portal [`http://localhost:3000/en/app`](http://localhost:3000/en/app).
   - The notification bell rings: *"Job Completed! Invoice INV-2026-0042 Ready"*.
   - Click **"Pay Now (AED 383.25)"**.
2. **Stripe Test Checkout**:
   - Enter Stripe test card: `4242 4242 4242 4242`, Exp: `12/28`, CVC: `123`.
   - Click **Confirm Payment**.
   - Green confirmation checkmark appears: **"Payment Succeeded - Transaction ref #pi_mock_live_0042"**.
   - Click **"Download UAE Tax Invoice PDF"** to preview the bilingual English/Arabic invoice with TRN, QR code, and 5% VAT calculation.
3. **Verify General Ledger & Profitability**:
   - Navigate to [`http://localhost:3000/en/admin/billing`](http://localhost:3000/en/admin/billing).
   - Filter by **INV-2026-0042**: Status shows **PAID (AED 383.25)**, Balance Due: **AED 0.00**.
   - Click **View Journal Entry**:
     - $\text{Dr Bank Account (1020)}: \text{AED } 383.25$
     - $\text{Cr Accounts Receivable (1200)}: \text{AED } 383.25$
     - Original invoice posted: $\text{Dr A/R 1200} \text{ (383.25)} / \text{Cr Service Revenue 4001} \text{ (365.00)} / \text{Cr VAT Payable 2150} \text{ (18.25)}$.
4. **Job Profitability Rollup**:
   - Navigate to [`http://localhost:3000/en/admin/reports`](http://localhost:3000/en/admin/reports) or [`/admin`](http://localhost:3000/en/admin).
   - The job displays **Revenue: AED 365.00, Direct Costs (Parts + Labour): AED 205.00, Gross Margin: AED 160.00 (43.8%)**.

---

## 🚀 Part 2: The 5-Minute Tour of Specialized Modules (15:00 - 20:00)

### 1. Equipment Rental Fleet ([`/admin/equipment`](http://localhost:3000/en/admin/equipment))
- **Fleet Utilization**: 40 heavy equipment units (scaffolding towers, 100kVA Cummins generators, 14m scissor lifts, diesel air compressors).
- **Interactive Calendar & Off-Hire Control**: Visual timeline showing current on-hire contracts vs depot maintenance reserves.
- **Fast-Forward Rental Demo**: Click **⚡ Demo Scenarios $\to$ "Fast-Forward Rental"** to trigger off-hire return reminder and inspection checklist for contract `RC-2026-0005`.

### 2. Construction Labour Supply & Timesheets ([`/admin/manpower`](http://localhost:3000/en/admin/manpower))
- **30 Deployed Workers**: Electricians, pipefitters, HVAC technicians, and helpers deployed across Crescent Bay Commercial Complex, Al-Noor Residential Compound, and Palm Crest sites.
- **Daily Timesheet Rollup**: Digital supervisor signature, regular 8h + 2h overtime logging, one-click conversion to monthly client consolidated tax invoices.

### 3. Inventory & Van Replenishment ([`/admin/inventory`](http://localhost:3000/en/admin/inventory))
- **Multi-Warehouse Architecture**: Central Logistics Warehouse (Al Quoz), Northern Emirates Depot (Sharjah), plus 12 mobile van depots.
- **Automated Reordering**: Stock falling below safety thresholds triggers automatic draft Purchase Orders (e.g. PO-2026-0048 for R410A gas cylinders routed to Sultan for digital approval).

### 4. Financial Health & Receivables Aging ([`/admin/finance`](http://localhost:3000/en/admin/finance))
- **Double-Entry Balance**: Live P&L, balance sheet, trial balance, and tax return readiness report for the UAE Federal Tax Authority (FTA).
- **Aging Buckets**: Current, 30, 60, 90+ days aging with automated WhatsApp/Email dunning triggers.

### 5. Multi-Lingual Arabic RTL & Dark Mode Experience
- Click the **Language Toggle (EN / AR)** in the top bar: Observe the interface flip seamlessly to native Right-to-Left (`dir="rtl"`) with Arabic typography and localized terminology (e.g. *أمر عمل، فاتورة ضريبية، توزيع الفنيين*).
- Click the **Theme Toggle (☀️ / 🌙)** to demonstrate high-contrast dark mode optimized for outdoor technicians and operations night shifts.

---

## ⚡ Quick-Action Demo Scenarios Reference Table

| Button Name | Trigger Key | System Impact |
| :--- | :--- | :--- |
| **Reset Demo Data** | `reset-data` | Clears test emergency work orders, resets simulator routes, resets baseline state |
| **Start / Stop GPS Sim** | `start-gps` / `stop-gps` | Drives 5 demo vans along Sheikh Zayed Rd, Business Bay, Al Khail, and Palm Jumeirah |
| **Emergency Job** | `emergency-job` | Spawns priority `EMERGENCY` work order `WO-2026-XXXX` with live dispatch alert |
| **Overdue Reminders** | `overdue-reminders` | Sweeps accounts receivable and generates automated dunning notices |
| **Fast-Forward Rental** | `fast-forward-rental` | Sets rental contract `RC-2026-0005` to off-hire date and queues collection task |
| **Run All 9 Scenarios** | `ALL` | Fires all 9 omnichannel message workflows sequentially into outbox & bell |
