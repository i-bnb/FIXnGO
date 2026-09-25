'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '../common/Logo';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';

interface PortalLoginFormProps {
  locale: string;
  portal: 'customer' | 'technician' | 'admin';
  role: 'CUSTOMER' | 'TECHNICIAN' | 'SUPER_ADMIN';
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  demoEmail: string;
  demoPassword: string;
  targetPath: string;
}

export function PortalLoginForm({
  locale,
  portal,
  role,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  demoEmail,
  demoPassword,
  targetPath,
}: PortalLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || searchParams.get('callbackUrl');

  const isArabic = locale === 'ar';
  const otherLocale = isArabic ? 'en' : 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  const handleFillDemo = () => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage(null);
    setPrefilled(true);
    setTimeout(() => setPrefilled(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          portal,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Also ensure client-side document.cookie is set immediately
        const maxAge = 60 * 60 * 24 * 7;
        const sessionRole = data.sessionRole || role;
        document.cookie = `fixngo_session=${encodeURIComponent(sessionRole)}; path=/; max-age=${maxAge}; SameSite=Lax`;

        if (typeof window !== 'undefined') {
          if (data.user) {
            localStorage.setItem('fixngo_user_session', JSON.stringify(data.user));
          }
          if (data.accessToken) {
            localStorage.setItem('fixngo_token', data.accessToken);
          }
        }

        // Redirect to intended target or default portal path
        const destination = returnUrl && returnUrl.startsWith(`/${locale}`) ? returnUrl : `/${locale}${targetPath}`;
        router.push(destination);
      } else {
        setErrorMessage(
          data.message ||
            (isArabic
              ? 'فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.'
              : 'Sign in failed. Please check your email and password.')
        );
      }
    } catch {
      setErrorMessage(
        isArabic
          ? 'حدث خطأ في الاتصال. يرجى استخدام بيانات الدخول التجريبية أدناه.'
          : 'Connection error. Please use the demo credentials provided below.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6"
    >
      {/* Top Bar: Language Switcher */}
      <div className="w-full max-w-md flex justify-end mb-4">
        <Link
          href={`/${otherLocale}/login/${portal}`}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-navy hover:bg-slate-100 shadow-xs transition"
        >
          {isArabic ? 'English' : 'العربية'}
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-6">
          <Logo locale={locale} role="public" size="lg" />
          <h1 className="mt-4 text-2xl font-black text-navy tracking-tight text-center">
            {isArabic ? titleAr : titleEn}
          </h1>
          <p className="mt-1 text-xs text-slate-500 text-center">
            {isArabic ? subtitleAr : subtitleEn}
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-signal-orange focus:border-transparent transition"
              />
              <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isArabic ? 'right-3' : 'left-3'}`} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                {isArabic ? 'كلمة المرور' : 'Password'}
              </label>
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="text-[11px] font-semibold text-signal-orange hover:underline"
              >
                {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-signal-orange focus:border-transparent transition"
              />
              <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${isArabic ? 'right-3' : 'left-3'}`} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`text-slate-400 hover:text-slate-600 absolute top-3 ${isArabic ? 'left-3' : 'right-3'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-signal-orange hover:bg-orange-600 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isArabic ? 'جاري التحقق...' : 'Signing in...'}</span>
              </>
            ) : (
              <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-signal-orange" />
              <span>{isArabic ? 'بيانات الحساب التجريبي' : 'Demo access'}</span>
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-bold text-signal-orange hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              {prefilled ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">{isArabic ? 'تمت التعبئة' : 'Filled!'}</span>
                </>
              ) : (
                <span>{isArabic ? 'تعبئة تلقائية' : 'Auto-fill'}</span>
              )}
            </button>
          </div>
          <div className="font-mono text-xs text-slate-700 select-all">
            <span className="font-semibold">{demoEmail}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span>{demoPassword}</span>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy transition"
          >
            {isArabic ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{isArabic ? 'جميع البوابات' : 'All portals'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
