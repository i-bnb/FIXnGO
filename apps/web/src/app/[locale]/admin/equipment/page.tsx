'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import {
  Tractor,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  FileCheck,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Layers,
  Sparkles,
  ClipboardCheck,
  X,
} from 'lucide-react';
import { calculateUaeVat } from '@fieldops/shared';

interface EquipmentUnit {
  id: string;
  code: string;
  name: string;
  category: string;
  serialNumber: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  dailyRateAed: number;
  weeklyRateAed: number;
  monthlyRateAed: number;
  currentLocation: string;
  meterHours: number;
  utilizationRate: number; // percentage
  activeClient?: string;
  returnDate?: string;
}

interface RentalContract {
  id: string;
  contractNumber: string;
  equipmentCode: string;
  equipmentName: string;
  clientName: string;
  projectName: string;
  startDate: string;
  endDate: string;
  depositAed: number;
  totalAmountAed: number;
  status: 'ACTIVE' | 'RETURNED' | 'RENEWAL_DUE';
}

const SAMPLE_EQUIPMENT: EquipmentUnit[] = [
  { id: '1', code: 'EQ-GEN-100', name: 'Caterpillar 100 kVA Soundproof Diesel Generator', category: 'Generators', serialNumber: 'CAT-GEN-2024-998', status: 'RENTED', dailyRateAed: 450, weeklyRateAed: 2600, monthlyRateAed: 9500, currentLocation: 'Aldar Yas Island Site', meterHours: 1420, utilizationRate: 85, activeClient: 'Arabtec Contracting', returnDate: '2026-10-15' },
  { id: '2', code: 'EQ-SCAF-06', name: 'Aluminium Mobile Scaffolding Tower (6 Metres)', category: 'Access Equipment', serialNumber: 'ALU-SCAF-2025-104', status: 'AVAILABLE', dailyRateAed: 120, weeklyRateAed: 650, monthlyRateAed: 2200, currentLocation: 'Al Quoz Central Yard', meterHours: 0, utilizationRate: 60 },
  { id: '3', code: 'EQ-LIFT-12', name: 'Haulotte 12m Electric Scissor Lift', category: 'Access Equipment', serialNumber: 'HAU-LIFT-2023-441', status: 'RENTED', dailyRateAed: 380, weeklyRateAed: 2100, monthlyRateAed: 7200, currentLocation: 'Emaar Creek Harbour Phase 2', meterHours: 890, utilizationRate: 78, activeClient: 'Al Naboodah Group', returnDate: '2026-10-02' },
  { id: '4', code: 'EQ-BRK-01', name: 'Hilti TE 1000-AVR Heavy Demolition Breaker', category: 'Power Tools', serialNumber: 'HLT-BRK-2025-331', status: 'AVAILABLE', dailyRateAed: 150, weeklyRateAed: 800, monthlyRateAed: 2600, currentLocation: 'Al Quoz Central Yard', meterHours: 340, utilizationRate: 52 },
  { id: '5', code: 'EQ-MIX-350', name: 'Belle Site Concrete Mixer 350L (Diesel)', category: 'Concrete Equipment', serialNumber: 'BEL-MIX-2024-009', status: 'RENTED', dailyRateAed: 220, weeklyRateAed: 1200, monthlyRateAed: 4200, currentLocation: 'Sharjah Aljada Phase 2', meterHours: 620, utilizationRate: 70, activeClient: 'Al-Marwan Contracting', returnDate: '2026-09-30' },
  { id: '6', code: 'EQ-WELD-400', name: 'Miller Big Blue 400A Diesel Welder Generator', category: 'Welding & Fab', serialNumber: 'MIL-WLD-2023-772', status: 'AVAILABLE', dailyRateAed: 320, weeklyRateAed: 1800, monthlyRateAed: 6400, currentLocation: 'Musaffah Abu Dhabi Yard', meterHours: 1100, utilizationRate: 64 },
];

