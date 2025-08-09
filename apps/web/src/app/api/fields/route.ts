import { NextRequest } from 'next/server'
import { getCurrentUser } from '../../../lib/auth/session'
import { createSuccessResponse, handleApiError, ValidationError } from '../../../lib/api/errors'
import { apiMiddleware, withMethods } from '../../../lib/api/middleware'
import { prisma } from '../../../lib/prisma'

// GET /api/fields - Get user's fields
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const user = await getCurrentUser()
      
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

      // Note: isActive field doesn't exist in current schema
      // All fields are considered active for now

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
          activeFields: transformedFields.length, // All fields considered active
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
      const { farmId, name, area, soilType, cropType, description, latitude, longitude, boundary } = body

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
      const field = await prisma.field.create({
        data: {
          farmId,
          name,
          area: parseFloat(area) || 0,
          soilType: soilType || null,
          // Note: boundary would need additional schema changes to store properly
          // cropType, description, and coordinates are not in Field schema
          // cropType should be handled via Crop model separately
        },
        include: {
          farm: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

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
          console.warn('Failed to create crop, but field was created:', cropError)
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