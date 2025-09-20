// Succession Planting Automation
// Automatically schedules multiple plantings for continuous harvest

import { CropInfo, calculatePlantingWindow, ClimateZone } from './crop-knowledge'
import { ExtendedWeatherData, analyzeWeatherForPlanting } from './weather-integration'

export interface SuccessionPlan {
  id: string
  cropId: string
  fieldId: string
  totalArea: number
  numberOfSuccessions: number
  intervalDays: number
  startDate: Date
  endDate: Date
  
  plantings: SuccessionPlanting[]
  
  harvestSchedule: {
    weeklyHarvest: { week: Date; estimatedYield: number }[]
    peakHarvestWeeks: Date[]
    totalSeasonYield: number
  }
  
  resourceRequirements: {
    totalSeeds: number
    seedsPerPlanting: number
    laborHours: number
    irrigationSchedule: Date[]
  }
}

export interface SuccessionPlanting {
  id: string
  sequenceNumber: number
  plantingDate: Date
  harvestStartDate: Date
  harvestEndDate: Date
  areaAllocated: number
  status: 'planned' | 'planted' | 'growing' | 'harvesting' | 'completed'
  expectedYield: number
  actualYield?: number
  notes?: string
  weatherRisk?: 'low' | 'moderate' | 'high'
}

// Crops that benefit from succession planting
export const SUCCESSION_SUITABLE_CROPS = [
  'lettuce',
  'spinach', 
  'radish',
  'green-beans',
  'carrots',
  'beets',
  'kale',
  'arugula',
  'cilantro',
  'basil',
  'sweet-corn',
  'peas'
]

// Calculate optimal succession planting schedule
export function calculateSuccessionSchedule(
  crop: CropInfo,
  fieldArea: number,
  desiredHarvestPeriod: number, // weeks of continuous harvest
  climateZone: ClimateZone,
  weatherData?: ExtendedWeatherData
): SuccessionPlan {
  
  // Determine if crop is suitable for succession planting
  if (!SUCCESSION_SUITABLE_CROPS.includes(crop.id)) {
    throw new Error(`${crop.name} is not typically grown in succession plantings`)
  }
  
  // Calculate planting window
  const currentYear = new Date().getFullYear()
  const plantingWindow = calculatePlantingWindow(crop, climateZone)
  
  // Calculate interval between plantings
  const harvestWindowWeeks = Math.ceil(crop.harvestWindow / 7)
  const optimalInterval = Math.max(7, Math.ceil(crop.harvestWindow / 2)) // Plant every 7-14 days typically
  
  // Calculate number of successions needed
  const totalSeasonLength = Math.floor(
    (plantingWindow.latestPlanting.getTime() - plantingWindow.earliestPlanting.getTime()) 
    / (1000 * 60 * 60 * 24)
  )
  
  const maxSuccessions = Math.floor(totalSeasonLength / optimalInterval)
  const requestedSuccessions = Math.ceil(desiredHarvestPeriod / harvestWindowWeeks)
  const numberOfSuccessions = Math.min(maxSuccessions, requestedSuccessions, 8) // Cap at 8 successions
  
  // Calculate area allocation per planting
  const areaPerPlanting = fieldArea / numberOfSuccessions
  
  // Generate succession plantings
  const plantings: SuccessionPlanting[] = []
  
  for (let i = 0; i < numberOfSuccessions; i++) {
    const plantingDate = new Date(plantingWindow.optimalPlanting)
    plantingDate.setDate(plantingDate.getDate() + (i * optimalInterval))
    
    // Skip if planting date is too late in the season
    if (plantingDate > plantingWindow.latestPlanting) {
      break
    }
    
    const harvestStartDate = new Date(plantingDate)
    harvestStartDate.setDate(plantingDate.getDate() + crop.daysToMaturity)
    
    const harvestEndDate = new Date(harvestStartDate)
    harvestEndDate.setDate(harvestStartDate.getDate() + crop.harvestWindow)
    
    // Calculate expected yield (simplified - would use more sophisticated models)
    const baseYieldPerSqFt = getBaseYieldEstimate(crop.id)
    const areaInSqFt = areaPerPlanting * 43560 // Convert acres to sq ft
    const expectedYield = baseYieldPerSqFt * areaInSqFt
    
    // Assess weather risk if data available
    let weatherRisk: 'low' | 'moderate' | 'high' = 'low'
    if (weatherData) {
      const risk = assessWeatherRisk(plantingDate, harvestStartDate, weatherData)
      weatherRisk = risk
    }
    
    plantings.push({
      id: `succession-${i + 1}`,
      sequenceNumber: i + 1,
      plantingDate,
      harvestStartDate,
      harvestEndDate,
      areaAllocated: areaPerPlanting,
      status: 'planned',
      expectedYield,
      weatherRisk
    })
  }
  
  // Calculate harvest schedule
  const harvestSchedule = calculateHarvestSchedule(plantings)
  
  // Calculate resource requirements
  const resourceRequirements = calculateResourceRequirements(crop, plantings, areaPerPlanting)
  
  return {
    id: `succession-plan-${Date.now()}`,
    cropId: crop.id,
    fieldId: '', // To be set by caller
    totalArea: fieldArea,
    numberOfSuccessions: plantings.length,
    intervalDays: optimalInterval,
    startDate: plantings[0]?.plantingDate || new Date(),
    endDate: plantings[plantings.length - 1]?.harvestEndDate || new Date(),
    plantings,
    harvestSchedule,
    resourceRequirements
  }
}

