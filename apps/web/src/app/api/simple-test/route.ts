import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Simple test route works',
    timestamp: new Date().toISOString(),
    env: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV
    }
  })
}