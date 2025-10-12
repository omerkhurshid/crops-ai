import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth/session'
import { liveSatelliteService } from '../../../../../lib/satellite/live-satellite-service'
import { copernicusService } from '../../../../../lib/satellite/copernicus-service'
import { auditLogger } from '../../../../../lib/logging/audit-logger'
import { prisma } from '../../../../../lib/prisma'

/**
 * Get real NDVI data for a specific field
 * GET /api/satellite/ndvi/[fieldId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fieldId: string } }
) {
  const startTime = Date.now()
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fieldId } = params
    if (!fieldId) {
      return NextResponse.json({ error: 'Field ID required' }, { status: 400 })
    }

    await auditLogger.logDataAccess(
      'read',
      'satellite_ndvi',
      fieldId,
      user.id,
      { source: 'copernicus_api' },
      request
    )

    // Get real NDVI data using our integrated service
    const satelliteData = await liveSatelliteService.getLatestFieldData(fieldId)
    
    if (!satelliteData) {
      return NextResponse.json(
        { error: 'No satellite data available for this field' },
        { status: 404 }
      )
    }

    const duration = Date.now() - startTime
    
    await auditLogger.logPerformance(
      `/api/satellite/ndvi/${fieldId}`,
      'GET',
      duration,
      200,
      user.id,
      {
        fieldId,
        ndvi: satelliteData.ndvi,
        source: satelliteData.metadata.source,
        cloudCoverage: satelliteData.metadata.cloudCoverage
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        fieldId: satelliteData.fieldId,
        captureDate: satelliteData.captureDate,
        ndvi: {
          value: satelliteData.ndvi,
          change: satelliteData.ndviChange,
          stressLevel: satelliteData.stressLevel
        },
        metadata: {
          source: satelliteData.metadata.source,
          cloudCoverage: satelliteData.metadata.cloudCoverage,
          resolution: satelliteData.metadata.resolution,
          confidence: satelliteData.metadata.analysisConfidence || 0.8
        },
        imageUrl: satelliteData.imageUrl
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    
    await auditLogger.logSystem(
      'satellite_ndvi_api_error',
      false,
      {
        fieldId: params.fieldId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      },
      'error'
    )

    console.error('Error fetching NDVI data:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch NDVI data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get detailed NDVI analysis for a field with historical comparison
 * POST /api/satellite/ndvi/[fieldId]
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { fieldId: string } }
) {
  const startTime = Date.now()
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fieldId } = params
    const body = await request.json()
    const { targetDate, analysisType = 'current' } = body

    await auditLogger.logDataAccess(
      'read',
      'satellite_ndvi_analysis',
      fieldId,
      user.id,
      { targetDate, analysisType },
      request
    )

    if (analysisType === 'historical') {
      // Get historical NDVI trend
      const historicalData = await getHistoricalNDVI(fieldId, targetDate)
      
      return NextResponse.json({
        success: true,
        data: {
          fieldId,
          analysisType: 'historical',
          historicalData
        }
      })
    } else {
      // Get current detailed analysis using Copernicus
      const field = await getFieldInfo(fieldId)
      if (!field) {
        return NextResponse.json(
          { error: 'Field not found' },
          { status: 404 }
        )
      }

      const bounds = calculateFieldBounds(field)
      const detailedNDVI = await copernicusService.calculateFieldIndices(
        fieldId,
        bounds,
        targetDate || new Date().toISOString().split('T')[0]
      )

      if (!detailedNDVI) {
        return NextResponse.json(
          { error: 'No detailed NDVI analysis available' },
          { status: 404 }
        )
      }

      const duration = Date.now() - startTime
      
      await auditLogger.logPerformance(
        `/api/satellite/ndvi/${fieldId}`,
        'POST',
        duration,
        200,
        user.id,
        {
          fieldId,
          analysisType,
          ndvi: detailedNDVI.meanNDVI,
          quality: detailedNDVI.quality
        }
      )

      return NextResponse.json({
        success: true,
        data: {
          fieldId: detailedNDVI.fieldId,
          date: detailedNDVI.date,
          ndvi: {
            mean: detailedNDVI.meanNDVI,
            min: detailedNDVI.minNDVI,
            max: detailedNDVI.maxNDVI,
            std: detailedNDVI.stdNDVI
          },
          quality: detailedNDVI.quality,
          cloudCover: detailedNDVI.cloudCover,
          pixelCount: detailedNDVI.pixelCount,
          stressAreas: detailedNDVI.stressAreas
        }
      })
    }

  } catch (error) {
    const duration = Date.now() - startTime
    
    await auditLogger.logSystem(
      'satellite_ndvi_analysis_error',
      false,
      {
        fieldId: params.fieldId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      },
      'error'
    )

    console.error('Error in NDVI analysis:', error)

    return NextResponse.json(
      {
        error: 'Failed to perform NDVI analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get field information
 */
async function getFieldInfo(fieldId: string) {
  try {
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        farm: {
          select: {
            latitude: true,
            longitude: true
          }
        }
      }
    })

    if (!field) {
      return null
    }

    return {
      id: field.id,
      farm: {
        latitude: field.farm.latitude,
        longitude: field.farm.longitude
      },
      area: field.area
    }
  } catch (error) {
    console.error('Error fetching field info:', error)
    return null
  }
}

/**
 * Helper function to calculate field bounds
 */
function calculateFieldBounds(field: any): { north: number; south: number; east: number; west: number } {
  const centerLat = field.farm.latitude
  const centerLng = field.farm.longitude
  const offset = 0.005 // ~0.5km radius
  
  return {
    north: centerLat + offset,
    south: centerLat - offset,
    east: centerLng + offset,
    west: centerLng - offset
  }
}

/**
 * Helper function to get historical NDVI data
 */
async function getHistoricalNDVI(fieldId: string, targetDate: string) {
  // Query the database for historical satellite data
  try {
    const historicalData = await prisma.satelliteData.findMany({
      where: { fieldId },
      orderBy: { captureDate: 'desc' },
      take: 12
    })

    return historicalData.map(data => ({
      date: data.captureDate.toISOString().split('T')[0],
      ndvi: data.ndvi,
      stressLevel: data.stressLevel
    }))
  } catch (error) {
    console.error('Error fetching historical NDVI data:', error)
    return []
  }
}