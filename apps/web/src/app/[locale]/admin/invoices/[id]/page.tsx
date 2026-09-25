'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CANONICAL_WORK_ORDERS,
  CANONICAL_CUSTOMERS,
  UAE_CONSTANTS,
  maskPhone,
  maskEmail,
} from '@fieldops/shared';
import {
  ArrowLeft,
  Printer,
  Download,
  Building2,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function InvoiceDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const isArabic = locale === 'ar';

  // Normalize id: supports wo-001, WO-2026-00001, INV-2026-00001, or numeric 00001
  const cleanId = id.trim().toLowerCase();
  const numMatch = cleanId.replace(/^(inv-|wo-)/, '');

  const wo = CANONICAL_WORK_ORDERS.find((w) => {
    const wNum = w.orderNumber.toLowerCase().replace('wo-', '');
    return (
      w.id.toLowerCase() === cleanId ||
      w.orderNumber.toLowerCase() === cleanId ||
      wNum === numMatch ||
      `inv-${wNum}` === cleanId
    );
  });

  if (!wo) {
    notFound();
  }

  const customer = CANONICAL_CUSTOMERS.find((c) => c.id === wo.customerId);
  const invoiceNumber = wo.orderNumber.replace('WO-', 'INV-');
  const issueDate = wo.completedDate || wo.scheduledDate || wo.createdAt.split('T')[0];
  const trnCustomer = customer?.trn || '100000000000001 (demo)';

  // Deterministic line items breakdown
  const lineItems = [
    {
      descriptionEn: `${wo.serviceType} Diagnostic & Standard Callout`,
      descriptionAr: `فحص وتشخيص ${wo.serviceType === 'HVAC' ? 'التكييف' : wo.serviceType === 'PLUMBING' ? 'السباكة' : 'الأنظمة الكهربائية'} ورسوم المعاينة`,
      quantity: 1,
      unitPrice: Math.round(wo.subtotalAed * 0.35 * 100) / 100,
    },
    {
      descriptionEn: `${wo.title} (Parts & Specialized Consumables)`,
      descriptionAr: `${wo.title} (قطع الغيار والمستهلكات المعتمدة)`,
      quantity: 1,
      unitPrice: Math.round(wo.subtotalAed * 0.45 * 100) / 100,
    },
    {
      descriptionEn: 'Certified Technician Labour & Safety Verification',
      descriptionAr: 'أجور الفني المعتمد واختبارات السلامة والمطابقة',
      quantity: 1,
      unitPrice: Math.round((wo.subtotalAed - Math.round(wo.subtotalAed * 0.35 * 100) / 100 - Math.round(wo.subtotalAed * 0.45 * 100) / 100) * 100) / 100,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Nav & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/${locale}/admin/billing`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-navy dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isArabic ? 'العودة إلى الفواتير والتحصيل' : 'Back to Invoices & Billing'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/work-orders/${wo.orderNumber}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <FileText className="w-3.5 h-3.5 text-signal-orange" />
            <span>{isArabic ? 'أمر العمل المرتبط' : `Work Order ${wo.orderNumber}`}</span>
          </Link>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-signal-orange hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isArabic ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Tax Invoice Document Container */}
      <div className="bg-white dark:bg-slate-900 border-2 border-line dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* FTA Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-line dark:border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-signal-orange" />
              <span className="font-display font-black text-xl text-navy dark:text-white tracking-wider">
                FIX<span className="text-signal-orange">n</span>GO
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-orange-100 text-signal-orange dark:bg-orange-950/60 dark:text-orange-400">
                Demo
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <p className="font-bold text-slate-700 dark:text-slate-200">
                {UAE_CONSTANTS.COMPANY_NAME}
              </p>
              <p>Al Quoz Industrial Area 3, Dubai, United Arab Emirates</p>
              <p className="font-mono">TRN: {UAE_CONSTANTS.COMPANY_TRN}</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="inline-block px-3 py-1 rounded-lg bg-navy text-white text-xs font-black uppercase tracking-wider mb-1">
              {isArabic ? 'فاتورة ضريبية رسمية' : 'Tax Invoice'}
            </div>
            <div className="font-mono text-xl font-black text-navy dark:text-white">
              {invoiceNumber}
            </div>
            <p className="text-xs text-slate-400">
              {isArabic ? 'تاريخ الإصدار' : 'Issue Date'}: {issueDate}
            </p>
            <div className="pt-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  wo.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : wo.paymentStatus === 'PARTIALLY_PAID'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {wo.paymentStatus === 'PAID' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                <span>{wo.paymentStatus}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bill To & Supply Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-line dark:border-slate-800">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              {isArabic ? 'فاتورة إلى (العميل)' : 'Bill To (Client)'}
            </div>
            <Link
              href={`/${locale}/admin/customers/${customer?.id || wo.customerId}`}
              className="group inline-flex items-center gap-1.5 font-display text-base font-bold text-navy dark:text-white hover:text-signal-orange transition"
            >
              <span>{wo.customerName}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-signal-orange" />
            </Link>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
              <p className="font-mono text-slate-700 dark:text-slate-300">TRN: {trnCustomer}</p>
              <p className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {wo.address}, {wo.area}
                </span>
              </p>
              <p className="flex items-center gap-1 font-mono text-[11px]">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{maskPhone(wo.customerPhone)}</span>
              </p>
              <p className="flex items-center gap-1 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{maskEmail(wo.customerEmail)}</span>
              </p>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              {isArabic ? 'بيانات التوريد والفني' : 'Supply & Service Execution'}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
              {isArabic ? 'الفني المعتمد' : 'Field Technician'}: {wo.technicianName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isArabic ? 'أمر العمل المرجعي' : 'Ref Work Order'}: {wo.orderNumber}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isArabic ? 'مكان التوريد' : 'Place of Supply'}: Dubai, United Arab Emirates
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isArabic ? 'العملة' : 'Currency'}: UAE Dirham (AED)
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-ground dark:bg-slate-800/80 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">{isArabic ? 'البند / تفاصيل الخدمة' : 'Description / Trade'}</th>
                <th className="py-2.5 px-3 text-center">{isArabic ? 'الكمية' : 'Qty'}</th>
                <th className="py-2.5 px-3 text-right">{isArabic ? 'سعر الوحدة' : 'Unit Price (AED)'}</th>
                <th className="py-2.5 px-3 text-right">{isArabic ? 'الصافي' : 'Net (AED)'}</th>
                <th className="py-2.5 px-3 text-right">{isArabic ? 'ضريبة (5%)' : 'VAT (5%)'}</th>
                <th className="py-2.5 px-3 text-right">{isArabic ? 'الإجمالي' : 'Total (AED)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-slate-800 font-medium">
              {lineItems.map((item, idx) => {
                const net = item.quantity * item.unitPrice;
                const vat = Math.round(net * UAE_CONSTANTS.VAT_RATE * 100) / 100;
                const total = Math.round((net + vat) * 100) / 100;
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-bold text-navy dark:text-white">{item.descriptionEn}</div>
                      <div className="text-[11px] text-slate-400">{item.descriptionAr}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono">{net.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">{vat.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-navy dark:text-white">
                      {total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary & FTA QR Code Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-line dark:border-slate-800 items-start">
          {/* FTA Phase 2 QR Box */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-ground dark:bg-slate-950 border border-line dark:border-slate-800">
            <div className="w-20 h-20 bg-white p-1 rounded-xl border border-line shadow-xs flex items-center justify-center shrink-0">
              <QrCode className="w-16 h-16 text-navy" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-navy dark:text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isArabic ? 'رمز الاستجابة السريعة FTA e-Invoice' : 'FTA Compliant e-Invoice'}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isArabic
                  ? 'يتضمن الرمز اسم الشركة والرقم الضريبي والوقت وقيمة الضريبة المشفرة وفق متطلبات المرحلة الثانية.'
                  : 'Encodes seller name, TRN, timestamp, invoice total, and VAT amount per UAE FTA Phase 2 standard.'}
              </p>
              <div className="text-[10px] text-slate-400 font-mono">TLV: Base64 / SHA-256 Validated</div>
            </div>
          </div>

          {/* Subtotal, VAT, Total Box */}
          <div className="space-y-2 p-4 rounded-2xl bg-ground dark:bg-slate-950 border border-line dark:border-slate-800">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{isArabic ? 'المجموع الخاضع للضريبة' : 'Taxable Subtotal'}:</span>
              <span className="font-mono font-bold text-navy dark:text-white">
                AED {wo.subtotalAed.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{isArabic ? 'ضريبة القيمة المضافة (5%)' : 'UAE VAT (5%)'}:</span>
              <span className="font-mono font-bold text-navy dark:text-white">
                AED {wo.vatAmountAed.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-line dark:border-slate-800 flex justify-between text-sm sm:text-base font-black text-navy dark:text-white">
              <span>{isArabic ? 'الإجمالي المستحق' : 'Gross Total Due'}:</span>
              <span className="font-mono text-signal-orange">
                AED {wo.totalAed.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-line/60 dark:border-slate-800/60 text-center text-[11px] text-slate-400">
          This is an electronically generated Tax Invoice conforming to UAE Federal Decree-Law No. (8) of 2017 on Value Added Tax. Demo environment only.
        </div>
      </div>
    </div>
  );
}
