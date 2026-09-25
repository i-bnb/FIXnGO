'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { maskPhone, maskEmail } from '@fieldops/shared';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import {
  Users,
  Building2,
  MapPin,
  ShieldCheck,
  FileText,
  Receipt,
  Download,
  Eye,
  Plus,
  Phone,
  Mail,
  QrCode,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  type: 'CORPORATE' | 'COMMERCIAL' | 'RESIDENTIAL' | 'CONTRACTOR';
  trn?: string;
  contactPerson: string;
  phone: string;
  email: string;
  sitesCount: number;
  assetsCount: number;
  activeAmcCount: number;
  outstandingBalanceAed: number;
  sites: {
    name: string;
    address: string;
    coordinates: string;
    siteContact: string;
  }[];
  assets: {
    assetTag: string;
    name: string;
    type: string;
    serialNumber: string;
    location: string;
    warrantyStatus: string;
  }[];
  contracts: {
    contractNumber: string;
    tier: string;
    startDate: string;
    endDate: string;
    valueAed: number;
    visitsPerYear: number;
    status: 'ACTIVE' | 'EXPIRED' | 'RENEWAL_DUE';
  }[];
  soa: {
    date: string;
    type: 'INVOICE' | 'PAYMENT';
    ref: string;
    debitAed: number;
    creditAed: number;
    balanceAed: number;
  }[];
}

