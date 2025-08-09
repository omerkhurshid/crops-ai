import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@crops-ai/database'
import { UserRole } from '@crops-ai/shared'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Register endpoint called')
    const { name, email, password, role } = await request.json()

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

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role as UserRole || UserRole.FARM_OWNER
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    console.log('✅ User created successfully:', { id: user.id, email: user.email })

    return Response.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Registration error:', error)
    return Response.json(
      { error: { message: 'Internal server error during registration' } },
      { status: 500 }
    )
  }
}