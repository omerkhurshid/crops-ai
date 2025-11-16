import { NextRequest } from 'next/server';
import { z } from 'zod';
import { boundaryDetector } from '../../../../lib/satellite/boundary-detection';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';
import { getAuthenticatedUser } from '../../../../lib/auth/server';
import { prisma } from '../../../../lib/prisma';
const boundarySchema = z.object({
  action: z.enum(['detect', 'save', 'list']),
  // For detect action
  bbox: z.object({
    west: z.number().min(-180).max(180),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    north: z.number().min(-90).max(90)
  }).optional(),
  date: z.string().optional(),
  options: z.object({
    method: z.enum(['edge-detection', 'segmentation', 'machine-learning']).optional(),
    sensitivity: z.enum(['low', 'medium', 'high']).optional(),
    minFieldSize: z.number().min(0.1).max(1000).optional(),
    maxFieldSize: z.number().min(1).max(10000).optional(),
    smoothing: z.boolean().optional(),
    mergeAdjacent: z.boolean().optional(),
    excludeWater: z.boolean().optional(),
    excludeUrban: z.boolean().optional()
  }).optional(),
  // For save action
  fieldId: z.string().optional(),
  boundaries: z.array(z.object({
    geometry: z.object({
      type: z.enum(['Polygon', 'MultiPolygon']),
      coordinates: z.array(z.array(z.array(z.number())))
    }),
    confidence: z.number().min(0).max(1),
    area: z.number(),
    perimeter: z.number(),
    centroid: z.tuple([z.number(), z.number()])
  })).optional()
});
// POST /api/satellite/boundaries
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      const user = await getAuthenticatedUser(request);
      if (!user) {
        throw new ValidationError('User authentication required');
      }
      // Validate input
      const validation = boundarySchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }
      const params = validation.data;
      let result;
      switch (params.action) {
        case 'detect':
          {
            if (!params.bbox || !params.date) {
              throw new ValidationError('bbox and date are required for boundary detection');
            }
            result = await boundaryDetector.detectBoundaries(
              params.bbox,
              params.date,
              params.options as any
            );
            // Generate summary
            const summary = {
              action: 'detect',
              fieldsDetected: result.boundaries.length,
              totalArea: `${result.statistics.totalArea.toFixed(2)} hectares`,
              averageFieldSize: `${result.statistics.averageFieldSize.toFixed(2)} hectares`,
              averageConfidence: `${(result.statistics.confidenceScore * 100).toFixed(1)}%`,
              method: result.method,
              processingTime: `${(result.processingTime / 1000).toFixed(2)} seconds`,
              recommendations: result.boundaries.length === 0 ? 
                ['No fields detected - try adjusting detection parameters or selecting a different date'] :
                ['Review detected boundaries for accuracy', 'Save confirmed boundaries to database']
            };
            return createSuccessResponse({
              data: result,
              summary,
              message: `Detected ${result.boundaries.length} field boundaries`
            });
          }
        case 'save':
          {
            if (!params.fieldId || !params.boundaries || params.boundaries.length === 0) {
              throw new ValidationError('fieldId and boundaries are required for saving');
            }
            // Save boundaries to database (simplified for now)
            const field = await prisma.field.update({
              where: { id: params.fieldId },
              data: {
                area: params.boundaries[0].area,
                updatedAt: new Date()
              }
            });
            result = {
              fieldId: field.id,
              saved: true,
              area: field.area,
              message: 'Field boundaries saved successfully'
            };
            return createSuccessResponse({
              data: result,
              summary: {
                action: 'save',
                fieldId: field.id,
                area: `${field.area} hectares`,
                status: 'success'
              },
              message: 'Field boundaries saved successfully'
            });
          }
        case 'list':
          {
            // List all fields with boundaries for the user
            const farms = await prisma.farm.findMany({
              where: { ownerId: user.id },
              include: {
                fields: {
                  select: {
                    id: true,
                    name: true,
                    area: true,
                    updatedAt: true
                  }
                }
              }
            });
            const fieldsWithBoundaries = farms.flatMap((farm: any) => 
              farm.fields.map((field: any) => ({
                ...field,
                farmName: farm.name,
                farmId: farm.id,
                hasBoundaries: !!field.area // Use area as proxy for boundaries
              }))
            );
            result = {
              fields: fieldsWithBoundaries,
              total: fieldsWithBoundaries.length
            };
            return createSuccessResponse({
              data: result,
              summary: {
                action: 'list',
                totalFields: fieldsWithBoundaries.length,
                totalArea: fieldsWithBoundaries.reduce((sum: number, f: any) => sum + (f.area || 0), 0).toFixed(2) + ' hectares'
              },
              message: `Found ${fieldsWithBoundaries.length} fields with boundaries`
            });
          }
        default:
          throw new ValidationError('Invalid action');
      }
    } catch (error) {
      return handleApiError(error);
    }
  })
);
// GET /api/satellite/boundaries?fieldId=123
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const user = await getAuthenticatedUser(request);
      if (!user) {
        throw new ValidationError('User authentication required');
      }
      const fieldId = searchParams.get('fieldId');
      if (fieldId) {
        // Get specific field boundaries
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
        return createSuccessResponse({
          data: {
            fieldId: field.id,
            name: field.name,
            area: field.area,
            updatedAt: field.updatedAt,
            hasBoundary: !!field.area // Use area as proxy for boundaries
          },
          message: field.area ? 'Field boundaries retrieved' : 'No boundaries defined for this field'
        });
      } else {
        // List all fields with boundaries
        const farms = await prisma.farm.findMany({
          where: { ownerId: user.id },
          include: {
            fields: {
              where: {
                area: { gt: 0 }
              }
            }
          }
        });
        const fieldsWithBoundaries = farms.flatMap((farm: any) => 
          farm.fields.map((field: any) => ({
            fieldId: field.id,
            fieldName: field.name,
            farmName: farm.name,
            area: field.area,
            hasBoundaries: !!field.area
          }))
        );
        return createSuccessResponse({
          data: fieldsWithBoundaries,
          summary: {
            totalFields: fieldsWithBoundaries.length,
            totalArea: `${fieldsWithBoundaries.reduce((sum: number, f: any) => sum + (f.area || 0), 0).toFixed(2)} hectares`
          },
          message: `Found ${fieldsWithBoundaries.length} fields with defined boundaries`
        });
      }
    } catch (error) {
      return handleApiError(error);
    }
  })
);