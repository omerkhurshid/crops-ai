import { NextRequest } from 'next/server'
import { z } from 'zod'
import { AuthUtils } from '../../../../lib/auth/utils'
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors'
import { validateRequestBody } from '../../../../lib/api/validation'
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware'
import { UserRole } from '@crops-ai/shared'
import { PrismaClient } from '@prisma/client'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole).optional()
})

// POST /api/auth/register-debug - Debug version of register
export const POST = apiMiddleware.basic(
  withMethods(['POST'], async (request: NextRequest) => {
    let prisma: PrismaClient | null = null
    
    try {
      const body = await request.json()
      console.log('Registration request body:', { ...body, password: '[REDACTED]' })
      
      const { email, name, password, role } = validateRequestBody(registerSchema, body)
      console.log('Validated data:', { email, name, role, passwordLength: password.length })

      // Test Prisma connection first
      prisma = new PrismaClient()
      console.log('Prisma client created')
      
      await prisma.$connect()
      console.log('Prisma connected successfully')

      // Check if user exists
      console.log('Checking if user exists...')
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      console.log('Existing user check result:', !!existingUser)

      if (existingUser) {
        return Response.json({
          success: false,
          message: 'User already exists with this email'
        }, { status: 400 })
      }

      // Test password validation
      console.log('Testing password validation...')
      const passwordValidation = AuthUtils.validatePassword(password)
      console.log('Password validation result:', passwordValidation)
      
      if (!passwordValidation.isValid) {
        return Response.json({
          success: false,
          message: `Password validation failed: ${passwordValidation.errors.join(', ')}`
        }, { status: 400 })
      }

      // Test password hashing
      console.log('Hashing password...')
      const passwordHash = await AuthUtils.hashPassword(password)
      console.log('Password hashed successfully, length:', passwordHash.length)

      // Test user creation
      console.log('Creating user in database...')
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: role || UserRole.FARM_OWNER
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      })
      console.log('User created successfully:', user.id)

      return createSuccessResponse({
        user,
        message: 'User registered successfully'
      }, 201)

    } catch (error: any) {
      console.error('Registration error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack?.substring(0, 500)
      })
      
      return Response.json({
        success: false,
        message: 'Registration failed',
        error: {
          name: error.name,
          message: error.message,
          code: error.code
        }
      }, { status: 500 })
    } finally {
      if (prisma) {
        await prisma.$disconnect()
      }
    }
  })
)