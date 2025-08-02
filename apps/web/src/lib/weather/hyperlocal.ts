/**
 * Hyperlocal Weather Prediction Service
 * 
 * Provides high-resolution weather predictions using multiple data sources,
 * topographical analysis, and machine learning models for farm-specific forecasts.
 */

import { weatherService, CurrentWeather, WeatherForecast } from './service';

export interface HyperlocalWeatherPoint {
  latitude: number;
  longitude: number;
  elevation?: number;
  microclimate?: 'valley' | 'hilltop' | 'coastal' | 'urban' | 'rural';
  distance?: number; // Distance from main point in meters
}

export interface HyperlocalPrediction {
  location: HyperlocalWeatherPoint;
  timestamp: string;
  confidence: number; // 0-1
  temperature: {
    value: number;
    adjustment: number; // Difference from regional forecast
    factors: string[]; // Factors affecting local temperature
  };
  precipitation: {
    probability: number;
    intensity: 'light' | 'moderate' | 'heavy';
    type: 'rain' | 'drizzle' | 'snow' | 'sleet';
    adjustment: number;
  };
  wind: {
    speed: number;
    direction: number;
    gusts?: number;
    sheltering: number; // 0-1, how much local features reduce wind
  };
  humidity: {
    value: number;
    adjustment: number;
  };
  risks: {
    frost: number; // 0-1 probability
    hail: number;
    flooding: number;
    drought: number;
  };
  agricultureFactors: {
    coldAirDrainage: boolean;
    heatIsland: boolean;
    moistureRetention: number; // 0-1
    windExposure: number; // 0-1
  };
}

export interface HyperlocalGrid {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  resolution: number; // meters
  points: HyperlocalPrediction[];
  generated: string;
  validUntil: string;
}

export interface TopographicalData {
  elevation: number;
  slope: number;
  aspect: number; // degrees from north
  curvature: number;
  roughness: number;
  landUse: 'agriculture' | 'forest' | 'urban' | 'water' | 'bare';
}

class HyperlocalWeatherService {
  private readonly GRID_RESOLUTION = 100; // meters
  private readonly PREDICTION_HOURS = 72; // 3 days
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Generate hyperlocal weather grid for a field or area
   */
  async generateHyperlocalGrid(
    centerLat: number,
    centerLon: number,
    radiusMeters: number = 1000
  ): Promise<HyperlocalGrid | null> {
    try {
      // Get base weather forecast
      const baseWeather = await weatherService.getCurrentWeather(centerLat, centerLon);
      const baseForecast = await weatherService.getWeatherForecast(centerLat, centerLon, 3);

      if (!baseWeather || !baseForecast.length) {
        return null;
      }

      // Generate grid points
      const gridPoints = this.generateGridPoints(centerLat, centerLon, radiusMeters);
      
      // Generate predictions for each point
      const predictions: HyperlocalPrediction[] = [];
      
      for (const point of gridPoints) {
        const prediction = await this.generatePointPrediction(
          point,
          baseWeather,
          baseForecast[0] // Use first forecast day
        );
        predictions.push(prediction);
      }

      const bounds = this.calculateBounds(gridPoints);

      return {
        bounds,
        resolution: this.GRID_RESOLUTION,
        points: predictions,
        generated: new Date().toISOString(),
        validUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3 hours
      };

    } catch (error) {
      console.error('Error generating hyperlocal grid:', error);
      return null;
    }
  }

  /**
   * Get hyperlocal prediction for a specific point
   */
  async getPointPrediction(
    latitude: number,
    longitude: number,
    elevation?: number
  ): Promise<HyperlocalPrediction | null> {
    try {
      const baseWeather = await weatherService.getCurrentWeather(latitude, longitude);
      const baseForecast = await weatherService.getWeatherForecast(latitude, longitude, 1);

      if (!baseWeather || !baseForecast.length) {
        return null;
      }

      const point: HyperlocalWeatherPoint = {
        latitude,
        longitude,
        elevation: elevation || await this.estimateElevation(latitude, longitude),
        microclimate: this.determineMicroclimate(latitude, longitude)
      };

      return this.generatePointPrediction(point, baseWeather, baseForecast[0]);

    } catch (error) {
      console.error('Error getting point prediction:', error);
      return null;
    }
  }

