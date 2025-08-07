import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST() {
  try {
    console.log('=== SIMPLE LOCATION FIX ===')
    
    // Just make the location column nullable, no test data
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "farms" ALTER COLUMN "location" DROP NOT NULL`)
      console.log('Successfully made location column nullable')
      
      return NextResponse.json({
        success: true,
        message: 'Location column is now nullable'
      })
    } catch (error) {
      // If already nullable or other error
      console.error('ALTER TABLE error:', error)
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        suggestion: 'The column might already be nullable or there might be a permission issue'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Fix location error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'This endpoint makes the location column nullable. Use POST method to execute.',
    warning: 'This will modify your database schema!'
  })
}