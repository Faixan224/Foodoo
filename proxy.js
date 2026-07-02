import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Next.js 16: "Middleware" is now called "Proxy" — this file MUST be named proxy.js
// and live at the project root. It refreshes the Supabase session on every matched
// request (so tokens don't silently expire) and does an optimistic auth gate on the
// portal + admin areas. Role checks (admin) happen in the layouts/DAL, not here —
// proxy must stay cheap and must not hit the database.
export async function proxy(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Must run before generating the response so a refreshed token is written to cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAuthPage = path === '/portal/login' || path === '/portal/signup'

  // Not logged in and trying to reach a gated page -> send to login (remember where they wanted to go).
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  // Already logged in but sitting on login/signup -> bounce to the portal home.
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*'],
}