function getBaseYieldEstimate(cropId: string): number {
  // Yield per square foot estimates (would be refined with real data)
  const yieldEstimates: { [key: string]: number } = {
    'lettuce': 0.5, // lbs per sq ft
    'spinach': 0.3,
    'radish': 0.4,
    'green-beans': 0.6,
    'carrots': 0.8,
    'beets': 0.7,
    'kale': 0.4,
    'arugula': 0.2,
    'cilantro': 0.1,
    'basil': 0.2,
    'sweet-corn': 1.2,
    'peas': 0.5
  }
  
  return yieldEstimates[cropId] || 0.5
}

function assessWeatherRisk(
  plantingDate: Date,
  harvestDate: Date,
  weatherData: ExtendedWeatherData
): 'low' | 'moderate' | 'high' {
  // Simple risk assessment based on forecast
  const plantingInDays = Math.floor(
    (plantingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Only assess risk for plantings in the next 14 days
  if (plantingInDays > 14 || plantingInDays < 0) {
    return 'low'
  }
  
  const relevantForecast = weatherData.forecast.slice(0, Math.min(14, plantingInDays + 7))
  
  // Check for extreme weather
  const hasFreeze = relevantForecast.some(day => day.temperature.min < 32)
  const hasHeatWave = relevantForecast.some(day => day.temperature.max > 95)
  const heavyRainDays = relevantForecast.filter(day => day.precipitation > 1).length
  const highWindDays = relevantForecast.filter(day => day.windSpeed > 25).length
  
  if (hasFreeze || hasHeatWave || heavyRainDays > 3) {
    return 'high'
  } else if (heavyRainDays > 1 || highWindDays > 2) {
    return 'moderate'
  }
  
  return 'low'
}

function calculateHarvestSchedule(plantings: SuccessionPlanting[]): SuccessionPlan['harvestSchedule'] {
  const weeklyHarvest: { week: Date; estimatedYield: number }[] = []
  const peakHarvestWeeks: Date[] = []
  
  // Create weekly buckets for harvest
  if (plantings.length === 0) {
    return { weeklyHarvest, peakHarvestWeeks, totalSeasonYield: 0 }
  }
  
  const startWeek = new Date(plantings[0].harvestStartDate)
  startWeek.setDate(startWeek.getDate() - startWeek.getDay()) // Start of week
  
  const endWeek = new Date(plantings[plantings.length - 1].harvestEndDate)
  endWeek.setDate(endWeek.getDate() + (7 - endWeek.getDay())) // End of week
  
  const currentWeek = new Date(startWeek)
  
  while (currentWeek <= endWeek) {
    const weekEnd = new Date(currentWeek)
    weekEnd.setDate(currentWeek.getDate() + 6)
    
    // Calculate yield for this week
    let weeklyYield = 0
    
    plantings.forEach(planting => {
      // Check if this week overlaps with harvest period
      if (currentWeek <= planting.harvestEndDate && weekEnd >= planting.harvestStartDate) {
        // Assume even distribution of harvest over harvest window
        const harvestDays = Math.floor(
          (planting.harvestEndDate.getTime() - planting.harvestStartDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        // Calculate overlap days
        const overlapStart = currentWeek > planting.harvestStartDate ? currentWeek : planting.harvestStartDate
        const overlapEnd = weekEnd < planting.harvestEndDate ? weekEnd : planting.harvestEndDate
        const overlapDays = Math.floor(
          (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
        
        weeklyYield += (planting.expectedYield / harvestDays) * overlapDays
      }
    })
    
    weeklyHarvest.push({
      week: new Date(currentWeek),
      estimatedYield: weeklyYield
    })
    
    // Identify peak harvest weeks (top 25% of yields)
    currentWeek.setDate(currentWeek.getDate() + 7)
  }
  
  // Calculate peak harvest weeks
  const sortedWeeks = [...weeklyHarvest].sort((a, b) => b.estimatedYield - a.estimatedYield)
  const peakCount = Math.max(1, Math.ceil(sortedWeeks.length * 0.25))
  
  for (let i = 0; i < peakCount; i++) {
    peakHarvestWeeks.push(sortedWeeks[i].week)
  }
  
  const totalSeasonYield = plantings.reduce((sum, p) => sum + p.expectedYield, 0)
  
  return {
    weeklyHarvest,
    peakHarvestWeeks,
    totalSeasonYield
  }
}

function calculateResourceRequirements(
  crop: CropInfo,
  plantings: SuccessionPlanting[],
  areaPerPlanting: number
): SuccessionPlan['resourceRequirements'] {
  
  // Calculate seeds needed (simplified - would use actual seeding rates)
  const seedingRates: { [key: string]: number } = {
    'lettuce': 20000, // seeds per acre
    'spinach': 25000,
    'radish': 30000,
    'green-beans': 150000,
    'carrots': 2000000,
    'beets': 100000,
    'kale': 15000,
    'arugula': 200000,
    'cilantro': 50000,
    'basil': 25000,
    'sweet-corn': 32000,
    'peas': 200000
  }
  
  const seedsPerAcre = seedingRates[crop.id] || 50000
  const seedsPerPlanting = Math.ceil(seedsPerAcre * areaPerPlanting)
  const totalSeeds = seedsPerPlanting * plantings.length
  
  // Calculate labor hours (simplified estimates)
  const laborPerAcrePlanting = 8 // hours per acre for planting
  const laborPerAcreHarvest = 12 // hours per acre for harvest
  const laborHours = plantings.length * areaPerPlanting * (laborPerAcrePlanting + laborPerAcreHarvest)
  
  // Calculate irrigation schedule (every 3 days during critical periods)
  const irrigationSchedule: Date[] = []
  plantings.forEach(planting => {
    const startIrrigation = new Date(planting.plantingDate)
    const endIrrigation = new Date(planting.harvestStartDate)
    
    const currentDate = new Date(startIrrigation)
    while (currentDate <= endIrrigation) {
      irrigationSchedule.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 3)
    }
  })
  
  return {
    totalSeeds,
    seedsPerPlanting,
    laborHours: Math.ceil(laborHours),
    irrigationSchedule: [...new Set(irrigationSchedule.map(d => d.toDateString()))]
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime())
  }
}

// Generate succession planting recommendations based on crop and conditions
export function generateSuccessionRecommendations(
  cropId: string,
  farmLocation: { latitude: number; longitude: number },
  availableArea: number,
  desiredHarvestWeeks: number = 8
): {
  recommendations: {
    type: 'weekly' | 'biweekly' | 'monthly'
    interval: number
    numberOfPlantings: number
    areaPerPlanting: number
    benefits: string[]
    considerations: string[]
  }[]
  bestOption: number // index of recommended option
} {
  
  const recommendations = [
    {
      type: 'weekly' as const,
      interval: 7,
      numberOfPlantings: Math.min(desiredHarvestWeeks, 8),
      areaPerPlanting: availableArea / Math.min(desiredHarvestWeeks, 8),
      benefits: [
        'Maximum harvest continuity',
        'Fresh product every week',
        'Spreads weather risk',
        'Optimal for market sales'
      ],
      considerations: [
        'High labor requirements',
        'More complex management',
        'Higher seed costs',
        'Requires consistent irrigation'
      ]
    },
    {
      type: 'biweekly' as const,
      interval: 14,
      numberOfPlantings: Math.min(Math.ceil(desiredHarvestWeeks / 2), 6),
      areaPerPlanting: availableArea / Math.min(Math.ceil(desiredHarvestWeeks / 2), 6),
      benefits: [
        'Good harvest continuity',
        'Manageable labor requirements',
        'Moderate weather risk spread',
        'Balanced resource use'
      ],
      considerations: [
        'Some gaps in harvest possible',
        'Moderate management complexity',
        'Weather windows more critical'
      ]
    },
    {
      type: 'monthly' as const,
      interval: 30,
      numberOfPlantings: Math.min(Math.ceil(desiredHarvestWeeks / 4), 4),
      areaPerPlanting: availableArea / Math.min(Math.ceil(desiredHarvestWeeks / 4), 4),
      benefits: [
        'Simple management',
        'Lower labor requirements',
        'Distinct harvest periods',
        'Easy to schedule'
      ],
      considerations: [
        'Longer gaps between harvests',
        'Higher weather risk per planting',
        'May not meet continuous harvest goals'
      ]
    }
  ]
  
  // Determine best option based on area and crop type
  let bestOption = 1 // Default to biweekly
  
  if (availableArea < 0.25) { // Less than quarter acre
    bestOption = 2 // Monthly for small areas
  } else if (availableArea > 2) { // More than 2 acres
    bestOption = 0 // Weekly for larger areas
  }
  
  // Adjust for crop characteristics
  if (SUCCESSION_SUITABLE_CROPS.includes(cropId)) {
    const quickHarvestCrops = ['lettuce', 'spinach', 'radish', 'arugula']
    if (quickHarvestCrops.includes(cropId)) {
      bestOption = Math.min(bestOption, 1) // Favor more frequent plantings for quick crops
    }
  }
  
  return {
    recommendations,
    bestOption
  }
}

// Monitor succession plan progress and suggest adjustments
export function monitorSuccessionProgress(
  plan: SuccessionPlan,
  actualHarvestData: { plantingId: string; harvestDate: Date; actualYield: number }[],
  currentWeatherData: ExtendedWeatherData
): {
  status: 'on_track' | 'behind_schedule' | 'ahead_of_schedule' | 'adjustments_needed'
  alerts: {
    type: 'weather' | 'yield' | 'timing' | 'resource'
    severity: 'low' | 'medium' | 'high'
    message: string
    recommendation: string
  }[]
  adjustmentSuggestions: {
    type: 'skip_planting' | 'adjust_timing' | 'change_variety' | 'increase_care'
    plantingIds: string[]
    reason: string
    newDate?: Date
  }[]
} {
  
  const alerts: any[] = []
  const adjustmentSuggestions: any[] = []
  
  // Check progress against plan
  const today = new Date()
  const completedPlantings = actualHarvestData.length
  const plannedCompletedByNow = plan.plantings.filter(p => p.harvestEndDate <= today).length
  
  let status: 'on_track' | 'behind_schedule' | 'ahead_of_schedule' | 'adjustments_needed' = 'on_track'
  
  if (completedPlantings < plannedCompletedByNow - 1) {
    status = 'behind_schedule'
    alerts.push({
      type: 'timing',
      severity: 'medium',
      message: `${plannedCompletedByNow - completedPlantings} plantings behind schedule`,
      recommendation: 'Review planting dates and consider accelerating schedule'
    })
  } else if (completedPlantings > plannedCompletedByNow + 1) {
    status = 'ahead_of_schedule'
  }
  
  // Check yield performance
  if (actualHarvestData.length > 0) {
    const avgActualYield = actualHarvestData.reduce((sum, h) => sum + h.actualYield, 0) / actualHarvestData.length
    const correspondingPlanned = plan.plantings.slice(0, actualHarvestData.length)
    const avgPlannedYield = correspondingPlanned.reduce((sum, p) => sum + p.expectedYield, 0) / correspondingPlanned.length
    
    const yieldVariance = (avgActualYield - avgPlannedYield) / avgPlannedYield
    
    if (yieldVariance < -0.2) { // 20% below expected
      alerts.push({
        type: 'yield',
        severity: 'high',
        message: 'Yields are significantly below expectations',
        recommendation: 'Review growing conditions, nutrition, and pest management'
      })
      
      adjustmentSuggestions.push({
        type: 'increase_care',
        plantingIds: plan.plantings.filter(p => p.status === 'planned' || p.status === 'planted').map(p => p.id),
        reason: 'Poor yield performance requires increased attention'
      })
    }
  }
  
  // Check upcoming weather risks
  const upcomingPlantings = plan.plantings.filter(p => {
    const daysToPlanting = (p.plantingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return daysToPlanting > 0 && daysToPlanting <= 14
  })
  
  upcomingPlantings.forEach(planting => {
    const weatherRisk = assessWeatherRisk(planting.plantingDate, planting.harvestStartDate, currentWeatherData)
    
    if (weatherRisk === 'high') {
      alerts.push({
        type: 'weather',
        severity: 'high',
        message: `High weather risk for planting ${planting.sequenceNumber}`,
        recommendation: 'Consider delaying planting by 3-7 days'
      })
      
      const newDate = new Date(planting.plantingDate)
      newDate.setDate(newDate.getDate() + 5)
      
      adjustmentSuggestions.push({
        type: 'adjust_timing',
        plantingIds: [planting.id],
        reason: 'High weather risk during planting window',
        newDate
      })
    } else if (weatherRisk === 'moderate') {
      alerts.push({
        type: 'weather',
        severity: 'medium',
        message: `Moderate weather risk for planting ${planting.sequenceNumber}`,
        recommendation: 'Monitor weather closely and be prepared to adjust'
      })
    }
  })
  
  if (alerts.some(a => a.severity === 'high') || adjustmentSuggestions.length > 0) {
    status = 'adjustments_needed'
  }
  
  return {
    status,
    alerts,
    adjustmentSuggestions
  }
}