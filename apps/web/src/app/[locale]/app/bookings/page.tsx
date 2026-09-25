'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Wrench,
  ShieldCheck,
  AlertCircle,
  FileText,
  X,
  Phone,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { CustomerMobileNav } from '../../../../components/customer/CustomerMobileNav';

interface BookingItem {
  id: string;
  orderNumber: string;
  ticketNumber?: string;
  title: string;
  category: string;
  status: 'SCHEDULED' | 'EN_ROUTE' | 'ON_SITE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  date: string;
  timeSlot: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianVan?: string;
  technicianRating?: number;
  address: string;
  area?: string;
  amountAed: number;
  subtotalAed?: number;
  vatAed?: number;
  pricingType?: 'FIXED' | 'QUOTE';
}

export default function CustomerBookingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/customer/bookings');
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      if (data?.success && Array.isArray(data?.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ACTIVE') {
      return b.status === 'IN_PROGRESS' || b.status === 'EN_ROUTE' || b.status === 'ON_SITE' || b.status === 'SCHEDULED';
    }
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  const getStatusBadge = (status: BookingItem['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
      case 'ON_SITE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {isArabic ? 'قيد التنفيذ' : 'In Progress'}
          </span>
        );
      case 'EN_ROUTE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            {isArabic ? 'في الطريق' : 'En Route'}
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-ocean-blue border border-blue-200">
            {isArabic ? 'مجدولة' : 'Scheduled'}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {isArabic ? 'مكتملة' : 'Completed'}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {isArabic ? 'ملغية' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative pb-20 select-none">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/${locale}/app`}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              title="Back"
            >
              <ArrowLeft className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
            <h1 className="font-display font-extrabold text-lg text-navy">
              {isArabic ? 'حجوزاتي والخدمات' : 'My Service Bookings'}
            </h1>
          </div>
          <Link
            href={`/${locale}/app`}
            className="p-1.5 rounded-xl bg-signal-orange text-white hover:bg-signal-orange-hover transition flex items-center gap-1 text-xs font-bold px-2.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'حجز' : 'Book'}</span>
          </Link>
        </header>

        {/* Filter Pills */}
        <div className="p-3 bg-ground border-b border-line flex gap-2">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition text-center ${
                filter === tab
                  ? 'bg-signal-orange text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-line hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL'
                ? isArabic
                  ? 'الكل'
                  : 'All'
                : tab === 'ACTIVE'
                ? isArabic
                  ? 'النشطة'
                  : 'Active'
                : isArabic
                ? 'المكتملة'
                : 'Completed'}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 space-y-3 overflow-y-auto">
          {/* 1. Loading Skeleton */}
          {loading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 bg-slate-50 border border-line rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                    <div className="h-4 bg-slate-200 rounded w-16" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="pt-2 border-t border-line flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                    <div className="h-4 bg-slate-200 rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Error State */}
          {!loading && error && (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3 my-6">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-bold text-rose-900">{error}</p>
              <button
                onClick={fetchBookings}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إعادة المحاولة' : 'Try Again'}</span>
              </button>
            </div>
          )}

          {/* 3. Empty State */}
          {!loading && !error && filteredBookings.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-signal-orange mx-auto flex items-center justify-center shadow-xs">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-ink font-display">
                  {isArabic ? 'لا توجد حجوزات حتى الآن' : 'No bookings yet'}
                </h3>
                <p className="text-xs text-slate max-w-xs mx-auto">
                  {isArabic
                    ? 'احجز خدمة صيانة مكيف أو سباكة أو كهرباء الآن واحصل على فني معتمد.'
                    : 'Schedule an AC service, electrical repair, or plumbing fix in 4 simple steps.'}
                </p>
              </div>
              <Link
                href={`/${locale}/app`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-signal-orange hover:bg-signal-orange-hover text-white text-xs font-extrabold rounded-xl shadow-md transition"
              >
                <span>{isArabic ? 'حجز خدمة الآن' : 'Book a service'}</span>
                <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          )}

          {/* 4. Bookings List */}
          {!loading && !error && filteredBookings.length > 0 && (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="p-3.5 bg-white border border-line rounded-2xl shadow-xs hover:border-signal-orange/60 transition cursor-pointer space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-signal-orange bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                      {b.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {b.category}
                    </span>
                  </div>
                  {getStatusBadge(b.status)}
                </div>

                <h3 className="font-bold text-xs text-navy group-hover:text-signal-orange transition line-clamp-1">
                  {b.title}
                </h3>

                <div className="space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {b.date} · {b.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs">
                  <div className="font-bold text-navy">
                    {b.pricingType === 'QUOTE' ? (
                      <span className="text-signal-orange text-[11px]">{isArabic ? 'عرض سعر مطلوب' : 'Quote requested'}</span>
                    ) : (
                      <>
                        <span>AED {(b.amountAed ?? 0).toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 font-normal"> (incl. 5% VAT)</span>
                      </>
                    )}
                  </div>
                  <span className="text-signal-orange font-bold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>{isArabic ? 'التفاصيل' : 'Details'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
                  </span>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in text-xs">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-line">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-signal-orange text-sm">
                    {selectedBooking.orderNumber}
                  </span>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-navy font-display mb-1">
                  {selectedBooking.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isArabic ? 'تم تأكيد الخدمة وفق معايير الجودة والسلامة' : 'Certified UAE Technical Services Standard'}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isArabic ? 'الموعد المجدول' : 'Scheduled Window'}</span>
                  <span className="font-bold text-slate-800">
                    {selectedBooking.date} ({selectedBooking.timeSlot})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isArabic ? 'العنوان' : 'Address'}</span>
                  <span className="font-bold text-slate-800 text-end truncate max-w-[180px]">
                    {selectedBooking.address}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isArabic ? 'الفني المخصص' : 'Assigned Technician'}</span>
                  <span className="font-bold text-slate-800">
                    {selectedBooking.technicianName || 'Pending Dispatch'}
                  </span>
                </div>
              </div>

              <div className="border-t border-line pt-3 flex items-center justify-between text-sm">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    {isArabic ? 'الإجمالي التقديري' : 'Total Amount'}
                  </div>
                  <div className="font-display font-black text-base text-navy">
                    {selectedBooking.pricingType === 'QUOTE' ? (
                      <span className="text-signal-orange text-sm">{isArabic ? 'عرض سعر' : 'Quote Requested'}</span>
                    ) : (
                      `AED ${(selectedBooking.amountAed ?? 0).toFixed(2)}`
                    )}
                  </div>
                </div>
                {selectedBooking.technicianPhone && (
                  <a
                    href={`tel:${selectedBooking.technicianPhone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'اتصال بالفني' : 'Call Tech'}</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <CustomerMobileNav
          locale={locale}
          activeTab="BOOKINGS"
          onChangeTab={(tab) => {
            if (tab === 'HOME') router.push(`/${locale}/app`);
            if (tab === 'BOOKINGS') router.push(`/${locale}/app/bookings`);
            if (tab === 'SHOP') router.push(`/${locale}/app/shop`);
            if (tab === 'ACCOUNT') router.push(`/${locale}/app/account`);
          }}
          activeOrderCount={bookings.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'EN_ROUTE').length}
        />
      </div>
    </div>
  );
}
