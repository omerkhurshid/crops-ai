import { NextResponse } from 'next/server'
import { authOptions } from '../../../lib/auth'

export async function GET() {
  try {
    return NextResponse.json({
      message: 'Auth test endpoint',
      authOptionsPresent: !!authOptions,
      providers: authOptions?.providers?.length || 0,
      providerNames: authOptions?.providers?.map(p => p.name) || [],
      callbacks: Object.keys(authOptions?.callbacks || {}),
      session: authOptions?.session,
      pages: authOptions?.pages,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to load auth config',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}