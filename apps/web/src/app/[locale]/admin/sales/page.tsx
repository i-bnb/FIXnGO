'use client';

import React, { useState } from 'react';
import {
  Receipt,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle2,
  Printer,
  Search,
  Sparkles,
  QrCode,
  X,
  History,
} from 'lucide-react';

interface PosItem {
  id: string;
  sku: string;
  name: string;
  category: 'HVAC' | 'ELECTRICAL' | 'PLUMBING' | 'TOOLS';
  priceAed: number;
  stockQty: number;
  unit: string;
}

interface CartItem extends PosItem {
  quantity: number;
}

interface SalesOrder {
  id: string;
  receiptNumber: string;
  customerName: string;
  timestamp: string;
  itemsCount: number;
  totalAed: number;
  paymentMethod: 'CASH' | 'CARD' | 'ACCOUNT_CREDIT';
}

const POS_CATALOG: PosItem[] = [
  { id: '1', sku: 'MAT-HVAC-GAS410', name: 'R410A Refrigerant 11.3 kg Cylinder', category: 'HVAC', priceAed: 380, stockQty: 30, unit: 'cyl' },
  { id: '2', sku: 'MAT-HVAC-CAP45', name: 'Dual Run Capacitor 45/5 uF 440V', category: 'HVAC', priceAed: 75, stockQty: 70, unit: 'pcs' },
  { id: '3', sku: 'MAT-ELEC-MCB20', name: 'Schneider MCB 20A 1-Pole Acti9', category: 'ELECTRICAL', priceAed: 45, stockQty: 140, unit: 'pcs' },
  { id: '4', sku: 'MAT-PLM-VALVE12', name: 'Grohe Chrome Angle Valve 1/2"', category: 'PLUMBING', priceAed: 70, stockQty: 50, unit: 'pcs' },
  { id: '5', sku: 'MAT-ELEC-CBL3C25', name: 'Ducab 3-Core 2.5mm² Cable (100m)', category: 'ELECTRICAL', priceAed: 310, stockQty: 8, unit: 'roll' },
  { id: '6', sku: 'MAT-PLM-PPR32', name: 'Raktherm PPR Pipe 32mm PN20 4m', category: 'PLUMBING', priceAed: 52, stockQty: 45, unit: 'length' },
  { id: '7', sku: 'MAT-HVAC-FLT1625', name: 'Washable Secondary Filter 16x25x1', category: 'HVAC', priceAed: 35, stockQty: 15, unit: 'pcs' },
  { id: '8', sku: 'MAT-ELEC-ABB63', name: 'ABB 63A 4-Pole AC3 Contactor', category: 'ELECTRICAL', priceAed: 540, stockQty: 6, unit: 'pcs' },
];

const PAST_ORDERS: SalesOrder[] = [
  { id: 'so-1', receiptNumber: 'POS-2026-0812', customerName: 'Walk-in Contractor (Cash)', timestamp: 'Today, 10:14 AM', itemsCount: 4, totalAed: 556.5, paymentMethod: 'CASH' },
  { id: 'so-2', receiptNumber: 'POS-2026-0811', customerName: 'Al-Mansoor MEP Maintenance', timestamp: 'Today, 09:30 AM', itemsCount: 12, totalAed: 1848.0, paymentMethod: 'CARD' },
  { id: 'so-3', receiptNumber: 'POS-2026-0810', customerName: 'Palm Crest Site Ops', timestamp: 'Yesterday, 04:45 PM', itemsCount: 6, totalAed: 980.0, paymentMethod: 'ACCOUNT_CREDIT' },
];

