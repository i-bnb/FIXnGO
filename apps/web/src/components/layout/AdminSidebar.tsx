'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Navigation,
  Inbox,
  ClipboardList,
  Users,
  HardHat,
  Layers,
  Package,
  ShoppingCart,
  Receipt,
  Tractor,
  Banknote,
  FileBarChart,
  Cpu,
  Settings,
  ShieldCheck,
  Lock,
  UserCheck,
  Search,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@fieldops/shared';

interface AdminSidebarProps {
  locale: string;
  onOpenSearch?: () => void;
}

export function AdminSidebar({ locale, onOpenSearch }: AdminSidebarProps) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.SUPER_ADMIN);

  const navigationSections = [
    {
      title: locale === 'ar' ? 'نظرة عامة' : 'OVERVIEW',
      items: [
        { label: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: `/${locale}/admin`, icon: TrendingUp },
        { label: locale === 'ar' ? 'الخريطة المباشرة والترحيل' : 'Live map & dispatch', href: `/${locale}/admin/dispatch`, icon: Navigation, badge: '5 Live' },
      ],
    },
    {
      title: locale === 'ar' ? 'العمليات' : 'OPERATIONS',
      items: [
        { label: locale === 'ar' ? 'طلبات الخدمة' : 'Service requests', href: `/${locale}/admin/service-requests`, icon: Inbox, badge: '3 SLA' },
        { label: locale === 'ar' ? 'أوامر العمل' : 'Work orders', href: `/${locale}/admin/work-orders`, icon: ClipboardList, badge: 'WO-24817' },
        { label: locale === 'ar' ? 'العملاء' : 'Customers', href: `/${locale}/admin/customers`, icon: Users },
        { label: locale === 'ar' ? 'الفنيون' : 'Technicians', href: `/${locale}/admin/technicians`, icon: HardHat },
        { label: locale === 'ar' ? 'توريد العمالة' : 'Labour supply', href: `/${locale}/admin/manpower`, icon: Layers },
      ],
    },
    {
      title: locale === 'ar' ? 'الأصول والمخزون' : 'ASSETS & STOCK',
      items: [
        { label: locale === 'ar' ? 'المستودع والمخزون' : 'Inventory', href: `/${locale}/admin/inventory`, icon: Package },
        { label: locale === 'ar' ? 'تأجير المعدات' : 'Equipment rental', href: `/${locale}/admin/equipment`, icon: Tractor, badge: '68%' },
        { label: locale === 'ar' ? 'المشتريات والموردين' : 'Purchasing', href: `/${locale}/admin/purchasing`, icon: ShoppingCart },
        { label: locale === 'ar' ? 'مبيعات المواد' : 'Material sales', href: `/${locale}/admin/sales`, icon: Receipt },
      ],
    },
    {
      title: locale === 'ar' ? 'المالية' : 'MONEY',
      items: [
        { label: locale === 'ar' ? 'عروض الأسعار والفواتير' : 'Quotes & invoices', href: `/${locale}/admin/billing`, icon: Receipt },
        { label: locale === 'ar' ? 'المالية والأرباح' : 'Finance', href: `/${locale}/admin/finance`, icon: Banknote },
        { label: locale === 'ar' ? 'التقارير التحليلية' : 'Reports', href: `/${locale}/admin/reports`, icon: FileBarChart },
      ],
    },
    {
      title: locale === 'ar' ? 'النظام' : 'SYSTEM',
      items: [
        { label: locale === 'ar' ? 'الأتمتة والرسائل' : 'Automation', href: `/${locale}/admin/automation`, icon: Cpu },
        { label: locale === 'ar' ? 'مركز الأمان' : 'Security', href: `/${locale}/admin/security`, icon: Lock, badge: 'ASVS' },
        { label: locale === 'ar' ? 'الإعدادات والصلاحيات' : 'Settings', href: `/${locale}/admin/settings`, icon: Settings },
        { label: locale === 'ar' ? 'سجل العمليات والتدقيق' : 'Audit logs', href: `/${locale}/admin/audit-logs`, icon: ShieldCheck },
      ],
    },
  ];

  const roles = [
    { role: UserRole.SUPER_ADMIN, label: 'Sultan (Super Admin)' },
    { role: UserRole.OPERATIONS_MANAGER, label: 'Tariq (Ops Manager)' },
    { role: UserRole.ACCOUNTANT, label: 'Mariam (Accountant)' },
    { role: UserRole.DISPATCHER, label: 'Sarah (Dispatcher)' },
    { role: UserRole.STOREKEEPER, label: 'Bilal (Storekeeper)' },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between p-4 border-r border-slate-800 shrink-0 select-none">
      <div className="space-y-4">
        {/* Brand & Quick Search Trigger */}
        <div>
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition text-xs font-medium mb-3 group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400" />
              <span>{locale === 'ar' ? 'بحث شامل...' : 'Quick search...'}</span>
            </span>
            <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Role Persona Switcher for Client Demo */}
          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/70">
            <div className="flex items-center justify-between text-[11px] font-bold text-teal-400 mb-1 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'الشخصية التجريبية' : 'Demo Persona'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">RBAC</span>
            </div>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="w-full text-xs font-semibold bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
          {navigationSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isExact = pathname === item.href;
                const isSub = item.href !== `/${locale}/admin` && pathname.startsWith(item.href);
                const active = isExact || isSub;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      active
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                          active
                            ? 'bg-teal-900 text-teal-200'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="font-bold text-slate-300 flex items-center justify-between">
          <span>FieldOps Technical LLC</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-teal-950 text-teal-400 rounded border border-teal-800">
            UAE 5% VAT
          </span>
        </div>
        <div className="text-[10px] mt-0.5">TRN: 100482910300003 • Dubai</div>
      </div>
    </aside>
  );
}
