import { NextRequest } from 'next/server'
import { z } from 'zod'
import { AuthUtils } from '@/lib/auth/utils'
import { requireAuth } from '@/lib/auth/session'
import { createSuccessResponse, handleApiError, ValidationError } from '@/lib/api/errors'
import { validateRequestBody } from '@/lib/api/validation'
import { apiMiddleware, withMethods } from '@/lib/api/middleware'
import { prisma } from '@crops-ai/database'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirmation don't match",
  path: ["confirmPassword"]
})

// POST /api/auth/change-password - Change user password
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const user = await requireAuth(request)
      const body = await request.json()
      const { currentPassword, newPassword } = validateRequestBody(changePasswordSchema, body)

      // Get current user with password hash
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true }
      })

      if (!currentUser?.passwordHash) {
        throw new ValidationError('User has no password set')
      }

      // Verify current password
      const isCurrentPasswordValid = await AuthUtils.verifyPassword(
        currentPassword, 
        currentUser.passwordHash
      )

      if (!isCurrentPasswordValid) {
        throw new ValidationError('Current password is incorrect')
      }

      // Validate new password strength
      const passwordValidation = AuthUtils.validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        throw new ValidationError(
          `Password validation failed: ${passwordValidation.errors.join(', ')}`
        )
      }

      // Update password
      await AuthUtils.updatePassword(user.id, newPassword)

      return createSuccessResponse({
        message: 'Password changed successfully'
      })

    } catch (error) {
      return handleApiError(error)
    }
  })
)