/**
 * Disease and Pest Prediction Service
 * Integrates weather data, satellite imagery, soil conditions, and historical patterns
 * to predict disease and pest outbreaks with actionable recommendations
 */

// Logger replaced with console for local development
import { prisma } from '../prisma'

export interface DiseasePrediction {
  diseaseId: string
  diseaseName: string
  commonName: string
  cropTypes: string[]
  riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'severe'
  riskScore: number // 0-100
  confidence: number // 0-100
  peakRiskPeriod: {
    start: Date
    end: Date
  }
  symptoms: string[]
  earlyWarningSignatures: {
    ndvi_decline: number // threshold
    temperature_range: [number, number]
    humidity_threshold: number
    precipitation_pattern: string
  }
  economicImpact: {
    potentialYieldLoss: number // percentage
    estimatedCostUSD: number
    timeToAction: number // days
  }
  recommendations: DiseaseRecommendation[]
}

export interface PestPrediction {
  pestId: string
  pestName: string
  commonName: string
  cropTypes: string[]
  riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'severe'
  riskScore: number // 0-100
  confidence: number // 0-100
  lifecycleStage: 'egg' | 'larva' | 'pupa' | 'adult'
  peakActivityPeriod: {
    start: Date
    end: Date
  }
  detectionMethods: string[]
  economicImpact: {
    potentialYieldLoss: number // percentage
    estimatedCostUSD: number
    timeToAction: number // days
  }
  recommendations: PestRecommendation[]
}

export interface DiseaseRecommendation {
  type: 'cultural' | 'chemical' | 'biological' | 'mechanical'
  priority: 'immediate' | 'urgent' | 'preventive' | 'monitoring'
  action: string
  timing: string
  estimatedCost: number
  effectivenessRating: number // 0-100
  organicOptions: boolean
  resistanceRisk: 'low' | 'moderate' | 'high'
}

export interface PestRecommendation {
  type: 'cultural' | 'chemical' | 'biological' | 'mechanical' | 'pheromone'
  priority: 'immediate' | 'urgent' | 'preventive' | 'monitoring'
  action: string
  timing: string
  estimatedCost: number
  effectivenessRating: number // 0-100
  organicOptions: boolean
  resistanceRisk: 'low' | 'moderate' | 'high'
  targetLifecycleStage: string[]
}

export interface FieldAnalysisContext {
  fieldId: string
  cropType: string
  plantingDate: Date
  location: {
    latitude: number
    longitude: number
  }
  currentWeather: {
    temperature: number
    humidity: number
    precipitation: number
    windSpeed: number
  }
  forecastWeather: Array<{
    date: Date
    temp_min: number
    temp_max: number
    humidity: number
    precipitation: number
  }>
  satelliteData: {
    ndvi: number
    ndviTrend: number
    stressLevel: string
    lastCapture: Date
  }
  soilConditions: {
    moisture: number
    temperature: number
    ph: number
  }
  historicalOutbreaks: Array<{
    year: number
    diseaseId: string
    severity: number
  }>
}

class DiseasePestPredictionService {
  private readonly diseaseDatabase = new Map<string, any>()
  private readonly pestDatabase = new Map<string, any>()

  constructor() {
    this.initializeDiseaseDatabase()
    this.initializePestDatabase()
  }

  /**
   * Analyze field for disease and pest risks using ML models first, then rule-based fallback
   */
  async analyzeFieldRisks(context: FieldAnalysisContext): Promise<{
    diseases: DiseasePrediction[]
    pests: PestPrediction[]
    overallRiskScore: number
    criticalActions: string[]
    monitoringRecommendations: string[]
  }> {
    try {
      console.log(`Analyzing disease/pest risks for field ${context.fieldId}`)

      // Try ML model prediction first
      try {
        const mlResult = await this.getMLModelPredictions(context)
        if (mlResult && (mlResult.diseases.length > 0 || mlResult.pests.length > 0)) {
          console.log(`Using ML model predictions for field ${context.fieldId}`)
          return mlResult
        }
      } catch (error) {
        console.warn(`ML model prediction failed for field ${context.fieldId}, using rule-based fallback:`, error)
      }

      // Fallback to rule-based analysis
      return this.getRuleBasedPredictions(context)

    } catch (error) {
      console.error(`Error analyzing field risks for ${context.fieldId}:`, error)
      return {
        diseases: [],
        pests: [],
        overallRiskScore: 0,
        criticalActions: [],
        monitoringRecommendations: []
      }
    }
  }

