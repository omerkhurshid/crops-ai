import { NextRequest, NextResponse } from 'next/server'
import { fieldAnalysisPipeline } from '../../../../lib/satellite/field-analysis-pipeline'

export async function POST(request: NextRequest) {
  try {
    const { fieldIds, farmId, analysisDate, analysisType } = await request.json()

    // Validate required parameters
    if (!fieldIds && !farmId) {
      return NextResponse.json(
        { error: 'Either fieldIds or farmId must be provided' },
        { status: 400 }
      )
    }

    let results = []

    if (farmId) {
      // Analyze all fields for a farm
      console.log(`Starting field analysis for farm: ${farmId}`)
      results = await fieldAnalysisPipeline.analyzeFarmFields(farmId, analysisDate)
    } else if (fieldIds && Array.isArray(fieldIds)) {
      // Analyze specific fields
      console.log(`Starting field analysis for fields: ${fieldIds.join(', ')}`)
      
      // For individual fields, we need to get field data from database first
      const { prisma } = await import('../../../../lib/prisma')
      
      for (const fieldId of fieldIds) {
        const field = await prisma.field.findUnique({
          where: { id: fieldId },
          select: {
            id: true,
            name: true,
            area: true
          }
        })

        if (!field) {
          console.warn(`Field ${fieldId} not found, skipping`)
          continue
        }

        // For now, use mock boundary data since PostGIS boundary needs special handling
        const fieldBoundary = {
          id: field.id,
          name: field.name,
          area: field.area,
          boundaries: [
            { lat: 40.7128, lng: -74.0060 }, // Mock coordinates
            { lat: 40.7138, lng: -74.0050 },
            { lat: 40.7118, lng: -74.0050 },
            { lat: 40.7128, lng: -74.0060 }
          ],
          centerLat: 40.7128,
          centerLng: -74.0060
        }

        const result = await fieldAnalysisPipeline.analyzeField(fieldBoundary, analysisDate)
        results.push(result)
      }
    }

    // Calculate summary statistics
    const summary = {
      totalFields: results.length,
      analysisDate: analysisDate || new Date().toISOString().split('T')[0],
      averageHealthScore: results.length > 0 
        ? results.reduce((sum, r) => sum + r.vegetationHealth.healthScore, 0) / results.length 
        : 0,
      totalAlerts: results.reduce((sum, r) => sum + r.stressAlerts.length, 0),
      criticalAlerts: results.reduce((sum, r) => 
        sum + r.stressAlerts.filter(a => a.severity === 'critical').length, 0
      ),
      fieldHealthDistribution: {
        excellent: results.filter(r => r.vegetationHealth.healthScore >= 80).length,
        good: results.filter(r => r.vegetationHealth.healthScore >= 60 && r.vegetationHealth.healthScore < 80).length,
        fair: results.filter(r => r.vegetationHealth.healthScore >= 40 && r.vegetationHealth.healthScore < 60).length,
        poor: results.filter(r => r.vegetationHealth.healthScore < 40).length
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary,
      metadata: {
        analysisType: analysisType || 'standard',
        processingTime: Date.now(),
        dataSource: 'Sentinel Hub',
        analysisMethod: 'NDVI + Vegetation Health Index'
      }
    })

  } catch (error) {
    console.error('Error in field analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze fields',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('fieldId')
    const farmId = searchParams.get('farmId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!fieldId && !farmId) {
      return NextResponse.json(
        { error: 'Either fieldId or farmId must be provided' },
        { status: 400 }
      )
    }

    if (fieldId && startDate && endDate) {
      // Get analysis trends for a specific field
      const trends = await fieldAnalysisPipeline.getAnalysisTrends(fieldId, startDate, endDate)
      
      return NextResponse.json({
        success: true,
        trends,
        metadata: {
          fieldId,
          startDate,
          endDate,
          dataPoints: trends.timeSeriesData.length
        }
      })
    }

    if (farmId) {
      // Get latest analysis results for all fields in a farm
      const { prisma } = await import('../../../../lib/prisma')
      
      const fields = await prisma.field.findMany({
        where: { farmId },
        select: {
          id: true,
          name: true,
          area: true
        }
      })

      // For demo purposes, return mock recent analysis data
      const mockResults = fields.map((field: any) => ({
        fieldId: field.id,
        fieldName: field.name,
        lastAnalysis: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        healthScore: 60 + Math.random() * 35,
        ndviMean: 0.4 + Math.random() * 0.4,
        alertCount: Math.floor(Math.random() * 3),
        trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'declining' : 'stable'
      }))

      return NextResponse.json({
        success: true,
        recentAnalyses: mockResults,
        summary: {
          totalFields: fields.length,
          averageHealth: mockResults.reduce((sum: number, r: any) => sum + r.healthScore, 0) / mockResults.length,
          fieldsRequiringAttention: mockResults.filter((r: any) => r.healthScore < 60 || r.alertCount > 0).length
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error retrieving field analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve field analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}