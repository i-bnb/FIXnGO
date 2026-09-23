'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isArabic = locale === 'ar';

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-[70vh] flex items-center justify-center p-6 bg-ground"
    >
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-line dark:border-slate-800 shadow-sm p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-signal-orange mx-auto flex items-center justify-center border border-orange-200 dark:border-orange-900/60 shadow-xs">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-signal-orange font-mono">404</span>
          <h2 className="text-2xl font-bold font-display text-navy dark:text-white">
            {isArabic ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isArabic
              ? 'عذراً، لم نتمكن من العثور على الصفحة أو مورد العمليات الميدانية المطلوب.'
              : 'The dispatch board, work order, or operations resource you requested could not be found.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/${locale}/admin`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-signal-orange text-white text-sm font-semibold hover:bg-orange-700 transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>{isArabic ? 'لوحة التحكم الرئيسية' : 'Operations Home'}</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-line dark:border-slate-700 text-ink dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            <span>{isArabic ? 'الرجوع للخلف' : 'Go Back'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
