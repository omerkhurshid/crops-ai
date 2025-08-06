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

// POST /api/auth/register-final - Final attempt with prepared statement avoidance
export async function POST(request: NextRequest) {
  let prisma: PrismaClient | null = null
  
  try {
    console.log('Starting final registration attempt...')
    
    const body = await request.json()
    console.log('Request body parsed')

    const parseResult = registerSchema.safeParse(body)
    if (!parseResult.success) {
      return Response.json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.errors
      }, { status: 400 })
    }

    const { email, name, password, role } = parseResult.data

    // Create Prisma client with specific configuration to avoid prepared statements
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      // Disable prepared statements
      log: ['error']
    })

    console.log('Connecting to database...')
    await prisma.$connect()

    // Use raw SQL to avoid prepared statement issues
    console.log('Checking for existing user with raw SQL...')
    const existingUserResult = await prisma.$queryRawUnsafe(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      email
    ) as any[]

    if (existingUserResult.length > 0) {
      return Response.json({
        success: false,
        message: 'User already exists with this email'
      }, { status: 400 })
    }

    // Hash password
    console.log('Hashing password...')
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Generate ID manually
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    // Insert user with raw SQL
    console.log('Inserting user with raw SQL...')
    await prisma.$queryRawUnsafe(
      `INSERT INTO users (id, email, name, "passwordHash", role, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      userId,
      email,
      name,
      passwordHash,
      role || UserRole.FARM_OWNER
    )

    // Fetch the created user
    const createdUserResult = await prisma.$queryRawUnsafe(
      'SELECT id, email, name, role, "createdAt" FROM users WHERE id = $1',
      userId
    ) as any[]

    const user = createdUserResult[0]

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
      code: error?.code
    })
    
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
    if (prisma) {
      console.log('Disconnecting...')
      await prisma.$disconnect()
    }
  }
}