'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Shield, Smartphone, MonitorCheck, Wrench, Menu } from 'lucide-react';
import { UAE_CONSTANTS } from '@fieldops/shared';

interface AppNavbarProps {
  locale: string;
}

export function AppNavbar({ locale }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    // Replace current locale segment in pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const isCustomer = pathname.includes('/app');
  const isTech = pathname.includes('/tech');
  const isAdmin = pathname.includes('/admin');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-line shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & UAE Badge */}
        <div className="flex items-center gap-3">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-signal-orange flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-navy text-xl tracking-tight flex items-center gap-1 font-display">
                <span>FIX</span><span className="text-signal-orange">nGO</span>
                <span className="text-[9px] bg-signal-orange/10 text-signal-orange font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  UAE
                </span>
              </div>
              <div className="text-[10px] text-slate font-medium">TRN: {UAE_CONSTANTS.COMPANY_TRN}</div>
            </div>
          </Link>
        </div>

        {/* Portal Switcher (Quick demo jumps) */}
        <nav className="hidden md:flex items-center p-1 bg-ground rounded-xl border border-line">
          <Link
            href={`/${locale}/app`}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition min-h-[36px] ${
              isCustomer ? 'bg-white text-signal-orange shadow-xs font-bold border border-line/60' : 'text-slate hover:text-ink'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-signal-orange" />
            <span>Customer App</span>
          </Link>

          <Link
            href={`/${locale}/tech`}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition min-h-[36px] ${
              isTech ? 'bg-white text-navy shadow-xs font-bold border border-line/60' : 'text-slate hover:text-ink'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-navy" />
            <span>Technician PWA</span>
          </Link>

          <Link
            href={`/${locale}/admin`}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition min-h-[36px] ${
              isAdmin ? 'bg-white text-navy shadow-xs font-bold border border-line/60' : 'text-slate hover:text-ink'
            }`}
          >
            <MonitorCheck className="w-3.5 h-3.5 text-ocean-blue" />
            <span>Admin ERP</span>
          </Link>
        </nav>

        {/* Language Switcher & Info */}
        <div className="flex items-center gap-3">
          {/* Language select */}
          <div className="flex items-center gap-1 text-xs border border-line rounded-lg p-1 bg-white">
            <Globe className="w-3.5 h-3.5 text-slate ml-1" />
            <button
              onClick={() => handleLocaleChange('en')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                locale === 'en' ? 'bg-navy text-white font-bold' : 'text-slate hover:text-ink'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLocaleChange('ar')}
              className={`px-2 py-0.5 rounded font-medium transition font-arabic ${
                locale === 'ar' ? 'bg-signal-orange text-white font-bold' : 'text-slate hover:text-ink'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => handleLocaleChange('hi')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                locale === 'hi' ? 'bg-navy text-white font-bold' : 'text-slate hover:text-ink'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
