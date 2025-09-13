import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next()

  // Set comprehensive CSP headers for Google Maps
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.app *.nextjs.org https://maps.googleapis.com https://maps.gstatic.com https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com",
    "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com https://*.googleusercontent.com https://*.gstatic.com https://streetviewpixels-pa.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://maps.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.stripe.com",
    "frame-src 'self' https://maps.googleapis.com https://js.stripe.com https://checkout.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ]

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}