const SAMPLE_CONTRACTS: RentalContract[] = [
  { id: 'r-1', contractNumber: 'RNT-2026-0101', equipmentCode: 'EQ-GEN-100', equipmentName: 'Caterpillar 100 kVA Generator', clientName: 'Arabtec Contracting LLC', projectName: 'Aldar Yas Island Luxury Villas', startDate: '2026-08-15', endDate: '2026-10-15', depositAed: 5000, totalAmountAed: 19950, status: 'ACTIVE' },
  { id: 'r-2', contractNumber: 'RNT-2026-0102', equipmentCode: 'EQ-LIFT-12', equipmentName: 'Haulotte 12m Scissor Lift', clientName: 'Al Naboodah Construction', projectName: 'Emaar Creek Harbour Phase 2', startDate: '2026-09-01', endDate: '2026-10-02', depositAed: 3000, totalAmountAed: 7560, status: 'ACTIVE' },
  { id: 'r-3', contractNumber: 'RNT-2026-0103', equipmentCode: 'EQ-MIX-350', equipmentName: 'Belle Concrete Mixer 350L', clientName: 'Al-Marwan Contracting', projectName: 'Sharjah Aljada Phase 2', startDate: '2026-09-10', endDate: '2026-09-30', depositAed: 2000, totalAmountAed: 4410, status: 'ACTIVE' },
];

