/**
 * Satellite Service Comparison with Real Limitations
 * 
 * Detailed analysis of area limits, costs, and practical constraints
 */

export interface ServiceLimits {
  name: string
  freeAreaLimit: number // hectares
  paidAreaLimit: number // hectares  
  maxPolygons: number
  resolution: string
  updateFrequency: string
  monthlyRequests: number
  costStructure: string
  realWorldLimit: string
}

export const satelliteServiceComparison: ServiceLimits[] = [
  {
    name: 'AgroMonitoring (OpenWeather)',
    freeAreaLimit: 1000, // 1,000 hectares = 2,471 acres
    paidAreaLimit: 4000, // 4,000 hectares = 9,884 acres  
    maxPolygons: 100,
    resolution: '10m (Sentinel-2)',
    updateFrequency: '5 days',
    monthlyRequests: 100000,
    costStructure: '$150/month fixed',
    realWorldLimit: 'Max ~25 medium farms (400 acres each)'
  },
  {
    name: 'Google Earth Engine',
    freeAreaLimit: Infinity, // No area limit
    paidAreaLimit: Infinity,
    maxPolygons: Infinity, 
    resolution: '10m (Sentinel-2), 30m (Landsat)',
    updateFrequency: '5-16 days',
    monthlyRequests: 250000, // But complex compute limits
    costStructure: 'FREE + compute costs',
    realWorldLimit: 'Unlimited farms, but complex quota management'
  },
  {
    name: 'Copernicus Open Access',
    freeAreaLimit: Infinity,
    paidAreaLimit: Infinity,
    maxPolygons: Infinity,
    resolution: '10m (Sentinel-2)',  
    updateFrequency: '5 days',
    monthlyRequests: Infinity,
    costStructure: 'FREE (EU taxpayer funded)',
    realWorldLimit: 'Unlimited, but raw data processing required'
  },
  {
    name: 'NASA Giovanni/MODIS', 
    freeAreaLimit: Infinity,
    paidAreaLimit: Infinity,
    maxPolygons: Infinity,
    resolution: '250m (MODIS)',
    updateFrequency: 'Daily',
    monthlyRequests: Infinity,
    costStructure: 'FREE',
    realWorldLimit: 'Unlimited, but poor resolution for small farms'
  }
]

/**
 * Calculate if a service can handle your expected farm portfolio
 */
export function canServiceHandleFarms(
  service: ServiceLimits,
  farms: Array<{ acres: number }>,
  isPaid: boolean = false
): {
  canHandle: boolean
  totalAcres: number
  totalHectares: number
  limitExceeded: boolean
  recommendation: string
} {
  const totalAcres = farms.reduce((sum, farm) => sum + farm.acres, 0)
  const totalHectares = totalAcres * 0.404686 // acres to hectares
  
  const areaLimit = isPaid ? service.paidAreaLimit : service.freeAreaLimit
  const limitExceeded = totalHectares > areaLimit
  
  let recommendation = ''
  
  if (limitExceeded && service.name === 'AgroMonitoring (OpenWeather)') {
    recommendation = `❌ AgroMonitoring cannot handle ${totalAcres.toFixed(0)} acres (${totalHectares.toFixed(0)} ha). Limit: ${areaLimit} ha. Consider Google Earth Engine.`
  } else if (service.name === 'Google Earth Engine') {
    recommendation = `✅ Google Earth Engine can handle unlimited area, but requires technical expertise to implement.`
  } else if (!limitExceeded) {
    recommendation = `✅ ${service.name} can handle your ${totalAcres.toFixed(0)} acres comfortably.`
  }
  
  return {
    canHandle: !limitExceeded,
    totalAcres,
    totalHectares, 
    limitExceeded,
    recommendation
  }
}

/**
 * Typical farm portfolio analysis
 */
export const farmPortfolioExamples = {
  smallFarmApp: [
    { acres: 100 }, { acres: 150 }, { acres: 80 }, { acres: 200 }, { acres: 120 }
  ], // 5 farms, 650 total acres = 263 hectares ✅ AgroMonitoring OK
  
  mediumFarmApp: [
    { acres: 500 }, { acres: 800 }, { acres: 600 }, { acres: 400 }, { acres: 1200 },
    { acres: 300 }, { acres: 700 }, { acres: 900 }, { acres: 450 }, { acres: 350 }
  ], // 10 farms, 6,200 total acres = 2,509 hectares ✅ AgroMonitoring OK
  
  largeFarmApp: Array.from({ length: 50 }, (_, i) => ({ acres: 400 + i * 100 })),
  // 50 farms, 27,500 total acres = 11,128 hectares ❌ AgroMonitoring EXCEEDED
  
  enterpriseFarmApp: Array.from({ length: 200 }, (_, i) => ({ acres: 500 + i * 50 })),
  // 200 farms, 600,000 total acres ❌ AgroMonitoring WAY EXCEEDED
}

/**
 * Business model impact analysis
 */
export function analyzeBusinessModel(expectedFarms: number, avgFarmSize: number) {
  const totalAcres = expectedFarms * avgFarmSize
  const totalHectares = totalAcres * 0.404686
  
  const agroMonitoringLimit = 4000 // hectares (paid tier)
  const googleEarthEngineComplexity = 'High - requires GIS developers'
  
  if (totalHectares <= 1000) {
    return {
      phase: 'MVP/Startup',
      recommendation: 'AgroMonitoring FREE tier sufficient',
      monthlyCost: '$0',
      timeToImplement: '1-2 weeks',
      technicalRisk: 'Low'
    }
  } else if (totalHectares <= 4000) {
    return {
      phase: 'Growing Business', 
      recommendation: 'AgroMonitoring PAID tier',
      monthlyCost: '$150',
      timeToImplement: '1-2 weeks', 
      technicalRisk: 'Low'
    }
  } else {
    return {
      phase: 'Enterprise Scale',
      recommendation: 'Google Earth Engine mandatory',
      monthlyCost: '$500-2000 (estimated compute costs)',
      timeToImplement: '2-6 months',
      technicalRisk: 'High - need GIS/Python expertise'
    }
  }
}