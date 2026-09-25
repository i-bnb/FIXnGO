'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Wrench, Shield, User, LogOut, ChevronDown, Check } from 'lucide-react';
import { UAE_CONSTANTS } from '@fieldops/shared';
import { Logo } from '../common/Logo';
import {
  getClientSession,
  setClientSession,
  clearClientSession,
  DEMO_PERSONAS,
  DemoRole,
  DemoPersona,
} from '../../lib/auth/session';

interface AppNavbarProps {
  locale: string;
}

export function AppNavbar({ locale }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentSession, setCurrentSession] = useState<DemoPersona | null>(null);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  useEffect(() => {
    setCurrentSession(getClientSession());
  }, [pathname]);

  const handleLocaleChange = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const handleSwitchPersona = (role: DemoRole, targetPath: string) => {
    setClientSession(role);
    setShowPersonaMenu(false);
    setCurrentSession(DEMO_PERSONAS[role]);
    router.push(`/${locale}${targetPath}`);
  };

  const handleSignOut = () => {
    clearClientSession();
    setShowPersonaMenu(false);
    setCurrentSession(null);
    router.push(`/${locale}/auth/signin`);
  };

  const isCustomer = pathname.includes('/app');
  const isTech = pathname.includes('/tech');
  const isAdmin = pathname.includes('/admin');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-line shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & UAE Badge */}
        <div className="flex items-center gap-3">
          <Logo locale={locale} showTrn={true} />
        </div>

        {/* Portal Switcher - ONLY displayed on root or admin, NOT on customer and tech headers */}
        {!isCustomer && !isTech && (
          <nav className="hidden md:flex items-center p-1 bg-ground rounded-xl border border-line">
            <Link
              href={`/${locale}/admin`}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition min-h-[36px] ${
                isAdmin
                  ? 'bg-white text-navy shadow-xs font-bold border border-line/60'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              <span>Executive Operations</span>
            </Link>
            <Link
              href={`/${locale}/admin/dispatch`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition text-slate-600 hover:text-navy"
            >
              <span>Live Dispatch</span>
            </Link>
            <Link
              href={`/${locale}/admin/work-orders`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition text-slate-600 hover:text-navy"
            >
              <span>Work Orders</span>
            </Link>
          </nav>
        )}

        {/* Right Section: Persona Switcher (only after sign-in) & Language Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Persona Switcher Dropdown (Authenticated) */}
          {currentSession ? (
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-line bg-ground hover:bg-slate-100 transition text-xs font-bold text-navy"
              >
                <div className="w-6 h-6 rounded-lg bg-navy text-white text-[10px] font-bold flex items-center justify-center">
                  {currentSession.avatar}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="leading-none text-[11px] font-black">{currentSession.name}</div>
                  <div className="leading-none text-[9px] text-slate-400 mt-0.5">{currentSession.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-line shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-line">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Switch Demo Persona
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {Object.entries(DEMO_PERSONAS)
                      .filter(([key]) => {
                        if (isAdmin) return ['SUPER_ADMIN', 'ACCOUNTANT', 'DISPATCHER'].includes(key);
                        if (isCustomer) return key === 'CUSTOMER';
                        if (isTech) return key === 'TECHNICIAN';
                        return true;
                      })
                      .map(([key, persona]) => {
                      const role = key as DemoRole;
                      const isActive = currentSession.role === role;

                      return (
                        <button
                          key={persona.id}
                          onClick={() => handleSwitchPersona(role, persona.defaultPath)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition text-xs ${
                            isActive
                              ? 'bg-orange-50 text-signal-orange font-bold'
                              : 'hover:bg-slate-50 text-navy'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                              {persona.avatar}
                            </span>
                            <div>
                              <div className="font-bold">{persona.name}</div>
                              <div className="text-[10px] text-slate-400">{persona.role}</div>
                            </div>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-signal-orange" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1 mt-1 border-t border-line px-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={`/${locale}/auth/signin`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-signal-orange hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Language Switcher (EN & AR only) */}
          <div className="flex items-center gap-1 text-xs border border-line rounded-lg p-1 bg-white">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => handleLocaleChange('en')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                locale === 'en' ? 'bg-navy text-white font-bold' : 'text-slate-600 hover:text-navy'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLocaleChange('ar')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                locale === 'ar' ? 'bg-signal-orange text-white font-bold' : 'text-slate-600 hover:text-navy'
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