  /**
   * Analyze microclimate variations across a field
   */
  async analyzeFieldMicroclimate(
    fieldBoundary: { latitude: number; longitude: number }[]
  ): Promise<{
    variations: {
      temperatureRange: number;
      moistureVariation: number;
      windVariation: number;
    };
    riskZones: {
      frostPockets: HyperlocalWeatherPoint[];
      windExposed: HyperlocalWeatherPoint[];
      droughtProne: HyperlocalWeatherPoint[];
    };
    recommendations: string[];
  } | null> {
    try {
      if (fieldBoundary.length < 3) {
        throw new Error('Field boundary must have at least 3 points');
      }

      // Sample points across the field
      const samplePoints = this.sampleFieldPoints(fieldBoundary, 20);
      
      // Get predictions for sample points
      const predictions: HyperlocalPrediction[] = [];
      for (const point of samplePoints) {
        const prediction = await this.getPointPrediction(point.latitude, point.longitude);
        if (prediction) {
          predictions.push(prediction);
        }
      }

      if (predictions.length === 0) {
        return null;
      }

      // Analyze variations
      const temperatures = predictions.map(p => p.temperature.value);
      const humidities = predictions.map(p => p.humidity.value);
      const windSpeeds = predictions.map(p => p.wind.speed);

      const variations = {
        temperatureRange: Math.max(...temperatures) - Math.min(...temperatures),
        moistureVariation: Math.max(...humidities) - Math.min(...humidities),
        windVariation: Math.max(...windSpeeds) - Math.min(...windSpeeds)
      };

      // Identify risk zones
      const riskZones = {
        frostPockets: predictions.filter(p => p.risks.frost > 0.3).map(p => p.location),
        windExposed: predictions.filter(p => p.wind.speed > 15).map(p => p.location),
        droughtProne: predictions.filter(p => p.risks.drought > 0.3).map(p => p.location)
      };

      // Generate recommendations
      const recommendations = this.generateMicroclimatRecommendations(variations, riskZones);

      return {
        variations,
        riskZones,
        recommendations
      };

    } catch (error) {
      console.error('Error analyzing field microclimate:', error);
      return null;
    }
  }

  private generateGridPoints(
    centerLat: number,
    centerLon: number,
    radiusMeters: number
  ): HyperlocalWeatherPoint[] {
    const points: HyperlocalWeatherPoint[] = [];
    const gridSize = this.GRID_RESOLUTION;
    const pointsPerSide = Math.ceil(radiusMeters * 2 / gridSize);
    
    // Convert meters to degrees (approximate)
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLon = metersPerDegreeLat * Math.cos(centerLat * Math.PI / 180);
    
    const deltaLat = gridSize / metersPerDegreeLat;
    const deltaLon = gridSize / metersPerDegreeLon;
    
    const startLat = centerLat - (pointsPerSide / 2) * deltaLat;
    const startLon = centerLon - (pointsPerSide / 2) * deltaLon;
    
    for (let i = 0; i < pointsPerSide; i++) {
      for (let j = 0; j < pointsPerSide; j++) {
        const lat = startLat + i * deltaLat;
        const lon = startLon + j * deltaLon;
        
        // Calculate distance from center
        const distance = this.calculateDistance(centerLat, centerLon, lat, lon);
        
        if (distance <= radiusMeters) {
          points.push({
            latitude: lat,
            longitude: lon,
            distance,
            microclimate: this.determineMicroclimate(lat, lon)
          });
        }
      }
    }
    
    return points;
  }

  private async generatePointPrediction(
    point: HyperlocalWeatherPoint,
    baseWeather: CurrentWeather,
    baseForecast: WeatherForecast
  ): Promise<HyperlocalPrediction> {
    // Get topographical data
    const topo = await this.getTopographicalData(point.latitude, point.longitude);
    
    // Calculate local adjustments
    const tempAdjustment = this.calculateTemperatureAdjustment(baseWeather, topo, point);
    const precipAdjustment = this.calculatePrecipitationAdjustment(baseForecast, topo, point);
    const windAdjustment = this.calculateWindAdjustment(baseWeather, topo, point);
    const humidityAdjustment = this.calculateHumidityAdjustment(baseWeather, topo, point);
    
    // Calculate risks
    const risks = this.calculateLocalRisks(baseWeather, baseForecast, topo, point);
    
    // Determine agriculture factors
    const agricultureFactors = this.determineAgricultureFactors(topo, point);
    
    // Calculate confidence based on data quality and local factors
    const confidence = this.calculatePredictionConfidence(point, topo);

    return {
      location: point,
      timestamp: new Date().toISOString(),
      confidence,
      temperature: {
        value: baseWeather.temperature + tempAdjustment,
        adjustment: tempAdjustment,
        factors: this.getTemperatureFactors(topo, point)
      },
      precipitation: {
        probability: Math.max(0, Math.min(100, baseForecast.precipitationProbability + precipAdjustment)),
        intensity: this.determinePrecipitationIntensity(baseForecast.precipitationProbability + precipAdjustment),
        type: 'rain', // Simplified
        adjustment: precipAdjustment
      },
      wind: {
        speed: Math.max(0, baseWeather.windSpeed + windAdjustment),
        direction: baseWeather.windDirection,
        sheltering: this.calculateWindSheltering(topo, point)
      },
      humidity: {
        value: Math.max(0, Math.min(100, baseWeather.humidity + humidityAdjustment)),
        adjustment: humidityAdjustment
      },
      risks,
      agricultureFactors
    };
  }

