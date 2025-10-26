import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Auth Route - Starting...')
    
    // Test if authOptions is accessible
    const hasAuthOptions = !!authOptions
    console.log('✅ Auth options loaded:', hasAuthOptions)
    
    // Test session retrieval
    let session = null
    let sessionError = null
    try {
      session = await getServerSession(authOptions)
      console.log('📝 Session result:', session ? 'Found session' : 'No session')
    } catch (error) {
      sessionError = error instanceof Error ? error.message : 'Unknown session error'
      console.error('❌ Session error:', sessionError)
    }
    
    // Test NextAuth configuration
    const config = {
      providers: authOptions.providers?.length || 0,
      hasSecret: !!authOptions.secret,
      strategy: authOptions.session?.strategy || 'jwt',
      signInPage: authOptions.pages?.signIn || '/api/auth/signin'
    }
    
    console.log('⚙️ NextAuth Config:', config)
    
    return NextResponse.json({
      success: true,
      debug: {
        hasAuthOptions,
        session: session ? { user: session.user?.email, role: session.user?.role } : null,
        sessionError,
        config,
        environment: process.env.NODE_ENV,
        url: request.url,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('🚨 Debug Auth Route Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}