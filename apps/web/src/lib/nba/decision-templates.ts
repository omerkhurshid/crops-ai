/**
 * Decision Templates for common farm operations
 * These templates provide structured workflows for critical farming decisions
 */

export interface DecisionTemplate {
  id: string
  name: string
  category: 'CROP_PROTECTION' | 'HARVEST' | 'PLANTING' | 'LIVESTOCK' | 'MARKET' | 'EQUIPMENT'
  description: string
  requiredInputs: Array<{
    name: string
    type: 'number' | 'string' | 'date' | 'boolean' | 'select'
    label: string
    options?: string[]
    unit?: string
  }>
  decisionLogic: (inputs: any) => DecisionRecommendation
  bestPractices: string[]
  commonMistakes: string[]
  regulations?: string[]
}

export interface DecisionRecommendation {
  shouldProceed: boolean
  confidence: number
  reasoning: string[]
  timing: {
    recommendation: string
    optimal?: Date
    acceptable?: { start: Date; end: Date }
  }
  risks: Array<{ factor: string; impact: 'low' | 'medium' | 'high' }>
  checklist: string[]
  alternativeActions?: string[]
  estimatedOutcome?: {
    best: string
    likely: string
    worst: string
  }
}

export const decisionTemplates: DecisionTemplate[] = [
  {
    id: 'spray-fungicide',
    name: 'Fungicide Application Decision',
    category: 'CROP_PROTECTION',
    description: 'Determine optimal timing and conditions for fungicide application',
    requiredInputs: [
      { name: 'cropType', type: 'select', label: 'Crop Type', options: ['Wheat', 'Corn', 'Soybeans', 'Barley'] },
      { name: 'growthStage', type: 'select', label: 'Growth Stage', options: ['Emergence', 'Tillering', 'Stem Extension', 'Boot', 'Heading', 'Flowering', 'Grain Fill'] },
      { name: 'diseasePresence', type: 'number', label: 'Disease Presence', unit: '% of plants affected' },
      { name: 'lastSprayDays', type: 'number', label: 'Days Since Last Spray' },
      { name: 'fieldArea', type: 'number', label: 'Field Area', unit: 'hectares' },
      { name: 'currentHumidity', type: 'number', label: 'Current Humidity', unit: '%' },
      { name: 'rainForecast', type: 'number', label: 'Rain in Next 48hrs', unit: 'mm' },
      { name: 'windSpeed', type: 'number', label: 'Current Wind Speed', unit: 'km/h' },
      { name: 'temperature', type: 'number', label: 'Current Temperature', unit: '°C' }
    ],
    decisionLogic: (inputs) => {
      const {
        cropType,
        growthStage,
        diseasePresence,
        lastSprayDays,
        currentHumidity,
        rainForecast,
        windSpeed,
        temperature
      } = inputs

      const reasons: string[] = []
      const risks: Array<{ factor: string; impact: 'low' | 'medium' | 'high' }> = []
      let shouldSpray = false
      let confidence = 0

      // Disease pressure analysis
      if (diseasePresence > 5) {
        shouldSpray = true
        confidence += 30
        reasons.push(`Disease present on ${diseasePresence}% of plants - treatment warranted`)
      } else if (diseasePresence > 2) {
        confidence += 15
        reasons.push(`Low disease pressure (${diseasePresence}%) - monitor closely`)
      }

      // Environmental conditions for disease
      if (currentHumidity > 70 && temperature > 15 && temperature < 25) {
        shouldSpray = true
        confidence += 20
        reasons.push('High humidity and optimal temperature create high disease risk')
        risks.push({ factor: 'Disease development conditions optimal', impact: 'high' })
      }

      // Growth stage considerations
      const criticalStages = ['Boot', 'Heading', 'Flowering']
      if (criticalStages.includes(growthStage)) {
        confidence += 20
        reasons.push(`${growthStage} is a critical protection period for yield`)
      }

      // Spray interval
      if (lastSprayDays > 21) {
        shouldSpray = true
        confidence += 15
        reasons.push(`${lastSprayDays} days since last application - protection likely expired`)
      } else if (lastSprayDays < 7) {
        shouldSpray = false
        confidence = 90
        reasons.push('Recent application still providing protection')
      }

      // Weather window assessment
      if (windSpeed > 20) {
        risks.push({ factor: 'High wind will reduce spray efficacy', impact: 'high' })
        confidence -= 20
      }
      if (rainForecast > 5) {
        risks.push({ factor: 'Rain will wash off product', impact: 'high' })
        confidence -= 25
      }

      // Ensure confidence is within bounds
      confidence = Math.max(0, Math.min(100, confidence))

      return {
        shouldProceed: shouldSpray && confidence > 50,
        confidence,
        reasoning: reasons,
        timing: {
          recommendation: windSpeed < 15 && rainForecast < 2 
            ? 'Proceed within 24 hours' 
            : 'Wait for better conditions',
          optimal: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        risks,
        checklist: [
          'Calibrate sprayer for accurate application rate',
          'Check nozzles for even spray pattern',
          'Ensure adequate water volume (100-200 L/ha)',
          'Add adjuvants if recommended on label',
          'Wear appropriate PPE',
          'Record application details for compliance'
        ],
        alternativeActions: [
          'Continue monitoring disease levels daily',
          'Consider resistant varieties for next season',
          'Improve field drainage to reduce humidity'
        ],
        estimatedOutcome: {
          best: '15-20% yield preservation, ROI 4:1',
          likely: '10-15% yield preservation, ROI 3:1',
          worst: 'Limited efficacy if weather changes, ROI 1:1'
        }
      }
    },
    bestPractices: [
      'Apply fungicides preventively before disease establishes',
      'Rotate fungicide modes of action to prevent resistance',
      'Spray early morning or evening for best coverage',
      'Ensure complete field coverage with proper boom height',
      'Monitor weather continuously during application'
    ],
    commonMistakes: [
      'Waiting until disease is severe before treating',
      'Spraying in windy conditions (>20 km/h)',
      'Using same fungicide repeatedly',
      'Poor sprayer calibration leading to under/over application',
      'Ignoring pre-harvest intervals'
    ],
    regulations: [
      'Follow all label directions for application rates',
      'Observe pre-harvest interval (PHI) requirements',
      'Maintain spray records for 3 years',
      'Use only registered products for your crop',
      'Respect buffer zones near water sources'
    ]
  },
  
  {
    id: 'harvest-timing',
    name: 'Harvest Timing Decision',
    category: 'HARVEST',
    description: 'Optimize harvest timing based on crop maturity, weather, and market conditions',
    requiredInputs: [
      { name: 'cropType', type: 'select', label: 'Crop Type', options: ['Wheat', 'Corn', 'Soybeans', 'Barley'] },
      { name: 'moistureContent', type: 'number', label: 'Grain Moisture', unit: '%' },
      { name: 'fieldArea', type: 'number', label: 'Field Area', unit: 'hectares' },
      { name: 'maturityVisual', type: 'select', label: 'Visual Maturity', options: ['Green', 'Turning', 'Golden', 'Fully Ripe', 'Over-ripe'] },
      { name: 'rainForecast7Day', type: 'number', label: '7-Day Rain Forecast', unit: 'mm' },
      { name: 'currentPrice', type: 'number', label: 'Current Market Price', unit: '$/ton' },
      { name: 'priceOutlook', type: 'select', label: 'Price Trend', options: ['Rising', 'Stable', 'Falling'] },
      { name: 'storageAvailable', type: 'boolean', label: 'On-farm Storage Available' },
      { name: 'dryingAvailable', type: 'boolean', label: 'Grain Drying Available' }
    ],
    decisionLogic: (inputs) => {
      const {
        cropType,
        moistureContent,
        maturityVisual,
        rainForecast7Day,
        currentPrice,
        priceOutlook,
        storageAvailable,
        dryingAvailable
      } = inputs

      const reasons: string[] = []
      const risks: Array<{ factor: string; impact: 'low' | 'medium' | 'high' }> = []
      let shouldHarvest = false
      let confidence = 0

      // Moisture content analysis
      const idealMoisture: Record<string, { min: number; max: number }> = {
        Wheat: { min: 13, max: 15 },
        Corn: { min: 15, max: 20 },
        Soybeans: { min: 13, max: 15 },
        Barley: { min: 12, max: 14 }
      }
      
      const ideal = idealMoisture[cropType]
      if (moistureContent >= ideal.min && moistureContent <= ideal.max) {
        shouldHarvest = true
        confidence += 40
        reasons.push(`Moisture at ${moistureContent}% - ideal for harvest and storage`)
      } else if (moistureContent > ideal.max && dryingAvailable) {
        shouldHarvest = true
        confidence += 25
        reasons.push(`Moisture high at ${moistureContent}% but drying available`)
        risks.push({ factor: 'Drying costs will reduce profit', impact: 'medium' })
      } else if (moistureContent < ideal.min) {
        confidence += 20
        reasons.push(`Moisture low at ${moistureContent}% - risk of grain damage`)
        risks.push({ factor: 'Brittle grain may crack during handling', impact: 'low' })
      }

      // Visual maturity check
      if (maturityVisual === 'Fully Ripe' || maturityVisual === 'Golden') {
        confidence += 20
        reasons.push('Visual indicators show optimal maturity')
      } else if (maturityVisual === 'Over-ripe') {
        shouldHarvest = true
        confidence += 15
        reasons.push('Crop over-mature - harvest immediately to prevent losses')
        risks.push({ factor: 'Shattering losses likely', impact: 'high' })
      }

      // Weather risk assessment
      if (rainForecast7Day > 50) {
        shouldHarvest = true
        confidence += 20
        reasons.push(`Heavy rain forecast (${rainForecast7Day}mm) - harvest before weather damage`)
        risks.push({ factor: 'Weather damage if delayed', impact: 'high' })
      } else if (rainForecast7Day < 10) {
        confidence += 10
        reasons.push('Dry weather forecast provides flexible harvest window')
      }

      // Market considerations
      if (currentPrice > 250 && priceOutlook === 'Falling') {
        shouldHarvest = true
        confidence += 10
        reasons.push(`Strong current price ($${currentPrice}/ton) with falling outlook`)
      } else if (priceOutlook === 'Rising' && storageAvailable) {
        confidence -= 10
        reasons.push('Rising prices favor delayed marketing if storage available')
      }

      confidence = Math.max(0, Math.min(100, confidence))

      return {
        shouldProceed: shouldHarvest && confidence > 40,
        confidence,
        reasoning: reasons,
        timing: {
          recommendation: shouldHarvest 
            ? 'Begin harvest within 48 hours' 
            : 'Monitor daily and reassess in 3-5 days',
          optimal: new Date(Date.now() + 48 * 60 * 60 * 1000),
          acceptable: {
            start: new Date(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        },
        risks,
        checklist: [
          'Test multiple areas for accurate moisture reading',
          'Service and prepare combine',
          'Arrange grain trucks and labor',
          'Prepare storage bins or elevator delivery',
          'Check crop insurance requirements',
          'Plan field order based on maturity'
        ],
        alternativeActions: [
          'Harvest high-risk areas first',
          'Consider custom harvesting if equipment limited',
          'Arrange pre-harvest marketing contracts',
          'Swath if lodging risk is high'
        ],
        estimatedOutcome: {
          best: 'Maximum yield and quality, premium price capture',
          likely: '95% yield capture, standard market price',
          worst: '10-15% loss if weather damage occurs'
        }
      }
    },
    bestPractices: [
      'Monitor moisture daily as harvest approaches',
      'Harvest high-moisture areas first in the morning',
      'Adjust combine settings throughout the day',
      'Minimize grain damage with proper settings',
      'Clean grain properly for best storage'
    ],
    commonMistakes: [
      'Harvesting too early when moisture is high',
      'Waiting too long and risking weather damage',
      'Poor combine settings causing grain damage',
      'Inadequate labor planning causing delays',
      'Not having marketing plan before harvest'
    ],
    regulations: [
      'Comply with grain quality standards',
      'Maintain harvest records for traceability',
      'Follow road regulations for grain transport',
      'Ensure proper licensing for equipment operators'
    ]
  },
  
  {
    id: 'irrigation-scheduling',
    name: 'Irrigation Scheduling Decision',
    category: 'CROP_PROTECTION',
    description: 'Determine optimal irrigation timing and amount based on soil moisture and crop needs',
    requiredInputs: [
      { name: 'cropType', type: 'select', label: 'Crop Type', options: ['Corn', 'Soybeans', 'Wheat', 'Vegetables'] },
      { name: 'growthStage', type: 'select', label: 'Growth Stage', options: ['Seedling', 'Vegetative', 'Reproductive', 'Maturity'] },
      { name: 'soilMoisture', type: 'number', label: 'Soil Moisture', unit: '% of field capacity' },
      { name: 'lastIrrigationDays', type: 'number', label: 'Days Since Last Irrigation' },
      { name: 'lastRainfallAmount', type: 'number', label: 'Recent Rainfall', unit: 'mm (last 7 days)' },
      { name: 'evapotranspiration', type: 'number', label: 'Daily ET Rate', unit: 'mm/day' },
      { name: 'forecastRain5Day', type: 'number', label: '5-Day Rain Forecast', unit: 'mm' },
      { name: 'temperature5DayAvg', type: 'number', label: '5-Day Avg Temperature', unit: '°C' },
      { name: 'waterCost', type: 'number', label: 'Water Cost', unit: '$/mm/ha' },
      { name: 'cropPrice', type: 'number', label: 'Expected Crop Price', unit: '$/ton' }
    ],
    decisionLogic: (inputs) => {
      const {
        cropType,
        growthStage,
        soilMoisture,
        lastRainfallAmount,
        evapotranspiration,
        forecastRain5Day,
        temperature5DayAvg,
        waterCost
      } = inputs

      const reasons: string[] = []
      const risks: Array<{ factor: string; impact: 'low' | 'medium' | 'high' }> = []
      let shouldIrrigate = false
      let confidence = 0
      let recommendedAmount = 0

      // Critical growth stages for water
      const criticalStages: Record<string, string[]> = {
        Corn: ['Tasseling', 'Silking', 'Reproductive'],
        Soybeans: ['Flowering', 'Pod Fill', 'Reproductive'],
        Wheat: ['Jointing', 'Heading', 'Grain Fill'],
        Vegetables: ['Flowering', 'Fruit Development', 'Reproductive']
      }

      // Soil moisture thresholds
      const stressThreshold = 50 // % of field capacity
      const refillPoint = 75

      // Analyze soil moisture
      if (soilMoisture < stressThreshold) {
        shouldIrrigate = true
        confidence += 40
        reasons.push(`Soil moisture at ${soilMoisture}% - below stress threshold`)
        risks.push({ factor: 'Yield loss from water stress', impact: 'high' })
        recommendedAmount = (refillPoint - soilMoisture) * 2.5 // mm per % field capacity
      } else if (soilMoisture < 65) {
        confidence += 20
        reasons.push(`Soil moisture at ${soilMoisture}% - approaching stress level`)
        recommendedAmount = (refillPoint - soilMoisture) * 2.5
      } else {
        reasons.push(`Adequate soil moisture at ${soilMoisture}%`)
      }

      // Growth stage importance
      if (growthStage === 'Reproductive' || criticalStages[cropType]?.includes(growthStage)) {
        confidence += 25
        reasons.push(`${growthStage} stage is critical for water needs`)
        if (soilMoisture < 70) shouldIrrigate = true
      }

      // ET and water balance
      const projectedDeficit = (evapotranspiration * 5) - lastRainfallAmount - forecastRain5Day
      if (projectedDeficit > 25) {
        shouldIrrigate = true
        confidence += 20
        reasons.push(`Projected ${Math.round(projectedDeficit)}mm water deficit over next 5 days`)
      }

      // Weather forecast
      if (forecastRain5Day > 25) {
        shouldIrrigate = false
        confidence = 80
        reasons.push(`${forecastRain5Day}mm rain forecast - natural irrigation coming`)
      } else if (temperature5DayAvg > 30) {
        confidence += 10
        reasons.push('High temperatures will increase water demand')
        risks.push({ factor: 'Heat stress combined with water stress', impact: 'high' })
      }

      // Economic consideration
      const irrigationCost = recommendedAmount * waterCost
      const potentialLoss = 500 // Simplified potential yield loss value
      if (irrigationCost > potentialLoss * 0.5) {
        risks.push({ factor: 'High irrigation cost vs benefit', impact: 'medium' })
      }

      confidence = Math.max(0, Math.min(100, confidence))

      return {
        shouldProceed: shouldIrrigate && confidence > 50,
        confidence,
        reasoning: reasons,
        timing: {
          recommendation: shouldIrrigate 
            ? `Apply ${Math.round(recommendedAmount)}mm within 48 hours` 
            : 'Monitor soil moisture in 3 days',
          optimal: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        risks,
        checklist: [
          'Check irrigation system operation',
          'Verify water allocation available',
          'Monitor application uniformity',
          'Check soil moisture 24hrs after irrigation',
          'Record water usage for management',
          'Inspect for runoff or pooling'
        ],
        alternativeActions: [
          'Consider deficit irrigation if water limited',
          'Prioritize critical growth stage fields',
          'Improve soil organic matter for water retention',
          'Use mulching to reduce evaporation'
        ],
        estimatedOutcome: {
          best: `${recommendedAmount}mm maintains optimal growth, 15% yield benefit`,
          likely: 'Prevent water stress, maintain yield potential',
          worst: 'Over-irrigation if rain arrives, added cost only'
        }
      }
    },
    bestPractices: [
      'Use soil moisture sensors for accurate monitoring',
      'Irrigate during low evaporation periods',
      'Apply water slowly to prevent runoff',
      'Consider crop coefficients for growth stages',
      'Maintain irrigation equipment regularly'
    ],
    commonMistakes: [
      'Waiting until visible stress to irrigate',
      'Over-irrigating and wasting water',
      'Poor irrigation timing with rain events',
      'Ignoring soil type water holding capacity',
      'Uneven water distribution'
    ]
  }
]

/**
 * Get a decision template by ID
 */
export function getDecisionTemplate(templateId: string): DecisionTemplate | undefined {
  return decisionTemplates.find(t => t.id === templateId)
}

/**
 * Get all templates for a category
 */
export function getTemplatesByCategory(category: string): DecisionTemplate[] {
  return decisionTemplates.filter(t => t.category === category)
}

/**
 * Execute a decision template with inputs
 */
export function executeDecisionTemplate(
  templateId: string, 
  inputs: Record<string, any>
): DecisionRecommendation | null {
  const template = getDecisionTemplate(templateId)
  if (!template) return null
  
  return template.decisionLogic(inputs)
}