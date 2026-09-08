import express, { Express, Request, Response } from 'express';
import { requireAuth, requireRole } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { idempotencyMiddleware } from './middleware/idempotency';
import { orderRateLimiter, adminRateLimiter } from './middleware/rateLimiter';
import { calculateOrderTotal, createOrder, appendMilestone } from './modules/orders/orders.controller';
import { calculateQuote, bookLogistics, getBooking, updateBookingStatus } from './modules/logistics/logistics.controller';
import { releaseEscrowFunds, refundEscrowFunds } from './modules/escrow/escrow.controller';
import { createPaymentIntent, handleWebhook } from './modules/payments/payments.controller';

export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  // Production-Ready CORS Middleware (Section 21)
  const isProd = process.env.NODE_ENV === 'production';
  const defaultDevOrigins = ['http://localhost:3050', 'http://localhost:3000', 'http://127.0.0.1:3050'];
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : defaultDevOrigins;

  app.use((req, res, next) => {
    const origin = req.headers.origin as string;

    const isAllowedOrigin = origin && (
      allowedOrigins.includes(origin) ||
      (!isProd && (origin.includes('localhost') || origin.includes('127.0.0.1')))
    );

    if (isAllowedOrigin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else if (!isProd && !origin) {
      res.header('Access-Control-Allow-Origin', '*');
    } else if (isProd && origin) {
      // In production, explicitly reject preflights from unapproved origins
      if (req.method === 'OPTIONS') {
        res.status(403).json({ error: 'CORS origin not permitted' });
        return;
      }
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Idempotency-Key, X-Request-Id');
    res.header('Access-Control-Expose-Headers', 'X-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Health Check
  const healthHandler = (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'AgriTech Trusted Backend API',
      environment: process.env.NODE_ENV || 'development',
      requestId: (req as any).requestId || req.headers['x-request-id'] || 'system',
      timestamp: new Date().toISOString(),
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Trusted Orders API with Rate Limiting & Idempotency
  app.post('/api/orders/calculate-total', requireAuth, calculateOrderTotal);
  app.post('/api/orders/create', requireAuth, orderRateLimiter, idempotencyMiddleware, createOrder);
  app.post('/api/orders/:id/milestone', requireAuth, appendMilestone);

  // Trusted Payments & Razorpay Sandbox Webhook API
  app.post('/api/payments/create-intent', requireAuth, createPaymentIntent);
  app.post('/api/payments/webhook', handleWebhook);

  // Trusted Logistics API
  app.post('/api/logistics/quote', calculateQuote);
  app.post('/api/logistics/book', requireAuth, idempotencyMiddleware, bookLogistics);
  app.get('/api/logistics/bookings/:id', requireAuth, getBooking);
  app.patch('/api/logistics/bookings/:id/status', requireAuth, updateBookingStatus);

  // Privileged Escrow Controls (Admin only with Admin Rate Limiting)
  app.post('/api/escrow/release', requireAuth, requireRole(['ADMIN']), adminRateLimiter, releaseEscrowFunds);
  app.post('/api/escrow/refund', requireAuth, requireRole(['ADMIN']), adminRateLimiter, refundEscrowFunds);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
