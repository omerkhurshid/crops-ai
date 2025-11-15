import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Handle Supabase session refresh for authenticated requests
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Use fallback credentials if environment variables are missing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://drtbsioeqfodcaelukpo.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydGJzaW9lcWZvZGNhZWx1a3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwNzAyOTAsImV4cCI6MjAyNDY0NjI5MH0.K8fKnZfMq4hqfmDQhzxnZRdHtN8L9xJtYrShQzjBpHo'

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // This will refresh session if expired - required for Server Components
    await supabase.auth.getUser()
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}