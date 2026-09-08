import { Request, Response } from 'express';
import { LogisticsService } from './logistics.service';

const logisticsService = new LogisticsService();

export function calculateQuote(req: Request, res: Response): void {
  try {
    const { distanceKm, weightKg, vehicleType } = req.body;
    const dist = Number(distanceKm);
    const wt = Number(weightKg);

    if (!Number.isFinite(dist) || dist <= 0 || !Number.isFinite(wt) || wt <= 0) {
      res.status(400).json({ error: 'distanceKm and weightKg must be positive finite numbers' });
      return;
    }

    const quote = logisticsService.calculateLogisticsQuote(
      dist,
      wt,
      vehicleType || 'MINI_TRUCK'
    );
    res.json({ success: true, data: quote });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function bookLogistics(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const role = req.user?.role || 'BUYER';
    if (!userId) {
      res.status(401).json({ error: 'Authenticated session required' });
      return;
    }

    const {
      farmerId,
      buyerId,
      orderId,
      pickupLocation,
      deliveryLocation,
      distanceKm,
      weightKg,
      vehicleType,
    } = req.body;

    const dist = Number(distanceKm);
    const wt = Number(weightKg);

    if (!pickupLocation || !deliveryLocation || !Number.isFinite(dist) || dist <= 0 || !Number.isFinite(wt) || wt <= 0) {
      res.status(400).json({ error: 'Valid pickupLocation, deliveryLocation, and positive finite distanceKm and weightKg are required' });
      return;
    }

    const booking = await logisticsService.createBooking({
      userId,
      role,
      farmerId,
      buyerId,
      orderId,
      pickupLocation,
      deliveryLocation,
      distanceKm: Number(distanceKm),
      weightKg: Number(weightKg),
      vehicleType,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getBooking(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const booking = await logisticsService.getBookingById(id, userId, isAdmin);
    res.json({ success: true, data: booking });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
}

export async function updateBookingStatus(req: any, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const updated = await logisticsService.updateBookingStatus(id, status, userId, isAdmin);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
