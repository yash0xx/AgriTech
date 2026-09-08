import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-agritech.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Check whether Supabase is configured with real credentials
 */
export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder-agritech')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[@agritech/supabase] Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are using placeholder values. Please connect your real Supabase project in .env.'
  );
}

/**
 * Supabase client instance initialized with the public anon key.
 *
 * SECURITY RULE:
 * NEVER use the service-role key on the client! The service-role key bypasses
 * Row Level Security (RLS) and must only be executed in secure server-side environments.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
