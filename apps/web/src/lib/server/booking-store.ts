/**
 * In-memory / DB-synchronized Server Store for Bookings, Quotes, and Service Requests
 * Handles idempotency keys, real-time customer data, and admin service requests.
 */

export interface CustomerBooking {
  id: string;
  orderNumber: string;
  ticketNumber: string;
  title: string;
  category: 'AC' | 'PLUMBING' | 'ELECTRICAL' | 'LABOUR' | 'RENTAL' | 'MATERIALS';
  serviceType: string;
  status: 'SCHEDULED' | 'EN_ROUTE' | 'ON_SITE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  date: string;
  timeSlot: string;
  technicianName: string;
  technicianPhone: string;
  technicianVan: string;
  technicianRating: number;
  address: string;
  area: string;
  coordinates: [number, number];
  techLocation: [number, number];
  etaMinutes: number;
  subtotalAed: number;
  vatAed: number;
  amountAed: number;
  description: string;
  photoUrl?: string;
  pricingType: 'FIXED' | 'QUOTE';
  workersCount?: number;
  daysCount?: number;
  startDate?: string;
  endDate?: string;
  isPaid: boolean;
  createdAt: string;
}

export interface CustomerQuotation {
  id: string;
  quoteNumber: string;
  workOrderId?: string;
  title: string;
  amountAed: number;
  subtotalAed: number;
  vatAed: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  scope: string;
  createdAt: string;
}

const INITIAL_BOOKINGS: CustomerBooking[] = [
  {
    id: 'wo-24817',
    orderNumber: 'WO-24817',
    ticketNumber: 'SR-2026-0491',
    title: 'AC not cooling · Bedroom 2',
    category: 'AC',
    serviceType: 'HVAC',
    status: 'IN_PROGRESS',
    date: 'Today',
    timeSlot: '01:30 PM - 03:30 PM',
    technicianName: 'Rashid Al-Nuaimi',
    technicianPhone: '+971 50 777 8899',
    technicianVan: 'Van DXB-12 (Toyota HiAce)',
    technicianRating: 4.95,
    address: 'Villa 14, Arabian Ranches, Dubai',
    area: 'Arabian Ranches',
    coordinates: [25.0534, 55.253],
    techLocation: [25.06, 55.26],
    etaMinutes: 12,
    subtotalAed: 249.0,
    vatAed: 12.45,
    amountAed: 261.45,
    description: 'AC blowing warm air in bedroom. Dual run capacitor failed and refrigerant top-up required.',
    pricingType: 'FIXED',
    isPaid: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'wo-24810',
    orderNumber: 'WO-24810',
    ticketNumber: 'SR-2026-0442',
    title: 'AC Quarterly Deep Chemical Cleaning & Coil Wash',
    category: 'AC',
    serviceType: 'HVAC',
    status: 'COMPLETED',
    date: '18 Sep 2026',
    timeSlot: '08:30 AM - 10:30 AM',
    technicianName: 'Rashid Al-Nuaimi',
    technicianPhone: '+971 50 777 8899',
    technicianVan: 'Van DXB-12',
    technicianRating: 4.95,
    address: 'Villa 14, Arabian Ranches, Dubai',
    area: 'Arabian Ranches',
    coordinates: [25.0534, 55.253],
    techLocation: [25.0534, 55.253],
    etaMinutes: 0,
    subtotalAed: 333.33,
    vatAed: 16.67,
    amountAed: 350.0,
    description: 'Filter cleaning and evaporator coil disinfection for master bedroom split unit.',
    pricingType: 'FIXED',
    isPaid: true,
    createdAt: '2026-09-18T08:30:00Z',
  },
];

const INITIAL_QUOTE: CustomerQuotation = {
  id: 'qt-2026-0081',
  quoteNumber: 'QT-2026-0081',
  workOrderId: 'wo-24817',
  title: 'Complete Condenser Dual-Capacitor & Coil Chemical Wash',
  subtotalAed: 4619.05,
  vatAed: 230.95,
  amountAed: 4850.0,
  status: 'PENDING',
  scope: 'Supply & installation of high-capacity dual run capacitors, nitrogen leak test, and full R410A recharge.',
  createdAt: new Date().toISOString(),
};

// Global persistence across Next.js requests in development and production
const g = globalThis as unknown as {
  __fixngo_bookings__?: CustomerBooking[];
  __fixngo_quote__?: CustomerQuotation | null;
  __fixngo_idempotency__?: Map<string, CustomerBooking>;
  __fixngo_order_counter__?: number;
};

if (!g.__fixngo_bookings__) {
  g.__fixngo_bookings__ = [...INITIAL_BOOKINGS];
}

if (!g.__fixngo_quote__) {
  g.__fixngo_quote__ = { ...INITIAL_QUOTE };
}

if (!g.__fixngo_idempotency__) {
  g.__fixngo_idempotency__ = new Map<string, CustomerBooking>();
}

if (!g.__fixngo_order_counter__) {
  g.__fixngo_order_counter__ = 24825;
}

export function getCustomerBookings(): CustomerBooking[] {
  return g.__fixngo_bookings__ || [];
}

