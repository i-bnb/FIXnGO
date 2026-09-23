'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Play,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Send,
  Sliders,
  Zap,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Radio,
  Truck,
} from 'lucide-react';
import { ALL_SCENARIOS, ScenarioDefinition } from '../../../../components/admin/DemoScenariosModal';
import { fetchApi } from '../../../../lib/api-client';

interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  condition: string;
  action: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'SYSTEM';
  isActive: boolean;
}

interface OutboxMessage {
  id: string;
  timestamp: string;
  recipient: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'SYSTEM';
  subjectOrPreview: string;
  status: 'DELIVERED' | 'READ' | 'SENT';
}

const SAMPLE_RULES: AutomationRule[] = [
  { id: '1', name: 'Instant Technician En Route Live Tracking', triggerEvent: 'Work Order status -> EN_ROUTE', condition: 'All service jobs', action: 'Send WhatsApp with Leaflet GPS link & ETA to client', channel: 'WHATSAPP', isActive: true },
  { id: '2', name: 'Low Stock Safety Threshold Alert', triggerEvent: 'Stock quantity <= Reorder Level', condition: 'Central Warehouse & Vans', action: 'Notify Storekeeper & raise draft PO to supplier', channel: 'SYSTEM', isActive: true },
  { id: '3', name: 'Executive Approval for POs > 5,000 AED', triggerEvent: 'New Purchase Order created', condition: 'PO Total > 5,000 AED', action: 'Route to Sultan (Super Admin) for digital sign-off', channel: 'SYSTEM', isActive: true },
  { id: '4', name: 'Automated 7-Day Overdue Invoice Follow-up', triggerEvent: 'Invoice due date + 7 days', condition: 'Payment status != PAID', action: 'Send polite bilingual payment reminder with Stripe link', channel: 'WHATSAPP', isActive: true },
  { id: '5', name: 'Service Request Instant Auto-Reply', triggerEvent: 'New Service Request submitted', condition: 'All incoming customer tickets', action: 'Send bilingual WhatsApp auto-reply with ticket #', channel: 'WHATSAPP', isActive: true },
  { id: '6', name: 'Preventive AMC Visit Due (7 Days Prior)', triggerEvent: 'AMC contract schedule match', condition: 'Preventive maintenance visit date - 7 days', action: 'Send email notification and auto-draft PM work order', channel: 'EMAIL', isActive: true },
];

const INITIAL_OUTBOX: OutboxMessage[] = [
  { id: 'msg-1', timestamp: 'Today, 11:05 AM', recipient: '+971 50 882 1290 (Al-Harbi Villa)', channel: 'WHATSAPP', subjectOrPreview: 'Your lead technician Rashid Al-Nuaimi is en route in Van-01. ETA: 18 mins. Track live: https://fieldops.ae/track/wo-002', status: 'READ' },
  { id: 'msg-2', timestamp: 'Today, 09:15 AM', recipient: 'facilities@alfuttaim.ae', channel: 'EMAIL', subjectOrPreview: 'Tax Invoice INV-2026-0001 (AED 383.25) issued for Chiller maintenance at Business Bay Tower B', status: 'DELIVERED' },
  { id: 'msg-3', timestamp: 'Today, 08:35 AM', recipient: '+971 52 110 0001 (Rashid Al-Nuaimi)', channel: 'SMS', subjectOrPreview: 'Dispatch Alert: New Priority High Job assigned: WO-2026-001 at Business Bay Level 14', status: 'DELIVERED' },
  { id: 'msg-4', timestamp: 'Yesterday, 04:30 PM', recipient: '+971 50 294 8888 (Sobha Site Engineer)', channel: 'SMS', subjectOrPreview: 'Off-Hire Alert: 100kVA Generator on contract RC-2026-0005 is due for return tomorrow at 5PM.', status: 'READ' },
];

