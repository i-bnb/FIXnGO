'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mail,
  Smartphone,
  ShieldAlert,
  Sparkles,
  User,
  Wrench,
  CreditCard,
  Truck,
  Package,
  X,
  ExternalLink,
} from 'lucide-react';

export interface InAppNotification {
  id: string;
  recipientRole: string; // 'SUPER_ADMIN' | 'OPS_MANAGER' | 'ACCOUNTANT' | 'STOREKEEPER' | 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER'
  recipientName: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'SYSTEM' | 'IN_APP';
  category?: string;
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

export const ROLES_LIST = [
  { key: 'SUPER_ADMIN', name: 'Sultan Al-Falasi', roleTitle: 'Super Admin', color: 'bg-teal-700 text-white' },
  { key: 'OPS_MANAGER', name: 'Tariq Mansoor', roleTitle: 'Operations Mgr', color: 'bg-blue-700 text-white' },
  { key: 'ACCOUNTANT', name: 'Fatima Al-Zahra', roleTitle: 'Accountant', color: 'bg-emerald-700 text-white' },
  { key: 'DISPATCHER', name: 'Mariam Al-Kaabi', roleTitle: 'Dispatcher', color: 'bg-amber-700 text-white' },
  { key: 'STOREKEEPER', name: 'Bilal Al-Masri', roleTitle: 'Storekeeper', color: 'bg-orange-700 text-white' },
  { key: 'TECHNICIAN', name: 'Rashid Al-Nuaimi', roleTitle: 'Lead Tech (Van-01)', color: 'bg-indigo-700 text-white' },
  { key: 'CUSTOMER', name: 'Zaid Al-Harbi', roleTitle: 'Customer / Client', color: 'bg-rose-700 text-white' },
];

const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    recipientRole: 'SUPER_ADMIN',
    recipientName: 'Sultan Al-Falasi',
    title: 'Daily Close Summary: 14 Jobs • AED 18,450',
    titleAr: 'ملخص الإغلاق اليومي: 14 مهمة • 18,450 درهم',
    message: 'Daily Close Summary: 14 service jobs completed (98.6% SLA). Revenue: AED 18,450.00. Cash collected: AED 11,200.00.',
    messageAr: 'ملخص الإغلاق اليومي: 14 مهمة مكتملة. الإيرادات: 18,450.00 د.إ. المبالغ المحصلة: 11,200.00 د.إ.',
    channel: 'WHATSAPP',
    category: 'daily-summary',
    isRead: false,
    timestamp: '10m ago',
  },
  {
    id: 'notif-2',
    recipientRole: 'ACCOUNTANT',
    recipientName: 'Fatima Al-Zahra',
    title: 'Dunning Alert: Invoice INV-2026-0003 Overdue',
    titleAr: 'تنبيه مطالبة: الفاتورة INV-2026-0003 متأخرة',
    message: 'Tax Invoice INV-2026-0003 for Address Downtown (AED 4,410.00) is 13 days overdue. Dunning email dispatched.',
    messageAr: 'الفاتورة INV-2026-0003 لصالح فندق العنوان (4,410.00 د.إ) متأخرة منذ 13 يوماً.',
    channel: 'EMAIL',
    category: 'invoice-overdue',
    isRead: false,
    timestamp: '25m ago',
  },
  {
    id: 'notif-3',
    recipientRole: 'STOREKEEPER',
    recipientName: 'Bilal Al-Masri',
    title: 'Low Safety Stock Alert: R410A Refrigerant',
    titleAr: 'تنبيه انخفاض المخزون الآمن: غاز R410A',
    message: 'Safety threshold reached at Central Warehouse: 2 cylinders remaining. Draft PO-2026-0048 auto-created.',
    messageAr: 'تم الوصول للحد الأدنى في مستودع القوز: أسطوانتان متبقيتان. تم إنشاء مسودة أمر الشراء PO-2026-0048.',
    channel: 'SYSTEM',
    category: 'low-stock-po',
    isRead: false,
    timestamp: '42m ago',
  },
  {
    id: 'notif-4',
    recipientRole: 'DISPATCHER',
    recipientName: 'Mariam Al-Kaabi',
    title: 'New Service Request #SR-2026-0812 Logged',
    titleAr: 'طلب خدمة جديد رقم SR-2026-0812',
    message: 'Emergency Plumbing request received from Zaid Al-Harbi (Villa 24, Jumeirah 2). Auto-reply dispatched.',
    messageAr: 'طلب سباكة طارئ من زيد الحربي (فيلا 24، جميرا 2). تم إرسال الرد الآلي للعميل.',
    channel: 'WHATSAPP',
    category: 'new-request-auto-reply',
    isRead: false,
    timestamp: '1h ago',
  },
  {
    id: 'notif-5',
    recipientRole: 'TECHNICIAN',
    recipientName: 'Rashid Al-Nuaimi',
    title: 'Dispatch: Assigned to #WO-2026-002',
    titleAr: 'توزيع: تم تعيينك للطلب WO-2026-002',
    message: 'You are assigned as Lead In-Charge for Kitchen Main Supply Pipe Severe Leak at Villa 24, Jumeirah 2.',
    messageAr: 'تم تعيينك كفني رئيسي لإصلاح تسريب مياه المطبخ في فيلا 24، جميرا 2.',
    channel: 'SYSTEM',
    category: 'job-assigned',
    isRead: true,
    timestamp: '2h ago',
  },
  {
    id: 'notif-6',
    recipientRole: 'CUSTOMER',
    recipientName: 'Zaid Al-Harbi',
    title: 'Technician En Route: Rashid Al-Nuaimi (ETA 18m)',
    titleAr: 'الفني في الطريق: راشد النعيمي (الوصول 18 د)',
    message: 'Lead Technician Rashid is en route in Van-01. Arriving in 18 minutes! Track live in app.',
    messageAr: 'الفني راشد النعيمي في الطريق إليك في الشاحنة 01. وقت الوصول المتوقع 18 دقيقة!',
    channel: 'WHATSAPP',
    category: 'tech-en-route',
    isRead: false,
    timestamp: '15m ago',
  },
];

