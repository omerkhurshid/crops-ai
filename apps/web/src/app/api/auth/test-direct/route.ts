import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Direct auth test endpoint works',
    timestamp: new Date().toISOString()
  })
}