import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { EscrowService } from './escrow.service';

const escrowService = new EscrowService();

export async function releaseEscrowFunds(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    const result = await escrowService.releaseEscrow(orderId, req.user!.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function refundEscrowFunds(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { orderId, reason } = req.body;
    if (!orderId || !reason) {
      res.status(400).json({ error: 'orderId and refund reason are required' });
      return;
    }

    const result = await escrowService.refundEscrow(orderId, reason, req.user!.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
