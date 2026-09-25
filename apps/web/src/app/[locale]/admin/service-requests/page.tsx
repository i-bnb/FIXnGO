'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Filter,
  Phone,
  MessageSquare,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  X,
  Search,
} from 'lucide-react';
import { Priority, ServiceType } from '@fieldops/shared';

interface ServiceRequest {
  id: string;
  ticketNumber: string;
  customerName: string;
  phone: string;
  siteName: string;
  area: string;
  category: 'HVAC' | 'PLUMBING' | 'ELECTRICAL' | 'GENERAL';
  title: string;
  description: string;
  priority: 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'TRIAGED' | 'CONVERTED' | 'RESOLVED';
  slaMinutesRemaining: number; // positive = remaining, negative = breached
  slaDeadline: string;
  source: 'CUSTOMER_APP' | 'WHATSAPP' | 'PHONE' | 'AMC_SCHEDULE';
  createdAt: string;
  assetName?: string;
}

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'SR-101',
    ticketNumber: 'SR-2026-0491',
    customerName: 'Palm Crest Villa 124',
    phone: 'xxxxxxxxx',
    siteName: 'Villa 124, Palm Crest Residences',
    area: 'Palm Crest Residences, Dubai',
    category: 'HVAC',
    title: 'Master Bedroom AC Blowing Hot Air in 42°C Heat',
    description: 'Chiller thermostat showing error code E4. Resident has elderly family member on site.',
    priority: 'EMERGENCY',
    status: 'PENDING',
    slaMinutesRemaining: 42,
    slaDeadline: 'Today, 11:45 AM',
    source: 'CUSTOMER_APP',
    createdAt: '45 mins ago',
    assetName: 'Daikin VRV Inverter 4-Ton (MBR)',
  },
  {
    id: 'SR-102',
    ticketNumber: 'SR-2026-0492',
    customerName: 'Crescent Bay Commercial Complex',
    phone: 'xxxxxxxxx',
    siteName: 'Main Lobby & Restaurant',
    area: 'Downtown Dubai',
    category: 'PLUMBING',
    title: 'Greywater Return Pipe Seepage in Service Corridor',
    description: 'Noticeable odor and minor pooling near basement freight elevator. Urgent isolation required.',
    priority: 'HIGH',
    status: 'PENDING',
    slaMinutesRemaining: 78,
    slaDeadline: 'Today, 12:30 PM',
    source: 'WHATSAPP',
    createdAt: '1 hour ago',
    assetName: 'Main Waste Riser Valve #3',
  },
  {
    id: 'SR-103',
    ticketNumber: 'SR-2026-0493',
    customerName: 'Al-Mansoor Trading LLC',
    phone: 'xxxxxxxxx',
    siteName: 'Warehouse 14, Al Quoz 3',
    area: 'Al Quoz, Dubai',
    category: 'ELECTRICAL',
    title: 'Frequent Tripping of Distribution Board Sub-Breakers',
    description: 'Warehouse conveyor line halts when packaging compressor starts. Suspect phase imbalance.',
    priority: 'HIGH',
    status: 'TRIAGED',
    slaMinutesRemaining: 135,
    slaDeadline: 'Today, 02:00 PM',
    source: 'PHONE',
    createdAt: '2 hours ago',
    assetName: 'Schneider 160A 3-Phase Main DB',
  },
  {
    id: 'SR-104',
    ticketNumber: 'SR-2026-0494',
    customerName: 'Mrs. Fatima Al-Hashimi',
    phone: 'xxxxxxxxx',
    siteName: 'Penthouse 32A, Burj Crown',
    area: 'Downtown Dubai',
    category: 'HVAC',
    title: 'Annual Maintenance Service Pre-Summer Checkup',
    description: 'Contractual AMC scheduled quarterly visit for 3 indoor FCU units.',
    priority: 'MEDIUM',
    status: 'PENDING',
    slaMinutesRemaining: 320,
    slaDeadline: 'Today, 05:00 PM',
    source: 'AMC_SCHEDULE',
    createdAt: '3 hours ago',
    assetName: 'Carrier Ducted Split Units x3',
  },
  {
    id: 'SR-105',
    ticketNumber: 'SR-2026-0495',
    customerName: 'Dr. Tariq Al-Suwaidi',
    phone: 'xxxxxxxxx',
    siteName: 'Villa 88, Palm Jumeirah Frond M',
    area: 'Palm Jumeirah, Dubai',
    category: 'PLUMBING',
    title: 'Customer Complaint: Late arrival on prior garden pump service',
    description: 'Client states technician arrived 40 mins after confirmed window yesterday. Requests manager call and priority pump inspection.',
    priority: 'HIGH',
    status: 'PENDING',
    slaMinutesRemaining: -15, // SLA breached!
    slaDeadline: 'Breached (15 mins overdue)',
    source: 'PHONE',
    createdAt: '4 hours ago',
    assetName: 'Grundfos Hydro Multi-E Booster Pump',
  },
];

