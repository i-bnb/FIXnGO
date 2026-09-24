'use client';

import React, { useState, useMemo } from 'react';
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
import {
  getCanonicalMetrics,
  getCanonicalCategoryBreakdown,
  getCanonicalTechnicianLeaderboard,
  CANONICAL_INVENTORY,
  CANONICAL_WORK_ORDERS,
  CANONICAL_RENTAL_FLEET,
} from '@fieldops/shared';

export default function AdminDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [dateRange, setDateRange] = useState<'TODAY' | '7D' | 'SEP' | 'Q3' | 'ALL'>('SEP');

  const period = dateRange === 'ALL' || dateRange === 'Q3' ? '6M' : 'SEP';

  // Derived metrics from single source of truth
  const metrics = useMemo(() => getCanonicalMetrics(period), [period]);
  const categoriesRaw = useMemo(() => getCanonicalCategoryBreakdown(period), [period]);
  const techLeaderboard = useMemo(() => getCanonicalTechnicianLeaderboard(period), [period]);

  // Realistic 6-Month P&L Data (AED)
  const monthlyPnLData = [
    { month: 'Apr 2026', revenue: 312000, expenses: 238000, profit: 74000 },
    { month: 'May 2026', revenue: 348000, expenses: 262000, profit: 86000 },
    { month: 'Jun 2026', revenue: 412000, expenses: 310000, profit: 102000 },
    { month: 'Jul 2026', revenue: 445000, expenses: 338000, profit: 107000 },
    { month: 'Aug 2026', revenue: 468000, expenses: 352000, profit: 116000 },
    { month: 'Sep 2026', revenue: 486240, expenses: 367840, profit: 118400 },
  ];

  // Category Distribution (Jobs by Service Trade including Labour Supply)
  const categoryData = useMemo(() => {
    return categoriesRaw.map((cat) => ({
      name: isArabic ? cat.nameAr : cat.nameEn,
      value: cat.count,
      percent: `${cat.percent}%`,
      color: cat.color,
    }));
  }, [categoriesRaw, isArabic]);

  // Selected High-Margin vs Loss-Making Jobs from CANONICAL_WORK_ORDERS
  const profitabilityJobs = useMemo(() => {
    // Pick two loss makers and three high margin jobs
    const lossMakers = CANONICAL_WORK_ORDERS.filter((w) => w.isLossMaker).slice(0, 2);
    const highMargin = CANONICAL_WORK_ORDERS.filter((w) => !w.isLossMaker && w.marginPercent > 45).slice(0, 3);
    return [...highMargin, ...lossMakers];
  }, []);

  // Low Stock Items (Below safety reorder level)
  const lowStockAlerts = useMemo(() => {
    return CANONICAL_INVENTORY.filter((item) => item.isLowStock).slice(0, 4);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header: Greeting, Subtitle, Date Filter, Export */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-signal-orange">
              {isArabic ? 'لوحة القيادة التنفيذية' : 'Executive Operations'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-signal-orange dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800">
              UAE 5% FTA VAT
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              {metrics.periodLabel}
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

      {/* SLA Alert Banner (Critical Warning with Canonical Entities) */}
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
                  ? '3 طلبات تجاوزت مهلة الاستجابة. طلب WO-2026-00025 (تسريب حاد، ديرة) ينتظر منذ 2 ساعة و10 دقائق دون تعيين فني.'
                  : '3 jobs are past their SLA. WO-2026-00025 (leak, Deira) has waited 2h 10m with no technician assigned.'}
              </p>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                {isArabic
                  ? 'العميل: مجمع كريسنت باي التجاري • الرقة، ديرة • الأقرب: طارق المنصور (على بعد 3.4 كم)'
                  : 'Customer: Crescent Bay Commercial Complex • Al Rigga, Deira • Nearest available: Tariq Al-Mansoor (3.4 km away)'}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/admin/dispatch?highlight=WO-2026-00025`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-signal-orange hover:bg-signal-orange-hover text-white font-bold text-xs sm:text-sm min-h-[44px] transition shadow-md whitespace-nowrap"
          >
            <span>{isArabic ? 'تعيين الفني الآن ←' : 'Assign now →'}</span>
          </Link>
        </div>
      </div>

      {/* 6 Dynamic KPI Cards */}
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
            <div className="text-xl sm:text-2xl font-black font-display text-navy dark:text-white font-mono">
              AED {(metrics.revenueBilledAed / 1000).toFixed(1)}k
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+14.8% vs Prev</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{metrics.periodLabel}</div>
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
              {metrics.activeCount}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mt-1">
              8 High Priority
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dispatched & In Transit</div>
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
              {metrics.completedCount}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <span>98.4% First-Time Fix</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Total tickets closed</div>
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
              {CANONICAL_RENTAL_FLEET.filter((e) => e.status === 'ON_HIRE').length} / {CANONICAL_RENTAL_FLEET.length}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              {metrics.fleetUtilizationPercent}% Utilization
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Active duty units</div>
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
              <span>★★★★★ {metrics.totalCustomers} Clients</span>
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
              {isArabic ? `إجمالي ${metrics.totalOrders} أمر عمل عبر إمارات الدولة` : `Total ${metrics.totalOrders} service tickets across UAE`}
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
                  {isArabic ? `${metrics.lossMakerCount} أوامر خاسرة` : `${metrics.lossMakerCount} Loss-Makers`}
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
                {profitabilityJobs.map((j) => (
                  <tr
                    key={j.id}
                    className={
                      j.isLossMaker
                        ? 'bg-rose-50/50 dark:bg-rose-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }
                  >
                    <td className="py-3 px-3">
                      <Link
                        href={`/${locale}/admin/work-orders/${j.orderNumber}`}
                        className="font-bold text-navy dark:text-white hover:text-signal-orange flex items-center gap-1.5"
                      >
                        <span className="font-mono">{j.orderNumber}</span>
                        {j.isLossMaker && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200">
                            Loss Maker
                          </span>
                        )}
                      </Link>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{j.title}</div>
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        href={`/${locale}/admin/customers/${j.customerId}`}
                        className="text-slate-900 dark:text-slate-100 font-semibold hover:text-signal-orange transition"
                      >
                        {j.customerName}
                      </Link>
                      <div className="text-[10px] text-slate-400">{j.area}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-navy dark:text-white font-mono">
                      AED {j.subtotalAed.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 font-mono">
                      AED {j.costAed.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg text-xs ${
                          j.isLossMaker
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {j.isLossMaker ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        <span>
                          {j.marginPercent > 0 ? `+${j.marginPercent}%` : `${j.marginPercent}%`}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technician Leaderboard (Deterministic Canonical Data) */}
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
                {isArabic ? `عرض الـ ${techLeaderboard.length} فنيين` : `All ${techLeaderboard.length} Techs`}
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {isArabic ? 'الترتيب حسب تقييمات العملاء والإيرادات المنجزة' : 'Ranked by customer CSAT rating & billed revenue'}
            </p>

            <div className="space-y-2.5">
              {techLeaderboard.map((t, idx) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-ground dark:bg-slate-800/60 border border-line/60 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-navy text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                      {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
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
                        {t.trade} · {t.completedJobs} jobs
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {techLeaderboard.length} Active
              </span>
            </div>
            <div className="text-xl font-bold font-display text-navy dark:text-white">
              {techLeaderboard.length} Certified Technicians
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active across Dubai & Northern Emirates depots · Ready for on-call dispatch
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
                {metrics.fleetUtilizationPercent}% Active
              </span>
            </div>
            <div className="text-xl font-bold font-display text-navy dark:text-white">
              {CANONICAL_RENTAL_FLEET.filter((e) => e.status === 'ON_HIRE').length} / {CANONICAL_RENTAL_FLEET.length} On Hire
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gensets, Boom lifts & Excavators · Available for dispatch in Al Quoz yard
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
                {lowStockAlerts.length} Items Low
              </span>
            </div>
            <div className="text-xl font-bold font-display text-navy dark:text-white">
              Safety Reorder
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {lowStockAlerts.map((i) => i.name.split(' (')[0]).join(', ')}
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
                AED {(metrics.outstandingReceivablesAed / 1000).toFixed(1)}k Due
              </span>
            </div>
            <div className="text-xl font-bold font-display text-navy dark:text-white font-mono">
              AED {metrics.outstandingReceivablesAed.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Outstanding receivables reconciled across all active and completed customer accounts
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
