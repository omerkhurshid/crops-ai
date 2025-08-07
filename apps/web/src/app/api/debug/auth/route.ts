import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getCurrentUser } from '../../../../lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH DEBUG ===')
    
    // Check NextAuth token
    let token = null
    try {
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      })
      console.log('NextAuth token:', token ? {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        exp: token.exp,
        iat: token.iat
      } : 'null')
    } catch (tokenError) {
      console.log('NextAuth token error:', tokenError)
    }

    // Check session cookie
    const sessionCookie = request.cookies.get('session')
    let cookieData = null
    if (sessionCookie) {
      try {
        cookieData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
        console.log('Session cookie data:', {
          id: cookieData.id,
          email: cookieData.email,
          name: cookieData.name,
          role: cookieData.role,
          exp: cookieData.exp,
          expired: Date.now() > cookieData.exp
        })
      } catch (cookieError) {
        console.log('Session cookie parse error:', cookieError)
      }
    } else {
      console.log('No session cookie found')
    }

    // Check getCurrentUser
    let currentUser = null
    try {
      currentUser = await getCurrentUser()
      console.log('getCurrentUser result:', currentUser)
    } catch (userError) {
      console.log('getCurrentUser error:', userError)
    }

    // Check specific cookies
    const nextAuthSession = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token')
    console.log('NextAuth session cookie:', nextAuthSession ? 'present' : 'missing')

    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET
    })

    return NextResponse.json({
      success: true,
      debug: {
        token: token ? {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          hasRequiredFields: !!(token.id && token.email && token.role)
        } : null,
        cookieData: cookieData ? {
          id: cookieData.id,
          email: cookieData.email,
          name: cookieData.name,
          role: cookieData.role,
          expired: Date.now() > cookieData.exp
        } : null,
        currentUser,
        hasNextAuthCookie: !!nextAuthSession,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          hasSecret: !!process.env.NEXTAUTH_SECRET
        }
      }
    })

  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}