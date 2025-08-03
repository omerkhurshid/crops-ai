import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ndviAnalysis } from '../../../lib/satellite/ndvi-analysis';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../lib/api/middleware';

const ndviSchema = z.object({
  type: z.enum(['health', 'trends', 'compare', 'stress']),
  fieldId: z.string(),
  // Spectral bands for health analysis
  red: z.number().min(0).max(1).optional(),
  nir: z.number().min(0).max(1).optional(),
  redEdge: z.number().min(0).max(1).optional(),
  green: z.number().min(0).max(1).optional(),
  blue: z.number().min(0).max(1).optional(),
  swir1: z.number().min(0).max(1).optional(),
  swir2: z.number().min(0).max(1).optional(),
  // For health analysis
  fieldArea: z.number().min(0.1).max(10000).optional(),
  cropType: z.string().optional(),
  // For trends analysis
  timeSeriesData: z.array(z.object({
    date: z.string(),
    ndvi: z.number().min(-1).max(1),
    cloudCover: z.number().min(0).max(100)
  })).optional(),
  forecastDays: z.number().min(1).max(365).optional(),
  // For comparison
  comparisonFields: z.array(z.object({
    fieldId: z.string(),
    name: z.string().optional(),
    area: z.number().min(0.1).max(10000),
    // Indices will be calculated from bands or provided directly
    ndvi: z.number().min(-1).max(1).optional(),
    evi: z.number().min(-1).max(1).optional(),
    savi: z.number().min(-1).max(1).optional(),
    ndre: z.number().min(-1).max(1).optional(),
    gndvi: z.number().min(-1).max(1).optional(),
    ndwi: z.number().min(-1).max(1).optional(),
    msavi: z.number().min(-1).max(1).optional(),
    gci: z.number().min(0).max(5).optional()
  })).optional()
});

