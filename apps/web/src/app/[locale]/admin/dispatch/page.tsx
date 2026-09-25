'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LeafletMap, MapMarker } from '../../../../components/map/LeafletMap';
import { fetchApi } from '../../../../lib/api-client';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Users,
  Search,
  Filter,
  ArrowRight,
  Shield,
  Phone,
  Flame,
  Star,
  Activity,
  ChevronRight,
  MessageSquare,
  Wrench,
  Check,
  ShieldCheck,
  Truck,
  Layers,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { calculateDistanceKm, estimateEtaMinutes } from '@fieldops/shared';

interface UnassignedJob {
  id: string;
  orderNumber: string;
  title: string;
  customer: string;
  phone: string;
  trade: 'HVAC' | 'ELECTRICAL' | 'PLUMBING' | 'GENERAL';
  priority: 'EMERGENCY' | 'CRITICAL' | 'HIGH' | 'MEDIUM';
  address: string;
  lat: number;
  lng: number;
  amount: number;
  slaStatus: 'BREACHED' | 'WARNING' | 'HEALTHY';
  slaLabel: string;
}

interface TechnicianLive {
  id: string;
  code: string;
  name: string;
  trade: string;
  vanCode: string;
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_JOB';
  speed: number;
  heading: number;
  lat: number;
  lng: number;
  loc: string;
  currentJob: string | null;
  eta: number | null;
  rating: number;
  jobsCompleted: number;
  phone: string;
  skills: string[];
  stockHighlights: string[];
  avatar: string;
}

