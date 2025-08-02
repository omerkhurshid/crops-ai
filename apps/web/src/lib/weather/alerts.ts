/**
 * Weather Alert System for Extreme Events
 * 
 * Monitors weather conditions and generates automated alerts for
 * critical agricultural events that require immediate farmer attention.
 */

import { weatherService, CurrentWeather, WeatherForecast } from './service';
import { weatherAggregator } from './aggregator';

export interface WeatherAlert {
  id: string;
  alertType: 'frost' | 'storm' | 'drought' | 'heat' | 'wind' | 'hail' | 'flood' | 'fire_risk';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  recommendations: string[];
  affectedAreas: string[];
  confidence: number; // 0-1
  isActive: boolean;
  priority: number; // 1-10
  farmImpact: {
    cropsAtRisk: string[];
    estimatedDamage: 'low' | 'medium' | 'high' | 'severe';
    urgencyLevel: 'watch' | 'warning' | 'critical';
  };
  actionRequired: {
    immediate: string[];
    shortTerm: string[];
    monitoring: string[];
  };
}

export interface AlertThresholds {
  frost: {
    temperature: number; // °C
    humidity: number; // %
    windSpeed: number; // m/s
  };
  heat: {
    temperature: number; // °C
    duration: number; // hours
    heatIndex: number;
  };
  wind: {
    speed: number; // m/s
    gustSpeed: number; // m/s
    duration: number; // hours
  };
  precipitation: {
    intensity: number; // mm/hour
    total: number; // mm/day
    duration: number; // hours
  };
  drought: {
    precipitationDays: number; // consecutive days
    soilMoisture: number; // %
    temperature: number; // °C
  };
}

class WeatherAlertService {
  private readonly DEFAULT_THRESHOLDS: AlertThresholds = {
    frost: {
      temperature: 2, // °C
      humidity: 80, // %
      windSpeed: 3 // m/s (light wind increases frost risk)
    },
    heat: {
      temperature: 35, // °C
      duration: 4, // hours
      heatIndex: 40 // °C
    },
    wind: {
      speed: 15, // m/s (54 km/h)
      gustSpeed: 20, // m/s (72 km/h)
      duration: 2 // hours
    },
    precipitation: {
      intensity: 10, // mm/hour (heavy rain)
      total: 50, // mm/day (very heavy rain)
      duration: 6 // hours
    },
    drought: {
      precipitationDays: 14, // consecutive days
      soilMoisture: 20, // %
      temperature: 30 // °C
    }
  };

  /**
   * Monitor weather conditions and generate alerts
   */
  async monitorWeatherConditions(
    latitude: number,
    longitude: number,
    customThresholds?: Partial<AlertThresholds>
  ): Promise<WeatherAlert[]> {
    try {
      const thresholds = { ...this.DEFAULT_THRESHOLDS, ...customThresholds };
      const alerts: WeatherAlert[] = [];

      // Get current and forecast data
      const [currentWeather, forecast, aggregatedData] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getWeatherForecast(latitude, longitude, 7),
        weatherAggregator.getAggregatedWeatherData(
          latitude,
          longitude,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          new Date(),
          1
        )
      ]);

      if (!currentWeather || !forecast.length) {
        return [];
      }

      // Check for different types of alerts
      const frostAlert = this.checkFrostConditions(currentWeather, forecast, thresholds);
      if (frostAlert) alerts.push(frostAlert);

      const heatAlert = this.checkHeatConditions(currentWeather, forecast, thresholds);
      if (heatAlert) alerts.push(heatAlert);

      const windAlert = this.checkWindConditions(currentWeather, forecast, thresholds);
      if (windAlert) alerts.push(windAlert);

      const precipitationAlert = this.checkPrecipitationConditions(currentWeather, forecast, thresholds);
      if (precipitationAlert) alerts.push(precipitationAlert);

      if (aggregatedData) {
        const droughtAlert = this.checkDroughtConditions(aggregatedData, thresholds);
        if (droughtAlert) alerts.push(droughtAlert);

        const fireRiskAlert = this.checkFireRiskConditions(currentWeather, aggregatedData);
        if (fireRiskAlert) alerts.push(fireRiskAlert);
      }

