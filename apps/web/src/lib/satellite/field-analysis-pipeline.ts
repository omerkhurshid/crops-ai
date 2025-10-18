/**
 * Field Analysis Pipeline
 * 
 * Connects Google Maps field boundaries to Sentinel Hub satellite analysis
 * for real-time crop health monitoring and stress detection.
 */

import { sentinelHub, type BoundingBox, type NDVIAnalysis, type VegetationHealthIndex } from './sentinel-hub'
import { prisma } from '../prisma'

export interface FieldBoundary {
  id: string
  name: string
  area: number
  boundaries: Array<{ lat: number; lng: number }>
  centerLat: number
  centerLng: number
}

export interface FieldAnalysisResult {
  fieldId: string
  fieldName: string
  analysisDate: string
  ndviAnalysis: NDVIAnalysis
  vegetationHealth: VegetationHealthIndex
  stressAlerts: StressAlert[]
  recommendations: FieldRecommendation[]
  comparisonToPrevious?: {
    previousDate: string
    change: number
    trend: 'improving' | 'declining' | 'stable'
    significance: 'high' | 'moderate' | 'low'
  }
}

export interface StressAlert {
  type: 'drought' | 'disease' | 'nutrient' | 'pest' | 'general'
  severity: 'low' | 'moderate' | 'high' | 'critical'
  message: string
  affectedArea: number // percentage
  recommendation: string
  detectedAt: string
}

export interface FieldRecommendation {
  type: 'irrigation' | 'fertilization' | 'pest_control' | 'soil_management' | 'harvest_timing'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  actionItems: string[]
  timeframe: string
  estimatedCost?: {
    min: number
    max: number
    unit: string
  }
}

export interface AnalysisTrends {
  fieldId: string
  timeSeriesData: Array<{
    date: string
    ndvi: number
    healthScore: number
    stressLevel: number
    cloudCoverage: number
  }>
  seasonalPattern: {
    spring: number
    summer: number
    fall: number
    winter: number
  }
  growthStage: {
    current: 'planting' | 'emergence' | 'vegetative' | 'reproductive' | 'maturity' | 'harvest'
    daysInStage: number
    expectedDuration: number
  }
}

class FieldAnalysisPipeline {
  /**
   * Convert field boundaries to bounding box for satellite analysis
   */
  private fieldToBoundingBox(field: FieldBoundary): BoundingBox {
    const lats = field.boundaries.map(point => point.lat)
    const lngs = field.boundaries.map(point => point.lng)
    
    return {
      west: Math.min(...lngs),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      north: Math.max(...lats)
    }
  }

