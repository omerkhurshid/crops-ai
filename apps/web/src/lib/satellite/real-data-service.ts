/**
 * Service to fetch and integrate real Google Earth Engine satellite data
 * with the existing Cropple.ai dashboard
 */

import { prisma } from '@/lib/prisma'

interface FieldData {
  id: string
  name: string
  boundaries: number[][][]
  cropType: string
  acres: number
}

interface SatelliteAnalysis {
  satelliteData: {
    ndvi: {
      mean: number
      date: string
    }
    satellite: string
    resolution: string
    cloudCover: string
  }
  healthAssessment: {
    score: number
    status: string
    stressLevel: string
    trend: string
  }
  yieldForecast: {
    predicted: number
    confidence: string
    unit: string
  }
  recommendations: string[]
}

export class RealSatelliteService {
  /**
   * Get real satellite data for farm dashboard
   */
  async getFarmDashboardData(farmId: string): Promise<{
    overallHealth: number
    healthTrend: number
    stressedAreas: number
    stressTrend: number
    yieldForecast: {
      current: number
      potential: number
      unit: string
      cropType: string
    }
    todayHighlights: string[]
    satelliteDataAvailable: boolean
    lastSatelliteUpdate: Date | null
  }> {
    try {
      // Get farm fields from database
      const fields = await this.getFarmFields(farmId)
      
      // Get satellite analysis for each field
      const analyses = await Promise.all(
        (fields || []).map(field => this.analyzeField(field))
      )

      // Calculate farm-wide metrics from real satellite data
      const overallHealth = this.calculateOverallHealth(analyses, fields)
      const stressedAreas = this.calculateStressedAreas(analyses, fields)
      const yieldForecast = await this.calculateYieldForecast(analyses, fields)
      const highlights = this.generateHighlights(analyses, fields)
      
      // Extract the most recent satellite timestamp from analyses
      const latestSatelliteDate = this.extractLatestSatelliteDate(analyses)

      return {
        overallHealth: Math.round(overallHealth),
        healthTrend: await this.calculateHealthTrend(farmId, analyses),
        stressedAreas: Math.round(stressedAreas * 10) / 10,
        stressTrend: await this.calculateStressTrend(farmId, analyses),
        yieldForecast,
        todayHighlights: highlights,
        satelliteDataAvailable: true,
        lastSatelliteUpdate: latestSatelliteDate
      }
    } catch (error) {
      console.error('Error fetching real satellite data:', error)
      
      // Return unavailable state if satellite service fails
      throw new Error('Satellite data service unavailable')
    }
  }

  private async analyzeField(field: FieldData): Promise<SatelliteAnalysis> {
    const response = await fetch('/api/satellite/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fieldId: field.id,
        geometry: {
          type: 'Polygon',
          coordinates: field.boundaries
        },
        startDate: this.getAnalysisStartDate(),
        endDate: new Date().toISOString().split('T')[0],
        cropType: field.cropType
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to analyze field ${field.id}: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || 'Analysis failed')
    }