      // Sort alerts by priority
      return alerts.sort((a, b) => b.priority - a.priority);

    } catch (error) {
      console.error('Error monitoring weather conditions:', error);
      return [];
    }
  }

  /**
   * Get active alerts for multiple locations
   */
  async getMultiLocationAlerts(
    locations: { latitude: number; longitude: number; name?: string }[]
  ): Promise<{
    location: { latitude: number; longitude: number; name?: string };
    alerts: WeatherAlert[];
  }[]> {
    try {
      const results = await Promise.all(
        locations.map(async (location) => {
          const alerts = await this.monitorWeatherConditions(
            location.latitude,
            location.longitude
          );
          return { location, alerts };
        })
      );

      return results.filter(result => result.alerts.length > 0);
    } catch (error) {
      console.error('Error getting multi-location alerts:', error);
      return [];
    }
  }

  /**
   * Generate alert for field boundaries
   */
  async getFieldAlerts(
    fieldBoundary: { latitude: number; longitude: number }[]
  ): Promise<WeatherAlert[]> {
    try {
      if (fieldBoundary.length < 3) {
        throw new Error('Field boundary must have at least 3 points');
      }

      // Calculate field center
      const centerLat = fieldBoundary.reduce((sum, point) => sum + point.latitude, 0) / fieldBoundary.length;
      const centerLon = fieldBoundary.reduce((sum, point) => sum + point.longitude, 0) / fieldBoundary.length;

      const alerts = await this.monitorWeatherConditions(centerLat, centerLon);

      // Enhance alerts with field-specific information
      return alerts.map(alert => ({
        ...alert,
        affectedAreas: [`Field area: ${this.calculateFieldArea(fieldBoundary).toFixed(2)} hectares`],
        farmImpact: {
          ...alert.farmImpact,
          cropsAtRisk: this.identifyVulnerableCrops(alert.alertType)
        }
      }));

    } catch (error) {
      console.error('Error getting field alerts:', error);
      return [];
    }
  }

  private checkFrostConditions(
    current: CurrentWeather,
    forecast: WeatherForecast[],
    thresholds: AlertThresholds
  ): WeatherAlert | null {
    const { temperature, humidity, windSpeed } = current;
    const threshold = thresholds.frost;

    // Check current conditions
    const frostRisk = temperature <= threshold.temperature && 
                     humidity >= threshold.humidity && 
                     windSpeed <= threshold.windSpeed;

    // Check forecast for next 24 hours
    const tomorrowForecast = forecast[0];
    const forecastFrostRisk = tomorrowForecast && 
                             tomorrowForecast.temperature.min <= threshold.temperature;

    if (!frostRisk && !forecastFrostRisk) {
      return null;
    }

    const severity = this.calculateFrostSeverity(temperature, threshold.temperature);
    const confidence = this.calculateFrostConfidence(current, tomorrowForecast);

    return {
      id: `frost_${Date.now()}`,
      alertType: 'frost',
      severity,
      title: 'Frost Warning',
      description: frostRisk 
        ? `Current temperature is ${Math.round(temperature)}°C with high humidity and low wind - frost conditions present`
        : `Frost conditions forecast - minimum temperature expected to reach ${Math.round(tomorrowForecast!.temperature.min)}°C`,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: current.location.latitude,
        longitude: current.location.longitude,
        name: current.location.name
      },
      recommendations: this.getFrostRecommendations(severity),
      affectedAreas: [],
      confidence,
      isActive: true,
      priority: severity === 'extreme' ? 10 : severity === 'severe' ? 8 : 6,
      farmImpact: {
        cropsAtRisk: ['sensitive vegetables', 'fruit trees', 'seedlings'],
        estimatedDamage: severity === 'extreme' ? 'severe' : severity === 'severe' ? 'high' : 'medium',
        urgencyLevel: severity === 'extreme' ? 'critical' : 'warning'
      },
      actionRequired: {
        immediate: ['Cover sensitive plants', 'Start irrigation systems', 'Deploy frost protection'],
        shortTerm: ['Monitor overnight temperatures', 'Assess crop damage in morning'],
        monitoring: ['Check weather forecasts for continued frost risk']
      }
    };
  }

  private checkHeatConditions(
    current: CurrentWeather,
    forecast: WeatherForecast[],
    thresholds: AlertThresholds
  ): WeatherAlert | null {
    const { temperature } = current;
    const threshold = thresholds.heat;

    const currentHeatRisk = temperature >= threshold.temperature;
    const forecastHeatRisk = forecast.some(day => 
      day.temperature.max >= threshold.temperature
    );

    if (!currentHeatRisk && !forecastHeatRisk) {
      return null;
    }

    const maxTemp = Math.max(temperature, ...forecast.slice(0, 3).map(f => f.temperature.max));
    const severity = this.calculateHeatSeverity(maxTemp, threshold.temperature);

    return {
      id: `heat_${Date.now()}`,
      alertType: 'heat',
      severity,
      title: 'Heat Stress Warning',
      description: `High temperatures reaching ${Math.round(maxTemp)}°C pose heat stress risk to crops`,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: current.location.latitude,
        longitude: current.location.longitude,
        name: current.location.name
      },
      recommendations: this.getHeatRecommendations(severity),
      affectedAreas: [],
      confidence: 0.8,
      isActive: true,
      priority: severity === 'extreme' ? 9 : severity === 'severe' ? 7 : 5,
      farmImpact: {
        cropsAtRisk: ['leafy greens', 'tomatoes', 'heat-sensitive crops'],
        estimatedDamage: severity === 'extreme' ? 'high' : 'medium',
        urgencyLevel: severity === 'extreme' ? 'critical' : 'warning'
      },
      actionRequired: {
        immediate: ['Increase irrigation frequency', 'Provide shade covers', 'Harvest heat-sensitive crops'],
        shortTerm: ['Monitor soil moisture', 'Adjust planting schedules'],
        monitoring: ['Track crop stress indicators', 'Monitor water usage']
      }
    };
  }

  private checkWindConditions(
    current: CurrentWeather,
    forecast: WeatherForecast[],
    thresholds: AlertThresholds
  ): WeatherAlert | null {
    const { windSpeed } = current;
    const threshold = thresholds.wind;

    if (windSpeed < threshold.speed) {
      return null;
    }

    const severity = this.calculateWindSeverity(windSpeed, threshold.speed);

    return {
      id: `wind_${Date.now()}`,
      alertType: 'wind',
      severity,
      title: 'High Wind Warning',
      description: `Strong winds at ${Math.round(windSpeed * 3.6)} km/h may damage crops and equipment`,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: current.location.latitude,
        longitude: current.location.longitude,
        name: current.location.name
      },
      recommendations: this.getWindRecommendations(severity),
      affectedAreas: [],
      confidence: 0.85,
      isActive: true,
      priority: severity === 'extreme' ? 8 : severity === 'severe' ? 6 : 4,
      farmImpact: {
        cropsAtRisk: ['tall crops', 'fruit trees', 'greenhouse structures'],
        estimatedDamage: severity === 'extreme' ? 'high' : 'medium',
        urgencyLevel: severity === 'extreme' ? 'critical' : 'warning'
      },
      actionRequired: {
        immediate: ['Secure loose equipment', 'Support tall plants', 'Close greenhouse vents'],
        shortTerm: ['Inspect structural damage', 'Check irrigation systems'],
        monitoring: ['Monitor wind forecasts', 'Assess crop damage']
      }
    };
  }

  private checkPrecipitationConditions(
    current: CurrentWeather,
    forecast: WeatherForecast[],
    thresholds: AlertThresholds
  ): WeatherAlert | null {
    const threshold = thresholds.precipitation;
    
    // Check for heavy rain in forecast
    const heavyRainRisk = forecast.some(day => 
      day.precipitationProbability > 80
    );

    if (!heavyRainRisk) {
      return null;
    }

    const maxPrecipProb = Math.max(...forecast.slice(0, 3).map(f => f.precipitationProbability));
    const severity = this.calculatePrecipitationSeverity(maxPrecipProb);

    return {
      id: `flood_${Date.now()}`,
      alertType: 'flood',
      severity,
      title: 'Heavy Rainfall Warning',
      description: `Heavy rainfall forecast with ${maxPrecipProb}% probability may cause flooding`,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      location: {
        latitude: current.location.latitude,
        longitude: current.location.longitude,
        name: current.location.name
      },
      recommendations: this.getFloodRecommendations(severity),
      affectedAreas: [],
      confidence: 0.7,
      isActive: true,
      priority: severity === 'extreme' ? 9 : severity === 'severe' ? 7 : 5,
      farmImpact: {
        cropsAtRisk: ['root vegetables', 'low-lying crops', 'recently planted seeds'],
        estimatedDamage: severity === 'extreme' ? 'severe' : 'medium',
        urgencyLevel: severity === 'extreme' ? 'critical' : 'warning'
      },
      actionRequired: {
        immediate: ['Clear drainage systems', 'Harvest ready crops', 'Secure equipment'],
        shortTerm: ['Monitor field drainage', 'Check for waterlogging'],
        monitoring: ['Track rainfall amounts', 'Monitor soil saturation']
      }
    };
  }

  private checkDroughtConditions(
    aggregatedData: any,
    thresholds: AlertThresholds
  ): WeatherAlert | null {
    const threshold = thresholds.drought;
    
    // Simple drought detection based on dry days and irrigation need
    const dryDays = aggregatedData.agricultureMetrics.dryDays;
    const irrigationNeeded = aggregatedData.agricultureMetrics.irrigationNeeded;
    const avgTemp = aggregatedData.statistics.temperature.average;

    if (dryDays < threshold.precipitationDays / 2 && !irrigationNeeded) {
      return null;
    }

    const severity = this.calculateDroughtSeverity(dryDays, threshold.precipitationDays);

    return {
      id: `drought_${Date.now()}`,
      alertType: 'drought',
      severity,
      title: 'Drought Conditions',
      description: `Extended dry period of ${dryDays} days with irrigation needed`,
      startTime: new Date().toISOString(),
      location: {
        latitude: aggregatedData.location.latitude,
        longitude: aggregatedData.location.longitude,
        name: aggregatedData.location.name
      },
      recommendations: this.getDroughtRecommendations(severity),
      affectedAreas: [],
      confidence: 0.8,
      isActive: true,
      priority: severity === 'extreme' ? 8 : severity === 'severe' ? 6 : 4,
      farmImpact: {
        cropsAtRisk: ['water-intensive crops', 'shallow-rooted plants'],
        estimatedDamage: severity === 'extreme' ? 'high' : 'medium',
        urgencyLevel: severity === 'extreme' ? 'critical' : 'warning'
      },
      actionRequired: {
        immediate: ['Implement water conservation', 'Prioritize irrigation'],
        shortTerm: ['Monitor soil moisture', 'Adjust crop selection'],
        monitoring: ['Track precipitation forecasts', 'Monitor water reserves']
      }
    };
  }

  private checkFireRiskConditions(
    current: CurrentWeather,
    aggregatedData: any
  ): WeatherAlert | null {
    const { temperature, humidity, windSpeed } = current;
    const dryDays = aggregatedData.agricultureMetrics.dryDays;

    // Fire risk calculation
    const fireRiskIndex = (temperature - 15) * 2 + 
                         (100 - humidity) + 
                         windSpeed * 3 + 
                         dryDays * 2;

    if (fireRiskIndex < 100) {
      return null;
    }

    const severity = fireRiskIndex > 200 ? 'extreme' : 
                    fireRiskIndex > 150 ? 'severe' : 'moderate';

    return {
      id: `fire_${Date.now()}`,
      alertType: 'fire_risk',
      severity: severity as 'minor' | 'moderate' | 'severe' | 'extreme',
      title: 'Fire Risk Warning',
      description: `High fire risk due to hot, dry, and windy conditions (Risk Index: ${Math.round(fireRiskIndex)})`,
      startTime: new Date().toISOString(),
      location: {
        latitude: current.location.latitude,
        longitude: current.location.longitude,
        name: current.location.name
      },
      recommendations: this.getFireRiskRecommendations(),
      affectedAreas: [],
      confidence: 0.75,
      isActive: true,
      priority: severity === 'extreme' ? 10 : severity === 'severe' ? 8 : 6,
      farmImpact: {
        cropsAtRisk: ['dry vegetation', 'stored hay', 'wooden structures'],
        estimatedDamage: severity === 'extreme' ? 'severe' : 'high',
        urgencyLevel: severity === 'extreme' ? 'critical' : 'warning'
      },
      actionRequired: {
        immediate: ['Clear dry vegetation', 'Check fire breaks', 'Prepare firefighting equipment'],
        shortTerm: ['Monitor fire weather conditions', 'Restrict outdoor activities'],
        monitoring: ['Track fire danger ratings', 'Monitor local fire reports']
      }
    };
  }

  // Severity calculation helpers
  private calculateFrostSeverity(temperature: number, threshold: number): 'minor' | 'moderate' | 'severe' | 'extreme' {
    const diff = threshold - temperature;
    if (diff > 5) return 'extreme';
    if (diff > 3) return 'severe';
    if (diff > 1) return 'moderate';
    return 'minor';
  }

  private calculateHeatSeverity(temperature: number, threshold: number): 'minor' | 'moderate' | 'severe' | 'extreme' {
    const diff = temperature - threshold;
    if (diff > 10) return 'extreme';
    if (diff > 5) return 'severe';
    if (diff > 2) return 'moderate';
    return 'minor';
  }

  private calculateWindSeverity(windSpeed: number, threshold: number): 'minor' | 'moderate' | 'severe' | 'extreme' {
    const ratio = windSpeed / threshold;
    if (ratio > 2) return 'extreme';
    if (ratio > 1.5) return 'severe';
    if (ratio > 1.2) return 'moderate';
    return 'minor';
  }

  private calculatePrecipitationSeverity(probability: number): 'minor' | 'moderate' | 'severe' | 'extreme' {
    if (probability > 95) return 'extreme';
    if (probability > 85) return 'severe';
    if (probability > 75) return 'moderate';
    return 'minor';
  }

  private calculateDroughtSeverity(dryDays: number, threshold: number): 'minor' | 'moderate' | 'severe' | 'extreme' {
    const ratio = dryDays / threshold;
    if (ratio > 2) return 'extreme';
    if (ratio > 1.5) return 'severe';
    if (ratio > 1) return 'moderate';
    return 'minor';
  }

  private calculateFrostConfidence(current: CurrentWeather, forecast?: WeatherForecast): number {
    let confidence = 0.7;
    
    // Higher confidence if multiple indicators align
    if (current.humidity > 80) confidence += 0.1;
    if (current.cloudCover < 30) confidence += 0.1;
    if (current.windSpeed < 2) confidence += 0.1;
    if (forecast && forecast.temperature.min <= 0) confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  // Recommendation helpers
  private getFrostRecommendations(severity: string): string[] {
    const base = [
      'Cover sensitive plants with frost cloth or plastic',
      'Run irrigation systems to create protective ice layer',
      'Move potted plants indoors or to protected areas'
    ];

    if (severity === 'extreme' || severity === 'severe') {
      base.push(
        'Deploy frost fans or heaters if available',
        'Harvest ready produce before damage occurs',
        'Apply foliar anti-transpirants to reduce water loss'
      );
    }

    return base;
  }

  private getHeatRecommendations(severity: string): string[] {
    const base = [
      'Increase irrigation frequency and duration',
      'Apply mulch to reduce soil temperature',
      'Provide shade cloth for sensitive crops'
    ];

    if (severity === 'extreme' || severity === 'severe') {
      base.push(
        'Harvest heat-sensitive crops early',
        'Implement misting systems',
        'Schedule field work for cooler hours'
      );
    }

    return base;
  }

  private getWindRecommendations(severity: string): string[] {
    const base = [
      'Secure loose equipment and materials',
      'Support tall plants with stakes or ties',
      'Close greenhouse vents and doors'
    ];

    if (severity === 'extreme' || severity === 'severe') {
      base.push(
        'Avoid spraying operations',
        'Postpone harvest of fragile crops',
        'Inspect and secure structures'
      );
    }

    return base;
  }

  private getFloodRecommendations(severity: string): string[] {
    return [
      'Clear drainage channels and culverts',
      'Harvest crops in low-lying areas',
      'Move equipment to higher ground',
      'Monitor field drainage capacity',
      'Prepare for post-flood disease management'
    ];
  }

  private getDroughtRecommendations(severity: string): string[] {
    return [
      'Implement water conservation measures',
      'Prioritize irrigation for high-value crops',
      'Apply mulch to reduce evaporation',
      'Consider drought-resistant crop varieties',
      'Monitor soil moisture levels closely'
    ];
  }

  private getFireRiskRecommendations(): string[] {
    return [
      'Create and maintain fire breaks',
      'Remove dry vegetation around buildings',
      'Ensure firefighting equipment is ready',
      'Restrict burning and spark-producing activities',
      'Monitor local fire danger warnings'
    ];
  }

  private identifyVulnerableCrops(alertType: string): string[] {
    const cropVulnerability: Record<string, string[]> = {
      frost: ['tomatoes', 'peppers', 'citrus', 'tropical fruits', 'seedlings'],
      heat: ['lettuce', 'spinach', 'cool-season crops', 'dairy cattle'],
      wind: ['corn', 'fruit trees', 'greenhouse crops', 'tall vegetables'],
      flood: ['root vegetables', 'grain crops', 'recently planted seeds'],
      drought: ['shallow-rooted crops', 'vegetables', 'annual flowers'],
      fire_risk: ['dry grasses', 'stored hay', 'wooden structures']
    };

    return cropVulnerability[alertType] || ['all crops'];
  }

  private calculateFieldArea(boundary: { latitude: number; longitude: number }[]): number {
    // Simplified area calculation in hectares
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
    
    return Math.abs(area * earthRadius * earthRadius / 2) / 10000; // Convert to hectares
  }
}

export const weatherAlerts = new WeatherAlertService();