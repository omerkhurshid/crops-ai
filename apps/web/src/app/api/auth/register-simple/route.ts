import { NextRequest } from 'next/server'
import { z } from 'zod'
import { AuthUtils } from '../../../../lib/auth/utils'
import { UserRole } from '@crops-ai/shared'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole).optional()
})

// POST /api/auth/register-simple - Simplified registration without middleware
export async function POST(request: NextRequest) {
  try {
    console.log('Starting simplified registration...')
    
    const body = await request.json()
    console.log('Request body parsed:', { ...body, password: '[REDACTED]' })

    // Manual validation
    const parseResult = registerSchema.safeParse(body)
    if (!parseResult.success) {
      console.log('Validation failed:', parseResult.error.errors)
      return Response.json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.errors
      }, { status: 400 })
    }

    const { email, name, password, role } = parseResult.data
    console.log('Validation passed')

    // Validate password strength
    console.log('Validating password strength...')
    const passwordValidation = AuthUtils.validatePassword(password)
    if (!passwordValidation.isValid) {
      console.log('Password validation failed:', passwordValidation.errors)
      return Response.json({
        success: false,
        message: `Password validation failed: ${passwordValidation.errors.join(', ')}`
      }, { status: 400 })
    }
    console.log('Password validation passed')

    // Create user
    console.log('Creating user...')
    const user = await AuthUtils.createUser({
      email,
      name,
      password,
      role: role || UserRole.FARM_OWNER
    })
    console.log('User created successfully:', user.id)

    return Response.json({
      success: true,
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
    console.error('Registration error:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.substring(0, 500)
    })
    
    // Handle known Prisma errors
    if (error?.code === 'P2002') {
      return Response.json({
        success: false,
        message: 'User already exists with this email'
      }, { status: 409 })
    }
    
    return Response.json({
      success: false,
      message: 'Registration failed',
      error: {
        name: error?.name || 'Unknown',
        message: error?.message || 'Unknown error',
        code: error?.code
      }
    }, { status: 500 })
  }
}