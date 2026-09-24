import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CANONICAL_WORK_ORDERS,
  maskPhone,
  maskEmail,
} from '@fieldops/shared';
import {
  ClipboardList,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Wrench,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export default function WorkOrderDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const isArabic = locale === 'ar';

  const wo = CANONICAL_WORK_ORDERS.find(
    (w) =>
      w.id.toLowerCase() === id.toLowerCase() ||
      w.orderNumber.toLowerCase() === id.toLowerCase()
  );

  if (!wo) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <Link
        href={`/${locale}/admin/work-orders`}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-navy dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isArabic ? 'العودة إلى أوامر العمل' : 'Back to Work Orders'}</span>
      </Link>

      {/* Main Card Header */}
      <div className="bg-white dark:bg-slate-900 border border-line dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-sm font-black text-signal-orange">
                {wo.orderNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-navy/10 text-navy dark:bg-white/10 dark:text-white">
                {wo.serviceType}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  wo.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : wo.status === 'IN_PROGRESS' || wo.status === 'ON_SITE'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {wo.status}
              </span>
              {wo.isLossMaker && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200">
                  Loss Maker
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-navy dark:text-white tracking-tight">
              {wo.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/admin/invoices/${wo.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-signal-orange hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition"
            >
              <Receipt className="w-4 h-4" />
              <span>{isArabic ? 'عرض الفاتورة الضريبية' : 'View Tax Invoice'}</span>
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Customer info */}
          <div className="space-y-2 p-4 rounded-2xl bg-ground dark:bg-slate-950 border border-line dark:border-slate-800">
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase">
              <User className="w-3.5 h-3.5 text-signal-orange" />
              <span>{isArabic ? 'بيانات العميل' : 'Client Details'}</span>
            </div>
            <Link
              href={`/${locale}/admin/customers/${wo.customerId}`}
              className="font-bold text-sm text-navy dark:text-white hover:text-signal-orange transition block"
            >
              {wo.customerName}
            </Link>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{wo.address}</span>
            </div>
            <div className="text-xs text-slate-500">
              Phone: <span className="font-mono">{maskPhone(wo.customerPhone)}</span>
            </div>
            <div className="text-xs text-slate-500">
              Email: <span className="font-mono">{maskEmail(wo.customerEmail)}</span>
            </div>
          </div>

          {/* Assigned Technician */}
          <div className="space-y-2 p-4 rounded-2xl bg-ground dark:bg-slate-950 border border-line dark:border-slate-800">
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase">
              <Wrench className="w-3.5 h-3.5 text-signal-orange" />
              <span>{isArabic ? 'الفني المعين' : 'Assigned Technician'}</span>
            </div>
            <div className="font-bold text-sm text-navy dark:text-white">
              {wo.technicianName}
            </div>
            <div className="text-xs text-slate-500">
              Phone: <span className="font-mono">{maskPhone(wo.technicianPhone)}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Scheduled: {new Date(wo.scheduledDate).toLocaleDateString()}</span>
            </div>
            {wo.completedDate && (
              <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Completed: {new Date(wo.completedDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Financials */}
          <div className="space-y-2 p-4 rounded-2xl bg-ground dark:bg-slate-950 border border-line dark:border-slate-800">
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase">
              <Receipt className="w-3.5 h-3.5 text-signal-orange" />
              <span>{isArabic ? 'البيانات المالية (درهم)' : 'Financial Summary'}</span>
            </div>
            <div className="flex justify-between text-xs py-0.5">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-mono font-bold text-navy dark:text-white">AED {wo.subtotalAed.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs py-0.5">
              <span className="text-slate-500">VAT (5%):</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">AED {wo.vatAmountAed.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs py-0.5 border-t border-line dark:border-slate-800 font-bold">
              <span className="text-navy dark:text-white">Total:</span>
              <span className="font-mono text-signal-orange">AED {wo.totalAed.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 text-slate-400">
              <span>Cost / Margin:</span>
              <span className={`font-mono font-bold ${wo.isLossMaker ? 'text-red-500' : 'text-emerald-600'}`}>
                {wo.marginPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
