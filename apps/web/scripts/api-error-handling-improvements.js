#!/usr/bin/env node

/**
 * API Error Handling Improvements Script
 * Analyzes and improves error handling coverage across all API endpoints
 */

const fs = require('fs')
const path = require('path')

class APIErrorHandlingImprover {
  constructor() {
    this.projectRoot = process.cwd()
    this.improvements = []
    this.statistics = {
      totalRoutes: 0,
      routesWithGoodErrorHandling: 0,
      routesNeedingImprovement: 0,
      routesWithValidation: 0,
      routesWithRateLimit: 0
    }
  }

  analyzeAPIRoutes() {
    console.log('🔍 Analyzing API Error Handling Coverage...\n')
    
    const apiRoutes = this.findAPIRoutes()
    this.statistics.totalRoutes = apiRoutes.length
    
    console.log(`Found ${apiRoutes.length} API routes to analyze\n`)
    
    apiRoutes.forEach(routePath => {
      this.analyzeRoute(routePath)
    })
    
    this.generateReport()
    this.implementImprovements()
  }

  findAPIRoutes() {
    const apiDir = path.join(this.projectRoot, 'src/app/api')
    const routes = []
    
    const scan = (dir) => {
      if (!fs.existsSync(dir)) return
      
      const items = fs.readdirSync(dir)
      items.forEach(item => {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          scan(fullPath)
        } else if (item === 'route.ts') {
          routes.push(fullPath)
        }
      })
    }
    
