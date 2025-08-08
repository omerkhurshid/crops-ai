import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0
  }
  
  return NextResponse.json({
    message: 'NextAuth configuration test',
    config,
    timestamp: new Date().toISOString()
  })
}