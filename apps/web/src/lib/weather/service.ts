export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    country?: string;
  };
  temperature: number; // Celsius
  feelsLike: number;
  humidity: number; // percentage
  pressure: number; // hPa
  visibility: number; // meters
  uvIndex?: number;
  windSpeed: number; // m/s
  windDirection: number; // degrees
  windGust?: number; // m/s
  cloudCover: number; // percentage
  precipitation: {
    rain1h?: number; // mm in last hour
    rain3h?: number; // mm in last 3 hours
    snow1h?: number; // mm in last hour
    snow3h?: number; // mm in last 3 hours
  };
  conditions: WeatherCondition[];
  timestamp: string;
  sunrise?: string;
  sunset?: string;
}

export interface WeatherForecast {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  date: string;
  temperature: {
    min: number;
    max: number;
    morning: number;
    day: number;
    evening: number;
    night: number;
  };
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  precipitationProbability: number; // percentage
  precipitationAmount?: number; // mm
  conditions: WeatherCondition[];
  uvIndex?: number;
}

export interface WeatherAlert {
  id: string;
  alertType: 'frost' | 'storm' | 'drought' | 'heat' | 'wind' | 'hail' | 'flood';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  affectedAreas: string[];
  recommendations: string[];
  isActive: boolean;
}

export interface AgricultureWeatherData {
  location: {
    latitude: number;
    longitude: number;
  };
  soilTemperature?: {
    depth0cm: number;
    depth6cm: number;
    depth18cm: number;
    depth54cm: number;
  };
  soilMoisture?: {
    depth0_1cm: number;
    depth1_3cm: number;
    depth3_9cm: number;
    depth9_27cm: number;
  };
  evapotranspiration?: number; // mm/day
  growingDegreeDays?: number;
  chillHours?: number;
  frostRisk?: 'none' | 'low' | 'moderate' | 'high';
  heatStress?: 'none' | 'low' | 'moderate' | 'high' | 'severe';
}

class WeatherService {
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
  private readonly AGRO_URL = 'https://api.openweathermap.org/data/2.5/agro';

