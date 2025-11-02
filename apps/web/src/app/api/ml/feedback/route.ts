import { NextRequest } from 'next/server';
import { z } from 'zod';
import { recommendationEngine } from '../../../../lib/ml/recommendation-engine';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';
import { getAuthenticatedUser } from '../../../../lib/auth/server';

const feedbackSchema = z.object({
  recommendationId: z.string().min(1, 'Recommendation ID is required'),
  implemented: z.boolean(),
  effectiveness: z.number().min(1).max(5).optional(),
  actualCost: z.number().optional(),
  actualImpact: z.object({
    yield: z.number().optional(),
    quality: z.number().optional(),
    timeline: z.number().optional()
  }).optional(),
  comments: z.string().max(1000).optional()
});

// POST /api/ml/feedback
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      const user = await getAuthenticatedUser(request);
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const validation = feedbackSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const params = validation.data;
      
      await recommendationEngine.recordFeedback({
        recommendationId: params.recommendationId,
        userId: user.id,
        implemented: params.implemented,
        effectiveness: params.effectiveness,
        actualCost: params.actualCost,
        actualImpact: params.actualImpact,
        comments: params.comments,
        submittedAt: new Date()
      });

      const summary = {
        recommendationId: params.recommendationId,
        implemented: params.implemented,
        effectiveness: params.effectiveness,
        userId: user.id,
        submittedAt: new Date().toISOString()
      };

      return createSuccessResponse({
        data: {
          feedbackId: `feedback_${params.recommendationId}_${user.id}`,
          status: 'recorded',
          ...summary
        },
        summary,
        message: `Feedback recorded for recommendation ${params.recommendationId}`,
        action: 'record_feedback'
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);