  /**
   * Get ML model predictions for diseases and pests
   */
  private async getMLModelPredictions(context: FieldAnalysisContext): Promise<{
    diseases: DiseasePrediction[]
    pests: PestPrediction[]
    overallRiskScore: number
    criticalActions: string[]
    monitoringRecommendations: string[]
  }> {
    const modelInput = {
      field: {
        id: context.fieldId,
        cropType: context.cropType,
        plantingDate: context.plantingDate.toISOString(),
        location: context.location
      },
      weather: {
        current: context.currentWeather,
        forecast: context.forecastWeather
      },
      satellite: {
        ndvi: context.satelliteData.ndvi,
        ndviTrend: context.satelliteData.ndviTrend,
        stressLevel: context.satelliteData.stressLevel,
        lastCapture: context.satelliteData.lastCapture.toISOString()
      },
      soil: context.soilConditions,
      historical: {
        outbreaks: context.historicalOutbreaks
      },
      season: this.getCurrentSeason(),
      growthStage: this.calculateGrowthStage(context.plantingDate),
      date: new Date().toISOString()
    }

    const response = await fetch('/api/ml/disease-pest/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelId: 'disease-pest-predictor',
        input: modelInput,
        options: {
          includeDisease: true,
          includePest: true,
          confidenceThreshold: 0.6,
          maxPredictions: 10,
          timeHorizon: 14 // days
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.success && data.prediction) {
        const mlDiseases = this.transformMLDiseases(data.prediction.diseases || [], context)
        const mlPests = this.transformMLPests(data.prediction.pests || [], context)
        
        return {
          diseases: mlDiseases.sort((a, b) => b.riskScore - a.riskScore),
          pests: mlPests.sort((a, b) => b.riskScore - a.riskScore),
          overallRiskScore: data.prediction.overallRiskScore || this.calculateOverallRisk(mlDiseases, mlPests),
          criticalActions: data.prediction.criticalActions || this.generateCriticalActions(mlDiseases, mlPests),
          monitoringRecommendations: data.prediction.monitoringRecommendations || 
            this.generateMonitoringRecommendations(mlDiseases, mlPests, context)
        }
      }
    }

    throw new Error('ML model prediction failed or returned invalid data')
  }

  /**
   * Rule-based predictions (original logic as fallback)
   */
  private async getRuleBasedPredictions(context: FieldAnalysisContext): Promise<{
    diseases: DiseasePrediction[]
    pests: PestPrediction[]
    overallRiskScore: number
    criticalActions: string[]
    monitoringRecommendations: string[]
  }> {
    // Get crop-specific diseases and pests
    const relevantDiseases = this.getRelevantDiseases(context.cropType)
    const relevantPests = this.getRelevantPests(context.cropType)

    // Calculate disease predictions
    const diseases = await Promise.all(
      relevantDiseases.map(disease => this.predictDiseaseRisk(disease, context))
    )

    // Calculate pest predictions
    const pests = await Promise.all(
      relevantPests.map(pest => this.predictPestRisk(pest, context))
    )

    // Calculate overall risk score
    const overallRiskScore = this.calculateOverallRisk(diseases, pests)

    // Generate critical actions
    const criticalActions = this.generateCriticalActions(diseases, pests)
    
    // Generate monitoring recommendations
    const monitoringRecommendations = this.generateMonitoringRecommendations(diseases, pests, context)

    return {
      diseases: diseases.sort((a, b) => b.riskScore - a.riskScore),
      pests: pests.sort((a, b) => b.riskScore - a.riskScore),
      overallRiskScore,
      criticalActions,
      monitoringRecommendations
    }
  }

