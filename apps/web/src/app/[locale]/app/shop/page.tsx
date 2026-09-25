'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Package,
  Plus,
  Check,
  ArrowLeft,
  Search,
  Sparkles,
  ShieldCheck,
  FileText,
  X,
} from 'lucide-react';
import { CustomerMobileNav } from '../../../../components/customer/CustomerMobileNav';

interface ShopProduct {
  id: string;
  sku: string;
  name: string;
  category: 'AC' | 'PLUMBING' | 'ELECTRICAL' | 'CONSUMABLE';
  priceAed: number;
  inStock: boolean;
  warranty: string;
  description: string;
}

const PRODUCTS: ShopProduct[] = [
  {
    id: 'p-01',
    sku: 'SKU-AC-FLT-01',
    name: 'Daikin OEM Anti-Bacterial Air Filter Cartridge (Set of 2)',
    category: 'AC',
    priceAed: 145.0,
    inStock: true,
    warranty: '6 Months',
    description: 'High-density washable filter cartridge designed for Daikin VRV & Inverter split units.',
  },
  {
    id: 'p-02',
    sku: 'SKU-AC-REF-410',
    name: 'Honeywell R410A Refrigerant Eco Gas Cylinder (11.3 kg)',
    category: 'AC',
    priceAed: 320.0,
    inStock: true,
    warranty: 'Manufacturer Sealed',
    description: 'Virgin grade high-purity refrigerant with zero ozone depletion potential.',
  },
  {
    id: 'p-03',
    sku: 'SKU-PLU-PMP-02',
    name: 'Grundfos SCALA2 Smart Water Pressure Booster Pump',
    category: 'PLUMBING',
    priceAed: 1850.0,
    inStock: true,
    warranty: '2 Years Comprehensive',
    description: 'Ultra-silent variable frequency pressure boosting pump for Dubai residential villas.',
  },
  {
    id: 'p-04',
    sku: 'SKU-ELE-BRK-32',
    name: 'Schneider Electric Acti9 32A Dual-Pole MCB Breaker',
    category: 'ELECTRICAL',
    priceAed: 65.0,
    inStock: true,
    warranty: '1 Year',
    description: 'Heavy-duty 10kA breaking capacity miniature circuit breaker for Dubai DEWA compliant DBs.',
  },
  {
    id: 'p-05',
    sku: 'SKU-PLU-VLV-01',
    name: 'Italian Heavy Brass Full Port Ball Valve 3/4-inch',
    category: 'PLUMBING',
    priceAed: 48.0,
    inStock: true,
    warranty: '5 Years',
    description: 'Corrosion resistant forged brass isolation valve rated for 25 bar working pressure.',
  },
  {
    id: 'p-06',
    sku: 'SKU-ELE-PROT-01',
    name: 'Square D Digital Phase Failure & Surge Protection Relay',
    category: 'ELECTRICAL',
    priceAed: 295.0,
    inStock: true,
    warranty: '1 Year',
    description: 'Protects chiller compressor units against brownouts, voltage spikes and phase loss.',
  },
];

