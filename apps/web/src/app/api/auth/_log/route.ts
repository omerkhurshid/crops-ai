import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // NextAuth logging endpoint - just return success
  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  // NextAuth logging endpoint - just return success  
  return NextResponse.json({ success: true })
}