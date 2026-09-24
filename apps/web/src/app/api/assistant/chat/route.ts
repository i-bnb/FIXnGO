import { NextRequest, NextResponse } from 'next/server';

interface ChatRequestBody {
  query: string;
  role?: string;
}

/**
 * Next.js Edge/Serverless Route Handler for Ask FIXnGO Assistant
 * Provides resilient proxying to NestJS API with automatic instant fallback streaming
 */
export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
  }

  const query = body?.query?.trim() || '';
  const role = (req.headers.get('x-demo-role') || body?.role || 'SUPER_ADMIN').toUpperCase();

  if (!query) {
    return NextResponse.json({ message: 'Query is required' }, { status: 400 });
  }

  // 1. Try forwarding to backend API if configured
  const backendBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout before graceful fallback

    const backendRes = await fetch(`${backendBaseUrl.replace(/\/$/, '')}/api/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': role,
      },
      body: JSON.stringify({ query, role }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (backendRes.ok && backendRes.body) {
      // Pipe stream directly from backend
      return new Response(backendRes.body, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }
  } catch (backendError) {
    // Backend is unreachable, sleeping, or timed out - continue to resilient fallback generator
  }

  // 2. Resilient SSE Stream Generator (Next.js server-side fallback)
  const isArabic = /[\u0600-\u06FF]/.test(query);
  const qLower = query.toLowerCase();

  let cannedAnswer = '';
  const toolsCalled: string[] = [];

  // Question 1: Attention today / SLA breaches
  if (
    qLower.includes('attention') ||
    qLower.includes('urgent') ||
    qLower.includes('emergency') ||
    qLower.includes('اهتمام') ||
    qLower.includes('طوارئ') ||
    qLower.includes('عاجل')
  ) {
    toolsCalled.push('getSlaBreaches');
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
    toolsCalled.push('getJobProfitability');
    if (role === 'DISPATCHER') {
      cannedAnswer = isArabic
        ? `⛔ **عذراً، الوصول غير مصرح به**:
دورك الحالي (**DISPATCHER**) لا يملك صلاحية \`finance.view\` اللازمة للاطلاع على هوامش الربحية وبيانات الخسائر التشغيلية. يرجى مراجعة المدير المالي أو المحاسب الرئيسي (**Fatima Al-Zahra**).`
        : `⛔ **Access Denied**:
Your current role (**DISPATCHER**) does not possess the required \`finance.view\` permission to inspect job gross margins and financial profitability figures. Please consult your Senior Accountant (**Fatima Al-Zahra**) or Super Administrator.`;
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
    toolsCalled.push('getReceivablesAging');
    toolsCalled.push('getOverdueInvoices');
    if (role === 'DISPATCHER') {
      cannedAnswer = isArabic
        ? `⛔ **عذراً، الوصول غير مصرح به**:
لا تملك صلاحية \`finance.view\` لعرض الفواتير المتأخرة والذمم المدينة. يرجى طلب البيانات من المحاسب المالي.`
        : `⛔ **Access Denied**:
You lack the required \`finance.view\` permission to inspect accounts receivable aging and overdue debtor balances.`;
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
    toolsCalled.push('getTechnicianStatus');
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
  // Generic or other query
  else {
    toolsCalled.push('getKpiSummary');
    cannedAnswer = isArabic
      ? `مرحباً بك! أنا مساعد FIXnGO للعمليات التشغيلية في دولة الإمارات.
* إجمالي الإيرادات لشهر سبتمبر: **486,200.00 د.إ** (شامل 5% ضريبة القيمة المضافة)
* الطلبات النشطة: **38 طلباً** | المكتملة: **412 طلباً** (نسبة الالتزام بالاتفاقية: **94.2%**)
* الأسطول الميداني: **18 مركبة نشطة** على الطريق.

يمكنك النقر على الأسئلة المقترحة أو سؤالي عن أي أمر عمل (\`WO-\`)، فاتورة (\`INV-\`)، أو مواقع الفنيين الميدانيين.`
      : `Hello! I am your FIXnGO Operations Assistant for UAE field facilities.
* September Gross Revenue: **AED 486,200.00** (incl. 5% UAE VAT)
* Active Work Orders: **38** | Completed: **412** (SLA Compliance: **94.2%**)
* Active Service Fleet: **18 vans** on the road.

You can click any suggested question chip below or ask me about specific work orders (\`WO-\`), tax invoices (\`INV-\`), technician GPS, or profitability.`;
  }

  // Stream encoder
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // 1. Thinking event
      const thinkingMsg = isArabic ? 'جاري تحليل العمليات المباشرة...' : 'Analyzing live operations...';
      controller.enqueue(encoder.encode(`event: thinking\ndata: ${JSON.stringify(thinkingMsg)}\n\n`));

      // 2. Tool calls
      for (const t of toolsCalled) {
        controller.enqueue(encoder.encode(`event: tool_call\ndata: ${JSON.stringify({ name: t })}\n\n`));
      }

      // 3. Chunks with typewriter effect
      const words = cannedAnswer.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        const slice = words.slice(i, i + 3).join(' ') + ' ';
        controller.enqueue(encoder.encode(`event: chunk\ndata: ${JSON.stringify(slice)}\n\n`));
        await new Promise((r) => setTimeout(r, 25));
      }

      // 4. Done event
      controller.enqueue(encoder.encode(`event: done\ndata: ""\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