export default function CustomerShopPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [quoteItems, setQuoteItems] = useState<Record<string, number>>({});
  const [showQuoteDrawer, setShowQuoteDrawer] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const categories = [
    { key: 'ALL', labelEn: 'All Parts', labelAr: 'جميع المواد' },
    { key: 'AC', labelEn: 'AC & Cooling', labelAr: 'التكييف' },
    { key: 'PLUMBING', labelEn: 'Pumps & Plumbing', labelAr: 'المضخات والسباكة' },
    { key: 'ELECTRICAL', labelEn: 'Electrical DB', labelAr: 'الكهرباء والقواطع' },
  ];

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalQuoteItemCount = Object.values(quoteItems).reduce((sum, qty) => sum + qty, 0);

  const handleAddToQuote = (prodId: string) => {
    setQuoteItems((prev) => ({
      ...prev,
      [prodId]: (prev[prodId] || 0) + 1,
    }));
  };

  const handleRemoveFromQuote = (prodId: string) => {
    setQuoteItems((prev) => {
      const copy = { ...prev };
      delete copy[prodId];
      return copy;
    });
  };

  const calculateSubtotal = () => {
    return Object.entries(quoteItems).reduce((sum, [prodId, qty]) => {
      const prod = PRODUCTS.find((p) => p.id === prodId);
      return sum + (prod ? prod.priceAed * qty : 0);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const vatAmount = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.round((subtotal + vatAmount) * 100) / 100;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/${locale}/app`}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display font-extrabold text-lg text-navy">
              {isArabic ? 'متجر قطع الغيار المعتمدة' : 'Parts & Consumables'}
            </h1>
          </div>

          <button
            onClick={() => setShowQuoteDrawer(true)}
            className="p-2 rounded-xl bg-ground hover:bg-slate-100 border border-line text-ink relative transition"
            title="Quote Cart"
          >
            <ShoppingCart className="w-4 h-4 text-navy" />
            {totalQuoteItemCount > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 bg-signal-orange text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white">
                {totalQuoteItemCount}
              </span>
            )}
          </button>
        </header>

        {/* Search & Categories Bar */}
        <div className="p-3.5 bg-ground border-b border-line space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isArabic ? 'ابحث برقم القطعة أو الاسم...' : 'Search parts, filters, pumps...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-8 pe-3 py-2 bg-white border border-line rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-signal-orange text-navy"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === c.key
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-line hover:bg-slate-50'
                }`}
              >
                {isArabic ? c.labelAr : c.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        <main className="flex-1 p-4 space-y-3 overflow-y-auto">
          {filteredProducts.map((p) => {
            const inQuoteQty = quoteItems[p.id] || 0;

            return (
              <div
                key={p.id}
                className="p-3.5 bg-white border border-line rounded-2xl shadow-xs space-y-2.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-ocean-blue bg-blue-50 px-1.5 py-0.5 rounded">
                      {p.sku}
                    </span>
                    <h3 className="font-bold text-xs text-navy mt-1 group-hover:text-signal-orange transition leading-snug">
                      {p.name}
                    </h3>
                  </div>
                  <div className="text-end shrink-0">
                    <div className="font-extrabold text-xs text-navy">AED {p.priceAed.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-400">incl. 5% VAT</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">{p.description}</p>

                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p.warranty}</span>
                  </span>

                  <button
                    onClick={() => handleAddToQuote(p.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-signal-orange font-bold text-xs border border-orange-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{inQuoteQty > 0 ? `In Quote (${inQuoteQty}) +` : 'Add to Quote'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </main>

        {/* Floating Quote Drawer / Summary */}
        {showQuoteDrawer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in text-xs">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-line">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-signal-orange" />
                  <h3 className="font-black text-sm text-navy">
                    {isArabic ? 'طلب عرض أسعار المواد' : 'Materials Quote Request'}
                  </h3>
                </div>
                <button onClick={() => setShowQuoteDrawer(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {quoteSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-navy">
                    {isArabic ? 'تم إنشاء مسودة طلب المواد بنجاح' : 'Draft Quote Request Created!'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Draft Quote <strong>QTE-2026-0089</strong> has been generated and sent to our Al Quoz storekeeper.
                  </p>
                  <button
                    onClick={() => {
                      setQuoteSubmitted(false);
                      setQuoteItems({});
                      setShowQuoteDrawer(false);
                    }}
                    className="w-full py-2.5 bg-navy text-white rounded-xl font-bold"
                  >
                    Done
                  </button>
                </div>
              ) : totalQuoteItemCount === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Your quote request is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {Object.entries(quoteItems).map(([prodId, qty]) => {
                      const prod = PRODUCTS.find((p) => p.id === prodId);
                      if (!prod) return null;

                      return (
                        <div
                          key={prodId}
                          className="flex items-center justify-between p-2 rounded-xl bg-ground border border-line"
                        >
                          <div className="overflow-hidden pr-2">
                            <div className="font-bold text-navy truncate">{prod.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {qty} × AED {prod.priceAed.toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromQuote(prodId)}
                            className="text-rose-600 hover:text-rose-800 text-[10px] font-bold shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-ground rounded-xl border border-line space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-navy">AED {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>UAE VAT (5%):</span>
                      <span className="font-semibold text-navy">AED {vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-line/60 font-bold text-navy">
                      <span>Estimated Total:</span>
                      <span className="text-signal-orange">AED {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setQuoteSubmitted(true)}
                    className="w-full py-2.5 bg-signal-orange hover:bg-orange-600 text-white rounded-xl font-bold shadow-xs transition"
                  >
                    Submit Quote Request →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Tab Bar */}
        <CustomerMobileNav
          locale={locale}
          activeTab="SHOP"
          onChangeTab={(tab) => {
            if (tab === 'HOME') router.push(`/${locale}/app`);
            if (tab === 'BOOKINGS') router.push(`/${locale}/app/bookings`);
            if (tab === 'ACCOUNT') router.push(`/${locale}/app/account`);
          }}
          activeOrderCount={1}
        />
      </div>
    </div>
  );
}
