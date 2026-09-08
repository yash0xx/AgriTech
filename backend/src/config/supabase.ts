import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'anon-key';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for verifying user tokens
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Trusted Admin client for privileged backend operations (escrow releases, webhook processing)
export const supabaseAdmin = supabaseServiceRole
  ? createClient(supabaseUrl, supabaseServiceRole, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
