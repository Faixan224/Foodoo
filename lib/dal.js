import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getServerSupabase } from './supabase-server'

// Data Access Layer — the single place auth checks happen for the portal/admin.
// SERVER-ONLY (imports next/headers via getServerSupabase, which throws on the client).
// cache() memoises each helper for the duration of one render pass.

// Verified auth identity — contacts Supabase Auth on each render pass (not just cookie-trust).
export const getAuthUser = cache(async () => {
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

// The app-level profile row (public.users) for the logged-in auth user.
export const getProfile = cache(async () => {
  const user = await getAuthUser()
  if (!user) return null
  const supabase = await getServerSupabase()
  const { data } = await supabase
    .from('users')
    .select('id, full_name, email, phone, phone_display, role, avatar_url')
    .eq('id', user.id)
    .single()
  return data
})

// Gate a portal (owner) page. Returns the auth user or redirects to login.
export async function requireOwner() {
  const user = await getAuthUser()
  if (!user) redirect('/portal/login')
  return user
}

// Gate an admin page. Returns the admin profile or redirects.
// NOTE: never redirect a logged-in user back to /portal/login here — the proxy
// bounces logged-in users off the login page, which creates an infinite loop.
export async function requireAdmin() {
  const user = await getAuthUser()
  if (!user) redirect('/portal/login')
  const profile = await getProfile()
  if (!profile || profile.role !== 'admin') redirect('/portal')
  return profile
}
