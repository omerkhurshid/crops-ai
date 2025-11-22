import { NextRequest } from 'next/server'
import { handleApiError } from '../../../../lib/api/errors'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../../lib/api/middleware'

interface RouteContext {
  params: { id: string }
}

// DEPRECATED: Users now managed via Supabase Auth only
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest, { params }: RouteContext) => {
    return handleApiError(new Error('User management moved to Supabase Auth. This endpoint is deprecated.'))
  })
)

// DEPRECATED: Users now managed via Supabase Auth only  
export const PATCH = apiMiddleware.protected(
  withMethods(['PATCH'], async (request: AuthenticatedRequest, { params }: RouteContext) => {
    return handleApiError(new Error('User management moved to Supabase Auth. This endpoint is deprecated.'))
  })
)

// DEPRECATED: Users now managed via Supabase Auth only
export const DELETE = apiMiddleware.admin(
  withMethods(['DELETE'], async (request: AuthenticatedRequest, { params }: RouteContext) => {
    return handleApiError(new Error('User management moved to Supabase Auth. This endpoint is deprecated.'))
  })
)