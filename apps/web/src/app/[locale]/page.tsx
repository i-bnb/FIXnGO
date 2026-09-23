'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Smartphone,
  MonitorCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  FileText,
  Globe,
  Truck,
  Sparkles,
  Users,
} from 'lucide-react';
import { UAE_CONSTANTS } from '@fieldops/shared';

type RoleOption = 'customer' | 'technician' | 'admin';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleOption>('admin');
  const isArabic = locale === 'ar';

  const roleCredentials = {
    customer: {
      email: 'fatima@fixngo.ae',
      title: 'Customer',
      subtitle: 'Book & track',
      destination: `/${locale}/app`,
      buttonLabel: isArabic ? 'الدخول كعميل ←' : 'Sign in to customer app →',
    },
    technician: {
      email: 'rashid@fixngo.ae',
      title: 'Technician',
      subtitle: 'Jobs & helpers',
      destination: `/${locale}/tech`,
      buttonLabel: isArabic ? 'الدخول كتطبيق فني ←' : 'Sign in to technician PWA →',
    },
    admin: {
      email: 'sara@fixngo.ae',
      title: 'Admin',
      subtitle: 'Office & finance',
      destination: `/${locale}/admin`,
      buttonLabel: isArabic ? 'الدخول إلى لوحة التحكم ←' : 'Sign in to dashboard →',
    },
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(roleCredentials[selectedRole].destination);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-ground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full mx-auto bg-white rounded-3xl border border-line shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: Navy Brand Hero (Page 2 Design Spec) */}
        <div className="lg:col-span-6 bg-navy text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Map Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ocean-blue/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-10 h-10 rounded-xl bg-signal-orange flex items-center justify-center text-white font-black text-xl shadow-md">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="font-extrabold text-white text-2xl tracking-tight font-display">
                FIX<span className="text-signal-orange">nGO</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-[1.15] mb-6">
              Every job.<br />
              Every technician.<br />
              <span className="text-signal-orange">One app.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md font-body mb-8">
              Electrical, plumbing and AC work, labour supply, equipment rental and material sales, with live tracking and finance built in.
            </p>

            {/* UAE Highlights Badge Pills */}
            <div className="flex flex-wrap gap-2.5 text-xs text-slate-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-light/90 border border-slate-700/60 font-medium">
                <span className="text-ocean-blue">↗</span> Live GPS tracking
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-light/90 border border-slate-700/60 font-medium">
                <FileText className="w-3 h-3 text-signal-orange" /> VAT-ready invoices
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-light/90 border border-slate-700/60 font-medium">
                <Globe className="w-3 h-3 text-emerald-400" /> English & Arabic
              </span>
            </div>
          </div>

          {/* Bottom Footnote */}
          <div className="relative z-10 pt-8 mt-8 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Demo build · sample data</span>
            <span className="text-[10px] text-slate-500">TRN: {UAE_CONSTANTS.COMPANY_TRN}</span>
          </div>
        </div>

        {/* Right Column: Sign In Experience (Page 2 Design Spec) */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink font-display tracking-tight mb-2">
              {isArabic ? 'تسجيل الدخول' : 'Sign in'}
            </h2>
            <p className="text-sm text-slate font-body mb-6">
              {isArabic ? 'اختر كيف تريد استخدام FIXnGO.' : 'Choose how you use FIXnGO.'}
            </p>

            {/* 3-Way Role Selector Tabs (Page 2) */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-ground rounded-2xl border border-line mb-6">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`py-2.5 px-2 rounded-xl text-center transition-all ${
                  selectedRole === 'customer'
                    ? 'bg-white text-ink shadow-xs border border-line font-bold'
                    : 'text-slate hover:text-ink font-medium'
                }`}
              >
                <div className="text-xs font-semibold">{isArabic ? 'العميل' : 'Customer'}</div>
                <div className="text-[10px] text-slate/80">{isArabic ? 'حجز وتتبع' : 'Book & track'}</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('technician')}
                className={`py-2.5 px-2 rounded-xl text-center transition-all ${
                  selectedRole === 'technician'
                    ? 'bg-white text-ink shadow-xs border border-line font-bold'
                    : 'text-slate hover:text-ink font-medium'
                }`}
              >
                <div className="text-xs font-semibold">{isArabic ? 'الفني' : 'Technician'}</div>
                <div className="text-[10px] text-slate/80">{isArabic ? 'المهام والسيارة' : 'Jobs & helpers'}</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2.5 px-2 rounded-xl text-center transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-navy text-white shadow-xs font-bold'
                    : 'text-slate hover:text-ink font-medium'
                }`}
              >
                <div className="text-xs font-semibold">{isArabic ? 'الإدارة' : 'Admin'}</div>
                <div className="text-[10px] opacity-80">{isArabic ? 'المكتب والمالية' : 'Office & finance'}</div>
              </button>
            </div>

            {/* Sign-in Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5 font-body">
                  {isArabic ? 'البريد الإلكتروني للعمل' : 'Work email'}
                </label>
                <input
                  type="email"
                  value={roleCredentials[selectedRole].email}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-line bg-ground text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-signal-orange focus:border-transparent transition min-h-[44px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-ink font-body">
                    {isArabic ? 'كلمة المرور' : 'Password'}
                  </label>
                  <a href="#forgot" className="text-xs text-ocean-blue hover:underline font-medium">
                    {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </a>
                </div>
                <input
                  type="password"
                  defaultValue="demoPassword123"
                  className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-signal-orange focus:border-transparent transition min-h-[44px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="keepSignedIn"
                  defaultChecked
                  className="w-4 h-4 rounded text-signal-orange border-line focus:ring-signal-orange accent-signal-orange cursor-pointer"
                />
                <label htmlFor="keepSignedIn" className="text-xs text-slate font-medium cursor-pointer">
                  {isArabic ? 'تذكر تسجيل الدخول' : 'Keep me signed in'}
                </label>
              </div>

              {/* Primary Signal Orange 44px Action Button */}
              <button
                type="submit"
                className="w-full mt-4 py-3.5 px-6 rounded-xl bg-signal-orange hover:bg-signal-orange-hover active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all min-h-[48px]"
              >
                <span>{roleCredentials[selectedRole].buttonLabel}</span>
              </button>
            </form>

            {/* Direct Jump or Book Without Account */}
            <div className="mt-6 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <Link
                href={`/${locale}/app`}
                className="text-slate hover:text-ink font-medium"
              >
                {isArabic ? 'عميل جديد؟ ' : 'New customer? '}
                <span className="text-ocean-blue font-bold hover:underline">
                  {isArabic ? 'احجز بدون حساب' : 'Book without an account'}
                </span>
              </Link>

              <Link
                href={isArabic ? `/en` : `/ar`}
                className="text-slate hover:text-navy font-semibold px-2 py-1 rounded-md bg-ground border border-line"
              >
                {isArabic ? 'English' : 'العربية'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Walkthrough Cards for Demo Navigation */}
      <div className="max-w-6xl w-full mx-auto mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate uppercase tracking-wider">
            {isArabic ? 'استعراض التطبيقات المتاحة' : 'Direct Experience Portals'}
          </h3>
          <span className="text-xs text-slate">44px touch targets · PostGIS · UAE VAT 5%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/${locale}/app`}
            className="p-5 rounded-2xl bg-white border border-line hover:border-signal-orange/60 hover:shadow-md transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-signal-orange/10 text-signal-orange flex items-center justify-center font-bold mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-ink text-base group-hover:text-signal-orange transition font-display">
                {isArabic ? 'تطبيق العميل' : 'Customer App'}
              </h4>
              <p className="text-xs text-slate mt-1">
                {isArabic ? 'حجز فوري، تتبع الفني على الخريطة وفاتورة ضريبية' : '60-sec booking, live technician map & instant checkout'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate group-hover:text-signal-orange group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 mt-1" />
          </Link>

          <Link
            href={`/${locale}/tech`}
            className="p-5 rounded-2xl bg-white border border-line hover:border-navy/60 hover:shadow-md transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center font-bold mb-3">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-ink text-base group-hover:text-navy transition font-display">
                {isArabic ? 'تطبيق الفني PWA' : 'Technician PWA'}
              </h4>
              <p className="text-xs text-slate mt-1">
                {isArabic ? 'تسجيل الحضور، قائمة المهام، صور قبل/بعد وتوقيع العميل' : 'Duty attendance, checklist, photos proof & digital sign-off'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate group-hover:text-navy group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 mt-1" />
          </Link>

          <Link
            href={`/${locale}/admin`}
            className="p-5 rounded-2xl bg-white border border-line hover:border-ocean-blue/60 hover:shadow-md transition-all group flex items-start justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-ocean-blue/10 text-ocean-blue flex items-center justify-center font-bold mb-3">
                <MonitorCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-ink text-base group-hover:text-ocean-blue transition font-display">
                {isArabic ? 'لوحة تحكم الإدارة' : 'Admin ERP & Dispatch'}
              </h4>
              <p className="text-xs text-slate mt-1">
                {isArabic ? 'توزيع الفنيين بالخريطة، توريد العمالة، التأجير والمالية' : 'Live dispatch board, work orders, rental & P&L accounting'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate group-hover:text-ocean-blue group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 mt-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

