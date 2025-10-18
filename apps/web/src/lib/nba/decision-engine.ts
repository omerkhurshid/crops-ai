/**
 * Next Best Action (NBA) Decision Engine
 * Core algorithm for generating farm operation recommendations
 */

import { prisma } from '../prisma'
import { WeatherService, WeatherConditions, WeatherForecast } from '../services/weather'
import { FinancialCalculator, FinancialImpact, FieldEconomics } from './financial-calculator'

export interface FarmContext {
  farmId: string
  userId: string
  location: {
    latitude: number
    longitude: number
  }
  fields: Array<{
    id: string
    name: string
    area: number
    cropType: string
    plantingDate?: Date
    lastSprayDate?: Date
    lastHarvestDate?: Date
  }>
  weather: {
    current: WeatherConditions
    forecast: WeatherForecast[]
  }
  financials: {
    cashAvailable: number
    monthlyBudget: number
    ytdRevenue: number
    ytdExpenses: number
  }
  livestock?: {
    totalAnimals: number
    species: Array<{
      type: string
      count: number
      lastVaccination?: Date
    }>
  }
}

export interface Decision {
  id: string
  type: 'SPRAY' | 'HARVEST' | 'IRRIGATE' | 'PLANT' | 'FERTILIZE' | 'LIVESTOCK_HEALTH' | 'MARKET_SELL' | 'EQUIPMENT_MAINTAIN'
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  estimatedDuration: number // minutes
  estimatedImpact: {
    revenue?: number
    costSavings?: number
    yieldIncrease?: number // percentage
    riskMitigation?: string
  }
  confidence: number // 0-100
  timing: {
    idealStart?: Date
    idealEnd?: Date
    mustCompleteBy?: Date
  }
  requirements: {
    weather?: {
      maxWind?: number
      minTemp?: number
      maxTemp?: number
      noRainHours?: number
    }
    resources?: string[]
    dependencies?: string[]
  }
  explanation: string
  actionSteps: string[]
  targetField?: string
  relatedDecisions?: string[]
}

export interface DecisionScore {
  urgency: number    // 0-100 based on timing windows
  roi: number        // 0-100 based on financial impact
  feasibility: number // 0-100 based on weather/resources
  total: number      // weighted combination
}

export class NBAEngine {
  private weatherService: WeatherService
  private financialCalculator: FinancialCalculator

  constructor(weatherApiKey?: string) {
    this.weatherService = new WeatherService(weatherApiKey)
    this.financialCalculator = new FinancialCalculator()
  }
  /**
   * Generate prioritized decisions for a farm
   */
  async generateDecisions(context: FarmContext): Promise<Decision[]> {
    const decisions: Decision[] = []
    
    // 1. Check spray decisions
    const sprayDecisions = await this.evaluateSprayDecisions(context)
    decisions.push(...sprayDecisions)
    
    // 2. Check harvest decisions
    const harvestDecisions = await this.evaluateHarvestDecisions(context)
    decisions.push(...harvestDecisions)
    
    // 3. Check irrigation decisions
    const irrigationDecisions = await this.evaluateIrrigationDecisions(context)
    decisions.push(...irrigationDecisions)
    
    // 4. Check livestock health decisions
    if (context.livestock) {
      const livestockDecisions = await this.evaluateLivestockDecisions(context)
      decisions.push(...livestockDecisions)
    }
    
    // 5. Check market timing decisions
    const marketDecisions = await this.evaluateMarketDecisions(context)
    decisions.push(...marketDecisions)
    
    // Score and sort decisions
    const scoredDecisions = decisions.map(decision => ({
      decision,
      score: this.scoreDecision(decision, context)
    }))
    
    // Sort by total score descending
    scoredDecisions.sort((a, b) => b.score.total - a.score.total)
    
    return scoredDecisions.map(s => s.decision)
  }
  
