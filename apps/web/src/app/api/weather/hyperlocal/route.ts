import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hyperlocalWeather } from '../../../../lib/weather/hyperlocal-weather';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';
import { auditLogger } from '../../../../lib/logging/audit-logger';
const hyperlocalSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(['forecast', 'crop-specific', 'trends']).default('forecast'),
  elevation: z.number().optional(),
  fieldId: z.string().optional(),
  // For crop-specific forecasts
  cropType: z.string().optional(),
  growthStage: z.string().optional(),
  // For trends analysis
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
const cropSpecificSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  cropType: z.string().min(1),
  growthStage: z.string().min(1),
  fieldId: z.string().optional(),
});
// GET /api/weather/hyperlocal?latitude=40.7128&longitude=-74.0060&type=forecast
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const latitude = parseFloat(searchParams.get('latitude') || '');
      const longitude = parseFloat(searchParams.get('longitude') || '');
      const type = searchParams.get('type') || 'forecast';
      const elevation = searchParams.get('elevation') ? parseFloat(searchParams.get('elevation')!) : undefined;
      const fieldId = searchParams.get('fieldId') || undefined;
      const cropType = searchParams.get('cropType') || undefined;
      const growthStage = searchParams.get('growthStage') || undefined;
      const startDate = searchParams.get('startDate') || undefined;
      const endDate = searchParams.get('endDate') || undefined;
      // Validate input
      const validation = hyperlocalSchema.safeParse({
        latitude,
        longitude,
        type,
        elevation,
        fieldId,
        cropType,
        growthStage,
        startDate,
        endDate
      });
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }
      const params = validation.data;
      let result;
      switch (type) {
        case 'forecast':
          result = await hyperlocalWeather.getFieldForecast(
            latitude,
            longitude,
            elevation,
            fieldId
          );
          await auditLogger.logSystem('hyperlocal_forecast_requested', true, {
            latitude,
            longitude,
            fieldId,
            sourcesUsed: result.metadata.sources.length,
            confidence: result.metadata.confidence
          });
          break;
        case 'crop-specific':
          if (!cropType || !growthStage) {
            throw new ValidationError('cropType and growthStage are required for crop-specific forecasts');
          }
          result = await hyperlocalWeather.getCropSpecificForecast(
            latitude,
            longitude,
            cropType,
            growthStage,
            fieldId
          );
          await auditLogger.logSystem('crop_specific_forecast_requested', true, {
            latitude,
            longitude,
            cropType,
            growthStage,
            fieldId,
            advisoryGenerated: !!result.cropAdvisory
          });
          break;
        case 'trends':
          if (!startDate || !endDate) {
            throw new ValidationError('startDate and endDate are required for trends analysis');
          }
          result = await hyperlocalWeather.getWeatherTrends(
            latitude,
            longitude,
            new Date(startDate),
            new Date(endDate)
          );
          await auditLogger.logSystem('weather_trends_requested', true, {
            latitude,
            longitude,
            dateRange: `${startDate} to ${endDate}`,
            daysAnalyzed: result.temperatureTrend.length
          });
          break;
        default:
          throw new ValidationError('Invalid hyperlocal prediction type');
      }
      if (!result) {
        throw new Error('Unable to generate hyperlocal weather prediction for the specified parameters');
      }
      return createSuccessResponse({
        data: result,
        type,
        location: { latitude, longitude },
        parameters: {
          elevation,
          fieldId,
          cropType: type === 'crop-specific' ? cropType : undefined,
          growthStage: type === 'crop-specific' ? growthStage : undefined,
          dateRange: type === 'trends' ? `${startDate} to ${endDate}` : undefined
        },
        message: `Hyperlocal weather ${type} generated successfully`
      });
    } catch (error) {
      return handleApiError(error);
    }
  })
);
// POST /api/weather/hyperlocal - For crop-specific weather forecasts
export const POST = apiMiddleware.basic(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validation = cropSpecificSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid request body: ' + validation.error.errors.map(e => e.message).join(', '));
      }
      const { latitude, longitude, cropType, growthStage, fieldId } = validation.data;
      const result = await hyperlocalWeather.getCropSpecificForecast(
        latitude,
        longitude,
        cropType,
        growthStage,
        fieldId
      );
      await auditLogger.logSystem('crop_specific_weather_requested', true, {
        latitude,
        longitude,
        cropType,
        growthStage,
        fieldId,
        advisoryGenerated: !!result.cropAdvisory
      });
      return createSuccessResponse({
        data: result,
        cropType,
        growthStage,
        location: { latitude, longitude },
        advisoryIncluded: !!result.cropAdvisory,
        message: 'Crop-specific weather forecast generated successfully'
      });
    } catch (error) {
      await auditLogger.logSystem('crop_specific_weather_error', false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error');
      return handleApiError(error);
    }
  })
);