import { NextRequest } from 'next/server';
import { z } from 'zod';
import { queueManager } from '../../../lib/satellite/queue-manager';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../lib/api/middleware';
import { getCurrentUser } from '../../../lib/auth/session';

const queueActionSchema = z.object({
  action: z.enum(['start', 'stop', 'status', 'metrics', 'retry-process']),
  workerId: z.string().optional()
});

// POST /api/satellite/queue
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      const user = await getCurrentUser();
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      // Validate input
      const validation = queueActionSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const params = validation.data;
      let result;

      switch (params.action) {
        case 'start':
          {
            await queueManager.startProcessing();
            result = {
              action: 'start',
              status: 'success',
              message: 'Queue processing started',
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'stop':
          {
            await queueManager.stopProcessing();
            result = {
              action: 'stop',
              status: 'success',
              message: 'Queue processing stopped',
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'retry-process':
          {
            await queueManager.processRetries();
            result = {
              action: 'retry-process',
              status: 'success',
              message: 'Retry queue processed',
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'status':
          {
            const metrics = await queueManager.getMetrics();
            result = {
              action: 'status',
              queueStatus: 'running', // TODO: Track actual status
              metrics,
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'metrics':
          {
            const metrics = await queueManager.getMetrics();
            result = {
              action: 'metrics',
              metrics,
              performance: {
                throughput: metrics.throughput,
                avgProcessingTime: metrics.avgProcessingTime,
                errorRate: metrics.failed / (metrics.completed + metrics.failed) * 100 || 0,
                retryRate: metrics.retries / (metrics.completed + metrics.failed + metrics.retries) * 100 || 0
              },
              timestamp: new Date().toISOString()
            };
          }
          break;

        default:
          throw new ValidationError('Invalid action');
      }

      // Generate response summary
      const summary = {
        action: params.action,
        status: 'success',
        queueMetrics: params.action === 'metrics' || params.action === 'status' ? 
          (result as any).metrics : undefined,
        message: `Queue ${params.action} completed successfully`
      };

      return createSuccessResponse({
        data: result,
        summary,
        action: params.action,
        message: `Queue ${params.action} executed successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);

// GET /api/satellite/queue?action=status&jobId=123
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const user = await getCurrentUser();
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const action = searchParams.get('action') || 'status';
      const jobId = searchParams.get('jobId');

      let result;

      switch (action) {
        case 'status':
          {
            const metrics = await queueManager.getMetrics();
            result = {
              queueStatus: 'running', // TODO: Track actual status
              metrics,
              healthCheck: {
                redis: true, // TODO: Add actual health checks
                processing: metrics.processing > 0,
                lastActivity: new Date().toISOString()
              }
            };
          }
          break;

        case 'progress':
          {
            if (!jobId) {
              throw new ValidationError('jobId parameter is required for progress action');
            }

            const progress = await queueManager.getProgress(jobId);
            if (!progress) {
              throw new ValidationError('Job not found or progress not available');
            }

            result = {
              jobId,
              progress: progress.progress,
              status: progress.status,
              currentStep: progress.currentStep,
              retryCount: progress.retryCount,
              lastError: progress.lastError,
              estimatedTimeRemaining: progress.estimatedTimeRemaining
            };
          }
          break;

        case 'metrics':
          {
            const metrics = await queueManager.getMetrics();
            const totalJobs = metrics.completed + metrics.failed + metrics.processing + metrics.queued;
            
            result = {
              current: metrics,
              derived: {
                totalJobs,
                successRate: totalJobs > 0 ? (metrics.completed / totalJobs * 100).toFixed(1) + '%' : '0%',
                failureRate: totalJobs > 0 ? (metrics.failed / totalJobs * 100).toFixed(1) + '%' : '0%',
                utilizationRate: metrics.processing > 0 ? '100%' : '0%', // TODO: Calculate based on workers
                queueBacklog: metrics.queued
              },
              trends: {
                // TODO: Implement trending data over time
                hourlyThroughput: 0,
                dailyAverage: 0,
                peakHours: []
              }
            };
          }
          break;

        default:
          throw new ValidationError('Invalid action. Supported actions: status, progress, metrics');
      }

      return createSuccessResponse({
        data: result,
        summary: {
          action,
          jobId,
          timestamp: new Date().toISOString(),
          queueHealth: 'healthy' // TODO: Determine based on metrics
        },
        message: `Queue ${action} retrieved successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);