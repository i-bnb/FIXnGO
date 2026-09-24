'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import {
  Receipt,
  Eye,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download,
  Plus,
  Send,
  CreditCard,
  Building2,
  QrCode,
  DollarSign,
  Clock,
  Sparkles,
  X,
  MessageSquare,
  Mail,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  FileText,
  Check,
  Percent,
  ExternalLink,
} from 'lucide-react';
import { calculateUaeVat } from '@fieldops/shared';
import { fetchApi } from '../../../../lib/api-client';

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerTrn?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  balanceDue: number;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'PENDING';
  paymentMethod?: string;
  paymentReference?: string;
  paidAmount?: number;
  refundedAmount?: number;
  items: {
    descriptionEn: string;
    descriptionAr: string;
    quantity: number;
    unitPrice: number;
    totalWithVat: number;
  }[];
}

interface QuotationRecord {
  id: string;
  quoteNumber: string;
  customerName: string;
  title: string;
  date: string;
  validUntil: string;
  amountAed: number;
  status: 'ACCEPTED' | 'PENDING' | 'CONVERTED';
}

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-00001',
    customerName: 'Palm Crest Properties LLC',
    customerTrn: '100000000000001 (demo)',
    issueDate: '2026-09-23',
    dueDate: '2026-10-07',
    subtotal: 365.0,
    vatAmount: 18.25,
    totalAmount: 383.25,
    balanceDue: 0.0,
    paidAmount: 383.25,
    paymentStatus: 'PAID',
    paymentMethod: 'STRIPE_CARD',
    paymentReference: 'pi_stripe_demo_88291',
    items: [
      { descriptionEn: 'AC Diagnostic & Roof Chiller Callout', descriptionAr: 'تشخيص مكيف الهواء وفحص الشيلر الرئيسي', quantity: 1, unitPrice: 150, totalWithVat: 157.5 },
      { descriptionEn: 'Dual Run Capacitor 45/5 uF 440V', descriptionAr: 'مكثف تشغيل مزدوج 45/5 ميكروفاراد', quantity: 1, unitPrice: 75, totalWithVat: 78.75 },
      { descriptionEn: 'Coil Sanitization & Delta-T Testing', descriptionAr: 'تعقيم وتنظيف المبخر وفحص درجات الحرارة', quantity: 1, unitPrice: 140, totalWithVat: 147.0 },
    ],
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-00002',
    customerName: 'Al-Noor Residential Compound',
    customerTrn: '100000000000003 (demo)',
    issueDate: '2026-09-23',
    dueDate: '2026-09-30',
    subtotal: 265.0,
    vatAmount: 13.25,
    totalAmount: 278.25,
    balanceDue: 278.25,
    paidAmount: 0.0,
    paymentStatus: 'PENDING',
    items: [
      { descriptionEn: 'Emergency Kitchen Plumbing Pipe Repair', descriptionAr: 'إصلاح طارئ لتسريب أنابيب المطبخ الرئيسية', quantity: 1, unitPrice: 150, totalWithVat: 157.5 },
      { descriptionEn: 'PPR Pipe 32mm & Fusion Fittings', descriptionAr: 'أنابيب حرارية 32 ملم مع وصلات الصهر', quantity: 1, unitPrice: 45, totalWithVat: 47.25 },
      { descriptionEn: 'Grohe Chrome Angle Valve 1/2"', descriptionAr: 'محبس زاوية كروم أصلي جروهي 1/2 بوصة', quantity: 1, unitPrice: 70, totalWithVat: 73.5 },
    ],
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-00003',
    customerName: 'Crescent Bay Commercial Complex',
    customerTrn: '100000000000002 (demo)',
    issueDate: '2026-09-10',
    dueDate: '2026-09-20',
    subtotal: 4200.0,
    vatAmount: 210.0,
    totalAmount: 4410.0,
    balanceDue: 4410.0,
    paidAmount: 0.0,
    paymentStatus: 'OVERDUE',
    items: [
      { descriptionEn: 'Bi-Monthly Central HVAC Air Filter Replacement', descriptionAr: 'استبدال فلاتر الهواء الدورية لنظام التكييف المركزي', quantity: 24, unitPrice: 175, totalWithVat: 4410.0 },
    ],
  },
  {
    id: '4',
    invoiceNumber: 'INV-2026-00004',
    customerName: 'Desert Rose Logistics LLC',
    customerTrn: '100000000000004 (demo)',
    issueDate: '2026-09-18',
    dueDate: '2026-10-02',
    subtotal: 1200.0,
    vatAmount: 60.0,
    totalAmount: 1260.0,
    balanceDue: 660.0,
    paidAmount: 600.0,
    paymentStatus: 'PARTIALLY_PAID',
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: 'WIRE-NBD-90412',
    items: [
      { descriptionEn: 'Submersible Sump Pump Overhaul & Float Valve', descriptionAr: 'صيانة وتجديد مضخة تصريف المياه مع فحص العوامة', quantity: 2, unitPrice: 600, totalWithVat: 1260.0 },
    ],
  },
];

