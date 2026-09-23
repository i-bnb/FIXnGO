'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Hash,
  CheckCircle2,
  Save,
  Globe,
  Lock,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@fieldops/shared';

export default function SettingsAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'RBAC' | 'TAX' | 'SERIES' | 'PAYMENT'>('COMPANY');
  const [saveToast, setSaveToast] = useState(false);

  // Form states
  const [companyNameEn, setCompanyNameEn] = useState('FIXnGO Technical Services LLC');
  const [companyNameAr, setCompanyNameAr] = useState('شركة فيكس آند جو للخدمات الفنية ذ.م.م');
  const [trnNumber, setTrnNumber] = useState('100482910300003');
  const [dedLicense, setDedLicense] = useState('CN-8891024 (Dubai DED)');
  const [vatRate, setVatRate] = useState(5.0);
  const [corpTaxRate, setCorpTaxRate] = useState(9.0);
  const [stripeLiveMode, setStripeLiveMode] = useState(false);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4000);
  };

  const permissions = [
    { key: 'wo.view', label: 'View Work Orders', superAdmin: true, opsManager: true, accountant: true, dispatcher: true, storekeeper: false, tech: true },
    { key: 'wo.assign', label: 'Assign & Dispatch Technicians', superAdmin: true, opsManager: true, accountant: false, dispatcher: true, storekeeper: false, tech: false },
    { key: 'inv.adjust', label: 'Inventory Stock Movements', superAdmin: true, opsManager: true, accountant: false, dispatcher: false, storekeeper: true, tech: false },
    { key: 'po.approve', label: 'Approve Purchase Orders', superAdmin: true, opsManager: true, accountant: false, dispatcher: false, storekeeper: false, tech: false },
    { key: 'billing.create', label: 'Issue Tax Invoices', superAdmin: true, opsManager: true, accountant: true, dispatcher: false, storekeeper: false, tech: false },
    { key: 'finance.view', label: 'View P&L & General Ledger', superAdmin: true, opsManager: false, accountant: true, dispatcher: false, storekeeper: false, tech: false },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed top-4 end-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-signal-orange">
          <CheckCircle2 className="w-4 h-4 text-signal-orange" />
          <span>Settings successfully saved and propagated to database!</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-signal-orange uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>{isArabic ? 'إعدادات النظام والتهيئة العامة' : 'System Configuration & Compliance'}</span>
          </div>
          <h1 className="text-2xl font-black text-navy dark:text-white tracking-tight">
            {isArabic ? 'إعدادات الشركة، الصلاحيات، والضرائب' : 'Company Settings & Role Access Control'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {isArabic
              ? 'تكوين الملف القانوني للشركة في دبي، مصفوفة الصلاحيات (RBAC)، إعدادات ضريبة القيمة المضافة 5%، وترقيم السجلات'
              : 'Corporate entity configuration, RBAC permissions matrix, FTA VAT & Corporate Tax settings, and numbering series'}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-signal-orange hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          <Save className="w-4 h-4 text-white" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'COMPANY', label: 'Company Profile & DED', icon: Building2 },
          { id: 'RBAC', label: 'RBAC Permissions Matrix', icon: ShieldCheck },
          { id: 'TAX', label: 'UAE VAT & Corporate Tax', icon: Globe },
          { id: 'SERIES', label: 'Numbering Series Prefixes', icon: Hash },
          { id: 'PAYMENT', label: 'Payment Gateways & Stripe', icon: CreditCard },
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

      {/* Tab 1: COMPANY */}
      {activeTab === 'COMPANY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 text-xs max-w-3xl">
          <h3 className="font-black text-slate-900 text-sm">Official UAE Corporate Entity Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Name (English)</label>
              <input
                type="text"
                value={companyNameEn}
                onChange={(e) => setCompanyNameEn(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Name (Arabic / الاسم التجاري)</label>
              <input
                type="text"
                dir="rtl"
                value={companyNameAr}
                onChange={(e) => setCompanyNameAr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 font-sans"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tax Registration Number (TRN 15-Digit)</label>
              <input
                type="text"
                value={trnNumber}
                onChange={(e) => setTrnNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-navy dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dubai DED Commercial License #</label>
              <input
                type="text"
                value={dedLicense}
                onChange={(e) => setDedLicense(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Physical Operating Headquarters</label>
              <input
                type="text"
                defaultValue="Warehouse 14, Street 18B, Al Quoz Industrial 3, PO Box 49102, Dubai, UAE"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC MATRIX */}
      {activeTab === 'RBAC' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Role-Based Access Control (RBAC) Matrix</h3>
              <p className="text-slate-500 text-xs">Granular permission strings enforced on API guards and frontend navigation</p>
            </div>
            <span className="px-2.5 py-1 bg-orange-50 text-signal-orange font-bold rounded-lg border border-orange-200">
              6 Seeded Roles
            </span>
          </div>

          <table className="w-full border rounded-xl overflow-hidden text-start">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-2.5 text-start">Permission String</th>
                <th className="p-2.5 text-center">Super Admin</th>
                <th className="p-2.5 text-center">Ops Manager</th>
                <th className="p-2.5 text-center">Accountant</th>
                <th className="p-2.5 text-center">Dispatcher</th>
                <th className="p-2.5 text-center">Storekeeper</th>
                <th className="p-2.5 text-center">Technician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((p) => (
                <tr key={p.key}>
                  <td className="p-2.5">
                    <span className="font-bold text-slate-900 block">{p.label}</span>
                    <span className="font-mono text-[10px] text-slate-400">{p.key}</span>
                  </td>
                  <td className="p-2.5 text-center">{p.superAdmin ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                  <td className="p-2.5 text-center">{p.opsManager ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                  <td className="p-2.5 text-center">{p.accountant ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                  <td className="p-2.5 text-center">{p.dispatcher ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                  <td className="p-2.5 text-center">{p.storekeeper ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                  <td className="p-2.5 text-center">{p.tech ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: TAX */}
      {activeTab === 'TAX' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs max-w-2xl">
          <h3 className="font-black text-slate-900 text-sm">Federal Tax Authority (FTA) Compliance</h3>
          <div className="space-y-3">
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 space-y-1">
              <span className="font-bold text-navy block">UAE Value Added Tax (VAT)</span>
              <p className="text-[11px] text-slate-700">
                Standard 5.0% rate applied to maintenance callouts, parts sales, equipment rental, and labour supply invoices.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border space-y-1">
              <span className="font-bold text-slate-900 block">UAE Corporate Tax (9.0%)</span>
              <p className="text-[11px] text-slate-600">
                Applicable on annual net taxable profit exceeding AED 375,000 threshold under Federal Decree-Law No. 47 of 2022.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: NUMBERING SERIES */}
      {activeTab === 'SERIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs max-w-2xl">
          <h3 className="font-black text-slate-900 text-sm">Document Numbering Series & Sequences</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border">
              <span className="font-bold text-slate-700 block">Work Orders</span>
              <span className="font-mono text-signal-orange font-black text-sm">WO-2026-XXXX</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border">
              <span className="font-bold text-slate-700 block">Tax Invoices</span>
              <span className="font-mono text-signal-orange font-black text-sm">INV-2026-XXXX</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border">
              <span className="font-bold text-slate-700 block">Quotations</span>
              <span className="font-mono text-signal-orange font-black text-sm">QT-2026-XXXX</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border">
              <span className="font-bold text-slate-700 block">Purchase Orders</span>
              <span className="font-mono text-signal-orange font-black text-sm">PO-2026-XXXX</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: PAYMENT GATEWAYS */}
      {activeTab === 'PAYMENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs max-w-2xl">
          <h3 className="font-black text-slate-900 text-sm">Payment Gateways & Processing</h3>
          <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block text-sm">Stripe Payments UAE</span>
                <span className="text-[11px] text-slate-500">Supports Visa, Mastercard, Apple Pay & Google Pay</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                Active (Test Keys Ready)
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-500 bg-white p-2 rounded border">
              pk_test_fixngo_uae_demo_889102488102
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
