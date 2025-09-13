// Advanced Recommendation Engine for Farm Management
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface RecommendationInput {
  farmId: string
  fieldId?: string
  currentDate?: Date
  userPreferences?: {
    riskTolerance: 'low' | 'medium' | 'high'
    budgetConstraints: 'tight' | 'moderate' | 'flexible'
    sustainabilityFocus: boolean
  }
}

export interface GeneratedRecommendation {
  type: 'fertilizer' | 'irrigation' | 'pest_control' | 'planting' | 'harvest' | 'financial' | 'equipment'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  actionRequired: string
  potentialImpact: string
  confidenceLevel: 'low' | 'medium' | 'high'
  estimatedCost?: number
  estimatedRoi?: number
  optimalTiming: Date
  expiresAt?: Date
  supportingData: Record<string, any>
}

export class RecommendationEngine {
  
  /**
   * Generate comprehensive recommendations for a farm
   */
  async generateRecommendations(input: RecommendationInput): Promise<GeneratedRecommendation[]> {
    const recommendations: GeneratedRecommendation[] = []
    
    // Get farm and field data
    const farmData = await this.getFarmData(input.farmId, input.fieldId)
    
    if (!farmData) {
      throw new Error('Farm data not found')
    }

    // Generate different types of recommendations
    const fertilityRecs = await this.generateFertilityRecommendations(farmData)
    const irrigationRecs = await this.generateIrrigationRecommendations(farmData)
    const pestRecs = await this.generatePestControlRecommendations(farmData)
    const financialRecs = await this.generateFinancialRecommendations(farmData)
    const timingRecs = await this.generateTimingRecommendations(farmData)
    
    recommendations.push(
      ...fertilityRecs,
      ...irrigationRecs,
      ...pestRecs,
      ...financialRecs,
      ...timingRecs
    )

    // Sort by priority and timing
    return this.prioritizeRecommendations(recommendations)
  }

  /**
   * Generate fertility and soil health recommendations
   */
  private async generateFertilityRecommendations(farmData: any): Promise<GeneratedRecommendation[]> {
    const recommendations: GeneratedRecommendation[] = []

    for (const field of farmData.fields) {
      // Get latest soil analysis
      const soilData = await prisma.soilAnalysis.findFirst({
        where: { fieldId: field.id },
        orderBy: { sampleDate: 'desc' }
      })

      if (!soilData) {
        recommendations.push({
          type: 'fertilizer',
          priority: 'medium',
          title: `Soil Test Needed for ${field.name}`,
          description: 'No recent soil analysis available for this field',
          actionRequired: 'Schedule soil testing to determine nutrient needs and pH levels',
          potentialImpact: 'Could optimize fertilizer costs by 15-25% and improve yields by 8-12%',
          confidenceLevel: 'high',
          estimatedCost: 150,
          estimatedRoi: 300,
          optimalTiming: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
          supportingData: { reason: 'no_soil_data', fieldId: field.id }
        })
        continue
      }

      // Check pH levels
      if (soilData.phLevel && (soilData.phLevel < 6.0 || soilData.phLevel > 7.5)) {
        recommendations.push({
          type: 'fertilizer',
          priority: soilData.phLevel < 5.5 || soilData.phLevel > 8.0 ? 'high' : 'medium',
          title: `pH Adjustment Needed in ${field.name}`,
          description: `Current pH is ${soilData.phLevel}, optimal range is 6.0-7.5 for most crops`,
          actionRequired: soilData.phLevel < 6.0 
            ? 'Apply agricultural lime to raise pH' 
            : 'Apply sulfur or acidifying fertilizer to lower pH',
          potentialImpact: 'Could improve nutrient uptake by 20-30% and yield by 10-15%',
          confidenceLevel: 'high',
          estimatedCost: soilData.phLevel < 6.0 ? 180 : 120,
          estimatedRoi: 450,
          optimalTiming: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
          supportingData: { 
            currentPH: soilData.phLevel, 
            targetPH: 6.5,
            fieldId: field.id,
            soilTestId: soilData.id
          }
        })
      }

      // Check nitrogen levels
      if (soilData.nitrogenPpm && soilData.nitrogenPpm < 20) {
        recommendations.push({
          type: 'fertilizer',
          priority: 'medium',
          title: `Nitrogen Application Recommended for ${field.name}`,
          description: `Current nitrogen level is ${soilData.nitrogenPpm} ppm, below optimal range`,
          actionRequired: 'Apply nitrogen fertilizer based on crop requirements and growth stage',
          potentialImpact: 'Could increase yield by 12-18% with proper timing',
          confidenceLevel: 'high',
          estimatedCost: 250,
          estimatedRoi: 680,
          optimalTiming: this.calculateOptimalNitrogenTiming(field),
          supportingData: { 
            currentNitrogen: soilData.nitrogenPpm,
            recommendedApplication: '150 lbs/acre',
            fieldId: field.id
          }
        })
      }
    }

    return recommendations
  }