  /**
   * Transform ML model disease predictions to our format
   */
  private transformMLDiseases(mlDiseases: any[], context: FieldAnalysisContext): DiseasePrediction[] {
    return mlDiseases.map((disease, index) => ({
      diseaseId: disease.id || disease.diseaseId || `ml-disease-${index}`,
      diseaseName: disease.name || disease.diseaseName || 'Unknown Disease',
      commonName: disease.commonName || disease.name || 'Unknown',
      cropTypes: disease.cropTypes || [context.cropType],
      riskLevel: this.normalizeRiskLevel(disease.riskLevel || disease.risk),
      riskScore: disease.riskScore || disease.score || Math.round((disease.confidence || 0.5) * 100),
      confidence: Math.round((disease.confidence || 0.8) * 100),
      peakRiskPeriod: {
        start: disease.peakRiskPeriod?.start ? new Date(disease.peakRiskPeriod.start) : new Date(),
        end: disease.peakRiskPeriod?.end ? new Date(disease.peakRiskPeriod.end) : 
             new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      symptoms: disease.symptoms || ['Monitor for disease symptoms'],
      earlyWarningSignatures: disease.earlyWarningSignatures || {
        ndvi_decline: 0.05,
        temperature_range: [60, 85] as [number, number],
        humidity_threshold: 80,
        precipitation_pattern: 'moderate'
      },
      economicImpact: {
        potentialYieldLoss: disease.economicImpact?.potentialYieldLoss || 
                          Math.round((disease.riskScore || 50) / 5),
        estimatedCostUSD: disease.economicImpact?.estimatedCostUSD || 
                         Math.round((disease.riskScore || 50) * 2),
        timeToAction: disease.economicImpact?.timeToAction || 
                     (disease.riskScore > 70 ? 3 : disease.riskScore > 50 ? 7 : 14)
      },
      recommendations: this.transformRecommendations(disease.recommendations, 'disease')
    }))
  }

  /**
   * Transform ML model pest predictions to our format
   */
  private transformMLPests(mlPests: any[], context: FieldAnalysisContext): PestPrediction[] {
    return mlPests.map((pest, index) => ({
      pestId: pest.id || pest.pestId || `ml-pest-${index}`,
      pestName: pest.name || pest.pestName || 'Unknown Pest',
      commonName: pest.commonName || pest.name || 'Unknown',
      cropTypes: pest.cropTypes || [context.cropType],
      riskLevel: this.normalizeRiskLevel(pest.riskLevel || pest.risk),
      riskScore: pest.riskScore || pest.score || Math.round((pest.confidence || 0.5) * 100),
      confidence: Math.round((pest.confidence || 0.8) * 100),
      lifecycleStage: pest.lifecycleStage || this.predictLifecycleStage(pest, context),
      peakActivityPeriod: {
        start: pest.peakActivityPeriod?.start ? new Date(pest.peakActivityPeriod.start) : new Date(),
        end: pest.peakActivityPeriod?.end ? new Date(pest.peakActivityPeriod.end) : 
             new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      },
      detectionMethods: pest.detectionMethods || ['Visual scouting', 'Monitoring traps'],
      economicImpact: {
        potentialYieldLoss: pest.economicImpact?.potentialYieldLoss || 
                          Math.round((pest.riskScore || 50) / 4),
        estimatedCostUSD: pest.economicImpact?.estimatedCostUSD || 
                         Math.round((pest.riskScore || 50) * 2.5),
        timeToAction: pest.economicImpact?.timeToAction || 
                     (pest.riskScore > 75 ? 2 : pest.riskScore > 50 ? 5 : 10)
      },
      recommendations: this.transformPestRecommendations(pest.recommendations)
    }))
  }

  /**
   * Helper methods for ML integration
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  private calculateGrowthStage(plantingDate: Date): string {
    const daysFromPlanting = Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysFromPlanting < 14) return 'emergence'
    if (daysFromPlanting < 30) return 'vegetative_early'
    if (daysFromPlanting < 60) return 'vegetative_late'
    if (daysFromPlanting < 90) return 'reproductive'
    if (daysFromPlanting < 120) return 'grain_filling'
    return 'maturity'
  }

  private normalizeRiskLevel(level: string | number): 'very_low' | 'low' | 'moderate' | 'high' | 'severe' {
    if (typeof level === 'number') {
      return this.scoreToRiskLevel(level)
    }
    
    const riskMap: Record<string, 'very_low' | 'low' | 'moderate' | 'high' | 'severe'> = {
      'very_low': 'very_low',
      'low': 'low',
      'medium': 'moderate',
      'moderate': 'moderate',
      'high': 'high',
      'severe': 'severe',
      'critical': 'severe'
    }
    
    return riskMap[level?.toLowerCase()] || 'moderate'
  }

  private transformRecommendations(recommendations: any[], type: 'disease' | 'pest'): any[] {
    if (!Array.isArray(recommendations)) return []
    
    return recommendations.map(rec => ({
      type: rec.type || 'cultural',
      priority: rec.priority || 'preventive',
      action: rec.action || rec.description || 'Monitor conditions',
      timing: rec.timing || 'As needed',
      estimatedCost: rec.estimatedCost || rec.cost || 15,
      effectivenessRating: rec.effectivenessRating || rec.effectiveness || 70,
      organicOptions: rec.organicOptions !== undefined ? rec.organicOptions : true,
      resistanceRisk: rec.resistanceRisk || 'low'
    }))
  }

  private transformPestRecommendations(recommendations: any[]): PestRecommendation[] {
    const baseRecs = this.transformRecommendations(recommendations, 'pest')
    
    return baseRecs.map(rec => ({
      ...rec,
      targetLifecycleStage: rec.targetLifecycleStage || ['larva', 'adult']
    }))
  }

  /**
   * Get farm-wide disease and pest analysis
   */
  async analyzeFarmRisks(farmId: string): Promise<{
    farmRiskSummary: {
      overallRiskLevel: 'low' | 'moderate' | 'high' | 'severe'
      highRiskFields: string[]
      immediateActions: number
      monitoring: number
    }
    topThreats: Array<{
      name: string
      type: 'disease' | 'pest'
      riskLevel: string
      affectedFields: number
      economicImpact: number
    }>
    seasonalOutlook: {
      nextWeek: string
      nextMonth: string
      nextSeason: string
    }
  }> {
    try {
      // Get farm fields with context
      const farm = await prisma.farm.findUnique({
        where: { id: farmId },
        include: {
          fields: {
            include: {
              crops: {
                where: { status: { in: ['PLANTED', 'GROWING'] } }
              }
            }
          }
        }
      })

      if (!farm) {
        throw new Error(`Farm ${farmId} not found`)
      }

      const fieldAnalyses = []
      for (const field of farm.fields) {
        // Build context for each field
        const context = await this.buildFieldContext(field, farm)
        if (context) {
          const analysis = await this.analyzeFieldRisks(context)
          fieldAnalyses.push({ field, analysis })
        }
      }

      // Aggregate farm-wide risks
      const farmRiskSummary = this.aggregateFarmRisks(fieldAnalyses)
      const topThreats = this.identifyTopThreats(fieldAnalyses)
      const seasonalOutlook = await this.generateSeasonalOutlook(farm, fieldAnalyses)

      return {
        farmRiskSummary,
        topThreats,
        seasonalOutlook
      }

    } catch (error) {
      console.error(`Error analyzing farm risks for ${farmId}:`, error)
      throw error
    }
  }

  private async predictDiseaseRisk(disease: any, context: FieldAnalysisContext): Promise<DiseasePrediction> {
    let riskScore = 0
    let confidence = 50

    // Weather-based risk factors
    const weatherRisk = this.calculateWeatherRisk(disease, context.currentWeather, context.forecastWeather)
    riskScore += weatherRisk.score * 0.35
    confidence += weatherRisk.confidence * 0.3

    // Satellite-based risk factors (early detection)
    const satelliteRisk = this.calculateSatelliteRisk(disease, context.satelliteData)
    riskScore += satelliteRisk.score * 0.25
    confidence += satelliteRisk.confidence * 0.25

    // Soil-based risk factors
    const soilRisk = this.calculateSoilRisk(disease, context.soilConditions)
    riskScore += soilRisk.score * 0.2
    confidence += soilRisk.confidence * 0.2

    // Historical risk patterns
    const historicalRisk = this.calculateHistoricalRisk(disease, context.historicalOutbreaks)
    riskScore += historicalRisk.score * 0.2
    confidence += historicalRisk.confidence * 0.25

    // Crop growth stage susceptibility
    const growthStageRisk = this.calculateGrowthStageRisk(disease, context.plantingDate)
    riskScore += growthStageRisk * 0.1

    riskScore = Math.min(100, Math.max(0, riskScore))
    confidence = Math.min(100, Math.max(30, confidence))

    return {
      diseaseId: disease.id,
      diseaseName: disease.name,
      commonName: disease.commonName,
      cropTypes: disease.cropTypes,
      riskLevel: this.scoreToRiskLevel(riskScore),
      riskScore: Math.round(riskScore),
      confidence: Math.round(confidence),
      peakRiskPeriod: this.calculatePeakRiskPeriod(disease, context),
      symptoms: disease.symptoms,
      earlyWarningSignatures: disease.earlyWarningSignatures,
      economicImpact: this.calculateEconomicImpact(disease, riskScore, context),
      recommendations: this.generateDiseaseRecommendations(disease, riskScore, context)
    }
  }

  private async predictPestRisk(pest: any, context: FieldAnalysisContext): Promise<PestPrediction> {
    let riskScore = 0
    let confidence = 50

    // Temperature-based lifecycle modeling
    const lifecycleRisk = this.calculateLifecycleRisk(pest, context.currentWeather, context.forecastWeather)
    riskScore += lifecycleRisk.score * 0.4
    confidence += lifecycleRisk.confidence * 0.35

    // Satellite detection of pest damage
    const satelliteRisk = this.calculatePestSatelliteRisk(pest, context.satelliteData)
    riskScore += satelliteRisk.score * 0.3
    confidence += satelliteRisk.confidence * 0.3

    // Host plant attractiveness
    const hostRisk = this.calculateHostPlantRisk(pest, context.cropType, context.plantingDate)
    riskScore += hostRisk * 0.2

    // Historical outbreak patterns
    const historicalRisk = this.calculatePestHistoricalRisk(pest, context.historicalOutbreaks)
    riskScore += historicalRisk.score * 0.1
    confidence += historicalRisk.confidence * 0.35

    riskScore = Math.min(100, Math.max(0, riskScore))
    confidence = Math.min(100, Math.max(30, confidence))

    return {
      pestId: pest.id,
      pestName: pest.name,
      commonName: pest.commonName,
      cropTypes: pest.cropTypes,
      riskLevel: this.scoreToRiskLevel(riskScore),
      riskScore: Math.round(riskScore),
      confidence: Math.round(confidence),
      lifecycleStage: this.predictLifecycleStage(pest, context),
      peakActivityPeriod: this.calculatePeakActivityPeriod(pest, context),
      detectionMethods: pest.detectionMethods,
      economicImpact: this.calculatePestEconomicImpact(pest, riskScore, context),
      recommendations: this.generatePestRecommendations(pest, riskScore, context)
    }
  }

  private calculateWeatherRisk(disease: any, current: any, forecast: any[]): { score: number; confidence: number } {
    const optimalConditions = disease.optimalConditions
    let score = 0
    let confidence = 70

    // Temperature suitability
    if (current.temperature >= optimalConditions.tempMin && current.temperature <= optimalConditions.tempMax) {
      score += 30
    }

    // Humidity suitability
    if (current.humidity >= optimalConditions.humidityMin) {
      score += 25
    }

    // Precipitation patterns
    const recentPrecip = forecast.slice(0, 7).reduce((sum, day) => sum + day.precipitation, 0)
    if (recentPrecip >= optimalConditions.precipitationMin) {
      score += 20
    }

    // Leaf wetness duration (estimated from humidity and precipitation)
    const leafWetnessDuration = this.estimateLeafWetness(current, forecast.slice(0, 3))
    if (leafWetnessDuration >= optimalConditions.leafWetnessHours) {
      score += 25
      confidence += 10
    }

    return { score, confidence }
  }

  private initializeDiseaseDatabase() {
    // Corn diseases
    this.diseaseDatabase.set('corn_leaf_blight', {
      id: 'corn_leaf_blight',
      name: 'Northern Corn Leaf Blight',
      commonName: 'Leaf Blight',
      cropTypes: ['corn', 'maize'],
      symptoms: ['Cigar-shaped lesions on leaves', 'Gray-green spots', 'Leaf death from bottom up'],
      optimalConditions: {
        tempMin: 64, tempMax: 81, humidityMin: 80, precipitationMin: 0.1, leafWetnessHours: 12
      },
      earlyWarningSignatures: {
        ndvi_decline: 0.05, temperature_range: [64, 81], humidity_threshold: 80, precipitation_pattern: 'frequent_light'
      }
    })

    this.diseaseDatabase.set('corn_rust', {
      id: 'corn_rust',
      name: 'Common Rust',
      commonName: 'Rust',
      cropTypes: ['corn', 'maize'],
      symptoms: ['Orange-brown pustules on leaves', 'Reduced photosynthesis', 'Premature leaf death'],
      optimalConditions: {
        tempMin: 60, tempMax: 77, humidityMin: 95, precipitationMin: 0.05, leafWetnessHours: 6
      },
      earlyWarningSignatures: {
        ndvi_decline: 0.03, temperature_range: [60, 77], humidity_threshold: 95, precipitation_pattern: 'light_frequent'
      }
    })

    // Soybean diseases
    this.diseaseDatabase.set('soybean_rust', {
      id: 'soybean_rust',
      name: 'Soybean Rust',
      commonName: 'Asian Soybean Rust',
      cropTypes: ['soybean', 'soybeans'],
      symptoms: ['Small tan lesions with raised pustules', 'Premature defoliation', 'Yield reduction'],
      optimalConditions: {
        tempMin: 59, tempMax: 86, humidityMin: 95, precipitationMin: 0.1, leafWetnessHours: 10
      },
      earlyWarningSignatures: {
        ndvi_decline: 0.1, temperature_range: [59, 86], humidity_threshold: 95, precipitation_pattern: 'sustained_moisture'
      }
    })

    this.diseaseDatabase.set('frogeye_leaf_spot', {
      id: 'frogeye_leaf_spot',
      name: 'Frogeye Leaf Spot',
      commonName: 'Frogeye',
      cropTypes: ['soybean', 'soybeans'],
      symptoms: ['Circular lesions with gray centers', 'Dark borders around spots', 'Defoliation in severe cases'],
      optimalConditions: {
        tempMin: 77, tempMax: 86, humidityMin: 85, precipitationMin: 0.2, leafWetnessHours: 12
      },
      earlyWarningSignatures: {
        ndvi_decline: 0.07, temperature_range: [77, 86], humidity_threshold: 85, precipitation_pattern: 'warm_humid'
      }
    })

    // Wheat diseases
    this.diseaseDatabase.set('wheat_stripe_rust', {
      id: 'wheat_stripe_rust',
      name: 'Stripe Rust',
      commonName: 'Yellow Rust',
      cropTypes: ['wheat', 'winter_wheat', 'spring_wheat'],
      symptoms: ['Yellow stripes on leaves', 'Powdery yellow spores', 'Reduced grain fill'],
      optimalConditions: {
        tempMin: 50, tempMax: 65, humidityMin: 90, precipitationMin: 0.1, leafWetnessHours: 8
      },
      earlyWarningSignatures: {
        ndvi_decline: 0.08, temperature_range: [50, 65], humidity_threshold: 90, precipitation_pattern: 'cool_moist'
      }
    })
  }

  private initializePestDatabase() {
    // Corn pests
    this.pestDatabase.set('corn_borer', {
      id: 'corn_borer',
      name: 'European Corn Borer',
      commonName: 'Corn Borer',
      cropTypes: ['corn', 'maize'],
      lifecycleStages: ['egg', 'larva', 'pupa', 'adult'],
      developmentThresholds: { baseTemp: 50, maxTemp: 86, degreeDay: 1550 },
      detectionMethods: ['Pheromone traps', 'Visual scouting', 'Egg mass monitoring', 'Damage assessment'],
      peakActivity: { monthStart: 6, monthEnd: 8 }
    })

    this.pestDatabase.set('corn_rootworm', {
      id: 'corn_rootworm',
      name: 'Corn Rootworm',
      commonName: 'Rootworm',
      cropTypes: ['corn', 'maize'],
      lifecycleStages: ['egg', 'larva', 'pupa', 'adult'],
      developmentThresholds: { baseTemp: 52, maxTemp: 86, degreeDay: 1200 },
      detectionMethods: ['Sticky traps', 'Root damage assessment', 'Adult beetle counts', 'Soil sampling'],
      peakActivity: { monthStart: 7, monthEnd: 9 }
    })

    // Soybean pests
    this.pestDatabase.set('soybean_aphid', {
      id: 'soybean_aphid',
      name: 'Soybean Aphid',
      commonName: 'Aphid',
      cropTypes: ['soybean', 'soybeans'],
      lifecycleStages: ['egg', 'nymph', 'adult'],
      developmentThresholds: { baseTemp: 48, maxTemp: 95, degreeDay: 200 },
      detectionMethods: ['Visual counts', 'Sticky traps', 'Natural enemy assessment', 'Plant stress monitoring'],
      peakActivity: { monthStart: 6, monthEnd: 8 }
    })

    this.pestDatabase.set('bean_leaf_beetle', {
      id: 'bean_leaf_beetle',
      name: 'Bean Leaf Beetle',
      commonName: 'Leaf Beetle',
      cropTypes: ['soybean', 'soybeans'],
      lifecycleStages: ['egg', 'larva', 'pupa', 'adult'],
      developmentThresholds: { baseTemp: 50, maxTemp: 85, degreeDay: 1400 },
      detectionMethods: ['Sweep net sampling', 'Visual defoliation assessment', 'Pod feeding damage', 'Adult counts'],
      peakActivity: { monthStart: 5, monthEnd: 9 }
    })

    // Wheat pests
    this.pestDatabase.set('hessian_fly', {
      id: 'hessian_fly',
      name: 'Hessian Fly',
      commonName: 'Hessian Fly',
      cropTypes: ['wheat', 'winter_wheat', 'spring_wheat'],
      lifecycleStages: ['egg', 'larva', 'pupa', 'adult'],
      developmentThresholds: { baseTemp: 32, maxTemp: 75, degreeDay: 450 },
      detectionMethods: ['Egg monitoring', 'Tiller examination', 'Puparia counts', 'Adult emergence tracking'],
      peakActivity: { monthStart: 4, monthEnd: 6 }
    })
  }

  // Helper methods
  private getRelevantDiseases(cropType: string) {
    return Array.from(this.diseaseDatabase.values()).filter(disease => 
      disease.cropTypes.includes(cropType.toLowerCase()) || 
      disease.cropTypes.includes(cropType.toLowerCase().replace('_', ''))
    )
  }

  private getRelevantPests(cropType: string) {
    return Array.from(this.pestDatabase.values()).filter(pest => 
      pest.cropTypes.includes(cropType.toLowerCase()) || 
      pest.cropTypes.includes(cropType.toLowerCase().replace('_', ''))
    )
  }

  private scoreToRiskLevel(score: number): 'very_low' | 'low' | 'moderate' | 'high' | 'severe' {
    if (score < 20) return 'very_low'
    if (score < 40) return 'low'
    if (score < 60) return 'moderate'
    if (score < 80) return 'high'
    return 'severe'
  }

  private scoreToFarmRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'severe' {
    if (score < 40) return 'low'
    if (score < 60) return 'moderate'
    if (score < 80) return 'high'
    return 'severe'
  }

  private calculateSatelliteRisk(disease: any, satelliteData: any): { score: number; confidence: number } {
    let score = 0
    let confidence = 60

    // NDVI decline indicating stress
    if (satelliteData.ndviTrend < -disease.earlyWarningSignatures.ndvi_decline) {
      score += 40
      confidence += 20
    }

    // Current stress level
    if (satelliteData.stressLevel === 'HIGH' || satelliteData.stressLevel === 'SEVERE') {
      score += 30
      confidence += 15
    }

    return { score, confidence }
  }

  private calculateSoilRisk(disease: any, soilConditions: any): { score: number; confidence: number } {
    // Simplified soil risk - could be expanded based on disease-specific soil preferences
    let score = 10
    let confidence = 50

    // Some diseases favor certain soil conditions
    if (soilConditions.moisture > 25 && disease.id.includes('rust')) {
      score += 20
      confidence += 10
    }

    return { score, confidence }
  }

  private calculateHistoricalRisk(disease: any, historicalOutbreaks: any[]): { score: number; confidence: number } {
    const relevantOutbreaks = historicalOutbreaks.filter(outbreak => outbreak.diseaseId === disease.id)
    
    if (relevantOutbreaks.length === 0) {
      return { score: 0, confidence: 30 }
    }

    const avgSeverity = relevantOutbreaks.reduce((sum, outbreak) => sum + outbreak.severity, 0) / relevantOutbreaks.length
    const recentOutbreaks = relevantOutbreaks.filter(outbreak => (new Date().getFullYear() - outbreak.year) <= 3)
    
    let score = avgSeverity * 0.3
    let confidence = 60

    if (recentOutbreaks.length > 0) {
      score += 20
      confidence += 20
    }

    return { score, confidence }
  }

  private calculateGrowthStageRisk(disease: any, plantingDate: Date): number {
    // Simplified growth stage risk calculation
    const daysFromPlanting = Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Different diseases have different susceptible growth stages
    if (disease.id.includes('rust') && daysFromPlanting > 60 && daysFromPlanting < 120) {
      return 15 // High risk during reproductive stages
    }
    
    return 5
  }

  private calculatePeakRiskPeriod(disease: any, context: FieldAnalysisContext): { start: Date; end: Date } {
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + 14) // Default 2-week window
    
    return { start, end }
  }

