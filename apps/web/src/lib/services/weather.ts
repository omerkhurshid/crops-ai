/**
 * Weather Service for NBA Decision Engine
 * Provides weather data and forecast analysis for farming decisions
 */

export interface WeatherConditions {
  date: Date
  temperature: number // Celsius
  humidity: number // Percentage
  precipitation: number // mm
  windSpeed: number // km/h
  windDirection: number // degrees
  pressure: number // hPa
  cloudCover: number // percentage
  conditions: string // description
  uvIndex?: number
  visibility?: number // km
}

export interface WeatherForecast extends WeatherConditions {
  precipitationProbability: number // percentage
  minTemperature: number
  maxTemperature: number
}

export interface SprayWindow {
  start: Date
  end: Date
  duration: number // hours
  confidence: number // 0-100
  conditions: {
    windSpeed: number
    temperature: number
    humidity: number
    precipitation: number
  }
  suitabilityScore: number // 0-100
}

export interface HarvestWindow {
  start: Date
  end: Date
  duration: number // hours
  confidence: number // 0-100
  conditions: {
    precipitation: number
    humidity: number
    windSpeed: number
  }
  qualityScore: number // 0-100 based on optimal conditions
}

export class WeatherService {
  private apiKey: string | undefined
  private baseUrl = 'https://api.openweathermap.org/data/2.5'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENWEATHER_API_KEY
  }

  /**
   * Get current weather conditions for a location
   */
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherConditions> {
    if (!this.apiKey || this.apiKey === 'mock_development_key' || this.apiKey === 'your-openweather-api-key') {
      throw new Error('Weather service unavailable. Please configure OpenWeather API key.')
    }

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      throw new Error('Invalid coordinates provided')
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(
        `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`,
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Weather API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()

      // Validate response structure
      if (!data.main || !data.weather || !Array.isArray(data.weather) || data.weather.length === 0) {
        throw new Error('Invalid weather API response structure')
      }

      return {
        date: new Date(),
        temperature: Math.round(data.main.temp * 10) / 10,
        humidity: Math.round(data.main.humidity),
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
        windSpeed: Math.round((data.wind?.speed || 0) * 3.6 * 10) / 10, // Convert m/s to km/h
        windDirection: data.wind?.deg || 0,
        pressure: data.main.pressure,
        cloudCover: data.clouds?.all || 0,
        conditions: data.weather[0].description || 'unknown',
        uvIndex: data.uvi || undefined,
        visibility: data.visibility ? Math.round(data.visibility / 100) / 10 : undefined // Convert m to km
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {

          throw new Error('Weather service timed out. Please try again.')
        } else {
          console.error('Failed to fetch current weather:', error.message)
          throw new Error('Weather service unavailable. Please check your connection.')
        }
      }
      throw new Error('Weather service unavailable. Please try again.')
    }
  }

  /**
   * Get 7-day weather forecast for a location
   */
  async getWeatherForecast(latitude: number, longitude: number, days: number = 7): Promise<WeatherForecast[]> {
    if (!this.apiKey || this.apiKey === 'mock_development_key' || this.apiKey === 'your-openweather-api-key') {
      throw new Error('Weather forecast unavailable. Please configure OpenWeather API key.')
    }

    // Validate inputs
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      throw new Error('Invalid coordinates provided')
    }

    if (days < 1 || days > 16) {
      throw new Error('Days must be between 1 and 16')
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric&cnt=${Math.min(days * 8, 40)}`, // OpenWeather 5-day limit
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new Error(`Weather forecast API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()

      // Validate response structure
      if (!data.list || !Array.isArray(data.list) || data.list.length === 0) {
        throw new Error('Invalid weather forecast API response structure')
      }

      // Group by day and take daily averages
      const dailyForecasts: WeatherForecast[] = []
      const groupedByDay = new Map<string, any[]>()

      data.list.forEach((item: any) => {
        if (!item.dt || !item.main || !item.weather) return
        
        const date = new Date(item.dt * 1000)
        const dayKey = date.toISOString().split('T')[0]
        
        if (!groupedByDay.has(dayKey)) {
          groupedByDay.set(dayKey, [])
        }
        groupedByDay.get(dayKey)!.push(item)
      })

      for (const [dayKey, items] of Array.from(groupedByDay.entries())) {
        if (dailyForecasts.length >= days) break
        if (items.length === 0) continue

        const avgTemp = items.reduce((sum: number, item: any) => sum + (item.main?.temp || 0), 0) / items.length
        const minTemp = Math.min(...items.map((item: any) => item.main?.temp || 0))
        const maxTemp = Math.max(...items.map((item: any) => item.main?.temp || 0))
        const avgHumidity = items.reduce((sum: number, item: any) => sum + (item.main?.humidity || 0), 0) / items.length
        const totalPrecip = items.reduce((sum: number, item: any) => sum + (item.rain?.['3h'] || item.snow?.['3h'] || 0), 0)
        const avgWindSpeed = items.reduce((sum: number, item: any) => sum + ((item.wind?.speed || 0) * 3.6), 0) / items.length
        const precipProb = Math.max(...items.map((item: any) => (item.pop || 0) * 100))

        dailyForecasts.push({
          date: new Date(dayKey + 'T12:00:00.000Z'),
          temperature: Math.round(avgTemp * 10) / 10,
          minTemperature: Math.round(minTemp * 10) / 10,
          maxTemperature: Math.round(maxTemp * 10) / 10,
          humidity: Math.round(avgHumidity),
          precipitation: Math.round(totalPrecip * 10) / 10,
          precipitationProbability: Math.round(precipProb),
          windSpeed: Math.round(avgWindSpeed * 10) / 10,
          windDirection: items[0]?.wind?.deg || 0,
          pressure: items[0]?.main?.pressure || 1013,
          cloudCover: items[0]?.clouds?.all || 0,
          conditions: items[0]?.weather?.[0]?.description || 'unknown'
        })
      }

      return dailyForecasts
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {

          throw new Error('Weather forecast timed out. Please try again.')
        } else {
          console.error('Failed to fetch weather forecast:', error.message)
          throw new Error('Weather forecast unavailable. Please check your connection.')
        }
      }
      throw new Error('Weather forecast unavailable. Please try again.')
    }
  }

  /**
   * Find optimal spray windows in the forecast period
   */
  async findSprayWindows(
    latitude: number, 
    longitude: number, 
    days: number = 7
  ): Promise<SprayWindow[]> {
    const forecast = await this.getWeatherForecast(latitude, longitude, days)
    const windows: SprayWindow[] = []

    let currentWindow: {
      start: Date
      conditions: WeatherForecast[]
    } | null = null

    for (const day of forecast) {
      const isGoodSprayDay = this.evaluateSprayConditions(day)

      if (isGoodSprayDay && !currentWindow) {
        // Start new window
        currentWindow = {
          start: day.date,
          conditions: [day]
        }
      } else if (isGoodSprayDay && currentWindow) {
        // Continue current window
        currentWindow.conditions.push(day)
      } else if (!isGoodSprayDay && currentWindow) {
        // End current window
        const window = this.buildSprayWindow(currentWindow)
        if (window.duration >= 4) { // Minimum 4-hour window
          windows.push(window)
        }
        currentWindow = null
      }
    }

    // Handle window that extends to end of forecast
    if (currentWindow) {
      const window = this.buildSprayWindow(currentWindow)
      if (window.duration >= 4) {
        windows.push(window)
      }
    }

    return windows.sort((a, b) => b.suitabilityScore - a.suitabilityScore)
  }

  /**
   * Find optimal harvest windows in the forecast period
   */
  async findHarvestWindows(
    latitude: number, 
    longitude: number, 
    days: number = 10
  ): Promise<HarvestWindow[]> {
    const forecast = await this.getWeatherForecast(latitude, longitude, days)
    const windows: HarvestWindow[] = []

    let currentWindow: {
      start: Date
      conditions: WeatherForecast[]
    } | null = null

    for (const day of forecast) {
      const isGoodHarvestDay = this.evaluateHarvestConditions(day)

      if (isGoodHarvestDay && !currentWindow) {
        currentWindow = {
          start: day.date,
          conditions: [day]
        }
      } else if (isGoodHarvestDay && currentWindow) {
        currentWindow.conditions.push(day)
      } else if (!isGoodHarvestDay && currentWindow) {
        const window = this.buildHarvestWindow(currentWindow)
        if (window.duration >= 24) { // Minimum 1-day window
          windows.push(window)
        }
        currentWindow = null
      }
    }

    if (currentWindow) {
      const window = this.buildHarvestWindow(currentWindow)
      if (window.duration >= 24) {
        windows.push(window)
      }
    }

    return windows.sort((a, b) => b.qualityScore - a.qualityScore)
  }

  /**
   * Evaluate if conditions are suitable for spraying
   */
  private evaluateSprayConditions(weather: WeatherForecast): boolean {
    return (
      weather.windSpeed <= 15 && // Max 15 km/h wind
      weather.windSpeed >= 3 &&  // Min 3 km/h for drift control
      weather.temperature >= 10 && weather.temperature <= 30 &&
      weather.precipitation <= 0.5 && // Minimal rain
      weather.precipitationProbability <= 20 && // Low rain chance
      weather.humidity <= 85 // Not too humid
    )
  }

  /**
   * Evaluate if conditions are suitable for harvest
   */
  private evaluateHarvestConditions(weather: WeatherForecast): boolean {
    return (
      weather.precipitation <= 1 && // Very light rain acceptable
      weather.precipitationProbability <= 30 &&
      weather.humidity <= 75 &&
      weather.windSpeed <= 40 // Strong wind ok for harvest
    )
  }

  /**
   * Build spray window object from conditions
   */
  private buildSprayWindow(windowData: {
    start: Date
    conditions: WeatherForecast[]
  }): SprayWindow {
    const endDate = new Date(windowData.start.getTime() + (windowData.conditions.length * 24 * 60 * 60 * 1000))
    const avgConditions = this.calculateAverageConditions(windowData.conditions)
    
    // Calculate suitability score
    const windScore = this.scoreWindConditions(avgConditions.windSpeed, 3, 15)
    const tempScore = this.scoreTempConditions(avgConditions.temperature, 15, 25)
    const humidityScore = this.scoreHumidityConditions(avgConditions.humidity, 40, 70)
    const rainScore = avgConditions.precipitation <= 0.5 ? 100 : 0

    const suitabilityScore = (windScore + tempScore + humidityScore + rainScore) / 4

    return {
      start: windowData.start,
      end: endDate,
      duration: windowData.conditions.length * 24,
      confidence: Math.min(95, suitabilityScore * 1.1),
      conditions: avgConditions,
      suitabilityScore: Math.round(suitabilityScore)
    }
  }

  /**
   * Build harvest window object from conditions
   */
  private buildHarvestWindow(windowData: {
    start: Date
    conditions: WeatherForecast[]
  }): HarvestWindow {
    const endDate = new Date(windowData.start.getTime() + (windowData.conditions.length * 24 * 60 * 60 * 1000))
    const avgConditions = this.calculateAverageConditions(windowData.conditions)
    
    // Calculate quality score
    const rainScore = avgConditions.precipitation <= 1 ? 100 : Math.max(0, 100 - (avgConditions.precipitation * 20))
    const humidityScore = avgConditions.humidity <= 65 ? 100 : Math.max(0, 100 - ((avgConditions.humidity - 65) * 2))
    
    const qualityScore = (rainScore + humidityScore) / 2

    return {
      start: windowData.start,
      end: endDate,
      duration: windowData.conditions.length * 24,
      confidence: Math.min(90, qualityScore * 1.2),
      conditions: {
        precipitation: avgConditions.precipitation,
        humidity: avgConditions.humidity,
        windSpeed: avgConditions.windSpeed
      },
      qualityScore: Math.round(qualityScore)
    }
  }

  /**
   * Calculate average weather conditions
   */
  private calculateAverageConditions(conditions: WeatherForecast[]) {
    const count = conditions.length
    return {
      temperature: conditions.reduce((sum, c) => sum + c.temperature, 0) / count,
      humidity: conditions.reduce((sum, c) => sum + c.humidity, 0) / count,
      precipitation: conditions.reduce((sum, c) => sum + c.precipitation, 0) / count,
      windSpeed: conditions.reduce((sum, c) => sum + c.windSpeed, 0) / count
    }
  }

  /**
   * Score wind conditions (0-100)
   */
  private scoreWindConditions(windSpeed: number, minWind: number, maxWind: number): number {
    if (windSpeed < minWind || windSpeed > maxWind) return 0
    const optimalWind = (minWind + maxWind) / 2
    const deviation = Math.abs(windSpeed - optimalWind)
    const maxDeviation = (maxWind - minWind) / 2
    return Math.max(0, 100 - (deviation / maxDeviation) * 100)
  }

  /**
   * Score temperature conditions (0-100)
   */
  private scoreTempConditions(temp: number, minTemp: number, maxTemp: number): number {
    if (temp < minTemp || temp > maxTemp) return 0
    const optimalTemp = (minTemp + maxTemp) / 2
    const deviation = Math.abs(temp - optimalTemp)
    const maxDeviation = (maxTemp - minTemp) / 2
    return Math.max(0, 100 - (deviation / maxDeviation) * 100)
  }

  /**
   * Score humidity conditions (0-100)
   */
  private scoreHumidityConditions(humidity: number, minHumidity: number, maxHumidity: number): number {
    if (humidity < minHumidity) return 100 // Lower humidity is better
    if (humidity > maxHumidity) return 0
    const range = maxHumidity - minHumidity
    return Math.max(0, 100 - ((humidity - minHumidity) / range) * 100)
  }

}