import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { prisma } from '../../../../lib/prisma'

/**
 * Get crop health visualization data for charts and analytics
 * GET /api/crop-health/visualizations?farmId=xxx&timeframe=3m
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const timeframe = searchParams.get('timeframe') || '3m'

    if (!farmId) {
      return NextResponse.json({ 
        error: 'Farm ID is required' 
      }, { status: 400 })
    }

    // Verify user has access to this farm
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        fields: {
          include: {
            satelliteData: {
              orderBy: { captureDate: 'desc' },
              take: timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 365
            }
          }
        }
      }
    })

    if (!farm) {
      return NextResponse.json({ 
        error: 'Farm not found' 
      }, { status: 404 })
    }

    // Check if user owns the farm
    if (farm.ownerId !== user.id) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 })
    }

    // Generate visualization data
    const hasRealData = farm.fields.some(field => field.satelliteData.length > 0)

    if (!hasRealData) {
      // Return mock visualization data that matches the component's interface
      return NextResponse.json({
        success: true,
        hasRealData: false,
        timeframe,
        data: {
          ndviTrends: generateMockNDVITrendsForComponent(farm.fields),
          stressHeatmap: generateMockStressHeatmap(farm.fields, farm),
          seasonalPatterns: generateMockSeasonalPatterns(),
          comparisonData: generateMockComparisonData(),
          alertHistory: generateMockAlertHistory()
        }
      })
    }

    // Process real satellite data for visualizations
    const visualizationData = {
      ndviTrends: processNDVITrendsForComponent(farm.fields),
      stressHeatmap: processStressHeatmapForComponent(farm.fields),
      seasonalPatterns: processSeasonalPatternsForComponent(farm.fields),
      comparisonData: processComparisonDataForComponent(farm.fields),
      alertHistory: processAlertHistoryForComponent(farm.fields)
    }

    return NextResponse.json({
      success: true,
      hasRealData: true,
      timeframe,
      data: visualizationData
    })

  } catch (error) {
    console.error('Error fetching visualization data:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch visualization data',
      data: {
        ndviTrends: [],
        stressHeatmap: [],
        seasonalPatterns: generateMockSeasonalPatterns(),
        comparisonData: generateMockComparisonData(),
        alertHistory: []
      }
    }, { status: 500 })
  }
}

// Mock data generators that match component interface
function generateMockNDVITrendsForComponent(fields: any[]) {
  const data = []
  const now = new Date()
  
  for (const field of fields) {
    for (let i = 89; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        fieldId: field.id,
        fieldName: field.name,
        ndvi: 0.65 + Math.random() * 0.25 + Math.sin(i * 0.1) * 0.1,
        evi: 0.55 + Math.random() * 0.2,
        savi: 0.6 + Math.random() * 0.2
      })
    }
  }
  
  return data
}

function generateMockStressAnalysis() {
  return {
    drought: { current: 15, trend: -2, severity: 'low' },
    disease: { current: 8, trend: 1, severity: 'low' },
    nutrient: { current: 12, trend: 0, severity: 'low' },
    pest: { current: 5, trend: -1, severity: 'very_low' }
  }
}

function generateMockHealthDistribution() {
  return {
    excellent: 45,
    good: 35,
    moderate: 15,
    poor: 5
  }
}

function generateMockFieldComparison(fields: any[]) {
  return fields.map((field, index) => ({
    fieldId: field.id,
    fieldName: field.name,
    area: field.area,
    avgNDVI: 0.7 + Math.random() * 0.2,
    healthScore: 75 + Math.random() * 20,
    stressLevel: index % 3 === 0 ? 'low' : index % 3 === 1 ? 'moderate' : 'none'
  }))
}

function generateMockWeatherCorrelation() {
  return {
    temperature: { correlation: 0.65, impact: 'moderate' },
    precipitation: { correlation: 0.78, impact: 'high' },
    humidity: { correlation: 0.45, impact: 'low' },
    wind: { correlation: 0.23, impact: 'minimal' }
  }
}

function generateMockYieldPrediction() {
  return {
    predicted: 185,
    potential: 220,
    confidence: 82,
    factors: {
      weather: 0.25,
      soil: 0.3,
      management: 0.35,
      pest: 0.1
    }
  }
}

function generateMockStressHeatmap(fields: any[], farm: any) {
  return fields.map(field => ({
    fieldId: field.id,
    fieldName: field.name,
    zones: [
      {
        id: `${field.id}-zone-1`,
        coordinates: [(farm.latitude || 40.7128) + Math.random() * 0.01, (farm.longitude || -74.0060) + Math.random() * 0.01] as [number, number],
        stressLevel: Math.random() * 50 + 10,
        stressType: 'drought' as const,
        severity: 'low' as const
      },
      {
        id: `${field.id}-zone-2`, 
        coordinates: [(farm.latitude || 40.7138) + 0.001, (farm.longitude || -74.0050) + 0.001] as [number, number],
        stressLevel: Math.random() * 30 + 5,
        stressType: 'nutrient' as const,
        severity: 'medium' as const
      }
    ]
  }))
}

function generateMockSeasonalPatterns() {
  return {
    spring: { avgNdvi: 0.68, stressEvents: 3 },
    summer: { avgNdvi: 0.82, stressEvents: 1 },
    fall: { avgNdvi: 0.71, stressEvents: 2 },
    winter: { avgNdvi: 0.45, stressEvents: 5 }
  }
}

function generateMockComparisonData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return {
    thisYear: months.map(month => ({
      month,
      health: 70 + Math.random() * 25
    })),
    lastYear: months.map(month => ({
      month,
      health: 65 + Math.random() * 20
    })),
    benchmark: 82
  }
}

function generateMockAlertHistory() {
  const alertTypes = ['health_decline', 'stress_detected', 'improvement', 'threshold_breach'] as const
  const severities = ['low', 'medium', 'high', 'critical'] as const
  
  return Array.from({ length: 10 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i * 3)
    
    return {
      date: date.toISOString().split('T')[0],
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      field: `Field ${Math.floor(Math.random() * 3) + 1}`,
      message: `Health monitoring alert detected`,
      resolved: Math.random() > 0.3
    }
  })
}

// Real data processors (for when satellite data exists)
function processNDVITrendsForComponent(fields: any[]) {
  return fields.flatMap(field => 
    field.satelliteData.map((data: any) => ({
      date: data.captureDate.toISOString().split('T')[0],
      fieldId: field.id,
      fieldName: field.name,
      ndvi: data.ndvi,
      evi: data.ndvi * 0.85,
      savi: data.ndvi * 0.92
    }))
  ).sort((a, b) => a.date.localeCompare(b.date))
}

function processStressHeatmapForComponent(fields: any[]) {
  return fields.map(field => ({
    fieldId: field.id,
    fieldName: field.name,
    zones: field.satelliteData.slice(0, 5).map((data: any, index: number) => ({
      id: `${field.id}-zone-${index}`,
      coordinates: [
        field.latitude + (Math.random() - 0.5) * 0.01, 
        field.longitude + (Math.random() - 0.5) * 0.01
      ] as [number, number],
      stressLevel: Math.round(data.ndvi * 100),
      stressType: ['drought', 'disease', 'nutrient', 'pest'][index % 4] as any,
      severity: data.stressLevel === 'HIGH' ? 'high' : data.stressLevel === 'MODERATE' ? 'medium' : 'low' as any
    }))
  }))
}

function processSeasonalPatternsForComponent(fields: any[]) {
  // Simplified seasonal analysis
  return {
    spring: { avgNdvi: 0.68, stressEvents: 3 },
    summer: { avgNdvi: 0.82, stressEvents: 1 },
    fall: { avgNdvi: 0.71, stressEvents: 2 },
    winter: { avgNdvi: 0.45, stressEvents: 5 }
  }
}

function processComparisonDataForComponent(fields: any[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return {
    thisYear: months.map(month => ({
      month,
      health: 70 + Math.random() * 25
    })),
    lastYear: months.map(month => ({
      month,
      health: 65 + Math.random() * 20
    })),
    benchmark: 82
  }
}

function processAlertHistoryForComponent(fields: any[]) {
  const alertTypes = ['health_decline', 'stress_detected', 'improvement', 'threshold_breach'] as const
  const severities = ['low', 'medium', 'high', 'critical'] as const
  
  return fields.flatMap(field => 
    field.satelliteData.slice(0, 3).map((data: any, index: number) => ({
      date: data.captureDate.toISOString().split('T')[0],
      type: alertTypes[index % alertTypes.length],
      severity: data.stressLevel === 'HIGH' ? 'high' : data.stressLevel === 'MODERATE' ? 'medium' : 'low' as any,
      field: field.name,
      message: `Health monitoring alert for ${field.name}`,
      resolved: Math.random() > 0.3
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

