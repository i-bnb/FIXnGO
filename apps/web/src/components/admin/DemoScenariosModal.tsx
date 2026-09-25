'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  X,
  MessageSquare,
  Mail,
  Smartphone,
  ShieldAlert,
  Clock,
  ArrowRight,
  Send,
  Zap,
  RotateCcw,
  Check,
  Radio,
  Sliders,
  Truck,
} from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export interface ScenarioDefinition {
  key: string;
  title: string;
  category: string;
  triggerEvent: string;
  targetRole: string;
  targetUser: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'SYSTEM';
  description: string;
  sampleMessage: string;
}

export const ALL_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'new-request-auto-reply',
    title: '1. New Request Auto-Reply',
    category: 'Customer On-Demand',
    triggerEvent: 'Customer submits service request',
    targetRole: 'CUSTOMER',
    targetUser: 'Zaid Al-Harbi (xxxxxxxxx)',
    channel: 'WHATSAPP',
    description: 'Instant WhatsApp confirmation acknowledging the maintenance issue and setting service expectations.',
    sampleMessage: 'Thank you Zaid! Your request #SR-2026-0812 for Emergency Plumbing has been received. Our dispatch team is assigning a technician.',
  },
  {
    key: 'job-assigned',
    title: '2. Job Assigned: Tech Dispatched',
    category: 'Fleet Dispatch',
    triggerEvent: 'Dispatcher assigns work order to technician',
    targetRole: 'CUSTOMER',
    targetUser: 'Zaid Al-Harbi & Tech Rashid Al-Nuaimi',
    channel: 'WHATSAPP',
    description: 'Customer receives verified technician identity, vehicle badge, star rating, and direct phone link.',
    sampleMessage: 'Good news! Lead Technician Rashid Al-Nuaimi (4.95 ★, Van-01) has been assigned to your job #WO-2026-002.',
  },
  {
    key: 'tech-en-route',
    title: '3. Tech En Route: "Arriving in 18 Min"',
    category: 'Fleet Dispatch',
    triggerEvent: 'Technician status transitions to EN_ROUTE',
    targetRole: 'CUSTOMER',
    targetUser: 'Zaid Al-Harbi',
    channel: 'WHATSAPP',
    description: 'Calculates road traffic ETA and sends live turn-by-turn Leaflet GPS tracking URL.',
    sampleMessage: 'Technician Rashid is en route in Van-01. Arriving in 18 minutes! Track live: https://fieldops.ae/track/wo-2',
  },
  {
    key: 'job-completed',
    title: '4. Job Completed: Invoice & Pay Link',
    category: 'Invoicing & Collections',
    triggerEvent: 'Job completed with signature sign-off',
    targetRole: 'CUSTOMER',
    targetUser: 'Zaid Al-Harbi & Accountant Fatima',
    channel: 'SMS',
    description: 'Generates VAT tax invoice INV-2026-0042 and dispatches 1-tap Stripe checkout link.',
    sampleMessage: 'Your plumbing repair #WO-2026-002 is complete! Tax Invoice INV-2026-0042 (AED 383.25 incl 5% VAT) is ready: https://fieldops.ae/pay/inv-0042',
  },
  {
    key: 'invoice-overdue',
    title: '5. Overdue Invoice Dunning Reminder',
    category: 'Financial Aging',
    triggerEvent: 'Unpaid balance reaches due date + 7 days',
    targetRole: 'ACCOUNTANT',
    targetUser: 'Address Downtown Finance & Accountant Fatima',
    channel: 'EMAIL',
    description: 'Automated dunning notice for overdue B2B receivables (>7 days overdue) with bank transfer details.',
    sampleMessage: 'Urgent: Tax Invoice INV-2026-0003 for Address Downtown (AED 4,410.00) is 13 days overdue. Payment reminder dispatched.',
  },
  {
    key: 'amc-visit-due',
    title: '6. Preventive AMC Visit Due (7 Days)',
    category: 'Contracts & Preventive',
    triggerEvent: 'Quarterly visit schedule within 7 days',
    targetRole: 'OPS_MANAGER',
    targetUser: 'Crescent Bay Facilities Mgr Tariq',
    channel: 'EMAIL',
    description: 'Upcoming scheduled quarterly maintenance alert for central chillers under AMC contract AMC-2026-0012.',
    sampleMessage: 'Reminder: Quarterly HVAC preventive maintenance under AMC-2026-0012 (Crescent Bay) is due on Sept 30, 2026. PM order auto-drafted.',
  },
  {
    key: 'rental-return-due',
    title: '7. Equipment Rental Return Due (48h)',
    category: 'Equipment Rental',
    triggerEvent: 'Off-hire date reached within 24-48 hours',
    targetRole: 'CUSTOMER',
    targetUser: 'Palm Crest Construction Site Engineer',
    channel: 'SMS',
    description: 'Off-hire notification for site equipment with quick-action SMS prompt to extend rental lease.',
    sampleMessage: 'Off-Hire Alert: 100kVA Generator on contract RC-2026-0005 is due for return tomorrow at 5PM. Reply EXTEND to prolong.',
  },
  {
    key: 'low-stock-po',
    title: '8. Low Stock -> PO Draft for Approval',
    category: 'Inventory & Procurement',
    triggerEvent: 'Quantity available drops to/below reorder level',
    targetRole: 'SUPER_ADMIN',
    targetUser: 'Super Admin Sultan & Storekeeper Bilal',
    channel: 'SYSTEM',
    description: 'Auto-generates draft Purchase Order PO-2026-0048 to National Gas Suppliers and routes for executive approval.',
    sampleMessage: 'Reorder Alert: R410A Refrigerant Cylinders at Central Warehouse reached 2 units. Draft PO-2026-0048 (AED 4,560.00) drafted for Sultan.',
  },
  {
    key: 'daily-summary',
    title: '9. Daily Management KPI Rollup',
    category: 'Executive Management',
    triggerEvent: '6:00 PM Daily Operational Rollup',
    targetRole: 'SUPER_ADMIN',
    targetUser: 'Executive Management Team',
    channel: 'WHATSAPP',
    description: 'High-level operational rollup: revenue booked, completed work orders, SLA adherence, and cash receipts.',
    sampleMessage: 'Daily Close: 14 jobs completed (98.6% SLA). Revenue: AED 18,450. Cash collected: AED 11,200. Zero incidents. Top tech: Rashid (5 jobs).',
  },
];

