// Weather-to-task generation engine
// Automatically creates actionable tasks based on weather conditions

interface WeatherCondition {
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  frostRisk: number
  heatStress: number
  conditions: string
}

interface CropInfo {
  type: string
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest'
  plantingDate: Date
}

interface GeneratedTask {
  id: string
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  category: 'water' | 'pest' | 'weather' | 'harvest' | 'protection'
  timeframe: string
  field?: string
  impact?: string
}

export function generateWeatherTasks(
  weather: WeatherCondition,
  forecast: WeatherCondition[],
  crops: CropInfo[],
  soilMoisture?: number
): GeneratedTask[] {
  const tasks: GeneratedTask[] = []
  
  // Frost Protection Tasks
  if (weather.frostRisk > 70) {
    crops.forEach((crop, index) => {
      if (crop.growthStage === 'seedling' || crop.growthStage === 'flowering') {
        tasks.push({
          id: `frost-${index}`,
          title: 'Protect crops from frost tonight',
          description: `Frost expected (${weather.frostRisk}% risk). Cover sensitive ${crop.type} plants or use frost protection methods.`,
          urgency: 'critical',
          category: 'protection',
          timeframe: 'Before sunset today',
          field: `Field ${index + 1}`,
          impact: 'Prevent 20-30% yield loss'
        })
      }
    })
  }

  // Irrigation Tasks
  const nextRainIndex = forecast.findIndex(f => f.precipitation > 0.1)
  const daysUntilRain = nextRainIndex === -1 ? 7 : nextRainIndex
  
  if (soilMoisture !== undefined && soilMoisture < 30 && daysUntilRain > 2) {
    tasks.push({
      id: 'irrigation-1',
      title: 'Start irrigation - soil getting dry',
      description: `Soil moisture at ${soilMoisture}%. No rain expected for ${daysUntilRain} days.`,
      urgency: soilMoisture < 20 ? 'high' : 'medium',
      category: 'water',
      timeframe: soilMoisture < 20 ? 'Today' : 'Within 2 days',
      impact: 'Maintain optimal growth'
    })
  }

  // Heat Stress Management
  if (weather.heatStress > 60) {
    tasks.push({
      id: 'heat-1',
      title: 'Manage heat stress',
      description: `High temperatures expected (${weather.temperature}°F). Increase irrigation frequency and consider shade nets.`,
      urgency: weather.heatStress > 80 ? 'high' : 'medium',
      category: 'weather',
      timeframe: 'Today',
      impact: 'Reduce heat damage'
    })
  }

  // Harvest Timing
  const goodHarvestDays = forecast
    .slice(0, 5)
    .map((f, i) => ({ day: i, weather: f }))
    .filter(d => d.weather.precipitation < 0.1 && d.weather.humidity < 60)
  
  if (goodHarvestDays.length > 0) {
    crops.forEach((crop, index) => {
      if (crop.growthStage === 'harvest') {
        tasks.push({
          id: `harvest-${index}`,
          title: `Optimal harvest window for ${crop.type}`,
          description: `Best conditions on day ${goodHarvestDays[0].day + 1}. Low moisture ensures quality.`,
          urgency: 'medium',
          category: 'harvest',
          timeframe: `In ${goodHarvestDays[0].day + 1} days`,
          field: `Field ${index + 1}`,
          impact: 'Maximize crop quality'
        })
      }
    })
  }

  // Storm Preparation
  const stormIndex = forecast.findIndex(f => 
    f.windSpeed > 30 || f.precipitation > 2
  )
  
  if (stormIndex !== -1 && stormIndex < 3) {
    tasks.push({
      id: 'storm-prep',
      title: 'Prepare for incoming storm',
      description: `Strong winds (${forecast[stormIndex].windSpeed} mph) and heavy rain expected in ${stormIndex + 1} days.`,
      urgency: 'high',
      category: 'weather',
      timeframe: `${stormIndex + 1} days`,
      impact: 'Prevent equipment damage'
    })
  }

  // Disease Prevention (high humidity after rain)
  const wetPeriod = forecast.filter(f => f.humidity > 80).length
  if (wetPeriod > 3) {
    tasks.push({
      id: 'disease-prev',
      title: 'Apply preventive fungicide',
      description: 'Extended high humidity period increases disease risk.',
      urgency: 'medium',
      category: 'pest',
      timeframe: 'Within 3 days',
      impact: 'Prevent fungal infections'
    })
  }

  return tasks.sort((a, b) => {
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
  })
}

// Convert weather alerts to farmer-friendly language
export function convertWeatherAlert(
  alertType: string, 
  severity: string,
  details?: any
): string {
  const alerts: Record<string, Record<string, string>> = {
    FROST_WARNING: {
      low: 'Light frost possible - monitor sensitive crops',
      medium: 'Frost likely tonight - protect young plants',
      high: 'Hard freeze warning - immediate protection needed'
    },
    DROUGHT_ALERT: {
      low: 'Dry conditions developing - check soil moisture',
      medium: 'Drought conditions - increase irrigation',
      high: 'Severe drought - water conservation critical'
    },
    STORM_WARNING: {
      low: 'Storms possible - secure loose equipment',
      medium: 'Strong storms expected - harvest if ready',
      high: 'Severe weather imminent - take shelter'
    },
    HEAT_ADVISORY: {
      low: 'Warm weather - ensure adequate water',
      medium: 'Heat stress likely - increase irrigation',
      high: 'Extreme heat - protect workers and crops'
    },
    WIND_ADVISORY: {
      low: 'Breezy conditions - delay spraying',
      medium: 'High winds expected - secure equipment',
      high: 'Damaging winds possible - reinforce structures'
    }
  }

  return alerts[alertType]?.[severity] || 
    `${alertType.replace(/_/g, ' ')} - ${severity} conditions expected`
}