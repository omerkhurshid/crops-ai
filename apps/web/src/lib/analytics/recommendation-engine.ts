// Advanced Knowledge-Driven Recommendation Engine for Farm Management
import { PrismaClient } from '@prisma/client'
import {
  getCropKnowledge,
  getLivestockKnowledge,
  getBenchmarkYield,
  getCurrentGrowthStage,
  getPestRiskLevel,
  getOptimalSellMonth,
  shouldStoreForBetterPrice,
  CROP_KNOWLEDGE_BASE,
  LIVESTOCK_KNOWLEDGE_BASE
} from './agricultural-knowledge-base'

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
   * Generate crop-specific fertility and soil health recommendations using agricultural knowledge base
   */
  private async generateFertilityRecommendations(farmData: any): Promise<GeneratedRecommendation[]> {
    const recommendations: GeneratedRecommendation[] = []

    for (const field of farmData.fields) {
      const crop = field.crops?.find((c: any) => c.status === 'GROWING' || c.status === 'PLANTED')
      
      if (!crop) {
        // No crop planted - suggest soil testing for next season
        recommendations.push({
          type: 'fertilizer',
          priority: 'medium',
          title: `Soil Test Before Next Planting - ${field.name}`,
          description: 'No active crops detected. Test soil to optimize next season\'s fertility program.',
          actionRequired: 'Schedule comprehensive soil test including pH, N-P-K, organic matter, and micronutrients',
          potentialImpact: 'Proper soil management can increase yields by 15-25% and reduce input costs by 20%',
          confidenceLevel: 'high',
          estimatedCost: 150,
          estimatedRoi: 500,
          optimalTiming: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          supportingData: { reason: 'no_active_crop', fieldId: field.id }
        })
        continue
      }

      const cropKnowledge = getCropKnowledge(crop.cropType)
      if (!cropKnowledge) continue

      const daysFromPlanting = Math.floor((Date.now() - new Date(crop.plantingDate).getTime()) / (1000 * 60 * 60 * 24))
      const growthStage = getCurrentGrowthStage(crop.cropType, daysFromPlanting)

      // Get current nutrition needs based on growth stage
      const currentNutritionNeeds = cropKnowledge.nutritionNeeds.find(n => 
        growthStage.includes(n.stage) || growthStage.toLowerCase().includes(n.stage.toLowerCase())
      )

      // Get latest soil analysis
      const soilData = await prisma.soilAnalysis.findFirst({
        where: { fieldId: field.id },
        orderBy: { sampleDate: 'desc' }
      })

      if (!soilData) {
        recommendations.push({
          type: 'fertilizer',
          priority: currentNutritionNeeds?.criticalPeriod ? 'high' : 'medium',
          title: `Urgent: Soil Test Needed for ${crop.cropType} in ${field.name}`,
          description: `${crop.cropType} at ${growthStage} stage needs specific nutrient management. No soil data available.`,
          actionRequired: 'Schedule immediate soil testing to determine nutrient needs for current growth stage',
          potentialImpact: `Critical period for ${crop.cropType} nutrition. Proper management can improve yield by 20-30%`,
          confidenceLevel: 'high',
          estimatedCost: 150,
          estimatedRoi: crop.cropType.toLowerCase() === 'corn' ? 800 : 600,
          optimalTiming: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days for urgent
          supportingData: { 
            reason: 'no_soil_data_active_crop', 
            fieldId: field.id,
            cropType: crop.cropType,
            growthStage,
            criticalPeriod: currentNutritionNeeds?.criticalPeriod
          }
        })
        continue
      }

      // Crop-specific pH recommendations
      let optimalPhRange = [6.0, 7.0] // default
      if (crop.cropType.toLowerCase() === 'corn') optimalPhRange = [6.0, 6.8]
      if (crop.cropType.toLowerCase().includes('soybean')) optimalPhRange = [6.0, 7.0]

      if (soilData.phLevel && (Number(soilData.phLevel) < optimalPhRange[0] || Number(soilData.phLevel) > optimalPhRange[1])) {
        const impact = crop.cropType.toLowerCase() === 'corn' ? 
          'Corn yields can drop 10-20% with improper pH. Nutrient availability severely affected.' :
          'Soybean nodulation and yield significantly impacted by pH outside optimal range.'

        recommendations.push({
          type: 'fertilizer',
          priority: 'high',
          title: `pH Correction Needed for ${crop.cropType} - ${field.name}`,
          description: `Current pH is ${soilData.phLevel}, ${crop.cropType} needs ${optimalPhRange[0]}-${optimalPhRange[1]}`,
          actionRequired: Number(soilData.phLevel) < optimalPhRange[0] 
            ? `Apply ${crop.cropType.toLowerCase() === 'corn' ? '2-3 tons' : '1.5-2 tons'} lime per acre` 
            : 'Apply sulfur to lower pH - consult agronomist for rate',
          potentialImpact: impact,
          confidenceLevel: 'high',
          estimatedCost: Number(soilData.phLevel) < optimalPhRange[0] ? 200 : 150,
          estimatedRoi: 600,
          optimalTiming: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          supportingData: { 
            currentPH: Number(soilData.phLevel), 
            optimalRange: optimalPhRange,
            cropSpecific: true,
            fieldId: field.id
          }
        })
      }

      // Growth stage-specific nutrient recommendations
      if (currentNutritionNeeds && currentNutritionNeeds.criticalPeriod) {
        const nitrogenDeficit = Math.max(0, currentNutritionNeeds.nitrogen - (Number(soilData.nitrogenPpm) || 0))
        
        if (nitrogenDeficit > 20) {
          recommendations.push({
            type: 'fertilizer',
            priority: 'urgent',
            title: `Critical N Application - ${crop.cropType} ${growthStage}`,
            description: `${crop.cropType} at ${growthStage} is in critical nitrogen demand period. Soil N is ${Number(soilData.nitrogenPpm)} ppm, needs ${currentNutritionNeeds.nitrogen} ppm.`,
            actionRequired: `Apply ${Math.round(nitrogenDeficit * 1.2)} lbs N/acre immediately. Use UAN or ammonium sulfate for quick uptake.`,
            potentialImpact: `Critical timing - delay could reduce yield by 15-25%. Each day matters at this stage.`,
            confidenceLevel: 'high',
            estimatedCost: nitrogenDeficit * 0.65, // ~$0.65 per lb N
            estimatedRoi: nitrogenDeficit * 3.5, // Strong ROI in critical period
            optimalTiming: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow!
            supportingData: {
              currentNitrogen: Number(soilData.nitrogenPpm),
              requiredNitrogen: currentNutritionNeeds.nitrogen,
              deficit: nitrogenDeficit,
              growthStage,
              criticalWindow: true
            }
          })
        }
      }

      // Benchmark yield comparison and fertility optimization
      const benchmarkYield = getBenchmarkYield(crop.cropType, farmData.region || farmData.address || 'National')
      if (benchmarkYield && crop.yield) {
        const yieldGap = benchmarkYield - crop.yield
        if (yieldGap > benchmarkYield * 0.15) { // More than 15% below benchmark
          recommendations.push({
            type: 'fertilizer',
            priority: 'medium',
            title: `Yield Gap Analysis - ${field.name}`,
            description: `Your ${crop.cropType} yield (${crop.yield} bu/acre) is ${Math.round(yieldGap)} bu/acre below regional average (${benchmarkYield} bu/acre)`,
            actionRequired: 'Consider soil test, tissue analysis, and fertility program review. Focus on balanced N-P-K management.',
            potentialImpact: `Closing yield gap could increase revenue by $${Math.round(yieldGap * 4.5)} per acre`,
            confidenceLevel: 'medium',
            estimatedCost: 300, // Comprehensive soil + tissue test + consultation
            estimatedRoi: yieldGap * 4.5,
            optimalTiming: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            supportingData: {
              currentYield: crop.yield,
              benchmarkYield,
              yieldGap,
              potentialRevenue: yieldGap * 4.5
            }
          })
        }
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
   * Generate knowledge-based pest and disease control recommendations
   */
  private async generatePestControlRecommendations(farmData: any): Promise<GeneratedRecommendation[]> {
    const recommendations: GeneratedRecommendation[] = []

    for (const field of farmData.fields) {
      const crop = field.crops?.find((c: any) => c.status === 'GROWING' || c.status === 'PLANTED')
      
      if (!crop) continue

      const cropKnowledge = getCropKnowledge(crop.cropType)
      if (!cropKnowledge) continue

      const daysFromPlanting = Math.floor((Date.now() - new Date(crop.plantingDate).getTime()) / (1000 * 60 * 60 * 24))
      const growthStage = getCurrentGrowthStage(crop.cropType, daysFromPlanting)
      const riskLevel = getPestRiskLevel(crop.cropType, daysFromPlanting, farmData.region || farmData.address || 'Midwest')

      // Generate specific pest recommendations based on knowledge base
      for (const pestInfo of cropKnowledge.pestCalendar) {
        if (this.isPestRiskPeriod(pestInfo.riskPeriod, daysFromPlanting)) {
          const isRegionMatch = pestInfo.region.some(r => 
            (farmData.region || farmData.address || 'midwest').toLowerCase().includes(r.toLowerCase())
          )

          if (isRegionMatch || pestInfo.region.includes('All')) {
            const priority = pestInfo.severity === 'high' ? 'high' : 
                           pestInfo.severity === 'medium' ? 'medium' : 'low'

            recommendations.push({
              type: 'pest_control',
              priority: priority as 'low' | 'medium' | 'high',
              title: `${pestInfo.pest} Risk - ${crop.cropType} in ${field.name}`,
              description: `${crop.cropType} at ${growthStage} stage is entering peak risk period for ${pestInfo.pest}. This pest typically causes significant damage during ${pestInfo.riskPeriod}.`,
              actionRequired: `Prevention: ${pestInfo.prevention.join(', ')}. Treatment if needed: ${pestInfo.treatment.join(', ')}.`,
              potentialImpact: `${pestInfo.severity === 'high' ? '10-25%' : pestInfo.severity === 'medium' ? '5-15%' : '2-8%'} yield loss if not managed properly`,
              confidenceLevel: 'high',
              estimatedCost: pestInfo.severity === 'high' ? 180 : 120,
              estimatedRoi: pestInfo.severity === 'high' ? 800 : 400,
              optimalTiming: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days to prepare
              supportingData: {
                pest: pestInfo.pest,
                cropType: crop.cropType,
                growthStage,
                riskPeriod: pestInfo.riskPeriod,
                severity: pestInfo.severity,
                preventionMethods: pestInfo.prevention,
                treatmentOptions: pestInfo.treatment
              }
            })
          }
        }
      }

      // Disease risk recommendations based on weather patterns
      for (const diseaseInfo of cropKnowledge.diseaseRisks) {
        if (diseaseInfo.criticalStage === growthStage || 
            diseaseInfo.criticalStage.includes(growthStage.split('(')[0])) {
          
          // Get recent weather to assess disease risk
          const recentWeather = await this.getRecentWeather(farmData.latitude, farmData.longitude)
          const conditionsMatch = this.checkDiseaseConditions(diseaseInfo.conditions, recentWeather)

          if (conditionsMatch) {
            recommendations.push({
              type: 'pest_control',
              priority: 'high',
              title: `${diseaseInfo.disease} Risk Alert - ${field.name}`,
              description: `Weather conditions favor ${diseaseInfo.disease} development in ${crop.cropType}. Symptoms to watch: ${diseaseInfo.symptoms.join(', ')}.`,
              actionRequired: `Prevention: ${diseaseInfo.prevention.join(', ')}. Scout fields daily for early symptoms.`,
              potentialImpact: 'Disease pressure can reduce yields by 15-30% if left unmanaged during critical growth stages',
              confidenceLevel: 'high',
              estimatedCost: 200,
              estimatedRoi: 900,
              optimalTiming: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow - urgent
              supportingData: {
                disease: diseaseInfo.disease,
                symptoms: diseaseInfo.symptoms,
                conditions: diseaseInfo.conditions,
                prevention: diseaseInfo.prevention,
                criticalStage: diseaseInfo.criticalStage
              }
            })
          }
        }
      }

      // NDVI-based stress analysis recommendations
      const latestNDVI = await prisma.satelliteAnalytics.findFirst({
        where: { fieldId: field.id },
        orderBy: { captureDate: 'desc' }
      })

      if (latestNDVI && latestNDVI.ndviAvg) {
        const ndviValue = Number(latestNDVI.ndviAvg)
        let stressLevel = 'normal'
        let recommendation = null

        if (ndviValue < 0.3) {
          stressLevel = 'severe'
          recommendation = {
            type: 'pest_control' as const,
            priority: 'urgent' as const,
            title: `Severe Crop Stress Detected - ${field.name}`,
            description: `NDVI value of ${ndviValue.toFixed(2)} indicates severe stress in ${crop.cropType}. This could be pest, disease, or nutrient related.`,
            actionRequired: 'Immediate field scouting required. Check for pests, diseases, nutrient deficiencies, and water stress.',
            potentialImpact: 'Severe stress can cause 25-50% yield loss if not addressed within 48-72 hours',
            confidenceLevel: 'high' as const,
            estimatedCost: 0, // Scouting cost
            optimalTiming: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours - very urgent
            supportingData: {
              ndviValue,
              stressLevel,
              lastUpdate: latestNDVI.captureDate,
              fieldId: field.id
            }
          }
        } else if (ndviValue < 0.5 && ndviValue >= 0.3) {
          stressLevel = 'moderate'
          recommendation = {
            type: 'pest_control' as const,
            priority: 'high' as const,
            title: `Moderate Stress Detected - ${field.name}`,
            description: `NDVI of ${ndviValue.toFixed(2)} shows moderate stress in ${crop.cropType}. Early intervention can prevent yield loss.`,
            actionRequired: 'Scout for pests and diseases. Check soil moisture and nutrient status. Consider tissue analysis.',
            potentialImpact: 'Moderate stress typically causes 8-15% yield reduction if not addressed',
            confidenceLevel: 'medium' as const,
            estimatedCost: 150,
            estimatedRoi: 300,
            optimalTiming: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
            supportingData: {
              ndviValue,
              stressLevel,
              lastUpdate: latestNDVI.captureDate,
              fieldId: field.id
            }
          }
        }

        if (recommendation) {
          recommendations.push(recommendation)
        }
      }
    }

    return recommendations
  }

  /**
   * Generate financial optimization recommendations including market timing
   */
  private async generateFinancialRecommendations(farmData: any): Promise<GeneratedRecommendation[]> {
    const recommendations: GeneratedRecommendation[] = []

    // Analyze recent transactions
    const recentTransactions = await prisma.financialTransaction.findMany({
      where: { farmId: farmData.id },
      orderBy: { transactionDate: 'desc' },
      take: 50
    })

    // Check for potential cost savings opportunities
    const inputCosts = recentTransactions
      .filter(t => ['SEEDS', 'FERTILIZER', 'PESTICIDES'].includes(t.category))
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

    // Generate market timing recommendations for crops nearing harvest
    for (const field of farmData.fields) {
      const crops = field.crops || []
      
      for (const crop of crops) {
        if (crop.status === 'GROWING') {
          const daysUntilHarvest = this.calculateDaysUntilHarvest(crop)
          
          // Check if harvest is approaching (within 45 days)
          if (daysUntilHarvest <= 45 && daysUntilHarvest > 0) {
            const cropKnowledge = getCropKnowledge(crop.cropType)
            
            if (cropKnowledge && cropKnowledge.marketPatterns) {
              const currentMonth = new Date().toLocaleString('default', { month: 'long' })
              const harvestMonth = new Date(crop.expectedHarvestDate).toLocaleString('default', { month: 'long' })
              const optimalSellMonth = cropKnowledge.marketPatterns.storageRecommendation.optimalSellMonth
              
              const currentPattern = cropKnowledge.marketPatterns.pricePatterns.find(p => p.month === harvestMonth)
              const optimalPattern = cropKnowledge.marketPatterns.pricePatterns.find(p => p.month === optimalSellMonth)
              
              if (currentPattern && optimalPattern) {
                const priceDifference = optimalPattern.relativePrice - currentPattern.relativePrice
                const storageCost = cropKnowledge.marketPatterns.storageRecommendation.costPerBushel
                
                // Calculate potential financial impact for all scenarios
                const estimatedYield = crop.estimatedYield || 200 // Default estimate
                const fieldAcres = field.area || 10
                const totalBushels = estimatedYield * fieldAcres
                const potentialGain = totalBushels * Math.abs(priceDifference - 0.05) * 4.50 // ~$4.50/bu corn estimate
                
                // Recommend storage if price gain exceeds storage costs + 10% buffer
                if (priceDifference > 0.10 && optimalSellMonth !== harvestMonth) {
                  
                  recommendations.push({
                    type: 'financial',
                    priority: daysUntilHarvest <= 14 ? 'high' : 'medium',
                    title: `Consider Storage for Better Prices - ${field.name}`,
                    description: `${crop.cropType} harvest approaching in ${daysUntilHarvest} days. Historical data shows ${Math.round(priceDifference * 100)}% higher prices in ${optimalSellMonth} vs ${harvestMonth}.`,
                    actionRequired: `Arrange storage facilities. Peak selling month is typically ${optimalSellMonth}. Storage cost: $${storageCost}/bushel.`,
                    potentialImpact: `Could gain $${potentialGain.toFixed(0)} from timing sale optimally vs. selling at harvest`,
                    confidenceLevel: 'medium',
                    estimatedCost: totalBushels * storageCost,
                    estimatedRoi: potentialGain,
                    optimalTiming: new Date(crop.expectedHarvestDate),
                    supportingData: {
                      cropType: crop.cropType,
                      harvestMonth,
                      optimalSellMonth,
                      harvestPrice: currentPattern.relativePrice,
                      optimalPrice: optimalPattern.relativePrice,
                      priceDifference,
                      estimatedYield,
                      totalBushels,
                      storageCost,
                      fieldId: field.id,
                      cropId: crop.id
                    }
                  })
                }
                
                // If harvest month is actually optimal, recommend immediate sale
                else if (harvestMonth === optimalSellMonth || priceDifference < 0.05) {
                  recommendations.push({
                    type: 'financial',
                    priority: daysUntilHarvest <= 7 ? 'high' : 'medium',
                    title: `Sell at Harvest - Good Timing - ${field.name}`,
                    description: `${crop.cropType} harvest in ${daysUntilHarvest} days coincides with historically favorable pricing in ${harvestMonth}.`,
                    actionRequired: 'Secure grain marketing contracts now. Line up trucking and elevator delivery slots.',
                    potentialImpact: 'Optimal timing - avoid storage costs while capturing good seasonal pricing',
                    confidenceLevel: 'high',
                    estimatedCost: 0,
                    estimatedRoi: 0,
                    optimalTiming: new Date(crop.expectedHarvestDate),
                    supportingData: {
                      cropType: crop.cropType,
                      harvestMonth,
                      harvestPrice: currentPattern.relativePrice,
                      fieldId: field.id,
                      cropId: crop.id,
                      reason: 'harvest_timing_optimal'
                    }
                  })
                }
                
                // Warn about poor timing if harvesting during low price period
                else if (priceDifference < -0.05) {
                  recommendations.push({
                    type: 'financial',
                    priority: 'high',
                    title: `Poor Market Timing Alert - ${field.name}`,
                    description: `${crop.cropType} harvest in ${harvestMonth} typically sees ${Math.abs(Math.round(priceDifference * 100))}% lower prices than peak season (${optimalSellMonth}).`,
                    actionRequired: 'Consider pre-harvest marketing contracts or storage options to improve pricing',
                    potentialImpact: `Current timing could reduce revenue by $${Math.abs(potentialGain).toFixed(0)} compared to optimal timing`,
                    confidenceLevel: 'medium',
                    optimalTiming: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Act soon
                    supportingData: {
                      cropType: crop.cropType,
                      harvestMonth,
                      optimalSellMonth,
                      harvestPrice: currentPattern.relativePrice,
                      optimalPrice: optimalPattern.relativePrice,
                      priceDifference,
                      fieldId: field.id,
                      cropId: crop.id,
                      reason: 'suboptimal_harvest_timing'
                    }
                  })
                }
              }
            }
          }
        }
      }
    }

    return recommendations
  }

  /**
   * Generate timing-based recommendations (planting, harvest, rotation planning)
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

          // Generate crop rotation recommendations for upcoming harvest/next season
          if (daysUntilHarvest <= 60 && daysUntilHarvest > 0) {
            const cropKnowledge = getCropKnowledge(crop.cropType)
            
            if (cropKnowledge && cropKnowledge.rotationBenefits) {
              const rotationBenefits = cropKnowledge.rotationBenefits
              
              // Check if field has been in continuous cropping
              const fieldHistory = crops.filter((c: any) => c.fieldId === field.id).slice(-3) // Last 3 seasons
              const continuousCropping = fieldHistory.length >= 2 && 
                fieldHistory.every((c: any) => c.cropType.toLowerCase() === crop.cropType.toLowerCase())

              if (continuousCropping) {
                // Recommend rotation to break disease/pest cycles
                const recommendedCrops = rotationBenefits.followsWith.slice(0, 2) // Top 2 recommendations
                
                recommendations.push({
                  type: 'planting',
                  priority: 'medium',
                  title: `Break Crop Rotation Cycle - ${field.name}`,
                  description: `${field.name} has grown ${crop.cropType} for ${fieldHistory.length} consecutive seasons. Rotation recommended for soil health and pest management.`,
                  actionRequired: `Consider planting ${recommendedCrops.join(' or ')} next season. Plan soil preparation and seed ordering.`,
                  potentialImpact: `Crop rotation can increase yields by 10-20% and reduce pest/disease pressure by 30-50%`,
                  confidenceLevel: 'high',
                  estimatedCost: 0, // No additional cost, just different crop choice
                  estimatedRoi: (field.area || 10) * 100, // Estimate $100/acre benefit
                  optimalTiming: new Date(crop.expectedHarvestDate),
                  supportingData: {
                    currentCrop: crop.cropType,
                    recommendedCrops,
                    soilBenefits: rotationBenefits.soilBenefits,
                    continuousYears: fieldHistory.length,
                    fieldId: field.id,
                    reason: 'break_continuous_cropping'
                  }
                })
              }

              // Recommend optimal crop sequence if not in continuous cropping
              else if (rotationBenefits.followsWith.length > 0) {
                const bestFollowCrop = rotationBenefits.followsWith[0] // Top recommendation
                const followCropKnowledge = getCropKnowledge(bestFollowCrop)
                
                if (followCropKnowledge) {
                  recommendations.push({
                    type: 'planting',
                    priority: 'low',
                    title: `Optimize Next Season Rotation - ${field.name}`,
                    description: `After ${crop.cropType} harvest, ${bestFollowCrop} would provide optimal rotation benefits for soil health and yield.`,
                    actionRequired: `Consider ${bestFollowCrop} for next season. Review seed availability and market outlook.`,
                    potentialImpact: `${rotationBenefits.soilBenefits.join('. ')}. Potential yield boost of 5-15%.`,
                    confidenceLevel: 'medium',
                    estimatedRoi: (field.area || 10) * 50, // Conservative $50/acre benefit
                    optimalTiming: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Plan 30 days ahead
                    supportingData: {
                      currentCrop: crop.cropType,
                      recommendedCrop: bestFollowCrop,
                      rotationBenefits: rotationBenefits.soilBenefits,
                      fieldId: field.id,
                      reason: 'optimal_rotation_sequence'
                    }
                  })
                }
              }

              // Warn about crops to avoid in rotation
              if (rotationBenefits.avoidAfter.length > 0) {
                const avoidedCrops = rotationBenefits.avoidAfter.slice(0, 2)
                
                recommendations.push({
                  type: 'planting',
                  priority: 'medium',
                  title: `Rotation Planning Alert - ${field.name}`,
                  description: `After ${crop.cropType}, avoid planting ${avoidedCrops.join(' or ')} to prevent disease buildup and nutrient competition.`,
                  actionRequired: 'Plan alternative crops for next season rotation. Focus on recommended rotation partners.',
                  potentialImpact: 'Avoiding poor rotation choices prevents yield losses of 15-25% and reduces disease pressure',
                  confidenceLevel: 'high',
                  optimalTiming: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Plan 2 weeks ahead
                  supportingData: {
                    currentCrop: crop.cropType,
                    avoidCrops: avoidedCrops,
                    recommendedAlternatives: rotationBenefits.followsWith,
                    fieldId: field.id,
                    reason: 'rotation_avoidance_warning'
                  }
                })
              }
            }
          }
        }
      }

      // Recommend crops for fallow or idle fields
      if (crops.length === 0 || crops.every((c: any) => c.status === 'HARVESTED' || c.status === 'COMPLETED')) {
        // Get the most recent crop grown in this field
        const lastCrop = crops
          .filter((c: any) => c.fieldId === field.id)
          .sort((a: any, b: any) => new Date(b.plantingDate).getTime() - new Date(a.plantingDate).getTime())[0]

        if (lastCrop) {
          const lastCropKnowledge = getCropKnowledge(lastCrop.cropType)
          
          if (lastCropKnowledge && lastCropKnowledge.rotationBenefits.followsWith.length > 0) {
            const recommendedCrop = lastCropKnowledge.rotationBenefits.followsWith[0]
            
            recommendations.push({
              type: 'planting',
              priority: 'low',
              title: `Planning Opportunity for ${field.name}`,
              description: `Field is available for planting. Last crop was ${lastCrop.cropType}. Recommended next crop: ${recommendedCrop}.`,
              actionRequired: `Plan ${recommendedCrop} planting for optimal rotation benefits. Check soil conditions and prepare field.`,
              potentialImpact: `Good rotation planning can improve soil health and maximize yield potential`,
              confidenceLevel: 'medium',
              estimatedRoi: (field.area || 10) * 75, // Estimate $75/acre for good planning
              optimalTiming: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Plan 60 days ahead
              supportingData: {
                lastCrop: lastCrop.cropType,
                recommendedCrop,
                soilBenefits: lastCropKnowledge.rotationBenefits.soilBenefits,
                fieldId: field.id,
                reason: 'idle_field_planning'
              }
            })
          }
        } else {
          // Completely new field - recommend starter crops
          recommendations.push({
            type: 'planting',
            priority: 'low',
            title: `New Field Planning - ${field.name}`,
            description: `Field has no planting history. Consider soil testing and starter crops to establish production baseline.`,
            actionRequired: 'Conduct comprehensive soil test. Consider corn or soybeans as starter crops for the region.',
            potentialImpact: 'Proper initial crop selection sets foundation for long-term field productivity',
            confidenceLevel: 'medium',
            optimalTiming: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            supportingData: {
              fieldId: field.id,
              reason: 'new_field_establishment'
            }
          })
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

  private async getRecentWeather(lat: number, lng: number) {
    // Get recent weather data for disease risk assessment
    // In production, integrate with weather API for historical data
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      temperature: 75 + Math.random() * 20,
      precipitation: Math.random() * 0.3,
      humidity: 65 + Math.random() * 25,
      leafWetness: Math.random() * 12 // hours
    }))
  }

  private checkDiseaseConditions(conditions: string[], recentWeather: any[]): boolean {
    // Check if recent weather conditions match disease triggers
    for (const condition of conditions) {
      if (condition.toLowerCase().includes('high humidity')) {
        const avgHumidity = recentWeather.reduce((sum, day) => sum + day.humidity, 0) / recentWeather.length
        if (avgHumidity < 75) return false
      }
      
      if (condition.toLowerCase().includes('warm temperatures')) {
        const avgTemp = recentWeather.reduce((sum, day) => sum + day.temperature, 0) / recentWeather.length
        if (avgTemp < 75 || avgTemp > 85) return false
      }
      
      if (condition.toLowerCase().includes('cool temperatures')) {
        const avgTemp = recentWeather.reduce((sum, day) => sum + day.temperature, 0) / recentWeather.length
        if (avgTemp < 65 || avgTemp > 80) return false
      }
      
      if (condition.toLowerCase().includes('extended leaf wetness')) {
        const avgWetness = recentWeather.reduce((sum, day) => sum + (day.leafWetness || 0), 0) / recentWeather.length
        if (avgWetness < 6) return false // Less than 6 hours average
      }
      
      if (condition.toLowerCase().includes('extended dew periods')) {
        const highHumidityDays = recentWeather.filter(day => day.humidity > 80).length
        if (highHumidityDays < 3) return false
      }
    }
    
    return true // All conditions matched
  }

  private isPestRiskPeriod(riskPeriod: string, daysFromPlanting: number): boolean {
    // Parse risk period string and check if current timing matches
    // Examples: "30-60 days after planting", "45-65 days after planting"
    
    const match = riskPeriod.match(/(\d+)-(\d+)\s*days?\s*after\s*planting/i)
    if (match) {
      const startDay = parseInt(match[1])
      const endDay = parseInt(match[2])
      return daysFromPlanting >= startDay && daysFromPlanting <= endDay
    }
    
    // Handle other formats like "June-August", "Emergence and late season"
    if (riskPeriod.toLowerCase().includes('emergence')) {
      return daysFromPlanting <= 14
    }
    
    if (riskPeriod.toLowerCase().includes('late season')) {
      return daysFromPlanting >= 90
    }
    
    // Month-based risk periods
    const currentMonth = new Date().getMonth() + 1
    if (riskPeriod.toLowerCase().includes('june')) {
      return currentMonth === 6
    }
    if (riskPeriod.toLowerCase().includes('july')) {
      return currentMonth === 7
    }
    if (riskPeriod.toLowerCase().includes('august')) {
      return currentMonth === 8
    }
    
    return false
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