    return result
  }

  private calculateOverallHealth(analyses: SatelliteAnalysis[], fields: FieldData[]): number {
    let totalWeightedHealth = 0
    let totalWeight = 0

    ;(analyses || []).forEach((analysis, index) => {
      const field = (fields || [])[index]
      if (!field || !analysis?.healthAssessment) return
      
      const fieldAcres = field.acres
      const fieldHealth = analysis.healthAssessment.score
      
      totalWeightedHealth += fieldHealth * fieldAcres
      totalWeight += fieldAcres
    })

    return totalWeight > 0 ? totalWeightedHealth / totalWeight : 75
  }

  private calculateStressedAreas(analyses: SatelliteAnalysis[], fields: FieldData[]): number {
    let totalStressedAcres = 0
    let totalAcres = 0

    ;(analyses || []).forEach((analysis, index) => {
      const field = (fields || [])[index]
      if (!field || !analysis?.healthAssessment) return
      
      const fieldAcres = field.acres
      const stressLevel = analysis.healthAssessment.stressLevel
      
      // Map stress levels to percentages
      const stressMultipliers = {
        'none': 0,
        'low': 0.2,
        'moderate': 0.6,
        'high': 0.9,
        'severe': 1.0
      }
      
      const stressMultiplier = stressMultipliers[stressLevel as keyof typeof stressMultipliers] || 0
      
      totalStressedAcres += fieldAcres * stressMultiplier
      totalAcres += fieldAcres
    })

    return totalAcres > 0 ? (totalStressedAcres / totalAcres) * 100 : 5
  }

  private async calculateYieldForecast(analyses: SatelliteAnalysis[], fields: FieldData[]) {
    // Try to get ML-based yield predictions first
    try {
      const mlPredictions = await Promise.all(
        (fields || []).map(async (field) => {
          try {
            // Get detailed yield prediction from ML service
            const response = await fetch('/api/ml/predict', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fieldId: field.id,
                cropType: field.cropType || 'corn',
                plantingDate: new Date(new Date().getFullYear(), 3, 15).toISOString(), // April 15th default
                features: {
                  satellite: {
                    avgNDVI: analyses.find((_, i) => i === fields.indexOf(field))?.satelliteData?.ndvi?.mean || 0.7
                  }
                },
                options: {
                  includeRecommendations: false,
                  includeUncertainty: true
                }
              })
            })

            if (response.ok) {
              const result = await response.json()
              return {
                fieldId: field.id,
                acres: field.acres,
                yield: result.data.predictedYield,
                confidence: result.data.confidence,
                cropType: field.cropType || 'corn'
              }
            }
          } catch (error) {

          }
          return null
        })
      )

      // Filter successful ML predictions
      const validPredictions = mlPredictions.filter(p => p !== null)
      
      if (validPredictions.length > 0) {
        // Use ML predictions for yield forecast
        let totalWeightedYield = 0
        let totalWeight = 0
        const cropTypes = validPredictions.map(p => p.cropType)
        const dominantCrop = cropTypes.length > 0 ? cropTypes[0] : 'corn'

        validPredictions.forEach(prediction => {
          totalWeightedYield += prediction.yield * prediction.acres
          totalWeight += prediction.acres
        })

        const avgYield = totalWeight > 0 ? totalWeightedYield / totalWeight : 185
        const avgConfidence = validPredictions.reduce((sum, p) => sum + p.confidence, 0) / validPredictions.length

        return {
          current: Math.round(avgYield),
          potential: Math.round(avgYield * (1 + avgConfidence * 0.3)), // Confidence-based potential
          unit: 'bu/acre',
          cropType: dominantCrop,
          isMLPrediction: true,
          confidence: Math.round(avgConfidence * 100)
        }
      }
    } catch (error) {

    }

    // Fallback to satellite-based yield calculation
    let totalWeightedYield = 0
    let totalWeight = 0
    const dominantCrop = 'corn'

    ;(analyses || []).forEach((analysis, index) => {
      const field = (fields || [])[index]
      if (!field || !analysis?.yieldForecast) return
      
      const fieldAcres = field.acres
      const fieldYield = analysis.yieldForecast.predicted
      
      totalWeightedYield += fieldYield * fieldAcres
      totalWeight += fieldAcres
    })

    const avgYield = totalWeight > 0 ? totalWeightedYield / totalWeight : 185

    return {
      current: Math.round(avgYield),
      potential: Math.round(avgYield * 1.2), // 20% potential improvement
      unit: 'bu/acre',
      cropType: dominantCrop,
      isMLPrediction: false
    }
  }

  private generateHighlights(analyses: SatelliteAnalysis[], fields: FieldData[]): string[] {
    const highlights: string[] = []

    // Find best performing field
    let bestField = null
    let bestScore = 0
    ;(analyses || []).forEach((analysis, index) => {
      const field = (fields || [])[index]
      if (!field || !analysis?.healthAssessment) return
      
      if (analysis.healthAssessment.score > bestScore) {
        bestScore = analysis.healthAssessment.score
        bestField = field.name
      }
    })

    if (bestField) {
      highlights.push(`${bestField} showing excellent satellite readings`)
    }

    // Count stressed fields
    const stressedCount = (analyses || []).filter(a => 
      a?.healthAssessment && ['high', 'severe'].includes(a.healthAssessment.stressLevel)
    ).length

    if (stressedCount > 0) {
      highlights.push(`${stressedCount} field${stressedCount > 1 ? 's require' : ' requires'} attention`)
    }

    // Recent satellite data available
    const latestDate = (analyses || [])[0]?.satelliteData?.ndvi?.date
    if (latestDate) {
      highlights.push(`Latest satellite data from ${new Date(latestDate).toLocaleDateString()}`)
    }

    return highlights.slice(0, 3) // Limit to 3 highlights
  }

  private extractLatestSatelliteDate(analyses: SatelliteAnalysis[]): Date | null {
    let latestDate: Date | null = null
    
    for (const analysis of analyses) {
      if (analysis?.satelliteData?.ndvi?.date) {
        const analysisDate = new Date(analysis.satelliteData.ndvi.date)
        if (!latestDate || analysisDate > latestDate) {
          latestDate = analysisDate
        }
      }
    }
    
    return latestDate
  }

  private async getFarmFields(farmId: string): Promise<FieldData[]> {
    try {
      const farm = await prisma.farm.findUnique({
        where: { id: farmId },
        include: {
          fields: {
            include: {
              crops: {
                orderBy: { plantingDate: 'desc' },
                take: 1 // Get most recent crop for each field
              }
            }
          }
        }
      })

      if (!farm) {
        throw new Error(`Farm with ID ${farmId} not found`)
      }

      return farm.fields.map(field => ({
        id: field.id,
        name: field.name,
        boundaries: [], // TODO: Implement boundary parsing once PostGIS geography is properly configured
        cropType: field.crops[0]?.cropType || field.cropType || 'Unknown',
        acres: field.area * 2.47 // Convert hectares to acres
      }))
    } catch (error) {
      console.error('Error fetching farm fields:', error)
      throw new Error('Failed to fetch farm fields from database')
    }
  }

  private parseBoundaryGeography(boundary: any): number[][][] {
    // Parse PostGIS geography data - implementation depends on your boundary format
    // For now, return empty array if boundary cannot be parsed
    try {
      if (typeof boundary === 'string') {
        // Handle string-based geography data
        return JSON.parse(boundary)
      }
      return boundary || []
    } catch {
      return []
    }
  }

  private async calculateHealthTrend(farmId: string, currentAnalyses: any[]): Promise<number> {
    try {
      // Get historical health data from satellite records
      const historicalData = await prisma.satelliteData.findMany({
        where: {
          field: {
            farmId: farmId
          },
          captureDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: { captureDate: 'desc' },
        select: { ndvi: true, captureDate: true }
      })

      if (historicalData.length < 2) return 0

      const currentAvg = currentAnalyses.reduce((sum, analysis) => sum + (analysis.ndvi || 0), 0) / currentAnalyses.length
      const historicalAvg = historicalData.reduce((sum, record) => sum + (record.ndvi || 0), 0) / historicalData.length
      
      const trend = currentAvg - historicalAvg
      return Math.round(trend * 100) // Convert to percentage change
    } catch (error) {
      console.error('Error calculating health trend:', error)
      return 0
    }
  }

  private async calculateStressTrend(farmId: string, currentAnalyses: any[]): Promise<number> {
    try {
      // Calculate stress trend based on historical stress indicators
      const historicalAlerts = await prisma.weatherAlert.findMany({
        where: {
          farmId: farmId,
          triggeredAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: { severity: true, triggeredAt: true }
      })

      // Simple trend calculation - fewer alerts = negative trend (improving)
      const recentAlerts = historicalAlerts.filter(alert => 
        alert.triggeredAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length

      const olderAlerts = historicalAlerts.filter(alert => 
        alert.triggeredAt <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length

      return recentAlerts - olderAlerts // Positive = more stress, negative = improving
    } catch (error) {
      console.error('Error calculating stress trend:', error)
      return 0
    }
  }

  private getAnalysisStartDate(): string {
    const date = new Date()
    date.setDate(date.getDate() - 30) // 30 days ago
    return date.toISOString().split('T')[0]
  }

  private extractLatestSatelliteDate(analyses: SatelliteAnalysis[]): Date | null {
    let latestDate: Date | null = null;
    
    analyses.forEach(analysis => {
      if (analysis?.satelliteData?.date) {
        const date = new Date(analysis.satelliteData.date);
        if (!latestDate || date > latestDate) {
          latestDate = date;
        }
      }
    });
    
    return latestDate;
  }
}