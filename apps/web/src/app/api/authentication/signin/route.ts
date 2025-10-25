import { NextRequest, NextResponse } from 'next/server'
import { signIn } from 'next-auth/react'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import jwt from 'jsonwebtoken'

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

    console.log('[AUTH SIGNIN] Attempting login for:', email)

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.passwordHash) {
      console.log('[AUTH SIGNIN] User not found or no password hash:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      console.log('[AUTH SIGNIN] Invalid password for:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('[AUTH SIGNIN] Login successful for:', email)

    // Create JWT token for session
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('[AUTH SIGNIN] NEXTAUTH_SECRET not configured')
      return NextResponse.json(
        { error: 'Authentication configuration error' },
        { status: 500 }
      )
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      secret,
      { expiresIn: '24h' }
    )

    // Set HTTP-only cookie for session
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole
      }
    })

    // Set secure cookie
    response.cookies.set('crops-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('[AUTH SIGNIN] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}