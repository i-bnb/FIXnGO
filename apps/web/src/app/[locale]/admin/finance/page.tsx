'use client';

import React, { useState } from 'react';
import {
  Banknote,
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Download,
  Mail,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';

interface JournalEntry {
  id: string;
  jvNumber: string;
  date: string;
  memo: string;
  debitAccount: string;
  creditAccount: string;
  amountAed: number;
  sourceDoc: string;
}

const SAMPLE_JOURNALS: JournalEntry[] = [
  {
    id: 'jv-1',
    jvNumber: 'JV-10482',
    date: '2026-09-23',
    memo: 'WO-24817 Tax Invoicing - Fatima Al Mansoori (Daikin VRV Repair)',
    debitAccount: '1200 Accounts Receivable (Trade Debtors)',
    creditAccount: '4010 Field Maintenance Revenue (AED 464.00) & 2110 VAT Output (AED 23.20)',
    amountAed: 487.20,
    sourceDoc: 'INV-10482',
  },
  {
    id: 'jv-2',
    jvNumber: 'JV-10483',
    date: '2026-09-23',
    memo: 'Customer Apple Pay / Stripe Settlement for INV-10482',
    debitAccount: '1020 Stripe Clearing / Emirates NBD',
    creditAccount: '1200 Accounts Receivable',
    amountAed: 487.20,
    sourceDoc: 'PAY-10482',
  },
  {
    id: 'jv-3',
    jvNumber: 'JV-10484',
    date: '2026-09-23',
    memo: 'Van DXB-12 Stock Consumed (Capacitor 45µF + 1.5kg R410A)',
    debitAccount: '5010 Material Consumables & Spare Parts Cost',
    creditAccount: '1300 Van DXB-12 Field Inventory Asset',
    amountAed: 105.00,
    sourceDoc: 'WO-24817',
  },
  {
    id: 'jv-4',
    jvNumber: 'JV-10481',
    date: '2026-09-22',
    memo: 'Danfoss Refrigerants Al Quoz Central Warehouse Bulk PO Delivery',
    debitAccount: '1300 Central Inventory Asset (Warehouse)',
    creditAccount: '2010 Accounts Payable (Danfoss FZE)',
    amountAed: 14850.00,
    sourceDoc: 'PO-2026-0091',
  },
  {
    id: 'jv-5',
    jvNumber: 'JV-10480',
    date: '2026-09-21',
    memo: 'Weekly ENOC Fleet Fuel & Salik Toll Tolls Reconciliation (18 Vans)',
    debitAccount: '6010 Fleet Vehicle Fuel & Toll Expenses',
    creditAccount: '1010 Emirates NBD Operating Main',
    amountAed: 4620.00,
    sourceDoc: 'EXP-2026-118',
  },
];

const MONTHLY_CASHFLOW_DATA = [
  { month: 'Apr 2026', revenue: 312000, expenses: 238000, cashflow: 74000 },
  { month: 'May 2026', revenue: 348000, expenses: 262000, cashflow: 86000 },
  { month: 'Jun 2026', revenue: 412000, expenses: 310000, cashflow: 102000 },
  { month: 'Jul 2026', revenue: 445000, expenses: 338000, cashflow: 107000 },
  { month: 'Aug 2026', revenue: 468000, expenses: 352000, cashflow: 116000 },
  { month: 'Sep 2026', revenue: 486240, expenses: 367840, cashflow: 118400 },
];

export default function FinanceAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'PL' | 'CASHFLOW' | 'JOURNALS' | 'AGING' | 'COA'>('PL');
  const [dunningSent, setDunningSent] = useState<string | null>(null);

  const handleSendDunning = (client: string) => {
    setDunningSent(
      isArabic
        ? `تم إرسال إشعار المطالبة والتحصيل المعتمد إلى ${client} بنجاح.`
        : `Dunning payment reminder with FTA tax invoice & IBAN details dispatched to ${client}.`
    );
    setTimeout(() => setDunningSent(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page 14 Header: Title, Subtitle, VAT & Export Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-signal-orange">
              {isArabic ? 'الإدارة المالية ودفتر الأستاذ العام' : 'General Ledger & Financial Accounting'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200">
              FTA VAT Form 201 Compliant
            </span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-navy dark:text-white tracking-tight flex items-center gap-2">
            <Banknote className="w-6 h-6 text-signal-orange" />
            <span>{isArabic ? 'المالية، القيود المتوازنة، والأرباح والخسائر' : 'Financial Statement & Double-Entry Ledger'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isArabic
              ? 'دفتر أستاذ متوازن بنسبة 100%، أرصدة البنوك، فترات تعمير الذمم المدينة والدائنة، وقائمة الدخل الحية لأعمال الصيانة والتوريد والتأجير'
              : 'Double-entry General Ledger: balanced vouchers (Debits = Credits), A/R aging buckets, cash balances, and real-time EBITDA'}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSendDunning('All Overdue Clients')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ground dark:bg-slate-800 border border-line dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 transition min-h-[40px]"
          >
            <Mail className="w-3.5 h-3.5 text-signal-orange" />
            <span>{isArabic ? 'إرسال مطالبات الذمم' : 'Run Dunning Sweep'}</span>
          </button>

          <button
            onClick={() => alert('FTA VAT 201 Return Exported successfully.')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-signal-orange hover:bg-signal-orange-hover text-white text-xs font-bold transition shadow-xs min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تصدير إقرار ضريبة القيمة المضافة' : 'Export VAT 201'}</span>
          </button>
        </div>
      </div>

      {/* Dunning Notice Success Alert */}
      {dunningSent && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{dunningSent}</span>
        </div>
      )}

      {/* Page 14: 5 Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Revenue */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isArabic ? 'الإيرادات (MTD)' : 'Gross Revenue'}
          </span>
          <div className="text-xl sm:text-2xl font-black font-display text-navy dark:text-white mt-1">
            AED 486.2k
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+14.8% vs Aug</span>
          </div>
        </div>

        {/* KPI 2: Expenses */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isArabic ? 'المصروفات المباشرة' : 'Direct Expenses'}
          </span>
          <div className="text-xl sm:text-2xl font-black font-display text-ocean-blue mt-1">
            AED 367.8k
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Parts, Wages & OPEX</div>
        </div>

        {/* KPI 3: Net Profit */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isArabic ? 'صافي الأرباح (EBITDA)' : 'Net Profit (EBITDA)'}
          </span>
          <div className="text-xl sm:text-2xl font-black font-display text-emerald-600 mt-1">
            AED 118.4k
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">24.3% Net Margin</div>
        </div>

        {/* KPI 4: Receivables */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isArabic ? 'الذمم المدينة (A/R)' : 'Receivables (A/R)'}
          </span>
          <div className="text-xl sm:text-2xl font-black font-display text-signal-orange mt-1">
            AED 94.3k
          </div>
          <div className="text-[10px] text-amber-600 font-bold mt-1">AED 3.2k Overdue &gt;90d</div>
        </div>

        {/* KPI 5: Payables */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isArabic ? 'الذمم الدائنة (A/P)' : 'Payables (A/P)'}
          </span>
          <div className="text-xl sm:text-2xl font-black font-display text-slate-700 dark:text-slate-200 mt-1">
            AED 41.7k
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Vendors & Suppliers</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-line dark:border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'PL', label: isArabic ? 'قائمة الأرباح والخسائر (P&L)' : 'Profit & Loss (P&L)', icon: TrendingUp },
          { id: 'CASHFLOW', label: isArabic ? 'التدفقات النقدية' : 'Monthly Cashflow Trend', icon: DollarSign },
          { id: 'JOURNALS', label: isArabic ? `قيود اليومية المتوازنة (${SAMPLE_JOURNALS.length})` : `Balanced Journals (${SAMPLE_JOURNALS.length})`, icon: FileSpreadsheet },
          { id: 'AGING', label: isArabic ? 'تعمير الذمم المدينة والدائنة' : 'A/R & A/P Aging Buckets', icon: Clock },
          { id: 'COA', label: isArabic ? 'دليل الحسابات الموحد (COA)' : 'Chart of Accounts (COA)', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition text-xs font-bold ${
                active
                  ? 'bg-navy text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-ground dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: P&L Statement */}
      {activeTab === 'PL' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-line dark:border-slate-800 p-6 shadow-xs space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-line dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-navy dark:text-white">
                Statement of Profit or Loss (6 Months Ended Sep 2026)
              </h3>
              <p className="text-slate-400 text-[11px]">
                FIXnGO Technical Services LLC · Registered Tax Payer TRN 100482910300003 · Figures in AED
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200">
              AUDITED / UNQUALIFIED
            </span>
          </div>

          <div className="space-y-4">
            {/* 1. Revenue Streams */}
            <div className="space-y-2">
              <span className="font-display font-bold text-navy dark:text-white text-sm block">
                1. Operating Revenue Streams
              </span>
              <div className="space-y-1.5 ps-3 border-s-2 border-signal-orange">
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Field Service Maintenance (HVAC, Electrical, Plumbing):</span>
                  <span className="font-bold text-navy dark:text-white font-mono">264,800.00 AED</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Gold & Silver Annual Maintenance Contracts (AMC):</span>
                  <span className="font-bold text-navy dark:text-white font-mono">118,240.00 AED</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Heavy Equipment Rental Hire (Gensets, Boom Lifts):</span>
                  <span className="font-bold text-navy dark:text-white font-mono">68,400.00 AED</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Genuine Spare Parts & Material POS Retail:</span>
                  <span className="font-bold text-navy dark:text-white font-mono">34,800.00 AED</span>
                </div>
                <div className="flex justify-between pt-1.5 font-bold text-navy dark:text-white text-xs">
                  <span>Gross Operating Revenue:</span>
                  <span className="font-mono text-sm text-signal-orange">486,240.00 AED</span>
                </div>
              </div>
            </div>

            {/* 2. Cost of Sales & Direct Job Costs */}
            <div className="space-y-2">
              <span className="font-display font-bold text-navy dark:text-white text-sm block">
                2. Cost of Goods Sold & Direct Job Costs (COGS)
              </span>
              <div className="space-y-1.5 ps-3 border-s-2 border-ocean-blue">
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Material Consumables & Van Stock (Refrigerants, Capacitors, Valves):</span>
                  <span className="font-bold text-rose-600 font-mono">114,500.00 AED</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Direct Field Technician & Helper Wages (Job-Allocated Hours):</span>
                  <span className="font-bold text-rose-600 font-mono">108,200.00 AED</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Equipment Fleet Scheduled Servicing & Depreciation:</span>
                  <span className="font-bold text-rose-600 font-mono">27,100.00 AED</span>
                </div>
                <div className="flex justify-between pt-1.5 font-bold text-navy dark:text-white text-xs">
                  <span>Total Direct Cost of Sales:</span>
                  <span className="font-mono text-sm text-rose-600">249,800.00 AED</span>
                </div>
              </div>
            </div>

            {/* Gross Profit Banner */}
            <div className="p-3.5 bg-ground dark:bg-slate-800 rounded-xl border border-line dark:border-slate-700 flex justify-between font-bold text-sm text-navy dark:text-white">
              <span>Gross Profit (48.6% Gross Margin):</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">236,440.00 AED</span>
            </div>

            {/* 3. OPEX */}
            <div className="space-y-2">
              <span className="font-display font-bold text-navy dark:text-white text-sm block">
                3. Operating Expenses (OPEX)
              </span>
              <div className="space-y-1.5 ps-3 border-s-2 border-line">
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Fleet Fuel, Salik Tolls, Insurance & RTA Commercial Registration:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">48,600.00 AED</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Al Quoz Central Warehouse & Depot Rent + DEWA Utilities:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">42,400.00 AED</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Cloud Software, Dispatch Telematics, Safety Certifications & Admin:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">27,000.00 AED</span>
                </div>
              </div>
            </div>

            {/* Net Operating Profit EBITDA */}
            <div className="p-4 bg-navy text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between font-bold text-base gap-2 shadow-md">
              <span className="font-display">Net Operating Profit (EBITDA):</span>
              <span className="text-emerald-400 font-mono text-lg font-black">
                118,440.00 AED (24.3% Net Margin)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Cashflow Trend */}
      {activeTab === 'CASHFLOW' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-line dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-line dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-navy dark:text-white">
                Monthly Cashflow & Revenue Trajectory (Apr – Sep 2026)
              </h3>
              <p className="text-xs text-slate-400">
                Operating cash inflow vs. supplier/labour outflows reconciled with Emirates NBD bank accounts
              </p>
            </div>
            <span className="text-xs font-bold text-signal-orange">
              All figures in AED
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MONTHLY_CASHFLOW_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Billed Revenue" fill="#C2410C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Direct Costs & OPEX" fill="#0A7BA8" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="cashflow" name="Operating Cashflow" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Balanced Journal Vouchers */}
      {activeTab === 'JOURNALS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-line dark:border-slate-800 p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-line dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-bold text-navy dark:text-white text-sm">
                Balanced Double-Entry Journal Vouchers (Debits = Credits)
              </h3>
              <p className="text-slate-400 text-[11px]">
                Enforced accounting invariance: Total debits strictly balance total credits
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Balanced Invariant Enforced</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ground dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Voucher #</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Narrative & Customer</th>
                  <th className="p-2.5">Debited Account</th>
                  <th className="p-2.5">Credited Account</th>
                  <th className="p-2.5 text-right">Amount (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-slate-800 font-medium">
                {SAMPLE_JOURNALS.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-mono font-bold text-signal-orange">{j.jvNumber}</td>
                    <td className="p-2.5 text-slate-500 whitespace-nowrap">{j.date}</td>
                    <td className="p-2.5 font-semibold text-navy dark:text-white">
                      <div>{j.memo}</div>
                      <span className="text-[10px] font-mono text-slate-400">{j.sourceDoc}</span>
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">{j.debitAccount}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">{j.creditAccount}</td>
                    <td className="p-2.5 text-right font-black font-mono text-navy dark:text-white">
                      AED {j.amountAed.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: A/R & A/P Aging Summary */}
      {activeTab === 'AGING' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-line dark:border-slate-800 p-5 space-y-5 text-xs">
          <div>
            <h3 className="font-display font-bold text-navy dark:text-white text-sm">
              Accounts Receivable (A/R) Aging Summary & Dunning Matrix
            </h3>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Outstanding trade customer balances categorized by invoice maturity
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Current (0-30 Days)</span>
              <span className="text-sm font-black text-emerald-950 dark:text-emerald-300 mt-1 block font-mono">
                62,400.00 AED
              </span>
            </div>
            <div className="p-3 bg-ground dark:bg-slate-800 rounded-xl border border-line dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">31-60 Days</span>
              <span className="text-sm font-black text-navy dark:text-white mt-1 block font-mono">
                21,200.00 AED
              </span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">61-90 Days</span>
              <span className="text-sm font-black text-amber-950 dark:text-amber-300 mt-1 block font-mono">
                7,500.00 AED
              </span>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-800 block">90+ Days (Overdue)</span>
              <span className="text-sm font-black text-rose-950 dark:text-rose-300 mt-1 block font-mono">
                3,200.00 AED
              </span>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200">
              <span className="text-[10px] uppercase font-bold text-signal-orange block">Total Receivables</span>
              <span className="text-sm font-black text-signal-orange mt-1 block font-mono">
                94,300.00 AED
              </span>
            </div>
          </div>

          {/* Aging Clients Breakdown Table */}
          <div className="border border-line dark:border-slate-800 rounded-xl overflow-hidden mt-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-ground dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Client Organization</th>
                  <th className="p-2.5">Invoice #</th>
                  <th className="p-2.5">Days Aged</th>
                  <th className="p-2.5 text-right">Balance Due</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-slate-800">
                {[
                  { client: 'Palm Crest Properties LLC', inv: 'INV-2026-00398', days: 92, balance: 3200.00, status: 'OVERDUE' },
                  { client: 'Desert Rose Logistics LLC', inv: 'INV-2026-00412', days: 68, balance: 4800.00, status: 'WARNING' },
                  { client: 'Blue Sky Towers Owners Association', inv: 'INV-2026-00440', days: 42, balance: 12400.00, status: 'FOLLOWUP' },
                  { client: 'Crescent Bay Commercial Complex', inv: 'INV-2026-00475', days: 14, balance: 28600.00, status: 'CURRENT' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium">
                    <td className="p-2.5 font-bold text-navy dark:text-white">{row.client}</td>
                    <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300">{row.inv}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.days > 90 ? 'bg-rose-100 text-rose-800' : row.days > 60 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {row.days} days
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-black font-mono text-navy dark:text-white">
                      AED {row.balance.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleSendDunning(row.client)}
                        className="px-2.5 py-1 rounded-lg bg-ground hover:bg-slate-200 border border-line text-signal-orange font-bold text-[11px] transition"
                      >
                        Send Notice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Chart of Accounts (COA) */}
      {activeTab === 'COA' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-line dark:border-slate-800 p-5 space-y-3 text-xs">
          <h3 className="font-display font-bold text-navy dark:text-white text-sm">
            Unified UAE Chart of Accounts (COA)
          </h3>
          <p className="text-slate-400 text-[11px]">
            Statutory accounts conforming to UAE Federal Decree-Law No. 8 of 2017 on Value Added Tax
          </p>

          <div className="space-y-2 mt-3">
            {[
              { code: '1010', name: 'Emirates NBD Operating Account', type: 'Asset (Cash & Bank)', balance: '342,800.00 AED' },
              { code: '1020', name: 'Stripe / Apple Pay Merchant Clearing', type: 'Asset (Clearing)', balance: '18,450.00 AED' },
              { code: '1200', name: 'Accounts Receivable (Trade Debtors)', type: 'Asset (Current)', balance: '94,300.00 AED' },
              { code: '1300', name: 'Inventory Asset (Central WH + 18 Vans)', type: 'Asset (Inventory)', balance: '86,400.00 AED' },
              { code: '2010', name: 'Accounts Payable (Trade Vendors)', type: 'Liability (Current)', balance: '41,750.00 AED' },
              { code: '2110', name: 'Federal Tax Authority (VAT Output 5%)', type: 'Liability (Tax)', balance: '24,312.00 AED' },
              { code: '4010', name: 'Field Maintenance Service Revenue', type: 'Income (Operating)', balance: '264,800.00 AED' },
              { code: '4020', name: 'Annual Maintenance Contracts (AMC)', type: 'Income (Contractual)', balance: '118,240.00 AED' },
              { code: '5010', name: 'Direct Material & Part Costs (COGS)', type: 'Expense (Direct)', balance: '114,500.00 AED' },
            ].map((acc) => (
              <div
                key={acc.code}
                className="p-3 bg-ground dark:bg-slate-800 rounded-xl border border-line dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-signal-orange me-2">{acc.code}</span>
                  <span className="font-bold text-navy dark:text-white">{acc.name}</span>
                  <span className="text-slate-400 ms-2 text-[11px]">• {acc.type}</span>
                </div>
                <span className="font-black font-mono text-navy dark:text-white">{acc.balance}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
