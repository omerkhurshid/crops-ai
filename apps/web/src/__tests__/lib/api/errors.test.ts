/**
 * @jest-environment node
 */
import { 
  ApiError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ConflictError, 
  RateLimitError,
  handleApiError,
  createSuccessResponse
} from '../../../lib/api/errors'

// Mock the Logger
jest.mock('@crops-ai/shared', () => ({
  Logger: {
    error: jest.fn(),
  }
}))

describe('API Error Classes', () => {
  describe('ApiError', () => {
    it('should create basic API error', () => {
      const error = new ApiError('Test error', 500, 'TEST_ERROR')
      
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('TEST_ERROR')
      expect(error.name).toBe('ApiError')
    })

    it('should use default status code 500', () => {
      const error = new ApiError('Test error')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with field', () => {
      const error = new ValidationError('Invalid email format', 'email')
      
      expect(error.message).toBe('Invalid email format')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.field).toBe('email')
      expect(error.name).toBe('ValidationError')
    })
  })

  describe('AuthenticationError', () => {
    it('should create authentication error with default message', () => {
      const error = new AuthenticationError()
      
      expect(error.message).toBe('Authentication required')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('AUTHENTICATION_ERROR')
      expect(error.name).toBe('AuthenticationError')
    })

    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Invalid token')
      
      expect(error.message).toBe('Invalid token')
      expect(error.statusCode).toBe(401)
    })
  })

  describe('AuthorizationError', () => {
    it('should create authorization error', () => {
      const error = new AuthorizationError('Access denied')
      
      expect(error.message).toBe('Access denied')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('AUTHORIZATION_ERROR')
      expect(error.name).toBe('AuthorizationError')
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('Resource not found')
      
      expect(error.message).toBe('Resource not found')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND_ERROR')
      expect(error.name).toBe('NotFoundError')
    })
  })

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Resource already exists')
      
      expect(error.message).toBe('Resource already exists')
      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('CONFLICT_ERROR')
      expect(error.name).toBe('ConflictError')
    })
  })

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError('Too many requests')
      
      expect(error.message).toBe('Too many requests')
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_ERROR')
      expect(error.name).toBe('RateLimitError')
    })
  })
})

describe('handleApiError', () => {
  it('should handle ApiError correctly', async () => {
    const error = new ValidationError('Invalid input', 'email')
    const response = handleApiError(error, 'test-request-id')
    const responseBody = await response.json()
    
    expect(response.status).toBe(400)
    expect(responseBody.error.message).toBe('Invalid input')
    expect(responseBody.error.code).toBe('VALIDATION_ERROR')
    expect(responseBody.error.field).toBe('email')
    expect(responseBody.error.requestId).toBe('test-request-id')
    expect(responseBody.error.timestamp).toBeDefined()
  })

  it('should handle Prisma P2002 error (unique constraint)', async () => {
    const prismaError = {
      code: 'P2002',
      meta: { target: ['email'] }
    }
    
    const response = handleApiError(prismaError)
    const responseBody = await response.json()
    
    expect(response.status).toBe(409)
    expect(responseBody.error.message).toBe('A record with this value already exists')
    expect(responseBody.error.code).toBe('UNIQUE_CONSTRAINT_ERROR')
  })

  it('should handle Prisma P2025 error (record not found)', async () => {
    const prismaError = {
      code: 'P2025',
    }
    
    const response = handleApiError(prismaError)
    const responseBody = await response.json()
    
    expect(response.status).toBe(404)
    expect(responseBody.error.message).toBe('Record not found')
    expect(responseBody.error.code).toBe('NOT_FOUND_ERROR')
  })

  it('should handle unknown errors as internal server error', async () => {
    const unknownError = new Error('Something went wrong')
    
    const response = handleApiError(unknownError)
    const responseBody = await response.json()
    
    expect(response.status).toBe(500)
    expect(responseBody.error.message).toBe('Internal server error')
    expect(responseBody.error.code).toBe('INTERNAL_ERROR')
  })

  it('should handle non-Error objects', async () => {
    const stringError = 'Simple string error'
    
    const response = handleApiError(stringError)
    const responseBody = await response.json()
    
    expect(response.status).toBe(500)
    expect(responseBody.error.message).toBe('Internal server error')
    expect(responseBody.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('createSuccessResponse', () => {
  it('should create success response with default status 200', async () => {
    const data = { message: 'Success', id: 123 }
    const response = createSuccessResponse(data)
    const responseBody = await response.json()
    
    expect(response.status).toBe(200)
    expect(responseBody).toEqual(data)
  })

  it('should create success response with custom status', async () => {
    const data = { message: 'Created', id: 456 }
    const response = createSuccessResponse(data, 201)
    const responseBody = await response.json()
    
    expect(response.status).toBe(201)
    expect(responseBody).toEqual(data)
  })

  it('should handle null/undefined data', async () => {
    const response = createSuccessResponse(null)
    const responseBody = await response.json()
    
    expect(response.status).toBe(200)
    expect(responseBody).toBeNull()
  })
})