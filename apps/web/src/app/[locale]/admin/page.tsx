'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Tractor,
  DollarSign,
  Package,
  Calendar,
  ChevronRight,
  MapPin,
  ArrowUpRight,
  Filter,
  ShieldAlert,
  Flame,
  Star,
  HardHat,
  Truck,
  ArrowRight,
  Download,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [dateRange, setDateRange] = useState<'TODAY' | '7D' | 'SEP' | 'Q3' | 'ALL'>('SEP');

  // Realistic 6-Month P&L Data (AED)
  const monthlyPnLData = [
    { month: 'Apr 2026', revenue: 312000, expenses: 238000, profit: 74000 },
    { month: 'May 2026', revenue: 348000, expenses: 262000, profit: 86000 },
    { month: 'Jun 2026', revenue: 412000, expenses: 310000, profit: 102000 },
    { month: 'Jul 2026', revenue: 445000, expenses: 338000, profit: 107000 },
    { month: 'Aug 2026', revenue: 468000, expenses: 352000, profit: 116000 },
    { month: 'Sep 2026', revenue: 486240, expenses: 367840, profit: 118400 },
  ];

  // Category Distribution (Jobs by Service)
  const categoryData = [
    { name: isArabic ? 'تكييف الهواء (HVAC)' : 'Air Conditioning (HVAC)', value: 184, percent: '46%', color: '#C2410C' }, // signal orange
    { name: isArabic ? 'الأنظمة الكهربائية' : 'Electrical Systems', value: 96, percent: '24%', color: '#0A7BA8' }, // ocean blue
    { name: isArabic ? 'السباكة والتصريف' : 'Plumbing & Drainage', value: 72, percent: '18%', color: '#0C2233' }, // navy
    { name: isArabic ? 'تأجير المعدات الثقيلة' : 'Heavy Equipment Rental', value: 32, percent: '8%', color: '#D97706' }, // amber
    { name: isArabic ? 'توريد العمالة' : 'Contract Labour Supply', value: 16, percent: '4%', color: '#059669' }, // emerald
  ];

  // Top High-Margin vs Loss-Making Jobs
  const profitabilityJobs = [
    {
      order: 'WO-24817',
      title: 'Daikin VRV 4-Ton Condenser Overhaul & R410A Recharge',
      customer: 'Fatima Al Mansoori',
      area: 'Jumeirah 1',
      billed: 487.20,
      cost: 251.00,
      profit: 236.20,
      margin: 48.5,
      status: 'HIGH_MARGIN',
    },
    {
      order: 'WO-24818',
      title: 'Villa 14 MDB Main Panel Busbar Upgrade',
      customer: 'Palm Jumeirah Residence',
      area: 'Palm Jumeirah',
      billed: 3200.00,
      cost: 1350.00,
      profit: 1850.00,
      margin: 57.8,
      status: 'HIGH_MARGIN',
    },
    {
      order: 'WO-24805',
      title: 'Main Kitchen Riser Booster Line Valve Replacement',
      customer: 'Al-Harbi Villa',
      area: 'Jumeirah 2',
      billed: 420.00,
      cost: 210.00,
      profit: 210.00,
      margin: 50.0,
      status: 'STANDARD',
    },
    {
      order: 'WO-24812',
      title: 'Underground Chilled Water Line Flange Burst',
      customer: 'Sobha Constructions LLC',
      area: 'Sobha Hartland',
      billed: 320.00,
      cost: 660.00,
      profit: -340.00,
      margin: -106.3,
      status: 'LOSS_MAKER',
    },
    {
      order: 'WO-24801',
      title: 'HVAC Dual Compressor Seizure (Underquoted Emergency)',
      customer: 'Al Futtaim Properties',
      area: 'Business Bay',
      billed: 450.00,
      cost: 1040.00,
      profit: -590.00,
      margin: -131.1,
      status: 'LOSS_MAKER',
    },
  ];

  // Technician Leaderboard
  const techniciansLeaderboard = [
    { name: 'Rashid Khan', trade: 'HVAC Lead', van: 'Van DXB-12', completed: 48, rating: 4.96, billedAed: 44200, avatar: 'RK' },
    { name: 'Vikram Patel', trade: 'Electrical Lead', van: 'Van DXB-04', completed: 42, rating: 4.92, billedAed: 38900, avatar: 'VP' },
    { name: 'Farhan Siddiqui', trade: 'HVAC Tech', van: 'Van DXB-07', completed: 39, rating: 4.88, billedAed: 35100, avatar: 'FS' },
    { name: 'Hasan Al-Banna', trade: 'Plumbing Lead', van: 'Van DXB-02', completed: 36, rating: 4.85, billedAed: 32600, avatar: 'HB' },
    { name: 'Ahmed Mustafa', trade: 'Electrician', van: 'Van DXB-09', completed: 34, rating: 4.90, billedAed: 30800, avatar: 'AM' },
  ];

  // Low Stock Items (Below safety reorder level)
  const lowStockAlerts = [
    { code: 'ITM-0005', name: 'R410A Refrigerant Gas Cylinder 11.3kg', location: 'Van DXB-12 (Rashid)', available: 2, reorder: 5 },
    { code: 'ITM-0001', name: 'Dual Run Capacitor 45+5 µF 450VAC', location: 'Al Quoz Central WH', available: 3, reorder: 10 },
    { code: 'ITM-0012', name: 'Schneider 32A 2-Pole High Breaking MCB', location: 'Musaffah Store', available: 4, reorder: 12 },
    { code: 'ITM-0024', name: 'PPR PN20 High-Pressure Pipe 32mm 4m', location: 'Van DXB-08 (Joseph)', available: 2, reorder: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Page 11 Header: Greeting, Subtitle, Date Filter, Export */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-signal-orange">
              {isArabic ? 'لوحة القيادة التنفيذية' : 'Executive Operations'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-signal-orange dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800">
              UAE 5% FTA VAT
            </span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-navy dark:text-white tracking-tight">
            {isArabic ? 'مساء الخير، سارة' : 'Good afternoon, Sara'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isArabic
              ? 'إليك ما يحدث في العمليات الميدانية اليوم · الأربعاء، 23 سبتمبر 2026'
              : "Here's what's happening across operations today · Wednesday, 23 Sep 2026"}
          </p>
        </div>

        {/* Date Filter & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-ground dark:bg-slate-800 rounded-xl text-xs font-semibold border border-line dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {[
              { id: 'TODAY', label: isArabic ? 'اليوم' : 'Today' },
              { id: '7D', label: isArabic ? '7 أيام' : '7D' },
              { id: 'SEP', label: isArabic ? '1 – 30 سبتمبر' : '1 – 30 Sep 2026' },
              { id: 'Q3', label: isArabic ? 'الربع الثالث' : 'Q3 2026' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg transition text-xs ${
                  dateRange === tab.id
                    ? 'bg-white dark:bg-slate-900 text-navy dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            href={`/${locale}/admin/reports`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-line dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isArabic ? 'تصدير التقرير' : 'Export'}</span>
          </Link>
        </div>
      </div>

      {/* Page 11 SLA Alert Banner (Critical Warning) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-rose-400/80 bg-rose-50 dark:bg-rose-950/30 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  {isArabic ? 'تنبيه عاجل لمستوى الخدمة (SLA)' : 'CRITICAL SLA RESPONSE ALERT'}
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              </div>
              <p className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {isArabic
                  ? '3 طلبات تجاوزت مهلة الاستجابة. طلب WO-24825 (تسريب حاد، ديرة) ينتظر منذ 2 ساعة و10 دقائق دون تعيين فني.'
                  : '3 jobs are past their SLA. WO-24825 (leak, Deira) has waited 2h 10m with no technician assigned.'}
              </p>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                {isArabic
                  ? 'العميل: طارق منصور • الرقة، ديرة • الأقرب: الفني جوزيف ماثيو (على بعد 3.4 كم)'
                  : 'Customer: Tariq Mansoor • Al Rigga, Deira • Nearest available: Joseph Mathew (3.4 km away)'}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/admin/dispatch?highlight=WO-24825`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-signal-orange hover:bg-signal-orange-hover text-white font-bold text-xs sm:text-sm min-h-[44px] transition shadow-md whitespace-nowrap"
          >
            <span>{isArabic ? 'تعيين الفني الآن ←' : 'Assign now →'}</span>
          </Link>
        </div>
      </div>

      {/* Page 11: 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Revenue */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              {isArabic ? 'إجمالي الإيرادات' : 'Revenue'}
            </span>
            <DollarSign className="w-4 h-4 text-signal-orange" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-display text-navy dark:text-white">
              AED 486.2k
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+14.8% vs Aug</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Target: AED 423.5k</div>
          </div>
        </div>

        {/* KPI 2: Active Work Orders */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              {isArabic ? 'أوامر العمل النشطة' : 'Active Orders'}
            </span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-display text-amber-600 dark:text-amber-400">
              38
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mt-1">
              8 High Priority
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">12 on site · 18 transit</div>
          </div>
        </div>

        {/* KPI 3: Completed Jobs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              {isArabic ? 'الأعمال المكتملة' : 'Completed Jobs'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-display text-emerald-600 dark:text-emerald-400">
              412
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <span>98.4% First-Time Fix</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">+42 jobs vs target</div>
          </div>
        </div>

        {/* KPI 4: SLA Compliance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              {isArabic ? 'الالتزام بـ SLA' : 'SLA Compliance'}
            </span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-display text-navy dark:text-white">
              94.2%
            </div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
              <span>Target: 95.0%</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">3 breached today</div>
          </div>
        </div>

        {/* KPI 5: Fleet on Road */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              {isArabic ? 'الأسطول على الطريق' : 'Fleet on Road'}
            </span>
            <Truck className="w-4 h-4 text-ocean-blue" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-display text-ocean-blue">
              18 / 20 Vans
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              90% Active Field Duty
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">2 in scheduled service</div>
          </div>
        </div>

        {/* KPI 6: Customer Satisfaction */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              {isArabic ? 'رضا العملاء' : 'CSAT Rating'}
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-display text-navy dark:text-white flex items-center gap-1">
              <span>4.9</span>
              <span className="text-sm font-normal text-slate-400">/ 5.0</span>
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1 flex items-center gap-0.5">
              <span>★★★★★ 328 reviews</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">99.1% positive</div>
          </div>
        </div>
      </div>

      {/* Main Charts: Monthly Revenue vs Expenses + Jobs by Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Revenue & Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-navy dark:text-white">
                {isArabic ? 'الإيرادات الشهرية مقابل التكاليف المباشرة (AED)' : 'Monthly Revenue vs. Direct Expenses (AED)'}
              </h2>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'مطابقة مع قيود الأستاذ العام المتوازنة (أبريل – سبتمبر 2026)'
                  : 'Reconciled with General Ledger audit journal vouchers (Apr – Sep 2026)'}
              </p>
            </div>
            <Link
              href={`/${locale}/admin/finance`}
              className="text-xs font-bold text-signal-orange hover:text-signal-orange-hover flex items-center gap-1"
            >
              <span>{isArabic ? 'تقرير الأرباح والخسائر الكامل' : 'Full P&L Report'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPnLData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e2da" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4a5763' }} />
                <YAxis tick={{ fontSize: 11, fill: '#4a5763' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`AED ${Number(val).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#0c2233',
                    borderColor: '#13202b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="revenue" name={isArabic ? 'الإيرادات المحصلة' : 'Billed Revenue'} fill="#C2410C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name={isArabic ? 'التكاليف المباشرة' : 'Direct Expenses (COGS)'} fill="#0A7BA8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs by Service Donut & List Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-navy dark:text-white">
              {isArabic ? 'الخدمات حسب التخصص' : 'Jobs by Service Trade'}
            </h2>
            <p className="text-xs text-slate-400">
              {isArabic ? 'إجمالي 400 أمر عمل عبر إمارات الدولة' : 'Total 400 service tickets across UAE'}
            </p>
          </div>

          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-line dark:border-slate-800 text-xs">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </span>
                <span className="font-bold text-navy dark:text-white">
                  {c.value} ({c.percent})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Profitability Diagnostics + Technician Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Profitability Diagnostics Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-navy dark:text-white">
                  {isArabic ? 'تحليل ربحية أوامر العمل' : 'Job Profitability Diagnostics'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold border border-rose-200">
                  {isArabic ? '2 أوامر خاسرة' : '2 Loss-Makers'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? 'مقارنة الأسعار المفوترة بالتكاليف الفعلية للقطع وساعات العمل والانتقال'
                  : 'Compares billed price against consumed van stock, labour hours, and transit'}
              </p>
            </div>
            <Link
              href={`/${locale}/admin/work-orders`}
              className="text-xs font-bold text-signal-orange hover:text-signal-orange-hover flex items-center gap-1"
            >
              <span>{isArabic ? 'عرض الأوامر' : 'All Orders'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ground dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">{isArabic ? 'أمر العمل / الوصف' : 'Order / Scope'}</th>
                  <th className="py-2.5 px-3">{isArabic ? 'العميل' : 'Customer'}</th>
                  <th className="py-2.5 px-3 text-right">{isArabic ? 'المفوتر (AED)' : 'Billed'}</th>
                  <th className="py-2.5 px-3 text-right">{isArabic ? 'التكلفة (AED)' : 'Cost'}</th>
                  <th className="py-2.5 px-3 text-right">{isArabic ? 'هامش الربح' : 'Gross Margin'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-slate-800 font-medium">
                {profitabilityJobs.map((j, i) => (
                  <tr
                    key={i}
                    className={
                      j.profit < 0
                        ? 'bg-rose-50/50 dark:bg-rose-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }
                  >
                    <td className="py-3 px-3">
                      <Link
                        href={`/${locale}/admin/work-orders?id=${j.order}`}
                        className="font-bold text-navy dark:text-white hover:text-signal-orange flex items-center gap-1.5"
                      >
                        <span>{j.order}</span>
                        {j.order === 'WO-24817' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-100 text-signal-orange font-bold">
                            Demo Hero
                          </span>
                        )}
                      </Link>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{j.title}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-900 dark:text-slate-100 font-semibold">{j.customer}</div>
                      <div className="text-[10px] text-slate-400">{j.area}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-navy dark:text-white font-mono">
                      AED {j.billed.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 font-mono">
                      AED {j.cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg text-xs ${
                          j.profit < 0
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {j.profit < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        <span>
                          {j.profit > 0 ? `+${j.margin}%` : `${j.margin}%`}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technician Leaderboard */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-base font-bold text-navy dark:text-white">
                {isArabic ? 'قائمة الفنيين المتصدرين' : 'Technician Leaderboard'}
              </h2>
              <Link
                href={`/${locale}/admin/technicians`}
                className="text-xs font-bold text-signal-orange hover:text-signal-orange-hover"
              >
                {isArabic ? 'عرض الـ 18 فني' : 'All 18 Techs'}
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {isArabic ? 'الترتيب حسب تقييمات العملاء والإيرادات المنجزة' : 'Ranked by customer CSAT rating & billed revenue'}
            </p>

            <div className="space-y-2.5">
              {techniciansLeaderboard.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-ground dark:bg-slate-800/60 border border-line/60 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-navy text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-navy dark:text-white flex items-center gap-1.5">
                        <span>{t.name}</span>
                        {idx === 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                            #1 Top Lead
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {t.trade} · {t.van} · {t.completed} jobs
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-navy dark:text-white flex items-center gap-1 justify-end">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{t.rating}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      AED {t.billedAed.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Bottom Operational Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Live Field Team Status */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
                {isArabic ? 'الفريق الميداني' : 'Field Team Status'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 18 Active
              </span>
            </div>
            <div className="text-xl font-bold font-display text-navy dark:text-white">
              18 Technicians
            </div>
            <p className="text-xs text-slate-500 mt-1">
              12 on site with customers · 4 en route · 2 available at Al Quoz depot
            </p>
          </div>

          <Link
            href={`/${locale}/admin/dispatch`}
            className="mt-3 text-xs font-bold text-signal-orange hover:text-signal-orange-hover flex items-center gap-1"
          >
            <span>{isArabic ? 'لوحة الترحيل المباشرة' : 'Open Live Dispatch'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Widget 2: Equipment Fleet Utilization */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
                {isArabic ? 'تأجير المعدات' : 'Equipment Utilization'}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                68% Active
              </span>
            </div>
            <div className="text-xl font-bold font-display text-navy dark:text-white">
              27 / 40 On Hire
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gensets, Boom lifts & Excavators · 13 ready for dispatch in Al Quoz yard
            </p>
          </div>

          <Link
            href={`/${locale}/admin/equipment`}
            className="mt-3 text-xs font-bold text-signal-orange hover:text-signal-orange-hover flex items-center gap-1"
          >
            <span>{isArabic ? 'عقود التأجير وجدول المعدات' : 'View Equipment Fleet'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Widget 3: Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
                {isArabic ? 'تنبيهات المخزون' : 'Low Stock Alert'}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full">
                4 Items Low
              </span>
            </div>
            <div className="text-xl font-bold font-display text-navy dark:text-white">
              Safety Reorder
            </div>
            <p className="text-xs text-slate-500 mt-1">
              R410A gas, 45µF capacitors, 32A MCB breakers, and PPR pipes below min threshold
            </p>
          </div>

          <Link
            href={`/${locale}/admin/inventory`}
            className="mt-3 text-xs font-bold text-signal-orange hover:text-signal-orange-hover flex items-center gap-1"
          >
            <span>{isArabic ? 'أوامر الشراء وإعادة التعبئة' : 'Draft POs & Reorder'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Widget 4: Receivables Aging */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
                {isArabic ? 'تعمير الذمم المدينة' : 'Receivables Aging'}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full">
                AED 94.3k Due
              </span>
            </div>
            <div className="text-xl font-bold font-display text-navy dark:text-white">
              A/R Outstanding
            </div>
            <p className="text-xs text-slate-500 mt-1">
              0-30d: 62.4k · 31-60d: 21.2k · 61-90d: 7.5k · 90d+: 3.2k
            </p>
          </div>

          <Link
            href={`/${locale}/admin/finance`}
            className="mt-3 text-xs font-bold text-signal-orange hover:text-signal-orange-hover flex items-center gap-1"
          >
            <span>{isArabic ? 'تفاصيل الذمم والتحصيل' : 'View Aging Ledger'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
