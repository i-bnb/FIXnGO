'use client';

import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Filter,
  DollarSign,
  TrendingUp,
  HardHat,
  Tractor,
  Package,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToCsv } from '../../../../lib/csv-export';

type ReportType =
  | 'JOB_PROFITABILITY'
  | 'TECH_PERFORMANCE'
  | 'EQUIPMENT_UTILIZATION'
  | 'INVENTORY_VALUATION'
  | 'AR_AGING'
  | 'AP_AGING'
  | 'MONTHLY_PNL';

export default function ReportsAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [selectedReport, setSelectedReport] = useState<ReportType>('JOB_PROFITABILITY');
  const [dateFilter, setDateFilter] = useState('6_MONTHS');

  const reportList = [
    { id: 'JOB_PROFITABILITY', title: '1. Work Order Profitability', subtitle: 'view_job_profitability', icon: DollarSign, summary: 'Revenue vs direct material, labour & expense margin per job' },
    { id: 'TECH_PERFORMANCE', title: '2. Technician Performance', subtitle: 'view_technician_performance', icon: HardHat, summary: 'First-time fix %, CSAT ratings, attendance & revenue' },
    { id: 'EQUIPMENT_UTILIZATION', title: '3. Equipment Rental & ROI', subtitle: 'view_equipment_utilization', icon: Tractor, summary: 'Machine utilization days, rental revenue & meter hours' },
    { id: 'INVENTORY_VALUATION', title: '4. Inventory Valuation', subtitle: 'view_inventory_valuation', icon: Package, summary: 'Stock FIFO cost across central depot, Musaffah & 12 vans' },
    { id: 'AR_AGING', title: '5. Accounts Receivable (A/R)', subtitle: 'view_ar_aging', icon: Clock, summary: 'Customer outstanding balances bucketed 0-30, 31-60, 90+ days' },
    { id: 'AP_AGING', title: '6. Accounts Payable (A/P)', subtitle: 'view_ap_aging', icon: Layers, summary: 'Supplier payables aging and upcoming payment commitments' },
    { id: 'MONTHLY_PNL', title: '7. Monthly Profit & Loss', subtitle: 'view_monthly_pnl', icon: TrendingUp, summary: '6-month longitudinal P&L revenue, COGS, OPEX & net EBITDA' },
  ];

  const handleExport = () => {
    if (selectedReport === 'JOB_PROFITABILITY') {
      exportToCsv('view_job_profitability', [
        { orderNumber: 'WO-24817', customer: 'Fatima Al Mansoori (Jumeirah 1)', trade: 'HVAC', billed: 487.20, cost: 251.00, profit: 236.20, margin: '48.5%' },
        { orderNumber: 'WO-24818', customer: 'Palm Jumeirah Residence', trade: 'ELECTRICAL', billed: 3200.00, cost: 1350.00, profit: 1850.00, margin: '57.8%' },
        { orderNumber: 'WO-24805', customer: 'Al-Harbi Villa (Jumeirah 2)', trade: 'PLUMBING', billed: 420.00, cost: 210.00, profit: 210.00, margin: '50.0%' },
        { orderNumber: 'WO-24812', customer: 'Sobha Constructions LLC', trade: 'HVAC', billed: 320.00, cost: 660.00, profit: -340.00, margin: '-106.3%' },
        { orderNumber: 'WO-24801', customer: 'Al Futtaim Properties (Business Bay)', trade: 'HVAC', billed: 450.00, cost: 1040.00, profit: -590.00, margin: '-131.1%' },
      ], [
        { key: 'orderNumber', label: 'Order #' },
        { key: 'customer', label: 'Customer & Site' },
        { key: 'trade', label: 'Trade' },
        { key: 'billed', label: 'Billed (AED)' },
        { key: 'cost', label: 'Direct Cost (AED)' },
        { key: 'profit', label: 'Gross Profit (AED)' },
        { key: 'margin', label: 'Margin %' },
      ]);
    } else if (selectedReport === 'TECH_PERFORMANCE') {
      exportToCsv('view_technician_performance', [
        { name: 'Rashid Khan', trade: 'HVAC Lead', jobs: 48, ftf: '98%', csat: '4.96 / 5.0', billed: 44200 },
        { name: 'Vikram Patel', trade: 'Electrical Lead', jobs: 42, ftf: '97%', csat: '4.92 / 5.0', billed: 38900 },
        { name: 'Farhan Siddiqui', trade: 'HVAC Tech', jobs: 39, ftf: '95%', csat: '4.88 / 5.0', billed: 35100 },
        { name: 'Hasan Al-Banna', trade: 'Plumbing Lead', jobs: 36, ftf: '94%', csat: '4.85 / 5.0', billed: 32600 },
        { name: 'Joseph Mathew', trade: 'Plumbing Specialist', jobs: 35, ftf: '96%', csat: '4.89 / 5.0', billed: 31400 },
      ], [
        { key: 'name', label: 'Technician' },
        { key: 'trade', label: 'Trade' },
        { key: 'jobs', label: 'Jobs Done' },
        { key: 'ftf', label: 'First-Time Fix' },
        { key: 'csat', label: 'Avg CSAT' },
        { key: 'billed', label: 'Billed Revenue (AED)' },
      ]);
    } else {
      exportToCsv(`report_${selectedReport.toLowerCase()}`, [
        { metric: 'Active Utilization', value: '68%', period: dateFilter },
        { metric: 'Revenue Generated', value: 'AED 486,240', period: dateFilter },
        { metric: 'Direct Expenses', value: 'AED 367,840', period: dateFilter },
        { metric: 'Net Operating Profit', value: 'AED 118,400', period: dateFilter },
      ], [
        { key: 'metric', label: 'Report Metric' },
        { key: 'value', label: 'Report Value' },
        { key: 'period', label: 'Time Window' },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <FileBarChart className="w-4 h-4" />
            <span>{isArabic ? 'مركز التقارير والتحليلات المتقدمة' : 'Executive Business Intelligence & SQL Views'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'مركز التقارير الإدارية (7 واجهات SQL)' : 'Enterprise Reports Centre (7 SQL Views)'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'وصول مباشر إلى واجهات تقارير قاعدة بيانات PostgreSQL: ربحية أوامر العمل، كفاءة الفنيين، أسطول المعدات، تقييم المخزون، والتعمير المالي'
              : 'Direct graphical interface for 7 database analytics views with date filters and instant CSV/spreadsheet export'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 shadow-sm"
          >
            <option value="6_MONTHS">Full 6 Months History</option>
            <option value="THIS_MONTH">Current Month (Sep 2026)</option>
            <option value="LAST_MONTH">Previous Month (Aug 2026)</option>
            <option value="YTD">Year-to-Date (YTD 2026)</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Reports Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportList.map((r) => {
          const Icon = r.icon;
          const isSelected = selectedReport === r.id;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedReport(r.id as ReportType)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-teal-900 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-500 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-300' : 'text-teal-700'}`} />
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-teal-300' : 'text-slate-400'}`}>
                    {r.subtitle}
                  </span>
                </div>
                <h3 className={`font-black text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>{r.title}</h3>
                <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                  {r.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Dynamic Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
        {/* REPORT 1: JOB PROFITABILITY */}
        {selectedReport === 'JOB_PROFITABILITY' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Work Order Profitability & Margin Diagnostics</h3>
                <p className="text-slate-500 text-[11px]">SQL View: view_job_profitability • 400 Work Orders Sample</p>
              </div>
              <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                Avg Gross Margin: 62.4%
              </span>
            </div>

            <table className="w-full border rounded-xl overflow-hidden text-start">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 text-start">Order #</th>
                  <th className="p-2.5 text-start">Customer & Site</th>
                  <th className="p-2.5 text-start">Trade</th>
                  <th className="p-2.5 text-end">Billed (AED)</th>
                  <th className="p-2.5 text-end">Direct Cost</th>
                  <th className="p-2.5 text-end">Gross Profit</th>
                  <th className="p-2.5 text-end">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-mono font-bold text-teal-900">WO-2026-001</td>
                  <td className="p-2.5 font-bold text-slate-900">Al Futtaim Properties (Business Bay)</td>
                  <td className="p-2.5"><span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">HVAC</span></td>
                  <td className="p-2.5 text-end font-bold">390.00</td>
                  <td className="p-2.5 text-end text-slate-600">155.00</td>
                  <td className="p-2.5 text-end font-black text-emerald-700">+235.00</td>
                  <td className="p-2.5 text-end font-black text-emerald-700">60.2%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold text-teal-900">WO-2026-002</td>
                  <td className="p-2.5 font-bold text-slate-900">Al-Harbi Villa (Jumeirah 2)</td>
                  <td className="p-2.5"><span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">PLUMBING</span></td>
                  <td className="p-2.5 text-end font-bold">265.00</td>
                  <td className="p-2.5 text-end text-slate-600">95.00</td>
                  <td className="p-2.5 text-end font-black text-emerald-700">+170.00</td>
                  <td className="p-2.5 text-end font-black text-emerald-700">64.1%</td>
                </tr>
                <tr className="bg-red-50/40">
                  <td className="p-2.5 font-mono font-bold text-red-900">WO-2026-004</td>
                  <td className="p-2.5 font-bold text-slate-900">Gulf Cold Logistics (Dubai Ind City)</td>
                  <td className="p-2.5"><span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">ELECTRICAL</span></td>
                  <td className="p-2.5 text-end font-bold">940.00</td>
                  <td className="p-2.5 text-end text-red-700 font-bold">1,200.00</td>
                  <td className="p-2.5 text-end font-black text-red-600">-260.00</td>
                  <td className="p-2.5 text-end font-black text-red-600">-27.6% (Loss)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 2: TECH PERFORMANCE */}
        {selectedReport === 'TECH_PERFORMANCE' && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-sm">Technician Productivity, FTF & CSAT Leaderboard</h3>
            <table className="w-full border rounded-xl overflow-hidden text-start">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 text-start">Technician</th>
                  <th className="p-2.5 text-start">Trade</th>
                  <th className="p-2.5 text-center">Jobs Done</th>
                  <th className="p-2.5 text-center">First-Time Fix</th>
                  <th className="p-2.5 text-center">Avg CSAT</th>
                  <th className="p-2.5 text-end">Billed Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Rashid Al-Nuaimi</td>
                  <td className="p-2.5">HVAC Lead</td>
                  <td className="p-2.5 text-center font-bold">142</td>
                  <td className="p-2.5 text-center font-black text-emerald-700">96%</td>
                  <td className="p-2.5 text-center font-black text-amber-800">4.95 / 5.0</td>
                  <td className="p-2.5 text-end font-black text-slate-900">24,850 AED</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Mohammad Rizwan</td>
                  <td className="p-2.5">Master Electrician</td>
                  <td className="p-2.5 text-center font-bold">120</td>
                  <td className="p-2.5 text-center font-black text-emerald-700">98%</td>
                  <td className="p-2.5 text-center font-black text-amber-800">4.92 / 5.0</td>
                  <td className="p-2.5 text-end font-black text-slate-900">22,600 AED</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Vikram Sharma</td>
                  <td className="p-2.5">Lead Plumber</td>
                  <td className="p-2.5 text-center font-bold">98</td>
                  <td className="p-2.5 text-center font-black text-emerald-700">94%</td>
                  <td className="p-2.5 text-center font-black text-amber-800">4.88 / 5.0</td>
                  <td className="p-2.5 text-end font-black text-slate-900">18,400 AED</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: EQUIPMENT UTILIZATION */}
        {selectedReport === 'EQUIPMENT_UTILIZATION' && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-sm">Machinery Rental Fleet Utilization & Asset ROI</h3>
            <table className="w-full border rounded-xl overflow-hidden text-start">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 text-start">Asset</th>
                  <th className="p-2.5 text-start">Category</th>
                  <th className="p-2.5 text-center">Meter Hours</th>
                  <th className="p-2.5 text-center">Utilization</th>
                  <th className="p-2.5 text-end">Monthly Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Caterpillar 100 kVA Generator</td>
                  <td className="p-2.5">Power Generators</td>
                  <td className="p-2.5 text-center">1,420 hrs</td>
                  <td className="p-2.5 text-center font-black text-emerald-700">85%</td>
                  <td className="p-2.5 text-end font-black text-slate-900">9,500 AED</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Haulotte 12m Scissor Lift</td>
                  <td className="p-2.5">Access Equipment</td>
                  <td className="p-2.5 text-center">890 hrs</td>
                  <td className="p-2.5 text-center font-black text-emerald-700">78%</td>
                  <td className="p-2.5 text-end font-black text-slate-900">7,200 AED</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 4: INVENTORY VALUATION */}
        {selectedReport === 'INVENTORY_VALUATION' && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-sm">Stock Valuation by Location & Turn Rate</h3>
            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span>Al Quoz Central Warehouse Stock Value:</span>
                <span className="font-bold text-slate-900">22,778.00 AED</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Musaffah Abu Dhabi Storage Yard:</span>
                <span className="font-bold text-slate-900">4,881.00 AED</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>12 Technician Service Vans (Rolling Stock):</span>
                <span className="font-bold text-slate-900">4,881.00 AED</span>
              </div>
              <div className="flex justify-between pt-1 font-black text-sm text-slate-900">
                <span>Total Company Inventory (FIFO):</span>
                <span className="text-teal-900">32,540.00 AED</span>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 5: AR AGING */}
        {selectedReport === 'AR_AGING' && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-sm">A/R Customer Aging Debtors Analysis</h3>
            <table className="w-full border rounded-xl overflow-hidden text-start">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 text-start">Customer Account</th>
                  <th className="p-2.5 text-end">0-30 Days</th>
                  <th className="p-2.5 text-end">31-60 Days</th>
                  <th className="p-2.5 text-end">90+ Days</th>
                  <th className="p-2.5 text-end">Total Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Al Futtaim Properties LLC</td>
                  <td className="p-2.5 text-end">14,850.00</td>
                  <td className="p-2.5 text-end text-slate-400">0.00</td>
                  <td className="p-2.5 text-end text-slate-400">0.00</td>
                  <td className="p-2.5 text-end font-black text-slate-900">14,850.00 AED</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Emaar Hospitality Group</td>
                  <td className="p-2.5 text-end text-slate-400">0.00</td>
                  <td className="p-2.5 text-end text-amber-800 font-bold">8,900.00</td>
                  <td className="p-2.5 text-end text-slate-400">0.00</td>
                  <td className="p-2.5 text-end font-black text-slate-900">8,900.00 AED</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 6: AP AGING */}
        {selectedReport === 'AP_AGING' && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-sm">A/P Supplier Vendor Aging Commitments</h3>
            <table className="w-full border rounded-xl overflow-hidden text-start">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 text-start">Supplier Vendor</th>
                  <th className="p-2.5 text-start">Payment Terms</th>
                  <th className="p-2.5 text-end">Current (AED)</th>
                  <th className="p-2.5 text-end">30+ Days</th>
                  <th className="p-2.5 text-end">Total Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Danfoss Middle East FZE</td>
                  <td className="p-2.5">Net 30 Days</td>
                  <td className="p-2.5 text-end font-semibold">6,720.00</td>
                  <td className="p-2.5 text-end text-slate-400">0.00</td>
                  <td className="p-2.5 text-end font-black text-slate-900">6,720.00 AED</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 7: MONTHLY PNL */}
        {selectedReport === 'MONTHLY_PNL' && (
          <div className="space-y-4">
            <h3 className="font-black text-slate-900 text-sm">6-Month Trend: Revenue, Gross Margin & EBITDA</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              {[
                { month: 'Apr 2026', rev: '28,400', net: '13,200' },
                { month: 'May 2026', rev: '31,200', net: '15,100' },
                { month: 'Jun 2026', rev: '35,800', net: '18,400' },
                { month: 'Jul 2026', rev: '41,000', net: '21,500' },
                { month: 'Aug 2026', rev: '44,200', net: '23,400' },
                { month: 'Sep 2026', rev: '48,600', net: '25,200' },
              ].map((m, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border">
                  <span className="font-bold text-slate-700 block">{m.month}</span>
                  <div className="font-black text-slate-900 text-xs mt-1">{m.rev} AED</div>
                  <div className="text-[10px] font-bold text-emerald-700 mt-0.5">+{m.net} Net</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
