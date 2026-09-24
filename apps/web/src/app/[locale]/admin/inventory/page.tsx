'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import {
  Package,
  ArrowRightLeft,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Building2,
  DollarSign,
  TrendingDown,
  Layers,
  Search,
  X,
  History,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  unit: string;
  costPriceAed: number;
  sellingPriceAed: number;
  totalStockQuantity: number;
  warehouseQuantity: number; // Al Quoz
  yardQuantity: number; // Musaffah
  vansQuantity: number; // 12 Service Vans
  reorderLevel: number;
}

interface StockMovement {
  id: string;
  timestamp: string;
  itemCode: string;
  itemName: string;
  type: 'RECEIPT_PO' | 'VAN_TRANSFER' | 'WO_ISSUANCE' | 'RETURN_DEFECT';
  fromLocation: string;
  toLocation: string;
  quantity: number;
  referenceDoc: string;
  performedBy: string;
}

const SAMPLE_ITEMS: InventoryItem[] = [
  { id: '1', itemCode: 'MAT-HVAC-GAS410', name: 'R410A Refrigerant Gas (11.3 kg Cylinder)', category: 'HVAC', unit: 'cyl', costPriceAed: 220, sellingPriceAed: 380, totalStockQuantity: 45, warehouseQuantity: 30, yardQuantity: 5, vansQuantity: 10, reorderLevel: 15 },
  { id: '2', itemCode: 'MAT-HVAC-CAP45', name: 'Dual Run Capacitor 45/5 uF 440V', category: 'HVAC', unit: 'pcs', costPriceAed: 25, sellingPriceAed: 75, totalStockQuantity: 120, warehouseQuantity: 70, yardQuantity: 20, vansQuantity: 30, reorderLevel: 25 },
  { id: '3', itemCode: 'MAT-ELEC-MCB20', name: 'Schneider Electric MCB 20A 1-Pole Acti9', category: 'Electrical', unit: 'pcs', costPriceAed: 18, sellingPriceAed: 45, totalStockQuantity: 200, warehouseQuantity: 140, yardQuantity: 20, vansQuantity: 40, reorderLevel: 30 },
  { id: '4', itemCode: 'MAT-PLM-VALVE12', name: 'Grohe Chrome Angle Valve 1/2"', category: 'Plumbing', unit: 'pcs', costPriceAed: 32, sellingPriceAed: 70, totalStockQuantity: 80, warehouseQuantity: 50, yardQuantity: 10, vansQuantity: 20, reorderLevel: 15 },
  { id: '5', itemCode: 'MAT-ELEC-CBL3C25', name: 'Ducab 3-Core 2.5mm² Flexible Copper Cable (100m Roll)', category: 'Electrical', unit: 'roll', costPriceAed: 195, sellingPriceAed: 310, totalStockQuantity: 12, warehouseQuantity: 8, yardQuantity: 2, vansQuantity: 2, reorderLevel: 10 },
  { id: '6', itemCode: 'MAT-PLM-PPR32', name: 'Raktherm PPR Pipe 32mm PN20 4m Length', category: 'Plumbing', unit: 'length', costPriceAed: 24, sellingPriceAed: 52, totalStockQuantity: 65, warehouseQuantity: 45, yardQuantity: 15, vansQuantity: 5, reorderLevel: 20 },
  { id: '7', itemCode: 'MAT-HVAC-FLT1625', name: 'Washable Secondary Air Filter 16x25x1', category: 'HVAC', unit: 'pcs', costPriceAed: 14, sellingPriceAed: 35, totalStockQuantity: 8, warehouseQuantity: 4, yardQuantity: 0, vansQuantity: 4, reorderLevel: 12 }, // Low stock!
  { id: '8', itemCode: 'MAT-ELEC-ABB63', name: 'ABB 63A 4-Pole AC3 Power Contactor', category: 'Electrical', unit: 'pcs', costPriceAed: 310, sellingPriceAed: 540, totalStockQuantity: 4, warehouseQuantity: 2, yardQuantity: 0, vansQuantity: 2, reorderLevel: 6 }, // Low stock!
];

