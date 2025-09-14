import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '../../../../lib/auth/session';
import { prisma } from '../../../../lib/prisma';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';

const preferencesSchema = z.object({
  currency: z.string().optional(),
  landUnit: z.enum(['hectares', 'acres', 'square_meters']).optional(),
  temperatureUnit: z.enum(['celsius', 'fahrenheit']).optional(),
  timezone: z.string().optional(),
  language: z.string().optional()
});

// GET /api/users/preferences
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ValidationError('Authentication required');
      }

      // Get user preferences from database
      const userPreferences = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          currency: true,
          landUnit: true,
          temperatureUnit: true,
          timezone: true,
          language: true
        }
      });

      // Return preferences with defaults
      const preferences = {
        currency: userPreferences?.currency || 'USD',
        landUnit: userPreferences?.landUnit || 'hectares',
        temperatureUnit: userPreferences?.temperatureUnit || 'celsius',
        timezone: userPreferences?.timezone || 'UTC',
        language: userPreferences?.language || 'en'
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
export const PUT = apiMiddleware.basic(
  withMethods(['PUT'], async (request: NextRequest) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ValidationError('Authentication required');
      }

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