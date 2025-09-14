import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';

const reverseGeocodingSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  limit: z.number().min(1).max(10).optional().default(5)
});

interface ReverseGeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  local_names?: Record<string, string>;
}

// GET /api/weather/reverse-geocoding?latitude=40.7128&longitude=-74.0060
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const latitude = parseFloat(searchParams.get('latitude') || '');
      const longitude = parseFloat(searchParams.get('longitude') || '');
      const limit = parseInt(searchParams.get('limit') || '5');

      // Validate coordinates
      const validation = reverseGeocodingSchema.safeParse({ latitude, longitude, limit });
      if (!validation.success) {
        throw new ValidationError('Invalid latitude, longitude, or limit');
      }

      const API_KEY = process.env.OPENWEATHER_API_KEY;
      if (!API_KEY) {
        return createSuccessResponse({
          results: [
            {
              name: 'Sample Location',
              lat: latitude,
              lon: longitude,
              country: 'US',
              state: 'NY',
              display_name: `Sample Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) - Mock Result`
            }
          ],
          message: 'Reverse geocoding results (mock data - API key not configured)'
        });
      }

      // Build reverse geocoding URL
      const geocodingUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=${limit}&appid=${API_KEY}`;

      const response = await fetch(geocodingUrl);

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.statusText}`);
      }

      const data: ReverseGeocodingResult[] = await response.json();

      if (!data || data.length === 0) {
        return createSuccessResponse({
          results: [
            {
              name: 'Unknown Location',
              lat: latitude,
              lon: longitude,
              country: 'Unknown',
              display_name: `Unknown Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
            }
          ],
          message: 'No location names found for the specified coordinates'
        });
      }

      // Format results for easier use
      const formattedResults = data.map(result => ({
        name: result.name,
        lat: result.lat,
        lon: result.lon,
        country: result.country,
        state: result.state,
        display_name: [result.name, result.state, result.country].filter(Boolean).join(', '),
        local_names: result.local_names
      }));

      return createSuccessResponse({
        results: formattedResults,
        message: `Found ${formattedResults.length} location name${formattedResults.length === 1 ? '' : 's'} for coordinates`
      });

    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return handleApiError(error);
    }
  })
);