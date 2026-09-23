'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import {
  HardHat,
  Award,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Phone,
  ShieldCheck,
  UserCheck,
  Zap,
  Flame,
  Droplets,
  DollarSign,
  X,
} from 'lucide-react';

interface TechnicianRecord {
  id: string;
  empCode: string;
  name: string;
  trade: 'HVAC' | 'ELECTRICAL' | 'PLUMBING';
  phone: string;
  emiratesId: string;
  drivingLicenseExpiry: string;
  assignedVan: string;
  attendanceStatus: 'ON_SITE' | 'EN_ROUTE' | 'IN_YARD' | 'ON_LEAVE';
  checkInTime: string;
  skills: string[];
  firstTimeFixRate: number; // percentage
  csatRating: number;
  completedJobsCount: number;
  monthlyRevenueAed: number;
  todayJobs: {
    orderNumber: string;
    customer: string;
    area: string;
    timeSlot: string;
    status: string;
  }[];
  recentHistory: {
    orderNumber: string;
    title: string;
    date: string;
    rating: number;
    amountAed: number;
  }[];
}

const SAMPLE_TECHNICIANS: TechnicianRecord[] = [
  {
    id: 'tech-1',
    empCode: 'EMP-T01',
    name: 'Rashid Al-Nuaimi',
    trade: 'HVAC',
    phone: '+971 52 110 0001',
    emiratesId: '784-1991-8829102-1',
    drivingLicenseExpiry: '2028-05-14',
    assignedVan: 'Van-01 (Toyota HiAce 45291)',
    attendanceStatus: 'ON_SITE',
    checkInTime: '07:48 AM (Al Quoz Yard Geofence)',
    skills: ['VRV / VRF Inverter Systems', 'Chiller Compressors', 'Daikin Certified', 'Carrier Specialist', 'Brazing & Nitrogen Testing'],
    firstTimeFixRate: 96,
    csatRating: 4.95,
    completedJobsCount: 142,
    monthlyRevenueAed: 24850,
    todayJobs: [
      { orderNumber: 'WO-2026-001', customer: 'Al Futtaim Properties', area: 'Business Bay', timeSlot: '09:00 AM - 11:30 AM', status: 'COMPLETED' },
      { orderNumber: 'WO-2026-007', customer: 'Sobha Hartland Villa 124', area: 'Sobha Hartland', timeSlot: '02:00 PM - 04:00 PM', status: 'SCHEDULED' },
    ],
    recentHistory: [
      { orderNumber: 'WO-2026-001', title: 'AC Chiller Compressor Capacitor & Wash', date: 'Today', rating: 5, amountAed: 390 },
      { orderNumber: 'WO-2026-089', title: 'VRV PCB Board Replacement & Pressure Balance', date: '21 Sep 2026', rating: 5, amountAed: 1200 },
      { orderNumber: 'WO-2026-074', title: 'Thermostat Wiring & Duct Air Flow Balancing', date: '19 Sep 2026', rating: 5, amountAed: 450 },
    ],
  },
  {
    id: 'tech-2',
    empCode: 'EMP-T02',
    name: 'Vikram Sharma',
    trade: 'PLUMBING',
    phone: '+971 52 110 0002',
    emiratesId: '784-1988-1290881-3',
    drivingLicenseExpiry: '2027-11-20',
    assignedVan: 'Van-02 (Ford Transit 33109)',
    attendanceStatus: 'EN_ROUTE',
    checkInTime: '07:55 AM (Al Quoz Yard Geofence)',
    skills: ['PPR & PEX Fusion Welding', 'High-Pressure Booster Pumps', 'CCTV Drain Inspection', 'Water Heater Safety Valves'],
    firstTimeFixRate: 94,
    csatRating: 4.88,
    completedJobsCount: 98,
    monthlyRevenueAed: 18400,
    todayJobs: [
      { orderNumber: 'WO-2026-002', customer: 'Al-Harbi Villa', area: 'Jumeirah 2', timeSlot: '11:30 AM - 01:00 PM', status: 'EN_ROUTE' },
      { orderNumber: 'WO-2026-009', customer: 'Address Downtown Hotel', area: 'Downtown Dubai', timeSlot: '03:30 PM - 05:00 PM', status: 'SCHEDULED' },
    ],
    recentHistory: [
      { orderNumber: 'WO-2026-081', title: 'Booster Pump Multi-Stage Impeller Overhaul', date: '20 Sep 2026', rating: 5, amountAed: 850 },
      { orderNumber: 'WO-2026-062', title: 'Sewer Line Hydro-Jetting & Blockage Clearance', date: '18 Sep 2026', rating: 4, amountAed: 650 },
    ],
  },
  {
    id: 'tech-3',
    empCode: 'EMP-T03',
    name: 'Mohammad Rizwan',
    trade: 'ELECTRICAL',
    phone: '+971 52 110 0003',
    emiratesId: '784-1985-7761029-4',
    drivingLicenseExpiry: '2029-01-10',
    assignedVan: 'Van-03 (Nissan Urvan 88201)',
    attendanceStatus: 'ON_SITE',
    checkInTime: '07:40 AM (Al Quoz Yard Geofence)',
    skills: ['DEWA Certified Competent Person', '3-Phase Substation Maintenance', 'ATS & Automatic Generator Panels', 'Megger Insulation Testing'],
    firstTimeFixRate: 98,
    csatRating: 4.92,
    completedJobsCount: 120,
    monthlyRevenueAed: 22600,
    todayJobs: [
      { orderNumber: 'WO-2026-003', customer: 'Burj Crown Owners Assoc', area: 'Downtown Dubai', timeSlot: '01:30 PM - 03:30 PM', status: 'ON_SITE' },
    ],
    recentHistory: [
      { orderNumber: 'WO-2026-004', title: 'Emergency ATS Panel Generator Relay Rewire', date: '22 Sep 2026', rating: 5, amountAed: 940 },
      { orderNumber: 'WO-2026-070', title: 'Schneider 160A DB Breaker Upgrade & Load Balance', date: '17 Sep 2026', rating: 5, amountAed: 1100 },
    ],
  },
  {
    id: 'tech-4',
    empCode: 'EMP-T04',
    name: 'Kareem Mostafa',
    trade: 'HVAC',
    phone: '+971 52 110 0004',
    emiratesId: '784-1995-3341829-2',
    drivingLicenseExpiry: '2027-08-30',
    assignedVan: 'Van-04 (Toyota HiAce 12049)',
    attendanceStatus: 'IN_YARD',
    checkInTime: '08:02 AM (Al Quoz Yard Geofence)',
    skills: ['Split AC Installation', 'Duct Cleaning & Coil Disinfection', 'R410A / R32 Gas Charging'],
    firstTimeFixRate: 91,
    csatRating: 4.79,
    completedJobsCount: 85,
    monthlyRevenueAed: 15200,
    todayJobs: [
      { orderNumber: 'WO-2026-011', customer: 'Mrs. Fatima Al-Hashimi', area: 'Downtown Dubai', timeSlot: '04:00 PM - 06:00 PM', status: 'SCHEDULED' },
    ],
    recentHistory: [
      { orderNumber: 'WO-2026-055', title: 'Annual Pre-Summer AC PPM Service', date: '16 Sep 2026', rating: 5, amountAed: 450 },
    ],
  },
];

