import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  
  return NextResponse.json({
    success: true,
    message: 'Test route working',
    pathname: url.pathname,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Test POST route working',
    timestamp: new Date().toISOString()
  })
}