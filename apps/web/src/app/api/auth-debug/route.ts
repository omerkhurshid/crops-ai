import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test if NextAuth import works
    const NextAuth = await import('next-auth')
    
    return NextResponse.json({
      status: 'NextAuth import successful',
      version: '4.24.11',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'NextAuth import failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}