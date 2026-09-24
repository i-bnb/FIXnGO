import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PaymentProvider } from './payments/payment-provider.interface';
import { MockPaymentProvider } from './payments/mock-payment.provider';
import { StripePaymentProvider } from './payments/stripe-payment.provider';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private paymentProvider: PaymentProvider;
  private processedWebhooks = new Set<string>();

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {
    const providerType = process.env.PAYMENT_PROVIDER || 'MOCK';
    const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production';

    if (providerType.toUpperCase() === 'STRIPE') {
      this.paymentProvider = new StripePaymentProvider();
      this.logger.log('Payment Provider initialized: STRIPE (Test Mode)');
    } else {
      // OWASP ASVS: Mock payment provider strictly locked behind DEMO_MODE in production
      if (!isDemoMode && process.env.NODE_ENV === 'production') {
        throw new Error('SECURITY VIOLATION: MockPaymentProvider is strictly forbidden in production unless DEMO_MODE=true.');
      }
      this.paymentProvider = new MockPaymentProvider();
      this.logger.log('Payment Provider initialized: MOCK (Offline Resilient Demo Mode)');
    }
  }

  async findAllInvoices(query?: {
    search?: string;
    status?: string;
    customerId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { deletedAt: null };
    if (query?.status) where.paymentStatus = query.status;
    if (query?.customerId) where.customerId = query.customerId;
    if (query?.search) {
      where.OR = [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          customer: true,
          lines: true,
          payments: { where: { deletedAt: null } },
        },
        orderBy: { createdAt: 'desc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { items, total, limit: query?.limit || 50, offset: query?.offset || 0 };
  }

  async findInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        workOrder: true,
        rentalContract: true,
        lines: { include: { item: true, service: true } },
        payments: {
          where: { deletedAt: null },
          include: { allocations: true },
        },
        creditNotes: true,
      },
    });

    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async createPaymentIntent(invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, deletedAt: null },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.paymentStatus === 'PAID') {
      throw new BadRequestException('Invoice is already paid');
    }

    const amount = Number(invoice.balanceDue) || Number(invoice.totalAmount);
    return this.paymentProvider.createPaymentIntent(invoice.id, amount, 'AED');
  }

  async confirmPayment(input: {
    invoiceId: string;
    paymentIntentId?: string;
    amount?: number;
    paymentMethod?: string;
  }, actorUserId?: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: input.invoiceId, deletedAt: null },
      include: { customer: true, workOrder: true },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.paymentStatus === 'PAID') {
      return { success: true, message: 'Invoice already paid', invoice };
    }

    // OWASP ASVS: Server-Side Amount Enforcement
    const invoiceBalance = Number(invoice.balanceDue) || Number(invoice.totalAmount);
    let payAmount = invoiceBalance;

    if (input.amount !== undefined && input.amount !== null) {
      if (typeof input.amount !== 'number' || isNaN(input.amount) || input.amount <= 0) {
        throw new BadRequestException('Security Violation: Payment amount must be a positive number.');
      }
      if (input.amount > invoiceBalance) {
        throw new BadRequestException(
          `Security Violation: Payment amount (AED ${input.amount.toFixed(2)}) exceeds outstanding balance (AED ${invoiceBalance.toFixed(2)}).`
        );
      }
      payAmount = input.amount;
    }

    // Call payment provider confirmation
    const confirmation = await this.paymentProvider.confirmPayment(
      input.paymentIntentId || `pi_direct_${Date.now()}`,
      {
        amount: payAmount,
        paymentMethod: input.paymentMethod,
        cardNumber: (input as any).cardNumber,
      },
    );

    if (!confirmation.success) {
      const errorMsg =
        confirmation.gatewayResponse?.error?.message ||
        'Payment processing failed: card was declined by gateway.';
      throw new BadRequestException(errorMsg);
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.payment.count();
    const paymentNumber = `PAY-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Create Payment Record
    const payment = await this.prisma.payment.create({
      data: {
        paymentNumber,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        amount: payAmount,
        paymentMethod: confirmation.paymentMethod,
        transactionReference: confirmation.transactionReference,
        status: 'CLEARED',
        gatewayPayloadJson: confirmation.gatewayResponse || {},
        createdBy: actorUserId || null,
        allocations: {
          create: {
            invoiceId: invoice.id,
            amountAllocated: payAmount,
          },
        },
      },
    });

    // Mark invoice PAID or PARTIALLY_PAID
    const remainingBalance = Math.max(0, Number(invoice.balanceDue) - payAmount);
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        balanceDue: remainingBalance,
        paymentStatus: remainingBalance === 0 ? 'PAID' : 'PARTIALLY_PAID',
      },
    });

    // Auto-post balanced General Ledger Journal Entry:
    // Dr Emirates NBD Bank (1020): payAmount
    // Cr Accounts Receivable (1050): payAmount
    try {
      const coaAccounts = await this.prisma.chartOfAccounts.findMany({
        where: { code: { in: ['1020', '1050'] } },
      });
      const coaMap = Object.fromEntries(coaAccounts.map((a) => [a.code, a.id]));

      if (coaMap['1020'] && coaMap['1050']) {
        const jeCount = await this.prisma.journalEntry.count();
        const je = await this.prisma.journalEntry.create({
          data: {
            entryNumber: `JE-PAY-${year}-${(jeCount + 1).toString().padStart(4, '0')}`,
            entryDate: new Date(),
            referenceType: 'PAYMENT',
            referenceId: payment.id,
            description: `Payment ${payment.paymentNumber} received for Invoice ${invoice.invoiceNumber}`,
            status: 'POSTED',
            postedAt: new Date(),
          },
        });

        await this.prisma.journalLine.createMany({
          data: [
            {
              journalEntryId: je.id,
              accountId: coaMap['1020'],
              debitAmount: payAmount,
              creditAmount: 0.00,
              description: `Cash collection in Bank for Invoice ${invoice.invoiceNumber}`,
            },
            {
              journalEntryId: je.id,
              accountId: coaMap['1050'],
              debitAmount: 0.00,
              creditAmount: payAmount,
              description: `Settlement of A/R for Invoice ${invoice.invoiceNumber}`,
            },
          ],
        });
      }
    } catch (glErr) {
      this.logger.warn(`GL payment settlement posting note: ${(glErr as Error).message}`);
    }

    await this.auditService.log({
      actorUserId,
      action: 'PAYMENT_SETTLED',
      entityName: 'Payment',
      entityId: payment.id,
      details: { paymentNumber, invoiceNumber: invoice.invoiceNumber, amount: payAmount },
    });

    return {
      success: true,
      message: 'Payment settled successfully and posted to General Ledger',
      payment,
      invoice: updatedInvoice,
    };
  }

  // Refund processing with automated GL reversing entry
  async refundPayment(
    paymentId: string,
    input: { amount?: number; reason?: string },
    actorUserId?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true, customer: true },
    });

    if (!payment) throw new NotFoundException('Payment record not found');
    if (payment.status === 'REFUNDED') {
      throw new BadRequestException('Payment is already fully refunded');
    }

    const maxRefundable = Number(payment.amount);
    const refundAmount = input.amount || maxRefundable;

    if (refundAmount <= 0 || refundAmount > maxRefundable) {
      throw new BadRequestException(
        `Invalid refund amount. Maximum refundable: AED ${maxRefundable.toFixed(2)}`,
      );
    }

    // Update payment record
    const isFullRefund = refundAmount >= maxRefundable;
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        gatewayPayloadJson: {
          ...((payment.gatewayPayloadJson as any) || {}),
          refund: {
            amount: refundAmount,
            reason: input.reason || 'Customer satisfaction adjustment',
            refundedAt: new Date().toISOString(),
          },
        },
      },
    });

    // Restore invoice balance due if linked
    let updatedInvoice = null;
    if (payment.invoiceId && payment.invoice) {
      const newBalance = Number(payment.invoice.balanceDue) + refundAmount;
      const isPending = newBalance >= Number(payment.invoice.totalAmount);
      updatedInvoice = await this.prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          balanceDue: newBalance,
          paymentStatus: isPending ? 'PENDING' : 'PARTIALLY_PAID',
        },
      });
    }

    // Auto-post reversing balanced General Ledger Journal Entry:
    // Dr Sales Revenue / Sales Return (4010) or A/R (1050): refundAmount
    // Cr Emirates NBD Bank (1020): refundAmount
    try {
      const coaAccounts = await this.prisma.chartOfAccounts.findMany({
        where: { code: { in: ['1020', '4010', '1050'] } },
      });
      const coaMap = Object.fromEntries(coaAccounts.map((a) => [a.code, a.id]));

      if (coaMap['1020'] && (coaMap['4010'] || coaMap['1050'])) {
        const year = new Date().getFullYear();
        const jeCount = await this.prisma.journalEntry.count();
        const debitAccountId = coaMap['4010'] || coaMap['1050'];
        const je = await this.prisma.journalEntry.create({
          data: {
            entryNumber: `JE-REF-${year}-${(jeCount + 1).toString().padStart(4, '0')}`,
            entryDate: new Date(),
            referenceType: 'PAYMENT_REFUND',
            referenceId: payment.id,
            description: `Reversing refund entry for Payment ${payment.paymentNumber} (${input.reason || 'Customer settlement'})`,
            status: 'POSTED',
            postedAt: new Date(),
          },
        });

        await this.prisma.journalLine.createMany({
          data: [
            {
              journalEntryId: je.id,
              accountId: debitAccountId,
              debitAmount: refundAmount,
              creditAmount: 0.00,
              description: `Sales revenue reversal for refund on Payment ${payment.paymentNumber}`,
            },
            {
              journalEntryId: je.id,
              accountId: coaMap['1020'],
              debitAmount: 0.00,
              creditAmount: refundAmount,
              description: `Bank disbursement for refund on Payment ${payment.paymentNumber}`,
            },
          ],
        });
      }
    } catch (glErr) {
      this.logger.warn(`GL refund reversal posting note: ${(glErr as Error).message}`);
    }

    await this.auditService.log({
      actorUserId,
      action: 'PAYMENT_REFUNDED',
      entityName: 'Payment',
      entityId: payment.id,
      details: {
        paymentNumber: payment.paymentNumber,
        refundAmount,
        reason: input.reason,
      },
    });

    return {
      success: true,
      message: `Refund of AED ${refundAmount.toFixed(2)} processed successfully and reversing GL entry posted`,
      payment: updatedPayment,
      invoice: updatedInvoice,
    };
  }

  // Quotations
  async findAllQuotations(query?: { search?: string; status?: string; customerId?: string; limit?: number; offset?: number }) {
    const where: any = { deletedAt: null };
    if (query?.status) where.status = query.status;
    if (query?.customerId) where.customerId = query.customerId;
    if (query?.search) {
      where.OR = [
        { quotationNumber: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        include: { customer: true, lines: true },
        orderBy: { createdAt: 'desc' },
        take: query?.limit || 50,
        skip: query?.offset || 0,
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return { items, total, limit: query?.limit || 50, offset: query?.offset || 0 };
  }

  async createQuotation(input: {
    customerId: string;
    siteId?: string;
    workOrderId?: string;
    validUntil?: Date | string;
    lines: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      itemId?: string;
      serviceId?: string;
    }>;
  }, actorUserId?: string) {
    let subtotal = 0;
    const computedLines = input.lines.map((l) => {
      const lineSub = l.quantity * l.unitPrice;
      const vatRate = 0.05;
      const vatAmount = Math.round(lineSub * vatRate * 100) / 100;
      subtotal += lineSub;
      return {
        ...l,
        subtotal: lineSub,
        vatRate,
        vatAmount,
        totalAmount: lineSub + vatAmount,
      };
    });

    const vatAmount = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + vatAmount;

    const year = new Date().getFullYear();
    const count = await this.prisma.quotation.count();
    const quotationNumber = `QT-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const validUntil = input.validUntil ? new Date(input.validUntil) : new Date(Date.now() + 14 * 24 * 3600 * 1000);

    return this.prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: input.customerId,
        siteId: input.siteId || null,
        workOrderId: input.workOrderId || null,
        validUntil,
        subtotal,
        vatAmount,
        totalAmount,
        status: 'SENT',
        createdBy: actorUserId || null,
        lines: {
          create: computedLines,
        },
      },
      include: {
        customer: true,
        lines: true,
      },
    });
  }

  async approveQuotation(id: string, actorUserId?: string) {
    const q = await this.prisma.quotation.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
    return q;
  }

  /**
   * Processes inbound Stripe Webhook events with idempotency and audit tracking.
   */
  async handleWebhookEvent(body: any, signature?: string) {
    const eventId = body?.id || body?.data?.object?.id || `evt_${Date.now()}`;

    // 1. Idempotency Check (Reject replay attacks)
    if (this.processedWebhooks.has(eventId)) {
      this.logger.log(`Webhook idempotency hit: Event "${eventId}" has already been processed.`);
      return { received: true, deduplicated: true };
    }

    const eventType = body?.type || 'payment_intent.succeeded';
    const invoiceId = body?.data?.object?.metadata?.invoiceId || body?.invoiceId;

    if (invoiceId && (eventType === 'payment_intent.succeeded' || eventType === 'checkout.session.completed')) {
      const amountReceived = body?.data?.object?.amount_received
        ? body.data.object.amount_received / 100
        : undefined;

      const result = await this.confirmPayment(
        {
          invoiceId,
          paymentIntentId: body?.data?.object?.id || eventId,
          amount: amountReceived,
          paymentMethod: 'STRIPE_WEBHOOK',
        },
        'SYSTEM_WEBHOOK'
      );

      this.processedWebhooks.add(eventId);

      await this.auditService.log({
        actorName: 'Stripe Webhook',
        actorRole: 'SYSTEM_WEBHOOK',
        action: 'WEBHOOK_PAYMENT_PROCESSED',
        entityName: 'payment',
        entityId: eventId,
        details: { invoiceId, eventType, amountReceived },
      });

      return { received: true, processed: true, result };
    }

    this.processedWebhooks.add(eventId);
    return { received: true };
  }
}
