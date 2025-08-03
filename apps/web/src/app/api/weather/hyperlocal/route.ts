import { NextRequest } from 'next/server';
import { z } from 'zod';
import { hyperlocalWeather } from '../../../../lib/weather/hyperlocal';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';

const hyperlocalSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.enum(['point', 'grid', 'field']),
  // For grid generation
  radius: z.number().min(100).max(10000).optional(),
  // For field analysis
  fieldBoundary: z.array(z.object({
    latitude: z.number(),
    longitude: z.number()
  })).optional(),
  // For point prediction
  elevation: z.number().optional(),
});

// GET /api/weather/hyperlocal?latitude=40.7128&longitude=-74.0060&type=point
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const latitude = parseFloat(searchParams.get('latitude') || '');
      const longitude = parseFloat(searchParams.get('longitude') || '');
      const type = searchParams.get('type') || 'point';
      const radius = parseInt(searchParams.get('radius') || '1000');
      const elevation = searchParams.get('elevation') ? parseFloat(searchParams.get('elevation')!) : undefined;
      
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
      const validation = hyperlocalSchema.safeParse({
        latitude,
        longitude,
        type,
        radius,
        fieldBoundary,
        elevation
      });

      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const params = validation.data;
      let result;

      switch (type) {
        case 'point':
          result = await hyperlocalWeather.getPointPrediction(
            latitude,
            longitude,
            elevation
          );
          break;

        case 'grid':
          result = await hyperlocalWeather.generateHyperlocalGrid(
            latitude,
            longitude,
            radius
          );
          break;

        case 'field':
          if (!fieldBoundary || !Array.isArray(fieldBoundary) || fieldBoundary.length < 3) {
            throw new ValidationError('Field boundary must be an array of at least 3 coordinate points');
          }
          result = await hyperlocalWeather.analyzeFieldMicroclimate(fieldBoundary);
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
          radius: type === 'grid' ? radius : undefined,
          elevation: type === 'point' ? elevation : undefined,
          fieldPoints: type === 'field' ? fieldBoundary?.length : undefined
        },
        message: `Hyperlocal weather ${type} prediction generated successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);