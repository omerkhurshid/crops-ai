import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
import { rateLimitWithFallback } from '../../../../lib/rate-limit'
import { liveSatelliteService } from '../../../../lib/satellite/live-satellite-service'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { prisma } from '../../../../lib/prisma'

interface FieldAnalysisRequest {
  fieldId: string
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  startDate: string
  endDate: string
  cropType?: string
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for heavy operations
  const { success, headers } = await rateLimitWithFallback(request, 'heavy')
  
  if (!success) {
    return new Response('Too Many Requests. Please try again later.', {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': headers['X-RateLimit-Reset'],
        'Content-Type': 'text/plain',
      },
    })
  }

  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fieldId, geometry, startDate, endDate, cropType } = await request.json() as FieldAnalysisRequest

    // Verify field ownership
    const field = await prisma.field.findFirst({
      where: {
        id: fieldId,
        farm: {
          ownerId: user.id
        }
      },
      include: {
        farm: true
      }
    })

    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 })
    }

    // Use real satellite service to get latest data
    const satelliteData = await liveSatelliteService.getLatestFieldData(fieldId)
    
    if (!satelliteData) {
      // Fallback to mock data if no real data is available
      const mockNdvi = generateRealisticNDVI(geometry, startDate, cropType)
      const analysis = processSatelliteData({ nd: mockNdvi }, fieldId, cropType)
      
      return NextResponse.json({
        success: true,
        fieldId,
        analysisDate: new Date().toISOString(),
        dataSource: 'fallback_mock',
        ...analysis
      })
    }
    
    // Process real satellite data into farmer-friendly metrics
    const analysis = processRealSatelliteData(satelliteData, fieldId, cropType)

    return NextResponse.json({
      success: true,
      fieldId,
      analysisDate: new Date().toISOString(),
      dataSource: satelliteData.metadata.source,
      ...analysis
    })

  } catch (error) {
    console.error('Satellite analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze satellite data'
      },
      { status: 500 }
    )
  }
}

function processRealSatelliteData(satelliteData: any, fieldId: string, cropType?: string) {
  const ndviValue = satelliteData.ndvi
  
  // Convert NDVI to health score (0-100)
  const healthScore = Math.round(Math.max(0, Math.min(100, (ndviValue + 0.2) * 125)))
  
  // Use satellite service stress level mapping
  const stressLevelMap: Record<string, string> = {
    'NONE': 'none',
    'LOW': 'low', 
    'MODERATE': 'moderate',
    'HIGH': 'high',
    'SEVERE': 'severe'
  }
  const stressLevel = stressLevelMap[satelliteData.stressLevel] || 'moderate'

  // Calculate yield potential based on NDVI and crop type
  let yieldPotential: number
  if (cropType === 'Corn') {
    yieldPotential = Math.round(120 + (ndviValue - 0.5) * 200) // bushels per acre
  } else {
    yieldPotential = Math.round(35 + (ndviValue - 0.5) * 80) // soybeans bu/acre
  }

  // Generate recommendations based on real data
  const recommendations = generateRecommendations(ndviValue, stressLevel, cropType)

  // Calculate trend from NDVI change
  let trend = 'stable'
  if (satelliteData.ndviChange !== null) {
    if (satelliteData.ndviChange > 0.05) trend = 'improving'
    else if (satelliteData.ndviChange < -0.05) trend = 'declining'
  }

  return {
    satelliteData: {
      ndvi: {
        mean: Math.round(ndviValue * 1000) / 1000,
        date: satelliteData.captureDate.toISOString().split('T')[0],
        change: satelliteData.ndviChange
      },
      satellite: satelliteData.metadata.source === 'planet-labs' ? 'PlanetScope' : 'Sentinel-2',
      resolution: `${satelliteData.metadata.resolution || 10}m`,
      cloudCover: satelliteData.metadata.cloudCoverage ? `<${Math.round(satelliteData.metadata.cloudCoverage)}%` : '<20%',
      confidence: satelliteData.metadata.analysisConfidence || 0.8
    },
    healthAssessment: {
      score: healthScore,
      status: getHealthStatus(healthScore),
      stressLevel,
      trend
    },
    yieldForecast: {
      predicted: yieldPotential,
      confidence: satelliteData.metadata.analysisConfidence > 0.8 ? 'high' : 'medium',
      unit: cropType === 'Corn' ? 'bu/acre' : 'bu/acre'
    },
    recommendations,
    metadata: {
      isRealData: true,
      source: satelliteData.metadata.source,
      acquisitionDate: satelliteData.captureDate,
      imageId: satelliteData.metadata.planetImageId
    }
  }
}