  constructor() {
    this.API_KEY = process.env.OPENWEATHER_API_KEY || '';
    if (!this.API_KEY || this.API_KEY === 'mock_development_key') {
      console.warn('OpenWeather API key not configured. Weather data will be unavailable.');
    }
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeather | null> {
    try {
      if (!this.API_KEY || this.API_KEY === 'mock_development_key') {
        console.warn(`Weather API unavailable - OpenWeather API key not configured for ${latitude}, ${longitude}`);
        throw new Error('Weather service unavailable. Please configure OpenWeather API key.');
      }

      const url = `${this.BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${this.API_KEY}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Weather API error ${response.status}: ${response.statusText}`);
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const currentWeather: CurrentWeather = {
        id: `current_${latitude}_${longitude}_${Date.now()}`,
        location: {
          latitude,
          longitude,
          name: data.name,
          country: data.sys?.country,
        },
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility || 0,
        windSpeed: data.wind?.speed || 0,
        windDirection: data.wind?.deg || 0,
        windGust: data.wind?.gust,
        cloudCover: data.clouds?.all || 0,
        precipitation: {
          rain1h: data.rain?.['1h'],
          rain3h: data.rain?.['3h'],
          snow1h: data.snow?.['1h'],
          snow3h: data.snow?.['3h'],
        },
        conditions: data.weather || [],
        timestamp: new Date().toISOString(),
        sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : undefined,
        sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : undefined,
      };

      return currentWeather;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  async getWeatherForecast(
    latitude: number,
    longitude: number,
    days: number = 7
  ): Promise<WeatherForecast[]> {
    try {
      if (!this.API_KEY || this.API_KEY === 'mock_development_key') {
        console.warn(`Weather forecast API unavailable - OpenWeather API key not configured for ${latitude}, ${longitude}`);
        throw new Error('Weather forecast service unavailable. Please configure OpenWeather API key.');
      }

      const url = `${this.ONECALL_URL}?lat=${latitude}&lon=${longitude}&appid=${this.API_KEY}&units=metric&exclude=minutely,hourly`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Weather forecast API error ${response.status}: ${response.statusText}`);
        throw new Error(`Weather forecast API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const forecasts: WeatherForecast[] = (data.daily || [])
        .slice(0, days)
        .map((day: any, index: number) => ({
          id: `forecast_${latitude}_${longitude}_${index}`,
          location: {
            latitude,
            longitude,
          },
          date: new Date(day.dt * 1000).toISOString().split('T')[0],
          temperature: {
            min: day.temp.min,
            max: day.temp.max,
            morning: day.temp.morn,
            day: day.temp.day,
            evening: day.temp.eve,
            night: day.temp.night,
          },
          humidity: day.humidity,
          pressure: day.pressure,
          windSpeed: day.wind_speed,
          windDirection: day.wind_deg,
          cloudCover: day.clouds,
          precipitationProbability: (day.pop || 0) * 100,
          precipitationAmount: day.rain?.['1h'] || day.snow?.['1h'],
          conditions: day.weather || [],
          uvIndex: day.uvi,
        }));

      return forecasts;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return [];
    }
  }

  async getWeatherAlerts(latitude: number, longitude: number): Promise<WeatherAlert[]> {
    try {
      if (!this.API_KEY) {
        return [];
      }

      const url = `${this.ONECALL_URL}?lat=${latitude}&lon=${longitude}&appid=${this.API_KEY}&exclude=current,minutely,hourly,daily`;
      const response = await fetch(url);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      const alerts: WeatherAlert[] = (data.alerts || []).map((alert: any, index: number) => ({
        id: `alert_${latitude}_${longitude}_${index}`,
        alertType: this.categorizeAlert(alert.event),
        severity: this.mapSeverity(alert.tags),
        title: alert.event,
        description: alert.description,
        startTime: new Date(alert.start * 1000).toISOString(),
        endTime: new Date(alert.end * 1000).toISOString(),
        affectedAreas: [alert.sender_name],
        recommendations: this.generateRecommendations(alert.event),
        isActive: true,
      }));

      return alerts;
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }

  async getAgricultureData(latitude: number, longitude: number): Promise<AgricultureWeatherData | null> {
    try {
      if (!this.API_KEY) {
        return null;
      }

      // Note: This requires a paid OpenWeatherMap plan
      const url = `${this.AGRO_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${this.API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        // Fallback to basic calculations from current weather
        return this.calculateBasicAgricultureData(latitude, longitude);
      }

      const data = await response.json();

      return {
        location: { latitude, longitude },
        soilTemperature: data.soil_temp,
        soilMoisture: data.soil_moisture,
        evapotranspiration: data.et0,
        growingDegreeDays: data.gdd,
        chillHours: data.chill_hours,
        frostRisk: this.calculateFrostRisk(data),
        heatStress: this.calculateHeatStress(data),
      };
    } catch (error) {
      console.error('Error fetching agriculture data:', error);
      return this.calculateBasicAgricultureData(latitude, longitude);
    }
  }

  private async calculateBasicAgricultureData(
    latitude: number,
    longitude: number
  ): Promise<AgricultureWeatherData | null> {
    try {
      const currentWeather = await this.getCurrentWeather(latitude, longitude);
      if (!currentWeather) return null;

      const forecast = await this.getWeatherForecast(latitude, longitude, 3);

      // Basic frost risk calculation
      const minTempNext3Days = Math.min(
        ...forecast.map(f => f.temperature.min),
        currentWeather.temperature
      );
      const frostRisk: AgricultureWeatherData['frostRisk'] = 
        minTempNext3Days <= 0 ? 'high' :
        minTempNext3Days <= 3 ? 'moderate' :
        minTempNext3Days <= 7 ? 'low' : 'none';

      // Basic heat stress calculation
      const maxTempNext3Days = Math.max(
        ...forecast.map(f => f.temperature.max),
        currentWeather.temperature
      );
      const heatStress: AgricultureWeatherData['heatStress'] =
        maxTempNext3Days >= 40 ? 'severe' :
        maxTempNext3Days >= 35 ? 'high' :
        maxTempNext3Days >= 30 ? 'moderate' :
        maxTempNext3Days >= 25 ? 'low' : 'none';

      // Basic growing degree days (base 10°C)
      const avgTemp = (currentWeather.temperature + currentWeather.feelsLike) / 2;
      const growingDegreeDays = Math.max(0, avgTemp - 10);

      return {
        location: { latitude, longitude },
        growingDegreeDays,
        frostRisk,
        heatStress,
      };
    } catch (error) {
      console.error('Error calculating basic agriculture data:', error);
      return null;
    }
  }

  private categorizeAlert(event: string): WeatherAlert['alertType'] {
    const eventLower = event.toLowerCase();
    
    if (eventLower.includes('frost') || eventLower.includes('freeze')) return 'frost';
    if (eventLower.includes('storm') || eventLower.includes('thunder')) return 'storm';
    if (eventLower.includes('drought') || eventLower.includes('dry')) return 'drought';
    if (eventLower.includes('heat') || eventLower.includes('hot')) return 'heat';
    if (eventLower.includes('wind') || eventLower.includes('gust')) return 'wind';
    if (eventLower.includes('hail')) return 'hail';
    if (eventLower.includes('flood') || eventLower.includes('rain')) return 'flood';
    
    return 'storm'; // default
  }

  private mapSeverity(tags: string[]): WeatherAlert['severity'] {
    if (!tags || tags.length === 0) return 'moderate';
    
    const severityTag = tags.find(tag => 
      ['minor', 'moderate', 'severe', 'extreme'].includes(tag.toLowerCase())
    );
    
    return (severityTag?.toLowerCase() as WeatherAlert['severity']) || 'moderate';
  }

  private generateRecommendations(event: string): string[] {
    const eventLower = event.toLowerCase();
    
    if (eventLower.includes('frost') || eventLower.includes('freeze')) {
      return [
        'Protect sensitive crops with covers or greenhouse',
        'Harvest mature crops before frost damage',
        'Check irrigation systems for frozen pipes',
        'Monitor soil temperature in the morning',
      ];
    }
    
    if (eventLower.includes('storm') || eventLower.includes('thunder')) {
      return [
        'Secure loose equipment and structures',
        'Avoid field work during the storm',
        'Check for hail damage after the storm',
        'Ensure proper drainage to prevent flooding',
      ];
    }
    
    if (eventLower.includes('drought') || eventLower.includes('dry')) {
      return [
        'Implement water conservation measures',
        'Prioritize irrigation for high-value crops',
        'Consider drought-resistant crop varieties',
        'Monitor soil moisture levels closely',
      ];
    }
    
    if (eventLower.includes('heat') || eventLower.includes('hot')) {
      return [
        'Provide shade for sensitive crops',
        'Increase irrigation frequency',
        'Avoid heavy field work during peak heat',
        'Monitor livestock for heat stress',
      ];
    }
    
    return [
      'Monitor weather conditions closely',
      'Follow local agricultural extension advice',
      'Check crops and equipment regularly',
    ];
  }

  private calculateFrostRisk(data: any): AgricultureWeatherData['frostRisk'] {
    // Implementation would depend on specific agriculture API data structure
    return 'none';
  }

  private calculateHeatStress(data: any): AgricultureWeatherData['heatStress'] {
    // Implementation would depend on specific agriculture API data structure
    return 'none';
  }

  // Redis-based caching to reduce API calls
  private readonly CACHE_DURATION = 10 * 60; // 10 minutes in seconds

  private getCacheKey(type: string, latitude: number, longitude: number): string {
    return `weather:${type}:${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
  }

  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const { RedisManager } = await import('../redis');
      return await RedisManager.get(key);
    } catch (error) {
      console.warn('Redis cache unavailable, falling back to fresh data');
      return null;
    }
  }

  private async setCachedData(key: string, data: any): Promise<void> {
    try {
      const { RedisManager } = await import('../redis');
      await RedisManager.set(key, data, { ex: this.CACHE_DURATION });
    } catch (error) {
      console.warn('Redis cache unavailable, skipping cache storage');
    }
  }

  async getCurrentWeatherCached(latitude: number, longitude: number): Promise<CurrentWeather | null> {
    const cacheKey = this.getCacheKey('current', latitude, longitude);
    const cached = await this.getCachedData<CurrentWeather>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const weather = await this.getCurrentWeather(latitude, longitude);
    if (weather) {
      await this.setCachedData(cacheKey, weather);
    }
    
    return weather;
  }

  async getForecastCached(latitude: number, longitude: number, days: number = 7): Promise<WeatherForecast[]> {
    const cacheKey = this.getCacheKey(`forecast_${days}`, latitude, longitude);
    const cached = await this.getCachedData<WeatherForecast[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const forecast = await this.getWeatherForecast(latitude, longitude, days);
    await this.setCachedData(cacheKey, forecast);
    
    return forecast;
  }

}

export const weatherService = new WeatherService();