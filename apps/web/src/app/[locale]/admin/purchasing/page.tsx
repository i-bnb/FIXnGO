'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import {
  ShoppingCart,
  Building2,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  FileCheck,
  Receipt,
  Truck,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  destinationWarehouse: string;
  itemsCount: number;
  subtotalAed: number;
  vatAed: number;
  totalAmountAed: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RECEIVED';
  approvedBy?: string;
  items: {
    sku: string;
    description: string;
    qty: number;
    unitPriceAed: number;
    totalAed: number;
  }[];
}

interface Supplier {
  id: string;
  name: string;
  trn: string;
  contactPerson: string;
  phone: string;
  email: string;
  paymentTerms: string;
  category: string;
  rating: number;
}

interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplierName: string;
  receivedDate: string;
  destination: string;
  inspectedBy: string;
  condition: string;
}

const SAMPLE_POS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-0044',
    supplierName: 'Danfoss Middle East FZE',
    orderDate: '2026-09-22',
    expectedDelivery: '2026-09-24',
    destinationWarehouse: 'Al Quoz Central Warehouse',
    itemsCount: 2,
    subtotalAed: 6400,
    vatAed: 320,
    totalAmountAed: 6720,
    status: 'APPROVED',
    approvedBy: 'Tariq Mansoor (Ops Manager)',
    items: [
      { sku: 'MAT-HVAC-GAS410', description: 'R410A Refrigerant 11.3 kg Cylinder', qty: 20, unitPriceAed: 220, totalAed: 4400 },
      { sku: 'MAT-HVAC-TXV10', description: 'Thermostatic Expansion Valve 10-Ton', qty: 5, unitPriceAed: 400, totalAed: 2000 },
    ],
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-0045',
    supplierName: 'Schneider Electric UAE',
    orderDate: '2026-09-23',
    expectedDelivery: '2026-09-25',
    destinationWarehouse: 'Al Quoz Central Warehouse',
    itemsCount: 3,
    subtotalAed: 9500,
    vatAed: 475,
    totalAmountAed: 9975,
    status: 'PENDING_APPROVAL',
    items: [
      { sku: 'MAT-ELEC-MCB20', description: 'Schneider MCB 20A 1-Pole', qty: 100, unitPriceAed: 18, totalAed: 1800 },
      { sku: 'MAT-ELEC-ABB63', description: 'Schneider Contactor 63A 4-Pole', qty: 10, unitPriceAed: 320, totalAed: 3200 },
      { sku: 'MAT-ELEC-MCCB160', description: 'Schneider 160A 3-Phase MCCB Breaker', qty: 3, unitPriceAed: 1500, totalAed: 4500 },
    ],
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-0046',
    supplierName: 'Ducab High Voltage Cables LLC',
    orderDate: '2026-09-20',
    expectedDelivery: '2026-09-21',
    destinationWarehouse: 'Musaffah Abu Dhabi Yard',
    itemsCount: 1,
    subtotalAed: 11700,
    vatAed: 585,
    totalAmountAed: 12285,
    status: 'RECEIVED',
    approvedBy: 'Sultan Al-Mansoor (Super Admin)',
    items: [
      { sku: 'MAT-ELEC-CBL3C25', description: 'Ducab 3-Core 2.5mm² Flexible Copper Cable', qty: 60, unitPriceAed: 195, totalAed: 11700 },
    ],
  },
];

const SAMPLE_SUPPLIERS: Supplier[] = [
  { id: 's-1', name: 'Danfoss Middle East FZE', trn: '100288190000003', contactPerson: 'Hassan Jaber', phone: 'xxxxxxxxx', email: 'test@i-bnb.com', paymentTerms: 'Net 30 Days', category: 'HVAC & Refrigeration', rating: 4.9 },
  { id: 's-2', name: 'Schneider Electric UAE', trn: '100499218800003', contactPerson: 'Rania El-Gohary', phone: 'xxxxxxxxx', email: 'test@i-bnb.com', paymentTerms: 'Net 45 Days', category: 'Electrical & Automation', rating: 4.8 },
  { id: 's-3', name: 'Ducab Cables LLC', trn: '100144558800003', contactPerson: 'Biju Nair', phone: 'xxxxxxxxx', email: 'test@i-bnb.com', paymentTerms: 'Net 30 Days', category: 'Cables & Wiring', rating: 4.95 },
  { id: 's-4', name: 'Grohe Middle East Trading', trn: '100311229900003', contactPerson: 'Patrick Simon', phone: 'xxxxxxxxx', email: 'test@i-bnb.com', paymentTerms: 'Net 30 Days', category: 'Plumbing & Sanitary', rating: 4.7 },
];

