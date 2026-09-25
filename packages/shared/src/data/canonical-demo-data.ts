import { UAE_CONSTANTS } from '../constants/uae';

export interface CanonicalCustomer {
  id: string;
  name: string;
  nameAr: string;
  trn: string;
  contactPerson: string;
  email: string;
  phone: string;
  emirate: string;
  area: string;
  creditLimit: number;
}

export interface CanonicalTechnician {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  trade: 'HVAC' | 'ELECTRICAL' | 'PLUMBING' | 'EQUIPMENT' | 'LABOUR_SUPPLY';
  phone: string;
  email: string;
  vanCode: string;
  rating: number;
  lat: number;
  lng: number;
}

export interface CanonicalInventoryItem {
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  costAed: number;
  sellAed: number;
  isLowStock: boolean;
}

export interface CanonicalRentalUnit {
  code: string;
  name: string;
  category: 'POWER_GENERATION' | 'ACCESS_EQUIPMENT' | 'COMPRESSED_AIR' | 'EARTHMOVING';
  dailyRateAed: number;
  status: 'ON_HIRE' | 'AVAILABLE' | 'MAINTENANCE';
  serialNumber: string;
}

export interface CanonicalWorkOrder {
  id: string;
  orderNumber: string; // Strictly WO-2026-00001 format
  title: string;
  serviceType: 'HVAC' | 'ELECTRICAL' | 'PLUMBING' | 'EQUIPMENT' | 'LABOUR_SUPPLY';
  status: 'DRAFT' | 'SCHEDULED' | 'EN_ROUTE' | 'ON_SITE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  createdAt: string; // ISO date
  scheduledDate: string;
  completedDate?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  area: string;
  address: string;
  technicianId: string;
  technicianName: string;
  technicianPhone: string;
  subtotalAed: number;
  vatAmountAed: number;
  totalAed: number;
  costAed: number;
  profitAed: number;
  marginPercent: number;
  isLossMaker: boolean;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE';
}

// --------------------------------------------------------------------------
// 1. Fictional Technicians (No real names)
// --------------------------------------------------------------------------
export const CANONICAL_TECHNICIANS: CanonicalTechnician[] = [
  {
    id: 'tech-001',
    code: 'TECH-PLU-01',
    name: 'Tariq Al-Mansoor',
    nameAr: 'طارق المنصور',
    trade: 'PLUMBING',
    phone: 'xxxxxxxxx',
    email: 'test@i-bnb.com',
    vanCode: 'Van DXB-02 (Toyota HiAce)',
    rating: 4.88,
    lat: 25.1856,
    lng: 55.2708,
  },
  {
    id: 'tech-002',
    code: 'TECH-HVAC-01',
    name: 'Rashid Al-Nuaimi',
    nameAr: 'راشد النعيمي',
    trade: 'HVAC',
    phone: 'xxxxxxxxx',
    email: 'test@i-bnb.com',
    vanCode: 'Van DXB-12 (Toyota HiAce)',
    rating: 4.95,
    lat: 25.1972,
    lng: 55.2744,
  },
  {
    id: 'tech-003',
    code: 'TECH-ELE-01',
    name: 'Zayd Al-Falasi',
    nameAr: 'زيد الفلاسي',
    trade: 'ELECTRICAL',
    phone: 'xxxxxxxxx',
    email: 'test@i-bnb.com',
    vanCode: 'Van DXB-07 (Nissan Urvan)',
    rating: 4.91,
    lat: 25.1325,
    lng: 55.2341,
  },
  {
    id: 'tech-004',
    code: 'TECH-MEP-01',
    name: 'Omar Al-Sayed',
    nameAr: 'عمر السيد',
    trade: 'EQUIPMENT',
    phone: 'xxxxxxxxx',
    email: 'test@i-bnb.com',
    vanCode: 'Van DXB-09 (Ford Transit)',
    rating: 4.85,
    lat: 25.0762,
    lng: 55.1403,
  },
  {
    id: 'tech-005',
    code: 'TECH-LAB-01',
    name: 'Bilal Al-Qasim',
    nameAr: 'بلال القاسم',
    trade: 'LABOUR_SUPPLY',
    phone: 'xxxxxxxxx',
    email: 'test@i-bnb.com',
    vanCode: 'Van DXB-04 (Toyota Coaster)',
    rating: 4.82,
    lat: 25.1215,
    lng: 55.2335,
  },
];

