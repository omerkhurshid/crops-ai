/**
 * Historical Weather Analysis Service
 * 
 * Provides comprehensive historical weather data analysis for agricultural
 * planning, crop selection, and climate trend monitoring.
 */

import { weatherService, CurrentWeather, WeatherForecast } from './service';
import { weatherAggregator, AggregatedWeatherData } from './aggregator';

export interface HistoricalWeatherData {
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  statistics: {
    temperature: HistoricalStatistics;
    precipitation: HistoricalStatistics;
    humidity: HistoricalStatistics;
    windSpeed: HistoricalStatistics;
  };
  trends: {
    temperatureTrend: TrendAnalysis;
    precipitationTrend: TrendAnalysis;
    seasonalPatterns: SeasonalPattern[];
  };
  extremeEvents: ExtremeEvent[];
  climateSummary: ClimateSummary;
  agricultureInsights: AgricultureInsights;
}

export interface HistoricalStatistics {
  mean: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
  percentiles: {
    p10: number;
    p25: number;
    p75: number;
    p90: number;
  };
  monthlyAverages: MonthlyData[];
  yearlyAverages: YearlyData[];
}

export interface TrendAnalysis {
  slope: number; // Change per year
  correlation: number; // -1 to 1
  significance: 'high' | 'moderate' | 'low' | 'none';
  direction: 'increasing' | 'decreasing' | 'stable';
  description: string;
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  averageTemperature: number;
  totalPrecipitation: number;
  typicalWeatherPattern: string;
  agriculturalRecommendations: string[];
}

export interface ExtremeEvent {
  date: string;
  type: 'heatwave' | 'coldsnap' | 'drought' | 'flood' | 'storm';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  duration: number; // days
  description: string;
  impact: string;
  returnPeriod: number; // years (estimated)
}

export interface ClimateSummary {
  climateZone: string;
  averageAnnualTemperature: number;
  averageAnnualPrecipitation: number;
  growingSeason: {
    startDate: string; // MM-DD format
    endDate: string;
    lengthDays: number;
  };
  frostDates: {
    lastSpringFrost: string; // MM-DD format
    firstAutumnFrost: string;
    frostFreeDays: number;
  };
  heatingCoolingDegrees: {
    heatingDegreeDays: number; // base 18°C
    coolingDegreeDays: number; // base 18°C
  };
}

export interface AgricultureInsights {
  suitableCrops: string[];
  plantingRecommendations: {
    crop: string;
    plantingWindow: string;
    harvestWindow: string;
    riskFactors: string[];
  }[];
  irrigationNeeds: {
    season: string;
    averageNeed: number; // mm/month
    peakMonth: string;
  }[];
  climateChallenges: string[];
  adaptationStrategies: string[];
}

export interface MonthlyData {
  month: number;
  value: number;
  standardDeviation?: number;
}

export interface YearlyData {
  year: number;
  value: number;
}

class HistoricalWeatherService {
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CACHE_PREFIX = 'historical_weather_';