const SAMPLE_GRNS: GoodsReceiptNote[] = [
  { id: 'grn-1', grnNumber: 'GRN-2026-012', poNumber: 'PO-2026-0046', supplierName: 'Ducab Cables LLC', receivedDate: '2026-09-21', destination: 'Musaffah Abu Dhabi Yard', inspectedBy: 'Bilal (Storekeeper)', condition: '100% Passed (Factory Drums Sealed)' },
  { id: 'grn-2', grnNumber: 'GRN-2026-011', poNumber: 'PO-2026-0042', supplierName: 'Danfoss Middle East FZE', receivedDate: '2026-09-18', destination: 'Al Quoz Central Warehouse', inspectedBy: 'Bilal (Storekeeper)', condition: 'Passed Quality Inspection' },
];

export default function PurchasingAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [pos, setPos] = useState<PurchaseOrder[]>(SAMPLE_POS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(SAMPLE_SUPPLIERS);
  const [grns, setGrns] = useState<GoodsReceiptNote[]>(SAMPLE_GRNS);
  const [activeTab, setActiveTab] = useState<'POS' | 'SUPPLIERS' | 'GRN' | 'MATCHING'>('POS');
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  const handleApprovePo = (id: string) => {
    setPos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'APPROVED', approvedBy: 'Sultan Al-Mansoor (Super Admin)' }
          : p
      )
    );
    if (selectedPo && selectedPo.id === id) {
      setSelectedPo({ ...selectedPo, status: 'APPROVED', approvedBy: 'Sultan Al-Mansoor (Super Admin)' });
    }
  };

  const poColumns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'PO #',
      render: (r) => <span className="font-extrabold text-slate-900 font-mono text-xs">{r.poNumber}</span>,
    },
    {
      key: 'supplierName',
      header: 'Supplier / Vendor',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{r.supplierName}</div>
          <div className="text-[10px] text-slate-500">{r.destinationWarehouse}</div>
        </div>
      ),
    },
    {
      key: 'orderDate',
      header: 'Date',
      render: (r) => <span className="text-xs text-slate-600">{r.orderDate}</span>,
    },
    {
      key: 'status',
      header: 'Approval Status',
      render: (r) => {
        let badge = 'bg-slate-100 text-slate-700';
        if (r.status === 'APPROVED') badge = 'bg-emerald-100 text-emerald-800';
        else if (r.status === 'PENDING_APPROVAL') badge = 'bg-amber-100 text-amber-800';
        else if (r.status === 'RECEIVED') badge = 'bg-blue-100 text-blue-800';

        return (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badge}`}>
            {r.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'totalAmountAed',
      header: 'Total Incl. VAT',
      render: (r) => (
        <div className="text-end font-black text-slate-900 text-xs">
          {r.totalAmountAed.toLocaleString()} AED
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Inspect',
      render: (r) => (
        <button
          onClick={() => setSelectedPo(r)}
          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition"
          title="Inspect PO Details"
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
            <ShoppingCart className="w-4 h-4" />
            <span>{isArabic ? 'المشتريات وسلاسل التوريد' : 'Procurement & Supplier Relations'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'أوامر الشراء، الموردين، واستلام البضائع' : 'Purchase Orders, Suppliers & Goods Receipt'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'دورة مشتريات معتمدة: إصدار أوامر الشراء، الاعتماد المالي متعدد المستويات، مذكرات الاستلام (GRN)، والمطابقة الثلاثية للفواتير'
              : 'End-to-end procurement: multi-tier PO approvals, warehouse goods receipts (GRN), and 3-way supplier invoice matching'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Pending Approval</span>
            <span className="text-lg font-black text-amber-800">1 PO (9,975 AED)</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Registered Vendors</span>
            <span className="text-lg font-black text-teal-900">4 Tier-1</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'POS', label: `Purchase Orders (${pos.length})`, icon: ShoppingCart },
          { id: 'SUPPLIERS', label: `Suppliers Directory (${suppliers.length})`, icon: Building2 },
          { id: 'GRN', label: `Goods Receipts GRN (${grns.length})`, icon: Truck },
          { id: 'MATCHING', label: '3-Way Invoice Matching', icon: Receipt },
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

      {/* Tab 1: POS */}
      {activeTab === 'POS' && (
        <DataTable
          title="Procurement Purchase Orders"
          data={pos}
          columns={poColumns}
          searchPlaceholder="Search PO #, supplier, or status..."
          searchKeys={['poNumber', 'supplierName', 'status']}
          exportFileName="purchase_orders_export"
        />
      )}

      {/* Tab 2: SUPPLIERS */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {s.category}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{s.name}</h3>
                  <div className="text-xs font-mono text-slate-500">TRN: {s.trn}</div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">
                  ★ {s.rating}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-semibold text-slate-800">{s.contactPerson} ({s.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Commercial Terms:</span>
                  <span className="font-bold text-teal-800">{s.paymentTerms}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: GRN */}
      {activeTab === 'GRN' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">Warehouse Goods Receipts (GRN) Registry</h3>
          <table className="w-full border rounded-xl overflow-hidden text-start text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-2.5 text-start">GRN #</th>
                <th className="p-2.5 text-start">PO Ref</th>
                <th className="p-2.5 text-start">Supplier</th>
                <th className="p-2.5 text-start">Delivery Hub</th>
                <th className="p-2.5 text-start">Receiving Inspector</th>
                <th className="p-2.5 text-start">Inspection Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grns.map((g) => (
                <tr key={g.id}>
                  <td className="p-2.5 font-mono font-bold text-teal-900">{g.grnNumber}</td>
                  <td className="p-2.5 font-mono font-semibold text-slate-700">{g.poNumber}</td>
                  <td className="p-2.5 font-bold text-slate-900">{g.supplierName}</td>
                  <td className="p-2.5 text-slate-600">{g.destination}</td>
                  <td className="p-2.5 text-slate-600">{g.inspectedBy}</td>
                  <td className="p-2.5">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{g.condition}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: 3-WAY MATCHING */}
      {activeTab === 'MATCHING' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">3-Way Supplier Invoice Matching Engine</h3>
              <p className="text-slate-500 text-xs">
                Matches Supplier Tax Invoice with Approved PO items and Warehouse GRN receipts before posting payment.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Fraud & Overbilling Protected</span>
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-teal-800">INVOICE: SINV-2026-9901</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="font-bold text-slate-900">Danfoss Middle East FZE</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                3-Way Matched (100% Variance 0.00 AED)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-white p-2.5 rounded border">
                <span className="font-bold text-slate-700 block">1. Purchase Order</span>
                <span className="text-slate-500">Ref: PO-2026-0044</span>
                <span className="block font-bold text-slate-900 mt-1">6,720.00 AED</span>
              </div>
              <div className="bg-white p-2.5 rounded border">
                <span className="font-bold text-slate-700 block">2. Warehouse GRN</span>
                <span className="text-slate-500">Ref: GRN-2026-011</span>
                <span className="block font-bold text-emerald-700 mt-1">20 Cylinders Received</span>
              </div>
              <div className="bg-white p-2.5 rounded border">
                <span className="font-bold text-slate-700 block">3. Vendor Tax Invoice</span>
                <span className="text-slate-500">TRN: 100288190000003</span>
                <span className="block font-bold text-teal-900 mt-1">6,720.00 AED Payable</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PO Detail & Approval Modal */}
      {selectedPo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-teal-800">{selectedPo.poNumber}</span>
                <h3 className="font-black text-slate-900 text-base">{selectedPo.supplierName}</h3>
              </div>
              <button onClick={() => setSelectedPo(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-900">{selectedPo.destinationWarehouse}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold text-teal-800">{selectedPo.status}</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Order Line Items:</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-start">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-start">Item</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-end">Total (AED)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPo.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <span className="font-bold text-slate-900">{it.description}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">{it.sku}</span>
                          </td>
                          <td className="p-2 text-center font-bold">{it.qty}</td>
                          <td className="p-2 text-end font-bold">{it.totalAed.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{selectedPo.subtotalAed.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>UAE VAT (5%):</span>
                  <span>{selectedPo.vatAed.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-black text-slate-900 text-sm">
                  <span>Total Payable:</span>
                  <span className="text-teal-900">{selectedPo.totalAmountAed.toFixed(2)} AED</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              {selectedPo.status === 'PENDING_APPROVAL' && (
                <button
                  onClick={() => handleApprovePo(selectedPo.id)}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Purchase Order</span>
                </button>
              )}
              <button
                onClick={() => setSelectedPo(null)}
                className="px-4 py-2 border rounded-xl text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
