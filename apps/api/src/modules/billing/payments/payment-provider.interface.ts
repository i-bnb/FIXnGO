export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  provider: 'STRIPE' | 'MOCK';
}

export interface PaymentConfirmationResult {
  success: boolean;
  transactionReference: string;
  amount: number;
  paymentMethod: string;
  gatewayResponse: any;
}

export interface PaymentProvider {
  createPaymentIntent(invoiceId: string, amount: number, currency?: string): Promise<PaymentIntentResult>;
  confirmPayment(paymentIntentId: string, payload?: any): Promise<PaymentConfirmationResult>;
}
