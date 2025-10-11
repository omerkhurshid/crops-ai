/**
 * Weather Pattern Analysis Service
 * 
 * Provides advanced weather pattern analysis including:
 * - Historical weather correlations with crop performance
 * - Climate trend analysis and adaptation strategies
 * - Seasonal pattern predictions
 * - Weather-based risk assessment
 * - Optimal timing recommendations based on weather patterns
 */

import { Logger } from '@crops-ai/shared';
import { redis } from '../redis';
import { prisma } from '../prisma';

export interface WeatherPattern {
  id: string;
  region: string;
  pattern: 'el_nino' | 'la_nina' | 'neutral' | 'drought' | 'excessive_moisture' | 'heat_dome' | 'polar_vortex';
  confidence: number;
  startDate: Date;
  endDate: Date;
  intensity: 'weak' | 'moderate' | 'strong';
  impact: {
    temperature: number; // degrees from normal
    precipitation: number; // percentage from normal
    humidity: number; // percentage from normal
    windSpeed: number; // mph from normal
  };
  cropImpacts: {
    cropType: string;
    yieldImpact: number; // percentage change
    qualityImpact: number; // percentage change
    riskFactors: string[];
    mitigationStrategies: string[];
  }[];
}

export interface HistoricalCorrelation {
  weatherMetric: string;
  cropType: string;
  correlationCoefficient: number;
  significance: number; // p-value
  impactDescription: string;
  optimalRange: {
    min: number;
    max: number;
    unit: string;
  };
  historicalPerformance: {
    year: number;
    weatherValue: number;
    yieldValue: number;
    quality: number;
  }[];
}

export interface SeasonalForecast {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  year: number;
  temperatureOutlook: {
    trend: 'above_normal' | 'normal' | 'below_normal';
    confidence: number;
    averageTemp: number;
    extremeRisk: number; // 0-1 probability
  };
  precipitationOutlook: {
    trend: 'above_normal' | 'normal' | 'below_normal';
    confidence: number;
    totalPrecipitation: number;
    droughtRisk: number; // 0-1 probability
    floodRisk: number; // 0-1 probability
  };
  growingConditions: {
    favorability: number; // 0-10 scale
    keyRisks: string[];
    opportunities: string[];
    recommendedAdjustments: string[];
  };
  criticalDates: {
    lastFrost: Date;
    firstFrost: Date;
    plantingWindow: {
      optimal: Date;
      extended: {
        start: Date;
        end: Date;
      };
    };
    harvestWindow: {
      optimal: Date;
      extended: {
        start: Date;
        end: Date;
      };
    };
  };
}

export interface ClimateAdaptation {
  region: string;
  timeHorizon: '5_year' | '10_year' | '20_year';
  trends: {
    temperature: {
      change: number; // degrees per decade
      seasonalVariation: number; // increased variability
      extremeEvents: number; // frequency multiplier
    };
    precipitation: {
      change: number; // percentage per decade
      seasonalShift: number; // days shift in timing
      intensityChange: number; // percentage change in intensity
    };
    growingSeason: {
      lengthChange: number; // days per decade
      heatStress: number; // additional heat stress days
      waterStress: number; // additional water stress days
    };
  };
  adaptationStrategies: {
    cropSelection: string[];
    plantingTiming: string[];
    irrigation: string[];
    soilManagement: string[];
    riskManagement: string[];
  };
  economicImpact: {
    yieldChange: number; // percentage over time horizon
    costChange: number; // percentage over time horizon
    riskChange: number; // percentage over time horizon
    adaptationCost: number; // dollars per acre
    benefitCostRatio: number;
  };
}

class WeatherPatternAnalysisService {
  private readonly CACHE_TTL = 6 * 60 * 60; // 6 hours
  private readonly HISTORICAL_YEARS = 30;

