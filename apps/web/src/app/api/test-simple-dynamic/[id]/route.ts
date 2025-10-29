import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    message: 'Simple dynamic route test',
    id: params.id,
    path: request.nextUrl.pathname,
    timestamp: new Date().toISOString()
  })
}