  private calculateEconomicImpact(disease: any, riskScore: number, context: FieldAnalysisContext) {
    const baseYieldLoss = disease.id.includes('rust') ? 15 : 10 // Rust diseases typically more severe
    const potentialYieldLoss = (riskScore / 100) * baseYieldLoss
    
    return {
      potentialYieldLoss: Math.round(potentialYieldLoss),
      estimatedCostUSD: Math.round(potentialYieldLoss * 100), // Simplified calculation
      timeToAction: riskScore > 60 ? 3 : riskScore > 40 ? 7 : 14
    }
  }

  private generateDiseaseRecommendations(disease: any, riskScore: number, context: FieldAnalysisContext): DiseaseRecommendation[] {
    const recommendations: DiseaseRecommendation[] = []

    if (riskScore > 70) {
      recommendations.push({
        type: 'chemical',
        priority: 'immediate',
        action: `Apply fungicide targeted for ${disease.commonName}`,
        timing: 'Within 2-3 days',
        estimatedCost: 25,
        effectivenessRating: 85,
        organicOptions: false,
        resistanceRisk: 'moderate'
      })
    }

    if (riskScore > 40) {
      recommendations.push({
        type: 'cultural',
        priority: 'preventive',
        action: 'Increase field scouting frequency',
        timing: 'Immediate',
        estimatedCost: 5,
        effectivenessRating: 70,
        organicOptions: true,
        resistanceRisk: 'low'
      })
    }

    return recommendations
  }

