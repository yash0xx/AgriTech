import { Request, Response, NextFunction } from 'express';
import { supabasePublic } from '../config/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
  role?: 'FARMER' | 'SELLER' | 'BUYER' | 'ADMIN';
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
      return;
    }

    // Fetch verified platform role from public.profiles
    const { data: profile } = await supabasePublic
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (profile?.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Forbidden: User account is suspended' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    req.role = profile?.role || 'BUYER';

    next();
  } catch (err: any) {
    console.error('Auth verification error:', err?.message || err);
    res.status(401).json({ error: 'Unauthorized: Session verification failed' });
  }
}

export function requireRole(allowedRoles: Array<'FARMER' | 'SELLER' | 'BUYER' | 'ADMIN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }
    if (!req.role || !allowedRoles.includes(req.role)) {
      res.status(403).json({ error: `Forbidden: Access requires one of roles: [${allowedRoles.join(', ')}]` });
      return;
    }
    next();
  };
}