    scan(apiDir)
    return routes
  }

  analyzeRoute(routePath) {
    const relativePath = path.relative(this.projectRoot, routePath)
    const content = fs.readFileSync(routePath, 'utf8')
    
    const analysis = {
      path: relativePath,
      hasTryCatch: content.includes('try {') && content.includes('catch'),
      hasMiddleware: content.includes('apiMiddleware') || content.includes('withMethods'),
      hasValidation: content.includes('zod') || content.includes('schema') || content.includes('validate'),
      hasRateLimit: content.includes('rateLimit') || content.includes('rate-limit'),
      hasAuth: content.includes('auth') || content.includes('session') || content.includes('user'),
      hasProperErrorResponse: content.includes('NextResponse.json') && content.includes('error'),
      methods: this.extractHTTPMethods(content),
      issues: [],
      recommendations: []
    }
    
    // Determine if route has good error handling
    const hasGoodErrorHandling = analysis.hasTryCatch || analysis.hasMiddleware
    
    if (hasGoodErrorHandling) {
      this.statistics.routesWithGoodErrorHandling++
    } else {
      this.statistics.routesNeedingImprovement++
      analysis.issues.push('Missing try-catch blocks or error middleware')
      analysis.recommendations.push('Add comprehensive error handling')
    }
    
    if (analysis.hasValidation) {
      this.statistics.routesWithValidation++
    } else {
      analysis.issues.push('Missing input validation')
      analysis.recommendations.push('Add Zod schema validation')
    }
    
    if (analysis.hasRateLimit) {
      this.statistics.routesWithRateLimit++
    } else if (!analysis.path.includes('auth')) { // Auth routes may handle rate limiting differently
      analysis.issues.push('Missing rate limiting')
      analysis.recommendations.push('Add rate limiting for API protection')
    }
    
    // Check for specific error handling patterns
    if (!analysis.hasProperErrorResponse && !analysis.hasMiddleware) {
      analysis.issues.push('Inconsistent error response format')
      analysis.recommendations.push('Standardize error response format')
    }
    
    // Special checks for different route types
    if (analysis.path.includes('/api/auth/') && !content.includes('NextAuth')) {
      // Custom auth routes should have special security considerations
      if (!content.includes('password') || !content.includes('hash')) {
        analysis.recommendations.push('Ensure password security best practices')
      }
    }
    
    // Store analysis for reporting
    this.improvements.push(analysis)
    
    // Log progress
    const status = hasGoodErrorHandling ? '✅' : '⚠️'
    console.log(`${status} ${relativePath} - ${analysis.methods.join(', ')} - ${analysis.issues.length} issues`)
  }

  extractHTTPMethods(content) {
    const methods = []
    if (content.includes('export async function GET') || content.includes('export const GET')) methods.push('GET')
    if (content.includes('export async function POST') || content.includes('export const POST')) methods.push('POST')
    if (content.includes('export async function PUT') || content.includes('export const PUT')) methods.push('PUT')
    if (content.includes('export async function DELETE') || content.includes('export const DELETE')) methods.push('DELETE')
    if (content.includes('export async function PATCH') || content.includes('export const PATCH')) methods.push('PATCH')
    return methods
  }

  generateReport() {
    console.log('\\n📊 API Error Handling Analysis Report')
    console.log('═'.repeat(60))
    
    const coverage = (this.statistics.routesWithGoodErrorHandling / this.statistics.totalRoutes) * 100
    const validationCoverage = (this.statistics.routesWithValidation / this.statistics.totalRoutes) * 100
    const rateLimitCoverage = (this.statistics.routesWithRateLimit / this.statistics.totalRoutes) * 100
    
    console.log(`\\n📈 Coverage Statistics:`)
    console.log(`   Total API Routes: ${this.statistics.totalRoutes}`)
    console.log(`   ✅ Good Error Handling: ${this.statistics.routesWithGoodErrorHandling} (${coverage.toFixed(1)}%)`)
    console.log(`   ⚠️  Need Improvement: ${this.statistics.routesNeedingImprovement}`)
    console.log(`   🛡️  Input Validation: ${this.statistics.routesWithValidation} (${validationCoverage.toFixed(1)}%)`)
    console.log(`   🚦 Rate Limiting: ${this.statistics.routesWithRateLimit} (${rateLimitCoverage.toFixed(1)}%)`)
    
    console.log('\\n🔍 Routes Needing Improvement:')
    this.improvements
      .filter(route => route.issues.length > 0)
      .forEach(route => {
        console.log(`\\n   📁 ${route.path}`)
        console.log(`      Methods: ${route.methods.join(', ')}`)
        console.log(`      Issues: ${route.issues.length}`)
        route.issues.forEach(issue => {
          console.log(`        • ${issue}`)
        })
        console.log(`      Recommendations:`)
        route.recommendations.forEach(rec => {
          console.log(`        → ${rec}`)
        })
      })
    
    console.log('\\n💡 Priority Improvements:')
    if (coverage < 80) {
      console.log('   🚨 High Priority: Improve error handling coverage')
    }
    if (validationCoverage < 70) {
      console.log('   🚨 High Priority: Add input validation to more routes')
    }
    if (rateLimitCoverage < 60) {
      console.log('   ⚠️  Medium Priority: Implement rate limiting')
    }
    
    console.log('\\n🎯 Recommended Next Steps:')
    console.log('   1. Create standardized error handling middleware')
    console.log('   2. Add Zod validation schemas to all routes')
    console.log('   3. Implement rate limiting for public endpoints')
    console.log('   4. Create error response standardization')
    console.log('   5. Add request logging and monitoring')
  }

  implementImprovements() {
    console.log('\\n🔧 Implementing Automated Improvements...')
    
    // Create standard error handling middleware template
    this.createErrorMiddleware()
    
    // Create validation schema templates
    this.createValidationTemplates()
    
    // Create rate limiting setup
    this.createRateLimitingSetup()
    
    console.log('\\n✅ Improvement templates created!')
    console.log('\\nNext steps:')
    console.log('   1. Review generated templates in /lib/api-improvements/')
    console.log('   2. Apply templates to routes that need improvement')
    console.log('   3. Test all endpoints after applying changes')
    console.log('   4. Update API documentation')
  }

  createErrorMiddleware() {
    const middlewareDir = path.join(this.projectRoot, 'src/lib/api-improvements')
    if (!fs.existsSync(middlewareDir)) {
      fs.mkdirSync(middlewareDir, { recursive: true })
    }

    const errorMiddlewareContent = `// Enhanced Error Handling Middleware
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export interface APIError extends Error {
  statusCode?: number
  code?: string
}

export class ValidationError extends Error implements APIError {
  statusCode = 400
  code = 'VALIDATION_ERROR'
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error implements APIError {
  statusCode = 401
  code = 'AUTHENTICATION_ERROR'
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error implements APIError {
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
*/`

    fs.writeFileSync(
      path.join(middlewareDir, 'error-middleware.ts'),
      errorMiddlewareContent
    )
    console.log('   ✅ Created enhanced error handling middleware')
  }

  createValidationTemplates() {
    const middlewareDir = path.join(this.projectRoot, 'src/lib/api-improvements')
    
    const validationContent = `// Common Validation Schemas
import { z } from 'zod'

// Common field types
export const idSchema = z.string().cuid()
export const emailSchema = z.string().email()
export const phoneSchema = z.string().regex(/^\\+?[1-9]\\d{1,14}$/, 'Invalid phone number')
export const urlSchema = z.string().url()

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Common response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
  timestamp: z.string().datetime()
})

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.any().optional(),
  timestamp: z.string().datetime()
})

// Farm-related schemas
export const createFarmSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  size: z.number().positive(),
  type: z.enum(['CROP', 'LIVESTOCK', 'MIXED']),
  description: z.string().max(500).optional()
})

export const updateFarmSchema = createFarmSchema.partial()

// Field-related schemas
export const createFieldSchema = z.object({
  farmId: idSchema,
  name: z.string().min(1).max(100),
  area: z.number().positive(),
  soilType: z.string().min(1).max(50),
  coordinates: z.array(z.object({
    lat: z.number(),
    lng: z.number()
  })).min(3)
})

// Task-related schemas
export const createTaskSchema = z.object({
  farmId: idSchema,
  fieldId: idSchema.optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
  category: z.string().max(50).optional()
})

// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  return schema.parse(body)
}

// Helper function to validate query parameters
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: Record<string, string>): T {
  return schema.parse(params)
}

// Usage example:
/*
import { validateRequestBody, createFarmSchema } from '@/lib/api-improvements/validation-schemas'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validatedData = validateRequestBody(createFarmSchema, body)
  // ... rest of your logic
}
*/`

    fs.writeFileSync(
      path.join(path.join(this.projectRoot, 'src/lib/api-improvements'), 'validation-schemas.ts'),
      validationContent
    )
    console.log('   ✅ Created validation schema templates')
  }

  createRateLimitingSetup() {
    const middlewareDir = path.join(this.projectRoot, 'src/lib/api-improvements')
    
    const rateLimitContent = `// Enhanced Rate Limiting Setup
import { NextRequest } from 'next/server'
import { RateLimitError } from './error-middleware'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

// Default configurations for different endpoint types
export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later'
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many API requests, please slow down'
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: 10, // 10 uploads per minute
    message: 'Too many upload requests, please wait'
  },
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    message: 'Too many search requests, please slow down'
  }
}

class InMemoryRateLimit {
  private requests = new Map<string, { count: number; resetTime: number }>()

  async checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
    const now = Date.now()
    const key = identifier
    const windowEnd = now + config.windowMs
    
    const existing = this.requests.get(key)
    
    if (!existing || existing.resetTime <= now) {
      // First request or window expired
      this.requests.set(key, { count: 1, resetTime: windowEnd })
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        resetTime: windowEnd
      }
    }
    
    if (existing.count >= config.maxRequests) {
      // Limit exceeded
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: existing.resetTime
      }
    }
    
    // Increment count
    existing.count++
    this.requests.set(key, existing)
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - existing.count,
      resetTime: existing.resetTime
    }
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime <= now) {
        this.requests.delete(key)
      }
    }
  }
}

const rateLimit = new InMemoryRateLimit()

// Clean up every 5 minutes
setInterval(() => rateLimit.cleanup(), 5 * 60 * 1000)

export async function applyRateLimit(
  request: NextRequest,
  configType: keyof typeof rateLimitConfigs = 'api'
): Promise<void> {
  const config = rateLimitConfigs[configType]
  
  // Get identifier (IP address or user ID)
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const identifier = ip
  
  const result = await rateLimit.checkLimit(identifier, config)
  
  if (!result.success) {
    throw new RateLimitError(config.message)
  }
  
  // Note: In a real implementation, you might want to set response headers here
  // but since we're in middleware, that's handled by the error handler
}

// Wrapper function for easier usage
export function withRateLimit(configType: keyof typeof rateLimitConfigs = 'api') {
  return function<T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<Response>
  ) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
      await applyRateLimit(request, configType)
      return handler(request, ...args)
    }
  }
}

// Usage example:
/*
import { withRateLimit } from '@/lib/api-improvements/rate-limiting'
import { withErrorHandling } from '@/lib/api-improvements/error-middleware'

export const POST = withErrorHandling(
  withRateLimit('auth')(async (request: NextRequest) => {
    // Your authentication logic here
    return NextResponse.json({ success: true })
  })
)
*/`

    fs.writeFileSync(
      path.join(middlewareDir, 'rate-limiting.ts'),
      rateLimitContent
    )
    console.log('   ✅ Created rate limiting setup')
  }
}

// Run analysis if called directly
if (require.main === module) {
  const improver = new APIErrorHandlingImprover()
  improver.analyzeAPIRoutes()
}

module.exports = APIErrorHandlingImprover