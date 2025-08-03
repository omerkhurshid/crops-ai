import { NextRequest } from 'next/server';
import { z } from 'zod';
import { stressDetector } from '../../../lib/satellite/stress-detection';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../lib/api/middleware';
import { getCurrentUser } from '../../../lib/auth/session';
import { prisma } from '../../../lib/prisma';

const stressSchema = z.object({
  fieldId: z.string(),
  bbox: z.object({
    west: z.number().min(-180).max(180),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    north: z.number().min(-90).max(90)
  }).optional(),
  date: z.string().optional(),
  options: z.object({
    cropType: z.string(),
    growthStage: z.enum(['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity']),
    plantingDate: z.string().transform(str => new Date(str)),
    includeWeatherAnalysis: z.boolean().optional(),
    includeHistoricalComparison: z.boolean().optional(),
    sensitivityLevel: z.enum(['low', 'medium', 'high']).optional(),
    analysisDepth: z.enum(['quick', 'standard', 'comprehensive']).optional()
  })
});

// POST /api/satellite/stress
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      const user = await getCurrentUser();
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      // Validate input
      const validation = stressSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const params = validation.data;
      
      // Get field details if bbox not provided
      let bbox = params.bbox;
      if (!bbox) {
        const field = await prisma.field.findFirst({
          where: {
            id: params.fieldId,
            farm: {
              ownerId: user.id
            }
          }
        });

        if (!field) {
          throw new ValidationError('Field not found or access denied');
        }

        // Extract bbox from field boundary or use default
        if (field.area && field.area > 0) {
          // Calculate bbox from field location - simplified for now
          bbox = {
            west: -74.1,
            east: -74.0,
            south: 40.7,
            north: 40.8
          };
        } else {
          throw new ValidationError('Field boundary not defined. Please detect boundaries first.');
        }
      }

      const date = params.date || new Date().toISOString().split('T')[0];

      // Perform stress detection
      const result = await stressDetector.detectStress(
        params.fieldId,
        bbox,
        date,
        params.options as any
      );

      // Generate actionable summary
      const summary = {
        fieldId: params.fieldId,
        analysisDate: date,
        overallStress: {
          level: result.overallStress.level,
          confidence: `${(result.overallStress.confidence * 100).toFixed(1)}%`
        },
        stressDetected: {
          water: result.stressTypes.water.detected,
          nutrient: result.stressTypes.nutrient.detected,
          disease: result.stressTypes.disease.detected,
          pest: result.stressTypes.pest.detected,
          temperature: result.stressTypes.temperature.detected
        },
        affectedArea: {
          percentage: `${result.affectedArea.percentage.toFixed(1)}%`,
          hectares: `${result.affectedArea.hectares.toFixed(2)} ha`
        },
        urgency: result.urgency,
        topRecommendations: result.recommendations
          .filter(r => r.type === 'immediate')
          .slice(0, 3)
          .map(r => r.action),
        predictedYieldImpact: result.predictedImpact ? 
          `${result.predictedImpact.yieldReduction.likely.toFixed(1)}% reduction if untreated` : 
          'Not available',
        nextSteps: [
          result.urgency === 'critical' ? 'Take immediate action on recommendations' :
          result.urgency === 'high' ? 'Address issues within 2-3 days' :
          'Monitor field conditions closely',
          'Schedule follow-up analysis in 5-7 days',
          'Consider on-site inspection of affected areas'
        ]
      };

      // Save stress detection as satellite data
      await prisma.satelliteData.create({
        data: {
          fieldId: params.fieldId,
          captureDate: new Date(date),
          ndvi: result.spectralAnalysis.indices.ndvi,
          stressLevel: result.overallStress.level.toUpperCase() as any,
          imageUrl: null
        }
      });

      return createSuccessResponse({
        data: result,
        summary,
        parameters: {
          fieldId: params.fieldId,
          date,
          cropType: params.options.cropType,
          growthStage: params.options.growthStage,
          analysisDepth: params.options.analysisDepth || 'standard'
        },
        message: `Stress detection completed - ${result.overallStress.level} stress detected`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);

// GET /api/satellite/stress?fieldId=123&date=2024-01-15
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const user = await getCurrentUser();
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const fieldId = searchParams.get('fieldId');
      const date = searchParams.get('date');
      const historicalDays = parseInt(searchParams.get('historicalDays') || '30');

      if (!fieldId) {
        throw new ValidationError('fieldId parameter is required');
      }

      // Verify field access
      const field = await prisma.field.findFirst({
        where: {
          id: fieldId,
          farm: {
            ownerId: user.id
          }
        }
      });

      if (!field) {
        throw new ValidationError('Field not found or access denied');
      }

      if (date) {
        // Get specific stress analysis from satellite data
        const analysis = await prisma.satelliteData.findFirst({
          where: {
            fieldId,
            captureDate: {
              gte: new Date(date + 'T00:00:00Z'),
              lt: new Date(date + 'T23:59:59Z')
            }
          },
          orderBy: {
            captureDate: 'desc'
          }
        });

        if (!analysis) {
          throw new ValidationError('No stress analysis found for the specified date');
        }

        return createSuccessResponse({
          data: {
            fieldId: analysis.fieldId,
            captureDate: analysis.captureDate,
            ndvi: analysis.ndvi,
            stressLevel: analysis.stressLevel,
            imageUrl: analysis.imageUrl
          },
          summary: {
            fieldId,
            fieldName: field.name,
            analysisDate: date,
            recordId: analysis.id,
            captureDate: analysis.captureDate
          },
          message: 'Stress analysis retrieved successfully'
        });
      } else {
        // Get historical stress analyses from satellite data
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - historicalDays);

        const analyses = await prisma.satelliteData.findMany({
          where: {
            fieldId,
            captureDate: {
              gte: startDate
            }
          },
          orderBy: {
            captureDate: 'desc'
          },
          take: 10 // Limit to last 10 analyses
        });

        // Extract stress trends
        const stressTrend = analyses.map(a => ({
          date: a.captureDate.toISOString().split('T')[0],
          overallStress: a.stressLevel.toLowerCase(),
          ndvi: a.ndvi,
          affectedPercentage: a.stressLevel === 'NONE' ? 0 : 
                             a.stressLevel === 'LOW' ? 20 :
                             a.stressLevel === 'MODERATE' ? 40 :
                             a.stressLevel === 'HIGH' ? 60 : 80
        }));

        return createSuccessResponse({
          data: {
            fieldId,
            fieldName: field.name,
            analyses: analyses.map(a => ({
              id: a.id,
              date: a.captureDate.toISOString().split('T')[0],
              overallStress: a.stressLevel.toLowerCase(),
              ndvi: a.ndvi,
              imageUrl: a.imageUrl
            })),
            trend: stressTrend,
            summary: {
              totalAnalyses: analyses.length,
              latestStressLevel: stressTrend[0]?.overallStress || 'none',
              averageNdvi: analyses.length > 0 ?
                (analyses.reduce((sum, a) => sum + a.ndvi, 0) / analyses.length).toFixed(3) :
                '0.000',
              averageAffectedArea: stressTrend.length > 0 ?
                (stressTrend.reduce((sum, t) => sum + t.affectedPercentage, 0) / stressTrend.length).toFixed(1) + '%' :
                '0%'
            }
          },
          message: `Retrieved ${analyses.length} stress analyses from the last ${historicalDays} days`
        });
      }

    } catch (error) {
      return handleApiError(error);
    }
  })
);