export default function ServiceRequestsAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'EMERGENCY' | 'COMPLAINTS' | 'CONVERTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertedToast, setConvertedToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/service-requests')
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.requests) && data.requests.length > 0) {
          // Merge live requests with INITIAL_REQUESTS without duplicating IDs
          setRequests((prev) => {
            const liveIds = new Set(data.requests.map((r: any) => r.id || r.ticketNumber));
            const existingRemaining = prev.filter((r) => !liveIds.has(r.id) && !liveIds.has(r.ticketNumber));
            return [...data.requests, ...existingRemaining];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Conversion form state
  const [convertForm, setConvertForm] = useState({
    assignedTrade: 'HVAC',
    inChargeTech: 'Rashid Al-Nuaimi',
    helperCount: 1,
    scheduledSlot: 'Today, 02:00 PM - 04:00 PM',
    estimatedHours: 2,
    serviceCallFee: 150,
  });

  const filteredRequests = requests.filter((req) => {
    // Tab filter
    if (activeTab === 'EMERGENCY' && req.priority !== 'EMERGENCY') return false;
    if (activeTab === 'COMPLAINTS' && !req.title.toLowerCase().includes('complaint') && !req.description.toLowerCase().includes('complaint')) return false;
    if (activeTab === 'CONVERTED' && req.status !== 'CONVERTED') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        req.ticketNumber.toLowerCase().includes(q) ||
        req.customerName.toLowerCase().includes(q) ||
        req.area.toLowerCase().includes(q) ||
        req.title.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleConvert = () => {
    if (!selectedRequest) return;

    const newWoNumber = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? { ...r, status: 'CONVERTED' }
          : r
      )
    );

    setIsConvertModalOpen(false);
    setConvertedToast(`Successfully created Work Order #${newWoNumber} for ${selectedRequest.customerName}!`);
    setTimeout(() => setConvertedToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {convertedToast && (
        <div className="fixed top-4 end-4 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{convertedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <Inbox className="w-4 h-4" />
            <span>{isArabic ? 'صندوق الوارد والفرز الفوري' : 'Triage & Inbound Management'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'طلبات الخدمة والشكاوى' : 'Service Requests & Complaints'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'فرز بلاغات العملاء في الوقت الفعلي مع مراقبة مؤشرات اتفاقية مستوى الخدمة (SLA) والتحويل الفوري إلى أوامر عمل'
              : 'Real-time triage queue with live SLA countdowns, priority classification, and one-click FSM conversion'}
          </p>
        </div>

        {/* Action summary */}
        <div className="flex items-center gap-3">
          <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide block">
              {isArabic ? 'طوارئ معلقة' : 'Emergency Pending'}
            </span>
            <span className="text-lg font-black text-red-700">1</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block">
              {isArabic ? 'اقتراب المهلة' : 'SLA < 1 Hour'}
            </span>
            <span className="text-lg font-black text-amber-800">2</span>
          </div>
          <div className="bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wide block">
              {isArabic ? 'إجمالي الطلبات' : 'Total Queue'}
            </span>
            <span className="text-lg font-black text-teal-900">{requests.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: isArabic ? 'جميع البلاغات' : 'All Requests', count: requests.length },
            { id: 'EMERGENCY', label: isArabic ? 'حالات الطوارئ' : 'Emergency & Critical', count: requests.filter((r) => r.priority === 'EMERGENCY').length },
            { id: 'COMPLAINTS', label: isArabic ? 'شكاوى وتصعيدات' : 'Complaints & Escalations', count: 1 },
            { id: 'CONVERTED', label: isArabic ? 'تم تحويلها لأوامر' : 'Converted to W.O.', count: requests.filter((r) => r.status === 'CONVERTED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isArabic ? 'بحث بالرقم أو العميل أو المنطقة...' : 'Search ticket, customer, area...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs ps-9 pe-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Main Request Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Triage List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredRequests.map((req) => {
            const isBreached = req.slaMinutesRemaining <= 0;
            const isUrgent = req.slaMinutesRemaining > 0 && req.slaMinutesRemaining <= 60;
            const isSelected = selectedRequest?.id === req.id;

            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`bg-white rounded-2xl border transition p-4 cursor-pointer relative hover:shadow-md ${
                  isSelected
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Row: Ticket #, Category, SLA Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {req.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        req.category === 'HVAC'
                          ? 'bg-blue-100 text-blue-800'
                          : req.category === 'ELECTRICAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {req.category}
                    </span>
                    <span className="text-[11px] text-slate-500">{req.createdAt}</span>
                  </div>

                  {/* SLA Badge */}
                  <div>
                    {isBreached ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        <span>SLA Breached ({Math.abs(req.slaMinutesRemaining)}m late)</span>
                      </span>
                    ) : isUrgent ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{req.slaMinutesRemaining}m remaining</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>{req.slaMinutesRemaining}m SLA window</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Customer */}
                <div className="mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">{req.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                    <span className="font-semibold text-slate-800">{req.customerName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-600" />
                      <span>{req.area}</span>
                    </span>
                    {req.assetName && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">Asset: {req.assetName}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description Preview */}
                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {req.description}
                </p>

                {/* Bottom Row: Source, Status, and Action trigger */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Source:</span>
                    <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {req.source}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'CONVERTED' ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Work Order Active</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(req);
                          setIsConvertModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold shadow-sm transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                        <span>{isArabic ? 'تحويل لأمر عمل' : 'Convert to W.O.'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              <Inbox className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-sm">No service requests match the filter criteria</p>
            </div>
          )}
        </div>

        {/* Right: Selected Request Details & Quick Dispatch Pane */}
        <div className="space-y-4">
          {selectedRequest ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 sticky top-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-teal-800 font-mono">
                    {selectedRequest.ticketNumber}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      selectedRequest.priority === 'EMERGENCY'
                        ? 'bg-red-100 text-red-800'
                        : selectedRequest.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {selectedRequest.priority}
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  {selectedRequest.title}
                </h2>
              </div>

              {/* Client & Contact */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-slate-900">{selectedRequest.customerName}</div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedRequest.siteName}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="font-mono text-slate-700">{selectedRequest.phone}</span>
                  <div className="flex gap-1.5">
                    <a
                      href={`tel:${selectedRequest.phone}`}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-teal-700 hover:border-teal-500 transition"
                      title="Call Client"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://wa.me/xxxxxxxxx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-100 transition"
                      title="Open WhatsApp Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* SLA Status Card */}
              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-950">SLA Commitment:</span>
                  <span className="font-semibold text-teal-800">{selectedRequest.slaDeadline}</span>
                </div>
                <div className="w-full bg-teal-200/80 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      selectedRequest.slaMinutesRemaining <= 0
                        ? 'bg-red-500 w-full'
                        : selectedRequest.slaMinutesRemaining <= 60
                        ? 'bg-amber-500 w-3/4'
                        : 'bg-teal-600 w-1/3'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-teal-900 font-medium">
                  Guaranteed response time based on Gold Tier AMC contract.
                </div>
              </div>

              {/* Description & Asset Details */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">Issue Description:</div>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedRequest.description}
                </p>
                {selectedRequest.assetName && (
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-900">
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-blue-700">
                      Target Equipment Asset
                    </span>
                    <span className="font-semibold">{selectedRequest.assetName}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="pt-2 space-y-2">
                {selectedRequest.status !== 'CONVERTED' ? (
                  <button
                    onClick={() => setIsConvertModalOpen(true)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>{isArabic ? 'فتح نموذج أمر العمل' : 'Convert to Work Order'}</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800">
                    Already Converted to Work Order
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-3">
              <Inbox className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">
                {isArabic ? 'اختر بلاغاً من القائمة لعرض تفاصيله' : 'Select a ticket to review SLA & triage'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Convert to Work Order Modal */}
      {isConvertModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>CONVERT TICKET TO FIELD WORK ORDER</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {selectedRequest.ticketNumber}: {selectedRequest.customerName}
                </h3>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Job Title & Scope
                </span>
                <span className="font-bold text-slate-800 text-sm">{selectedRequest.title}</span>
                <span className="text-slate-500 block mt-1">{selectedRequest.siteName}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Trade</label>
                <select
                  value={convertForm.assignedTrade}
                  onChange={(e) => setConvertForm({ ...convertForm, assignedTrade: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="HVAC">HVAC Maintenance & AC</option>
                  <option value="PLUMBING">Plumbing & Drainage</option>
                  <option value="ELECTRICAL">Electrical & Substation</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lead Technician (In-Charge)</label>
                <select
                  value={convertForm.inChargeTech}
                  onChange={(e) => setConvertForm({ ...convertForm, inChargeTech: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Rashid Al-Nuaimi">Rashid Al-Nuaimi (HVAC Lead)</option>
                  <option value="Vikram Sharma">Vikram Sharma (Plumbing Lead)</option>
                  <option value="Mohammad Rizwan">Mohammad Rizwan (Electrical Lead)</option>
                  <option value="Kareem Mostafa">Kareem Mostafa (HVAC Tech)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Helper Count (Manpower)</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={convertForm.helperCount}
                  onChange={(e) => setConvertForm({ ...convertForm, helperCount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Diagnostic Callout Fee (AED)</label>
                <input
                  type="number"
                  value={convertForm.serviceCallFee}
                  onChange={(e) => setConvertForm({ ...convertForm, serviceCallFee: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Scheduled Window</label>
                <input
                  type="text"
                  value={convertForm.scheduledSlot}
                  onChange={(e) => setConvertForm({ ...convertForm, scheduledSlot: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Automated Workflow Trigger:</span>
              Converting this ticket creates an active Work Order in FSM, issues a WhatsApp confirmation with live tracking link to the customer, and adds the job to the technician's mobile dispatch app.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t">
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Dispatch Work Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
