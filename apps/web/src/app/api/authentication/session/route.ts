import { NextRequest } from 'next/server'
import { decode } from 'next-auth/jwt'
import { UserRole } from '@prisma/client'
// Logger replaced with console for local development

export async function GET(request: NextRequest) {
  try {
    // Initialize config only on server-side to prevent client-side environment validation
    let config: any = null;
    if (typeof window === 'undefined') {
      const { getConfig } = require('../../../../lib/config/environment');
      config = getConfig();
    }
    
    if (!config) {
      return Response.json({})
    }
    
    // Get the session token from cookies (check both production and development names)
    const cookieName = config.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
    
    const token = request.cookies.get(cookieName)?.value
    
    if (!token) {
      // Return empty session object (not authenticated) - NextAuth expects this format
      return Response.json({})
    }
    
    try {
      // Decode NextAuth JWT token
      const decoded = await decode({
        token,
        secret: config.NEXTAUTH_SECRET
      })
      
      if (!decoded) {
        return Response.json({})
      }
      
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
      
      return Response.json(session)
    } catch (err) {

      // Invalid token - return empty session
      return Response.json({})
    }
  } catch (error) {
    console.error('Session endpoint error', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}