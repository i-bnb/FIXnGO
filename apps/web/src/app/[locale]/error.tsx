'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isArabic = locale === 'ar';

  useEffect(() => {
    // Log unexpected runtime error to monitoring/console
    console.error('Unhandled FIXnGO Web Application Error:', error);
  }, [error]);

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-[70vh] flex items-center justify-center p-6 bg-ground"
    >
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-line dark:border-slate-800 shadow-sm p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-900/60 shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-navy dark:text-white">
            {isArabic ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isArabic
              ? 'واجه النظام مشكلة مؤقتة أثناء معالجة طلبك. لقد تم تسجيل الخطأ لمراجعته.'
              : 'The system encountered an unexpected issue while loading this page. Our telematics and operations team has been notified.'}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 pt-1">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-signal-orange text-white text-sm font-semibold hover:bg-orange-700 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isArabic ? 'إعادة المحاولة' : 'Try Again'}</span>
          </button>
          <Link
            href={`/${locale}/admin`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-line dark:border-slate-700 text-ink dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Home className="w-4 h-4" />
            <span>{isArabic ? 'لوحة التحكم' : 'Operations Home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