  /**
   * Generate irrigation recommendations based on weather and soil moisture
   */
  private async generateIrrigationRecommendations(farmData: any): Promise<GeneratedRecommendation[]> {
    const recommendations: GeneratedRecommendation[] = []

    // Get weather forecast
    const weatherForecast = await this.getWeatherForecast(farmData.latitude, farmData.longitude)
    
    for (const field of farmData.fields) {
      const crop = field.crops?.find((c: any) => c.status === 'GROWING')
      
      if (crop) {
        // Check if irrigation is needed based on precipitation forecast
        const precipitationNext7Days = weatherForecast
          .slice(0, 7)
          .reduce((sum: number, day: any) => sum + (day.precipitation || 0), 0)

        if (precipitationNext7Days < 0.5) { // Less than 0.5 inches expected
          recommendations.push({
            type: 'irrigation',
            priority: precipitationNext7Days < 0.1 ? 'high' : 'medium',
            title: `Irrigation Needed for ${field.name}`,
            description: `Only ${precipitationNext7Days.toFixed(1)}" rain expected in next 7 days`,
            actionRequired: `Schedule irrigation for ${crop.cropType} - apply 1.0-1.5 inches`,
            potentialImpact: 'Prevents stress and maintains optimal yield potential',
            confidenceLevel: 'medium',
            estimatedCost: 45,
            optimalTiming: new Date(Date.now() + 48 * 60 * 60 * 1000), // In 2 days
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Expires in 5 days
            supportingData: {
              expectedPrecipitation: precipitationNext7Days,
              cropType: crop.cropType,
              growthStage: this.calculateGrowthStage(crop),
              fieldId: field.id
            }
          })
        }
      }
    }

    return recommendations
  }

  /**
   * Generate pest and disease control recommendations
   */
  private async generatePestControlRecommendations(farmData: any): Promise<GeneratedRecommendation[]> {
    const recommendations: GeneratedRecommendation[] = []

    for (const field of farmData.fields) {
      const crop = field.crops?.find((c: any) => c.status === 'GROWING')
      
      if (crop) {
        const growthStage = this.calculateGrowthStage(crop)
        const riskLevel = this.assessPestRisk(crop.cropType, growthStage, farmData.region)

        if (riskLevel === 'high') {
          recommendations.push({
            type: 'pest_control',
            priority: 'high',
            title: `Pest Monitoring Alert for ${field.name}`,
            description: `${crop.cropType} at ${growthStage} stage is at high risk for pest pressure`,
            actionRequired: 'Increase scouting frequency and prepare preventive treatments if needed',
            potentialImpact: 'Early detection could prevent 5-15% yield loss',
            confidenceLevel: 'medium',
            estimatedCost: 120,
            estimatedRoi: 400,
            optimalTiming: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            supportingData: {
              cropType: crop.cropType,
              growthStage,
              riskFactors: ['weather_conditions', 'growth_stage', 'historical_pressure'],
              fieldId: field.id
            }
          })
        }
      }
    }

    return recommendations
  }

  /**
   * Generate financial optimization recommendations
   */
  private async generateFinancialRecommendations(farmData: any): Promise<GeneratedRecommendation[]> {
    const recommendations: GeneratedRecommendation[] = []

    // Analyze recent transactions
    const recentTransactions = await prisma.financialTransaction.findMany({
      where: { farmId: farmData.id },
      orderBy: { date: 'desc' },
      take: 50
    })

    // Check for potential cost savings opportunities
    const inputCosts = recentTransactions
      .filter(t => t.category === 'INPUT_COST')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    if (inputCosts > 500) { // If significant input costs
      recommendations.push({
        type: 'financial',
        priority: 'medium',
        title: 'Input Cost Optimization Opportunity',
        description: `$${inputCosts.toFixed(0)} spent on inputs recently - potential for bulk purchasing savings`,
        actionRequired: 'Review upcoming input needs and consider bulk purchasing or cooperative buying',
        potentialImpact: 'Could save 8-15% on input costs through better purchasing strategies',
        confidenceLevel: 'medium',
        estimatedRoi: inputCosts * 0.12, // 12% savings
        optimalTiming: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next month
        supportingData: {
          currentInputSpend: inputCosts,
          potentialSavings: inputCosts * 0.12,
          farmId: farmData.id
        }
      })
    }

    return recommendations
  }

