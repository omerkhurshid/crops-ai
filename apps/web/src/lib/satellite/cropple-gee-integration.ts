/**
 * Complete Cropple.ai + Google Earth Engine Integration
 * 
 * This shows exactly how GEE data maps to your current dashboard metrics
 */

import { GoogleEarthEngineService } from './google-earth-engine-service'

export interface CroppleDashboardData {
  // Matches your current FarmSummary interface
  farmName: string
  totalAcres: number
  overallHealth: number        // 0-100 calculated from satellite
  healthTrend: number         // +/- calculated from historical NDVI
  stressedAreas: number       // % of pixels below stress threshold
  stressTrend: number         // Change in stressed area %
  yieldForecast: {
    current: number           // NDVI-based yield model
    potential: number         // Maximum based on growing conditions
    unit: string
    cropType: string
  }
  todayHighlights: string[]   // Generated from satellite insights
}

export class CroppleGEEService {
  private gee: GoogleEarthEngineService

  constructor(geeConfig: any) {
    this.gee = new GoogleEarthEngineService(geeConfig)
  }

  /**
   * Convert raw GEE satellite data into Cropple dashboard format
   */
  async getFarmDashboardData(farmId: string, fields: Array<{
    id: string
    name: string
    boundaries: number[][][]
    cropType: string
    acres: number
    plantingDate?: Date
  }>): Promise<CroppleDashboardData> {

    // 1. Get satellite data for all fields
    const fieldAnalyses = await Promise.all(
      fields.map(field => this.gee.analyzeFieldHealth({
        fieldId: field.id,
        geometry: { type: 'Polygon', coordinates: field.boundaries },
        startDate: this.getAnalysisStartDate(),
        endDate: new Date().toISOString().split('T')[0],
        cropType: field.cropType
      }))
    )

    // 2. Calculate farm-wide metrics
    const totalAcres = fields.reduce((sum, field) => sum + field.acres, 0)
    
    // Overall health: Area-weighted average of field health scores
    const overallHealth = this.calculateWeightedHealth(fieldAnalyses, fields)
    
    // Health trend: Compare current vs 30 days ago
    const healthTrend = this.calculateHealthTrend(fieldAnalyses)
    
    // Stressed areas: % of total farm area under stress
    const stressedAreas = this.calculateStressedAreas(fieldAnalyses, fields)
    
    // Stress trend: Change in stressed areas over time
    const stressTrend = this.calculateStressTrend(fieldAnalyses)
    
    // Yield forecast: NDVI-based prediction
    const yieldForecast = this.calculateYieldForecast(fieldAnalyses, fields)
    
    // Generate insights from satellite data
    const todayHighlights = this.generateTodayHighlights(fieldAnalyses, fields)

    return {
      farmName: `Farm ${farmId}`, // Get from database
      totalAcres,
      overallHealth: Math.round(overallHealth),
      healthTrend: Math.round(healthTrend * 10) / 10,
      stressedAreas: Math.round(stressedAreas * 10) / 10,
      stressTrend: Math.round(stressTrend * 10) / 10,
      yieldForecast,
      todayHighlights
    }
  }

  /**
   * Calculate area-weighted farm health from individual fields
   */
  private calculateWeightedHealth(analyses: any[], fields: any[]): number {
    let totalWeightedHealth = 0
    let totalWeight = 0

    analyses.forEach((analysis, index) => {
      const fieldAcres = fields[index].acres
      const fieldHealth = analysis.healthAssessment.score
      
      totalWeightedHealth += fieldHealth * fieldAcres
      totalWeight += fieldAcres
    })

    return totalWeight > 0 ? totalWeightedHealth / totalWeight : 0
  }

  /**
   * Calculate health trend from historical NDVI comparison
   */
  private calculateHealthTrend(analyses: any[]): number {
    const trends = analyses.map(analysis => {
      const currentNDVI = analysis.satelliteData.ndvi.mean
      const historicalNDVI = analysis.trends?.historicalPercentile || 50
      
      // Convert percentile to trend score
      if (historicalNDVI > 75) return 3      // Much better than historical
      if (historicalNDVI > 60) return 2      // Better than historical  
      if (historicalNDVI > 40) return 0      // Similar to historical
      if (historicalNDVI > 25) return -2     // Worse than historical
      return -3                              // Much worse than historical
    })

    return trends.reduce((sum: number, trend: number) => sum + trend, 0) / trends.length
  }

  /**
   * Calculate percentage of farm area under stress
   */
  private calculateStressedAreas(analyses: any[], fields: any[]): number {
    let totalStressedAcres = 0
    let totalAcres = 0

    analyses.forEach((analysis, index) => {
      const fieldAcres = fields[index].acres
      const stressLevel = analysis.healthAssessment.stressLevel
      
      // Consider 'moderate', 'high', 'severe' as stressed
      const stressMultiplier = this.getStressMultiplier(stressLevel)
      
      totalStressedAcres += fieldAcres * stressMultiplier
      totalAcres += fieldAcres
    })

    return totalAcres > 0 ? (totalStressedAcres / totalAcres) * 100 : 0
  }

  private getStressMultiplier(stressLevel: string): number {
    switch (stressLevel) {
      case 'none': return 0
      case 'low': return 0.2
      case 'moderate': return 0.6
      case 'high': return 0.9
      case 'severe': return 1.0
      default: return 0
    }
  }