const SAMPLE_MOVEMENTS: StockMovement[] = [
  { id: 'm-1', timestamp: 'Today, 08:30 AM', itemCode: 'MAT-HVAC-CAP45', itemName: 'Dual Run Capacitor 45/5 uF', type: 'VAN_TRANSFER', fromLocation: 'Al Quoz Central Warehouse', toLocation: 'Van-01 (Rashid Al-Nuaimi)', quantity: 5, referenceDoc: 'TR-2026-089', performedBy: 'Bilal (Storekeeper)' },
  { id: 'm-2', timestamp: 'Today, 09:45 AM', itemCode: 'MAT-HVAC-CAP45', itemName: 'Dual Run Capacitor 45/5 uF', type: 'WO_ISSUANCE', fromLocation: 'Van-01 (Rashid Al-Nuaimi)', toLocation: 'Work Order WO-2026-00001', quantity: 1, referenceDoc: 'WO-2026-00001', performedBy: 'Rashid Al-Nuaimi' },
  { id: 'm-3', timestamp: 'Yesterday, 03:15 PM', itemCode: 'MAT-HVAC-GAS410', itemName: 'R410A Refrigerant 11.3 kg', type: 'RECEIPT_PO', fromLocation: 'Danfoss Middle East FZE', toLocation: 'Al Quoz Central Warehouse', quantity: 20, referenceDoc: 'PO-2026-0044', performedBy: 'Bilal (Storekeeper)' },
  { id: 'm-4', timestamp: '21 Sep 2026', itemCode: 'MAT-PLM-VALVE12', itemName: 'Grohe Angle Valve 1/2"', type: 'VAN_TRANSFER', fromLocation: 'Al Quoz Central Warehouse', toLocation: 'Van-02 (Vikram Sharma)', quantity: 8, referenceDoc: 'TR-2026-085', performedBy: 'Bilal (Storekeeper)' },
];