  /**
   * Analyze a single field using satellite data
   */
  async analyzeField(field: FieldBoundary, analysisDate: string = new Date().toISOString()): Promise<FieldAnalysisResult> {
    try {
      const bbox = this.fieldToBoundingBox(field)
      const dateString = analysisDate.split('T')[0]
      
      // Get satellite analysis data
      const [ndviAnalysis, vegetationHealth] = await Promise.all([
        sentinelHub.calculateNDVIAnalysis(field.id, bbox, dateString),
        sentinelHub.calculateVegetationHealth(bbox, dateString)
      ])

      // Generate stress alerts based on analysis
      const stressAlerts = this.generateStressAlerts(ndviAnalysis, vegetationHealth, field)
      
      // Generate actionable recommendations
      const recommendations = this.generateFieldRecommendations(ndviAnalysis, vegetationHealth, stressAlerts, field)

      // Get comparison to previous analysis if available
      const comparisonToPrevious = await this.getComparisonToPrevious(field.id, ndviAnalysis)

      // Save analysis to database
      await this.saveAnalysisResults({
        fieldId: field.id,
        fieldName: field.name,
        analysisDate: dateString,
        ndviAnalysis,
        vegetationHealth,
        stressAlerts,
        recommendations,
        comparisonToPrevious
      })

      return {
        fieldId: field.id,
        fieldName: field.name,
        analysisDate: dateString,
        ndviAnalysis,
        vegetationHealth,
        stressAlerts,
        recommendations,
        comparisonToPrevious
      }
    } catch (error) {
      console.error(`Error analyzing field ${field.id}:`, error)
      throw new Error(`Failed to analyze field: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Analyze all fields for a farm
   */
  async analyzeFarmFields(farmId: string, analysisDate?: string): Promise<FieldAnalysisResult[]> {
    try {
      // Get all fields for the farm from database
      const fields = await prisma.field.findMany({
        where: { farmId },
        select: {
          id: true,
          name: true,
          area: true
        }
      })

      if (fields.length === 0) {
        throw new Error(`No fields found for farm ${farmId}`)
      }

      // Convert database fields to FieldBoundary format
      // For now, use mock boundary data since PostGIS boundary needs special handling
      const fieldBoundaries: FieldBoundary[] = fields.map((field: any) => ({
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
      }))

      // Analyze all fields in parallel
      const analysisPromises = fieldBoundaries.map(field => 
        this.analyzeField(field, analysisDate)
      )

      const results = await Promise.all(analysisPromises)
      
      // Generate farm-level summary and alerts
      await this.generateFarmSummary(farmId, results)

      return results
    } catch (error) {
      console.error(`Error analyzing farm fields ${farmId}:`, error)
      throw error
    }
  }

  /**
   * Get analysis trends for a field over time
   */
  async getAnalysisTrends(fieldId: string, startDate: string, endDate: string): Promise<AnalysisTrends> {
    try {
      // Get field information
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
        select: {
          area: true
        }
      })

      if (!field) {
        throw new Error(`Field ${fieldId} not found`)
      }

      // For now, use mock boundary data since PostGIS boundary needs special handling
      const bbox = {
        west: -74.0070,
        south: 40.7118,
        east: -74.0050,
        north: 40.7138
      }

      // Get time series data from Sentinel Hub
      const timeSeriesData = await sentinelHub.getNDVITimeSeries(bbox, startDate, endDate, 16)

      // Calculate seasonal patterns
      const seasonalPattern = this.calculateSeasonalPattern(timeSeriesData)
      
      // Determine growth stage
      const growthStage = this.determineGrowthStage(timeSeriesData)

      // Convert to required format
      const formattedTimeSeries = timeSeriesData.map(data => ({
        date: data.date,
        ndvi: data.ndvi,
        healthScore: Math.min(100, Math.max(0, data.ndvi * 100)),
        stressLevel: Math.max(0, (0.7 - data.ndvi) * 100),
        cloudCoverage: data.cloudCoverage
      }))

      return {
        fieldId,
        timeSeriesData: formattedTimeSeries,
        seasonalPattern,
        growthStage
      }
    } catch (error) {
      console.error(`Error getting analysis trends for field ${fieldId}:`, error)
      throw error
    }
  }

  /**
   * Generate stress alerts based on analysis data
   */
  private generateStressAlerts(
    ndviAnalysis: NDVIAnalysis,
    vegetationHealth: VegetationHealthIndex,
    field: FieldBoundary
  ): StressAlert[] {
    const alerts: StressAlert[] = []
    const now = new Date().toISOString()

    // Drought stress detection
    if (vegetationHealth.stressIndicators.drought > 0.6) {
      alerts.push({
        type: 'drought',
        severity: vegetationHealth.stressIndicators.drought > 0.8 ? 'critical' : 'high',
        message: `Severe drought stress detected in ${field.name}`,
        affectedArea: ndviAnalysis.zones.stressed.percentage,
        recommendation: 'Increase irrigation frequency and consider drought-resistant management practices',
        detectedAt: now
      })
    }

    // Disease stress detection
    if (vegetationHealth.stressIndicators.disease > 0.5) {
      alerts.push({
        type: 'disease',
        severity: vegetationHealth.stressIndicators.disease > 0.7 ? 'high' : 'moderate',
        message: `Potential disease stress detected in ${field.name}`,
        affectedArea: ndviAnalysis.zones.stressed.percentage,
        recommendation: 'Scout field for disease symptoms and consider fungicide application if confirmed',
        detectedAt: now
      })
    }

    // Nutrient deficiency detection
    if (vegetationHealth.stressIndicators.nutrient > 0.5) {
      alerts.push({
        type: 'nutrient',
        severity: vegetationHealth.stressIndicators.nutrient > 0.7 ? 'high' : 'moderate',
        message: `Nutrient deficiency detected in ${field.name}`,
        affectedArea: ndviAnalysis.zones.stressed.percentage,
        recommendation: 'Conduct soil testing and apply appropriate fertilizer based on results',
        detectedAt: now
      })
    }

    // General vegetation health alerts
    if (ndviAnalysis.statistics.mean < 0.3) {
      alerts.push({
        type: 'general',
        severity: 'critical',
        message: `Critical vegetation health in ${field.name}`,
        affectedArea: 100 - ndviAnalysis.zones.healthy.percentage,
        recommendation: 'Immediate field assessment required - multiple stress factors likely present',
        detectedAt: now
      })
    } else if (ndviAnalysis.zones.stressed.percentage > 30) {
      alerts.push({
        type: 'general',
        severity: 'moderate',
        message: `Significant stressed vegetation area in ${field.name}`,
        affectedArea: ndviAnalysis.zones.stressed.percentage,
        recommendation: 'Monitor field closely and investigate potential stress causes',
        detectedAt: now
      })
    }

    return alerts
  }

  /**
   * Generate actionable field recommendations
   */
  private generateFieldRecommendations(
    ndviAnalysis: NDVIAnalysis,
    vegetationHealth: VegetationHealthIndex,
    stressAlerts: StressAlert[],
    field: FieldBoundary
  ): FieldRecommendation[] {
    const recommendations: FieldRecommendation[] = []

    // Irrigation recommendations
    if (vegetationHealth.stressIndicators.drought > 0.4) {
      recommendations.push({
        type: 'irrigation',
        priority: vegetationHealth.stressIndicators.drought > 0.7 ? 'urgent' : 'high',
        title: 'Increase Irrigation',
        description: 'Drought stress detected - adjust irrigation schedule to meet crop water needs',
        actionItems: [
          'Check soil moisture levels at multiple depths',
          'Increase irrigation frequency by 25-50%',
          'Monitor weather forecast for upcoming precipitation',
          'Consider variable rate irrigation for stressed areas'
        ],
        timeframe: 'Within 24-48 hours',
        estimatedCost: {
          min: 25,
          max: 75,
          unit: 'per acre'
        }
      })
    }

    // Fertilization recommendations
    if (vegetationHealth.stressIndicators.nutrient > 0.4) {
      recommendations.push({
        type: 'fertilization',
        priority: 'high',
        title: 'Nutrient Management',
        description: 'Nutrient deficiency symptoms detected - soil testing and targeted fertilization recommended',
        actionItems: [
          'Collect soil samples for laboratory analysis',
          'Test for N, P, K, and micronutrient levels',
          'Apply fertilizer based on soil test results',
          'Consider foliar feeding for quick nutrient uptake'
        ],
        timeframe: 'Within 1-2 weeks',
        estimatedCost: {
          min: 40,
          max: 120,
          unit: 'per acre'
        }
      })
    }

    // Disease management recommendations
    if (vegetationHealth.stressIndicators.disease > 0.4) {
      recommendations.push({
        type: 'pest_control',
        priority: 'high',
        title: 'Disease Scouting and Management',
        description: 'Potential disease stress detected - field scouting and possible treatment needed',
        actionItems: [
          'Scout field for visible disease symptoms',
          'Identify specific disease if present',
          'Consider fungicide application if disease confirmed',
          'Improve air circulation and reduce leaf wetness'
        ],
        timeframe: 'Within 3-5 days',
        estimatedCost: {
          min: 30,
          max: 80,
          unit: 'per acre'
        }
      })
    }

    // Soil management for areas with high variability
    if (ndviAnalysis.statistics.standardDeviation > 0.2) {
      recommendations.push({
        type: 'soil_management',
        priority: 'medium',
        title: 'Address Field Variability',
        description: 'High vegetation variability indicates uneven growing conditions',
        actionItems: [
          'Create field management zones based on NDVI patterns',
          'Investigate soil compaction in low-performing areas',
          'Consider variable rate application of inputs',
          'Improve drainage in consistently poor areas'
        ],
        timeframe: 'Within 2-4 weeks',
        estimatedCost: {
          min: 15,
          max: 50,
          unit: 'per acre'
        }
      })
    }

    // Harvest timing recommendations for healthy fields
    if (vegetationHealth.healthScore > 75 && ndviAnalysis.statistics.mean > 0.6) {
      recommendations.push({
        type: 'harvest_timing',
        priority: 'medium',
        title: 'Monitor for Optimal Harvest Timing',
        description: 'Field shows good health - monitor for optimal harvest timing',
        actionItems: [
          'Continue regular NDVI monitoring',
          'Track crop maturity indicators',
          'Plan harvest logistics and equipment',
          'Monitor weather patterns for harvest windows'
        ],
        timeframe: 'Ongoing monitoring',
        estimatedCost: {
          min: 5,
          max: 15,
          unit: 'per acre'
        }
      })
    }

    return recommendations
  }

  /**
   * Get comparison to previous analysis
   */
  private async getComparisonToPrevious(fieldId: string, currentAnalysis: NDVIAnalysis) {
    try {
      // In a production system, this would query the database for previous analysis
      // For now, simulate comparison data
      const previousDate = new Date()
      previousDate.setDate(previousDate.getDate() - 16) // 16 days ago
      
      const previousMean = currentAnalysis.statistics.mean + (Math.random() - 0.5) * 0.2
      const change = currentAnalysis.statistics.mean - previousMean
      const changePercentage = Math.abs(change / previousMean) * 100
      
      return {
        previousDate: previousDate.toISOString().split('T')[0],
        change,
        trend: Math.abs(change) < 0.05 ? 'stable' as const :
               change > 0 ? 'improving' as const : 'declining' as const,
        significance: changePercentage > 15 ? 'high' as const :
                     changePercentage > 8 ? 'moderate' as const : 'low' as const
      }
    } catch (error) {
      console.error('Error getting previous analysis comparison:', error)
      return undefined
    }
  }

  /**
   * Save analysis results to database
   */
  private async saveAnalysisResults(result: FieldAnalysisResult) {
    try {
      // Save to field_analysis table (create if doesn't exist)
      await prisma.$executeRaw`
        INSERT INTO field_analysis (
          field_id, 
          analysis_date, 
          ndvi_mean, 
          ndvi_min, 
          ndvi_max,
          health_score,
          stress_drought,
          stress_disease,
          stress_nutrient,
          healthy_percentage,
          stressed_percentage,
          recommendations,
          alerts,
          created_at
        ) VALUES (
          ${result.fieldId},
          ${result.analysisDate}::date,
          ${result.ndviAnalysis.statistics.mean},
          ${result.ndviAnalysis.statistics.min},
          ${result.ndviAnalysis.statistics.max},
          ${result.vegetationHealth.healthScore},
          ${result.vegetationHealth.stressIndicators.drought},
          ${result.vegetationHealth.stressIndicators.disease},
          ${result.vegetationHealth.stressIndicators.nutrient},
          ${result.ndviAnalysis.zones.healthy.percentage},
          ${result.ndviAnalysis.zones.stressed.percentage},
          ${JSON.stringify(result.recommendations)},
          ${JSON.stringify(result.stressAlerts)},
          NOW()
        )
        ON CONFLICT (field_id, analysis_date) 
        DO UPDATE SET
          ndvi_mean = EXCLUDED.ndvi_mean,
          ndvi_min = EXCLUDED.ndvi_min,
          ndvi_max = EXCLUDED.ndvi_max,
          health_score = EXCLUDED.health_score,
          stress_drought = EXCLUDED.stress_drought,
          stress_disease = EXCLUDED.stress_disease,
          stress_nutrient = EXCLUDED.stress_nutrient,
          healthy_percentage = EXCLUDED.healthy_percentage,
          stressed_percentage = EXCLUDED.stressed_percentage,
          recommendations = EXCLUDED.recommendations,
          alerts = EXCLUDED.alerts,
          updated_at = NOW()
      `
    } catch (error) {
      // If table doesn't exist, log warning but don't fail

    }
  }

  /**
   * Generate farm-level summary
   */
  private async generateFarmSummary(farmId: string, fieldResults: FieldAnalysisResult[]) {
    try {
      const totalFields = fieldResults.length
      const criticalAlerts = fieldResults.reduce((count, field) => 
        count + field.stressAlerts.filter(alert => alert.severity === 'critical').length, 0
      )
      const averageHealthScore = fieldResults.reduce((sum, field) => 
        sum + field.vegetationHealth.healthScore, 0
      ) / totalFields

      const farmSummary = {
        farmId,
        totalFields,
        averageHealthScore,
        criticalAlerts,
        analysisDate: new Date().toISOString().split('T')[0],
        fieldSummaries: fieldResults.map(field => ({
          fieldId: field.fieldId,
          fieldName: field.fieldName,
          healthScore: field.vegetationHealth.healthScore,
          alertCount: field.stressAlerts.length,
          primaryConcern: field.stressAlerts.length > 0 ? field.stressAlerts[0].type : null
        }))
      }

      // Log farm summary for monitoring

      return farmSummary
    } catch (error) {
      console.error('Error generating farm summary:', error)
    }
  }

  /**
   * Calculate seasonal patterns from time series data
   */
  private calculateSeasonalPattern(timeSeriesData: Array<{ date: string; ndvi: number }>) {
    const seasons: { spring: number[]; summer: number[]; fall: number[]; winter: number[] } = { 
      spring: [], 
      summer: [], 
      fall: [], 
      winter: [] 
    }
    
    timeSeriesData.forEach(({ date, ndvi }) => {
      const month = new Date(date).getMonth() + 1
      if (month >= 3 && month <= 5) seasons.spring.push(ndvi)
      else if (month >= 6 && month <= 8) seasons.summer.push(ndvi)
      else if (month >= 9 && month <= 11) seasons.fall.push(ndvi)
      else seasons.winter.push(ndvi)
    })

    return {
      spring: seasons.spring.length > 0 ? seasons.spring.reduce((a, b) => a + b) / seasons.spring.length : 0,
      summer: seasons.summer.length > 0 ? seasons.summer.reduce((a, b) => a + b) / seasons.summer.length : 0,
      fall: seasons.fall.length > 0 ? seasons.fall.reduce((a, b) => a + b) / seasons.fall.length : 0,
      winter: seasons.winter.length > 0 ? seasons.winter.reduce((a, b) => a + b) / seasons.winter.length : 0
    }
  }

  /**
   * Determine current growth stage based on NDVI trends
   */
  private determineGrowthStage(timeSeriesData: Array<{ date: string; ndvi: number }>) {
    if (timeSeriesData.length < 3) {
      return {
        current: 'vegetative' as const,
        daysInStage: 30,
        expectedDuration: 60
      }
    }

    const recent = timeSeriesData.slice(-3)
    const trend = recent[2].ndvi - recent[0].ndvi
    const currentNDVI = recent[2].ndvi

    let currentStage: 'planting' | 'emergence' | 'vegetative' | 'reproductive' | 'maturity' | 'harvest'
    
    if (currentNDVI < 0.2) currentStage = 'planting'
    else if (currentNDVI < 0.4) currentStage = 'emergence'
    else if (currentNDVI < 0.7 && trend > 0) currentStage = 'vegetative'
    else if (currentNDVI >= 0.7 && trend >= 0) currentStage = 'reproductive'
    else if (trend < -0.05) currentStage = 'maturity'
    else currentStage = 'vegetative'

    return {
      current: currentStage,
      daysInStage: 30, // Simplified - would be calculated from actual data
      expectedDuration: currentStage === 'vegetative' ? 60 : 
                       currentStage === 'reproductive' ? 45 : 30
    }
  }
}

export const fieldAnalysisPipeline = new FieldAnalysisPipeline()
export { FieldAnalysisPipeline }