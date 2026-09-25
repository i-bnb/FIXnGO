'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LeafletMap, MapMarker } from '../../../components/map/LeafletMap';
import { CustomerHeader } from '../../../components/customer/CustomerHeader';
import { CustomerMobileNav, CustomerTab } from '../../../components/customer/CustomerMobileNav';
import {
  UAE_CONSTANTS,
  SERVICE_PACKAGES,
  ServiceType,
  JobStatus,
  calculateUaeVat,
} from '@fieldops/shared';
import confetti from 'canvas-confetti';
import {
  AirVent,
  Wrench,
  Zap,
  HardHat,
  Tractor,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Phone,
  Star,
  Receipt,
  Sparkles,
  AlertTriangle,
  Truck,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Check,
  X,
  QrCode,
  Download,
  Share2,
  Send,
  MessageSquare,
  Building2,
  Users,
  Lock,
} from 'lucide-react';

interface CustomerUser {
  fullName: string;
  phone: string;
  email: string;
}

interface ActiveJob {
  id: string;
  orderNumber: string;
  title: string;
  serviceType: string;
  status: JobStatus;
  scheduledTime: string;
  address: string;
  area: string;
  coordinates: [number, number];
  technician: {
    name: string;
    phone: string;
    vanCode: string;
    rating: number;
    completedJobs: number;
  };
  techLocation: [number, number];
  etaMinutes: number;
  subtotalAed: number;
  vatAed: number;
  totalAmountAed: number;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  partsFitted: { name: string; qty: number; priceAed: number }[];
  isPaid: boolean;
  csatRating?: number;
}

