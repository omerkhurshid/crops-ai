import { NextRequest, NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Test if we can create a NextAuth handler and call it directly
    const handler = NextAuth(authOptions)
    
    // Try to simulate a providers request
    const testUrl = new URL('/api/auth/providers', request.url)
    const testRequest = new Request(testUrl.toString(), { method: 'GET' })
    
    console.log('🧪 Testing NextAuth handler with providers request...')
    
    try {
      const response = await handler(testRequest, {
        params: { nextauth: ['providers'] }
      })
      
      const responseText = await response.text()
      
      return NextResponse.json({
        success: true,
        message: 'NextAuth handler test successful',
        handlerResponse: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText.substring(0, 500) // Limit body size
        },
        timestamp: new Date().toISOString()
      })
    } catch (handlerError) {
      return NextResponse.json({
        success: false,
        message: 'NextAuth handler test failed',
        error: handlerError instanceof Error ? handlerError.message : String(handlerError),
        stack: handlerError instanceof Error ? handlerError.stack : undefined,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to create NextAuth handler',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}