  /**
   * Analyze current weather patterns and their likely impacts
   */
  async analyzeCurrentPatterns(latitude: number, longitude: number): Promise<{
    activePatterns: WeatherPattern[];
    riskAssessment: {
      overall: number; // 0-10 risk score
      immediate: string[]; // next 30 days
      seasonal: string[]; // next 90 days
      annual: string[]; // full season
    };
    recommendations: {
      immediate: string[];
      seasonal: string[];
      strategic: string[];
    };
  }> {
    const cacheKey = `weather_patterns_${latitude}_${longitude}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const activePatterns = await this.detectActivePatterns(latitude, longitude);
      const riskAssessment = this.assessWeatherRisks(activePatterns);
      const recommendations = this.generateWeatherRecommendations(activePatterns, riskAssessment);

      const analysis = {
        activePatterns,
        riskAssessment,
        recommendations
      };

      await this.setCached(cacheKey, analysis);
      return analysis;

    } catch (error) {
      Logger.error('Failed to analyze weather patterns', error);
      throw error;
    }
  }

  /**
   * Get historical weather correlations with crop performance
   */
  async getHistoricalCorrelations(
    cropType: string,
    latitude: number,
    longitude: number,
    years: number = this.HISTORICAL_YEARS
  ): Promise<HistoricalCorrelation[]> {
    const cacheKey = `historical_correlations_${cropType}_${latitude}_${longitude}_${years}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const correlations = await this.calculateHistoricalCorrelations(cropType, latitude, longitude, years);
      await this.setCached(cacheKey, correlations, 24 * 60 * 60); // 24 hour cache
      return correlations;

    } catch (error) {
      Logger.error('Failed to get historical correlations', error);
      throw error;
    }
  }

  /**
   * Generate seasonal forecast and growing condition predictions
   */
  async generateSeasonalForecast(
    latitude: number,
    longitude: number,
    season: 'spring' | 'summer' | 'fall' | 'winter',
    year?: number
  ): Promise<SeasonalForecast> {
    const targetYear = year || new Date().getFullYear();
    const cacheKey = `seasonal_forecast_${latitude}_${longitude}_${season}_${targetYear}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const forecast = await this.buildSeasonalForecast(latitude, longitude, season, targetYear);
      await this.setCached(cacheKey, forecast, 7 * 24 * 60 * 60); // 7 day cache
      return forecast;

    } catch (error) {
      Logger.error('Failed to generate seasonal forecast', error);
      throw error;
    }
  }

  /**
   * Get climate adaptation recommendations
   */
  async getClimateAdaptation(
    latitude: number,
    longitude: number,
    timeHorizon: '5_year' | '10_year' | '20_year' = '10_year'
  ): Promise<ClimateAdaptation> {
    const cacheKey = `climate_adaptation_${latitude}_${longitude}_${timeHorizon}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const adaptation = await this.generateClimateAdaptation(latitude, longitude, timeHorizon);
      await this.setCached(cacheKey, adaptation, 30 * 24 * 60 * 60); // 30 day cache
      return adaptation;

    } catch (error) {
      Logger.error('Failed to get climate adaptation', error);
      throw error;
    }
  }

  /**
   * Get weather-based timing recommendations for farm operations
   */
  async getOptimalTiming(
    operation: 'planting' | 'fertilizing' | 'spraying' | 'harvesting',
    cropType: string,
    latitude: number,
    longitude: number
  ): Promise<{
    optimalWindow: {
      start: Date;
      end: Date;
      confidence: number;
    };
    weatherRequirements: {
      temperature: { min: number; max: number };
      precipitation: { max: number; daysAfter: number };
      windSpeed: { max: number };
      humidity: { min?: number; max?: number };
    };
    riskFactors: string[];
    alternatives: {
      backup: Date;
      conditions: string;
    }[];
  }> {
    const cacheKey = `optimal_timing_${operation}_${cropType}_${latitude}_${longitude}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const timing = await this.calculateOptimalTiming(operation, cropType, latitude, longitude);
      await this.setCached(cacheKey, timing, 12 * 60 * 60); // 12 hour cache
      return timing;

    } catch (error) {
      Logger.error('Failed to get optimal timing', error);
      throw error;
    }
  }

  // Private implementation methods

  private async detectActivePatterns(latitude: number, longitude: number): Promise<WeatherPattern[]> {
    // Simulate pattern detection (in production would use real meteorological data)
    const patterns: WeatherPattern[] = [];

    // El Niño/La Niña detection
    const ninoIndex = this.simulateNinoIndex(); // Would fetch real ONI data
    if (Math.abs(ninoIndex) > 0.5) {
      patterns.push({
        id: `enso_${Date.now()}`,
        region: this.getClimateRegion(latitude, longitude),
        pattern: ninoIndex > 0 ? 'el_nino' : 'la_nina',
        confidence: Math.min(Math.abs(ninoIndex) / 2, 1),
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days future
        intensity: Math.abs(ninoIndex) > 1.5 ? 'strong' : Math.abs(ninoIndex) > 1 ? 'moderate' : 'weak',
        impact: {
          temperature: ninoIndex > 0 ? 2 : -1.5,
          precipitation: ninoIndex > 0 ? 15 : -20,
          humidity: ninoIndex > 0 ? 5 : -8,
          windSpeed: ninoIndex > 0 ? -2 : 3
        },
        cropImpacts: this.getCropImpacts(ninoIndex > 0 ? 'el_nino' : 'la_nina', latitude, longitude)
      });
    }

    // Drought pattern detection
    const droughtIndex = this.simulateDroughtIndex();
    if (droughtIndex < -1) {
      patterns.push({
        id: `drought_${Date.now()}`,
        region: this.getClimateRegion(latitude, longitude),
        pattern: 'drought',
        confidence: Math.min(Math.abs(droughtIndex) / 3, 1),
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        intensity: Math.abs(droughtIndex) > 2.5 ? 'strong' : Math.abs(droughtIndex) > 1.5 ? 'moderate' : 'weak',
        impact: {
          temperature: 3,
          precipitation: -40,
          humidity: -15,
          windSpeed: 5
        },
        cropImpacts: this.getCropImpacts('drought', latitude, longitude)
      });
    }

    return patterns;
  }

  private assessWeatherRisks(patterns: WeatherPattern[]): {
    overall: number;
    immediate: string[];
    seasonal: string[];
    annual: string[];
  } {
    let overallRisk = 0;
    const immediate: string[] = [];
    const seasonal: string[] = [];
    const annual: string[] = [];

    patterns.forEach(pattern => {
      const riskContribution = pattern.confidence * this.getPatternRiskScore(pattern.pattern);
      overallRisk += riskContribution;

      // Categorize risks by timeframe
      if (pattern.endDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) {
        immediate.push(...pattern.cropImpacts.flatMap(c => c.riskFactors));
      } else if (pattern.endDate.getTime() - Date.now() < 120 * 24 * 60 * 60 * 1000) {
        seasonal.push(...pattern.cropImpacts.flatMap(c => c.riskFactors));
      } else {
        annual.push(...pattern.cropImpacts.flatMap(c => c.riskFactors));
      }
    });

    return {
      overall: Math.min(overallRisk, 10),
      immediate: Array.from(new Set(immediate)),
      seasonal: Array.from(new Set(seasonal)),
      annual: Array.from(new Set(annual))
    };
  }

  private generateWeatherRecommendations(patterns: WeatherPattern[], riskAssessment: any): {
    immediate: string[];
    seasonal: string[];
    strategic: string[];
  } {
    const immediate: string[] = [];
    const seasonal: string[] = [];
    const strategic: string[] = [];

    patterns.forEach(pattern => {
      pattern.cropImpacts.forEach(cropImpact => {
        immediate.push(...cropImpact.mitigationStrategies.filter(s => s.includes('immediate') || s.includes('urgent')));
        seasonal.push(...cropImpact.mitigationStrategies.filter(s => s.includes('seasonal') || s.includes('adjust')));
        strategic.push(...cropImpact.mitigationStrategies.filter(s => s.includes('long-term') || s.includes('strategic')));
      });
    });

    // Add general recommendations based on risk level
    if (riskAssessment.overall > 7) {
      immediate.push('Implement emergency water conservation measures');
      immediate.push('Review crop insurance coverage');
    }

    return {
      immediate: Array.from(new Set(immediate)),
      seasonal: Array.from(new Set(seasonal)),
      strategic: Array.from(new Set(strategic))
    };
  }

  private async calculateHistoricalCorrelations(
    cropType: string,
    latitude: number,
    longitude: number,
    years: number
  ): Promise<HistoricalCorrelation[]> {
    // Simulate historical correlation analysis
    const correlations: HistoricalCorrelation[] = [
      {
        weatherMetric: 'Growing Degree Days',
        cropType,
        correlationCoefficient: 0.78,
        significance: 0.01,
        impactDescription: 'Strong positive correlation between accumulated heat units and yield',
        optimalRange: { min: 2400, max: 3200, unit: 'GDD' },
        historicalPerformance: this.generateHistoricalData('gdd', years)
      },
      {
        weatherMetric: 'July Precipitation',
        cropType,
        correlationCoefficient: 0.65,
        significance: 0.02,
        impactDescription: 'Moderate positive correlation with critical growth period moisture',
        optimalRange: { min: 3.5, max: 6.0, unit: 'inches' },
        historicalPerformance: this.generateHistoricalData('precipitation', years)
      },
      {
        weatherMetric: 'Heat Stress Days',
        cropType,
        correlationCoefficient: -0.72,
        significance: 0.001,
        impactDescription: 'Strong negative correlation with days above 90°F during pollination',
        optimalRange: { min: 0, max: 5, unit: 'days' },
        historicalPerformance: this.generateHistoricalData('heat_stress', years)
      }
    ];

    return correlations;
  }

  private async buildSeasonalForecast(
    latitude: number,
    longitude: number,
    season: string,
    year: number
  ): Promise<SeasonalForecast> {
    const baseDate = new Date(year, this.getSeasonStartMonth(season), 1);
    
    return {
      season: season as any,
      year,
      temperatureOutlook: {
        trend: 'above_normal',
        confidence: 0.65,
        averageTemp: this.getSeasonalNormal(latitude, season, 'temperature') + 1.5,
        extremeRisk: 0.3
      },
      precipitationOutlook: {
        trend: 'below_normal',
        confidence: 0.58,
        totalPrecipitation: this.getSeasonalNormal(latitude, season, 'precipitation') * 0.85,
        droughtRisk: 0.4,
        floodRisk: 0.1
      },
      growingConditions: {
        favorability: 6.5,
        keyRisks: ['Heat stress during pollination', 'Water deficit in July'],
        opportunities: ['Extended growing season', 'Early planting possible'],
        recommendedAdjustments: ['Select heat-tolerant varieties', 'Plan irrigation strategy']
      },
      criticalDates: {
        lastFrost: new Date(year, 3, 15), // April 15
        firstFrost: new Date(year, 9, 20), // October 20
        plantingWindow: {
          optimal: new Date(year, 4, 1), // May 1
          extended: {
            start: new Date(year, 3, 20), // April 20
            end: new Date(year, 4, 15) // May 15
          }
        },
        harvestWindow: {
          optimal: new Date(year, 8, 15), // September 15
          extended: {
            start: new Date(year, 8, 1), // September 1
            end: new Date(year, 9, 15) // October 15
          }
        }
      }
    };
  }

  private async generateClimateAdaptation(
    latitude: number,
    longitude: number,
    timeHorizon: string
  ): Promise<ClimateAdaptation> {
    const years = timeHorizon === '5_year' ? 5 : timeHorizon === '10_year' ? 10 : 20;
    
    return {
      region: this.getClimateRegion(latitude, longitude),
      timeHorizon: timeHorizon as any,
      trends: {
        temperature: {
          change: 0.3, // degrees per decade
          seasonalVariation: 1.2,
          extremeEvents: 1.4
        },
        precipitation: {
          change: -2, // percentage per decade
          seasonalShift: 5, // days earlier
          intensityChange: 8 // more intense events
        },
        growingSeason: {
          lengthChange: 3, // days per decade
          heatStress: 2, // additional days per decade
          waterStress: 4 // additional days per decade
        }
      },
      adaptationStrategies: {
        cropSelection: [
          'Shift to heat-tolerant varieties',
          'Diversify crop portfolio',
          'Consider alternative crops'
        ],
        plantingTiming: [
          'Plant 7-10 days earlier',
          'Use season extenders',
          'Stagger plantings'
        ],
        irrigation: [
          'Install efficient irrigation systems',
          'Implement soil moisture monitoring',
          'Use drought-tolerant rootstocks'
        ],
        soilManagement: [
          'Increase organic matter',
          'Use cover crops',
          'Implement conservation tillage'
        ],
        riskManagement: [
          'Diversify revenue streams',
          'Upgrade crop insurance',
          'Build climate resilience fund'
        ]
      },
      economicImpact: {
        yieldChange: -5 * (years / 10), // percentage over time horizon
        costChange: 15 * (years / 10), // percentage over time horizon
        riskChange: 25 * (years / 10), // percentage over time horizon
        adaptationCost: 150, // dollars per acre
        benefitCostRatio: 2.3
      }
    };
  }

  private async calculateOptimalTiming(
    operation: string,
    cropType: string,
    latitude: number,
    longitude: number
  ): Promise<any> {
    const now = new Date();
    const optimalStart = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now
    const optimalEnd = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // 3 weeks from now

    const requirements: Record<string, any> = {
      planting: {
        temperature: { min: 50, max: 85 },
        precipitation: { max: 0.1, daysAfter: 3 },
        windSpeed: { max: 15 },
        humidity: { min: 40, max: 90 }
      },
      fertilizing: {
        temperature: { min: 32, max: 90 },
        precipitation: { max: 0.5, daysAfter: 2 },
        windSpeed: { max: 10 }
      },
      spraying: {
        temperature: { min: 45, max: 85 },
        precipitation: { max: 0, daysAfter: 6 },
        windSpeed: { max: 8 },
        humidity: { min: 40, max: 85 }
      },
      harvesting: {
        temperature: { min: 40, max: 95 },
        precipitation: { max: 0.1, daysAfter: 1 },
        windSpeed: { max: 20 }
      }
    };

    return {
      optimalWindow: {
        start: optimalStart,
        end: optimalEnd,
        confidence: 0.75
      },
      weatherRequirements: requirements[operation] || requirements.planting,
      riskFactors: [
        'Potential thunderstorms mid-week',
        'High humidity may affect application',
        'Wind speeds could exceed limits on Tuesday'
      ],
      alternatives: [
        {
          backup: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
          conditions: 'If current window unavailable due to precipitation'
        }
      ]
    };
  }

  // Helper methods

  private simulateNinoIndex(): number {
    // Simulate ONI (Oceanic Niño Index) - normally would fetch from NOAA
    return (Math.random() - 0.5) * 4; // Range -2 to +2
  }

  private simulateDroughtIndex(): number {
    // Simulate PDSI (Palmer Drought Severity Index)
    return (Math.random() - 0.6) * 6; // Bias toward normal/dry conditions
  }

  private getClimateRegion(latitude: number, longitude: number): string {
    if (latitude >= 40 && latitude <= 45 && longitude >= -100 && longitude <= -80) {
      return 'Midwest Corn Belt';
    } else if (latitude >= 30 && latitude <= 40 && longitude >= -85 && longitude <= -75) {
      return 'Southeast';
    } else if (latitude >= 35 && latitude <= 45 && longitude >= -105 && longitude <= -95) {
      return 'Great Plains';
    }
    return 'Unknown Region';
  }

  private getPatternRiskScore(pattern: string): number {
    const scores: Record<string, number> = {
      'drought': 3.5,
      'excessive_moisture': 2.8,
      'heat_dome': 3.2,
      'el_nino': 2.0,
      'la_nina': 2.5,
      'polar_vortex': 2.2,
      'neutral': 1.0
    };
    return scores[pattern] || 1.5;
  }

  private getCropImpacts(pattern: string, latitude: number, longitude: number): any[] {
    const impacts: Record<string, any[]> = {
      'el_nino': [
        {
          cropType: 'corn',
          yieldImpact: 5,
          qualityImpact: 3,
          riskFactors: ['Excessive moisture', 'Disease pressure'],
          mitigationStrategies: ['Improve drainage', 'Monitor for disease', 'Adjust harvest timing']
        }
      ],
      'la_nina': [
        {
          cropType: 'corn',
          yieldImpact: -8,
          qualityImpact: -5,
          riskFactors: ['Drought stress', 'Heat stress', 'Reduced pollination'],
          mitigationStrategies: ['Implement irrigation', 'Select drought-tolerant varieties', 'Monitor soil moisture']
        }
      ],
      'drought': [
        {
          cropType: 'corn',
          yieldImpact: -15,
          qualityImpact: -10,
          riskFactors: ['Water stress', 'Heat stress', 'Reduced plant stands'],
          mitigationStrategies: ['Emergency irrigation', 'Crop insurance claims', 'Consider early harvest']
        }
      ]
    };

    return impacts[pattern] || [];
  }

  private generateHistoricalData(metric: string, years: number): any[] {
    const data = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < years; i++) {
      const year = currentYear - i;
      let weatherValue, yieldValue;
      
      switch (metric) {
        case 'gdd':
          weatherValue = 2400 + Math.random() * 800;
          yieldValue = 140 + (weatherValue - 2400) * 0.08 + Math.random() * 20;
          break;
        case 'precipitation':
          weatherValue = 2 + Math.random() * 6;
          yieldValue = 120 + Math.max(0, (6 - Math.abs(weatherValue - 4.5)) * 15) + Math.random() * 15;
          break;
        case 'heat_stress':
          weatherValue = Math.random() * 12;
          yieldValue = 180 - weatherValue * 8 + Math.random() * 15;
          break;
        default:
          weatherValue = Math.random() * 100;
          yieldValue = 150 + Math.random() * 30;
      }
      
      data.push({
        year,
        weatherValue: Math.round(weatherValue * 10) / 10,
        yieldValue: Math.round(yieldValue * 10) / 10,
        quality: Math.round((85 + Math.random() * 15) * 10) / 10
      });
    }
    
    return data.sort((a, b) => a.year - b.year);
  }

  private getSeasonStartMonth(season: string): number {
    const months: Record<string, number> = {
      'spring': 2, // March
      'summer': 5, // June
      'fall': 8,   // September
      'winter': 11 // December
    };
    return months[season] || 2;
  }

  private getSeasonalNormal(latitude: number, season: string, metric: 'temperature' | 'precipitation'): number {
    // Simplified seasonal normals (would use actual climatology data)
    if (metric === 'temperature') {
      const temps: Record<string, number> = {
        'spring': 55,
        'summer': 75,
        'fall': 60,
        'winter': 35
      };
      return temps[season] || 60;
    } else {
      const precip: Record<string, number> = {
        'spring': 12,
        'summer': 14,
        'fall': 10,
        'winter': 8
      };
      return precip[season] || 11;
    }
  }

  private async getCached(key: string): Promise<any> {
    try {
      return await redis.get(key);
    } catch (error) {
      return null;
    }
  }

  private async setCached(key: string, data: any, ttl: number = this.CACHE_TTL): Promise<void> {
    try {
      await redis.set(key, data, { ex: ttl });
    } catch (error) {
      Logger.warn(`Failed to cache data for key: ${key}`, error);
    }
  }
}

export const weatherPatternAnalysis = new WeatherPatternAnalysisService();