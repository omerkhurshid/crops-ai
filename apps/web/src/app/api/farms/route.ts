import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createSuccessResponse } from '../../../lib/api/errors'
import { validateRequestBody, validateQueryParams, createFarmSchema, paginationSchema } from '../../../lib/api/validation'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../lib/api/middleware'

// GET /api/farms - List farms with pagination
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest) => {
    const { searchParams } = new URL(request.url)
    const pagination = validateQueryParams(
      paginationSchema,
      Object.fromEntries(searchParams)
    )
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = pagination

    const skip = (page - 1) * limit
    const orderBy = sortBy ? { [sortBy]: sortOrder as 'asc' | 'desc' } : { createdAt: 'desc' as const }

    // Filter farms based on user role
    const where = request.user.role === 'ADMIN' ? {} : {
      OR: [
        { ownerId: request.user.id },
        { managers: { some: { userId: request.user.id } } }
      ]
    }

    const [farms, total] = await Promise.all([
      prisma.farm.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              fields: true,
              managers: true
            }
          }
        }
      }),
      prisma.farm.count({ where })
    ])

    return createSuccessResponse({
      farms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  })
)

// POST /api/farms - Create new farm
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: AuthenticatedRequest) => {
    try {
      console.log('=== FARM CREATION START ===')
      console.log('User:', {
        id: request.user.id,
        email: request.user.email,
        role: request.user.role
      })

      const body = await request.json()
      console.log('Request body:', JSON.stringify(body, null, 2))
      
      const farmData = validateRequestBody(createFarmSchema, body)
      console.log('Validated farm data:', JSON.stringify(farmData, null, 2))

      // Remove fields that don't exist in current schema
      const { farmType, description, ...dbFarmData } = farmData
      
      const finalData = {
        ...dbFarmData,
        ownerId: request.user.id,
        location: `${dbFarmData.name} (${dbFarmData.latitude}, ${dbFarmData.longitude})` // Add location field
      }
      console.log('Final data for database:', JSON.stringify(finalData, null, 2))
      
      const farm = await prisma.farm.create({
        data: finalData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      console.log('Farm created successfully:', JSON.stringify(farm, null, 2))
      return createSuccessResponse({ farm }, 201)
    } catch (error) {
      console.error('=== FARM CREATION ERROR ===')
      console.error('Error:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      throw error // Re-throw to let middleware handle it
    }
  })
)