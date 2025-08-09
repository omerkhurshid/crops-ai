import { NextRequest } from 'next/server'
import { decode } from 'next-auth/jwt'
import { UserRole } from '@crops-ai/shared'

export async function GET(request: NextRequest) {
  try {
    // Debug: log all cookies
    const allCookies = request.cookies.getAll()
    console.log('🍪 All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Get the session token from cookies (check both production and development names)
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
    
    console.log('🔍 Looking for cookie:', cookieName, 'Environment:', process.env.NODE_ENV)
    
    const token = request.cookies.get(cookieName)?.value
    console.log('🎫 Token found:', !!token, token ? `${token.substring(0, 20)}...` : 'none')
    
    if (!token) {
      // Return empty session object (not authenticated) - NextAuth expects this format
      console.log('❌ No token found, returning empty session')
      return Response.json({})
    }
    
    try {
      // Decode NextAuth JWT token
      console.log('🔑 Attempting to decode NextAuth token with secret:', process.env.NEXTAUTH_SECRET ? 'present' : 'missing')
      const decoded = await decode({
        token,
        secret: process.env.NEXTAUTH_SECRET!
      })
      
      if (!decoded) {
        console.log('❌ Token decode returned null')
        return Response.json({})
      }
      
      console.log('✅ Token decoded successfully:', { id: decoded.id, email: decoded.email })
      
      // Return session in exact NextAuth format
      const session = {
        user: {
          id: decoded.id as string,
          email: decoded.email as string,
          name: decoded.name as string,
          image: null, // NextAuth expects this field
          role: decoded.role as UserRole
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }
      
      console.log('🎉 Returning session:', { userId: session.user.id, email: session.user.email })
      return Response.json(session)
    } catch (err) {
      console.error('❌ Token decode failed:', err)
      console.error('Token starts with:', token.substring(0, 50))
      console.error('Secret present:', !!process.env.NEXTAUTH_SECRET)
      // Invalid token - return empty session
      return Response.json({})
    }
  } catch (error) {
    console.error('Session endpoint error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}