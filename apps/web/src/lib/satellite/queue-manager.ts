/**
 * Advanced Queue Management System for Satellite Image Processing
 * 
 * Provides distributed job processing, retry logic, dead letter queues,
 * and monitoring capabilities for satellite image analysis tasks.
 */

import { redis } from '../redis';
// Logger replaced with console for local development;
import { ProcessingJob } from './types';

export interface QueueConfig {
  name: string;
  maxRetries: number;
  retryDelay: number; // milliseconds
  timeout: number; // milliseconds
  concurrency: number;
  priority: {
    low: number;
    normal: number;
    high: number;
    urgent: number;
  };
}

export interface QueueMetrics {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  retries: number;
  avgProcessingTime: number;
  throughput: number; // jobs per minute
}

export interface JobProgress {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'retrying';
  progress: number; // 0-100
  currentStep?: string;
  estimatedTimeRemaining?: number;
  retryCount: number;
  lastError?: string;
}

export class SatelliteQueueManager {
  private config: QueueConfig;
  private workers: Map<string, Worker> = new Map();
  private activeJobs: Map<string, ProcessingJob> = new Map();
  
  private readonly QUEUE_KEY = 'satellite:processing:queue';
  private readonly PROCESSING_KEY = 'satellite:processing:active';
  private readonly COMPLETED_KEY = 'satellite:processing:completed';
  private readonly FAILED_KEY = 'satellite:processing:failed';
  private readonly RETRY_KEY = 'satellite:processing:retry';
  private readonly METRICS_KEY = 'satellite:processing:metrics';
  private readonly JOB_PREFIX = 'satellite:job:';
  private readonly PROGRESS_PREFIX = 'satellite:progress:';

  constructor(config?: Partial<QueueConfig>) {
    this.config = {
      name: 'satellite-processing',
      maxRetries: 3,
      retryDelay: 5000,
      timeout: 300000, // 5 minutes
      concurrency: 3,
      priority: {
        low: 1,
        normal: 10,
        high: 50,
        urgent: 100
      },
      ...config
    };
  }

  /**
   * Add a job to the processing queue
   */
  async enqueue(job: ProcessingJob): Promise<void> {
    try {
      // Store job data
      await redis.set(`${this.JOB_PREFIX}${job.id}`, job, { ex: 86400 }); // 24 hours TTL
      
      // Add to priority queue
      const priority = this.calculatePriority(job);
      await redis.zadd(this.QUEUE_KEY, { score: priority, member: job.id });
      
      // Initialize progress tracking
      const progress: JobProgress = {
        jobId: job.id,
        status: 'queued',
        progress: 0,
        retryCount: 0
      };
      await redis.set(`${this.PROGRESS_PREFIX}${job.id}`, progress, { ex: 86400 });
      
      // Update metrics
      await this.updateMetrics('queued', 1);
      
      } catch (error) {
      console.error('Failed to enqueue job', error, { jobId: job.id });
      throw error;
    }
  }

  /**
   * Start processing jobs with configured concurrency
   */
  async startProcessing(): Promise<void> {
    for (let i = 0; i < this.config.concurrency; i++) {
      const workerId = `worker-${i}`;
      const worker = new Worker(workerId, this);
      this.workers.set(workerId, worker);
      worker.start();
    }

  }

  /**
   * Stop all workers and clean up
   */
  async stopProcessing(): Promise<void> {
    const workerEntries = Array.from(this.workers.entries());
    for (const [workerId, worker] of workerEntries) {
      await worker.stop();
      this.workers.delete(workerId);
    }

  }

