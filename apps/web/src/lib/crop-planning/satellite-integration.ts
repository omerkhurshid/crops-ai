// NDVI Satellite Data Integration for Crop Planning
// Uses existing satellite services to enhance crop planning decisions

export interface NDVIData {
  date: string
  averageNDVI: number
  minNDVI: number
  maxNDVI: number
  stressAreas: number // percentage of area under stress
  vigourZones: {
    low: number    // 0.0 - 0.3 NDVI
    moderate: number // 0.3 - 0.6 NDVI  
    high: number   // 0.6 - 0.9 NDVI
    excellent: number // 0.9+ NDVI
  }
  trends: {
    weekly: number // percent change from last week
    monthly: number // percent change from last month
    seasonal: number // percent change from same time last year
  }
}

export interface FieldHealthAnalysis {
  fieldId: string
  currentHealth: number // 0-100 score
  healthTrend: 'improving' | 'stable' | 'declining'
  stressFactors: {
    type: 'water' | 'nutrient' | 'pest' | 'disease' | 'weather'
    severity: 'low' | 'moderate' | 'high'
    confidence: number // 0-100
    recommendations: string[]
  }[]
  yieldPrediction: {
    predicted: number
    unit: string
    confidence: number
    factors: string[]
  }
  rotationRecommendations: {
    nextSeason: string[]
    reasoning: string[]
  }
}

// Analyze NDVI data to provide crop planning insights
export function analyzeNDVIForPlanning(
  ndviHistory: NDVIData[],
  fieldId: string,
  currentCrop?: string
): FieldHealthAnalysis {
  const latestNDVI = ndviHistory[ndviHistory.length - 1]
  const previousNDVI = ndviHistory[ndviHistory.length - 2]
  
  // Calculate health score based on NDVI values
  const healthScore = calculateHealthScore(latestNDVI.averageNDVI)
  
  // Determine health trend
  let healthTrend: 'improving' | 'stable' | 'declining' = 'stable'
  if (latestNDVI.trends.weekly > 5) {
    healthTrend = 'improving'
  } else if (latestNDVI.trends.weekly < -5) {
    healthTrend = 'declining'
  }
  
  // Identify stress factors
  const stressFactors = identifyStressFactors(ndviHistory, latestNDVI)
  
  // Generate yield prediction
  const yieldPrediction = predictYieldFromNDVI(ndviHistory, currentCrop)
  
  // Generate rotation recommendations
  const rotationRecommendations = generateRotationRecommendations(
    ndviHistory,
    healthScore,
    stressFactors
  )
  
  return {
    fieldId,
    currentHealth: healthScore,
    healthTrend,
    stressFactors,
    yieldPrediction,
    rotationRecommendations
  }
}

function calculateHealthScore(averageNDVI: number): number {
  // Convert NDVI (0-1) to health score (0-100)
  // Based on typical crop NDVI ranges:
  // 0.0-0.2: Very poor (bare soil, dead vegetation)
  // 0.2-0.4: Poor (stressed vegetation)
  // 0.4-0.6: Moderate (average vegetation)
  // 0.6-0.8: Good (healthy vegetation)
  // 0.8-1.0: Excellent (very healthy, dense vegetation)
  
  if (averageNDVI < 0.2) return Math.max(0, averageNDVI * 50) // 0-10
  if (averageNDVI < 0.4) return 10 + ((averageNDVI - 0.2) / 0.2) * 30 // 10-40
  if (averageNDVI < 0.6) return 40 + ((averageNDVI - 0.4) / 0.2) * 30 // 40-70
  if (averageNDVI < 0.8) return 70 + ((averageNDVI - 0.6) / 0.2) * 20 // 70-90
  return 90 + Math.min(10, ((averageNDVI - 0.8) / 0.2) * 10) // 90-100
}

