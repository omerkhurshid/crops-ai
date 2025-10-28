import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return NextResponse.json({
    message: 'Catch-all route test successful',
    slug: params.slug,
    path: request.nextUrl.pathname,
    timestamp: new Date().toISOString()
  })
}