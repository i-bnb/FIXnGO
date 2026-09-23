# ADR 005: Dual-Mode Payment Architecture (Stripe Test Mode + Resilient Mock Gateway)

## Status
Accepted

## Context
In field-service management, seamless payment capture on the consumer app or on-site via technician mobile terminal is a critical feature.
During live sales demonstrations, two conflicting scenarios arise:
1. When connected to the internet with configured API keys, the presenter wishes to demonstrate authentic Stripe checkout (using 3D Secure test card `4242...`, Apple Pay emulation, and Payment Intents).
2. When demonstrating in an offline boardroom, at a client site with restricted corporate Wi-Fi, or when API keys are absent, the application must NEVER crash, hang on network timeouts, or display API errors.

## Decision
We implement a **Strategy Pattern** behind a common `PaymentProvider` interface:
```typescript
export interface PaymentProvider {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  confirmPayment(params: ConfirmPaymentParams): Promise<PaymentConfirmationResult>;
  refundPayment(paymentId: string, amount: number): Promise<RefundResult>;
}
```
1. **`StripePaymentProvider`**:
   - Interacts with official Stripe SDK in `TEST` mode (`sk_test_...`).
   - Generates authentic client secrets and supports test card tokenization.
2. **`MockPaymentProvider`**:
   - Activates automatically if `STRIPE_SECRET_KEY` is not set or if user selects "Mock Checkout".
   - Generates simulated successful authorizations (`pi_mock_...`), handles cash-on-delivery and cheque settlement, and completes transactions in <100ms.
3. **Payment Allocations**:
   - Supports partial payments and multi-invoice allocations (`payment_allocations` table).

## Consequences
- **Positive**: 100% demo resilience with zero fear of network or credential failures, while supporting authentic Stripe integration when desired.
- **Negative**: Requires maintaining two provider implementations under the common interface.
