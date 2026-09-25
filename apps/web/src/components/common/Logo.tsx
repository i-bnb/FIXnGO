'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getClientSession } from '../../lib/auth/session';

interface LogoProps {
  locale?: string;
  role?: 'customer' | 'technician' | 'admin' | 'public';
  variant?: 'default' | 'white';
  showBadge?: boolean;
  showTrn?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({
  locale = 'en',
  role,
  variant = 'default',
  showBadge = true,
  showTrn = false,
  size = 'md',
  className = '',
}: LogoProps) {
  const pathname = usePathname() || '';

  // Determine user's home destination based on current portal, role prop, or active session cookie
  const getDestination = () => {
    // 1. Explicit prop override
    if (role === 'customer') return `/${locale}/app`;
    if (role === 'technician') return `/${locale}/tech`;
    if (role === 'admin') return `/${locale}/admin`;
    if (role === 'public') return `/${locale}`;

    // 2. Active pathname context
    if (pathname.includes('/app')) return `/${locale}/app`;
    if (pathname.includes('/tech')) return `/${locale}/tech`;
    if (pathname.includes('/admin')) return `/${locale}/admin`;

    // 3. Fallback: inspect active client session cookie
    const session = getClientSession();
    if (session) {
      if (session.role === 'CUSTOMER') return `/${locale}/app`;
      if (session.role === 'TECHNICIAN') return `/${locale}/tech`;
      if (['SUPER_ADMIN', 'ACCOUNTANT', 'DISPATCHER', 'OPERATIONS_MANAGER', 'STOREKEEPER'].includes(session.role)) {
        return `/${locale}/admin`;
      }
    }

    // 4. Default: public landing
    return `/${locale}`;
  };

  const heights = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const height = heights[size];
  const width = Math.round(height * 4); // 240:60 aspect ratio

  const logoSrc = variant === 'white' 
    ? '/brand/fixngo-logo-white.svg' 
    : '/brand/fixngo-logo.svg';

  return (
    <Link
      href={getDestination()}
      className={`inline-flex items-center group select-none transition-transform hover:opacity-95 ${className}`}
      title="FIXnGO - UAE Field Service Management"
    >
      <img
        src={logoSrc}
        alt="FIXnGO"
        width={width}
        height={height}
        className="h-auto object-contain shrink-0"
        style={{ height: `${height}px`, width: 'auto' }}
      />
    </Link>
  );
}

export default Logo;