// --------------------------------------------------------------------------
// 2. 60 Fictional Customers (Clean UAE Fictional Entities)
// --------------------------------------------------------------------------
const CUSTOMER_SEEDS = [
  { name: 'Palm Crest Properties LLC', nameAr: 'بالم كريست العقارية ذ.م.م', area: 'Palm Jumeirah', emirate: 'Dubai' },
  { name: 'Crescent Bay Commercial Complex', nameAr: 'مجمع خليج الهلال التجاري', area: 'Business Bay', emirate: 'Dubai' },
  { name: 'Al-Noor Tower Owners Association', nameAr: 'جمعية ملاك برج النور', area: 'Downtown Dubai', emirate: 'Dubai' },
  { name: 'Desert Rose Facilities Management LLC', nameAr: 'ديزرت روز لإدارة المرافق ذ.م.م', area: 'Al Quoz 3', emirate: 'Dubai' },
  { name: 'Oasis Living Residential Communities', nameAr: 'مجمعات واحة المعيشة السكنية', area: 'Jumeirah 1', emirate: 'Dubai' },
  { name: 'Blue Sky Logistics Warehouses LLC', nameAr: 'مستودعات بلو سكاي اللوجستية ذ.م.م', area: 'Dubai Industrial City', emirate: 'Dubai' },
  { name: 'Gulf Horizon Contracting LLC', nameAr: 'مقاولات أفق الخليج ذ.م.م', area: 'Deira', emirate: 'Dubai' },
  { name: 'Emirates Grand Residence Towers', nameAr: 'أبراج جراند الإمارات السكنية', area: 'Jumeirah Lake Towers', emirate: 'Dubai' },
  { name: 'Al-Barakah Commercial Plaza', nameAr: 'بلازا البركة التجارية', area: 'Al Barsha 1', emirate: 'Dubai' },
  { name: 'Falcon Crest Retail Village', nameAr: 'قرية صقر كريست للتجزئة', area: 'Al Wasl', emirate: 'Dubai' },
];

export const CANONICAL_CUSTOMERS: CanonicalCustomer[] = Array.from({ length: 60 }).map((_, idx) => {
  const seed = CUSTOMER_SEEDS[idx % CUSTOMER_SEEDS.length];
  const num = idx + 1;
  const isCorporate = num <= 25;
  const name = isCorporate
    ? `${seed.name} (Unit ${num})`
    : `Residential Villa Client #${num} (${seed.area})`;
  const nameAr = isCorporate
    ? `${seed.nameAr} (وحدة ${num})`
    : `عميل الفيلا السكنية #${num} (${seed.nameAr})`;
  const domain = isCorporate ? `palmcrest${num}.example` : `resident${num}.example`;
  const contactPerson = `Client Representative ${num}`;

  return {
    id: `cust-${num.toString().padStart(3, '0')}`,
    name,
    nameAr,
    trn: `1000000000000${num.toString().padStart(2, '0')} (demo)`,
    contactPerson,
    email: 'test@i-bnb.com',
    phone: 'xxxxxxxxx',
    emirate: seed.emirate,
    area: seed.area,
    creditLimit: isCorporate ? 150000 : 25000,
  };
});

// --------------------------------------------------------------------------
// 3. 200 Inventory Items
// --------------------------------------------------------------------------
const ITEM_CATEGORIES = ['HVAC', 'ELECTRICAL', 'PLUMBING', 'CONSUMABLES'] as const;

