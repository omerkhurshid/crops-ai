import { NextResponse } from 'next/server'
// Logger replaced with console for local development
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
export class ValidationError extends ApiError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}
export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}
interface ErrorResponse {
  error: {
    message: string
    code?: string
    field?: string
    timestamp: string
    requestId?: string
  }
}
export function handleApiError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  // Log the error
  console.error('API Error', error instanceof Error ? error : new Error(String(error)), {
    requestId
  })
  // Handle known error types
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          field: error instanceof ValidationError ? error.field : undefined,
          timestamp: new Date().toISOString(),
          requestId
        }
      },
      { status: error.statusCode }
    )
  }
  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: {
              message: 'A record with this value already exists',
              code: 'UNIQUE_CONSTRAINT_ERROR',
              timestamp: new Date().toISOString(),
              requestId
            }
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: {
              message: 'Record not found',
              code: 'NOT_FOUND_ERROR',
              timestamp: new Date().toISOString(),
              requestId
            }
          },
          { status: 404 }
        )
    }
  }
  // Handle unexpected errors
  return NextResponse.json(
    {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        requestId
      }
    },
    { status: 500 }
  )
}
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status })
}