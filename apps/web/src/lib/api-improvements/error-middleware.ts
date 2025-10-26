// Enhanced Error Handling Middleware
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export class APIError extends Error {
  statusCode?: number
  code?: string
  constructor(message: string, statusCode?: number, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  statusCode = 400
  code = 'VALIDATION_ERROR'
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends APIError {
  statusCode = 401
  code = 'AUTHENTICATION_ERROR'
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  statusCode = 403
  code = 'AUTHORIZATION_ERROR'
  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error implements APIError {
  statusCode = 404
  code = 'NOT_FOUND'
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends Error implements APIError {
  statusCode = 429
  code = 'RATE_LIMIT_EXCEEDED'
  constructor(message: string = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class InternalServerError extends Error implements APIError {
  statusCode = 500
  code = 'INTERNAL_SERVER_ERROR'
  constructor(message: string = 'Internal server error') {
    super(message)
    this.name = 'InternalServerError'
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof z.ZodError) {
    return NextResponse.json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.errors,
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }

  if (error instanceof ValidationError) {
    return NextResponse.json({
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString()
    }, { status: error.statusCode })
  }

  if (error instanceof APIError) {
    return NextResponse.json({
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: error.statusCode })
  }

  // Generic error fallback
  return NextResponse.json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  }, { status: 500 })
}

export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleAPIError(error)
    }
  }
}

// Usage example:
/*
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Your route logic here
  // Throw custom errors as needed:
  // throw new ValidationError('Invalid input')
  // throw new NotFoundError('User not found')
  // throw new AuthenticationError()
  
  return NextResponse.json({ success: true })
})
*/