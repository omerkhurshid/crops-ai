import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST() {
  try {
    console.log('=== FIX LOCATION COLUMN ===')
    
    // Make location column nullable
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "farms" ALTER COLUMN "location" DROP NOT NULL`)
      console.log('Successfully made location column nullable')
      
      // Test farm creation
      const testData = {
        name: 'Location Fix Test Farm',
        ownerId: 'demo-1',
        latitude: 40.7128,
        longitude: -74.0060,
        country: 'US',
        totalArea: 0
      }
      
      const testFarm = await prisma.farm.create({ data: testData })
      await prisma.farm.delete({ where: { id: testFarm.id } })
      
      return NextResponse.json({
        success: true,
        message: 'Location column fixed and farm creation working',
        verification: 'SUCCESS'
      })
    } catch (error) {
      console.error('Fix failed:', error)
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
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