  // Additional helper methods for pest predictions...
  private calculateLifecycleRisk(pest: any, current: any, forecast: any[]): { score: number; confidence: number } {
    // Simplified degree day calculation for pest development
    const avgTemp = (current.temperature + forecast.slice(0, 7).reduce((sum, day) => sum + (day.temp_min + day.temp_max) / 2, 0) / 7) / 2
    
    let score = 0
    let confidence = 70

    if (avgTemp >= pest.developmentThresholds.baseTemp && avgTemp <= pest.developmentThresholds.maxTemp) {
      score += 40
      confidence += 15
    }

    return { score, confidence }
  }

  private calculatePestSatelliteRisk(pest: any, satelliteData: any): { score: number; confidence: number } {
    // Similar to disease but may look for different patterns
    return this.calculateSatelliteRisk(pest, satelliteData)
  }

  private calculateHostPlantRisk(pest: any, cropType: string, plantingDate: Date): number {
    // Host plant attractiveness based on growth stage
    const daysFromPlanting = Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (pest.cropTypes.includes(cropType.toLowerCase()) && daysFromPlanting > 30) {
      return 25
    }
    
    return 5
  }

  private calculatePestHistoricalRisk(pest: any, historicalOutbreaks: any[]): { score: number; confidence: number } {
    // Similar to disease historical risk
    return this.calculateHistoricalRisk(pest, historicalOutbreaks)
  }

