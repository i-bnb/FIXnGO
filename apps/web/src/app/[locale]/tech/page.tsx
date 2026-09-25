'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  Navigation,
  CheckCircle2,
  Camera,
  PenTool,
  Clock,
  Plus,
  Trash2,
  MapPin,
  Phone,
  ShieldAlert,
  Package,
  Wifi,
  WifiOff,
  RotateCcw,
  Star,
  Play,
  Pause,
  Calendar,
  AlertTriangle,
  FileText,
  Award,
  Truck,
  Send,
  Check,
  ExternalLink,
  X,
  Sparkles,
  MessageSquare,
  LogOut,
  Key,
  CreditCard,
  User,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearClientSession } from '../../../lib/auth/session';
import { performLogout } from '../../../lib/auth/logout';
import { Logo } from '../../../components/common/Logo';
import { JobStatus, Priority, ServiceType, calculateUaeVat } from '@fieldops/shared';
import { fetchApi } from '../../../lib/api-client';
import confetti from 'canvas-confetti';

interface QueuedAction {
  id: string;
  type: string;
  summary: string;
  timestamp: string;
  payload?: any;
}

interface VanItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  unit: string;
  unitPrice: number;
}

interface JobItem {
  id: string;
  orderNumber: string;
  title: string;
  clientName: string;
  clientPhone: string;
  address: string;
  serviceType: string;
  status: JobStatus;
  priority: Priority;
  scheduledTime: string;
  baseFee: number;
  lat: number;
  lng: number;
  holdReason?: string;
  description: string;
}

const PERSONAS = {
  LEAD: {
    id: 'TECH-AC-01',
    name: 'Rashid Khan',
    role: 'Lead AC & MEP Specialist',
    trade: 'Master HVAC & Electrical',
    van: 'Van DXB-12 · Al Quoz Hub',
    phone: 'xxxxxxxxx',
    avatar: '/placeholders/technician-lead.svg',
    canComplete: true,
  },
  HELPER: {
    id: 'HLP-02',
    name: 'Imran S.',
    role: 'Helper Technician',
    trade: 'General Mechanical & AC Assistant',
    van: 'Van DXB-12 · Al Quoz Hub',
    phone: 'xxxxxxxxx',
    avatar: '/placeholders/technician-helper.svg',
    canComplete: false,
  },
};