export default function TechniciansAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [techs, setTechs] = useState<TechnicianRecord[]>(SAMPLE_TECHNICIANS);
  const [selectedTech, setSelectedTech] = useState<TechnicianRecord | null>(SAMPLE_TECHNICIANS[0]);

  const columns: Column<TechnicianRecord>[] = [
    {
      key: 'name',
      header: 'Technician & Code',
      render: (r) => (
        <div>
          <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>{r.name}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {r.empCode} • {r.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'trade',
      header: 'Core Trade',
      render: (r) => (
        <span
          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
            r.trade === 'HVAC'
              ? 'bg-blue-100 text-blue-800'
              : r.trade === 'ELECTRICAL'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {r.trade}
        </span>
      ),
    },
    {
      key: 'attendanceStatus',
      header: 'Current Status',
      render: (r) => {
        let badge = 'bg-slate-100 text-slate-700';
        if (r.attendanceStatus === 'ON_SITE') badge = 'bg-emerald-100 text-emerald-800';
        else if (r.attendanceStatus === 'EN_ROUTE') badge = 'bg-amber-100 text-amber-800';
        else if (r.attendanceStatus === 'IN_YARD') badge = 'bg-blue-100 text-blue-800';

        return (
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${badge}`}>
            {r.attendanceStatus.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'assignedVan',
      header: 'Vehicle Fleet',
      render: (r) => (
        <div className="text-xs text-slate-700 flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-slate-400" />
          <span>{r.assignedVan.split(' ')[0]}</span>
        </div>
      ),
    },
    {
      key: 'firstTimeFixRate',
      header: 'FTF Rate',
      render: (r) => (
        <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
          {r.firstTimeFixRate}%
        </span>
      ),
    },
    {
      key: 'csatRating',
      header: 'Avg CSAT',
      render: (r) => (
        <div className="flex items-center gap-1 text-xs font-black text-slate-900">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{r.csatRating.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: 'monthlyRevenueAed',
      header: 'Billed (AED)',
      render: (r) => (
        <div className="text-right font-black text-slate-900 text-xs">
          {r.monthlyRevenueAed.toLocaleString()} AED
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          onClick={() => setSelectedTech(r)}
          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition"
          title="Open Performance Dossier"
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
            <HardHat className="w-4 h-4" />
            <span>{isArabic ? 'إدارة الموظفين والكوادر الفنية' : 'Human Capital & Field Workforce'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'الفنيين، الكفاءات، وسجل الأداء' : 'Technicians & Performance Scorecards'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'متابعة 12 فني متخصص و8 مساعدين: الحضور الذكي بالجيوفنس، شهادات ديوا، معدل الإصلاح من أول زيارة، ورضا العملاء'
              : 'Workforce analytics: geofenced check-ins, DEWA certification tracking, first-time-fix %, CSAT, and billed revenue'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Field Techs</span>
            <span className="text-lg font-black text-slate-900">12 Leads + 8 Helpers</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Attendance Rate</span>
            <span className="text-lg font-black text-emerald-700">95% Present</span>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <DataTable
        title="Field Service Workforce Roster"
        data={techs}
        columns={columns}
        searchPlaceholder="Search name, code, trade, or van..."
        searchKeys={['name', 'empCode', 'trade', 'assignedVan']}
        exportFileName="technicians_roster_export"
      />

      {/* Detail Scorecard Drawer */}
      {selectedTech && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black text-xl shadow-md">
                {selectedTech.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">{selectedTech.name}</h2>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedTech.empCode}
                  </span>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded uppercase">
                    {selectedTech.trade}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                  <span>Emirates ID: {selectedTech.emiratesId}</span>
                  <span>•</span>
                  <span>License Expiry: {selectedTech.drivingLicenseExpiry}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-800">{selectedTech.assignedVan}</span>
                </div>
              </div>
            </div>

            <div className="text-start sm:text-end">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Today's Attendance</span>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                {selectedTech.checkInTime}
              </span>
            </div>
          </div>

          {/* 4 Scorecard KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
              <span className="text-[10px] font-bold text-teal-800 uppercase block">First-Time Fix Rate</span>
              <span className="text-2xl font-black text-teal-950">{selectedTech.firstTimeFixRate}%</span>
              <span className="text-[11px] text-teal-800 block mt-1">Top quartile in team</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Customer CSAT</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-amber-950">{selectedTech.csatRating.toFixed(2)}</span>
                <span className="text-xs text-amber-700">/ 5.0</span>
              </div>
              <span className="text-[11px] text-amber-800 block mt-1">From {selectedTech.completedJobsCount} jobs</span>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Lifetime Completed Jobs</span>
              <span className="text-2xl font-black text-blue-950">{selectedTech.completedJobsCount}</span>
              <span className="text-[11px] text-blue-800 block mt-1">99.4% SLA adherence</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Billed Revenue (Month)</span>
              <span className="text-2xl font-black text-emerald-950">{selectedTech.monthlyRevenueAed.toLocaleString()} AED</span>
              <span className="text-[11px] text-emerald-800 block mt-1">Profitable margin: 64%</span>
            </div>
          </div>

          {/* Skills & Badges */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Verified Skills & Trade Certifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTech.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-teal-700" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Workload Calendar & Recent Jobs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Today's Workload & Route</span>
              </h4>
              <div className="space-y-2">
                {selectedTech.todayJobs.map((j, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border text-xs flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-teal-800">{j.orderNumber}</span>
                      <div className="font-extrabold text-slate-900 mt-0.5">{j.customer}</div>
                      <div className="text-slate-500 text-[11px]">{j.area} • {j.timeSlot}</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {j.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span>Recent Job History & CSAT Ratings</span>
              </h4>
              <div className="space-y-2">
                {selectedTech.recentHistory.map((h, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border text-xs flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900">{h.title}</div>
                      <div className="text-slate-500 text-[11px]">{h.orderNumber} • {h.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-900">{h.rating}.0</span>
                      </div>
                      <div className="font-mono font-bold text-teal-800 text-[11px] mt-0.5">{h.amountAed} AED</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
