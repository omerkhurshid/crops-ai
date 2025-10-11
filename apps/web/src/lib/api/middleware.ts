import { NextRequest } from 'next/server'
import { Logger, PerformanceMonitor } from '@crops-ai/shared'
import { AuthenticationError, AuthorizationError, RateLimitError } from './errors'
import { UserRole } from '@crops-ai/shared'
import { z } from 'zod'
import { validateRequest } from './validation-schemas'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

// Request ID middleware
export function withRequestId(handler: any) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    const requestId = generateRequestId()
    Logger.setContext({ requestId })
    
    try {
      if (context) {
        return await handler(request, context, requestId)
      } else {
        return await handler(request, requestId)
      }
    } finally {
      Logger.clearContext()
    }
  }
}

// Performance monitoring middleware
export function withPerformanceMonitoring(handler: any, metricName?: string) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    const metric = metricName || `${request.method} ${request.nextUrl.pathname}`
    
    return PerformanceMonitor.measureAsync(metric, async () => {
      if (context) {
        return handler(request, context)
      } else {
        return handler(request)
      }
    })
  }
}

// Error handling middleware
export function withErrorHandling(handler: any) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    try {
      if (context) {
        return await handler(request, context)
      } else {
        return await handler(request)
      }
    } catch (error) {
      const { handleApiError } = await import('./errors')
      return handleApiError(error)
    }
  }
}

// Rate limiting middleware using Upstash Redis
export function withRateLimit(
  handler: any,
  type: 'auth' | 'api' | 'write' | 'heavy' = 'api'
) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    try {
      const { rateLimitWithFallback } = await import('../rate-limit')
      const { success, headers } = await rateLimitWithFallback(request, type)
      
      if (!success) {
        throw new RateLimitError('Rate limit exceeded')
      }
      
      // Execute handler and add rate limit headers
      let response: Response
      if (context) {
        response = await handler(request, context)
      } else {
        response = await handler(request)
      }
      
      // Add rate limit headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error
      }
      // If rate limiting fails, log and continue (fail open)
      console.error('Rate limiting error:', error)
      if (context) {
        return handler(request, context)
      } else {
        return handler(request)
      }
    }
  }
}

// Authentication middleware
export function withAuth(handler: any) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    const user = await authenticateRequest(request)
    
    if (!user) {
      throw new AuthenticationError()
    }
    
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user
    
    if (context) {
      return handler(authenticatedRequest, context)
    } else {
      return handler(authenticatedRequest)
    }
  }
}

// Authorization middleware
export function withRoles(allowedRoles: UserRole[], handler: any) {
  return withAuth(async (request: AuthenticatedRequest, context?: any) => {
    if (!allowedRoles.includes(request.user.role)) {
      throw new AuthorizationError(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
    }
    
    if (context) {
      return handler(request, context)
    } else {
      return handler(request)
    }
  })
}

// Method validation middleware
export function withMethods(allowedMethods: string[], handler: any) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    if (!allowedMethods.includes(request.method)) {
      return new Response(
        JSON.stringify({ error: { message: 'Method not allowed' } }),
        { 
          status: 405, 
          headers: { 
            'Content-Type': 'application/json',
            'Allow': allowedMethods.join(', ')
          } 
        }
      )
    }
    
    if (context) {
      return handler(request, context)
    } else {
      return handler(request)
    }
  }
}

// Input validation middleware
export function withValidation<T>(schema: z.ZodSchema<T>, handler: any) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    try {
      // Parse request body or query params based on method
      let data: unknown
      
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          data = await request.json()
        } catch {
          data = {}
        }
      } else {
        // For GET requests, parse query params
        const searchParams = request.nextUrl.searchParams
        data = Object.fromEntries(searchParams.entries())
      }
      
      // Validate the data
      const validatedData = await validateRequest(schema, data)
      
      // Attach validated data to request
      ;(request as any).validatedData = validatedData
      
      if (context) {
        return handler(request, context)
      } else {
        return handler(request)
      }
    } catch (error) {
      const { handleApiError } = await import('./errors')
      return handleApiError(error)
    }
  }
}

// Combine multiple middlewares
export function withMiddleware<T>(
  ...middlewares: Array<(handler: any) => any>
) {
  return (handler: (request: NextRequest, context: T) => Promise<Response>) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// Generic middleware type
type MiddlewareHandler<T = unknown> = (request: NextRequest, context: T) => Promise<Response>
type AuthenticatedMiddlewareHandler<T = unknown> = (request: AuthenticatedRequest, context: T) => Promise<Response>

// Helper functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getClientId(request: NextRequest): string {
  // In production, you might want to use a more sophisticated approach
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown'
  return ip
}

async function authenticateRequest(request: NextRequest): Promise<{
  id: string
  email: string
  name: string
  role: UserRole
} | null> {
  try {
    console.log('🔍 Authenticating request in middleware')
    
    // Get the session token from cookies (same logic as our session endpoint)
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
    
    const token = request.cookies.get(cookieName)?.value
    console.log('🎫 Token found in middleware:', !!token)
    
    if (!token) {
      console.log('❌ No token found in middleware')
      return null
    }
    
    // Decode NextAuth JWT token using the same method as our session endpoint
    const { decode } = await import('next-auth/jwt')
    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!
    })
    
    if (!decoded) {
      console.log('❌ Token decode failed in middleware')
      return null
    }
    
    console.log('✅ User authenticated in middleware:', { id: decoded.id, email: decoded.email })
    
    return {
      id: decoded.id as string,
      email: decoded.email as string,
      name: decoded.name as string,
      role: decoded.role as UserRole
    }
  } catch (error) {
    console.error('❌ Authentication error in middleware:', error)
    return null
  }
}

// Common API patterns
export const apiMiddleware = {
  // Basic API with error handling and performance monitoring
  basic: (handler: any) => 
    withRequestId(withErrorHandling(withPerformanceMonitoring(handler))),
  
  // Public API with rate limiting
  public: (handler: any) =>
    withRequestId(withErrorHandling(withPerformanceMonitoring(withRateLimit(handler, 'api')))),
  
  // Protected API requiring authentication with standard rate limits
  protected: (handler: any) =>
    withRequestId(withErrorHandling(withPerformanceMonitoring(withRateLimit(withAuth(handler), 'api')))),
  
  // Admin-only API with relaxed rate limits
  admin: (handler: any) =>
    withRequestId(withErrorHandling(withPerformanceMonitoring(withRateLimit(withRoles([UserRole.ADMIN], handler), 'heavy')))),
  
  // Auth endpoints with strict rate limits
  auth: (handler: any) =>
    withRequestId(withErrorHandling(withPerformanceMonitoring(withRateLimit(handler, 'auth')))),
  
  // Write operations with moderate rate limits
  write: (handler: any) =>
    withRequestId(withErrorHandling(withPerformanceMonitoring(withRateLimit(withAuth(handler), 'write')))),
  
  // Heavy operations (ML, satellite) with permissive rate limits
  heavy: (handler: any) =>
    withRequestId(withErrorHandling(withPerformanceMonitoring(withRateLimit(withAuth(handler), 'heavy'))))
}