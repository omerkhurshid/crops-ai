import { NextRequest } from 'next/server'
import { createSuccessResponse, handleApiError } from '../../../lib/api/errors'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../lib/api/middleware'

// DEPRECATED: Users now managed via Supabase Auth only
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest) => {
    return handleApiError(new Error('User management moved to Supabase Auth. This endpoint is deprecated.'))
    const { searchParams } = new URL(request.url)
    const pagination = validateQueryParams(
      paginationSchema,
      Object.fromEntries(searchParams)
    )
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = pagination
    const skip = (page - 1) * limit
    const orderBy = sortBy ? { [sortBy]: sortOrder as 'asc' | 'desc' } : { createdAt: 'desc' as const }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              ownedFarms: true,
              managedFarms: true
            }
          }
        }
      }),
      prisma.user.count()
    ])
    return createSuccessResponse({
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  })
)
// POST /api/users - Create new user
export const POST = apiMiddleware.admin(
  withMethods(['POST'], async (request: AuthenticatedRequest) => {
    const body = await request.json()
    const userData = validateRequestBody(createUserSchema, body)
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
    return createSuccessResponse(user, 201)
  })
)