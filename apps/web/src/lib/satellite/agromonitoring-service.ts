/**
 * AgroMonitoring API Integration (OpenWeather)
 * 
 * Perfect balance: Real satellite data + affordable pricing + agriculture focus
 * Resolution: 10m (Sentinel-2) with processed agricultural indices
 * Cost: $150/month for 100k requests (vs $5k+ for Planet Labs)
 */

export interface AgroMonitoringConfig {
  apiKey: string
  baseUrl: string
}

export interface PolygonRequest {
  name: string
  geo_json: {
    type: 'Feature'
    properties: {}
    geometry: {
      type: 'Polygon'
      coordinates: number[][][]
    }
  }
}

export interface AgroSatelliteImage {
  dt: number // Unix timestamp
  type: 'Landsat 8' | 'Sentinel-2'
  dc: number // Data coverage percentage
  cl: number // Cloud coverage percentage
  sun: {
    azimuth: number
    elevation: number
  }
  image: {
    truecolor: string // PNG URL
    falsecolor: string // PNG URL  
    ndvi: string // PNG URL
    evi: string // PNG URL
  }
  tile: {
    truecolor: string // GeoTIFF URL
    falsecolor: string // GeoTIFF URL
    ndvi: string // GeoTIFF URL
    evi: string // GeoTIFF URL
  }
  stats: {
    ndvi: {
      min: number
      max: number
      mean: number
      median: number
      std: number
      num: number
      histogram: Array<[number, number]> // [value, count] pairs
    }
    evi: {
      min: number
      max: number  
      mean: number
      median: number
      std: number
      num: number
      histogram: Array<[number, number]>
    }
  }
}

export interface AgroWeatherData {
  dt: number
  temperature: number
  feels_like: number
  pressure: number
  humidity: number
  dew_point: number
  clouds: number
  visibility: number
  wind_speed: number
  wind_deg: number
  weather: Array<{
    main: string
    description: string
  }>
  pop: number // Probability of precipitation
  rain?: {
    '1h': number
  }
  snow?: {
    '1h': number
  }
}

export interface SoilData {
  dt: number
  t0: number // Surface temperature (K)
  t10: number // Soil temperature at 10cm depth (K)  
  moisture: number // Soil moisture m3/m3
}

export class AgroMonitoringService {
  private config: AgroMonitoringConfig
  private readonly REQUEST_TIMEOUT = 30000

