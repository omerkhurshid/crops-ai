import { NextRequest, NextResponse } from 'next/server'
import { verifyPasswordResetToken } from '../../../../lib/auth/email-verification'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }
    
    const result = await verifyPasswordResetToken(token)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid token' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      valid: true,
      email: result.email
    })
    
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}