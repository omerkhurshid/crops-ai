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
              name: true,
              type: true
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
        crop: field.crop,
        size: field.size,
        isActive: field.isActive,
        location: field.location,
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
          activeFields: transformedFields.filter(f => f.isActive).length,
          farmsCount: Object.keys(fieldsByFarm).length,
          crops: [...new Set(transformedFields.map(f => f.crop).filter(Boolean))]
        },
        message: `Retrieved ${transformedFields.length} fields`
      })

    } catch (error) {
      return handleApiError(error)
    }
  })
)

// POST /api/fields - Create new field (for future use)
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const user = await getCurrentUser()
      
      if (!user) {
        throw new ValidationError('User authentication required')
      }

      const body = await request.json()
      const { farmId, name, crop, size, location, perimeter } = body

      // Verify farm ownership
      const farm = await prisma.farm.findFirst({
        where: {
          id: farmId,
          ownerId: user.id
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
          crop,
          size: parseFloat(size) || 0,
          location: location || null,
          isActive: true,
          // Note: perimeter would need additional schema changes to store
        },
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      })

      return createSuccessResponse({
        field: {
          id: field.id,
          name: field.name,
          farmId: field.farmId,
          farmName: field.farm?.name,
          crop: field.crop,
          size: field.size,
          isActive: field.isActive,
          location: field.location,
          createdAt: field.createdAt
        },
        message: 'Field created successfully'
      })

    } catch (error) {
      return handleApiError(error)
    }
  })
)