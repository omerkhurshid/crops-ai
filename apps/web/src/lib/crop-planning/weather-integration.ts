// Weather Data Integration for Crop Planning
// Combines weather forecasts with crop requirements for intelligent recommendations
import { CropInfo, ClimateZone, calculatePlantingWindow } from './crop-knowledge'
export interface WeatherForecast {
  date: string
  temperature: {
    min: number
    max: number
    average: number
  }
  soilTemperature?: number
  precipitation: number
  humidity: number
  windSpeed: number
  conditions: string
  uvIndex?: number
  growingDegreeDays?: number
}
export interface ExtendedWeatherData {
  current: {
    temperature: number
    soilTemperature?: number
    humidity: number
    windSpeed: number
    precipitation: number
    uvIndex?: number
  }
  forecast: WeatherForecast[] // 14-day forecast
  historical: {
    lastFrostDate?: string
    firstFrostDate?: string
    averageLastFrost?: string
    averageFirstFrost?: string
  }
  alerts: {
    type: 'frost' | 'heat' | 'drought' | 'excessive_rain'
    severity: 'low' | 'moderate' | 'high'
    description: string
    startDate: string
    endDate?: string
  }[]
}
// Growing Degree Day calculation
export function calculateGDD(
  minTemp: number,
  maxTemp: number,
  baseTemp: number = 50,
  maxTemp_cap: number = 86
): number {
  // Standard GDD calculation used in agriculture
  const cappedMax = Math.min(maxTemp, maxTemp_cap)
  const adjustedMin = Math.max(minTemp, baseTemp)
  const adjustedMax = Math.max(cappedMax, baseTemp)
  return Math.max(0, (adjustedMin + adjustedMax) / 2 - baseTemp)
}
// Calculate accumulated GDD for a date range
export function calculateAccumulatedGDD(
  forecast: WeatherForecast[],
  baseTemp: number = 50
): number {
  return forecast.reduce((total, day) => {
    return total + calculateGDD(
      day.temperature.min,
      day.temperature.max,
      baseTemp
    )
  }, 0)
}
// Analyze weather patterns for planting recommendations
export function analyzeWeatherForPlanting(
  crop: CropInfo,
  weatherData: ExtendedWeatherData,
  location: { latitude: number; longitude: number }
): {
  recommendation: 'ideal' | 'good' | 'caution' | 'wait' | 'too_late'
  confidence: number
  factors: {
    factor: string
    status: 'positive' | 'neutral' | 'negative'
    description: string
    weight: number
  }[]
  bestPlantingDates: Date[]
  riskFactors: string[]
  nextEvaluation: Date
} {
  const factors: any[] = []
  const riskFactors: string[] = []
  let totalScore = 0
  let maxScore = 0
  // Analyze soil temperature
  if (weatherData.current.soilTemperature) {
    maxScore += 20
    if (weatherData.current.soilTemperature >= crop.climate.optimalSoilTemp[0] && 
        weatherData.current.soilTemperature <= crop.climate.optimalSoilTemp[1]) {
      totalScore += 20
      factors.push({
        factor: 'Soil Temperature',
        status: 'positive',
        description: `Optimal at ${weatherData.current.soilTemperature}°F`,
        weight: 20
      })
    } else if (weatherData.current.soilTemperature >= crop.climate.minSoilTemp) {
      totalScore += 15
      factors.push({
        factor: 'Soil Temperature',
        status: 'neutral',
        description: `Adequate at ${weatherData.current.soilTemperature}°F`,
        weight: 20
      })
    } else {
      factors.push({
        factor: 'Soil Temperature',
        status: 'negative',
        description: `Too cold at ${weatherData.current.soilTemperature}°F (need ${crop.climate.minSoilTemp}°F)`,
        weight: 20
      })
      riskFactors.push('Soil temperature below minimum for germination')
    }
  }
  // Analyze frost risk in next 14 days
  maxScore += 25
  const frostDays = weatherData.forecast.filter(day => day.temperature.min < 32).length
  if (frostDays === 0) {
    totalScore += 25
    factors.push({
      factor: 'Frost Risk',
      status: 'positive',
      description: 'No frost expected in 14-day forecast',
      weight: 25
    })
  } else if (frostDays <= 2 && crop.climate.frostTolerance !== 'none') {
    totalScore += 20
    factors.push({
      factor: 'Frost Risk',
      status: 'neutral',
      description: `${frostDays} frost days expected, but crop has some tolerance`,
      weight: 25
    })
  } else {
    factors.push({
      factor: 'Frost Risk',
      status: 'negative',
      description: `${frostDays} frost days expected in forecast`,
      weight: 25
    })
    if (crop.climate.frostTolerance === 'none') {
      riskFactors.push('Frost-sensitive crop with freezing temperatures forecasted')
    }
  }
  // Analyze precipitation patterns
  maxScore += 15
  const totalPrecipitation = weatherData.forecast
    .slice(0, 7)
    .reduce((sum, day) => sum + day.precipitation, 0)
  if (totalPrecipitation >= 0.5 && totalPrecipitation <= 2.0) {
    totalScore += 15
    factors.push({
      factor: 'Precipitation',
      status: 'positive',
      description: `Good moisture levels (${totalPrecipitation.toFixed(1)}" next 7 days)`,
      weight: 15
    })
  } else if (totalPrecipitation > 2.0) {
    totalScore += 10
    factors.push({
      factor: 'Precipitation',
      status: 'neutral',
      description: `High rainfall expected (${totalPrecipitation.toFixed(1)}")`,
      weight: 15
    })
    riskFactors.push('Heavy rainfall may delay field operations')
  } else {
    totalScore += 5
    factors.push({
      factor: 'Precipitation',
      status: 'negative',
      description: `Low rainfall (${totalPrecipitation.toFixed(1)}") - irrigation needed`,
      weight: 15
    })
    riskFactors.push('Dry conditions require irrigation planning')
  }
  // Analyze temperature trends for next week
  maxScore += 20
  const weekTemps = weatherData.forecast.slice(0, 7)
  const avgTemp = weekTemps.reduce((sum, day) => sum + day.temperature.average, 0) / 7
  if (avgTemp >= crop.climate.optimalGrowingTemp[0] && 
      avgTemp <= crop.climate.optimalGrowingTemp[1]) {
    totalScore += 20
    factors.push({
      factor: 'Temperature Trend',
      status: 'positive',
      description: `Optimal growing temperatures (avg ${avgTemp.toFixed(1)}°F)`,
      weight: 20
    })
  } else if (avgTemp >= crop.climate.minGrowingTemp) {
    totalScore += 15
    factors.push({
      factor: 'Temperature Trend',
      status: 'neutral',
      description: `Adequate temperatures (avg ${avgTemp.toFixed(1)}°F)`,
      weight: 20
    })
  } else {
    factors.push({
      factor: 'Temperature Trend',
      status: 'negative',
      description: `Below optimal temperatures (avg ${avgTemp.toFixed(1)}°F)`,
      weight: 20
    })
  }
  // Analyze wind conditions for delicate operations
  maxScore += 10
  if (weatherData.current.windSpeed <= 15) {
    totalScore += 10
    factors.push({
      factor: 'Wind Conditions',
      status: 'positive',
      description: `Calm conditions (${weatherData.current.windSpeed} mph)`,
      weight: 10
    })
  } else if (weatherData.current.windSpeed <= 25) {
    totalScore += 7
    factors.push({
      factor: 'Wind Conditions',
      status: 'neutral',
      description: `Moderate winds (${weatherData.current.windSpeed} mph)`,
      weight: 10
    })
  } else {
    factors.push({
      factor: 'Wind Conditions',
      status: 'negative',
      description: `High winds (${weatherData.current.windSpeed} mph)`,
      weight: 10
    })
    riskFactors.push('High winds may interfere with planting operations')
  }
  // Calculate final confidence score
  const confidence = Math.round((totalScore / maxScore) * 100)
  // Determine recommendation based on score
  let recommendation: 'ideal' | 'good' | 'caution' | 'wait' | 'too_late'
  if (confidence >= 85) {
    recommendation = 'ideal'
  } else if (confidence >= 70) {
    recommendation = 'good'
  } else if (confidence >= 50) {
    recommendation = 'caution'
  } else if (confidence >= 30) {
    recommendation = 'wait'
  } else {
    recommendation = 'too_late'
  }
  // Find best planting dates in next 14 days
  const bestPlantingDates = findOptimalPlantingDates(crop, weatherData.forecast)
  // Set next evaluation date
  const nextEvaluation = new Date()
  nextEvaluation.setDate(nextEvaluation.getDate() + (recommendation === 'wait' ? 3 : 7))
  return {
    recommendation,
    confidence,
    factors,
    bestPlantingDates,
    riskFactors,
    nextEvaluation
  }
}
function findOptimalPlantingDates(
  crop: CropInfo,
  forecast: WeatherForecast[]
): Date[] {
  const optimalDates: Date[] = []
  forecast.forEach((day, index) => {
    // Skip if it's too soon (need time to prepare)
    if (index < 1) return
    // Check if conditions are suitable
    let score = 0
    // Temperature check
    if (day.temperature.min >= crop.climate.minGrowingTemp &&
        day.temperature.max <= crop.climate.optimalGrowingTemp[1] + 5) {
      score += 3
    }
    // Precipitation check (prefer light rain or dry conditions)
    if (day.precipitation <= 0.2) {
      score += 2
    }
    // Wind check
    if (day.windSpeed <= 15) {
      score += 1
    }
    // Check next few days don't have extreme conditions
    const nextDays = forecast.slice(index + 1, index + 4)
    const hasExtremeWeather = nextDays.some(nextDay => 
      nextDay.temperature.min < 32 || 
      nextDay.precipitation > 1.0 ||
      nextDay.windSpeed > 25
    )
    if (!hasExtremeWeather) {
      score += 2
    }
    // If score is high enough, add as optimal date
    if (score >= 6) {
      optimalDates.push(new Date(day.date))
    }
  })
  return optimalDates.slice(0, 3) // Return top 3 dates
}
// Get weather-based spacing recommendations
export function getWeatherBasedSpacing(
  crop: CropInfo,
  weatherData: ExtendedWeatherData
): {
  adjustedSpacing: {
    betweenPlants: number
    betweenRows: number
  }
  reasoning: string[]
} {
  const reasoning: string[] = []
  let plantSpacing = crop.spacing.betweenPlants
  let rowSpacing = crop.spacing.betweenRows
  // Analyze humidity levels for disease pressure
  if (weatherData.current.humidity > 80) {
    // Increase spacing in high humidity to improve air circulation
    plantSpacing *= 1.2
    rowSpacing *= 1.1
    reasoning.push('Increased spacing due to high humidity (disease prevention)')
  }
  // Analyze precipitation patterns
  const weeklyRain = weatherData.forecast
    .slice(0, 7)
    .reduce((sum, day) => sum + day.precipitation, 0)
  if (weeklyRain > 3) {
    // Increase spacing in wet conditions
    plantSpacing *= 1.15
    reasoning.push('Wider spacing recommended due to wet conditions')
  } else if (weeklyRain < 0.5) {
    // Can plant closer in dry conditions (less disease pressure)
    plantSpacing *= 0.9
    reasoning.push('Closer spacing possible in dry conditions')
  }
  // Wind considerations
  if (weatherData.current.windSpeed > 20) {
    // Closer planting for wind protection
    plantSpacing *= 0.95
    reasoning.push('Closer spacing for wind protection')
  }
  return {
    adjustedSpacing: {
      betweenPlants: Math.round(plantSpacing),
      betweenRows: Math.round(rowSpacing)
    },
    reasoning
  }
}
// Generate irrigation schedule based on weather and crop needs
export function generateIrrigationSchedule(
  crop: CropInfo,
  weatherData: ExtendedWeatherData,
  plantingDate: Date
): {
  schedule: {
    date: Date
    amount: number // inches
    priority: 'low' | 'medium' | 'high' | 'critical'
    reason: string
  }[]
  totalWaterNeeds: number // inches per week
} {
  const schedule: any[] = []
  let totalNeeds = crop.water.weeklyNeeds
  // Adjust for weather conditions
  const avgHumidity = weatherData.forecast
    .slice(0, 7)
    .reduce((sum, day) => sum + day.humidity, 0) / 7
  if (avgHumidity < 40) {
    totalNeeds *= 1.2 // Increase water needs in dry conditions
  } else if (avgHumidity > 80) {
    totalNeeds *= 0.8 // Reduce water needs in humid conditions
  }
  // Create irrigation schedule for next 14 days
  weatherData.forecast.slice(0, 14).forEach((day, index) => {
    const dayDate = new Date(day.date)
    const daysFromPlanting = Math.floor((dayDate.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
    // Skip if before planting or if significant rain expected
    if (daysFromPlanting < 0 || day.precipitation > 0.5) {
      return
    }
    // Check if it's a critical growth stage
    const isCriticalStage = crop.water.criticalStages.some(stage => {
      // Simple approximation of growth stages based on days from planting
      if (stage === 'germination' && daysFromPlanting <= 14) return true
      if (stage === 'flowering' && daysFromPlanting >= 45 && daysFromPlanting <= 75) return true
      if (stage === 'fruit development' && daysFromPlanting >= 60) return true
      return false
    })
    // Determine irrigation needs
    let amount = 0
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let reason = ''
    // Base irrigation need
    const weeklyDeficit = totalNeeds - (day.precipitation * 7) // Approximate weekly from daily
    if (weeklyDeficit > 0.5) {
      amount = weeklyDeficit / 2 // Split weekly need across multiple irrigation events
      if (isCriticalStage) {
        priority = 'critical'
        reason = 'Critical growth stage with insufficient rainfall'
      } else if (day.temperature.max > crop.climate.optimalGrowingTemp[1]) {
        priority = 'high'
        reason = 'High temperature stress'
      } else {
        priority = 'medium'
        reason = 'Regular irrigation schedule'
      }
      schedule.push({
        date: dayDate,
        amount: Math.round(amount * 10) / 10, // Round to 0.1 inch
        priority,
        reason
      })
    }
  })
  return {
    schedule,
    totalWaterNeeds: totalNeeds
  }
}