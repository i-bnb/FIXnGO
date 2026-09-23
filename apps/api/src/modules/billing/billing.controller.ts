import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { BillingService } from './billing.service';

@ApiTags('Billing, Invoices & Payments')
@Controller('api/billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'List all tax invoices with payment status and customer filters' })
  async getInvoices(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.billingService.findAllInvoices({
      search,
      status,
      customerId,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get full invoice breakdown with lines, tax, and payments' })
  async getInvoiceById(@Param('id') id: string) {
    return this.billingService.findInvoiceById(id);
  }

  @Post('invoices/:id/payment-intent')
  @ApiOperation({ summary: 'Create payment intent (Stripe or Mock provider based on environment)' })
  async createPaymentIntent(@Param('id') invoiceId: string) {
    return this.billingService.createPaymentIntent(invoiceId);
  }

  @Post('payments/confirm')
  @ApiOperation({ summary: 'Confirm payment, mark invoice PAID, and post balanced GL journal entry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        invoiceId: { type: 'string' },
        paymentIntentId: { type: 'string', example: 'pi_mock_12345' },
        amount: { type: 'number', example: 567.00 },
        paymentMethod: { type: 'string', example: 'STRIPE_CARD' },
      },
      required: ['invoiceId'],
    },
  })
  async confirmPayment(@Body() body: any, @Req() req: any) {
    return this.billingService.confirmPayment(body, req.user?.id);
  }

  // Webhook endpoint
  @Post('payments/webhook')
  @ApiOperation({ summary: 'Stripe webhook listener / payment confirmation gateway' })
  async handleWebhook(@Body() body: any, @Req() req: any) {
    const invoiceId = body.data?.object?.metadata?.invoiceId || body.invoiceId;
    if (invoiceId) {
      return this.billingService.confirmPayment({
        invoiceId,
        paymentIntentId: body.data?.object?.id || body.paymentIntentId,
        amount: (body.data?.object?.amount_received || 0) / 100,
        paymentMethod: 'STRIPE_CARD',
      }, 'SYSTEM_WEBHOOK');
    }
    return { received: true };
  }

  @Post('payments/:paymentId/refund')
  @ApiOperation({ summary: 'Process a full or partial refund for a settled payment' })
  async refundPayment(
    @Param('paymentId') paymentId: string,
    @Body() body: { amount?: number; reason?: string },
    @Req() req: any,
  ) {
    return this.billingService.refundPayment(paymentId, body, req.user?.id);
  }

  @Get('quotations')
  @ApiOperation({ summary: 'List customer quotations' })
  async getQuotations(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.billingService.findAllQuotations({ search, status, customerId });
  }

  @Post('quotations')
  @ApiOperation({ summary: 'Create a new quotation' })
  async createQuotation(@Body() body: any, @Req() req: any) {
    return this.billingService.createQuotation(body, req.user?.id);
  }

  @Post('quotations/:id/approve')
  @ApiOperation({ summary: 'Approve quotation' })
  async approveQuotation(@Param('id') id: string, @Req() req: any) {
    return this.billingService.approveQuotation(id, req.user?.id);
  }
}