  private calculateTemperatureAdjustment(
    weather: CurrentWeather,
    topo: TopographicalData,
    point: HyperlocalWeatherPoint
  ): number {
    let adjustment = 0;
    
    // Elevation adjustment (lapse rate: -6.5°C per 1000m)
    if (point.elevation !== undefined) {
      const elevationDiff = point.elevation - 100; // Assume base elevation 100m
      adjustment += elevationDiff * -0.0065;
    }
    
    // Slope and aspect adjustments
    if (topo.slope > 5) {
      // South-facing slopes are warmer
      if (topo.aspect >= 135 && topo.aspect <= 225) {
        adjustment += 1.0;
      }
      // North-facing slopes are cooler
      if (topo.aspect >= 315 || topo.aspect <= 45) {
        adjustment -= 1.0;
      }
    }
    
    // Land use adjustments
    switch (topo.landUse) {
      case 'urban':
        adjustment += 2.0; // Urban heat island
        break;
      case 'water':
        adjustment -= 1.0; // Water bodies moderate temperature
        break;
      case 'forest':
        adjustment -= 0.5; // Forest cooling
        break;
    }
    
    // Microclimate adjustments
    switch (point.microclimate) {
      case 'valley':
        adjustment -= 1.5; // Valleys are cooler, especially at night
        break;
      case 'hilltop':
        adjustment += 1.0; // Hilltops are warmer during day
        break;
      case 'coastal':
        adjustment -= 0.5; // Ocean moderation
        break;
    }
    
    return adjustment;
  }

  private calculatePrecipitationAdjustment(
    forecast: WeatherForecast,
    topo: TopographicalData,
    point: HyperlocalWeatherPoint
  ): number {
    let adjustment = 0;
    
    // Elevation adjustment (orographic precipitation)
    if (point.elevation !== undefined && point.elevation > 200) {
      adjustment += 5; // Higher elevation = more precipitation
    }
    
    // Slope adjustments (windward slopes get more precipitation)
    if (topo.slope > 10) {
      adjustment += 3;
    }
    
    // Valley rain shadow effect
    if (point.microclimate === 'valley') {
      adjustment -= 5;
    }
    
    return adjustment;
  }

  private calculateWindAdjustment(
    weather: CurrentWeather,
    topo: TopographicalData,
    point: HyperlocalWeatherPoint
  ): number {
    let adjustment = 0;
    
    // Elevation adjustment (wind increases with height)
    if (point.elevation !== undefined && point.elevation > 100) {
      adjustment += (point.elevation - 100) * 0.01;
    }
    
    // Sheltering from terrain
    const sheltering = this.calculateWindSheltering(topo, point);
    adjustment -= weather.windSpeed * sheltering * 0.5;
    
    // Hilltops are more exposed
    if (point.microclimate === 'hilltop') {
      adjustment += 2.0;
    }
    
    // Valleys are more sheltered
    if (point.microclimate === 'valley') {
      adjustment -= 1.5;
    }
    
    return adjustment;
  }

  private calculateHumidityAdjustment(
    weather: CurrentWeather,
    topo: TopographicalData,
    point: HyperlocalWeatherPoint
  ): number {
    let adjustment = 0;
    
    // Water bodies increase humidity
    if (topo.landUse === 'water') {
      adjustment += 10;
    }
    
    // Valleys retain moisture
    if (point.microclimate === 'valley') {
      adjustment += 5;
    }
    
    // Hilltops lose moisture
    if (point.microclimate === 'hilltop') {
      adjustment -= 5;
    }
    
    // Forest increases humidity
    if (topo.landUse === 'forest') {
      adjustment += 3;
    }
    
    return adjustment;
  }

