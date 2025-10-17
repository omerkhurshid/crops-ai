import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';
import { satelliteQueue } from '../../../../lib/queue/queue-manager';

const queueActionSchema = z.object({
  action: z.enum(['status', 'metrics', 'add', 'process', 'detailed', 'health', 'cleanup', 'retry']),
  jobType: z.string().optional(),
  data: z.any().optional(),
  jobId: z.string().optional()
});

// POST /api/satellite/queue
export const POST = apiMiddleware.basic(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      
      const validation = queueActionSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const { action, jobType, data, jobId } = validation.data;
      let result: any;

      switch (action) {
        case 'add':
          {
            if (!jobType || !data) {
              throw new ValidationError('jobType and data are required for add action');
            }
            
            const newJobId = await satelliteQueue.addJob(jobType, data, {
              priority: data.priority || 0,
              maxAttempts: 3
            });
            
            result = {
              action: 'add',
              jobId: newJobId,
              jobType,
              status: 'queued',
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'process':
          {
            const nextJob = await satelliteQueue.getNextJob();
            if (nextJob) {
              try {
                // Simulate processing the job (in real implementation, this would do actual satellite processing)
                await new Promise(resolve => setTimeout(resolve, 1000));
                await satelliteQueue.completeJob(nextJob.id, { 
                  processedAt: new Date().toISOString(),
                  status: 'success'
                });
                result = {
                  action: 'process',
                  processed: true,
                  jobId: nextJob.id,
                  jobType: nextJob.jobType,
                  timestamp: new Date().toISOString()
                };
              } catch (error) {
                await satelliteQueue.failJob(nextJob.id, error instanceof Error ? error.message : 'Processing failed');
                result = {
                  action: 'process',
                  processed: false,
                  error: 'Job processing failed',
                  timestamp: new Date().toISOString()
                };
              }
            } else {
              result = {
                action: 'process',
                processed: false,
                message: 'No jobs available to process',
                timestamp: new Date().toISOString()
              };
            }
          }
          break;

        case 'status':
          {
            const metrics = await satelliteQueue.getMetrics();
            const health = await satelliteQueue.getHealth();
            result = {
              action: 'status',
              queueStatus: health.status === 'healthy' ? 'running' : 'degraded',
              metrics,
              health,
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'metrics':
          {
            const metrics = await satelliteQueue.getMetrics();
            const health = await satelliteQueue.getHealth();
            result = {
              queueStatus: health.status,
              metrics,
              healthCheck: {
                redis: true,
                processing: metrics.processing > 0,
                lastActivity: health.lastProcessedAt?.toISOString() || new Date().toISOString(),
                backlog: health.queueBacklog,
                avgWaitTime: health.avgWaitTime,
                errorRate: health.errorRate
              }
            };
          }
          break;

        case 'detailed':
          {
            const metrics = await satelliteQueue.getMetrics();
            const health = await satelliteQueue.getHealth();
            
            result = {
              queueStatus: health.status,
              metrics,
              health,
              derived: {
                totalJobs: metrics.totalJobs,
                successRate: metrics.successRate.toFixed(1) + '%',
                failureRate: metrics.failureRate.toFixed(1) + '%',
                utilizationRate: metrics.processing > 0 ? '100%' : '0%',
                queueBacklog: health.queueBacklog,
                avgProcessingTime: metrics.avgProcessingTime ? `${(metrics.avgProcessingTime / 1000).toFixed(2)}s` : 'N/A',
                avgWaitTime: `${(health.avgWaitTime / 1000).toFixed(2)}s`
              },
              trends: {
                errorRate: health.errorRate,
                lastProcessed: health.lastProcessedAt?.toISOString() || 'Never',
                processingCapacity: health.processingCapacity
              }
            };
          }
          break;

        case 'health':
          {
            const health = await satelliteQueue.getHealth();
            result = {
              action: 'health',
              health,
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'cleanup':
          {
            const cleaned = await satelliteQueue.cleanup(7); // Keep 7 days of completed jobs
            result = {
              action: 'cleanup',
              cleanedJobs: cleaned,
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'retry':
          {
            const retried = await satelliteQueue.retryFailedJobs();
            result = {
              action: 'retry',
              retriedJobs: retried,
              timestamp: new Date().toISOString()
            };
          }
          break;

        default:
          throw new ValidationError('Invalid action specified');
      }

      const health = await satelliteQueue.getHealth();

      return createSuccessResponse({
        data: result,
        summary: {
          action,
          jobId,
          timestamp: new Date().toISOString(),
          queueHealth: health.status
        },
        message: `Queue ${action} completed successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);

// GET /api/satellite/queue?action=status
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'status';

      let result: any;

      switch (action) {
        case 'status':
          {
            const metrics = await satelliteQueue.getMetrics();
            const health = await satelliteQueue.getHealth();
            result = {
              queueStatus: health.status,
              metrics,
              health,
              timestamp: new Date().toISOString()
            };
          }
          break;

        case 'health':
          {
            const health = await satelliteQueue.getHealth();
            result = {
              health,
              timestamp: new Date().toISOString()
            };
          }
          break;

        default:
          {
            const metrics = await satelliteQueue.getMetrics();
            result = {
              metrics,
              timestamp: new Date().toISOString()
            };
          }
      }

      return createSuccessResponse({
        data: result,
        message: `Queue ${action} retrieved successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);