  /**
   * Get next job from queue
   */
  async dequeue(): Promise<ProcessingJob | null> {
    try {
      // Get highest priority job
      const result = await redis.zpopmax(this.QUEUE_KEY, 1);
      if (!result || (result as any).length === 0) {
        return null;
      }
      
      const jobId = (result as any)[0].member;
      const jobData = await redis.get(`${this.JOB_PREFIX}${jobId}`);
      
      if (!jobData) {

        return null;
      }
      
      const job = jobData as ProcessingJob;
      
      // Move to processing set
      await redis.sadd(this.PROCESSING_KEY, jobId);
      await this.updateMetrics('queued', -1);
      await this.updateMetrics('processing', 1);
      
      return job;
    } catch (error) {
      console.error('Failed to dequeue job', error);
      return null;
    }
  }

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string, results?: any): Promise<void> {
    try {
      // Remove from processing set
      await redis.srem(this.PROCESSING_KEY, jobId);
      
      // Add to completed set
      await redis.sadd(this.COMPLETED_KEY, jobId);
      
      // Update job with results
      const jobData = await redis.get(`${this.JOB_PREFIX}${jobId}`);
      if (jobData) {
        const job = jobData as ProcessingJob;
        job.status = 'completed';
        job.completedAt = new Date();
        job.results = results;
        job.processingTime = Date.now() - new Date(job.createdAt).getTime();
        
        await redis.set(`${this.JOB_PREFIX}${jobId}`, job, { ex: 86400 });
      }
      
      // Update progress
      const progress: JobProgress = {
        jobId,
        status: 'completed',
        progress: 100,
        retryCount: 0
      };
      await redis.set(`${this.PROGRESS_PREFIX}${jobId}`, progress, { ex: 86400 });
      
      // Update metrics
      await this.updateMetrics('processing', -1);
      await this.updateMetrics('completed', 1);
      
      this.activeJobs.delete(jobId);

    } catch (error) {
      console.error(`Failed to complete job ${jobId}`, error);
      throw error;
    }
  }

  /**
   * Mark job as failed and handle retries
   */
  async failJob(jobId: string, error: Error): Promise<void> {
    try {
      const jobData = await redis.get(`${this.JOB_PREFIX}${jobId}`);
      if (!jobData) {

        return;
      }
      
      const job = jobData as ProcessingJob;
      const currentRetries = job.retryCount || 0;
      
      // Remove from processing set
      await redis.srem(this.PROCESSING_KEY, jobId);
      
      if (currentRetries < this.config.maxRetries) {
        // Retry the job
        job.retryCount = currentRetries + 1;
        job.status = 'queued';
        job.error = error.message;
        
        await redis.set(`${this.JOB_PREFIX}${jobId}`, job, { ex: 86400 });
        
        // Add to retry queue with delay
        const retryTime = Date.now() + (this.config.retryDelay * Math.pow(2, currentRetries));
        await redis.zadd(this.RETRY_KEY, { score: retryTime, member: jobId });
        
        // Update progress
        const progress: JobProgress = {
          jobId,
          status: 'retrying',
          progress: 0,
          retryCount: currentRetries + 1,
          lastError: error.message
        };
        await redis.set(`${this.PROGRESS_PREFIX}${jobId}`, progress, { ex: 86400 });
        
        await this.updateMetrics('retries', 1);
        
        } else {
        // Max retries exceeded, mark as permanently failed
        job.status = 'failed';
        job.error = error.message;
        job.failedAt = new Date();
        
        await redis.set(`${this.JOB_PREFIX}${jobId}`, job, { ex: 86400 });
        await redis.sadd(this.FAILED_KEY, jobId);
        
        // Update progress
        const progress: JobProgress = {
          jobId,
          status: 'failed',
          progress: 0,
          retryCount: currentRetries,
          lastError: error.message
        };
        await redis.set(`${this.PROGRESS_PREFIX}${jobId}`, progress, { ex: 86400 });
        
        await this.updateMetrics('failed', 1);
        
        console.error(`Job ${jobId} permanently failed after ${currentRetries} retries`, {
          jobId,
          error: error.message,
          retryCount: currentRetries
        });
      }
      
      await this.updateMetrics('processing', -1);
      this.activeJobs.delete(jobId);
      
    } catch (err) {

      throw err;
    }
  }

  /**
   * Update job progress
   */
  async updateProgress(jobId: string, progress: number, currentStep?: string): Promise<void> {
    try {
      const existingProgress = await redis.get(`${this.PROGRESS_PREFIX}${jobId}`) as JobProgress;
      if (existingProgress) {
        existingProgress.progress = Math.max(0, Math.min(100, progress));
        existingProgress.currentStep = currentStep;
        
        await redis.set(`${this.PROGRESS_PREFIX}${jobId}`, existingProgress, { ex: 86400 });
      }
    } catch (error) {
      console.error(`Failed to update progress for job ${jobId}`, error);
    }
  }

  /**
   * Get job progress
   */
  async getProgress(jobId: string): Promise<JobProgress | null> {
    try {
      return await redis.get(`${this.PROGRESS_PREFIX}${jobId}`) as JobProgress;
    } catch (error) {
      console.error(`Failed to get progress for job ${jobId}`, error);
      return null;
    }
  }

  /**
   * Get queue metrics
   */
  async getMetrics(): Promise<QueueMetrics> {
    try {
      const [queued, processing, completed, failed, retries] = await Promise.all([
        redis.zcard(this.QUEUE_KEY),
        redis.scard(this.PROCESSING_KEY),
        redis.scard(this.COMPLETED_KEY),
        redis.scard(this.FAILED_KEY),
        redis.get(`${this.METRICS_KEY}:retries`) || 0
      ]);
      
      return {
        queued: queued as number,
        processing: processing as number,
        completed: completed as number,
        failed: failed as number,
        retries: retries as number,
        avgProcessingTime: 0, // TODO: Calculate from completed jobs
        throughput: 0 // TODO: Calculate jobs per minute
      };
    } catch (error) {
      console.error('Failed to get queue metrics', error);
      return {
        queued: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        retries: 0,
        avgProcessingTime: 0,
        throughput: 0
      };
    }
  }

  /**
   * Process retry queue (should be called periodically)
   */
  async processRetries(): Promise<void> {
    try {
      const now = Date.now();
      const readyJobs = await redis.zrange(this.RETRY_KEY, 0, now, { byScore: true });
      
      if (!readyJobs || (readyJobs as any).length === 0) {
        return;
      }
      
      for (const jobId of readyJobs as string[]) {
        // Move from retry queue back to main queue
        await redis.zrem(this.RETRY_KEY, jobId);
        
        const jobData = await redis.get(`${this.JOB_PREFIX}${jobId}`);
        if (jobData) {
          const job = jobData as ProcessingJob;
          const priority = this.calculatePriority(job);
          await redis.zadd(this.QUEUE_KEY, { score: priority, member: jobId });
          
          // Update progress
          const progress: JobProgress = {
            jobId,
            status: 'queued',
            progress: 0,
            retryCount: job.retryCount || 0
          };
          await redis.set(`${this.PROGRESS_PREFIX}${jobId}`, progress, { ex: 86400 });
          
          await this.updateMetrics('queued', 1);
        }
      }
      
      if ((readyJobs as any).length > 0) {

      }
      
    } catch (error) {
      console.error('Failed to process retry queue', error);
    }
  }

  /**
   * Calculate job priority
   */
  private calculatePriority(job: ProcessingJob): number {
    let priority = this.config.priority[job.priority as keyof typeof this.config.priority] || this.config.priority.normal;
    
    // Boost priority for urgent analysis types
    if (job.options?.analysisTypes?.includes('stress')) {
      priority += 20;
    }
    
    // Boost priority for high-value crops
    if (job.type === 'single' && job.options?.enhanceQuality) {
      priority += 10;
    }
    
    // Add timestamp component for FIFO within same priority
    const timeComponent = Math.floor(Date.now() / 1000);
    return priority * 1000000 + timeComponent;
  }

  /**
   * Update metrics counters
   */
  private async updateMetrics(metric: string, delta: number): Promise<void> {
    try {
      const key = `${this.METRICS_KEY}:${metric}`;
      const current = await redis.get(key) as number || 0;
      await redis.set(key, current + delta, { ex: 86400 });
    } catch (error) {
      console.error(`Failed to update metric ${metric}`, error);
    }
  }
}