const SAMPLE_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'Palm Crest Properties LLC',
    type: 'CORPORATE',
    trn: '100000000000003 (demo)',
    contactPerson: 'Eng. Tariq Al-Hashimi',
    phone: 'xxxxxxxxx',
    email: 'test@i-bnb.com',
    sitesCount: 8,
    assetsCount: 34,
    activeAmcCount: 3,
    outstandingBalanceAed: 14850.0,
    sites: [
      { name: 'Palm Crest Commercial Tower A', address: 'Palm Crest Commercial Zone, Dubai', coordinates: '25.2215° N, 55.3524° E', siteContact: 'Imran Bashir (xxxxxxxxx)' },
      { name: 'Palm Crest Executive Offices', address: 'Tower B, Level 14, Business Bay, Dubai', coordinates: '25.1857° N, 55.2678° E', siteContact: 'Tariq Nabil (xxxxxxxxx)' },
      { name: 'Palm Crest Mixed-Use Retail Center', address: 'Al Rigga Rd, Deira, Dubai', coordinates: '25.2632° N, 55.3218° E', siteContact: 'George Verghese (xxxxxxxxx)' },
    ],
    assets: [
      { assetTag: 'AST-DXB-001', name: 'Daikin Water-Cooled Chiller 120-Ton', type: 'HVAC Chiller', serialNumber: 'DKN-CH-2023-8891', location: 'Rooftop Plant Room', warrantyStatus: 'Active AMC Covered' },
      { assetTag: 'AST-DXB-002', name: 'Schneider 400A Main Distribution Board', type: 'Electrical MDB', serialNumber: 'SCH-MDB-2022-441', location: 'Basement Substation #1', warrantyStatus: 'Active AMC Covered' },
      { assetTag: 'AST-DXB-003', name: 'Grundfos Hydro MPC Triplex Booster Pump', type: 'Booster Pump', serialNumber: 'GF-PMP-2024-102', location: 'Pump Room B2', warrantyStatus: 'Under OEM Warranty' },
    ],
    contracts: [
      { contractNumber: 'AMC-2026-001', tier: 'PLATINUM 24/7', startDate: '2026-01-01', endDate: '2026-12-31', valueAed: 48000, visitsPerYear: 12, status: 'ACTIVE' },
    ],
    soa: [
      { date: '2026-08-01', type: 'INVOICE', ref: 'INV-2026-00312', debitAed: 12500.0, creditAed: 0, balanceAed: 12500.0 },
      { date: '2026-08-15', type: 'PAYMENT', ref: 'REC-2026-00290', debitAed: 0, creditAed: 12500.0, balanceAed: 0.0 },
      { date: '2026-09-01', type: 'INVOICE', ref: 'INV-2026-00388', debitAed: 14850.0, creditAed: 0, balanceAed: 14850.0 },
    ],
  },
  {
    id: 'cust-2',
    name: 'Crescent Bay Commercial Complex',
    type: 'COMMERCIAL',
    trn: '100000000000004 (demo)',
    contactPerson: 'Sophie Delacroix (Facilities Dir.)',
    phone: 'xxxxxxxxx',
    email: 'test@i-bnb.com',
    sitesCount: 4,
    assetsCount: 22,
    activeAmcCount: 2,
    outstandingBalanceAed: 8900.0,
    sites: [
      { name: 'Crescent Bay Hotel & Residences', address: 'Downtown Dubai', coordinates: '25.1950° N, 55.2796° E', siteContact: 'Ziad Mansour (xxxxxxxxx)' },
      { name: 'Crescent Bay Hills', address: 'Emirates Hills, Dubai', coordinates: '25.0740° N, 55.1610° E', siteContact: 'Praveen Roy (xxxxxxxxx)' },
    ],
    assets: [
      { assetTag: 'AST-EMR-011', name: 'Carrier 30XA AquaForce Air-Cooled Chiller', type: 'HVAC Chiller', serialNumber: 'CAR-AF-2022-9901', location: 'Roof Deck Level 64', warrantyStatus: 'Active AMC Covered' },
      { assetTag: 'AST-EMR-012', name: 'Fire Fighting Multi-Stage Jockey Pump', type: 'Fire System', serialNumber: 'FF-PMP-2021-303', location: 'Fire Pump Room', warrantyStatus: 'Active AMC Covered' },
    ],
    contracts: [
      { contractNumber: 'AMC-2026-004', tier: 'GOLD PREVENTIVE', startDate: '2026-03-01', endDate: '2027-02-28', valueAed: 36000, visitsPerYear: 6, status: 'ACTIVE' },
    ],
    soa: [
      { date: '2026-08-10', type: 'INVOICE', ref: 'INV-2026-00340', debitAed: 8900.0, creditAed: 0, balanceAed: 8900.0 },
    ],
  },
  {
    id: 'cust-3',
    name: 'Desert Rose Logistics LLC',
    type: 'CONTRACTOR',
    trn: '100000000000005 (demo)',
    contactPerson: 'Eng. Basel Al-Khatib',
    phone: 'xxxxxxxxx',
    email: 'test@i-bnb.com',
    sitesCount: 3,
    assetsCount: 12,
    activeAmcCount: 1,
    outstandingBalanceAed: 42500.0,
    sites: [
      { name: 'Desert Rose Logistics Hub Phase 2 Plot 14', address: 'Dubai Logistics City, Dubai', coordinates: '25.2010° N, 55.3512° E', siteContact: 'Site Foreman Tariq (xxxxxxxxx)' },
    ],
    assets: [
      { assetTag: 'AST-NAB-001', name: 'Caterpillar 150 kVA Standby Generator', type: 'Rental Unit', serialNumber: 'CAT-150-8812', location: 'Laydown Yard 2', warrantyStatus: 'Rental Maintenance' },
    ],
    contracts: [
      { contractNumber: 'LBR-2026-018', tier: 'MANPOWER MASTER AGREEMENT', startDate: '2026-01-15', endDate: '2026-12-31', valueAed: 142000, visitsPerYear: 52, status: 'ACTIVE' },
    ],
    soa: [
      { date: '2026-08-31', type: 'INVOICE', ref: 'INV-2026-00370', debitAed: 42500.0, creditAed: 0, balanceAed: 42500.0 },
    ],
  },
  {
    id: 'cust-4',
    name: 'Dr. Tariq Al-Suwaidi (Villa Owner)',
    type: 'RESIDENTIAL',
    contactPerson: 'Dr. Tariq Al-Suwaidi',
    phone: 'xxxxxxxxx',
    email: 'test@i-bnb.com',
    sitesCount: 2,
    assetsCount: 8,
    activeAmcCount: 1,
    outstandingBalanceAed: 0.0,
    sites: [
      { name: 'Palm Jumeirah Signature Villa', address: 'Villa 88, Palm Jumeirah Frond M, Dubai', coordinates: '25.1215° N, 55.1324° E', siteContact: 'Self' },
      { name: 'Jumeirah Golf Estates Villa', address: 'Flame Tree Ridge Villa 14, Dubai', coordinates: '25.0210° N, 55.1980° E', siteContact: 'Property Manager' },
    ],
    assets: [
      { assetTag: 'AST-VIL-041', name: 'Daikin VRV IV-S Inverter Heat Pump', type: 'HVAC VRV', serialNumber: 'DKN-VRV-901', location: 'Roof Platform', warrantyStatus: 'Active AMC Covered' },
      { assetTag: 'AST-VIL-042', name: 'Solar Thermal Water Heater 300L', type: 'Water Heater', serialNumber: 'SLR-HTR-2023', location: 'Roof Service Area', warrantyStatus: 'Active AMC Covered' },
    ],
    contracts: [
      { contractNumber: 'AMC-2026-088', tier: 'VILLA GOLD AMC', startDate: '2026-04-01', endDate: '2027-03-31', valueAed: 7500, visitsPerYear: 4, status: 'ACTIVE' },
    ],
    soa: [
      { date: '2026-04-01', type: 'INVOICE', ref: 'INV-2026-00150', debitAed: 7500.0, creditAed: 0, balanceAed: 7500.0 },
      { date: '2026-04-02', type: 'PAYMENT', ref: 'REC-2026-00144', debitAed: 0, creditAed: 7500.0, balanceAed: 0.0 },
    ],
  },
];

