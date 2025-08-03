import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationService, GeoPosition } from './location';
import { notificationService } from './notifications';

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
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  conditions: WeatherCondition[];
  timestamp: string;
  uvIndex?: number;
}

export interface WeatherForecast {
  id: string;
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  precipitationProbability: number;
  conditions: WeatherCondition[];
}

export interface WeatherAlert {
  id: string;
  alertType: 'frost' | 'storm' | 'drought' | 'heat' | 'wind' | 'hail' | 'flood';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  recommendations: string[];
  isActive: boolean;
}

class WeatherService {
  private readonly API_BASE_URL = 'http://localhost:3000'; // Will be configurable
  private readonly CACHE_KEY_PREFIX = 'weather_cache_';
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  async getCurrentWeather(location?: GeoPosition): Promise<CurrentWeather | null> {
    try {
      const position = location || await locationService.getCurrentPosition();
      if (!position) {
        throw new Error('Location not available');
      }

      // Check cache first
      const cachedWeather = await this.getCachedWeather('current', position);
      if (cachedWeather) {
        return cachedWeather;
      }

      const response = await fetch(
        `${this.API_BASE_URL}/api/weather/current?latitude=${position.latitude}&longitude=${position.longitude}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      const weather = data.data.weather;

      // Cache the result
      await this.cacheWeather('current', position, weather);

      return weather;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  async getWeatherForecast(location?: GeoPosition, days: number = 5): Promise<WeatherForecast[]> {
    try {
      const position = location || await locationService.getCurrentPosition();
      if (!position) {
        throw new Error('Location not available');
      }

      // Check cache first
      const cacheKey = `forecast_${days}`;
      const cachedForecast = await this.getCachedWeather(cacheKey, position);
      if (cachedForecast) {
        return cachedForecast;
      }

      const response = await fetch(
        `${this.API_BASE_URL}/api/weather/forecast?latitude=${position.latitude}&longitude=${position.longitude}&days=${days}`
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.statusText}`);
      }

      const data = await response.json();
      const forecast = data.data.forecast;

      // Cache the result
      await this.cacheWeather(cacheKey, position, forecast);

      return forecast;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return [];
    }
  }

  async getWeatherAlerts(location?: GeoPosition): Promise<WeatherAlert[]> {
    try {
      const position = location || await locationService.getCurrentPosition();
      if (!position) {
        return [];
      }

      const response = await fetch(
        `${this.API_BASE_URL}/api/weather/alerts?latitude=${position.latitude}&longitude=${position.longitude}`
      );

      if (!response.ok) {
        console.log('Weather alerts not available');
        return [];
      }

      const data = await response.json();
      const alerts = data.data.alerts || [];

      // Send notifications for new severe alerts
      await this.processAlerts(alerts);

      return alerts;
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }

  async getAgricultureData(location?: GeoPosition): Promise<any> {
    try {
      const position = location || await locationService.getCurrentPosition();
      if (!position) {
        return null;
      }

      const response = await fetch(
        `${this.API_BASE_URL}/api/weather/agriculture?latitude=${position.latitude}&longitude=${position.longitude}`
      );

      if (!response.ok) {
        console.log('Agriculture weather data not available');
        return null;
      }

      const data = await response.json();
      return data.data.data;
    } catch (error) {
      console.error('Error fetching agriculture data:', error);
      return null;
    }
  }

  // Weather monitoring for automatic alerts
  async startWeatherMonitoring(): Promise<void> {
    try {
      // Check weather alerts every 30 minutes
      const checkWeather = async () => {
        const alerts = await this.getWeatherAlerts();
        const currentWeather = await this.getCurrentWeather();
        
        // Check for critical conditions
        if (currentWeather) {
          await this.checkCriticalConditions(currentWeather);
        }
      };

      // Initial check
      await checkWeather();

      // Set up periodic checks
      setInterval(checkWeather, 30 * 60 * 1000); // 30 minutes
    } catch (error) {
      console.error('Error starting weather monitoring:', error);
    }
  }

  private async checkCriticalConditions(weather: CurrentWeather): Promise<void> {
    try {
      // Frost warning (temperature below 3°C)
      if (weather.temperature <= 3) {
        await notificationService.sendWeatherAlert(
          'frost',
          `Temperature is ${Math.round(weather.temperature)}°C. Protect sensitive crops!`,
          weather.location.name
        );
      }

      // Heat warning (temperature above 35°C)
      if (weather.temperature >= 35) {
        await notificationService.sendWeatherAlert(
          'heat',
          `High temperature of ${Math.round(weather.temperature)}°C. Increase irrigation and provide shade.`,
          weather.location.name
        );
      }

      // High wind warning (above 15 m/s or 54 km/h)
      if (weather.windSpeed > 15) {
        await notificationService.sendWeatherAlert(
          'storm',
          `Strong winds at ${Math.round(weather.windSpeed * 3.6)} km/h. Secure equipment and structures.`,
          weather.location.name
        );
      }

      // Low humidity warning (below 30% with high temperature)
      if (weather.humidity < 30 && weather.temperature > 25) {
        await notificationService.sendWeatherAlert(
          'drought',
          `Low humidity (${weather.humidity}%) and high temperature. Increase irrigation frequency.`,
          weather.location.name
        );
      }
    } catch (error) {
      console.error('Error checking critical conditions:', error);
    }
  }

  private async processAlerts(alerts: WeatherAlert[]): Promise<void> {
    try {
      const lastAlertCheck = await AsyncStorage.getItem('last_alert_check');
      const lastCheckTime = lastAlertCheck ? parseInt(lastAlertCheck) : 0;
      const currentTime = Date.now();

      // Only send notifications for new alerts (within last hour)
      const newAlerts = alerts.filter(alert => {
        const alertTime = new Date(alert.startTime).getTime();
        return alertTime > lastCheckTime && alertTime > (currentTime - 60 * 60 * 1000);
      });

      for (const alert of newAlerts) {
        if (alert.severity === 'severe' || alert.severity === 'extreme') {
          await notificationService.sendWeatherAlert(
            alert.alertType,
            alert.description,
            alert.title
          );
        }
      }

      // Update last check time
      await AsyncStorage.setItem('last_alert_check', currentTime.toString());
    } catch (error) {
      console.error('Error processing alerts:', error);
    }
  }

  // Cache management
  private async getCachedWeather(type: string, location: GeoPosition): Promise<any> {
    try {
      const cacheKey = this.getCacheKey(type, location);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_DURATION) {
          return data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached weather:', error);
      return null;
    }
  }

  private async cacheWeather(type: string, location: GeoPosition, data: any): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(type, location);
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching weather:', error);
    }
  }

  private getCacheKey(type: string, location: GeoPosition): string {
    const lat = location.latitude.toFixed(2);
    const lon = location.longitude.toFixed(2);
    return `${this.CACHE_KEY_PREFIX}${type}_${lat}_${lon}`;
  }

  // Weather-based crop recommendations
  async getCropRecommendations(location?: GeoPosition): Promise<string[]> {
    try {
      const weather = await this.getCurrentWeather(location);
      const forecast = await this.getWeatherForecast(location, 7);
      
      if (!weather || forecast.length === 0) {
        return ['Weather data unavailable for recommendations'];
      }

      const recommendations: string[] = [];

      // Temperature-based recommendations
      const avgTemp = forecast.reduce((sum, day) => sum + (day.temperature.min + day.temperature.max) / 2, 0) / forecast.length;
      
      if (avgTemp < 5) {
        recommendations.push('Consider cold-hardy crops like winter wheat, spinach, or kale');
        recommendations.push('Use row covers or greenhouses for protection');
      } else if (avgTemp > 30) {
        recommendations.push('Focus on heat-tolerant crops like tomatoes, peppers, or beans');
        recommendations.push('Increase irrigation frequency and provide shade');
      }

      // Precipitation-based recommendations
      const totalPrecipitation = forecast.reduce((sum, day) => sum + day.precipitationProbability, 0) / forecast.length;
      
      if (totalPrecipitation < 20) {
        recommendations.push('Low rainfall expected - install drip irrigation systems');
        recommendations.push('Consider drought-resistant crop varieties');
      } else if (totalPrecipitation > 70) {
        recommendations.push('High rainfall expected - ensure proper drainage');
        recommendations.push('Monitor for fungal diseases in humid conditions');
      }

      // Humidity-based recommendations
      if (weather.humidity > 80) {
        recommendations.push('High humidity - watch for pest and disease pressure');
        recommendations.push('Improve air circulation around plants');
      } else if (weather.humidity < 40) {
        recommendations.push('Low humidity - increase watering and consider mulching');
      }

      return recommendations.length > 0 ? recommendations : ['Current weather conditions are suitable for most crops'];
    } catch (error) {
      console.error('Error generating crop recommendations:', error);
      return ['Unable to generate recommendations at this time'];
    }
  }

  // Weather data export for offline use
  async exportWeatherData(): Promise<string> {
    try {
      const location = await locationService.getCurrentPosition();
      if (!location) {
        throw new Error('Location not available');
      }

      const [current, forecast, alerts] = await Promise.all([
        this.getCurrentWeather(location),
        this.getWeatherForecast(location, 7),
        this.getWeatherAlerts(location)
      ]);

      const weatherData = {
        location,
        current,
        forecast,
        alerts,
        exportedAt: new Date().toISOString(),
      };

      return JSON.stringify(weatherData, null, 2);
    } catch (error) {
      console.error('Error exporting weather data:', error);
      throw error;
    }
  }

  // Clean up old cached data
  async cleanupCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const weatherKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      for (const key of weatherKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp > this.CACHE_DURATION * 2) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up weather cache:', error);
    }
  }
}

export const weatherService = new WeatherService();