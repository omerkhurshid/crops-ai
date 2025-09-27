import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getCurrentUser } from '../../../../lib/auth/session'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's farms with fields
    const farms = await prisma.farm.findMany({
      where: { ownerId: user.id },
      include: { fields: true }
    })

    if (farms.length === 0) {
      return NextResponse.json({ error: 'No farms found' }, { status: 404 })
    }

    // Seed satellite data for each field
    const satelliteDataPromises = []
    
    for (const farm of farms) {
      for (const field of farm.fields) {
        // Skip if satellite data already exists
        const existingData = await prisma.satelliteData.findFirst({
          where: { fieldId: field.id }
        })
        
        if (!existingData) {
          // Create realistic satellite data based on field characteristics
          const baseNDVI = 0.65 + Math.random() * 0.25 // 0.65-0.90 range
          const ndvi = Math.round(baseNDVI * 100) / 100
          
          satelliteDataPromises.push(
            prisma.satelliteData.create({
              data: {
                fieldId: field.id,
                captureDate: new Date(),
                satelliteSource: 'SENTINEL_2',
                cloudCoverage: Math.round(Math.random() * 20), // 0-20% cloud coverage
                ndvi: ndvi,
                ndre: ndvi - 0.05 + Math.random() * 0.1,
                evi: ndvi - 0.1 + Math.random() * 0.1,
                savi: ndvi - 0.08 + Math.random() * 0.1,
                ndwi: 0.2 + Math.random() * 0.3,
                stressLevel: ndvi > 0.8 ? 'NONE' : ndvi > 0.7 ? 'LOW' : ndvi > 0.6 ? 'MODERATE' : 'HIGH',
                growthStage: 'VEGETATIVE',
                anomalyDetected: ndvi < 0.7,
                metadata: {
                  resolution: 10, // 10m resolution for Sentinel-2
                  processingDate: new Date().toISOString(),
                  dataQuality: 'GOOD',
                  algorithm: 'INITIAL_SEED_v1'
                }
              }
            })
          )
        }
      }
    }

    const results = await Promise.all(satelliteDataPromises)

    return NextResponse.json({ 
      message: 'Demo satellite data seeded successfully',
      recordsCreated: results.length,
      farms: farms.map(f => ({
        name: f.name,
        fields: f.fields.length
      }))
    })
  } catch (error) {
    console.error('Error seeding satellite data:', error)
    return NextResponse.json({ 
      error: 'Failed to seed satellite data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check current satellite data status
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farms = await prisma.farm.findMany({
      where: { ownerId: user.id },
      include: {
        fields: {
          include: {
            satelliteData: {
              orderBy: { captureDate: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    const status = farms.map(farm => ({
      farmName: farm.name,
      fields: farm.fields.map(field => ({
        fieldName: field.name,
        hasSatelliteData: field.satelliteData.length > 0,
        latestData: field.satelliteData[0] || null
      }))
    }))

    return NextResponse.json({ status })
  } catch (error) {
    console.error('Error checking satellite data:', error)
    return NextResponse.json({ error: 'Failed to check satellite data' }, { status: 500 })
  }
}