import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service_role key
// ⚠️ WARNING: This bypasses RLS and should ONLY be used server-side (API routes)
// NEVER expose this key to the client-side (frontend)
// This is a temporary solution to fix the customer_extra RLS issue

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// For server-side API routes, use service_role key if available
// Otherwise fall back to anon key (which respects RLS)
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseServer: SupabaseClient;

// ✅ CRITICAL: Log environment info to help debug production issues
const envInfo = {
  hasServiceRoleKey: !!supabaseServiceRoleKey,
  serviceRoleKeyLength: supabaseServiceRoleKey?.length || 0,
  hasSupabaseUrl: !!supabaseUrl,
  environment: process.env.NODE_ENV || 'unknown',
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: !!process.env.VERCEL,
  vercelEnv: process.env.VERCEL_ENV || 'unknown',
};

if (supabaseServiceRoleKey && supabaseUrl) {
  console.log('[Supabase Server] ✅ Using service_role key (bypasses RLS)', envInfo);
  supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  console.warn('[Supabase Server] ⚠️ SUPABASE_SERVICE_ROLE_KEY not found, using anon key (respects RLS)', {
    ...envInfo,
    message: 'This will cause customer_extra to return 0 records in production',
    action: 'Check Vercel Dashboard > Settings > Environment Variables > SUPABASE_SERVICE_ROLE_KEY',
    note: 'After adding environment variable, you MUST redeploy the application',
  });
  // Fallback to anon key if service_role key is not available
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.',
    );
  }
  supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabaseServer };
