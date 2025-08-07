/**
 * Automated Model Training Service
 * 
 * Handles data preparation, model training, evaluation, and deployment
 * for Crops.AI machine learning models.
 */

import { mlOpsPipeline, TrainingConfig, ModelMetrics } from './mlops-pipeline'
import { modelRegistry } from './model-registry'
import { auditLogger } from '../logging/audit-logger'
import { prisma } from '../database/prisma'

export interface TrainingDataset {
  id: string
  name: string
  type: 'tabular' | 'timeseries' | 'image' | 'mixed'
  source: 'database' | 'api' | 'file' | 'synthetic'
  features: DataFeature[]
  target: DataFeature
  samples: number
  splits: {
    train: number
    validation: number
    test: number
  }
  metadata: Record<string, any>
}

export interface DataFeature {
  name: string
  type: 'numeric' | 'categorical' | 'datetime' | 'text' | 'image'
  description: string
  statistics?: {
    mean?: number
    std?: number
    min?: number
    max?: number
    unique?: number
    missing?: number
  }
}

export interface TrainingJob {
  id: string
  modelId: string
  datasetId: string
  status: 'queued' | 'preparing' | 'training' | 'evaluating' | 'completed' | 'failed'
  config: TrainingConfig
  startTime?: Date
  endTime?: Date
  metrics?: ModelMetrics
  logs: string[]
  error?: string
}

export interface AutoMLConfig {
  targetMetric: 'accuracy' | 'f1' | 'rmse' | 'mae' | 'r2'
  timeLimit?: number // minutes
  trials?: number
  searchSpace: {
    hyperparameter: string
    type: 'choice' | 'uniform' | 'loguniform'
    values?: any[]
    min?: number
    max?: number
  }[]
}

class TrainingService {
  private activeJobs: Map<string, TrainingJob> = new Map()
  private datasetCache: Map<string, any> = new Map()

  /**
   * Create a training dataset from database
   */
  async createDatasetFromDatabase(
    name: string,
    query: string,
    targetColumn: string,
    features: string[]
  ): Promise<TrainingDataset> {
    try {
      await auditLogger.logML(
        'dataset_creation_started',
        name,
        undefined,
        undefined,
        { source: 'database', targetColumn, featureCount: features.length }
      )

      // Execute query to get data (simplified for demo)
      const data = await this.fetchDataFromQuery(query)
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from query')
      }

      // Analyze features
      const featureAnalysis = this.analyzeFeatures(data, features)
      const targetAnalysis = this.analyzeFeatures(data, [targetColumn])

      // Create dataset
      const dataset: TrainingDataset = {
        id: `dataset_${Date.now()}`,
        name,
        type: 'tabular',
        source: 'database',
        features: featureAnalysis,
        target: targetAnalysis[0],
        samples: data.length,
        splits: {
          train: Math.floor(data.length * 0.7),
          validation: Math.floor(data.length * 0.15),
          test: Math.floor(data.length * 0.15)
        },
        metadata: {
          query,
          createdAt: new Date(),
          columns: features.concat(targetColumn)
        }
      }

      // Cache the data
      this.datasetCache.set(dataset.id, data)

      await auditLogger.logML(
        'dataset_created',
        dataset.id,
        undefined,
        undefined,
        { samples: dataset.samples, features: features.length }
      )

      return dataset

    } catch (error) {
      await auditLogger.logSystem(
        'dataset_creation_failed',
        false,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'error'
      )
      throw error
    }
  }

  /**
   * Create a training dataset for yield prediction
   */
  async createYieldPredictionDataset(
    cropType: string,
    startDate: Date,
    endDate: Date
  ): Promise<TrainingDataset> {
    const query = `
      SELECT 
        f.id as field_id,
        c.yield as target_yield,
        AVG(w.temperature) as avg_temp,
        SUM(w.precipitation) as total_precip,
        AVG(w.humidity) as avg_humidity,
        AVG(s.ndvi) as avg_ndvi,
        MAX(s.ndvi) as max_ndvi,
        f.area as field_area,
        f.soil_type,
        c.planting_date,
        c.variety
      FROM crops c
      JOIN fields f ON c.field_id = f.id
      LEFT JOIN weather_data w ON w.field_id = f.id
      LEFT JOIN satellite_data s ON s.field_id = f.id
      WHERE c.crop_type = '${cropType}'
        AND c.planting_date BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
        AND c.yield IS NOT NULL
      GROUP BY f.id, c.id
    `

    const features = [
      'avg_temp', 'total_precip', 'avg_humidity',
      'avg_ndvi', 'max_ndvi', 'field_area',
      'soil_type', 'variety'
    ]

    return this.createDatasetFromDatabase(
      `${cropType}_yield_dataset`,
      query,
      'target_yield',
      features
    )
  }

  /**
   * Start a model training job
   */
  async startTraining(
    modelName: string,
    datasetId: string,
    config: Partial<TrainingConfig>
  ): Promise<TrainingJob> {
    try {
      const jobId = `job_${Date.now()}`
      
      // Get dataset
      const dataset = this.datasetCache.get(datasetId)
      if (!dataset) {
        throw new Error(`Dataset ${datasetId} not found`)
      }

      // Register model
      const modelMetadata = await mlOpsPipeline.registerModel(
        modelName,
        'regression', // Default for yield prediction
        'scikit-learn',
        `Auto-trained model for ${modelName}`,
        'training-service'
      )

      // Create training config
      const fullConfig: TrainingConfig = {
        datasetId,
        modelType: 'regression',
        framework: 'scikit-learn',
        hyperparameters: {
          algorithm: 'random_forest',
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5,
          ...config.hyperparameters
        },
        validationSplit: config.validationSplit || 0.15,
        testSplit: config.testSplit || 0.15,
        epochs: config.epochs || 1,
        callbacks: [
          { type: 'early_stopping', config: { patience: 5 } },
          { type: 'checkpoint', config: { save_best_only: true } }
        ]
      }

      // Create job
      const job: TrainingJob = {
        id: jobId,
        modelId: modelMetadata.id,
        datasetId,
        status: 'queued',
        config: fullConfig,
        logs: [`Training job ${jobId} created`]
      }

      this.activeJobs.set(jobId, job)

      // Start training asynchronously
      this.executeTraining(job).catch(error => {
        job.status = 'failed'
        job.error = error.message
        job.logs.push(`Training failed: ${error.message}`)
      })

      await auditLogger.logML(
        'training_job_started',
        modelMetadata.id,
        undefined,
        undefined,
        { jobId, datasetId, modelName }
      )

      return job

    } catch (error) {
      await auditLogger.logSystem(
        'training_job_creation_failed',
        false,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'error'
      )
      throw error
    }
  }

  /**
   * Run AutoML to find best hyperparameters
   */
  async runAutoML(
    modelName: string,
    datasetId: string,
    automlConfig: AutoMLConfig
  ): Promise<{
    bestModel: string
    bestParams: Record<string, any>
    bestScore: number
    trials: Array<{
      params: Record<string, any>
      score: number
    }>
  }> {
    try {
      await auditLogger.logML(
        'automl_started',
        modelName,
        undefined,
        undefined,
        { datasetId, targetMetric: automlConfig.targetMetric }
      )

      const trials = []
      let bestScore = automlConfig.targetMetric === 'rmse' || automlConfig.targetMetric === 'mae' ? Infinity : -Infinity
      let bestParams = {}
      let bestModelId = ''

      // Generate hyperparameter combinations
      const paramCombinations = this.generateHyperparameterCombinations(automlConfig.searchSpace)
      
      // Limit trials
      const maxTrials = Math.min(
        automlConfig.trials || 20,
        paramCombinations.length
      )

      for (let i = 0; i < maxTrials; i++) {
        const params = paramCombinations[i]
        
        // Train model with these parameters
        const job = await this.startTraining(
          `${modelName}_trial_${i}`,
          datasetId,
          { hyperparameters: params }
        )

        // Wait for training to complete (simplified)
        await this.waitForJob(job.id)

        // Get metrics
        const metrics = job.metrics || {}
        const score = this.getMetricValue(metrics, automlConfig.targetMetric)

        trials.push({ params, score })

        // Check if this is the best
        const isBetter = automlConfig.targetMetric === 'rmse' || automlConfig.targetMetric === 'mae'
          ? score < bestScore
          : score > bestScore

        if (isBetter) {
          bestScore = score
          bestParams = params
          bestModelId = job.modelId
        }
      }

      await auditLogger.logML(
        'automl_completed',
        bestModelId,
        undefined,
        undefined,
        { 
          bestScore,
          trialsRun: trials.length,
          targetMetric: automlConfig.targetMetric
        }
      )

      return {
        bestModel: bestModelId,
        bestParams,
        bestScore,
        trials: trials.sort((a, b) => {
          if (automlConfig.targetMetric === 'rmse' || automlConfig.targetMetric === 'mae') {
            return a.score - b.score
          }
          return b.score - a.score
        })
      }

    } catch (error) {
      await auditLogger.logSystem(
        'automl_failed',
        false,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'error'
      )
      throw error
    }
  }

  /**
   * Get training job status
   */
  getJobStatus(jobId: string): TrainingJob | null {
    return this.activeJobs.get(jobId) || null
  }

  /**
   * Get all active training jobs
   */
  getActiveJobs(): TrainingJob[] {
    return Array.from(this.activeJobs.values()).filter(
      job => ['queued', 'preparing', 'training', 'evaluating'].includes(job.status)
    )
  }

  /**
   * Cancel a training job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId)
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (['completed', 'failed'].includes(job.status)) {
      throw new Error(`Job ${jobId} is already ${job.status}`)
    }

    job.status = 'failed'
    job.error = 'Cancelled by user'
    job.endTime = new Date()
    job.logs.push('Training cancelled by user')

    await auditLogger.logML(
      'training_job_cancelled',
      job.modelId,
      undefined,
      undefined,
      { jobId }
    )
  }

  // Private helper methods

  private async fetchDataFromQuery(query: string): Promise<any[]> {
    // In production, this would execute the actual database query
    // For now, return mock data
    const mockData = []
    
    for (let i = 0; i < 100; i++) {
      mockData.push({
        field_id: `field_${i}`,
        target_yield: 150 + Math.random() * 50,
        avg_temp: 20 + Math.random() * 10,
        total_precip: 400 + Math.random() * 200,
        avg_humidity: 60 + Math.random() * 20,
        avg_ndvi: 0.5 + Math.random() * 0.3,
        max_ndvi: 0.7 + Math.random() * 0.2,
        field_area: 10 + Math.random() * 50,
        soil_type: ['Clay', 'Loam', 'Sand'][Math.floor(Math.random() * 3)],
        planting_date: new Date(2023, 3, Math.floor(Math.random() * 30)),
        variety: ['Variety_A', 'Variety_B', 'Variety_C'][Math.floor(Math.random() * 3)]
      })
    }
    
    return mockData
  }

  private analyzeFeatures(data: any[], columns: string[]): DataFeature[] {
    return columns.map(col => {
      const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined)
      const isNumeric = values.every(v => typeof v === 'number')
      
      let statistics = {}
      
      if (isNumeric) {
        const nums = values as number[]
        statistics = {
          mean: nums.reduce((a, b) => a + b, 0) / nums.length,
          min: Math.min(...nums),
          max: Math.max(...nums),
          std: this.calculateStd(nums),
          missing: data.length - values.length
        }
      } else {
        const unique = new Set(values)
        statistics = {
          unique: unique.size,
          missing: data.length - values.length
        }
      }
      
      return {
        name: col,
        type: isNumeric ? 'numeric' : 'categorical',
        description: `Feature ${col}`,
        statistics
      }
    })
  }

  private calculateStd(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  private async executeTraining(job: TrainingJob): Promise<void> {
    try {
      job.status = 'preparing'
      job.startTime = new Date()
      job.logs.push('Preparing dataset...')

      // Simulate data preparation
      await this.delay(2000)
      job.logs.push('Dataset prepared successfully')

      job.status = 'training'
      job.logs.push('Starting model training...')

      // Train the model
      const run = await mlOpsPipeline.trainModel(job.modelId, job.config)
      
      job.logs.push(...(run.logs || []))
      job.metrics = run.metrics

      job.status = 'evaluating'
      job.logs.push('Evaluating model performance...')

      // Simulate evaluation
      await this.delay(1000)

      job.status = 'completed'
      job.endTime = new Date()
      job.logs.push('Training completed successfully')

    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.endTime = new Date()
      job.logs.push(`Training failed: ${job.error}`)
      throw error
    }
  }

  private generateHyperparameterCombinations(searchSpace: AutoMLConfig['searchSpace']): Record<string, any>[] {
    const combinations: Record<string, any>[] = []
    
    // Simplified grid search implementation
    // In production, would use more sophisticated search strategies
    
    // Generate up to 50 combinations
    for (let i = 0; i < 50; i++) {
      const combo: Record<string, any> = {}
      
      for (const param of searchSpace) {
        if (param.type === 'choice' && param.values) {
          combo[param.hyperparameter] = param.values[Math.floor(Math.random() * param.values.length)]
        } else if (param.type === 'uniform' && param.min !== undefined && param.max !== undefined) {
          combo[param.hyperparameter] = param.min + Math.random() * (param.max - param.min)
        } else if (param.type === 'loguniform' && param.min !== undefined && param.max !== undefined) {
          const logMin = Math.log(param.min)
          const logMax = Math.log(param.max)
          combo[param.hyperparameter] = Math.exp(logMin + Math.random() * (logMax - logMin))
        }
      }
      
      combinations.push(combo)
    }
    
    return combinations
  }

  private getMetricValue(metrics: ModelMetrics, targetMetric: AutoMLConfig['targetMetric']): number {
    switch (targetMetric) {
      case 'accuracy':
        return metrics.accuracy || 0
      case 'f1':
        return metrics.f1Score || 0
      case 'rmse':
        return metrics.rmse || Infinity
      case 'mae':
        return metrics.mae || Infinity
      case 'r2':
        return metrics.r2Score || 0
      default:
        return 0
    }
  }

  private async waitForJob(jobId: string, timeout: number = 300000): Promise<void> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      const job = this.activeJobs.get(jobId)
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`)
      }
      
      if (['completed', 'failed'].includes(job.status)) {
        return
      }
      
      await this.delay(1000)
    }
    
    throw new Error(`Job ${jobId} timed out`)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const trainingService = new TrainingService()
export { TrainingService }