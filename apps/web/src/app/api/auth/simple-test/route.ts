import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Simple static route in auth directory works',
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  return NextResponse.json({
    message: 'POST method works',
    timestamp: new Date().toISOString()
  })
}