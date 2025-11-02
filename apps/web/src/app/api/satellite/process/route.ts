import { NextRequest } from 'next/server';
import { z } from 'zod';
import { imageProcessor } from '../../../../lib/satellite/image-processor';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';
import { getAuthenticatedUser } from '../../../../lib/auth/server';

const processSchema = z.object({
  action: z.enum(['submit', 'status', 'batch']),
  // For submit action
  fieldId: z.string().optional(),
  bbox: z.object({
    west: z.number().min(-180).max(180),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    north: z.number().min(-90).max(90)
  }).optional(),
  date: z.string().optional(),
  // For batch action
  fieldIds: z.array(z.string()).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  // For status action
  jobId: z.string().optional(),
  // Processing options
  options: z.object({
    priority: z.enum(['low', 'normal', 'high']).optional(),
    analysisTypes: z.array(z.enum(['ndvi', 'evi', 'health', 'stress', 'boundaries'])).optional(),
    resolution: z.number().min(1).max(100).optional(),
    cloudCoverageMax: z.number().min(0).max(100).optional(),
    enhanceQuality: z.boolean().optional(),
    generateReport: z.boolean().optional(),
    notifyOnComplete: z.boolean().optional()
  }).optional()
});

// POST /api/satellite/process
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json();
      const user = await getAuthenticatedUser(request);
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      // Validate input
      const validation = processSchema.safeParse(body);
      if (!validation.success) {
        throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '));
      }

      const params = validation.data;
      let result;

      switch (params.action) {
        case 'submit':
          {
            if (!params.fieldId || !params.bbox || !params.date) {
              throw new ValidationError('fieldId, bbox, and date are required for submit action');
            }

            result = await imageProcessor.submitJob(
              params.fieldId,
              user.id,
              params.bbox,
              params.date,
              params.options
            );
          }
          break;

        case 'batch':
          {
            if (!params.fieldIds || !params.dateRange) {
              throw new ValidationError('fieldIds and dateRange are required for batch action');
            }

            result = await imageProcessor.submitBatchJob({
              userId: user.id,
              fieldIds: params.fieldIds,
              dateRange: params.dateRange,
              options: params.options || {}
            });
          }
          break;

        case 'status':
          {
            if (!params.jobId) {
              throw new ValidationError('jobId is required for status action');
            }

            result = await imageProcessor.getJobStatus(params.jobId);
            
            if (!result) {
              throw new ValidationError('Job not found');
            }

            // Verify user owns this job
            if (result.userId !== user.id) {
              throw new ValidationError('Unauthorized access to job');
            }
          }
          break;

        default:
          throw new ValidationError('Invalid action');
      }

      // Generate response summary
      const summary = params.action === 'submit' || params.action === 'batch' ? {
        action: params.action,
        jobId: (result as any).id,
        status: (result as any).status,
        priority: (result as any).priority,
        type: (result as any).type,
        createdAt: (result as any).createdAt,
        estimatedProcessingTime: params.action === 'batch' ? 
          `${params.fieldIds!.length * 30} seconds` : '30 seconds',
        message: 'Job submitted successfully. Use the jobId to check status.'
      } : params.action === 'status' ? {
        action: 'status',
        jobId: (result as any).id,
        status: (result as any).status,
        progress: (result as any).status === 'completed' ? '100%' : 
                  (result as any).status === 'processing' ? '50%' : '0%',
        processingTime: (result as any).processingTime ? 
          `${((result as any).processingTime / 1000).toFixed(1)} seconds` : undefined,
        resultsAvailable: !!(result as any).results,
        error: (result as any).error
      } : null;

      return createSuccessResponse({
        data: result,
        summary,
        action: params.action,
        parameters: {
          fieldId: params.fieldId,
          fieldIds: params.fieldIds,
          date: params.date,
          dateRange: params.dateRange,
          jobId: params.jobId,
          options: params.options
        },
        message: `Satellite processing ${params.action} completed successfully`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);

// GET /api/satellite/process?jobId=123&action=status
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const user = await getAuthenticatedUser(request);
      
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const jobId = searchParams.get('jobId');
      const action = searchParams.get('action') || 'status';

      if (action !== 'status') {
        throw new ValidationError('Only status action is supported for GET requests');
      }

      if (!jobId) {
        throw new ValidationError('jobId parameter is required');
      }

      const job = await imageProcessor.getJobStatus(jobId);
      
      if (!job) {
        throw new ValidationError('Job not found');
      }

      // Verify user owns this job
      if (job.userId !== user.id) {
        throw new ValidationError('Unauthorized access to job');
      }

      // Calculate progress
      let progress = 0;
      if (job.status === 'completed') progress = 100;
      else if (job.status === 'processing') {
        // Estimate progress based on time elapsed
        if (job.startedAt) {
          const elapsed = Date.now() - new Date(job.startedAt).getTime();
          const estimated = job.type === 'batch' ? 
            job.fieldId.split(',').length * 30000 : 30000; // 30s per field
          progress = Math.min(90, Math.round((elapsed / estimated) * 100));
        }
      }

      return createSuccessResponse({
        data: job,
        summary: {
          jobId: job.id,
          status: job.status,
          progress: `${progress}%`,
          type: job.type,
          fieldsCount: job.type === 'batch' ? job.fieldId.split(',').length : 1,
          processingTime: job.processingTime ? 
            `${(job.processingTime / 1000).toFixed(1)} seconds` : 
            job.status === 'processing' && job.startedAt ? 
              `${((Date.now() - new Date(job.startedAt).getTime()) / 1000).toFixed(1)} seconds (ongoing)` : 
              undefined,
          hasResults: !!job.results,
          imagesProcessed: job.results?.images?.length || 0,
          error: job.error
        },
        message: `Job ${job.status}`
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);