export default function InventoryAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [items, setItems] = useState<InventoryItem[]>(SAMPLE_ITEMS);
  const [movements, setMovements] = useState<StockMovement[]>(SAMPLE_MOVEMENTS);
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'LOCATIONS' | 'MOVEMENTS' | 'LOW_STOCK'>('ITEMS');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transferQty, setTransferQty] = useState(5);
  const [targetVan, setTargetVan] = useState('Van-01 (Rashid Al-Nuaimi)');

  // Overall Inventory Valuation
  const totalValuationAed = items.reduce((acc, it) => acc + it.totalStockQuantity * it.costPriceAed, 0);
  const totalRetailPotentialAed = items.reduce((acc, it) => acc + it.totalStockQuantity * it.sellingPriceAed, 0);
  const lowStockCount = items.filter((it) => it.totalStockQuantity <= it.reorderLevel).length;

  const handleTransfer = () => {
    if (!selectedItem) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              warehouseQuantity: Math.max(0, item.warehouseQuantity - transferQty),
              vansQuantity: item.vansQuantity + transferQty,
            }
          : item
      )
    );

    const newMov: StockMovement = {
      id: `m-${Date.now()}`,
      timestamp: 'Just now',
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.name,
      type: 'VAN_TRANSFER',
      fromLocation: 'Al Quoz Central Warehouse',
      toLocation: targetVan,
      quantity: transferQty,
      referenceDoc: `TR-2026-${Math.floor(100 + Math.random() * 900)}`,
      performedBy: 'Current Dispatcher',
    };

    setMovements([newMov, ...movements]);
    setShowTransferModal(false);
  };

  const columns: Column<InventoryItem>[] = [
    {
      key: 'itemCode',
      header: 'Part SKU',
      render: (r) => <span className="font-extrabold text-slate-900 font-mono text-xs">{r.itemCode}</span>,
    },
    {
      key: 'name',
      header: 'Material Description',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{r.name}</div>
          <div className="text-[10px] text-slate-500 font-medium">{r.category}</div>
        </div>
      ),
    },
    {
      key: 'totalStockQuantity',
      header: 'Total Stock',
      render: (r) => {
        const isLow = r.totalStockQuantity <= r.reorderLevel;
        return (
          <span className={`font-black text-xs ${isLow ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded' : 'text-slate-900'}`}>
            {r.totalStockQuantity} {r.unit}
            {isLow && ' (Low)'}
          </span>
        );
      },
    },
    {
      key: 'warehouseQuantity',
      header: 'Al Quoz Main',
      render: (r) => <span className="text-xs text-slate-700 font-semibold">{r.warehouseQuantity} {r.unit}</span>,
    },
    {
      key: 'yardQuantity',
      header: 'Musaffah Yard',
      render: (r) => <span className="text-xs text-slate-600">{r.yardQuantity} {r.unit}</span>,
    },
    {
      key: 'vansQuantity',
      header: '12 Fleet Vans',
      render: (r) => (
        <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
          {r.vansQuantity} {r.unit}
        </span>
      ),
    },
    {
      key: 'costPriceAed',
      header: 'Valuation (Cost)',
      render: (r) => (
        <div className="text-right">
          <span className="font-black text-slate-900 text-xs">
            {(r.totalStockQuantity * r.costPriceAed).toLocaleString()} AED
          </span>
          <div className="text-[10px] text-slate-500">@{r.costPriceAed} AED/ea</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Transfer',
      render: (r) => (
        <button
          onClick={() => {
            setSelectedItem(r);
            setShowTransferModal(true);
          }}
          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition"
          title="Transfer Stock to Van"
        >
          <ArrowRightLeft className="w-4 h-4" />
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
            <Package className="w-4 h-4" />
            <span>{isArabic ? 'إدارة المستودعات وسلاسل الإمداد' : 'Supply Chain & Material Tracking'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'المخزون، المستودعات، وسيارات الخدمة' : 'Inventory & Mobile Van Stock'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'متابعة 200 صنف عبر مستودع القوز الرئيسي، ساحة مصفح في أبوظبي، و12 سيارة خدمة ميدانية، مع مراقبة نقطة إعادة الطلب والتقييم المالي'
              : 'Multi-location inventory: central Al Quoz warehouse, Musaffah yard, and 12 technician van stocks with real-time transfer tracking'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Valuation (FIFO)</span>
            <span className="text-lg font-black text-teal-900">{totalValuationAed.toLocaleString()} AED</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-red-600 uppercase block">Reorder Alerts</span>
            <span className="text-lg font-black text-red-600">{lowStockCount} Items Low</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'ITEMS', label: `Item Master Catalog (${items.length})`, icon: Package },
          { id: 'LOCATIONS', label: 'Stock by Location (Warehouse + Vans)', icon: Building2 },
          { id: 'MOVEMENTS', label: `Stock Movements Ledger (${movements.length})`, icon: History },
          { id: 'LOW_STOCK', label: `Safety Stock & Reorders (${lowStockCount})`, icon: AlertTriangle },
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

      {/* Tab 1: ITEMS MASTER */}
      {activeTab === 'ITEMS' && (
        <DataTable
          title="Central Inventory Master Register"
          data={items}
          columns={columns}
          searchPlaceholder="Search SKU, material name, or category..."
          searchKeys={['itemCode', 'name', 'category']}
          exportFileName="inventory_items_master"
          filters={[
            {
              key: 'category',
              label: 'Category',
              options: [
                { label: 'HVAC', value: 'HVAC' },
                { label: 'Electrical', value: 'Electrical' },
                { label: 'Plumbing', value: 'Plumbing' },
              ],
            },
          ]}
        />
      )}

      {/* Tab 2: LOCATIONS */}
      {activeTab === 'LOCATIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">Al Quoz Central Warehouse</span>
              <Building2 className="w-4 h-4 text-teal-700" />
            </div>
            <p className="text-slate-500 text-xs">Main logistics depot, Al Quoz 3, Dubai</p>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Total Items Stored:</span>
                <span className="font-bold text-slate-900">347 units</span>
              </div>
              <div className="flex justify-between">
                <span>Location Valuation:</span>
                <span className="font-black text-teal-900">
                  {Math.round(totalValuationAed * 0.7).toLocaleString()} AED
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">Musaffah Abu Dhabi Yard</span>
              <Building2 className="w-4 h-4 text-teal-700" />
            </div>
            <p className="text-slate-500 text-xs">Heavy storage & scaffolding yard, Musaffah M-12</p>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Total Items Stored:</span>
                <span className="font-bold text-slate-900">72 units</span>
              </div>
              <div className="flex justify-between">
                <span>Location Valuation:</span>
                <span className="font-black text-teal-900">
                  {Math.round(totalValuationAed * 0.15).toLocaleString()} AED
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">12 Mobile Service Vans</span>
              <Truck className="w-4 h-4 text-teal-700" />
            </div>
            <p className="text-slate-500 text-xs">Floating rolling stock with emergency spares</p>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Total Rolling Stock:</span>
                <span className="font-bold text-slate-900">118 units</span>
              </div>
              <div className="flex justify-between">
                <span>Location Valuation:</span>
                <span className="font-black text-teal-900">
                  {Math.round(totalValuationAed * 0.15).toLocaleString()} AED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MOVEMENTS */}
      {activeTab === 'MOVEMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">Stock Movement & Transfer Audit Trail</h3>
          <table className="w-full border rounded-xl overflow-hidden text-start text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-2.5 text-start">Timestamp</th>
                <th className="p-2.5 text-start">SKU / Item</th>
                <th className="p-2.5 text-start">Action Type</th>
                <th className="p-2.5 text-start">From → To</th>
                <th className="p-2.5 text-center">Qty</th>
                <th className="p-2.5 text-start">Ref Doc</th>
                <th className="p-2.5 text-start">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="p-2.5 text-slate-600">{m.timestamp}</td>
                  <td className="p-2.5">
                    <span className="font-mono text-[10px] font-bold text-teal-900 block">{m.itemCode}</span>
                    <span className="font-semibold text-slate-900">{m.itemName}</span>
                  </td>
                  <td className="p-2.5">
                    <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {m.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-700">
                    <span className="font-semibold">{m.fromLocation}</span>
                    <span className="text-slate-400 mx-1">→</span>
                    <span className="font-semibold text-teal-900">{m.toLocation}</span>
                  </td>
                  <td className="p-2.5 text-center font-black text-slate-900">{m.quantity}</td>
                  <td className="p-2.5 font-mono text-slate-600">{m.referenceDoc}</td>
                  <td className="p-2.5 text-slate-600">{m.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: LOW STOCK */}
      {activeTab === 'LOW_STOCK' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Critical Materials Below Reorder Threshold</span>
          </div>
          <div className="space-y-3">
            {items
              .filter((it) => it.totalStockQuantity <= it.reorderLevel)
              .map((it) => (
                <div
                  key={it.id}
                  className="p-4 bg-red-50/50 border border-red-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-red-700">{it.itemCode}</span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">{it.name}</div>
                    <div className="text-slate-600 text-[11px]">
                      Current Stock: <span className="font-bold text-red-700">{it.totalStockQuantity} {it.unit}</span> • Reorder Threshold: {it.reorderLevel} {it.unit}
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Generated Purchase Order Requisition for ${it.name}!`)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                  >
                    Raise Supplier PO
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {showTransferModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase block">Van Replenishment Transfer</span>
                <h3 className="font-black text-slate-900 text-base">{selectedItem.name}</h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span>Available in Warehouse:</span>
                  <span className="font-bold text-slate-900">{selectedItem.warehouseQuantity} {selectedItem.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Fleet Stock:</span>
                  <span className="font-bold text-teal-800">{selectedItem.vansQuantity} {selectedItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Service Van</label>
                <select
                  value={targetVan}
                  onChange={(e) => setTargetVan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-900"
                >
                  <option value="Van-01 (Rashid Al-Nuaimi)">Van-01 (Rashid Al-Nuaimi - HVAC)</option>
                  <option value="Van-02 (Vikram Sharma)">Van-02 (Vikram Sharma - Plumbing)</option>
                  <option value="Van-03 (Mohammad Rizwan)">Van-03 (Mohammad Rizwan - Electrical)</option>
                  <option value="Van-04 (Kareem Mostafa)">Van-04 (Kareem Mostafa - HVAC)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transfer Quantity ({selectedItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.warehouseQuantity}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-black text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border rounded-xl text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-xs shadow"
              >
                Confirm Van Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
