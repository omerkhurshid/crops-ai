import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { resetPassword } from '../../../../lib/auth/email-verification'
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }
    // Hash the new password
    const hashedPassword = await hash(password, 12)
    // Reset the password
    const result = await resetPassword(token, hashedPassword)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to reset password' },
        { status: 400 }
      )
    }
    return NextResponse.json({
      message: 'Password reset successfully!'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}