'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { UAE_CONSTANTS } from '@fieldops/shared';

interface LogoProps {
  locale?: string;
  role?: 'customer' | 'technician' | 'admin' | 'public';
  showBadge?: boolean;
  showTrn?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({
  locale = 'en',
  role,
  showBadge = true,
  showTrn = false,
  size = 'md',
  className = '',
}: LogoProps) {
  const pathname = usePathname();

  // Determine home destination based on current portal or explicit role
  const getDestination = () => {
    if (role === 'customer' || pathname.includes('/app')) return `/${locale}/app`;
    if (role === 'technician' || pathname.includes('/tech')) return `/${locale}/tech`;
    if (role === 'admin' || pathname.includes('/admin')) return `/${locale}/admin`;
    return `/${locale}`;
  };

  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
  };

  const wrenchSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link
      href={getDestination()}
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
      title="FIXnGO - UAE Field Service Management"
    >
      {/* Brand Icon SVG container */}
      <div
        className={`${iconSizes[size]} bg-signal-orange flex items-center justify-center text-white font-black shadow-xs group-hover:scale-105 transition-transform shrink-0`}
      >
        <Wrench className={`${wrenchSizes[size]} text-white`} />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div
          className={`font-extrabold text-navy dark:text-white tracking-tight leading-none flex items-center gap-1.5 font-display ${textSizes[size]}`}
        >
          <span>FIX</span>
          <span className="text-signal-orange">nGO</span>

          {showBadge && (
            <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs leading-none">
              DEMO
            </span>
          )}
        </div>

        {showTrn && (
          <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
            {UAE_CONSTANTS.COMPANY_TRN}
          </div>
        )}
      </div>
    </Link>
  );
}

export default Logo;
