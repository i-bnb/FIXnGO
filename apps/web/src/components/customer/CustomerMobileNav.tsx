'use client';

import React from 'react';
import {
  Home,
  Calendar,
  ShoppingCart,
  User,
} from 'lucide-react';

export type CustomerTab = 'HOME' | 'BOOKINGS' | 'SHOP' | 'ACCOUNT';

interface CustomerMobileNavProps {
  locale: string;
  activeTab: CustomerTab;
  onChangeTab: (tab: CustomerTab) => void;
  activeOrderCount?: number;
}

export function CustomerMobileNav({
  locale,
  activeTab,
  onChangeTab,
  activeOrderCount = 1,
}: CustomerMobileNavProps) {
  const isArabic = locale === 'ar';

  const tabs: { id: CustomerTab; labelEn: string; labelAr: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'HOME', labelEn: 'Home', labelAr: 'الرئيسية', icon: Home },
    { id: 'BOOKINGS', labelEn: 'Bookings', labelAr: 'حجوزاتي', icon: Calendar },
    { id: 'SHOP', labelEn: 'Shop', labelAr: 'المتجر', icon: ShoppingCart },
    { id: 'ACCOUNT', labelEn: 'Account', labelAr: 'حسابي', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 start-0 end-0 z-40 bg-white/95 backdrop-blur-md border-t border-line py-1.5 px-4 shadow-lg select-none">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition relative min-h-[44px] ${
                isActive
                  ? 'text-signal-orange font-bold'
                  : 'text-slate hover:text-ink font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-signal-orange' : 'text-slate'}`} />
                {tab.id === 'BOOKINGS' && activeOrderCount > 0 && (
                  <span className="absolute -top-1 -end-1 w-2 h-2 bg-signal-orange rounded-full ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className={`text-[11px] mt-0.5 font-body ${isActive ? 'font-bold text-signal-orange' : 'text-slate'}`}>
                {isArabic ? tab.labelAr : tab.labelEn}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-signal-orange rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