  /**
   * Evaluate spray timing decisions based on pest pressure, weather windows, and crop stage
   */
  private async evaluateSprayDecisions(context: FarmContext): Promise<Decision[]> {
    const decisions: Decision[] = []
    
    // Get spray windows using weather service
    const sprayWindows = await this.weatherService.findSprayWindows(
      context.location.latitude,
      context.location.longitude,
      7
    )
    
    for (const field of context.fields) {
      // Check if spray window is approaching
      const daysSinceLastSpray = field.lastSprayDate 
        ? Math.floor((Date.now() - field.lastSprayDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999
        
      const needsFungicide = daysSinceLastSpray > 14 && context.weather.current.humidity > 70
      const needsInsecticide = daysSinceLastSpray > 21
      
      if ((needsFungicide || needsInsecticide) && sprayWindows.length > 0) {
        const window = sprayWindows[0]
        const sprayType = needsFungicide ? 'fungicide' : 'insecticide'
        
        // Calculate financial impact
        const fieldEconomics: FieldEconomics = {
          fieldArea: field.area,
          cropType: field.cropType,
          averageYield: this.getAverageYield(field.cropType),
          productionCostPerHa: 1500, // Default production cost
          insuranceValue: field.area * this.getAverageYield(field.cropType) * 250, // Simplified insurance value
          landValue: field.area * 10000 // Simplified land value
        }
        
        const financialImpact = this.financialCalculator.calculateSprayImpact(
          fieldEconomics,
          sprayType,
          100, // Full application rate
          window.confidence // Expected efficacy based on weather conditions
        )
        
        decisions.push({
          id: `spray-${field.id}-${Date.now()}`,
          type: 'SPRAY',
          priority: daysSinceLastSpray > 30 ? 'URGENT' : 'HIGH',
          title: `Spray ${sprayType} on ${field.name}`,
          description: `Field showing ${needsFungicide ? 'high disease pressure' : 'pest activity'}. Optimal spray window detected.`,
          estimatedDuration: Math.round(field.area * 15), // 15 min per hectare
          estimatedImpact: {
            revenue: financialImpact.estimatedRevenue,
            costSavings: financialImpact.revenueBreakdown.lossAvoidance,
            yieldIncrease: needsFungicide ? 15 : 10
          },
          confidence: Math.round(financialImpact.confidenceLevel),
          timing: {
            idealStart: window.start,
            idealEnd: window.end,
            mustCompleteBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          requirements: {
            weather: {
              maxWind: 15,
              minTemp: 10,
              maxTemp: 30,
              noRainHours: 6
            },
            resources: [sprayType, 'sprayer', 'operator']
          },
          explanation: `Based on ${daysSinceLastSpray} days since last application and current ${
            needsFungicide ? 'humidity levels' : 'pest cycle'
          }. Financial analysis shows ${financialImpact.roi.toFixed(1)}% ROI with $${Math.round(financialImpact.netBenefit)} net benefit. Weather window provides ideal conditions.`,
          actionSteps: [
            'Check sprayer calibration',
            `Mix ${sprayType} according to label rates`,
            'Start spraying early morning for best coverage',
            'Record application details for compliance'
          ],
          targetField: field.id
        })
      }
    }
    
    return decisions
  }
  
  /**
   * Evaluate harvest timing based on crop maturity, weather, and market prices
   */
  private async evaluateHarvestDecisions(context: FarmContext): Promise<Decision[]> {
    const decisions: Decision[] = []
    
    // Get harvest windows using weather service
    const harvestWindows = await this.weatherService.findHarvestWindows(
      context.location.latitude,
      context.location.longitude,
      10
    )
    
    for (const field of context.fields) {
      if (!field.plantingDate) continue
      
      // Calculate days to maturity
      const daysSincePlanting = Math.floor((Date.now() - field.plantingDate.getTime()) / (1000 * 60 * 60 * 24))
      const expectedMaturity = this.getCropMaturityDays(field.cropType)
      const maturityProgress = (daysSincePlanting / expectedMaturity) * 100
      
      if (maturityProgress >= 90 && harvestWindows.length > 0) {
        const window = harvestWindows[0]
        const urgency = maturityProgress >= 100 ? 'URGENT' : 'HIGH'
        
        // Calculate financial impact
        const fieldEconomics: FieldEconomics = {
          fieldArea: field.area,
          cropType: field.cropType,
          averageYield: this.getAverageYield(field.cropType),
          productionCostPerHa: 1500,
          insuranceValue: field.area * this.getAverageYield(field.cropType) * 250,
          landValue: field.area * 10000
        }
        
        // Estimate moisture content based on maturity
        const estimatedMoisture = maturityProgress > 100 ? 14 : 18
        
        // Calculate weather risk percentage
        const weatherRisk = Math.max(0, 100 - window.qualityScore)
        
        const financialImpact = this.financialCalculator.calculateHarvestImpact(
          fieldEconomics,
          estimatedMoisture,
          'IMMEDIATE',
          weatherRisk
        )
        
        decisions.push({
          id: `harvest-${field.id}-${Date.now()}`,
          type: 'HARVEST',
          priority: urgency,
          title: `Harvest ${field.cropType} from ${field.name}`,
          description: `Crop at ${Math.round(maturityProgress)}% maturity. Favorable weather window and strong market prices.`,
          estimatedDuration: Math.round(field.area * 60), // 60 min per hectare
          estimatedImpact: {
            revenue: financialImpact.estimatedRevenue,
            costSavings: financialImpact.revenueBreakdown.lossAvoidance,
            riskMitigation: 'Avoid weather damage and quality loss'
          },
          confidence: Math.round(financialImpact.confidenceLevel),
          timing: {
            idealStart: window.start,
            idealEnd: window.end,
            mustCompleteBy: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
          },
          requirements: {
            weather: {
              maxWind: 25,
              minTemp: 5,
              noRainHours: 24
            },
            resources: ['combine', 'grain trucks', 'operators', 'storage']
          },
          explanation: `Crop moisture estimated at ${estimatedMoisture}%. Financial analysis shows ${financialImpact.roi.toFixed(1)}% ROI with $${Math.round(financialImpact.netBenefit)} net benefit. ${
            Math.round(window.duration / 24)
          } day dry window starting ${window.start.toLocaleDateString()}.`,
          actionSteps: [
            'Test grain moisture (target 14-16%)',
            'Prepare storage facilities',
            'Schedule trucks and operators',
            'Monitor weather updates',
            'Complete harvest during dry conditions'
          ],
          targetField: field.id
        })
      }
    }
    
    return decisions
  }
  
  /**
   * Evaluate irrigation needs based on soil moisture, weather, and crop stage
   */
  private async evaluateIrrigationDecisions(context: FarmContext): Promise<Decision[]> {
    const decisions: Decision[] = []
    
    for (const field of context.fields) {
      // Simulate soil moisture based on recent precipitation
      const recentRainfall = context.weather.forecast
        .slice(0, 7)
        .reduce((sum, day) => sum + day.precipitation, 0)
      
      const needsIrrigation = recentRainfall < 10 && context.weather.forecast[0].temperature > 25
      
      if (needsIrrigation) {
        // Calculate financial impact
        const fieldEconomics: FieldEconomics = {
          fieldArea: field.area,
          cropType: field.cropType,
          averageYield: this.getAverageYield(field.cropType),
          productionCostPerHa: 1500,
          insuranceValue: field.area * this.getAverageYield(field.cropType) * 250,
          landValue: field.area * 10000
        }
        
        const waterAmount = 25 // mm
        const waterCostPerMm = 2 // $ per hectare per mm
        const stressLevel = Math.max(0, 100 - (recentRainfall * 10)) // Convert rainfall to stress level
        const yieldResponseCurve = 0.05 // tons per hectare per mm
        
        const financialImpact = this.financialCalculator.calculateIrrigationImpact(
          fieldEconomics,
          waterAmount,
          waterCostPerMm,
          stressLevel,
          yieldResponseCurve
        )
        
        decisions.push({
          id: `irrigate-${field.id}-${Date.now()}`,
          type: 'IRRIGATE',
          priority: recentRainfall < 5 ? 'HIGH' : 'MEDIUM',
          title: `Irrigate ${field.name}`,
          description: `Low soil moisture detected. ${recentRainfall}mm rain in past week.`,
          estimatedDuration: Math.round(field.area * 30),
          estimatedImpact: {
            revenue: financialImpact.estimatedRevenue,
            costSavings: financialImpact.revenueBreakdown.lossAvoidance,
            yieldIncrease: 20
          },
          confidence: Math.round(financialImpact.confidenceLevel),
          timing: {
            idealStart: new Date(),
            idealEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          },
          requirements: {
            resources: ['irrigation system', 'water rights']
          },
          explanation: `Soil moisture below optimal levels (stress level: ${Math.round(stressLevel)}%). Financial analysis shows ${financialImpact.roi.toFixed(1)}% ROI with $${Math.round(financialImpact.netBenefit)} net benefit. Irrigation will prevent yield loss.`,
          actionSteps: [
            'Check irrigation system operation',
            'Monitor water usage',
            `Apply ${waterAmount}mm over 4 hours`,
            'Check soil moisture after application'
          ],
          targetField: field.id
        })
      }
    }
    
    return decisions
  }
  
  /**
   * Evaluate livestock health and management decisions
   */
  private async evaluateLivestockDecisions(context: FarmContext): Promise<Decision[]> {
    const decisions: Decision[] = []
    
    if (!context.livestock) return decisions
    
    for (const species of context.livestock.species) {
      // Check vaccination schedules
      if (species.lastVaccination) {
        const daysSinceVaccination = Math.floor(
          (Date.now() - species.lastVaccination.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (daysSinceVaccination > 365) {
          const costPerAnimal = 25 // Cost per animal for vaccination
          const preventedLossValue = 500 // Value of prevented losses per animal
          const effectivenessRate = 90 // 90% effectiveness
          
          const financialImpact = this.financialCalculator.calculateLivestockImpact(
            species.count,
            'vaccination',
            costPerAnimal,
            effectivenessRate,
            preventedLossValue
          )
          
          decisions.push({
            id: `vaccinate-${species.type}-${Date.now()}`,
            type: 'LIVESTOCK_HEALTH',
            priority: 'HIGH',
            title: `Annual vaccination for ${species.count} ${species.type}`,
            description: `Overdue for annual vaccination program.`,
            estimatedDuration: species.count * 2,
            estimatedImpact: {
              revenue: financialImpact.estimatedRevenue,
              costSavings: financialImpact.revenueBreakdown.lossAvoidance,
              riskMitigation: 'Prevent disease outbreak'
            },
            confidence: Math.round(financialImpact.confidenceLevel),
            timing: {
              idealStart: new Date(),
              mustCompleteBy: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            },
            requirements: {
              resources: ['vaccines', 'veterinarian', 'handling facilities']
            },
            explanation: `Vaccination overdue by ${daysSinceVaccination - 365} days. Financial analysis shows ${financialImpact.roi.toFixed(1)}% ROI with $${Math.round(financialImpact.netBenefit)} net benefit. Critical for herd health.`,
            actionSteps: [
              'Schedule veterinarian visit',
              'Prepare handling facilities',
              'Separate animals by age group',
              'Complete vaccination records'
            ]
          })
        }
      }
    }
    
    return decisions
  }
  
  /**
   * Evaluate market timing decisions for selling crops
   */
  private async evaluateMarketDecisions(context: FarmContext): Promise<Decision[]> {
    const decisions: Decision[] = []
    
    // Check for stored grain and market opportunities
    // This is simplified - real implementation would check actual storage
    const marketOpportunities = [
      {
        crop: 'wheat',
        currentPrice: 280,
        priceChange: 5.2,
        trend: 'up',
        recommendation: 'SELL'
      },
      {
        crop: 'corn',
        currentPrice: 220,
        priceChange: -2.1,
        trend: 'down',
        recommendation: 'HOLD'
      }
    ]
    
    for (const opportunity of marketOpportunities) {
      if (opportunity.recommendation === 'SELL') {
        decisions.push({
          id: `market-sell-${opportunity.crop}-${Date.now()}`,
          type: 'MARKET_SELL',
          priority: opportunity.priceChange > 5 ? 'HIGH' : 'MEDIUM',
          title: `Sell ${opportunity.crop} - Price at ${opportunity.currentPrice}/ton`,
          description: `Market up ${opportunity.priceChange}%. Favorable selling opportunity.`,
          estimatedDuration: 60,
          estimatedImpact: {
            revenue: 10000 * opportunity.currentPrice * 0.05 // 5% of assumed storage
          },
          confidence: 75,
          timing: {
            idealStart: new Date(),
            idealEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          },
          requirements: {
            resources: ['grain contracts', 'transportation']
          },
          explanation: `${opportunity.crop} prices up ${opportunity.priceChange}% this week. Technical indicators suggest continued strength.`,
          actionSteps: [
            'Contact grain buyers for quotes',
            'Compare local and terminal prices',
            'Schedule grain hauling',
            'Complete sale contracts'
          ]
        })
      }
    }
    
    return decisions
  }
  
  /**
   * Score a decision based on urgency, ROI, and feasibility
   */
  private scoreDecision(decision: Decision, context: FarmContext): DecisionScore {
    // Urgency score based on timing
    let urgency = 0
    if (decision.priority === 'URGENT') urgency = 100
    else if (decision.priority === 'HIGH') urgency = 75
    else if (decision.priority === 'MEDIUM') urgency = 50
    else urgency = 25
    
    // ROI score based on financial impact
    const totalImpact = 
      (decision.estimatedImpact.revenue || 0) +
      (decision.estimatedImpact.costSavings || 0) +
      ((decision.estimatedImpact.yieldIncrease || 0) * 1000) // Simplified yield value
    
    const roi = Math.min(100, (totalImpact / 10000) * 100) // Normalize to 0-100
    
    // Feasibility based on weather and resource requirements
    let feasibility = decision.confidence
    
    // Reduce feasibility if weather requirements not met
    if (decision.requirements?.weather) {
      const currentWeather = context.weather.current
      if (decision.requirements.weather.maxWind && currentWeather.windSpeed > decision.requirements.weather.maxWind) {
        feasibility *= 0.5
      }
    }
    
    // Calculate weighted total
    const total = (urgency * 0.4) + (roi * 0.4) + (feasibility * 0.2)
    
    return { urgency, roi, feasibility, total }
  }

  /**
   * Get expected days to maturity for crop type
   */
  private getCropMaturityDays(cropType: string): number {
    const maturityDays: Record<string, number> = {
      wheat: 120,
      corn: 140,
      soybeans: 130,
      barley: 100,
      oats: 90
    }
    return maturityDays[cropType.toLowerCase()] || 120
  }
  
  /**
   * Get average yield for crop type (tons per hectare)
   */
  private getAverageYield(cropType: string): number {
    const yields: Record<string, number> = {
      wheat: 3.5,
      corn: 10.0,
      soybeans: 3.0,
      barley: 4.0,
      oats: 2.5
    }
    return yields[cropType.toLowerCase()] || 3.0
  }
  
  /**
   * Get current market price for crop ($ per ton)
   */
  private async getCurrentMarketPrice(cropType: string): Promise<number> {
    // In real implementation, this would fetch from market API
    const prices: Record<string, number> = {
      wheat: 280,
      corn: 220,
      soybeans: 450,
      barley: 250,
      oats: 200
    }
    return prices[cropType.toLowerCase()] || 250
  }
}