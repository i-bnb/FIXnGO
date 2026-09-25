'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Bell,
  Globe,
  User,
  CheckCircle2,
  ChevronDown,
  X,
  Phone,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface CustomerHeaderProps {
  locale: string;
  currentLocation: string;
  onLocationChange: (loc: string) => void;
  unreadCount?: number;
  user?: { fullName: string; phone: string } | null;
  onOpenAuth: () => void;
}

export function CustomerHeader({
  locale,
  currentLocation,
  onLocationChange,
  unreadCount = 2,
  user,
  onOpenAuth,
}: CustomerHeaderProps) {
  const isArabic = locale === 'ar';
  const pathname = usePathname();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  const uaeLocations = [
    { name: 'Downtown Dubai, Burj Crown', lat: 25.1972, lng: 55.2744 },
    { name: 'Business Bay, Executive Towers', lat: 25.1856, lng: 55.2708 },
    { name: 'Jumeirah 2, Street 14B Villa', lat: 25.2048, lng: 55.2435 },
    { name: 'Dubai Marina, Silverene Tower', lat: 25.0762, lng: 55.1403 },
    { name: 'Palm Crest Residences, Villa 124', lat: 25.1764, lng: 55.3092 },
    { name: 'Palm Jumeirah, Frond M Villa', lat: 25.1215, lng: 55.1324 },
  ];

  const notifications = [
    {
      id: '1',
      title: isArabic ? 'الفني في الطريق إليك' : 'Technician En Route',
      time: 'Just now',
      desc: isArabic
        ? 'الفني راشد النعيمي في الطريق إلى موقعك. وقت الوصول المتوقع: 8 دقائق.'
        : 'Rashid Al-Nuaimi is en route in Van-01. ETA is 8 minutes.',
      isNew: true,
    },
    {
      id: '2',
      title: isArabic ? 'تذكير الصيانة الوقائية' : 'PPM Maintenance Due',
      time: '2 hours ago',
      desc: isArabic
        ? 'موعد الزيارة الربع سنوية لعقد الصيانة الذهبي مستحق هذا الأسبوع.'
        : 'Your quarterly Gold AMC AC inspection is scheduled for this week.',
      isNew: true,
    },
  ];

  // Alternate locale url
  const targetLocale = locale === 'ar' ? 'en' : 'ar';
  const alternateUrl = pathname.replace(`/${locale}`, `/${targetLocale}`);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-line px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Left: FIXnGO Logo & Location Dropdown */}
          <div className="flex items-center gap-2">
            <Logo locale={locale} size="sm" showBadge={false} />

            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1 text-start hover:opacity-80 transition max-w-[190px] px-2 py-1 rounded-lg bg-ground border border-line"
            >
              <MapPin className="w-3.5 h-3.5 text-signal-orange shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[11px] font-bold text-ink truncate flex items-center gap-1">
                  <span>{currentLocation}</span>
                  <ChevronDown className="w-3 h-3 text-slate shrink-0" />
                </div>
              </div>
            </button>
          </div>

          {/* Right: Language, Notifications */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <Link
              href={alternateUrl}
              className="px-2.5 py-1 bg-ground hover:bg-slate-100 text-ink border border-line rounded-lg text-xs font-bold transition flex items-center gap-1"
              title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Globe className="w-3 h-3 text-slate" />
              <span className="font-arabic">{isArabic ? 'EN' : 'عربي'}</span>
            </Link>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotificationDrawer(true)}
              className="p-2 rounded-xl bg-ground hover:bg-slate-100 border border-line text-ink relative transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-ink" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 bg-signal-orange text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Location Picker Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700" />
                <h3 className="font-black text-slate-900 text-sm">
                  {isArabic ? 'اختر موقع الخدمة' : 'Choose Service Address'}
                </h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {uaeLocations.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onLocationChange(loc.name);
                    setShowLocationModal(false);
                  }}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-start transition ${
                    currentLocation === loc.name
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">{loc.name}</div>
                      <div className="text-[10px] text-slate-400">United Arab Emirates</div>
                    </div>
                  </div>
                  {currentLocation === loc.name && (
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {showNotificationDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-700" />
                <h3 className="font-black text-slate-900 text-sm">
                  {isArabic ? 'الإشعارات والتحديثات' : 'Activity & Notifications'}
                </h3>
              </div>
              <button
                onClick={() => setShowNotificationDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{n.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowNotificationDrawer(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition"
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
