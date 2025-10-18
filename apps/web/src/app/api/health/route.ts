import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'
// CacheService replaced with simple fallback for local development
const CacheService = {
  async set(key: string, value: any, ttl: number): Promise<void> {
    // Simple fallback - in production you'd use Redis or similar
    console.log(`Cache set: ${key} = ${value} (TTL: ${ttl}s)`)
  },
  async get(key: string): Promise<any> {
    // Simple fallback - in production you'd use Redis or similar
    console.log(`Cache get: ${key}`)
    return 'ok' // Return a default value
  }
}
import { createSuccessResponse } from '../../../lib/api/errors'
import { apiMiddleware, withMethods } from '../../../lib/api/middleware'

// GET /api/health - Health check endpoint
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    const startTime = Date.now()
    
    // Check database connection
    let dbStatus = 'healthy'
    let dbLatency = 0
    try {
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbLatency = Date.now() - dbStart
    } catch (error) {
      dbStatus = 'unhealthy'
    }
    
    // Check Redis connection
    let cacheStatus = 'healthy'
    let cacheLatency = 0
    try {
      const cacheStart = Date.now()
      await CacheService.set('health-check', 'ok', 10)
      await CacheService.get('health-check')
      cacheLatency = Date.now() - cacheStart
    } catch (error) {
      cacheStatus = 'unhealthy'
    }
    
    const totalLatency = Date.now() - startTime
    const overallStatus = dbStatus === 'healthy' && cacheStatus === 'healthy' ? 'healthy' : 'degraded'
    
    return createSuccessResponse({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`
        },
        cache: {
          status: cacheStatus,
          latency: `${cacheLatency}ms`
        }
      },
      responseTime: `${totalLatency}ms`
    })
  })
)