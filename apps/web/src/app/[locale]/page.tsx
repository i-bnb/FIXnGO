'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const isArabic = locale === 'ar';

  const buttons = [
    { labelEn: 'Customer Login', labelAr: 'دخول العميل', href: `/${locale}/login/customer` },
    { labelEn: 'Technician Login', labelAr: 'دخول الفني', href: `/${locale}/login/technician` },
    { labelEn: 'Admin Login', labelAr: 'دخول الإدارة', href: `/${locale}/login/admin` },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-ground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-line shadow-xl p-8 text-center">
        {/* Logo and tagline */}
        <h1 className="text-3xl font-extrabold mb-4">FIX<span className="text-signal-orange">nGO</span></h1>
        <p className="text-lg text-slate-600 mb-6">Maintenance, rentals and field teams in one app</p>

        {/* Buttons */}
        <div className="flex flex-col space-y-4">
          {buttons.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="block py-3 bg-signal-orange text-white rounded-xl hover:bg-signal-orange-hover transition"
            >
              {isArabic ? b.labelAr : b.labelEn}
            </Link>
          ))}
        </div>

        {/* Language switch */}
        <div className="mt-6">
          <Link href={isArabic ? '/en' : '/ar'} className="text-sm text-slate-500 underline">
            {isArabic ? 'English' : 'العربية'}
          </Link>
        </div>
      </div>
    </div>
  );
}
