import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: any, res: Response, next: NextFunction): void {
  const isProd = process.env.NODE_ENV === 'production';
  const status = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
  const requestId = req.id || res.getHeader('X-Request-Id') || 'unknown';

  // Server-side logging of raw error
  console.error(`[API Error][Request ${requestId}]:`, err?.stack || err?.message || err);

  let clientMessage = err.message || 'An unexpected error occurred';

  // Redact SQL internals and schema names from client responses
  const sqlKeywords = ['SELECT ', 'INSERT INTO', 'UPDATE ', 'DELETE FROM', 'violates foreign key', 'syntax error at', 'relation "'];
  if (sqlKeywords.some(kw => clientMessage.includes(kw))) {
    clientMessage = 'Database operation failed. The request could not be completed.';
  }

  // In production, mask unexpected 500 crashes
  if (status === 500 && isProd) {
    clientMessage = 'An internal server error occurred. Please quote your Request ID if contacting support.';
  }

  res.status(status).json({
    error: clientMessage,
    requestId,
    timestamp: new Date().toISOString(),
  });
}
