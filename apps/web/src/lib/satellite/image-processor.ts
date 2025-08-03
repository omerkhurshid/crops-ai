/**
 * Satellite Image Processing Service
 * 
 * Provides serverless image processing capabilities for satellite imagery,
 * including preprocessing, analysis, and optimization for agricultural monitoring.
 */

import { sentinelHub } from './sentinel-hub';
import { ndviAnalysis } from './ndvi-analysis';
import { queueManager } from './queue-manager';
import { prisma } from '../prisma';
import { redis } from '../redis';
import { uploadToCloudinary } from '../cloudinary';
import type { 
  BoundingBox, 
  SatelliteImage, 
  ProcessingJob,
  ProcessedImage
} from './types';
import type { VegetationIndices, VegetationHealthReport } from './ndvi-analysis';


export interface ProcessingOptions {
  priority?: 'low' | 'normal' | 'high';
  analysisTypes?: ('ndvi' | 'evi' | 'health' | 'stress' | 'boundaries')[];
  resolution?: number;
  cloudCoverageMax?: number;
  enhanceQuality?: boolean;
  generateReport?: boolean;
  notifyOnComplete?: boolean;
}

export interface BatchProcessingRequest {
  userId: string;
  fieldIds: string[];
  dateRange: {
    start: string;
    end: string;
  };
  options: ProcessingOptions;
}

