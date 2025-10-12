import { NextRequest } from 'next/server'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { encode } from 'next-auth/jwt'
import { UserRole } from '@crops-ai/shared'
import { prisma } from '@/lib/prisma'
import { rateLimitWithFallback } from '../../../../lib/rate-limit'

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
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 })
    }

    console.log('Manual signin attempt:', { email, hasPassword: !!password })

    // Try database authentication for registered users
    try {
      console.log('Checking database for user:', email)
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.passwordHash) {
        console.log('User not found or no password hash:', email)
        return Response.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        console.log('Invalid password for user:', email)
        return Response.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      console.log('Database user authenticated:', user.email)
      
      // Create NextAuth-compatible JWT token
      const token = await encode({
        token: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole
        },
        secret: process.env.NEXTAUTH_SECRET!
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
      const cookieName = process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'
      
      const cookieValue = `${cookieName}=${token}; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax; Max-Age=86400; Path=/`
      
      console.log('🍪 Setting cookie for registered user:', cookieName)
      response.headers.set('Set-Cookie', cookieValue)
      
      return response

    } catch (dbError) {
      console.error('Database authentication error:', dbError)
      return Response.json({ error: 'Authentication failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('Signin endpoint error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}