export default function TechnicianPortalPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isArabic = locale === 'ar';

  // Access Denied Notification Banner
  const [deniedToast, setDeniedToast] = useState(false);
  useEffect(() => {
    if (searchParams.get('denied') === 'true') {
      setDeniedToast(true);
      const timer = setTimeout(() => setDeniedToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Active Persona
  const [activePersona, setActivePersona] = useState(PERSONAS.LEAD);

  // Active Tab: JOBS, VAN_STOCK, PERFORMANCE, ME
  const [activeTab, setActiveTab] = useState<'JOBS' | 'VAN_STOCK' | 'PERFORMANCE' | 'ME'>('JOBS');

  // End Shift and Logout Modal State
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);

  // Attendance & GPS Geofence
  const [clockedIn, setClockedIn] = useState(true);
  const [clockInTime] = useState('07:58 AM');
  const geofenceYard = 'Al Quoz store · Van DXB-12';

  // Offline Queue State
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<QueuedAction[]>([]);
  const [syncingQueue, setSyncingQueue] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Job Detail Navigation
  const [selectedJobId, setSelectedJobId] = useState<string>('wo-24817');

  const handleInitiateLogout = () => {
    if (clockedIn || isStopwatchRunning || activeJob.status === JobStatus.IN_PROGRESS || activeJob.status === JobStatus.EN_ROUTE) {
      setShowEndShiftModal(true);
    } else {
      performLogout(locale);
    }
  };

  // Work Orders List (Page 8 Schedule)
  const [jobs, setJobs] = useState<JobItem[]>([
    {
      id: 'wo-24810',
      orderNumber: 'WO-24810',
      title: 'AC Filter Deep Chemical Wash & Sanitization',
      clientName: 'Omar T.',
      clientPhone: 'xxxxxxxxx',
      address: 'Burj Residences, Downtown Dubai',
      serviceType: 'HVAC',
      status: JobStatus.COMPLETED,
      priority: Priority.MEDIUM,
      scheduledTime: '08:30 AM',
      baseFee: 149.0,
      lat: 25.195,
      lng: 55.275,
      description: 'Filter cleaning and evaporator coil disinfection for master bedroom split unit.',
    },
    {
      id: 'wo-24814',
      orderNumber: 'WO-24814',
      title: 'Smart Digital Thermostat Replacement',
      clientName: 'Sarah D.',
      clientPhone: 'xxxxxxxxx',
      address: 'Marina Gate 2, Dubai Marina',
      serviceType: 'HVAC',
      status: JobStatus.COMPLETED,
      priority: Priority.MEDIUM,
      scheduledTime: '10:45 AM',
      baseFee: 180.0,
      lat: 25.08,
      lng: 55.14,
      description: 'Replace faulty Honeywell wall thermostat with programmable digital touchscreen unit.',
    },
    {
      id: 'wo-24817',
      orderNumber: 'WO-24817',
      title: 'AC not cooling · Bedroom 2',
      clientName: 'Fatima Al Mansoori',
      clientPhone: 'xxxxxxxxx',
      address: 'Villa 14, Arabian Ranches, Dubai',
      serviceType: 'HVAC',
      status: JobStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      scheduledTime: '01:30 PM',
      baseFee: 99.0,
      lat: 25.0534,
      lng: 55.253,
      description: 'AC blowing warm air in bedroom. Dual run capacitor failed and refrigerant top-up required.',
    },
    {
      id: 'wo-24822',
      orderNumber: 'WO-24822',
      title: 'Capacitor Replacement & Preventive Check',
      clientName: 'Tariq K.',
      clientPhone: 'xxxxxxxxx',
      address: 'District 12, Jumeirah Village Circle',
      serviceType: 'HVAC',
      status: JobStatus.ASSIGNED,
      priority: Priority.MEDIUM,
      scheduledTime: '04:00 PM',
      baseFee: 149.0,
      lat: 25.06,
      lng: 55.21,
      description: 'Outdoor condenser unit hums loudly without starting compressor.',
    },
  ]);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Checklist items for WO-24817 (Page 9)
  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Check power supply, main breaker & isolator voltage', done: true },
    { id: '2', label: 'Inspect outdoor condenser fan motor & compressor windings', done: true },
    { id: '3', label: 'Test dual run capacitor with digital multimeter (reveals open circuit)', done: true },
    { id: '4', label: 'Replace faulty run capacitor with new 45 µF 440V unit', done: false },
    { id: '5', label: 'Connect gauge manifold & top up R410A refrigerant (0.8 kg)', done: false },
    { id: '6', label: 'Verify supply vent air temperature reaches 16.5°C', done: false },
  ]);

  // Consumed Van Parts (Page 9)
  const [partsUsed, setPartsUsed] = useState<any[]>([
    { id: '1', name: 'Dual Run Capacitor 45/5 µF 440V', qty: 1, price: 65.0, sku: 'CAP-45-5' },
    { id: '2', name: 'R410A Refrigerant Top-up (kg)', qty: 0.8, price: 150.0, sku: 'GAS-R410A' },
  ]);

  // Removed / Salvaged Parts (Page 9)
  const [removedParts, setRemovedParts] = useState([
    { id: '1', name: 'Faulty Blown Run Capacitor 45 µF', condition: 'Scrapped / Defective', tag: 'DEF-481' },
  ]);
  const [showAddRemovedModal, setShowAddRemovedModal] = useState(false);
  const [newRemovedName, setNewRemovedName] = useState('');
  const [newRemovedCondition, setNewRemovedCondition] = useState('Scrapped / Defective');

  // Expenses
  const [expenses, setExpenses] = useState([
    { id: '1', category: 'Salik Toll (Al Barsha Gate)', amount: 4.0 },
    { id: '2', category: 'RTA Paid Parking (Zone B)', amount: 20.0 },
  ]);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpenseCat, setNewExpenseCat] = useState('RTA Paid Parking');
  const [newExpenseAmount, setNewExpenseAmount] = useState('20.00');

  // Van DXB-12 Inventory
  const [vanStock, setVanStock] = useState<VanItem[]>([
    { id: 'v-1', name: 'Dual Run Capacitor 45/5 µF 440V', sku: 'CAP-45-5', stock: 6, unit: 'pcs', unitPrice: 65.0 },
    { id: 'v-2', name: 'R410A Refrigerant 11.3kg Cylinder', sku: 'GAS-R410A-11', stock: 3, unit: 'cylinders', unitPrice: 380.0 },
    { id: 'v-3', name: 'Schneider Electric MCB 32A 3-Phase', sku: 'MCB-SCH-32A', stock: 4, unit: 'pcs', unitPrice: 85.0 },
    { id: 'v-4', name: 'Grohe Chrome Heavy Angle Valve 1/2"', sku: 'VALV-GR-01', stock: 5, unit: 'pcs', unitPrice: 70.0 },
    { id: 'v-5', name: 'Flexible Braided Stainless Hose 50cm', sku: 'HOSE-SS-50', stock: 7, unit: 'pcs', unitPrice: 35.0 },
  ]);

  // Request Materials Modal
  const [showStoreRequestModal, setShowStoreRequestModal] = useState(false);
  const [requestedItemName, setRequestedItemName] = useState('R410A Refrigerant 11.3kg Cylinder');
  const [requestedItemQty, setRequestedItemQty] = useState(2);
  const [requestUrgency, setRequestUrgency] = useState<'STANDARD' | 'URGENT_SITE'>('URGENT_SITE');
  const [requestNotes, setRequestNotes] = useState('');

  // Auto-Timed Labour Stopwatch
  const [stopwatchSeconds, setStopwatchSeconds] = useState(4120); // 1h 08m 40s
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(true);

  // Photos & Documents
  const [photoType, setPhotoType] = useState<'BEFORE' | 'AFTER' | 'DOCS'>('AFTER');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
  ]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
  ]);
  const [documents, setDocuments] = useState<string[]>([
    'Dubai Municipality PTW-9921 Approved.pdf',
  ]);

  // Asset Detail Modal
  const [showAssetModal, setShowAssetModal] = useState(false);

  // Job Hold Reason Modal
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState('Awaiting customer approval for additional replacement parts');

  // Customer Sign-Off Modal
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [signedName, setSignedName] = useState('Zaid Al-Harbi');
  const [customerRating, setCustomerRating] = useState(5);
  const [customerComments, setCustomerComments] = useState('Exceptional work! Rashid resolved the water leak cleanly and rapidly.');
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Job Completion State
  const [jobFinished, setJobFinished] = useState(false);
  const [completedInvoiceNumber, setCompletedInvoiceNumber] = useState('INV-2026-0042');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stopwatch ticking
  useEffect(() => {
    if (!isStopwatchRunning || activeJob.status !== JobStatus.IN_PROGRESS) return;
    const interval = setInterval(() => {
      setStopwatchSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStopwatchRunning, activeJob.status]);

  const formatStopwatch = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Online / Offline tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsNetworkOnline(navigator.onLine);
      const saved = localStorage.getItem('fieldops_tech_offline_queue');
      if (saved) {
        try {
          setOfflineQueue(JSON.parse(saved));
        } catch (e) {}
      }
    }

    const handleOnline = () => {
      setIsNetworkOnline(true);
      triggerAutoSync();
    };
    const handleOffline = () => {
      setIsNetworkOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Background Telematics GPS ping every 12 seconds
  useEffect(() => {
    if (!clockedIn) return;

    const pingInterval = setInterval(async () => {
      const isOnlineEffective = isNetworkOnline && !isSimulatedOffline;
      if (!isOnlineEffective) return;

      const delta = (Math.random() - 0.5) * 0.0004;
      const lat = activeJob.lat + delta;
      const lng = activeJob.lng + delta;

      try {
        await fetchApi('/api/tracking/ping', {
          method: 'POST',
          body: JSON.stringify({
            employeeId: activePersona.id,
            latitude: lat,
            longitude: lng,
            speedKmh: activeJob.status === JobStatus.EN_ROUTE ? 42.0 : 0,
            headingDegrees: 90,
            workOrderId: activeJob.id,
          }),
        });
      } catch (e) {
        // Silently tolerate if mock or offline
      }
    }, 12000);

    return () => clearInterval(pingInterval);
  }, [clockedIn, isNetworkOnline, isSimulatedOffline, activeJob, activePersona]);

  // Queue an action for offline resilience
  const queueAction = (type: string, summary: string, payload: any) => {
    const action: QueuedAction = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      summary,
      timestamp: new Date().toLocaleTimeString(),
      payload,
    };
    const updated = [...offlineQueue, action];
    setOfflineQueue(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fieldops_tech_offline_queue', JSON.stringify(updated));
    }
    showToast(`Saved to Offline Queue: ${summary}`);
  };

  const triggerAutoSync = async () => {
    if (offlineQueue.length === 0) return;
    setSyncingQueue(true);
    // Simulate flushing queue to backend
    setTimeout(() => {
      setSyncingQueue(false);
      setOfflineQueue([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fieldops_tech_offline_queue');
      }
      showToast('All queued offline actions synchronized with Dubai Fleet Dispatch!');
    }, 1200);
  };

  // Interactive Checklist
  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
    const item = checklist.find((c) => c.id === id);
    if (item) {
      if (isSimulatedOffline || !isNetworkOnline) {
        queueAction('CHECKLIST_UPDATE', `Toggled checklist: ${item.label}`, { id, done: !item.done });
      }
    }
  };

  // Add Part from Van (Decrements Van stock)
  const handleAddPartFromVan = (vanItem: VanItem) => {
    if (vanItem.stock <= 0) {
      alert(`Warning: No stock left for ${vanItem.name} in Van #01! Please request from store.`);
      return;
    }

    // Decrement van stock
    setVanStock((prev) =>
      prev.map((item) =>
        item.id === vanItem.id ? { ...item, stock: item.stock - 1 } : item
      )
    );

    // Add to parts used on this job
    const existing = partsUsed.find((p) => p.sku === vanItem.sku);
    if (existing) {
      setPartsUsed((prev) =>
        prev.map((p) => (p.sku === vanItem.sku ? { ...p, qty: p.qty + 1 } : p))
      );
    } else {
      setPartsUsed((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          name: vanItem.name,
          sku: vanItem.sku,
          qty: 1,
          price: vanItem.unitPrice,
        },
      ]);
    }

    const summary = `Fitted 1x ${vanItem.name} (Van stock reduced to ${vanItem.stock - 1})`;
    showToast(summary);

    if (isSimulatedOffline || !isNetworkOnline) {
      queueAction('VAN_PART_FITTED', summary, { sku: vanItem.sku, qty: 1 });
    }
  };

  const handleRemovePartUsed = (partId: string) => {
    const part = partsUsed.find((p) => p.id === partId);
    if (part) {
      // Return stock to van
      setVanStock((prev) =>
        prev.map((item) =>
          item.sku === part.sku ? { ...item, stock: item.stock + part.qty } : item
        )
      );
    }
    setPartsUsed((prev) => prev.filter((p) => p.id !== partId));
  };

  // Add Removed Part
  const handleAddRemovedPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemovedName.trim()) return;
    const newEntry = {
      id: String(Date.now()),
      name: newRemovedName,
      condition: newRemovedCondition,
      tag: `DEF-${Math.floor(100 + Math.random() * 900)}`,
    };
    setRemovedParts((prev) => [...prev, newEntry]);
    setShowAddRemovedModal(false);
    setNewRemovedName('');
    showToast(`Logged removed item: ${newEntry.name} (${newEntry.condition})`);
  };

  // Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newExpenseAmount) || 0;
    const newExp = {
      id: String(Date.now()),
      category: newExpenseCat,
      amount,
    };
    setExpenses((prev) => [...prev, newExp]);
    setShowAddExpenseModal(false);
    showToast(`Expense logged: ${newExpenseCat} - ${amount.toFixed(2)} AED`);
  };

  // Submit Requisition to Storekeeper Bilal
  const handleSubmitStoreRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const reqNumber = `REQ-${Math.floor(8000 + Math.random() * 1000)}`;
    setShowStoreRequestModal(false);
    alert(
      `Requisition #${reqNumber} Submitted!\n\nDestination: Central Warehouse - Al Quoz\nStorekeeper: Bilal Al-Masri\nItem: ${requestedItemName} (Qty: ${requestedItemQty})\nUrgency: ${requestUrgency}\n\nBilal has been alerted for priority staging into Van #01.`
    );
  };

  // State Transitions
  const handleStatusTransition = async (nextStatus: JobStatus, reason?: string) => {
    const updatedJobs = jobs.map((j) =>
      j.id === activeJob.id ? { ...j, status: nextStatus, holdReason: reason } : j
    );
    setJobs(updatedJobs);

    const isOnlineEffective = isNetworkOnline && !isSimulatedOffline;

    // Send immediate GPS ping with new status
    if (isOnlineEffective) {
      try {
        await fetchApi('/api/tracking/ping', {
          method: 'POST',
          body: JSON.stringify({
            employeeId: activePersona.id,
            latitude: activeJob.lat,
            longitude: activeJob.lng,
            speedKmh: nextStatus === JobStatus.EN_ROUTE ? 45.0 : 0,
            workOrderId: activeJob.id,
          }),
        });
      } catch (err) {}
    } else {
      queueAction('STATUS_TRANSITION', `Updated status to ${nextStatus}`, {
        status: nextStatus,
        reason,
        lat: activeJob.lat,
        lng: activeJob.lng,
      });
    }

    showToast(`Status updated: ${nextStatus}`);
  };

  // Canvas Signature pad handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasSignature(true);
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Complete Job & Sign Off Submission
  const handleFinalCompleteJob = () => {
    if (!activePersona.canComplete) {
      alert('Security Policy: Only the Lead Technician In-Charge can complete a work order.');
      return;
    }

    if (afterPhotos.length === 0) {
      alert('Compliance Requirement: At least one AFTER photo is required before completing this job.');
      return;
    }

    const invNum = `INV-2026-00${Math.floor(40 + Math.random() * 50)}`;
    setCompletedInvoiceNumber(invNum);
    setShowSignOffModal(false);
    setJobFinished(true);

    const updatedJobs = jobs.map((j) =>
      j.id === activeJob.id ? { ...j, status: JobStatus.COMPLETED } : j
    );
    setJobs(updatedJobs);

    const isOnlineEffective = isNetworkOnline && !isSimulatedOffline;
    if (isOnlineEffective) {
      try {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    } else {
      queueAction('JOB_COMPLETION', `Work Order Completed with signature & ${customerRating}-star review`, {
        orderNumber: activeJob.orderNumber,
        signedName,
        rating: customerRating,
      });
    }

    showToast(`Work Order ${activeJob.orderNumber} Completed! Invoice ${invNum} generated.`);
  };

  // Calculate billables
  const totalPartsCost = partsUsed.reduce((sum, p) => sum + p.qty * p.price, 0);
  const totalExpensesCost = expenses.reduce((sum, e) => sum + e.amount, 0);
  const labourHours = Math.max(1, Math.round((stopwatchSeconds / 3600) * 10) / 10);
  const labourCost = labourHours * 105.0; // Lead rate 105 AED/hr
  const totalSubtotal = activeJob.baseFee + totalPartsCost + totalExpensesCost + labourCost;
  const vat = calculateUaeVat(totalSubtotal);

  const completedChecklistCount = checklist.filter((c) => c.done).length;
  const checklistPercentage = Math.round((completedChecklistCount / checklist.length) * 100);

  const effectiveOnline = isNetworkOnline && !isSimulatedOffline;

  return (
    <div className="max-w-md mx-auto px-3.5 py-4 pb-24 text-slate-800 antialiased font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Access Denied / Role Restriction Toast Banner */}
      {deniedToast && (
        <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{isArabic ? 'ليس لديك صلاحية الوصول إلى تلك الصفحة' : "You don't have access to that page"}</span>
          </div>
          <button onClick={() => setDeniedToast(false)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Dark Navy Bar (Page 8 of Design Specification) */}
      <div className="bg-navy text-white -mx-3.5 -mt-4 px-4 py-3 mb-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Logo locale={locale} size="sm" showBadge={false} />
          <span className="text-[10px] text-slate-300 font-medium tracking-wider border-s border-slate-700 ps-2">
            TECHNICIAN
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-end">
            <div className="text-xs font-bold text-white font-display">
              {isArabic ? 'مساء الخير، راشد' : 'Good afternoon, Rashid'}
            </div>
            <button
              onClick={() => {
                const next = activePersona.id === PERSONAS.LEAD.id ? PERSONAS.HELPER : PERSONAS.LEAD;
                setActivePersona(next);
                showToast(`Switched active technician persona to: ${next.name}`);
              }}
              className="text-[9px] text-slate-300 hover:text-white underline font-mono"
            >
              {activePersona.role} ⇄
            </button>
          </div>
          <div className="w-8 h-8 rounded-full bg-signal-orange text-white font-display font-extrabold text-xs flex items-center justify-center shrink-0 ring-2 ring-white/20">
            RK
          </div>
          <button
            onClick={handleInitiateLogout}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition"
            title={isArabic ? 'إنهاء المناوبة والخروج' : 'End Shift & Log Out'}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Connectivity & Offline Banner */}
      <div className="mb-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            {effectiveOnline ? (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>4G LTE Connected</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>Offline Mode ({offlineQueue.length} Queued)</span>
              </span>
            )}

            <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>GPS Telematics Active</span>
            </span>
          </div>

          <button
            onClick={() => {
              const next = !isSimulatedOffline;
              setIsSimulatedOffline(next);
              if (!next) {
                triggerAutoSync();
              } else {
                showToast('Switched to Simulated Offline Mode. Updates will queue locally.');
              }
            }}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline decoration-slate-300"
          >
            {isSimulatedOffline ? 'Simulate 4G Online' : 'Simulate Drop'}
          </button>
        </div>

        {offlineQueue.length > 0 && (
          <div className="p-2 bg-amber-500/10 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <RotateCcw className={`w-3.5 h-3.5 text-amber-700 ${syncingQueue ? 'animate-spin' : ''}`} />
              <span>{offlineQueue.length} offline action{offlineQueue.length > 1 ? 's' : ''} stored</span>
            </div>
            <button
              onClick={triggerAutoSync}
              disabled={syncingQueue || !effectiveOnline}
              className="text-[10px] font-black bg-amber-600 text-white px-2.5 py-1 rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
            >
              {syncingQueue ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}
      </div>

      {/* On-Duty Status Card (Page 8) */}
      <div className="bg-white rounded-2xl p-3.5 border border-line shadow-xs mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse shrink-0" />
          <div>
            <div className="text-xs font-bold text-ink font-display flex items-center gap-1.5">
              <span>{isArabic ? 'على رأس العمل' : 'On duty'}</span>
              <span className="text-[10px] text-slate font-normal">· {activePersona.van}</span>
            </div>
            <div className="text-[11px] text-slate">
              {isArabic ? 'تم تسجيل الحضور ٠٧:٥٨ في مستودع القوز' : 'Checked in 07:58 at Al Quoz store · Van DXB-12'}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const next = !clockedIn;
            setClockedIn(next);
            showToast(next ? 'Clocked in at Al Quoz store.' : 'Shift ended.');
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-line text-slate hover:bg-ground transition min-h-[44px]"
        >
          {clockedIn ? (isArabic ? 'إنهاء الوردية' : 'End shift') : (isArabic ? 'بدء العمل' : 'Start shift')}
        </button>
      </div>

      {/* Stat Pills (Page 8) */}
      <div className="grid grid-cols-3 gap-2 mb-4 font-body">
        <div className="bg-white rounded-2xl p-3 border border-line text-center shadow-xs">
          <div className="text-xl font-extrabold text-navy font-display">4</div>
          <div className="text-[11px] text-slate font-medium">{isArabic ? 'مهام اليوم' : 'Jobs today'}</div>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-line text-center shadow-xs">
          <div className="text-xl font-extrabold text-emerald-600 font-display">2</div>
          <div className="text-[11px] text-slate font-medium">{isArabic ? 'مكتملة' : 'Completed'}</div>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-line text-center shadow-xs">
          <div className="text-xl font-extrabold text-amber-500 font-display flex items-center justify-center gap-1">
            <span>4.9</span>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[11px] text-slate font-medium">{isArabic ? 'تقييمي' : 'My rating'}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-ground rounded-xl mb-4 text-[11px] font-bold border border-line">
        <button
          onClick={() => setActiveTab('JOBS')}
          className={`py-2 rounded-lg transition flex flex-col items-center justify-center min-h-[38px] ${
            activeTab === 'JOBS' ? 'bg-white text-ink shadow-xs' : 'text-slate hover:text-ink'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-signal-orange mb-0.5" />
          <span>{isArabic ? 'المهام' : 'Jobs'}</span>
        </button>

        <button
          onClick={() => setActiveTab('VAN_STOCK')}
          className={`py-2 rounded-lg transition flex flex-col items-center justify-center min-h-[38px] ${
            activeTab === 'VAN_STOCK' ? 'bg-white text-ink shadow-xs' : 'text-slate hover:text-ink'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-ocean-blue mb-0.5" />
          <span>{isArabic ? 'المخزون' : 'Van'}</span>
        </button>

        <button
          onClick={() => setActiveTab('PERFORMANCE')}
          className={`py-2 rounded-lg transition flex flex-col items-center justify-center min-h-[38px] ${
            activeTab === 'PERFORMANCE' ? 'bg-white text-ink shadow-xs' : 'text-slate hover:text-ink'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
          <span>{isArabic ? 'الأداء' : 'Score'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ME')}
          className={`py-2 rounded-lg transition flex flex-col items-center justify-center min-h-[38px] ${
            activeTab === 'ME' ? 'bg-white text-ink shadow-xs' : 'text-slate hover:text-ink'
          }`}
        >
          <User className="w-3.5 h-3.5 text-navy mb-0.5" />
          <span>{isArabic ? 'حسابي' : 'Me'}</span>
        </button>
      </div>


      {/* ========================================================================================= */}
      {/* TAB 1: TODAY'S JOBS & EXECUTION WORKFLOW */}
      {/* ========================================================================================= */}
      {activeTab === 'JOBS' && (
        <>
          {/* Completed Job Success Screen */}
          {jobFinished ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-xl text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-1">Work Order Completed!</h2>
              <p className="text-xs text-slate-500 mb-4">
                Successfully signed off by <span className="font-bold text-slate-800">{signedName}</span>.
                Electronic VAT Invoice <span className="font-bold text-teal-800 font-mono">{completedInvoiceNumber}</span> ({vat.totalAmount.toFixed(2)} AED) has been transmitted to customer and operations ledger.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs mb-5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-800">{activeJob.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Labour Time:</span>
                  <span className="font-bold text-slate-800">{formatStopwatch(stopwatchSeconds)} ({labourCost.toFixed(2)} AED)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parts Used:</span>
                  <span className="font-bold text-slate-800">{totalPartsCost.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-sm">
                  <span>Grand Total (Inc 5% VAT):</span>
                  <span className="text-teal-800">{vat.totalAmount.toFixed(2)} AED</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setJobFinished(false);
                  const updated = jobs.map((j) => (j.id === activeJob.id ? { ...j, status: JobStatus.IN_PROGRESS } : j));
                  setJobs(updated);
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                ← Return to Daily Work Orders
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Daily Schedule Carousel / Selector (Page 8) */}
              <div>
                {/* Hero NOW Card (Page 8) */}
                <div className="p-4 bg-white rounded-2xl border-2 border-signal-orange/60 shadow-sm space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-signal-orange uppercase tracking-wider font-display flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-signal-orange animate-ping" />
                        <span>NOW · WO-24817</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase">
                      High priority
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-ink font-display">
                      {isArabic ? 'المكيف لا يبرد • غرفة النوم ٢' : 'AC not cooling · Bedroom 2'}
                    </h3>
                    <p className="text-xs text-slate mt-0.5">
                      Fatima Al Mansoori · Villa 14, Arabian Ranches
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedJobId('wo-24817')}
                      className="flex-1 py-2.5 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'فتح المهمة' : 'Open job'}</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=25.0534,55.2530`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 border border-line text-ink hover:bg-ground font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Navigation className="w-3.5 h-3.5 text-ocean-blue" />
                      <span>{isArabic ? 'ملاحة' : 'Navigate'}</span>
                    </a>
                  </div>
                </div>

                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate mb-2 px-1 flex items-center justify-between font-display">
                  <span>{isArabic ? 'جدول مهام اليوم' : "Today's Schedule"}</span>
                  <span className="text-slate/70 font-mono">{jobs.length} Jobs Total</span>
                </div>

                <div className="space-y-2">
                  {jobs.map((job) => {
                    const isSelected = job.id === selectedJobId;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-white border-signal-orange shadow-xs ring-1 ring-signal-orange/40'
                            : 'bg-white border-line hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold font-mono text-ink bg-ground px-2 py-0.5 rounded">
                              {job.orderNumber}
                            </span>
                            <span className="text-[10px] font-bold text-slate bg-ground px-2 py-0.5 rounded border border-line">
                              {job.scheduledTime}
                            </span>
                          </div>

                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              job.priority === Priority.EMERGENCY
                                ? 'bg-red-100 text-red-800'
                                : job.priority === Priority.HIGH
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-ground text-slate'
                            }`}
                          >
                            {job.priority}
                          </span>
                        </div>

                        <div className="font-extrabold text-xs text-ink line-clamp-1 mb-1 font-display">{job.title}</div>
                        <div className="text-[11px] text-slate flex items-center justify-between">
                          <span className="truncate max-w-[220px]">{job.address}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              job.status === JobStatus.IN_PROGRESS
                                ? 'text-signal-orange bg-signal-orange/10 font-bold'
                                : job.status === JobStatus.COMPLETED
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-slate bg-ground'
                            }`}
                          >
                            {job.status === JobStatus.COMPLETED ? '✓ Completed' : job.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Job Detail Card (Page 9) */}
              <div className="bg-white rounded-2xl border border-line p-4 shadow-xs space-y-4">
                {/* 5-Stage Stepper (Page 9) */}
                <div className="bg-ground rounded-2xl p-3 border border-line shadow-xs">
                  <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-display">
                    {[
                      { step: 1, label: 'Assigned', state: 'done' },
                      { step: 2, label: 'Travel', state: activeJob.status === JobStatus.ASSIGNED ? 'current' : 'done' },
                      { step: 3, label: 'On site', state: activeJob.status === JobStatus.ARRIVED || activeJob.status === JobStatus.IN_PROGRESS || activeJob.status === JobStatus.COMPLETED ? 'done' : 'upcoming' },
                      { step: 4, label: 'Working', state: activeJob.status === JobStatus.IN_PROGRESS ? 'active' : activeJob.status === JobStatus.COMPLETED ? 'done' : 'upcoming' },
                      { step: 5, label: 'Done', state: activeJob.status === JobStatus.COMPLETED ? 'done' : 'upcoming' },
                    ].map((st) => (
                      <div key={st.step} className="space-y-1">
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${
                          st.state === 'done'
                            ? 'bg-emerald-600 text-white'
                            : st.state === 'active'
                            ? 'bg-signal-orange text-white animate-pulse'
                            : st.state === 'current'
                            ? 'bg-ocean-blue text-white'
                            : 'bg-white border border-line text-slate'
                        }`}>
                          {st.state === 'done' ? '✓' : st.step}
                        </div>
                        <div className={`truncate ${
                          st.state === 'active' || st.state === 'done' ? 'font-bold text-ink' : 'text-slate'
                        }`}>
                          {st.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-navy font-mono">{activeJob.orderNumber}</span>
                    <span className="text-[10px] font-mono text-slate">Scheduled: {activeJob.scheduledTime}</span>
                  </div>
                  <h1 className="font-extrabold text-base text-ink leading-snug font-display">{activeJob.title}</h1>
                  <p className="text-xs text-slate mt-1">{activeJob.description}</p>
                </div>

                {/* SLA Countdown Timer */}
                <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>SLA Response Target:</span>
                  </div>
                  <span className="font-mono font-extrabold text-amber-800 bg-white px-2 py-0.5 rounded-lg border border-amber-300">
                    1h 23m remaining
                  </span>
                </div>

                {/* Registered Asset Information */}
                <div className="p-3 bg-ground rounded-xl border border-line flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-ocean-blue shrink-0" />
                    <div>
                      <div className="font-bold text-ink">Asset: AST-VIL-041 (Daikin 4-Ton VRV)</div>
                      <div className="text-[10px] text-slate font-mono">SN: DKN-VRV-901842-DXB · Roof Platform</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAssetModal(true)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-ocean-blue border border-line rounded-lg font-bold text-xs transition"
                  >
                    View Asset
                  </button>
                </div>

                {/* Assigned Team & Helper Section */}
                <div className="p-3 bg-ground rounded-xl border border-line space-y-2 text-xs">
                  <div className="text-[10px] font-extrabold uppercase text-slate font-display flex items-center justify-between">
                    <span>Assigned Team & Helper</span>
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono text-[9px] border border-emerald-200">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                        IK
                      </div>
                      <div>
                        <div className="font-bold text-ink">Imran Khan (Helper Technician)</div>
                        <div className="text-[10px] text-slate font-mono">xxxxxxxxx</div>
                      </div>
                    </div>
                    <a
                      href="tel:xxxxxxxxx"
                      className="p-2 rounded-xl bg-white border border-line text-emerald-700 hover:bg-emerald-50 transition"
                      title="Call Helper"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Customer Contact & Actions (Page 9) */}
                <div className="p-3 bg-ground rounded-xl border border-line text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate font-display">Customer</div>
                      <div className="font-extrabold text-ink text-sm font-display">{activeJob.clientName}</div>
                      <div className="text-[11px] text-slate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-signal-orange shrink-0" />
                        <span>{activeJob.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/xxxxxxxxx?text=Hello%20Fatima,%20this%20is%20Rashid%20from%20FIXnGO`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition shadow-xs border border-emerald-200 flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <a
                        href={`tel:${activeJob.clientPhone}`}
                        className="p-2.5 bg-signal-orange/10 text-signal-orange rounded-xl hover:bg-signal-orange/20 transition shadow-xs border border-signal-orange/30 flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Deep link to Google Maps */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeJob.lat},${activeJob.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-navy hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
                  >
                    <Navigation className="w-3.5 h-3.5 text-signal-orange" />
                    <span>Navigate with Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-slate-300" />
                  </a>
                </div>

                {/* Site Access Notes & Gate Security */}
                <div className="p-3 bg-ground rounded-xl border border-line text-xs space-y-2">
                  <div className="text-[10px] font-extrabold uppercase text-slate font-display flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-signal-orange" />
                      <span>{isArabic ? 'تصريح ودخول الموقع' : 'Site Access & Gate Security'}</span>
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                      CLEARANCE GRANTED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-lg border border-line">
                      <span className="text-slate block text-[10px]">{isArabic ? 'رمز بوابة الدخول:' : 'Gate Security Code:'}</span>
                      <span className="font-mono font-bold text-ink">#4092</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-line">
                      <span className="text-slate block text-[10px]">{isArabic ? 'موقف الفنيين:' : 'Designated Parking:'}</span>
                      <span className="font-bold text-ink">Bay 14 (Visitor)</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-0.5 flex items-center justify-between">
                    <span>Community Gate 2 Guardhouse</span>
                    <span className="font-mono text-slate-600">xxxxxxxxx</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="p-3 bg-ground rounded-xl border border-line text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="text-[10px] font-extrabold uppercase text-slate font-display">
                        {isArabic ? 'حالة الدفع والتحصيل' : 'Payment Collection Status'}
                      </div>
                      <div className="font-bold text-ink">
                        {activeJob.status === JobStatus.COMPLETED
                          ? (isArabic ? 'تم التحصيل بالكامل: ' : 'Paid in Full: ') + vat.totalAmount.toFixed(2) + ' AED'
                          : (isArabic ? 'نقداً للتحصيل: ' : 'Cash to Collect: ') + vat.totalAmount.toFixed(2) + ' AED'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    activeJob.status === JobStatus.COMPLETED
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {activeJob.status === JobStatus.COMPLETED ? 'PAID' : 'PENDING'}
                  </span>
                </div>

                {/* State Machine Action Bar (Signal Orange Primary, min-h-[44px]) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-ink px-1 font-display">
                    <span>Workflow Stage:</span>
                    <span className="font-mono text-navy uppercase text-[11px] bg-ground px-2 py-0.5 rounded border border-line">
                      {activeJob.status}
                    </span>
                  </div>

                  {activeJob.status === JobStatus.ASSIGNED && (
                    <button
                      onClick={() => handleStatusTransition(JobStatus.EN_ROUTE)}
                      className="w-full py-3.5 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>START TRAVEL (En Route)</span>
                    </button>
                  )}

                  {activeJob.status === JobStatus.EN_ROUTE && (
                    <button
                      onClick={() => handleStatusTransition(JobStatus.ARRIVED)}
                      className="w-full py-3.5 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>TAP: I HAVE ARRIVED AT SITE</span>
                    </button>
                  )}

                  {activeJob.status === JobStatus.ARRIVED && (
                    <button
                      onClick={() => {
                        handleStatusTransition(JobStatus.IN_PROGRESS);
                        setIsStopwatchRunning(true);
                      }}
                      className="w-full py-3.5 bg-signal-orange hover:bg-signal-orange-hover text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>START EXECUTION (In Progress)</span>
                    </button>
                  )}

                  {activeJob.status === JobStatus.IN_PROGRESS && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setShowHoldModal(true)}
                          className="py-2.5 bg-ground hover:bg-slate-100 text-slate font-bold text-xs rounded-xl border border-line transition flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <Pause className="w-3.5 h-3.5 text-amber-600" />
                          <span>Put on Hold</span>
                        </button>

                        <button
                          onClick={() => {
                            if (!activePersona.canComplete) {
                              alert('Access Restriction: Only Lead Technician In-Charge can complete jobs and collect sign-off.');
                              return;
                            }
                            setShowSignOffModal(true);
                          }}
                          disabled={!activePersona.canComplete}
                          className={`py-2.5 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow min-h-[44px] ${
                            activePersona.canComplete
                              ? 'bg-signal-orange hover:bg-signal-orange-hover text-white'
                              : 'bg-ground text-slate cursor-not-allowed border border-line'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete & Sign</span>
                        </button>
                      </div>

                      {/* Helper role restriction alert notice */}
                      {!activePersona.canComplete && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-800 flex items-start gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>
                            Logged in as <b>Helper (Imran)</b>. You can log labour hours, checklist items, and photos. Only Lead Technician In-Charge (Rashid) can complete and sign off.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeJob.status === JobStatus.ON_HOLD && (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
                        <div className="font-black flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Job Currently On Hold</span>
                        </div>
                        <div className="text-[11px] text-amber-800">
                          Reason: {activeJob.holdReason || 'Awaiting spare parts from storekeeper'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStatusTransition(JobStatus.IN_PROGRESS)}
                        className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume Work Execution</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Auto-Timed Labour Stopwatch */}
                <div className="bg-slate-900 rounded-2xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>Labour Time Tracker (Auto-Timed)</span>
                    </span>
                    <span className="text-[10px] font-mono text-teal-300 bg-slate-800 px-2 py-0.5 rounded">
                      Rate: 105.00 AED/hr
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-2xl font-black tracking-wider text-teal-300">
                        {formatStopwatch(stopwatchSeconds)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Billable Labour: <span className="text-white font-bold">{labourCost.toFixed(2)} AED</span> ({labourHours} hrs)
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                        className={`p-2.5 rounded-xl transition ${
                          isStopwatchRunning
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {isStopwatchRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setStopwatchSeconds(0)}
                        className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checklist Section */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-700" />
                      <span>Task Execution Checklist</span>
                    </h3>
                    <span className="text-[11px] font-bold text-teal-800">
                      {completedChecklistCount} of {checklist.length} ({checklistPercentage}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-teal-700 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${checklistPercentage}%` }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center gap-2.5 transition ${
                          item.done
                            ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900 line-through'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => {}}
                          className="w-4 h-4 accent-teal-700 rounded shrink-0 cursor-pointer"
                        />
                        <span className="text-[11px] leading-tight font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Van Parts Fitted & Consumed */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-teal-700" />
                      <span>Van Inventory Fitted on Site</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {partsUsed.length} item(s)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {partsUsed.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div>
                          <div className="font-bold text-slate-800 text-[11px]">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Qty: {p.qty} × {p.price.toFixed(2)} AED ({p.sku})
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-xs">
                            {(p.qty * p.price).toFixed(2)} AED
                          </span>
                          <button
                            onClick={() => handleRemovePartUsed(p.id)}
                            className="text-slate-400 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Add From Van Inventory */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 mb-1">Quick Add From Van #01:</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {vanStock.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleAddPartFromVan(item)}
                          disabled={item.stock <= 0}
                          className="p-2 text-left bg-teal-50/60 hover:bg-teal-100/60 border border-teal-200 rounded-xl text-[10px] transition disabled:opacity-40"
                        >
                          <div className="font-bold text-slate-800 line-clamp-1">{item.name}</div>
                          <div className="flex justify-between text-slate-500 font-mono mt-0.5">
                            <span>{item.unitPrice} AED</span>
                            <span className="text-teal-700 font-bold">{item.stock} in van</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Removed / Salvaged Parts */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-amber-600" />
                      <span>Removed Old Parts (Condition Log)</span>
                    </h3>
                    <button
                      onClick={() => setShowAddRemovedModal(true)}
                      className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
                    >
                      + Log Removed
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {removedParts.map((rp) => (
                      <div
                        key={rp.id}
                        className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{rp.name}</div>
                          <div className="text-[10px] text-amber-700 font-semibold">{rp.condition}</div>
                        </div>
                        <span className="text-[9px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {rp.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expenses Incurred */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-700" />
                      <span>Job Expenses & Tolls</span>
                    </h3>
                    <button
                      onClick={() => setShowAddExpenseModal(true)}
                      className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
                    >
                      + Add Expense
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]"
                      >
                        <span className="font-semibold text-slate-700">{exp.category}</span>
                        <span className="font-black text-slate-900">{exp.amount.toFixed(2)} AED</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proof of Work: Before/After Photos & Documents */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-teal-700" />
                      <span>Proof of Work Documentation</span>
                    </h3>
                    <div className="flex gap-1 text-[10px] font-extrabold">
                      <button
                        onClick={() => setPhotoType('BEFORE')}
                        className={`px-2 py-0.5 rounded ${photoType === 'BEFORE' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        Before ({beforePhotos.length})
                      </button>
                      <button
                        onClick={() => setPhotoType('AFTER')}
                        className={`px-2 py-0.5 rounded ${photoType === 'AFTER' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        After ({afterPhotos.length})
                      </button>
                      <button
                        onClick={() => setPhotoType('DOCS')}
                        className={`px-2 py-0.5 rounded ${photoType === 'DOCS' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        Docs
                      </button>
                    </div>
                  </div>

                  {/* Photo Display */}
                  {photoType === 'BEFORE' && (
                    <div className="grid grid-cols-2 gap-2">
                      {beforePhotos.map((url, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <img src={url} alt="Before work" className="w-full h-24 object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            BEFORE
                          </span>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const demoBefore = 'https://images.unsplash.com/photo-1542013936693-884638332954?w=400';
                          setBeforePhotos([...beforePhotos, demoBefore]);
                          showToast('Captured BEFORE photo.');
                        }}
                        className="h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs hover:bg-slate-50 transition"
                      >
                        <Camera className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold">Snap Before</span>
                      </button>
                    </div>
                  )}

                  {photoType === 'AFTER' && (
                    <div className="grid grid-cols-2 gap-2">
                      {afterPhotos.map((url, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                          <img src={url} alt="After work" className="w-full h-24 object-cover" />
                          <span className="absolute bottom-1 left-1 bg-emerald-950/80 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                            AFTER
                          </span>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const demoAfter = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400';
                          setAfterPhotos([...afterPhotos, demoAfter]);
                          showToast('Captured AFTER photo.');
                        }}
                        className="h-24 border-2 border-dashed border-teal-300 bg-teal-50/30 rounded-xl flex flex-col items-center justify-center text-teal-800 text-xs hover:bg-teal-50 transition"
                      >
                        <Camera className="w-5 h-5 mb-1 text-teal-700" />
                        <span className="text-[10px] font-bold">Snap After</span>
                      </button>
                    </div>
                  )}

                  {photoType === 'DOCS' && (
                    <div className="space-y-1.5">
                      {documents.map((doc, i) => (
                        <div
                          key={i}
                          className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-700" />
                            <span className="font-bold text-slate-800 text-[11px]">{doc}</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Billable Total Breakdown */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Callout Fee:</span>
                    <span className="font-mono">{activeJob.baseFee.toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Labour ({labourHours} hrs @ 105 AED):</span>
                    <span className="font-mono">{labourCost.toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Van Parts ({partsUsed.length} items):</span>
                    <span className="font-mono">{totalPartsCost.toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Expenses & Parking:</span>
                    <span className="font-mono">{totalExpensesCost.toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                    <span>UAE VAT (5%):</span>
                    <span className="font-mono">{vat.vatAmount.toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-sm pt-1">
                    <span>Estimated Total:</span>
                    <span className="text-teal-800 font-mono">{vat.totalAmount.toFixed(2)} AED</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================================= */}
      {/* TAB 2: VAN STOCK INVENTORY & STORE REQUISITION */}
      {/* ========================================================================================= */}
      {activeTab === 'VAN_STOCK' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-teal-400">Mobile Van Inventory</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
                Van #01 - Dubai
              </span>
            </div>
            <h2 className="font-black text-base">Standard Service Inventory</h2>
            <p className="text-xs text-slate-400 mt-1">
              Materials replenished weekly from Al Quoz Central Warehouse. Issued parts automatically decrement your van ledger.
            </p>

            <button
              onClick={() => setShowStoreRequestModal(true)}
              className="mt-3 w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request Materials from Storekeeper Bilal</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
            <div className="text-xs font-black text-slate-800 mb-2">Current Van Shelf Contents ({vanStock.length} SKUs):</div>

            <div className="space-y-2">
              {vanStock.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-extrabold text-slate-900 text-[11px]">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      SKU: {item.sku} • {item.unitPrice.toFixed(2)} AED / {item.unit}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        item.stock <= 2
                          ? 'bg-red-100 text-red-800'
                          : item.stock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.stock} {item.unit}
                    </span>
                    {item.stock <= 2 && (
                      <div className="text-[9px] text-red-600 font-bold mt-1">Low Stock!</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 3: PERFORMANCE SCORECARD */}
      {/* ========================================================================================= */}
      {activeTab === 'PERFORMANCE' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-teal-400">Technician Excellence</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                Rank #1 in Dubai
              </span>
            </div>
            <h2 className="font-black text-base">{activePersona.name}</h2>
            <div className="text-xs text-slate-400 mt-1">{activePersona.role} • 6 Months Service</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">First-Time Fix (FTF)</div>
              <div className="text-2xl font-black text-teal-800 mt-1">96.4%</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">Target: &gt;90% (+6.4%)</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Customer CSAT</div>
              <div className="text-2xl font-black text-amber-600 mt-1 flex items-center gap-1">
                <span>4.95</span>
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div className="text-[10px] text-slate-500 mt-1">From 142 client ratings</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Jobs Done This Month</div>
              <div className="text-2xl font-black text-slate-900 mt-1">64</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">100% SLA Compliant</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Monthly Commission</div>
              <div className="text-2xl font-black text-slate-900 mt-1">1,450 <span className="text-xs font-bold text-slate-500">AED</span></div>
              <div className="text-[10px] text-teal-700 font-semibold mt-1">Performance bonus</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs font-black text-slate-900 mb-2">Professional Certifications & Badges:</div>
            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">DEWA Certified Electrical Contractor</div>
                  <div className="text-[10px] text-slate-500">Registration #DEWA-TECH-2024-881</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-teal-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">HVAC R410A Handling & Safety Gold Badge</div>
                  <div className="text-[10px] text-slate-500">Dubai Civil Defence & TUV Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 4: ME SCREEN (Profile, Today's Hours, Weekly Jobs, Rating, Van Stock, Log Out) */}
      {/* ========================================================================================= */}
      {activeTab === 'ME' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-line p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-navy text-white text-base font-black flex items-center justify-center shrink-0 border border-line overflow-hidden">
                {activePersona.avatar ? (
                  <img src={activePersona.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  'RK'
                )}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base text-ink font-display">{activePersona.name}</h2>
                  <span className="text-[10px] font-mono bg-ground text-navy px-2 py-0.5 rounded font-bold border border-line">
                    {activePersona.id}
                  </span>
                </div>
                <div className="text-xs text-signal-orange font-bold">{activePersona.role}</div>
                <div className="text-[11px] text-slate mt-0.5">{activePersona.trade}</div>
              </div>
            </div>

            <div className="p-3 bg-ground rounded-xl border border-line space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate">{isArabic ? 'المركبة المعينة:' : 'Assigned Fleet:'}</span>
                <span className="font-bold text-ink">{activePersona.van}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">{isArabic ? 'رقم الهاتف المباشر:' : 'Direct Phone:'}</span>
                <span className="font-mono font-bold text-ink">{activePersona.phone}</span>
              </div>
              <div className="flex justify-between border-t border-line/60 pt-2">
                <span className="text-slate">{isArabic ? 'حالة الحضور:' : 'Attendance:'}</span>
                <span className="font-bold text-emerald-700">
                  {clockedIn ? `${isArabic ? 'على رأس العمل منذ' : 'Clocked In at'} ${clockInTime}` : (isArabic ? 'خارج المناوبة' : 'Off Duty')}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded-2xl border border-line p-3.5 shadow-xs">
              <div className="text-[10px] font-extrabold uppercase text-slate font-display">{isArabic ? 'ساعات اليوم' : "Today's Hours"}</div>
              <div className="text-2xl font-black text-navy font-display mt-1">6.5 <span className="text-xs font-bold text-slate">hrs</span></div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">1h 08m on active order</div>
            </div>

            <div className="bg-white rounded-2xl border border-line p-3.5 shadow-xs">
              <div className="text-[10px] font-extrabold uppercase text-slate font-display">{isArabic ? 'إنجاز الأسبوع' : 'Weekly Jobs Done'}</div>
              <div className="text-2xl font-black text-navy font-display mt-1">18</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">98% First-Time Fix</div>
            </div>

            <div className="bg-white rounded-2xl border border-line p-3.5 shadow-xs">
              <div className="text-[10px] font-extrabold uppercase text-slate font-display">{isArabic ? 'تقييم العملاء' : 'Customer Rating'}</div>
              <div className="text-2xl font-black text-amber-500 font-display mt-1 flex items-center gap-1">
                <span>4.9</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-[10px] text-slate mt-1">142 verified reviews</div>
            </div>

            <div className="bg-white rounded-2xl border border-line p-3.5 shadow-xs">
              <div className="text-[10px] font-extrabold uppercase text-slate font-display">{isArabic ? 'مخزون المركبة' : 'Van Stock'}</div>
              <div className="text-2xl font-black text-navy font-display mt-1">42 <span className="text-xs font-bold text-slate">parts</span></div>
              <button
                onClick={() => setActiveTab('VAN_STOCK')}
                className="text-[10px] text-ocean-blue font-bold mt-1 underline block text-start"
              >
                Inspect Van DXB-12 →
              </button>
            </div>
          </div>

          {/* Log Out Button */}
          <div className="pt-2">
            <button
              onClick={handleInitiateLogout}
              className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>{isArabic ? 'إنهاء المناوبة وتسجيل الخروج' : 'End Shift & Log Out'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODALS */}
      {/* ========================================================================================= */}

      {/* 1. HOLD JOB MODAL */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <Pause className="w-4 h-4 text-amber-600" />
                <span>Place Job on Hold</span>
              </h3>
              <button onClick={() => setShowHoldModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500 mb-3">
              Putting a job on hold sends an immediate operational notification to Dubai Dispatch and halts the active SLA timer.
            </div>

            <div className="space-y-2 mb-4 text-xs font-semibold">
              {[
                'Awaiting customer approval for additional replacement parts',
                'Awaiting parts delivery from central warehouse (Bilal)',
                'DEWA municipal water/electricity shutoff scheduled',
                'Safety hazard detected on site (Structural/Electrical)',
              ].map((reason, i) => (
                <div
                  key={i}
                  onClick={() => setHoldReason(reason)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition ${
                    holdReason === reason
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {reason}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowHoldModal(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowHoldModal(false);
                  handleStatusTransition(JobStatus.ON_HOLD, holdReason);
                }}
                className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition shadow"
              >
                Confirm Hold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTOMER SIGN-OFF & COMPLETE MODAL */}
      {showSignOffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-teal-700" />
                  <span>Customer Sign-Off & Rating</span>
                </h3>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{activeJob.orderNumber} • {activeJob.title}</div>
              </div>
              <button onClick={() => setShowSignOffModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bill Summary */}
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl mb-4 text-xs">
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Final Invoice Amount:</span>
                <span className="text-teal-900 font-black font-mono text-sm">{vat.totalAmount.toFixed(2)} AED</span>
              </div>
              <div className="text-[10px] text-teal-700">Includes 5% UAE VAT ({vat.vatAmount.toFixed(2)} AED) & fitted van stock parts.</div>
            </div>

            {/* 5-Star Customer Rating */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Customer Satisfaction (CSAT):</label>
              <div className="flex items-center gap-2 justify-center py-2 bg-slate-50 border border-slate-200 rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setCustomerRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= customerRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Signer Name */}
            <div className="mb-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Signer Name:</label>
              <input
                type="text"
                value={signedName}
                onChange={(e) => setSignedName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 font-semibold"
                placeholder="Full name of customer on site"
              />
            </div>

            {/* Customer Feedback Notes */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Notes / Feedback:</label>
              <input
                type="text"
                value={customerComments}
                onChange={(e) => setCustomerComments(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                placeholder="e.g. Great prompt service, clean workmanship"
              />
            </div>

            {/* Touch Signature Pad (Canvas) */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Sign Here (Finger / Stylus):</span>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="text-[10px] text-teal-700 font-bold hover:underline"
                >
                  Clear Pad
                </button>
              </div>

              <div className="border border-slate-300 rounded-2xl overflow-hidden bg-slate-50 relative shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={130}
                  onMouseDown={handleStartDraw}
                  onMouseMove={handleDraw}
                  onMouseUp={handleStopDraw}
                  onMouseLeave={handleStopDraw}
                  onTouchStart={handleStartDraw}
                  onTouchMove={handleDraw}
                  onTouchEnd={handleStopDraw}
                  style={{ touchAction: 'none' }}
                  className="w-full h-[130px] cursor-crosshair"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                    Touch & drag to capture customer signature
                  </div>
                )}
                <div className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono pointer-events-none">
                  UAE E-Sign Compliance
                </div>
              </div>
            </div>

            <button
              onClick={handleFinalCompleteJob}
              className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Job & Transmit Invoice</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. REQUEST MATERIALS FROM STORE MODAL */}
      {showStoreRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-700" />
                <span>Request Store Materials</span>
              </h3>
              <button onClick={() => setShowStoreRequestModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitStoreRequest} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] text-slate-500">Destination Warehouse:</div>
                <div className="font-bold text-slate-800">Al Quoz Central Warehouse (Storekeeper Bilal)</div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Material:</label>
                <select
                  value={requestedItemName}
                  onChange={(e) => setRequestedItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 font-semibold"
                >
                  <option value="R410A Refrigerant 11.3kg Cylinder">R410A Refrigerant 11.3kg Cylinder</option>
                  <option value="Grohe Chrome Heavy Angle Valve 1/2&quot;">Grohe Chrome Heavy Angle Valve 1/2&quot;</option>
                  <option value="Flexible Braided Stainless Hose 50cm">Flexible Braided Stainless Hose 50cm</option>
                  <option value="Schneider Electric MCB 32A 3-Phase">Schneider Electric MCB 32A 3-Phase</option>
                  <option value="PPR Pipes 25mm 4m Length">PPR Pipes 25mm 4m Length</option>
                  <option value="PTFE Teflon Heavy Duty Seal Tape">PTFE Teflon Heavy Duty Seal Tape</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quantity Needed:</label>
                  <input
                    type="number"
                    min="1"
                    value={requestedItemQty}
                    onChange={(e) => setRequestedItemQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority:</label>
                  <select
                    value={requestUrgency}
                    onChange={(e: any) => setRequestUrgency(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 font-semibold"
                  >
                    <option value="STANDARD">Regular Stocking</option>
                    <option value="URGENT_SITE">URGENT (Site Need)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes for Storekeeper Bilal:</label>
                <input
                  type="text"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="e.g. Needed for Villa 24 active emergency leak"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowStoreRequestModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-xl transition shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD REMOVED PART MODAL */}
      {showAddRemovedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-amber-600" />
                <span>Log Removed Part</span>
              </h3>
              <button onClick={() => setShowAddRemovedModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRemovedPart} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Part Description:</label>
                <input
                  type="text"
                  value={newRemovedName}
                  onChange={(e) => setNewRemovedName(e.target.value)}
                  placeholder="e.g. Cracked Brass Valve 1/2-inch"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Disposal Condition:</label>
                <select
                  value={newRemovedCondition}
                  onChange={(e) => setNewRemovedCondition(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 font-semibold"
                >
                  <option value="Scrapped / Defective">Scrapped / Defective</option>
                  <option value="Salvaged / Reconditioning">Salvaged / Reconditioning</option>
                  <option value="Hazardous / E-Waste">Hazardous / E-Waste</option>
                </select>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRemovedModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-xl transition shadow"
                >
                  Log Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-700" />
                <span>Add On-Site Expense</span>
              </h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Expense Category:</label>
                <select
                  value={newExpenseCat}
                  onChange={(e) => setNewExpenseCat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 font-semibold"
                >
                  <option value="RTA Paid Parking (Zone B)">RTA Paid Parking (Zone B)</option>
                  <option value="Salik Toll (SZR Gate)">Salik Toll (SZR Gate)</option>
                  <option value="Emergency Hardware Consumables">Emergency Hardware Consumables</option>
                  <option value="Site Disposal Fee">Site Disposal Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Amount (AED):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 font-semibold"
                  required
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-xl transition shadow"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ASSET DETAILS MODAL */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-line animate-in fade-in zoom-in-95 duration-150 text-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-ocean-blue" />
                <h3 className="font-black text-sm text-navy">Asset Details</h3>
              </div>
              <button onClick={() => setShowAssetModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-ground rounded-xl border border-line space-y-2">
              <div className="flex justify-between">
                <span className="text-slate">Asset Tag:</span>
                <span className="font-mono font-bold text-ocean-blue">AST-VIL-041</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Equipment Model:</span>
                <span className="font-bold text-ink">Daikin VRV-IV X 4-Ton</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Serial Number:</span>
                <span className="font-mono font-bold text-ink">DKN-VRV-901842-DXB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Installation Date:</span>
                <span className="font-bold text-ink">15 Jan 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Location:</span>
                <span className="font-bold text-ink">Roof Platform Deck</span>
              </div>
              <div className="flex justify-between border-t border-line/60 pt-1.5">
                <span className="text-slate">Coverage Status:</span>
                <span className="font-bold text-emerald-700">Gold AMC 24/7 (Active)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase text-slate">Service History Log</div>
              <div className="p-2.5 bg-white border border-line rounded-xl space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>14 Jun 2026: Compressor oil & filter replacement</span>
                  <span className="font-mono text-emerald-600 font-bold">Passed</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>10 Mar 2026: Quarterly PPM electrical torque test</span>
                  <span className="font-mono text-emerald-600 font-bold">Passed</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>12 Dec 2025: R410A pressure recalibration</span>
                  <span className="font-mono text-emerald-600 font-bold">Passed</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAssetModal(false)}
              className="w-full py-2.5 bg-navy text-white font-bold rounded-xl"
            >
              Close Asset View
            </button>
          </div>
        </div>
      )}

      {/* 7. END SHIFT & LOGOUT CONFIRMATION MODAL */}
      {showEndShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-line text-xs space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-black text-sm text-navy font-display">
                {isArabic ? 'إنهاء المناوبة وتسجيل الخروج؟' : 'End shift and log out?'}
              </h3>
            </div>
            <p className="text-slate-600">
              {isArabic
                ? 'أنت على رأس العمل حالياً ولديك مهام نشطة. تسجيل الخروج سينهي مناوبتك ويوقف مشاركة الموقع المباشر.'
                : 'You are currently on duty with an active work order in progress. Logging out will end your shift and stop live GPS telemetry.'}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowEndShiftModal(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEndShiftModal(false);
                  setClockedIn(false);
                  setIsStopwatchRunning(false);
                  performLogout(locale);
                }}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition shadow"
              >
                {isArabic ? 'تأكيد الخروج' : 'End Shift & Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
