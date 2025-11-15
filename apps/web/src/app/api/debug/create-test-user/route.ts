import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { supabaseAuth } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    const { email, password, name } = await request.json()
    
    console.log('Creating test user:', { email, name })

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAuth.signUp(email, password, { name })
    
    if (authError || !authData) {
      console.error('Supabase signup error:', authError)
      return NextResponse.json({ error: authError?.message || 'Failed to create user' }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 400 })
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email!,
        name: name || authData.user.email!,
        role: 'FARM_OWNER',
        emailVerified: new Date(), // Auto-verify for testing
      }
    })

    console.log('Test user created:', user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      authUser: {
        id: authData.user.id,
        email: authData.user.email
      }
    })

  } catch (error) {
    console.error('Test user creation error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}