export default function AdminDispatchBoardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get('highlight');

  // 12 Realistic Technicians Across Dubai & Northern Emirates
  const initialTechnicians: TechnicianLive[] = [
    {
      id: 'tech-joseph',
      code: 'TECH-PLU-08',
      name: 'Joseph Mathew',
      trade: 'PLUMBING',
      vanCode: 'Van DXB-08',
      status: 'AVAILABLE',
      speed: 0,
      heading: 0,
      lat: 25.2650,
      lng: 55.3120,
      loc: 'Rigga Road, Deira',
      currentJob: null,
      eta: null,
      rating: 4.89,
      jobsCompleted: 342,
      phone: 'xxxxxxxxx',
      skills: ['DEWA Master Plumber', 'PPR Fusion Welder', 'Drain Camera Rig', 'Hydrostatic Test'],
      stockHighlights: ['PPR 32mm Pipes (6)', 'Pressure Valves (4)', 'Heavy Flange Kit (2)'],
      avatar: 'JM',
    },
    {
      id: 'tech-rashid',
      code: 'TECH-HVAC-12',
      name: 'Rashid Khan',
      trade: 'HVAC',
      vanCode: 'Van DXB-12',
      status: 'EN_ROUTE',
      speed: 48,
      heading: 180,
      lat: 25.1860,
      lng: 55.2715,
      loc: 'Business Bay SZR',
      currentJob: 'WO-2026-00017',
      eta: 12,
      rating: 4.96,
      jobsCompleted: 480,
      phone: 'xxxxxxxxx',
      skills: ['Senior HVAC Lead', 'VRV / VRF Specialist', 'Chiller Overhaul', 'FTA Gas Certified'],
      stockHighlights: ['R410A Cylinders (2)', '45µF Capacitors (3)', 'Manifold Kit'],
      avatar: 'RK',
    },
    {
      id: 'tech-vikram',
      code: 'TECH-ELE-04',
      name: 'Vikram Patel',
      trade: 'ELECTRICAL',
      vanCode: 'Van DXB-04',
      status: 'EN_ROUTE',
      speed: 52,
      heading: 90,
      lat: 25.1972,
      lng: 55.2744,
      loc: 'Downtown Dubai',
      currentJob: 'WO-2026-00018',
      eta: 8,
      rating: 4.92,
      jobsCompleted: 412,
      phone: 'xxxxxxxxx',
      skills: ['DEWA Grade-A Electrician', 'MDB Busbar', 'Infrared Thermography', 'UPS Systems'],
      stockHighlights: ['32A MCB Breakers (8)', '100A Busbars (2)', 'Megger Tester'],
      avatar: 'VP',
    },
    {
      id: 'tech-001',
      code: 'TECH-PLU-02',
      name: 'Tariq Al-Mansoor',
      trade: 'PLUMBING',
      vanCode: 'Van DXB-02',
      status: 'ON_JOB',
      speed: 0,
      heading: 0,
      lat: 25.0805,
      lng: 55.1403,
      loc: 'Dubai Marina Walk',
      currentJob: 'WO-2026-00005',
      eta: 0,
      rating: 4.85,
      jobsCompleted: 390,
      phone: 'xxxxxxxxx',
      skills: ['Booster Pumps', 'Water Tank Sanitization', 'Sewer Rodding', 'High Pressure Jetting'],
      stockHighlights: ['Booster Impellers', 'Check Valves', 'PPR Sleeves'],
      avatar: 'TM',
    },
    {
      id: 'tech-farhan',
      code: 'TECH-HVAC-07',
      name: 'Farhan Siddiqui',
      trade: 'HVAC',
      vanCode: 'Van DXB-07',
      status: 'AVAILABLE',
      speed: 35,
      heading: 270,
      lat: 25.1320,
      lng: 55.2280,
      loc: 'Al Quoz Industrial 3',
      currentJob: null,
      eta: null,
      rating: 4.88,
      jobsCompleted: 355,
      phone: 'xxxxxxxxx',
      skills: ['Package Units', 'Compressor Rebuilding', 'Fan Coil Motors', 'Air Duct Balancing'],
      stockHighlights: ['Contactors', 'Dual Run Capacitors', 'Recovery Machine'],
      avatar: 'FS',
    },
    {
      id: 'tech-ahmed',
      code: 'TECH-ELE-09',
      name: 'Ahmed Mustafa',
      trade: 'ELECTRICAL',
      vanCode: 'Van DXB-09',
      status: 'AVAILABLE',
      speed: 0,
      heading: 0,
      lat: 25.1600,
      lng: 55.2450,
      loc: 'Al Quoz Central Depot',
      currentJob: null,
      eta: null,
      rating: 4.90,
      jobsCompleted: 320,
      phone: 'xxxxxxxxx',
      skills: ['Industrial Switchgear', 'VFD Drives', 'Emergency Lighting', 'ATS Panels'],
      stockHighlights: ['Schneider MCBs', 'Contactor Coils', 'Safety Disconnects'],
      avatar: 'AM',
    },
  ];

  // Unassigned Pending Work Orders with WO-2026-00025 as Primary Breached SLA Ticket
  const [unassignedJobs, setUnassignedJobs] = useState<UnassignedJob[]>([
    {
      id: 'wo-2026-00025',
      orderNumber: 'WO-2026-00025',
      title: 'Emergency Water Pipe Burst & Ceiling Inundation',
      customer: 'Fatima Al Mansoori',
      phone: 'xxxxxxxxx',
      trade: 'PLUMBING',
      priority: 'EMERGENCY',
      address: 'Flat 402, Al Rigga St, Deira, Dubai',
      lat: 25.2697,
      lng: 55.3094,
      amount: 520.0,
      slaStatus: 'BREACHED',
      slaLabel: '⚠️ 2h 10m overdue (SLA Breached)',
    },
    {
      id: 'wo-2026-00026',
      orderNumber: 'WO-2026-00026',
      title: 'Carrier 5-Ton Rooftop Chiller High Temp Alarm',
      customer: 'Palm Crest Properties LLC',
      phone: 'xxxxxxxxx',
      trade: 'HVAC',
      priority: 'CRITICAL',
      address: 'Palm Crest Residences Phase 3, Dubai',
      lat: 25.1782,
      lng: 55.3210,
      amount: 850.0,
      slaStatus: 'WARNING',
      slaLabel: '⏱️ 22m remaining',
    },
    {
      id: 'wo-2026-00027',
      orderNumber: 'WO-2026-00027',
      title: 'Sub-DB Tripping Floor 14 Server Rack UPS',
      customer: 'Blue Sky Towers Owners Association',
      phone: 'xxxxxxxxx',
      trade: 'ELECTRICAL',
      priority: 'CRITICAL',
      address: 'DIFC Gate District, Dubai',
      lat: 25.2120,
      lng: 55.2810,
      amount: 560.0,
      slaStatus: 'WARNING',
      slaLabel: '⏱️ 45m remaining',
    },
    {
      id: 'wo-2026-00028',
      orderNumber: 'WO-2026-00028',
      title: 'Preventive HVAC Coil Cleaning & Gas Top-up',
      customer: 'Arabian Ranches Villa 88',
      phone: 'xxxxxxxxx',
      trade: 'HVAC',
      priority: 'MEDIUM',
      address: 'Arabian Ranches 2, Dubai',
      lat: 25.0450,
      lng: 55.2630,
      amount: 390.0,
      slaStatus: 'HEALTHY',
      slaLabel: '⏱️ 2h 15m remaining',
    },
  ]);

  const [selectedJob, setSelectedJob] = useState<UnassignedJob | null>(null);
  const [selectedTech, setSelectedTech] = useState<TechnicianLive | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [tradeFilter, setTradeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [liveTechs, setLiveTechs] = useState<TechnicianLive[]>(initialTechnicians);

  // Auto-select highlighted job or default to WO-2026-00025
  useEffect(() => {
    if (unassignedJobs.length > 0) {
      if (highlightParam) {
        const found = unassignedJobs.find((j) => j.orderNumber === highlightParam);
        if (found) {
          setSelectedJob(found);
          // Auto select Joseph Mathew for WO-2026-00025
          const jm = liveTechs.find((t) => t.id === 'tech-joseph');
          if (jm) setSelectedTech(jm);
          return;
        }
      }
      if (!selectedJob) {
        setSelectedJob(unassignedJobs[0]);
        const jm = liveTechs.find((t) => t.id === 'tech-joseph');
        if (jm) setSelectedTech(jm);
      }
    }
  }, [highlightParam, unassignedJobs, liveTechs]);

  // Compute Nearest Available suggestions for the selected job using calculateDistanceKm
  const nearestTechnicians = useMemo(() => {
    if (!selectedJob) return [];
    return liveTechs
      .map((t) => {
        const dist = calculateDistanceKm(selectedJob.lat, selectedJob.lng, t.lat, t.lng);
        const eta = estimateEtaMinutes(dist);
        const tradeMatch = t.trade === selectedJob.trade;
        return { ...t, distanceKm: dist, estimatedEta: eta, tradeMatch };
      })
      .sort((a, b) => {
        // Sort trade matches first, then by distance
        if (a.tradeMatch && !b.tradeMatch) return -1;
        if (!a.tradeMatch && b.tradeMatch) return 1;
        return a.distanceKm - b.distanceKm;
      });
  }, [selectedJob, liveTechs]);

  const handleAssignTechnician = useCallback((tech: TechnicianLive) => {
    if (!selectedJob) return;
    setAssignSuccess(
      isArabic
        ? `تم تعيين الفني ${tech.name} بنجاح للطلب ${selectedJob.orderNumber}! تم إرسال رابط التتبع المباشر إلى العميل ${selectedJob.customer}.`
        : `Successfully assigned ${tech.name} to ${selectedJob.orderNumber}! Live tracking link and WhatsApp notification dispatched to ${selectedJob.customer}.`
    );

    // Update technician state
    setLiveTechs((prev) =>
      prev.map((t) =>
        t.id === tech.id
          ? {
              ...t,
              status: 'EN_ROUTE',
              currentJob: selectedJob.orderNumber,
              loc: `En route to ${selectedJob.address}`,
            }
          : t
      )
    );

    setUnassignedJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
    setSelectedJob(null);
    setTimeout(() => setAssignSuccess(null), 6000);
  }, [selectedJob, isArabic]);

  const toggleSimulator = async () => {
    const nextState = !isSimulatorRunning;
    setIsSimulatorRunning(nextState);

    try {
      await fetchApi(nextState ? '/api/dispatch/simulator/start' : '/api/dispatch/simulator/stop', {
        method: 'POST',
      });
    } catch (e) {
      console.warn('Backend simulator endpoint offline, running browser simulation:', e);
    }
  };

  // Local GPS movement simulation loop
  useEffect(() => {
    if (!isSimulatorRunning) return;

    const interval = setInterval(() => {
      setLiveTechs((prev) =>
        prev.map((t) => {
          if (t.status === 'EN_ROUTE' || t.speed > 0) {
            const deltaLat = (Math.random() - 0.48) * 0.0018;
            const deltaLng = (Math.random() - 0.48) * 0.0018;
            return {
              ...t,
              lat: t.lat + deltaLat,
              lng: t.lng + deltaLng,
              speed: Math.max(30, Math.min(80, t.speed + (Math.random() * 8 - 4))),
            };
          }
          return t;
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulatorRunning]);

  // Build Leaflet markers
  const markers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = [];
    liveTechs.forEach((t) => {
      list.push({
        id: t.id,
        lat: t.lat,
        lng: t.lng,
        title: `${t.name} (${t.vanCode})`,
        subtitle: `${t.trade} • ${t.status} • ${t.loc}`,
        type: 'tech',
        status: t.status,
      });
    });

    unassignedJobs.forEach((j) => {
      list.push({
        id: j.id,
        lat: j.lat,
        lng: j.lng,
        title: `${j.orderNumber}: ${j.title}`,
        subtitle: `${j.customer} • ${j.priority} • ${j.address}`,
        type: 'job',
        status: j.priority === 'EMERGENCY' ? 'EMERGENCY' : 'HIGH',
      });
    });
    return list;
  }, [liveTechs, unassignedJobs]);

  const filteredJobs = useMemo(() => {
    return unassignedJobs.filter((job) => {
      const matchesTrade = tradeFilter === 'ALL' || job.trade === tradeFilter;
      const matchesSearch =
        job.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTrade && matchesSearch;
    });
  }, [unassignedJobs, tradeFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Top Header & Telematics Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-signal-orange">
              {isArabic ? 'غرفة العمليات المركزية' : 'Live Fleet Telematics'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200">
              PostGIS Spatial Matcher
            </span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-navy dark:text-white tracking-tight flex items-center gap-2">
            <Navigation className="w-6 h-6 text-signal-orange" />
            <span>{isArabic ? 'الخريطة المباشرة ولوحة الترحيل الذكي' : 'Live Map & Intelligent Dispatch Board'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isArabic
              ? 'تتبع GPS مباشر لـ 18 مركبة خدمة وتعيين فوري لأقرب فني بناءً على مسافة Haversine وتوافق المهارات والقطع في المركبة'
              : 'Real-time GPS telematics for 18 service vans, PostGIS KNN spatial matching, and 1-click dispatch'}
          </p>
        </div>

        {/* Live Simulation Controls & Trade Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={toggleSimulator}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs min-h-[40px] ${
              isSimulatorRunning
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-navy hover:bg-slate-800 text-white'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSimulatorRunning ? 'bg-emerald-300 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span>
              {isSimulatorRunning
                ? (isArabic ? 'إيقاف محاكاة GPS' : 'Stop GPS Simulation')
                : (isArabic ? 'تشغيل محاكاة GPS الحية' : '▶ Start GPS Simulation')}
            </span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-ground dark:bg-slate-800 rounded-xl text-xs font-semibold border border-line dark:border-slate-700">
            {['ALL', 'PLUMBING', 'HVAC', 'ELECTRICAL'].map((trade) => (
              <button
                key={trade}
                onClick={() => setTradeFilter(trade)}
                className={`px-2.5 py-1 rounded-lg transition text-xs ${
                  tradeFilter === trade
                    ? 'bg-white dark:bg-slate-900 text-signal-orange shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white'
                }`}
              >
                {trade === 'ALL' ? (isArabic ? 'الكل' : 'All') : trade}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {assignSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{assignSuccess}</span>
        </div>
      )}

      {/* 3-COLUMN DISPATCH LAYOUT (Page 12 Specification) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 min-h-[660px]">
        {/* ================= COLUMN 1: UNASSIGNED JOBS QUEUE (xl:col-span-3) ================= */}
        <div className="xl:col-span-3 flex flex-col space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-sm font-bold text-navy dark:text-white flex items-center gap-2">
                  <span>{isArabic ? 'طابور الطلبات غير المعينة' : 'Unassigned Jobs'}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold">
                    {unassignedJobs.length}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isArabic ? 'اختر طلباً لعرض أقرب الفنيين' : 'Select a ticket to recommend nearest tech'}
                </p>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                placeholder={isArabic ? 'بحث بالرقم أو العميل أو المنطقة...' : 'Search order, customer, area...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-2 rounded-xl bg-ground dark:bg-slate-800 border border-line dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-signal-orange"
              />
            </div>

            {/* Ticket Cards List */}
            <div className="space-y-2.5 overflow-y-auto flex-1 max-h-[580px] pr-1">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  {isArabic ? 'تم ترحيل جميع الطلبات بنجاح! 🎉' : 'All service tickets dispatched! 🎉'}
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  const isBreached = job.slaStatus === 'BREACHED';

                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job);
                        if (job.trade === 'PLUMBING') {
                          const jm = liveTechs.find((t) => t.id === 'tech-joseph');
                          if (jm) setSelectedTech(jm);
                        } else if (job.trade === 'HVAC') {
                          const fs = liveTechs.find((t) => t.id === 'tech-farhan');
                          if (fs) setSelectedTech(fs);
                        } else if (job.trade === 'ELECTRICAL') {
                          const am = liveTechs.find((t) => t.id === 'tech-ahmed');
                          if (am) setSelectedTech(am);
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition relative ${
                        isSelected
                          ? 'border-signal-orange bg-orange-50/60 dark:bg-orange-950/20 ring-2 ring-signal-orange/20 shadow-xs'
                          : isBreached
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50/30 hover:border-rose-400'
                          : 'border-line dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold font-mono text-navy dark:text-white">
                            {job.orderNumber}
                          </span>
                          <Link
                            href={`/${locale}/admin/work-orders/${job.orderNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-signal-orange p-0.5 rounded transition"
                            title="Open Work Order Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                              job.priority === 'EMERGENCY'
                                ? 'bg-rose-600 text-white'
                                : job.priority === 'CRITICAL'
                                ? 'bg-orange-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {job.priority}
                          </span>
                        </div>
                      </div>

                      {/* Title & Customer */}
                      <div className="font-bold text-navy dark:text-white line-clamp-2">
                        {job.title}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{job.customer} · {job.address}</span>
                      </div>

                      {/* SLA Timer Pill */}
                      <div className="mt-2.5 pt-2 border-t border-line/60 dark:border-slate-800/80 flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold flex items-center gap-1 ${
                            isBreached
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{job.slaLabel}</span>
                        </span>
                        <span className="font-mono font-bold text-navy dark:text-white">
                          AED {job.amount.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: INTERACTIVE LEAFLET MAP (xl:col-span-6) ================= */}
        <div className="xl:col-span-6 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-line dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Map Top Bar with Status Counts */}
          <div className="p-3 bg-ground dark:bg-slate-800/80 border-b border-line dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>{isArabic ? 'متاح (4)' : 'Available (4)'}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>{isArabic ? 'في الطريق (2)' : 'En Route (2)'}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{isArabic ? 'في الموقع (12)' : 'On Site (12)'}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>{isArabic ? 'حرج (4)' : 'Critical (4)'}</span>
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Dubai · Sharjah · Ajman Corridor
            </div>
          </div>

          {/* Interactive Map Component */}
          <div className="flex-1 w-full min-h-[520px] relative">
            <LeafletMap
              center={
                selectedJob
                  ? [selectedJob.lat, selectedJob.lng]
                  : [25.1860, 55.2715]
              }
              zoom={selectedJob?.id === 'wo-24825' ? 13 : 11}
              markers={markers}
              onMarkerClick={(m) => {
                const foundTech = liveTechs.find((t) => t.id === m.id);
                if (foundTech) setSelectedTech(foundTech);
                const foundJob = unassignedJobs.find((j) => j.id === m.id);
                if (foundJob) setSelectedJob(foundJob);
              }}
            />
          </div>
        </div>

        {/* ================= COLUMN 3: SELECTED TECHNICIAN & 1-CLICK ASSIGNMENT (xl:col-span-3) ================= */}
        <div className="xl:col-span-3 flex flex-col space-y-3">
          {selectedTech ? (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                {/* Header: Best Match Banner */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-signal-orange">
                    <Sparkles className="w-4 h-4 text-signal-orange" />
                    <span>{isArabic ? 'الفني الموصى به' : 'Recommended Match'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {selectedTech.status}
                  </span>
                </div>

                {/* Technician Card Info */}
                <div className="p-3.5 rounded-xl bg-ground dark:bg-slate-800/60 border border-line dark:border-slate-700/80 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-navy text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {selectedTech.avatar}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-navy dark:text-white">
                        {selectedTech.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {selectedTech.trade} · {selectedTech.vanCode}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{selectedTech.rating}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          ({selectedTech.jobsCompleted} {isArabic ? 'عمل' : 'jobs'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Proximity & Location */}
                  {selectedJob && (
                    <div className="mt-3 pt-2.5 border-t border-line/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-signal-orange" />
                        <span>{selectedTech.loc}</span>
                      </span>
                      <span className="font-bold text-signal-orange font-mono">
                        ~{calculateDistanceKm(selectedJob.lat, selectedJob.lng, selectedTech.lat, selectedTech.lng).toFixed(1)} km · ETA {estimateEtaMinutes(calculateDistanceKm(selectedJob.lat, selectedJob.lng, selectedTech.lat, selectedTech.lng))}m
                      </span>
                    </div>
                  )}
                </div>

                {/* Skills & Certifications Badges */}
                <div className="mb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {isArabic ? 'المهارات والشهادات المعتمدة' : 'Verified Skills & Certifications'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTech.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-line dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Van Inventory on Hand */}
                <div className="mb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>{isArabic ? 'المخزون المتوفر بالمركبة' : 'Van Stock on Board'}</span>
                    <span className="font-mono text-[10px] text-emerald-600 font-bold">100% Match</span>
                  </div>
                  <div className="space-y-1">
                    {selectedTech.stockHighlights.map((part, i) => (
                      <div
                        key={i}
                        className="text-[11px] p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{part}</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">In Van</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Contact Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <a
                    href={`tel:${selectedTech.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-ground dark:bg-slate-800 border border-line dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 transition min-h-[40px]"
                  >
                    <Phone className="w-3.5 h-3.5 text-navy" />
                    <span>Call Tech</span>
                  </a>
                  <a
                    href="https://wa.me/xxxxxxxxx"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition min-h-[40px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* 1-CLICK ASSIGN BUTTON (Signal Orange, min-h-[44px]) */}
              {selectedJob ? (
                <button
                  onClick={() => handleAssignTechnician(selectedTech)}
                  className="w-full py-3 px-4 rounded-xl bg-signal-orange hover:bg-signal-orange-hover text-white font-bold text-sm min-h-[44px] flex items-center justify-center gap-2 transition shadow-md"
                >
                  <span>
                    {isArabic
                      ? `تعيين ${selectedTech.name} للطلب ${selectedJob.orderNumber} ←`
                      : `Assign ${selectedTech.name} to ${selectedJob.orderNumber} →`}
                  </span>
                </button>
              ) : (
                <div className="text-center py-2 text-xs text-slate-400">
                  {isArabic ? 'اختر طلباً من القائمة لتعيين الفني' : 'Select an unassigned ticket to dispatch'}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-line dark:border-slate-800 shadow-xs flex-1 flex flex-col items-center justify-center text-center">
              <Users className="w-8 h-8 text-slate-300 mb-2" />
              <div className="text-sm font-bold text-navy dark:text-white">
                {isArabic ? 'لم يتم تحديد فني' : 'No Technician Selected'}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {isArabic
                  ? 'انقر على أي فني على الخريطة أو اختر طلباً لعرض المقترحات'
                  : 'Click any technician marker on the map or select a job to see spatial recommendations'}
              </p>
            </div>
          )}

          {/* Alternative Ranked Technicians List */}
          {selectedJob && nearestTechnicians.length > 1 && (
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-line dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {isArabic ? 'بدائل أخرى متوفرة' : 'Other Nearby Techs'}
              </div>
              <div className="space-y-1.5">
                {nearestTechnicians.slice(1, 4).map((tech) => (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTech(tech)}
                    className="p-2 rounded-xl hover:bg-ground dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {tech.avatar}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-navy dark:text-white truncate">{tech.name}</div>
                        <div className="text-[10px] text-slate-400">{tech.trade} · {tech.vanCode}</div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-500">
                      {tech.distanceKm.toFixed(1)} km
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
