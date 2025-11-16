import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    console.log('=== SESSION DEBUG ===')
    
    // Check environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://drtbsioeqfodcaelukpo.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydGJzaW9lcWZvZGNhZWx1a3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwNzAyOTAsImV4cCI6MjAyNDY0NjI5MH0.K8fKnZfMq4hqfmDQhzxnZRdHtN8L9xJtYrShQzjBpHo'
    
    console.log('Environment check:')
    console.log('- Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('- Supabase Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Check cookies
    const allCookies = request.cookies.getAll()
    const supabaseCookies = allCookies.filter(c => c.name.includes('supabase'))
    
    console.log('Cookie analysis:')
    console.log('- Total cookies:', allCookies.length)
    console.log('- Supabase cookies:', supabaseCookies.length)
    console.log('- Supabase cookie names:', supabaseCookies.map(c => c.name))
    
    // Check headers
    const authHeader = request.headers.get('Authorization')
    console.log('Headers:')
    console.log('- Authorization header:', !!authHeader)
    console.log('- User-Agent:', request.headers.get('User-Agent')?.substring(0, 50))
    
    // Try to create Supabase client and get session
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // No-op for debugging
        },
      },
    })
    
    console.log('Attempting to get session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('Session result:')
    console.log('- Session error:', sessionError?.message)
    console.log('- Has session:', !!session)
    console.log('- Session user:', session?.user?.id)
    
    console.log('Attempting to get user...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('User result:')
    console.log('- User error:', userError?.message)
    console.log('- Has user:', !!user)
    console.log('- User ID:', user?.id)
    console.log('- User email:', user?.email)
    
    return NextResponse.json({
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      cookies: {
        total: allCookies.length,
        supabaseCount: supabaseCookies.length,
        supabaseNames: supabaseCookies.map(c => c.name),
        supabaseValues: supabaseCookies.map(c => ({ 
          name: c.name, 
          hasValue: !!c.value,
          valueLength: c.value?.length || 0
        }))
      },
      headers: {
        hasAuth: !!authHeader,
        userAgent: request.headers.get('User-Agent')?.substring(0, 50)
      },
      auth: {
        sessionError: sessionError?.message || null,
        hasSession: !!session,
        sessionUserId: session?.user?.id || null,
        userError: userError?.message || null,
        hasUser: !!user,
        userId: user?.id || null,
        userEmail: user?.email || null
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Session debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}