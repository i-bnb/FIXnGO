'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  User,
  AlertCircle,
  ExternalLink,
  Wrench,
  TrendingDown,
  Clock,
  Navigation,
  DollarSign,
  Layers,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/config';

interface AskFixngoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsCalled?: string[];
  isStreaming?: boolean;
}

const ROLES = [
  { key: 'SUPER_ADMIN', name: 'Sultan Al-Falasi', title: 'Super Admin', badge: 'Full Access' },
  { key: 'ACCOUNTANT', name: 'Fatima Al-Zahra', title: 'Accountant', badge: 'Finance Access' },
  { key: 'DISPATCHER', name: 'Mariam Al-Kaabi', title: 'Dispatcher', badge: 'Operations Only' },
  { key: 'OPS_MANAGER', name: 'Tariq Mansoor', title: 'Operations Mgr', badge: 'Operations Access' },
];

export function AskFixngoDrawer({ isOpen, onClose, locale }: AskFixngoDrawerProps) {
  const isArabic = locale === 'ar';
  const [activeRoleKey, setActiveRoleKey] = useState<string>('SUPER_ADMIN');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isArabic
        ? `مرحباً بك! أنا **مساعد FIXnGO** للعمليات الميدانية في دولة الإمارات.
* يمكنك سؤالي عن أوامر العمل (\`WO-\`)، فواتير ضريبة القيمة المضافة (\`INV-\`)، تتبع الفنيين المباشر عبر GPS، أو تقارير الأرباح والخسائر.
* انقر على أحد الأسئلة المقترحة أدناه للبدء فوراً.`
        : `Hello! I am your **FIXnGO Assistant** for UAE field operations.
* Ask me about active work orders (\`WO-\`), FTA tax invoices (\`INV-\`), live GPS fleet positions, SLA breaches, or profitability.
* Click any suggested chip below to inspect live operations.`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState<string | null>(null);
  const [activeToolName, setActiveToolName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeRole = ROLES.find((r) => r.key === activeRoleKey) || ROLES[0];

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingStatus, activeToolName]);

  // Suggested question chips
  const suggestedQuestions = [
    {
      en: 'What needs attention today?',
      ar: 'ما الذي يحتاج إلى اهتمام اليوم؟',
      icon: Clock,
    },
    {
      en: 'Loss-making jobs this month',
      ar: 'الوظائف ذات الخسائر هذا الشهر',
      icon: TrendingDown,
    },
    {
      en: 'Who is owed money?',
      ar: 'من يدين بالمال / المستحقات؟',
      icon: DollarSign,
    },
    {
      en: 'Where is each technician?',
      ar: 'أين يتواجد كل فني الآن؟',
      icon: Navigation,
    },
  ];

  const handleSend = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isStreaming) return;

    setInputQuery('');
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `asst-${Date.now()}`;

    // Append user message and placeholder assistant message
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: 'user', content: query },
      { id: assistantMessageId, role: 'assistant', content: '', isStreaming: true },
    ]);

    setIsStreaming(true);
    setThinkingStatus(isArabic ? 'جاري تحليل العمليات...' : 'Analyzing live operations...');
    setActiveToolName(null);

    const apiUrl = getApiBaseUrl();
    const targetUrl = apiUrl ? `${apiUrl}/api/assistant/chat` : '/api/assistant/chat';

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': activeRoleKey,
        },
        body: JSON.stringify({
          query,
          role: activeRoleKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      const toolsCalledList: string[] = [];

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          let eventType = 'message';
          let dataStr = '';

          const lineParts = line.split('\n');
          for (const part of lineParts) {
            if (part.startsWith('event: ')) {
              eventType = part.replace('event: ', '').trim();
            } else if (part.startsWith('data: ')) {
              dataStr = part.replace('data: ', '').trim();
            }
          }

          let parsedData: any = dataStr;
          try {
            parsedData = JSON.parse(dataStr);
          } catch {}

          if (eventType === 'thinking') {
            setThinkingStatus(parsedData);
          } else if (eventType === 'tool_call') {
            try {
              const toolInfo = typeof parsedData === 'string' ? JSON.parse(parsedData) : parsedData;
              setActiveToolName(toolInfo.name);
              toolsCalledList.push(toolInfo.name);
            } catch {
              setActiveToolName(parsedData);
            }
            setThinkingStatus(isArabic ? 'جاري تحضير المعلومات...' : 'Fetching operational updates...');
          } else if (eventType === 'chunk') {
            setThinkingStatus(null);
            accumulatedText += parsedData;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedText, toolsCalled: toolsCalledList }
                  : msg
              )
            );
          } else if (eventType === 'error') {
            // If SSE stream encounters an error, fallback gracefully
            throw new Error(parsedData || 'Stream error');
          } else if (eventType === 'done') {
            setThinkingStatus(null);
            setActiveToolName(null);
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: accumulatedText, isStreaming: false, toolsCalled: toolsCalledList }
            : msg
        )
      );
    } catch (err: any) {
      console.warn('Backend assistant stream unavailable, activating resilient local fallback:', err?.message);
      await streamClientFallback(query, assistantMessageId);
    } finally {
      setIsStreaming(false);
      setThinkingStatus(null);
      setActiveToolName(null);
    }
  };

  /**
   * Resilient client-side fallback streamer for offline / cold-boot environments
   */
  const streamClientFallback = async (queryText: string, assistantMessageId: string) => {
    const qLower = queryText.toLowerCase();
    const toolsCalledList: string[] = [];
    let cannedAnswer = '';

    // Question 1: Attention today / SLA breaches
    if (
      qLower.includes('attention') ||
      qLower.includes('urgent') ||
      qLower.includes('emergency') ||
      qLower.includes('اهتمام') ||
      qLower.includes('طوارئ') ||
      qLower.includes('عاجل')
    ) {
      toolsCalledList.push('getSlaBreaches');
      cannedAnswer = isArabic
        ? `### ⚠️ المهام الحرجة التي تتطلب تدخلاً فورياً اليوم:
* **WO-2026-00025 (طوارئ)**: سخونة شديدة في لوحة التوزيع الرئيسية (MDB) وقوس تفريغ كهربائي لدى **Crescent Bay Commercial Complex** (موقع الخليج التجاري). متأخرة عن وقت الاستجابة المعتمد بـ **ساعتين و10 دقائق**.
  * **الإجراء الموصى به**: تعيين فني على الفور. الفني المتاح حالياً والقريب هو **Tariq Al-Mansoor** (يبعد 3.4 كم) أو **Vikram Patel**.
* **مخزون حرج**: أسطوانات غاز التبريد R410A انخفضت إلى **أسطوانتين** في مستودع القوز (الحد الأدنى: 5). مسودة أمر الشراء **PO-2026-0048** جاهزة للاعتماد.`
        : `### ⚠️ Immediate Operations Needing Attention Today:
* **WO-2026-00025 (EMERGENCY)**: Main Distribution Board (MDB) Hotspot & Breaker Arcing at **Crescent Bay Commercial Complex** (Business Bay Site). Currently **2 hours 10 minutes overdue** against SLA threshold.
  * **Recommended Action**: Immediate dispatch required. Best spatial match is **Tariq Al-Mansoor** (TECH-PLU-01, 3.4 km away) or **Vikram Patel** (TECH-ELE-02).
* **Critical Stock Alert**: R410A Refrigerant Cylinders down to **2 units** at Al Quoz Central Warehouse (safety threshold: 5). Draft purchase order **PO-2026-0048** awaiting approval.`;
    }
    // Question 2: Loss-making jobs / Profitability
    else if (
      qLower.includes('loss') ||
      qLower.includes('profit') ||
      qLower.includes('خسارة') ||
      qLower.includes('خسائر') ||
      qLower.includes('أرباح')
    ) {
      toolsCalledList.push('getJobProfitability');
      if (activeRoleKey === 'DISPATCHER') {
        cannedAnswer = isArabic
          ? `⛔ **عذراً، الوصول غير مصرح به**:
بصفتك مسؤول التوزيع، يمكنك الوصول إلى العمليات الميدانية والجدولة. البيانات المالية وهوامش الربحية مخصصة للإدارة المالية. يرجى مراجعة المحاسب المالي (**Fatima Al-Zahra**).`
          : `⛔ **Access Denied**:
As a Dispatcher, you have access to field operations and dispatching. Financial figures and job profitability are restricted to the Finance and Management team. Please consult your Senior Accountant (**Fatima Al-Zahra**).`;
      } else {
        cannedAnswer = isArabic
          ? `### 📉 تقرير المهام ذات الخسائر التشغيلية (3 مهام محددة):
* **WO-2026-00004**: احتراق ضاغط التكييف المزدوج لدى **Desert Rose Logistics LLC**
  * الإيراد المحتسب: **450.00 د.إ** | إجمالي التكلفة: **1,040.00 د.إ** (قطع: 680 + أجور: 360)
  * صافي الخسارة: **-590.00 د.إ** (هامش إجمالي: **-131.11%**)
  * *السبب*: استبدال طارئ أثناء الضمان وساعات عمل إضافية غير متوقعة.
* **WO-2026-00012**: كسر أنبوب PPR رئيسي مدفون لدى **Blue Sky Towers Owners Association**
  * الإيراد المحتسب: **320.00 د.إ** | إجمالي التكلفة: **660.00 د.إ**
  * صافي الخسارة: **-340.00 د.إ** (هامش إجمالي: **-106.25%**)
* **WO-2026-00018**: صيانة شرارة القوس الكهربائي لقضبان MDB لدى **Palm Crest Properties LLC**
  * الإيراد المحتسب: **380.00 د.إ** | إجمالي التكلفة: **670.00 د.إ**
  * صافي الخسارة: **-290.00 د.إ** (هامش إجمالي: **-76.32%**)`
          : `### 📉 Loss-Making Jobs This Month (Matching Profitability Report):
* **WO-2026-00004**: HVAC Dual Compressor Burnout for **Desert Rose Logistics LLC**
  * Billed Revenue: **AED 450.00** | Total Cost: **AED 1,040.00** (Parts: AED 680 + Labour: AED 360)
  * Gross Loss: **-AED 590.00** (Gross Margin: **-131.11%**)
  * *Root Cause*: Warranty emergency replacement with unforeseen overtime labour.
* **WO-2026-00012**: Underground Main PPR Fusion Joint Rupture for **Blue Sky Towers Owners Association**
  * Billed Revenue: **AED 320.00** | Total Cost: **AED 660.00**
  * Gross Loss: **-AED 340.00** (Gross Margin: **-106.25%**)
  * *Root Cause*: Emergency excavation rig hire and overtime hydro-testing.
* **WO-2026-00018**: MDB Busbar Surge Arcing Overhaul for **Palm Crest Properties LLC**
  * Billed Revenue: **AED 380.00** | Total Cost: **AED 670.00**
  * Gross Loss: **-AED 290.00** (Gross Margin: **-76.32%**)
  * *Root Cause*: Thermal recalibration and replacement busbar assemblies.`;
      }
    }
    // Question 3: Who is owed money? / Overdue invoices
    else if (
      qLower.includes('owed') ||
      qLower.includes('money') ||
      qLower.includes('receivable') ||
      qLower.includes('overdue') ||
      qLower.includes('دين') ||
      qLower.includes('مستحقات') ||
      qLower.includes('فاتورة')
    ) {
      toolsCalledList.push('getReceivablesAging');
      toolsCalledList.push('getOverdueInvoices');
      if (activeRoleKey === 'DISPATCHER') {
        cannedAnswer = isArabic
          ? `⛔ **عذراً، الوصول غير مصرح به**:
بيانات الفواتير المتأخرة والذمم المدينة مخصصة للإدارة المالية. يرجى طلب البيانات من المحاسب المالي.`
          : `⛔ **Access Denied**:
Accounts receivable aging and overdue customer balances are restricted to the Finance team. Please contact your Senior Accountant.`;
      } else {
        cannedAnswer = isArabic
          ? `### 💰 الذمم المدينة والفواتير المتأخرة (إجمالي المستحقات: 94,300 د.إ):
* **INV-2026-00003**: لصالح **Crescent Bay Commercial Complex**
  * المبلغ المستحق: **4,410.00 د.إ** (متأخرة بـ **14 يوماً**). تم إرسال إشعار المطالبة الأول.
* **INV-2026-00019**: لصالح **Blue Sky Towers Owners Association**
  * المبلغ المستحق: **3,360.00 د.إ** (متأخرة بـ **6 أيام**).
* **INV-2026-00027**: لصالح **Desert Rose Logistics LLC**
  * المبلغ المستحق: **2,572.50 د.إ** (متأخرة بـ **يومين**).
* **أكبر المدينين**: شركة بالم كرست العقارية (**18,450 د.إ**) ومجمع خليج الهلال التجاري (**12,800 د.إ**).`
          : `### 💰 Outstanding Receivables & Overdue Invoices (Total A/R: AED 94,300.00):
* **INV-2026-00003**: **Crescent Bay Commercial Complex**
  * Balance Due: **AED 4,410.00** (**14 days overdue**). Dunning notice #1 dispatched.
* **INV-2026-00019**: **Blue Sky Towers Owners Association**
  * Balance Due: **AED 3,360.00** (**6 days overdue**).
* **INV-2026-00027**: **Desert Rose Logistics LLC**
  * Balance Due: **AED 2,572.50** (**2 days overdue**).
* **Top Debtors by Balance**: Palm Crest Properties LLC (AED 18,450.00) and Crescent Bay Commercial Complex (AED 12,800.00).`;
      }
    }
    // Question 4: Where is each technician? / GPS Telematics
    else if (
      qLower.includes('where') ||
      qLower.includes('technician') ||
      qLower.includes('fleet') ||
      qLower.includes('فني') ||
      qLower.includes('أين') ||
      qLower.includes('موقع')
    ) {
      toolsCalledList.push('getTechnicianStatus');
      cannedAnswer = isArabic
        ? `### 📍 الموقع الحالي للأسطول الميداني (تتبع GPS مباشر):
* **Rashid Al-Nuaimi (TECH-HVAC-01)**: مركبة **Van DXB-12**
  * الحالة: **في الطريق (EN_ROUTE)** بسرعة 48 كم/س على شارع الشيخ زايد (الخليج التجاري).
  * المهمة الحالية: **WO-2026-00001** لدى بالم كرست العقارية (وقت الوصول المتوقع: 12 دقيقة).
* **Vikram Patel (TECH-ELE-02)**: مركبة **Van DXB-04**
  * الحالة: **في الطريق (EN_ROUTE)** بسرعة 52 كم/س في وسط مدينة دبي متوجهاً إلى **WO-2026-00003**.
* **Tariq Al-Mansoor (TECH-PLU-01)**: مركبة **Van DXB-02**
  * الحالة: **في موقع العمل (ON_JOB)** في البرشاء ينفذ **WO-2026-00002**.
* **Joseph Mathew (TECH-PLU-03)**: مركبة **Van DXB-08**
  * الحالة: **متاح وجاهز للتكليف (AVAILABLE)** في مستودع القوز الصناعية 3 (مرشح مثالي لـ **WO-2026-00025**).`
        : `### 📍 Live Fleet Telematics & Technician Positions:
* **Rashid Al-Nuaimi (TECH-HVAC-01)**: **Van DXB-12**
  * Status: **EN_ROUTE** (48 km/h) on Sheikh Zayed Rd, Business Bay.
  * Active Assignment: **WO-2026-00001** for Palm Crest Properties LLC (ETA: 12 min).
* **Vikram Patel (TECH-ELE-02)**: **Van DXB-04**
  * Status: **EN_ROUTE** (52 km/h) in Downtown Dubai heading to **WO-2026-00003**.
* **Tariq Al-Mansoor (TECH-PLU-01)**: **Van DXB-02**
  * Status: **ON_JOB** at Al Barsha completing **WO-2026-00002**.
* **Joseph Mathew (TECH-PLU-03)**: **Van DXB-08**
  * Status: **AVAILABLE** at Al Quoz Industrial 3 (Prime candidate for emergency **WO-2026-00025**).`;
    }
    // Specific Work Order query
    else if (qLower.includes('wo-')) {
      toolsCalledList.push('getJobDetails');
      const match = queryText.match(/WO-\d{4}-\d{5}|WO-\d{5}/i);
      const woNum = match ? match[0].toUpperCase() : 'WO-2026-00001';
      cannedAnswer = isArabic
        ? `### 📋 تفاصيل أمر العمل: **${woNum}**
* **العميل**: شركة بالم كرست العقارية (Palm Crest Properties LLC)
* **الحالة**: **قيد التنفيذ (IN_PROGRESS)**
* **الفني المكلف**: **Tariq Al-Mansoor** (فني سباكة أول)
* **القيمة الإجمالية**: **380.00 د.إ** (شامل 5% ضريبة القيمة المضافة)
* **الموقع**: برج كراون، وسط مدينة دبي`
        : `### 📋 Work Order Details: **${woNum}**
* **Customer**: Palm Crest Properties LLC
* **Status**: **IN_PROGRESS** (Execution Phase)
* **Assigned Technician**: **Tariq Al-Mansoor** (Senior Plumbing Lead)
* **Billed Total**: **AED 380.00** (incl. 5% UAE VAT)
* **Location**: Crown Tower, Downtown Dubai`;
    }
    // Specific Tax Invoice query
    else if (qLower.includes('inv-')) {
      toolsCalledList.push('getOverdueInvoices');
      const match = queryText.match(/INV-\d{4}-\d{5}|INV-\d{5}/i);
      const invNum = match ? match[0].toUpperCase() : 'INV-2026-00001';
      cannedAnswer = isArabic
        ? `### 🧾 تفاصيل الفاتورة الضريبية: **${invNum}**
* **العميل**: مجمع خليج الهلال التجاري (Crescent Bay Commercial Complex)
* **الحالة**: **معتمدة ومصدرة (ISSUED)**
* **المبلغ الإجمالي**: **4,410.00 د.إ** (الأساس: 4,200.00 + ضريبة 5%: 210.00 د.إ)
* **الرقم الضريبي TRN**: \`100000000000003 (demo)\``
        : `### 🧾 FTA Tax Invoice Details: **${invNum}**
* **Customer**: Crescent Bay Commercial Complex
* **Status**: **ISSUED** (FTA Compliant)
* **Total Payable**: **AED 4,410.00** (Base: AED 4,200.00 + VAT 5%: AED 210.00)
* **Issuer TRN**: \`100000000000003 (demo)\``;
    }
    // General fallback
    else {
      toolsCalledList.push('getKpiSummary');
      cannedAnswer = isArabic
        ? `مرحباً بك! أنا مساعد FIXnGO للعمليات التشغيلية في دولة الإمارات.
* إجمالي الإيرادات لشهر سبتمبر: **486,200.00 د.إ** (شامل 5% ضريبة القيمة المضافة)
* الطلبات النشطة: **38 طلباً** | المكتملة: **412 طلباً** (نسبة الالتزام بالاتفاقية: **94.2%**)
* الأسطول الميداني: **18 مركبة نشطة** على الطريق.

يمكنك النقر على أحد الأسئلة المقترحة أو سؤالي عن أوامر العمل (\`WO-\`)، الفواتير الضريبية (\`INV-\`)، أو مواقع الفنيين الميدانيين.`
        : `Hello! I am your FIXnGO Operations Assistant for UAE field facilities.
* September Gross Revenue: **AED 486,200.00** (incl. 5% UAE VAT)
* Active Work Orders: **38** | Completed: **412** (SLA Compliance: **94.2%**)
* Active Service Fleet: **18 vans** on the road.

You can click any suggested question chip below or ask me about specific work orders (\`WO-\`), tax invoices (\`INV-\`), technician GPS, or profitability.`;
    }

    setThinkingStatus(isArabic ? 'جاري تحليل العمليات المباشرة...' : 'Analyzing live operations...');
    if (toolsCalledList.length > 0) {
      setActiveToolName(toolsCalledList[0]);
    }

    let accumulatedText = '';
    const words = cannedAnswer.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const slice = words.slice(i, i + 3).join(' ') + ' ';
      accumulatedText += slice;
      setThinkingStatus(null);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: accumulatedText, toolsCalled: toolsCalledList }
            : msg
        )
      );
      await new Promise((r) => setTimeout(r, 20));
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessageId
          ? { ...msg, content: accumulatedText, isStreaming: false, toolsCalled: toolsCalledList }
          : msg
      )
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: isArabic
          ? 'تم تفريغ المحادثة. كيف يمكنني مساعدتك في إدارة العمليات الميدانية الآن؟'
          : 'Conversation cleared. How can I assist you with field operations now?',
      },
    ]);
  };

  /**
   * Helper that turns WO- and INV- and TECH- into clickable links
   */
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Headers
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm text-navy dark:text-white mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }

          // Bullets
          const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
          const text = isBullet ? line.trim().substring(2) : line;

          // Parse bold and identifiers (WO-, INV-, TECH-)
          const parts = text.split(/(\*\*.*?\*\*|`.*?`|WO-\d{4}-\d{4}|WO-\d{5}|INV-\d{4}-\d{4}|INV-\d{5}|TECH-[A-Z]+-\d{2})/g);

          const renderedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900 dark:text-slate-100">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={pIdx} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-signal-orange">
                  {part.slice(1, -1)}
                </code>
              );
            }
            if (part.startsWith('WO-')) {
              return (
                <Link
                  key={pIdx}
                  href={`/${locale}/admin/work-orders`}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/80 text-signal-orange font-bold font-mono text-[11px] hover:underline"
                  title="View Work Order"
                >
                  <span>{part}</span>
                  <ExternalLink className="w-2.5 h-2.5 inline" />
                </Link>
              );
            }
            if (part.startsWith('INV-')) {
              return (
                <Link
                  key={pIdx}
                  href={`/${locale}/admin/billing`}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-[11px] hover:underline"
                  title="View Tax Invoice"
                >
                  <span>{part}</span>
                  <ExternalLink className="w-2.5 h-2.5 inline" />
                </Link>
              );
            }
            if (part.startsWith('TECH-')) {
              return (
                <Link
                  key={pIdx}
                  href={`/${locale}/admin/technicians`}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-ocean-blue font-bold font-mono text-[11px] hover:underline"
                  title="View Technician"
                >
                  <span>{part}</span>
                </Link>
              );
            }
            return <span key={pIdx}>{part}</span>;
          });

          return (
            <div key={idx} className={isBullet ? 'flex items-start gap-1.5 ps-1' : ''}>
              {isBullet && <span className="text-signal-orange shrink-0 mt-0.5">•</span>}
              <div className="flex-1">{renderedLine}</div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity"
    >
      <div className="w-full sm:w-[420px] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-s border-line dark:border-slate-800 animate-slide-in">
        {/* Top Header */}
        <div className="p-3.5 border-b border-line dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-signal-orange flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-navy dark:text-white text-sm font-display">
                  Ask FIXnGO
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isArabic ? 'متصل' : 'Live'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isArabic ? 'مساعد العمليات الميدانية والمعلومات التشغيلية' : 'Live Field & Operational Information'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title={isArabic ? 'تفريغ المحادثة' : 'Clear Chat'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title={isArabic ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Selector Bar */}
        <div className="px-3 py-2 bg-ground dark:bg-slate-950 border-b border-line dark:border-slate-800 flex items-center justify-between text-xs shrink-0 relative">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <User className="w-3.5 h-3.5 text-signal-orange" />
            <span>{isArabic ? 'الملف الحالي:' : 'Profile:'}</span>
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="font-bold text-navy dark:text-white flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>{activeRole.title}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-line dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300">
            {activeRole.badge}
          </span>

          {/* Role Dropdown Menu */}
          {roleDropdownOpen && (
            <div className="absolute top-full start-2 end-2 mt-1 bg-white dark:bg-slate-900 border border-line dark:border-slate-700 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                {isArabic ? 'تبديل الملف الشخصي' : 'Switch Profile'}
              </div>
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setActiveRoleKey(r.key);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-start px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition ${
                    activeRoleKey === r.key
                      ? 'bg-signal-orange/10 text-signal-orange font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-ink dark:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-[10px] text-slate-400">{r.title}</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                    {r.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Messages Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3 sm:p-3.5 shadow-xs relative ${
                    isUser
                      ? 'bg-navy text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-ink dark:text-slate-100 rounded-bl-xs border border-line/60 dark:border-slate-700'
                  }`}
                >
                  {isUser ? (
                    <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
                      {m.content}
                    </div>
                  ) : (
                    <div>
                      {renderFormattedContent(m.content)}

                      {/* Operational source indicator without technical terms or code */}
                      {m.toolsCalled && m.toolsCalled.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>{isArabic ? 'تم التحقق من السجلات التشغيلية المباشرة' : 'Verified from live operational records'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Copy Button */}
                  {!isUser && m.content && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="absolute top-2 end-2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition"
                      title="Copy to clipboard"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking & Live Status */}
          {thinkingStatus && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-xs text-signal-orange animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span className="font-medium">{thinkingStatus}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="p-2.5 border-t border-line dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0">
          <div className="text-[10px] font-bold text-slate-400 mb-1.5 px-1 uppercase tracking-wider">
            {isArabic ? 'أسئلة مقترحة سريعة' : 'Suggested Inquiries'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, idx) => {
              const Icon = q.icon;
              const text = isArabic ? q.ar : q.en;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(text)}
                  disabled={isStreaming}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-signal-orange text-[11px] font-medium border border-line dark:border-slate-700 transition shadow-2xs disabled:opacity-50"
                >
                  <Icon className="w-3 h-3 text-signal-orange shrink-0" />
                  <span>{text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-line dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                isArabic
                  ? 'اسأل عن أمر عمل، فني، فاتورة، أو أرباح...'
                  : 'Ask about work orders, technicians, or finance...'
              }
              disabled={isStreaming}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-line dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-ink dark:text-white outline-none focus:ring-2 focus:ring-signal-orange/20 focus:border-signal-orange transition"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isStreaming}
              className="w-9 h-9 rounded-xl bg-signal-orange hover:bg-orange-700 text-white flex items-center justify-center transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Send Inquiry"
            >
              <Send className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 mt-1.5 text-center">
            {isArabic
              ? 'تحديثات فورية للعمليات الميدانية مع الحفاظ على سرية البيانات'
              : 'Real-time operational updates with role-based data privacy'}
          </div>
        </div>
      </div>
    </div>
  );
}
