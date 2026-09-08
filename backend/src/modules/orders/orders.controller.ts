import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { OrdersService } from './orders.service';

const ordersService = new OrdersService();

export async function calculateOrderTotal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);
    if (!productId || typeof productId !== 'string' || !Number.isFinite(qty) || qty <= 0) {
      res.status(400).json({ error: 'Valid productId and positive finite quantity are required' });
      return;
    }

    const calculated = await ordersService.calculateTrustedTotal(productId, qty);
    res.json({ success: true, data: calculated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ error: 'Authenticated buyer session required' });
      return;
    }

    const { productId, quantity, deliveryAddress, deliveryDistrict, deliveryState, specialInstructions, logisticsCost } = req.body;
    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;
    const qty = Number(quantity);

    if (!productId || typeof productId !== 'string' || !Number.isFinite(qty) || qty <= 0) {
      res.status(400).json({ error: 'Valid productId and positive finite quantity are required' });
      return;
    }

    const order = await ordersService.createTrustedOrder({
      buyerId,
      productId,
      quantity,
      deliveryAddress,
      deliveryDistrict,
      deliveryState,
      specialInstructions,
      logisticsCost,
      idempotencyKey,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function appendMilestone(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, note, location } = req.body;

    if (!id || !status) {
      res.status(400).json({ error: 'Order ID and milestone status are required' });
      return;
    }

    const updated = await ordersService.addMilestone({
      orderId: id,
      status,
      note,
      location,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
