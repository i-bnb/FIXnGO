'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { GlobalSearchModal } from '../../../components/layout/GlobalSearchModal';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';
import { NotificationBell } from '../../../components/layout/NotificationBell';
import { DemoScenariosModal } from '../../../components/admin/DemoScenariosModal';
import { AskFixngoDrawer } from '../../../components/assistant/AskFixngoDrawer';
import { Search, Bell, Shield, HelpCircle, Zap, Sparkles } from 'lucide-react';

export default function AdminLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <AdminSidebar locale={locale} onOpenSearch={() => setSearchOpen(true)} />

      {/* Main Content Area with Top Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Admin Top Action Header */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
            >
              <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{locale === 'ar' ? 'بحث شامل في النظام...' : 'Quick search...'}</span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-[10px]">
                Ctrl+K
              </kbd>
            </button>
            <span className="hidden lg:inline text-xs text-slate-500 dark:text-slate-400 font-medium">
              {locale === 'ar' ? 'المقر الرئيسي لـ FIXnGO • القوز، دبي' : 'FIXnGO Operations HQ · Al Quoz, Dubai'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* "Ask FIXnGO" AI Operations Assistant Button */}
            <button
              onClick={() => setAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs border border-slate-700 shadow-xs transition cursor-pointer"
              title="Ask FIXnGO AI Operations Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-signal-orange animate-pulse" />
              <span>{locale === 'ar' ? 'اسأل فيكس آند جو' : 'Ask FIXnGO'}</span>
            </button>

            {/* Quick 1-Click Demo Scenarios Launcher */}
            <button
              onClick={() => setScenariosOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-signal-orange dark:text-orange-400 font-bold text-xs border border-orange-200 dark:border-orange-800 transition shadow-xs"
              title="Launch 1-Click Automation Demo Scenarios"
            >
              <Zap className="w-3.5 h-3.5 text-signal-orange dark:text-orange-400" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'سيناريوهات العرض' : 'Demo Scenarios'}</span>
            </button>

            {/* Notification Bell with multi-role switcher */}
            <NotificationBell locale={locale} />

            <ThemeToggle />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold shadow-xs">
                S
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Sara Al Hashimi</div>
                <div className="text-[10px] text-signal-orange dark:text-orange-400 font-medium">Operations Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* Screen Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        locale={locale}
      />

      {/* 1-Click Demo Scenarios Runner Modal */}
      <DemoScenariosModal
        isOpen={scenariosOpen}
        onClose={() => setScenariosOpen(false)}
        locale={locale}
      />

      {/* "Ask FIXnGO" AI Operations Assistant Slide-Over Drawer */}
      <AskFixngoDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        locale={locale}
      />
    </div>
  );
}