  /**
   * Calculate change in stressed areas (simplified - would need historical data)
   */
  private calculateStressTrend(analyses: any[]): number {
    // In real implementation, compare with previous analysis
    // For now, estimate from NDVI trends
    const improvingFields = analyses.filter(a => a.trends?.seasonalTrend === 'improving').length
    const decliningFields = analyses.filter(a => a.trends?.seasonalTrend === 'declining').length
    
    return (improvingFields - decliningFields) * 0.5
  }

  /**
   * NDVI-based yield forecasting
   */
  private calculateYieldForecast(analyses: any[], fields: any[]): {
    current: number
    potential: number  
    unit: string
    cropType: string
  } {
    // Area-weighted average NDVI
    let totalWeightedNDVI = 0
    let totalWeight = 0
    const dominantCrop = 'Corn'

    analyses.forEach((analysis, index) => {
      const fieldAcres = fields[index].acres
      const fieldNDVI = analysis.satelliteData.ndvi.mean
      
      totalWeightedNDVI += fieldNDVI * fieldAcres
      totalWeight += fieldAcres
    })

    const avgNDVI = totalWeight > 0 ? totalWeightedNDVI / totalWeight : 0

    // Crop-specific yield models (based on research correlations)
    const yieldModel = this.getYieldModel(dominantCrop)
    const currentYield = this.ndviToYield(avgNDVI, yieldModel)
    const potentialYield = yieldModel.maxYield

    return {
      current: Math.round(currentYield),
      potential: Math.round(potentialYield),
      unit: yieldModel.unit,
      cropType: dominantCrop
    }
  }

  private getYieldModel(cropType: string) {
    const models = {
      'Corn': {
        // NDVI-yield correlation for corn
        baseYield: 120,    // bushels/acre at NDVI 0.5
        maxYield: 220,     // maximum possible yield
        unit: 'bu/acre',
        ndviCoeff: 200     // yield increase per NDVI unit
      },
      'Soybeans': {
        baseYield: 35,
        maxYield: 70,
        unit: 'bu/acre', 
        ndviCoeff: 80
      }
    }
    return models[cropType as keyof typeof models] || models['Corn']
  }

  private ndviToYield(ndvi: number, model: any): number {
    // Linear correlation model (simplified)
    const yieldValue = model.baseYield + (ndvi - 0.5) * model.ndviCoeff
    return Math.max(0, Math.min(yieldValue, model.maxYield))
  }

  /**
   * Generate farmer-friendly highlights from satellite data
   */
  private generateTodayHighlights(analyses: any[], fields: any[]): string[] {
    const highlights: string[] = []

    // Field performance highlights
    const bestField = this.getBestPerformingField(analyses, fields)
    if (bestField) {
      highlights.push(`${bestField.name} showing excellent growth (NDVI: ${bestField.ndvi.toFixed(2)})`)
    }

    // Trend highlights
    const improvingFields = analyses.filter(a => a.trends?.seasonalTrend === 'improving').length
    if (improvingFields > 0) {
      highlights.push(`${improvingFields} field${improvingFields > 1 ? 's' : ''} showing improvement`)
    }

    // Stress warnings
    const stressedFields = analyses.filter(a => 
      ['high', 'severe'].includes(a.healthAssessment.stressLevel)
    ).length
    if (stressedFields > 0) {
      highlights.push(`${stressedFields} field${stressedFields > 1 ? 's need' : ' needs'} attention`)
    }

    // Default positive message
    if (highlights.length === 0) {
      highlights.push('All fields showing stable conditions')
    }

    return highlights
  }

  private getBestPerformingField(analyses: any[], fields: any[]): {
    name: string
    ndvi: number
    score: number
  } | null {
    let bestField: { name: string; ndvi: number; score: number } | null = null
    let bestScore = 0

    analyses.forEach((analysis, index) => {
      const score = analysis.healthAssessment.score
      if (score > bestScore) {
        bestScore = score
        bestField = {
          name: fields[index].name,
          ndvi: analysis.satelliteData.ndvi.mean,
          score
        }
      }
    })

    return bestField
  }

  private getAnalysisStartDate(): string {
    const date = new Date()
    date.setDate(date.getDate() - 30) // 30 days ago
    return date.toISOString().split('T')[0]
  }
}

/**
 * Usage example for your existing dashboard
 */
export async function getCroppleDashboardData(farmId: string) {
  const croppleGEE = new CroppleGEEService({
    serviceAccountEmail: process.env.GEE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GEE_PRIVATE_KEY,
    projectId: process.env.GEE_PROJECT_ID
  })

  // Get farm fields from database
  const fields = await getFarmFields(farmId) // Your existing database call
  
  // Generate dashboard data from real satellite imagery
  return await croppleGEE.getFarmDashboardData(farmId, fields)
}

async function getFarmFields(farmId: string) {
  // Your existing database query
  return [
    {
      id: 'field1',
      name: 'North Field', 
      boundaries: [[[/* your polygon coordinates */]]],
      cropType: 'Corn',
      acres: 45,
      plantingDate: new Date('2024-04-15')
    }
    // ... more fields
  ]
}