export default function EquipmentAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [equipmentList, setEquipmentList] = useState<EquipmentUnit[]>(SAMPLE_EQUIPMENT);
  const [contracts, setContracts] = useState<RentalContract[]>(SAMPLE_CONTRACTS);
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'GANTT' | 'CONTRACTS' | 'INSPECTION' | 'UTILIZATION'>('REGISTER');
  const [showRentModal, setShowRentModal] = useState(false);
  const [selectedEq, setSelectedEq] = useState<EquipmentUnit | null>(null);

  // New rental form
  const [clientName, setClientName] = useState('Al Naboodah MEP Contracting');
  const [projectName, setProjectName] = useState('Dubai Creek Tower Substation');
  const [hireDuration, setHireDuration] = useState('1 Month (30 Days)');

  const handleCreateRental = () => {
    if (!selectedEq) return;

    const baseAmount = selectedEq.monthlyRateAed;
    const vat = calculateUaeVat(baseAmount);

    const newContract: RentalContract = {
      id: `r-${Date.now()}`,
      contractNumber: `RNT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      equipmentCode: selectedEq.code,
      equipmentName: selectedEq.name,
      clientName,
      projectName,
      startDate: '2026-09-24',
      endDate: '2026-10-24',
      depositAed: 3000,
      totalAmountAed: vat.totalAmount,
      status: 'ACTIVE',
    };

    setContracts([newContract, ...contracts]);
    setEquipmentList((prev) =>
      prev.map((eq) =>
        eq.id === selectedEq.id
          ? { ...eq, status: 'RENTED', currentLocation: projectName, activeClient: clientName, returnDate: '2026-10-24' }
          : eq
      )
    );

    setShowRentModal(false);
  };

  const columns: Column<EquipmentUnit>[] = [
    {
      key: 'code',
      header: 'Asset Code',
      render: (r) => <span className="font-extrabold text-teal-900 bg-teal-50 px-2 py-0.5 rounded font-mono text-xs">{r.code}</span>,
    },
    {
      key: 'name',
      header: 'Machine & Serial #',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{r.name}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{r.serialNumber} • {r.category}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Availability',
      render: (r) => (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            r.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: 'currentLocation',
      header: 'Current Location',
      render: (r) => (
        <div className="text-xs text-slate-700 flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="truncate">{r.currentLocation}</span>
        </div>
      ),
    },
    {
      key: 'dailyRateAed',
      header: 'Rates (AED)',
      render: (r) => (
        <div className="text-right text-xs">
          <div className="font-bold text-slate-900">{r.dailyRateAed} / day</div>
          <div className="text-[10px] text-slate-500">{r.monthlyRateAed.toLocaleString()} / month</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Dispatch',
      render: (r) => (
        <button
          onClick={() => {
            setSelectedEq(r);
            setShowRentModal(true);
          }}
          disabled={r.status === 'RENTED'}
          className="px-2.5 py-1 bg-teal-800 hover:bg-teal-900 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
        >
          <span>Rent Out</span>
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
            <Tractor className="w-4 h-4" />
            <span>{isArabic ? 'إدارة تأجير المعدات الثقيلة' : 'Heavy Equipment & Machinery Fleet'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'تأجير المعدات، جدول الإتاحة (Gantt)، والفحص' : 'Equipment Rental, Gantt Availability & ROI'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'أسطول 40 معدة (مولدات، سقالات، رافعات مقصية، وخلاطات): حجز غانت التفاعلي، فحص الاستلام والتسليم، وتقارير العائد المالي'
              : 'Fleet of 40 heavy machines: Gantt booking chart, rental contracts with security deposits, condition inspections, and utilization ROI'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Fleet Utilization</span>
            <span className="text-lg font-black text-emerald-700">68% On Rent</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Rental Contracts</span>
            <span className="text-lg font-black text-teal-900">{contracts.length} Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'REGISTER', label: `Machinery Register (${equipmentList.length})`, icon: Tractor },
          { id: 'GANTT', label: 'Gantt Availability Calendar', icon: Calendar },
          { id: 'CONTRACTS', label: `Rental Contracts (${contracts.length})`, icon: FileCheck },
          { id: 'INSPECTION', label: 'Dispatch & Return Checklists', icon: ClipboardCheck },
          { id: 'UTILIZATION', label: 'Fleet ROI & Utilization', icon: TrendingUp },
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

      {/* Tab 1: REGISTER */}
      {activeTab === 'REGISTER' && (
        <DataTable
          title="Heavy Equipment Fleet Master Register"
          data={equipmentList}
          columns={columns}
          searchPlaceholder="Search machine code, name, or serial..."
          searchKeys={['code', 'name', 'serialNumber', 'category']}
          exportFileName="equipment_fleet_export"
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { label: 'Available', value: 'AVAILABLE' },
                { label: 'Rented', value: 'RENTED' },
              ],
            },
          ]}
        />
      )}

      {/* Tab 2: GANTT AVAILABILITY */}
      {activeTab === 'GANTT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs overflow-x-auto">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Gantt Machine Booking Schedule (Sep - Oct 2026)</h3>
              <p className="text-slate-500 text-[11px]">Visual timeline of current deployments vs idle available units</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
                <span>On Hire / Rented</span>
              </span>
            </div>
          </div>

          <div className="space-y-3 min-w-[700px]">
            {equipmentList.map((eq) => (
              <div key={eq.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between gap-4">
                <div className="w-64 shrink-0">
                  <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                    {eq.code}
                  </span>
                  <div className="font-extrabold text-slate-900 truncate mt-0.5">{eq.name}</div>
                  <div className="text-[10px] text-slate-500">{eq.currentLocation}</div>
                </div>

                <div className="flex-1">
                  {eq.status === 'RENTED' ? (
                    <div className="bg-blue-600 text-white p-2 rounded-lg text-[11px] font-bold flex items-center justify-between shadow-sm">
                      <span>Rented to: {eq.activeClient}</span>
                      <span>Return: {eq.returnDate}</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 p-2 rounded-lg text-[11px] font-bold text-center">
                      Available for Immediate Dispatch (Al Quoz Yard)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: CONTRACTS */}
      {activeTab === 'CONTRACTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">Active Equipment Rental Agreements</h3>
          <table className="w-full border rounded-xl overflow-hidden text-start text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-2.5 text-start">Contract #</th>
                <th className="p-2.5 text-start">Machine</th>
                <th className="p-2.5 text-start">Client & Site</th>
                <th className="p-2.5 text-start">Hire Period</th>
                <th className="p-2.5 text-end">Security Deposit</th>
                <th className="p-2.5 text-end">Total Contract</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td className="p-2.5 font-mono font-bold text-teal-900">{c.contractNumber}</td>
                  <td className="p-2.5 font-bold text-slate-900">{c.equipmentName}</td>
                  <td className="p-2.5 text-slate-700">
                    <span className="font-semibold block">{c.clientName}</span>
                    <span className="text-[10px] text-slate-500">{c.projectName}</span>
                  </td>
                  <td className="p-2.5 text-slate-600">{c.startDate} to {c.endDate}</td>
                  <td className="p-2.5 text-end font-semibold text-slate-700">{c.depositAed.toLocaleString()} AED</td>
                  <td className="p-2.5 text-end font-black text-slate-900">{c.totalAmountAed.toLocaleString()} AED</td>
                  <td className="p-2.5 text-center">
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: INSPECTION */}
      {activeTab === 'INSPECTION' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Pre-Dispatch & Off-Hire Return Checklist</h3>
              <p className="text-slate-500 text-xs">Mandatory safety, fuel level, and hour meter condition documentation</p>
            </div>
            <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-bold rounded-lg border border-teal-200">
              UAE Civil Defence & Safety Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <span className="font-bold text-slate-900 uppercase block text-[11px]">1. Dispatch Sign-Off Elements</span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Diesel Fuel Tank 100% Full</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Engine Oil & Coolant Level Inspected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Starting Hour Meter Documented (1420.5 hrs)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Third-Party Calibration Certificate (TUV/Bureau Veritas)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <span className="font-bold text-slate-900 uppercase block text-[11px]">2. Off-Hire Return Elements</span>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Return Fuel Level Check (Refueling Surcharge if &lt;100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Excess Hour Meter Usage Calculation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Structural Paint / Body Damage Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Client Site Representative Release Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: UTILIZATION */}
      {activeTab === 'UTILIZATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
          <h3 className="font-black text-slate-900 text-sm">Machinery Utilization Rate & Fleet ROI (6 Months)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {equipmentList.map((eq) => (
              <div key={eq.id} className="p-4 bg-slate-50 rounded-xl border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{eq.name}</span>
                  <span className="font-black text-teal-800 text-xs">{eq.utilizationRate}% Utilization</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full"
                    style={{ width: `${eq.utilizationRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Operating Meter: {eq.meterHours} hrs</span>
                  <span className="font-bold text-slate-700">Asset Yield: {eq.utilizationRate > 70 ? 'High ROI' : 'Moderate'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Rental Contract Modal */}
      {showRentModal && selectedEq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase block">Equipment Dispatch Contract</span>
                <h3 className="font-black text-slate-900 text-base">{selectedEq.name}</h3>
              </div>
              <button onClick={() => setShowRentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contractor / Client</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Site Delivery Destination</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rental Period</label>
                <select
                  value={hireDuration}
                  onChange={(e) => setHireDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-900"
                >
                  <option value="1 Month (30 Days)">1 Month (30 Days) - Monthly Rate</option>
                  <option value="2 Weeks (14 Days)">2 Weeks (14 Days)</option>
                  <option value="3 Months (90 Days)">3 Months (90 Days)</option>
                </select>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span>Base Hire Rate:</span>
                  <span className="font-bold">{selectedEq.monthlyRateAed.toLocaleString()} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold">3,000.00 AED</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-black text-slate-900 text-sm">
                  <span>Total Due Upon Dispatch (Incl. 5% VAT):</span>
                  <span className="text-teal-900">
                    {(selectedEq.monthlyRateAed * 1.05 + 3000).toLocaleString()} AED
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setShowRentModal(false)}
                className="px-4 py-2 border rounded-xl text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRental}
                className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Execute Dispatch Contract</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
