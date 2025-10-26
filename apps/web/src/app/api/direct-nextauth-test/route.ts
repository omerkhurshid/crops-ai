import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Try to import and test NextAuth directly
    const NextAuth = (await import('next-auth')).default
    const { authOptions } = await import('../../../lib/auth')
    
    console.log('🔍 Direct NextAuth Test:', {
      hasNextAuth: !!NextAuth,
      hasAuthOptions: !!authOptions,
      url: request.url
    })
    
    // Test creating the handler
    const handler = NextAuth(authOptions)
    
    return NextResponse.json({
      success: true,
      message: 'NextAuth handler created successfully',
      hasNextAuth: !!NextAuth,
      hasAuthOptions: !!authOptions,
      hasHandler: !!handler,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Direct NextAuth Test Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}