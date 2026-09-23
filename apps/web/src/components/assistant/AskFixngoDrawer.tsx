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
  { key: 'DISPATCHER', name: 'Mariam Al-Kaabi', title: 'Dispatcher', badge: 'Ops Only (No Finance)' },
  { key: 'OPS_MANAGER', name: 'Tariq Mansoor', title: 'Operations Mgr', badge: 'Ops Access' },
];

export function AskFixngoDrawer({ isOpen, onClose, locale }: AskFixngoDrawerProps) {
  const isArabic = locale === 'ar';
  const [activeRoleKey, setActiveRoleKey] = useState<string>('SUPER_ADMIN');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isArabic
        ? `مرحباً بك! أنا **مساعد FIXnGO الذكي للعمليات التشغيلية** في دولة الإمارات.
* يمكنك سؤالي عن أوامر العمل (\`WO-\`)، فواتير ضريبة القيمة المضافة (\`INV-\`)، تتبع الفنيين المباشر عبر GPS، أو تقارير الأرباح والخسائر.
* انقر على أحد الأسئلة المقترحة أدناه للبدء فوراً.`
        : `Hello! I am the **FIXnGO Operations Assistant** powered by Google Gemini and live telematics.
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

    try {
      const response = await fetch(`${apiUrl}/api/assistant/chat`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned error ${response.status}`);
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
            setThinkingStatus(isArabic ? 'جاري استرداد البيانات من قاعدة البيانات...' : 'Executing query on database...');
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
            setThinkingStatus(null);
            accumulatedText += `\n\n⚠️ Error: ${parsedData}`;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedText, isStreaming: false }
                  : msg
              )
            );
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
      console.error('AI Assistant stream error:', err);
      setThinkingStatus(null);
      setActiveToolName(null);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  msg.content ||
                  (isArabic
                    ? '⚠️ تعذر الاتصال بمساعد FIXnGO حالياً. يرجى التحقق من اتصال الخادم والمحاولة مرة أخرى.'
                    : '⚠️ Unable to connect to FIXnGO Assistant. Please verify that the backend API is online and try again.'),
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      setThinkingStatus(null);
      setActiveToolName(null);
    }
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
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isArabic ? 'مساعد العمليات الميدانية والبيانات الحية' : 'Live Operations & Financial Intelligence'}
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

        {/* Persona / RBAC Role Selector Bar */}
        <div className="px-3 py-2 bg-ground dark:bg-slate-950 border-b border-line dark:border-slate-800 flex items-center justify-between text-xs shrink-0 relative">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <User className="w-3.5 h-3.5 text-signal-orange" />
            <span>{isArabic ? 'الدور النشط:' : 'Asking as:'}</span>
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="font-bold text-navy dark:text-white flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>{activeRole.title}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-line dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300">
            {activeRole.badge}
          </span>

          {/* Role Dropdown Menu */}
          {roleDropdownOpen && (
            <div className="absolute top-full start-2 end-2 mt-1 bg-white dark:bg-slate-900 border border-line dark:border-slate-700 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                {isArabic ? 'اختر الدور لاختبار صلاحيات RBAC' : 'Select Persona to Test RBAC Permissions'}
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

                      {/* Tool call citations */}
                      {m.toolsCalled && m.toolsCalled.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-bold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-signal-orange" />
                            {isArabic ? 'المصادر المباشرة:' : 'Live verified tools:'}
                          </span>
                          {m.toolsCalled.map((tName, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                            >
                              {tName}()
                            </span>
                          ))}
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

          {/* Thinking & Live Tool Execution State */}
          {thinkingStatus && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-xs text-signal-orange animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span className="font-medium">{thinkingStatus}</span>
              {activeToolName && (
                <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-orange-200">
                  {activeToolName}()
                </span>
              )}
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
              ? 'يتم التحقق من الصلاحيات وربط البيانات مع النظام في الوقت الفعلي'
              : 'Strict read-only queries with live RBAC permission enforcement'}
          </div>
        </div>
      </div>
    </div>
  );
}
