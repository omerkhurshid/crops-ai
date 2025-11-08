import { prisma } from './prisma'
import * as Sentry from '@sentry/nextjs'
export interface DatabasePerformanceMetrics {
  queryCount: number
  averageResponseTime: number
  slowQueries: Array<{
    query: string
    duration: number
    timestamp: Date
  }>
  connectionPoolStatus: {
    activeConnections: number
    idleConnections: number
    totalConnections: number
  }
}
class DatabaseMonitor {
  private queryTimes: Array<{ query: string; duration: number; timestamp: Date }> = []
  private queryCount = 0
  private readonly slowQueryThreshold = 1000 // 1 second
  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    try {
      const result = await queryFn()
      const duration = Date.now() - startTime
      this.queryCount++
      this.queryTimes.push({
        query: queryName,
        duration,
        timestamp: new Date()
      })
      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        Sentry.addBreadcrumb({
          message: `Slow database query: ${queryName}`,
          level: 'warning',
          data: {
            duration,
            query: queryName
          }
        })
      }
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      Sentry.captureException(error, {
        tags: {
          component: 'database',
          query: queryName
        },
        extra: {
          duration,
          query: queryName
        }
      })
      throw error
    }
  }
  getMetrics(): DatabasePerformanceMetrics {
    const now = Date.now()
    const recentQueries = this.queryTimes.filter(
      q => now - q.timestamp.getTime() < 60000 // Last minute
    )
    const averageResponseTime = recentQueries.length > 0
      ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length
      : 0
    const slowQueries = this.queryTimes
      .filter(q => q.duration > this.slowQueryThreshold)
      .slice(-10) // Last 10 slow queries
    return {
      queryCount: this.queryCount,
      averageResponseTime: Math.round(averageResponseTime),
      slowQueries,
      connectionPoolStatus: {
        activeConnections: 0, // Would need actual pool monitoring
        idleConnections: 0,
        totalConnections: 0
      }
    }
  }
  reset(): void {
    this.queryTimes = []
    this.queryCount = 0
  }
}
export const dbMonitor = new DatabaseMonitor()
// Helper function to wrap database queries with monitoring
export async function monitoredQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return dbMonitor.measureQuery(queryName, queryFn)
}
// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  error?: string
}> {
  const startTime = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime
    return {
      status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
      responseTime
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    Sentry.captureException(error, {
      tags: {
        component: 'database',
        healthCheck: true
      }
    })
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}