import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const clientRequestStore = new Map<string, RateLimitRecord>();

// Periodically clean up old IP records every 5 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of clientRequestStore.entries()) {
    if (now > record.resetTime) {
      clientRequestStore.delete(key);
    }
  }
}, 300000);
cleanupInterval.unref();

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyPrefix?: string;
}) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.', keyPrefix = 'rl' } = options;

  return (req: any, res: Response, next: NextFunction): void => {
    // Exclude test runs or internal mock requests if requested
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
      return next();
    }

    const identifier = req.user?.id || req.ip || req.connection.remoteAddress || 'unknown-client';
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();

    const record = clientRequestStore.get(key);

    if (!record || now > record.resetTime) {
      clientRequestStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.status(429).json({
        error: message,
        retryAfter: retryAfterSec,
      });
      return;
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    next();
  };
}

// Preset rate limiters
export const orderRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  message: 'Order creation rate limit exceeded. Please wait a minute before submitting another order.',
  keyPrefix: 'order',
});

export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'Too many authentication attempts. Please slow down.',
  keyPrefix: 'auth',
});

export const adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 40,
  message: 'Administrative operation rate limit reached.',
  keyPrefix: 'admin',
});
