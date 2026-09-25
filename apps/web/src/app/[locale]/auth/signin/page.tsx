'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEMO_PERSONAS, DemoRole, setClientSession } from '../../../../lib/auth/session';
import { ShieldCheck, UserCheck, ArrowRight, Lock, Key } from 'lucide-react';

export default function SignInPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || searchParams.get('callbackUrl');
  const roleFilter = searchParams.get('role')?.toLowerCase();

  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleSignIn = (role: DemoRole, targetPath: string) => {
    setLoadingRole(role);
    setClientSession(role);
    const dest = returnUrl || `/${locale}${targetPath}`;
    setTimeout(() => {
      router.push(dest);
    }, 150);
  };

  const filteredPersonas = Object.entries(DEMO_PERSONAS).filter(([key]) => {
    if (roleFilter === 'customer') return key === 'CUSTOMER';
    if (roleFilter === 'technician') return key === 'TECHNICIAN';
    if (roleFilter === 'admin') return ['SUPER_ADMIN', 'ACCOUNTANT', 'DISPATCHER'].includes(key);
    return true;
  });

  return (
    <div className="min-h-screen bg-ground dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-line dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-signal-orange/10 text-signal-orange text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{isArabic ? 'بوابة تسجيل الدخول الآمنة' : 'Secure Demo Gateway'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy dark:text-white tracking-tight">
            FIXnGO Technical Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {isArabic
              ? 'اختر شخصية تجريبية موثقة للدخول إلى لوحة التحكم بصلاحيات محددة'
              : 'Select an authorized demo persona to access role-protected operations with zero configuration'}
          </p>

          {roleFilter && (
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-signal-orange uppercase bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-full border border-orange-200">
                Persona filter: {roleFilter}
              </span>
              <button
                onClick={() => router.push(`/${locale}/auth/signin`)}
                className="text-[11px] text-slate-400 hover:text-navy dark:hover:text-white underline"
              >
                Show all personas
              </button>
            </div>
          )}
        </div>

        {/* Personas Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {filteredPersonas.map(([key, persona]) => {
            const role = key as DemoRole;
            const isLoading = loadingRole === role;

            return (
              <button
                key={persona.id}
                onClick={() => handleSignIn(role, persona.defaultPath)}
                disabled={Boolean(loadingRole)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition group relative overflow-hidden ${
                  isLoading
                    ? 'border-signal-orange bg-orange-50/50 dark:bg-orange-950/20'
                    : 'border-line dark:border-slate-800 hover:border-signal-orange/60 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-navy dark:bg-slate-800 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                      {persona.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-navy dark:text-white group-hover:text-signal-orange transition flex items-center gap-1.5">
                        <span>{persona.name}</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {persona.role}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-signal-orange transition group-hover:translate-x-0.5" />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-normal line-clamp-2">
                  {persona.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-line/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-[10px]">{persona.email}</span>
                  <span className="text-[10px] font-bold text-signal-orange">1-Click Sign In →</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 pt-4 border-t border-line dark:border-slate-800 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Fictional demo data · All accounts are pre-authenticated for verification</span>
        </div>
      </div>
    </div>
  );
}
