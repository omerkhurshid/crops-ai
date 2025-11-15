import { NextRequest, NextResponse } from 'next/server'
import { supabaseAuth } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    const { email, password } = await request.json()
    
    console.log('Testing sign in for:', email)

    // Sign in with Supabase
    const { data, error } = await supabaseAuth.signIn(email, password)
    
    if (error) {
      console.error('Sign in error:', error)
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 400 })
    }

    if (!data.session || !data.user) {
      return NextResponse.json({ 
        success: false,
        error: 'No session created' 
      }, { status: 400 })
    }

    console.log('Sign in successful:', data.user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        access_token: data.session.access_token
      },
      session: {
        expires_at: data.session.expires_at
      }
    })

  } catch (error) {
    console.error('Test sign in error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}