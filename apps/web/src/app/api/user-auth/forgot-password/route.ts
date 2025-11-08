import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetEmail } from '../../../../lib/auth/email-verification'
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    // Always return success to prevent email enumeration
    await sendPasswordResetEmail(email)
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}