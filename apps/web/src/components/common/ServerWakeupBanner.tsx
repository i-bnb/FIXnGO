'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, RefreshCw, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/config';

interface ServerWakeupBannerProps {
  locale?: string;
}

export function ServerWakeupBanner({ locale = 'en' }: ServerWakeupBannerProps) {
  const isArabic = locale === 'ar';
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkServerHealth = useCallback(async () => {
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      return;
    }

    setIsRetrying(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      // If server took > 3s to answer, flag as waking up
      setIsWakingUp(true);
    }, 3000);

    try {
      const response = await fetch(`${apiBase}/api/health`, {
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        if (isWakingUp) {
          setIsReady(true);
          setTimeout(() => {
            setIsWakingUp(false);
            setIsReady(false);
            setElapsedSeconds(0);
          }, 2000);
        }
      } else {
        setIsWakingUp(true);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      // Connection failed or timed out — Render service is sleeping or waking up
      setIsWakingUp(true);
    } finally {
      setIsRetrying(false);
    }
  }, [isWakingUp]);

  useEffect(() => {
    // Initial health check on page mount
    checkServerHealth();

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [checkServerHealth]);

  // Track elapsed seconds and auto-poll while waking up
  useEffect(() => {
    if (isWakingUp && !isReady) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Auto poll every 4 seconds
      checkTimeoutRef.current = setInterval(() => {
        checkServerHealth();
      }, 4000);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (checkTimeoutRef.current) clearInterval(checkTimeoutRef.current);
      };
    }
  }, [isWakingUp, isReady, checkServerHealth]);

  if (!isWakingUp) {
    return null;
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-amber-500/40 shadow-2xl rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            {isReady ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
            ) : (
              <Zap className="w-5 h-5 animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                {isReady
                  ? isArabic
                    ? 'تم تنشيط الخادم بنجاح!'
                    : 'Server Connected!'
                  : isArabic
                  ? 'جاري تنشيط الخادم...'
                  : 'Waking up the server…'}
              </h4>
              {!isReady && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {elapsedSeconds}s
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {isReady
                ? isArabic
                  ? 'تم استعادة الاتصال الكامل بالعمليات وواجهة برمجة التطبيقات.'
                  : 'Backend API is active and ready. Resuming operations.'
                : isArabic
                ? 'يستيقظ الخادم السحابي من وضع السكون (خدمة Render المجانية). يستغرق هذا عادةً 30-50 ثانية.'
                : "Render's free tier spins down after inactivity. The backend is spinning up (takes 30-50s)."}
            </p>

            <div className="mt-3 flex items-center gap-2">
              {!isReady && (
                <button
                  type="button"
                  onClick={() => checkServerHealth()}
                  disabled={isRetrying}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isArabic ? 'إعادة المحاولة الآن' : 'Retry Now'}
                </button>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 ml-auto font-mono">
                {!isReady && (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                    <span>{isArabic ? 'جاري الفحص التلقائي...' : 'Auto-checking...'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
