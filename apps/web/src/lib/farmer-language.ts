// Data transformation layer to convert technical terms to farmer-friendly language

interface TechnicalTerm {
  technical: string
  farmer: string
  description?: string
}

// Vegetation indices translations
export const vegetationIndices: Record<string, TechnicalTerm> = {
  ndvi: {
    technical: 'NDVI',
    farmer: 'Plant Health Score',
    description: 'How green and healthy your crops are'
  },
  evi: {
    technical: 'EVI',
    farmer: 'Growth Vigor',
    description: 'How actively your crops are growing'
  },
  savi: {
    technical: 'SAVI',
    farmer: 'Soil-Adjusted Health',
    description: 'Plant health accounting for soil background'
  },
  gndvi: {
    technical: 'GNDVI',
    farmer: 'Green Coverage',
    description: 'How much green vegetation covers your field'
  },
  ndwi: {
    technical: 'NDWI',
    farmer: 'Water Content',
    description: 'How much water your plants have'
  },
  ndmi: {
    technical: 'NDMI',
    farmer: 'Moisture Level',
    description: 'Plant moisture stress indicator'
  },
  lai: {
    technical: 'LAI',
    farmer: 'Leaf Density',
    description: 'How thick your crop canopy is'
  },
  fvc: {
    technical: 'FVC',
    farmer: 'Ground Coverage',
    description: 'Percentage of ground covered by plants'
  }
}

// Stress indicators translations
export const stressIndicators: Record<string, TechnicalTerm> = {
  drought: {
    technical: 'Drought Stress',
    farmer: 'Water Shortage',
    description: 'Areas that need more water'
  },
  disease: {
    technical: 'Disease Pressure',
    farmer: 'Plant Disease',
    description: 'Signs of crop illness or disease'
  },
  nutrient: {
    technical: 'Nutrient Deficiency',
    farmer: 'Fertilizer Needs',
    description: 'Areas needing more nutrients'
  },
  pest: {
    technical: 'Pest Pressure',
    farmer: 'Bug Problems',
    description: 'Insect or pest damage detected'
  }
}

// Weather terms
export const weatherTerms: Record<string, TechnicalTerm> = {
  precipitation: {
    technical: 'Precipitation',
    farmer: 'Rainfall',
    description: 'Rain and snow amounts'
  },
  evapotranspiration: {
    technical: 'Evapotranspiration',
    farmer: 'Water Loss',
    description: 'Water lost from soil and plants'
  },
  gdd: {
    technical: 'Growing Degree Days',
    farmer: 'Growth Units',
    description: 'Heat units needed for crop development'
  },
  humidity: {
    technical: 'Relative Humidity',
    farmer: 'Air Moisture',
    description: 'How much moisture is in the air'
  },
  dewPoint: {
    technical: 'Dew Point',
    farmer: 'Dew Temperature',
    description: 'Temperature when dew forms'
  }
}

// Financial terms
export const financialTerms: Record<string, TechnicalTerm> = {
  roi: {
    technical: 'ROI',
    farmer: 'Return on Investment',
    description: 'Profit made for every dollar spent'
  },
  grossMargin: {
    technical: 'Gross Margin',
    farmer: 'Profit Margin',
    description: 'Percentage of revenue kept as profit'
  },
  breakeven: {
    technical: 'Break-even Point',
    farmer: 'Break-even',
    description: 'Amount needed to cover all costs'
  },
  capex: {
    technical: 'Capital Expenditure',
    farmer: 'Equipment Costs',
    description: 'Money spent on equipment and machinery'
  },
  opex: {
    technical: 'Operating Expenditure',
    farmer: 'Running Costs',
    description: 'Day-to-day farm operation costs'
  }
}

// Zone classifications
export const zoneNames: Record<string, TechnicalTerm> = {
  excellent: {
    technical: 'Excellent Zone',
    farmer: 'Thriving Areas',
    description: 'Your best performing crop areas'
  },
  good: {
    technical: 'Good Zone',
    farmer: 'Healthy Areas',
    description: 'Areas doing well'
  },
  moderate: {
    technical: 'Moderate Zone',
    farmer: 'Average Areas',
    description: 'Areas that could improve'
  },
  stressed: {
    technical: 'Stressed Zone',
    farmer: 'Problem Areas',
    description: 'Areas needing immediate attention'
  }
}

// Convert technical values to farmer-friendly descriptions
export function convertHealthScore(score: number): string {
  if (score >= 90) return 'Excellent - Your crops are thriving!'
  if (score >= 80) return 'Very Good - Crops are healthy and growing well'
  if (score >= 70) return 'Good - Crops are doing well with minor issues'
  if (score >= 60) return 'Fair - Some areas need attention'
  if (score >= 50) return 'Poor - Several problems detected'
  return 'Critical - Immediate action needed'
}

export function convertStressLevel(percentage: number): string {
  if (percentage <= 5) return 'No stress - Everything looks great!'
  if (percentage <= 15) return 'Light stress - Keep monitoring'
  if (percentage <= 30) return 'Moderate stress - Some areas need help'
  if (percentage <= 50) return 'High stress - Action needed soon'
  return 'Critical stress - Immediate attention required'
}

export function convertNDVI(value: number): string {
  if (value >= 0.8) return 'Excellent plant health'
  if (value >= 0.6) return 'Good plant health'
  if (value >= 0.4) return 'Moderate plant health'
  if (value >= 0.2) return 'Poor plant health'
  return 'Very poor plant health'
}

