import { createClient } from '@supabase/supabase-js'

// SERVICE-ROLE Supabase client — BYPASSES ROW LEVEL SECURITY.
//
// SERVER-ONLY. Never import this into a Client Component ('use client') or any code
// that ships to the browser: the service-role key must never leave the server.
// Use it only inside server actions / route handlers, and ONLY after verifying the
// caller is authorised (e.g. requireAdmin(), or a validated onboarding code).
export function getAdminSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase dashboard → Project Settings → API → service_role key).'
    )
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
