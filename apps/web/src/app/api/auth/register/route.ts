import { NextRequest } from 'next/server'
import { z } from 'zod'
import { AuthUtils } from '../../../lib/auth/utils'
import { createSuccessResponse, handleApiError, ValidationError } from '../../../lib/api/errors'
import { validateRequestBody } from '../../../lib/api/validation'
import { apiMiddleware, withMethods } from '../../../lib/api/middleware'
import { UserRole } from '@crops-ai/shared'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole).optional()
})

// POST /api/auth/register - Register new user
export const POST = apiMiddleware.basic(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { email, name, password, role } = validateRequestBody(registerSchema, body)

      // Validate password strength
      const passwordValidation = AuthUtils.validatePassword(password)
      if (!passwordValidation.isValid) {
        throw new ValidationError(
          `Password validation failed: ${passwordValidation.errors.join(', ')}`
        )
      }

      // Create user with hashed password
      const user = await AuthUtils.createUser({
        email,
        name,
        password,
        role: role || UserRole.FARM_OWNER
      })

      return createSuccessResponse({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt
        },
        message: 'User registered successfully'
      }, 201)

    } catch (error) {
      return handleApiError(error)
    }
  })
)