export function convertMoistureLevel(value: number): string {
  if (value >= 0.7) return 'Well watered'
  if (value >= 0.5) return 'Adequate moisture'
  if (value >= 0.3) return 'Getting dry'
  if (value >= 0.1) return 'Needs water'
  return 'Very dry'
}

// Convert weather conditions to farmer-friendly alerts
export function convertWeatherAlert(type: string, severity: string): string {
  const alerts: Record<string, Record<string, string>> = {
    frost: {
      low: 'Possible frost tonight - consider protection',
      medium: 'Frost warning - protect sensitive crops',
      high: 'Hard freeze expected - take immediate action'
    },
    drought: {
      low: 'Dry conditions - monitor soil moisture',
      medium: 'Drought developing - plan irrigation',
      high: 'Severe drought - immediate watering needed'
    },
    storm: {
      low: 'Light storms possible - secure loose items',
      medium: 'Strong storms expected - check equipment',
      high: 'Severe weather warning - ensure safety'
    },
    heat: {
      low: 'Hot weather - ensure adequate water',
      medium: 'Heat stress possible - increase irrigation',
      high: 'Extreme heat - crops at risk'
    }
  }

  return alerts[type]?.[severity] || `${type} alert - ${severity} conditions expected`
}

// Convert recommendations to actionable farmer language
export function convertRecommendation(technical: string): string {
  const patterns: Record<string, string> = {
    'Monitor NDVI levels': 'Check your crop health scores regularly',
    'Increase irrigation': 'Your crops need more water',
    'Apply nitrogen fertilizer': 'Consider adding nitrogen fertilizer',
    'Scout for pests': 'Check your fields for bugs and pests',
    'Soil moisture monitoring': 'Keep an eye on soil moisture levels',
    'Nutrient deficiency detected': 'Your crops may need more nutrients',
    'Disease pressure increasing': 'Watch for signs of crop disease',
    'Optimize planting density': 'Adjust how close you plant crops',
    'Consider cover crops': 'Think about planting cover crops',
    'Harvest timing optimization': 'Plan your harvest timing carefully'
  }

  // Check for exact matches first
  for (const [pattern, replacement] of Object.entries(patterns)) {
    if (technical.includes(pattern)) {
      return replacement
    }
  }

  // If no pattern matches, return the original but clean it up
  return technical
    .replace(/NDVI/g, 'plant health')
    .replace(/EVI/g, 'growth vigor')
    .replace(/LAI/g, 'leaf density')
    .replace(/nitrogen/g, 'nitrogen fertilizer')
    .replace(/moisture deficit/g, 'dry soil')
    .replace(/stress indicators/g, 'warning signs')
}

// Get farmer-friendly term
export function getFarmerTerm(technical: string, category: 'vegetation' | 'stress' | 'weather' | 'financial' | 'zone' = 'vegetation'): string {
  const categories = {
    vegetation: vegetationIndices,
    stress: stressIndicators,
    weather: weatherTerms,
    financial: financialTerms,
    zone: zoneNames
  }

  const term = categories[category][technical.toLowerCase()]
  return term?.farmer || technical
}

// Get description for a term
export function getTermDescription(technical: string, category: 'vegetation' | 'stress' | 'weather' | 'financial' | 'zone' = 'vegetation'): string {
  const categories = {
    vegetation: vegetationIndices,
    stress: stressIndicators,
    weather: weatherTerms,
    financial: financialTerms,
    zone: zoneNames
  }

  const term = categories[category][technical.toLowerCase()]
  return term?.description || 'Agricultural measurement'
}

// Convert technical date ranges to farmer-friendly seasons
export function convertToFarmerDate(dateString: string): string {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Farmer-friendly season mappings
  if (month >= 3 && month <= 5) {
    if (month === 3 && day < 15) return 'Early Spring Planting'
    if (month === 3) return 'Spring Planting Season'
    if (month === 4) return 'Peak Planting Time'
    if (month === 5) return 'Late Spring Planting'
  }
  
  if (month >= 6 && month <= 8) {
    if (month === 6) return 'Early Growing Season'
    if (month === 7) return 'Mid-Summer Growth'
    if (month === 8) return 'Late Summer Growth'
  }
  
  if (month >= 9 && month <= 11) {
    if (month === 9) return 'Early Harvest Season'
    if (month === 10) return 'Peak Harvest Time'
    if (month === 11) return 'Late Harvest & Prep'
  }
  
  if (month === 12 || month === 1 || month === 2) {
    if (month === 12) return 'Winter Planning Time'
    if (month === 1) return 'Equipment Prep Season'
    if (month === 2) return 'Pre-Season Planning'
  }
  
  return date.toLocaleDateString()
}

// Convert date ranges to farmer seasons
export function convertDateRangeToSeason(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startMonth = start.getMonth() + 1
  const endMonth = end.getMonth() + 1
  
  // Common farming seasons
  if (startMonth >= 3 && endMonth <= 5) return 'Planting Season'
  if (startMonth >= 6 && endMonth <= 8) return 'Growing Season'  
  if (startMonth >= 9 && endMonth <= 11) return 'Harvest Season'
  if (startMonth >= 12 || endMonth <= 2) return 'Off-Season'
  
  // Cross-season ranges
  if (startMonth <= 5 && endMonth >= 9) return 'Full Growing Cycle'
  if (startMonth >= 3 && endMonth >= 9) return 'Planting to Harvest'
  
  return `${convertToFarmerDate(startDate)} - ${convertToFarmerDate(endDate)}`
}