import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Auth directory route test successful',
    timestamp: new Date().toISOString()
  })
}