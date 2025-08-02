import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/session'
import { createSuccessResponse, handleApiError } from '@/lib/api/errors'
import { validateRequestBody } from '@/lib/api/validation'
import { apiMiddleware, withMethods } from '@/lib/api/middleware'
import { prisma } from '@crops-ai/database'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email format').optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})

// GET /api/auth/profile - Get current user profile
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const user = await requireAuth(request)

      const profile = await prisma.user.findUnique({
        where: { id: user.id },
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
      })

      if (!profile) {
        throw new Error('User profile not found')
      }

      return createSuccessResponse({
        user: profile
      })

    } catch (error) {
      return handleApiError(error)
    }
  })
)

// PATCH /api/auth/profile - Update current user profile
export const PATCH = apiMiddleware.protected(
  withMethods(['PATCH'], async (request: NextRequest) => {
    try {
      const user = await requireAuth(request)
      const body = await request.json()
      const updateData = validateRequestBody(updateProfileSchema, body)

      // If email is being updated, check for uniqueness
      if (updateData.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: updateData.email,
            id: { not: user.id }
          }
        })

        if (existingUser) {
          throw new Error('Email already in use by another user')
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
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
      })

      return createSuccessResponse({
        user: updatedUser,
        message: 'Profile updated successfully'
      })

    } catch (error) {
      return handleApiError(error)
    }
  })
)