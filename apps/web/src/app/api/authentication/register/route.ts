import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'
import { UserRole } from '@prisma/client'
import { sendVerificationEmail } from '../../../../lib/auth/email-verification'
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

    const { name, email, password, role, userType } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return Response.json(
        { error: { message: 'Name, email, and password are required' } },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return Response.json(
        { error: { message: 'Password must be at least 8 characters long' } },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return Response.json(
        { error: { message: 'User with this email already exists' } },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role as UserRole || UserRole.FARM_OWNER,
        userType: userType || null, // Optional farming type
        emailVerified: null // Not verified yet
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Send verification email
    try {
      await sendVerificationEmail(user.id, user.email, user.name)

    } catch (emailError) {

      // Don't fail registration if email fails
    }

    return Response.json({
      message: 'User created successfully! Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      requiresVerification: true
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Registration error:', error)
    return Response.json(
      { error: { message: 'Internal server error during registration' } },
      { status: 500 }
    )
  }
}