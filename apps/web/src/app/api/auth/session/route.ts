import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://drtbsioeqfodcaelukpo.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydGJzaW9lcWZvZGNhZWx1a3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwNzAyOTAsImV4cCI6MjAyNDY0NjI5MH0.K8fKnZfMq4hqfmDQhzxnZRdHtN8L9xJtYrShQzjBpHo'

    let response = NextResponse.json({ session: null })

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session retrieval error:', error)
      return NextResponse.json({ session: null, error: error.message })
    }

    return NextResponse.json({ 
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email
        }
      } : null 
    }, { headers: response.headers })

  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ session: null, error: 'Session retrieval failed' })
  }
}