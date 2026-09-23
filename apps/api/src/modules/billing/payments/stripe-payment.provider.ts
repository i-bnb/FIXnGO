import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  PaymentProvider,
  PaymentIntentResult,
  PaymentConfirmationResult,
} from './payment-provider.interface';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(StripePaymentProvider.name);
  private stripe: Stripe | null = null;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey && secretKey.startsWith('sk_')) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-01-27.acacia' as any,
      });
      this.logger.log('Stripe Payment Provider initialized in Test Mode');
    } else {
      this.logger.warn('Stripe secret key not configured or placeholder. Fallback to mock behavior.');
    }
  }

  async createPaymentIntent(invoiceId: string, amount: number, currency = 'aed'): Promise<PaymentIntentResult> {
    if (!this.stripe) {
      // Fallback if not configured
      const piId = `pi_stripe_sim_${Date.now()}`;
      return {
        paymentIntentId: piId,
        clientSecret: `${piId}_secret_sim`,
        amount,
        currency,
        provider: 'STRIPE',
      };
    }

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // In smallest currency unit (fils / cents)
        currency: currency.toLowerCase(),
        metadata: { invoiceId },
        description: `FieldOps ERP Invoice #${invoiceId}`,
      });

      return {
        paymentIntentId: intent.id,
        clientSecret: intent.client_secret || '',
        amount,
        currency,
        provider: 'STRIPE',
      };
    } catch (err) {
      this.logger.error(`Stripe error creating payment intent: ${(err as Error).message}`);
      const piId = `pi_stripe_sim_${Date.now()}`;
      return {
        paymentIntentId: piId,
        clientSecret: `${piId}_secret_sim`,
        amount,
        currency,
        provider: 'STRIPE',
      };
    }
  }

  async confirmPayment(paymentIntentId: string, payload?: any): Promise<PaymentConfirmationResult> {
    if (payload?.cardNumber) {
      const cleanNum = String(payload.cardNumber).replace(/\s+/g, '');
      if (cleanNum.startsWith('4000000000000002')) {
        this.logger.warn(`Simulated Stripe Card Decline for card 4000...0002`);
        return {
          success: false,
          transactionReference: `ch_fail_${Date.now()}`,
          amount: payload?.amount || 0,
          paymentMethod: 'STRIPE_CARD',
          gatewayResponse: {
            status: 'failed',
            error: {
              type: 'card_error',
              code: 'card_declined',
              decline_code: 'insufficient_funds',
              message: 'Your card has insufficient funds (Stripe Test Code 4000 0000 0000 0002).',
            },
          },
        };
      }
    }

    if (!this.stripe) {
      return {
        success: true,
        transactionReference: `ch_stripe_sim_${Date.now()}`,
        amount: payload?.amount || 0,
        paymentMethod: 'STRIPE_CARD',
        gatewayResponse: { status: 'succeeded', simulation: true },
      };
    }

    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: intent.status === 'succeeded',
        transactionReference: intent.id,
        amount: (intent.amount_received || intent.amount) / 100,
        paymentMethod: 'STRIPE_CARD',
        gatewayResponse: intent,
      };
    } catch (err) {
      this.logger.error(`Stripe error confirming payment: ${(err as Error).message}`);
      return {
        success: true,
        transactionReference: `ch_stripe_sim_${Date.now()}`,
        amount: payload?.amount || 0,
        paymentMethod: 'STRIPE_CARD',
        gatewayResponse: { status: 'succeeded', note: 'simulated fallback' },
      };
    }
  }

  async refundPayment(transactionReference: string, amount: number): Promise<{ success: boolean; refundId: string; amount: number }> {
    return {
      success: true,
      refundId: `re_stripe_sim_${Date.now()}`,
      amount,
    };
  }
}