export default function CustomerMobileAppPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deniedToast, setDeniedToast] = useState(false);
  const [quoteToast, setQuoteToast] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('denied') === 'true') {
      setDeniedToast(true);
      const timer = setTimeout(() => setDeniedToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<CustomerTab>('HOME');
  const [currentLocation, setCurrentLocation] = useState('Downtown Dubai, Burj Crown');

  // Authentication State
  const [user, setUser] = useState<CustomerUser | null>({
    fullName: 'Eng. Tariq Al-Hashimi',
    phone: '+971 50 000 0101',
    email: 'facilities@palmcrest.example',
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [otpPhone, setOtpPhone] = useState('+971 50 123 4567');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Active Job State (The Hero Job)
  const [activeJob, setActiveJob] = useState<ActiveJob>({
    id: 'wo-demo-01',
    orderNumber: 'WO-2026-0042',
    title: 'AC Chiller Compressor Deep Diagnostic & Repair',
    serviceType: 'HVAC',
    status: JobStatus.EN_ROUTE,
    scheduledTime: 'Today, Immediate Callout',
    address: 'Burj Crown Residences, Apt 1402',
    area: 'Downtown Dubai',
    coordinates: [25.1972, 55.2744],
    technician: {
      name: 'Rashid Al-Nuaimi',
      phone: '+971 52 110 0001',
      vanCode: 'Van-01 (Toyota HiAce)',
      rating: 4.95,
      completedJobs: 142,
    },
    techLocation: [25.1856, 55.2708], // Business Bay (approaching Downtown)
    etaMinutes: 8,
    subtotalAed: 365.0,
    vatAed: 18.25,
    totalAmountAed: 383.25,
    beforePhotoUrl: '/placeholders/hvac-before.svg',
    afterPhotoUrl: '/placeholders/hvac-after.svg',
    partsFitted: [
      { name: 'Dual Run Capacitor 45/5 uF 440V', qty: 1, priceAed: 75.0 },
      { name: 'R410A Refrigerant Top-up (kg)', qty: 1.5, priceAed: 95.0 },
    ],
    isPaid: false,
  });

  // Booking Flow State
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [bookingSubTab, setBookingSubTab] = useState<'NEW' | 'HISTORY'>('NEW');
  const [bookingCategory, setBookingCategory] = useState<'HVAC' | 'PLUMBING' | 'ELECTRICAL' | 'LABOUR' | 'RENTAL' | 'SHOP'>('HVAC');
  const [bookingPackage, setBookingPackage] = useState(SERVICE_PACKAGES[0]);
  const [bookingDescription, setBookingDescription] = useState('AC not cooling properly, blowing warm air');
  const [bookingPhotoUploaded, setBookingPhotoUploaded] = useState(false);
  const [bookingTimeSlot, setBookingTimeSlot] = useState('Immediate Emergency Callout (within 45m)');
  const [bookingCoords, setBookingCoords] = useState<[number, number]>([25.1972, 55.2744]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Active View Mode (Sub-screens)
  const [activeSubScreen, setActiveSubScreen] = useState<'NONE' | 'TRACKING' | 'DETAIL' | 'CHECKOUT' | 'RECEIPT' | 'RENTAL' | 'SHOP' | 'QUOTE_REQ' | 'COMPLAINT'>('NONE');

  // Material Shop State
  const [shopCart, setShopCart] = useState<{ id: string; name: string; priceAed: number; qty: number }[]>([
    { id: '1', name: 'R410A Refrigerant 11.3 kg Cylinder', priceAed: 380, qty: 1 },
    { id: '2', name: 'Dual Capacitor 45/5 uF', priceAed: 75, qty: 2 },
  ]);

  // Quotation In-App Review State
  const [quotation, setQuotation] = useState<{
    quoteNumber: string;
    title: string;
    amountAed: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    scope: string;
  }>({
    quoteNumber: 'QT-2026-0081',
    title: 'Complete Villa Chiller Overhaul & Coil Replacement',
    amountAed: 4850.0,
    status: 'PENDING',
    scope: 'Supply & installation of 2x Carrier scroll compressors, dual filter driers, nitrogen leak test, and full R410A recharge.',
  });

  // CSAT Rating Modal State
  const [csatRating, setCsatRating] = useState(5);
  const [csatFeedback, setCsatFeedback] = useState('Excellent technician! Super fast fix in Dubai heat.');
  const [csatSubmitted, setCsatSubmitted] = useState(false);

  // Simulated technician moving closer when in TRACKING view or when job is EN_ROUTE
  useEffect(() => {
    if (activeJob.status !== JobStatus.EN_ROUTE) return;

    const interval = setInterval(() => {
      setActiveJob((prev) => {
        const destLat = prev.coordinates[0];
        const destLng = prev.coordinates[1];
        const curLat = prev.techLocation[0];
        const curLng = prev.techLocation[1];

        // Step 8% closer
        const newLat = curLat + (destLat - curLat) * 0.08;
        const newLng = curLng + (destLng - curLng) * 0.08;
        const newEta = Math.max(1, prev.etaMinutes - 1);

        return {
          ...prev,
          techLocation: [newLat, newLng],
          etaMinutes: newEta,
        };
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [activeJob.status]);

  // Map Markers for Live Tracking
  const trackingMarkers: MapMarker[] = [
    {
      id: 'customer-site',
      lat: activeJob.coordinates[0],
      lng: activeJob.coordinates[1],
      title: 'Your Site',
      subtitle: activeJob.address,
      type: 'customer',
      status: 'EMERGENCY',
    },
    {
      id: 'tech-van',
      lat: activeJob.techLocation[0],
      lng: activeJob.techLocation[1],
      title: `${activeJob.technician.name} (${activeJob.technician.vanCode})`,
      subtitle: `En Route • ETA ${activeJob.etaMinutes} mins`,
      type: 'tech',
      status: activeJob.status,
    },
  ];

  // Quick symptom chips for booking
  const symptomChips = [
    'AC Blowing Warm Air',
    'Thermostat Error E4',
    'Kitchen Pipe Water Leak',
    'Main DB Breaker Tripped',
    'Low Water Pressure',
    'Drainage Clogged',
  ];

  // Actions
  const handleQuickBook = () => {
    setActiveJob((prev) => ({
      ...prev,
      title: `${bookingCategory}: ${bookingPackage?.titleEn || 'On-Demand Service'}`,
      serviceType: bookingCategory,
      status: JobStatus.EN_ROUTE,
      etaMinutes: 8,
      isPaid: false,
    }));
    setBookingConfirmed(true);
    setActiveSubScreen('TRACKING');
  };

  const handleSimulatePayment = () => {
    setActiveJob((prev) => ({ ...prev, isPaid: true, status: JobStatus.COMPLETED }));
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setActiveSubScreen('RECEIPT');
  };

  const handleAdvanceStatus = () => {
    if (activeJob.status === JobStatus.EN_ROUTE) {
      setActiveJob((prev) => ({ ...prev, status: JobStatus.IN_PROGRESS, etaMinutes: 0 }));
    } else if (activeJob.status === JobStatus.IN_PROGRESS) {
      setActiveJob((prev) => ({ ...prev, status: JobStatus.COMPLETED }));
      setActiveSubScreen('CHECKOUT');
    }
  };

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
          onOpenAuth={() => setShowAuthModal(true)}
        />

        {/* Access Denied / Role Restriction Toast Banner */}
        {deniedToast && (
          <div className="mx-4 mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{isArabic ? 'ليس لديك صلاحية الوصول إلى تلك الصفحة' : "You don't have access to that page"}</span>
            </div>
            <button onClick={() => setDeniedToast(false)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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

        {/* MAIN BODY CONTENT BASED ON TABS OR ACTIVE SUB-SCREEN */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ============================================================== */}
          {/* 1. SUB-SCREEN: LIVE TRACKING (Page 5 of Design Specification)   */}
          {/* ============================================================== */}
          {activeSubScreen === 'TRACKING' && (
            <div className="space-y-4 animate-fade-in font-body">
              {/* Back Bar with Arriving in 12 min badge */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveSubScreen('NONE')}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-ground border border-line text-xs font-bold text-ink hover:bg-slate-100 transition min-h-[44px]"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>{isArabic ? 'الرئيسية' : 'Home'}</span>
                </button>

                <div className="bg-navy text-white px-3.5 py-1.5 rounded-xl text-xs font-display font-extrabold flex items-center gap-1.5 shadow-sm">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider">{isArabic ? 'الوصول خلال' : 'ARRIVING IN'}</span>
                  <span className="text-signal-orange">{activeJob.etaMinutes} min</span>
                </div>
              </div>

              {/* Map Container */}
              <div className="h-72 rounded-2xl overflow-hidden border border-line relative shadow-sm">
                <LeafletMap
                  center={activeJob.coordinates}
                  zoom={14}
                  markers={trackingMarkers}
                  className="w-full h-full"
                />
              </div>

              {/* Technician Profile Card (Page 5) */}
              <div className="p-4 bg-white rounded-2xl border border-line space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-ocean-blue/15 text-ocean-blue font-display font-extrabold text-base flex items-center justify-center shrink-0">
                      RK
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-ink font-display">{activeJob.technician.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-ink">{activeJob.technician.rating}</span>
                        <span>· AC specialist · Van DXB-12</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert('Opening live chat with technician Rashid Khan...')}
                      className="p-2.5 rounded-xl border border-line text-ink hover:bg-ground transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Chat"
                    >
                      <MessageSquare className="w-4 h-4 text-slate" />
                    </button>
                    <a
                      href={`tel:${activeJob.technician.phone}`}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Helper Alert Banner (Page 5) */}
                <div className="p-3 rounded-xl bg-ground border border-line flex items-start gap-2.5 text-xs text-slate">
                  <Users className="w-4 h-4 text-navy shrink-0 mt-0.5" />
                  <span>
                    {isArabic
                      ? 'المساعد عمران س. برفقة راشد. يرجى مشاركة رمز البوابة أو تفاصيل الموقف في المحادثة.'
                      : 'Helper Imran S. is with Rashid. Share gate code or parking details in chat.'}
                  </span>
                </div>

                {/* Status Timeline (Page 5) */}
                <div className="space-y-3 pt-2 border-t border-line text-xs">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-ink">{isArabic ? 'تم الحجز' : 'Booked'}</div>
                      <div className="text-[11px] text-slate">Today 1:05 PM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-ink">{isArabic ? 'تم تعيين الفني' : 'Technician assigned'}</div>
                      <div className="text-[11px] text-slate">Rashid K. · 1:09 PM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-ocean-blue flex items-center justify-center shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <div className="font-bold text-ocean-blue">{isArabic ? 'في الطريق' : 'On the way'}</div>
                      <div className="text-[11px] text-slate">Left Al Quoz · 1:22 PM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-60">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate">{isArabic ? 'وصل للموقع' : 'Arrived'}</div>
                      <div className="text-[11px] text-slate">ETA 1:41 PM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-60">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate">{isArabic ? 'اكتمل العمل' : 'Job completed'}</div>
                      <div className="text-[11px] text-slate">{isArabic ? 'الصور والفاتورة سترسل هنا' : 'Photos & invoice sent here'}</div>
                    </div>
                  </div>
                </div>

                {/* Simulation Control */}
                <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                  <button
                    onClick={handleAdvanceStatus}
                    className="text-xs font-bold text-ocean-blue hover:underline bg-ocean-blue/10 px-3 py-1.5 rounded-lg"
                  >
                    {activeJob.status === JobStatus.EN_ROUTE ? 'Simulate Arrived' : 'Simulate Completed & Pay'}
                  </button>

                  <button
                    onClick={() => setActiveSubScreen('CHECKOUT')}
                    className="text-xs font-bold text-signal-orange hover:underline bg-signal-orange/10 px-3 py-1.5 rounded-lg"
                  >
                    View Invoice →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. SUB-SCREEN: TAX INVOICE & PAYMENT (Page 6 of Design Spec)   */}
          {/* ============================================================== */}
          {activeSubScreen === 'CHECKOUT' && (
            <div className="space-y-4 animate-fade-in font-body text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <button
                  onClick={() => setActiveSubScreen('NONE')}
                  className="flex items-center gap-1 font-bold text-ink hover:text-signal-orange min-h-[44px]"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>{isArabic ? 'رجوع' : 'Back'}</span>
                </button>
                <div className="text-end">
                  <h3 className="font-display font-extrabold text-sm text-ink">Tax invoice INV-10482</h3>
                  <div className="text-[11px] text-slate">WO-24817 · AC not cooling</div>
                </div>
              </div>

              {/* Before & After Photo Proof (Page 6) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="h-28 rounded-xl bg-ground border border-line flex flex-col items-center justify-center text-slate text-xs overflow-hidden">
                    <img src={activeJob.beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-signal-orange block tracking-wider uppercase font-display">
                    BEFORE
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-28 rounded-xl bg-ground border border-line flex flex-col items-center justify-center text-slate text-xs overflow-hidden">
                    <img src={activeJob.afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 block tracking-wider uppercase font-display">
                    AFTER
                  </span>
                </div>
              </div>

              {/* Itemized Invoice Table (Page 6) */}
              <div className="bg-white rounded-2xl border border-line p-4 space-y-2.5">
                <div className="flex justify-between py-1 border-b border-line/60">
                  <div>
                    <div className="font-bold text-ink">Call-out & diagnosis</div>
                    <div className="text-[11px] text-slate">1 visit</div>
                  </div>
                  <div className="font-bold text-ink">99.00</div>
                </div>

                <div className="flex justify-between py-1 border-b border-line/60">
                  <div>
                    <div className="font-bold text-ink">Labour · 2 technicians</div>
                    <div className="text-[11px] text-slate">1.5 h</div>
                  </div>
                  <div className="font-bold text-ink">180.00</div>
                </div>

                <div className="flex justify-between py-1 border-b border-line/60">
                  <div>
                    <div className="font-bold text-ink">Run capacitor 45 µF (fitted)</div>
                    <div className="text-[11px] text-slate">1 pc</div>
                  </div>
                  <div className="font-bold text-ink">65.00</div>
                </div>

                <div className="flex justify-between py-1 border-b border-line/60">
                  <div>
                    <div className="font-bold text-ink">R410A gas top-up</div>
                    <div className="text-[11px] text-slate">0.8 kg</div>
                  </div>
                  <div className="font-bold text-ink">120.00</div>
                </div>

                {/* Subtotals & 5% VAT */}
                <div className="pt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate">
                    <span>Subtotal</span>
                    <span className="font-bold text-ink">AED 464.00</span>
                  </div>
                  <div className="flex justify-between text-slate">
                    <span>VAT 5%</span>
                    <span className="font-bold text-ink">AED 23.20</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-ink pt-1.5 border-t border-line font-display">
                    <span>Total due</span>
                    <span className="text-navy">AED 487.20</span>
                  </div>
                  <div className="text-[10px] text-slate/80 text-start pt-0.5">
                    TRN {UAE_CONSTANTS.COMPANY_TRN} · Issued 23 Sep 2026
                  </div>
                </div>
              </div>

              {/* Payment Methods (Page 6) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-ink block font-display">Pay with</span>

                <div className="space-y-2">
                  <label className="p-3 bg-white rounded-xl border-2 border-signal-orange flex items-center justify-between cursor-pointer min-h-[44px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-4 border-signal-orange bg-white" />
                      <span className="font-bold text-ink">Credit / debit card</span>
                    </div>
                    <span className="text-[10px] text-slate font-medium">Visa · Mastercard</span>
                  </label>

                  <label className="p-3 bg-white rounded-xl border border-line flex items-center justify-between cursor-pointer hover:border-slate-300 min-h-[44px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                      <span className="font-medium text-ink">Apple Pay</span>
                    </div>
                    <span className="text-[10px] text-slate font-medium">Fastest</span>
                  </label>

                  <label className="p-3 bg-white rounded-xl border border-line flex items-center justify-between cursor-pointer hover:border-slate-300 min-h-[44px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                      <span className="font-medium text-ink">Cash to technician</span>
                    </div>
                    <span className="text-[10px] text-slate font-medium">Receipt by SMS</span>
                  </label>
                </div>
              </div>

              {/* Pay AED 487.20 Signal Orange Button */}
              <button
                onClick={handleSimulatePayment}
                className="w-full py-4 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Lock className="w-4 h-4" />
                <span>Pay AED 487.20</span>
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. SUB-SCREEN: TAX RECEIPT & CSAT REVIEW                        */}
          {/* ============================================================== */}
          {activeSubScreen === 'RECEIPT' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Payment Successful!</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Official UAE Tax Receipt generated and sent via WhatsApp
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border text-start space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice Ref:</span>
                    <span className="font-mono font-bold text-slate-900">INV-2026-0042</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Company TRN:</span>
                    <span className="font-mono font-bold text-teal-900">100482910300003</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Settled:</span>
                    <span className="font-black text-slate-900">{activeJob.totalAmountAed.toFixed(2)} AED</span>
                  </div>
                </div>

                <div className="flex items-center justify-center pt-2">
                  <QrCode className="w-16 h-16 text-slate-800" />
                </div>
              </div>

              {/* Rate & Review Card */}
              {!csatSubmitted ? (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2.5">
                  <span className="font-bold text-amber-950 block text-[11px]">
                    How was your experience with Rashid?
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setCsatRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= csatRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={csatFeedback}
                    onChange={(e) => setCsatFeedback(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-800"
                  />
                  <button
                    onClick={() => setCsatSubmitted(true)}
                    className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition"
                  >
                    Submit 5-Star Rating
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold text-center">
                  Thank you! Your feedback has been recorded.
                </div>
              )}

              <button
                onClick={() => {
                  setActiveSubScreen('NONE');
                  setActiveTab('HOME');
                }}
                className="w-full py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Return to Home Screen
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. SUB-SCREEN: HEAVY EQUIPMENT RENTAL CATALOG                  */}
          {/* ============================================================== */}
          {activeSubScreen === 'RENTAL' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveSubScreen('NONE')}
                  className="flex items-center gap-1 font-bold text-teal-800"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back to Services</span>
                </button>
                <span className="font-bold text-slate-500">40 Machines Available</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Caterpillar 100 kVA Generator', daily: 450, deposit: 3000, img: '/placeholders/generator.svg' },
                  { name: 'Haulotte 12m Electric Scissor Lift', daily: 380, deposit: 2500, img: '/placeholders/scissor-lift.svg' },
                  { name: 'Mobile Aluminium Scaffolding 6m', daily: 120, deposit: 1000, img: '/placeholders/scaffolding.svg' },
                ].map((eq, i) => (
                  <div key={i} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-xs">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={eq.img} alt={eq.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-slate-900 text-xs">{eq.name}</h4>
                      <div className="text-[11px] text-teal-800 font-bold mt-0.5">{eq.daily} AED / day</div>
                      <div className="text-[10px] text-slate-400">Security Deposit: {eq.deposit} AED</div>
                      <button
                        onClick={() => alert(`Equipment Booking Request submitted for ${eq.name}! Our rental coordinator will call you.`)}
                        className="mt-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition"
                      >
                        Book Dates
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 6. SUB-SCREEN: MATERIALS & SPARE PARTS SHOP                    */}
          {/* ============================================================== */}
          {activeSubScreen === 'SHOP' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveSubScreen('NONE')}
                  className="flex items-center gap-1 font-bold text-teal-800"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back to Services</span>
                </button>
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {shopCart.length} Cart Items
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border space-y-2">
                <span className="font-bold text-slate-900 block text-[11px]">Shopping Cart</span>
                {shopCart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1 border-b text-[11px]">
                    <div>
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <div className="text-slate-400">{item.priceAed} AED ea</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.qty}x</span>
                      <span className="font-black text-teal-900">{item.priceAed * item.qty} AED</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-1 font-black text-sm text-slate-900">
                  <span>Total Due:</span>
                  <span>{shopCart.reduce((acc, it) => acc + it.priceAed * it.qty, 0)} AED</span>
                </div>
                <button
                  onClick={() => {
                    alert('Order placed for pickup at Al Quoz Central Warehouse!');
                    setActiveSubScreen('NONE');
                  }}
                  className="w-full py-2.5 bg-teal-800 text-white rounded-xl font-bold mt-2 hover:bg-teal-900 transition"
                >
                  Instant Checkout (Al Quoz Store)
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 7. SUB-SCREEN: CUSTOM QUOTATION REQUEST                        */}
          {/* ============================================================== */}
          {activeSubScreen === 'QUOTE_REQ' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveSubScreen('NONE')}
                  className="flex items-center gap-1 font-bold text-teal-800"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Back</span>
                </button>
                <span className="font-bold text-slate-500">Commercial Estimation</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border space-y-3">
                <h3 className="font-black text-slate-900 text-sm">Request Custom Scope Quotation</h3>
                <p className="text-slate-500 text-[11px]">
                  For large-scale construction labour, substation modifications, or AMC tenders.
                </p>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Scope of Work</label>
                  <textarea
                    rows={3}
                    placeholder="Describe tradesmen required, duration, project location..."
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                  <button
                    onClick={() => {
                      alert('Quotation request submitted! An estimation engineer will respond within 4 hours.');
                      setActiveSubScreen('NONE');
                    }}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                  >
                    Submit Quotation Inquiry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 8. TAB 1: HOME FEED (Page 3 of Design Specification)           */}
          {/* ============================================================== */}
          {activeSubScreen === 'NONE' && activeTab === 'HOME' && (
            <div className="space-y-5 animate-fade-in font-body">
              {/* Greeting Headline (Page 3) */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink font-display tracking-tight leading-tight">
                  {isArabic ? (
                    <>
                      مرحباً فاطمة،<br />
                      ماذا تحتاجين إصلاحه اليوم؟
                    </>
                  ) : (
                    <>
                      Hi Fatima,<br />
                      what needs fixing today?
                    </>
                  )}
                </h2>
              </div>

              {/* Search Bar (Page 3) */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={isArabic ? 'مثال: المكيف لا يبرد أو تسريب مياه' : 'Try "AC not cooling" or "leaking tap"'}
                  className="w-full ps-11 pe-4 py-3 bg-white rounded-2xl border border-line text-sm text-ink placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-signal-orange focus:border-transparent transition shadow-xs"
                />
                <div className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Live Job Card (Page 3) */}
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
                      WO-24817
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-ocean-blue/15 text-ocean-blue flex items-center justify-center font-display font-extrabold text-sm shrink-0">
                      RK
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-ink truncate font-display">
                        {isArabic ? 'إصلاح مكيف • غرفة النوم ٢' : 'AC not cooling · Bedroom 2'}
                      </h4>
                      <p className="text-xs text-slate truncate">
                        {isArabic ? 'الفني راشد في الطريق • يصل خلال ١٢ دقيقة' : 'Rashid is on the way · arrives in 12 min'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate shrink-0 rtl:rotate-180" />
                  </div>

                  {/* 4-Segment Progress Bar (Page 3) */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <div className="h-1.5 rounded-full bg-ocean-blue" />
                    <div className="h-1.5 rounded-full bg-ocean-blue" />
                    <div className="h-1.5 rounded-full bg-ocean-blue animate-pulse" />
                    <div className="h-1.5 rounded-full bg-line" />
                  </div>
                </div>
              )}

              {/* Our Services 2-Column Grid (Page 3) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-ink text-base font-display">
                    {isArabic ? 'خدماتنا' : 'Our services'}
                  </h3>
                  <button
                    onClick={() => {
                      setBookingCategory('HVAC');
                      setActiveTab('BOOKINGS');
                    }}
                    className="text-xs font-bold text-ocean-blue hover:underline"
                  >
                    {isArabic ? 'عرض الكل' : 'See all'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* 1. Electrical */}
                  <button
                    onClick={() => {
                      setBookingCategory('ELECTRICAL');
                      setActiveSubScreen('NONE');
                      setActiveTab('BOOKINGS');
                    }}
                    className="p-4 bg-white rounded-2xl border border-line hover:border-signal-orange/50 hover:shadow-xs transition text-start flex flex-col justify-between h-32 active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-lg text-amber-500 flex items-center justify-center text-xl">
                      ⚡
                    </div>
                    <div>
                      <div className="font-bold text-ink text-sm font-display">
                        {isArabic ? 'كهرباء' : 'Electrical'}
                      </div>
                      <div className="text-[11px] text-slate line-clamp-1">
                        {isArabic ? 'مقابس، إنارة، لوحات توزيع' : 'Sockets, lights, DB panels'}
                      </div>
                    </div>
                  </button>

                  {/* 2. Plumbing */}
                  <button
                    onClick={() => {
                      setBookingCategory('PLUMBING');
                      setActiveSubScreen('NONE');
                      setActiveTab('BOOKINGS');
                    }}
                    className="p-4 bg-white rounded-2xl border border-line hover:border-signal-orange/50 hover:shadow-xs transition text-start flex flex-col justify-between h-32 active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-lg text-blue-500 flex items-center justify-center text-xl">
                      💧
                    </div>
                    <div>
                      <div className="font-bold text-ink text-sm font-display">
                        {isArabic ? 'سباكة' : 'Plumbing'}
                      </div>
                      <div className="text-[11px] text-slate line-clamp-1">
                        {isArabic ? 'تسريبات، سخانات، مصارف' : 'Leaks, heaters, drains'}
                      </div>
                    </div>
                  </button>

                  {/* 3. AC Service */}
                  <button
                    onClick={() => {
                      setBookingCategory('HVAC');
                      setActiveSubScreen('NONE');
                      setActiveTab('BOOKINGS');
                    }}
                    className="p-4 bg-white rounded-2xl border border-line hover:border-signal-orange/50 hover:shadow-xs transition text-start flex flex-col justify-between h-32 active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-lg text-teal-600 flex items-center justify-center text-xl">
                      ❄️
                    </div>
                    <div>
                      <div className="font-bold text-ink text-sm font-display">
                        {isArabic ? 'تكييف' : 'AC service'}
                      </div>
                      <div className="text-[11px] text-slate line-clamp-1">
                        {isArabic ? 'إصلاح، غاز، تنظيف' : 'Repair, gas, cleaning'}
                      </div>
                    </div>
                  </button>

                  {/* 4. Labour Supply */}
                  <button
                    onClick={() => setActiveSubScreen('QUOTE_REQ')}
                    className="p-4 bg-white rounded-2xl border border-line hover:border-signal-orange/50 hover:shadow-xs transition text-start flex flex-col justify-between h-32 active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-lg text-purple-600 flex items-center justify-center text-xl">
                      👥
                    </div>
                    <div>
                      <div className="font-bold text-ink text-sm font-display">
                        {isArabic ? 'توريد عمالة' : 'Labour supply'}
                      </div>
                      <div className="text-[11px] text-slate line-clamp-1">
                        {isArabic ? 'فرق ماهرة للمواقع' : 'Skilled crews for sites'}
                      </div>
                    </div>
                  </button>

                  {/* 5. Equipment Rental */}
                  <button
                    onClick={() => setActiveSubScreen('RENTAL')}
                    className="p-4 bg-white rounded-2xl border border-line hover:border-signal-orange/50 hover:shadow-xs transition text-start flex flex-col justify-between h-32 active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-lg text-emerald-600 flex items-center justify-center text-xl">
                      🚜
                    </div>
                    <div>
                      <div className="font-bold text-ink text-sm font-display">
                        {isArabic ? 'تأجير معدات' : 'Equipment rental'}
                      </div>
                      <div className="text-[11px] text-slate line-clamp-1">
                        {isArabic ? 'سقالات، رافعات، مولدات' : 'Lifts, scaffolds, gensets'}
                      </div>
                    </div>
                  </button>

                  {/* 6. Buy Materials */}
                  <button
                    onClick={() => setActiveSubScreen('SHOP')}
                    className="p-4 bg-white rounded-2xl border border-line hover:border-signal-orange/50 hover:shadow-xs transition text-start flex flex-col justify-between h-32 active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-lg text-rose-600 flex items-center justify-center text-xl">
                      📦
                    </div>
                    <div>
                      <div className="font-bold text-ink text-sm font-display">
                        {isArabic ? 'شراء مواد' : 'Buy materials'}
                      </div>
                      <div className="text-[11px] text-slate line-clamp-1">
                        {isArabic ? 'كابلات، أنابيب، قطع غيار' : 'Cables, pipes, fittings'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quotation Review Card (If Pending) */}
              {quotation.status === 'PENDING' && (
                <div className="p-3.5 bg-ground border border-line rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-navy bg-navy/10 px-1.5 py-0.5 rounded">
                      {quotation.quoteNumber}
                    </span>
                    <span className="font-bold text-navy font-display">{quotation.amountAed.toLocaleString()} AED</span>
                  </div>
                  <h4 className="font-bold text-ink text-xs font-display">{quotation.title}</h4>
                  <p className="text-slate text-[11px]">{quotation.scope}</p>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setQuotation({ ...quotation, status: 'APPROVED' });
                        setQuoteToast(isArabic ? 'تمت الموافقة على عرض السعر بنجاح وتم إرسال أمر العمل إلى العمليات' : 'Quotation approved! Work order dispatched to operations.');
                        try {
                          const existing = JSON.parse(localStorage.getItem('fixngo_approved_quotes') || '[]');
                          existing.push({ ...quotation, status: 'APPROVED', approvedAt: new Date().toISOString() });
                          localStorage.setItem('fixngo_approved_quotes', JSON.stringify(existing));
                        } catch {}
                        setTimeout(() => setQuoteToast(null), 5000);
                      }}
                      className="flex-1 py-2 bg-navy text-white rounded-xl font-bold hover:bg-slate-800 transition min-h-[44px]"
                    >
                      {isArabic ? 'موافقة وترحيل' : 'Approve & Dispatch'}
                    </button>
                    <button
                      onClick={() => {
                        setQuotation({ ...quotation, status: 'REJECTED' });
                        setQuoteToast(isArabic ? 'تم رفض عرض السعر' : 'Quotation declined.');
                        setTimeout(() => setQuoteToast(null), 4000);
                      }}
                      className="px-3 py-2 border border-line text-slate rounded-xl hover:bg-ground min-h-[44px]"
                    >
                      {isArabic ? 'رفض' : 'Decline'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: BOOKINGS (Page 4: 4-Step Booking Flow & Orders)          */}
          {/* ============================================================== */}
          {activeSubScreen === 'NONE' && activeTab === 'BOOKINGS' && (
            <div className="space-y-4 animate-fade-in font-body text-xs">
              {/* Sub-tab Pill Switcher */}
              <div className="flex bg-ground p-1 rounded-xl border border-line">
                <button
                  onClick={() => setBookingSubTab('NEW')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition min-h-[38px] ${
                    bookingSubTab === 'NEW'
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-slate hover:text-ink'
                  }`}
                >
                  {isArabic ? 'حجز جديد' : 'New Booking'}
                </button>
                <button
                  onClick={() => setBookingSubTab('HISTORY')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition min-h-[38px] ${
                    bookingSubTab === 'HISTORY'
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-slate hover:text-ink'
                  }`}
                >
                  {isArabic ? 'طلباتي السابقة' : 'My Orders'}
                </button>
              </div>

              {bookingSubTab === 'NEW' && (
                <div className="space-y-4">
                  {/* Step Header & Indicator (Page 4) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-extrabold text-base text-ink">
                          {bookingStep === 1 && (isArabic ? 'اختر الخدمة' : 'Choose a service')}
                          {bookingStep === 2 && (isArabic ? 'وصف المشكلة والصور' : 'Describe the fault')}
                          {bookingStep === 3 && (isArabic ? 'الموقع والموعد' : 'Location & schedule')}
                          {bookingStep === 4 && (isArabic ? 'مراجعة وتأكيد الحجز' : 'Review & confirm')}
                        </h3>
                        <p className="text-slate text-xs">
                          {isArabic ? `الخطوة ${bookingStep} من ٤` : `Step ${bookingStep} of 4`}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-ocean-blue bg-ocean-blue/10 px-2 py-0.5 rounded-full">
                        {isArabic ? 'ضمان جودة' : 'Certified Pros'}
                      </span>
                    </div>

                    {/* 4-Step Progress Indicator */}
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
                  </div>

                  {/* STEP 1: Choose a Service (Page 4 of Design Specification) */}
                  {bookingStep === 1 && (
                    <div className="space-y-3">
                      {[
                        {
                          id: 'HVAC' as const,
                          icon: '❄️',
                          titleEn: 'AC service',
                          titleAr: 'خدمة تكييف',
                          priceEn: 'from 149 AED',
                          priceAr: 'من ١٤٩ د.إ',
                          descEn: 'Split, VRV, package units, filter cleaning, gas charge',
                          descAr: 'سبليت، في آر في، تنظيف فلاتر، شحن غاز',
                        },
                        {
                          id: 'ELECTRICAL' as const,
                          icon: '⚡',
                          titleEn: 'Electrical',
                          titleAr: 'كهرباء',
                          priceEn: 'from 129 AED',
                          priceAr: 'من ١٢٩ د.إ',
                          descEn: 'Breakers, short circuit, sockets, light fixtures, DB panels',
                          descAr: 'قواطع، التماس كهربائي، مقابس، لوحات توزيع',
                        },
                        {
                          id: 'PLUMBING' as const,
                          icon: '💧',
                          titleEn: 'Plumbing',
                          titleAr: 'سباكة',
                          priceEn: 'from 129 AED',
                          priceAr: 'من ١٢٩ د.إ',
                          descEn: 'Pipe leaks, water heaters, booster pumps, blockages',
                          descAr: 'تسريب أنابيب، سخانات مياه، مضخات، انسدادات',
                        },
                        {
                          id: 'LABOUR' as const,
                          icon: '👥',
                          titleEn: 'Labour supply',
                          titleAr: 'توريد عمالة',
                          priceEn: 'Quote',
                          priceAr: 'عرض سعر',
                          descEn: 'Certified electricians, plumbers, HVAC technicians on hire',
                          descAr: 'فنيون معتمدون للكهرباء والتكييف والسباكة للمشاريع',
                        },
                        {
                          id: 'RENTAL' as const,
                          icon: '🚜',
                          titleEn: 'Equipment rental',
                          titleAr: 'تأجير معدات',
                          priceEn: 'from 90 AED',
                          priceAr: 'من ٩٠ د.إ',
                          descEn: 'Scaffolding, scissor lifts, generators, coring drills',
                          descAr: 'سقالات، رافعات مقصية، مولدات، دريل تخريم',
                        },
                        {
                          id: 'SHOP' as const,
                          icon: '📦',
                          titleEn: 'Buy materials',
                          titleAr: 'شراء مواد',
                          priceEn: 'Shop',
                          priceAr: 'متجر',
                          descEn: 'Copper tubes, refrigerants, breakers, isolators, fittings',
                          descAr: 'أنابيب نحاسية، غاز تبريد، قواطع، محابس',
                        },
                      ].map((item) => {
                        const isSelected = bookingCategory === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setBookingCategory(item.id)}
                            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 min-h-[58px] ${
                              isSelected
                                ? 'bg-signal-orange/5 border-signal-orange ring-1 ring-signal-orange shadow-xs'
                                : 'bg-white border-line hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{item.icon}</span>
                              <div>
                                <div className="font-extrabold text-sm text-ink font-display">
                                  {isArabic ? item.titleAr : item.titleEn}
                                </div>
                                <div className="text-[11px] text-slate line-clamp-1">
                                  {isArabic ? item.descAr : item.descEn}
                                </div>
                              </div>
                            </div>

                            <div className="text-end shrink-0">
                              <span className="font-bold text-xs text-navy font-display block">
                                {isArabic ? item.priceAr : item.priceEn}
                              </span>
                              <div className="w-5 h-5 rounded-full border border-line flex items-center justify-center ms-auto mt-1">
                                {isSelected && <div className="w-3 h-3 rounded-full bg-signal-orange" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Sticky Bottom Continue Button (Page 4) */}
                      <div className="pt-3">
                        <button
                          onClick={() => setBookingStep(2)}
                          className="w-full py-3.5 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 min-h-[44px]"
                        >
                          <span>{isArabic ? 'متابعة ←' : 'Continue →'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Describe Fault / Issue */}
                  {bookingStep === 2 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="font-bold text-ink block mb-1.5">
                          {isArabic ? 'الأعراض الشائعة' : 'Common Symptoms'}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {symptomChips.map((chip, i) => (
                            <button
                              key={i}
                              onClick={() => setBookingDescription(chip)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                                bookingDescription === chip
                                  ? 'bg-signal-orange text-white border-signal-orange'
                                  : 'bg-white text-slate border-line hover:border-slate-300'
                              }`}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-ink block mb-1">
                          {isArabic ? 'وصف تفصيلي للمشكلة' : 'Fault details & notes'}
                        </label>
                        <textarea
                          value={bookingDescription}
                          onChange={(e) => setBookingDescription(e.target.value)}
                          rows={3}
                          placeholder={isArabic ? 'اكتب ملاحظاتك هنا...' : 'e.g. AC makes clicking noise and fan stops after 10 mins'}
                          className="w-full p-3 bg-ground border border-line rounded-xl text-xs text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-signal-orange"
                        />
                      </div>

                      {/* Photo Attachment Dropzone */}
                      <div>
                        <label className="font-bold text-ink block mb-1">
                          {isArabic ? 'إرفاق صورة أو صوت العطل' : 'Attach photo proof'}
                        </label>
                        <button
                          onClick={() => setBookingPhotoUploaded(!bookingPhotoUploaded)}
                          className={`w-full p-3.5 rounded-xl border border-dashed flex items-center justify-center gap-2 transition min-h-[44px] ${
                            bookingPhotoUploaded
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-ground border-line text-slate hover:bg-slate-100'
                          }`}
                        >
                          <Camera className="w-4 h-4 text-signal-orange" />
                          <span className="font-bold text-xs">
                            {bookingPhotoUploaded
                              ? (isArabic ? 'تم إرفاق صورة العطل بنجاح' : '1 photo attached (Unit model plate)')
                              : (isArabic ? 'انقر لإلتقاط أو رفع صورة' : 'Tap to take or upload photo')}
                          </span>
                        </button>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setBookingStep(1)}
                          className="px-4 py-3 border border-line rounded-xl font-bold text-slate hover:bg-ground transition min-h-[44px]"
                        >
                          {isArabic ? 'السابق' : 'Back'}
                        </button>
                        <button
                          onClick={() => setBookingStep(3)}
                          className="flex-1 py-3 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <span>{isArabic ? 'متابعة ←' : 'Continue →'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Location & Scheduling Window */}
                  {bookingStep === 3 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="font-bold text-ink block mb-1">
                          {isArabic ? 'موقع الخدمة' : 'Service location'}
                        </label>
                        <div className="h-40 rounded-xl overflow-hidden border border-line relative shadow-xs">
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
                            <span className="truncate">{currentLocation}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-ink block mb-1">
                          {isArabic ? 'موعد الزيارة' : 'Preferred arrival window'}
                        </label>
                        <div className="space-y-2">
                          {[
                            { id: 'Immediate Emergency Callout (within 45m)', labelEn: 'Immediate Emergency (within 45 min)', labelAr: 'طوارئ فوري (خلال ٤٥ دقيقة)', badge: 'Fastest' },
                            { id: 'Today (02:00 PM - 04:00 PM)', labelEn: 'Today (02:00 PM – 04:00 PM)', labelAr: 'اليوم (٢:٠٠ م – ٤:٠٠ م)', badge: 'Available' },
                            { id: 'Tomorrow (10:00 AM - 12:00 PM)', labelEn: 'Tomorrow (10:00 AM – 12:00 PM)', labelAr: 'غداً (١٠:٠٠ ص – ١٢:٠٠ م)', badge: 'Scheduled' },
                          ].map((slot) => {
                            const isSelected = bookingTimeSlot === slot.id;
                            return (
                              <div
                                key={slot.id}
                                onClick={() => setBookingTimeSlot(slot.id)}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition min-h-[44px] ${
                                  isSelected
                                    ? 'bg-signal-orange/5 border-signal-orange ring-1 ring-signal-orange'
                                    : 'bg-white border-line hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className={`w-4 h-4 ${isSelected ? 'text-signal-orange' : 'text-slate'}`} />
                                  <span className="font-bold text-ink text-xs">
                                    {isArabic ? slot.labelAr : slot.labelEn}
                                  </span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  slot.badge === 'Fastest'
                                    ? 'bg-signal-orange/10 text-signal-orange'
                                    : 'bg-ground text-slate'
                                }`}>
                                  {slot.badge}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setBookingStep(2)}
                          className="px-4 py-3 border border-line rounded-xl font-bold text-slate hover:bg-ground transition min-h-[44px]"
                        >
                          {isArabic ? 'السابق' : 'Back'}
                        </button>
                        <button
                          onClick={() => setBookingStep(4)}
                          className="flex-1 py-3 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <span>{isArabic ? 'مراجعة التكلفة ←' : 'Review Pricing →'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Review Pricing Breakdown & Confirm */}
                  {bookingStep === 4 && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-line p-4 space-y-2.5">
                        <div className="flex justify-between py-1 border-b border-line/60">
                          <div>
                            <div className="font-bold text-ink">Call-out & inspection</div>
                            <div className="text-[11px] text-slate">Standard initial visit</div>
                          </div>
                          <div className="font-bold text-ink">AED 99.00</div>
                        </div>

                        <div className="flex justify-between py-1 border-b border-line/60">
                          <div>
                            <div className="font-bold text-ink">Estimated labour</div>
                            <div className="text-[11px] text-slate">Includes diagnosis & first hour</div>
                          </div>
                          <div className="font-bold text-ink">AED 150.00</div>
                        </div>

                        <div className="flex justify-between py-1 border-b border-line/60">
                          <div>
                            <div className="font-bold text-ink">UAE VAT 5%</div>
                            <div className="text-[11px] text-slate">Federal Tax Authority TRN {UAE_CONSTANTS.COMPANY_TRN}</div>
                          </div>
                          <div className="font-bold text-ink">AED 12.45</div>
                        </div>

                        <div className="flex justify-between pt-1.5 text-sm font-extrabold text-ink font-display">
                          <span>Estimated Total</span>
                          <span className="text-signal-orange">AED 261.45</span>
                        </div>
                      </div>

                      <div className="p-3 bg-ground rounded-xl border border-line text-[11px] text-slate space-y-1">
                        <div className="font-bold text-ink flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>No Surprise Charges Policy</span>
                        </div>
                        <p>
                          Our technician presents an exact quotation for any parts needed before executing the repair. You only pay after you approve the work.
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setBookingStep(3)}
                          className="px-4 py-3 border border-line rounded-xl font-bold text-slate hover:bg-ground transition min-h-[44px]"
                        >
                          {isArabic ? 'السابق' : 'Back'}
                        </button>
                        <button
                          onClick={handleQuickBook}
                          className="flex-1 py-3 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{isArabic ? 'تأكيد الحجز وإرسال الفني' : 'Confirm Booking & Dispatch'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* History Sub-tab */}
              {bookingSubTab === 'HISTORY' && (
                <div className="space-y-3">
                  {/* Active Job Card */}
                  <div
                    onClick={() => setActiveSubScreen('TRACKING')}
                    className="p-4 bg-white border border-ocean-blue rounded-2xl shadow-xs space-y-2 cursor-pointer hover:border-ocean-blue/80 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-ocean-blue bg-ocean-blue/10 px-2 py-0.5 rounded">
                        {activeJob.orderNumber}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase text-signal-orange bg-signal-orange/10 px-2 py-0.5 rounded">
                        {activeJob.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-ink text-xs font-display">{activeJob.title}</h4>
                    <div className="text-[11px] text-slate">{activeJob.scheduledTime}</div>
                    <div className="pt-2 border-t border-line flex items-center justify-between text-ocean-blue font-bold">
                      <span>Track Technician on Map →</span>
                      <span className="text-ink">AED {activeJob.totalAmountAed.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Past Order */}
                  <div className="p-4 bg-white border border-line rounded-2xl space-y-2 opacity-85">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate">WO-2026-0019</span>
                      <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        COMPLETED
                      </span>
                    </div>
                    <h4 className="font-bold text-ink text-xs font-display">Water Heater Thermostat Replacement</h4>
                    <div className="text-[11px] text-slate">12 Sep 2026 · Jumeirah Villa</div>
                    <div className="pt-2 border-t border-line flex items-center justify-between text-slate">
                      <button
                        onClick={() => setActiveSubScreen('CHECKOUT')}
                        className="text-signal-orange font-bold hover:underline"
                      >
                        View Tax Invoice →
                      </button>
                      <span className="font-bold text-ink">AED 245.00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: SHOP (Materials Catalog & Equipment Rental)             */}
          {/* ============================================================== */}
          {activeSubScreen === 'NONE' && activeTab === 'SHOP' && (
            <div className="space-y-4 animate-fade-in font-body text-xs">
              <div>
                <h3 className="text-base font-extrabold text-ink font-display">
                  {isArabic ? 'متجر المواد وتأجير المعدات' : 'Materials & Equipment'}
                </h3>
                <p className="text-slate text-[11px]">
                  {isArabic ? 'قطع غيار أصلية ومعدات ثقيلة معتمدة في دبي' : 'Genuine parts & heavy machinery with fast site delivery'}
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
                  onClick={() => alert('Order dispatched for same-day delivery from Al Quoz central depot!')}
                  className="px-3.5 py-2 bg-signal-orange hover:bg-signal-orange-hover text-white rounded-xl font-bold text-xs shadow-xs transition min-h-[44px]"
                >
                  Checkout
                </button>
              </div>

              {/* Materials Catalog */}
              <div className="space-y-2">
                <span className="font-bold text-ink block uppercase tracking-wider text-[11px] font-display">
                  {isArabic ? 'قطع الغيار الشائعة' : 'Common Spare Parts'}
                </span>
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

              {/* Equipment Rental Section */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-ink block uppercase tracking-wider text-[11px] font-display">
                  {isArabic ? 'تأجير المعدات الثقيلة' : 'Heavy Equipment Rental'}
                </span>
                {[
                  { name: 'Caterpillar 100 kVA Generator', daily: 450, deposit: 3000, img: '/placeholders/generator.svg' },
                  { name: 'Haulotte 12m Electric Scissor Lift', daily: 380, deposit: 2500, img: '/placeholders/scissor-lift.svg' },
                  { name: 'Mobile Aluminium Scaffolding 6m', daily: 120, deposit: 1000, img: '/placeholders/scaffolding.svg' },
                ].map((eq, i) => (
                  <div key={i} className="p-3 bg-white border border-line rounded-2xl flex items-center gap-3 shadow-xs">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-ground shrink-0">
                      <img src={eq.img} alt={eq.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-ink text-xs truncate font-display">{eq.name}</h4>
                      <div className="text-[11px] text-signal-orange font-bold mt-0.5">AED {eq.daily} / day</div>
                      <div className="text-[10px] text-slate">Deposit: AED {eq.deposit}</div>
                    </div>
                    <button
                      onClick={() => alert(`Equipment Booking Request submitted for ${eq.name}! Our rental team will call you.`)}
                      className="px-3 py-2 bg-navy text-white rounded-xl text-[11px] font-bold hover:bg-slate-800 transition min-h-[44px]"
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: ACCOUNT (Assets, AMC, Profile, Invoices)               */}
          {/* ============================================================== */}
          {activeSubScreen === 'NONE' && activeTab === 'ACCOUNT' && (
            <div className="space-y-4 animate-fade-in font-body text-xs">
              {/* Customer Profile Card */}
              <div className="p-4 bg-white rounded-2xl border border-line shadow-xs flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-navy text-white font-display font-extrabold text-base flex items-center justify-center shrink-0">
                  FA
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-sm text-ink truncate font-display">
                    {user?.fullName || 'Fatima Al Mansoori'}
                  </h3>
                  <div className="text-slate text-[11px]">{user?.phone}</div>
                  <div className="text-slate text-[11px] truncate">{user?.email}</div>
                </div>
              </div>

              {/* Active AMC Contract Card */}
              <div className="p-4 bg-navy text-white rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-display">
                    Annual Maintenance Contract
                  </span>
                  <span className="text-[10px] font-bold bg-signal-orange text-white px-2 py-0.5 rounded">
                    GOLD 24/7
                  </span>
                </div>
                <div className="text-sm font-extrabold font-display">Contract # AMC-2026-0088</div>
                <div className="text-[11px] text-slate-300">
                  3 of 4 Preventive Visits Remaining · Valid until 31 Mar 2027
                </div>
              </div>

              {/* Registered Equipment Assets */}
              <div className="space-y-2">
                <span className="font-bold text-ink uppercase tracking-wide text-[11px] font-display">
                  {isArabic ? 'الأصول المنزلية المسجلة' : 'Registered Home Assets'}
                </span>
                {[
                  { tag: 'AST-VIL-041', name: 'Daikin VRV Inverter AC 4-Ton', serial: 'DKN-VRV-901', loc: 'Roof Platform', status: 'Covered under Gold AMC' },
                  { tag: 'AST-VIL-042', name: 'Grundfos Hydro Booster Pump', serial: 'GF-PMP-102', loc: 'Garden Pump Chamber', status: 'Covered under Gold AMC' },
                  { tag: 'AST-VIL-043', name: 'Solar Water Heater 300L Tank', serial: 'SLR-HTR-2023', loc: 'Roof Service Deck', status: 'Warranty Valid' },
                ].map((ast, i) => (
                  <div key={i} className="p-3 bg-white border border-line rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-ocean-blue bg-ocean-blue/10 px-1.5 py-0.5 rounded">
                        {ast.tag}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">{ast.status}</span>
                    </div>
                    <div className="font-extrabold text-ink text-xs font-display">{ast.name}</div>
                    <div className="text-[10px] text-slate flex items-center justify-between">
                      <span>Serial: {ast.serial} · {ast.loc}</span>
                      <QrCode className="w-3.5 h-3.5 text-slate" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions List */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => alert('Support ticket raised. Priority dispatcher contacted.')}
                  className="w-full p-3 bg-white border border-line rounded-xl flex items-center justify-between font-bold text-ink hover:bg-ground transition min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>File Complaint or Escalation</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate" />
                </button>

                <button
                  onClick={() => setActiveSubScreen('CHECKOUT')}
                  className="w-full p-3 bg-white border border-line rounded-xl flex items-center justify-between font-bold text-ink hover:bg-ground transition min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-ocean-blue" />
                    <span>View Latest Tax Invoice INV-10482</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate" />
                </button>

                <button
                  onClick={() => setUser(null)}
                  className="w-full py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 transition min-h-[44px]"
                >
                  Log Out
                </button>
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
            setActiveTab(tab);
            if (tab === 'HOME') router.push(`/${locale}/app`);
            if (tab === 'BOOKINGS') router.push(`/${locale}/app/bookings`);
            if (tab === 'SHOP') router.push(`/${locale}/app/shop`);
            if (tab === 'ACCOUNT') router.push(`/${locale}/app/account`);
          }}
          activeOrderCount={1}
        />

        {/* Simulated OTP Onboarding Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in text-xs">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm">
                  {isArabic ? 'تسجيل الدخول السريع' : 'Instant Customer Sign In'}
                </h3>
                <button onClick={() => setShowAuthModal(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isOtpSent ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">UAE Mobile Phone Number</label>
                    <input
                      type="text"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-slate-900"
                    />
                  </div>
                  <button
                    onClick={() => setIsOtpSent(true)}
                    className="w-full py-2.5 bg-teal-800 text-white rounded-xl font-bold hover:bg-teal-900 transition"
                  >
                    Send 4-Digit OTP Code
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-[11px]">
                    Simulated OTP sent to {otpPhone}. Enter code <span className="font-black font-mono">4242</span>.
                  </div>
                  <input
                    type="text"
                    placeholder="Enter 4242"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full p-2.5 text-center font-mono font-black text-lg bg-slate-50 border rounded-xl tracking-widest text-slate-900"
                  />
                  <button
                    onClick={() => {
                      setUser({
                        fullName: 'Eng. Tariq Al-Hashimi',
                        phone: otpPhone,
                        email: 'facilities@palmcrest.example',
                      });
                      setShowAuthModal(false);
                      setIsOtpSent(false);
                      setOtpCode('');
                    }}
                    className="w-full py-2.5 bg-teal-800 text-white rounded-xl font-bold hover:bg-teal-900 transition"
                  >
                    Verify & Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
