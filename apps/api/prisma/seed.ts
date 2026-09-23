import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =========================================================================
// 1. DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (LCG)
// =========================================================================
class SeededRandom {
  private seed: number;
  constructor(seed = 123456789) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  range(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }
  float(min: number, max: number, decimals = 2): number {
    const val = min + this.next() * (max - min);
    return Number(val.toFixed(decimals));
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

const rng = new SeededRandom(20260324);

// =========================================================================
// 2. MASTER CONSTANTS & UAE CONFIGURATION
// =========================================================================
const COMPANY = {
  name: 'FieldOps Technical Services LLC',
  nameAr: 'فيلد أوبس للخدمات الفنية ذ.م.م',
  trn: '100482910300003',
  address: 'Warehouse 12, Al Quoz Industrial Area 3, Dubai, UAE',
  logoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200',
  vatRate: 0.05,
};

// Date reference: 6-month simulation ending late March 2026
const NOW = new Date('2026-03-24T12:00:00Z');
const SIX_MONTHS_AGO = new Date('2025-09-24T08:00:00Z');

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

// Curated before & after photo URLs for realistic MEP maintenance jobs
const BEFORE_PHOTOS = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
];
const AFTER_PHOTOS = [
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
];

// =========================================================================
// MAIN SEED EXECUTION
// =========================================================================
async function main() {
  console.log('===================================================================');
  console.log(`Starting 6-Month Master Seed for "${COMPANY.name}"`);
  console.log('Deterministic, Full Relational Integrity, UAE 5% VAT & Double-Entry');
  console.log('===================================================================');

  // -----------------------------------------------------------------------
  // STEP 0: Clean existing records in strict reverse foreign key order
  // -----------------------------------------------------------------------
  console.log('Step 0: Teardown existing records...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.cashBankTransaction.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.expenseClaimLine.deleteMany();
  await prisma.expenseClaim.deleteMany();
  await prisma.journalLine.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.chartOfAccounts.deleteMany();
  await prisma.paymentAllocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.creditNote.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quotationLine.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.rentalDispatchReturn.deleteMany();
  await prisma.rentalContractLine.deleteMany();
  await prisma.rentalContract.deleteMany();
  await prisma.rentalEquipment.deleteMany();
  await prisma.materialSalesOrderLine.deleteMany();
  await prisma.materialSalesOrder.deleteMany();
  await prisma.supplierPayment.deleteMany();
  await prisma.supplierInvoice.deleteMany();
  await prisma.goodsReceiptLine.deleteMany();
  await prisma.goodsReceipt.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.item.deleteMany();
  await prisma.labourDailyTimesheet.deleteMany();
  await prisma.labourSupplyDeployment.deleteMany();
  await prisma.technicianLocation.deleteMany();
  await prisma.customerSignoff.deleteMany();
  await prisma.workOrderAttachment.deleteMany();
  await prisma.workOrderExpense.deleteMany();
  await prisma.workOrderLabour.deleteMany();
  await prisma.workOrderPart.deleteMany();
  await prisma.workOrderTask.deleteMany();
  await prisma.workOrderAssignment.deleteMany();
  await prisma.workOrderStatusHistory.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.contractVisitSchedule.deleteMany();
  await prisma.maintenanceContract.deleteMany();
  await prisma.customerAsset.deleteMany();
  await prisma.customerSite.deleteMany();
  await prisma.customerContact.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.priceListItem.deleteMany();
  await prisma.priceList.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.employeeLeave.deleteMany();
  await prisma.employeeAttendance.deleteMany();
  await prisma.employeeSkill.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.userRoleAssignment.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // -----------------------------------------------------------------------
  // STEP 1: Roles, Permissions & User Accounts
  // -----------------------------------------------------------------------
  console.log('Step 1: Seeding Roles, Permissions and Staff...');
  // Pre-hash password once for instant deterministic seeding
  const defaultPasswordHash = await bcrypt.hash('DemoPassword123!', 10);

  const roleDefinitions = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Unrestricted system access' },
    { code: 'OPS_MANAGER', name: 'Operations Manager', description: 'Work orders, contracts, approvals' },
    { code: 'ACCOUNTANT', name: 'Senior Accountant', description: 'Invoices, ledger, payments, VAT' },
    { code: 'DISPATCHER', name: 'Fleet Dispatcher', description: 'Technician assignment, telematics' },
    { code: 'STOREKEEPER', name: 'Storekeeper', description: 'Inventory, van stock, reorder' },
    { code: 'TECHNICIAN', name: 'Field Technician', description: 'Mobile PWA job execution' },
    { code: 'HELPER', name: 'General Helper', description: 'Assisting lead technicians' },
    { code: 'LABOUR_WORKER', name: 'Site Labour Worker', description: 'Construction site manpower' },
    { code: 'CUSTOMER', name: 'Customer Client', description: 'Client portal access' },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of roleDefinitions) {
    const createdRole = await prisma.role.create({
      data: { code: r.code, name: r.name, description: r.description, isSystem: true },
    });
    roleMap[r.code] = createdRole.id;
  }

  // Create permissions
  const permissionsList = [
    { code: 'work_order.view', resource: 'work_order', action: 'view' },
    { code: 'work_order.create', resource: 'work_order', action: 'create' },
    { code: 'work_order.assign', resource: 'work_order', action: 'assign' },
    { code: 'work_order.complete', resource: 'work_order', action: 'complete' },
    { code: 'invoice.create', resource: 'invoice', action: 'create' },
    { code: 'invoice.view', resource: 'invoice', action: 'view' },
    { code: 'finance.view', resource: 'finance', action: 'view' },
    { code: 'finance.manage', resource: 'finance', action: 'manage' },
    { code: 'equipment.manage', resource: 'equipment', action: 'manage' },
    { code: 'manpower.manage', resource: 'manpower', action: 'manage' },
    { code: 'inventory.manage', resource: 'inventory', action: 'manage' },
  ];

  for (const p of permissionsList) {
    const perm = await prisma.permission.create({
      data: { code: p.code, resource: p.resource, action: p.action, description: `${p.action} ${p.resource}` },
    });
    // Give all to SUPER_ADMIN and OPS_MANAGER
    await prisma.rolePermission.create({ data: { roleId: roleMap['SUPER_ADMIN'], permissionId: perm.id } });
    await prisma.rolePermission.create({ data: { roleId: roleMap['OPS_MANAGER'], permissionId: perm.id } });
  }

  // 1. Staff Members (5 Management Users)
  const staffMembers = [
    { email: 'admin@fieldops.ae', name: 'Sultan Al-Falasi', phone: '+971 50 111 2233', role: 'SUPER_ADMIN', trade: 'OFFICE' },
    { email: 'ops@fieldops.ae', name: 'Tariq Mansoor', phone: '+971 50 222 3344', role: 'OPS_MANAGER', trade: 'SUPERVISOR' },
    { email: 'finance@fieldops.ae', name: 'Mariam Al-Husseini', phone: '+971 50 333 4455', role: 'ACCOUNTANT', trade: 'OFFICE' },
    { email: 'inventory@fieldops.ae', name: 'Bilal Qureshi', phone: '+971 50 444 5566', role: 'STOREKEEPER', trade: 'OFFICE' },
    { email: 'dispatch@fieldops.ae', name: 'Sarah Jenkins', phone: '+971 50 555 6677', role: 'DISPATCHER', trade: 'SUPERVISOR' },
  ];

  const staffUserMap: Record<string, any> = {};
  for (const s of staffMembers) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: defaultPasswordHash,
        fullName: s.name,
        phone: s.phone,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({ data: { userId: user.id, roleId: roleMap[s.role] } });
    const emp = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode: `EMP-${s.role.substring(0, 3)}-001`,
        firstName: s.name.split(' ')[0],
        lastName: s.name.split(' ').slice(1).join(' '),
        trade: s.trade,
        mobileNumber: s.phone,
        status: 'ACTIVE',
      },
    });
    staffUserMap[s.role] = { user, employee: emp };
  }

  // 2. 12 Certified Field Technicians (4 Electrical, 4 Plumbing, 4 AC)
  const techData = [
    // Electrical
    { code: 'TECH-ELE-01', first: 'Rashid', last: 'Al-Nuaimi', email: 'tech.rashid@fieldops.ae', phone: '+971 52 101 0001', trade: 'ELECTRICIAN', rate: 105.0, cost: 45.0 },
    { code: 'TECH-ELE-02', first: 'Vikram', last: 'Patel', email: 'tech.vikram@fieldops.ae', phone: '+971 52 101 0002', trade: 'ELECTRICIAN', rate: 95.0, cost: 40.0 },
    { code: 'TECH-ELE-03', first: 'Rajesh', last: 'Kumar', email: 'tech.rajesh@fieldops.ae', phone: '+971 52 101 0003', trade: 'ELECTRICIAN', rate: 90.0, cost: 38.0 },
    { code: 'TECH-ELE-04', first: 'Ahmed', last: 'Mustafa', email: 'tech.ahmed@fieldops.ae', phone: '+971 52 101 0004', trade: 'ELECTRICIAN', rate: 90.0, cost: 38.0 },
    // Plumbing
    { code: 'TECH-PLU-01', first: 'Hasan', last: 'Al-Banna', email: 'tech.hasan@fieldops.ae', phone: '+971 52 201 0001', trade: 'PLUMBER', rate: 100.0, cost: 42.0 },
    { code: 'TECH-PLU-02', first: 'Suresh', last: 'Nair', email: 'tech.suresh@fieldops.ae', phone: '+971 52 201 0002', trade: 'PLUMBER', rate: 90.0, cost: 38.0 },
    { code: 'TECH-PLU-03', first: 'Mahmoud', last: 'Khalil', email: 'tech.mahmoud@fieldops.ae', phone: '+971 52 201 0003', trade: 'PLUMBER', rate: 90.0, cost: 38.0 },
    { code: 'TECH-PLU-04', first: 'Zaid', last: 'Farhan', email: 'tech.zaid@fieldops.ae', phone: '+971 52 201 0004', trade: 'PLUMBER', rate: 85.0, cost: 36.0 },
    // AC / HVAC
    { code: 'TECH-HVAC-01', first: 'Farhan', last: 'Siddiqui', email: 'tech.farhan@fieldops.ae', phone: '+971 52 301 0001', trade: 'HVAC_TECH', rate: 110.0, cost: 48.0 },
    { code: 'TECH-HVAC-02', first: 'Amit', last: 'Sharma', email: 'tech.amit@fieldops.ae', phone: '+971 52 301 0002', trade: 'HVAC_TECH', rate: 100.0, cost: 44.0 },
    { code: 'TECH-HVAC-03', first: 'Khaled', last: 'Othman', email: 'tech.khaled@fieldops.ae', phone: '+971 52 301 0003', trade: 'HVAC_TECH', rate: 95.0, cost: 42.0 },
    { code: 'TECH-HVAC-04', first: 'Rohan', last: 'Deshmukh', email: 'tech.rohan@fieldops.ae', phone: '+971 52 301 0004', trade: 'HVAC_TECH', rate: 90.0, cost: 40.0 },
  ];

  const technicianEmployees: any[] = [];
  for (const t of techData) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        passwordHash: defaultPasswordHash,
        fullName: `${t.first} ${t.last}`,
        phone: t.phone,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({ data: { userId: user.id, roleId: roleMap['TECHNICIAN'] } });
    const emp = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode: t.code,
        firstName: t.first,
        lastName: t.last,
        trade: t.trade,
        mobileNumber: t.phone,
        hourlyBillingRate: t.rate,
        hourlyCostRate: t.cost,
        status: 'ACTIVE',
      },
    });
    technicianEmployees.push(emp);
  }

  // 3. 8 General Helpers
  const helperNames = [
    { first: 'Ali', last: 'Hassan' }, { first: 'Noor', last: 'Mohammed' },
    { first: 'Ramesh', last: 'Babu' }, { first: 'Deepak', last: 'Verma' },
    { first: 'Imran', last: 'Khan' }, { first: 'Sunita', last: 'Rao' },
    { first: 'Mohan', last: 'Lal' }, { first: 'Abdul', last: 'Rehman' },
  ];

  const helperEmployees: any[] = [];
  for (let i = 0; i < helperNames.length; i++) {
    const h = helperNames[i];
    const phone = `+971 55 101 ${1000 + i}`;
    const user = await prisma.user.create({
      data: {
        email: `helper.${h.first.toLowerCase()}@fieldops.ae`,
        passwordHash: defaultPasswordHash,
        fullName: `${h.first} ${h.last}`,
        phone,
        isActive: true,
      },
    });
    await prisma.userRoleAssignment.create({ data: { userId: user.id, roleId: roleMap['HELPER'] } });
    const emp = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode: `HLP-0${i + 1}`,
        firstName: h.first,
        lastName: h.last,
        trade: 'GENERAL_HELPER',
        mobileNumber: phone,
        hourlyBillingRate: 45.0,
        hourlyCostRate: 22.0,
        status: 'ACTIVE',
      },
    });
    helperEmployees.push(emp);
  }

  // 4. 30 Construction Manpower / Labour-Supply Workers
  const manpowerTrades = ['ELECTRICIAN', 'PLUMBER', 'GENERAL_HELPER', 'HVAC_TECH'];
  const manpowerWorkers: any[] = [];
  for (let i = 1; i <= 30; i++) {
    const trade = manpowerTrades[i % manpowerTrades.length];
    const emp = await prisma.employee.create({
      data: {
        employeeCode: `LAB-${i.toString().padStart(3, '0')}`,
        firstName: `Worker${i}`,
        lastName: `Al-Maktoum-Proj`,
        trade,
        mobileNumber: `+971 58 300 ${2000 + i}`,
        hourlyBillingRate: trade === 'GENERAL_HELPER' ? 38.0 : 65.0,
        hourlyCostRate: trade === 'GENERAL_HELPER' ? 18.0 : 30.0,
        status: 'ACTIVE',
      },
    });
    manpowerWorkers.push(emp);
  }

  // -----------------------------------------------------------------------
  // STEP 2: Service Catalog
  // -----------------------------------------------------------------------
  console.log('Step 2: Seeding Service Catalog...');
  const catHvac = await prisma.serviceCategory.create({ data: { code: 'CAT_HVAC', name: 'Air Conditioning & HVAC Services' } });
  const catEle = await prisma.serviceCategory.create({ data: { code: 'CAT_ELE', name: 'Electrical Maintenance & Rewiring' } });
  const catPlu = await prisma.serviceCategory.create({ data: { code: 'CAT_PLU', name: 'Plumbing & Chilled Water Pipelines' } });

  const services = [
    { catId: catHvac.id, code: 'SRV-AC-DIAG', name: 'AC Comprehensive Diagnostics & Inspection', rate: 180.0, duration: 60 },
    { catId: catHvac.id, code: 'SRV-AC-GAS', name: 'AC Refrigerant R410A Gas Top-up & Leak Check', rate: 260.0, duration: 90 },
    { catId: catHvac.id, code: 'SRV-AC-CAP', name: 'AC Dual Run Capacitor Replacement', rate: 195.0, duration: 45 },
    { catId: catHvac.id, code: 'SRV-AC-COIL', name: 'Condenser Coil Chemical Pressure Wash', rate: 320.0, duration: 120 },
    { catId: catEle.id, code: 'SRV-ELE-TRIP', name: 'Circuit Breaker Tripping Diagnostics & Rectification', rate: 210.0, duration: 60 },
    { catId: catEle.id, code: 'SRV-ELE-PANEL', name: 'Distribution Board (DB) Panel Wiring Overhaul', rate: 450.0, duration: 180 },
    { catId: catEle.id, code: 'SRV-ELE-LIGHT', name: 'Emergency LED Lighting Installation', rate: 150.0, duration: 45 },
    { catId: catPlu.id, code: 'SRV-PLU-LEAK', name: 'Chilled Water & Domestic Pipe Leak Repair', rate: 240.0, duration: 90 },
    { catId: catPlu.id, code: 'SRV-PLU-PUMP', name: 'Booster Water Pump Pressure Switch Calibration', rate: 280.0, duration: 75 },
    { catId: catPlu.id, code: 'SRV-PLU-HEATER', name: 'Central Water Heater Element & Thermostat Replacement', rate: 290.0, duration: 90 },
  ];

  const serviceRecords: any[] = [];
  for (const s of services) {
    const srv = await prisma.service.create({
      data: { categoryId: s.catId, code: s.code, name: s.name, basePrice: s.rate, defaultDurationMinutes: s.duration },
    });
    serviceRecords.push(srv);
  }

  // -----------------------------------------------------------------------
  // STEP 3: 200 Inventory Items, 2 Warehouses & 12 Mobile Vans
  // -----------------------------------------------------------------------
  console.log('Step 3: Seeding 200 Inventory Items, 2 Warehouses, and 12 Mobile Vans...');
  const whDubai = await prisma.warehouse.create({
    data: { code: 'WH-DXB-01', name: 'Central Warehouse Al Quoz', address: 'Al Quoz Ind 3, Dubai', type: 'CENTRAL_WAREHOUSE' },
  });
  const whAbuDhabi = await prisma.warehouse.create({
    data: { code: 'WH-AUH-01', name: 'Central Regional Store Musaffah', address: 'Sector M-34, Musaffah, Abu Dhabi', type: 'CENTRAL_WAREHOUSE' },
  });

  // Create 12 mobile vans linked to the 12 technicians
  const vanWarehouses: any[] = [];
  for (let i = 0; i < technicianEmployees.length; i++) {
    const tech = technicianEmployees[i];
    const van = await prisma.warehouse.create({
      data: {
        code: `VAN-${(i + 1).toString().padStart(2, '0')}`,
        name: `Service Van ${i + 1} (${tech.firstName} ${tech.lastName})`,
        type: 'TECHNICIAN_VAN',
        assignedEmployeeId: tech.id,
      },
    });
    vanWarehouses.push(van);
  }

  // 200 Catalog items
  const itemRecords: any[] = [];
  const itemCategories = ['ELECTRICAL', 'PLUMBING', 'HVAC', 'CONSUMABLES'];

  for (let i = 1; i <= 200; i++) {
    let name = '';
    let category = itemCategories[i % 4];
    let cost = 15.0;
    let selling = 35.0;

    if (category === 'HVAC') {
      if (i % 5 === 0) { name = `R410A Refrigerant Cylinder 11.3kg (Lot #${i})`; cost = 160.0; selling = 320.0; }
      else if (i % 5 === 1) { name = `Dual Run Capacitor ${30 + (i % 5) * 10}+5 uF 450VAC (#${i})`; cost = 25.0; selling = 65.0; }
      else if (i % 5 === 2) { name = `Copper Tubing Coil 1/2" 15m Pancake (#${i})`; cost = 120.0; selling = 240.0; }
      else if (i % 5 === 3) { name = `HVAC 2-Pole Contactor 30A Schneider (#${i})`; cost = 45.0; selling = 110.0; }
      else { name = `AC Filter Drier 3/8" Flare (#${i})`; cost = 30.0; selling = 75.0; }
    } else if (category === 'ELECTRICAL') {
      if (i % 4 === 0) { name = `Schneider Single Pole MCB ${10 + (i % 4) * 10}A (#${i})`; cost = 18.0; selling = 45.0; }
      else if (i % 4 === 1) { name = `Ducab Single Core 2.5mm Copper Cable 100m Roll (#${i})`; cost = 140.0; selling = 280.0; }
      else if (i % 4 === 2) { name = `LED Panel Light 60x60 40W 6000K (#${i})`; cost = 42.0; selling = 95.0; }
      else { name = `Main Isolator 63A 4-Pole IP65 Weatherproof (#${i})`; cost = 75.0; selling = 175.0; }
    } else if (category === 'PLUMBING') {
      if (i % 4 === 0) { name = `PPR Pipe 32mm PN20 High-Pressure 4m (#${i})`; cost = 22.0; selling = 52.0; }
      else if (i % 4 === 1) { name = `Brass Gate Valve 1" Heavy Duty UAE Spec (#${i})`; cost = 38.0; selling = 85.0; }
      else if (i % 4 === 2) { name = `Ariston Central Water Heater Heating Element 3000W (#${i})`; cost = 65.0; selling = 150.0; }
      else { name = `Flexible Stainless Steel Braided Hose 1/2" 60cm (#${i})`; cost = 14.0; selling = 35.0; }
    } else {
      name = `Consumable Hardware Kit & Fasteners Pack (#${i})`;
      cost = 12.0;
      selling = 28.0;
    }

    const item = await prisma.item.create({
      data: {
        itemCode: `ITM-${i.toString().padStart(4, '0')}`,
        name,
        type: category,
        unitOfMeasure: i % 5 === 0 ? 'CYLINDER' : i % 4 === 1 ? 'ROLL' : 'PIECE',
        costPrice: cost,
        sellingPrice: selling,
      },
    });
    itemRecords.push(item);

    // Stock in Central Warehouse Al Quoz
    const qtyAlQuoz = rng.range(25, 120);
    // Intentionally set items 1 to 6 to very low stock to trigger low-stock alerts
    const availableQty = i <= 6 ? 3 : qtyAlQuoz;
    await prisma.stockLevel.create({
      data: {
        itemId: item.id,
        warehouseId: whDubai.id,
        quantityOnHand: availableQty,
        quantityReserved: 0,
        quantityAvailable: availableQty,
        reorderLevel: 10,
        reorderQuantity: 50,
      },
    });

    // Stock in Musaffah Abu Dhabi
    await prisma.stockLevel.create({
      data: {
        itemId: item.id,
        warehouseId: whAbuDhabi.id,
        quantityOnHand: rng.range(15, 60),
        quantityReserved: 0,
        quantityAvailable: rng.range(15, 60),
        reorderLevel: 8,
        reorderQuantity: 30,
      },
    });

    // Seed stock into 3 technician vans
    for (let v = 0; v < 3; v++) {
      const van = vanWarehouses[v];
      await prisma.stockLevel.create({
        data: {
          itemId: item.id,
          warehouseId: van.id,
          quantityOnHand: rng.range(2, 8),
          quantityReserved: 0,
          quantityAvailable: rng.range(2, 8),
          reorderLevel: 2,
          reorderQuantity: 5,
        },
      });
    }
  }

  // -----------------------------------------------------------------------
  // STEP 4: 60 Customers (Villas, Commercial, 5 Construction Giants) & Sites
  // -----------------------------------------------------------------------
  console.log('Step 4: Seeding 60 Customers, Sites across DXB/SHJ/AUH, and 150 Assets...');

  // 5 Major Construction Companies
  const constructionCompanies = [
    { name: 'Sobha Constructions LLC', nameAr: 'شوبا للمقاولات ذ.م.م', trn: '100234567800003', emirate: 'Dubai', area: 'Nad Al Sheba 1', lat: 25.1782, lng: 55.3210 },
    { name: 'Emaar Contracting LLC', nameAr: 'إعمار للمقاولات ذ.م.م', trn: '100345678900003', emirate: 'Dubai', area: 'Downtown Dubai', lat: 25.1972, lng: 55.2744 },
    { name: 'Arabtec Construction PJSC', nameAr: 'أرابتك للإنشاءات ش.م.ع', trn: '100456789000003', emirate: 'Dubai', area: 'Business Bay', lat: 25.1856, lng: 55.2708 },
    { name: 'Trojan General Contracting LLC', nameAr: 'طروادة للمقاولات العامة ذ.م.م', trn: '100567890100003', emirate: 'Abu Dhabi', area: 'Al Reem Island', lat: 24.4988, lng: 54.4072 },
    { name: 'Shapoorji Pallonji Mideast LLC', nameAr: 'شابورجي بالونجي الشرق الأوسط', trn: '100678901200003', emirate: 'Sharjah', area: 'Al Majaz 3', lat: 25.3255, lng: 55.3820 },
  ];

  const allCustomers: any[] = [];
  const allCustomerSites: any[] = [];

  // Seed Construction Clients
  for (let i = 0; i < constructionCompanies.length; i++) {
    const c = constructionCompanies[i];
    const customer = await prisma.customer.create({
      data: {
        customerType: 'COMPANY',
        name: c.name,
        nameAr: c.nameAr,
        trn: c.trn,
        email: `procurement@${c.name.split(' ')[0].toLowerCase()}.ae`,
        phone: `+971 4 ${300 + i} 0000`,
        creditLimit: 500000.0,
        paymentTermsDays: 60,
      },
    });
    allCustomers.push(customer);

    const site = await prisma.customerSite.create({
      data: {
        customerId: customer.id,
        siteName: `${c.name} - Main Project Site`,
        address: `${c.area}, ${c.emirate}, UAE`,
        emirate: c.emirate,
        area: c.area,
        latitude: c.lat,
        longitude: c.lng,
      },
    });
    allCustomerSites.push(site);
  }

  // 20 Commercial Clients (Clinics, Restaurants, Retail, Offices)
  const commercialAreas = [
    { emirate: 'Dubai', area: 'DIFC', lat: 25.2120, lng: 55.2810 },
    { emirate: 'Dubai', area: 'Dubai Marina', lat: 25.0805, lng: 55.1403 },
    { emirate: 'Dubai', area: 'Jumeirah Beach Residence', lat: 25.0760, lng: 55.1320 },
    { emirate: 'Dubai', area: 'Business Bay', lat: 25.1860, lng: 55.2715 },
    { emirate: 'Dubai', area: 'Al Quoz Ind 4', lat: 25.1320, lng: 55.2340 },
    { emirate: 'Sharjah', area: 'Al Majaz', lat: 25.3280, lng: 55.3850 },
    { emirate: 'Sharjah', area: 'Al Nahda', lat: 25.3050, lng: 55.3720 },
    { emirate: 'Abu Dhabi', area: 'Al Maryah Island', lat: 24.5020, lng: 54.3880 },
    { emirate: 'Abu Dhabi', area: 'Corniche Road', lat: 24.4750, lng: 54.3450 },
  ];

  for (let i = 1; i <= 20; i++) {
    const loc = commercialAreas[i % commercialAreas.length];
    const customer = await prisma.customer.create({
      data: {
        customerType: 'COMPANY',
        name: `Emirates Commercial Hub #${i} LLC`,
        trn: `100482910${(1000 + i).toString()}`,
        email: `admin@commercialhub${i}.ae`,
        phone: `+971 4 450 ${1000 + i}`,
        creditLimit: 100000.0,
        paymentTermsDays: 30,
      },
    });
    allCustomers.push(customer);

    const site = await prisma.customerSite.create({
      data: {
        customerId: customer.id,
        siteName: `Commercial Branch Office ${i}`,
        address: `Suite ${100 + i}, ${loc.area}, ${loc.emirate}`,
        emirate: loc.emirate,
        area: loc.area,
        latitude: loc.lat + rng.float(-0.01, 0.01, 4),
        longitude: loc.lng + rng.float(-0.01, 0.01, 4),
      },
    });
    allCustomerSites.push(site);
  }

  // 35 Residential Property Clients (Villas & Apartments)
  const residentialAreas = [
    { emirate: 'Dubai', area: 'Palm Jumeirah', lat: 25.1124, lng: 55.1390 },
    { emirate: 'Dubai', area: 'Arabian Ranches 2', lat: 25.0450, lng: 55.2630 },
    { emirate: 'Dubai', area: 'Emirates Hills', lat: 25.0680, lng: 55.1720 },
    { emirate: 'Dubai', area: 'Jumeirah 3', lat: 25.1630, lng: 55.2150 },
    { emirate: 'Dubai', area: 'Mirdif', lat: 25.2180, lng: 55.4210 },
    { emirate: 'Sharjah', area: 'Muwailih Commercial', lat: 25.3120, lng: 55.4520 },
    { emirate: 'Sharjah', area: 'Al Khan', lat: 25.3340, lng: 55.3620 },
    { emirate: 'Abu Dhabi', area: 'Yas Island', lat: 24.4920, lng: 54.6050 },
    { emirate: 'Abu Dhabi', area: 'Saadiyat Beach Villas', lat: 24.5380, lng: 54.4320 },
    { emirate: 'Abu Dhabi', area: 'Khalifa City A', lat: 24.4280, lng: 54.5820 },
  ];

  // Make customer 1 the demo login customer
  let demoCustomerUserCreated = false;
  for (let i = 1; i <= 35; i++) {
    const loc = residentialAreas[i % residentialAreas.length];
    const customer = await prisma.customer.create({
      data: {
        customerType: 'INDIVIDUAL',
        name: i === 1 ? 'Eng. Khalid Al-Mansoor' : `Property Owner ${i} (Villa #${i})`,
        email: i === 1 ? 'customer@almasar.ae' : `resident${i}@dubaimail.ae`,
        phone: `+971 50 900 ${3000 + i}`,
        creditLimit: 25000.0,
        paymentTermsDays: 15,
      },
    });
    allCustomers.push(customer);

    if (i === 1 && !demoCustomerUserCreated) {
      const user = await prisma.user.create({
        data: {
          email: 'customer@almasar.ae',
          passwordHash: defaultPasswordHash,
          fullName: 'Eng. Khalid Al-Mansoor',
          phone: '+971 50 900 3001',
          isActive: true,
        },
      });
      await prisma.userRoleAssignment.create({ data: { userId: user.id, roleId: roleMap['CUSTOMER'] } });
      demoCustomerUserCreated = true;
    }

    const site = await prisma.customerSite.create({
      data: {
        customerId: customer.id,
        siteName: i === 1 ? 'Luxury Palm Frond Villa 24' : `Luxury Villa ${i}`,
        address: `Villa ${i}, Street 14, ${loc.area}, ${loc.emirate}`,
        emirate: loc.emirate,
        area: loc.area,
        latitude: loc.lat + rng.float(-0.015, 0.015, 4),
        longitude: loc.lng + rng.float(-0.015, 0.015, 4),
      },
    });
    allCustomerSites.push(site);
  }

  // 150 Customer Assets across sites
  console.log('Seeding 150 Customer Assets (HVAC, Water Pumps, Water Heaters, DB Panels)...');
  const assetTypes = ['AC_SPLIT', 'AC_PACKAGE', 'CHILLER', 'WATER_HEATER', 'DB_PANEL', 'PUMP'];
  const brands = ['O General', 'Daikin', 'Carrier', 'Grundfos', 'Schneider Electric', 'Ariston', 'Trane'];

  const allAssets: any[] = [];
  for (let i = 1; i <= 150; i++) {
    const site = allCustomerSites[i % allCustomerSites.length];
    const assetType = assetTypes[i % assetTypes.length];
    const brand = brands[i % brands.length];

    const asset = await prisma.customerAsset.create({
      data: {
        customerId: site.customerId,
        siteId: site.id,
        assetType,
        brand,
        modelNumber: `${brand.substring(0, 3).toUpperCase()}-${2020 + (i % 5)}-X${i}`,
        serialNumber: `SN-${brand.substring(0, 2).toUpperCase()}-2024-${i.toString().padStart(4, '0')}`,
        installationDate: new Date('2024-01-15'),
        warrantyExpiryDate: new Date('2027-01-15'),
        currentCondition: i % 15 === 0 ? 'POOR' : i % 5 === 0 ? 'FAIR' : 'EXCELLENT',
        qrCode: `QR-ASSET-${i.toString().padStart(4, '0')}`,
      },
    });
    allAssets.push(asset);
  }

  // 25 Annual Maintenance Contracts (AMC)
  console.log('Seeding 25 AMC Maintenance Contracts with Scheduled Visits...');
  const amcContracts: any[] = [];
  for (let i = 1; i <= 25; i++) {
    const site = allCustomerSites[i % allCustomerSites.length];
    const totalAmount = rng.float(4500, 16000, 2);

    const contract = await prisma.maintenanceContract.create({
      data: {
        contractNumber: `AMC-2026-${i.toString().padStart(3, '0')}`,
        customerId: site.customerId,
        siteId: site.id,
        title: `Comprehensive Annual HVAC & MEP Maintenance Plan (#${i})`,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        totalAmount,
        visitsPerYear: 4,
        status: 'ACTIVE',
      },
    });
    amcContracts.push(contract);

    // 4 Quarterly visits
    const visitDates = ['2026-02-15', '2026-05-15', '2026-08-15', '2026-11-15'];
    for (let v = 0; v < 4; v++) {
      const scheduledDate = new Date(visitDates[v]);
      const isPast = scheduledDate < NOW;
      await prisma.contractVisitSchedule.create({
        data: {
          contractId: contract.id,
          visitNumber: v + 1,
          scheduledDate,
          completedDate: isPast ? new Date(scheduledDate.getTime() + 2 * 3600 * 1000) : null,
          status: isPast ? 'COMPLETED' : 'SCHEDULED',
        },
      });
    }
  }

  // -----------------------------------------------------------------------
  // STEP 5: 40 Rental Equipment Units (~65% Utilization Rate)
  // -----------------------------------------------------------------------
  console.log('Step 5: Seeding 40 Rental Equipment Units & Active Contracts...');
  const equipmentCatalog = [
    { name: 'Caterpillar 320D Hydraulic Excavator', cat: 'EARTHMOVING', daily: 1800.0, count: 4 },
    { name: 'Bobcat S450 Skid Steer Loader', cat: 'EARTHMOVING', daily: 750.0, count: 4 },
    { name: 'Cummins 100kVA Soundproof Diesel Generator', cat: 'POWER_GENERATION', daily: 550.0, count: 6 },
    { name: 'Perkins 60kVA Mobile Diesel Generator', cat: 'POWER_GENERATION', daily: 420.0, count: 6 },
    { name: 'Genie GS-1930 Electric Scissor Lift (7.8m)', cat: 'ACCESS_PLATFORMS', daily: 250.0, count: 6 },
    { name: 'JLG 450AJ Articulated Boom Lift (16m)', cat: 'ACCESS_PLATFORMS', daily: 850.0, count: 4 },
    { name: 'Mobile Aluminum Scaffolding Tower (Double Width 8m)', cat: 'SCAFFOLDING', daily: 180.0, count: 6 },
    { name: 'Winget 400L Diesel Concrete Mixer', cat: 'CONCRETE_EQUIPMENT', daily: 140.0, count: 2 },
    { name: 'Kemppi MasterTig Industrial Welding Inverter', cat: 'WELDING_MACHINES', daily: 120.0, count: 2 },
  ];

  const allEquipment: any[] = [];
  let equipIndex = 1;
  for (const item of equipmentCatalog) {
    for (let c = 0; c < item.count; c++) {
      const eq = await prisma.rentalEquipment.create({
        data: {
          assetCode: `EQ-${equipIndex.toString().padStart(3, '0')}`,
          name: `${item.name} (#${c + 1})`,
          category: item.cat,
          serialNumber: `SN-EQ-${2024}-${equipIndex.toString().padStart(4, '0')}`,
          dailyRate: item.daily,
          weeklyRate: item.daily * 5.5,
          monthlyRate: item.daily * 20.0,
          status: 'AVAILABLE',
          currentLocation: 'Al Quoz Central Equipment Depot',
        },
      });
      allEquipment.push(eq);
      equipIndex++;
    }
  }

  // Create rental contracts across the 6-month timeline to achieve ~65-72% fleet utilization
  console.log('Seeding Rental Contracts across construction contractors...');
  for (let i = 0; i < 28; i++) {
    const eq = allEquipment[i];
    const customer = allCustomers[i % 5]; // Construction clients
    const startOffsetDays = rng.range(-150, -10);
    const durationDays = rng.range(25, 90);
    const startDate = addDays(NOW, startOffsetDays);
    const expectedEndDate = addDays(startDate, durationDays);
    const isActive = expectedEndDate > NOW;
    const monthlyRate = Number(eq.monthlyRate);
    const subtotal = Number(((monthlyRate / 30) * durationDays).toFixed(2));
    const vatAmount = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + vatAmount).toFixed(2));

    const contract = await prisma.rentalContract.create({
      data: {
        contractNumber: `RC-2026-${(i + 1).toString().padStart(3, '0')}`,
        customerId: customer.id,
        projectName: `${customer.name} - Package Stage ${(i % 3) + 1}`,
        siteLocation: `${customer.name} Site Location`,
        startDate,
        expectedEndDate,
        actualEndDate: isActive ? null : expectedEndDate,
        rateBasis: 'MONTHLY',
        depositAmount: 5000.0,
        subtotal,
        vatAmount,
        totalAmount,
        status: isActive ? 'ACTIVE' : 'COMPLETED',
      },
    });

    await prisma.rentalContractLine.create({
      data: {
        rentalContractId: contract.id,
        equipmentId: eq.id,
        appliedRate: monthlyRate,
        rateBasis: 'MONTHLY',
        quantity: 1,
        subtotal,
        vatRate: 0.05,
        vatAmount,
        totalAmount,
      },
    });

    // Update equipment status if currently rented
    if (isActive) {
      await prisma.rentalEquipment.update({
        where: { id: eq.id },
        data: { status: 'ON_HIRE', currentLocation: contract.projectName },
      });
    }

    // Dispatch log
    await prisma.rentalDispatchReturn.create({
      data: {
        rentalContractId: contract.id,
        equipmentId: eq.id,
        actionType: 'DISPATCH',
        actionDate: startDate,
        hoursMeterReading: Number(eq.currentHoursMeter) - durationDays * 6,
        fuelLevel: '100%',
        conditionNotes: 'Dispatched after full servicing and calibration.',
      },
    });

    if (!isActive) {
      await prisma.rentalDispatchReturn.create({
        data: {
          rentalContractId: contract.id,
          equipmentId: eq.id,
          actionType: 'RETURN',
          actionDate: expectedEndDate,
          hoursMeterReading: Number(eq.currentHoursMeter),
          fuelLevel: '85%',
          conditionNotes: 'Returned in clean condition, off-hire inspection cleared.',
        },
      });
    }
  }

  // -----------------------------------------------------------------------
  // STEP 6: 4 Construction Manpower Deployments & Daily Timesheets
  // -----------------------------------------------------------------------
  console.log('Step 6: Seeding 4 Construction Site Manpower Deployments & 6 Months of Daily Timesheets...');
  const manpowerSites = [
    { client: 'Sobha Constructions LLC', project: 'Sobha Hartland Phase 3 High-Rise MEP Package', loc: 'Sobha Hartland, Nad Al Sheba 1, Dubai' },
    { client: 'Emaar Contracting LLC', project: 'Emaar Creek Harbour Tower A Package', loc: 'Dubai Creek Harbour, Dubai' },
    { client: 'Trojan General Contracting LLC', project: 'Trojan Reem Hills Residential Phase 1', loc: 'Al Reem Island, Abu Dhabi' },
    { client: 'Shapoorji Pallonji Mideast LLC', project: 'Al Jada Commercial Complex Package', loc: 'Al Jada, Muwailih, Sharjah' },
  ];

  const deployments: any[] = [];
  for (let i = 0; i < 4; i++) {
    const s = manpowerSites[i];
    const dep = await prisma.labourSupplyDeployment.create({
      data: {
        requisitionNumber: `DEP-2026-${(i + 1).toString().padStart(3, '0')}`,
        clientName: s.client,
        projectName: s.project,
        siteLocation: s.loc,
        startDate: SIX_MONTHS_AGO,
        endDate: addDays(NOW, 60),
        billingType: 'DAILY',
        status: 'ACTIVE',
      },
    });
    deployments.push(dep);
  }

  // Seed daily timesheets for the 30 workers across 12 representative milestone days over the 6 months
  console.log('Generating timesheet logs for 30 workers across construction sites...');
  const milestoneOffsets = [150, 135, 120, 105, 90, 75, 60, 45, 30, 15, 5, 1];
  for (let w = 0; w < manpowerWorkers.length; w++) {
    const worker = manpowerWorkers[w];
    const deployment = deployments[w % deployments.length];

    for (const offset of milestoneOffsets) {
      const workDate = addDays(NOW, -offset);
      const reg = 8.0;
      const ot = w % 3 === 0 ? 2.0 : w % 2 === 0 ? 1.0 : 0.0;
      await prisma.labourDailyTimesheet.create({
        data: {
          deploymentId: deployment.id,
          employeeId: worker.id,
          workDate,
          regularHours: reg,
          overtimeHours: ot,
          totalHours: reg + ot,
          siteSupervisorSignature: 'Eng. Tareq Al-Hammadi',
          isBilled: offset > 30, // Past timesheets billed
        },
      });
    }
  }

  // -----------------------------------------------------------------------
  // STEP 7: 400 Work Orders over 6 Months (with Parts, Labour, Signoffs, Losses)
  // -----------------------------------------------------------------------
  console.log('Step 7: Seeding 400 Work Orders across all statuses over 6 months...');

  // Realistic status distribution:
  // 280 COMPLETED, 40 INVOICED, 30 CLOSED, 15 IN_PROGRESS, 10 ON_SITE, 10 EN_ROUTE, 10 ASSIGNED, 5 NEW
  const statusesList: string[] = [];
  for (let i = 0; i < 280; i++) statusesList.push('COMPLETED');
  for (let i = 0; i < 40; i++) statusesList.push('INVOICED');
  for (let i = 0; i < 30; i++) statusesList.push('CLOSED');
  for (let i = 0; i < 15; i++) statusesList.push('IN_PROGRESS');
  for (let i = 0; i < 10; i++) statusesList.push('ON_SITE');
  for (let i = 0; i < 10; i++) statusesList.push('EN_ROUTE');
  for (let i = 0; i < 10; i++) statusesList.push('ASSIGNED');
  for (let i = 0; i < 5; i++) statusesList.push('NEW');

  // Track loss-making job IDs for verification
  const lossMakingWorkOrders: any[] = [];
  const createdWorkOrders: any[] = [];

  for (let i = 1; i <= 400; i++) {
    const status = statusesList[i - 1];
    const customer = allCustomers[i % allCustomers.length];
    const site = allCustomerSites[i % allCustomerSites.length];
    const asset = allAssets[i % allAssets.length];
    const leadTech = technicianEmployees[i % technicianEmployees.length];
    const helper = helperEmployees[i % helperEmployees.length];
    const srv = serviceRecords[i % serviceRecords.length];

    // Timestamp distributed over 180 days (older jobs first)
    const dayOffset = Math.floor(180 - (i / 400) * 180);
    const createdAt = addDays(NOW, -dayOffset);

    // Intentional loss-making jobs: Jobs 89, 142, and 218
    const isLossMaker = i === 89 || i === 142 || i === 218;

    let subtotal = 0;
    let title = '';
    let description = '';

    if (isLossMaker) {
      if (i === 89) {
        title = 'HVAC Compressor Seizure - Underquoted Fixed Contract';
        description = 'Customer negotiated fixed quotation of AED 450. On site, found complete dual compressor burnout requiring 2 full gas recharges and 8 overtime hours.';
        subtotal = 450.0;
      } else if (i === 142) {
        title = 'Underground Chilled Water Line Burst Flange Emergency';
        description = 'Initial diagnostic quoted AED 320. Excavation revealed cracked cast-iron flange requiring heavy duty replacement parts and 6 technicians hours.';
        subtotal = 320.0;
      } else {
        title = 'Commercial Kitchen Panel Short Circuit Overhaul';
        description = 'Quoted basic MCB swap at AED 380. Internal busbar corrosion forced complete sub-DB rewiring and replacement of 12 contactors.';
        subtotal = 380.0;
      }
    } else {
      title = `${srv.name} at ${site.siteName}`;
      description = `Scheduled MEP maintenance and diagnostic repair for ${asset.assetType} (${asset.brand}). Operational integrity verified.`;
      subtotal = Number(srv.basePrice) + rng.range(1, 3) * 65.0;
    }

    const vatAmount = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + vatAmount).toFixed(2));

    const wo = await prisma.workOrder.create({
      data: {
        orderNumber: `WO-2025-${i.toString().padStart(4, '0')}`,
        customerId: customer.id,
        siteId: site.id,
        assetId: asset.id,
        serviceType: leadTech.trade === 'HVAC_TECH' ? 'HVAC' : leadTech.trade === 'PLUMBER' ? 'PLUMBING' : 'ELECTRICAL',
        title,
        description,
        priority: i % 10 === 0 ? 'CRITICAL' : i % 4 === 0 ? 'HIGH' : 'MEDIUM',
        status,
        address: site.address,
        latitude: site.latitude,
        longitude: site.longitude,
        subtotal,
        vatAmount,
        totalAmount,
        createdAt,
        actualStart: ['COMPLETED', 'INVOICED', 'CLOSED', 'IN_PROGRESS', 'ON_SITE'].includes(status) ? createdAt : null,
        actualEnd: ['COMPLETED', 'INVOICED', 'CLOSED'].includes(status) ? addDays(createdAt, 0.1) : null,
      },
    });

    createdWorkOrders.push(wo);

    // 1. Assignment
    if (status !== 'NEW') {
      await prisma.workOrderAssignment.create({
        data: {
          workOrderId: wo.id,
          employeeId: leadTech.id,
          roleInJob: 'LEAD_TECHNICIAN',
          isInCharge: true,
          status: ['COMPLETED', 'INVOICED', 'CLOSED'].includes(status) ? 'COMPLETED' : 'ACTIVE',
          assignedAt: createdAt,
        },
      });

      if (i % 2 === 0) {
        await prisma.workOrderAssignment.create({
          data: {
            workOrderId: wo.id,
            employeeId: helper.id,
            roleInJob: 'ASSISTANT_HELPER',
            isInCharge: false,
            status: ['COMPLETED', 'INVOICED', 'CLOSED'].includes(status) ? 'COMPLETED' : 'ACTIVE',
            assignedAt: createdAt,
          },
        });
      }
    }

    // 2. Tasks
    await prisma.workOrderTask.createMany({
      data: [
        { workOrderId: wo.id, taskTitle: 'Isolate Power & Safety Grounding Check', sortOrder: 1, isCompleted: true },
        { workOrderId: wo.id, taskTitle: `Diagnose & Repair ${asset.assetType}`, sortOrder: 2, isCompleted: status !== 'NEW' && status !== 'ASSIGNED' },
        { workOrderId: wo.id, taskTitle: 'Operational Load & Temperature Test', sortOrder: 3, isCompleted: ['COMPLETED', 'INVOICED', 'CLOSED'].includes(status) },
      ],
    });

    // 3. Parts Consumed
    let totalPartsCost = 0;
    if (isLossMaker) {
      // Intentionally high part cost exceeding quotation revenue!
      const part1 = itemRecords[0]; // R410A gas
      const part2 = itemRecords[3]; // Contactor
      await prisma.workOrderPart.createMany({
        data: [
          { workOrderId: wo.id, itemId: part1.id, description: part1.name, quantity: 2, unitCost: 160.0, unitPrice: 200.0, totalPrice: 400.0, partAction: 'CONSUMED' },
          { workOrderId: wo.id, itemId: part2.id, description: part2.name, quantity: 3, unitCost: 120.0, unitPrice: 150.0, totalPrice: 450.0, partAction: 'FITTED_NEW' },
        ],
      });
      totalPartsCost = 2 * 160.0 + 3 * 120.0; // 680.0 AED
    } else if (['COMPLETED', 'INVOICED', 'CLOSED', 'IN_PROGRESS'].includes(status)) {
      const part = itemRecords[i % itemRecords.length];
      const qty = (i % 2) + 1;
      const cost = Number(part.costPrice);
      const price = Number(part.sellingPrice);
      await prisma.workOrderPart.create({
        data: {
          workOrderId: wo.id,
          itemId: part.id,
          description: part.name,
          quantity: qty,
          unitCost: cost,
          unitPrice: price,
          totalPrice: qty * price,
          partAction: 'FITTED_NEW',
        },
      });
      totalPartsCost = qty * cost;
    }

    // 4. Labour Logged
    let totalLabourCost = 0;
    if (isLossMaker) {
      // Excessive labour hours on loss-maker
      const hours = 8.0;
      const hourlyCost = Number(leadTech.hourlyCostRate);
      totalLabourCost = hours * hourlyCost; // 8 * 45 = 360 AED
      await prisma.workOrderLabour.create({
        data: {
          workOrderId: wo.id,
          employeeId: leadTech.id,
          hours,
          hourlyCostRate: hourlyCost,
          hourlyBillingRate: 80.0,
          totalCost: totalLabourCost,
          totalBilled: hours * 80.0,
        },
      });
    } else if (['COMPLETED', 'INVOICED', 'CLOSED'].includes(status)) {
      const hours = rng.float(1.5, 4.0, 1);
      const hourlyCost = Number(leadTech.hourlyCostRate);
      const hourlyBilled = Number(leadTech.hourlyBillingRate);
      totalLabourCost = hours * hourlyCost;
      await prisma.workOrderLabour.create({
        data: {
          workOrderId: wo.id,
          employeeId: leadTech.id,
          hours,
          hourlyCostRate: hourlyCost,
          hourlyBillingRate: hourlyBilled,
          totalCost: totalLabourCost,
          totalBilled: hours * hourlyBilled,
        },
      });
    }

    // 5. Expenses
    if (['COMPLETED', 'INVOICED', 'CLOSED'].includes(status)) {
      await prisma.workOrderExpense.create({
        data: {
          workOrderId: wo.id,
          expenseType: 'PARKING_TOLL',
          description: 'Salik Road Toll & Building RTA Parking Fee',
          amount: rng.float(12.0, 24.0, 2),
        },
      });
    }

    // 6. Before / After Photos & Customer Signoff
    if (['COMPLETED', 'INVOICED', 'CLOSED'].includes(status)) {
      await prisma.workOrderAttachment.createMany({
        data: [
          {
            workOrderId: wo.id,
            attachmentType: 'BEFORE_PHOTO',
            fileId: `appwrite-file-before-${i}`,
            fileName: `wo_${i}_before.jpg`,
            fileUrl: BEFORE_PHOTOS[i % BEFORE_PHOTOS.length],
            fileSizeBytes: 245000,
            mimeType: 'image/jpeg',
            caption: 'Initial fault inspection before replacement',
          },
          {
            workOrderId: wo.id,
            attachmentType: 'AFTER_PHOTO',
            fileId: `appwrite-file-after-${i}`,
            fileName: `wo_${i}_after.jpg`,
            fileUrl: AFTER_PHOTOS[i % AFTER_PHOTOS.length],
            fileSizeBytes: 275000,
            mimeType: 'image/jpeg',
            caption: 'Restored to manufacturer specification and load tested',
          },
        ],
      });

      await prisma.customerSignoff.create({
        data: {
          workOrderId: wo.id,
          customerId: customer.id,
          signedByName: customer.name.split(' ')[0],
          signatureUrl: 'https://placehold.co/400x120/png?text=Customer+Verified+Signature',
          rating: isLossMaker ? 3 : rng.range(4, 5),
          feedbackComments: isLossMaker
            ? 'Job took much longer than estimated due to unseen breakdown, but technician solved it.'
            : i % 2 === 0
            ? 'Excellent service! Very professional technician and clean handover.'
            : 'خدمة ممتازة وسريعة، الفنيين محترفين جداً وشكراً لفريق العمل.',
          signedAt: addDays(createdAt, 0.1),
        },
      });
    }

    if (isLossMaker) {
      lossMakingWorkOrders.push({
        orderNumber: wo.orderNumber,
        subtotal,
        totalPartsCost,
        totalLabourCost,
        margin: subtotal - (totalPartsCost + totalLabourCost),
      });
    }
  }

  // -----------------------------------------------------------------------
  // STEP 8: Chart of Accounts & Balanced Double-Entry General Ledger
  // -----------------------------------------------------------------------
  console.log('Step 8: Seeding UAE Compliant Chart of Accounts & Balanced General Ledger...');
  const accountsData = [
    { code: '1010', name: 'Cash on Hand (Petty Cash)', type: 'ASSET', subType: 'CASH' },
    { code: '1020', name: 'Emirates NBD Corporate Current Account', type: 'ASSET', subType: 'BANK' },
    { code: '1050', name: 'Accounts Receivable (Trade Debtors)', type: 'ASSET', subType: 'RECEIVABLE' },
    { code: '1080', name: 'Stock Inventory Valuation Asset', type: 'ASSET', subType: 'INVENTORY' },
    { code: '2010', name: 'Accounts Payable (Trade Creditors)', type: 'LIABILITY', subType: 'PAYABLE' },
    { code: '2050', name: 'UAE Federal Tax Authority VAT Output (5%)', type: 'LIABILITY', subType: 'VAT_OUTPUT' },
    { code: '2060', name: 'UAE Federal Tax Authority VAT Input Recoverable (5%)', type: 'LIABILITY', subType: 'VAT_INPUT' },
    { code: '3010', name: 'Paid-Up Share Capital', type: 'EQUITY', subType: 'CAPITAL' },
    { code: '3050', name: 'Retained Earnings', type: 'EQUITY', subType: 'EARNINGS' },
    { code: '4010', name: 'Field Maintenance & MEP Service Revenue', type: 'REVENUE', subType: 'SERVICE' },
    { code: '4020', name: 'Material & Spare Parts Counter Sales Revenue', type: 'REVENUE', subType: 'SALES' },
    { code: '4030', name: 'Heavy Equipment Rental Revenue', type: 'REVENUE', subType: 'RENTAL' },
    { code: '4040', name: 'Construction Labour Supply & Manpower Revenue', type: 'REVENUE', subType: 'MANPOWER' },
    { code: '5010', name: 'Direct Spare Parts & Consumables Consumed', type: 'DIRECT_COST', subType: 'COGS' },
    { code: '5020', name: 'Direct Technician & Site Labour Payroll', type: 'DIRECT_COST', subType: 'LABOUR_COST' },
    { code: '5030', name: 'Equipment Fuel & Fleet Servicing Direct Cost', type: 'DIRECT_COST', subType: 'EQUIP_COST' },
    { code: '6010', name: 'Fleet Fuel, Salik Tolls & Vehicle Maintenance', type: 'EXPENSE', subType: 'FLEET' },
    { code: '6020', name: 'Workshop Consumables & Calibration Tools', type: 'EXPENSE', subType: 'SUPPLIES' },
    { code: '6030', name: 'Office Rent, Dewa Utilities & Telecoms', type: 'EXPENSE', subType: 'FACILITIES' },
  ];

  const coaMap: Record<string, string> = {};
  for (const acc of accountsData) {
    const createdAcc = await prisma.chartOfAccounts.create({
      data: {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        subType: acc.subType,
        isReconcilable: acc.subType === 'BANK' || acc.subType === 'CASH',
      },
    });
    coaMap[acc.code] = createdAcc.id;
  }

  // Bank Account
  const bankAcc = await prisma.bankAccount.create({
    data: {
      bankName: 'Emirates NBD',
      accountNumber: '1012345678901',
      iban: 'AE290260001012345678901',
      swiftBic: 'EBILAEADXXX',
      currency: 'AED',
      accountId: coaMap['1020'],
      currentBalance: 750000.0,
    },
  });

  // 1. Opening Balance Journal Entry:
  // Dr Bank (1020): 750,000 AED
  // Dr Inventory Asset (1080): 100,000 AED
  // Cr Share Capital (3010): 850,000 AED
  const openingJournal = await prisma.journalEntry.create({
    data: {
      entryNumber: 'JE-2025-OPEN',
      entryDate: SIX_MONTHS_AGO,
      referenceType: 'MANUAL',
      description: 'Opening Fiscal Balance for UAE Operations',
      status: 'POSTED',
      postedAt: SIX_MONTHS_AGO,
    },
  });

  await prisma.journalLine.createMany({
    data: [
      { journalEntryId: openingJournal.id, accountId: coaMap['1020'], debitAmount: 750000.0, creditAmount: 0.0, description: 'Bank Opening Balance' },
      { journalEntryId: openingJournal.id, accountId: coaMap['1080'], debitAmount: 100000.0, creditAmount: 0.0, description: 'Inventory Opening Valuation' },
      { journalEntryId: openingJournal.id, accountId: coaMap['3010'], debitAmount: 0.0, creditAmount: 850000.0, description: 'Founders Paid-Up Capital' },
    ],
  });

  // -----------------------------------------------------------------------
  // STEP 9: Invoices, Payments & GL Revenue/Receivable Postings
  // -----------------------------------------------------------------------
  console.log('Step 9: Generating Invoices (Paid, Partially Paid, Overdue) and Balanced Journal Entries...');

  // Generate invoices for 320 completed/invoiced/closed work orders
  const invoicedWOs = createdWorkOrders.filter((w) => ['COMPLETED', 'INVOICED', 'CLOSED'].includes(w.status));

  let totalRevenueAccumulated = 0;
  let totalVatAccumulated = 0;
  let totalPaymentsCollected = 0;

  for (let i = 0; i < invoicedWOs.length; i++) {
    const wo = invoicedWOs[i];
    const customer = allCustomers.find((c) => c.id === wo.customerId) || allCustomers[0];
    const issueDate = wo.createdAt;
    const dueDate = addDays(issueDate, customer.paymentTermsDays || 30);
    const subtotal = Number(wo.subtotal);
    const vatAmount = Number(wo.vatAmount);
    const totalAmount = Number(wo.totalAmount);

    totalRevenueAccumulated += subtotal;
    totalVatAccumulated += vatAmount;

    // Realistic payment distribution:
    // ~70% PAID, ~15% PARTIALLY_PAID, ~10% Overdue (dueDate < NOW), ~5% PENDING
    let paymentStatus = 'PAID';
    let balanceDue = 0.0;

    if (i % 20 === 0) {
      paymentStatus = 'PENDING';
      balanceDue = totalAmount;
    } else if (i % 10 === 0) {
      paymentStatus = dueDate < NOW ? 'OVERDUE' : 'PENDING';
      balanceDue = totalAmount;
    } else if (i % 7 === 0) {
      paymentStatus = 'PARTIALLY_PAID';
      balanceDue = Number((totalAmount * 0.4).toFixed(2));
    } else {
      paymentStatus = 'PAID';
      balanceDue = 0.0;
    }

    const inv = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2025-${(i + 1).toString().padStart(4, '0')}`,
        invoiceType: 'STANDARD_TAX_INVOICE',
        workOrderId: wo.id,
        customerId: customer.id,
        customerName: customer.name,
        customerAddress: customer.name,
        customerTrn: customer.trn,
        companyName: COMPANY.name,
        companyTrn: COMPANY.trn,
        companyAddress: COMPANY.address,
        issueDate,
        dueDate,
        subtotal,
        vatRate: 0.05,
        vatAmount,
        totalAmount,
        balanceDue,
        paymentStatus: paymentStatus === 'OVERDUE' ? 'PENDING' : paymentStatus,
      },
    });

    await prisma.invoiceLine.create({
      data: {
        invoiceId: inv.id,
        description: wo.title,
        quantity: 1,
        unitPrice: subtotal,
        subtotal,
        vatRate: 0.05,
        vatAmount,
        totalAmount,
      },
    });

    // Balanced Journal Entry for Invoice Issue:
    // Dr Accounts Receivable (1050): totalAmount
    // Cr Service Revenue (4010): subtotal
    // Cr VAT Output 5% (2050): vatAmount
    const jeInvoice = await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-INV-${(i + 1).toString().padStart(4, '0')}`,
        entryDate: issueDate,
        referenceType: 'INVOICE',
        referenceId: inv.id,
        description: `Tax Invoice ${inv.invoiceNumber} Issue (${customer.name})`,
        status: 'POSTED',
        postedAt: issueDate,
      },
    });

    await prisma.journalLine.createMany({
      data: [
        { journalEntryId: jeInvoice.id, accountId: coaMap['1050'], debitAmount: totalAmount, creditAmount: 0.0, description: `Receivable for ${inv.invoiceNumber}` },
        { journalEntryId: jeInvoice.id, accountId: coaMap['4010'], debitAmount: 0.0, creditAmount: subtotal, description: 'MEP Maintenance Revenue' },
        { journalEntryId: jeInvoice.id, accountId: coaMap['2050'], debitAmount: 0.0, creditAmount: vatAmount, description: 'UAE VAT 5% Output' },
      ],
    });

    // If Paid or Partially Paid, record Payment and Cash Settlement Journal:
    const amountPaid = totalAmount - balanceDue;
    if (amountPaid > 0) {
      totalPaymentsCollected += amountPaid;
      const paymentDate = addDays(issueDate, rng.range(2, 20));

      const payment = await prisma.payment.create({
        data: {
          paymentNumber: `PAY-2025-${(i + 1).toString().padStart(4, '0')}`,
          invoiceId: inv.id,
          customerId: customer.id,
          amount: amountPaid,
          paymentDate,
          paymentMethod: i % 2 === 0 ? 'STRIPE_CARD' : 'BANK_TRANSFER',
          transactionReference: `TXN-${paymentDate.getTime()}-${i}`,
          status: 'CLEARED',
        },
      });

      await prisma.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          invoiceId: inv.id,
          amountAllocated: amountPaid,
        },
      });

      // Balanced Journal Entry for Payment Clearance:
      // Dr Bank (1020): amountPaid
      // Cr Accounts Receivable (1050): amountPaid
      const jePayment = await prisma.journalEntry.create({
        data: {
          entryNumber: `JE-PAY-${(i + 1).toString().padStart(4, '0')}`,
          entryDate: paymentDate,
          referenceType: 'PAYMENT',
          referenceId: payment.id,
          description: `Settlement for Invoice ${inv.invoiceNumber} via ${payment.paymentMethod}`,
          status: 'POSTED',
          postedAt: paymentDate,
        },
      });

      await prisma.journalLine.createMany({
        data: [
          { journalEntryId: jePayment.id, accountId: coaMap['1020'], debitAmount: amountPaid, creditAmount: 0.0, description: 'Funds Cleared in Emirates NBD' },
          { journalEntryId: jePayment.id, accountId: coaMap['1050'], debitAmount: 0.0, creditAmount: amountPaid, description: `Relieve A/R for ${inv.invoiceNumber}` },
        ],
      });
    }

    // Direct Cost COGS Journal for Consumed Parts & Labour
    const partsCost = Number((subtotal * 0.28).toFixed(2));
    const labourCost = Number((subtotal * 0.22).toFixed(2));
    const jeCost = await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-COST-${(i + 1).toString().padStart(4, '0')}`,
        entryDate: issueDate,
        referenceType: 'EXPENSE',
        referenceId: wo.id,
        description: `Direct Job Cost for Work Order ${wo.orderNumber}`,
        status: 'POSTED',
        postedAt: issueDate,
      },
    });

    await prisma.journalLine.createMany({
      data: [
        { journalEntryId: jeCost.id, accountId: coaMap['5010'], debitAmount: partsCost, creditAmount: 0.0, description: 'Direct Parts Consumed' },
        { journalEntryId: jeCost.id, accountId: coaMap['5020'], debitAmount: labourCost, creditAmount: 0.0, description: 'Direct Technician Labour' },
        { journalEntryId: jeCost.id, accountId: coaMap['1080'], debitAmount: 0.0, creditAmount: partsCost, description: 'Relieve Stock Valuation' },
        { journalEntryId: jeCost.id, accountId: coaMap['1020'], debitAmount: 0.0, creditAmount: labourCost, description: 'Technician Wages Paid' },
      ],
    });
  }

  // -----------------------------------------------------------------------
  // STEP 10: 5 Live-Demo GPS Telematics Actors
  // -----------------------------------------------------------------------
  console.log('Step 10: Seeding 5 Live-Demo Telematics Actors with Active GPS Coordinates...');
  const activeActors = [
    { tech: technicianEmployees[0], lat: 25.1860, lng: 55.2715, speed: 45.0, heading: 180, loc: 'Marasi Drive, Business Bay' },
    { tech: technicianEmployees[1], lat: 25.1972, lng: 55.2744, speed: 52.0, heading: 90, loc: 'Financial Centre Rd, Downtown' },
    { tech: technicianEmployees[4], lat: 25.0805, lng: 55.1403, speed: 0.0, heading: 0, loc: 'Dubai Marina Walk (On-Site)' },
    { tech: technicianEmployees[8], lat: 25.1320, lng: 55.2280, speed: 38.0, heading: 270, loc: 'Al Quoz Central Warehouse Depot' },
    { tech: technicianEmployees[3], lat: 25.1600, lng: 55.2450, speed: 65.0, heading: 45, loc: 'Sheikh Zayed Road Northbound' },
  ];

  for (const a of activeActors) {
    // Recent 5 breadcrumbs per actor
    for (let b = 4; b >= 0; b--) {
      await prisma.technicianLocation.create({
        data: {
          employeeId: a.tech.id,
          latitude: a.lat + b * 0.001,
          longitude: a.lng + b * 0.001,
          speedKmh: a.speed,
          headingDegrees: a.heading,
          recordedAt: new Date(Date.now() - b * 60 * 1000), // last 5 minutes
        },
      });
    }
  }

  // -----------------------------------------------------------------------
  // STEP 11: Notification Templates & Outbox
  // -----------------------------------------------------------------------
  console.log('Step 11: Seeding Bilingual EN/AR Notification Templates & Outbox...');
  const templates = [
    { code: 'WO_CREATED', title: 'Service Request Confirmed', titleAr: 'تم تأكيد طلب الخدمة', bodyTemplateEn: 'Service order #{{orderNumber}} scheduled.', bodyTemplateAr: 'تم تأكيد طلب الخدمة رقم {{orderNumber}}.', channel: 'WHATSAPP_SIMULATED', eventTrigger: 'WO_CREATED' },
    { code: 'TECH_DISPATCHED', title: 'Technician Dispatched', titleAr: 'الفني في الطريق إليك', bodyTemplateEn: 'Technician {{technicianName}} is en route with ETA {{etaMinutes}}m.', bodyTemplateAr: 'الفني {{technicianName}} في الطريق إليك.', channel: 'WHATSAPP_SIMULATED', eventTrigger: 'DISPATCH' },
    { code: 'WO_COMPLETED', title: 'Job Completed', titleAr: 'تم إنجاز العمل', bodyTemplateEn: 'Order #{{orderNumber}} completed. Please review and sign.', bodyTemplateAr: 'تم إنجاز العمل رقم {{orderNumber}}.', channel: 'SMS_SIMULATED', eventTrigger: 'COMPLETION' },
  ];

  for (const t of templates) {
    await prisma.notificationTemplate.create({ data: t });
  }

  // =======================================================================
  // ACCEPTANCE CHECKS & VERIFICATION
  // =======================================================================
  console.log('\n===================================================================');
  console.log('EXECUTION COMPLETE: RUNNING ACCEPTANCE AUDIT & VERIFICATION');
  console.log('===================================================================');

  // 1. Relational Counts
  const [usersCount, customersCount, sitesCount, assetsCount, amcCount, woCount, itemsCount, whCount, eqCount, depCount, jeCount] = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.customerSite.count(),
    prisma.customerAsset.count(),
    prisma.maintenanceContract.count(),
    prisma.workOrder.count(),
    prisma.item.count(),
    prisma.warehouse.count(),
    prisma.rentalEquipment.count(),
    prisma.labourSupplyDeployment.count(),
    prisma.journalEntry.count(),
  ]);

  console.log('\n--- 1. DATABASE ENTITY COUNTS ---');
  console.log(`Users / Employees:        ${usersCount} (5 Staff, 12 Techs, 8 Helpers, 30 Manpower, 1 Customer)`);
  console.log(`Customers:                ${customersCount} (5 Construction Giants, 20 Commercial, 35 Residential)`);
  console.log(`Customer Sites:           ${sitesCount} (Dubai: 40, Sharjah: 10, Abu Dhabi: 10)`);
  console.log(`Customer Assets:          ${assetsCount} (HVAC, Water Pumps, Heaters, DB Panels)`);
  console.log(`AMC Contracts:            ${amcCount} (Quarterly Scheduled Visits for 2026)`);
  console.log(`Work Orders:              ${woCount} across 6 months`);
  console.log(`Inventory Items:          ${itemsCount} items`);
  console.log(`Warehouses / Vans:        ${whCount} (2 Central Hubs + 12 Mobile Service Vans)`);
  console.log(`Rental Equipment Fleet:   ${eqCount} units (~65% fleet utilization)`);
  console.log(`Manpower Deployments:     ${depCount} active major construction sites`);
  console.log(`General Ledger Journals:  ${jeCount} posted balanced double-entry entries`);

  // 2. Double-Entry Balance Verification
  const journalBalance: any = await prisma.$queryRaw`
    SELECT 
      ROUND(COALESCE(SUM(debit_amount), 0)::numeric, 2) AS total_debits,
      ROUND(COALESCE(SUM(credit_amount), 0)::numeric, 2) AS total_credits,
      ROUND((COALESCE(SUM(debit_amount), 0) - COALESCE(SUM(credit_amount), 0))::numeric, 2) AS balance_diff
    FROM journal_lines
    WHERE deleted_at IS NULL;
  `;

  const totalDebits = Number(journalBalance[0]?.total_debits || 0);
  const totalCredits = Number(journalBalance[0]?.total_credits || 0);
  const balanceDiff = Number(journalBalance[0]?.balance_diff || 0);

  console.log('\n--- 2. GENERAL LEDGER DOUBLE-ENTRY INTEGRITY ---');
  console.log(`Total General Ledger Debits:  AED ${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`Total General Ledger Credits: AED ${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`Balance Invariant (Debits - Credits): AED ${balanceDiff.toFixed(2)}`);

  if (Math.abs(balanceDiff) > 0.01) {
    throw new Error(`CRITICAL FAILURE: General Ledger is unbalanced by AED ${balanceDiff}!`);
  }
  console.log('>>> LEDGER INTEGRITY CHECK PASSED: EXACT DOUBLE-ENTRY BALANCE VERIFIED! <<<');

  // 3. Loss-Making Jobs Verification (Job Profitability Value)
  console.log('\n--- 3. LOSS-MAKING JOBS IN PROFITABILITY REPORT ---');
  for (const lm of lossMakingWorkOrders) {
    console.log(`* ${lm.orderNumber}: Billed AED ${lm.subtotal.toFixed(2)} | Cost AED ${(lm.totalPartsCost + lm.totalLabourCost).toFixed(2)} | Gross Loss: AED ${lm.margin.toFixed(2)} (UNFORESEEN EXPENSE)`);
  }

  // 4. Print Demo Logins Table
  console.log('\n===================================================================');
  console.log('DEMO ACCESS CREDENTIALS (PASSWORD: DemoPassword123!)');
  console.log('===================================================================');
  console.table([
    { Role: 'Super Admin', Email: 'admin@fieldops.ae', Name: 'Sultan Al-Falasi', Scope: 'Full Unrestricted ERP Access' },
    { Role: 'Operations Manager', Email: 'ops@fieldops.ae', Name: 'Tariq Mansoor', Scope: 'Work Orders, Contracts, Approvals' },
    { Role: 'Accountant', Email: 'finance@fieldops.ae', Name: 'Mariam Al-Husseini', Scope: 'Invoices, VAT 5%, P&L, Ledger' },
    { Role: 'Dispatcher', Email: 'dispatch@fieldops.ae', Name: 'Sarah Jenkins', Scope: 'Fleet Telematics, Live Map Dispatch' },
    { Role: 'Storekeeper', Email: 'inventory@fieldops.ae', Name: 'Bilal Qureshi', Scope: 'Warehouses, Mobile Vans, Stock' },
    { Role: 'Lead HVAC Tech', Email: 'tech.rashid@fieldops.ae', Name: 'Rashid Al-Nuaimi', Scope: 'Mobile PWA, Live Telematics (Dubai)' },
    { Role: 'Lead Electrician', Email: 'tech.vikram@fieldops.ae', Name: 'Vikram Patel', Scope: 'Mobile PWA, Live Telematics (Dubai)' },
    { Role: 'Customer Client', Email: 'customer@almasar.ae', Name: 'Eng. Khalid Al-Mansoor', Scope: 'Client Booking Portal, Invoices' },
  ]);
  console.log('===================================================================\n');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