export const CANONICAL_INVENTORY: CanonicalInventoryItem[] = Array.from({ length: 200 }).map((_, idx) => {
  const num = idx + 1;
  const cat = ITEM_CATEGORIES[idx % ITEM_CATEGORIES.length];
  let name = '';
  let cost = 15;
  let sell = 35;
  let unit = 'PIECE';

  if (cat === 'HVAC') {
    if (idx % 4 === 0) {
      name = `R410A Refrigerant Cylinder 11.3kg (#${num})`;
      cost = 160;
      sell = 320;
      unit = 'CYLINDER';
    } else if (idx % 4 === 1) {
      name = `Dual Run Capacitor ${30 + (idx % 5) * 5}uF 450VAC (#${num})`;
      cost = 25;
      sell = 65;
    } else if (idx % 4 === 2) {
      name = `Copper Tube Coil 1/2" 15m Pancake (#${num})`;
      cost = 120;
      sell = 240;
      unit = 'ROLL';
    } else {
      name = `Condenser Fan Motor 1/4 HP UAE Tropical (#${num})`;
      cost = 145;
      sell = 310;
    }
  } else if (cat === 'ELECTRICAL') {
    if (idx % 3 === 0) {
      name = `Schneider 32A MCB 2-Pole High Breaking (#${num})`;
      cost = 28;
      sell = 65;
    } else if (idx % 3 === 1) {
      name = `Ducab 2.5mm Single Core Copper Cable 100m (#${num})`;
      cost = 140;
      sell = 280;
      unit = 'ROLL';
    } else {
      name = `4-Pole Main Isolator 63A IP65 Waterproof (#${num})`;
      cost = 85;
      sell = 190;
    }
  } else if (cat === 'PLUMBING') {
    if (idx % 3 === 0) {
      name = `PPR Pipe 32mm PN20 High-Pressure 4m (#${num})`;
      cost = 22;
      sell = 52;
      unit = 'LENGTH';
    } else if (idx % 3 === 1) {
      name = `Brass Gate Valve 1" Heavy Duty UAE Spec (#${num})`;
      cost = 38;
      sell = 85;
    } else {
      name = `Water Heater Heating Element 3000W (#${num})`;
      cost = 65;
      sell = 150;
    }
  } else {
    name = `Standard Consumables & Fasteners Kit (#${num})`;
    cost = 12;
    sell = 28;
    unit = 'SET';
  }

  // Exactly 6 low-stock items for demo dashboard alert
  const isLowStock = idx < 6;
  const stock = isLowStock ? 2 : 15 + (idx % 40);
  const minStock = 8;

  return {
    sku: `ITM-${num.toString().padStart(4, '0')}`,
    name,
    category: cat,
    stock,
    minStock,
    unit,
    costAed: cost,
    sellAed: sell,
    isLowStock,
  };
});

// --------------------------------------------------------------------------
// 4. 40 Rental Fleet Units
// --------------------------------------------------------------------------
const RENTAL_CATEGORIES: CanonicalRentalUnit['category'][] = [
  'POWER_GENERATION',
  'ACCESS_EQUIPMENT',
  'COMPRESSED_AIR',
  'EARTHMOVING',
];

export const CANONICAL_RENTAL_FLEET: CanonicalRentalUnit[] = Array.from({ length: 40 }).map((_, idx) => {
  const num = idx + 1;
  const cat = RENTAL_CATEGORIES[idx % RENTAL_CATEGORIES.length];
  let name = '';
  let rate = 450;

  if (cat === 'POWER_GENERATION') {
    name = `Cummins ${50 + (idx % 5) * 50}kVA Soundproof Mobile Generator`;
    rate = 400 + (idx % 5) * 150;
  } else if (cat === 'ACCESS_EQUIPMENT') {
    name = `Haulotte ${10 + (idx % 4) * 4}m Electric Scissor Lift`;
    rate = 350 + (idx % 4) * 100;
  } else if (cat === 'COMPRESSED_AIR') {
    name = `Atlas Copco 375 CFM Towable Air Compressor`;
    rate = 320;
  } else {
    name = `Caterpillar 320D Mini Hydraulic Excavator`;
    rate = 850;
  }

  // 68% active on hire (27 on hire, 13 available/maintenance)
  const status: CanonicalRentalUnit['status'] = idx < 27 ? 'ON_HIRE' : idx < 37 ? 'AVAILABLE' : 'MAINTENANCE';

  return {
    code: `EQ-${num.toString().padStart(3, '0')}`,
    name: `${name} (#${num})`,
    category: cat,
    dailyRateAed: rate,
    status,
    serialNumber: `SN-2026-EQ${(1000 + num).toString()}`,
  };
});

