import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@crops-ai/shared'

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

    // Use the same demo users from authOptions
    const demoUsers = [
      {
        id: 'demo-1',
        email: 'demo@crops.ai',
        password: 'Demo123!',
        name: 'Demo User',
        role: UserRole.FARM_OWNER
      },
      {
        id: 'admin-1',
        email: 'admin@crops.ai',
        password: 'Admin123!',
        name: 'Admin User',
        role: UserRole.ADMIN
      }
    ]

    const user = demoUsers.find(u => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // In a real implementation, you'd create a session here
    // For now, we'll just return the user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}