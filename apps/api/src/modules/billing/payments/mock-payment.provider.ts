import { Injectable, Logger } from '@nestjs/common';
import {
  PaymentProvider,
  PaymentIntentResult,
  PaymentConfirmationResult,
} from './payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(MockPaymentProvider.name);

  async createPaymentIntent(invoiceId: string, amount: number, currency = 'AED'): Promise<PaymentIntentResult> {
    const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 9)}`;

    this.logger.log(`Created mock payment intent: ${paymentIntentId} for invoice ${invoiceId} amount ${amount} ${currency}`);

    return {
      paymentIntentId,
      clientSecret,
      amount,
      currency,
      provider: 'MOCK',
    };
  }

  async confirmPayment(paymentIntentId: string, payload?: any): Promise<PaymentConfirmationResult> {
    this.logger.log(`Confirmed mock payment: ${paymentIntentId}`);

    return {
      success: true,
      transactionReference: `ch_mock_${Date.now()}`,
      amount: payload?.amount || 0,
      paymentMethod: payload?.paymentMethod || 'MOCK_CARD',
      gatewayResponse: {
        status: 'succeeded',
        card: { brand: 'visa', last4: '4242' },
        simulation: true,
      },
    };
  }
}
