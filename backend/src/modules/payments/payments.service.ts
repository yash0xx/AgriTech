import crypto from 'crypto';
import { IPaymentProvider, CreatePaymentIntentParams, PaymentIntentResult, VerifyWebhookResult } from './payment-provider.interface';
import { supabaseAdmin, supabasePublic } from '../../config/supabase';

/**
 * Razorpay Payment Provider Implementation
 */
export class RazorpayProvider implements IPaymentProvider {
  readonly name = 'RAZORPAY';
  private keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummy_razorpay_secret_dev_only';

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const mockRazorpayOrderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      provider: 'RAZORPAY',
      paymentIntentId: mockRazorpayOrderId,
      amount: params.amountInSmallestUnit,
      currency: params.currency,
      status: 'PENDING',
    };
  }

  async verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    if (!signature || !paymentId) return false;
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  async verifyWebhook(rawPayload: string | Buffer, signatureHeader: string): Promise<VerifyWebhookResult> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';
    const payloadStr = Buffer.isBuffer(rawPayload) ? rawPayload.toString('utf8') : rawPayload;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadStr)
      .digest('hex');

    const isValid = expectedSignature === signatureHeader;
    const parsed = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr;

    return {
      isValid,
      eventType: parsed.event || 'unknown',
      orderId: parsed.payload?.payment?.entity?.order_id,
      paymentId: parsed.payload?.payment?.entity?.id,
      amountCaptured: parsed.payload?.payment?.entity?.amount,
      rawEvent: parsed,
    };
  }

  async refundPayment(paymentId: string, amountInSmallestUnit: number, reason: string): Promise<{ refundId: string; status: string }> {
    return {
      refundId: `rfnd_${Date.now()}`,
      status: 'processed',
    };
  }
}

/**
 * Payments Service
 * Orchestrates payment intents, webhook verification, and automated escrow placement.
 * CRITICAL RULE (Section 8): Never trust client payment claims without server/webhook verification.
 */
export class PaymentsService {
  private provider: IPaymentProvider;

  constructor(provider?: IPaymentProvider) {
    this.provider = provider || new RazorpayProvider();
  }

  /**
   * Initialize a payment order/intent for an AgriTech order
   */
  async initializeOrderPayment(orderId: string, userId: string): Promise<PaymentIntentResult> {
    const client = supabaseAdmin || supabasePublic;

    const { data: order, error } = await client
      .from('orders')
      .select('id, order_number, total_amount, buyer_id, payment_status')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      throw new Error('Order not found');
    }

    if (order.buyer_id !== userId) {
      throw new Error('Only the authenticated buyer can initialize payment');
    }

    const amountInPaise = Math.round(Number(order.total_amount) * 100);

    return this.provider.createPaymentIntent({
      orderId: order.id,
      orderNumber: order.order_number,
      amountInSmallestUnit: amountInPaise,
      currency: 'INR',
      metadata: { buyerId: userId },
    });
  }

  /**
   * Process verified webhook event from payment provider
   * Transitions escrow state to HELD_IN_ESCROW upon confirmed payment capture.
   */
  async processWebhookEvent(rawPayload: string | Buffer, signatureHeader: string): Promise<{ processed: boolean; orderId?: string }> {
    const verification = await this.provider.verifyWebhook(rawPayload, signatureHeader);

    if (!verification.isValid) {
      throw new Error('WEBHOOK_SIGNATURE_MISMATCH: Unauthorized webhook callback rejected.');
    }

    if (verification.eventType === 'payment.captured' && verification.orderId) {
      const client = supabaseAdmin || supabasePublic;

      // Update order and escrow state
      await client
        .from('orders')
        .update({
          payment_status: 'HELD_IN_ESCROW',
          updated_at: new Date().toISOString(),
        })
        .eq('id', verification.orderId);

      await client.from('audit_logs').insert({
        action: 'PAYMENT_WEBHOOK_CONFIRMED',
        entity_type: 'orders',
        entity_id: verification.orderId,
        new_data: {
          paymentId: verification.paymentId,
          amountCaptured: verification.amountCaptured,
          provider: this.provider.name,
        },
      });

      return { processed: true, orderId: verification.orderId };
    }

    return { processed: false };
  }
}
