import { NextRequest } from 'next/server';
import { z } from 'zod';
import { weatherService } from '../../../lib/weather/service';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../lib/api/middleware';

const forecastSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  days: z.number().min(1).max(16).optional().default(7),
});

// GET /api/weather/forecast?latitude=40.7128&longitude=-74.0060&days=7
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const latitude = parseFloat(searchParams.get('latitude') || '');
      const longitude = parseFloat(searchParams.get('longitude') || '');
      const days = parseInt(searchParams.get('days') || '7');

      // Validate parameters
      const validation = forecastSchema.safeParse({ latitude, longitude, days });
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.message);
      }

      const forecast = await weatherService.getForecastCached(latitude, longitude, days);

      return createSuccessResponse({
        forecast,
        location: { latitude, longitude },
        days,
        message: `${days}-day weather forecast retrieved successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);