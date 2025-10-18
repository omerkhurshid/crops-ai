import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

// Check if Redis is available and properly configured
const isRedisAvailable = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token && !url.startsWith('YOUR_') && url.startsWith('https://')
}

// Create Redis instance only if properly configured
const createRedis = () => {
  if (!isRedisAvailable()) {
    return null
  }
  try {
    return Redis.fromEnv()
  } catch (error) {
    console.warn('Failed to create Redis client:', error)
    return null
  }
}

const redis = createRedis()

// Create a new ratelimiter that allows 30 requests per 60 seconds
const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
}) : null

// Rate limit configurations for different endpoints
const rateLimitConfigs = {
  // Authentication endpoints - stricter limits
  auth: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
    analytics: true,
    prefix: 'auth',
  }) : null,
  
  // API endpoints - standard limits
  api: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(150, '1 m'), // 150 requests per minute
    analytics: true,
    prefix: 'api',
  }) : null,
  
  // Write operations - moderate limits
  write: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 writes per minute
    analytics: true,
    prefix: 'write',
  }) : null,
  
  // Heavy operations (satellite, ML) - more permissive limits
  heavy: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'), // 50 requests per minute
    analytics: true,
    prefix: 'heavy',
  }) : null,
}

export async function rateLimit(
  request: NextRequest,
  type: 'auth' | 'api' | 'write' | 'heavy' = 'api'
) {
  // If Redis is not available, allow all requests
  if (!redis) {
    return {
      success: true,
      limit: 1000,
      reset: Date.now() + 60000,
      remaining: 999,
      headers: {
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '999',
        'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
      },
    }
  }

  // Get the IP address from the request
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
  
  // Use the appropriate rate limiter based on type
  const limiter = rateLimitConfigs[type] || rateLimitConfigs.api
  
  if (!limiter) {
    // Fallback if specific limiter is not available
    return {
      success: true,
      limit: 1000,
      reset: Date.now() + 60000,
      remaining: 999,
      headers: {
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '999',
        'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
      },
    }
  }
  
  // Check the rate limit
  const { success, limit, reset, remaining } = await limiter.limit(ip)
  
  return {
    success,
    limit,
    reset,
    remaining,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    },
  }
}

// Middleware helper to apply rate limiting
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<Response>,
  type: 'auth' | 'api' | 'write' | 'heavy' = 'api'
) {
  const { success, headers } = await rateLimit(request, type)
  
  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': headers['X-RateLimit-Reset'],
        'Content-Type': 'text/plain',
      },
    })
  }
  
  // Execute the handler and add rate limit headers to the response
  const response = await handler()
  
  // Add rate limit headers to the response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Simple in-memory rate limiter for development/fallback
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly windowMs: number
  private readonly maxRequests: number
  
  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }
  
  async limit(key: string) {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: Math.min(...validRequests) + this.windowMs,
      }
    }
    
    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - validRequests.length,
      reset: now + this.windowMs,
    }
  }
}

// Fallback rate limiter for when Redis is not available
const fallbackLimiters = {
  auth: new InMemoryRateLimiter(5, 15 * 60 * 1000), // 5 per 15 min
  api: new InMemoryRateLimiter(150, 60 * 1000), // 150 per min
  write: new InMemoryRateLimiter(60, 60 * 1000), // 60 per min
  heavy: new InMemoryRateLimiter(50, 60 * 1000), // 50 per min
}

// Rate limit function with fallback
export async function rateLimitWithFallback(
  request: NextRequest,
  type: 'auth' | 'api' | 'write' | 'heavy' = 'api'
) {
  try {
    // Try to use Redis-based rate limiter
    return await rateLimit(request, type)
  } catch (error) {
    // Fallback to in-memory rate limiter

    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
    const limiter = fallbackLimiters[type]
    const result = await limiter.limit(ip)
    
    return {
      ...result,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      },
    }
  }
}