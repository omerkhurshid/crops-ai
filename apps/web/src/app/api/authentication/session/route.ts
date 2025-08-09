import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
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
      // Return null session (not authenticated)
      console.log('❌ No token found, returning null session')
      return Response.json(null)
    }
    
    try {
      // Verify the JWT token
      console.log('🔑 Attempting to verify token with secret:', process.env.NEXTAUTH_SECRET ? 'present' : 'missing')
      const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as {
        userId: string
        email: string
        name: string
        role: UserRole
      }
      
      console.log('✅ Token verified successfully:', { userId: decoded.userId, email: decoded.email })
      
      // Return session in NextAuth format
      const session = {
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }
      
      console.log('🎉 Returning session:', { userId: session.user.id, email: session.user.email })
      return Response.json(session)
    } catch (err) {
      console.error('❌ Token verification failed:', err)
      console.error('Token starts with:', token.substring(0, 50))
      console.error('Secret present:', !!process.env.NEXTAUTH_SECRET)
      // Invalid token - return null session
      return Response.json(null)
    }
  } catch (error) {
    console.error('Session endpoint error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}