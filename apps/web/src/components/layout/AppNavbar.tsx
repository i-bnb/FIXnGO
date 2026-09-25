'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { Logo } from '../common/Logo';
import { performLogout } from '../../lib/auth/logout';
import { getClientSession, DemoPersona } from '../../lib/auth/session';

interface AppNavbarProps {
  locale: string;
}

export function AppNavbar({ locale }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentSession, setCurrentSession] = useState<DemoPersona | null>(null);

  useEffect(() => {
    setCurrentSession(getClientSession());
  }, [pathname]);

  const handleLocaleChange = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const handleSignOut = () => {
    setCurrentSession(null);
    performLogout(locale);
  };

  const isArabic = locale === 'ar';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-line shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & UAE Badge */}
        <div className="flex items-center gap-3">
          <Logo locale={locale} role="public" showTrn={true} />
        </div>

        {/* Right Section: User Profile & Language Switcher */}
        <div className="flex items-center gap-2.5">
          {currentSession ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-line bg-ground text-xs font-bold text-navy">
                <div className="w-6 h-6 rounded-lg bg-navy text-white text-[10px] font-bold flex items-center justify-center">
                  {currentSession.avatar}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="leading-none text-[11px] font-black">{currentSession.name}</div>
                  <div className="leading-none text-[9px] text-slate-400 mt-0.5">{currentSession.role}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer"
                title={isArabic ? 'تسجيل الخروج' : 'Sign Out'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isArabic ? 'خروج' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-signal-orange hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
            </Link>
          )}

          {/* Language Switcher (EN & AR only) */}
          <div className="flex items-center gap-1 text-xs border border-line rounded-lg p-1 bg-white">
            <button
              onClick={() => handleLocaleChange('en')}
              className={`px-2 py-0.5 rounded font-bold transition ${
                locale === 'en'
                  ? 'bg-signal-orange text-white'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              EN
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => handleLocaleChange('ar')}
              className={`px-2 py-0.5 rounded font-bold transition ${
                locale === 'ar'
                  ? 'bg-signal-orange text-white'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              العربية
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
