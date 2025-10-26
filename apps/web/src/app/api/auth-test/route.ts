import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true,
      message: 'Auth configuration loaded successfully',
      hasAuthOptions: !!authOptions,
      providers: authOptions.providers?.length || 0,
      secret: !!authOptions.secret,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}