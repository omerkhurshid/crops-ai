/**
 * Weather Data Aggregation Service
 * 
 * Provides advanced weather data processing, historical analysis,
 * and multi-source weather data aggregation for agricultural insights.
 */
import { weatherService, WeatherForecast, CurrentWeather } from './service';
export interface WeatherDataPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  precipitation: number;
  cloudCover: number;
  uvIndex?: number;
}
export interface AggregatedWeatherData {
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  period: {
    start: string;
    end: string;
    intervalHours: number;
  };
  statistics: {
    temperature: WeatherStatistics;
    humidity: WeatherStatistics;
    precipitation: WeatherStatistics;
    windSpeed: WeatherStatistics;
    pressure: WeatherStatistics;
  };
  trends: {
    temperatureTrend: 'rising' | 'falling' | 'stable';
    precipitationTrend: 'increasing' | 'decreasing' | 'stable';
    pressureTrend: 'rising' | 'falling' | 'stable';
  };
  agricultureMetrics: {
    growingDegreeDays: number;
    chillHours: number;
    heatStressHours: number;
    wetDays: number;
    dryDays: number;
    irrigationNeeded: boolean;
  };
}
export interface WeatherStatistics {
  min: number;
  max: number;
  average: number;
  median: number;
  standardDeviation: number;
}
export interface HourlyWeatherData {
  hourlyData: WeatherDataPoint[];
  summary: {
    totalHours: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    gapsCount: number;
    lastUpdated: string;
  };
}
class WeatherAggregatorService {
  private readonly CACHE_PREFIX = 'weather_aggregated_';
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  /**
   * Get aggregated weather data for a specific time period
   */
  async getAggregatedWeatherData(
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date,
    intervalHours: number = 1
  ): Promise<AggregatedWeatherData | null> {
    try {
      // For now, use forecast and current data to simulate historical aggregation
      // In production, this would query historical weather database
      const [currentWeather, forecast] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getWeatherForecast(latitude, longitude, 7)
      ]);
      if (!currentWeather || !forecast.length) {
        return null;
      }
      // Convert forecast to data points
      const dataPoints = this.convertForecastToDataPoints(currentWeather, forecast);
      // Calculate statistics
      const statistics = this.calculateStatistics(dataPoints);
      // Analyze trends
      const trends = this.analyzeTrends(dataPoints);
      // Calculate agriculture metrics
      const agricultureMetrics = this.calculateAgricultureMetrics(dataPoints);
      return {
        location: {
          latitude,
          longitude,
          name: currentWeather.location.name
        },
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          intervalHours
        },
        statistics,
        trends,
        agricultureMetrics
      };
    } catch (error) {
      console.error('Error aggregating weather data:', error);
      return null;
    }
  }
  /**
   * Get hourly weather data for detailed analysis
   */
  async getHourlyWeatherData(
    latitude: number,
    longitude: number,
    hours: number = 24
  ): Promise<HourlyWeatherData | null> {
    try {
      // Simulate hourly data generation from forecast
      const forecast = await weatherService.getWeatherForecast(latitude, longitude, Math.ceil(hours / 24));
      if (!forecast.length) {
        return null;
      }
      const hourlyData = this.generateHourlyDataFromForecast(forecast, hours);
      return {
        hourlyData,
        summary: {
          totalHours: hourlyData.length,
          dataQuality: this.assessDataQuality(hourlyData),
          gapsCount: this.countDataGaps(hourlyData),
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error fetching hourly weather data:', error);
      return null;
    }
  }
  /**
   * Calculate weather statistics for field-level analysis
   */
  async getFieldWeatherAnalysis(
    fieldBoundary: { latitude: number; longitude: number }[],
    days: number = 7
  ): Promise<{
    centerPoint: AggregatedWeatherData | null;
    variations: {
      temperatureVariation: number;
      precipitationVariation: number;
      microclimateRisk: 'low' | 'moderate' | 'high';
    };
  }> {
    try {
      // Calculate field center point
      const centerLat = fieldBoundary.reduce((sum, point) => sum + point.latitude, 0) / fieldBoundary.length;
      const centerLon = fieldBoundary.reduce((sum, point) => sum + point.longitude, 0) / fieldBoundary.length;
      // For now, analyze center point (in production would sample multiple points across field)
      const centerAnalysis = await this.getAggregatedWeatherData(
        centerLat,
        centerLon,
        new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        new Date(),
        1
      );
      // Estimate microclimate variations based on field size
      const fieldSize = this.calculateFieldArea(fieldBoundary);
      const variations = this.estimateMicroclimatVariations(fieldSize);
      return {
        centerPoint: centerAnalysis,
        variations
      };
    } catch (error) {
      console.error('Error analyzing field weather:', error);
      return {
        centerPoint: null,
        variations: {
          temperatureVariation: 0,
          precipitationVariation: 0,
          microclimateRisk: 'low'
        }
      };
    }
  }
  /**
   * Get weather-based irrigation recommendations
   */
  async getIrrigationRecommendations(
    latitude: number,
    longitude: number,
    cropType: string = 'general',
    soilType: string = 'medium'
  ): Promise<{
    recommendation: 'immediate' | 'soon' | 'monitor' | 'delay';
    reasonCode: string;
    description: string;
    nextCheckHours: number;
    irrigationAmount?: number; // mm
  }> {
    try {
      const [current, forecast, agriData] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getWeatherForecast(latitude, longitude, 3),
        weatherService.getAgricultureData(latitude, longitude)
      ]);
      if (!current) {
        return {
          recommendation: 'monitor',
          reasonCode: 'NO_DATA',
          description: 'Weather data unavailable - check soil moisture manually',
          nextCheckHours: 6
        };
      }
      // Calculate ET0 and water stress indicators
      const et0 = agriData?.evapotranspiration || this.estimateET0(current);
      const precipitationForecast = forecast.reduce((sum, day) => sum + day.precipitationProbability, 0) / forecast.length;
      // Determine irrigation need
      const waterStress = this.calculateWaterStress(current, et0, precipitationForecast, soilType);
      return this.generateIrrigationRecommendation(waterStress, precipitationForecast, cropType);
    } catch (error) {
      console.error('Error generating irrigation recommendations:', error);
      return {
        recommendation: 'monitor',
        reasonCode: 'ERROR',
        description: 'Unable to generate recommendation - monitor soil conditions',
        nextCheckHours: 12
      };
    }
  }
  private convertForecastToDataPoints(current: CurrentWeather, forecast: WeatherForecast[]): WeatherDataPoint[] {
    const dataPoints: WeatherDataPoint[] = [];
    // Add current weather as first data point
    dataPoints.push({
      timestamp: current.timestamp,
      temperature: current.temperature,
      humidity: current.humidity,
      pressure: current.pressure,
      windSpeed: current.windSpeed,
      precipitation: 0, // Current weather doesn't include precipitation amount
      cloudCover: current.cloudCover,
      uvIndex: current.uvIndex
    });
    // Convert forecast to data points
    forecast.forEach(day => {
      dataPoints.push({
        timestamp: day.date,
        temperature: (day.temperature.min + day.temperature.max) / 2,
        humidity: day.humidity,
        pressure: 1013, // Default pressure for forecast data
        windSpeed: 5, // Estimated wind speed
        precipitation: day.precipitationProbability,
        cloudCover: 50, // Estimated based on conditions
        uvIndex: 6 // Estimated UV index
      });
    });
    return dataPoints;
  }
  private calculateStatistics(dataPoints: WeatherDataPoint[]): any {
    const calculateStats = (values: number[]): WeatherStatistics => {
      const sorted = values.sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        average: mean,
        median: sorted[Math.floor(sorted.length / 2)],
        standardDeviation: Math.sqrt(variance)
      };
    };
    return {
      temperature: calculateStats(dataPoints.map(p => p.temperature)),
      humidity: calculateStats(dataPoints.map(p => p.humidity)),
      precipitation: calculateStats(dataPoints.map(p => p.precipitation)),
      windSpeed: calculateStats(dataPoints.map(p => p.windSpeed)),
      pressure: calculateStats(dataPoints.map(p => p.pressure))
    };
  }
  private analyzeTrends(dataPoints: WeatherDataPoint[]): any {
    const getTrend = (values: number[]): 'rising' | 'falling' | 'stable' => {
      if (values.length < 2) return 'stable';
      const first = values.slice(0, Math.floor(values.length / 2));
      const second = values.slice(Math.floor(values.length / 2));
      const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
      const secondAvg = second.reduce((a, b) => a + b, 0) / second.length;
      const change = (secondAvg - firstAvg) / firstAvg;
      if (change > 0.05) return 'rising';
      if (change < -0.05) return 'falling';
      return 'stable';
    };
    return {
      temperatureTrend: getTrend(dataPoints.map(p => p.temperature)),
      precipitationTrend: getTrend(dataPoints.map(p => p.precipitation)),
      pressureTrend: getTrend(dataPoints.map(p => p.pressure))
    };
  }
  private calculateAgricultureMetrics(dataPoints: WeatherDataPoint[]): any {
    const temperatures = dataPoints.map(p => p.temperature);
    const precipitations = dataPoints.map(p => p.precipitation);
    // Growing Degree Days (base 10°C)
    const growingDegreeDays = temperatures
      .filter(t => t > 10)
      .reduce((sum, t) => sum + (t - 10), 0);
    // Chill Hours (below 7°C)
    const chillHours = temperatures.filter(t => t < 7).length;
    // Heat Stress Hours (above 32°C)
    const heatStressHours = temperatures.filter(t => t > 32).length;
    // Wet/Dry Days
    const wetDays = precipitations.filter(p => p > 20).length; // > 20% chance
    const dryDays = precipitations.filter(p => p < 10).length; // < 10% chance
    // Irrigation needed (simple heuristic)
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const avgPrecip = precipitations.reduce((a, b) => a + b, 0) / precipitations.length;
    const irrigationNeeded = avgTemp > 25 && avgPrecip < 30;
    return {
      growingDegreeDays,
      chillHours,
      heatStressHours,
      wetDays,
      dryDays,
      irrigationNeeded
    };
  }
  private generateHourlyDataFromForecast(forecast: WeatherForecast[], hours: number): WeatherDataPoint[] {
    const hourlyData: WeatherDataPoint[] = [];
    const now = new Date();
    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
      const dayIndex = Math.floor(i / 24);
      const day = forecast[dayIndex] || forecast[forecast.length - 1];
      // Interpolate temperature based on time of day
      const hourOfDay = timestamp.getHours();
      const tempVariation = Math.sin((hourOfDay - 6) * Math.PI / 12) * 0.3; // Peak at 2 PM
      const baseTemp = (day.temperature.min + day.temperature.max) / 2;
      const temperature = baseTemp + (day.temperature.max - day.temperature.min) * tempVariation;
      hourlyData.push({
        timestamp: timestamp.toISOString(),
        temperature,
        humidity: day.humidity + Math.random() * 10 - 5, // Add variation
        pressure: 1013 + Math.random() * 20 - 10,
        windSpeed: 3 + Math.random() * 10,
        precipitation: day.precipitationProbability + Math.random() * 10 - 5,
        cloudCover: 30 + Math.random() * 40,
        uvIndex: Math.max(0, 8 * Math.sin((hourOfDay - 6) * Math.PI / 12))
      });
    }
    return hourlyData;
  }
  private assessDataQuality(hourlyData: WeatherDataPoint[]): 'excellent' | 'good' | 'fair' | 'poor' {
    const completeness = hourlyData.length / 24; // Assuming 24 hours requested
    const gaps = this.countDataGaps(hourlyData);
    if (completeness >= 0.95 && gaps === 0) return 'excellent';
    if (completeness >= 0.85 && gaps < 2) return 'good';
    if (completeness >= 0.70 && gaps < 5) return 'fair';
    return 'poor';
  }
  private countDataGaps(hourlyData: WeatherDataPoint[]): number {
    if (hourlyData.length < 2) return 0;
    let gaps = 0;
    for (let i = 1; i < hourlyData.length; i++) {
      const prev = new Date(hourlyData[i - 1].timestamp);
      const curr = new Date(hourlyData[i].timestamp);
      const expectedDiff = 60 * 60 * 1000; // 1 hour
      const actualDiff = curr.getTime() - prev.getTime();
      if (actualDiff > expectedDiff * 1.5) {
        gaps++;
      }
    }
    return gaps;
  }
  private calculateFieldArea(boundary: { latitude: number; longitude: number }[]): number {
    // Simplified area calculation in square meters
    if (boundary.length < 3) return 0;
    let area = 0;
    const earthRadius = 6371000; // meters
    for (let i = 0; i < boundary.length; i++) {
      const j = (i + 1) % boundary.length;
      const lat1 = boundary[i].latitude * Math.PI / 180;
      const lat2 = boundary[j].latitude * Math.PI / 180;
      const lon1 = boundary[i].longitude * Math.PI / 180;
      const lon2 = boundary[j].longitude * Math.PI / 180;
      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    return Math.abs(area * earthRadius * earthRadius / 2);
  }
  private estimateMicroclimatVariations(fieldSizeM2: number): any {
    // Larger fields have more microclimate variation
    const sizeFactorKm2 = fieldSizeM2 / 1000000;
    let temperatureVariation = 0.5; // Base variation in °C
    let precipitationVariation = 5; // Base variation in %
    let microclimateRisk: 'low' | 'moderate' | 'high' = 'low';
    if (sizeFactorKm2 > 1) {
      temperatureVariation = 1.5;
      precipitationVariation = 15;
      microclimateRisk = 'moderate';
    }
    if (sizeFactorKm2 > 5) {
      temperatureVariation = 3.0;
      precipitationVariation = 25;
      microclimateRisk = 'high';
    }
    return {
      temperatureVariation,
      precipitationVariation,
      microclimateRisk
    };
  }
  private estimateET0(weather: CurrentWeather): number {
    // Simplified Penman-Monteith ET0 calculation
    const temp = weather.temperature;
    const humidity = weather.humidity;
    const windSpeed = weather.windSpeed;
    const pressure = weather.pressure;
    // Simplified calculation (mm/day)
    const delta = 4098 * (0.6108 * Math.exp(17.27 * temp / (temp + 237.3))) / Math.pow(temp + 237.3, 2);
    const gamma = 0.665 * pressure / 1000;
    const u2 = windSpeed * 4.87 / Math.log(67.8 * 10 - 5.42);
    const et0 = (0.408 * delta * (temp) + gamma * 900 / (temp + 273) * u2 * (0.01 * (100 - humidity))) / (delta + gamma * (1 + 0.34 * u2));
    return Math.max(0, et0);
  }
  private calculateWaterStress(weather: CurrentWeather, et0: number, precipitationForecast: number, soilType: string): number {
    // Water stress index (0-1, where 1 is high stress)
    let stress = 0;
    // Temperature stress
    if (weather.temperature > 30) stress += 0.3;
    if (weather.temperature > 35) stress += 0.2;
    // Humidity stress
    if (weather.humidity < 40) stress += 0.2;
    if (weather.humidity < 30) stress += 0.1;
    // ET0 stress
    if (et0 > 6) stress += 0.2;
    if (et0 > 8) stress += 0.1;
    // Precipitation forecast
    if (precipitationForecast < 20) stress += 0.2;
    if (precipitationForecast < 10) stress += 0.1;
    // Soil type adjustment
    const soilFactors = {
      sandy: 1.3,   // Drains quickly
      medium: 1.0,  // Balanced
      clay: 0.8     // Retains water
    };
    stress *= soilFactors[soilType as keyof typeof soilFactors] || 1.0;
    return Math.min(1, stress);
  }
  private generateIrrigationRecommendation(waterStress: number, precipitationForecast: number, cropType: string): any {
    if (waterStress > 0.7) {
      return {
        recommendation: 'immediate' as const,
        reasonCode: 'HIGH_WATER_STRESS',
        description: 'High water stress detected. Irrigate immediately to prevent crop damage.',
        nextCheckHours: 4,
        irrigationAmount: 15 + waterStress * 10
      };
    }
    if (waterStress > 0.5 && precipitationForecast < 20) {
      return {
        recommendation: 'soon' as const,
        reasonCode: 'MODERATE_STRESS_LOW_RAIN',
        description: 'Moderate water stress with low rainfall forecast. Plan irrigation within 12-24 hours.',
        nextCheckHours: 8,
        irrigationAmount: 10 + waterStress * 8
      };
    }
    if (precipitationForecast > 60) {
      return {
        recommendation: 'delay' as const,
        reasonCode: 'HIGH_RAIN_FORECAST',
        description: 'High rainfall forecast. Delay irrigation and monitor soil moisture.',
        nextCheckHours: 24
      };
    }
    return {
      recommendation: 'monitor' as const,
      reasonCode: 'NORMAL_CONDITIONS',
      description: 'Current conditions are acceptable. Continue monitoring soil moisture.',
      nextCheckHours: 12
    };
  }
}
export const weatherAggregator = new WeatherAggregatorService();