// --------------------------------------------------------------------------
// 5. 400 Canonical Work Orders (Strictly WO-2026-00001 through WO-2026-00400)
// --------------------------------------------------------------------------
const SERVICE_TYPES: CanonicalWorkOrder['serviceType'][] = [
  'HVAC',
  'ELECTRICAL',
  'PLUMBING',
  'EQUIPMENT',
  'LABOUR_SUPPLY',
];

const SCOPES_BY_SERVICE: Record<CanonicalWorkOrder['serviceType'], string[]> = {
  HVAC: [
    'VRV Condenser Overhaul & R410A Recharge',
    'Chilled Water FCU Actuator Valve Replacement',
    'AC Dual Run Capacitor Replacement & Delta-T Test',
    'Ducted Split Compressor Burnout Replacement',
    'AHU Filter Bank Deep Cleaning & Chemical Sanitization',
  ],
  ELECTRICAL: [
    'Main Distribution Board (MDB) Busbar Upgrade',
    'Circuit Breaker Tripping Diagnostics & Isolation',
    'Phase 1/2/3 Megger Insulation Resistance Testing',
    'Emergency LED Lighting Sub-Panel Installation',
    'Industrial Contactor Replacement & ATS Rewiring',
  ],
  PLUMBING: [
    'Main Riser Booster Pump Pressure Switch Calibration',
    'Domestic PPR 32mm High-Pressure Pipe Leak Repair',
    'Underground Chilled Water Line Flange Replacement',
    'Central Hot Water Circulation Pump Repair',
    'Drainage Sump Pump Float Switch Overhaul',
  ],
  EQUIPMENT: [
    'Generator 100kVA 250-Hour Maintenance & Filter Swap',
    'Mobile Scissor Lift Hydraulic Pressure Calibration',
    'Air Compressor Unloader Valve Replacement',
    'Site Excavator Track Tension Adjustment & Grease Run',
  ],
  LABOUR_SUPPLY: [
    'Certified MEP Electricians Labour Provision (10 Men)',
    'Master Plumbers Construction Deployment (5 Men)',
    'HVAC Commissioning Specialist Labour (3 Men)',
    'General Facilities Maintenance Helpers (8 Men)',
  ],
};

// Date distribution helper: April 1, 2026 through September 30, 2026
function getDateForIndex(idx: number): { created: string; scheduled: string; completed?: string } {
  // 182 days in 6 months
  const dayOffset = Math.floor((idx / 400) * 180);
  const baseDate = new Date('2026-04-01T08:00:00.000Z');
  const createdDate = new Date(baseDate.getTime() + dayOffset * 86400000 + (idx % 24) * 3600000);
  const scheduledDate = new Date(createdDate.getTime() + 4 * 3600000);

  const isCompleted = idx < 330;
  const completedDate = isCompleted
    ? new Date(scheduledDate.getTime() + 3 * 3600000).toISOString()
    : undefined;

  return {
    created: createdDate.toISOString(),
    scheduled: scheduledDate.toISOString(),
    completed: completedDate,
  };
}