export function getActiveJob(): CustomerBooking | null {
  const all = getCustomerBookings();
  return all.find((b) => b.status === 'IN_PROGRESS' || b.status === 'EN_ROUTE' || b.status === 'ON_SITE') || null;
}

export function getCustomerQuotation(): CustomerQuotation | null {
  return g.__fixngo_quote__ ?? null;
}

export function updateCustomerQuotationStatus(id: string, status: 'APPROVED' | 'REJECTED'): CustomerQuotation | null {
  if (g.__fixngo_quote__) {
    g.__fixngo_quote__.status = status;

    // Update associated work order
    if (g.__fixngo_quote__.workOrderId && g.__fixngo_bookings__) {
      const b = g.__fixngo_bookings__.find((item) => item.id === g.__fixngo_quote__?.workOrderId);
      if (b) {
        if (status === 'APPROVED') {
          b.status = 'SCHEDULED';
        } else {
          b.status = 'CANCELLED';
        }
      }
    }
    return g.__fixngo_quote__;
  }
  return null;
}

export function createBooking(data: {
  serviceType: string;
  category: 'AC' | 'PLUMBING' | 'ELECTRICAL' | 'LABOUR' | 'RENTAL' | 'MATERIALS';
  taskId: string;
  title: string;
  description?: string;
  photoUrl?: string;
  address: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  scheduledDate: string;
  scheduledSlot: string;
  workersCount?: number;
  daysCount?: number;
  startDate?: string;
  endDate?: string;
  pricingType: 'FIXED' | 'QUOTE';
  estimatedPriceAed?: number;
  idempotencyKey?: string;
}): { booking: CustomerBooking; isDuplicate: boolean } {
  // Idempotency check
  if (data.idempotencyKey && g.__fixngo_idempotency__?.has(data.idempotencyKey)) {
    const existing = g.__fixngo_idempotency__.get(data.idempotencyKey)!;
    return { booking: existing, isDuplicate: true };
  }

  g.__fixngo_order_counter__ = (g.__fixngo_order_counter__ || 24825) + 1;
  const orderNumber = `WO-${g.__fixngo_order_counter__}`;
  const ticketNumber = `SR-2026-0${g.__fixngo_order_counter__ - 24300}`;
  const id = `wo-${g.__fixngo_order_counter__}`;

  const basePrice = data.estimatedPriceAed || 149.0;
  const vatAed = Number((basePrice * 0.05).toFixed(2));
  const amountAed = Number((basePrice + vatAed).toFixed(2));

  // Determine assigned technician based on skill/category
  let techName = 'Rashid Al-Nuaimi';
  let techPhone = '+971 50 777 8899';
  let techVan = 'Van DXB-12';
  let techRating = 4.95;

  if (data.category === 'PLUMBING') {
    techName = 'Tariq Al-Mansoor';
    techPhone = '+971 50 555 1234';
    techVan = 'Van DXB-02';
    techRating = 4.88;
  } else if (data.category === 'ELECTRICAL') {
    techName = 'Zayd Al-Falasi';
    techPhone = '+971 50 444 5678';
    techVan = 'Van DXB-07';
    techRating = 4.91;
  } else if (data.category === 'RENTAL') {
    techName = 'Omar Al-Mutawa';
    techPhone = '+971 50 333 9876';
    techVan = 'Heavy Transport DXB-09';
    techRating = 4.9;
  } else if (data.category === 'LABOUR') {
    techName = 'Bilal Siddiqui';
    techPhone = '+971 50 222 3456';
    techVan = 'Crew Transport Van-05';
    techRating = 4.87;
  }

  const newBooking: CustomerBooking = {
    id,
    orderNumber,
    ticketNumber,
    title: data.title,
    category: data.category,
    serviceType: data.serviceType,
    status: 'SCHEDULED',
    date: data.scheduledDate || 'Today',
    timeSlot: data.scheduledSlot || 'Immediate Callout',
    technicianName: techName,
    technicianPhone: techPhone,
    technicianVan: techVan,
    technicianRating: techRating,
    address: data.address || 'Burj Crown, Downtown Dubai',
    area: data.area || 'Downtown Dubai',
    coordinates: [data.latitude || 25.1972, data.longitude || 55.2744],
    techLocation: [25.1856, 55.2708],
    etaMinutes: 25,
    subtotalAed: basePrice,
    vatAed,
    amountAed,
    description: data.description || 'On-demand service booking',
    photoUrl: data.photoUrl,
    pricingType: data.pricingType,
    workersCount: data.workersCount,
    daysCount: data.daysCount,
    startDate: data.startDate,
    endDate: data.endDate,
    isPaid: false,
    createdAt: new Date().toISOString(),
  };

  g.__fixngo_bookings__ = [newBooking, ...(g.__fixngo_bookings__ || [])];

  if (data.idempotencyKey && g.__fixngo_idempotency__) {
    g.__fixngo_idempotency__.set(data.idempotencyKey, newBooking);
  }

  return { booking: newBooking, isDuplicate: false };
}
