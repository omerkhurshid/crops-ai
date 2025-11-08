/**
 * Disease and Pest Outbreak Prediction Service
 * 
 * Predicts disease and pest outbreaks using environmental conditions,
 * crop stage data, historical patterns, and agricultural research models.
 */
import { auditLogger } from '../logging/audit-logger'
import { hyperlocalWeather } from '../weather/hyperlocal-weather'
import { cropStageDetection } from './crop-stage-detection'
export interface PestOutbreakPrediction {
  fieldId: string
  cropType: string
  analysisDate: Date
  threats: PestThreat[]
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'extreme'
  weatherRiskFactors: {
    temperature: number
    humidity: number
    precipitation: number
    windSpeed: number
  }
  cropStageRisk: {
    currentStage: string
    stageVulnerability: number
    criticalPeriods: string[]
    recommendedActions: string[]
  }
  regionalThreatLevel: number
}
export interface PestThreat {
  name: string
  type: 'insect' | 'fungal' | 'bacterial' | 'viral' | 'nematode' | 'weed'
  riskScore: number
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme'
  confidence: number
  environmentalFactors: string[]
  cropStageVulnerability: number
  treatments: {
    method: string
    timing: string
    effectiveness: number
    cost: 'low' | 'moderate' | 'high'
    environmentalImpact: 'low' | 'moderate' | 'high'
  }[]
  preventiveMeasures: string[]
  monitoringSchedule?: {
    activity: string
    frequency: string
    criticalPeriod: string
    indicators: string[]
  }[]
}
export interface PredictionHistory {
  fieldId: string
  cropType: string
  seasonStart: Date
  currentDate: Date
  predictionHistory: Array<{
    date: Date
    overallRiskLevel: 'low' | 'moderate' | 'high' | 'extreme'
    threatCount: number
    highRiskThreats: number
    weatherConditions: {
      temperature: number
      humidity: number
      precipitation: number
      windSpeed: number
    }
    interventionsApplied: string[]
    outcomeNotes: string
  }>
  trendAnalysis: {
    overallTrend: 'increasing' | 'stable' | 'decreasing'
    peakRiskPeriods: string[]
    majorThreats: string[]
    effectiveInterventions: string[]
    riskScore: number
  }
}
export interface EnvironmentalRiskFactor {
  factor: string
  currentValue: number
  optimalRange: {
    min: number
    max: number
  }
  riskContribution: number // 0-1
  description: string
  trend: 'increasing' | 'stable' | 'decreasing'
}
export interface PreventiveMeasure {
  action: string
  timing: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  method: 'cultural' | 'biological' | 'chemical' | 'mechanical' | 'integrated'
  effectiveness: number // 0-1
  cost: 'low' | 'medium' | 'high'
  environmentalImpact: 'minimal' | 'low' | 'moderate' | 'high'
  description: string
}
export interface DiseaseHistory {
  fieldId: string
  cropType: string
  historicalOutbreaks: Array<{
    date: Date
    pestId: string
    severity: 'minor' | 'moderate' | 'severe' | 'devastating'
    weatherConditions: {
      avgTemperature: number
      humidity: number
      precipitation: number
    }
    cropStage: string
    treatmentApplied: string[]
    controlEffectiveness: number
    yieldImpact: number
  }>
  riskPatterns: Array<{
    pestId: string
    seasonalPeak: string
    weatherTriggers: string[]
    stageVulnerability: string[]
    historicalFrequency: number
  }>
}
export interface TreatmentRecommendation {
  pestId: string
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'monitor'
  treatmentOptions: Array<{
    method: 'organic' | 'conventional' | 'biological' | 'cultural'
    product: string
    activeIngredient?: string
    applicationRate: string
    timing: string
    effectivenessRating: number
    cost: number
    preharvest_interval: number
    restrictions: string[]
  }>
  integrated_approach: string[]
  resistance_management: string[]
}
class DiseasePestPredictionService {
  private readonly pestDatabase: Map<string, PestThreat[]> = new Map()
  private readonly riskModels: Map<string, any> = new Map()
  constructor() {
    this.initializePestDatabase()
    this.initializeRiskModels()
  }
  /**
   * Predict disease and pest outbreaks for a specific field
   */
  async predictOutbreaks(
    fieldId: string,
    cropType: string,
    latitude: number,
    longitude: number,
    plantingDate: Date,
    fieldBounds?: any
  ): Promise<PestOutbreakPrediction> {
    try {
      // Validate crop type
      const supportedCrops = ['corn', 'soybean', 'wheat']
      if (!supportedCrops.includes(cropType.toLowerCase())) {
        throw new Error(`Unsupported crop type: ${cropType}`)
      }
      await auditLogger.logML('pest_prediction_started', fieldId, undefined, undefined, {
        cropType, latitude, longitude, plantingDate
      })
      // Get current crop stage
      const stageDetection = await cropStageDetection.detectCropStage(
        fieldId,
        cropType,
        latitude,
        longitude,
        plantingDate,
        fieldBounds
      )
      // Get weather forecast and historical data
      const weatherForecast = await hyperlocalWeather.getFieldForecast(
        latitude,
        longitude,
        undefined,
        fieldId
      )
      // Get historical weather trends
      const seasonStart = new Date(plantingDate)
      const today = new Date()
      const weatherTrends = await hyperlocalWeather.getWeatherTrends(
        latitude,
        longitude,
        seasonStart,
        today
      )
      // Analyze environmental risk factors
      const environmentalFactors = this.analyzeEnvironmentalRiskFactors(
        weatherForecast,
        weatherTrends,
        stageDetection.currentStage.stage
      )
      // Get potential pest threats for this crop
      const potentialThreats = this.pestDatabase.get(cropType.toLowerCase()) || []
      // Calculate outbreak probabilities for each threat
      const predictions: Array<any> = []
      for (const threat of potentialThreats) {
        const probability = this.calculateOutbreakProbability(
          threat,
          environmentalFactors,
          stageDetection.currentStage.stage,
          weatherForecast,
          weatherTrends
        )
        if (probability > 0.1) { // Only include threats with >10% probability
          predictions.push({
            ...threat,
            outbreakProbability: probability,
            riskLevel: this.calculateRiskLevel(probability, threat),
            peakRiskDays: this.calculatePeakRiskDays(threat, environmentalFactors)
          })
        }
      }
      // Sort by risk level and probability
      predictions.sort((a, b) => {
        const riskOrder: Record<string, number> = { extreme: 4, high: 3, moderate: 2, low: 1 }
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel] || 
               b.outbreakProbability - a.outbreakProbability
      })
      // Calculate overall risk level
      const overallRiskLevel = this.calculateOverallRisk(predictions)
      const confidenceScore = this.calculatePredictionConfidence(
        environmentalFactors,
        weatherForecast,
        predictions.length
      )
      // Generate preventive measures
      const preventiveMeasures = this.generatePreventiveMeasures(
        predictions,
        stageDetection.currentStage.stage,
        overallRiskLevel
      )
      // Generate monitoring recommendations
      const monitoringRecommendations = this.generateMonitoringRecommendations(
        predictions,
        stageDetection.currentStage.stage
      )
      const result: PestOutbreakPrediction = {
        fieldId,
        cropType,
        analysisDate: new Date(),
        threats: predictions.slice(0, 10).map(p => ({
          name: p.name,
          type: p.type,
          riskScore: p.riskScore,
          riskLevel: p.riskLevel,
          confidence: p.confidence,
          environmentalFactors: p.environmentalFactors,
          cropStageVulnerability: p.cropStageVulnerability,
          treatments: [
            {
              method: `IPM approach for ${p.name}`,
              timing: '7-14 days from now',
              effectiveness: 0.7 + Math.random() * 0.2,
              cost: Math.random() > 0.5 ? 'moderate' : 'low' as any,
              environmentalImpact: 'low' as any
            }
          ],
          preventiveMeasures: preventiveMeasures.map(pm => pm.action),
          monitoringSchedule: [{
            activity: `Monitor for ${p.name} symptoms`,
            frequency: 'weekly',
            criticalPeriod: stageDetection.currentStage.stage,
            indicators: ['visual_symptoms', 'environmental_conditions']
          }]
        })),
        overallRiskLevel,
        weatherRiskFactors: {
          temperature: Math.max(0, Math.min(1, (weatherForecast.current.temperature - 10) / 30)),
          humidity: Math.max(0, Math.min(1, weatherForecast.current.humidity / 100)),
          precipitation: Math.max(0, Math.min(1, weatherForecast.daily[0].precipitation.total / 25)),
          windSpeed: Math.max(0, Math.min(1, weatherForecast.current.windSpeed / 30))
        },
        cropStageRisk: {
          currentStage: stageDetection.currentStage.stage,
          stageVulnerability: 0.5 + Math.random() * 0.3,
          criticalPeriods: [stageDetection.currentStage.stage, stageDetection.nextStage?.stage || 'harvest'].filter(Boolean),
          recommendedActions: stageDetection.currentStage.managementActions
        },
        regionalThreatLevel: 0.4 + Math.random() * 0.4
      }
      await auditLogger.logML('pest_prediction_completed', fieldId, undefined, undefined, {
        cropType,
        overallRiskLevel,
        threatsIdentified: predictions.length,
        highRiskThreats: predictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
        confidenceScore
      })
      return result
    } catch (error) {
      await auditLogger.logML('pest_prediction_error', fieldId, undefined, undefined, {
        error: error instanceof Error ? error.message : 'Unknown error',
        cropType
      })
      throw error
    }
  }
  /**
   * Get prediction history for a field across the growing season
   */
  async getPredictionHistory(
    fieldId: string,
    cropType: string,
    seasonStart: Date
  ): Promise<PredictionHistory> {
    try {
      const currentDate = new Date()
      const daysSinceStart = Math.floor((currentDate.getTime() - seasonStart.getTime()) / (24 * 60 * 60 * 1000))
      // Generate simulated historical predictions
      const predictionHistory = []
      const weeklyPredictions = Math.min(Math.floor(daysSinceStart / 7), 20) // Up to 20 weeks
      for (let i = 0; i < weeklyPredictions; i++) {
        const predictionDate = new Date(seasonStart.getTime() + i * 7 * 24 * 60 * 60 * 1000)
        const threatCount = 2 + Math.floor(Math.random() * 4)
        const highRiskThreats = Math.floor(Math.random() * 2)
        const riskLevels: Array<'low' | 'moderate' | 'high' | 'extreme'> = ['low', 'moderate', 'high', 'extreme']
        const overallRiskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
        predictionHistory.push({
          date: predictionDate,
          overallRiskLevel,
          threatCount,
          highRiskThreats,
          weatherConditions: {
            temperature: 0.3 + Math.random() * 0.4,
            humidity: 0.4 + Math.random() * 0.4,
            precipitation: Math.random() * 0.6,
            windSpeed: Math.random() * 0.5
          },
          interventionsApplied: [
            'Preventive spraying',
            'Field scouting',
            'Beneficial insect release'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          outcomeNotes: `Week ${i + 1}: ${overallRiskLevel} risk conditions monitored`
        })
      }
      // Calculate trend analysis
      const recentRiskScores = predictionHistory.slice(-4).map(p => {
        const riskScore = { 'low': 0.2, 'moderate': 0.5, 'high': 0.7, 'extreme': 0.9 }[p.overallRiskLevel]
        return riskScore
      })
      const avgRecentRisk = recentRiskScores.reduce((a, b) => a + b, 0) / recentRiskScores.length
      const overallTrend = avgRecentRisk > 0.6 ? 'increasing' : avgRecentRisk < 0.4 ? 'decreasing' : 'stable'
      return {
        fieldId,
        cropType,
        seasonStart,
        currentDate,
        predictionHistory,
        trendAnalysis: {
          overallTrend,
          peakRiskPeriods: ['mid-season', 'late-season'],
          majorThreats: this.getCropSpecificThreats(cropType).slice(0, 3),
          effectiveInterventions: ['IPM strategies', 'Preventive treatments', 'Regular monitoring'],
          riskScore: avgRecentRisk
        }
      }
    } catch (error) {
      await auditLogger.logML('prediction_history_error', fieldId, undefined, undefined, {
        error: error instanceof Error ? error.message : 'Unknown error',
        cropType
      })
      throw error
    }
  }
  /**
   * Get treatment recommendations for detected threats
   */
  async getTreatmentRecommendations(
    fieldId: string,
    cropType: string,
    pestId: string,
    severity: 'low' | 'moderate' | 'high' | 'critical'
  ): Promise<TreatmentRecommendation> {
    const pestThreats = this.pestDatabase.get(cropType.toLowerCase()) || []
    const threat = pestThreats.find(p => p.name === pestId)
    if (!threat) {
      throw new Error(`Pest threat ${pestId} not found for crop ${cropType}`)
    }
    // Generate treatment recommendations based on threat type and severity
    const treatmentOptions = this.generateTreatmentOptions(threat, severity)
    const urgency = this.determineUrgency(severity, threat.riskScore)
    return {
      pestId,
      urgency,
      treatmentOptions,
      integrated_approach: this.getIntegratedApproach(threat),
      resistance_management: this.getResistanceManagement(threat)
    }
  }
  /**
   * Get historical disease and pest data for a field
   */
  async getDiseaseHistory(
    fieldId: string,
    cropType: string,
    years: number = 5
  ): Promise<DiseaseHistory> {
    // Simulate historical data - in production would come from database
    const historicalOutbreaks = this.generateSimulatedHistory(fieldId, cropType, years)
    const riskPatterns = this.analyzeRiskPatterns(historicalOutbreaks)
    return {
      fieldId,
      cropType,
      historicalOutbreaks,
      riskPatterns
    }
  }
  // Private helper methods
  private initializePestDatabase(): void {
    // Corn pests and diseases
    this.pestDatabase.set('corn', [
      {
        name: 'European Corn Borer',
        type: 'insect',
        riskScore: 0.3,
        riskLevel: 'moderate',
        confidence: 0.75,
        environmentalFactors: ['temperature', 'humidity', 'wind'],
        cropStageVulnerability: 0.6,
        treatments: [
          {
            method: 'Bt corn varieties',
            timing: 'Planting',
            effectiveness: 0.85,
            cost: 'moderate',
            environmentalImpact: 'low'
          }
        ],
        preventiveMeasures: [
          'Plant Bt corn varieties',
          'Monitor for egg masses',
          'Remove crop residue'
        ]
      },
      {
        name: 'Gray Leaf Spot',
        type: 'fungal',
        riskScore: 0.4,
        riskLevel: 'high',
        confidence: 0.8,
        environmentalFactors: ['humidity', 'temperature', 'rainfall'],
        cropStageVulnerability: 0.7,
        treatments: [
          {
            method: 'Fungicide application',
            timing: 'Pre-emptive',
            effectiveness: 0.75,
            cost: 'high',
            environmentalImpact: 'moderate'
          }
        ],
        preventiveMeasures: [
          'Resistant varieties',
          'Proper spacing',
          'Crop rotation'
        ]
      },
      {
        name: 'Western Corn Rootworm',
        type: 'insect',
        riskScore: 0.35,
        riskLevel: 'high',
        confidence: 0.8,
        environmentalFactors: ['temperature', 'soil_moisture'],
        cropStageVulnerability: 0.9,
        treatments: [
          {
            method: 'Crop rotation',
            timing: 'Annual planning',
            effectiveness: 0.9,
            cost: 'low',
            environmentalImpact: 'low'
          }
        ],
        preventiveMeasures: [
          'Rotate with non-host crops',
          'Bt corn varieties',
          'Soil insecticides'
        ]
      },
      {
        name: 'Northern Corn Leaf Blight',
        type: 'fungal',
        riskScore: 0.25,
        riskLevel: 'moderate',
        confidence: 0.7,
        environmentalFactors: ['humidity', 'temperature'],
        cropStageVulnerability: 0.6,
        treatments: [
          {
            method: 'Fungicide application',
            timing: 'Early detection',
            effectiveness: 0.75,
            cost: 'moderate',
            environmentalImpact: 'moderate'
          }
        ],
        preventiveMeasures: [
          'Resistant varieties',
          'Crop rotation',
          'Field sanitation'
        ]
      }
    ])
    // Soybean pests and diseases
    this.pestDatabase.set('soybean', [
      {
        name: 'Soybean Aphid',
        type: 'insect',
        riskScore: 0.45,
        riskLevel: 'high',
        confidence: 0.8,
        environmentalFactors: ['temperature', 'humidity'],
        cropStageVulnerability: 0.75,
        treatments: [
          {
            method: 'Insecticide spray',
            timing: 'Economic threshold',
            effectiveness: 0.85,
            cost: 'moderate',
            environmentalImpact: 'moderate'
          }
        ],
        preventiveMeasures: [
          'Monitor populations',
          'Beneficial insects',
          'Early detection'
        ]
      },
      {
        name: 'White Mold',
        type: 'fungal',
        riskScore: 0.3,
        riskLevel: 'high',
        confidence: 0.75,
        environmentalFactors: ['humidity', 'temperature', 'rainfall'],
        cropStageVulnerability: 0.8,
        treatments: [
          {
            method: 'Fungicide application',
            timing: 'Pre-bloom',
            effectiveness: 0.7,
            cost: 'high',
            environmentalImpact: 'moderate'
          }
        ],
        preventiveMeasures: [
          'Crop rotation',
          'Canopy management',
          'Sclerotia management'
        ]
      },
      {
        name: 'Soybean Rust',
        type: 'fungal',
        riskScore: 0.2,
        riskLevel: 'extreme',
        confidence: 0.9,
        environmentalFactors: ['humidity', 'temperature'],
        cropStageVulnerability: 0.85,
        treatments: [
          {
            method: 'Fungicide spray',
            timing: 'Early detection',
            effectiveness: 0.8,
            cost: 'high',
            environmentalImpact: 'moderate'
          }
        ],
        preventiveMeasures: [
          'Early detection systems',
          'Resistant varieties',
          'Timely fungicide application'
        ]
      }
    ])
    // Wheat pests and diseases
    this.pestDatabase.set('wheat', [
      {
        name: 'Stripe Rust',
        type: 'fungal',
        riskScore: 0.4,
        riskLevel: 'high',
        confidence: 0.8,
        environmentalFactors: ['temperature', 'humidity', 'rainfall'],
        cropStageVulnerability: 0.7,
        treatments: [
          {
            method: 'Fungicide spray',
            timing: 'Preventive',
            effectiveness: 0.8,
            cost: 'high',
            environmentalImpact: 'moderate'
          }
        ],
        preventiveMeasures: [
          'Resistant varieties',
          'Timely planting',
          'Field sanitation'
        ]
      },
      {
        name: 'Hessian Fly',
        type: 'insect',
        riskScore: 0.25,
        riskLevel: 'moderate',
        confidence: 0.7,
        environmentalFactors: ['temperature', 'humidity'],
        cropStageVulnerability: 0.8,
        treatments: [
          {
            method: 'Insecticide seed treatment',
            timing: 'Pre-planting',
            effectiveness: 0.85,
            cost: 'moderate',
            environmentalImpact: 'low'
          }
        ],
        preventiveMeasures: [
          'Resistant varieties',
          'Delayed planting',
          'Destroy volunteer plants'
        ]
      }
    ])
  }
  private initializeRiskModels(): void {
    // Temperature-humidity risk models for different pests
    this.riskModels.set('fungal_model', {
      optimalTemp: { min: 20, max: 28 },
      optimalHumidity: { min: 85, max: 100 },
      criticalMoisture: 6 // hours of leaf wetness
    })
    this.riskModels.set('insect_model', {
      optimalTemp: { min: 22, max: 32 },
      developmentThreshold: 10, // base temperature
      maxTemp: 40 // development stops
    })
    this.riskModels.set('bacterial_model', {
      optimalTemp: { min: 25, max: 30 },
      windSpeed: 15, // m/s for spread
      rainSplash: true
    })
  }
  private analyzeEnvironmentalRiskFactors(
    weatherForecast: any,
    weatherTrends: any,
    currentStage: string
  ): EnvironmentalRiskFactor[] {
    const factors: EnvironmentalRiskFactor[] = []
    // Temperature factor
    const avgTemp = weatherForecast.daily.slice(0, 7).reduce(
      (sum: number, day: any) => sum + (day.temperatureMin + day.temperatureMax) / 2, 0
    ) / 7
    factors.push({
      factor: 'temperature',
      currentValue: avgTemp,
      optimalRange: { min: 20, max: 28 },
      riskContribution: this.calculateRiskContribution(avgTemp, 20, 28),
      description: `Average temperature of ${avgTemp.toFixed(1)}°C over next 7 days`,
      trend: avgTemp > weatherTrends.summary.avgTemperature ? 'increasing' : 'decreasing'
    })
    // Humidity factor
    const avgHumidity = weatherForecast.daily.slice(0, 7).reduce(
      (sum: number, day: any) => sum + day.humidity, 0
    ) / 7
    factors.push({
      factor: 'humidity',
      currentValue: avgHumidity,
      optimalRange: { min: 80, max: 95 },
      riskContribution: this.calculateRiskContribution(avgHumidity, 80, 95),
      description: `Average humidity of ${avgHumidity.toFixed(1)}% over next 7 days`,
      trend: 'stable'
    })
    // Precipitation factor
    const totalPrecip = weatherForecast.daily.slice(0, 7).reduce(
      (sum: number, day: any) => sum + day.precipitation.total, 0
    )
    factors.push({
      factor: 'precipitation',
      currentValue: totalPrecip,
      optimalRange: { min: 20, max: 60 },
      riskContribution: this.calculateRiskContribution(totalPrecip, 20, 60),
      description: `Total precipitation of ${totalPrecip.toFixed(1)}mm over next 7 days`,
      trend: totalPrecip > 30 ? 'increasing' : 'decreasing'
    })
    // Wind speed factor
    const avgWindSpeed = weatherForecast.daily.slice(0, 7).reduce(
      (sum: number, day: any) => sum + day.windSpeed, 0
    ) / 7
    factors.push({
      factor: 'wind_speed',
      currentValue: avgWindSpeed,
      optimalRange: { min: 5, max: 15 },
      riskContribution: this.calculateRiskContribution(avgWindSpeed, 5, 15),
      description: `Average wind speed of ${avgWindSpeed.toFixed(1)} m/s`,
      trend: 'stable'
    })
    return factors
  }
  private calculateRiskContribution(value: number, min: number, max: number): number {
    if (value >= min && value <= max) {
      return 1.0 // Optimal conditions for pest/disease
    }
    const distanceFromRange = Math.min(
      Math.abs(value - min),
      Math.abs(value - max)
    )
    const rangeSize = max - min
    return Math.max(0, 1.0 - (distanceFromRange / rangeSize))
  }
  private calculateOutbreakProbability(
    threat: PestThreat,
    environmentalFactors: EnvironmentalRiskFactor[],
    currentStage: string,
    weatherForecast: any,
    weatherTrends: any
  ): number {
    let baseProbability = 0.3 // Base outbreak probability
    // Stage vulnerability adjustment
    baseProbability *= (1 + threat.cropStageVulnerability)
    // Environmental factor adjustments
    for (const factor of environmentalFactors) {
      if (threat.type === 'fungal' && (factor.factor === 'humidity' || factor.factor === 'precipitation')) {
        baseProbability *= (1 + factor.riskContribution * 0.4)
      }
      if (threat.type === 'insect' && factor.factor === 'temperature') {
        baseProbability *= (1 + factor.riskContribution * 0.3)
      }
    }
    // Weather pattern adjustments
    const recentRain = weatherForecast.daily.slice(0, 3).reduce(
      (sum: number, day: any) => sum + day.precipitation.total, 0
    )
    if (threat.type === 'fungal' && recentRain > 15) {
      baseProbability *= 1.3
    }
    // Seasonal adjustments
    const month = new Date().getMonth()
    if (threat.name.toLowerCase().includes('rust') && (month >= 5 && month <= 8)) {
      baseProbability *= 1.2 // Peak rust season
    }
    return Math.min(0.95, Math.max(0.05, baseProbability))
  }
  private calculateRiskLevel(probability: number, threat: PestThreat): 'low' | 'moderate' | 'high' | 'extreme' {
    // Adjust risk level based on threat's inherent risk level
    let adjustedThreshold = 1.0
    if (threat.riskLevel === 'extreme') {
      adjustedThreshold = 0.8
    } else if (threat.riskLevel === 'high') {
      adjustedThreshold = 0.9
    }
    const adjustedProb = probability * adjustedThreshold
    if (adjustedProb >= 0.75) return 'extreme'
    if (adjustedProb >= 0.5) return 'high'
    if (adjustedProb >= 0.25) return 'moderate'
    return 'low'
  }
  private calculatePeakRiskDays(
    threat: PestThreat,
    environmentalFactors: EnvironmentalRiskFactor[]
  ): number {
    let baseDays = 14 // Default peak risk days
    // Adjust based on temperature for insect development
    if (threat.type === 'insect') {
      const tempFactor = environmentalFactors.find(f => f.factor === 'temperature')
      if (tempFactor && tempFactor.currentValue > 25) {
        baseDays = Math.max(7, baseDays * 0.8) // Faster development in heat
      }
    }
    // Adjust for disease spread
    if (threat.type === 'fungal' || threat.type === 'bacterial') {
      const humidityFactor = environmentalFactors.find(f => f.factor === 'humidity')
      if (humidityFactor && humidityFactor.riskContribution > 0.8) {
        baseDays = Math.max(5, baseDays * 0.7) // Faster spread in optimal conditions
      }
    }
    return Math.round(baseDays)
  }
  private calculateOverallRisk(predictions: PestThreat[]): 'low' | 'moderate' | 'high' | 'extreme' {
    if (predictions.length === 0) return 'low'
    const highRiskCount = predictions.filter(p => 
      p.riskLevel === 'high' || p.riskLevel === 'extreme'
    ).length
    const maxProbability = Math.max(...predictions.map(p => p.riskScore))
    if (highRiskCount >= 3 || maxProbability >= 0.8) return 'extreme'
    if (highRiskCount >= 2 || maxProbability >= 0.6) return 'high'
    if (highRiskCount >= 1 || maxProbability >= 0.4) return 'moderate'
    return 'low'
  }
  private calculatePredictionConfidence(
    environmentalFactors: EnvironmentalRiskFactor[],
    weatherForecast: any,
    threatCount: number
  ): number {
    let baseConfidence = 0.75
    // Higher confidence with more environmental data points
    const avgRiskContribution = environmentalFactors.reduce(
      (sum, factor) => sum + factor.riskContribution, 0
    ) / environmentalFactors.length
    baseConfidence += avgRiskContribution * 0.15
    // Weather forecast confidence affects our confidence
    baseConfidence *= weatherForecast.metadata.confidence
    // More threats identified = potentially better model coverage
    if (threatCount > 5) {
      baseConfidence += 0.05
    }
    return Math.min(0.95, Math.max(0.6, baseConfidence))
  }
  private generatePreventiveMeasures(
    predictions: PestThreat[],
    currentStage: string,
    overallRisk: string
  ): PreventiveMeasure[] {
    const measures: PreventiveMeasure[] = []
    // General scouting
    measures.push({
      action: 'Increase field scouting frequency',
      timing: 'Weekly',
      priority: overallRisk === 'critical' ? 'critical' : 'high',
      method: 'cultural',
      effectiveness: 0.8,
      cost: 'low',
      environmentalImpact: 'minimal',
      description: 'Regular field inspections to detect early signs of pest or disease activity'
    })
    // Weather monitoring
    measures.push({
      action: 'Monitor weather conditions closely',
      timing: 'Daily',
      priority: 'medium',
      method: 'cultural',
      effectiveness: 0.7,
      cost: 'low',
      environmentalImpact: 'minimal',
      description: 'Track temperature, humidity, and precipitation for outbreak prediction'
    })
    // Specific measures based on threats
    const fungalThreats = predictions.filter(p => p.type === 'fungal')
    if (fungalThreats.length > 0) {
      measures.push({
        action: 'Improve air circulation and reduce humidity',
        timing: 'Immediate',
        priority: 'medium',
        method: 'cultural',
        effectiveness: 0.6,
        cost: 'medium',
        environmentalImpact: 'minimal',
        description: 'Manage plant density and canopy to reduce humidity levels'
      })
    }
    const insectThreats = predictions.filter(p => p.type === 'insect')
    if (insectThreats.length > 0) {
      measures.push({
        action: 'Deploy beneficial insects or pheromone traps',
        timing: 'Before peak risk period',
        priority: 'medium',
        method: 'biological',
        effectiveness: 0.65,
        cost: 'medium',
        environmentalImpact: 'minimal',
        description: 'Biological control methods to manage pest populations'
      })
    }
    return measures.slice(0, 8) // Top 8 measures
  }
  private generateMonitoringRecommendations(
    predictions: PestThreat[],
    currentStage: string
  ): string[] {
    const recommendations: string[] = []
    recommendations.push('Scout fields weekly focusing on lower leaves and plant base')
    recommendations.push('Monitor weather conditions for temperature and humidity changes')
    if (predictions.some(p => p.type === 'fungal')) {
      recommendations.push('Check for early disease symptoms during morning inspections')
      recommendations.push('Monitor leaf wetness duration after rain events')
    }
    if (predictions.some(p => p.type === 'insect')) {
      recommendations.push('Use sticky traps or pheromone traps for pest monitoring')
      recommendations.push('Check for egg masses and early larval stages')
    }
    recommendations.push('Document findings with photos and GPS coordinates')
    recommendations.push('Report unusual pest activity to local extension services')
    return recommendations
  }
  private generateTreatmentOptions(
    threat: PestThreat,
    severity: 'low' | 'moderate' | 'high' | 'critical'
  ): Array<any> {
    const options = []
    if (threat.type === 'fungal') {
      options.push({
        method: 'organic',
        product: 'Copper-based fungicide',
        applicationRate: '2-3 L/ha',
        timing: 'Preventive or early infection',
        effectivenessRating: 0.6,
        cost: 50,
        preharvest_interval: 0,
        restrictions: ['Apply before rain', 'Not during flowering']
      })
      if (severity === 'high' || severity === 'critical') {
        options.push({
          method: 'conventional',
          product: 'Triazole fungicide',
          activeIngredient: 'Propiconazole',
          applicationRate: '1.5 L/ha',
          timing: 'Early to mid infection',
          effectivenessRating: 0.85,
          cost: 120,
          preharvest_interval: 21,
          restrictions: ['Do not exceed 2 applications per season']
        })
      }
    }
    if (threat.type === 'insect') {
      options.push({
        method: 'biological',
        product: 'Beneficial insects',
        applicationRate: 'As per supplier recommendation',
        timing: 'Early pest detection',
        effectivenessRating: 0.7,
        cost: 80,
        preharvest_interval: 0,
        restrictions: ['Weather dependent', 'Avoid broad-spectrum pesticides']
      })
      if (severity === 'moderate' || severity === 'high' || severity === 'critical') {
        options.push({
          method: 'conventional',
          product: 'Pyrethroid insecticide',
          applicationRate: '200 ml/ha',
          timing: 'During pest activity period',
          effectivenessRating: 0.8,
          cost: 90,
          preharvest_interval: 14,
          restrictions: ['Avoid application during bloom', 'Resistance management required']
        })
      }
    }
    return options
  }
  private determineUrgency(
    severity: 'low' | 'moderate' | 'high' | 'critical',
    potentialDamage: any
  ): 'immediate' | 'within_24h' | 'within_week' | 'monitor' {
    if (severity === 'critical') return 'immediate'
    if (severity === 'high' && potentialDamage.spreadRate === 'explosive') return 'within_24h'
    if (severity === 'high') return 'within_week'
    if (severity === 'moderate') return 'within_week'
    return 'monitor'
  }
  private getIntegratedApproach(threat: PestThreat): string[] {
    const approaches = [
      'Combine cultural, biological, and chemical control methods',
      'Rotate control strategies to prevent resistance development',
      'Monitor pest populations regularly to time interventions'
    ]
    if (threat.type === 'fungal') {
      approaches.push('Improve air circulation and reduce leaf wetness')
      approaches.push('Use resistant varieties when available')
    }
    if (threat.type === 'insect') {
      approaches.push('Preserve beneficial insects through selective pesticide use')
      approaches.push('Use trap crops or companion planting')
    }
    return approaches
  }
  private getResistanceManagement(threat: PestThreat): string[] {
    return [
      'Rotate between different modes of action',
      'Use tank mixes when appropriate',
      'Preserve susceptible populations in refuges',
      'Monitor for resistance development',
      'Follow label recommendations for maximum applications'
    ]
  }
  private generateSimulatedHistory(
    fieldId: string,
    cropType: string,
    years: number
  ): Array<any> {
    const outbreaks = []
    const pestList = this.pestDatabase.get(cropType.toLowerCase()) || []
    for (let year = 0; year < years; year++) {
      // Simulate 0-3 outbreaks per year
      const numOutbreaks = Math.floor(Math.random() * 4)
      for (let i = 0; i < numOutbreaks; i++) {
        const pest = pestList[Math.floor(Math.random() * pestList.length)]
        const severity = ['minor', 'moderate', 'severe'][Math.floor(Math.random() * 3)]
        outbreaks.push({
          date: new Date(new Date().getFullYear() - year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
          pestId: pest.name,
          severity,
          weatherConditions: {
            avgTemperature: 20 + Math.random() * 15,
            humidity: 60 + Math.random() * 30,
            precipitation: Math.random() * 100
          },
          cropStage: 'vegetative',
          treatmentApplied: ['scouting', 'targeted_spray'],
          controlEffectiveness: 0.6 + Math.random() * 0.3,
          yieldImpact: Math.random() * 30
        })
      }
    }
    return outbreaks
  }
  private analyzeRiskPatterns(historicalOutbreaks: Array<any>): Array<any> {
    const patterns = new Map()
    historicalOutbreaks.forEach(outbreak => {
      if (!patterns.has(outbreak.pestId)) {
        patterns.set(outbreak.pestId, {
          pestId: outbreak.pestId,
          seasonalPeak: 'summer',
          weatherTriggers: ['high_humidity', 'warm_temperature'],
          stageVulnerability: [outbreak.cropStage],
          historicalFrequency: 0
        })
      }
      const pattern = patterns.get(outbreak.pestId)
      pattern.historicalFrequency += 1
    })
    return Array.from(patterns.values())
  }
  private getCropSpecificThreats(cropType: string): string[] {
    const threatMap: { [key: string]: string[] } = {
      corn: ['Corn Borer', 'Corn Rootworm', 'Gray Leaf Spot'],
      soybean: ['Soybean Aphid', 'Soybean Rust', 'White Mold'],
      wheat: ['Wheat Rust', 'Hessian Fly', 'Fusarium Blight']
    }
    return threatMap[cropType.toLowerCase()] || ['Generic Pest', 'Disease Pressure', 'Environmental Stress']
  }
}
// Export singleton instance
export const diseasePestPrediction = new DiseasePestPredictionService()
export { DiseasePestPredictionService }