// POST /api/satellite/ndvi
export const POST = apiMiddleware.basic(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      
      // Validate input
      const validation = ndviSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const params = validation.data;
      let result;

      switch (params.type) {
        case 'health':
          {
            // Calculate vegetation indices from spectral bands or use defaults
            const bands = {
              red: params.red || 0.1,
              nir: params.nir || 0.6,
              redEdge: params.redEdge || 0.4,
              green: params.green || 0.08,
              blue: params.blue || 0.06,
              swir1: params.swir1 || 0.15,
              swir2: params.swir2 || 0.1
            };

            const indices = ndviAnalysis.calculateVegetationIndices(bands);
            result = await ndviAnalysis.generateHealthReport(
              params.fieldId,
              indices,
              params.fieldArea || 100,
              params.cropType || 'general'
            );
          }
          break;

        case 'trends':
          {
            if (!params.timeSeriesData || params.timeSeriesData.length === 0) {
              throw new ValidationError('Time series data is required for trends analysis');
            }

            result = await ndviAnalysis.analyzeTrends(
              params.fieldId,
              params.timeSeriesData,
              params.forecastDays || 30
            );
          }
          break;

        case 'compare':
          {
            if (!params.comparisonFields || params.comparisonFields.length === 0) {
              throw new ValidationError('Comparison fields are required for field comparison');
            }

            // Convert comparison fields to include full indices
            const comparisonFieldsWithIndices = params.comparisonFields.map(field => {
              const indices = field.ndvi !== undefined ? {
                ndvi: field.ndvi,
                evi: field.evi || field.ndvi * 0.8,
                savi: field.savi || field.ndvi * 0.9,
                ndre: field.ndre || field.ndvi * 0.6,
                gndvi: field.gndvi || field.ndvi * 0.85,
                ndwi: field.ndwi || -0.1,
                msavi: field.msavi || field.ndvi * 0.9,
                gci: field.gci || 1.5
              } : ndviAnalysis.calculateVegetationIndices({
                red: 0.1, nir: 0.6, redEdge: 0.4, green: 0.08, blue: 0.06, swir1: 0.15, swir2: 0.1
              });

              return {
                fieldId: field.fieldId,
                name: field.name,
                area: field.area,
                indices
              };
            });

            result = await ndviAnalysis.compareFields(params.fieldId, comparisonFieldsWithIndices);
          }
          break;

        case 'stress':
          {
            // Calculate vegetation indices from spectral bands or use defaults
            const bands = {
              red: params.red || 0.1,
              nir: params.nir || 0.6,
              redEdge: params.redEdge || 0.4,
              green: params.green || 0.08,
              blue: params.blue || 0.06,
              swir1: params.swir1 || 0.15,
              swir2: params.swir2 || 0.1
            };

            const indices = ndviAnalysis.calculateVegetationIndices(bands);
            result = ndviAnalysis.detectCropStress(indices);
          }
          break;

        default:
          throw new ValidationError('Invalid NDVI analysis type');
      }

      // Generate summary based on type
      const summary = params.type === 'health' && (result as any).healthScore !== undefined
        ? {
            analysisType: 'vegetation_health',
            fieldId: (result as any).fieldId,
            healthScore: `${(result as any).healthScore}/100`,
            stressLevel: (result as any).stressLevel,
            phenologyStage: (result as any).phenologyStage,
            yieldPrediction: `${(result as any).yieldPrediction.estimated} tons/ha`,
            biomassEstimate: `${(result as any).biomassEstimate} kg/ha`,
            keyIndices: {
              ndvi: (result as any).indices.ndvi.toFixed(3),
              evi: (result as any).indices.evi.toFixed(3),
              savi: (result as any).indices.savi.toFixed(3)
            },
            recommendationsCount: (result as any).recommendations.immediate.length + 
                                 (result as any).recommendations.shortTerm.length + 
                                 (result as any).recommendations.seasonal.length
          }
        : params.type === 'trends' && (result as any).trend
        ? {
            analysisType: 'ndvi_trends',
            fieldId: (result as any).fieldId,
            timeRange: (result as any).timeRange,
            dataPoints: (result as any).dataPoints.length,
            trend: {
              direction: (result as any).trend.direction,
              dailyChange: `${((result as any).trend.slope * 1000).toFixed(4)}/day`,
              significance: (result as any).trend.significance.toFixed(3)
            },
            anomaliesCount: (result as any).anomalies.length,
            forecastPeriod: `${(result as any).forecast.nextPeriod} days`,
            warningsCount: (result as any).forecast.warnings.length
          }
        : params.type === 'compare' && (result as any).metrics
        ? {
            analysisType: 'field_comparison',
            baselineField: (result as any).baselineField,
            fieldsCompared: (result as any).metrics.length,
            bestPerforming: (result as any).insights.bestPerforming,
            mostStressed: (result as any).insights.mostStressed,
            averageHealthScore: (result as any).insights.averageHealthScore,
            variability: (result as any).insights.variability,
            recommendationsProvided: (result as any).recommendations.fieldSpecific.length + (result as any).recommendations.general.length
          }
        : params.type === 'stress' && (result as any).overall
        ? {
            analysisType: 'stress_detection',
            overall: (result as any).overall,
            stressTypes: {
              water: (result as any).water,
              nitrogen: (result as any).nitrogen,
              chlorophyll: (result as any).chlorophyll
            },
            confidence: `${((result as any).confidence * 100).toFixed(1)}%`,
            recommendationsCount: (result as any).recommendations.length
          }
        : null;

      return createSuccessResponse({
        data: result,
        summary,
        type: params.type,
        fieldId: params.fieldId,
        parameters: {
          cropType: params.cropType,
          fieldArea: params.fieldArea,
          forecastDays: params.forecastDays,
          comparisonFieldsCount: params.comparisonFields?.length,
          timeSeriesLength: params.timeSeriesData?.length
        },
        message: `NDVI ${params.type} analysis completed successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);

// GET /api/satellite/ndvi?fieldId=123&type=indices
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const fieldId = searchParams.get('fieldId');
      const type = searchParams.get('type') || 'indices';

      if (!fieldId) {
        throw new ValidationError('fieldId parameter is required');
      }

      let result;

      switch (type) {
        case 'indices':
          {
            // Generate sample vegetation indices
            const sampleBands = {
              red: 0.1 + Math.random() * 0.1,
              nir: 0.5 + Math.random() * 0.3,
              redEdge: 0.3 + Math.random() * 0.2,
              green: 0.05 + Math.random() * 0.05,
              blue: 0.03 + Math.random() * 0.03,
              swir1: 0.1 + Math.random() * 0.1,
              swir2: 0.05 + Math.random() * 0.1
            };

            result = {
              fieldId,
              bands: sampleBands,
              indices: ndviAnalysis.calculateVegetationIndices(sampleBands),
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'quick-health':
          {
            const sampleBands = {
              red: 0.1, nir: 0.6, redEdge: 0.4, green: 0.08, blue: 0.06, swir1: 0.15, swir2: 0.1
            };
            const indices = ndviAnalysis.calculateVegetationIndices(sampleBands);
            const stress = ndviAnalysis.detectCropStress(indices);

            result = {
              fieldId,
              healthScore: Math.round((indices.ndvi + 1) * 50), // Convert NDVI to 0-100 scale
              stress,
              keyMetrics: {
                ndvi: indices.ndvi,
                evi: indices.evi,
                waterStress: stress.water,
                nitrogenStatus: stress.nitrogen
              },
              timestamp: new Date().toISOString()
            };
          }
          break;

        default:
          throw new ValidationError('Invalid analysis type for GET request');
      }

      return createSuccessResponse({
        data: result,
        type,
        fieldId,
        message: `NDVI ${type} data retrieved successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);