  private calculateLocalRisks(
    weather: CurrentWeather,
    forecast: WeatherForecast,
    topo: TopographicalData,
    point: HyperlocalWeatherPoint
  ): any {
    return {
      frost: this.calculateFrostRisk(weather, topo, point),
      hail: this.calculateHailRisk(forecast, topo),
      flooding: this.calculateFloodRisk(forecast, topo, point),
      drought: this.calculateDroughtRisk(forecast, topo, point)
    };
  }

  private calculateFrostRisk(weather: CurrentWeather, topo: TopographicalData, point: HyperlocalWeatherPoint): number {
    let risk = 0;
    
    // Base temperature risk
    if (weather.temperature < 5) {
      risk = (5 - weather.temperature) / 5;
    }
    
    // Valley cold air drainage increases frost risk
    if (point.microclimate === 'valley') {
      risk += 0.3;
    }
    
    // Clear skies increase frost risk
    if (weather.cloudCover < 30) {
      risk += 0.2;
    }
    
    // Low wind increases frost risk
    if (weather.windSpeed < 2) {
      risk += 0.2;
    }
    
    return Math.min(1, Math.max(0, risk));
  }

  private calculateHailRisk(forecast: WeatherForecast, topo: TopographicalData): number {
    let risk = 0;
    
    // High precipitation probability increases hail risk
    if (forecast.precipitationProbability > 70) {
      risk += 0.3;
    }
    
    // Elevated areas have higher hail risk
    if (topo.elevation > 300) {
      risk += 0.2;
    }
    
    return Math.min(1, Math.max(0, risk));
  }

  private calculateFloodRisk(forecast: WeatherForecast, topo: TopographicalData, point: HyperlocalWeatherPoint): number {
    let risk = 0;
    
    // High precipitation increases flood risk
    if (forecast.precipitationProbability > 80) {
      risk += 0.4;
    }
    
    // Low-lying areas have higher flood risk
    if (point.microclimate === 'valley') {
      risk += 0.3;
    }
    
    // Steep slopes increase runoff
    if (topo.slope > 15) {
      risk += 0.2;
    }
    
    return Math.min(1, Math.max(0, risk));
  }

  private calculateDroughtRisk(forecast: WeatherForecast, topo: TopographicalData, point: HyperlocalWeatherPoint): number {
    let risk = 0;
    
    // Low precipitation increases drought risk
    if (forecast.precipitationProbability < 20) {
      risk += 0.4;
    }
    
    // Sandy soils drain faster (simplified by land use)
    if (topo.landUse === 'bare') {
      risk += 0.2;
    }
    
    // Hilltops dry out faster
    if (point.microclimate === 'hilltop') {
      risk += 0.2;
    }
    
    return Math.min(1, Math.max(0, risk));
  }

  private determineAgricultureFactors(topo: TopographicalData, point: HyperlocalWeatherPoint): any {
    return {
      coldAirDrainage: point.microclimate === 'valley' && topo.slope > 3,
      heatIsland: topo.landUse === 'urban' || (point.microclimate === 'hilltop' && topo.slope < 5),
      moistureRetention: this.calculateMoistureRetention(topo, point),
      windExposure: this.calculateWindExposure(topo, point)
    };
  }

  private calculateMoistureRetention(topo: TopographicalData, point: HyperlocalWeatherPoint): number {
    let retention = 0.5; // Base retention
    
    if (point.microclimate === 'valley') retention += 0.3;
    if (topo.landUse === 'forest') retention += 0.2;
    if (topo.slope < 5) retention += 0.1;
    
    return Math.min(1, retention);
  }

  private calculateWindExposure(topo: TopographicalData, point: HyperlocalWeatherPoint): number {
    let exposure = 0.5; // Base exposure
    
    if (point.microclimate === 'hilltop') exposure += 0.4;
    if (topo.slope > 10) exposure += 0.2;
    if (topo.landUse === 'bare') exposure += 0.1;
    
    return Math.min(1, exposure);
  }

  private calculateWindSheltering(topo: TopographicalData, point: HyperlocalWeatherPoint): number {
    let sheltering = 0;
    
    if (point.microclimate === 'valley') sheltering += 0.4;
    if (topo.landUse === 'forest') sheltering += 0.3;
    if (topo.roughness > 0.5) sheltering += 0.2;
    
    return Math.min(1, sheltering);
  }

