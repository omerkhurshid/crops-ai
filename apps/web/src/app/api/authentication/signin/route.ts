import { NextRequest } from 'next/server'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { encode } from 'next-auth/jwt'
import { UserRole, Logger } from '@crops-ai/shared'
import { prisma } from '@/lib/prisma'
import { rateLimitWithFallback } from '../../../../lib/rate-limit'
import { getConfig } from '../../../../lib/config/environment'

export async function POST(request: NextRequest) {
  // Apply rate limiting for auth endpoints
  const { success, headers } = await rateLimitWithFallback(request, 'auth')
  
  if (!success) {
    return new Response('Too Many Requests. Please try again later.', {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': headers['X-RateLimit-Reset'],
        'Content-Type': 'text/plain',
      },
    })
  }

  try {
    const config = getConfig()
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Try database authentication for registered users
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.passwordHash) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 })
      }
      
      // Create NextAuth-compatible JWT token
      const token = await encode({
        token: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole
        },
        secret: config.NEXTAUTH_SECRET
      })
      
      const response = Response.json({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole
        }
      })
      
      // Set HTTP-only cookie with proper NextAuth format
      const cookieName = config.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'
      
      const cookieValue = `${cookieName}=${token}; HttpOnly; ${config.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax; Max-Age=86400; Path=/`
      
      response.headers.set('Set-Cookie', cookieValue)
      
      return response

    } catch (dbError) {
      Logger.error('Database authentication error', dbError)
      return Response.json({ error: 'Authentication failed' }, { status: 500 })
    }

  } catch (error) {
    Logger.error('Signin endpoint error', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}