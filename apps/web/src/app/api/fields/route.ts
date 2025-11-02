import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '../../../lib/auth/server'
import { createSuccessResponse, handleApiError, ValidationError } from '../../../lib/api/errors'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../lib/api/middleware'
import { prisma } from '../../../lib/prisma'

// GET /api/fields - Get user's fields
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const user = await getAuthenticatedUser(request)
      
      if (!user) {
        throw new ValidationError('User authentication required')
      }

      const { searchParams } = new URL(request.url)
      const farmId = searchParams.get('farmId')
      const includeInactive = searchParams.get('includeInactive') === 'true'

      // Build query conditions
      const whereConditions: any = {
        farm: { ownerId: user.id }
      }

      if (farmId) {
        whereConditions.farmId = farmId
      }

      // Filter by active status unless explicitly including inactive fields
      if (!includeInactive) {
        whereConditions.isActive = true
      }

      // Fetch fields with farm information
      const fields = await prisma.field.findMany({
        where: whereConditions,
        include: {
          farm: {
            select: {
              id: true,
              name: true
            }
          },
          satelliteData: {
            select: {
              captureDate: true,
              ndvi: true,
              stressLevel: true
            },
            orderBy: { captureDate: 'desc' },
            take: 1 // Latest data only
          }
        },
        orderBy: [
          { farm: { name: 'asc' } },
          { name: 'asc' }
        ]
      })

      // Transform data for frontend use
      const transformedFields = fields.map(field => ({
        id: field.id,
        name: field.name,
        farmId: field.farmId,
        farmName: field.farm?.name || 'Unknown Farm',
        area: field.area,
        soilType: field.soilType,
        isActive: field.isActive,
        createdAt: field.createdAt,
        displayName: `${field.farm?.name || 'Unknown'} - ${field.name}`,
        lastAnalysis: field.satelliteData?.[0] ? {
          date: field.satelliteData[0].captureDate,
          ndvi: field.satelliteData[0].ndvi,
          stressLevel: field.satelliteData[0].stressLevel?.toLowerCase()
        } : null
      }))

      // Group by farm for better organization
      const fieldsByFarm = transformedFields.reduce((acc: any, field) => {
        const farmName = field.farmName
        if (!acc[farmName]) {
          acc[farmName] = []
        }
        acc[farmName].push(field)
        return acc
      }, {})

      return createSuccessResponse({
        fields: transformedFields,
        fieldsByFarm,
        summary: {
          totalFields: transformedFields.length,
          activeFields: transformedFields.filter(field => field.isActive).length,
          farmsCount: Object.keys(fieldsByFarm).length,
          totalArea: transformedFields.reduce((sum, field) => sum + (field.area || 0), 0)
        },
        message: `Retrieved ${transformedFields.length} fields`
      })

    } catch (error) {
      return handleApiError(error)
    }
  })
)

// POST /api/fields - Create new field
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: any) => {
    try {

      const body = await request.json()

      const { farmId, name, area, soilType, cropType, description, latitude, longitude, boundary, color } = body

      // Basic validation
      if (!farmId) {
        throw new ValidationError('Farm ID is required')
      }
      if (!name || name.trim() === '') {
        throw new ValidationError('Field name is required')
      }
      if (!area || isNaN(parseFloat(area)) || parseFloat(area) <= 0) {
        throw new ValidationError('Valid area is required')
      }

      // Verify farm ownership

      const farm = await prisma.farm.findFirst({
        where: {
          id: farmId,
          ownerId: request.user.id
        }
      })

      if (!farm) {

        throw new ValidationError('Farm not found or access denied')
      }

      // Create new field

      // Create field using Prisma, omitting the boundary field
      const fieldData: any = {
        farmId,
        name: name.trim(),
        area: parseFloat(area),
        soilType: soilType || null,
        color: color || null,
        cropType: cropType || null,
        status: 'active',
        isActive: true  // Fields are auto-default as active
      };
      
      const field = await prisma.field.create({
        data: fieldData,
        include: {
          farm: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      
      // If boundary coordinates are provided, update with PostGIS geography using raw SQL
      if (boundary && Array.isArray(boundary) && boundary.length >= 3) {
        try {
          // Convert boundary array to WKT polygon format
          const wktCoordinates = boundary.map((point: any) => `${point.lng} ${point.lat}`).join(', ');
          const wktPolygon = `POLYGON((${wktCoordinates}, ${boundary[0].lng} ${boundary[0].lat}))`; // Close the polygon
          
          await prisma.$executeRaw`
            UPDATE fields 
            SET boundary = ST_GeogFromText(${wktPolygon})
            WHERE id = ${field.id}
          `;

        } catch (boundaryError) {

          // Continue without boundary - field was created successfully
        }
      }

      if (!field) {
        throw new Error('Failed to create field');
      }

      // Create crop if cropType was provided
      let crop = null
      if (cropType) {
        try {
          const currentYear = new Date().getFullYear()
          const defaultPlantingDate = new Date(currentYear, 3, 1) // April 1st
          const defaultHarvestDate = new Date(currentYear, 8, 15) // September 15th

          crop = await prisma.crop.create({
            data: {
              fieldId: field.id,
              cropType,
              plantingDate: defaultPlantingDate,
              expectedHarvestDate: defaultHarvestDate,
              status: 'PLANNED'
            }
          })
        } catch (cropError) {

          // Field creation succeeded, so we don't throw here
        }
      }

      return createSuccessResponse({
        field: {
          id: field.id,
          name: field.name,
          farmId: field.farmId,
          farmName: field.farm?.name,
          area: field.area,
          soilType: field.soilType,
          cropType: crop?.cropType || null,
          createdAt: field.createdAt
        },
        message: 'Field created successfully' + (crop ? ' with crop plan' : '')
      })

    } catch (error) {
      return handleApiError(error)
    }
  })
)

// PATCH /api/fields - Update field (toggle active status)
export const PATCH = apiMiddleware.protected(
  withMethods(['PATCH'], async (request: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { fieldId, isActive } = body

      if (!fieldId) {
        throw new ValidationError('Field ID is required')
      }

      if (typeof isActive !== 'boolean') {
        throw new ValidationError('isActive must be a boolean value')
      }

      // Verify field ownership through farm ownership
      const field = await prisma.field.findFirst({
        where: {
          id: fieldId,
          farm: {
            ownerId: request.user.id
          }
        },
        include: {
          farm: {
            select: {
              name: true
            }
          }
        }
      })

      if (!field) {
        throw new ValidationError('Field not found or access denied')
      }

      // Update field active status
      const updatedField = await prisma.field.update({
        where: { id: fieldId },
        data: { isActive },
        include: {
          farm: {
            select: {
              name: true
            }
          }
        }
      })

      return createSuccessResponse({
        field: {
          id: updatedField.id,
          name: updatedField.name,
          farmName: updatedField.farm?.name,
          isActive: updatedField.isActive
        },
        message: `Field ${isActive ? 'activated' : 'deactivated'} successfully`
      })

    } catch (error) {
      return handleApiError(error)
    }
  })
)