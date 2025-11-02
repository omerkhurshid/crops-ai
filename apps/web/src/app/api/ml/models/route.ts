import { NextRequest } from 'next/server';
import { z } from 'zod';
import { yieldPrediction } from '../../../../lib/ml/yield-prediction';
import { dataPipeline } from '../../../../lib/ml/data-pipeline';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';
import { getAuthenticatedUser } from '../../../../lib/auth/server';

const trainModelSchema = z.object({
  dataSource: z.enum(['pipeline', 'custom']).default('pipeline'),
  trainingData: z.array(z.any()).optional(),
  validationSplit: z.number().min(0.1).max(0.5).default(0.2),
  hyperparameters: z.record(z.any()).optional(),
  features: z.array(z.string()).optional(),
  crossValidation: z.object({
    folds: z.number().min(3).max(10).default(5),
    stratified: z.boolean().default(true)
  }).optional()
});

const evaluateModelSchema = z.object({
  modelId: z.string().min(1, 'Model ID is required'),
  testData: z.array(z.any()).optional()
});

const pipelineConfigSchema = z.object({
  sources: z.object({
    weather: z.boolean().default(true),
    satellite: z.boolean().default(true),
    soil: z.boolean().default(true),
    management: z.boolean().default(true),
    historical: z.boolean().default(true)
  }),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  fieldFilters: z.object({
    cropTypes: z.array(z.string()).optional(),
    regions: z.array(z.string()).optional(),
    minArea: z.number().positive().optional(),
    maxArea: z.number().positive().optional()
  }).optional(),
  qualityThresholds: z.object({
    completeness: z.number().min(0).max(1).default(0.8),
    accuracy: z.number().min(0).max(1).default(0.9),
    timeliness: z.number().min(0).max(1).default(0.9)
  }).optional(),
  transformation: z.object({
    normalization: z.boolean().default(true),
    featureEngineering: z.boolean().default(true),
    outlierDetection: z.boolean().default(true),
    missingValueHandling: z.enum(['drop', 'interpolate', 'mean', 'median', 'forward_fill']).default('interpolate'),
    aggregationPeriod: z.enum(['daily', 'weekly', 'monthly', 'seasonal']).default('seasonal')
  }).optional()
});

// POST /api/ml/models
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      const user = await getAuthenticatedUser(request);
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const action = body.action || 'train';

      switch (action) {
        case 'train': {
          const validation = trainModelSchema.safeParse(body);
          if (!validation.success) {
            throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
          }

          const params = validation.data;
          
          const model = await yieldPrediction.trainModel({
            dataSource: params.dataSource,
            trainingData: params.trainingData,
            validationSplit: params.validationSplit,
            hyperparameters: params.hyperparameters,
            features: params.features,
            crossValidation: params.crossValidation
          });

          const summary = {
            modelId: model.id,
            modelType: model.type,
            cropTypes: model.cropTypes,
            featureCount: model.features.length,
            performance: {
              r2: model.performance.metrics.r2,
              mae: model.performance.metrics.mae,
              rmse: model.performance.metrics.rmse
            },
            trainingCompleted: model.lastTrained,
            status: model.status
          };

          return createSuccessResponse({
            data: model,
            summary,
            message: `Model training completed successfully: ${model.id}`,
            action: 'train_model'
          });
        }

        case 'evaluate': {
          const validation = evaluateModelSchema.safeParse(body);
          if (!validation.success) {
            throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
          }

          const params = validation.data;
          
          const performance = await yieldPrediction.evaluateModel(params.modelId, params.testData);

          const summary = {
            modelId: params.modelId,
            evaluationDate: performance.lastEvaluation,
            sampleSize: performance.validationData.samples,
            performance: performance.metrics,
            crossValidationScore: performance.crossValidation.avgScore
          };

          return createSuccessResponse({
            data: performance,
            summary,
            message: `Model evaluation completed for ${params.modelId}`,
            action: 'evaluate_model'
          });
        }

        case 'pipeline': {
          const validation = pipelineConfigSchema.safeParse(body);
          if (!validation.success) {
            throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
          }

          const params = validation.data;
          
          const result = await dataPipeline.executePipeline(
            {
              sources: params.sources,
              timeRange: {
                start: new Date(params.timeRange.start),
                end: new Date(params.timeRange.end)
              },
              fieldFilters: params.fieldFilters || {},
              qualityThresholds: params.qualityThresholds || {
                completeness: 0.8,
                accuracy: 0.9,
                timeliness: 0.9
              }
            },
            params.transformation || {
              normalization: true,
              featureEngineering: true,
              outlierDetection: true,
              missingValueHandling: 'interpolate',
              aggregationPeriod: 'seasonal'
            }
          );

          const summary = {
            totalRecords: result.statistics.totalRecords,
            validRecords: result.statistics.validRecords,
            rejectedRecords: result.statistics.rejectedRecords,
            qualityScore: result.quality.score,
            trainingSetSize: result.trainingData.length,
            validationSetSize: result.validationData.length,
            extractionTime: result.metadata.extractionTime,
            transformationTime: result.metadata.transformationTime,
            sources: result.metadata.sources,
            features: result.metadata.features.length
          };

          return createSuccessResponse({
            data: {
              statistics: result.statistics,
              quality: result.quality,
              metadata: result.metadata,
              sampleData: {
                training: result.trainingData.slice(0, 5), // Return first 5 samples
                validation: result.validationData.slice(0, 3)
              }
            },
            summary,
            message: `Data pipeline executed successfully. Processed ${result.statistics.validRecords} records`,
            action: 'execute_pipeline'
          });
        }

        default:
          throw new ValidationError('Invalid action. Supported actions: train, evaluate, pipeline');
      }

    } catch (error) {
      return handleApiError(error);
    }
  })
);

// GET /api/ml/models
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const user = await getAuthenticatedUser(request);
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const action = searchParams.get('action') || 'list';

      switch (action) {
        case 'list': {
          const models = await yieldPrediction.getAvailableModels();

          const summary = {
            totalModels: models.length,
            readyModels: models.filter(m => m.status === 'ready').length,
            trainingModels: models.filter(m => m.status === 'training').length,
            cropTypes: Array.from(new Set(models.flatMap(m => m.metadata.cropTypes))),
            averageAccuracy: models.length > 0 ? 
              models.reduce((sum, m) => sum + m.accuracy, 0) / models.length : 0,
            latestModel: models.length > 0 ? 
              models.reduce((latest, current) => 
                new Date(current.lastTrained) > new Date(latest.lastTrained) ? current : latest
              ).id : null
          };

          return createSuccessResponse({
            data: { models },
            summary,
            message: `Retrieved ${models.length} available models`,
            action: 'list_models'
          });
        }

        case 'performance': {
          const modelId = searchParams.get('modelId');
          if (!modelId) {
            throw new ValidationError('modelId parameter is required for performance action');
          }

          const performance = await yieldPrediction.evaluateModel(modelId);

          const summary = {
            modelId,
            accuracy: performance.metrics.r2,
            errorRate: performance.metrics.mape,
            lastEvaluation: performance.lastEvaluation,
            validationSamples: performance.validationData.samples,
            crossValidationScore: performance.crossValidation.avgScore
          };

          return createSuccessResponse({
            data: performance,
            summary,
            message: `Retrieved performance metrics for model ${modelId}`,
            action: 'get_performance'
          });
        }

        default:
          throw new ValidationError('Invalid action. Supported actions: list, performance');
      }

    } catch (error) {
      return handleApiError(error);
    }
  })
);