function identifyStressFactors(
  ndviHistory: NDVIData[],
  latestNDVI: NDVIData
): FieldHealthAnalysis['stressFactors'] {
  const stressFactors: FieldHealthAnalysis['stressFactors'] = []
  
  // Water stress indicators
  if (latestNDVI.stressAreas > 20 && latestNDVI.trends.weekly < -3) {
    stressFactors.push({
      type: 'water',
      severity: latestNDVI.stressAreas > 40 ? 'high' : 'moderate',
      confidence: 75,
      recommendations: [
        'Check soil moisture levels',
        'Consider irrigation scheduling',
        'Monitor weather forecasts for rainfall'
      ]
    })
  }
  
  // Nutrient stress (typically shows as uniform yellowing/poor growth)
  const consistentLowNDVI = ndviHistory.slice(-4).every(data => data.averageNDVI < 0.5)
  if (consistentLowNDVI && latestNDVI.trends.monthly < -10) {
    stressFactors.push({
      type: 'nutrient',
      severity: latestNDVI.averageNDVI < 0.3 ? 'high' : 'moderate',
      confidence: 65,
      recommendations: [
        'Consider soil testing for nutrient levels',
        'Evaluate fertilization program',
        'Check for signs of nitrogen deficiency'
      ]
    })
  }
  
  // Disease/pest stress (typically shows as patchy, irregular patterns)
  if (latestNDVI.stressAreas > 15 && latestNDVI.maxNDVI - latestNDVI.minNDVI > 0.4) {
    stressFactors.push({
      type: 'disease',
      severity: latestNDVI.stressAreas > 30 ? 'high' : 'moderate',
      confidence: 60,
      recommendations: [
        'Scout fields for disease symptoms',
        'Check for pest damage',
        'Consider targeted treatment of affected areas'
      ]
    })
  }
  
  // Weather stress (rapid NDVI changes often correlate with weather events)
  if (Math.abs(latestNDVI.trends.weekly) > 15) {
    stressFactors.push({
      type: 'weather',
      severity: Math.abs(latestNDVI.trends.weekly) > 25 ? 'high' : 'moderate',
      confidence: 70,
      recommendations: [
        'Review recent weather conditions',
        'Assess for heat, cold, or storm damage',
        'Monitor recovery in coming weeks'
      ]
    })
  }
  
  return stressFactors
}

function predictYieldFromNDVI(
  ndviHistory: NDVIData[],
  currentCrop?: string
): FieldHealthAnalysis['yieldPrediction'] {
  const latestNDVI = ndviHistory[ndviHistory.length - 1]
  
  // Basic yield prediction based on NDVI
  // These coefficients would be calibrated with actual yield data over time
  let baseYield = 100 // base yield in appropriate units
  let unit = 'bu/acre'
  
  // Adjust base yield by crop type
  if (currentCrop) {
    switch (currentCrop.toLowerCase()) {
      case 'corn':
        baseYield = 180
        unit = 'bu/acre'
        break
      case 'soybean':
        baseYield = 50
        unit = 'bu/acre'
        break
      case 'wheat':
        baseYield = 60
        unit = 'bu/acre'
        break
      default:
        baseYield = 100
        unit = 'units/acre'
    }
  }
  
  // Apply NDVI-based adjustment
  const ndviMultiplier = Math.max(0.3, Math.min(1.4, latestNDVI.averageNDVI * 2))
  
  // Apply trend-based adjustment
  const trendMultiplier = 1 + (latestNDVI.trends.seasonal / 100)
  
  const predictedYield = Math.round(baseYield * ndviMultiplier * trendMultiplier)
  
  // Calculate confidence based on data quality and consistency
  let confidence = 60
  if (ndviHistory.length >= 8) confidence += 15 // More data points
  if (latestNDVI.stressAreas < 10) confidence += 15 // Low stress areas
  if (Math.abs(latestNDVI.trends.weekly) < 5) confidence += 10 // Stable trends
  
  const factors = []
  if (latestNDVI.averageNDVI > 0.7) factors.push('Strong vegetation health')
  if (latestNDVI.trends.seasonal > 10) factors.push('Positive seasonal growth trend')
  if (latestNDVI.stressAreas < 10) factors.push('Low stress area percentage')
  if (latestNDVI.vigourZones.high + latestNDVI.vigourZones.excellent > 60) {
    factors.push('High percentage of vigorous growth zones')
  }
  
  return {
    predicted: predictedYield,
    unit,
    confidence: Math.min(95, confidence),
    factors
  }
}

