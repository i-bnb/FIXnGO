'use client';

import React, { useState, useEffect, useId } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LeafletMap, MapMarker } from '../../../components/map/LeafletMap';
import { CustomerHeader } from '../../../components/customer/CustomerHeader';
import { CustomerMobileNav, CustomerTab } from '../../../components/customer/CustomerMobileNav';
import {
  SERVICE_CATEGORIES,
  SERVICE_TASKS,
  getTasksByCategory,
  getTaskById,
  ServiceCategoryKey,
  ServiceTask,
  calculateUaeVat,
  UAE_CONSTANTS,
  JobStatus,
} from '@fieldops/shared';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Star,
  Receipt,
  Sparkles,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Camera,
  Check,
  X,
  MessageSquare,
  Users,
  Search,
  Calendar,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface CustomerUser {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
}

interface ActiveJob {
  id: string;
  orderNumber: string;
  ticketNumber?: string;
  title: string;
  serviceType: string;
  category: string;
  status: string;
  scheduledTime: string;
  address: string;
  area: string;
  coordinates: [number, number];
  technician: {
    name: string;
    phone: string;
    vanCode: string;
    rating: number;
  };
  techLocation: [number, number];
  etaMinutes: number;
  subtotalAed: number;
  vatAed: number;
  totalAmountAed: number;
  description: string;
  pricingType?: 'FIXED' | 'QUOTE';
}

interface QuotationItem {
  id: string;
  quoteNumber: string;
  title: string;
  amountAed: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  scope: string;
}

