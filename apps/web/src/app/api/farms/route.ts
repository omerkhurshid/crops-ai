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
    const body = await request.json()
    const farmData = validateRequestBody(createFarmSchema, body)

    // Remove fields that don't exist in current schema
    const { farmType, description, ...dbFarmData } = farmData
    
    const farm = await prisma.farm.create({
      data: {
        ...dbFarmData,
        ownerId: request.user.id
      },
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

    return createSuccessResponse({ farm }, 201)
  })
)