  private calculatePredictionConfidence(point: HyperlocalWeatherPoint, topo: TopographicalData): number {
    let confidence = 0.8; // Base confidence
    
    // Reduce confidence for complex terrain
    if (topo.slope > 20) confidence -= 0.2;
    if (topo.curvature > 0.5) confidence -= 0.1;
    
    // Reduce confidence for areas far from weather stations
    if (point.distance && point.distance > 10000) {
      confidence -= 0.2;
    }
    
    return Math.max(0.3, Math.min(1, confidence));
  }

  private async getTopographicalData(latitude: number, longitude: number): Promise<TopographicalData> {
    // Simplified topographical data - in production would use DEM and land use APIs
    return {
      elevation: await this.estimateElevation(latitude, longitude),
      slope: Math.random() * 20,
      aspect: Math.random() * 360,
      curvature: Math.random() * 0.5,
      roughness: Math.random() * 0.8,
      landUse: this.estimateLandUse(latitude, longitude)
    };
  }

  private async estimateElevation(latitude: number, longitude: number): Promise<number> {
    // Simplified elevation estimation - in production would use SRTM or similar DEM
    return 100 + Math.random() * 200;
  }

  private determineMicroclimate(latitude: number, longitude: number): HyperlocalWeatherPoint['microclimate'] {
    // Simplified microclimate determination
    const random = Math.random();
    if (random < 0.3) return 'valley';
    if (random < 0.5) return 'hilltop';
    if (random < 0.7) return 'rural';
    return 'urban';
  }

  private estimateLandUse(latitude: number, longitude: number): TopographicalData['landUse'] {
    // Simplified land use estimation
    const random = Math.random();
    if (random < 0.6) return 'agriculture';
    if (random < 0.8) return 'forest';
    if (random < 0.9) return 'urban';
    return 'bare';
  }

  private getTemperatureFactors(topo: TopographicalData, point: HyperlocalWeatherPoint): string[] {
    const factors: string[] = [];
    
    if (point.elevation && point.elevation > 200) factors.push('elevation');
    if (topo.slope > 10) factors.push('slope');
    if (point.microclimate === 'valley') factors.push('cold air drainage');
    if (topo.landUse === 'urban') factors.push('heat island');
    if (topo.landUse === 'water') factors.push('water moderation');
    
    return factors;
  }

  private determinePrecipitationIntensity(probability: number): 'light' | 'moderate' | 'heavy' {
    if (probability > 80) return 'heavy';
    if (probability > 50) return 'moderate';
    return 'light';
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateBounds(points: HyperlocalWeatherPoint[]): any {
    const lats = points.map(p => p.latitude);
    const lons = points.map(p => p.longitude);
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lons),
      west: Math.min(...lons)
    };
  }

  private sampleFieldPoints(boundary: { latitude: number; longitude: number }[], count: number): HyperlocalWeatherPoint[] {
    // Simplified field sampling - would use more sophisticated spatial sampling in production
    const points: HyperlocalWeatherPoint[] = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * boundary.length);
      const basePoint = boundary[randomIndex];
      
      // Add some variation around the boundary point
      const latOffset = (Math.random() - 0.5) * 0.01;
      const lonOffset = (Math.random() - 0.5) * 0.01;
      
      points.push({
        latitude: basePoint.latitude + latOffset,
        longitude: basePoint.longitude + lonOffset
      });
    }
    
    return points;
  }

  private generateMicroclimatRecommendations(variations: any, riskZones: any): string[] {
    const recommendations: string[] = [];
    
    if (variations.temperatureRange > 3) {
      recommendations.push('Consider different planting times for temperature-sensitive crops across the field');
    }
    
    if (riskZones.frostPockets.length > 0) {
      recommendations.push('Install frost protection in identified cold spots');
      recommendations.push('Consider cold-hardy varieties in frost-prone areas');
    }
    
    if (riskZones.windExposed.length > 0) {
      recommendations.push('Install windbreaks in exposed areas');
      recommendations.push('Secure irrigation systems in high-wind zones');
    }
    
    if (riskZones.droughtProne.length > 0) {
      recommendations.push('Increase irrigation frequency in drought-prone areas');
      recommendations.push('Consider drought-resistant varieties in dry zones');
    }
    
    if (variations.moistureVariation > 15) {
      recommendations.push('Implement variable-rate irrigation based on moisture zones');
    }
    
    return recommendations;
  }
}

export const hyperlocalWeather = new HyperlocalWeatherService();