function generateRotationRecommendations(
  ndviHistory: NDVIData[],
  healthScore: number,
  stressFactors: FieldHealthAnalysis['stressFactors']
): FieldHealthAnalysis['rotationRecommendations'] {
  const recommendations: string[] = []
  const reasoning: string[] = []
  
  // Base recommendations on field health
  if (healthScore < 50) {
    recommendations.push('Cover crops (crimson clover, winter rye)')
    recommendations.push('Soil-building legumes')
    reasoning.push('Field shows signs of stress - focus on soil health recovery')
    reasoning.push('Cover crops will add organic matter and prevent erosion')
  } else if (healthScore > 80) {
    recommendations.push('High-value crops (vegetables, specialty grains)')
    recommendations.push('Intensive production crops')
    reasoning.push('Field is in excellent condition for demanding crops')
  } else {
    recommendations.push('Balanced rotation crops (corn, soybeans, small grains)')
    reasoning.push('Field is in good condition for standard rotation')
  }
  
  // Adjust based on specific stress factors
  const hasWaterStress = stressFactors.some(factor => factor.type === 'water')
  const hasNutrientStress = stressFactors.some(factor => factor.type === 'nutrient')
  const hasDiseaseStress = stressFactors.some(factor => factor.type === 'disease')
  
  if (hasWaterStress) {
    recommendations.push('Drought-tolerant crops (sorghum, millet)')
    reasoning.push('Water stress detected - consider drought-resistant options')
  }
  
  if (hasNutrientStress) {
    recommendations.push('Nitrogen-fixing legumes (soybeans, field peas)')
    recommendations.push('Green manure crops')
    reasoning.push('Nutrient stress detected - nitrogen-fixing crops will help soil fertility')
  }
  
  if (hasDiseaseStress) {
    recommendations.push('Non-host crops for disease break')
    recommendations.push('Diverse crop families')
    reasoning.push('Disease pressure detected - rotation will break disease cycles')
  }
  
  // Historical performance considerations
  const consistentlyGood = ndviHistory.slice(-6).every(data => data.averageNDVI > 0.6)
  const improvingTrend = ndviHistory.length >= 4 && 
    ndviHistory[ndviHistory.length - 1].averageNDVI > ndviHistory[ndviHistory.length - 4].averageNDVI
  
  if (consistentlyGood && improvingTrend) {
    recommendations.push('Premium crop varieties')
    reasoning.push('Consistently strong performance supports premium crop investment')
  }
  
  return {
    nextSeason: Array.from(new Set(recommendations)), // Remove duplicates
    reasoning: Array.from(new Set(reasoning))
  }
}

// Generate planting density recommendations based on NDVI patterns
export function generatePlantingDensityRecommendations(
  ndviHistory: NDVIData[],
  cropType: string
): {
  recommendedDensity: number
  unit: string
  adjustmentFactor: number // 1.0 = standard, >1.0 = increase, <1.0 = decrease
  reasoning: string[]
} {
  const latestNDVI = ndviHistory[ndviHistory.length - 1]
  const reasoning: string[] = []
  let adjustmentFactor = 1.0
  
  // Base planting densities (seeds per acre)
  const baseDensities: { [key: string]: { density: number; unit: string } } = {
    'corn': { density: 32000, unit: 'seeds/acre' },
    'soybean': { density: 140000, unit: 'seeds/acre' },
    'wheat': { density: 1500000, unit: 'seeds/acre' },
    'cotton': { density: 50000, unit: 'seeds/acre' }
  }
  
  const baseData = baseDensities[cropType.toLowerCase()] || { density: 50000, unit: 'plants/acre' }
  
  // Adjust based on field productivity
  if (latestNDVI.averageNDVI > 0.7) {
    // High-productivity field can support higher density
    adjustmentFactor *= 1.1
    reasoning.push('High field productivity supports increased planting density')
  } else if (latestNDVI.averageNDVI < 0.4) {
    // Low-productivity field needs reduced density
    adjustmentFactor *= 0.9
    reasoning.push('Lower field productivity suggests reduced planting density')
  }
  
  // Adjust based on uniformity (stress areas)
  if (latestNDVI.stressAreas > 25) {
    adjustmentFactor *= 0.95
    reasoning.push('High stress areas suggest slightly lower density for better establishment')
  }
  
  // Adjust based on trends
  if (latestNDVI.trends.seasonal > 15) {
    adjustmentFactor *= 1.05
    reasoning.push('Positive seasonal trend supports slightly higher density')
  } else if (latestNDVI.trends.seasonal < -15) {
    adjustmentFactor *= 0.95
    reasoning.push('Declining seasonal trend suggests more conservative density')
  }
  
  const recommendedDensity = Math.round(baseData.density * adjustmentFactor)
  
  return {
    recommendedDensity,
    unit: baseData.unit,
    adjustmentFactor,
    reasoning
  }
}