  private predictLifecycleStage(pest: any, context: FieldAnalysisContext): 'egg' | 'larva' | 'pupa' | 'adult' {
    // Simplified - in practice would use degree day models
    const month = new Date().getMonth() + 1
    
    if (month >= pest.peakActivity.monthStart && month <= pest.peakActivity.monthEnd) {
      return 'adult'
    }
    
    return 'egg'
  }

  private calculatePeakActivityPeriod(pest: any, context: FieldAnalysisContext): { start: Date; end: Date } {
    const start = new Date()
    start.setMonth(pest.peakActivity.monthStart - 1)
    
    const end = new Date()
    end.setMonth(pest.peakActivity.monthEnd - 1)
    
    return { start, end }
  }

  private calculatePestEconomicImpact(pest: any, riskScore: number, context: FieldAnalysisContext) {
    const baseYieldLoss = pest.id.includes('rootworm') ? 20 : 12 // Rootworm typically more severe
    const potentialYieldLoss = (riskScore / 100) * baseYieldLoss
    
    return {
      potentialYieldLoss: Math.round(potentialYieldLoss),
      estimatedCostUSD: Math.round(potentialYieldLoss * 120), // Higher cost than diseases
      timeToAction: riskScore > 70 ? 2 : riskScore > 50 ? 5 : 10
    }
  }

