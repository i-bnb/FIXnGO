'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { fetchApi } from '../../../../lib/api-client';
import { JobStatus, ServiceType, Priority } from '@fieldops/shared';
import {
  ClipboardList,
  Plus,
  Eye,
  MapPin,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  UserCheck,
  Users,
  Wrench,
  Receipt,
  FileCheck,
  Star,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  X,
  Camera,
  Image as ImageIcon,
  CheckSquare,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface WorkOrderDetail {
  id: string;
  orderNumber: string;
  title: string;
  serviceType: string;
  status: string;
  priority: string;
  scheduledDate: string;
  address: string;
  area: string;
  customer: {
    companyName: string;
    phone?: string;
  };
  inChargeTech: {
    name: string;
    trade: string;
    phone: string;
    avatar?: string;
    vanCode: string;
  };
  helpers: {
    name: string;
    trade: string;
  }[];
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }[];
  partsFitted: {
    sku: string;
    name: string;
    qty: number;
    costAed: number;
    sellAed: number;
  }[];
  partsRemoved: {
    name: string;
    condition: string;
    action: string;
  }[];
  labourHours: {
    regularHours: number;
    overtimeHours: number;
    labourCostAed: number;
    labourBilledAed: number;
  };
  expenses: {
    category: string;
    description: string;
    amountAed: number;
  }[];
  timeline: {
    status: string;
    timestamp: string;
    actor: string;
    notes: string;
  }[];
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  customerSignature: {
    signedBy: string;
    signedAt: string;
    signatureSvg: boolean;
  };
  csatRating: number;
  csatReview: string;
  revenueAed: number;
  costAed: number;
}

