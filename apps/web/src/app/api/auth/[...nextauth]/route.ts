import NextAuth from 'next-auth'
import type { NextRequest } from 'next/server'
import { authOptions } from '../../../../lib/auth'

// Create the NextAuth handler
const handler = NextAuth(authOptions)

// Wrapper to fix NextAuth v4 + App Router compatibility issues
async function NextAuthHandler(
  req: NextRequest,
  context: { params: { nextauth: string[] } }
) {
  console.log('🌐 NextAuth Handler Called:', {
    method: req.method,
    url: req.url,
    nextauth: context.params.nextauth,
    timestamp: new Date().toISOString()
  })

  try {
    // Create a proper Request object that NextAuth v4 expects
    const url = new URL(req.url)
    
    // Ensure the URL has the correct structure for NextAuth
    const nextAuthPath = context.params.nextauth.join('/')
    const nextAuthUrl = new URL(`/api/auth/${nextAuthPath}`, url.origin)
    
    // Copy search params from original request
    url.searchParams.forEach((value, key) => {
      nextAuthUrl.searchParams.set(key, value)
    })

    // Create a new Request with the corrected URL
    const nextAuthRequest = new Request(nextAuthUrl.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    })

    // Add NextAuth-specific properties that might be expected
    Object.defineProperty(nextAuthRequest, 'nextUrl', {
      value: nextAuthUrl,
      writable: false,
    })

    console.log('✅ Calling NextAuth handler with URL:', nextAuthUrl.toString())
    
    const response = await handler(nextAuthRequest, context)
    
    console.log('✅ NextAuth response status:', response.status)
    return response
    
  } catch (error) {
    console.error('❌ NextAuth Handler Error:', error)
    
    // Return a proper error response
    return new Response(
      JSON.stringify({
        error: 'Authentication service error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export { NextAuthHandler as GET, NextAuthHandler as POST }