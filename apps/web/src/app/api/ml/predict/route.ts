import { NextRequest } from 'next/server';
import { z } from 'zod';
import { yieldPrediction } from '@/lib/ml/yield-prediction';
import { createSuccessResponse, handleApiError, ValidationError } from '@/lib/api/errors';
import { apiMiddleware, withMethods } from '@/lib/api/middleware';
import { getCurrentUser } from '@/lib/auth/session';

const yieldPredictionSchema = z.object({
  fieldId: z.string().min(1, 'Field ID is required'),
  cropType: z.string().min(1, 'Crop type is required'),
  plantingDate: z.string().datetime('Invalid planting date format'),
  harvestDate: z.string().datetime().optional(),
  features: z.object({
    weather: z.object({
      avgTemperature: z.number().optional(),
      totalRainfall: z.number().optional(),
      humidity: z.number().optional(),
      growingDegreeDays: z.number().optional()
    }).optional(),
    soil: z.object({
      ph: z.number().optional(),
      organicMatter: z.number().optional(),
      nitrogen: z.number().optional(),
      phosphorus: z.number().optional()
    }).optional(),
    satellite: z.object({
      avgNDVI: z.number().optional(),
      avgEVI: z.number().optional(),
      vegetationCover: z.number().optional()
    }).optional(),
    management: z.any().optional()
  }).optional(),
  modelVersion: z.string().optional(),
  confidenceLevel: z.number().min(0.5).max(0.99).optional(),
  options: z.object({
    includeRecommendations: z.boolean().default(true),
    includeUncertainty: z.boolean().default(true),
    includeTrends: z.boolean().default(false),
    includeComparisons: z.boolean().default(false),
    timeHorizon: z.number().min(1).max(365).default(30)
  }).optional()
});

const batchPredictionSchema = z.object({
  fieldIds: z.array(z.string()).min(1, 'At least one field ID is required').max(50, 'Maximum 50 fields allowed'),
  cropTypes: z.array(z.string()).optional(),
  modelVersion: z.string().optional(),
  options: z.object({
    includeRecommendations: z.boolean().default(true),
    includeUncertainty: z.boolean().default(true),
    includeTrends: z.boolean().default(false),
    includeComparisons: z.boolean().default(false),
    timeHorizon: z.number().min(1).max(365).default(30)
  })
});

// POST /api/ml/predict
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      const user = await getCurrentUser();
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      // Check if this is a batch prediction request
      if (body.fieldIds && Array.isArray(body.fieldIds)) {
        // Batch prediction
        const validation = batchPredictionSchema.safeParse(body);
        if (!validation.success) {
          throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
        }

        const params = validation.data;
        
        const predictions = await yieldPrediction.predictYieldBatch({
          fieldIds: params.fieldIds,
          cropTypes: params.cropTypes,
          modelVersion: params.modelVersion,
          options: params.options
        });

        const summary = {
          totalFields: params.fieldIds.length,
          successfulPredictions: predictions.length,
          averageYield: predictions.reduce((sum, p) => sum + p.predictedYield, 0) / predictions.length,
          averageConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length,
          totalRecommendations: predictions.reduce((sum, p) => sum + p.recommendations.length, 0)
        };

        return createSuccessResponse({
          data: {
            predictions,
            summary
          },
          message: `Batch yield prediction completed for ${predictions.length} fields`,
          action: 'batch_predict'
        });

      } else {
        // Single prediction
        const validation = yieldPredictionSchema.safeParse(body);
        if (!validation.success) {
          throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
        }

        const params = validation.data;
        
        const prediction = await yieldPrediction.predictYield({
          fieldId: params.fieldId,
          cropType: params.cropType,
          plantingDate: new Date(params.plantingDate),
          harvestDate: params.harvestDate ? new Date(params.harvestDate) : undefined,
          features: params.features,
          modelVersion: params.modelVersion,
          confidenceLevel: params.confidenceLevel
        }, params.options);

        const summary = {
          fieldId: params.fieldId,
          cropType: params.cropType,
          predictedYield: prediction.predictedYield,
          confidence: prediction.confidence,
          riskLevel: prediction.confidence > 0.8 ? 'low' : prediction.confidence > 0.6 ? 'medium' : 'high',
          recommendationCount: prediction.recommendations.length,
          expectedROI: prediction.recommendations.reduce((sum, rec) => 
            sum + (rec.impact - rec.cost), 0
          )
        };

        return createSuccessResponse({
          data: prediction,
          summary,
          message: `Yield prediction completed for field ${params.fieldId}`,
          action: 'predict'
        });
      }

    } catch (error) {
      return handleApiError(error);
    }
  })
);

// GET /api/ml/predict?fieldId=123&cropType=corn
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const user = await getCurrentUser();
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const fieldId = searchParams.get('fieldId');
      const cropType = searchParams.get('cropType');
      
      if (!fieldId || !cropType) {
        throw new ValidationError('fieldId and cropType parameters are required');
      }

      // Use default options for GET request
      const prediction = await yieldPrediction.predictYield({
        fieldId,
        cropType,
        plantingDate: new Date(), // Current date as default
        modelVersion: searchParams.get('modelVersion') || undefined
      }, {
        includeRecommendations: searchParams.get('includeRecommendations') === 'true',
        includeUncertainty: searchParams.get('includeUncertainty') !== 'false',
        includeTrends: searchParams.get('includeTrends') === 'true',
        includeComparisons: searchParams.get('includeComparisons') === 'true',
        timeHorizon: parseInt(searchParams.get('timeHorizon') || '30')
      });

      const summary = {
        fieldId,
        cropType,
        predictedYield: prediction.predictedYield,
        confidence: prediction.confidence,
        recommendationCount: prediction.recommendations.length
      };

      return createSuccessResponse({
        data: prediction,
        summary,
        message: `Yield prediction retrieved for field ${fieldId}`,
        action: 'get_prediction'
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);