export default function CustomersAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [customers, setCustomers] = useState<CustomerRecord[]>(SAMPLE_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(SAMPLE_CUSTOMERS[0]);
  const [customerTab, setCustomerTab] = useState<'SITES' | 'ASSETS' | 'CONTRACTS' | 'SOA'>('SITES');

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'name',
      header: 'Customer / Corporate Entity',
      render: (r) => (
        <div>
          <Link
            href={`/${locale}/admin/customers/${r.id}`}
            className="font-extrabold text-teal-800 hover:text-teal-950 hover:underline text-xs"
          >
            {r.name}
          </Link>
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
            <span className="font-semibold text-teal-800">{r.type}</span>
            {r.trn && <span>• TRN: {r.trn}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Primary Contact',
      render: (r) => (
        <div>
          <div className="text-xs font-bold text-slate-800">{r.contactPerson}</div>
          <div className="text-[11px] font-mono text-slate-500">{maskPhone(r.phone)}</div>
        </div>
      ),
    },
    {
      key: 'sitesCount',
      header: 'Portfolio Footprint',
      render: (r) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
            {r.sitesCount} Sites
          </span>
          <span className="bg-teal-50 px-2 py-0.5 rounded font-bold text-teal-800">
            {r.assetsCount} Assets
          </span>
        </div>
      ),
    },
    {
      key: 'activeAmcCount',
      header: 'AMC Contracts',
      render: (r) => (
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{r.activeAmcCount} Active</span>
        </span>
      ),
    },
    {
      key: 'outstandingBalanceAed',
      header: 'Receivables Balance',
      render: (r) => (
        <div className="text-right">
          <span className={`text-xs font-black ${r.outstandingBalanceAed > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
            {r.outstandingBalanceAed.toFixed(2)} AED
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          onClick={() => setSelectedCustomer(r)}
          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition"
          title="View Full CRM Dossier"
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
            <Users className="w-4 h-4" />
            <span>{isArabic ? 'إدارة علاقات العملاء والأصول' : 'Enterprise CRM & Portfolio Management'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'العملاء، المواقع، وعقود الصيانة' : 'Customers, Sites & Asset Registers'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'ملفات شاملة للعملاء (B2B والأفراد)، سجل المواقع بإحداثيات GPS، الأصول مع رموز QR، وعقود الصيانة السنوية (AMC)'
              : 'Complete customer CRM: multi-site GPS locations, asset registry with QR tags, AMC SLA contracts, and accounts receivable SOA'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Active AMCs</span>
            <span className="text-lg font-black text-emerald-700">25 Contracts</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Tracked Assets</span>
            <span className="text-lg font-black text-teal-800">150 Units</span>
          </div>
        </div>
      </div>

      {/* Main Customers DataTable */}
      <DataTable
        title="Client Portfolio & Accounts"
        data={customers}
        columns={columns}
        searchPlaceholder="Search customer name, TRN, contact, or type..."
        searchKeys={['name', 'trn', 'contactPerson', 'type']}
        exportFileName="customers_crm_export"
      />

      {/* Customer 360-Degree Profile Drawer / Inspector */}
      {selectedCustomer && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {selectedCustomer.type}
                </span>
                {selectedCustomer.trn && (
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    TRN: {selectedCustomer.trn}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">{selectedCustomer.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                <span className="font-semibold">{selectedCustomer.contactPerson}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedCustomer.phone}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedCustomer.email}</span>
                </span>
              </div>
            </div>

            <div className="text-start sm:text-end">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Statement Balance</span>
              <span className={`text-xl font-black ${selectedCustomer.outstandingBalanceAed > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                {selectedCustomer.outstandingBalanceAed.toFixed(2)} AED
              </span>
            </div>
          </div>

          {/* Sub-tabs for Sites, Assets, Contracts, SOA */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
            {[
              { id: 'SITES', label: `Sites & Locations (${selectedCustomer.sites.length})`, icon: MapPin },
              { id: 'ASSETS', label: `Client Assets (${selectedCustomer.assets.length})`, icon: QrCode },
              { id: 'CONTRACTS', label: `AMC Contracts (${selectedCustomer.contracts.length})`, icon: ShieldCheck },
              { id: 'SOA', label: 'Statement of Account (SOA)', icon: Receipt },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = customerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCustomerTab(tab.id as any)}
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
          {customerTab === 'SITES' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {selectedCustomer.sites.map((site, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{site.name}</span>
                    <MapPin className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-slate-600">{site.address}</div>
                  <div className="font-mono text-[10px] text-teal-800 bg-white p-1.5 rounded border">
                    GPS: {site.coordinates}
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t">
                    <span className="font-bold text-slate-700">On-site Contact:</span> {site.siteContact}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: ASSETS */}
          {customerTab === 'ASSETS' && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {selectedCustomer.assets.map((asset, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded">
                        {asset.assetTag}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {asset.warrantyStatus}
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900">{asset.name}</div>
                    <div className="text-slate-500 text-[11px]">Type: {asset.type} • Serial: {asset.serialNumber}</div>
                    <div className="text-slate-600 bg-white p-2 rounded border flex items-center justify-between">
                      <span>Location: {asset.location}</span>
                      <QrCode className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: CONTRACTS */}
          {customerTab === 'CONTRACTS' && (
            <div className="space-y-3 pt-2 text-xs">
              {selectedCustomer.contracts.map((c, i) => (
                <div key={i} className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-teal-900">{c.contractNumber}</span>
                      <span className="font-black text-[10px] uppercase bg-teal-200 text-teal-900 px-2 py-0.5 rounded">
                        {c.tier}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      Validity: {c.startDate} to {c.endDate} ({c.visitsPerYear} Preventive Visits Included)
                    </div>
                  </div>
                  <div className="text-start md:text-end">
                    <span className="text-[10px] font-bold text-teal-800 uppercase block">Annual Contract Value</span>
                    <span className="text-base font-black text-slate-900">{c.valueAed.toLocaleString()} AED</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: STATEMENT OF ACCOUNT (SOA) */}
          {customerTab === 'SOA' && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Ledger Statement of Account (SOA)</h4>
                  <p className="text-slate-500 text-[11px]">Chronological debits, credits, and open balance</p>
                </div>
                <button
                  onClick={() => alert(`Downloading Statement of Account for ${selectedCustomer.name}...`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Statement</span>
                </button>
              </div>

              <table className="w-full border rounded-xl overflow-hidden text-start">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5 text-start">Date</th>
                    <th className="p-2.5 text-start">Transaction Ref</th>
                    <th className="p-2.5 text-start">Type</th>
                    <th className="p-2.5 text-end">Debit (AED)</th>
                    <th className="p-2.5 text-end">Credit (AED)</th>
                    <th className="p-2.5 text-end">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedCustomer.soa.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 text-slate-600">{row.date}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{row.ref}</td>
                      <td className="p-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${row.type === 'INVOICE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-end font-semibold">{row.debitAed > 0 ? row.debitAed.toFixed(2) : '-'}</td>
                      <td className="p-2.5 text-end font-semibold text-emerald-700">{row.creditAed > 0 ? row.creditAed.toFixed(2) : '-'}</td>
                      <td className="p-2.5 text-end font-black text-slate-900">{row.balanceAed.toFixed(2)} AED</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