  /**
   * Get comprehensive historical weather analysis
   */
  async getHistoricalAnalysis(
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalWeatherData | null> {
    try {
      // For demonstration, simulate historical data using current weather patterns
      // In production, this would query actual historical weather databases
      const [currentWeather, forecast] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getWeatherForecast(latitude, longitude, 30) // Extended forecast
      ]);

      if (!currentWeather || !forecast.length) {
        return null;
      }

      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate simulated historical data based on current patterns
      const historicalData = this.generateSimulatedHistoricalData(
        currentWeather,
        forecast,
        startDate,
        endDate,
        totalDays
      );

      // Analyze the data
      const statistics = this.calculateHistoricalStatistics(historicalData);
      const trends = this.analyzeTrends(historicalData, totalDays);
      const extremeEvents = this.identifyExtremeEvents(historicalData);
      const climateSummary = this.generateClimateSummary(statistics, latitude);
      const agricultureInsights = this.generateAgricultureInsights(statistics, climateSummary, latitude);

      return {
        location: {
          latitude,
          longitude,
          name: currentWeather.location.name
        },
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalDays
        },
        statistics,
        trends,
        extremeEvents,
        climateSummary,
        agricultureInsights
      };

    } catch (error) {
      console.error('Error getting historical analysis:', error);
      return null;
    }
  }

  /**
   * Get climate normals (30-year averages)
   */
  async getClimateNormals(
    latitude: number,
    longitude: number
  ): Promise<{
    temperature: MonthlyData[];
    precipitation: MonthlyData[];
    growingSeason: ClimateSummary['growingSeason'];
    frostDates: ClimateSummary['frostDates'];
  } | null> {
    try {
      // Simulate 30-year climate normals
      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear() - 30, 0, 1);
      
      const analysis = await this.getHistoricalAnalysis(latitude, longitude, startDate, endDate);
      
      if (!analysis) {
        return null;
      }

      return {
        temperature: analysis.statistics.temperature.monthlyAverages,
        precipitation: analysis.statistics.precipitation.monthlyAverages,
        growingSeason: analysis.climateSummary.growingSeason,
        frostDates: analysis.climateSummary.frostDates
      };

    } catch (error) {
      console.error('Error getting climate normals:', error);
      return null;
    }
  }

  /**
   * Compare current year with historical averages
   */
  async compareWithHistorical(
    latitude: number,
    longitude: number,
    year: number = new Date().getFullYear()
  ): Promise<{
    currentYear: YearlyData;
    historicalAverage: YearlyData;
    comparison: {
      temperatureDifference: number;
      precipitationDifference: number;
      percentileRanking: {
        temperature: number; // 0-100
        precipitation: number; // 0-100
      };
      assessment: 'much_above' | 'above' | 'near_normal' | 'below' | 'much_below';
    };
    monthlyComparison: {
      month: number;
      temperatureDifference: number;
      precipitationDifference: number;
    }[];
  } | null> {
    try {
      // Get current year data
      const currentYearStart = new Date(year, 0, 1);
      const currentYearEnd = new Date(year, 11, 31);
      
      // Get historical baseline (previous 30 years)
      const historicalStart = new Date(year - 30, 0, 1);
      const historicalEnd = new Date(year - 1, 11, 31);

      const [currentAnalysis, historicalAnalysis] = await Promise.all([
        this.getHistoricalAnalysis(latitude, longitude, currentYearStart, currentYearEnd),
        this.getHistoricalAnalysis(latitude, longitude, historicalStart, historicalEnd)
      ]);

      if (!currentAnalysis || !historicalAnalysis) {
        return null;
      }

      const tempDiff = currentAnalysis.statistics.temperature.mean - historicalAnalysis.statistics.temperature.mean;
      const precipDiff = currentAnalysis.statistics.precipitation.mean - historicalAnalysis.statistics.precipitation.mean;

      // Calculate percentile rankings
      const tempPercentile = this.calculatePercentileRanking(
        currentAnalysis.statistics.temperature.mean,
        historicalAnalysis.statistics.temperature
      );
      const precipPercentile = this.calculatePercentileRanking(
        currentAnalysis.statistics.precipitation.mean,
        historicalAnalysis.statistics.precipitation
      );

      const assessment = this.assessClimateDeviation(tempPercentile, precipPercentile);

      // Monthly comparison
      const monthlyComparison = currentAnalysis.statistics.temperature.monthlyAverages.map((current, index) => {
        const historical = historicalAnalysis.statistics.temperature.monthlyAverages[index];
        const historicalPrecip = historicalAnalysis.statistics.precipitation.monthlyAverages[index];
        const currentPrecip = currentAnalysis.statistics.precipitation.monthlyAverages[index];
        
        return {
          month: current.month,
          temperatureDifference: current.value - historical.value,
          precipitationDifference: currentPrecip.value - historicalPrecip.value
        };
      });

      return {
        currentYear: {
          year,
          value: currentAnalysis.statistics.temperature.mean
        },
        historicalAverage: {
          year: year - 15, // Mid-point of historical period
          value: historicalAnalysis.statistics.temperature.mean
        },
        comparison: {
          temperatureDifference: tempDiff,
          precipitationDifference: precipDiff,
          percentileRanking: {
            temperature: tempPercentile,
            precipitation: precipPercentile
          },
          assessment
        },
        monthlyComparison
      };

    } catch (error) {
      console.error('Error comparing with historical data:', error);
      return null;
    }
  }

  private generateSimulatedHistoricalData(
    current: CurrentWeather,
    forecast: WeatherForecast[],
    startDate: Date,
    endDate: Date,
    totalDays: number
  ): any[] {
    const data = [];
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfYear = this.getDayOfYear(date);
      
      // Simulate seasonal temperature variation
      const seasonalTemp = 15 + 10 * Math.sin((dayOfYear - 80) * 2 * Math.PI / 365);
      const randomVariation = (Math.random() - 0.5) * 10;
      const temperature = seasonalTemp + randomVariation;
      
      // Simulate precipitation patterns
      const precipitation = Math.random() < 0.3 ? Math.random() * 20 : 0;
      
      // Simulate other variables
      const humidity = 50 + Math.random() * 30;
      const windSpeed = 2 + Math.random() * 8;
      
      data.push({
        date: date.toISOString(),
        temperature,
        precipitation,
        humidity,
        windSpeed
      });
    }
    
    return data;
  }

  private calculateHistoricalStatistics(data: any[]): any {
    const temperatures = data.map(d => d.temperature);
    const precipitations = data.map(d => d.precipitation);
    const humidities = data.map(d => d.humidity);
    const windSpeeds = data.map(d => d.windSpeed);

    return {
      temperature: this.calculateStatistics(temperatures),
      precipitation: this.calculateStatistics(precipitations),
      humidity: this.calculateStatistics(humidities),
      windSpeed: this.calculateStatistics(windSpeeds)
    };
  }

  private calculateStatistics(values: number[]): HistoricalStatistics {
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    
    // Calculate monthly averages (simplified)
    const monthlyAverages: MonthlyData[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthValues = values.slice((month - 1) * Math.floor(n / 12), month * Math.floor(n / 12));
      const monthMean = monthValues.reduce((a, b) => a + b, 0) / monthValues.length;
      monthlyAverages.push({ month, value: monthMean });
    }

    // Calculate yearly averages (simplified)
    const yearlyAverages: YearlyData[] = [];
    const years = Math.ceil(n / 365);
    for (let i = 0; i < years; i++) {
      const yearValues = values.slice(i * 365, (i + 1) * 365);
      if (yearValues.length > 0) {
        const yearMean = yearValues.reduce((a, b) => a + b, 0) / yearValues.length;
        yearlyAverages.push({ year: 2020 + i, value: yearMean });
      }
    }

    return {
      mean,
      median: sorted[Math.floor(n / 2)],
      min: Math.min(...values),
      max: Math.max(...values),
      standardDeviation: Math.sqrt(variance),
      percentiles: {
        p10: sorted[Math.floor(n * 0.1)],
        p25: sorted[Math.floor(n * 0.25)],
        p75: sorted[Math.floor(n * 0.75)],
        p90: sorted[Math.floor(n * 0.9)]
      },
      monthlyAverages,
      yearlyAverages
    };
  }

  private analyzeTrends(data: any[], totalDays: number): any {
    const temperatures = data.map(d => d.temperature);
    const precipitations = data.map(d => d.precipitation);
    
    const tempTrend = this.calculateTrend(temperatures);
    const precipTrend = this.calculateTrend(precipitations);
    
    const seasonalPatterns = this.analyzeSeasonalPatterns(data);

    return {
      temperatureTrend: tempTrend,
      precipitationTrend: precipTrend,
      seasonalPatterns
    };
  }

  private calculateTrend(values: number[]): TrendAnalysis {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
    
    const slope = denominator === 0 ? 0 : numerator / denominator;
    
    // Calculate correlation coefficient
    const correlation = this.calculateCorrelation(x, y);
    
    const significance = Math.abs(correlation) > 0.7 ? 'high' :
                       Math.abs(correlation) > 0.5 ? 'moderate' :
                       Math.abs(correlation) > 0.3 ? 'low' : 'none';
    
    const direction = slope > 0.1 ? 'increasing' :
                     slope < -0.1 ? 'decreasing' : 'stable';
    
    const description = `${direction} trend with ${significance} statistical significance`;

    return {
      slope: slope * 365, // Convert to per-year change
      correlation,
      significance,
      direction,
      description
    };
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
    const xVariance = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
    const yVariance = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    
    const denominator = Math.sqrt(xVariance * yVariance);
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private analyzeSeasonalPatterns(data: any[]): SeasonalPattern[] {
    const seasons = [
      { name: 'spring', months: [3, 4, 5] },
      { name: 'summer', months: [6, 7, 8] },
      { name: 'autumn', months: [9, 10, 11] },
      { name: 'winter', months: [12, 1, 2] }
    ];

    return seasons.map(season => {
      const seasonData = data.filter(d => {
        const month = new Date(d.date).getMonth() + 1;
        return season.months.includes(month);
      });

      const avgTemp = seasonData.reduce((sum, d) => sum + d.temperature, 0) / seasonData.length;
      const totalPrecip = seasonData.reduce((sum, d) => sum + d.precipitation, 0);

      return {
        season: season.name as 'spring' | 'summer' | 'autumn' | 'winter',
        averageTemperature: avgTemp,
        totalPrecipitation: totalPrecip,
        typicalWeatherPattern: this.describeSeasonalPattern(season.name, avgTemp, totalPrecip),
        agriculturalRecommendations: this.getSeasonalRecommendations(season.name as any, avgTemp, totalPrecip)
      };
    });
  }

  private identifyExtremeEvents(data: any[]): ExtremeEvent[] {
    const events: ExtremeEvent[] = [];
    
    // Identify heatwaves (5+ consecutive days above 35°C)
    let heatwaveDays = 0;
    let heatwaveStart = '';
    
    data.forEach((day, index) => {
      if (day.temperature > 35) {
        if (heatwaveDays === 0) {
          heatwaveStart = day.date;
        }
        heatwaveDays++;
      } else {
        if (heatwaveDays >= 5) {
          events.push({
            date: heatwaveStart,
            type: 'heatwave',
            severity: heatwaveDays > 10 ? 'extreme' : heatwaveDays > 7 ? 'severe' : 'moderate',
            duration: heatwaveDays,
            description: `Heatwave lasting ${heatwaveDays} days`,
            impact: 'High temperatures may stress crops and increase irrigation needs',
            returnPeriod: this.estimateReturnPeriod('heatwave', heatwaveDays)
          });
        }
        heatwaveDays = 0;
      }
    });

    // Identify drought periods (14+ consecutive days without precipitation)
    let droughtDays = 0;
    let droughtStart = '';
    
    data.forEach(day => {
      if (day.precipitation < 1) {
        if (droughtDays === 0) {
          droughtStart = day.date;
        }
        droughtDays++;
      } else {
        if (droughtDays >= 14) {
          events.push({
            date: droughtStart,
            type: 'drought',
            severity: droughtDays > 60 ? 'extreme' : droughtDays > 30 ? 'severe' : 'moderate',
            duration: droughtDays,
            description: `Drought period lasting ${droughtDays} days`,
            impact: 'Extended dry period increases irrigation requirements',
            returnPeriod: this.estimateReturnPeriod('drought', droughtDays)
          });
        }
        droughtDays = 0;
      }
    });

    return events.slice(0, 10); // Return top 10 events
  }

  private generateClimateSummary(statistics: any, latitude: number): ClimateSummary {
    const climateZone = this.determineClimateZone(statistics.temperature.mean, latitude);
    
    return {
      climateZone,
      averageAnnualTemperature: statistics.temperature.mean,
      averageAnnualPrecipitation: statistics.precipitation.mean * 365,
      growingSeason: {
        startDate: '03-15', // Simplified
        endDate: '10-15',
        lengthDays: 214
      },
      frostDates: {
        lastSpringFrost: '03-15',
        firstAutumnFrost: '11-15',
        frostFreeDays: 245
      },
      heatingCoolingDegrees: {
        heatingDegreeDays: this.calculateHeatingDegreeDays(statistics.temperature.monthlyAverages),
        coolingDegreeDays: this.calculateCoolingDegreeDays(statistics.temperature.monthlyAverages)
      }
    };
  }

  private generateAgricultureInsights(statistics: any, climate: ClimateSummary, latitude: number): AgricultureInsights {
    const suitableCrops = this.determineSuitableCrops(climate, latitude);
    const plantingRecommendations = this.generatePlantingRecommendations(suitableCrops, climate);
    const irrigationNeeds = this.calculateIrrigationNeeds(statistics);
    const climateChallenges = this.identifyClimateChallenges(statistics, climate);
    const adaptationStrategies = this.suggestAdaptationStrategies(climateChallenges);

    return {
      suitableCrops,
      plantingRecommendations,
      irrigationNeeds,
      climateChallenges,
      adaptationStrategies
    };
  }

  // Helper methods
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private calculatePercentileRanking(value: number, statistics: HistoricalStatistics): number {
    // Simplified percentile calculation
    if (value <= statistics.percentiles.p10) return 10;
    if (value <= statistics.percentiles.p25) return 25;
    if (value <= statistics.median) return 50;
    if (value <= statistics.percentiles.p75) return 75;
    if (value <= statistics.percentiles.p90) return 90;
    return 95;
  }

  private assessClimateDeviation(tempPercentile: number, precipPercentile: number): any {
    const avgPercentile = (tempPercentile + precipPercentile) / 2;
    
    if (avgPercentile >= 90) return 'much_above';
    if (avgPercentile >= 75) return 'above';
    if (avgPercentile >= 25) return 'near_normal';
    if (avgPercentile >= 10) return 'below';
    return 'much_below';
  }

  private describeSeasonalPattern(season: string, temp: number, precip: number): string {
    if (season === 'summer' && temp > 30) return 'Hot and dry summer';
    if (season === 'winter' && temp < 5) return 'Cold winter with moderate precipitation';
    if (season === 'spring' && precip > 100) return 'Wet spring with moderate temperatures';
    return `Typical ${season} weather patterns`;
  }

  private getSeasonalRecommendations(season: 'spring' | 'summer' | 'autumn' | 'winter', temp: number, precip: number): string[] {
    const recommendations: Record<string, string[]> = {
      spring: ['Prepare seedbeds', 'Plant cool-season crops', 'Monitor for late frosts'],
      summer: ['Increase irrigation', 'Provide shade for sensitive crops', 'Monitor for heat stress'],
      autumn: ['Harvest summer crops', 'Plant cover crops', 'Prepare for winter'],
      winter: ['Protect plants from frost', 'Plan next season', 'Maintain equipment']
    };
    
    return recommendations[season] || [];
  }

  private estimateReturnPeriod(eventType: string, duration: number): number {
    // Simplified return period estimation
    const basePeriods = {
      heatwave: { 5: 2, 7: 5, 10: 10, 15: 25 },
      drought: { 14: 2, 30: 5, 60: 10, 90: 25 }
    };
    
    const periods = basePeriods[eventType as keyof typeof basePeriods];
    const durations = Object.keys(periods).map(Number).sort((a, b) => a - b);
    
    for (const d of durations) {
      if (duration <= d) {
        return periods[d as keyof typeof periods];
      }
    }
    
    return 50; // Very rare event
  }

  private determineClimateZone(avgTemp: number, latitude: number): string {
    if (Math.abs(latitude) < 23.5) return 'Tropical';
    if (Math.abs(latitude) < 35) return 'Subtropical';
    if (avgTemp > 20) return 'Warm temperate';
    if (avgTemp > 10) return 'Cool temperate';
    return 'Cold temperate';
  }

  private calculateHeatingDegreeDays(monthlyTemps: MonthlyData[]): number {
    return monthlyTemps.reduce((sum, month) => {
      return sum + Math.max(0, 18 - month.value) * 30; // Approximate days per month
    }, 0);
  }

  private calculateCoolingDegreeDays(monthlyTemps: MonthlyData[]): number {
    return monthlyTemps.reduce((sum, month) => {
      return sum + Math.max(0, month.value - 18) * 30; // Approximate days per month
    }, 0);
  }

  private determineSuitableCrops(climate: ClimateSummary, latitude: number): string[] {
    const crops: string[] = [];
    
    if (climate.averageAnnualTemperature > 20) {
      crops.push('tomatoes', 'peppers', 'corn', 'beans');
    }
    if (climate.averageAnnualTemperature > 15) {
      crops.push('wheat', 'barley', 'potatoes');
    }
    if (climate.frostDates.frostFreeDays > 200) {
      crops.push('soybeans', 'cotton');
    }
    if (climate.averageAnnualPrecipitation > 500) {
      crops.push('rice', 'leafy greens');
    }
    
    return crops;
  }

  private generatePlantingRecommendations(crops: string[], climate: ClimateSummary): any[] {
    return crops.slice(0, 5).map(crop => ({
      crop,
      plantingWindow: this.getPlantingWindow(crop, climate),
      harvestWindow: this.getHarvestWindow(crop, climate),
      riskFactors: this.getCropRiskFactors(crop, climate)
    }));
  }

  private getPlantingWindow(crop: string, climate: ClimateSummary): string {
    const plantingWindows: Record<string, string> = {
      tomatoes: 'Late spring after last frost',
      wheat: 'Early autumn',
      corn: 'Late spring',
      potatoes: 'Early spring',
      rice: 'Late spring'
    };
    
    return plantingWindows[crop] || 'Spring to early summer';
  }

  private getHarvestWindow(crop: string, climate: ClimateSummary): string {
    const harvestWindows: Record<string, string> = {
      tomatoes: 'Mid to late summer',
      wheat: 'Early summer',
      corn: 'Late summer to early autumn',
      potatoes: 'Late summer',
      rice: 'Autumn'
    };
    
    return harvestWindows[crop] || 'Late summer to autumn';
  }

  private getCropRiskFactors(crop: string, climate: ClimateSummary): string[] {
    const riskFactors: Record<string, string[]> = {
      tomatoes: ['Late frost', 'Heat waves', 'Fungal diseases'],
      wheat: ['Drought', 'Disease pressure', 'Extreme temperatures'],
      corn: ['Drought stress', 'Wind damage', 'Heat stress'],
      potatoes: ['Late blight', 'Frost damage', 'Excessive moisture'],
      rice: ['Flooding', 'Drought', 'Disease pressure']
    };
    
    return riskFactors[crop] || ['Weather variability', 'Pest pressure'];
  }

  private calculateIrrigationNeeds(statistics: any): any[] {
    return [
      { season: 'Spring', averageNeed: 50, peakMonth: 'May' },
      { season: 'Summer', averageNeed: 100, peakMonth: 'July' },
      { season: 'Autumn', averageNeed: 30, peakMonth: 'September' },
      { season: 'Winter', averageNeed: 10, peakMonth: 'December' }
    ];
  }

  private identifyClimateChallenges(statistics: any, climate: ClimateSummary): string[] {
    const challenges: string[] = [];
    
    if (climate.averageAnnualPrecipitation < 400) {
      challenges.push('Water scarcity requiring efficient irrigation');
    }
    if (climate.averageAnnualTemperature > 25) {
      challenges.push('Heat stress on crops during summer months');
    }
    if (climate.frostDates.frostFreeDays < 180) {
      challenges.push('Short growing season limiting crop selection');
    }
    
    return challenges;
  }

  private suggestAdaptationStrategies(challenges: string[]): string[] {
    const strategies: string[] = [];
    
    if (challenges.some(c => c.includes('water'))) {
      strategies.push('Implement drip irrigation systems', 'Select drought-resistant varieties');
    }
    if (challenges.some(c => c.includes('heat'))) {
      strategies.push('Use shade covers', 'Adjust planting dates', 'Improve soil organic matter');
    }
    if (challenges.some(c => c.includes('growing season'))) {
      strategies.push('Use season extension techniques', 'Select early-maturing varieties');
    }
    
    return strategies;
  }
}

export const historicalWeather = new HistoricalWeatherService();