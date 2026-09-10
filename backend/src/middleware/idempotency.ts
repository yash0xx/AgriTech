import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { supabaseAdmin, supabasePublic } from '../config/supabase';

interface IdempotencyCacheEntry {
  hash: string;
  status: number;
  data: any;
  userId?: string;
  createdAt: number;
}

// In-memory fast-lookup cache with 24h TTL
const memoryCache = new Map<string, IdempotencyCacheEntry>();

// Purge expired memory entries periodically
const purgeInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (now - entry.createdAt > 86400000) {
      memoryCache.delete(key);
    }
  }
}, 3600000);
purgeInterval.unref();

export async function idempotencyMiddleware(req: any, res: Response, next: NextFunction): Promise<void> {
  const key = req.headers['idempotency-key'] as string;
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return next();
  }

  const userId = req.user?.id || 'anonymous';
  const path = req.originalUrl || req.url;
  const rawPayload = JSON.stringify({ path, body: req.body });
  const requestHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

  // 1. Check in-memory fast cache
  const cachedMemory = memoryCache.get(key);
  if (cachedMemory) {
    if (cachedMemory.hash === requestHash) {
      res.status(cachedMemory.status).json({
        ...cachedMemory.data,
        _idempotent_replay: true,
      });
      return;
    } else {
      res.status(409).json({
        error: 'IDEMPOTENCY_CONFLICT: Idempotency key has already been used with different request parameters.',
      });
      return;
    }
  }

  // 2. Check Supabase DB table if available
  const client = supabaseAdmin || supabasePublic;
  if (client) {
    try {
      const { data: dbRecord } = await client
        .from('idempotency_records')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (dbRecord) {
        if (dbRecord.request_hash === requestHash) {
          res.status(dbRecord.response_status).json({
            ...dbRecord.response_data,
            _idempotent_replay: true,
          });
          return;
        } else {
          res.status(409).json({
            error: 'IDEMPOTENCY_CONFLICT: Idempotency key has already been used with different request parameters.',
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Idempotency DB lookup fallback:', err);
    }
  }

  // 3. Intercept response to store result upon successful completion
  const originalJson = res.json.bind(res);
  res.json = (data: any): Response => {
    // Only store 2xx responses as completed idempotent transactions
    if (res.statusCode >= 200 && res.statusCode < 300) {
      memoryCache.set(key, {
        hash: requestHash,
        status: res.statusCode,
        data,
        userId,
        createdAt: Date.now(),
      });

      if (client && userId !== 'anonymous') {
        Promise.resolve(
          client
            .from('idempotency_records')
            .insert({
              key,
              user_id: userId,
              request_path: path,
              request_hash: requestHash,
              response_status: res.statusCode,
              response_data: data,
            })
        ).catch((err: any) => console.warn('Failed to persist idempotency record to DB:', err?.message));
      }
    }
    return originalJson(data);
  };

  next();
}
