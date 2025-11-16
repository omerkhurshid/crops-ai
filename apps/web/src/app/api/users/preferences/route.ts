import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../../lib/api/middleware';
const preferencesSchema = z.object({
  currency: z.string().optional(),
  landUnit: z.enum(['hectares', 'acres', 'square_meters']).optional(),
  temperatureUnit: z.enum(['celsius', 'fahrenheit']).optional(),
  timezone: z.string().optional(),
  language: z.string().optional()
});
// GET /api/users/preferences
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest) => {
    try {
      const user = request.user;
      // Get user preferences from database with error handling for missing columns
      let userPreferences = null;
      try {
        userPreferences = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            currency: true,
            landUnit: true,
            temperatureUnit: true,
            timezone: true,
            language: true
          }
        });
      } catch (dbError) {
        console.error('Database preferences error:', dbError);
        // If preferences columns don't exist, fall back to basic user data
        userPreferences = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true }
        });
      }
      // Return preferences with defaults
      const preferences = {
        currency: (userPreferences && 'currency' in userPreferences) ? userPreferences.currency : 'USD',
        landUnit: (userPreferences && 'landUnit' in userPreferences) ? userPreferences.landUnit : 'hectares',
        temperatureUnit: (userPreferences && 'temperatureUnit' in userPreferences) ? userPreferences.temperatureUnit : 'celsius',
        timezone: (userPreferences && 'timezone' in userPreferences) ? userPreferences.timezone : 'UTC',
        language: (userPreferences && 'language' in userPreferences) ? userPreferences.language : 'en'
      };
      return createSuccessResponse({
        preferences,
        message: 'User preferences retrieved successfully'
      });
    } catch (error) {
      console.error('Get preferences error:', error);
      return handleApiError(error);
    }
  })
);
// PUT /api/users/preferences
export const PUT = apiMiddleware.protected(
  withMethods(['PUT'], async (request: AuthenticatedRequest) => {
    try {
      const user = request.user;
      const body = await request.json();
      const validation = preferencesSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid preferences data');
      }
      const preferences = validation.data;
      // Update user preferences in database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(preferences.currency && { currency: preferences.currency }),
          ...(preferences.landUnit && { landUnit: preferences.landUnit }),
          ...(preferences.temperatureUnit && { temperatureUnit: preferences.temperatureUnit }),
          ...(preferences.timezone && { timezone: preferences.timezone }),
          ...(preferences.language && { language: preferences.language })
        },
        select: {
          currency: true,
          landUnit: true,
          temperatureUnit: true,
          timezone: true,
          language: true
        }
      });
      return createSuccessResponse({
        preferences: updatedUser,
        message: 'User preferences updated successfully'
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      return handleApiError(error);
    }
  })
);