  private generatePestRecommendations(pest: any, riskScore: number, context: FieldAnalysisContext): PestRecommendation[] {
    const recommendations: PestRecommendation[] = []

    if (riskScore > 75) {
      recommendations.push({
        type: 'chemical',
        priority: 'immediate',
        action: `Apply insecticide for ${pest.commonName}`,
        timing: 'Within 1-2 days',
        estimatedCost: 30,
        effectivenessRating: 90,
        organicOptions: false,
        resistanceRisk: 'moderate',
        targetLifecycleStage: ['larva', 'adult']
      })
    }

    if (riskScore > 50) {
      recommendations.push({
        type: 'biological',
        priority: 'preventive',
        action: 'Monitor beneficial insect populations',
        timing: 'This week',
        estimatedCost: 10,
        effectivenessRating: 65,
        organicOptions: true,
        resistanceRisk: 'low',
        targetLifecycleStage: ['egg', 'larva']
      })
    }

    return recommendations
  }

  private estimateLeafWetness(current: any, forecast: any[]): number {
    // Simplified leaf wetness calculation
    let wetHours = 0
    
    if (current.humidity > 95) wetHours += 4
    if (current.precipitation > 0) wetHours += 6
    
    forecast.forEach(day => {
      if (day.precipitation > 0) wetHours += 8
      if (day.humidity > 90) wetHours += 2
    })
    
    return wetHours
  }