export const CANONICAL_WORK_ORDERS: CanonicalWorkOrder[] = Array.from({ length: 400 }).map((_, idx) => {
  const num = idx + 1;
  const orderNumber = `WO-2026-${num.toString().padStart(5, '0')}`;
  const id = `wo-${num.toString().padStart(3, '0')}`;

  const serviceType = SERVICE_TYPES[idx % SERVICE_TYPES.length];
  const scopes = SCOPES_BY_SERVICE[serviceType];
  const title = scopes[idx % scopes.length];

  const customer = CANONICAL_CUSTOMERS[idx % CANONICAL_CUSTOMERS.length];
  const tech = CANONICAL_TECHNICIANS[idx % CANONICAL_TECHNICIANS.length];

  const dates = getDateForIndex(idx);

  // Status distribution:
  // 0-329: COMPLETED (330)
  // 330-355: IN_PROGRESS (26)
  // 356-370: ON_SITE (15)
  // 371-385: EN_ROUTE (15)
  // 386-395: SCHEDULED (10)
  // 396-399: DRAFT (4)
  let status: CanonicalWorkOrder['status'] = 'COMPLETED';
  if (idx >= 396) status = 'DRAFT';
  else if (idx >= 386) status = 'SCHEDULED';
  else if (idx >= 371) status = 'EN_ROUTE';
  else if (idx >= 356) status = 'ON_SITE';
  else if (idx >= 330) status = 'IN_PROGRESS';

  const priority: CanonicalWorkOrder['priority'] =
    idx % 12 === 0 ? 'EMERGENCY' : idx % 5 === 0 ? 'HIGH' : idx % 2 === 0 ? 'MEDIUM' : 'LOW';

  // Intentional loss-makers: orders #12, #89, #142, #218 (demonstrates loss diagnostics)
  const isLossMaker = num === 12 || num === 89 || num === 142 || num === 218;

  let subtotal = 0;
  let cost = 0;

  if (isLossMaker) {
    if (num === 12) {
      subtotal = 320.0;
      cost = 660.0; // -106.3% margin
    } else if (num === 89) {
      subtotal = 450.0;
      cost = 1040.0; // -131.1% margin
    } else if (num === 142) {
      subtotal = 380.0;
      cost = 790.0; // -107.9% margin
    } else {
      subtotal = 410.0;
      cost = 880.0; // -114.6% margin
    }
  } else {
    // Normal healthy margin (35% to 60%)
    if (serviceType === 'LABOUR_SUPPLY') {
      subtotal = 3500.0 + (idx % 6) * 500.0;
      cost = subtotal * 0.65;
    } else if (serviceType === 'EQUIPMENT') {
      subtotal = 1200.0 + (idx % 8) * 200.0;
      cost = subtotal * 0.45;
    } else {
      subtotal = 280.0 + (idx % 15) * 65.0;
      cost = subtotal * (0.4 + (idx % 20) * 0.01);
    }
  }

  subtotal = Math.round(subtotal * 100) / 100;
  cost = Math.round(cost * 100) / 100;
  const vat = Math.round(subtotal * UAE_CONSTANTS.VAT_RATE * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;
  const profit = Math.round((subtotal - cost) * 100) / 100;
  const margin = Math.round((profit / subtotal) * 1000) / 10;

  let paymentStatus: CanonicalWorkOrder['paymentStatus'] = 'PAID';
  if (status !== 'COMPLETED') {
    paymentStatus = 'PENDING';
  } else if (idx % 9 === 0) {
    paymentStatus = 'OVERDUE';
  } else if (idx % 7 === 0) {
    paymentStatus = 'PARTIALLY_PAID';
  } else if (idx % 4 === 0) {
    paymentStatus = 'PENDING';
  }

  return {
    id,
    orderNumber,
    title,
    serviceType,
    status,
    priority,
    createdAt: dates.created,
    scheduledDate: dates.scheduled,
    completedDate: dates.completed,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    area: customer.area,
    address: `${customer.area}, ${customer.emirate}, UAE`,
    technicianId: tech.id,
    technicianName: tech.name,
    technicianPhone: tech.phone,
    subtotalAed: subtotal,
    vatAmountAed: vat,
    totalAed: total,
    costAed: cost,
    profitAed: profit,
    marginPercent: margin,
    isLossMaker,
    paymentStatus,
  };
});

// --------------------------------------------------------------------------
// 6. Metrics Aggregator (Single Source of Truth)
// --------------------------------------------------------------------------
export function getCanonicalMetrics(period: 'SEP' | '6M' = 'SEP') {
  const septStart = new Date('2026-09-01T00:00:00.000Z').getTime();
  const septEnd = new Date('2026-09-30T23:59:59.999Z').getTime();

  const filteredOrders = CANONICAL_WORK_ORDERS.filter((wo) => {
    if (period === '6M') return true;
    const t = new Date(wo.createdAt).getTime();
    return t >= septStart && t <= septEnd;
  });

  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter((w) => w.status === 'COMPLETED');
  const activeOrders = filteredOrders.filter((w) => w.status !== 'COMPLETED' && w.status !== 'CANCELLED');

  const revenueBilledAed = Math.round(completedOrders.reduce((sum, w) => sum + w.subtotalAed, 0) * 100) / 100;
  const vatCollectedAed = Math.round(completedOrders.reduce((sum, w) => sum + w.vatAmountAed, 0) * 100) / 100;
  const grossTotalAed = Math.round((revenueBilledAed + vatCollectedAed) * 100) / 100;
  const totalCostAed = Math.round(completedOrders.reduce((sum, w) => sum + w.costAed, 0) * 100) / 100;
  const netProfitAed = Math.round((revenueBilledAed - totalCostAed) * 100) / 100;
  const grossMarginPercent =
    revenueBilledAed > 0 ? Math.round((netProfitAed / revenueBilledAed) * 1000) / 10 : 0;

  // Receivables from unpaid completed invoices
  const unpaidInvoices = CANONICAL_WORK_ORDERS.filter(
    (w) => w.status === 'COMPLETED' && (w.paymentStatus === 'PENDING' || w.paymentStatus === 'OVERDUE' || w.paymentStatus === 'PARTIALLY_PAID')
  );
  const outstandingReceivablesAed = Math.round(
    unpaidInvoices.reduce((sum, w) => sum + (w.paymentStatus === 'PARTIALLY_PAID' ? w.totalAed * 0.5 : w.totalAed), 0) * 100
  ) / 100;

  // Equipment Fleet Utilization
  const onHireEquipment = CANONICAL_RENTAL_FLEET.filter((e) => e.status === 'ON_HIRE').length;
  const fleetUtilizationPercent = Math.round((onHireEquipment / CANONICAL_RENTAL_FLEET.length) * 100);

  // Inventory Low Stock
  const lowStockCount = CANONICAL_INVENTORY.filter((i) => i.isLowStock).length;

  // Loss Makers count
  const lossMakerCount = filteredOrders.filter((w) => w.isLossMaker).length;

  return {
    periodLabel: period === 'SEP' ? 'Sep 2026' : 'Apr–Sep 2026 (6 Months)',
    totalOrders,
    completedCount: completedOrders.length,
    activeCount: activeOrders.length,
    revenueBilledAed,
    vatCollectedAed,
    grossTotalAed,
    totalCostAed,
    netProfitAed,
    grossMarginPercent,
    outstandingReceivablesAed,
    fleetUtilizationPercent,
    lowStockCount,
    lossMakerCount,
    totalCustomers: CANONICAL_CUSTOMERS.length,
    totalTechnicians: CANONICAL_TECHNICIANS.length,
  };
}

// --------------------------------------------------------------------------
// 7. Service Category Breakdown (Includes Labour Supply!)
// --------------------------------------------------------------------------
export function getCanonicalCategoryBreakdown(period: 'SEP' | '6M' = 'SEP') {
  const septStart = new Date('2026-09-01T00:00:00.000Z').getTime();
  const septEnd = new Date('2026-09-30T23:59:59.999Z').getTime();

  const filtered = CANONICAL_WORK_ORDERS.filter((wo) => {
    if (period === '6M') return true;
    const t = new Date(wo.createdAt).getTime();
    return t >= septStart && t <= septEnd;
  });

  const total = filtered.length || 1;
  const counts: Record<CanonicalWorkOrder['serviceType'], { count: number; revenue: number }> = {
    HVAC: { count: 0, revenue: 0 },
    ELECTRICAL: { count: 0, revenue: 0 },
    PLUMBING: { count: 0, revenue: 0 },
    EQUIPMENT: { count: 0, revenue: 0 },
    LABOUR_SUPPLY: { count: 0, revenue: 0 },
  };

  for (const w of filtered) {
    counts[w.serviceType].count++;
    counts[w.serviceType].revenue += w.subtotalAed;
  }

  return [
    {
      type: 'HVAC',
      nameEn: 'Air Conditioning (HVAC)',
      nameAr: 'تكييف الهواء (HVAC)',
      count: counts.HVAC.count,
      revenueAed: Math.round(counts.HVAC.revenue * 100) / 100,
      percent: Math.round((counts.HVAC.count / total) * 100),
      color: '#C2410C',
    },
    {
      type: 'ELECTRICAL',
      nameEn: 'Electrical Systems',
      nameAr: 'الأنظمة الكهربائية',
      count: counts.ELECTRICAL.count,
      revenueAed: Math.round(counts.ELECTRICAL.revenue * 100) / 100,
      percent: Math.round((counts.ELECTRICAL.count / total) * 100),
      color: '#0A7BA8',
    },
    {
      type: 'PLUMBING',
      nameEn: 'Plumbing & Drainage',
      nameAr: 'السباكة والتصريف',
      count: counts.PLUMBING.count,
      revenueAed: Math.round(counts.PLUMBING.revenue * 100) / 100,
      percent: Math.round((counts.PLUMBING.count / total) * 100),
      color: '#0C2233',
    },
    {
      type: 'EQUIPMENT',
      nameEn: 'Heavy Equipment Rental',
      nameAr: 'تأجير المعدات الثقيلة',
      count: counts.EQUIPMENT.count,
      revenueAed: Math.round(counts.EQUIPMENT.revenue * 100) / 100,
      percent: Math.round((counts.EQUIPMENT.count / total) * 100),
      color: '#D97706',
    },
    {
      type: 'LABOUR_SUPPLY',
      nameEn: 'Contract Labour Supply',
      nameAr: 'توريد العمالة المتخصصة',
      count: counts.LABOUR_SUPPLY.count,
      revenueAed: Math.round(counts.LABOUR_SUPPLY.revenue * 100) / 100,
      percent: Math.round((counts.LABOUR_SUPPLY.count / total) * 100),
      color: '#059669',
    },
  ];
}

// --------------------------------------------------------------------------
// 8. Technician Leaderboard (Single Source of Truth)
// --------------------------------------------------------------------------
export function getCanonicalTechnicianLeaderboard(period: 'SEP' | '6M' = 'SEP') {
  const septStart = new Date('2026-09-01T00:00:00.000Z').getTime();
  const septEnd = new Date('2026-09-30T23:59:59.999Z').getTime();

  const filtered = CANONICAL_WORK_ORDERS.filter((wo) => {
    if (wo.status !== 'COMPLETED') return false;
    if (period === '6M') return true;
    const t = new Date(wo.createdAt).getTime();
    return t >= septStart && t <= septEnd;
  });

  return CANONICAL_TECHNICIANS.map((tech) => {
    const techJobs = filtered.filter((w) => w.technicianId === tech.id);
    const billedAed = Math.round(techJobs.reduce((s, j) => s + j.subtotalAed, 0) * 100) / 100;
    return {
      id: tech.id,
      name: tech.name,
      nameAr: tech.nameAr,
      code: tech.code,
      trade: tech.trade,
      vanCode: tech.vanCode,
      rating: tech.rating,
      completedJobs: techJobs.length,
      billedAed,
    };
  }).sort((a, b) => b.billedAed - a.billedAed);
}

// --------------------------------------------------------------------------
// 9. PII Masking & Timer Format Helpers
// --------------------------------------------------------------------------
export function maskPhone(phone?: string): string {
  return 'xxxxxxxxx';
}

export function maskEmail(email?: string): string {
  return 'test@i-bnb.com';
}

export function formatTimer(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