class SatelliteImageProcessor {
  private readonly QUEUE_KEY = 'satellite:processing:queue';
  private readonly JOB_PREFIX = 'satellite:job:';
  private readonly RESULT_CACHE_TTL = 24 * 60 * 60; // 24 hours
  private readonly MAX_CONCURRENT_JOBS = 5;
  private readonly PROCESSING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  /**
   * Submit a single image processing job
   */
  async submitJob(
    fieldId: string,
    userId: string,
    bbox: BoundingBox,
    date: string,
    options: ProcessingOptions = {}
  ): Promise<ProcessingJob> {
    try {
      const job: ProcessingJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fieldId,
        userId,
        type: 'single',
        status: 'queued',
        priority: options.priority || 'normal',
        bbox,
        dateRange: { start: date, end: date },
        options: {
          analysisTypes: options.analysisTypes || ['ndvi', 'health'],
          resolution: options.resolution || 10,
          cloudCoverageMax: options.cloudCoverageMax || 20,
          enhanceQuality: options.enhanceQuality || false,
          generateReport: options.generateReport || false
        },
        createdAt: new Date()
      };

      // Use the advanced queue manager
      await queueManager.enqueue(job);

      return job;
    } catch (error) {
      console.error('Error submitting processing job:', error);
      throw error;
    }
  }

  /**
   * Submit a batch processing job for multiple fields
   */
  async submitBatchJob(request: BatchProcessingRequest): Promise<ProcessingJob> {
    try {
      const job: ProcessingJob = {
        id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fieldId: request.fieldIds.join(','), // Store as comma-separated
        userId: request.userId,
        type: 'batch',
        status: 'queued',
        priority: request.options.priority || 'normal',
        dateRange: request.dateRange,
        options: {
          analysisTypes: request.options.analysisTypes || ['ndvi', 'health'],
          resolution: request.options.resolution || 10,
          cloudCoverageMax: request.options.cloudCoverageMax || 20,
          enhanceQuality: request.options.enhanceQuality || false,
          generateReport: request.options.generateReport || true
        },
        createdAt: new Date()
      };

      // Use the advanced queue manager for batch processing
      await queueManager.enqueue(job);

      return job;
    } catch (error) {
      console.error('Error submitting batch job:', error);
      throw error;
    }
  }

  /**
   * Get job status and results
   */
  async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
    try {
      const jobData = await redis.get(`${this.JOB_PREFIX}${jobId}`);
      if (!jobData) return null;
      
      return jobData as ProcessingJob;
    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }

  /**
   * Process a single satellite image
   */
  private async processImage(
    fieldId: string,
    bbox: BoundingBox,
    date: string,
    options: ProcessingJob['options']
  ): Promise<ProcessedImage> {
    try {
      // Search for satellite images
      const images = await sentinelHub.searchImages(
        bbox,
        date,
        date,
        options.cloudCoverageMax
      );

      if (images.length === 0) {
        throw new Error('No suitable satellite images found for the specified date and location');
      }

      const selectedImage = images[0]; // Select best image

      // Get true color image
      const trueColorBlob = await sentinelHub.getTrueColorImage(
        bbox,
        date,
        options.resolution * 100, // Convert to pixels
        options.resolution * 100
      );

      // Get NDVI image if requested
      let ndviBlob: Blob | null = null;
      if (options.analysisTypes.includes('ndvi')) {
        ndviBlob = await sentinelHub.getNDVIImage(
          bbox,
          date,
          options.resolution * 100,
          options.resolution * 100
        );
      }

      // Upload images to Cloudinary
      const [trueColorUrl, ndviUrl] = await Promise.all([
        this.uploadImage(trueColorBlob, `true-color-${fieldId}-${date}`),
        ndviBlob ? this.uploadImage(ndviBlob, `ndvi-${fieldId}-${date}`) : null
      ]);

      // Perform vegetation analysis
      let analysis;
      if (options.analysisTypes.includes('health') || options.analysisTypes.includes('stress')) {
        const ndviAnalysisResult = await sentinelHub.calculateNDVIAnalysis(fieldId, bbox, date);
        
        // Calculate vegetation indices
        const indices = ndviAnalysis.calculateVegetationIndices({
          red: 0.1, // These would come from actual spectral data
          nir: 0.6,
          redEdge: 0.4,
          green: 0.08,
          blue: 0.06,
          swir1: 0.15,
          swir2: 0.1
        });

        // Generate health report if requested
        if (options.analysisTypes.includes('health')) {
          const healthReport = await ndviAnalysis.generateHealthReport(
            fieldId,
            indices,
            100, // Default field area
            'general'
          );

          analysis = {
            healthScore: healthReport.healthScore,
            stressLevel: healthReport.stressLevel,
            vegetationCoverage: ndviAnalysisResult.zones.healthy.percentage,
            anomalies: []
          };
        }
      }

      const processedImage: ProcessedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalId: selectedImage.id,
        fieldId,
        type: 'processed',
        url: trueColorUrl,
        thumbnailUrl: trueColorUrl, // Could generate actual thumbnail
        metadata: {
          acquisitionDate: selectedImage.acquisitionDate,
          cloudCoverage: selectedImage.cloudCoverage,
          resolution: options.resolution,
          bbox,
          indices: analysis ? ndviAnalysis.calculateVegetationIndices({
            red: 0.1, nir: 0.6, redEdge: 0.4, green: 0.08, blue: 0.06, swir1: 0.15, swir2: 0.1
          }) : undefined,
          enhancements: options.enhanceQuality ? ['sharpening', 'color-correction'] : []
        },
        analysis
      };

      return processedImage;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  /**
   * Process queued jobs
   */
  private async processQueue(): Promise<void> {
    try {
      // Check if already processing max concurrent jobs
      const activeJobs = await this.getActiveJobsCount();
      if (activeJobs >= this.MAX_CONCURRENT_JOBS) {
        return;
      }

      // Get next job from queue
      const jobId = await this.dequeueJob();
      if (!jobId) return;

      // Get job details
      const job = await this.getJobStatus(jobId);
      if (!job) return;

      // Update job status
      job.status = 'processing';
      job.startedAt = new Date();
      await this.updateJob(job);

      // Process based on job type
      try {
        switch (job.type) {
          case 'single':
            await this.processSingleJob(job);
            break;
          case 'batch':
            await this.processBatchJob(job);
            break;
          case 'time-series':
            await this.processTimeSeriesJob(job);
            break;
        }

        // Mark as completed
        job.status = 'completed';
        job.completedAt = new Date();
        job.processingTime = job.completedAt.getTime() - job.startedAt!.getTime();
        await this.updateJob(job);

        // Notify if requested
        if (job.options.generateReport) {
          await this.generateAndSendReport(job);
        }

      } catch (error) {
        // Mark as failed
        job.status = 'failed';
        job.error = error instanceof Error ? error.message : 'Unknown error';
        job.completedAt = new Date();
        await this.updateJob(job);
      }

      // Process next job
      this.processQueue();

    } catch (error) {
      console.error('Error processing queue:', error);
    }
  }

  /**
   * Process a single job
   */
  private async processSingleJob(job: ProcessingJob): Promise<void> {
    if (!job.bbox || !job.dateRange) {
      throw new Error('Missing required parameters for single job');
    }

    const processedImage = await this.processImage(
      job.fieldId,
      job.bbox,
      job.dateRange.start,
      job.options
    );

    job.results = {
      images: [processedImage],
      analysis: processedImage.analysis
    };
  }

  /**
   * Process a batch job
   */
  private async processBatchJob(job: ProcessingJob): Promise<void> {
    const fieldIds = job.fieldId.split(',');
    const processedImages: ProcessedImage[] = [];

    for (const fieldId of fieldIds) {
      // Get field bbox from database
      const field = await prisma.field.findUnique({
        where: { id: fieldId }
      });

      if (!field || !field.area || field.area <= 0) continue;

      // Use a default bbox since boundaries are not available
      const bbox = {
        west: -74.1,
        east: -74.0,
        south: 40.7,
        north: 40.8
      };
      
      try {
        const image = await this.processImage(
          fieldId,
          bbox,
          job.dateRange!.start,
          job.options
        );
        processedImages.push(image);
      } catch (error) {
        console.error(`Error processing field ${fieldId}:`, error);
      }
    }

    job.results = {
      images: processedImages,
      analysis: this.aggregateBatchAnalysis(processedImages)
    };
  }

  /**
   * Process a time series job
   */
  private async processTimeSeriesJob(job: ProcessingJob): Promise<void> {
    // Implementation for time series processing
    // This would process multiple dates for trend analysis
    throw new Error('Time series processing not yet implemented');
  }

  // Helper methods
  private async enqueueJob(job: ProcessingJob): Promise<void> {
    const score = this.calculatePriorityScore(job);
    await redis.zadd(this.QUEUE_KEY, { score, member: job.id });
  }

  private async dequeueJob(): Promise<string | null> {
    const result = await redis.zpopmin(this.QUEUE_KEY, 1);
    return (result as any)?.length > 0 ? (result as any)[0].member : null;
  }

  private async updateJob(job: ProcessingJob): Promise<void> {
    await redis.set(
      `${this.JOB_PREFIX}${job.id}`,
      JSON.stringify(job),
      { ex: 86400 }
    );
  }

  private async getActiveJobsCount(): Promise<number> {
    // Count jobs with status 'processing'
    // In production, this would query Redis more efficiently
    return 0; // Simplified for now
  }

  private calculatePriorityScore(job: ProcessingJob): number {
    const now = Date.now();
    const age = now - job.createdAt.getTime();
    const priorityMultiplier = 
      job.priority === 'high' ? 0.1 :
      job.priority === 'normal' ? 1 :
      10; // low priority
    
    return age * priorityMultiplier;
  }

  private async uploadImage(blob: Blob, publicId: string): Promise<string> {
    // Convert blob to base64 for Cloudinary upload
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${blob.type};base64,${base64}`;
    
    const result = await uploadToCloudinary(dataUri, publicId);
    return result.secure_url;
  }

  private extractBoundingBox(boundaries: any): BoundingBox {
    // Extract bounding box from GeoJSON boundaries
    // Simplified implementation
    return {
      west: -74.1,
      south: 40.7,
      east: -74.0,
      north: 40.8
    };
  }

  private aggregateBatchAnalysis(images: ProcessedImage[]): any {
    const healthScores = images
      .filter(img => img.analysis?.healthScore)
      .map(img => img.analysis!.healthScore);

    return {
      averageHealthScore: healthScores.length > 0 
        ? healthScores.reduce((a, b) => a + b, 0) / healthScores.length 
        : 0,
      processedFields: images.length,
      timestamp: new Date().toISOString()
    };
  }

  private async generateAndSendReport(job: ProcessingJob): Promise<void> {
    // Generate PDF report and send notification
    // Implementation would include report generation logic
    console.log(`Report generation for job ${job.id} - not yet implemented`);
  }
}

export const imageProcessor = new SatelliteImageProcessor();