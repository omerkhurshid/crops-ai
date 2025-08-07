import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET for easy browser testing
export async function GET(request: NextRequest) {
  return testFarmCreation()
}

export async function POST(request: NextRequest) {
  return testFarmCreation()
}

async function testFarmCreation() {
  try {
    console.log('=== FARM CREATION DEBUG ===')
    
    // Test database connection
    console.log('Testing database connection...')
    try {
      const userCount = await prisma.user.count()
      console.log('Database connection OK, user count:', userCount)
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 })
    }

    // Skip request body parsing for GET requests
    console.log('Testing with hardcoded data...')

    // Test minimal farm creation
    const testFarmData = {
      name: 'Debug Test Farm',
      ownerId: 'demo-1',
      latitude: 40.7128,
      longitude: -74.0060,
      country: 'US',
      totalArea: 0
    }
    
    console.log('Attempting to create test farm with minimal data:', testFarmData)
    
    try {
      const testFarm = await prisma.farm.create({
        data: testFarmData
      })
      console.log('Test farm created successfully:', testFarm)
      
      // Clean up test farm
      await prisma.farm.delete({
        where: { id: testFarm.id }
      })
      console.log('Test farm cleaned up')
      
      return NextResponse.json({
        success: true,
        message: 'Database connection and basic farm creation working',
        testResult: {
          databaseConnected: true,
          canCreateFarm: true,
          testFarmId: testFarm.id
        }
      })
    } catch (createError) {
      console.error('Farm creation failed:', createError)
      return NextResponse.json({
        success: false,
        error: 'Farm creation failed',
        details: createError instanceof Error ? {
          message: createError.message,
          stack: createError.stack
        } : String(createError)
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint error',
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error)
    }, { status: 500 })
  }
}