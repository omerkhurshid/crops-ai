import { NextRequest } from 'next/server'
import { handleApiError } from '../../../lib/api/errors'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../lib/api/middleware'

// DEPRECATED: Users now managed via Supabase Auth only
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest) => {
    return handleApiError(new Error('User management moved to Supabase Auth. This endpoint is deprecated.'))
  })
)

// DEPRECATED: Users now managed via Supabase Auth only  
export const POST = apiMiddleware.admin(
  withMethods(['POST'], async (request: AuthenticatedRequest) => {
    return handleApiError(new Error('User management moved to Supabase Auth. This endpoint is deprecated.'))
  })
)