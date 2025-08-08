import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthUtils } from '../../../../lib/auth/utils'
import { UserRole } from '@crops-ai/shared'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole).optional()
})

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    // Check if method is allowed
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: { message: 'Method not allowed' } },
        { status: 405 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.errors[0]
      return NextResponse.json(
        { error: { message: firstError.message, field: firstError.path.join('.') } },
        { status: 400 }
      )
    }

    const { email, name, password, role } = result.data

    // Validate password strength
    const passwordValidation = AuthUtils.validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: { message: `Password validation failed: ${passwordValidation.errors.join(', ')}` } },
        { status: 400 }
      )
    }

    // Create user with hashed password
    const user = await AuthUtils.createUser({
      email,
      name,
      password,
      role: role || UserRole.FARM_OWNER
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      message: 'User registered successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle specific errors
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: { message: 'User already exists with this email' } },
        { status: 409 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: { message: 'A user with this email already exists' } },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}