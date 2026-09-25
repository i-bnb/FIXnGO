import { UAE_CONSTANTS, SERVICE_PACKAGES, UAE_KEY_LOCATIONS, ServiceType, JobStatus, Priority, PaymentStatus } from '@fieldops/shared';
import { getApiBaseUrl } from './config';

const API_BASE_URL = getApiBaseUrl();

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'API request failed');
    }

    return await res.json();
  } catch (error) {
    // In production, never silently hide database/network failures with mock data
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK !== 'true') {
      console.error(`Production API request to ${endpoint} failed:`, error);
      throw error;
    }

    console.warn(`API call to ${endpoint} failed or offline, using fallback state:`, error);
    return getFallbackData<T>(endpoint, options);
  }
}

/**
 * Resilient fallback data generator ensuring 100% demo stability
 */
function getFallbackData<T>(endpoint: string, options?: RequestInit): T {
  if (endpoint.includes('/api/dispatch/overview')) {
    return {
      technicians: [
        {
          id: 'tech-1',
          trade: 'HVAC',
          isAvailable: true,
          currentLatitude: 25.1972,
          currentLongitude: 55.2744,
          ratingAverage: 4.95,
          completedJobsCount: 142,
          user: { fullName: 'Rashid Al-Nuaimi', phone: '+971521100001', role: 'TECHNICIAN' },
        },
        {
          id: 'tech-2',
          trade: 'PLUMBING',
          isAvailable: false,
          currentLatitude: 25.1856,
          currentLongitude: 55.2708,
          ratingAverage: 4.88,
          completedJobsCount: 98,
          user: { fullName: 'Vikram Sharma', phone: '+971521100002', role: 'TECHNICIAN' },
        },
        {
          id: 'tech-3',
          trade: 'ELECTRICAL',
          isAvailable: true,
          currentLatitude: 25.1325,
          currentLongitude: 55.2341,
          ratingAverage: 4.92,
          completedJobsCount: 120,
          user: { fullName: 'Mohammad Rizwan', phone: '+971521100003', role: 'TECHNICIAN' },
        },
        {
          id: 'tech-4',
          trade: 'HVAC',
          isAvailable: true,
          currentLatitude: 25.0762,
          currentLongitude: 55.1403,
          ratingAverage: 4.79,
          completedJobsCount: 85,
          user: { fullName: 'Kareem Mostafa', phone: '+971521100004', role: 'TECHNICIAN' },
        },
      ],
      unassignedOrders: [
        {
          id: 'wo-pending-1',
          orderNumber: 'WO-2026-003',
          title: 'Short Circuit Tripping Main Substation Breaker',
          serviceType: 'ELECTRICAL',
          priority: 'HIGH',
          status: 'PENDING',
          address: 'Burj Crown Residences, Downtown Dubai',
          area: 'Downtown Dubai',
          latitude: 25.1972,
          longitude: 55.2744,
          totalAmount: 231.0,
          customer: { companyName: 'Palm Crest Properties LLC' },
        },
      ],
      activeOrders: [
        {
          id: 'wo-active-1',
          orderNumber: 'WO-2026-002',
          title: 'Kitchen Main Supply Pipe Severe Leak',
          serviceType: 'PLUMBING',
          priority: 'EMERGENCY',
          status: 'EN_ROUTE',
          address: 'Villa 24, Jumeirah 2, Dubai',
          area: 'Jumeirah 2',
          latitude: 25.2048,
          longitude: 55.2435,
          totalAmount: 189.0,
          technician: { user: { fullName: 'Vikram Sharma' } },
        },
      ],
      stats: {
        totalTechs: 4,
        availableTechs: 3,
        pendingJobs: 1,
        inProgressJobs: 1,
      },
    } as unknown as T;
  }

  if (endpoint.includes('/api/work-orders')) {
    return {
      items: [
        {
          id: 'wo-24817',
          orderNumber: 'WO-24817',
          title: 'AC Not Cooling - Master Bedroom & Living Hall (Daikin VRV)',
          serviceType: 'HVAC',
          status: 'COMPLETED',
          priority: 'HIGH',
          scheduledDate: '2026-09-23T09:00:00.000Z',
          address: 'Villa 42, Al Wasl Road, Jumeirah 1, Dubai',
          area: 'Jumeirah 1',
          subtotal: 464.0,
          vatAmount: 23.20,
          totalAmount: 487.20,
          customer: { companyName: 'Fatima Al Mansoori', defaultAddress: 'Villa 42, Jumeirah 1' },
          technician: { user: { fullName: 'Rashid Khan' } },
        },
        {
          id: 'wo-24825',
          orderNumber: 'WO-24825',
          title: 'Emergency Water Pipe Burst & Ceiling Inundation',
          serviceType: 'PLUMBING',
          status: 'PENDING',
          priority: 'EMERGENCY',
          scheduledDate: '2026-09-23T11:30:00.000Z',
          address: 'Flat 402, Al Rigga St, Deira, Dubai',
          area: 'Deira',
          subtotal: 495.24,
          vatAmount: 24.76,
          totalAmount: 520.0,
          customer: { companyName: 'Tariq Mansoor', defaultAddress: 'Al Rigga, Deira' },
          technician: null,
        },
        {
          id: 'wo-2',
          orderNumber: 'WO-2026-002',
          title: 'Kitchen Main Supply Pipe Severe Leak',
          serviceType: 'PLUMBING',
          status: 'EN_ROUTE',
          priority: 'EMERGENCY',
          scheduledDate: '2026-09-23T11:30:00.000Z',
          address: 'Villa 24, Street 14B, Jumeirah 2, Dubai',
          area: 'Jumeirah 2',
          subtotal: 180.0,
          vatAmount: 9.0,
          totalAmount: 189.0,
          customer: { companyName: 'Al-Harbi Villa Residence', defaultAddress: 'Jumeirah 2' },
          technician: { user: { fullName: 'Joseph Mathew' } },
        },
        {
          id: 'wo-3',
          orderNumber: 'WO-2026-003',
          title: 'Short Circuit Tripping Main Substation Breaker',
          serviceType: 'ELECTRICAL',
          status: 'PENDING',
          priority: 'HIGH',
          scheduledDate: '2026-09-23T14:00:00.000Z',
          address: 'Burj Crown Residences, Downtown Dubai',
          area: 'Downtown Dubai',
          subtotal: 220.0,
          vatAmount: 11.0,
          totalAmount: 231.0,
          customer: { companyName: 'Palm Crest Properties LLC' },
        },
      ],
      total: 3,
    } as unknown as T;
  }

  if (endpoint.includes('/api/manpower/workers')) {
    return [
      { id: '1', workerCode: 'MP-E01', fullName: 'Sajid Ali', trade: 'ELECTRICIAN', yearsOfExperience: 5, status: 'DEPLOYED', hourlyBillingRate: 55, currentSiteName: 'Crescent Bay Commercial Tower' },
      { id: '2', workerCode: 'MP-E02', fullName: 'Naveed Akhtar', trade: 'ELECTRICIAN', yearsOfExperience: 4, status: 'AVAILABLE', hourlyBillingRate: 55, currentSiteName: null },
      { id: '3', workerCode: 'MP-P01', fullName: 'Manoj Kumar', trade: 'PLUMBER', yearsOfExperience: 6, status: 'DEPLOYED', hourlyBillingRate: 50, currentSiteName: 'Al-Noor Community' },
      { id: '4', workerCode: 'MP-H01', fullName: 'Anwar Hossain', trade: 'HVAC_TECHNICIAN', yearsOfExperience: 7, status: 'AVAILABLE', hourlyBillingRate: 65, currentSiteName: null },
      { id: '5', workerCode: 'MP-G01', fullName: 'Gurpreet Singh', trade: 'GENERAL_HELPER', yearsOfExperience: 3, status: 'DEPLOYED', hourlyBillingRate: 38, currentSiteName: 'Palm Crest Downtown' },
    ] as unknown as T;
  }

  if (endpoint.includes('/api/manpower/requisitions')) {
    return [
      { id: '1', requisitionNumber: 'REQ-2026-081', clientName: 'Al-Noor General Contracting', projectName: 'Crescent Bay Phase 2', tradeRequired: 'ELECTRICIAN', quantityRequired: 6, dailyRatePerWorker: 440, totalEstimatedValue: 118800, status: 'ACTIVE' },
      { id: '2', requisitionNumber: 'REQ-2026-082', clientName: 'Al-Noor Contracting LLC', projectName: 'Al-Noor Community Villas', tradeRequired: 'PLUMBER', quantityRequired: 4, dailyRatePerWorker: 400, totalEstimatedValue: 48000, status: 'ACTIVE' },
    ] as unknown as T;
  }

  if (endpoint.includes('/api/equipment')) {
    return [
      { id: '1', code: 'EQ-GEN-100', name: 'Caterpillar 100 kVA Soundproof Diesel Generator', category: 'Power Generators', serialNumber: 'CAT-GEN-2024-998', status: 'RENTED', dailyRate: 450, currentLocation: 'Aldar Yas Island Site' },
      { id: '2', code: 'EQ-SCAF-06', name: 'Aluminium Mobile Scaffolding Tower (6 Metres)', category: 'Access Equipment', serialNumber: 'ALU-SCAF-2025-104', status: 'AVAILABLE', dailyRate: 120, currentLocation: 'Al Quoz Central Yard' },
      { id: '3', code: 'EQ-LIFT-12', name: 'Haulotte 12m Electric Scissor Lift', category: 'Access Equipment', serialNumber: 'HAU-LIFT-2023-441', status: 'AVAILABLE', dailyRate: 380, currentLocation: 'Al Quoz Central Yard' },
      { id: '4', code: 'EQ-BRK-01', name: 'Hilti TE 1000-AVR Demolition Breaker', category: 'Power Tools', serialNumber: 'HLT-BRK-2025-331', status: 'AVAILABLE', dailyRate: 150, currentLocation: 'Al Quoz Central Yard' },
    ] as unknown as T;
  }

  if (endpoint.includes('/api/inventory/items')) {
    return [
      { id: '1', itemCode: 'MAT-HVAC-GAS410', name: 'R410A Refrigerant Gas (11.3 kg Cylinder)', category: { name: 'HVAC' }, unit: 'cyl', costPrice: 220, sellingPrice: 380, totalStockQuantity: 45, warehouseQuantity: 35, vansQuantity: 10, reorderLevel: 10 },
      { id: '2', itemCode: 'MAT-HVAC-CAP45', name: 'Dual Capacitor 45/5 uF', category: { name: 'HVAC' }, unit: 'pcs', costPrice: 25, sellingPrice: 75, totalStockQuantity: 120, warehouseQuantity: 90, vansQuantity: 30, reorderLevel: 25 },
      { id: '3', itemCode: 'MAT-ELEC-MCB20', name: 'Schneider Electric MCB 20A 1-Pole', category: { name: 'Electrical' }, unit: 'pcs', costPrice: 18, sellingPrice: 45, totalStockQuantity: 200, warehouseQuantity: 160, vansQuantity: 40, reorderLevel: 30 },
      { id: '4', itemCode: 'MAT-PLM-VALVE12', name: 'Grohe Chrome Angle Valve 1/2"', category: { name: 'Plumbing' }, unit: 'pcs', costPrice: 32, sellingPrice: 70, totalStockQuantity: 80, warehouseQuantity: 60, vansQuantity: 20, reorderLevel: 15 },
    ] as unknown as T;
  }

  if (endpoint.includes('/api/billing/invoices')) {
    return [
      {
        id: 'inv-10482',
        invoiceNumber: 'INV-2026-00001',
        customerName: 'Palm Crest Properties LLC',
        customerTrn: '100000000000001 (demo)',
        companyTrn: '100000000000003 (demo)',
        issueDate: '2026-09-23',
        dueDate: '2026-09-23',
        subtotal: 464.0,
        vatRate: 0.05,
        vatAmount: 23.20,
        totalAmount: 487.20,
        paymentStatus: 'PAID',
        paymentMethod: 'STRIPE_APPLE_PAY',
        items: [
          { description: 'Initial Diagnostics & Van Callout Charge', quantity: 1, unitPrice: 99, totalWithVat: 103.95 },
          { description: 'Dual Run Capacitor 45/5 µF 450VAC', quantity: 1, unitPrice: 65, totalWithVat: 68.25 },
          { description: 'R410A Refrigerant Virgin Gas Recharge (1.5 kg)', quantity: 1.5, unitPrice: 80, totalWithVat: 126.0 },
          { description: 'Senior HVAC Specialist Labour (2.0 hrs)', quantity: 2, unitPrice: 90, totalWithVat: 189.0 },
        ],
      },
      {
        id: '1',
        invoiceNumber: 'INV-2026-00002',
        customerName: 'Al-Noor Residential Compound',
        customerTrn: '100000000000003 (demo)',
        companyTrn: '100000000000003 (demo)',
        issueDate: '2026-09-23',
        dueDate: '2026-10-07',
        subtotal: 365.0,
        vatRate: 0.05,
        vatAmount: 18.25,
        totalAmount: 383.25,
        paymentStatus: 'PAID',
        paymentMethod: 'STRIPE_CARD',
        items: [
          { description: 'AC Diagnostic & Callout', quantity: 1, unitPrice: 150, totalWithVat: 157.5 },
          { description: 'Dual Capacitor 45/5 uF', quantity: 1, unitPrice: 75, totalWithVat: 78.75 },
          { description: 'Coil Sanitization', quantity: 1, unitPrice: 140, totalWithVat: 147.0 },
        ],
      },
    ] as unknown as T;
  }

  if (endpoint.includes('/api/audit-logs')) {
    return {
      items: [
        { id: '1', timestamp: new Date().toISOString(), actorName: 'Sarah Jenkins', actorRole: 'DISPATCHER', action: 'DISPATCH', entityName: 'WorkOrder', entityId: 'WO-2026-002', detailsJson: { tech: 'Vikram Sharma' } },
        { id: '2', timestamp: new Date().toISOString(), actorName: 'Sultan Al-Mansoor', actorRole: 'SUPER_ADMIN', action: 'CREATE', entityName: 'WorkOrder', entityId: 'WO-2026-001', detailsJson: { orderNumber: 'WO-2026-001' } },
        { id: '3', timestamp: new Date().toISOString(), actorName: 'Fatima Al-Zahra', actorRole: 'ACCOUNTANT', action: 'PAYMENT', entityName: 'Invoice', entityId: 'INV-2026-0001', detailsJson: { amountAed: 383.25 } },
      ],
      total: 3,
    } as unknown as T;
  }

  return {} as T;
}
