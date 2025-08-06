import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try to dynamically import NextAuth to see if there's an issue
    const NextAuth = await import('next-auth').then(m => m.default)
    const { authOptions } = await import('@/lib/auth')
    
    return NextResponse.json({
      status: 'success',
      message: 'NextAuth and authOptions loaded successfully',
      nextAuthLoaded: !!NextAuth,
      authOptionsLoaded: !!authOptions,
      providers: authOptions?.providers?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to load NextAuth or authOptions',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return NextResponse.json({
      message: 'POST test successful',
      received: body
    })
  } catch (error) {
    return NextResponse.json({
      error: 'POST test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}