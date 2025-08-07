import { NextRequest, NextResponse } from 'next/server'
import { liveSatelliteService } from '../../../../lib/satellite/live-satellite-service'
import { getCurrentUser } from '../../../../lib/auth/session'
import { prisma } from '../../../../lib/prisma'

/**
 * Get live NDVI data for a field
 * GET /api/satellite/live-ndvi?fieldId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('fieldId')

    if (!fieldId) {
      return NextResponse.json({ 
        error: 'Field ID is required' 
      }, { status: 400 })
    }

    // Verify user has access to this field
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        farm: {
          include: {
            managers: true
          }
        }
      }
    })

    if (!field) {
      return NextResponse.json({ 
        error: 'Field not found' 
      }, { status: 404 })
    }

    // Check if user owns the farm or is a manager
    const hasAccess = field.farm.ownerId === user.id || 
      field.farm.managers.some(manager => manager.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 })
    }

    // Get live satellite data
    const satelliteData = await liveSatelliteService.getLatestFieldData(fieldId)
    
    if (!satelliteData) {
      return NextResponse.json({ 
        error: 'No satellite data available for this field' 
      }, { status: 404 })
    }

    // Get historical data for trend analysis
    const historicalData = await prisma.satelliteData.findMany({
      where: { fieldId },
      orderBy: { captureDate: 'desc' },
      take: 10
    })

    // Calculate trends
    const trend = calculateNDVITrend(historicalData)

    return NextResponse.json({
      success: true,
      data: {
        current: satelliteData,
        historical: historicalData.map(data => ({
          date: data.captureDate,
          ndvi: data.ndvi,
          stressLevel: data.stressLevel
        })),
        trend,
        field: {
          id: field.id,
          name: field.name,
          area: field.area,
          farmName: field.farm.name
        }
      }
    })

  } catch (error) {
    console.error('Error fetching live NDVI data:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch satellite data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Force refresh satellite data for a field
 * POST /api/satellite/live-ndvi
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fieldId } = await request.json()

    if (!fieldId) {
      return NextResponse.json({ 
        error: 'Field ID is required' 
      }, { status: 400 })
    }

    // Verify user has access to this field
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        farm: {
          include: {
            managers: true
          }
        }
      }
    })

    if (!field) {
      return NextResponse.json({ 
        error: 'Field not found' 
      }, { status: 404 })
    }

    // Check access
    const hasAccess = field.farm.ownerId === user.id || 
      field.farm.managers.some(manager => manager.userId === user.id)

    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 })
    }

    // Force refresh with live data preference
    const refreshedData = await liveSatelliteService.getLatestFieldData(fieldId)
    
    return NextResponse.json({
      success: true,
      data: refreshedData,
      message: 'Satellite data refreshed successfully'
    })

  } catch (error) {
    console.error('Error refreshing satellite data:', error)
    
    return NextResponse.json({
      error: 'Failed to refresh satellite data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Calculate NDVI trend from historical data
 */
function calculateNDVITrend(historicalData: any[]) {
  if (historicalData.length < 2) {
    return {
      direction: 'stable' as const,
      change: 0,
      confidence: 'low' as const
    }
  }

  // Sort by date to ensure proper order
  const sortedData = historicalData.sort((a, b) => 
    new Date(a.captureDate).getTime() - new Date(b.captureDate).getTime()
  )

  // Calculate linear trend
  const n = sortedData.length
  const xValues = Array.from({ length: n }, (_, i) => i)
  const yValues = sortedData.map(d => d.ndvi)

  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  
  // Calculate correlation coefficient for confidence
  const meanX = sumX / n
  const meanY = sumY / n
  const numerator = xValues.reduce((sum, x, i) => sum + (x - meanX) * (yValues[i] - meanY), 0)
  const denomX = Math.sqrt(xValues.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0))
  const denomY = Math.sqrt(yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0))
  const correlation = numerator / (denomX * denomY)

  return {
    direction: slope > 0.01 ? 'improving' : slope < -0.01 ? 'declining' : 'stable',
    change: slope,
    confidence: Math.abs(correlation) > 0.7 ? 'high' : 
                Math.abs(correlation) > 0.4 ? 'medium' : 'low'
  }
}