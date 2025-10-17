/**
 * Real Queue Management System
 * Production-ready queue system for satellite processing and background tasks
 */

import { prisma } from '../prisma'

export interface QueueJob {
  id: string
  queueName: string
  jobType: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  priority: number
  data?: any
  result?: any
  error?: string
  attempts: number
  maxAttempts: number
  startedAt?: Date
  completedAt?: Date
  failedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface QueueMetrics {
  pending: number
  processing: number
  completed: number
  failed: number
  queued: number
  totalJobs: number
  avgProcessingTime?: number
  successRate: number
  failureRate: number
}

export interface QueueHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  queueBacklog: number
  processingCapacity: number
  avgWaitTime: number
  errorRate: number
  lastProcessedAt?: Date
}

export class QueueManager {
  private queueName: string

  constructor(queueName: string = 'default') {
    this.queueName = queueName
  }

  /**
   * Add a new job to the queue
   */
  async addJob(
    jobType: string,
    data: any,
    options: {
      priority?: number
      maxAttempts?: number
      delay?: number
    } = {}
  ): Promise<string> {
    try {
      const job = await prisma.queueJob.create({
        data: {
          queueName: this.queueName,
          jobType,
          status: 'pending',
          priority: options.priority || 0,
          data,
          maxAttempts: options.maxAttempts || 3,
          attempts: 0
        }
      })

      // Update daily metrics
      await this.updateDailyMetrics()

      return job.id
    } catch (error) {
      console.error('Error adding job to queue:', error)
      throw error
    }
  }