export default function CustomerMobileAppPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation State
  const [activeTab, setActiveTab] = useState<CustomerTab>('HOME');
  const [activeSubScreen, setActiveSubScreen] = useState<'NONE' | 'TRACKING' | 'RECEIPT' | 'SUCCESS'>('NONE');
  const [currentLocation, setCurrentLocation] = useState('Downtown Dubai, Burj Crown');

  // User State
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Active Job & Bookings State
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Quotation State
  const [quotation, setQuotation] = useState<QuotationItem | null>(null);
  const [quoteToast, setQuoteToast] = useState<string | null>(null);
  const [quoteUpdating, setQuoteUpdating] = useState(false);

  // Shop Cart State
  const [shopCart, setShopCart] = useState<Array<{ id: string; name: string; priceAed: number; qty: number }>>([]);

  // ==========================================
  // 4-STEP BOOKING FLOW STATE
  // ==========================================
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryKey>('AC');
  const [selectedTask, setSelectedTask] = useState<ServiceTask>(getTasksByCategory('AC')[0]);
  const [taskSearch, setTaskSearch] = useState('');

  // Step 3: Details State
  const [bookingDescription, setBookingDescription] = useState('');
  const [bookingPhotoAttached, setBookingPhotoAttached] = useState(false);
  const [bookingAddress, setBookingAddress] = useState('Burj Crown Residences, Downtown Dubai');
  const [bookingCoords, setBookingCoords] = useState<[number, number]>([25.1972, 55.2744]);
  const [bookingTimeSlot, setBookingTimeSlot] = useState('Immediate Emergency Callout (within 45m)');
  const [bookingDate, setBookingDate] = useState('Today');

  // Labour Supply Specific Inputs
  const [workersCount, setWorkersCount] = useState<number>(2);
  const [daysCount, setDaysCount] = useState<number>(3);

  // Equipment Rental Specific Inputs
  const [rentalStartDate, setRentalStartDate] = useState('2026-09-26');
  const [rentalEndDate, setRentalEndDate] = useState('2026-09-29');

  // Step 4: Submission & Idempotency
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  const [confirmedBookingData, setConfirmedBookingData] = useState<{ orderNumber: string; ticketNumber: string } | null>(null);

  // Load User, Active Job, and Quotations
  const loadData = async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      // 1. Load User Session
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData?.success && meData?.user) {
          setUser({
            id: meData.user.id,
            fullName: meData.user.fullName || 'Customer Account',
            email: meData.user.email || 'customer@fixngo.ae',
            phone: meData.user.phone || '+971 50 900 3001',
          });
        }
      }

      // 2. Load Bookings to find Hero Active Job
      const bRes = await fetch('/api/customer/bookings');
      if (bRes.ok) {
        const bData = await bRes.json();
        if (bData?.success && Array.isArray(bData.bookings)) {
          const live = bData.bookings.find(
            (b: any) => b.status === 'IN_PROGRESS' || b.status === 'EN_ROUTE' || b.status === 'ON_SITE'
          );
          if (live) {
            setActiveJob({
              id: live.id,
              orderNumber: live.orderNumber,
              ticketNumber: live.ticketNumber,
              title: live.title,
              serviceType: live.serviceType || live.category,
              category: live.category,
              status: live.status,
              scheduledTime: `${live.date} · ${live.timeSlot}`,
              address: live.address,
              area: live.area || 'Downtown Dubai',
              coordinates: live.coordinates || [25.1972, 55.2744],
              techLocation: live.techLocation || [25.1856, 55.2708],
              etaMinutes: live.etaMinutes ?? 12,
              subtotalAed: live.subtotalAed ?? 249.0,
              vatAed: live.vatAed ?? 12.45,
              totalAmountAed: live.amountAed ?? 261.45,
              description: live.description || '',
              pricingType: live.pricingType,
              technician: {
                name: live.technicianName || 'Rashid Al-Nuaimi',
                phone: live.technicianPhone || '+971 50 777 8899',
                vanCode: live.technicianVan || 'Van DXB-12',
                rating: live.technicianRating || 4.95,
              },
            });
          } else {
            setActiveJob(null);
          }
        }
      }

      // 3. Load Quotations
      const qRes = await fetch('/api/customer/quotes');
      if (qRes.ok) {
        const qData = await qRes.json();
        if (qData?.success && qData.quotation) {
          setQuotation(qData.quotation);
        } else {
          setQuotation(null);
        }
      }
    } catch (err: any) {
      setBookingsError(err?.message || 'Error loading dashboard data');
    } finally {
      setBookingsLoading(false);
      setUserLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Generate fresh idempotency key
    setIdempotencyKey(`bk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  }, []);

  // Check URL query parameters (e.g. ?book=1 or ?service=PLUMBING)
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    const bookParam = searchParams.get('book');
    if (serviceParam && ['AC', 'ELECTRICAL', 'PLUMBING', 'LABOUR', 'RENTAL'].includes(serviceParam)) {
      handleSelectCategory(serviceParam as ServiceCategoryKey);
      setIsBookingOpen(true);
      setBookingStep(2);
    } else if (bookParam === '1') {
      setIsBookingOpen(true);
      setBookingStep(1);
    }
  }, [searchParams]);

  // Handle switching category in Step 1
  const handleSelectCategory = (catId: ServiceCategoryKey) => {
    if (catId === 'MATERIALS') {
      setIsBookingOpen(false);
      router.push(`/${locale}/app/shop`);
      return;
    }
    setSelectedCategory(catId);
    const availableTasks = getTasksByCategory(catId);
    if (availableTasks.length > 0) {
      setSelectedTask(availableTasks[0]);
    }
  };

  // Step 4 Pricing Calculation
  const isQuoteOnly = selectedCategory === 'LABOUR' || selectedCategory === 'RENTAL';
  const basePrice = selectedTask?.startingPriceAed ?? 149;
  const vatCalculated = calculateUaeVat(basePrice);
  const vatAmount = isQuoteOnly ? 0 : vatCalculated.vatAmount;
  const totalAmount = isQuoteOnly ? 0 : vatCalculated.totalAmount;

  // Handle Booking Confirmation & Dispatch
  const handleConfirmBooking = async () => {
    if (isSubmittingBooking) return;
    setIsSubmittingBooking(true);

    try {
      const payload = {
        category: selectedCategory,
        serviceType: selectedCategory,
        taskId: selectedTask.id,
        title: selectedTask.titleEn,
        description: bookingDescription || selectedTask.descriptionEn,
        photoUrl: bookingPhotoAttached ? '/placeholders/fault-photo.jpg' : undefined,
        address: bookingAddress,
        area: currentLocation.split(',')[0] || 'Downtown Dubai',
        latitude: bookingCoords[0],
        longitude: bookingCoords[1],
        scheduledDate: bookingDate,
        scheduledSlot: bookingTimeSlot,
        pricingType: selectedTask.pricingType,
        estimatedPriceAed: basePrice,
        workersCount: selectedCategory === 'LABOUR' ? workersCount : undefined,
        daysCount: selectedCategory === 'LABOUR' ? daysCount : undefined,
        startDate: selectedCategory === 'RENTAL' ? rentalStartDate : undefined,
        endDate: selectedCategory === 'RENTAL' ? rentalEndDate : undefined,
        idempotencyKey,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to submit booking');
      }

      setConfirmedBookingData({
        orderNumber: data.workOrderNumber || 'WO-2026-0042',
        ticketNumber: data.ticketNumber || 'SR-2026-0491',
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Refresh data in background
      loadData();
      setActiveSubScreen('SUCCESS');
    } catch (err: any) {
      alert(err?.message || 'Could not complete booking. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Handle Quotation Approval / Rejection
  const handleQuoteAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!quotation || quoteUpdating) return;
    setQuoteUpdating(true);
    try {
      const res = await fetch(`/api/customer/quotes/${quotation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data?.success) {
        setQuotation({ ...quotation, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' });
        setQuoteToast(
          action === 'APPROVE'
            ? (isArabic ? 'تمت الموافقة على عرض السعر وترحيله إلى العمليات' : 'Quotation approved! Dispatched to operations.')
            : (isArabic ? 'تم رفض عرض السعر' : 'Quotation declined.')
        );
        setTimeout(() => setQuoteToast(null), 5000);
        loadData();
      }
    } catch {
      alert('Failed to update quotation.');
    } finally {
      setQuoteUpdating(false);
    }
  };

  // Map markers for live tracking
  const trackingMarkers: MapMarker[] = activeJob
    ? [
        {
          id: 'customer-site',
          lat: activeJob.coordinates?.[0] ?? 25.1972,
          lng: activeJob.coordinates?.[1] ?? 55.2744,
          title: 'Your Site',
          subtitle: activeJob.address,
          type: 'customer',
          status: 'EMERGENCY',
        },
        {
          id: 'tech-van',
          lat: activeJob.techLocation?.[0] ?? 25.1856,
          lng: activeJob.techLocation?.[1] ?? 55.2708,
          title: `${activeJob.technician?.name || 'Technician'} (${activeJob.technician?.vanCode || 'Van'})`,
          subtitle: `En Route • ETA ${activeJob.etaMinutes ?? 12} mins`,
          type: 'tech',
          status: activeJob.status,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative pb-20 select-none">
        {/* App Header */}
        <CustomerHeader
          locale={locale}
          currentLocation={currentLocation}
          onLocationChange={setCurrentLocation}
          user={user}
          onOpenAuth={() => {}}
        />

        {/* Quotation Status Toast Banner */}
        {quoteToast && (
          <div className="mx-4 mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{quoteToast}</span>
            </div>
            <button onClick={() => setQuoteToast(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* MAIN BODY CONTENT                                              */}
        {/* ============================================================== */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ============================================================== */}
          {/* SUB-SCREEN 1: LIVE TRACKING                                    */}
          {/* ============================================================== */}
          {activeSubScreen === 'TRACKING' && activeJob && (
            <div className="space-y-4 animate-fade-in font-body">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveSubScreen('NONE')}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-ground border border-line text-xs font-bold text-ink hover:bg-slate-100 transition min-h-[44px]"
                >
                  <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                  <span>{isArabic ? 'الرئيسية' : 'Home'}</span>
                </button>

                <div className="bg-navy text-white px-3.5 py-1.5 rounded-xl text-xs font-display font-extrabold flex items-center gap-1.5 shadow-sm">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider">
                    {isArabic ? 'الوصول خلال' : 'ARRIVING IN'}
                  </span>
                  <span className="text-signal-orange">{activeJob.etaMinutes ?? 12} min</span>
                </div>
              </div>

              {/* Map Container */}
              <div className="h-72 rounded-2xl overflow-hidden border border-line relative shadow-sm">
                <LeafletMap
                  center={activeJob.coordinates || [25.1972, 55.2744]}
                  zoom={14}
                  markers={trackingMarkers}
                  className="w-full h-full"
                />
              </div>

              {/* Technician Profile Card */}
              <div className="p-4 bg-white rounded-2xl border border-line space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-ocean-blue/15 text-ocean-blue font-display font-extrabold text-base flex items-center justify-center shrink-0">
                      {activeJob.technician?.name
                        ? activeJob.technician.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                        : 'RN'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-ink font-display">
                        {activeJob.technician?.name || 'Assigned Technician'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-ink">{activeJob.technician?.rating ?? 4.9}</span>
                        <span>· {activeJob.technician?.vanCode || 'Service Van'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeJob.technician?.phone && (
                      <a
                        href={`tel:${activeJob.technician.phone}`}
                        className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate block text-[10px]">{isArabic ? 'رقم أمر العمل' : 'Work Order'}</span>
                    <span className="font-mono font-bold text-ink">{activeJob.orderNumber}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-slate block text-[10px]">{isArabic ? 'الحالة' : 'Status'}</span>
                    <span className="font-bold text-signal-orange uppercase">{activeJob.status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SUB-SCREEN 2: BOOKING CONFIRMATION SUCCESS                     */}
          {/* ============================================================== */}
          {activeSubScreen === 'SUCCESS' && confirmedBookingData && (
            <div className="space-y-6 py-6 animate-fade-in text-center font-body">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-200 shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-black bg-orange-100 text-signal-orange">
                  {confirmedBookingData.orderNumber}
                </span>
                <h2 className="text-2xl font-black text-navy font-display">
                  {isQuoteOnly
                    ? (isArabic ? 'تم إرسال طلب عرض السعر بنجاح!' : 'Quotation Request Sent!')
                    : (isArabic ? 'تم تأكيد حجزك بنجاح!' : 'Booking Confirmed!')}
                </h2>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  {isArabic
                    ? 'تم إرسال طلبك إلى لوحة العمليات وتعيين أقرب فني معتمد لموقعك.'
                    : 'Your request has been routed to dispatch and assigned to a certified specialist.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-line rounded-2xl text-xs text-start space-y-2 max-w-xs mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isArabic ? 'الخدمة' : 'Service'}:</span>
                  <span className="font-bold text-slate-900">{selectedTask?.titleEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isArabic ? 'الموقع' : 'Location'}:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">{bookingAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isArabic ? 'الموعد' : 'Time Window'}:</span>
                  <span className="font-bold text-slate-900">{bookingDate} ({bookingTimeSlot})</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 max-w-xs mx-auto">
                <button
                  onClick={() => {
                    setActiveSubScreen('NONE');
                    setIsBookingOpen(false);
                    router.push(`/${locale}/app/bookings`);
                  }}
                  className="w-full py-3 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold rounded-xl shadow-md transition text-xs"
                >
                  {isArabic ? 'عرض قائمة حجوزاتي' : 'View in My Bookings'}
                </button>
                <button
                  onClick={() => {
                    setActiveSubScreen('NONE');
                    setIsBookingOpen(false);
                  }}
                  className="w-full py-2.5 border border-line bg-white hover:bg-slate-50 text-ink font-bold rounded-xl transition text-xs"
                >
                  {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4-STEP BOOKING FLOW MODAL / SCREEN                             */}
          {/* ============================================================== */}
          {isBookingOpen && activeSubScreen === 'NONE' && (
            <div className="space-y-4 animate-fade-in font-body text-xs">
              {/* Header with Back button and progress */}
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <button
                  onClick={() => {
                    if (bookingStep > 1) {
                      setBookingStep(bookingStep - 1);
                    } else {
                      setIsBookingOpen(false);
                    }
                  }}
                  className="flex items-center gap-1 text-slate hover:text-ink font-bold"
                >
                  <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                  <span>{bookingStep === 1 ? (isArabic ? 'إلغاء' : 'Cancel') : (isArabic ? 'السابق' : 'Back')}</span>
                </button>

                <div className="text-center">
                  <span className="font-extrabold text-sm text-ink font-display block">
                    {bookingStep === 1 && (isArabic ? '١. اختر الخدمة' : '1. Choose Service')}
                    {bookingStep === 2 && (isArabic ? '٢. حدد نوع العمل' : '2. Choose Task')}
                    {bookingStep === 3 && (isArabic ? '٣. تفاصيل الحجز' : '3. Schedule & Details')}
                    {bookingStep === 4 && (isArabic ? '٤. مراجعة وتأكيد' : '4. Review & Confirm')}
                  </span>
                  <span className="text-[10px] text-slate">
                    {isArabic ? `الخطوة ${bookingStep} من ٤` : `Step ${bookingStep} of 4`}
                  </span>
                </div>

                <button
                  onClick={() => setIsBookingOpen(false)}
                  className="p-1 rounded-lg text-slate hover:text-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress 4-Bar */}
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all ${
                      step <= bookingStep ? 'bg-signal-orange' : 'bg-line'
                    }`}
                  />
                ))}
              </div>

              {/* -------------------------------------------------------- */}
              {/* STEP 1: Choose Service (6 Big Tiles)                     */}
              {/* -------------------------------------------------------- */}
              {bookingStep === 1 && (
                <div className="space-y-3.5">
                  <p className="text-slate text-xs">
                    {isArabic ? 'اختر الخدمة المطلوبة للمعاينة أو الصيانة الفورية:' : 'Select a maintenance or engineering service:'}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {SERVICE_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            handleSelectCategory(cat.id);
                            if (cat.id !== 'MATERIALS') {
                              setBookingStep(2);
                            }
                          }}
                          className={`p-4 rounded-2xl border text-start flex flex-col justify-between h-36 transition active:scale-[0.98] ${
                            isSelected
                              ? 'bg-signal-orange/5 border-signal-orange ring-2 ring-signal-orange shadow-sm'
                              : 'bg-white border-line hover:border-signal-orange/60 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-3xl">{cat.icon}</span>
                            <span className="text-[10px] font-bold text-signal-orange bg-orange-50 px-2 py-0.5 rounded">
                              {isArabic ? cat.priceDisplayAr : cat.priceDisplayEn}
                            </span>
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-ink font-display">
                              {isArabic ? cat.titleAr : cat.titleEn}
                            </div>
                            <div className="text-[10px] text-slate line-clamp-2 mt-0.5">
                              {isArabic ? cat.descriptionAr : cat.descriptionEn}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 2: Choose Job / Task (Filtered by Service Only)      */}
              {/* -------------------------------------------------------- */}
              {bookingStep === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-ink text-sm font-display">
                        {isArabic ? `مهام ${selectedCategory}` : `Select Specific Task — ${selectedCategory}`}
                      </h4>
                      <p className="text-slate text-[11px]">
                        {isArabic
                          ? 'اختر المهمة المحددة التي يحتاجها موقعك:'
                          : 'Select the specific job needed at your premises:'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-signal-orange bg-orange-50 px-2 py-1 rounded-lg">
                      {getTasksByCategory(selectedCategory).length} {isArabic ? 'خيارات' : 'tasks'}
                    </span>
                  </div>

                  {/* Search input filtering within this service only */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      placeholder={isArabic ? 'بحث في هذه الخدمة...' : `Search in ${selectedCategory}...`}
                      className="w-full ps-9 pe-4 py-2.5 bg-ground border border-line rounded-xl text-xs text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-signal-orange"
                    />
                  </div>

                  {/* Task Tiles */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                    {getTasksByCategory(selectedCategory)
                      .filter((t) => {
                        if (!taskSearch.trim()) return true;
                        const q = taskSearch.toLowerCase();
                        return (
                          t.titleEn.toLowerCase().includes(q) ||
                          t.titleAr.toLowerCase().includes(q) ||
                          t.descriptionEn.toLowerCase().includes(q)
                        );
                      })
                      .map((task) => {
                        const isSelected = selectedTask?.id === task.id;
                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 min-h-[56px] ${
                              isSelected
                                ? 'bg-signal-orange/5 border-signal-orange ring-1 ring-signal-orange shadow-xs'
                                : 'bg-white border-line hover:border-slate-300'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-extrabold text-xs text-ink font-display flex items-center gap-1.5">
                                <span>{isArabic ? task.titleAr : task.titleEn}</span>
                              </div>
                              <p className="text-[10px] text-slate line-clamp-1 mt-0.5">
                                {isArabic ? task.descriptionAr : task.descriptionEn}
                              </p>
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                                <span>⏱️ {task.durationMinutes} min</span>
                                <span>• Skill: {task.requiredSkill}</span>
                              </div>
                            </div>

                            <div className="text-end shrink-0">
                              <span className="font-bold text-xs text-navy font-display block">
                                {task.pricingType === 'QUOTE'
                                  ? (isArabic ? 'عرض سعر' : 'Quote')
                                  : `from AED ${task.startingPriceAed}`}
                              </span>
                              <div className="w-5 h-5 rounded-full border border-line flex items-center justify-center ms-auto mt-1">
                                {isSelected && <div className="w-3 h-3 rounded-full bg-signal-orange" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setBookingStep(3)}
                      className="w-full py-3 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <span>{isArabic ? 'متابعة إلى التفاصيل ←' : 'Continue to Details →'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 3: Details (Address, Date/Time, Specific Inputs)    */}
              {/* -------------------------------------------------------- */}
              {bookingStep === 3 && (
                <div className="space-y-3.5">
                  {/* Service & Task Summary Capsule */}
                  <div className="p-3 bg-ground rounded-xl border border-line flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate block">{selectedCategory}</span>
                      <span className="font-bold text-ink text-xs">{selectedTask?.titleEn}</span>
                    </div>
                    <span className="font-bold text-signal-orange">
                      {selectedTask?.pricingType === 'QUOTE' ? 'Quote' : `from AED ${selectedTask?.startingPriceAed}`}
                    </span>
                  </div>

                  {/* Labour Supply Inputs (Workers x Days) */}
                  {selectedCategory === 'LABOUR' && (
                    <div className="p-3.5 bg-white border border-line rounded-2xl space-y-3 shadow-xs">
                      <div className="font-bold text-ink">{isArabic ? 'حجم العمالة المطلوبة' : 'Labour Quantity'}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate block mb-1">
                            {isArabic ? 'عدد العمال' : 'Number of Workers'}
                          </label>
                          <div className="flex items-center gap-2 border rounded-xl p-1 bg-ground">
                            <button
                              onClick={() => setWorkersCount(Math.max(1, workersCount - 1))}
                              className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-ink font-bold"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-bold text-sm">{workersCount}</span>
                            <button
                              onClick={() => setWorkersCount(workersCount + 1)}
                              className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-ink font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate block mb-1">
                            {isArabic ? 'عدد الأيام' : 'Number of Days'}
                          </label>
                          <div className="flex items-center gap-2 border rounded-xl p-1 bg-ground">
                            <button
                              onClick={() => setDaysCount(Math.max(1, daysCount - 1))}
                              className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-ink font-bold"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-bold text-sm">{daysCount}</span>
                            <button
                              onClick={() => setDaysCount(daysCount + 1)}
                              className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-ink font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Total work scope: <span className="font-bold text-ink">{workersCount * daysCount} man-days</span>
                      </div>
                    </div>
                  )}

                  {/* Equipment Rental Inputs (Start / End Date) */}
                  {selectedCategory === 'RENTAL' && (
                    <div className="p-3.5 bg-white border border-line rounded-2xl space-y-3 shadow-xs">
                      <div className="font-bold text-ink">{isArabic ? 'مدة الإيجار' : 'Rental Duration'}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate block mb-1">
                            {isArabic ? 'تاريخ البدء' : 'Start Date'}
                          </label>
                          <input
                            type="date"
                            value={rentalStartDate}
                            onChange={(e) => setRentalStartDate(e.target.value)}
                            className="w-full p-2 bg-ground border rounded-xl font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate block mb-1">
                            {isArabic ? 'تاريخ الإرجاع' : 'End Date'}
                          </label>
                          <input
                            type="date"
                            value={rentalEndDate}
                            onChange={(e) => setRentalEndDate(e.target.value)}
                            className="w-full p-2 bg-ground border rounded-xl font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service Location */}
                  <div>
                    <label className="font-bold text-ink block mb-1">
                      {isArabic ? 'موقع تقديم الخدمة' : 'Service Address'}
                    </label>
                    <div className="h-36 rounded-xl overflow-hidden border border-line relative shadow-xs">
                      <LeafletMap
                        center={bookingCoords}
                        zoom={13}
                        markers={[
                          { id: 'pin', lat: bookingCoords[0], lng: bookingCoords[1], title: 'Selected Location', type: 'customer' },
                        ]}
                        className="w-full h-full"
                      />
                      <div className="absolute bottom-2 start-2 end-2 bg-white/95 backdrop-blur-xs p-2 rounded-lg text-xs font-bold text-ink shadow-sm flex items-center gap-1.5 border border-line">
                        <MapPin className="w-3.5 h-3.5 text-signal-orange shrink-0" />
                        <span className="truncate">{bookingAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Slot (Future Slots, UAE Time) */}
                  <div>
                    <label className="font-bold text-ink block mb-1">
                      {isArabic ? 'موعد الزيارة' : 'Preferred arrival window (Asia/Dubai)'}
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'Immediate Emergency Callout (within 45m)', labelEn: 'Immediate Emergency (within 45 min)', badge: 'Fastest' },
                        { id: 'Today (02:00 PM - 04:00 PM)', labelEn: 'Today (02:00 PM – 04:00 PM)', badge: 'Available' },
                        { id: 'Tomorrow (10:00 AM - 12:00 PM)', labelEn: 'Tomorrow (10:00 AM – 12:00 PM)', badge: 'Scheduled' },
                      ].map((slot) => {
                        const isSelected = bookingTimeSlot === slot.id;
                        return (
                          <div
                            key={slot.id}
                            onClick={() => setBookingTimeSlot(slot.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                              isSelected
                                ? 'bg-signal-orange/5 border-signal-orange ring-1 ring-signal-orange'
                                : 'bg-white border-line hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-signal-orange' : 'text-slate'}`} />
                              <span className="font-bold text-ink text-xs">{slot.labelEn}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-ground text-slate">
                              {slot.badge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Short description & Photo upload toggle */}
                  <div>
                    <label className="font-bold text-ink block mb-1">
                      {isArabic ? 'وصف المشكلة (اختياري)' : 'Fault details & notes (optional)'}
                    </label>
                    <textarea
                      value={bookingDescription}
                      onChange={(e) => setBookingDescription(e.target.value)}
                      rows={2}
                      placeholder={isArabic ? 'اكتب ملاحظاتك هنا...' : 'e.g. AC makes clicking noise and stops blowing cold air'}
                      className="w-full p-2.5 bg-ground border border-line rounded-xl text-xs text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-signal-orange"
                    />
                  </div>

                  <div>
                    <button
                      onClick={() => setBookingPhotoAttached(!bookingPhotoAttached)}
                      className={`w-full p-3 rounded-xl border border-dashed flex items-center justify-center gap-2 transition ${
                        bookingPhotoAttached
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-ground border-line text-slate hover:bg-slate-100'
                      }`}
                    >
                      <Camera className="w-4 h-4 text-signal-orange" />
                      <span className="font-bold text-xs">
                        {bookingPhotoAttached
                          ? (isArabic ? 'تم إرفاق صورة العطل بنجاح' : '1 photo attached (Unit model plate)')
                          : (isArabic ? 'إرفاق صورة للمشكلة' : 'Attach photo proof (optional)')}
                      </span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setBookingStep(4)}
                      className="w-full py-3 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <span>{isArabic ? 'مراجعة التكلفة والتأكيد ←' : 'Review & Confirm →'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* STEP 4: Review & Confirm (Pricing Engine & Submit)       */}
              {/* -------------------------------------------------------- */}
              {bookingStep === 4 && (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <div className="bg-white rounded-2xl border border-line p-4 space-y-3 shadow-xs">
                    <div className="border-b border-line pb-2 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-signal-orange block">
                          {selectedCategory}
                        </span>
                        <h4 className="font-extrabold text-sm text-ink">{selectedTask?.titleEn}</h4>
                        <p className="text-[11px] text-slate">{selectedTask?.descriptionEn}</p>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{bookingAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{bookingDate} · {bookingTimeSlot}</span>
                      </div>
                      {selectedCategory === 'LABOUR' && (
                        <div className="flex items-center gap-1.5 text-ink font-bold">
                          <Users className="w-3.5 h-3.5 text-signal-orange shrink-0" />
                          <span>{workersCount} workers for {daysCount} days ({workersCount * daysCount} man-days)</span>
                        </div>
                      )}
                      {selectedCategory === 'RENTAL' && (
                        <div className="flex items-center gap-1.5 text-ink font-bold">
                          <Calendar className="w-3.5 h-3.5 text-signal-orange shrink-0" />
                          <span>Rental: {rentalStartDate} to {rentalEndDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Pricing breakdown */}
                    <div className="pt-2 border-t border-line space-y-1.5">
                      {isQuoteOnly ? (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950">
                          <div className="font-bold flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-signal-orange" />
                            <span>{isArabic ? 'طلب عرض سعر رسمي' : 'Quote Requested'}</span>
                          </div>
                          <p className="text-[11px] text-orange-800 mt-1">
                            Our operations coordinator will calculate exact manpower / logistics rates and send a digital quotation for your approval.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between text-xs text-slate">
                            <span>Base Service Fee</span>
                            <span className="font-bold text-ink">AED {basePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate">
                            <span>UAE VAT (5%)</span>
                            <span className="font-bold text-ink">AED {vatAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-extrabold text-ink font-display pt-1 border-t border-line">
                            <span>Total Estimated</span>
                            <span className="text-signal-orange">AED {totalAmount.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Safety & Guarantee Policy */}
                  <div className="p-3 bg-ground rounded-xl border border-line text-[11px] text-slate space-y-1">
                    <div className="font-bold text-ink flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isArabic ? 'ضمان فيكس آن جو المعتمد' : 'FIXnGO Certified Guarantee'}</span>
                    </div>
                    <p>
                      {isArabic
                        ? 'فنيون مرخصون، قطع غيار أصلية، ولا توجد أي رسوم مخفية دون موافقتك المسبقة.'
                        : 'Certified UAE technicians, genuine parts, and zero surprise fees without prior sign-off.'}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isSubmittingBooking}
                      className="w-full py-3.5 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isSubmittingBooking ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{isArabic ? 'جاري تأكيد الحجز...' : 'Confirming Booking...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {isQuoteOnly
                              ? (isArabic ? 'إرسال طلب عرض السعر' : 'Request Official Quote')
                              : (isArabic ? 'تأكيد الحجز وإرسال الفني' : 'Confirm Booking & Dispatch')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: HOME DASHBOARD                                          */}
          {/* ============================================================== */}
          {!isBookingOpen && activeSubScreen === 'NONE' && activeTab === 'HOME' && (
            <div className="space-y-4 animate-fade-in font-body">
              {/* Greeting */}
              <div>
                <span className="text-[11px] font-bold text-signal-orange block tracking-wider uppercase font-display">
                  {isArabic ? 'بوابة العميل' : 'Customer Portal'}
                </span>
                <h2 className="text-2xl font-extrabold text-ink font-display tracking-tight leading-tight">
                  {isArabic ? (
                    <>مرحباً بك،<br />ما الخدمة التي تحتاجها اليوم؟</>
                  ) : (
                    <>
                      Hi {user?.fullName?.split(' ')[0] || 'there'},<br />
                      what needs fixing today?
                    </>
                  )}
                </h2>
              </div>

              {/* Quick Search */}
              <div
                onClick={() => {
                  setIsBookingOpen(true);
                  setBookingStep(1);
                }}
                className="relative cursor-pointer"
              >
                <input
                  type="text"
                  readOnly
                  placeholder={isArabic ? 'ابحث عن خدمة تكييف أو سباكة أو كهرباء...' : 'Try "AC not cooling", "leaking tap", or "power trip"'}
                  className="w-full ps-11 pe-4 py-3 bg-white rounded-2xl border border-line text-sm text-ink placeholder:text-slate/70 cursor-pointer shadow-xs"
                />
                <div className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="w-4 h-4 text-slate" />
                </div>
              </div>

              {/* Active Hero Job Card (If Active) */}
              {activeJob && (
                <div
                  onClick={() => setActiveSubScreen('TRACKING')}
                  className="p-4 bg-white rounded-2xl border border-line shadow-sm hover:border-ocean-blue/60 transition cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-ocean-blue flex items-center gap-1.5 uppercase tracking-wider font-display">
                      <span className="w-2 h-2 rounded-full bg-ocean-blue animate-pulse" />
                      <span>{isArabic ? 'طلب نشط' : 'LIVE JOB'}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate">
                      {activeJob.orderNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-ocean-blue/15 text-ocean-blue flex items-center justify-center font-display font-extrabold text-sm shrink-0">
                      {activeJob.technician?.name
                        ? activeJob.technician.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                        : 'RN'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-ink truncate font-display">
                        {activeJob.title}
                      </h4>
                      <p className="text-xs text-slate truncate">
                        {activeJob.technician?.name || 'Technician'} · arrives in {activeJob.etaMinutes ?? 12} min
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate shrink-0 ${isArabic ? 'rotate-180' : ''}`} />
                  </div>

                  {/* 4-Segment Progress Bar */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <div className="h-1.5 rounded-full bg-ocean-blue" />
                    <div className="h-1.5 rounded-full bg-ocean-blue" />
                    <div className="h-1.5 rounded-full bg-ocean-blue animate-pulse" />
                    <div className="h-1.5 rounded-full bg-line" />
                  </div>
                </div>
              )}

              {/* Quotation Review Card (If Pending) */}
              {quotation && quotation.status === 'PENDING' && (
                <div className="p-3.5 bg-ground border border-line rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-navy bg-navy/10 px-1.5 py-0.5 rounded">
                      {quotation.quoteNumber}
                    </span>
                    <span className="font-bold text-navy font-display">
                      {(quotation.amountAed ?? 0).toLocaleString()} AED
                    </span>
                  </div>
                  <h4 className="font-bold text-ink text-xs font-display">{quotation.title}</h4>
                  <p className="text-slate text-[11px]">{quotation.scope}</p>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleQuoteAction('APPROVE')}
                      disabled={quoteUpdating}
                      className="flex-1 py-2 bg-navy text-white rounded-xl font-bold hover:bg-slate-800 transition min-h-[44px] disabled:opacity-50"
                    >
                      {quoteUpdating ? 'Updating...' : (isArabic ? 'موافقة وترحيل' : 'Approve & Dispatch')}
                    </button>
                    <button
                      onClick={() => handleQuoteAction('REJECT')}
                      disabled={quoteUpdating}
                      className="px-3 py-2 border border-line text-slate rounded-xl hover:bg-ground min-h-[44px] disabled:opacity-50"
                    >
                      {isArabic ? 'رفض' : 'Decline'}
                    </button>
                  </div>
                </div>
              )}

              {/* Our Services 2-Column Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-ink text-base font-display">
                    {isArabic ? 'خدماتنا' : 'Our services'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsBookingOpen(true);
                      setBookingStep(1);
                    }}
                    className="text-xs font-bold text-ocean-blue hover:underline"
                  >
                    {isArabic ? 'عرض الكل' : 'Book service'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        handleSelectCategory(cat.id);
                        if (cat.id !== 'MATERIALS') {
                          setIsBookingOpen(true);
                          setBookingStep(2);
                        }
                      }}
                      className="p-4 bg-white rounded-2xl border border-line hover:border-signal-orange/50 hover:shadow-xs transition text-start flex flex-col justify-between h-32 active:scale-[0.98]"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-2xl">
                        {cat.icon}
                      </div>
                      <div>
                        <div className="font-bold text-ink text-sm font-display">
                          {isArabic ? cat.titleAr : cat.titleEn}
                        </div>
                        <div className="text-[11px] text-slate line-clamp-1">
                          {isArabic ? cat.priceDisplayAr : cat.priceDisplayEn}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: SHOP (Materials Catalog & Spare Parts)                  */}
          {/* ============================================================== */}
          {!isBookingOpen && activeSubScreen === 'NONE' && activeTab === 'SHOP' && (
            <div className="space-y-4 animate-fade-in font-body text-xs">
              <div>
                <h3 className="text-base font-extrabold text-ink font-display">
                  {isArabic ? 'متجر المواد وقطع الغيار' : 'Materials & Spare Parts'}
                </h3>
                <p className="text-slate text-[11px]">
                  {isArabic ? 'قطع غيار أصلية معتمدة مع توصيل للموقع في دبي' : 'Genuine parts with fast site delivery across Dubai'}
                </p>
              </div>

              {/* Shopping Cart Summary Bar */}
              <div className="p-3 bg-ground rounded-2xl border border-line flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink block">{shopCart.length} items in cart</span>
                  <span className="text-[11px] text-slate">
                    Total: AED {shopCart.reduce((acc, it) => acc + it.priceAed * it.qty, 0)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    alert('Order dispatched for same-day delivery from Al Quoz central depot!');
                    setShopCart([]);
                  }}
                  className="px-3.5 py-2 bg-signal-orange hover:bg-signal-orange-hover text-white rounded-xl font-bold text-xs shadow-xs transition min-h-[44px]"
                >
                  Checkout
                </button>
              </div>

              {/* Materials Catalog Items */}
              <div className="space-y-2">
                {[
                  { id: '1', name: 'R410A Refrigerant 11.3 kg Cylinder', priceAed: 380, stock: '48 in stock' },
                  { id: '2', name: 'Dual Run Capacitor 45/5 µF 440V', priceAed: 75, stock: '120 in stock' },
                  { id: '3', name: 'Schneider 32A Double Pole Isolator', priceAed: 65, stock: '85 in stock' },
                  { id: '4', name: 'PPR Pipe 32mm PN20 (4m length)', priceAed: 28, stock: '200 in stock' },
                  { id: '5', name: 'Single Core Copper Wire 2.5mm² (100m)', priceAed: 145, stock: '60 rolls' },
                ].map((item) => (
                  <div key={item.id} className="p-3 bg-white border border-line rounded-xl flex items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="font-bold text-ink text-xs">{item.name}</div>
                      <div className="text-[10px] text-slate">{item.stock} · Al Quoz Hub</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink text-xs">AED {item.priceAed}</span>
                      <button
                        onClick={() => {
                          setShopCart((prev) => [...prev, { id: item.id, name: item.name, priceAed: item.priceAed, qty: 1 }]);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-ground border border-line text-xs font-bold text-ink hover:bg-slate-100 min-h-[44px]"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Bottom Tab Bar */}
        <CustomerMobileNav
          locale={locale}
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveSubScreen('NONE');
            setIsBookingOpen(false);
            setActiveTab(tab);
            if (tab === 'HOME') router.push(`/${locale}/app`);
            if (tab === 'BOOKINGS') router.push(`/${locale}/app/bookings`);
            if (tab === 'SHOP') router.push(`/${locale}/app/shop`);
            if (tab === 'ACCOUNT') router.push(`/${locale}/app/account`);
          }}
          activeOrderCount={activeJob ? 1 : 0}
        />
      </div>
    </div>
  );
}
