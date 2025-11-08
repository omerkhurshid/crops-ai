import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { createSuccessResponse, NotFoundError } from '../../../../lib/api/errors'
import { validateRequestBody, validatePathParam, updateUserSchema } from '../../../../lib/api/validation'
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware'
interface RouteContext {
  params: { id: string }
}
// GET /api/users/[id] - Get user by ID
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest, { params }: RouteContext) => {
    const userId = validatePathParam(params.id, 'id')
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ownedFarms: {
          select: {
            id: true,
            name: true,
            totalArea: true
          }
        },
        managedFarms: {
          select: {
            farm: {
              select: {
                id: true,
                name: true,
                totalArea: true
              }
            }
          }
        }
      }
    })
    if (!user) {
      throw new NotFoundError('User not found')
    }
    return createSuccessResponse(user)
  })
)
// PATCH /api/users/[id] - Update user
export const PATCH = apiMiddleware.protected(
  withMethods(['PATCH'], async (request: NextRequest, { params }: RouteContext) => {
    const userId = validatePathParam(params.id, 'id')
    const body = await request.json()
    const updateData = validateRequestBody(updateUserSchema, body)
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
    return createSuccessResponse(user)
  })
)
// DELETE /api/users/[id] - Delete user
export const DELETE = apiMiddleware.admin(
  withMethods(['DELETE'], async (request: NextRequest, { params }: RouteContext) => {
    const userId = validatePathParam(params.id, 'id')
    await prisma.user.delete({
      where: { id: userId }
    })
    return createSuccessResponse({ message: 'User deleted successfully' })
  })
)