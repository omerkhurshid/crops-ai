import { NextRequest, NextResponse } from 'next/server'
import { seedCropsDatabase } from '../../../../lib/database/seed-crops'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'This endpoint is only available in development mode' }, { status: 403 })
    }

    console.log('🌱 Starting crop database seeding...')
    const result = await seedCropsDatabase()
    
    console.log('✅ Crop database seeding completed:', result)
    return NextResponse.json({
      success: true,
      message: 'Crop database seeded successfully',
      data: result
    })
    
  } catch (error) {
    console.error('❌ Crop seeding failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to seed crop database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}