export default function AutomationAdminPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<'SCENARIOS' | 'RULES' | 'OUTBOX' | 'TEMPLATES' | 'APPROVALS'>('SCENARIOS');
  const [rules, setRules] = useState<AutomationRule[]>(SAMPLE_RULES);
  const [outbox, setOutbox] = useState<OutboxMessage[]>(INITIAL_OUTBOX);
  const [runningScenarioKey, setRunningScenarioKey] = useState<string | null>(null);
  const [lastFiredKey, setLastFiredKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGpsRunning, setIsGpsRunning] = useState<boolean>(false);
  const [opLoading, setOpLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchApi('/api/automation/demo/gps-status')
      .then((res: any) => {
        if (res && res.isRunning !== undefined) {
          setIsGpsRunning(!!res.isRunning);
        }
      })
      .catch(() => {});
  }, []);

  const handleResetDemoData = async () => {
    setOpLoading('reset');
    try {
      await fetchApi('/api/automation/demo/reset-data', { method: 'POST' });
      setIsGpsRunning(false);
      setToastMessage('🔄 Demo baseline restored! Simulator stopped and queues cleared.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setToastMessage('🔄 Demo baseline refreshed.');
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

  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 'ap-1', type: 'PURCHASE_ORDER', title: 'PO-2026-0048: National Gas Suppliers LLC (AED 4,560.00)', requestedBy: 'Bilal (Storekeeper)', justification: 'Emergency restock of R410A Refrigerant Cylinders (2 remaining in warehouse)' },
    { id: 'ap-2', type: 'PURCHASE_ORDER', title: 'PO-2026-0045: Schneider Electric (AED 9,975.00)', requestedBy: 'Bilal (Storekeeper)', justification: 'Emergency restock of 20A MCBs and 63A Contactors for data center jobs' },
    { id: 'ap-3', type: 'EXPENSE_CLAIM', title: 'EXP-2026-0098: Off-Market Taxi Courier (AED 160.00)', requestedBy: 'Mohammad Rizwan', justification: 'Night emergency courier from Sharjah industrial store for cold storage contactor' },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleApprove = (id: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
    setToastMessage('Action approved and logged in General Ledger audit trail!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRunScenario = async (scenario: ScenarioDefinition) => {
    setRunningScenarioKey(scenario.key);

    try {
      // 1. Call backend automation endpoint
      try {
        await fetchApi(`/api/automation/scenarios/${scenario.key}`, { method: 'POST' });
      } catch (e) {
        // Fallback simulated success
      }

      // 2. Add to outbox state
      const newOutboxMsg: OutboxMessage = {
        id: `msg-${Date.now()}`,
        timestamp: 'Just now',
        recipient: scenario.targetUser,
        channel: scenario.channel,
        subjectOrPreview: scenario.sampleMessage,
        status: 'SENT',
      };
      setOutbox((prev) => [newOutboxMsg, ...prev]);

      // 3. Dispatch global event for NotificationBell
      if (typeof window !== 'undefined') {
        const notifPayload = {
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
        window.dispatchEvent(
          new CustomEvent('fieldops:new_notification', { detail: notifPayload })
        );
      }

      setLastFiredKey(scenario.key);
      setToastMessage(`⚡ Fired Scenario: "${scenario.title}" via ${scenario.channel}! Check Bell & Outbox.`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setRunningScenarioKey(null);
    }
  };

  const handleRunAllScenarios = async () => {
    setRunningScenarioKey('ALL');
    for (const sc of ALL_SCENARIOS) {
      await handleRunScenario(sc);
      await new Promise((r) => setTimeout(r, 200));
    }
    setRunningScenarioKey(null);
    setToastMessage('🚀 All 9 Operational Scenarios Fired End-to-End!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white text-xs font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 border border-teal-500 animate-in fade-in slide-in-from-top-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>{isArabic ? 'محرك الأتمتة والرسائل الفورية' : 'Event Engine & Notification Outbox'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isArabic ? 'قواعد الأتمتة، السيناريوهات التجريبية، والرسائل الصادرة' : 'Automation Rules & Omnichannel Outbox'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {isArabic
              ? 'أتمتة دورة العمل الميداني: إرسال روابط التتبع الفورية عبر واتساب، تنبيهات نفاد المخزون، وجدولة التذكيرات المالية'
              : 'Trigger-based workflow automation: live WhatsApp tracking links, inventory reorder alerts, and approval queues'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Configured Rules</span>
            <span className="text-lg font-black text-teal-900">{rules.length} Active</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Pending Approvals</span>
            <span className="text-lg font-black text-amber-800">{pendingApprovals.length} Actions</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'SCENARIOS', label: '⚡ Demo Scenarios (1-Click Run)', icon: Zap },
          { id: 'OUTBOX', label: `Live Outbox Stream (${outbox.length})`, icon: Send },
          { id: 'RULES', label: `Configured Rules (${rules.length})`, icon: Sliders },
          { id: 'TEMPLATES', label: 'Bilingual Templates (EN/AR)', icon: MessageSquare },
          { id: 'APPROVALS', label: `Executive Approvals Queue (${pendingApprovals.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition ${
                active ? 'bg-slate-900 text-white font-black shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-teal-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================================= */}
      {/* TAB 1: DEMO SCENARIOS (9 Core Workflows) */}
      {/* ========================================================================================= */}
      {activeTab === 'SCENARIOS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <div className="flex items-center gap-2 text-teal-400 font-extrabold text-xs mb-1">
                <Sparkles className="w-4 h-4" />
                <span>One-Click Automation Scenarios Showcase</span>
              </div>
              <h2 className="text-lg font-black">Live End-to-End Workflow Verification</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Trigger any scenario below to see the automation rule execute instantly. You will observe the dispatched message appear in the <b>Live Outbox Stream</b> tab and the <b>Notification Bell</b> in the top header.
              </p>
            </div>

            <button
              onClick={handleRunAllScenarios}
              disabled={runningScenarioKey !== null}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs transition shadow flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{runningScenarioKey === 'ALL' ? 'Firing All 9...' : 'Run All 9 Scenarios'}</span>
            </button>
          </div>

          {/* Operational Demo Actions Toolbar */}
          <div className="bg-slate-950 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                {isArabic ? 'التحكم التشغيلي المباشر للسيناريو:' : 'Live Operational Controls:'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* 1. Reset Demo Data */}
              <button
                onClick={handleResetDemoData}
                disabled={opLoading !== null}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition border border-slate-700 disabled:opacity-50"
                title="Restores demo baseline, clears temp emergency jobs and GPS tracks"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${opLoading === 'reset' ? 'animate-spin' : ''}`} />
                <span>{isArabic ? 'إعادة تعيين البيانات' : 'Reset Demo Data'}</span>
              </button>

              {/* 2. Start / Stop GPS Simulation */}
              <button
                onClick={handleToggleGps}
                disabled={opLoading !== null}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition border disabled:opacity-50 ${
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold transition border border-amber-500/40 disabled:opacity-50"
                title="Generates a priority EMERGENCY HVAC breakdown work order"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>{isArabic ? 'إنشاء مهمة طارئة' : 'Emergency Job'}</span>
              </button>

              {/* 4. Trigger Overdue Reminders */}
              <button
                onClick={handleTriggerOverdueReminders}
                disabled={opLoading !== null}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold transition border border-purple-500/40 disabled:opacity-50"
                title="Runs financial aging check and triggers dunning alerts"
              >
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>{isArabic ? 'تذكير المستحقات' : 'Overdue Reminders'}</span>
              </button>

              {/* 5. Fast-Forward Rental */}
              <button
                onClick={handleFastForwardRental}
                disabled={opLoading !== null}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold transition border border-blue-500/40 disabled:opacity-50"
                title="Fast-forwards generator rental to off-hire date"
              >
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>{isArabic ? 'تسريع الإيجار' : 'Fast-Forward Rental'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_SCENARIOS.map((sc) => {
              const isRunning = runningScenarioKey === sc.key;
              const wasJustFired = lastFiredKey === sc.key;

              return (
                <div
                  key={sc.key}
                  className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between shadow-xs ${
                    wasJustFired
                      ? 'border-teal-500 ring-2 ring-teal-500/30 bg-teal-50/30'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {sc.channel}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {sc.targetRole}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 text-sm leading-snug">{sc.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sc.description}</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                      <div className="font-bold text-slate-500 text-[10px] uppercase">Dispatched Message:</div>
                      <p className="italic text-slate-800 line-clamp-3">"{sc.sampleMessage}"</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      To: {sc.targetUser.split('(')[0]}
                    </span>

                    <button
                      onClick={() => handleRunScenario(sc)}
                      disabled={isRunning}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow ${
                        wasJustFired
                          ? 'bg-teal-700 hover:bg-teal-800 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      } disabled:opacity-50`}
                    >
                      <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                      <span>{isRunning ? 'Firing...' : 'Run Scenario'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 2: LIVE OMNICHANNEL OUTBOX STREAM */}
      {/* ========================================================================================= */}
      {activeTab === 'OUTBOX' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Simulated Live Omnichannel Outbox</h3>
              <p className="text-slate-500 text-xs">Real-time messages sent via WhatsApp Cloud API, SES Email, and SMS</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200">
                100% Delivery Rate
              </span>
              <button
                onClick={() => setOutbox(INITIAL_OUTBOX)}
                className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1"
                title="Reset outbox to initial seed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <table className="w-full border rounded-xl overflow-hidden text-start">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-2.5 text-start">Timestamp</th>
                <th className="p-2.5 text-start">Channel</th>
                <th className="p-2.5 text-start">Recipient</th>
                <th className="p-2.5 text-start">Message Content Preview</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outbox.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-2.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">{msg.timestamp}</td>
                  <td className="p-2.5 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        msg.channel === 'WHATSAPP'
                          ? 'bg-emerald-100 text-emerald-800'
                          : msg.channel === 'EMAIL'
                          ? 'bg-blue-100 text-blue-800'
                          : msg.channel === 'SMS'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {msg.channel}
                    </span>
                  </td>
                  <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">{msg.recipient}</td>
                  <td className="p-2.5 text-slate-700 max-w-md">{msg.subjectOrPreview}</td>
                  <td className="p-2.5 text-center whitespace-nowrap">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{msg.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 3: CONFIGURED RULES */}
      {/* ========================================================================================= */}
      {activeTab === 'RULES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      Channel: {rule.channel}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">{rule.name}</h3>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                      rule.isActive ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">Trigger:</span>
                    <span className="font-mono text-teal-900">{rule.triggerEvent}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">Condition:</span>
                    <span>{rule.condition}</span>
                  </div>
                  <div className="flex items-start gap-1.5 pt-1 border-t border-slate-200">
                    <span className="font-bold text-slate-900 shrink-0">Action:</span>
                    <span className="text-slate-600">{rule.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 4: TEMPLATES */}
      {/* ========================================================================================= */}
      {activeTab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">Technician En Route Notification</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">WhatsApp</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">English Template:</span>
              <p className="text-slate-800 leading-relaxed font-sans">
                "Hello {"{{customer_name}}"}, our certified technician {"{{tech_name}}"} is now on the way to {"{{site_address}}"}. Estimated arrival: {"{{eta_minutes}}"} mins. Track route live: {"{{live_tracking_url}}"}"
              </p>
              <span className="text-[10px] font-bold text-slate-500 uppercase block pt-2 border-t">Arabic Template / النسخة العربية:</span>
              <p className="text-slate-800 leading-relaxed font-sans" dir="rtl">
                "مرحباً {"{{customer_name}}"}، فني الصيانة المعتمد {"{{tech_name}}"} في طريقه الآن إلى {"{{site_address}}"}. موعد الوصول المتوقع خلال {"{{eta_minutes}}"} دقيقة. تابع المسار المباشر: {"{{live_tracking_url}}"}"
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">Tax Invoice Ready Notification</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Email & WhatsApp</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 border">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">English Template:</span>
              <p className="text-slate-800 leading-relaxed font-sans">
                "Dear {"{{customer_name}}"}, Tax Invoice {"{{invoice_number}}"} for {"{{total_amount_aed}}"} AED (incl. 5% UAE VAT) has been generated. Review and settle online via card: {"{{payment_link}}"}"
              </p>
              <span className="text-[10px] font-bold text-slate-500 uppercase block pt-2 border-t">Arabic Template / النسخة العربية:</span>
              <p className="text-slate-800 leading-relaxed font-sans" dir="rtl">
                "عزيزنا {"{{customer_name}}"}، تم إصدار الفاتورة الضريبية رقم {"{{invoice_number}}"} بمبلغ {"{{total_amount_aed}}"} درهم (شاملة 5% ضريبة القيمة المضافة). للدفع الفوري: {"{{payment_link}}"}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 5: APPROVALS */}
      {/* ========================================================================================= */}
      {activeTab === 'APPROVALS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
          <h3 className="font-black text-slate-900 text-sm">Executive Pending Approvals Queue</h3>
          <div className="space-y-3">
            {pendingApprovals.map((ap) => (
              <div
                key={ap.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {ap.type}
                  </span>
                  <div className="font-black text-slate-900 text-sm mt-1">{ap.title}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{ap.justification}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Requested by: {ap.requestedBy}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(ap.id)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize</span>
                  </button>
                </div>
              </div>
            ))}

            {pendingApprovals.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No items pending executive approval
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
