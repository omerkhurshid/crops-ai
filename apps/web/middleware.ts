import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from './src/lib/supabase/server'

export async function middleware(request: NextRequest) {
  try {
    // Create Supabase client configured for middleware
    const { supabase, response } = createMiddlewareClient(request)

    // Refresh session if expired
    // This is required for Server Components to work properly
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Optional: Add debugging for auth state
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Middleware auth: ${user ? `✅ ${user.email}` : '❌ No user'}`)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next({ request })
  }
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