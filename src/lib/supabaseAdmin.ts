// Server-only Supabase client using the secret (service role) key.
// Never import this from client-side code — SUPABASE_SECRET_KEY bypasses RLS.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseSecretKey = import.meta.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY || '';

export const supabaseAdmin = supabaseUrl && supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