  /**
   * Generate timing-based recommendations (planting, harvest, etc.)
   */
  private async generateTimingRecommendations(farmData: any): Promise<GeneratedRecommendation[]> {
    const recommendations: GeneratedRecommendation[] = []

    for (const field of farmData.fields) {
      const crops = field.crops || []
      
      for (const crop of crops) {
        if (crop.status === 'GROWING') {
          const daysUntilHarvest = this.calculateDaysUntilHarvest(crop)
          
          if (daysUntilHarvest <= 14 && daysUntilHarvest > 0) {
            recommendations.push({
              type: 'harvest',
              priority: daysUntilHarvest <= 7 ? 'high' : 'medium',
              title: `Harvest Preparation for ${field.name}`,
              description: `${crop.cropType} will be ready for harvest in approximately ${daysUntilHarvest} days`,
              actionRequired: 'Schedule harvest equipment and labor, check storage capacity',
              potentialImpact: 'Timely harvest ensures maximum quality and yield',
              confidenceLevel: 'high',
              optimalTiming: new Date(crop.expectedHarvestDate),
              supportingData: {
                cropType: crop.cropType,
                expectedHarvest: crop.expectedHarvestDate,
                fieldId: field.id,
                cropId: crop.id
              }
            })
          }
        }
      }
    }

    return recommendations
  }

  /**
   * Save recommendations to database
   */
  async saveRecommendations(farmId: string, recommendations: GeneratedRecommendation[]): Promise<void> {
    // Clear old recommendations
    await prisma.recommendation.updateMany({
      where: { 
        farmId,
        status: 'active'
      },
      data: { status: 'expired' }
    })

    // Save new recommendations
    for (const rec of recommendations) {
      await prisma.recommendation.create({
        data: {
          farmId: rec.supportingData?.fieldId ? undefined : farmId,
          fieldId: rec.supportingData?.fieldId || undefined,
          recommendationType: rec.type,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          actionRequired: rec.actionRequired,
          potentialImpact: rec.potentialImpact,
          confidenceLevel: rec.confidenceLevel,
          estimatedCost: rec.estimatedCost,
          estimatedRoi: rec.estimatedRoi,
          optimalTiming: rec.optimalTiming,
          expiresAt: rec.expiresAt,
          status: 'active'
        }
      })
    }
  }

  // Helper methods
  private async getFarmData(farmId: string, fieldId?: string) {
    return await prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        fields: {
          where: fieldId ? { id: fieldId } : undefined,
          include: {
            crops: {
              where: { status: { in: ['PLANTED', 'GROWING'] } }
            },
            soilAnalyses: {
              orderBy: { sampleDate: 'desc' },
              take: 1
            }
          }
        }
      }
    })
  }

  private async getWeatherForecast(lat: number, lng: number) {
    // Placeholder for weather API integration
    // In production, integrate with weather service like OpenWeatherMap
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temperature: 75 + Math.random() * 20,
      precipitation: Math.random() * 0.5,
      humidity: 60 + Math.random() * 30
    }))
  }

  private calculateOptimalNitrogenTiming(field: any): Date {
    // Simplified timing calculation
    // In production, consider crop type, growth stage, weather, etc.
    return new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
  }

  private calculateGrowthStage(crop: any): string {
    const plantingDate = new Date(crop.plantingDate)
    const daysFromPlanting = Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysFromPlanting < 14) return 'seedling'
    if (daysFromPlanting < 45) return 'vegetative'
    if (daysFromPlanting < 75) return 'reproductive'
    if (daysFromPlanting < 120) return 'maturation'
    return 'mature'
  }

  private assessPestRisk(cropType: string, growthStage: string, region: string): 'low' | 'medium' | 'high' {
    // Simplified risk assessment
    // In production, use historical data, weather patterns, and pest models
    if (growthStage === 'reproductive' && ['corn', 'soybeans'].includes(cropType.toLowerCase())) {
      return 'high'
    }
    return 'medium'
  }

  private calculateDaysUntilHarvest(crop: any): number {
    const harvestDate = new Date(crop.expectedHarvestDate)
    return Math.ceil((harvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  private prioritizeRecommendations(recommendations: GeneratedRecommendation[]): GeneratedRecommendation[] {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    
    return recommendations.sort((a, b) => {
      // Sort by priority first
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      
      // Then by optimal timing (sooner first)
      return a.optimalTiming.getTime() - b.optimalTiming.getTime()
    })
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine()