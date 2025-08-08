import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log(`🔍 Middleware hit: ${request.nextUrl.pathname}`)
  
  // Allow all requests for testing
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`✅ API request allowed: ${request.nextUrl.pathname}`)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}