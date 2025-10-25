import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[AUTH SIGNOUT] Processing signout request')

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    })

    // Clear the auth cookie
    response.cookies.set('crops-auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/'
    })

    console.log('[AUTH SIGNOUT] Signout successful')
    return response

  } catch (error) {
    console.error('[AUTH SIGNOUT] Error:', error)
    return NextResponse.json(
      { error: 'Signout failed' },
      { status: 500 }
    )
  }
}