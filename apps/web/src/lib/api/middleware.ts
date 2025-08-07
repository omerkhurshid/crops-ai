import { NextRequest } from 'next/server'
import { Logger, PerformanceMonitor } from '@crops-ai/shared'
import { AuthenticationError, AuthorizationError, RateLimitError } from './errors'
import { UserRole } from '@crops-ai/shared'

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

// Rate limiting middleware (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  handler: any,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 100, windowMs: 60000 }
) {
  return async (request: NextRequest, context?: any): Promise<Response> => {
    const clientId = getClientId(request)
    const now = Date.now()
    const windowStart = now - options.windowMs
    
    // Clean up old entries
    const entries = Array.from(rateLimitMap.entries())
    for (const [key, value] of entries) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }
    
    const clientData = rateLimitMap.get(clientId) || { count: 0, resetTime: now + options.windowMs }
    
    if (clientData.resetTime < now) {
      // Reset window
      clientData.count = 1
      clientData.resetTime = now + options.windowMs
    } else {
      clientData.count++
    }
    
    rateLimitMap.set(clientId, clientData)
    
    if (clientData.count > options.maxRequests) {
      throw new RateLimitError(`Rate limit exceeded. Max ${options.maxRequests} requests per ${options.windowMs / 1000} seconds`)
    }
    
    if (context) {
      return handler(request, context)
    } else {
      return handler(request)
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
    // Try NextAuth JWT token first
    const { getToken } = await import('next-auth/jwt')
    
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    
    if (token && token.email) {
      return {
        id: token.id as string,
        email: token.email,
        name: token.name || 'Unknown User',
        role: token.role as UserRole
      }
    }

    // Fallback to session cookie (same logic as getCurrentUser)
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie) {
      return null
    }

    try {
      const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      
      // Check if session is expired
      if (Date.now() > sessionData.exp) {
        return null
      }

      return {
        id: sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role as UserRole
      }
    } catch (cookieError) {
      Logger.error('Error parsing session cookie', cookieError)
      return null
    }
  } catch (error) {
    Logger.error('Authentication error', error)
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
    withRequestId(withErrorHandling(withPerformanceMonitoring(withRateLimit(handler)))),
  
  // Protected API requiring authentication
  protected: (handler: any) =>
    withRequestId(withErrorHandling(withPerformanceMonitoring(withRateLimit(withAuth(handler))))),
  
  // Admin-only API
  admin: (handler: any) =>
    withRequestId(withErrorHandling(withPerformanceMonitoring(withRateLimit(withRoles([UserRole.ADMIN], handler)))))
}