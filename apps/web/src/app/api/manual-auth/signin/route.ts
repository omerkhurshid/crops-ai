import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Try database authentication for registered users only
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Return user data
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole
        }
      })

    } catch (dbError) {
      console.error('Database authentication error', dbError)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Manual auth error', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}