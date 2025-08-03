import { NextRequest } from 'next/server'
import { prisma } from '@crops-ai/database'
import { CacheService } from '@crops-ai/shared'
import { createSuccessResponse } from '../../lib/api/errors'
import { apiMiddleware, withMethods } from '../../lib/api/middleware'

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