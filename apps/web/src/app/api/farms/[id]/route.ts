import { NextRequest } from 'next/server'
import { prisma } from '@crops-ai/database'
import { createSuccessResponse, NotFoundError, AuthorizationError } from '@/lib/api/errors'
import { validateRequestBody, validatePathParam, updateFarmSchema } from '@/lib/api/validation'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '@/lib/api/middleware'

interface RouteContext {
  params: { id: string }
}

// GET /api/farms/[id] - Get farm by ID
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest, { params }: RouteContext) => {
    const farmId = validatePathParam(params.id, 'id')

    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        managers: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        fields: {
          select: {
            id: true,
            name: true,
            area: true,
            soilType: true,
            crops: {
              where: {
                status: {
                  in: ['PLANTED', 'GROWING', 'READY_TO_HARVEST']
                }
              },
              select: {
                id: true,
                cropType: true,
                variety: true,
                status: true,
                plantingDate: true,
                expectedHarvestDate: true
              }
            }
          }
        }
      }
    })

    if (!farm) {
      throw new NotFoundError('Farm not found')
    }

    // Check access permissions
    const hasAccess = request.user.role === 'ADMIN' ||
                     farm.ownerId === request.user.id ||
                     farm.managers.some((m: any) => m.user.id === request.user.id)

    if (!hasAccess) {
      throw new AuthorizationError('Access denied to this farm')
    }

    return createSuccessResponse(farm)
  })
)

// PATCH /api/farms/[id] - Update farm
export const PATCH = apiMiddleware.protected(
  withMethods(['PATCH'], async (request: AuthenticatedRequest, { params }: RouteContext) => {
    const farmId = validatePathParam(params.id, 'id')
    const body = await request.json()
    const updateData = validateRequestBody(updateFarmSchema, body)

    // Check if user owns the farm or is admin
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true }
    })

    if (!farm) {
      throw new NotFoundError('Farm not found')
    }

    if (request.user.role !== 'ADMIN' && farm.ownerId !== request.user.id) {
      throw new AuthorizationError('Only farm owners can update farm details')
    }

    const updatedFarm = await prisma.farm.update({
      where: { id: farmId },
      data: updateData,
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

    return createSuccessResponse(updatedFarm)
  })
)

// DELETE /api/farms/[id] - Delete farm
export const DELETE = apiMiddleware.protected(
  withMethods(['DELETE'], async (request: AuthenticatedRequest, { params }: RouteContext) => {
    const farmId = validatePathParam(params.id, 'id')

    // Check if user owns the farm or is admin
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true }
    })

    if (!farm) {
      throw new NotFoundError('Farm not found')
    }

    if (request.user.role !== 'ADMIN' && farm.ownerId !== request.user.id) {
      throw new AuthorizationError('Only farm owners can delete farms')
    }

    await prisma.farm.delete({
      where: { id: farmId }
    })

    return createSuccessResponse({ message: 'Farm deleted successfully' })
  })
)