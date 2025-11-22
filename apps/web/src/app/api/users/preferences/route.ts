import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../../lib/api/middleware';
import { createClient } from '../../../../lib/supabase/server';
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
      // Get user preferences from Supabase user metadata
      const supabase = createClient();
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      
      if (error || !supabaseUser) {
        throw new Error('Unable to fetch user data');
      }

      const userPreferences = {
        currency: supabaseUser.user_metadata?.currency || 'USD',
        landUnit: supabaseUser.user_metadata?.landUnit || 'hectares',
        temperatureUnit: supabaseUser.user_metadata?.temperatureUnit || 'celsius',
        timezone: supabaseUser.user_metadata?.timezone || 'UTC',
        language: supabaseUser.user_metadata?.language || 'en'
      };

      return createSuccessResponse({
        preferences: userPreferences,
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
      // Update user preferences in Supabase user metadata
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          ...preferences
        }
      });

      if (error) {
        throw new Error(`Failed to update user preferences: ${error.message}`);
      }

      return createSuccessResponse({
        preferences: preferences,
        message: 'User preferences updated successfully'
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      return handleApiError(error);
    }
  })
);