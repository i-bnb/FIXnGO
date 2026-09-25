'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { CustomerMobileNav } from '../../../../components/customer/CustomerMobileNav';

interface BookingItem {
  id: string;
  orderNumber: string;
  title: string;
  category: 'AC' | 'PLUMBING' | 'ELECTRICAL' | 'PPM';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  date: string;
  timeSlot: string;
  technicianName: string;
  technicianPhone: string;
  address: string;
  amountAed: number;
}

const DEMO_BOOKINGS: BookingItem[] = [
  {
    id: 'b-01',
    orderNumber: 'WO-2026-00001',
    title: 'AC Quarterly Deep Chemical Cleaning & Coil Wash',
    category: 'AC',
    status: 'IN_PROGRESS',
    date: 'Today, 24 Sep 2026',
    timeSlot: '02:00 PM - 04:00 PM',
    technicianName: 'Rashid Al-Nuaimi',
    technicianPhone: '+971 50 000 0111',
    address: 'Villa 14B, Street 12, Jumeirah 2, Dubai',
    amountAed: 350.0,
  },
  {
    id: 'b-02',
    orderNumber: 'WO-2026-00015',
    title: 'Emergency Kitchen Waste Pipe Clog & Jetting',
    category: 'PLUMBING',
    status: 'SCHEDULED',
    date: 'Tomorrow, 25 Sep 2026',
    timeSlot: '10:00 AM - 12:00 PM',
    technicianName: 'Tariq Al-Mansoor',
    technicianPhone: '+971 50 000 0112',
    address: 'Apt 1804, Burj Crown, Downtown Dubai',
    amountAed: 280.0,
  },
  {
    id: 'b-03',
    orderNumber: 'WO-2026-00042',
    title: 'Schneider Main Distribution Board Breaker Upgrade',
    category: 'ELECTRICAL',
    status: 'COMPLETED',
    date: '18 Sep 2026',
    timeSlot: '11:00 AM - 01:00 PM',
    technicianName: 'Vikram Patel',
    technicianPhone: '+971 50 000 0113',
    address: 'Villa 14B, Street 12, Jumeirah 2, Dubai',
    amountAed: 520.0,
  },
  {
    id: 'b-04',
    orderNumber: 'WO-2026-00055',
    title: 'Annual Maintenance Contract (PPM) - Water Pump Overhaul',
    category: 'PPM',
    status: 'COMPLETED',
    date: '12 Sep 2026',
    timeSlot: '09:00 AM - 11:30 AM',
    technicianName: 'Joseph Mathew',
    technicianPhone: '+971 50 000 0114',
    address: 'Villa 14B, Street 12, Jumeirah 2, Dubai',
    amountAed: 450.0,
  },
];

export default function CustomerBookingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const router = useRouter();

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  const filteredBookings = DEMO_BOOKINGS.filter((b) => {
    if (filter === 'ACTIVE') return b.status === 'IN_PROGRESS' || b.status === 'SCHEDULED';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  const getStatusBadge = (status: BookingItem['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {isArabic ? 'قيد التنفيذ' : 'In Progress'}
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-ocean-blue dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
            {isArabic ? 'مجدولة' : 'Scheduled'}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {isArabic ? 'مكتملة' : 'Completed'}
          </span>
        );
      default:
        return null;
    }
  };

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
              {isArabic ? 'حجوزاتي والخدمات' : 'My Service Bookings'}
            </h1>
          </div>
          <span className="text-xs font-bold text-signal-orange">
            {filteredBookings.length} {isArabic ? 'حجوزات' : 'orders'}
          </span>
        </header>

        {/* Filter Pills */}
        <div className="p-3.5 bg-ground border-b border-line flex gap-2">
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

        {/* Bookings List */}
        <main className="flex-1 p-4 space-y-3 overflow-y-auto">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">
                {isArabic ? 'لا توجد حجوزات في هذه الفئة' : 'No bookings found in this filter'}
              </p>
            </div>
          ) : (
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
                    <span>AED {b.amountAed.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 font-normal"> (incl. 5% VAT)</span>
                  </div>
                  <span className="text-signal-orange font-bold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>{isArabic ? 'التفاصيل' : 'Details'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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

              <div className="space-y-3">
                <div>
                  <h3 className="font-extrabold text-sm text-navy">{selectedBooking.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{selectedBooking.address}</p>
                </div>

                <div className="p-3 bg-ground rounded-xl border border-line space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Scheduled Date:</span>
                    <span className="font-bold text-navy">{selectedBooking.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Time Window:</span>
                    <span className="font-bold text-navy">{selectedBooking.timeSlot}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Lead Specialist:</span>
                    <span className="font-bold text-navy">{selectedBooking.technicianName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-line/60">
                    <span className="text-slate-500">Billed Total:</span>
                    <span className="font-extrabold text-signal-orange text-sm">
                      AED {selectedBooking.amountAed.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`tel:${selectedBooking.technicianPhone}`}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Technician</span>
                  </a>
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      router.push(`/${locale}/app`);
                    }}
                    className="flex-1 py-2.5 bg-navy text-white rounded-xl font-bold transition hover:bg-navy-light"
                  >
                    Live GPS Track
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Tab Bar */}
        <CustomerMobileNav
          locale={locale}
          activeTab="BOOKINGS"
          onChangeTab={(tab) => {
            if (tab === 'HOME') router.push(`/${locale}/app`);
            if (tab === 'SHOP') router.push(`/${locale}/app/shop`);
            if (tab === 'ACCOUNT') router.push(`/${locale}/app/account`);
          }}
          activeOrderCount={1}
        />
      </div>
    </div>
  );
}
