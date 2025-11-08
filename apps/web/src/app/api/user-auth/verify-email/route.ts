import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '../../../../lib/auth/email-verification'
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }
    const result = await verifyEmailToken(token)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid or expired token' },
        { status: 400 }
      )
    }
    return NextResponse.json({
      message: 'Email verified successfully!',
      user: {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name
      }
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
export async function GET(request: NextRequest) {
  // Handle GET request for direct link clicks
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing-token', request.url))
  }
  try {
    const result = await verifyEmailToken(token)
    if (!result.success) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
    }
    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?verified=true', request.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url))
  }
}