const SAMPLE_WORK_ORDERS: WorkOrderDetail[] = [
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
    customer: { companyName: 'Fatima Al Mansoori', phone: '+971 50 123 4567' },
    inChargeTech: {
      name: 'Rashid Khan',
      trade: 'Senior HVAC Lead',
      phone: '+971 52 101 0001',
      vanCode: 'Van DXB-12 (Toyota HiAce)',
    },
    helpers: [{ name: 'Imran S.', trade: 'HVAC Assistant' }],
    tasks: [
      { id: 't1', title: 'Electrical Lockout/Tagout & safety verification on rooftop unit', completed: true, completedAt: '09:42 AM' },
      { id: 't2', title: 'Connect digital manifold gauges; read suction (45 PSI - low) & discharge pressures', completed: true, completedAt: '09:55 AM' },
      { id: 't3', title: 'Replace bulged Epcos 45 µF run capacitor with heavy-duty OEM capacitor', completed: true, completedAt: '10:18 AM' },
      { id: 't4', title: 'High-pressure nitrogen leak test & vacuum draw to 450 microns', completed: true, completedAt: '10:45 AM' },
      { id: 't5', title: 'R410A refrigerant charge 1.5kg; verify Delta-T (13.2°C) & cold airflow', completed: true, completedAt: '11:15 AM' },
    ],
    partsFitted: [
      { sku: 'MAT-HVAC-CAP45', name: 'Dual Run Capacitor 45/5 µF 450VAC', qty: 1, costAed: 25.0, sellAed: 65.0 },
      { sku: 'MAT-HVAC-GAS410', name: 'R410A Refrigerant Top-up (kg)', qty: 1.5, costAed: 40.0, sellAed: 120.0 },
      { sku: 'SRV-CALLOUT', name: 'Initial Diagnostics & Van Callout Charge', qty: 1, costAed: 35.0, sellAed: 99.0 },
      { sku: 'SRV-LABOUR-HVAC', name: 'Senior HVAC Specialist Labour (2.0 hrs)', qty: 2, costAed: 126.0, sellAed: 180.0 },
    ],
    partsRemoved: [
      { name: 'Defective Epcos 45 µF capacitor', condition: 'Bulged top seal, measured 8 µF (rated 45 µF)', action: 'Disposed in Van DXB-12 E-Waste' },
    ],
    labourHours: {
      regularHours: 2.0,
      overtimeHours: 0,
      labourCostAed: 126.0,
      labourBilledAed: 180.0,
    },
    expenses: [
      { category: 'Parking', description: 'Jumeirah 1 Residential RTA Permit Zone 332B', amountAed: 25.0 },
    ],
    timeline: [
      { status: 'PENDING', timestamp: '08:45 AM', actor: 'Fatima Al Mansoori (Customer App)', notes: 'Reported warm airflow from ceiling ducts' },
      { status: 'ASSIGNED', timestamp: '09:00 AM', actor: 'Sara Al Hashimi (Operations Manager)', notes: 'Assigned Senior Lead Rashid Khan + Helper Imran S.' },
      { status: 'EN_ROUTE', timestamp: '09:15 AM', actor: 'Rashid Khan', notes: 'Departed Al Quoz Central Depot via Al Wasl Rd' },
      { status: 'ON_SITE', timestamp: '09:35 AM', actor: 'Rashid Khan', notes: 'Arrived at Villa 42, geofence verified' },
      { status: 'IN_PROGRESS', timestamp: '09:40 AM', actor: 'Rashid Khan', notes: 'Rooftop Daikin VRV condenser evaluated; capacitor swollen' },
      { status: 'COMPLETED', timestamp: '11:20 AM', actor: 'Rashid Khan', notes: 'Capacitor fitted, 1.5kg R410A charged, 13.2°C Delta-T verified, signed off by Fatima' },
    ],
    beforePhotoUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=400&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    customerSignature: {
      signedBy: 'Fatima Al Mansoori',
      signedAt: 'Today, 11:22 AM',
      signatureSvg: true,
    },
    csatRating: 5,
    csatReview: 'Super quick turnaround! Rashid and Imran diagnosed the capacitor fault within 15 minutes and the living room is ice cold again. Very professional!',
    revenueAed: 464.0,
    costAed: 251.0,
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
    customer: { companyName: 'Al-Harbi Villa Residence', phone: '+971 50 882 1290' },
    inChargeTech: {
      name: 'Vikram Sharma',
      trade: 'Lead Plumber',
      phone: '+971 52 110 0002',
      vanCode: 'Van-02 (Ford Transit)',
    },
    helpers: [{ name: 'Manoj Kumar', trade: 'Pipe Fitter Helper' }],
    tasks: [
      { id: 't1', title: 'Shut off DEWA main water meter valve at street', completed: true, completedAt: '11:15 AM' },
      { id: 't2', title: 'Cut cracked PPR 32mm joint behind kitchen cabinetry', completed: false },
      { id: 't3', title: 'Heat fusion weld new PPR elbow and sleeve', completed: false },
      { id: 't4', title: 'Perform 10-bar hydrostatic pressure test', completed: false },
    ],
    partsFitted: [
      { sku: 'MAT-PLM-PPR32', name: 'PPR Pipe 32mm PN20 (2m)', qty: 1, costAed: 18.0, sellAed: 45.0 },
      { sku: 'MAT-PLM-VALVE12', name: 'Grohe Chrome Angle Valve 1/2"', qty: 1, costAed: 32.0, sellAed: 70.0 },
    ],
    partsRemoved: [
      { name: 'Cracked generic PPR 32mm 90deg elbow', condition: 'Split along weld seam', action: 'Customer retained for inspection' },
    ],
    labourHours: {
      regularHours: 1.5,
      overtimeHours: 0,
      labourCostAed: 45.0,
      labourBilledAed: 150.0,
    },
    expenses: [],
    timeline: [
      { status: 'PENDING', timestamp: '10:45 AM', actor: 'WhatsApp Customer Bot', notes: 'Emergency leak report' },
      { status: 'ASSIGNED', timestamp: '10:50 AM', actor: 'Sarah Jenkins', notes: 'Auto-routed to nearest plumbing crew' },
      { status: 'EN_ROUTE', timestamp: '11:05 AM', actor: 'Vikram Sharma', notes: 'En route, ETA 15 mins via Jumeirah Beach Rd' },
    ],
    beforePhotoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=400&q=80',
    customerSignature: {
      signedBy: 'Pending arrival',
      signedAt: '-',
      signatureSvg: false,
    },
    csatRating: 0,
    csatReview: 'Job currently in progress',
    revenueAed: 265.0,
    costAed: 95.0,
  },
  {
    id: 'wo-3',
    orderNumber: 'WO-2026-003',
    title: 'Short Circuit Tripping Main Substation Breaker',
    serviceType: 'ELECTRICAL',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    scheduledDate: '2026-09-23T14:00:00.000Z',
    address: 'Burj Crown Residences, Downtown Dubai',
    area: 'Downtown Dubai',
    customer: { companyName: 'Burj Crown Owners Association', phone: '+971 4 330 9010' },
    inChargeTech: {
      name: 'Mohammad Rizwan',
      trade: 'Master Electrician',
      phone: '+971 52 110 0003',
      vanCode: 'Van-03 (Nissan Urvan)',
    },
    helpers: [{ name: 'Sajid Ali', trade: 'Electrical Helper' }],
    tasks: [
      { id: 't1', title: 'Megger insulation test on Phase 1, 2, 3 feeders', completed: true, completedAt: '01:10 PM' },
      { id: 't2', title: 'Trace underground conduit water ingress in garden circuit', completed: true, completedAt: '01:45 PM' },
      { id: 't3', title: 'Replace scorched 20A Schneider MCB in external panel', completed: false },
    ],
    partsFitted: [
      { sku: 'MAT-ELEC-MCB20', name: 'Schneider Electric MCB 20A 1-Pole', qty: 2, costAed: 36.0, sellAed: 90.0 },
    ],
    partsRemoved: [
      { name: 'Burnt 20A MCB with carbon deposits', condition: 'Arc damage on load terminal', action: 'Bagged for insurance claim' },
    ],
    labourHours: {
      regularHours: 2.0,
      overtimeHours: 0,
      labourCostAed: 60.0,
      labourBilledAed: 180.0,
    },
    expenses: [
      { category: 'Gate Pass', description: 'Downtown Emaar Security Clearance', amountAed: 50.0 },
    ],
    timeline: [
      { status: 'PENDING', timestamp: '11:30 AM', actor: 'Facility Portal', notes: 'Main DB trip reported' },
      { status: 'ASSIGNED', timestamp: '11:45 AM', actor: 'Sarah Jenkins', notes: 'Assigned to Rizwan' },
      { status: 'IN_PROGRESS', timestamp: '12:45 PM', actor: 'Mohammad Rizwan', notes: 'Isolation in progress' },
    ],
    beforePhotoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    customerSignature: {
      signedBy: 'Pending completion',
      signedAt: '-',
      signatureSvg: false,
    },
    csatRating: 0,
    csatReview: 'Technician on site diagnosing conduit',
    revenueAed: 320.0,
    costAed: 146.0,
  },
  {
    id: 'wo-4',
    orderNumber: 'WO-2026-004',
    title: 'Emergency Generator Interlock Relay Failure (Loss Maker)',
    serviceType: 'ELECTRICAL',
    status: 'COMPLETED',
    priority: 'EMERGENCY',
    scheduledDate: '2026-09-22T21:00:00.000Z',
    address: 'Cold Storage Facility #8, Dubai Industrial City',
    area: 'Dubai Industrial City',
    customer: { companyName: 'Gulf Cold Logistics LLC', phone: '+971 4 888 1200' },
    inChargeTech: {
      name: 'Mohammad Rizwan',
      trade: 'Master Electrician',
      phone: '+971 52 110 0003',
      vanCode: 'Van-03 (Nissan Urvan)',
    },
    helpers: [
      { name: 'Sajid Ali', trade: 'Electrical Helper' },
      { name: 'Naveed Akhtar', trade: 'Junior Electrician' },
    ],
    tasks: [
      { id: 't1', title: 'Night emergency callout to industrial cold storage', completed: true },
      { id: 't2', title: 'Rewire burnt ATS controller control harness', completed: true },
      { id: 't3', title: 'Replace 63A ABB Contactor after 4 emergency supplier runs', completed: true },
    ],
    partsFitted: [
      { sku: 'MAT-ELEC-ABB63', name: 'ABB 63A 4-Pole Contactor 220V Coil', qty: 2, costAed: 620.0, sellAed: 480.0 }, // Under-priced parts
    ],
    partsRemoved: [
      { name: 'Fused contactor coils', condition: 'Overheated during power surge', action: 'Scrapped' },
    ],
    labourHours: {
      regularHours: 2.0,
      overtimeHours: 6.0, // High night overtime cost
      labourCostAed: 420.0,
      labourBilledAed: 300.0,
    },
    expenses: [
      { category: 'Night Emergency Supplier Courier', description: 'Emergency taxi from Sharjah to DIC for contactor', amountAed: 160.0 },
    ],
    timeline: [
      { status: 'COMPLETED', timestamp: '23:45 PM', actor: 'Mohammad Rizwan', notes: 'Cold room back on generator power' },
    ],
    beforePhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
    customerSignature: {
      signedBy: 'Zubair Qureshi (Warehouse Director)',
      signedAt: 'Yesterday, 23:50 PM',
      signatureSvg: true,
    },
    csatRating: 5,
    csatReview: 'Saved AED 250,000 worth of frozen seafood from spoiling! Top speed response.',
    revenueAed: 940.0,
    costAed: 1200.0, // Loss of AED 260!
  },
];

