// Enhanced Rate Limiting Setup
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
    // Convert Map entries to array to avoid iterator issues
    const entries = Array.from(this.requests.entries())
    for (const [key, value] of entries) {
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
*/