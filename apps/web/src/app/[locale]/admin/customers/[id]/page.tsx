import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CANONICAL_CUSTOMERS,
  CANONICAL_WORK_ORDERS,
  maskPhone,
  maskEmail,
} from '@fieldops/shared';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Receipt,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function CustomerDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const isArabic = locale === 'ar';

  const cleanId = id.trim().toLowerCase();
  const customer = CANONICAL_CUSTOMERS.find(
    (c) =>
      c.id.toLowerCase() === cleanId ||
      c.name.toLowerCase() === cleanId ||
      c.name.toLowerCase().replace(/\s+/g, '-') === cleanId
  );

  if (!customer) {
    notFound();
  }

  // Find all work orders for this customer from CANONICAL_WORK_ORDERS
  const customerWorkOrders = CANONICAL_WORK_ORDERS.filter(
    (w) => w.customerId === customer.id
  );

  const completedOrders = customerWorkOrders.filter((w) => w.status === 'COMPLETED');
  const totalBilledAed = Math.round(completedOrders.reduce((sum, w) => sum + w.totalAed, 0) * 100) / 100;
  const unpaidOrders = completedOrders.filter(
    (w) => w.paymentStatus === 'PENDING' || w.paymentStatus === 'OVERDUE' || w.paymentStatus === 'PARTIALLY_PAID'
  );
  const outstandingAed = Math.round(
    unpaidOrders.reduce((sum, w) => sum + (w.paymentStatus === 'PARTIALLY_PAID' ? w.totalAed * 0.5 : w.totalAed), 0) * 100
  ) / 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <Link
        href={`/${locale}/admin/customers`}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-navy dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isArabic ? 'العودة إلى العملاء' : 'Back to Customers'}</span>
      </Link>

      {/* Customer Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-line dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-7 h-7 text-signal-orange" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-ground dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {customer.id}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Active Client
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  TRN: {customer.trn}
                </span>
              </div>
              <h1 className="text-2xl font-black text-navy dark:text-white tracking-tight">
                {isArabic ? customer.nameAr : customer.name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic ? customer.name : customer.nameAr}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2 text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isArabic ? 'الحد الائتماني المعتمد' : 'Approved Credit Limit'}
            </div>
            <div className="font-mono text-lg font-black text-navy dark:text-white">
              AED {customer.creditLimit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Contact & Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-ground dark:bg-slate-950 border border-line dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isArabic ? 'جهة الاتصال الرئيسية' : 'Primary Contact'}
            </div>
            <div className="text-sm font-bold text-navy dark:text-white">
              {customer.contactPerson}
            </div>
            <div className="text-xs text-slate-500">Facilities & Operations Lead</div>
          </div>

          <div className="p-4 rounded-2xl bg-ground dark:bg-slate-950 border border-line dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isArabic ? 'بيانات الاتصال المقنّعة' : 'Masked Contact Info'}
            </div>
            <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{maskPhone(customer.phone)}</span>
            </div>
            <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{maskEmail(customer.email)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-ground dark:bg-slate-950 border border-line dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isArabic ? 'الموقع والإمارة' : 'Primary Location'}
            </div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-signal-orange" />
              <span>
                {customer.area}, {customer.emirate}, UAE
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Designated Service Zone</div>
          </div>
        </div>

        {/* 4 Financial & Job Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
            <div className="text-[10px] font-bold uppercase text-slate-400">
              {isArabic ? 'إجمالي الأوامر' : 'Total Work Orders'}
            </div>
            <div className="text-xl font-black text-navy dark:text-white mt-1">
              {customerWorkOrders.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {completedOrders.length} completed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <div className="text-[10px] font-bold uppercase text-slate-400">
              {isArabic ? 'إجمالي المفوتر' : 'Total Billed (AED)'}
            </div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
              AED {totalBilledAed.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">VAT inclusive</div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <div className="text-[10px] font-bold uppercase text-slate-400">
              {isArabic ? 'الرصيد المستحق' : 'Outstanding (AED)'}
            </div>
            <div className="text-xl font-black text-navy dark:text-white mt-1 font-mono">
              AED {outstandingAed.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {unpaidOrders.length} pending settlement
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-line dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase text-slate-400">
              {isArabic ? 'الامتثال بالسداد' : 'Payment Rating'}
            </div>
            <div className="text-xl font-black text-navy dark:text-white mt-1 flex items-center gap-1">
              <span>98%</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Low risk rating</div>
          </div>
        </div>
      </div>

      {/* Linked Work Orders List */}
      <div className="bg-white dark:bg-slate-900 border border-line dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-line dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-navy dark:text-white">
              {isArabic ? 'سجل أوامر العمل للعميل' : 'Customer Work Orders & Service History'}
            </h2>
            <p className="text-xs text-slate-400">
              {isArabic
                ? 'جميع التذاكر الصادرة لهذا العميل مرتبطة بنظام الفوترة والتكليف'
                : 'All tickets issued for this client linked to dispatch and tax invoicing'}
            </p>
          </div>
          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-ground dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {customerWorkOrders.length} Tickets
          </span>
        </div>

        {customerWorkOrders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No work orders recorded for this customer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ground dark:bg-slate-800/60 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">{isArabic ? 'رقم الطلب / العنوان' : 'Order / Scope'}</th>
                  <th className="py-2.5 px-3">{isArabic ? 'الخدمة' : 'Trade'}</th>
                  <th className="py-2.5 px-3">{isArabic ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3">{isArabic ? 'الفني' : 'Technician'}</th>
                  <th className="py-2.5 px-3 text-right">{isArabic ? 'المبلغ (AED)' : 'Amount (AED)'}</th>
                  <th className="py-2.5 px-3 text-right">{isArabic ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-slate-800 font-medium">
                {customerWorkOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <Link
                        href={`/${locale}/admin/work-orders/${wo.orderNumber}`}
                        className="font-bold text-navy dark:text-white hover:text-signal-orange flex items-center gap-1.5"
                      >
                        <span className="font-mono">{wo.orderNumber}</span>
                        {wo.isLossMaker && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                            Loss Maker
                          </span>
                        )}
                      </Link>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{wo.title}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-navy/5 text-navy dark:bg-white/10 dark:text-white">
                        {wo.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          wo.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : wo.status === 'IN_PROGRESS' || wo.status === 'ON_SITE'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {wo.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {wo.technicianName}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-navy dark:text-white">
                      AED {wo.totalAed.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <Link
                        href={`/${locale}/admin/invoices/${wo.orderNumber}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ground hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition"
                      >
                        <Receipt className="w-3 h-3 text-signal-orange" />
                        <span>{isArabic ? 'الفاتورة' : 'Invoice'}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
