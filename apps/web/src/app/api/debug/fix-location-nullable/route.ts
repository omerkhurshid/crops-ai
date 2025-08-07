import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST() {
  try {
    console.log('=== MAKE LOCATION COLUMN NULLABLE ===')
    
    // First check if location column exists and its current state
    const columnInfo: any[] = await prisma.$queryRaw`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'farms' 
      AND column_name = 'location'
    `
    
    if (columnInfo.length === 0) {
      // Location column doesn't exist, add it as nullable
      await prisma.$executeRawUnsafe(`ALTER TABLE "farms" ADD COLUMN "location" TEXT`)
      console.log('Added location column as nullable')
    } else if (columnInfo[0].is_nullable === 'NO') {
      // Location column exists but is NOT NULL, make it nullable
      await prisma.$executeRawUnsafe(`ALTER TABLE "farms" ALTER COLUMN "location" DROP NOT NULL`)
      console.log('Made location column nullable')
    } else {
      console.log('Location column already nullable')
    }
    
    // Test farm creation without location
    const testData = {
      name: 'Nullable Test Farm',
      ownerId: 'demo-1',
      latitude: 40.7128,
      longitude: -74.0060,
      country: 'US',
      totalArea: 100
    }
    
    const testFarm = await prisma.farm.create({ data: testData })
    await prisma.farm.delete({ where: { id: testFarm.id } })
    
    return NextResponse.json({
      success: true,
      message: 'Location column is now nullable',
      verification: 'Farm creation works without location field'
    })
  } catch (error) {
    console.error('Fix nullable error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}