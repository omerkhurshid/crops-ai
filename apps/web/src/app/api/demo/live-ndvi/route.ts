import { NextRequest, NextResponse } from 'next/server'
import { liveSatelliteService } from '../../../../lib/satellite/live-satellite-service'

/**
 * Public demo endpoint for homepage NDVI data
 * Attempts to get live data, falls back to realistic demo data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || '2024-08-15'
    
    // Try to get live satellite data for a demo field (if any real field exists)
    let liveData = null
    try {
      // This will try Copernicus/Google Earth Engine services
      liveData = await liveSatelliteService.getLatestFieldData('demo-field-nebraska')
    } catch (error) {
      console.log('Live satellite service unavailable for demo')
    }

    // If live data is available, format it for the demo
    if (liveData && liveData.ndvi) {
      return NextResponse.json({
        success: true,
        source: 'live',
        data: {
          averageNDVI: parseFloat(liveData.ndvi.toFixed(3)),
          maxNDVI: parseFloat((liveData.ndvi + 0.12).toFixed(3)),
          minNDVI: parseFloat((liveData.ndvi - 0.08).toFixed(3)),
          uniformity: liveData.stressLevel === 'NONE' ? 92 : liveData.stressLevel === 'LOW' ? 85 : 78,
          stage: getGrowthStage(date),
          yieldProjection: Math.round(liveData.ndvi * 220), // Realistic yield calculation
          healthStatus: getHealthStatus(liveData.stressLevel),
          location: 'Nebraska Corn Field - Central Plains',
          date: date,
          lastUpdate: liveData.captureDate,
          source: liveData.metadata.source,
          confidence: liveData.metadata.analysisConfidence || 0.85,
          recommendations: getRecommendations(liveData.ndvi, liveData.stressLevel)
        }
      })
    }

    // Fallback to enhanced realistic demo data
    const demoData = getEnhancedDemoData(date)
    
    return NextResponse.json({
      success: true,
      source: 'demo',
      data: demoData
    })

  } catch (error) {
    console.error('Demo NDVI API error:', error)
    
    // Emergency fallback
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: {
        averageNDVI: 0.82,
        maxNDVI: 0.95,
        minNDVI: 0.68,
        uniformity: 85,
        stage: 'R3 - Milk Stage',
        yieldProjection: 185,
        healthStatus: 'Excellent',
        location: 'Nebraska Corn Field - Central Plains',
        date: '2024-08-15',
        recommendations: ['Monitor field conditions', 'Continue management plan']
      }
    })
  }
}

/**
 * Get growth stage based on date
 */
function getGrowthStage(date: string): string {
  const stages: { [key: string]: string } = {
    '2024-05-15': 'V4 - Four Leaf',
    '2024-06-01': 'V8 - Eight Leaf', 
    '2024-06-15': 'V12 - Twelve Leaf',
    '2024-07-01': 'VT - Tasseling',
    '2024-07-15': 'R1 - Silking',
    '2024-08-01': 'R3 - Milk Stage',
    '2024-08-15': 'R4 - Dough Stage',
    '2024-09-01': 'R5 - Dent Stage', 
    '2024-09-15': 'R6 - Physiological Maturity',
    '2024-10-01': 'Harvest Ready'
  }
  return stages[date] || 'R4 - Dough Stage'
}

/**
 * Convert stress level to health status
 */
function getHealthStatus(stressLevel: string): string {
  switch (stressLevel) {
    case 'NONE': return 'Outstanding'
    case 'LOW': return 'Excellent' 
    case 'MODERATE': return 'Very Good'
    case 'HIGH': return 'Good'
    case 'SEVERE': return 'Needs Attention'
    default: return 'Excellent'
  }
}

/**
 * Get recommendations based on NDVI and stress level
 */
function getRecommendations(ndvi: number, stressLevel: string): string[] {
  if (stressLevel === 'NONE' && ndvi > 0.8) {
    return [
      'Continue current irrigation schedule',
      'Monitor for late season pests', 
      'Plan optimal harvest timing'
    ]
  } else if (stressLevel === 'LOW') {
    return [
      'Consider supplemental irrigation',
      'Scout for nutrient deficiencies',
      'Monitor weather patterns closely'
    ]
  } else {
    return [
      'Investigate stress causes immediately',
      'Check irrigation system functionality',
      'Consult agronomist for intervention strategies'
    ]
  }
}

/**
 * Enhanced realistic demo data based on actual corn growing patterns
 */
function getEnhancedDemoData(date: string): any {
  const seasonalData: { [key: string]: any } = {
    '2024-05-15': {
      averageNDVI: 0.35,
      maxNDVI: 0.48,
      minNDVI: 0.22,
      uniformity: 78,
      stage: 'V4 - Four Leaf',
      yieldProjection: 165,
      healthStatus: 'Good'
    },
    '2024-06-01': {
      averageNDVI: 0.52,
      maxNDVI: 0.65,
      minNDVI: 0.41,
      uniformity: 82,
      stage: 'V8 - Eight Leaf',
      yieldProjection: 172,
      healthStatus: 'Very Good'
    },
    '2024-06-15': {
      averageNDVI: 0.68,
      maxNDVI: 0.78,
      minNDVI: 0.58,
      uniformity: 85,
      stage: 'V12 - Twelve Leaf',
      yieldProjection: 178,
      healthStatus: 'Excellent'
    },
    '2024-07-01': {
      averageNDVI: 0.82,
      maxNDVI: 0.91,
      minNDVI: 0.73,
      uniformity: 88,
      stage: 'VT - Tasseling',
      yieldProjection: 185,
      healthStatus: 'Excellent'
    },
    '2024-07-15': {
      averageNDVI: 0.89,
      maxNDVI: 0.95,
      minNDVI: 0.81,
      uniformity: 91,
      stage: 'R1 - Silking',
      yieldProjection: 192,
      healthStatus: 'Outstanding'
    },
    '2024-08-01': {
      averageNDVI: 0.85,
      maxNDVI: 0.93,
      minNDVI: 0.76,
      uniformity: 89,
      stage: 'R3 - Milk Stage',
      yieldProjection: 189,
      healthStatus: 'Excellent'
    },
    '2024-08-15': {
      averageNDVI: 0.78,
      maxNDVI: 0.87,
      minNDVI: 0.69,
      uniformity: 86,
      stage: 'R4 - Dough Stage',
      yieldProjection: 186,
      healthStatus: 'Very Good'
    },
    '2024-09-01': {
      averageNDVI: 0.68,
      maxNDVI: 0.78,
      minNDVI: 0.58,
      uniformity: 83,
      stage: 'R5 - Dent Stage',
      yieldProjection: 182,
      healthStatus: 'Good'
    },
    '2024-09-15': {
      averageNDVI: 0.54,
      maxNDVI: 0.64,
      minNDVI: 0.44,
      uniformity: 80,
      stage: 'R6 - Physiological Maturity',
      yieldProjection: 180,
      healthStatus: 'Mature'
    },
    '2024-10-01': {
      averageNDVI: 0.38,
      maxNDVI: 0.48,
      minNDVI: 0.28,
      uniformity: 75,
      stage: 'Harvest Ready',
      yieldProjection: 178,
      healthStatus: 'Ready to Harvest'
    }
  }

  const baseData = seasonalData[date] || seasonalData['2024-08-15']
  
  return {
    ...baseData,
    location: 'Nebraska Corn Field - Central Plains',
    date: date,
    recommendations: [
      'Continue monitoring field conditions',
      'Maintain optimal management practices',
      'Plan for upcoming growth stage requirements'
    ]
  }
}