export default function MaterialSalesAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'POS' | 'ORDERS'>('POS');
  const [catalogFilter, setCatalogFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([
    { ...POS_CATALOG[1], quantity: 2 },
    { ...POS_CATALOG[2], quantity: 4 },
  ]);
  const [customerName, setCustomerName] = useState('Walk-in Cash Customer');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'ACCOUNT_CREDIT'>('CARD');
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Cart Calculations
  const subtotalAed = cart.reduce((acc, item) => acc + item.priceAed * item.quantity, 0);
  const vatAed = subtotalAed * 0.05;
  const totalAed = subtotalAed + vatAed;

  const addToCart = (product: PosItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const receiptNum = `POS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      receiptNumber: receiptNum,
      customerName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      subtotalAed,
      vatAed,
      totalAed,
      paymentMethod,
    };

    setCompletedOrder(newOrder);
    setCart([]);
  };

  const filteredCatalog = POS_CATALOG.filter((item) => {
    if (catalogFilter !== 'ALL' && item.category !== catalogFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>{isArabic ? 'نقطة بيع المواد وقطع الغيار' : 'Counter POS & Material Retail'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'مبيعات المواد المباشرة وفواتير الكاونتر' : 'Material Sales & Counter POS Terminal'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'كاونتر مبيعات فوري لمقاولي الصيانة والعملاء: إصدار فواتير ضريبية 5%، خيارات الدفع الفوري (نقدي، شبكة، ذمم شركات)، وسحب المخزون'
              : 'Fast counter-sales POS: barcode scan, instant 5% VAT invoice calculation, multi-tender payment, and warehouse stock deduction'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('POS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'POS' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isArabic ? 'كاونتر البيع' : 'POS Register'}</span>
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ORDERS' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{isArabic ? 'سجل المبيعات' : 'Sales History'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'POS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Product Catalog Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Category Tabs */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['ALL', 'HVAC', 'ELECTRICAL', 'PLUMBING'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatalogFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      catalogFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Scan barcode or search SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCatalog.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-500 shadow-sm hover:shadow cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                        {prod.sku}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{prod.stockQty} in stock</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs mt-1">{prod.name}</h4>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                    <span className="font-black text-slate-900 text-sm">{prod.priceAed} AED</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod);
                      }}
                      className="px-2.5 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: POS Cart & Checkout */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-teal-700" />
                  <h3 className="font-black text-slate-900 text-sm">Active Counter Order</h3>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {cart.length} Line Items
                </span>
              </div>

              {/* Customer Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Billing Account</label>
                <select
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Walk-in Cash Customer">Walk-in Cash Customer (Retail)</option>
                  <option value="Palm Crest Properties LLC">Palm Crest Properties LLC (TRN: 100000000000003 demo)</option>
                  <option value="Crescent Bay Commercial Complex">Crescent Bay Commercial Complex (TRN: 100000000000004 demo)</option>
                  <option value="Desert Rose Logistics LLC">Desert Rose Logistics LLC (TRN: 100000000000005 demo)</option>
                </select>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
                {cart.map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.priceAed} AED ea</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded ms-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Cart is empty. Click items on the left to add.
                  </div>
                )}
              </div>

              {/* Payment Tender Method */}
              <div className="space-y-1.5 pt-2 border-t text-xs">
                <span className="text-[11px] font-bold text-slate-600 block">Payment Method</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CARD', label: 'Card / POS', icon: CreditCard },
                    { id: 'CASH', label: 'Cash', icon: Banknote },
                    { id: 'ACCOUNT_CREDIT', label: 'Credit', icon: Building2 },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                          active
                            ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Excl. VAT):</span>
                  <span className="font-semibold">{subtotalAed.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>UAE VAT (5%):</span>
                  <span className="font-semibold text-teal-800">{vatAed.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-black text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-teal-950">{totalAed.toFixed(2)} AED</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete POS Sale & Print Tax Receipt</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Orders History Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">Recent Counter Sales & POS Receipts</h3>
          <table className="w-full border rounded-xl overflow-hidden text-start text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-2.5 text-start">Receipt #</th>
                <th className="p-2.5 text-start">Client</th>
                <th className="p-2.5 text-start">Timestamp</th>
                <th className="p-2.5 text-center">Items</th>
                <th className="p-2.5 text-start">Tender Method</th>
                <th className="p-2.5 text-end">Total Amount (AED)</th>
                <th className="p-2.5 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PAST_ORDERS.map((ord) => (
                <tr key={ord.id}>
                  <td className="p-2.5 font-mono font-bold text-teal-900">{ord.receiptNumber}</td>
                  <td className="p-2.5 font-bold text-slate-900">{ord.customerName}</td>
                  <td className="p-2.5 text-slate-600">{ord.timestamp}</td>
                  <td className="p-2.5 text-center">{ord.itemsCount}</td>
                  <td className="p-2.5">
                    <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="p-2.5 text-end font-black text-slate-900">{ord.totalAed.toFixed(2)} AED</td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => alert(`Reprinting Thermal Receipt for ${ord.receiptNumber}...`)}
                      className="p-1 text-slate-600 hover:text-teal-700"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POS Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="text-center space-y-1 border-b pb-3">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest">
                FieldOps Technical Services LLC
              </span>
              <h3 className="font-black text-slate-900 text-base">Simplified Tax Invoice</h3>
              <p className="text-[10px] text-slate-500 font-mono">TRN: 100482910300003</p>
              <div className="font-mono text-xs font-bold text-slate-700">{completedOrder.receiptNumber}</div>
              <div className="text-[10px] text-slate-400">{completedOrder.timestamp} • Al Quoz Depot</div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-dashed">
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 block">Customer:</span>
                <span className="font-bold text-slate-900">{completedOrder.customerName}</span>
              </div>

              <div className="pt-2 space-y-1">
                {completedOrder.cart.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-slate-800">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-bold">{(it.priceAed * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{completedOrder.subtotalAed.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (5%):</span>
                  <span>{completedOrder.vatAed.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t">
                  <span>Total Paid:</span>
                  <span className="text-teal-900">{completedOrder.totalAed.toFixed(2)} AED</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Method: {completedOrder.paymentMethod}</span>
              <QrCode className="w-8 h-8 text-slate-700" />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCompletedOrder(null)}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Close & Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