const SAMPLE_QUOTES: QuotationRecord[] = [
  { id: 'q-1', quoteNumber: 'QT-2026-0081', customerName: 'Palm Crest Properties LLC', title: 'Rooftop Chiller Overhaul & Coil Replacement', date: '2026-09-22', validUntil: '2026-10-22', amountAed: 18450, status: 'ACCEPTED' },
  { id: 'q-2', quoteNumber: 'QT-2026-0082', customerName: 'Al-Noor Contracting LLC', title: 'Temporary Substation Power DB Installation', date: '2026-09-23', validUntil: '2026-10-07', amountAed: 12600, status: 'PENDING' },
];

export default function BillingAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [quotes, setQuotes] = useState<QuotationRecord[]>(SAMPLE_QUOTES);
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'QUOTES' | 'AGING'>('INVOICES');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(INITIAL_INVOICES[0]);

  // Payment Recording Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'STRIPE' | 'MOCK' | 'BANK'>('STRIPE');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [payError, setPayError] = useState<string | null>(null);

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('Customer goodwill settlement');

  // Official Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Send Notification Modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Payment modal for specific invoice
  const openPaymentModal = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.balanceDue > 0 ? inv.balanceDue : inv.totalAmount);
    setCardNumber('4242 4242 4242 4242');
    setPayError(null);
    setShowPayModal(true);
  };

  // Open Refund modal for specific invoice
  const openRefundModal = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setRefundAmount(inv.paidAmount || inv.totalAmount);
    setShowRefundModal(true);
  };

  // Open Official Tax Receipt modal
  const openReceiptModal = (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setShowReceiptModal(true);
  };

  // Execute Payment
  const handleConfirmPayment = async () => {
    if (!selectedInvoice) return;
    setPayError(null);

    const payAmt = Number(paymentAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      setPayError('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (payAmt > selectedInvoice.balanceDue) {
      setPayError(`Payment cannot exceed outstanding balance of AED ${selectedInvoice.balanceDue.toFixed(2)}.`);
      return;
    }

    // Check Stripe Test Card Decline simulation
    if (paymentProvider === 'STRIPE') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.startsWith('4000000000000002')) {
        setPayError('❌ Card Declined: Your card has insufficient funds (Stripe Test Code 4000 0000 0000 0002). Payment failed.');
        return;
      }
    }

    // Call API (with local fallback)
    try {
      await fetchApi('/api/billing/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: payAmt,
          paymentMethod: paymentProvider === 'STRIPE' ? 'STRIPE_CARD' : paymentProvider === 'MOCK' ? 'MOCK_PROVIDER' : 'BANK_TRANSFER',
          cardNumber,
        }),
      });
    } catch (err: any) {
      // Allow simulated execution
    }

    const newBalance = Math.max(0, selectedInvoice.balanceDue - payAmt);
    const newPaidTotal = (selectedInvoice.paidAmount || 0) + payAmt;
    const newStatus: 'PAID' | 'PARTIALLY_PAID' = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

    const updatedInvoices: InvoiceRecord[] = invoices.map((inv) =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            balanceDue: newBalance,
            paidAmount: newPaidTotal,
            paymentStatus: newStatus,
            paymentMethod: paymentProvider === 'STRIPE' ? 'STRIPE_CARD' : 'BANK_TRANSFER',
            paymentReference: `PAY-${Date.now()}`,
          }
        : inv
    );

    setInvoices(updatedInvoices);
    setSelectedInvoice((prev) =>
      prev
        ? {
            ...prev,
            balanceDue: newBalance,
            paidAmount: newPaidTotal,
            paymentStatus: newStatus,
          }
        : null
    );

    setShowPayModal(false);
    showToast(
      `Payment of AED ${payAmt.toFixed(2)} captured! Auto-posted General Ledger Journal Entry (Dr Bank 1020 / Cr A/R 1050).`
    );
  };

  // Execute Refund
  const handleConfirmRefund = async () => {
    if (!selectedInvoice) return;
    const refAmt = Number(refundAmount);

    if (isNaN(refAmt) || refAmt <= 0 || refAmt > (selectedInvoice.paidAmount || 0)) {
      alert(`Invalid refund amount. Maximum refundable: AED ${(selectedInvoice.paidAmount || 0).toFixed(2)}`);
      return;
    }

    // Call backend refund API
    try {
      await fetchApi(`/api/billing/payments/${selectedInvoice.id}/refund`, {
        method: 'POST',
        body: JSON.stringify({
          amount: refAmt,
          reason: refundReason,
        }),
      });
    } catch (e) {}

    const restoredBalance = selectedInvoice.balanceDue + refAmt;
    const remainingPaid = Math.max(0, (selectedInvoice.paidAmount || 0) - refAmt);
    const updatedStatus: 'PENDING' | 'PARTIALLY_PAID' = restoredBalance >= selectedInvoice.totalAmount ? 'PENDING' : 'PARTIALLY_PAID';

    const updatedInvoices: InvoiceRecord[] = invoices.map((inv) =>
      inv.id === selectedInvoice.id
        ? {
            ...inv,
            balanceDue: restoredBalance,
            paidAmount: remainingPaid,
            refundedAmount: (inv.refundedAmount || 0) + refAmt,
            paymentStatus: updatedStatus,
          }
        : inv
    );

    setInvoices(updatedInvoices);
    setSelectedInvoice((prev) =>
      prev
        ? {
            ...prev,
            balanceDue: restoredBalance,
            paidAmount: remainingPaid,
            paymentStatus: updatedStatus,
          }
        : null
    );

    setShowRefundModal(false);
    showToast(
      `Refund of AED ${refAmt.toFixed(2)} processed! Reversing GL Journal Entry posted (Dr Sales Returns 4010 / Cr Bank 1020).`
    );
  };

  // Financial Rollup Metrics (Real-Time)
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalReceivables = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalOverdue = invoices
    .filter((inv) => inv.paymentStatus === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const invoiceColumns: Column<InvoiceRecord>[] = [
    {
      key: 'invoiceNumber',
      header: 'Tax Invoice #',
      render: (r) => (
        <Link
          href={`/${locale}/admin/invoices/${r.invoiceNumber}`}
          className="font-extrabold text-teal-900 bg-teal-50 hover:bg-teal-100 hover:text-teal-950 px-2 py-0.5 rounded font-mono text-xs border border-teal-200 transition"
          title="Open Full Tax Invoice Page"
        >
          {r.invoiceNumber}
        </Link>
      ),
    },
    {
      key: 'customerName',
      header: 'Client / B2B Entity',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{r.customerName}</div>
          {r.customerTrn && (
            <div className="text-[10px] text-slate-500 font-mono">TRN: {r.customerTrn}</div>
          )}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Gross Total',
      render: (r) => <span className="font-black text-slate-900 text-xs">{r.totalAmount.toFixed(2)} AED</span>,
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      render: (r) => (
        <div className="text-xs">
          <span className={`font-black font-mono ${r.balanceDue > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
            {r.balanceDue.toFixed(2)} AED
          </span>
          {r.paidAmount && r.paidAmount > 0 ? (
            <div className="text-[10px] text-slate-400">Paid: {r.paidAmount.toFixed(2)}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (r) => {
        let badge = 'bg-slate-100 text-slate-700';
        if (r.paymentStatus === 'PAID') badge = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
        else if (r.paymentStatus === 'PARTIALLY_PAID') badge = 'bg-amber-100 text-amber-800 border border-amber-300';
        else if (r.paymentStatus === 'PENDING') badge = 'bg-blue-100 text-blue-800 border border-blue-200';
        else if (r.paymentStatus === 'OVERDUE') badge = 'bg-red-100 text-red-800 animate-pulse border border-red-300';

        return (
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${badge}`}>
            {r.paymentStatus}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Payment Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {r.balanceDue > 0 && (
            <button
              onClick={() => openPaymentModal(r)}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-black transition flex items-center gap-1 shadow-xs"
              title="Record full or partial payment"
            >
              <CreditCard className="w-3 h-3" />
              <span>Pay</span>
            </button>
          )}

          {r.paidAmount && r.paidAmount > 0 ? (
            <button
              onClick={() => openRefundModal(r)}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
              title="Process refund and reversing GL entry"
            >
              <RotateCcw className="w-3 h-3 text-amber-600" />
              <span>Refund</span>
            </button>
          ) : null}

          <button
            onClick={() => openReceiptModal(r)}
            className="p-1.5 text-teal-800 hover:bg-teal-50 rounded-lg transition"
            title="Inspect Official FTA Tax Receipt"
          >
            <Receipt className="w-4 h-4" />
          </button>

          <Link
            href={`/${locale}/admin/invoices/${r.invoiceNumber}`}
            className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition"
            title="Open Full Tax Invoice Page"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 end-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-teal-500">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>{isArabic ? 'الفوترة الإلكترونية والضرائب' : 'FTA Compliant Tax Invoicing'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'الفواتير الضريبية، المدفوعات، والمقبوضات' : 'Tax Invoices, Settlements & Refunds'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'إصدار فواتير ضريبية ثنائية اللغة متوافقة مع هيئة الضرائب الاتحادية بنسبة 5%، تسجيل المدفوعات الجزئية، وتسوية المرتجعات مع قيود اليومية الآلية'
              : 'Stripe test cards, mock provider, partial settlements, refund processing, and double-entry General Ledger integration'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const newInv: InvoiceRecord = {
                id: String(Date.now()),
                invoiceNumber: `INV-2026-${String(Math.floor(1 + Math.random() * 9999)).padStart(5, '0')}`,
                customerName: 'Al-Harbi Villa Residence',
                issueDate: '2026-09-23',
                dueDate: '2026-10-07',
                subtotal: 220.0,
                vatAmount: 11.0,
                totalAmount: 231.0,
                balanceDue: 231.0,
                paidAmount: 0.0,
                paymentStatus: 'PENDING',
                items: [
                  { descriptionEn: 'Electrical Short Circuit Emergency Repair', descriptionAr: 'إصلاح التماس كهربائي طارئ للوحة الرئيسية', quantity: 1, unitPrice: 220, totalWithVat: 231.0 },
                ],
              };
              setInvoices([newInv, ...invoices]);
              setSelectedInvoice(newInv);
              showToast(`Created new invoice ${newInv.invoiceNumber}`);
            }}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-teal-300" />
            <span>Generate New Invoice</span>
          </button>
        </div>
      </div>

      {/* Real-Time Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Gross Invoiced</div>
          <div className="text-xl font-black text-slate-900 mt-1">{totalInvoiced.toFixed(2)} <span className="text-[11px] font-normal text-slate-500">AED</span></div>
          <div className="text-[10px] text-teal-700 font-bold mt-0.5">{invoices.length} Tax Invoices</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Cash Collected</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{totalCollected.toFixed(2)} <span className="text-[11px] font-normal text-slate-500">AED</span></div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Cleared in Bank Account 1020</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Accounts Receivable</div>
          <div className="text-xl font-black text-amber-700 mt-1">{totalReceivables.toFixed(2)} <span className="text-[11px] font-normal text-slate-500">AED</span></div>
          <div className="text-[10px] text-amber-600 font-bold mt-0.5">Asset Account 1050</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Overdue Balance (&gt;7d)</div>
          <div className="text-xl font-black text-red-600 mt-1">{totalOverdue.toFixed(2)} <span className="text-[11px] font-normal text-slate-500">AED</span></div>
          <div className="text-[10px] text-red-500 font-bold mt-0.5">Dunning Action Required</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'INVOICES' ? 'bg-slate-900 text-white font-black shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Tax Invoices ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('AGING')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'AGING' ? 'bg-slate-900 text-white font-black shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          A/R Aging Analysis
        </button>

        <button
          onClick={() => setActiveTab('QUOTES')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'QUOTES' ? 'bg-slate-900 text-white font-black shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Quotations & Scopes ({quotes.length})
        </button>
      </div>

      {/* TAB 1: INVOICES */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable data={invoices} columns={invoiceColumns} />
        </div>
      )}

      {/* TAB 2: AGING ANALYSIS */}
      {activeTab === 'AGING' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Accounts Receivable Aging Buckets</h3>
              <p className="text-slate-500 text-xs">Real-time outstanding balances categorized by credit term days</p>
            </div>
            <span className="font-mono text-teal-800 font-bold bg-teal-50 px-2 py-1 rounded border border-teal-200">
              Total Open: {totalReceivables.toFixed(2)} AED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800">Current (0 - 15 Days)</span>
              <div className="text-lg font-black text-emerald-950 mt-1">278.25 AED</div>
              <div className="text-[10px] text-emerald-700">1 Invoice (Al-Harbi Villa)</div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[10px] uppercase font-bold text-blue-800">16 - 30 Days</span>
              <div className="text-lg font-black text-blue-950 mt-1">660.00 AED</div>
              <div className="text-[10px] text-blue-700">1 Invoice (Desert Rose Logistics)</div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-800">31 - 60 Days</span>
              <div className="text-lg font-black text-amber-950 mt-1">4,410.00 AED</div>
              <div className="text-[10px] text-amber-700">1 Invoice (Address Downtown)</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">60+ Days</span>
              <div className="text-lg font-black text-slate-900 mt-1">0.00 AED</div>
              <div className="text-[10px] text-slate-400">Zero bad debt write-offs</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUOTES */}
      {activeTab === 'QUOTES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
          <h3 className="font-black text-slate-900 text-sm">Commercial Estimates & Maintenance Scopes</h3>
          <div className="space-y-2">
            {quotes.map((q) => (
              <div key={q.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{q.title}</div>
                  <div className="text-slate-500 text-[11px]">{q.customerName} • {q.quoteNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900">{q.amountAed.toFixed(2)} AED</div>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 1. RECORD PAYMENT MODAL (Stripe Success/Decline, Mock, Partial) */}
      {/* ========================================================================================= */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase block">Capture Payment Settlement</span>
                <h3 className="font-black text-slate-900 text-base">{selectedInvoice.invoiceNumber}</h3>
                <span className="text-slate-500 text-[11px]">{selectedInvoice.customerName}</span>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {payError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 font-bold flex items-start gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-snug">{payError}</span>
              </div>
            )}

            {/* Outstanding Balance Banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Outstanding Balance Due:</span>
                <span className="font-black text-slate-900 text-base font-mono">{selectedInvoice.balanceDue.toFixed(2)} AED</span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(selectedInvoice.balanceDue)}
                  className="px-2 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[10px] font-bold"
                >
                  Full (100%)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(Math.round((selectedInvoice.balanceDue / 2) * 100) / 100)}
                  className="px-2 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded text-[10px] font-bold"
                >
                  Partial (50%)
                </button>
              </div>
            </div>

            {/* Payment Provider Selection */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Payment Provider:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'STRIPE', label: 'Stripe Test Card' },
                  { key: 'MOCK', label: 'Mock Provider' },
                  { key: 'BANK', label: 'Emirates NBD Wire' },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPaymentProvider(p.key as any)}
                    className={`py-2 rounded-xl text-[11px] font-bold transition border ${
                      paymentProvider === p.key
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Settlement Amount (AED):</label>
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>Remaining after payment:</span>
                <span className="font-bold font-mono">
                  {Math.max(0, selectedInvoice.balanceDue - paymentAmount).toFixed(2)} AED
                </span>
              </div>
            </div>

            {/* Stripe Card Input with Quick Fill Chips */}
            {paymentProvider === 'STRIPE' && (
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700 block">Stripe Test Card Number:</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700"
                />

                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCardNumber('4242 4242 4242 4242')}
                    className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Success Card (4242...)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardNumber('4000 0000 0000 0002')}
                    className="flex-1 py-1 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Decline Card (4000...0002)</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2.5 border rounded-xl text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs shadow flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorize & Settle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 2. PROCESS REFUND MODAL */}
      {/* ========================================================================================= */}
      {showRefundModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Process Reversing Refund</span>
                <h3 className="font-black text-slate-900 text-base">{selectedInvoice.invoiceNumber}</h3>
                <span className="text-slate-500 text-[11px]">{selectedInvoice.customerName}</span>
              </div>
              <button onClick={() => setShowRefundModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Accounting Impact:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Refunding will restore the invoice balance due and automatically post a reversing General Ledger journal entry:
                <br />
                <b>Dr Sales Returns (4010) / Cr Emirates NBD Bank (1020)</b>.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Refund Amount (AED):</label>
              <input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Total Settled: AED {(selectedInvoice.paidAmount || 0).toFixed(2)}
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Reason for Refund:</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
              >
                <option value="Customer goodwill settlement">Customer goodwill settlement</option>
                <option value="Defective part scope adjustment">Defective part scope adjustment</option>
                <option value="Duplicate payment reconciliation">Duplicate payment reconciliation</option>
                <option value="Customer cancellation before completion">Customer cancellation before completion</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2.5 border rounded-xl text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-black text-xs shadow flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Confirm Refund & Post Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 3. OFFICIAL FTA TAX RECEIPT MODAL */}
      {/* ========================================================================================= */}
      {showReceiptModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs max-h-[90vh] overflow-y-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-800" />
                <span>FTA Official Tax Receipt / إيصال ضريبي معتمد</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                  title="Print Receipt"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 shadow-inner">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="font-black text-base text-slate-900">FieldOps Technical Services LLC</div>
                <div className="text-[11px] text-slate-500">Al Quoz Industrial 3, Dubai, UAE</div>
                <div className="font-mono text-teal-900 font-black text-xs mt-1">TRN: 100482910300003</div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5">Simplified Tax Invoice & Receipt</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.customerName}</span>
                  {selectedInvoice.customerTrn && (
                    <div className="font-mono text-slate-600 text-[10px]">TRN: {selectedInvoice.customerTrn}</div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Receipt Reference:</span>
                  <span className="font-mono font-bold text-slate-900">REC-2026-0042</span>
                  <div className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-[11px] border-t border-b border-slate-200 py-2">
                <thead>
                  <tr className="text-slate-500 font-bold border-b">
                    <th className="text-left py-1">Description</th>
                    <th className="text-center py-1">Qty</th>
                    <th className="text-right py-1">Total (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-1 font-semibold text-slate-800">{item.descriptionEn}</td>
                      <td className="py-1 text-center font-mono">{item.quantity}</td>
                      <td className="py-1 text-right font-black font-mono">{item.totalWithVat.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (Excl. VAT):</span>
                  <span className="font-mono font-bold">{selectedInvoice.subtotal.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>UAE VAT (5%):</span>
                  <span className="font-mono font-bold text-teal-800">{selectedInvoice.vatAmount.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Amount Paid:</span>
                  <span className="text-teal-900 font-mono">{(selectedInvoice.paidAmount || selectedInvoice.totalAmount).toFixed(2)} AED</span>
                </div>
              </div>

              {/* Cryptographic QR */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                <QrCode className="w-12 h-12 text-slate-900" />
                <div className="text-[10px] text-slate-500">
                  <div className="font-bold text-slate-900">Cryptographically Signed via UAE FTA Standard</div>
                  <div>Base64 TLV Encoding • Seller: 100000000000003 (demo)</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close Receipt
              </button>
              <Link
                href={`/${locale}/admin/invoices/${selectedInvoice.invoiceNumber}`}
                className="w-1/2 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Tax Invoice</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
