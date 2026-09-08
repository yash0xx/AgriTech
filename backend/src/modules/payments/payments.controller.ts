import { Request, Response, NextFunction } from 'express';
import { PaymentsService, RazorpayProvider } from './payments.service';

const paymentsService = new PaymentsService(new RazorpayProvider());

export async function createPaymentIntent(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const intent = await paymentsService.initializeOrderPayment(orderId, userId);
    res.json({
      success: true,
      data: intent,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      res.status(400).json({ error: 'Missing x-razorpay-signature header' });
      return;
    }

    const rawPayload = JSON.stringify(req.body);
    const result = await paymentsService.processWebhookEvent(rawPayload, signature);

    res.json({
      status: 'ok',
      ...result,
    });
  } catch (err: any) {
    if (err.message && err.message.includes('WEBHOOK_SIGNATURE_MISMATCH')) {
      res.status(400).json({ error: 'Invalid webhook signature' });
      return;
    }
    next(err);
  }
}
