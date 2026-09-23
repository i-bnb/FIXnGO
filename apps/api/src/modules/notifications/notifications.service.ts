import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface SendNotificationDto {
  recipientUserId: string;
  templateCode?: string;
  channel?: 'IN_APP' | 'EMAIL' | 'WHATSAPP_SIMULATED' | 'SMS_SIMULATED';
  title?: string;
  message?: string;
  metadata?: Record<string, any>;
  language?: 'en' | 'ar';
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Built-in English & Arabic templates
  private readonly defaultTemplates = [
    {
      code: 'WO_CREATED',
      title: 'Service Request Confirmed',
      titleAr: 'تم تأكيد طلب الخدمة',
      bodyTemplateEn: 'Your service request #{{orderNumber}} has been scheduled. Our team is assigning a qualified technician.',
      bodyTemplateAr: 'تم جدولة طلب الخدمة رقم {{orderNumber}}. يقوم فريقنا بتعيين فني مؤهل.',
      channel: 'WHATSAPP_SIMULATED',
      eventTrigger: 'WORK_ORDER_CREATED',
    },
    {
      code: 'TECH_DISPATCHED',
      title: 'Technician is On The Way',
      titleAr: 'الفني في الطريق إليك',
      bodyTemplateEn: 'Technician {{technicianName}} is en route to your site. Estimated arrival in 25 minutes. Live tracking available in app.',
      bodyTemplateAr: 'الفني {{technicianName}} في الطريق إلى موقعك. وقت الوصول المتوقع 25 دقيقة. التتبع المباشر متاح في التطبيق.',
      channel: 'WHATSAPP_SIMULATED',
      eventTrigger: 'WORK_ORDER_DISPATCHED',
    },
    {
      code: 'WO_COMPLETED',
      title: 'Job Completed Successfully',
      titleAr: 'تم إنجاز العمل بنجاح',
      bodyTemplateEn: 'Your maintenance job #{{orderNumber}} is completed. Please review before & after photos and sign off.',
      bodyTemplateAr: 'تم إنجاز عمل الصيانة رقم {{orderNumber}}. يرجى مراجعة صور قبل وبعد والتوقيع.',
      channel: 'SMS_SIMULATED',
      eventTrigger: 'WORK_ORDER_COMPLETED',
    },
    {
      code: 'INVOICE_ISSUED',
      title: 'Tax Invoice Generated',
      titleAr: 'تم إصدار الفاتورة الضريبية',
      bodyTemplateEn: 'Tax Invoice {{invoiceNumber}} for AED {{totalAmount}} (incl. 5% UAE VAT) is ready for payment.',
      bodyTemplateAr: 'الفاتورة الضريبية رقم {{invoiceNumber}} بمبلغ {{totalAmount}} د.إ (شاملة 5% ضريبة القيمة المضافة) جاهزة للدفع.',
      channel: 'EMAIL',
      eventTrigger: 'INVOICE_ISSUED',
    },
    {
      code: 'PAYMENT_CONFIRMED',
      title: 'Payment Received with Thanks',
      titleAr: 'تم استلام الدفعة مع الشكر',
      bodyTemplateEn: 'Thank you! Payment of AED {{amount}} for Invoice {{invoiceNumber}} has been cleared.',
      bodyTemplateAr: 'شكراً لك! تم استلام وتأكيد دفعة بمبلغ {{amount}} د.إ للفاتورة {{invoiceNumber}}.',
      channel: 'WHATSAPP_SIMULATED',
      eventTrigger: 'PAYMENT_CLEARED',
    },
    {
      code: 'AMC_VISIT_REMINDER',
      title: 'Upcoming Preventive Maintenance Visit',
      titleAr: 'تذكير بزيارة الصيانة الوقائية القادمة',
      bodyTemplateEn: 'Reminder: Your scheduled HVAC quarterly maintenance visit under AMC {{contractNumber}} is booked for {{scheduledDate}}.',
      bodyTemplateAr: 'تذكير: موعد زيارة الصيانة الدورية لتكييف الهواء بموجب العقد {{contractNumber}} مجدول بتاريخ {{scheduledDate}}.',
      channel: 'EMAIL',
      eventTrigger: 'AMC_REMINDER',
    },
    {
      code: 'RENTAL_RETURN_REMINDER',
      title: 'Equipment Rental Due for Return',
      titleAr: 'تذكير بموعد إرجاع المعدات المستأجرة',
      bodyTemplateEn: 'Equipment {{equipmentName}} rented under contract {{contractNumber}} is due for off-hire/return on {{expectedEndDate}}.',
      bodyTemplateAr: 'المعدة {{equipmentName}} المستأجرة بموجب العقد {{contractNumber}} مستحقة الإرجاع بتاريخ {{expectedEndDate}}.',
      channel: 'SMS_SIMULATED',
      eventTrigger: 'RENTAL_RETURN_REMINDER',
    },
  ];

  constructor(private prisma: PrismaService) {}

  async getTemplates() {
    try {
      const dbTemplates = await this.prisma.notificationTemplate.findMany({
        where: { deletedAt: null },
      });
      if (dbTemplates.length > 0) return dbTemplates;
    } catch (err: any) {
      this.logger.warn(`Could not fetch templates from DB: ${err.message}`);
    }
    return this.defaultTemplates;
  }

  async send(dto: SendNotificationDto) {
    let title = dto.title || 'FieldOps ERP Notification';
    let message = dto.message || '';
    const channel = dto.channel || 'IN_APP';
    const lang = dto.language || 'en';

    if (dto.templateCode) {
      const templates = await this.getTemplates();
      const template = templates.find((t) => t.code === dto.templateCode);
      if (template) {
        title = lang === 'ar' && template.titleAr ? template.titleAr : template.title;
        let templateText =
          lang === 'ar' && template.bodyTemplateAr
            ? template.bodyTemplateAr
            : template.bodyTemplateEn || template.title;

        if (dto.metadata) {
          for (const [key, val] of Object.entries(dto.metadata)) {
            templateText = templateText.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
          }
        }
        message = templateText;
      }
    }

    // Persist in Notification table
    const notification = await this.prisma.notification.create({
      data: {
        recipientUserId: dto.recipientUserId,
        channel,
        title,
        message,
        status: channel === 'IN_APP' ? 'PENDING' : 'SENT',
        sentAt: channel !== 'IN_APP' ? new Date() : null,
        metadataJson: dto.metadata || {},
      },
    });

    this.logger.log(`[Notification Outbox] Channel: ${channel} | Recipient: ${dto.recipientUserId} | "${title}"`);
    return notification;
  }

  async getUserNotifications(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          recipientUserId: userId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: {
          recipientUserId: userId,
          status: 'PENDING',
          deletedAt: null,
        },
      }),
    ]);

    return { notifications, unreadCount };
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  async getOutbox(query?: { channel?: string; limit?: number }) {
    const where: any = { deletedAt: null };
    if (query?.channel) where.channel = query.channel;

    return this.prisma.notification.findMany({
      where,
      include: {
        recipient: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: query?.limit || 100,
    });
  }
}
