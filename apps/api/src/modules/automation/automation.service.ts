import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { DispatchService } from '../dispatch/dispatch.service';

@Injectable()
export class AutomationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutomationService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
    private dispatchService: DispatchService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Automation Engine with resilient BullMQ/In-Memory scheduler...');
    // Run automated cycle check every 15 minutes (or on demand via REST)
    this.timer = setInterval(() => {
      this.runScheduledChecks().catch((err) => {
        this.logger.error(`Error during automated background check: ${err.message}`);
      });
    }, 15 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async runScheduledChecks() {
    this.logger.log('Executing automated background tasks cycle...');
    const [sla, amc, rental, invoices, stock] = await Promise.allSettled([
      this.checkSlaBreaches(),
      this.checkAmcVisitReminders(),
      this.checkRentalReturns(),
      this.checkOverdueInvoices(),
      this.checkLowStockAlerts(),
    ]);

    return {
      sla: sla.status === 'fulfilled' ? sla.value : null,
      amc: amc.status === 'fulfilled' ? amc.value : null,
      rental: rental.status === 'fulfilled' ? rental.value : null,
      invoices: invoices.status === 'fulfilled' ? invoices.value : null,
      stock: stock.status === 'fulfilled' ? stock.value : null,
      timestamp: new Date(),
    };
  }

  // 1. SLA Breach Alerts: Checks work orders exceeding response time threshold
  async checkSlaBreaches() {
    const criticalThreshold = new Date(Date.now() - 2 * 3600 * 1000); // 2 hours
    const highThreshold = new Date(Date.now() - 4 * 3600 * 1000); // 4 hours

    const breachingOrders = await this.prisma.workOrder.findMany({
      where: {
        deletedAt: null,
        status: { in: ['NEW', 'QUOTED'] },
        OR: [
          { priority: 'CRITICAL', createdAt: { lte: criticalThreshold } },
          { priority: 'HIGH', createdAt: { lte: highThreshold } },
        ],
      },
      include: { customer: true },
    });

    for (const wo of breachingOrders) {
      this.logger.warn(`[SLA BREACH ALERT] Work order #${wo.orderNumber} (${wo.priority}) unassigned for > threshold!`);
      this.realtimeGateway.emitFleetAlert({
        type: 'SLA_BREACH',
        workOrderId: wo.id,
        orderNumber: wo.orderNumber,
        title: wo.title,
        priority: wo.priority,
        message: `SLA Warning: ${wo.priority} work order #${wo.orderNumber} for ${wo.customer.name} requires immediate dispatch!`,
      });

      // Record reminder in database
      await this.prisma.reminder.create({
        data: {
          entityType: 'WORK_ORDER',
          entityId: wo.id,
          reminderDate: new Date(),
          message: `SLA breach alert for ${wo.orderNumber}`,
          status: 'SENT',
        },
      });
    }

    return { breachingCount: breachingOrders.length, workOrders: breachingOrders.map((w) => w.orderNumber) };
  }

  // 2. AMC Visit Reminders: upcoming quarterly visits in next 7 days
  async checkAmcVisitReminders() {
    const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    const visits = await this.prisma.contractVisitSchedule.findMany({
      where: {
        completedDate: null,
        scheduledDate: { lte: nextWeek, gte: new Date() },
      },
      include: { contract: { include: { customer: true, site: true } } },
    });

    for (const v of visits) {
      await this.prisma.reminder.create({
        data: {
          entityType: 'AMC_VISIT',
          entityId: v.id,
          reminderDate: new Date(),
          message: `Upcoming AMC Visit #${v.visitNumber} for contract ${v.contract.contractNumber} (${v.contract.customer.name}) on ${v.scheduledDate.toISOString().split('T')[0]}`,
          status: 'SCHEDULED',
        },
      });
    }

    return { upcomingVisitsCount: visits.length };
  }

  // 3. Rental Return Reminders: off-hire due within 48h
  async checkRentalReturns() {
    const inTwoDays = new Date(Date.now() + 2 * 24 * 3600 * 1000);
    const contracts = await this.prisma.rentalContract.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        expectedEndDate: { lte: inTwoDays },
      },
      include: { customer: true, lines: { include: { equipment: true } } },
    });

    for (const c of contracts) {
      await this.prisma.reminder.create({
        data: {
          entityType: 'CONTRACT',
          entityId: c.id,
          reminderDate: new Date(),
          message: `Rental return due soon for ${c.contractNumber} (${c.customer.name})`,
          status: 'SCHEDULED',
        },
      });
    }

    return { dueReturnsCount: contracts.length };
  }

  // 4. Overdue Invoice Reminders: 3, 7, 15 days overdue
  async checkOverdueInvoices() {
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        deletedAt: null,
        paymentStatus: { not: 'PAID' },
        dueDate: { lt: new Date() },
      },
      include: { customer: true },
    });

    for (const inv of overdueInvoices) {
      const daysOverdue = Math.floor((Date.now() - inv.dueDate.getTime()) / (24 * 3600 * 1000));
      await this.prisma.reminder.create({
        data: {
          entityType: 'INVOICE',
          entityId: inv.id,
          reminderDate: new Date(),
          message: `Invoice ${inv.invoiceNumber} is ${daysOverdue} days overdue. Balance due: AED ${Number(inv.balanceDue).toFixed(2)}`,
          status: 'SENT',
        },
      });
    }

    return { overdueCount: overdueInvoices.length };
  }

  // 5. Low-Stock Alerts
  async checkLowStockAlerts() {
    const lowStockLevels = await this.prisma.stockLevel.findMany({
      where: {
        deletedAt: null,
        quantityAvailable: { lte: 10 },
      },
      include: { item: true, warehouse: true },
    });

    const alerts = lowStockLevels.map((sl) => ({
      item: sl.item.name,
      warehouse: sl.warehouse.name,
      available: sl.quantityAvailable,
      reorderLevel: sl.reorderLevel,
    }));

    if (alerts.length > 0) {
      this.logger.warn(`[LOW STOCK ALERT] ${alerts.length} item(s) below safety stock!`);
    }

    return { lowStockCount: alerts.length, items: alerts };
  }

  // -------------------------------------------------------------------------
  // END-TO-END DEMO SCENARIOS RUNNER (9 Core Business Scenarios)
  // -------------------------------------------------------------------------

  async getScenarioDefinitions() {
    return [
      {
        key: 'new-request-auto-reply',
        title: 'New Service Request Auto-Reply',
        category: 'Customer Experience',
        triggerEvent: 'Service Request Created',
        targetRole: 'CUSTOMER',
        channel: 'WHATSAPP_SIMULATED',
        description: 'Instant bilingual acknowledgment message dispatched when a homeowner or facility submits a maintenance request.',
      },
      {
        key: 'job-assigned',
        title: 'Job Assigned: Tech Details Dispatched',
        category: 'Dispatch & Fleet',
        triggerEvent: 'Work Order Assigned',
        targetRole: 'CUSTOMER',
        channel: 'WHATSAPP_SIMULATED',
        description: 'Customer notified with assigned lead technician name, van number, star rating, and ETA slot.',
      },
      {
        key: 'tech-en-route',
        title: 'Technician En Route: Live GPS Link',
        category: 'Dispatch & Fleet',
        triggerEvent: 'Technician Status -> EN_ROUTE',
        targetRole: 'CUSTOMER',
        channel: 'WHATSAPP_SIMULATED',
        description: 'Dispatches live turn-by-turn map tracking link and countdown ETA ("Arriving in 18 minutes").',
      },
      {
        key: 'job-completed',
        title: 'Job Completed: Instant Pay Link & Invoice',
        category: 'Finance & Invoicing',
        triggerEvent: 'Work Order Completed & Signed',
        targetRole: 'CUSTOMER',
        channel: 'SMS_SIMULATED',
        description: 'Tax invoice generated with 5% UAE VAT and 1-tap Stripe payment link dispatched to customer phone.',
      },
      {
        key: 'invoice-overdue',
        title: 'Overdue Invoice Automated Dunning',
        category: 'Finance & Invoicing',
        triggerEvent: 'Invoice Aging > 7 Days Overdue',
        targetRole: 'ACCOUNTANT',
        channel: 'EMAIL',
        description: 'Automated follow-up notice sent to corporate client accounts with outstanding balance and bank details.',
      },
      {
        key: 'amc-visit-due',
        title: 'Preventive AMC Visit Due Reminder',
        category: 'Contracts & Assets',
        triggerEvent: 'Quarterly Maintenance Schedule (7 Days)',
        targetRole: 'OPS_MANAGER',
        channel: 'EMAIL',
        description: 'Alerts client and operations manager of scheduled quarterly AC chiller maintenance visit.',
      },
      {
        key: 'rental-return-due',
        title: 'Heavy Equipment Rental Return Reminder',
        category: 'Equipment Rental',
        triggerEvent: 'Off-Hire Date Within 24-48 Hours',
        targetRole: 'CUSTOMER',
        channel: 'SMS_SIMULATED',
        description: 'Off-hire notification for site machinery (generators, boom lifts) with 1-tap lease extension prompt.',
      },
      {
        key: 'low-stock-po',
        title: 'Low Van/Depot Stock -> PO Draft for Approval',
        category: 'Inventory & Procurement',
        triggerEvent: 'Quantity Available <= Safety Threshold',
        targetRole: 'SUPER_ADMIN',
        channel: 'SYSTEM',
        description: 'Auto-generates draft Purchase Order to supplier and routes to Super Admin Sultan for digital approval.',
      },
      {
        key: 'daily-summary',
        title: 'Daily Management KPI Rollup Summary',
        category: 'Executive Management',
        triggerEvent: '6:00 PM Daily Operational Rollup',
        targetRole: 'SUPER_ADMIN',
        channel: 'WHATSAPP_SIMULATED',
        description: 'Rollup debrief for executive leadership: revenue today, jobs completed, SLA compliance, and cash collected.',
      },
    ];
  }

  async runScenario(scenarioKey: string, customParams?: any) {
    this.logger.log(`[Demo Scenario Runner] Executing: ${scenarioKey}...`);

    let recipientRole = 'SUPER_ADMIN';
    let recipientName = 'Sultan Al-Falasi';
    let channel: 'WHATSAPP_SIMULATED' | 'EMAIL' | 'SMS_SIMULATED' | 'IN_APP' = 'WHATSAPP_SIMULATED';
    let title = '';
    let titleAr = '';
    let messageEn = '';
    let messageAr = '';
    let metadata: Record<string, any> = {};

    switch (scenarioKey) {
      case 'new-request-auto-reply': {
        recipientRole = 'CUSTOMER';
        recipientName = 'Zaid Al-Harbi';
        channel = 'WHATSAPP_SIMULATED';
        title = 'Service Request Confirmed #SR-2026-0812';
        titleAr = 'تم تأكيد طلب الخدمة رقم SR-2026-0812';
        messageEn = 'Thank you Zaid! Your service request #SR-2026-0812 for Emergency Plumbing has been received. Our Dubai dispatch team is assigning a certified technician.';
        messageAr = 'شكراً لك زيد! تم استلام طلب الخدمة رقم SR-2026-0812 لإصلاح السباكة الطارئ. يقوم فريق التوزيع بتعيين فني معتمد.';
        metadata = { serviceRequestId: 'sr-0812', requestNumber: 'SR-2026-0812', category: 'PLUMBING' };
        break;
      }

      case 'job-assigned': {
        recipientRole = 'CUSTOMER';
        recipientName = 'Zaid Al-Harbi';
        channel = 'WHATSAPP_SIMULATED';
        title = 'Technician Assigned to #WO-2026-002';
        titleAr = 'تم تعيين الفني للطلب WO-2026-002';
        messageEn = 'Good news! Lead Technician Rashid Al-Nuaimi (4.95 ★, Van-01) has been assigned to your job #WO-2026-002. Scheduled time: 09:00 AM - 11:00 AM.';
        messageAr = 'أخبار سارة! تم تعيين الفني الأول راشد النعيمي (4.95 ★، شاحنة-01) لطلبك رقم WO-2026-002. الموعد المجدول: 09:00 صباحاً.';
        metadata = { workOrderId: 'wo-2', orderNumber: 'WO-2026-002', techName: 'Rashid Al-Nuaimi', van: 'Van-01' };
        break;
      }

      case 'tech-en-route': {
        recipientRole = 'CUSTOMER';
        recipientName = 'Zaid Al-Harbi';
        channel = 'WHATSAPP_SIMULATED';
        title = 'Technician En Route (ETA 18 Min)';
        titleAr = 'الفني في الطريق (الوصول خلال 18 دقيقة)';
        messageEn = 'Technician Rashid Al-Nuaimi is en route in Van-01. Estimated arrival: 18 minutes! Live tracking: https://fieldops.ae/en/app/track/wo-2';
        messageAr = 'الفني راشد النعيمي في الطريق إليك في الشاحنة 01. وقت الوصول التقديري: 18 دقيقة! التتبع المباشر: https://fieldops.ae/ar/app/track/wo-2';
        metadata = { workOrderId: 'wo-2', etaMinutes: 18, trackingUrl: 'https://fieldops.ae/en/app/track/wo-2' };
        break;
      }

      case 'job-completed': {
        recipientRole = 'CUSTOMER';
        recipientName = 'Zaid Al-Harbi';
        channel = 'SMS_SIMULATED';
        title = 'Job Completed: Invoice INV-2026-0042 Ready';
        titleAr = 'تم إنجاز العمل: الفاتورة INV-2026-0042 جاهزة';
        messageEn = 'Your plumbing repair #WO-2026-002 is complete! Tax Invoice INV-2026-0042 (AED 383.25 incl 5% UAE VAT) is ready. Pay online in 1 tap: https://fieldops.ae/pay/inv-0042';
        messageAr = 'تم إنجاز عمل السباكة رقم WO-2026-002 بنجاح! الفاتورة الضريبية INV-2026-0042 (383.25 د.إ شاملة الضريبة) جاهزة. ادفع الآن: https://fieldops.ae/pay/inv-0042';
        metadata = { workOrderId: 'wo-2', invoiceNumber: 'INV-2026-0042', amount: 383.25, payUrl: 'https://fieldops.ae/pay/inv-0042' };
        break;
      }

      case 'invoice-overdue': {
        recipientRole = 'ACCOUNTANT';
        recipientName = 'Fatima Al-Zahra';
        channel = 'EMAIL';
        title = 'Dunning Alert: Invoice INV-2026-0003 13 Days Overdue';
        titleAr = 'تنبيه مطالبة: الفاتورة INV-2026-0003 متأخرة 13 يوماً';
        messageEn = 'Urgent Follow-Up: Tax Invoice INV-2026-0003 for Address Downtown (AED 4,410.00) is 13 days overdue. Automated reminder email and statement dispatched to client accounts.';
        messageAr = 'متابعة عاجلة: الفاتورة الضريبية رقم INV-2026-0003 لصالح فندق العنوان وسط المدينة (4,410.00 د.إ) متأخرة منذ 13 يوماً. تم إرسال بريد التذكير الآلي.';
        metadata = { invoiceNumber: 'INV-2026-0003', customer: 'Address Downtown', overdueDays: 13, balanceDue: 4410.0 };
        break;
      }

      case 'amc-visit-due': {
        recipientRole = 'OPS_MANAGER';
        recipientName = 'Tariq Mansoor';
        channel = 'EMAIL';
        title = 'Preventive AMC Visit Due in 7 Days (Crescent Bay)';
        titleAr = 'موعد زيارة الصيانة الوقائية السنوية خلال 7 أيام';
        messageEn = 'Notice: Quarterly HVAC Preventive Maintenance under contract AMC-2026-0012 (Crescent Bay Commercial) is due on Sept 30, 2026. PM Work order #WO-2026-0091 auto-drafted.';
        messageAr = 'إشعار: موعد الصيانة الدورية الفصلية للتكييف بموجب العقد AMC-2026-0012 (كريسنت باي العقارية) مستحق بتاريخ 30 سبتمبر 2026.';
        metadata = { contractNumber: 'AMC-2026-0012', client: 'Crescent Bay Commercial', scheduledDate: '2026-09-30' };
        break;
      }

      case 'rental-return-due': {
        recipientRole = 'CUSTOMER';
        recipientName = 'Palm Crest Construction Site Office';
        channel = 'SMS_SIMULATED';
        title = 'Equipment Rental Off-Hire Notice: 100kVA Generator';
        titleAr = 'إشعار انتهاء فترة تأجير المعدة: مولد 100 كيلو فولت أمبير';
        messageEn = 'Off-Hire Alert: 100kVA Cummins Diesel Generator on contract RC-2026-0005 is due for return tomorrow at 05:00 PM. Reply EXTEND to prolong equipment rental.';
        messageAr = 'تنبيه انتهاء التأجير: مولد الديزل كامنز 100 ك.ف.أ بموجب العقد RC-2026-0005 مستحق الإرجاع غداً الساعة 5:00 مساءً. أرسل EXTEND للتمديد.';
        metadata = { contractNumber: 'RC-2026-0005', equipment: 'Cummins 100kVA Generator', site: 'Palm Crest Downtown Phase 2' };
        break;
      }

      case 'low-stock-po': {
        recipientRole = 'SUPER_ADMIN';
        recipientName = 'Sultan Al-Falasi';
        channel = 'WHATSAPP_SIMULATED';
        title = 'Low Stock Alert: R410A Gas -> Draft PO-2026-0048 Ready';
        titleAr = 'تنبيه نفاد المخزون: غاز R410A -> مسودة أمر الشراء جاهزة';
        messageEn = 'Reorder Alert: R410A Refrigerant Cylinders at Central Warehouse reached 2 units (Safety threshold: 5). Automated Draft PO-2026-0048 (AED 4,560.00) generated for your approval.';
        messageAr = 'تنبيه إعادة الطلب: وصل مخزون أسطوانات غاز R410A إلى وحدتين (الحد الآمن: 5). تم إنشاء مسودة أمر الشراء PO-2026-0048 (4,560 د.إ) بانتظار اعتمادك.';
        metadata = { poNumber: 'PO-2026-0048', item: 'R410A Refrigerant 11.3kg', qtyRemaining: 2, poAmount: 4560.0 };
        break;
      }

      case 'daily-summary': {
        recipientRole = 'SUPER_ADMIN';
        recipientName = 'Sultan Al-Falasi';
        channel = 'WHATSAPP_SIMULATED';
        title = 'Daily Executive KPI Summary: 14 Jobs • AED 18,450';
        titleAr = 'الملخص التنفيذي اليومي: 14 مهمة • 18,450 درهم';
        messageEn = 'Daily Close Summary: 14 service jobs completed (98.6% SLA). Revenue booked: AED 18,450.00. Cash collected: AED 11,200.00. Zero safety incidents. Top performer: Rashid Al-Nuaimi (5 jobs).';
        messageAr = 'ملخص الإغلاق اليومي: إنجاز 14 مهمة (98.6% التزام). الإيرادات: 18,450.00 د.إ. المبالغ المحصلة: 11,200.00 د.إ. صفر حوادث سلامة. الأفضل أداءً: راشد النعيمي.';
        metadata = { jobsCompleted: 14, revenueAed: 18450.0, cashCollectedAed: 11200.0, slaRate: 98.6 };
        break;
      }

      default:
        throw new Error(`Unknown scenario key: ${scenarioKey}`);
    }

    // Persist real notification record in database
    let createdNotification = null;
    try {
      // Find recipient user if exists
      const recipientUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: { contains: recipientRole.toLowerCase() } },
            { fullName: { contains: recipientName } },
          ],
        },
      });

      createdNotification = await this.prisma.notification.create({
        data: {
          recipientUserId: recipientUser?.id || (await this.prisma.user.findFirst())?.id || 'demo-admin',
          channel,
          title,
          message: messageEn,
          status: 'SENT',
          sentAt: new Date(),
          metadataJson: {
            ...metadata,
            scenarioKey,
            recipientRole,
            recipientName,
            titleAr,
            messageAr,
          },
        },
      });
    } catch (err: any) {
      this.logger.warn(`Could not persist scenario notification in DB: ${err.message}`);
    }

    // Emit live in-app notification & fleet alert via Socket.IO
    this.realtimeGateway.emitNotification({
      recipientRole,
      recipientName,
      title,
      message: messageEn,
      channel,
      category: scenarioKey,
      timestamp: new Date().toISOString(),
    });

    this.realtimeGateway.emitFleetAlert({
      type: 'AUTOMATION_SCENARIO_FIRED',
      scenarioKey,
      title,
      message: messageEn,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      scenarioKey,
      scenarioTitle: title,
      targetRole: recipientRole,
      targetUser: recipientName,
      channel,
      messageEn,
      messageAr,
      notificationId: createdNotification?.id || `notif-sim-${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }

  // 6. Auto-Reply on Service Request
  async triggerAutoReply(serviceRequestId: string) {
    const sr = await this.prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: { customer: true, requestedService: true },
    });

    if (!sr) return null;

    const serviceName = sr.requestedService?.name || 'General MEP Maintenance';
    this.logger.log(`[Auto-Reply Automation] Sending instant confirmation to ${sr.customer.name} for request ${sr.requestNumber}`);
    return {
      autoReplySent: true,
      serviceRequest: sr.requestNumber,
      messageEn: `Thank you ${sr.customer.name}. Your request ${sr.requestNumber} for ${serviceName} has been logged. Our dispatch team is reviewing your schedule.`,
      channel: 'WHATSAPP_SIMULATED',
    };
  }

  // 7. Automation Rules management
  async getRules() {
    return this.prisma.automationRule.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReminders(limit = 50) {
    return this.prisma.reminder.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // -------------------------------------------------------------------------
  // 5 OPERATIONAL DEMO ACTION CONTROLS
  // -------------------------------------------------------------------------

  // Action 1: Reset Demo Data
  async resetDemoData() {
    this.logger.log('[Demo Actions] Resetting demo data and simulator state...');
    
    // Stop GPS simulator if active
    this.dispatchService.stopSimulator();

    // Clean up temporary demo emergency work orders
    await this.prisma.workOrder.deleteMany({
      where: {
        OR: [
          { orderNumber: { startsWith: 'WO-EMERGENCY' } },
          { orderNumber: { startsWith: 'WO-2026-9' } },
          { orderNumber: 'WO-2026-0899' },
        ],
      },
    }).catch(() => {});

    // Clean up recently simulated telemetry locations from the last 2 hours
    const cutoff = new Date(Date.now() - 2 * 3600 * 1000);
    await this.prisma.technicianLocation.deleteMany({
      where: { createdAt: { gte: cutoff } },
    }).catch(() => {});

    this.realtimeGateway.emitFleetAlert({
      type: 'DEMO_DATA_RESET',
      title: 'Demo Baseline Reset',
      message: 'Demo dataset restored to initial operational baseline. Active queues and GPS tracks cleared.',
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Demo data and simulation tracks reset to operational baseline.',
      timestamp: new Date().toISOString(),
    };
  }

  // Action 2: Start / Stop / Status GPS Simulation
  startGpsSimulator() {
    return this.dispatchService.startSimulator();
  }

  stopGpsSimulator() {
    return this.dispatchService.stopSimulator();
  }

  getGpsSimulatorStatus() {
    return this.dispatchService.getSimulatorStatus();
  }

  // Action 3: Create Fresh Emergency Job
  async createEmergencyJob() {
    this.logger.log('[Demo Actions] Spawning fresh high-priority emergency job...');

    // Find customer Zaid Al-Harbi or first customer
    let customer = await this.prisma.customer.findFirst({
      where: { OR: [{ name: { contains: 'Zaid' } }, { phone: { contains: '998' } }] },
      include: { sites: true },
    });

    if (!customer) {
      customer = await this.prisma.customer.findFirst({ include: { sites: true } });
    }

    const site = customer?.sites?.[0];
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `WO-2026-${uniqueSuffix}`;

    const emergencyWo = await this.prisma.workOrder.create({
      data: {
        orderNumber,
        customerId: customer?.id || 'demo-customer',
        siteId: site?.id || 'demo-site',
        serviceType: 'HVAC',
        title: 'Emergency AC Chiller Breakdown - Downtown Villa',
        description: 'Complete cooling failure in 45°C Dubai heat. Master chiller tripped on high refrigerant pressure. Immediate dispatch required.',
        status: 'NEW',
        priority: 'EMERGENCY',
        isEmergency: true,
        address: site?.address || 'Villa 42, Palm Jumeirah Frond K, Dubai',
        latitude: site?.latitude || 25.1124,
        longitude: site?.longitude || 55.1390,
        subtotal: 750.00,
        vatAmount: 37.50,
        totalAmount: 787.50,
      },
      include: { customer: true, site: true },
    });

    // Realtime alerts to all portals
    this.realtimeGateway.emitFleetAlert({
      type: 'EMERGENCY_DISPATCH',
      workOrderId: emergencyWo.id,
      orderNumber: emergencyWo.orderNumber,
      title: '🚨 CRITICAL EMERGENCY: AC Chiller Breakdown',
      priority: 'EMERGENCY',
      message: `Emergency breakdown logged for ${customer?.name} at ${emergencyWo.address}. Immediate technician assignment needed.`,
      latitude: Number(emergencyWo.latitude),
      longitude: Number(emergencyWo.longitude),
      timestamp: new Date().toISOString(),
    });

    this.realtimeGateway.emitNotification({
      recipientRole: 'DISPATCHER',
      recipientName: 'Omar Farooq',
      title: `🚨 Emergency Job Created #${emergencyWo.orderNumber}`,
      message: `Critical AC failure at ${emergencyWo.address}. Customer: ${customer?.name}`,
      channel: 'SYSTEM',
      category: 'EMERGENCY_JOB',
      timestamp: new Date().toISOString(),
    });

    return emergencyWo;
  }

  // Action 4: Trigger Overdue Reminders
  async triggerOverdueReminders() {
    this.logger.log('[Demo Actions] Triggering financial invoice dunning check...');
    const result = await this.checkOverdueInvoices();

    this.realtimeGateway.emitFleetAlert({
      type: 'OVERDUE_INVOICES_SWEEP',
      title: 'Accounts Receivable Overdue Sweep Complete',
      message: `Scanned ledger: ${result.overdueCount} overdue invoices detected. Dunning reminders generated.`,
      timestamp: new Date().toISOString(),
    });

    this.realtimeGateway.emitNotification({
      recipientRole: 'ACCOUNTANT',
      recipientName: 'Fatima Al-Zahra',
      title: 'Overdue Receivables Sweep Executed',
      message: `${result.overdueCount} invoices past 7-day credit terms. Follow-up statements queued.`,
      channel: 'EMAIL',
      category: 'invoice-overdue',
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  // Action 5: Fast-Forward a Rental Contract
  async fastForwardRental() {
    this.logger.log('[Demo Actions] Fast-forwarding rental contract to off-hire date...');

    let contract = await this.prisma.rentalContract.findFirst({
      where: { status: 'ACTIVE', deletedAt: null },
      include: { customer: true, lines: { include: { equipment: true } } },
    });

    if (!contract) {
      contract = await this.prisma.rentalContract.findFirst({
        include: { customer: true, lines: { include: { equipment: true } } },
      });
    }

    if (contract) {
      await this.prisma.rentalContract.update({
        where: { id: contract.id },
        data: {
          expectedEndDate: new Date(),
        },
      });

      const equipName = contract.lines?.[0]?.equipment?.name || '100kVA Heavy Diesel Generator';

      this.realtimeGateway.emitFleetAlert({
        type: 'RENTAL_OFFHIRE_DUE',
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        title: `Off-Hire Due: ${equipName}`,
        message: `Contract ${contract.contractNumber} (${contract.customer.name}) has reached off-hire return date. Dispatch inspection team.`,
        timestamp: new Date().toISOString(),
      });

      this.realtimeGateway.emitNotification({
        recipientRole: 'CUSTOMER',
        recipientName: contract.customer.name,
        title: `Rental Return Due: ${equipName}`,
        message: `Rental period for ${equipName} under ${contract.contractNumber} expires today. Schedule return or extend lease.`,
        channel: 'SMS_SIMULATED',
        category: 'rental-return-due',
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        contractNumber: contract.contractNumber,
        customer: contract.customer.name,
        equipment: equipName,
        message: `Contract ${contract.contractNumber} fast-forwarded to off-hire date. Off-hire notifications dispatched.`,
      };
    }

    return {
      success: false,
      message: 'No rental contract available to fast-forward.',
    };
  }
}