/**
 * Worker class for processing jobs
 */
class Worker {
  private id: string;
  private manager: SatelliteQueueManager;
  private running = false;
  private currentJob: ProcessingJob | null = null;

  constructor(id: string, manager: SatelliteQueueManager) {
    this.id = id;
    this.manager = manager;
  }

  async start(): Promise<void> {
    this.running = true;
    this.processJobs();

  }

  async stop(): Promise<void> {
    this.running = false;
    
    // Wait for current job to complete or timeout
    if (this.currentJob) {

      // In a real implementation, you'd implement graceful shutdown
    }

  }

  private async processJobs(): Promise<void> {
    while (this.running) {
      try {
        const job = await this.manager.dequeue();
        
        if (!job) {
          // No jobs available, wait and check again
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        this.currentJob = job;
        await this.processJob(job);
        this.currentJob = null;
        
      } catch (error) {
        console.error(`Worker ${this.id} error`, error);
        if (this.currentJob) {
          await this.manager.failJob(this.currentJob.id, error as Error);
        }
        this.currentJob = null;
        
        // Wait before retrying to avoid tight error loops
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processJob(job: ProcessingJob): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Update progress
      await this.manager.updateProgress(job.id, 10, 'Starting image processing');
      
      // Simulate processing steps
      await this.manager.updateProgress(job.id, 30, 'Downloading satellite images');
      await this.simulateProcessingStep(2000);
      
      await this.manager.updateProgress(job.id, 60, 'Analyzing vegetation indices');
      await this.simulateProcessingStep(3000);
      
      await this.manager.updateProgress(job.id, 80, 'Detecting stress patterns');
      await this.simulateProcessingStep(2000);
      
      await this.manager.updateProgress(job.id, 95, 'Generating analysis report');
      await this.simulateProcessingStep(1000);
      
      // Generate mock results
      const results = {
        analysisId: `analysis-${Date.now()}`,
        fieldId: job.fieldId,
        imageUrl: process.env.NEXT_PUBLIC_STORAGE_URL ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/processed/${job.id}.jpg` : null,
        ndvi: 0.75,
        healthScore: 85,
        stressLevel: 'low',
        recommendations: [
          'Maintain current irrigation schedule',
          'Monitor for nutrient deficiency in sector 3'
        ],
        processingTime: Date.now() - startTime
      };
      
      await this.manager.completeJob(job.id, results);

    } catch (error) {
      console.error(`Worker ${this.id} failed to process job ${job.id}`, error);
      await this.manager.failJob(job.id, error as Error);
    }
  }

  private async simulateProcessingStep(duration: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, duration));
  }
}

// Export singleton instance
export const queueManager = new SatelliteQueueManager();