import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { session } = await request.json()
    
    if (!session) {
      return NextResponse.json({ error: 'No session provided' }, { status: 400 })
    }

    console.log('Setting server session for user:', session.user.id)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://drtbsioeqfodcaelukpo.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydGJzaW9lcWZvZGNhZWx1a3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwNzAyOTAsImV4cCI6MjAyNDY0NjI5MH0.K8fKnZfMq4hqfmDQhzxnZRdHtN8L9xJtYrShQzjBpHo'
    
    let response = NextResponse.json({ success: true, userId: session.user.id })
    
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          })
        },
      },
    })

    // Set the session on the server-side client
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    })

    if (error) {
      console.error('Failed to set server session:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('✅ Server session established successfully')
    return response

  } catch (error) {
    console.error('Session setup error:', error)
    return NextResponse.json({ 
      error: 'Failed to set up session',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}