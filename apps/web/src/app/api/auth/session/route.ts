import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json(session)
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json(null)
  }
}