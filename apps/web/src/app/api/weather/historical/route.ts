import { NextRequest } from 'next/server';
import { z } from 'zod';
import { historicalWeather } from '../../../../lib/weather/historical';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';

const historicalSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(['analysis', 'normals', 'comparison']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  year: z.number().min(1900).max(2100).optional(),
});

// GET /api/weather/historical?latitude=40.7128&longitude=-74.0060&type=analysis
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const latitude = parseFloat(searchParams.get('latitude') || '');
      const longitude = parseFloat(searchParams.get('longitude') || '');
      const type = searchParams.get('type') || 'analysis';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

      // Validate input
      const validation = historicalSchema.safeParse({
        latitude,
        longitude,
        type,
        startDate,
        endDate,
        year
      });

      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const params = validation.data;
      let result;

      switch (type) {
        case 'analysis':
          {
            // Default to last 5 years if no dates provided
            const defaultEndDate = endDate ? new Date(endDate) : new Date();
            const defaultStartDate = startDate ? new Date(startDate) : new Date(defaultEndDate.getFullYear() - 5, 0, 1);
            
            result = await historicalWeather.getHistoricalAnalysis(
              latitude,
              longitude,
              defaultStartDate,
              defaultEndDate
            );
          }
          break;

        case 'normals':
          result = await historicalWeather.getClimateNormals(latitude, longitude);
          break;

        case 'comparison':
          {
            const comparisonYear = year || new Date().getFullYear();
            result = await historicalWeather.compareWithHistorical(latitude, longitude, comparisonYear);
          }
          break;

        default:
          throw new ValidationError('Invalid historical analysis type');
      }

      if (!result) {
        throw new Error('Unable to generate historical weather analysis for the specified parameters');
      }

      // Generate summary based on type
      const summary = type === 'analysis' && (result as any).statistics
        ? {
            analysisType: 'comprehensive',
            period: `${(result as any).period.totalDays} days`,
            temperatureRange: `${(result as any).statistics.temperature.min.toFixed(1)}°C to ${(result as any).statistics.temperature.max.toFixed(1)}°C`,
            averageTemperature: `${(result as any).statistics.temperature.mean.toFixed(1)}°C`,
            totalPrecipitation: `${((result as any).statistics.precipitation.mean * (result as any).period.totalDays).toFixed(1)}mm`,
            extremeEventsCount: (result as any).extremeEvents.length,
            climateZone: (result as any).climateSummary.climateZone,
            suitableCropsCount: (result as any).agricultureInsights.suitableCrops.length
          }
        : type === 'normals' && (result as any).temperature
        ? {
            analysisType: 'climate_normals',
            period: '30-year averages',
            temperatureRange: `${Math.min(...(result as any).temperature.map((m: any) => m.value)).toFixed(1)}°C to ${Math.max(...(result as any).temperature.map((m: any) => m.value)).toFixed(1)}°C`,
            growingSeasonLength: `${(result as any).growingSeason.lengthDays} days`,
            frostFreeDays: (result as any).frostDates.frostFreeDays
          }
        : type === 'comparison' && (result as any).comparison
        ? {
            analysisType: 'historical_comparison',
            comparisonYear: (result as any).currentYear.year,
            temperatureDeviation: `${(result as any).comparison.temperatureDifference > 0 ? '+' : ''}${(result as any).comparison.temperatureDifference.toFixed(1)}°C`,
            precipitationDeviation: `${(result as any).comparison.precipitationDifference > 0 ? '+' : ''}${(result as any).comparison.precipitationDifference.toFixed(1)}mm`,
            temperaturePercentile: `${(result as any).comparison.percentileRanking.temperature}th percentile`,
            precipitationPercentile: `${(result as any).comparison.percentileRanking.precipitation}th percentile`,
            assessment: (result as any).comparison.assessment
          }
        : null;

      return createSuccessResponse({
        data: result,
        summary,
        type,
        location: { latitude, longitude },
        parameters: {
          startDate: startDate || 'auto',
          endDate: endDate || 'auto',
          comparisonYear: year,
          analysisPeriod: type === 'analysis' ? 
            (startDate && endDate ? 'custom' : 'default_5_years') : 
            type === 'normals' ? '30_year_normals' : 'current_year'
        },
        message: `Historical weather ${type} completed successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);