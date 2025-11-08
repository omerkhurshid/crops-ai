// Crop Knowledge Database
// Built from USDA data, extension service recommendations, and agricultural research
export interface CropInfo {
  id: string
  name: string
  scientificName: string
  family: CropFamily
  variety?: string
  // Planting information
  plantingDepth: number // inches
  spacing: {
    betweenPlants: number // inches
    betweenRows: number // inches
  }
  // Timing (days)
  daysToGermination: number
  daysToMaturity: number
  harvestWindow: number // days harvest can be delayed
  // Climate requirements
  climate: {
    minSoilTemp: number // °F
    optimalSoilTemp: [number, number] // [min, max] °F
    minGrowingTemp: number // °F
    optimalGrowingTemp: [number, number] // [min, max] °F
    frostTolerance: 'none' | 'light' | 'moderate' | 'heavy'
    chillHours?: number // for fruit trees
  }
  // Soil requirements
  soil: {
    phRange: [number, number] // [min, max]
    drainagePreference: 'poor' | 'moderate' | 'good' | 'excellent'
    fertilityNeeds: 'low' | 'moderate' | 'high'
    organicMatterPreference: 'low' | 'moderate' | 'high'
  }
  // Water needs
  water: {
    weeklyNeeds: number // inches per week
    criticalStages: string[] // when water is most important
    droughtTolerance: 'poor' | 'moderate' | 'good' | 'excellent'
  }
  // Nutrition (NPK impact on soil)
  nutrition: {
    nitrogenDemand: 'low' | 'moderate' | 'high'
    phosphorusDemand: 'low' | 'moderate' | 'high'
    potassiumDemand: 'low' | 'moderate' | 'high'
    nitrogenContribution: number // for legumes, lbs N per acre
  }
  // Rotation characteristics
  rotation: {
    family: CropFamily
    benefits: string[] // what this crop provides to soil/following crops
    avoidAfter: CropFamily[] // families to avoid planting after
    goodAfter: CropFamily[] // families that work well before this crop
    restPeriod: number // years before replanting same family in field
  }
  // Companion planting
  companions: {
    beneficial: string[] // crop IDs that grow well together
    antagonistic: string[] // crop IDs to avoid nearby
    trapCrops: string[] // crops that can be used to lure pests away
  }
  // Common issues
  pests: {
    common: string[]
    organic_controls: string[]
  }
  diseases: {
    common: string[]
    prevention: string[]
  }
  // Harvest info
  harvest: {
    indicators: string[] // visual/physical signs of readiness
    method: string
    postHarvestHandling: string
    storageLife: number // days under optimal conditions
  }
}
export enum CropFamily {
  BRASSICAS = 'brassicas', // Cabbage, broccoli, kale, radish
  LEGUMES = 'legumes', // Beans, peas, lentils
  NIGHTSHADES = 'nightshades', // Tomatoes, peppers, eggplant, potatoes
  CUCURBITS = 'cucurbits', // Squash, cucumbers, melons
  ALLIUMS = 'alliums', // Onions, garlic, leeks
  GRASSES = 'grasses', // Corn, wheat, oats, rice
  UMBELLIFERS = 'umbellifers', // Carrots, parsley, dill
  CHENOPODS = 'chenopods', // Beets, spinach, chard
  COMPOSITES = 'composites', // Lettuce, sunflowers, artichokes
  AMARANTHS = 'amaranths', // Amaranth, quinoa
  COVER_CROPS = 'cover_crops' // Clover, rye grass, buckwheat
}
// Climate zone mapping based on USDA hardiness zones and last frost dates
export interface ClimateZone {
  zone: string
  description: string
  lastFrostDate: string // MM-DD format
  firstFrostDate: string // MM-DD format
  growingDegreeThreshold: number // base temperature for GDD calculation
  averageAnnualMinTemp: [number, number] // [min, max] °F
}
export const CLIMATE_ZONES: ClimateZone[] = [
  {
    zone: '3a',
    description: 'Northern Minnesota, North Dakota',
    lastFrostDate: '05-15',
    firstFrostDate: '09-15',
    growingDegreeThreshold: 50,
    averageAnnualMinTemp: [-40, -35]
  },
  {
    zone: '4a', 
    description: 'Minnesota, Wisconsin, Northern Iowa',
    lastFrostDate: '05-01',
    firstFrostDate: '10-01',
    growingDegreeThreshold: 50,
    averageAnnualMinTemp: [-30, -25]
  },
  {
    zone: '5a',
    description: 'Iowa, Illinois, Indiana, Ohio',
    lastFrostDate: '04-15',
    firstFrostDate: '10-15',
    growingDegreeThreshold: 50,
    averageAnnualMinTemp: [-20, -15]
  },
  {
    zone: '6a',
    description: 'Missouri, Kentucky, Tennessee, North Carolina',
    lastFrostDate: '04-01',
    firstFrostDate: '10-30',
    growingDegreeThreshold: 50,
    averageAnnualMinTemp: [-10, -5]
  },
  {
    zone: '7a',
    description: 'Arkansas, Alabama, Georgia, South Carolina',
    lastFrostDate: '03-15',
    firstFrostDate: '11-15',
    growingDegreeThreshold: 50,
    averageAnnualMinTemp: [0, 5]
  },
  {
    zone: '8a',
    description: 'Texas, Louisiana, Mississippi, Florida',
    lastFrostDate: '03-01',
    firstFrostDate: '12-01',
    growingDegreeThreshold: 50,
    averageAnnualMinTemp: [10, 15]
  },
  {
    zone: '9a',
    description: 'South Florida, South Texas, Southern California',
    lastFrostDate: '02-15',
    firstFrostDate: '12-15',
    growingDegreeThreshold: 50,
    averageAnnualMinTemp: [20, 25]
  }
]
// Core crop database - start with most common crops
export const CROP_DATABASE: CropInfo[] = [
  {
    id: 'tomato-determinate',
    name: 'Tomato (Determinate)',
    scientificName: 'Solanum lycopersicum',
    family: CropFamily.NIGHTSHADES,
    plantingDepth: 0.25,
    spacing: {
      betweenPlants: 18,
      betweenRows: 36
    },
    daysToGermination: 7,
    daysToMaturity: 75,
    harvestWindow: 21,
    climate: {
      minSoilTemp: 60,
      optimalSoilTemp: [65, 75],
      minGrowingTemp: 50,
      optimalGrowingTemp: [65, 80],
      frostTolerance: 'none'
    },
    soil: {
      phRange: [6.0, 6.8],
      drainagePreference: 'good',
      fertilityNeeds: 'high',
      organicMatterPreference: 'high'
    },
    water: {
      weeklyNeeds: 1.5,
      criticalStages: ['flowering', 'fruit development'],
      droughtTolerance: 'moderate'
    },
    nutrition: {
      nitrogenDemand: 'high',
      phosphorusDemand: 'moderate',
      potassiumDemand: 'high',
      nitrogenContribution: 0
    },
    rotation: {
      family: CropFamily.NIGHTSHADES,
      benefits: [],
      avoidAfter: [CropFamily.NIGHTSHADES],
      goodAfter: [CropFamily.LEGUMES, CropFamily.BRASSICAS],
      restPeriod: 3
    },
    companions: {
      beneficial: ['basil', 'marigold', 'carrots'],
      antagonistic: ['corn', 'fennel', 'walnut-trees'],
      trapCrops: ['nasturtium']
    },
    pests: {
      common: ['hornworm', 'aphids', 'whiteflies', 'cutworms'],
      organic_controls: ['beneficial insects', 'neem oil', 'row covers']
    },
    diseases: {
      common: ['early blight', 'late blight', 'fusarium wilt'],
      prevention: ['crop rotation', 'proper spacing', 'avoid overhead watering']
    },
    harvest: {
      indicators: ['color change from green', 'slight softness', 'easy separation from vine'],
      method: 'twist and pull gently',
      postHarvestHandling: 'store at room temperature to ripen',
      storageLife: 7
    }
  },
  {
    id: 'corn-sweet',
    name: 'Sweet Corn',
    scientificName: 'Zea mays',
    family: CropFamily.GRASSES,
    plantingDepth: 1.5,
    spacing: {
      betweenPlants: 6,
      betweenRows: 30
    },
    daysToGermination: 10,
    daysToMaturity: 85,
    harvestWindow: 7,
    climate: {
      minSoilTemp: 60,
      optimalSoilTemp: [65, 75],
      minGrowingTemp: 50,
      optimalGrowingTemp: [70, 85],
      frostTolerance: 'none'
    },
    soil: {
      phRange: [6.0, 7.0],
      drainagePreference: 'good',
      fertilityNeeds: 'high',
      organicMatterPreference: 'high'
    },
    water: {
      weeklyNeeds: 1.0,
      criticalStages: ['tasseling', 'silk emergence', 'kernel filling'],
      droughtTolerance: 'poor'
    },
    nutrition: {
      nitrogenDemand: 'high',
      phosphorusDemand: 'moderate',
      potassiumDemand: 'moderate',
      nitrogenContribution: 0
    },
    rotation: {
      family: CropFamily.GRASSES,
      benefits: ['adds organic matter when tilled in'],
      avoidAfter: [CropFamily.GRASSES],
      goodAfter: [CropFamily.LEGUMES],
      restPeriod: 2
    },
    companions: {
      beneficial: ['beans', 'squash', 'sunflowers'],
      antagonistic: ['tomatoes'],
      trapCrops: []
    },
    pests: {
      common: ['corn earworm', 'corn borer', 'armyworm'],
      organic_controls: ['beneficial insects', 'Bt spray', 'crop rotation']
    },
    diseases: {
      common: ['corn smut', 'northern leaf blight'],
      prevention: ['resistant varieties', 'crop rotation', 'proper spacing']
    },
    harvest: {
      indicators: ['silks turn brown', 'kernels milky when punctured', 'ears feel full'],
      method: 'twist and pull downward',
      postHarvestHandling: 'harvest in cool morning, use immediately',
      storageLife: 3
    }
  },
  {
    id: 'soybean',
    name: 'Soybean',
    scientificName: 'Glycine max',
    family: CropFamily.LEGUMES,
    plantingDepth: 1.0,
    spacing: {
      betweenPlants: 2,
      betweenRows: 30
    },
    daysToGermination: 7,
    daysToMaturity: 120,
    harvestWindow: 14,
    climate: {
      minSoilTemp: 60,
      optimalSoilTemp: [65, 75],
      minGrowingTemp: 50,
      optimalGrowingTemp: [70, 85],
      frostTolerance: 'none'
    },
    soil: {
      phRange: [6.0, 7.0],
      drainagePreference: 'good',
      fertilityNeeds: 'moderate',
      organicMatterPreference: 'moderate'
    },
    water: {
      weeklyNeeds: 1.0,
      criticalStages: ['flowering', 'pod filling'],
      droughtTolerance: 'moderate'
    },
    nutrition: {
      nitrogenDemand: 'low',
      phosphorusDemand: 'moderate',
      potassiumDemand: 'moderate',
      nitrogenContribution: 150 // fixes nitrogen from air
    },
    rotation: {
      family: CropFamily.LEGUMES,
      benefits: ['fixes nitrogen', 'improves soil structure'],
      avoidAfter: [CropFamily.LEGUMES],
      goodAfter: [CropFamily.GRASSES],
      restPeriod: 3
    },
    companions: {
      beneficial: ['corn', 'sunflowers'],
      antagonistic: ['garlic', 'onions'],
      trapCrops: []
    },
    pests: {
      common: ['soybean aphid', 'bean leaf beetle', 'stink bugs'],
      organic_controls: ['beneficial insects', 'row covers', 'companion planting']
    },
    diseases: {
      common: ['soybean rust', 'sudden death syndrome', 'white mold'],
      prevention: ['resistant varieties', 'crop rotation', 'fungicide timing']
    },
    harvest: {
      indicators: ['pods rattle when shaken', 'leaves yellow and drop', 'beans hard'],
      method: 'cut plants when pods are dry',
      postHarvestHandling: 'dry to 13% moisture for storage',
      storageLife: 365
    }
  },
  {
    id: 'wheat-winter',
    name: 'Winter Wheat',
    scientificName: 'Triticum aestivum',
    family: CropFamily.GRASSES,
    plantingDepth: 1.5,
    spacing: {
      betweenPlants: 1,
      betweenRows: 7
    },
    daysToGermination: 7,
    daysToMaturity: 240, // planted in fall, harvested next summer
    harvestWindow: 10,
    climate: {
      minSoilTemp: 45,
      optimalSoilTemp: [50, 65],
      minGrowingTemp: 40,
      optimalGrowingTemp: [60, 75],
      frostTolerance: 'heavy',
      chillHours: 1000
    },
    soil: {
      phRange: [6.0, 7.5],
      drainagePreference: 'good',
      fertilityNeeds: 'moderate',
      organicMatterPreference: 'moderate'
    },
    water: {
      weeklyNeeds: 0.8,
      criticalStages: ['tillering', 'jointing', 'heading', 'grain filling'],
      droughtTolerance: 'good'
    },
    nutrition: {
      nitrogenDemand: 'high',
      phosphorusDemand: 'moderate',
      potassiumDemand: 'moderate',
      nitrogenContribution: 0
    },
    rotation: {
      family: CropFamily.GRASSES,
      benefits: ['adds organic matter', 'provides ground cover'],
      avoidAfter: [CropFamily.GRASSES],
      goodAfter: [CropFamily.LEGUMES, CropFamily.BRASSICAS],
      restPeriod: 2
    },
    companions: {
      beneficial: ['clover', 'vetch'],
      antagonistic: [],
      trapCrops: []
    },
    pests: {
      common: ['aphids', 'wheat midge', 'armyworm'],
      organic_controls: ['beneficial insects', 'crop rotation', 'resistant varieties']
    },
    diseases: {
      common: ['stripe rust', 'leaf rust', 'fusarium head blight'],
      prevention: ['resistant varieties', 'fungicide timing', 'crop rotation']
    },
    harvest: {
      indicators: ['golden color', 'hard kernels', 'dry stems'],
      method: 'combine harvesting when grain moisture 12-15%',
      postHarvestHandling: 'dry to 14% moisture for storage',
      storageLife: 365
    }
  }
]
// Helper functions for crop planning
export function getCropById(id: string): CropInfo | undefined {
  return CROP_DATABASE.find(crop => crop.id === id)
}
export function getCropsByFamily(family: CropFamily): CropInfo[] {
  return CROP_DATABASE.filter(crop => crop.family === family)
}
export function getRotationCompatibility(previousCrop: CropInfo, nextCrop: CropInfo): {
  compatible: boolean
  reason: string
  score: number // 0-10, 10 being best
} {
  // Check if next crop should avoid previous crop's family
  if (nextCrop.rotation.avoidAfter.includes(previousCrop.family)) {
    return {
      compatible: false,
      reason: `${nextCrop.name} should not follow ${previousCrop.family} crops`,
      score: 0
    }
  }
  // Check if same family (usually problematic)
  if (previousCrop.family === nextCrop.family) {
    return {
      compatible: false,
      reason: 'Same crop family increases disease and pest pressure',
      score: 2
    }
  }
  // Check if next crop benefits from previous crop
  if (nextCrop.rotation.goodAfter.includes(previousCrop.family)) {
    let reason = `${nextCrop.name} benefits from following ${previousCrop.family} crops`
    let score = 8
    // Extra bonus for nitrogen-fixing crops
    if (previousCrop.nutrition.nitrogenContribution > 0 && nextCrop.nutrition.nitrogenDemand === 'high') {
      reason += ` (nitrogen benefit: ${previousCrop.nutrition.nitrogenContribution} lbs/acre)`
      score = 10
    }
    return {
      compatible: true,
      reason,
      score
    }
  }
  // Neutral - no specific benefits or problems
  return {
    compatible: true,
    reason: 'Neutral rotation - no specific benefits or conflicts',
    score: 6
  }
}
export function calculatePlantingWindow(
  crop: CropInfo, 
  climateZone: ClimateZone,
  targetHarvestDate?: Date
): {
  earliestPlanting: Date
  latestPlanting: Date
  optimalPlanting: Date
  notes: string[]
} {
  const currentYear = new Date().getFullYear()
  const lastFrost = new Date(`${currentYear}-${climateZone.lastFrostDate}`)
  const firstFrost = new Date(`${currentYear}-${climateZone.firstFrostDate}`)
  const notes: string[] = []
  // Calculate earliest safe planting date
  let earliestPlanting = new Date(lastFrost)
  if (crop.climate.frostTolerance === 'none') {
    earliestPlanting.setDate(lastFrost.getDate() + 7) // 1 week after last frost
    notes.push('Plant 1 week after last frost for frost-sensitive crops')
  } else if (crop.climate.frostTolerance === 'light') {
    earliestPlanting = lastFrost
    notes.push('Can plant around last frost date')
  } else {
    earliestPlanting.setDate(lastFrost.getDate() - 14) // 2 weeks before last frost
    notes.push('Cold-hardy crop can be planted 2 weeks before last frost')
  }
  // Calculate latest planting date based on maturity and first frost
  let latestPlanting = new Date(firstFrost)
  latestPlanting.setDate(firstFrost.getDate() - crop.daysToMaturity - 7) // 1 week buffer
  // If we have a target harvest date, work backwards
  if (targetHarvestDate) {
    const targetPlanting = new Date(targetHarvestDate)
    targetPlanting.setDate(targetHarvestDate.getDate() - crop.daysToMaturity)
    if (targetPlanting > earliestPlanting && targetPlanting < latestPlanting) {
      latestPlanting = targetPlanting
      notes.push(`Planting calculated for target harvest date: ${targetHarvestDate.toDateString()}`)
    }
  }
  // Optimal planting is usually 1-2 weeks after earliest safe date
  const optimalPlanting = new Date(earliestPlanting)
  optimalPlanting.setDate(earliestPlanting.getDate() + 10)
  return {
    earliestPlanting,
    latestPlanting,
    optimalPlanting,
    notes
  }
}
// Generate planting recommendations based on weather and crop requirements
export function generatePlantingRecommendations(
  crop: CropInfo,
  farmLocation: { latitude: number; longitude: number },
  weatherData: any, // Current weather conditions
  soilData?: any // Optional soil test data
): {
  recommendation: 'plant_now' | 'wait' | 'too_late' | 'plan_for_next_season'
  confidence: number // 0-100
  reasons: string[]
  nextCheckDate?: Date
} {
  const reasons: string[] = []
  let confidence = 80
  // Check soil temperature (if available)
  if (weatherData.soilTemperature) {
    if (weatherData.soilTemperature < crop.climate.minSoilTemp) {
      return {
        recommendation: 'wait',
        confidence: 90,
        reasons: [`Soil temperature too cold: ${weatherData.soilTemperature}°F (need ${crop.climate.minSoilTemp}°F)`],
        nextCheckDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Check again in 1 week
      }
    }
    if (weatherData.soilTemperature >= crop.climate.optimalSoilTemp[0] && 
        weatherData.soilTemperature <= crop.climate.optimalSoilTemp[1]) {
      reasons.push(`Optimal soil temperature: ${weatherData.soilTemperature}°F`)
      confidence += 10
    }
  }
  // Check upcoming weather forecast
  if (weatherData.forecast && weatherData.forecast.length > 0) {
    const nextWeekTemps = weatherData.forecast.slice(0, 7).map((day: any) => day.temperature || day.temp)
    const minTemp = Math.min(...nextWeekTemps)
    if (crop.climate.frostTolerance === 'none' && minTemp < 32) {
      return {
        recommendation: 'wait',
        confidence: 85,
        reasons: [`Frost risk in next 7 days (low: ${minTemp}°F). ${crop.name} is frost-sensitive.`],
        nextCheckDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Check again in 3 days
      }
    }
  }
  // Check soil moisture (if recent rainfall data available)
  if (weatherData.precipitation && weatherData.precipitation > 2) {
    reasons.push('Recent heavy rainfall - ensure good drainage before planting')
    confidence -= 10
  } else if (weatherData.precipitation && weatherData.precipitation < 0.1) {
    reasons.push('Dry conditions - plan for immediate irrigation after planting')
    confidence -= 5
  }
  // Seasonal timing check
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  // Very basic seasonal recommendations (would be enhanced with climate zone data)
  if (crop.family === CropFamily.NIGHTSHADES && currentMonth < 3) {
    return {
      recommendation: 'too_late',
      confidence: 95,
      reasons: ['Too early for warm-season crops. Start seeds indoors if desired.']
    }
  }
  return {
    recommendation: 'plant_now',
    confidence,
    reasons: reasons.length > 0 ? reasons : ['Conditions are suitable for planting']
  }
}