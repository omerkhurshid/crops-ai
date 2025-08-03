import { NextRequest } from 'next/server';
import { z } from 'zod';
import { weatherAggregator } from '../../../../lib/weather/aggregator';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';

const aggregateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  intervalHours: z.number().min(1).max(24).optional(),
  type: z.enum(['aggregated', 'hourly', 'field', 'irrigation']).optional(),
  // For field analysis
  fieldBoundary: z.array(z.object({
    latitude: z.number(),
    longitude: z.number()
  })).optional(),
  // For irrigation recommendations
  cropType: z.string().optional(),
  soilType: z.enum(['sandy', 'medium', 'clay']).optional(),
});

// GET /api/weather/aggregate?latitude=40.7128&longitude=-74.0060&type=aggregated
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const latitude = parseFloat(searchParams.get('latitude') || '');
      const longitude = parseFloat(searchParams.get('longitude') || '');
      const type = searchParams.get('type') || 'aggregated';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const intervalHours = parseInt(searchParams.get('intervalHours') || '1');
      const cropType = searchParams.get('cropType') || 'general';
      const soilType = searchParams.get('soilType') || 'medium';
      
      // Parse field boundary if provided
      const fieldBoundaryParam = searchParams.get('fieldBoundary');
      let fieldBoundary;
      if (fieldBoundaryParam) {
        try {
          fieldBoundary = JSON.parse(fieldBoundaryParam);
        } catch {
          throw new ValidationError('Invalid fieldBoundary format. Must be valid JSON array.');
        }
      }

      // Validate input
      const validation = aggregateSchema.safeParse({
        latitude,
        longitude,
        startDate,
        endDate,
        intervalHours,
        type,
        fieldBoundary,
        cropType,
        soilType
      });

      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const params = validation.data;

      // Set default date range if not provided (last 7 days)
      const defaultStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const defaultEndDate = endDate ? new Date(endDate) : new Date();

      let result;

      switch (type) {
        case 'aggregated':
          result = await weatherAggregator.getAggregatedWeatherData(
            latitude,
            longitude,
            defaultStartDate,
            defaultEndDate,
            intervalHours
          );
          break;

        case 'hourly':
          const hours = Math.floor((defaultEndDate.getTime() - defaultStartDate.getTime()) / (1000 * 60 * 60));
          result = await weatherAggregator.getHourlyWeatherData(
            latitude,
            longitude,
            Math.min(hours, 168) // Max 7 days
          );
          break;

        case 'field':
          if (!fieldBoundary || !Array.isArray(fieldBoundary) || fieldBoundary.length < 3) {
            throw new ValidationError('Field boundary must be an array of at least 3 coordinate points');
          }
          result = await weatherAggregator.getFieldWeatherAnalysis(fieldBoundary);
          break;

        case 'irrigation':
          result = await weatherAggregator.getIrrigationRecommendations(
            latitude,
            longitude,
            cropType,
            soilType as 'sandy' | 'medium' | 'clay'
          );
          break;

        default:
          throw new ValidationError('Invalid aggregation type');
      }

      if (!result) {
        throw new Error('Unable to generate weather aggregation data for the specified parameters');
      }

      return createSuccessResponse({
        data: result,
        type,
        location: { latitude, longitude },
        message: `Weather ${type} data generated successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);