import { NextResponse } from 'next/server'

export async function GET(request) {
  return NextResponse.json({
    message: 'Test route works',
    timestamp: new Date().toISOString(),
    url: request.url,
    nextauth_config: {
      secret: !!process.env.NEXTAUTH_SECRET,
      url: process.env.NEXTAUTH_URL
    }
  })
}