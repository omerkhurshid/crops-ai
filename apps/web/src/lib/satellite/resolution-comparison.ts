/**
 * Satellite Resolution Impact Analysis
 * 
 * Shows the practical differences between MODIS (250m) and Sentinel-2 (10m)
 * for different farm sizes and use cases.
 */

export interface ResolutionImpact {
  farmSize: number // acres
  modis250m: {
    pixelsPerField: number
    canDetect: string[]
    limitations: string[]
    accuracy: 'poor' | 'fair' | 'good' | 'excellent'
  }
  sentinel10m: {
    pixelsPerField: number
    canDetect: string[]
    advantages: string[]
    accuracy: 'poor' | 'fair' | 'good' | 'excellent'
  }
  recommendation: string
}

export function analyzeResolutionImpact(farmSizeAcres: number): ResolutionImpact {
  // 1 acre = 4,047 m²
  // 250m pixel = 62,500 m² = 15.4 acres
  // 10m pixel = 100 m² = 0.025 acres
  
  const acresPerModisPixel = 15.4
  const acresPerSentinelPixel = 0.025
  
  const modisPixels = Math.max(1, Math.round(farmSizeAcres / acresPerModisPixel))
  const sentinelPixels = Math.round(farmSizeAcres / acresPerSentinelPixel)

  let modisAccuracy: 'poor' | 'fair' | 'good' | 'excellent'
  let sentinelAccuracy: 'poor' | 'fair' | 'good' | 'excellent'
  let recommendation: string

  if (farmSizeAcres < 50) {
    modisAccuracy = 'poor'
    sentinelAccuracy = 'excellent'
    recommendation = 'Use Sentinel-2 (10m). MODIS too coarse for small fields.'
  } else if (farmSizeAcres < 200) {
    modisAccuracy = 'fair'
    sentinelAccuracy = 'excellent'
    recommendation = 'Sentinel-2 strongly recommended. MODIS only for basic monitoring.'
  } else if (farmSizeAcres < 500) {
    modisAccuracy = 'good'
    sentinelAccuracy = 'excellent'
    recommendation = 'Sentinel-2 preferred, but MODIS acceptable for basic analysis.'
  } else {
    modisAccuracy = 'good'
    sentinelAccuracy = 'excellent'
    recommendation = 'Either works well. Choose based on cost/complexity preferences.'
  }

  return {
    farmSize: farmSizeAcres,
    modis250m: {
      pixelsPerField: modisPixels,
      canDetect: getModisCapabilities(farmSizeAcres),
      limitations: getModisLimitations(farmSizeAcres),
      accuracy: modisAccuracy
    },
    sentinel10m: {
      pixelsPerField: sentinelPixels,
      canDetect: getSentinelCapabilities(),
      advantages: getSentinelAdvantages(farmSizeAcres),
      accuracy: sentinelAccuracy
    },
    recommendation
  }
}

function getModisCapabilities(acres: number): string[] {
  const base = [
    'Overall field health trend',
    'Seasonal vegetation changes',
    'Drought stress (field-wide)',
    'Harvest timing (general)'
  ]
  
  if (acres > 200) {
    return [
      ...base,
      'Major pest/disease outbreaks',
      'Irrigation effectiveness (large zones)',
      'Crop rotation planning'
    ]
  }
  
  return base
}

function getModisLimitations(acres: number): string[] {
  const base = [
    'Cannot detect small problem areas',
    'Mixed pixel problem (crops + roads + buildings)',
    'Poor boundary accuracy'
  ]
  
  if (acres < 100) {
    return [
      ...base,
      'Entire field may be 1-2 pixels',
      'Unusable for precision agriculture',
      'Cannot guide variable rate application'
    ]
  }
  
  return base
}

function getSentinelCapabilities(): string[] {
  return [
    'Individual crop rows visible',
    'Equipment tracks and compaction',
    'Drainage problems',
    'Pest/disease hotspots (5-10 acre areas)',
    'Irrigation uniformity',
    'Weed pressure mapping',
    'Harvest readiness variation',
    'Soil variability effects',
    'Variable rate fertilizer guidance',
    'Yield prediction (sub-field level)'
  ]
}

function getSentinelAdvantages(acres: number): string[] {
  const base = [
    'Precise field boundaries',
    'Early problem detection',
    'Variable rate application guidance',
    'Insurance claim documentation'
  ]
  
  if (acres < 100) {
    return [
      ...base,
      'Critical for small fields',
      'Can detect 1-acre problem areas',
      'Suitable for precision farming'
    ]
  }
  
  return base
}

/**
 * Real-world examples of what each resolution can detect
 */
export const realWorldExamples = {
  smallFarm40Acres: {
    modis250m: {
      pixels: '2-3 pixels total',
      example: 'Like looking at your house from space - you can see it exists, but not much detail',
      ndviAccuracy: 'One sick corner could be averaged out by healthy areas',
      practical: 'Can tell if the whole farm is drought-stressed, but not where'
    },
    sentinel10m: {
      pixels: '1,600 pixels',
      example: 'Like using Google Earth street view - you can see individual features',
      ndviAccuracy: 'Can pinpoint exact problem areas down to a few crop rows',
      practical: 'Can guide tractor to exact spot needing attention'
    }
  },
  
  largeFarm500Acres: {
    modis250m: {
      pixels: '30+ pixels',
      example: 'Good overview, like looking at neighborhood from airplane',
      ndviAccuracy: 'Reliable for field-wide trends and major issues',
      practical: 'Perfect for management decisions and crop insurance'
    },
    sentinel10m: {
      pixels: '20,000 pixels',
      example: 'Incredible detail, like having a drone survey every 30 feet',
      ndviAccuracy: 'Can create detailed prescription maps',
      practical: 'Variable rate everything - seed, fertilizer, pesticide'
    }
  }
}

/**
 * Cost-benefit analysis
 */
export function getCostBenefitRecommendation(
  farmSize: number, 
  budget: 'free' | 'low' | 'medium' | 'high'
): string {
  if (budget === 'free') {
    if (farmSize < 100) {
      return 'Use Google Earth Engine (free) for Sentinel-2. Essential for small farms.'
    } else {
      return 'NASA MODIS is acceptable for large farms. Consider upgrading later.'
    }
  }
  
  if (farmSize < 50) {
    return 'Must use high-resolution (Sentinel-2). MODIS will not provide actionable insights.'
  }
  
  if (farmSize > 1000) {
    return 'Both work well. MODIS might be sufficient and more cost-effective.'
  }
  
  return 'Sentinel-2 recommended for precision agriculture benefits.'
}