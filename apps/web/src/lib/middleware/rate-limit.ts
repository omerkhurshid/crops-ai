/**
 * Rate Limiting Middleware
 * 
 * Provides request rate limiting functionality for API endpoints
 */
import { NextRequest } from 'next/server'
interface RateLimitResult {
  success: boolean
  remaining?: number
  resetTime?: number
  error?: string
}
interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
/**
 * Rate limiting function for API endpoints
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = { maxRequests: 100, windowMs: 60000 }
): Promise<RateLimitResult> {
  const clientId = getClientId(request)
  const now = Date.now()
  // Clean up expired entries
  const expiredKeys = Array.from(rateLimitStore.entries())
    .filter(([_, data]) => data.resetTime < now)
    .map(([key]) => key)
  expiredKeys.forEach(key => rateLimitStore.delete(key))
  // Get or create client data
  const clientData = rateLimitStore.get(clientId)
  if (!clientData || clientData.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + options.windowMs
    })
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs
    }
  }
  // Increment count
  clientData.count++
  if (clientData.count > options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: clientData.resetTime,
      error: `Rate limit exceeded. Max ${options.maxRequests} requests per ${options.windowMs / 1000} seconds.`
    }
  }
  return {
    success: true,
    remaining: options.maxRequests - clientData.count,
    resetTime: clientData.resetTime
  }
}
function getClientId(request: NextRequest): string {
  // Get client IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             request.headers.get('remote-addr') ||
             'unknown'
  // You can add user ID here if authenticated
  const userId = request.headers.get('user-id')
  return userId ? `user:${userId}` : `ip:${ip}`
}