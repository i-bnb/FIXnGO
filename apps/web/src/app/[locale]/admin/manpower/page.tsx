'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { fetchApi } from '../../../../lib/api-client';
import {
  Users,
  HardHat,
  Plus,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  Receipt,
  FileCheck,
  TrendingUp,
  Download,
  AlertCircle,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DeploymentSite {
  id: string;
  projectName: string;
  contractor: string;
  location: string;
  deployedCount: number;
  electricians: number;
  plumbers: number;
  hvacTechs: number;
  helpers: number;
  dailyBillingAed: number;
  supervisor: string;
  status: 'ACTIVE' | 'MOBILIZING' | 'COMPLETED';
}

interface WorkerRosterItem {
  id: string;
  workerCode: string;
  fullName: string;
  trade: string;
  yearsOfExperience: number;
  status: 'DEPLOYED' | 'STANDBY';
  hourlyBillingRate: number;
  currentSiteName: string | null;
  visaStatus: string;
}

interface DailyTimesheetItem {
  id: string;
  date: string;
  siteName: string;
  workerName: string;
  trade: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  foremanApproved: boolean;
}

const SAMPLE_SITES: DeploymentSite[] = [
  {
    id: 'site-1',
    projectName: 'Crescent Bay Tower Phase 2 Plot 14',
    contractor: 'Desert Rose Logistics LLC',
    location: 'Crescent Bay, Dubai',
    deployedCount: 12,
    electricians: 5,
    plumbers: 3,
    hvacTechs: 2,
    helpers: 2,
    dailyBillingAed: 5280,
    supervisor: 'Eng. Basel Al-Khatib',
    status: 'ACTIVE',
  },
  {
    id: 'site-2',
    projectName: 'Palm Crest Yas Luxury Villas',
    contractor: 'Palm Crest Properties LLC',
    location: 'Yas Island, Abu Dhabi',
    deployedCount: 8,
    electricians: 3,
    plumbers: 3,
    hvacTechs: 0,
    helpers: 2,
    dailyBillingAed: 3360,
    supervisor: 'Tariq Mansoor',
    status: 'ACTIVE',
  },
  {
    id: 'site-3',
    projectName: 'Sharjah Aljada Central Phase 2',
    contractor: 'Al-Noor Residential Compound',
    location: 'Muwaileh Commercial, Sharjah',
    deployedCount: 6,
    electricians: 2,
    plumbers: 1,
    hvacTechs: 1,
    helpers: 2,
    dailyBillingAed: 2420,
    supervisor: 'Mustafa Jalal',
    status: 'ACTIVE',
  },
  {
    id: 'site-4',
    projectName: 'Palm Crest Residences Opus',
    contractor: 'Palm Crest Properties LLC',
    location: 'Palm Crest Residences, Dubai',
    deployedCount: 4,
    electricians: 2,
    plumbers: 1,
    hvacTechs: 1,
    helpers: 0,
    dailyBillingAed: 1800,
    supervisor: 'Gopal Krishnan',
    status: 'ACTIVE',
  },
];

const SAMPLE_WORKERS: WorkerRosterItem[] = [
  { id: '1', workerCode: 'MP-E01', fullName: 'Sajid Ali', trade: 'ELECTRICIAN', yearsOfExperience: 5, status: 'DEPLOYED', hourlyBillingRate: 55, currentSiteName: 'Crescent Bay Tower Phase 2 Plot 14', visaStatus: 'Employment Visa (Valid 2028)' },
  { id: '2', workerCode: 'MP-E02', fullName: 'Naveed Akhtar', trade: 'ELECTRICIAN', yearsOfExperience: 4, status: 'DEPLOYED', hourlyBillingRate: 55, currentSiteName: 'Crescent Bay Tower Phase 2 Plot 14', visaStatus: 'Employment Visa (Valid 2027)' },
  { id: '3', workerCode: 'MP-P01', fullName: 'Manoj Kumar', trade: 'PLUMBER', yearsOfExperience: 6, status: 'DEPLOYED', hourlyBillingRate: 50, currentSiteName: 'Palm Crest Yas Luxury Villas', visaStatus: 'Employment Visa (Valid 2027)' },
  { id: '4', workerCode: 'MP-H01', fullName: 'Anwar Hossain', trade: 'HVAC_TECHNICIAN', yearsOfExperience: 7, status: 'DEPLOYED', hourlyBillingRate: 65, currentSiteName: 'Crescent Bay Tower Phase 2 Plot 14', visaStatus: 'Employment Visa (Valid 2028)' },
  { id: '5', workerCode: 'MP-G01', fullName: 'Gurpreet Singh', trade: 'GENERAL_HELPER', yearsOfExperience: 3, status: 'DEPLOYED', hourlyBillingRate: 38, currentSiteName: 'Sharjah Aljada Central Phase 2', visaStatus: 'Employment Visa (Valid 2028)' },
  { id: '6', workerCode: 'MP-E03', fullName: 'Farhan Zaidi', trade: 'ELECTRICIAN', yearsOfExperience: 5, status: 'STANDBY', hourlyBillingRate: 55, currentSiteName: null, visaStatus: 'Employment Visa (Valid 2027)' },
  { id: '7', workerCode: 'MP-P02', fullName: 'Ramesh Patel', trade: 'PLUMBER', yearsOfExperience: 4, status: 'STANDBY', hourlyBillingRate: 50, currentSiteName: null, visaStatus: 'Employment Visa (Valid 2028)' },
];

const SAMPLE_TIMESHEETS: DailyTimesheetItem[] = [
  { id: 'ts-1', date: '2026-09-23', siteName: 'Crescent Bay Tower Phase 2', workerName: 'Sajid Ali', trade: 'ELECTRICIAN', regularHours: 8, overtimeHours: 2, totalHours: 10, foremanApproved: true },
  { id: 'ts-2', date: '2026-09-23', siteName: 'Crescent Bay Tower Phase 2', workerName: 'Naveed Akhtar', trade: 'ELECTRICIAN', regularHours: 8, overtimeHours: 1.5, totalHours: 9.5, foremanApproved: true },
  { id: 'ts-3', date: '2026-09-23', siteName: 'Palm Crest Yas Luxury Villas', workerName: 'Manoj Kumar', trade: 'PLUMBER', regularHours: 8, overtimeHours: 0, totalHours: 8, foremanApproved: true },
  { id: 'ts-4', date: '2026-09-23', siteName: 'Sharjah Aljada Central Phase 2', workerName: 'Gurpreet Singh', trade: 'GENERAL_HELPER', regularHours: 8, overtimeHours: 3, totalHours: 11, foremanApproved: true },
];

export default function ManpowerAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'SITES' | 'ROSTER' | 'TIMESHEETS' | 'BILLING'>('SITES');
  const [selectedSite, setSelectedSite] = useState<DeploymentSite | null>(SAMPLE_SITES[0]);

  // Billing generator form
  const [billingSite, setBillingSite] = useState(SAMPLE_SITES[0].projectName);
  const [billingMonth, setBillingMonth] = useState('September 2026');
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);

  const handleGenerateInvoice = () => {
    const site = SAMPLE_SITES.find((s) => s.projectName === billingSite) || SAMPLE_SITES[0];
    const totalDays = 26; // 26 working days in month
    const baseAmount = site.dailyBillingAed * totalDays;
    const overtimeAmount = baseAmount * 0.12; // 12% average overtime
    const subtotal = baseAmount + overtimeAmount;
    const vat = subtotal * 0.05;
    const total = subtotal + vat;

    setGeneratedInvoice({
      invoiceNumber: `INV-MP-${Math.floor(1000 + Math.random() * 9000)}`,
      contractor: site.contractor,
      project: site.projectName,
      month: billingMonth,
      headcount: site.deployedCount,
      regularDaysBilled: totalDays,
      subtotal,
      vat,
      total,
    });
  };

  const workerColumns: Column<WorkerRosterItem>[] = [
    {
      key: 'workerCode',
      header: 'Worker Code',
      render: (r) => <span className="font-extrabold text-slate-900 font-mono text-xs">{r.workerCode}</span>,
    },
    {
      key: 'fullName',
      header: 'Skilled Tradesman',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{r.fullName}</div>
          <div className="text-[10px] text-slate-500">{r.visaStatus}</div>
        </div>
      ),
    },
    {
      key: 'trade',
      header: 'Trade Skill',
      render: (r) => (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 uppercase">
          {r.trade.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            r.status === 'DEPLOYED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: 'currentSiteName',
      header: 'Active Construction Project',
      render: (r) => (
        <span className="text-xs text-slate-700 font-semibold">
          {r.currentSiteName || <span className="text-slate-400 italic">Central Labour Camp (Standby)</span>}
        </span>
      ),
    },
    {
      key: 'hourlyBillingRate',
      header: 'Billing Rate',
      render: (r) => (
        <div className="text-end font-black text-slate-900 text-xs">
          {r.hourlyBillingRate.toFixed(2)} AED/hr
        </div>
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
            <span>{isArabic ? 'إدارة توريد العمالة الماهرة' : 'Construction Labour Supply & Subcontracting'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'توريد العمالة، جداول الحضور، والفواتير الشهرية' : 'Labour Supply, Timesheets & Monthly Billing'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'توزيع 30 عاملاً متخصصاً على 4 مشاريع إنشائية كبرى في دبي وأبوظبي والشارقة، مع اعتماد بطاقات العمل وحساب ساعات العمل الإضافي والفواتير الضريبية'
              : 'Deploy skilled MEP tradesmen to UAE mega-projects, track supervisor-approved daily timesheets with overtime (1.25x), and bill monthly with 5% VAT'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Deployments</span>
            <span className="text-lg font-black text-teal-900">30 Tradesmen</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Daily Billing Run</span>
            <span className="text-lg font-black text-emerald-700">12,860 AED / day</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'SITES', label: `Construction Sites (${SAMPLE_SITES.length})`, icon: Building2 },
          { id: 'ROSTER', label: `Workers Roster (30 Staff)`, icon: Users },
          { id: 'TIMESHEETS', label: 'Daily Timesheets & OT (1.25x)', icon: Clock },
          { id: 'BILLING', label: 'Monthly Billing Generator', icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                active ? 'bg-slate-900 text-white font-black shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: SITES */}
      {activeTab === 'SITES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SAMPLE_SITES.map((site) => (
            <div
              key={site.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-teal-500 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {site.contractor}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{site.projectName}</h3>
                  <div className="text-xs text-slate-500">{site.location}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {site.status}
                </span>
              </div>

              {/* Headcount Breakdown Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-lg border">
                  <span className="text-[10px] text-slate-500 block">Electricians</span>
                  <span className="font-black text-slate-900">{site.electricians}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border">
                  <span className="text-[10px] text-slate-500 block">Plumbers</span>
                  <span className="font-black text-slate-900">{site.plumbers}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border">
                  <span className="text-[10px] text-slate-500 block">HVAC Techs</span>
                  <span className="font-black text-slate-900">{site.hvacTechs}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border">
                  <span className="text-[10px] text-slate-500 block">Helpers</span>
                  <span className="font-black text-slate-900">{site.helpers}</span>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Site Supervisor: </span>
                  <span className="font-bold text-slate-800">{site.supervisor}</span>
                </div>
                <div className="text-end">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Daily Revenue</span>
                  <span className="font-black text-teal-900 text-sm">{site.dailyBillingAed.toLocaleString()} AED/day</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: ROSTER */}
      {activeTab === 'ROSTER' && (
        <DataTable
          title="Manpower Supply Tradesmen Registry"
          data={SAMPLE_WORKERS}
          columns={workerColumns}
          searchPlaceholder="Search worker name, code, trade, or site..."
          searchKeys={['fullName', 'workerCode', 'trade', 'currentSiteName']}
          exportFileName="manpower_workers_export"
        />
      )}

      {/* Tab 3: TIMESHEETS */}
      {activeTab === 'TIMESHEETS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Site Daily Timesheets (23 Sep 2026)</h3>
              <p className="text-slate-500 text-xs">Overtime verified against site biometric gate access logs</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Foreman Verified</span>
              </span>
            </div>
          </div>

          <table className="w-full border rounded-xl overflow-hidden text-start text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-2.5 text-start">Date</th>
                <th className="p-2.5 text-start">Worker Name</th>
                <th className="p-2.5 text-start">Construction Project</th>
                <th className="p-2.5 text-center">Regular (8h)</th>
                <th className="p-2.5 text-center">Overtime (1.25x)</th>
                <th className="p-2.5 text-center">Total Hours</th>
                <th className="p-2.5 text-center">Signoff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SAMPLE_TIMESHEETS.map((ts) => (
                <tr key={ts.id}>
                  <td className="p-2.5 text-slate-600">{ts.date}</td>
                  <td className="p-2.5 font-bold text-slate-900">{ts.workerName}</td>
                  <td className="p-2.5 text-slate-700">{ts.siteName}</td>
                  <td className="p-2.5 text-center font-semibold">{ts.regularHours} hrs</td>
                  <td className="p-2.5 text-center font-bold text-teal-800">{ts.overtimeHours} hrs</td>
                  <td className="p-2.5 text-center font-black text-slate-900">{ts.totalHours} hrs</td>
                  <td className="p-2.5 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: BILLING GENERATOR */}
      {activeTab === 'BILLING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-base">Generate Monthly Contractor Tax Invoice</h3>
            <p className="text-slate-500 text-xs">
              Pulls approved timesheets, normal days, and overtime hours to calculate total billable AED with 5% UAE VAT.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Construction Project</label>
                <select
                  value={billingSite}
                  onChange={(e) => setBillingSite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900"
                >
                  {SAMPLE_SITES.map((s) => (
                    <option key={s.id} value={s.projectName}>
                      {s.projectName} ({s.contractor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Billing Month Period</label>
                <select
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900"
                >
                  <option value="September 2026">September 2026 (26 Working Days)</option>
                  <option value="August 2026">August 2026 (27 Working Days)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateInvoice}
                className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>Compute Timesheet Invoice</span>
              </button>
            </div>
          </div>

          {generatedInvoice ? (
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl space-y-4 border border-slate-800 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-teal-400 font-bold">{generatedInvoice.invoiceNumber}</span>
                  <h4 className="font-black text-sm text-white mt-0.5">{generatedInvoice.contractor}</h4>
                </div>
                <span className="text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">
                  FTA VAT Tax Invoice
                </span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Project:</span>
                  <span className="font-semibold text-white">{generatedInvoice.project}</span>
                </div>
                <div className="flex justify-between">
                  <span>Manpower Headcount:</span>
                  <span className="font-semibold text-white">{generatedInvoice.headcount} Skilled Tradesmen</span>
                </div>
                <div className="flex justify-between">
                  <span>Period Billed:</span>
                  <span className="font-semibold text-white">{generatedInvoice.month}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span>Base Labour + Overtime (1.25x):</span>
                  <span className="font-bold text-white">{generatedInvoice.subtotal.toLocaleString()} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>UAE VAT (5%):</span>
                  <span className="font-bold text-teal-400">{generatedInvoice.vat.toLocaleString()} AED</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-black text-white">
                  <span>Total Amount Due:</span>
                  <span className="text-teal-400">{generatedInvoice.total.toLocaleString()} AED</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert(`Generated Official Tax Invoice ${generatedInvoice.invoiceNumber} sent to Finance!`)}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition"
                >
                  Post to General Ledger & Send to Client
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
              <Receipt className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-semibold">Select a site and click "Compute Timesheet Invoice" to preview</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
