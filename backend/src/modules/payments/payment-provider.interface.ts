/**
 * Pluggable Payment Provider Interface (Stripe / Razorpay)
 * Ready for production integration without hardcoded gateway lock-in.
 */

export interface CreatePaymentIntentParams {
  orderId: string;
  orderNumber: string;
  amountInSmallestUnit: number; // e.g. Paise for INR, Cents for USD
  currency: string;
  receiptEmail?: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntentResult {
  provider: 'RAZORPAY' | 'STRIPE';
  paymentIntentId: string;
  clientSecret?: string; // For Stripe Elements
  amount: number;
  currency: string;
  status: 'PENDING' | 'REQUIRES_PAYMENT_METHOD' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
}

export interface VerifyWebhookResult {
  isValid: boolean;
  eventType: string;
  orderId?: string;
  paymentId?: string;
  amountCaptured?: number;
  rawEvent?: any;
}

export interface IPaymentProvider {
  readonly name: string;
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean>;
  verifyWebhook(rawPayload: string | Buffer, signatureHeader: string): Promise<VerifyWebhookResult>;
  refundPayment(paymentId: string, amountInSmallestUnit: number, reason: string): Promise<{ refundId: string; status: string }>;
}
