import { NextRequest } from 'next/server';
import { z } from 'zod';
import { recommendationEngine } from '../../../../lib/ml/recommendation-engine';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';
import { getCurrentUser } from '../../../../lib/auth/session';

const recommendationRequestSchema = z.object({
  farmId: z.string().min(1, 'Farm ID is required'),
  fieldId: z.string().optional(),
  cropType: z.string().optional(),
  timeHorizon: z.number().min(1).max(365).default(90),
  categories: z.array(z.enum([
    'planting',
    'irrigation', 
    'fertilization',
    'pest_control',
    'harvest_timing',
    'crop_rotation',
    'soil_management',
    'equipment',
    'marketing'
  ])).min(1, 'At least one category is required'),
  priority: z.enum(['cost_optimization', 'yield_maximization', 'sustainability', 'risk_minimization']).default('yield_maximization'),
  constraints: z.object({
    maxBudget: z.number().positive().optional(),
    organicOnly: z.boolean().optional(),
    waterRestrictions: z.boolean().optional(),
    laborConstraints: z.boolean().optional()
  }).optional()
});

const plantingRecommendationSchema = z.object({
  farmId: z.string().min(1, 'Farm ID is required'),
  fieldId: z.string().min(1, 'Field ID is required'),
  targetCrop: z.string().optional()
});

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
  comments: z.string().optional()
});

// POST /api/ml/recommendations
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      const user = await getCurrentUser();
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const validation = recommendationRequestSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const params = validation.data;
      
      const plan = await recommendationEngine.generateRecommendations({
        farmId: params.farmId,
        fieldId: params.fieldId,
        cropType: params.cropType,
        timeHorizon: params.timeHorizon,
        categories: params.categories,
        priority: params.priority,
        constraints: params.constraints
      });

      const summary = {
        farmId: params.farmId,
        fieldId: params.fieldId,
        recommendationCount: plan.recommendations.length,
        totalCost: plan.summary.totalCost,
        expectedROI: plan.summary.expectedROI,
        riskScore: plan.summary.riskScore,
        sustainabilityScore: plan.summary.sustainabilityScore,
        implementationComplexity: plan.summary.implementationComplexity,
        timelineEntries: plan.timeline.length,
        alternativePlans: plan.alternatives.length,
        highPriorityItems: plan.recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length
      };

      return createSuccessResponse({
        data: plan,
        summary,
        message: `Generated ${plan.recommendations.length} recommendations for farm ${params.farmId}`,
        action: 'generate_recommendations'
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);

// GET /api/ml/recommendations?farmId=123&type=planting
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const user = await getCurrentUser();
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const farmId = searchParams.get('farmId');
      const type = searchParams.get('type');
      const fieldId = searchParams.get('fieldId');

      if (!farmId) {
        throw new ValidationError('farmId parameter is required');
      }

      let result;

      if (type === 'planting' && fieldId) {
        // Get specific planting recommendations
        const targetCrop = searchParams.get('targetCrop') || undefined;
        
        const recommendations = await recommendationEngine.getPlantingRecommendations(
          farmId,
          fieldId,
          targetCrop
        );

        result = {
          recommendations,
          summary: {
            farmId,
            fieldId,
            targetCrop,
            recommendationCount: recommendations.length,
            avgConfidence: recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length,
            totalCost: recommendations.reduce((sum, r) => sum + r.impact.cost, 0),
            expectedYieldIncrease: recommendations.reduce((sum, r) => sum + r.impact.yield, 0)
          }
        };

      } else if (type === 'analytics') {
        // Get recommendation analytics
        const timeRange = searchParams.get('startDate') && searchParams.get('endDate') ? {
          start: new Date(searchParams.get('startDate')!),
          end: new Date(searchParams.get('endDate')!)
        } : undefined;

        const analytics = await recommendationEngine.getRecommendationAnalytics(farmId, timeRange);
        
        result = {
          analytics,
          summary: {
            farmId,
            totalRecommendations: analytics.totalRecommendations,
            implementationRate: analytics.implementationRate,
            averageEffectiveness: analytics.averageEffectiveness,
            costSavings: analytics.costSavings,
            yieldImprovement: analytics.yieldImprovement
          }
        };

      } else {
        throw new ValidationError('Invalid type parameter. Supported types: planting, analytics');
      }

      return createSuccessResponse({
        data: result,
        message: `Retrieved ${type} recommendations for farm ${farmId}`,
        action: `get_${type}_recommendations`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);