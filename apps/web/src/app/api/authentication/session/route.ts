import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { UserRole } from '@crops-ai/shared'

export async function GET(request: NextRequest) {
  try {
    // Get the session token from cookies (check both production and development names)
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
    
    const token = request.cookies.get(cookieName)?.value
    
    if (!token) {
      // Return null session (not authenticated)
      return Response.json(null)
    }
    
    try {
      // Verify the JWT token
      const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as {
        userId: string
        email: string
        name: string
        role: UserRole
      }
      
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
      
      return Response.json(session)
    } catch (err) {
      console.error('Token verification failed:', err)
      // Invalid token - return null session
      return Response.json(null)
    }
  } catch (error) {
    console.error('Session endpoint error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}