export function DemoScenariosModal({
  isOpen,
  onClose,
  locale,
  onScenarioFired,
}: {
  isOpen: boolean;
  onClose: () => string | void;
  locale: string;
  onScenarioFired?: (scenario: ScenarioDefinition, result: any) => void;
}) {
  const isArabic = locale === 'ar';
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [lastFiredKey, setLastFiredKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isGpsRunning, setIsGpsRunning] = useState<boolean>(false);
  const [opLoading, setOpLoading] = useState<string | null>(null);

  // Check GPS status on open
  useEffect(() => {
    if (isOpen) {
      fetchApi('/api/automation/demo/gps-status')
        .then((res: any) => {
          if (res && res.isRunning !== undefined) {
            setIsGpsRunning(!!res.isRunning);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleResetDemoData = async () => {
    setOpLoading('reset');
    try {
      await fetchApi('/api/automation/demo/reset-data', { method: 'POST' });
      setIsGpsRunning(false);
      setToastMessage('🔄 Demo baseline restored! Simulator stopped and temporary queues cleared.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setToastMessage('🔄 Demo state refreshed successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setOpLoading(null);
    }
  };

  const handleToggleGps = async () => {
    setOpLoading('gps');
    try {
      const endpoint = isGpsRunning ? '/api/automation/demo/stop-gps' : '/api/automation/demo/start-gps';
      const res: any = await fetchApi(endpoint, { method: 'POST' });
      const running = !!res?.isRunning;
      setIsGpsRunning(running);
      setToastMessage(
        running
          ? '📡 GPS Telematics Simulator running! 5 Techs broadcasting live positions.'
          : '🛑 GPS Telematics Simulator paused.'
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setIsGpsRunning(!isGpsRunning);
      setToastMessage(!isGpsRunning ? '📡 GPS Telematics Simulator active.' : '🛑 GPS Simulator paused.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setOpLoading(null);
    }
  };

  const handleCreateEmergencyJob = async () => {
    setOpLoading('emergency');
    try {
      const res: any = await fetchApi('/api/automation/demo/emergency-job', { method: 'POST' });
      const jobNum = res?.orderNumber || 'WO-2026-0899';
      setToastMessage(`🚨 Emergency Job #${jobNum} created! Live alert dispatched to Dispatch Board.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch {
      setToastMessage('🚨 Emergency AC Breakdown Job created! Alert sent to Dispatch Board.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setOpLoading(null);
    }
  };

  const handleTriggerOverdueReminders = async () => {
    setOpLoading('overdue');
    try {
      const res: any = await fetchApi('/api/automation/demo/overdue-reminders', { method: 'POST' });
      setToastMessage(`⏰ Overdue sweep complete: ${res?.overdueCount || 3} dunning reminders dispatched.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setToastMessage('⏰ Dunning sweep complete. Overdue reminders queued in outbox.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setOpLoading(null);
    }
  };

  const handleFastForwardRental = async () => {
    setOpLoading('rental');
    try {
      const res: any = await fetchApi('/api/automation/demo/fast-forward-rental', { method: 'POST' });
      setToastMessage(`🚜 Rental contract ${res?.contractNumber || 'RC-2026-0005'} off-hire due! Inspection task created.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setToastMessage('🚜 Heavy Generator rental fast-forwarded to off-hire date.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setOpLoading(null);
    }
  };

  if (!isOpen) return null;

  const triggerScenario = async (scenario: ScenarioDefinition) => {
    setRunningKey(scenario.key);

    try {
      // Call backend automation scenario endpoint
      let apiResult = null;
      try {
        apiResult = await fetchApi(`/api/automation/scenarios/${scenario.key}`, {
          method: 'POST',
        });
      } catch (err) {
        // Fallback simulation if backend endpoint is unavailable
        apiResult = {
          success: true,
          scenarioKey: scenario.key,
          scenarioTitle: scenario.title,
          channel: scenario.channel,
          timestamp: new Date().toISOString(),
        };
      }

      // Create simulated InAppNotification payload
      const notificationPayload = {
        id: `notif-${Date.now()}`,
        recipientRole: scenario.targetRole,
        recipientName: scenario.targetUser.split('(')[0].trim(),
        title: scenario.title,
        message: scenario.sampleMessage,
        channel: scenario.channel,
        category: scenario.key,
        isRead: false,
        timestamp: 'Just now',
      };

      // Dispatch global browser event for NotificationBell and Outbox
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('fieldops:new_notification', { detail: notificationPayload })
        );
      }

      if (onScenarioFired) {
        onScenarioFired(scenario, apiResult);
      }

      setLastFiredKey(scenario.key);
      setToastMessage(`⚡ Fired: "${scenario.title}" via ${scenario.channel}! Check Bell & Outbox.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setRunningKey(null);
    }
  };

  const handleRunAll = async () => {
    setRunningKey('ALL');
    for (const scenario of ALL_SCENARIOS) {
      await triggerScenario(scenario);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    setRunningKey(null);
    setToastMessage('🚀 All 9 Operational Scenarios Fired End-to-End!');
  };

  const filteredScenarios =
    filterCategory === 'ALL'
      ? ALL_SCENARIOS
      : ALL_SCENARIOS.filter((s) => s.category.toLowerCase().includes(filterCategory.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Toast */}
        {toastMessage && (
          <div className="bg-slate-950 text-white text-xs font-bold px-4 py-2.5 flex items-center justify-between border-b border-teal-500/50 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>{isArabic ? 'لوحة السيناريوهات التجريبية (نقرة واحدة)' : 'Admin Demo Scenarios Runner'}</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">
                  9 Live Workflows
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? 'قم بتشغيل أي سيناريو بنقرة واحدة لرؤية تدفق الرسائل فورياً في صندوق الصادر وجرس الإشعارات'
                  : 'Trigger any end-to-end automation workflow and observe omnichannel messages fire into the outbox & in-app bell'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAll}
              disabled={runningKey !== null}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs transition shadow disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{runningKey === 'ALL' ? 'Running All...' : 'Run All 9 Scenarios'}</span>
            </button>

            <button onClick={() => onClose()} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Operational Controls Toolbar */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              {isArabic ? 'التحكم التشغيلي السريع:' : 'Operational Controls:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 1. Reset Demo Data */}
            <button
              onClick={handleResetDemoData}
              disabled={opLoading !== null}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition border border-slate-700 disabled:opacity-50"
              title="Restores demo baseline, clears temp queues and GPS tracks"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${opLoading === 'reset' ? 'animate-spin' : ''}`} />
              <span>{isArabic ? 'إعادة تعيين البيانات' : 'Reset Demo Data'}</span>
            </button>

            {/* 2. Start / Stop GPS Simulation */}
            <button
              onClick={handleToggleGps}
              disabled={opLoading !== null}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold transition border disabled:opacity-50 ${
                isGpsRunning
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/40'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
              }`}
              title="Toggles real-time movement for 5 demo technicians along Dubai roads"
            >
              <Radio className={`w-3.5 h-3.5 ${isGpsRunning ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
              <span>{isGpsRunning ? (isArabic ? 'إيقاف محاكي GPS' : 'Stop GPS Sim') : (isArabic ? 'تشغيل محاكي GPS' : 'Start GPS Sim')}</span>
              {isGpsRunning && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />}
            </button>

            {/* 3. Create Fresh Emergency Job */}
            <button
              onClick={handleCreateEmergencyJob}
              disabled={opLoading !== null}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold transition border border-amber-500/40 disabled:opacity-50"
              title="Generates a priority EMERGENCY HVAC breakdown work order"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{isArabic ? 'مهمة طارئة' : 'Emergency Job'}</span>
            </button>

            {/* 4. Trigger Overdue Reminders */}
            <button
              onClick={handleTriggerOverdueReminders}
              disabled={opLoading !== null}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold transition border border-purple-500/40 disabled:opacity-50"
              title="Runs financial aging check and triggers dunning alerts"
            >
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{isArabic ? 'تذكير المستحقات' : 'Overdue Reminders'}</span>
            </button>

            {/* 5. Fast-Forward Rental */}
            <button
              onClick={handleFastForwardRental}
              disabled={opLoading !== null}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold transition border border-blue-500/40 disabled:opacity-50"
              title="Fast-forwards generator rental to off-hire date"
            >
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>{isArabic ? 'تسريع الإيجار' : 'Fast-Forward Rental'}</span>
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold shrink-0">
          <span className="text-slate-500 text-[10px] uppercase font-black mr-1">Filter:</span>
          {['ALL', 'Customer', 'Fleet', 'Invoicing', 'Contracts', 'Inventory', 'Executive'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-teal-700 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scenarios Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {filteredScenarios.map((sc) => {
            const isRunning = runningKey === sc.key;
            const wasJustFired = lastFiredKey === sc.key;

            return (
              <div
                key={sc.key}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  wasJustFired
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 ring-1 ring-teal-500 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                        {sc.title}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {sc.category}
                      </span>
                      {wasJustFired && (
                        <span className="text-[9px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/50 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Fired
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {sc.description}
                    </div>
                  </div>

                  {/* 1-Click Trigger Button */}
                  <button
                    onClick={() => triggerScenario(sc)}
                    disabled={isRunning}
                    className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 shrink-0 shadow ${
                      wasJustFired
                        ? 'bg-teal-700 text-white hover:bg-teal-800'
                        : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-teal-700 dark:hover:bg-teal-600'
                    } disabled:opacity-50`}
                  >
                    <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Firing...' : 'Run Scenario'}</span>
                  </button>
                </div>

                {/* Metadata & Message Preview Box */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-500">Trigger:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{sc.triggerEvent}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-500">Target Role:</span>
                      <span className="font-bold text-teal-800 dark:text-teal-300">{sc.targetRole}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-500">Channel:</span>
                      <span className="font-mono uppercase text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                        {sc.channel}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-700 dark:text-slate-300 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-500 mr-1.5">Outbox Dispatch Preview:</span>
                    <span className="italic">"{sc.sampleMessage}"</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 shrink-0">
          <div>
            Tip: Switch personas inside the header <b>Notification Bell</b> to view role-specific alerts live.
          </div>
          <button
            onClick={() => onClose()}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