  /**
   * Get the next job to process
   */
  async getNextJob(): Promise<QueueJob | null> {
    try {
      // Get highest priority pending job
      const job = await prisma.queueJob.findFirst({
        where: {
          queueName: this.queueName,
          status: 'pending'
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      })

      if (!job) return null

      // Mark as processing
      const updatedJob = await prisma.queueJob.update({
        where: { id: job.id },
        data: {
          status: 'processing',
          startedAt: new Date(),
          attempts: job.attempts + 1
        }
      })

      return updatedJob as QueueJob
    } catch (error) {
      console.error('Error getting next job:', error)
      return null
    }
  }

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string, result?: any): Promise<boolean> {
    try {
      const job = await prisma.queueJob.findUnique({ where: { id: jobId } })
      if (!job) return false

      await prisma.queueJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          result,
          completedAt: new Date()
        }
      })

      await this.updateDailyMetrics()
      return true
    } catch (error) {
      console.error('Error completing job:', error)
      return false
    }
  }

  /**
   * Mark job as failed
   */
  async failJob(jobId: string, error: string): Promise<boolean> {
    try {
      const job = await prisma.queueJob.findUnique({ where: { id: jobId } })
      if (!job) return false

      const shouldRetry = job.attempts < job.maxAttempts

      await prisma.queueJob.update({
        where: { id: jobId },
        data: {
          status: shouldRetry ? 'pending' : 'failed',
          error,
          failedAt: shouldRetry ? undefined : new Date()
        }
      })

      await this.updateDailyMetrics()
      return true
    } catch (error) {
      console.error('Error failing job:', error)
      return false
    }
  }

  /**
   * Get current queue metrics
   */
  async getMetrics(): Promise<QueueMetrics> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get counts by status
      const statusCounts = await prisma.queueJob.groupBy({
        by: ['status'],
        where: {
          queueName: this.queueName,
          createdAt: { gte: today }
        },
        _count: { id: true }
      })

      const counts = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      }

      statusCounts.forEach(group => {
        counts[group.status as keyof typeof counts] = group._count.id
      })

      const totalJobs = Object.values(counts).reduce((sum, count) => sum + count, 0)
      const queued = counts.pending + counts.processing

      // Calculate average processing time for completed jobs
      const completedJobs = await prisma.queueJob.findMany({
        where: {
          queueName: this.queueName,
          status: 'completed',
          startedAt: { not: null },
          completedAt: { not: null },
          createdAt: { gte: today }
        },
        select: {
          startedAt: true,
          completedAt: true
        }
      })

      let avgProcessingTime: number | undefined
      if (completedJobs.length > 0) {
        const totalProcessingTime = completedJobs.reduce((sum, job) => {
          if (job.startedAt && job.completedAt) {
            return sum + (job.completedAt.getTime() - job.startedAt.getTime())
          }
          return sum
        }, 0)
        avgProcessingTime = totalProcessingTime / completedJobs.length
      }

      const successRate = totalJobs > 0 ? (counts.completed / totalJobs) * 100 : 0
      const failureRate = totalJobs > 0 ? (counts.failed / totalJobs) * 100 : 0

      return {
        pending: counts.pending,
        processing: counts.processing,
        completed: counts.completed,
        failed: counts.failed,
        queued,
        totalJobs,
        avgProcessingTime,
        successRate,
        failureRate
      }
    } catch (error) {
      console.error('Error getting queue metrics:', error)
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        queued: 0,
        totalJobs: 0,
        successRate: 0,
        failureRate: 0
      }
    }
  }

  /**
   * Get queue health status
   */
  async getHealth(): Promise<QueueHealth> {
    try {
      const metrics = await this.getMetrics()
      
      // Get the oldest pending job to calculate wait time
      const oldestPendingJob = await prisma.queueJob.findFirst({
        where: {
          queueName: this.queueName,
          status: 'pending'
        },
        orderBy: { createdAt: 'asc' }
      })

      const avgWaitTime = oldestPendingJob 
        ? Date.now() - oldestPendingJob.createdAt.getTime()
        : 0

      // Get last processed job
      const lastProcessedJob = await prisma.queueJob.findFirst({
        where: {
          queueName: this.queueName,
          status: 'completed'
        },
        orderBy: { completedAt: 'desc' }
      })

      // Determine health status
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      
      if (metrics.failureRate > 20) {
        status = 'unhealthy'
      } else if (metrics.queued > 100 || avgWaitTime > 300000) { // 5 minutes
        status = 'degraded'
      }

      return {
        status,
        queueBacklog: metrics.queued,
        processingCapacity: metrics.processing,
        avgWaitTime,
        errorRate: metrics.failureRate,
        lastProcessedAt: lastProcessedJob?.completedAt
      }
    } catch (error) {
      console.error('Error getting queue health:', error)
      return {
        status: 'unhealthy',
        queueBacklog: 0,
        processingCapacity: 0,
        avgWaitTime: 0,
        errorRate: 100
      }
    }
  }

  /**
   * Update daily metrics
   */
  private async updateDailyMetrics(): Promise<void> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const metrics = await this.getMetrics()

      await prisma.queueMetrics.upsert({
        where: {
          queueName_date: {
            queueName: this.queueName,
            date: today
          }
        },
        update: {
          totalJobs: metrics.totalJobs,
          completedJobs: metrics.completed,
          failedJobs: metrics.failed,
          pendingJobs: metrics.pending,
          processingJobs: metrics.processing,
          avgProcessingTime: metrics.avgProcessingTime
        },
        create: {
          queueName: this.queueName,
          date: today,
          totalJobs: metrics.totalJobs,
          completedJobs: metrics.completed,
          failedJobs: metrics.failed,
          pendingJobs: metrics.pending,
          processingJobs: metrics.processing,
          avgProcessingTime: metrics.avgProcessingTime
        }
      })
    } catch (error) {
      console.error('Error updating daily metrics:', error)
    }
  }

  /**
   * Clean up old completed jobs
   */
  async cleanup(daysToKeep: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const result = await prisma.queueJob.deleteMany({
        where: {
          queueName: this.queueName,
          status: { in: ['completed', 'failed'] },
          updatedAt: { lt: cutoffDate }
        }
      })

      return result.count
    } catch (error) {
      console.error('Error cleaning up queue:', error)
      return 0
    }
  }

  /**
   * Retry failed jobs
   */
  async retryFailedJobs(maxAge?: Date): Promise<number> {
    try {
      const whereClause: any = {
        queueName: this.queueName,
        status: 'failed'
      }

      if (maxAge) {
        whereClause.failedAt = { gte: maxAge }
      }

      const result = await prisma.queueJob.updateMany({
        where: whereClause,
        data: {
          status: 'pending',
          error: null,
          failedAt: null,
          attempts: 0
        }
      })

      await this.updateDailyMetrics()
      return result.count
    } catch (error) {
      console.error('Error retrying failed jobs:', error)
      return 0
    }
  }
}

// Export singleton instances for common queues
export const satelliteQueue = new QueueManager('satellite-processing')
export const weatherQueue = new QueueManager('weather-updates')
export const reportQueue = new QueueManager('report-generation')
export const notificationQueue = new QueueManager('notifications')