export default function WorkOrdersAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');

  const [orders, setOrders] = useState<WorkOrderDetail[]>(SAMPLE_WORK_ORDERS);
  const [viewMode, setViewMode] = useState<'LIST' | 'KANBAN' | 'CALENDAR'>('LIST');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderDetail | null>(SAMPLE_WORK_ORDERS[0]);
  const [detailTab, setDetailTab] = useState<'OVERVIEW' | 'TEAM' | 'TASKS' | 'PARTS' | 'PHOTOS' | 'PROFITABILITY'>('OVERVIEW');

  useEffect(() => {
    if (idParam) {
      const found = orders.find((o) => o.orderNumber === idParam || o.id === idParam);
      if (found) {
        setSelectedOrder(found);
      }
    }
  }, [idParam, orders]);

  // Columns for DataTable
  const columns: Column<WorkOrderDetail>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (row) => (
        <span className="font-extrabold text-teal-900 bg-teal-50 px-2 py-0.5 rounded font-mono text-xs">
          {row.orderNumber}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Work Description & Location',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.title}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
            <span>{row.area} • {row.customer.companyName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'serviceType',
      header: 'Trade',
      render: (row) => (
        <span
          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
            row.serviceType === 'HVAC'
              ? 'bg-blue-100 text-blue-800'
              : row.serviceType === 'ELECTRICAL'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {row.serviceType}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        let badgeColor = 'bg-slate-100 text-slate-700';
        if (row.status === 'COMPLETED') badgeColor = 'bg-emerald-100 text-emerald-800';
        else if (row.status === 'EN_ROUTE') badgeColor = 'bg-amber-100 text-amber-800';
        else if (row.status === 'IN_PROGRESS') badgeColor = 'bg-blue-100 text-blue-800';
        else if (row.status === 'PENDING') badgeColor = 'bg-red-100 text-red-800';

        return (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'inChargeTech',
      header: 'Field Team',
      render: (row) => (
        <div>
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>{row.inChargeTech.name}</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3 text-slate-400" />
            <span>Headcount: {1 + row.helpers.length}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'revenueAed',
      header: 'Profitability',
      render: (row) => {
        const profit = row.revenueAed - row.costAed;
        const isLoss = profit < 0;
        const margin = Math.round((profit / row.revenueAed) * 100);

        return (
          <div className="text-right">
            <div className="font-black text-slate-900 text-xs">{row.revenueAed.toFixed(2)} AED</div>
            <div className={`text-[10px] font-bold ${isLoss ? 'text-red-600' : 'text-emerald-700'}`}>
              {isLoss ? 'Loss ' : 'Margin '}{margin}% ({profit > 0 ? '+' : ''}{profit.toFixed(0)} AED)
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setSelectedOrder(row)}
          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition"
          title="Inspect Work Order"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>{isArabic ? 'إدارة العمليات الميدانية المتكاملة' : 'Full Lifecycle FSM Control'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'أوامر العمل وإدارة المهام الميدانية' : 'Work Orders & Field Operations'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'متابعة دورة حياة أوامر العمل: الفرق، المهام، المواد المركبة والمستبدلة، وساعات العمل وهامش الربحية'
              : 'Track jobs end-to-end: dispatch team, checklist execution, parts fitted/removed, before/after photos, and job margin'}
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setViewMode('LIST')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'LIST' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{isArabic ? 'قائمة الجداول' : 'Table View'}</span>
          </button>
          <button
            onClick={() => setViewMode('KANBAN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'KANBAN' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{isArabic ? 'لوحة كانبان' : 'Kanban Board'}</span>
          </button>
          <button
            onClick={() => setViewMode('CALENDAR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'CALENDAR' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{isArabic ? 'الجدول الزمني' : 'Schedule Grid'}</span>
          </button>
        </div>
      </div>

      {/* Primary View Mode Render */}
      {viewMode === 'LIST' && (
        <DataTable
          title="Active & Historical Work Orders"
          data={orders}
          columns={columns}
          searchPlaceholder="Search order #, title, customer, or area..."
          searchKeys={['orderNumber', 'title', 'area']}
          exportFileName="work_orders_fsm_export"
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { label: 'Pending', value: 'PENDING' },
                { label: 'En Route', value: 'EN_ROUTE' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Completed', value: 'COMPLETED' },
              ],
            },
            {
              key: 'serviceType',
              label: 'Trade',
              options: [
                { label: 'HVAC', value: 'HVAC' },
                { label: 'Plumbing', value: 'PLUMBING' },
                { label: 'Electrical', value: 'ELECTRICAL' },
              ],
            },
          ]}
        />
      )}

      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {[
            { status: 'PENDING', label: 'Pending Assignment', color: 'border-red-400 bg-red-50/40 text-red-900' },
            { status: 'EN_ROUTE', label: 'En Route / Traveling', color: 'border-amber-400 bg-amber-50/40 text-amber-900' },
            { status: 'IN_PROGRESS', label: 'In Progress / On Site', color: 'border-blue-400 bg-blue-50/40 text-blue-900' },
            { status: 'COMPLETED', label: 'Completed & Signed', color: 'border-emerald-400 bg-emerald-50/40 text-emerald-900' },
          ].map((col) => {
            const colOrders = orders.filter((o) => o.status === col.status);

            return (
              <div key={col.status} className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 min-w-[270px] space-y-3">
                <div className={`px-3 py-1.5 rounded-xl border font-black text-xs flex items-center justify-between ${col.color}`}>
                  <span>{col.label}</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-full text-[10px]">{colOrders.length}</span>
                </div>

                <div className="space-y-2.5">
                  {colOrders.map((wo) => (
                    <div
                      key={wo.id}
                      onClick={() => setSelectedOrder(wo)}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 shadow-sm hover:shadow cursor-pointer transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                          {wo.orderNumber}
                        </span>
                        <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {wo.serviceType}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug">{wo.title}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{wo.area}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">{wo.inChargeTech.name}</span>
                        <span className="font-black text-slate-900">{wo.revenueAed} AED</span>
                      </div>
                    </div>
                  ))}

                  {colOrders.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 font-medium">No orders in this phase</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'CALENDAR' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-black text-slate-900 text-sm">Today's Dispatch Schedule (Wednesday, 23 Sep 2026)</h3>
            <span className="text-xs text-teal-800 font-bold bg-teal-50 px-2.5 py-1 rounded-lg">Gulf Standard Time (GST UTC+4)</span>
          </div>
          <div className="space-y-3">
            {[
              { slot: '09:00 AM - 11:30 AM', order: orders[0] },
              { slot: '11:30 AM - 01:00 PM', order: orders[1] },
              { slot: '01:30 PM - 03:30 PM', order: orders[2] },
              { slot: '09:00 PM - 11:45 PM', order: orders[3] },
            ].map((schedule, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedOrder(schedule.order)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200 cursor-pointer transition gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded-lg shrink-0">
                    {schedule.slot}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{schedule.order.title}</div>
                    <div className="text-[11px] text-slate-500">{schedule.order.customer.companyName} • {schedule.order.area}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border">
                    Lead: {schedule.order.inChargeTech.name}
                  </span>
                  <span className="font-black text-teal-800">{schedule.order.revenueAed} AED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive FSM Detail Drawer / Inspector Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b bg-slate-900 text-white flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-teal-500 text-slate-950 font-black font-mono text-xs rounded">
                    {selectedOrder.orderNumber}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-teal-400 font-black uppercase text-[10px] rounded tracking-wider">
                    {selectedOrder.serviceType}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-bold uppercase text-[10px] rounded">
                    {selectedOrder.status}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black">{selectedOrder.title}</h2>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{selectedOrder.address} ({selectedOrder.area})</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs Navigation */}
            <div className="flex items-center gap-1 bg-slate-100 p-2 border-b border-slate-200 overflow-x-auto text-xs font-bold">
              {[
                { id: 'OVERVIEW', label: 'Timeline & Status', icon: Clock },
                { id: 'TEAM', label: `Crew & Headcount (${1 + selectedOrder.helpers.length})`, icon: Users },
                { id: 'TASKS', label: `Checklist (${selectedOrder.tasks.filter((t) => t.completed).length}/${selectedOrder.tasks.length})`, icon: CheckSquare },
                { id: 'PARTS', label: 'Parts Fitted & Removed', icon: Wrench },
                { id: 'PHOTOS', label: 'Before/After & Signoff', icon: Camera },
                { id: 'PROFITABILITY', label: 'Job P&L Margin', icon: DollarSign },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = detailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                      active ? 'bg-white text-teal-900 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Container */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Tab 1: OVERVIEW & TIMELINE */}
              {detailTab === 'OVERVIEW' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-line dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer & Premise</span>
                      <span className="font-extrabold text-xs text-navy dark:text-white block mt-0.5">{selectedOrder.customer.companyName}</span>
                      <span className="text-[11px] text-slate-500">{selectedOrder.customer.phone}</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-line dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Asset & Equipment</span>
                      <span className="font-extrabold text-xs text-navy dark:text-white block mt-0.5">
                        {selectedOrder.orderNumber === 'WO-24817' ? 'Daikin VRV IV-X 4-Ton Condenser' : 'Building Infrastructure'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">SN: DKN-2023-8841</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-line dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Contract / AMC</span>
                      <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 block mt-0.5">
                        Gold 24/7 AMC (#AMC-2026-0088)
                      </span>
                      <span className="text-[10px] text-slate-500">Next PM: 23 Dec 2026</span>
                    </div>
                    <div className="p-3 bg-orange-50/60 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-900">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-signal-orange uppercase font-bold block">Tax Invoice</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-600 text-white font-black">PAID</span>
                      </div>
                      <span className="font-black text-xs text-navy dark:text-white block mt-0.5">
                        {selectedOrder.orderNumber === 'WO-24817' ? 'INV-10482' : `INV-${selectedOrder.orderNumber}`}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-signal-orange">
                        AED {(selectedOrder.revenueAed * 1.05).toFixed(2)} (incl. 5% VAT)
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                      Lifecycle Event Milestones (Audit Trail)
                    </h4>
                    <div className="space-y-3 relative before:absolute before:start-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {selectedOrder.timeline.map((step, idx) => (
                        <div key={idx} className="relative flex items-start gap-3 ps-8">
                          <div className="absolute start-2 top-1 w-4 h-4 rounded-full bg-teal-600 ring-4 ring-white" />
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{step.status}</span>
                              <span className="text-[10px] text-slate-500">{step.timestamp}</span>
                            </div>
                            <div className="text-[11px] text-teal-800 font-semibold">{step.actor}</div>
                            <p className="text-slate-600 mt-1">{step.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: TEAM & HEADCOUNT */}
              {detailTab === 'TEAM' && (
                <div className="space-y-4">
                  <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wide block mb-1">
                      Lead In-Charge Technician (Supervising)
                    </span>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-black text-slate-900">{selectedOrder.inChargeTech.name}</div>
                        <div className="text-xs text-slate-600">{selectedOrder.inChargeTech.trade} • {selectedOrder.inChargeTech.phone}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-teal-900 bg-teal-100 px-2.5 py-1 rounded-lg">
                          {selectedOrder.inChargeTech.vanCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                      Assigned Helpers & Assistants ({selectedOrder.helpers.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.helpers.map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border text-xs">
                          <div>
                            <span className="font-bold text-slate-900">{h.name}</span>
                            <span className="text-slate-500 text-[11px] block">{h.trade}</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase text-slate-600 bg-white px-2 py-0.5 rounded border">
                            Helper Roster
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: TASKS & CHECKLIST */}
              {detailTab === 'TASKS' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 mb-2">
                    Standard Operating Procedure (SOP) Execution Checklist:
                  </div>
                  {selectedOrder.tasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                        t.completed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          readOnly
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                        <span className={`font-semibold ${t.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {t.title}
                        </span>
                      </div>
                      {t.completedAt && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {t.completedAt}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: PARTS FITTED & REMOVED */}
              {detailTab === 'PARTS' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5 text-xs">
                      <Wrench className="w-3.5 h-3.5 text-teal-700" />
                      <span>Parts & Consumables Fitted</span>
                    </h4>
                    <table className="w-full border rounded-xl overflow-hidden text-start">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2 text-start">Part SKU & Description</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-end">Cost Price</th>
                          <th className="p-2 text-end">Selling Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOrder.partsFitted.map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-2">
                              <span className="font-mono text-[10px] font-bold text-slate-600 block">{p.sku}</span>
                              <span className="font-semibold text-slate-900">{p.name}</span>
                            </td>
                            <td className="p-2 text-center font-bold">{p.qty}</td>
                            <td className="p-2 text-end text-slate-500">{p.costAed.toFixed(2)} AED</td>
                            <td className="p-2 text-end font-bold text-slate-900">{p.sellAed.toFixed(2)} AED</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wide mb-2 text-xs">
                      Defective Parts Removed from Site
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.partsRemoved.map((pr, idx) => (
                        <div key={idx} className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                          <span className="font-bold text-slate-900">{pr.name}</span>
                          <div className="text-[11px] text-slate-600 mt-0.5">Defect: {pr.condition}</div>
                          <div className="text-[10px] font-bold text-red-700 uppercase mt-1">Disposition: {pr.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: BEFORE / AFTER PHOTOS & SIGNATURE */}
              {detailTab === 'PHOTOS' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        <span>Before Repair / Pre-Service Condition</span>
                      </span>
                      <div className="h-48 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedOrder.beforePhotoUrl}
                          alt="Before service"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>After Repair / Completed Installation</span>
                      </span>
                      <div className="h-48 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedOrder.afterPhotoUrl}
                          alt="After service"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Signoff & CSAT */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-700">Digital Customer Signoff</span>
                      <span className="text-[11px] text-slate-500">{selectedOrder.customerSignature.signedAt}</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {selectedOrder.customerSignature.signedBy}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Identity & Delivery Confirmed on Mobile App</span>
                        </div>
                      </div>

                      {/* CSAT Stars */}
                      {selectedOrder.csatRating > 0 && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= selectedOrder.csatRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedOrder.csatReview && (
                      <p className="text-xs italic text-slate-600 bg-white/70 p-2.5 rounded-lg border border-slate-100">
                        "{selectedOrder.csatReview}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 6: JOB PROFITABILITY PANEL */}
              {detailTab === 'PROFITABILITY' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                      <span className="text-[10px] font-bold text-teal-800 uppercase block">Total Revenue</span>
                      <span className="text-sm font-black text-teal-950">{selectedOrder.revenueAed.toFixed(2)} AED</span>
                    </div>
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                      <span className="text-[10px] font-bold text-red-800 uppercase block">Direct Job Costs</span>
                      <span className="text-sm font-black text-red-950">{selectedOrder.costAed.toFixed(2)} AED</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-700 uppercase block">Gross Profit</span>
                      <span className={`text-sm font-black ${(selectedOrder.revenueAed - selectedOrder.costAed) < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {(selectedOrder.revenueAed - selectedOrder.costAed).toFixed(2)} AED
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-700 uppercase block">Gross Margin %</span>
                      <span className={`text-sm font-black ${(selectedOrder.revenueAed - selectedOrder.costAed) < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {Math.round(((selectedOrder.revenueAed - selectedOrder.costAed) / selectedOrder.revenueAed) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Diagnostic Alert if Job is Loss-Making */}
                  {(selectedOrder.revenueAed - selectedOrder.costAed) < 0 && (
                    <div className="p-3.5 bg-red-100 border border-red-300 rounded-xl flex items-start gap-3 text-xs text-red-900">
                      <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black block">Negative Margin Diagnostic Warning:</span>
                        This emergency callout incurred high night-shift overtime (6.0 hrs) and an off-market contractor courier cost of AED 160.00. Quotation billing rate of AED 940 did not account for emergency sourcing surcharges.
                      </div>
                    </div>
                  )}

                  {/* Cost breakdown breakdown */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border space-y-2 text-xs">
                    <span className="font-bold text-slate-800 block">Direct Cost Elements:</span>
                    <div className="flex justify-between py-1 border-b">
                      <span>Parts & Consumables Cost:</span>
                      <span className="font-semibold">
                        {selectedOrder.partsFitted.reduce((acc, p) => acc + p.costAed * p.qty, 0).toFixed(2)} AED
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Field Labour Cost ({selectedOrder.labourHours.regularHours + selectedOrder.labourHours.overtimeHours} hrs):</span>
                      <span className="font-semibold">{selectedOrder.labourHours.labourCostAed.toFixed(2)} AED</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Direct Expenses & Travel:</span>
                      <span className="font-semibold">
                        {selectedOrder.expenses.reduce((acc, e) => acc + e.amountAed, 0).toFixed(2)} AED
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">
                FieldOps ERP v2.4 • TRN 100482910300003
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
