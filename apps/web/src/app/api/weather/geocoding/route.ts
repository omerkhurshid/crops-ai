import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';

const geocodingSchema = z.object({
  address: z.string().min(1).max(500),
  country: z.string().optional(),
  limit: z.number().min(1).max(10).optional().default(5)
});

interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  local_names?: Record<string, string>;
}

// GET /api/weather/geocoding?address=New York&country=US
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const address = searchParams.get('address') || '';
      const country = searchParams.get('country') || '';
      const limit = parseInt(searchParams.get('limit') || '5');

      // Validate input
      const validation = geocodingSchema.safeParse({ address, country, limit });
      if (!validation.success) {
        throw new ValidationError('Invalid address or parameters');
      }

      const API_KEY = process.env.OPENWEATHER_API_KEY;
      if (!API_KEY) {
        return createSuccessResponse({
          results: [
            {
              name: address,
              lat: 40.7128,
              lon: -74.0060,
              country: 'US',
              state: 'NY',
              display_name: `${address} (Mock Result - API key not configured)`
            }
          ],
          message: 'Geocoding results (mock data - API key not configured)'
        });
      }

      // Build geocoding URL
      let geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(address)}`;
      if (country) {
        geocodingUrl += `,${encodeURIComponent(country)}`;
      }
      geocodingUrl += `&limit=${limit}&appid=${API_KEY}`;

      const response = await fetch(geocodingUrl);

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.statusText}`);
      }

      const data: GeocodingResult[] = await response.json();

      if (!data || data.length === 0) {
        return createSuccessResponse({
          results: [],
          message: 'No locations found for the specified address'
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
        message: `Found ${formattedResults.length} location${formattedResults.length === 1 ? '' : 's'} for "${address}"`
      });

    } catch (error) {
      console.error('Geocoding error:', error);
      return handleApiError(error);
    }
  })
);