  constructor(config: AgroMonitoringConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'http://api.agromonitoring.com/agro/1.0'
    }
  }

  /**
   * Create a polygon (field boundary) for monitoring
   */
  async createPolygon(fieldData: PolygonRequest): Promise<{ id: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/polygons?appid=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fieldData),
        signal: AbortSignal.timeout(this.REQUEST_TIMEOUT)
      })

      if (!response.ok) {
        throw new Error(`Failed to create polygon: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('AgroMonitoring polygon creation failed:', error)
      throw error
    }
  }

  /**
   * Get available satellite images for a field
   */
  async getSatelliteImages(
    polygonId: string, 
    start: number, 
    end: number
  ): Promise<AgroSatelliteImage[]> {
    try {
      const url = `${this.config.baseUrl}/image/search?` + 
        `start=${start}&end=${end}&polyid=${polygonId}&appid=${this.config.apiKey}`

      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.REQUEST_TIMEOUT)
      })

      if (!response.ok) {
        throw new Error(`Failed to get satellite images: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('AgroMonitoring satellite search failed:', error)
      throw error
    }
  }

  /**
   * Get current weather for field
   */
  async getCurrentWeather(polygonId: string): Promise<AgroWeatherData> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/weather?polyid=${polygonId}&appid=${this.config.apiKey}`,
        { signal: AbortSignal.timeout(this.REQUEST_TIMEOUT) }
      )

      if (!response.ok) {
        throw new Error(`Failed to get weather: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('AgroMonitoring weather request failed:', error)
      throw error
    }
  }

  /**
   * Get weather forecast for field
   */
  async getWeatherForecast(polygonId: string): Promise<AgroWeatherData[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/weather/forecast?polyid=${polygonId}&appid=${this.config.apiKey}`,
        { signal: AbortSignal.timeout(this.REQUEST_TIMEOUT) }
      )

      if (!response.ok) {
        throw new Error(`Failed to get forecast: ${response.statusText}`)
      }

      const data = await response.json()
      return data.list || []
    } catch (error) {
      console.error('AgroMonitoring forecast request failed:', error)
      throw error
    }
  }

  /**
   * Get soil data for field
   */
  async getSoilData(polygonId: string): Promise<SoilData> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/soil?polyid=${polygonId}&appid=${this.config.apiKey}`,
        { signal: AbortSignal.timeout(this.REQUEST_TIMEOUT) }
      )

      if (!response.ok) {
        throw new Error(`Failed to get soil data: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('AgroMonitoring soil request failed:', error)
      throw error
    }
  }

  /**
   * Calculate comprehensive field health from real satellite data
   */
  async getFieldHealth(polygonId: string): Promise<FieldHealthAssessment> {
    try {
      // Get latest satellite imagery (past 30 days)
      const endDate = Math.floor(Date.now() / 1000)
      const startDate = endDate - (30 * 24 * 60 * 60) // 30 days ago

      const images = await this.getSatelliteImages(polygonId, startDate, endDate)
      
      if (images.length === 0) {
        throw new Error('No recent satellite images available')
      }

      // Get the latest clear image (< 30% cloud cover)
      const clearImages = images
        .filter(img => img.cl < 30 && img.dc > 70)
        .sort((a, b) => b.dt - a.dt)

      if (clearImages.length === 0) {
        throw new Error('No clear satellite images in the past 30 days')
      }

      const latestImage = clearImages[0]
      const ndviStats = latestImage.stats.ndvi
      const eviStats = latestImage.stats.evi

      // Get current weather for context
      const weather = await this.getCurrentWeather(polygonId)
      const soil = await this.getSoilData(polygonId)

      // Calculate health score based on real data
      const healthScore = this.calculateHealthScore(ndviStats, eviStats, weather, soil)
      const stressLevel = this.determineStressLevel(healthScore, ndviStats.mean)
      const recommendations = await this.generateRecommendations(
        healthScore, 
        stressLevel, 
        weather, 
        soil, 
        ndviStats
      )

      return {
        healthScore,
        stressLevel,
        ndvi: {
          current: ndviStats.mean,
          min: ndviStats.min,
          max: ndviStats.max,
          variability: ndviStats.std
        },
        evi: {
          current: eviStats.mean,
          min: eviStats.min,
          max: eviStats.max,
          variability: eviStats.std
        },
        weather: {
          temperature: weather.temperature - 273.15, // Convert K to C
          humidity: weather.humidity,
          soilMoisture: soil.moisture,
          lastRain: weather.rain?.['1h'] || 0
        },
        imagery: {
          acquisitionDate: new Date(latestImage.dt * 1000),
          cloudCover: latestImage.cl,
          dataQuality: latestImage.dc,
          source: latestImage.type,
          ndviImageUrl: latestImage.image.ndvi,
          trueColorUrl: latestImage.image.truecolor
        },
        recommendations,
        confidence: this.calculateConfidence(latestImage, weather),
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Field health assessment failed:', error)
      throw error
    }
  }

  /**
   * Calculate health score from multiple real data sources
   */
  private calculateHealthScore(
    ndvi: any, 
    evi: any, 
    weather: AgroWeatherData, 
    soil: SoilData
  ): number {
    let score = 0
    
    // NDVI contribution (40% of score)
    if (ndvi.mean > 0.8) score += 40
    else if (ndvi.mean > 0.6) score += 32
    else if (ndvi.mean > 0.4) score += 24
    else if (ndvi.mean > 0.2) score += 16
    else score += 8

    // EVI contribution (30% of score)  
    if (evi.mean > 0.5) score += 30
    else if (evi.mean > 0.3) score += 24
    else if (evi.mean > 0.2) score += 18
    else score += 12

    // Soil moisture contribution (20% of score)
    if (soil.moisture > 0.3) score += 20
    else if (soil.moisture > 0.2) score += 16
    else if (soil.moisture > 0.1) score += 12
    else score += 8

    // Weather stress factors (10% of score)
    const tempC = weather.temperature - 273.15
    if (tempC > 35 || tempC < 0) score += 5  // Temperature stress
    else if (tempC > 30 || tempC < 5) score += 7
    else score += 10

    return Math.min(100, score)
  }

  /**
   * Determine stress level from health score and NDVI
   */
  private determineStressLevel(
    healthScore: number, 
    ndviMean: number
  ): 'none' | 'low' | 'moderate' | 'high' | 'severe' {
    if (healthScore > 85 && ndviMean > 0.7) return 'none'
    if (healthScore > 70 && ndviMean > 0.5) return 'low'  
    if (healthScore > 55 && ndviMean > 0.3) return 'moderate'
    if (healthScore > 40) return 'high'
    return 'severe'
  }

  /**
   * Generate actionable recommendations based on real data
   */
  private async generateRecommendations(
    healthScore: number,
    stressLevel: string,
    weather: AgroWeatherData,
    soil: SoilData,
    ndvi: any
  ): Promise<string[]> {
    const recommendations: string[] = []
    
    // Irrigation recommendations based on soil moisture
    if (soil.moisture < 0.15) {
      recommendations.push('🚰 Soil moisture critically low - consider irrigation within 24 hours')
    } else if (soil.moisture < 0.25) {
      recommendations.push('💧 Monitor soil moisture closely - irrigation may be needed soon')
    }

    // Temperature stress recommendations
    const tempC = weather.temperature - 273.15
    if (tempC > 35) {
      recommendations.push('🌡️ High temperature stress detected - avoid midday applications')
    }

    // NDVI-based recommendations
    if (ndvi.mean < 0.4 && ndvi.std > 0.2) {
      recommendations.push('🌱 Variable plant health detected - scout for pest/disease issues')
    }

    // Weather-based recommendations
    if (weather.pop > 60) {
      recommendations.push('🌧️ Rain likely in next 24 hours - postpone spraying operations')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Field conditions look good - maintain current management')
    }

    return recommendations
  }

  private calculateConfidence(image: AgroSatelliteImage, weather: AgroWeatherData): number {
    let confidence = 100
    
    // Reduce confidence for cloudy images
    confidence -= image.cl * 0.5
    
    // Reduce confidence for low data coverage  
    confidence -= (100 - image.dc) * 0.3
    
    // Reduce confidence for old data
    const daysOld = (Date.now() / 1000 - image.dt) / (24 * 60 * 60)
    confidence -= Math.min(daysOld * 2, 30)
    
    return Math.max(0, Math.round(confidence))
  }
}

interface FieldHealthAssessment {
  healthScore: number
  stressLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  ndvi: {
    current: number
    min: number
    max: number
    variability: number
  }
  evi: {
    current: number
    min: number  
    max: number
    variability: number
  }
  weather: {
    temperature: number
    humidity: number
    soilMoisture: number
    lastRain: number
  }
  imagery: {
    acquisitionDate: Date
    cloudCover: number
    dataQuality: number
    source: string
    ndviImageUrl: string
    trueColorUrl: string
  }
  recommendations: string[]
  confidence: number
  lastUpdated: Date
}