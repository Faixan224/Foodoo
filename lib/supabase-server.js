import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Per-request Supabase client bound to the logged-in user's auth cookies, so all
// queries run under that user's RLS (auth.uid() = owner_id, etc.).
//
// Next.js 16: cookies() is async — always `await getServerSupabase()`.
// cache() memoises the client per render pass (never shared across requests).
export const getServerSupabase = cache(async function getServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Safe to ignore — proxy.js refreshes the session on every request.
          }
        },
      },
    }
  )
})
