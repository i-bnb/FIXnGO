'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  User,
  MapPin,
  Globe,
  LogOut,
  Phone,
  Mail,
  Shield,
  FileText,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { clearClientSession } from '../../../../lib/auth/session';
import { CustomerMobileNav } from '../../../../components/customer/CustomerMobileNav';

export default function CustomerAccountPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();

  const [savedAddresses] = useState([
    {
      id: 'addr-1',
      title: 'Primary Residence (Villa 14B)',
      details: 'Street 12, Jumeirah 2, Dubai, UAE',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'Commercial Office Suite',
      details: 'Level 18, Burj Crown, Downtown Dubai, UAE',
      isDefault: false,
    },
    {
      id: 'addr-3',
      title: 'Holiday Villa',
      details: 'Frond M, Palm Jumeirah, Dubai, UAE',
      isDefault: false,
    },
  ]);

  const handleLanguageSwitch = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const handleSignOut = () => {
    clearClientSession();
    router.push(`/${locale}/auth/signin`);
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
              {isArabic ? 'الملف الشخصي والحساب' : 'My Account & Settings'}
            </h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* User Profile Card */}
          <div className="p-4 bg-ground rounded-2xl border border-line space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-navy text-white font-display font-extrabold text-lg flex items-center justify-center shadow-xs">
                KM
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-extrabold text-navy text-base truncate">Khalid Al-Mansoor</h2>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                    Verified
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">+971 50 000 0005</div>
                <div className="text-xs text-slate-400 truncate">customer@fixngo.example</div>
              </div>
            </div>

            <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Account: Standard Residential</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">TRN: 100000000000003</span>
            </div>
          </div>

          {/* Saved Addresses Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider px-1">
              {isArabic ? 'عناوين الخدمة المسجلة' : 'Saved Service Addresses'}
            </h3>
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-3 bg-white border border-line rounded-xl shadow-2xs space-y-1 flex items-start justify-between"
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-signal-orange shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-navy flex items-center gap-1.5">
                        <span>{addr.title}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{addr.details}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Toggle Section */}
          <div className="p-3.5 bg-white border border-line rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-navy">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>{isArabic ? 'لغة التطبيق' : 'Application Language'}</span>
              </div>
              <span className="text-slate-400 text-[11px]">{isArabic ? 'العربية' : 'English'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleLanguageSwitch('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition text-center ${
                  locale === 'en'
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-ground text-slate-600 border border-line hover:bg-slate-100'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageSwitch('ar')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition text-center font-arabic ${
                  locale === 'ar'
                    ? 'bg-signal-orange text-white shadow-xs'
                    : 'bg-ground text-slate-600 border border-line hover:bg-slate-100'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="pt-2">
            <button
              onClick={handleSignOut}
              className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>{isArabic ? 'تسجيل الخروج من الحساب' : 'Sign Out of Customer Portal'}</span>
            </button>
          </div>
        </main>

        {/* Bottom Tab Bar */}
        <CustomerMobileNav
          locale={locale}
          activeTab="ACCOUNT"
          onChangeTab={(tab) => {
            if (tab === 'HOME') router.push(`/${locale}/app`);
            if (tab === 'BOOKINGS') router.push(`/${locale}/app/bookings`);
            if (tab === 'SHOP') router.push(`/${locale}/app/shop`);
          }}
          activeOrderCount={1}
        />
      </div>
    </div>
  );
}
