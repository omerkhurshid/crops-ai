import { NextRequest } from 'next/server';
import { z } from 'zod';
import { weatherService } from '../../../../lib/weather/service';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';

const agricultureSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// GET /api/weather/agriculture?latitude=40.7128&longitude=-74.0060
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const latitude = parseFloat(searchParams.get('latitude') || '');
      const longitude = parseFloat(searchParams.get('longitude') || '');

      // Validate coordinates
      const validation = agricultureSchema.safeParse({ latitude, longitude });
      if (!validation.success) {
        throw new ValidationError('Invalid latitude or longitude coordinates');
      }

      const agricultureData = await weatherService.getAgricultureData(latitude, longitude);

      if (!agricultureData) {
        throw new Error('Unable to fetch agriculture weather data for the specified location');
      }

      return createSuccessResponse({
        data: agricultureData,
        location: { latitude, longitude },
        message: 'Agriculture weather data retrieved successfully'
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);