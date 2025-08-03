import { NextRequest } from 'next/server';
import { z } from 'zod';
import { weatherService } from '../../../../lib/weather/service';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';

const currentWeatherSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// GET /api/weather/current?latitude=40.7128&longitude=-74.0060
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const latitude = parseFloat(searchParams.get('latitude') || '');
      const longitude = parseFloat(searchParams.get('longitude') || '');

      // Validate coordinates
      const validation = currentWeatherSchema.safeParse({ latitude, longitude });
      if (!validation.success) {
        throw new ValidationError('Invalid latitude or longitude coordinates');
      }

      const weather = await weatherService.getCurrentWeatherCached(latitude, longitude);

      if (!weather) {
        throw new Error('Unable to fetch weather data for the specified location');
      }

      return createSuccessResponse({
        weather,
        message: 'Current weather data retrieved successfully'
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);