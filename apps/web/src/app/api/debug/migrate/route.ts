import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST() {
  try {
    console.log('=== DATABASE MIGRATION ===')
    
    // Check if columns already exist
    let columnsExist = false
    try {
      const result: any[] = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'farms' 
        AND column_name IN ('latitude', 'longitude')
      `
      columnsExist = result.length >= 2
      console.log('Columns exist check:', { result, columnsExist })
    } catch (error) {
      console.error('Error checking columns:', error)
    }

    if (columnsExist) {
      return NextResponse.json({
        success: true,
        message: 'Columns already exist, no migration needed',
        columnsAdded: false
      })
    }

    // Add missing columns and fix existing constraints
    const migrations = [
      `ALTER TABLE "farms" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION`,
      `ALTER TABLE "farms" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION`,
      `ALTER TABLE "farms" ADD COLUMN IF NOT EXISTS "address" TEXT`,
      `ALTER TABLE "farms" ADD COLUMN IF NOT EXISTS "region" TEXT`,
      `ALTER TABLE "farms" ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'US'`,
      `ALTER TABLE "farms" ADD COLUMN IF NOT EXISTS "totalArea" DOUBLE PRECISION DEFAULT 0`,
      // Make location column nullable if it exists
      `ALTER TABLE "farms" ALTER COLUMN "location" DROP NOT NULL`
    ]

    const results = []
    for (const migration of migrations) {
      try {
        console.log('Running migration:', migration)
        await prisma.$executeRawUnsafe(migration)
        results.push({ sql: migration, success: true })
        console.log('Migration successful:', migration)
      } catch (error) {
        console.error('Migration failed:', migration, error)
        results.push({ 
          sql: migration, 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    }

    // Verify the migration worked
    let verificationResult = null
    try {
      const testData = {
        name: 'Migration Test Farm',
        ownerId: 'demo-1',
        latitude: 40.7128,
        longitude: -74.0060,
        country: 'US',
        totalArea: 0
      }
      
      const testFarm = await prisma.farm.create({ data: testData })
      await prisma.farm.delete({ where: { id: testFarm.id } })
      verificationResult = 'SUCCESS - Can now create farms with latitude/longitude'
    } catch (error) {
      verificationResult = `FAILED - ${error instanceof Error ? error.message : String(error)}`
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results,
      verification: verificationResult,
      columnsAdded: true
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error)
    }, { status: 500 })
  }
}