function generateRealisticNDVI(geometry: any, startDate: string, cropType?: string): number {
  // Get coordinates for location-based variation
  const coords = geometry.coordinates[0][0] // First coordinate
  const lat = coords[1]
  const lon = coords[0]
  
  // Base NDVI varies by latitude (closer to equator = higher vegetation)
  const latitudeFactor = Math.max(0.3, 1 - Math.abs(lat) / 90)
  
  // Seasonal variation based on date
  const date = new Date(startDate)
  const month = date.getMonth() + 1
  let seasonalFactor = 1.0
  
  // Northern hemisphere growing seasons
  if (lat > 0) {
    if (month >= 4 && month <= 9) {
      seasonalFactor = 1.2 // Growing season
    } else {
      seasonalFactor = 0.6 // Dormant season
    }
  } else {
    // Southern hemisphere (opposite seasons)
    if (month <= 3 || month >= 10) {
      seasonalFactor = 1.2
    } else {
      seasonalFactor = 0.6
    }
  }
  
  // Crop type affects NDVI
  let cropFactor = 1.0
  if (cropType === 'Corn') cropFactor = 1.1
  else if (cropType === 'Soybeans') cropFactor = 0.95
  else if (cropType === 'Wheat') cropFactor = 0.9
  
  // Add some randomness for realism
  const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
  
  // Calculate final NDVI (typical range 0.2 to 0.8 for crops)
  const baseNDVI = 0.5
  const finalNDVI = baseNDVI * latitudeFactor * seasonalFactor * cropFactor * randomFactor
  
  // Clamp to realistic range
  return Math.max(0.1, Math.min(0.95, finalNDVI))
}

function processSatelliteData(eeResult: any, fieldId: string, cropType?: string) {
  // Extract NDVI value from Earth Engine result
  const ndviValue = eeResult.nd || 0.5 // fallback if no data
  
  // Convert NDVI to health score (0-100)
  const healthScore = Math.round(Math.max(0, Math.min(100, (ndviValue + 0.2) * 125)))
  
  // Determine stress level based on NDVI thresholds
  let stressLevel: string
  if (ndviValue > 0.7) stressLevel = 'none'
  else if (ndviValue > 0.5) stressLevel = 'low'
  else if (ndviValue > 0.3) stressLevel = 'moderate'
  else if (ndviValue > 0.1) stressLevel = 'high'
  else stressLevel = 'severe'

  // Calculate yield potential based on NDVI
  let yieldPotential: number
  if (cropType === 'Corn') {
    yieldPotential = Math.round(120 + (ndviValue - 0.5) * 200) // bushels per acre
  } else {
    yieldPotential = Math.round(35 + (ndviValue - 0.5) * 80) // soybeans bu/acre
  }

  // Generate farmer recommendations
  const recommendations = generateRecommendations(ndviValue, stressLevel, cropType)

  return {
    satelliteData: {
      ndvi: {
        mean: Math.round(ndviValue * 1000) / 1000,
        date: new Date().toISOString().split('T')[0]
      },
      satellite: 'Sentinel-2',
      resolution: '10m',
      cloudCover: '<20%'
    },
    healthAssessment: {
      score: healthScore,
      status: getHealthStatus(healthScore),
      stressLevel,
      trend: 'stable' // Would calculate from historical data
    },
    yieldForecast: {
      predicted: yieldPotential,
      confidence: ndviValue > 0.3 ? 'high' : 'medium',
      unit: cropType === 'Corn' ? 'bu/acre' : 'bu/acre'
    },
    recommendations
  }
}

function getHealthStatus(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

function generateRecommendations(ndvi: number, stressLevel: string, cropType?: string): string[] {
  const recommendations: string[] = []

  if (ndvi < 0.3) {
    recommendations.push('Consider soil testing and nutrient analysis')
    recommendations.push('Check irrigation system and water availability')
  }
  
  if (ndvi < 0.5) {
    recommendations.push('Monitor for pest and disease pressure')
    if (cropType === 'Corn') {
      recommendations.push('Consider side-dress nitrogen application')
    }
  }

  if (ndvi > 0.7) {
    recommendations.push('Crops showing excellent health - maintain current practices')
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue current management practices')
  }

  return recommendations
}