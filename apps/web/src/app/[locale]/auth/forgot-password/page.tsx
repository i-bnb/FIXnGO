'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const router = useRouter();
  const isArabic = locale === 'ar';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(
          isArabic
            ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني (صالح لمدة ساعة واحدة).'
            : 'Password reset link sent to your email (valid for 1 hour).',
        );
        if (data.token) {
          setResetToken(data.token);
        }
      } else {
        setErrorMessage(
          data.message ||
            (isArabic
              ? 'حدث خطأ أثناء إرسال الرابط. يرجى المحاولة مرة أخرى.'
              : 'Failed to send reset link. Please try again.'),
        );
      }
    } catch {
      // In offline / mock fallback mode, provide seamless demo token
      setSuccessMessage(
        isArabic
          ? 'تم إنشاء رمز إعادة التعيين التجريبي بنجاح (صالح لمدة ساعة واحدة).'
          : 'Demo password reset link generated successfully (valid for 1 hour).',
      );
      setResetToken(`demo-token-${Date.now()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ground flex flex-col justify-center items-center p-4 sm:p-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-signal-orange text-white flex items-center justify-center mx-auto shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-navy tracking-tight font-display">
            FIX<span className="text-signal-orange">nGO</span>
          </h1>
          <h2 className="text-lg font-bold text-ink">
            {isArabic ? 'استعادة كلمة المرور' : 'Reset your password'}
          </h2>
          <p className="text-xs text-slate max-w-xs mx-auto">
            {isArabic
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.'
              : 'Enter your registered email address and we will generate a secure reset link.'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{isArabic ? 'تم الإرسال بنجاح' : 'Reset Link Generated'}</span>
              </div>
              <p>{successMessage}</p>
            </div>

            {resetToken && (
              <div className="p-3 bg-ground rounded-xl border border-line text-xs space-y-2">
                <div className="text-[11px] font-semibold text-slate">
                  {isArabic ? 'رمز التحقق الفوري (للتجربة والتحقق السريع):' : 'Direct Reset Link:'}
                </div>
                <Link
                  href={`/${locale}/auth/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-navy text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-navy/90 transition shadow-xs"
                >
                  <span>{isArabic ? 'المتابعة لتعيين كلمة مرور جديدة ←' : 'Proceed to Set New Password →'}</span>
                </Link>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                href={`/${locale}`}
                className="text-xs text-ocean-blue font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>{isArabic ? '← العودة لتسجيل الدخول' : 'Back to sign in'}</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5 font-body">
                {isArabic ? 'البريد الإلكتروني المسجل' : 'Registered email address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@i-bnb.com"
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-line bg-white text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-signal-orange focus:border-transparent transition min-h-[44px]"
                />
                <Mail className="w-4 h-4 text-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-signal-orange hover:bg-signal-orange-hover active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all min-h-[44px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isArabic ? 'إرسال رابط إعادة التعيين ←' : 'Send password reset link →'}</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href={`/${locale}`}
                className="text-xs text-slate hover:text-ink font-medium inline-flex items-center gap-1"
              >
                <span>{isArabic ? '← إلغاء والعودة لتسجيل الدخول' : 'Cancel and return to sign in'}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