  private calculateOverallRisk(diseases: DiseasePrediction[], pests: PestPrediction[]): number {
    const allRisks = [...diseases.map(d => d.riskScore), ...pests.map(p => p.riskScore)]
    if (allRisks.length === 0) return 0
    
    return Math.round(allRisks.reduce((sum, score) => sum + score, 0) / allRisks.length)
  }

  private generateCriticalActions(diseases: DiseasePrediction[], pests: PestPrediction[]): string[] {
    const actions: string[] = []
    
    diseases.filter(d => d.riskScore > 70).forEach(disease => {
      actions.push(`Immediate action needed for ${disease.commonName}`)
    })
    
    pests.filter(p => p.riskScore > 70).forEach(pest => {
      actions.push(`Urgent pest management for ${pest.commonName}`)
    })
    
    return actions.slice(0, 5)
  }

  private generateMonitoringRecommendations(diseases: DiseasePrediction[], pests: PestPrediction[], context: FieldAnalysisContext): string[] {
    const recommendations: string[] = []
    
    if (diseases.length > 0) {
      recommendations.push('Increase disease scouting frequency to twice weekly')
    }
    
    if (pests.length > 0) {
      recommendations.push('Set up pest monitoring traps')
    }
    
    recommendations.push('Monitor weather conditions for rapid changes')
    
    return recommendations.slice(0, 4)
  }

  private async buildFieldContext(field: any, farm: any): Promise<FieldAnalysisContext | null> {
    try {
      // Get current crop
      const currentCrop = field.crops[0]
      if (!currentCrop) return null

      // Mock context - in production would fetch real data
      return {
        fieldId: field.id,
        cropType: currentCrop.cropType,
        plantingDate: currentCrop.plantingDate,
        location: {
          latitude: farm.latitude || 40.7128,
          longitude: farm.longitude || -74.0060
        },
        currentWeather: {
          temperature: 75,
          humidity: 65,
          precipitation: 0.1,
          windSpeed: 8
        },
        forecastWeather: [], // Would be populated with real forecast
        satelliteData: {
          ndvi: 0.75,
          ndviTrend: -0.02,
          stressLevel: 'MODERATE',
          lastCapture: new Date()
        },
        soilConditions: {
          moisture: 22,
          temperature: 18,
          ph: 6.5
        },
        historicalOutbreaks: []
      }
    } catch (error) {
      console.error(`Error building context for field ${field.id}:`, error)
      return null
    }
  }

  private aggregateFarmRisks(fieldAnalyses: any[]) {
    const highRiskFields = fieldAnalyses.filter(analysis => 
      analysis.analysis.overallRiskScore > 60
    ).map(analysis => analysis.field.name)

    const immediateActions = fieldAnalyses.reduce((sum, analysis) => 
      sum + analysis.analysis.criticalActions.length, 0
    )

    const overallRisk = fieldAnalyses.length > 0 
      ? fieldAnalyses.reduce((sum, analysis) => sum + analysis.analysis.overallRiskScore, 0) / fieldAnalyses.length
      : 0

    return {
      overallRiskLevel: this.scoreToFarmRiskLevel(overallRisk),
      highRiskFields,
      immediateActions,
      monitoring: fieldAnalyses.length
    }
  }

  private identifyTopThreats(fieldAnalyses: any[]) {
    const threatMap = new Map()

    fieldAnalyses.forEach(analysis => {
      analysis.analysis.diseases.forEach((disease: DiseasePrediction) => {
        const key = disease.diseaseName
        if (!threatMap.has(key)) {
          threatMap.set(key, {
            name: disease.commonName,
            type: 'disease',
            riskLevel: disease.riskLevel,
            affectedFields: 0,
            economicImpact: 0
          })
        }
        const threat = threatMap.get(key)
        threat.affectedFields++
        threat.economicImpact += disease.economicImpact.estimatedCostUSD
      })

      analysis.analysis.pests.forEach((pest: PestPrediction) => {
        const key = pest.pestName
        if (!threatMap.has(key)) {
          threatMap.set(key, {
            name: pest.commonName,
            type: 'pest',
            riskLevel: pest.riskLevel,
            affectedFields: 0,
            economicImpact: 0
          })
        }
        const threat = threatMap.get(key)
        threat.affectedFields++
        threat.economicImpact += pest.economicImpact.estimatedCostUSD
      })
    })

    return Array.from(threatMap.values())
      .sort((a, b) => b.economicImpact - a.economicImpact)
      .slice(0, 3)
  }

  private async generateSeasonalOutlook(farm: any, fieldAnalyses: any[]) {
    return {
      nextWeek: 'Moderate disease pressure expected with current weather patterns',
      nextMonth: 'Peak pest activity season approaching - increase monitoring',
      nextSeason: 'Consider resistant varieties for next planting season'
    }
  }
}

export const diseasePestPredictionService = new DiseasePestPredictionService()