export function NotificationBell({ locale }: { locale: string }) {
  const isArabic = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoleKey, setActiveRoleKey] = useState<string>('SUPER_ADMIN');
  const [notifications, setNotifications] = useState<InAppNotification[]>(INITIAL_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<'UNREAD' | 'ALL'>('ALL');
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Load persisted notifications and listen to global events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fieldops_in_app_notifications');
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {}
      }

      const handleNewNotification = (e: any) => {
        const notif = e.detail as InAppNotification;
        if (notif) {
          setNotifications((prev) => {
            const updated = [notif, ...prev];
            localStorage.setItem('fieldops_in_app_notifications', JSON.stringify(updated));
            return updated;
          });
        }
      };

      window.addEventListener('fieldops:new_notification', handleNewNotification);
      return () => window.removeEventListener('fieldops:new_notification', handleNewNotification);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentRole = ROLES_LIST.find((r) => r.key === activeRoleKey) || ROLES_LIST[0];

  // Filter notifications for active role
  const roleNotifications = notifications.filter(
    (n) => n.recipientRole === activeRoleKey || activeRoleKey === 'SUPER_ADMIN'
  );

  const displayedNotifications =
    filterType === 'UNREAD' ? roleNotifications.filter((n) => !n.isRead) : roleNotifications;

  const totalUnreadCount = roleNotifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    const updated = notifications.map((n) =>
      n.recipientRole === activeRoleKey || activeRoleKey === 'SUPER_ADMIN' ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fieldops_in_app_notifications', JSON.stringify(updated));
    }
  };

  const markSingleRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fieldops_in_app_notifications', JSON.stringify(updated));
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
        title="View Notifications & Active Automation Firing"
      >
        <Bell className="w-4 h-4 text-teal-700 dark:text-teal-400" />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white px-1 shadow animate-pulse">
            {totalUnreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute ${
            isArabic ? 'left-0' : 'right-0'
          } mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-xs`}
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <div>
                <div className="font-extrabold text-sm leading-tight">
                  {isArabic ? 'مركز الإشعارات والأتمتة' : 'Notifications & Outbox Feed'}
                </div>
                <div className="text-[10px] text-teal-300">
                  {isArabic ? 'تحديثات حية للأدوار التشغيلية' : 'Live multi-role event listener'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {totalUnreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded transition"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Role Persona Switcher Carousel */}
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span>View As Role Persona:</span>
              <span className="font-bold text-teal-700 dark:text-teal-400">{currentRole.name}</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {ROLES_LIST.map((r) => {
                const isSelected = r.key === activeRoleKey;
                const roleUnread = notifications.filter(
                  (n) => (n.recipientRole === r.key || r.key === 'SUPER_ADMIN') && !n.isRead
                ).length;

                return (
                  <button
                    key={r.key}
                    onClick={() => setActiveRoleKey(r.key)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
                      isSelected
                        ? `${r.color} shadow-sm ring-1 ring-white/20`
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{r.roleTitle}</span>
                    {roleUnread > 0 && (
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">
                        {roleUnread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`transition ${filterType === 'ALL' ? 'text-teal-800 dark:text-teal-400 font-black' : 'text-slate-500'}`}
              >
                All ({roleNotifications.length})
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={() => setFilterType('UNREAD')}
                className={`transition ${filterType === 'UNREAD' ? 'text-teal-800 dark:text-teal-400 font-black' : 'text-slate-500'}`}
              >
                Unread ({totalUnreadCount})
              </button>
            </div>

            <span className="text-[10px] text-slate-400 font-mono">
              Auto-syncs with scenarios
            </span>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <div className="font-bold text-xs">No notifications for this role</div>
                <div className="text-[10px] mt-1 text-slate-500">
                  Trigger an automation scenario to see real-time firing!
                </div>
              </div>
            ) : (
              displayedNotifications.map((n) => {
                const titleText = isArabic && n.titleAr ? n.titleAr : n.title;
                const messageText = isArabic && n.messageAr ? n.messageAr : n.message;

                return (
                  <div
                    key={n.id}
                    onClick={() => markSingleRead(n.id)}
                    className={`p-3 transition cursor-pointer flex items-start gap-2.5 ${
                      !n.isRead
                        ? 'bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Channel Indicator Badge */}
                    <div className="mt-0.5 shrink-0">
                      {n.channel === 'WHATSAPP' && (
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {n.channel === 'EMAIL' && (
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {n.channel === 'SMS' && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {(n.channel === 'SYSTEM' || n.channel === 'IN_APP') && (
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[11px] truncate">
                          {titleText}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-1">
                          {n.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
                        {messageText}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-[9px]">
                        <span className="font-mono text-teal-800 dark:text-teal-300 uppercase px-1.5 py-0.2 bg-teal-100/60 dark:bg-teal-900/60 rounded">
                          {n.channel}
                        </span>
                        <span className="text-slate-400">To: {n.recipientName}</span>
                      </div>
                    </div>

                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-semibold">
              FieldOps Dispatch & Event Engine • Dubai HQ
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
