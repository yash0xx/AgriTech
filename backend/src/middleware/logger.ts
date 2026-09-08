import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestLogger(req: any, res: Response, next: NextFunction): void {
  // Generate or forward unique request ID
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const safeUserId = req.user?.id ? req.user.id.slice(0, 8) + '...' : 'unauthenticated';

    const logEntry = {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      userId: safeUserId,
      ip: req.ip || 'local',
      timestamp: new Date().toISOString(),
    };

    if (res.statusCode >= 500) {
      console.error('[HTTP-SERVER-ERROR]', JSON.stringify(logEntry));
    } else if (res.statusCode >= 400) {
      console.warn('[HTTP-CLIENT-WARN]', JSON.stringify(logEntry));
    } else if (process.env.NODE_ENV !== 'test') {
      console.log('[HTTP-ACCESS]', JSON.stringify(logEntry));
    }
  });

  next();
}