// Use NDVI data to optimize harvest timing
export function optimizeHarvestTiming(
  ndviHistory: NDVIData[],
  cropType: string,
  plantingDate: Date
): {
  optimalHarvestWindow: {
    start: Date
    end: Date
    peak: Date
  }
  maturityIndicators: {
    ndviThreshold: number
    currentNDVI: number
    daysToOptimal: number
  }
  qualityPrediction: {
    grade: 'premium' | 'standard' | 'feed'
    confidence: number
    factors: string[]
  }
} {
  const latestNDVI = ndviHistory[ndviHistory.length - 1]
  const daysFromPlanting = Math.floor((new Date().getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Crop-specific NDVI thresholds for optimal harvest
  const harvestThresholds: { [key: string]: { threshold: number; typicalDays: number } } = {
    'corn': { threshold: 0.3, typicalDays: 120 },
    'soybean': { threshold: 0.25, typicalDays: 110 },
    'wheat': { threshold: 0.2, typicalDays: 90 },
    'cotton': { threshold: 0.35, typicalDays: 150 }
  }
  
  const cropData = harvestThresholds[cropType.toLowerCase()] || { threshold: 0.3, typicalDays: 100 }
  
  // Calculate optimal harvest window
  const baseHarvestDate = new Date(plantingDate)
  baseHarvestDate.setDate(baseHarvestDate.getDate() + cropData.typicalDays)
  
  // Adjust based on NDVI trends
  const trendAdjustment = latestNDVI.trends.weekly > 0 ? 7 : -7 // Delay or advance by a week
  
  const optimalHarvestWindow = {
    start: new Date(baseHarvestDate.getTime() - 7 * 24 * 60 * 60 * 1000 + trendAdjustment * 24 * 60 * 60 * 1000),
    end: new Date(baseHarvestDate.getTime() + 14 * 24 * 60 * 60 * 1000 + trendAdjustment * 24 * 60 * 60 * 1000),
    peak: new Date(baseHarvestDate.getTime() + trendAdjustment * 24 * 60 * 60 * 1000)
  }
  
  // Calculate days to optimal harvest
  const daysToOptimal = Math.max(0, Math.floor((optimalHarvestWindow.peak.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
  
  // Predict quality based on NDVI patterns
  const avgNDVILast4Weeks = ndviHistory.slice(-4).reduce((sum, data) => sum + data.averageNDVI, 0) / 4
  
  let grade: 'premium' | 'standard' | 'feed' = 'standard'
  let confidence = 70
  const factors: string[] = []
  
  if (avgNDVILast4Weeks > 0.6 && latestNDVI.stressAreas < 15) {
    grade = 'premium'
    confidence = 85
    factors.push('High NDVI maintained through maturation')
    factors.push('Low stress areas indicate good grain quality')
  } else if (avgNDVILast4Weeks < 0.3 || latestNDVI.stressAreas > 40) {
    grade = 'feed'
    confidence = 80
    factors.push('Low NDVI suggests potential quality issues')
  }
  
  if (latestNDVI.trends.monthly < -20) {
    factors.push('Rapid decline may indicate premature senescence')
    if (grade === 'premium') grade = 'standard'
  }
  
  return {
    optimalHarvestWindow,
    maturityIndicators: {
      ndviThreshold: cropData.threshold,
      currentNDVI: latestNDVI.averageNDVI,
      daysToOptimal
    },
    qualityPrediction: {
      grade,
      confidence,
      factors
    }
  }
}