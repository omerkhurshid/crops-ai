import { NextRequest } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { UserRole } from '@crops-ai/shared'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole).optional()
})

// POST /api/auth/register-fixed - Registration with fresh Prisma instance
export async function POST(request: NextRequest) {
  // Create a fresh Prisma client for each request to avoid prepared statement conflicts
  const prisma = new PrismaClient()
  
  try {
    console.log('Starting fixed registration...')
    
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

    // Connect to database
    console.log('Connecting to database...')
    await prisma.$connect()
    console.log('Connected successfully')

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

    // Hash password
    console.log('Hashing password...')
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    console.log('Password hashed successfully')

    // Create user
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

    return Response.json({
      success: true,
      user,
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
  } finally {
    // Always disconnect the fresh client
    console.log('Disconnecting from database...')
    await prisma.$disconnect()
    console.log('Disconnected')
  }
}