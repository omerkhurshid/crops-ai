/**
 * Tests for MLOps Pipeline
 */

import { mlOpsPipeline } from '../mlops-pipeline'
import { modelRegistry } from '../model-registry'
import { trainingService } from '../training-service'

describe('MLOps Pipeline', () => {
  describe('Model Registry', () => {
    test('has pre-configured agricultural models', () => {
      const yieldModels = modelRegistry.getModelsByCategory('yield_prediction')
      const cropHealthModels = modelRegistry.getModelsByCategory('crop_health')
      const weatherModels = modelRegistry.getModelsByCategory('weather')
      
      expect(yieldModels.length).toBeGreaterThan(0)
      expect(cropHealthModels.length).toBeGreaterThan(0)
      expect(weatherModels.length).toBeGreaterThan(0)
      
      // Check corn yield predictor specifically
      const cornModel = yieldModels.find(m => m.name.includes('Corn'))
      expect(cornModel).toBeDefined()
      expect(cornModel?.isActive).toBe(true)
      expect(cornModel?.performance.rmse).toBeDefined()
    })

    test('provides model recommendations', () => {
      const recommendations = modelRegistry.recommendModels({
        cropType: 'corn',
        dataAvailable: ['temperature', 'precipitation', 'ndvi'],
        objective: 'yield'
      })
      
      expect(recommendations.length).toBeGreaterThan(0)
      
      const cornYieldModel = recommendations.find(
        m => m.category === 'yield_prediction' && m.name.includes('Corn')
      )
      expect(cornYieldModel).toBeDefined()
    })

    test('provides registry statistics', () => {
      const stats = modelRegistry.getStatistics()
      
      expect(stats.totalModels).toBeGreaterThan(0)
      expect(stats.byCategory).toBeDefined()
      expect(stats.averagePerformance).toBeGreaterThan(0)
      expect(stats.lastUpdated).toBeInstanceOf(Date)
      
      // Should have all expected categories
      expect(stats.byCategory).toHaveProperty('yield_prediction')
      expect(stats.byCategory).toHaveProperty('crop_health')
      expect(stats.byCategory).toHaveProperty('weather')
    })
  })

  describe('Model Training', () => {
    test('can create training datasets', async () => {
      const dataset = await trainingService.createYieldPredictionDataset(
        'corn',
        new Date('2023-01-01'),
        new Date('2023-12-31')
      )
      
      expect(dataset.id).toBeDefined()
      expect(dataset.name).toContain('corn')
      expect(dataset.samples).toBeGreaterThan(0)
      expect(dataset.features.length).toBeGreaterThan(0)
      expect(dataset.splits.train).toBeGreaterThan(0)
      expect(dataset.splits.validation).toBeGreaterThan(0)
      expect(dataset.splits.test).toBeGreaterThan(0)
    })

    test('can start training jobs', async () => {
      const dataset = await trainingService.createYieldPredictionDataset(
        'corn',
        new Date('2023-01-01'),
        new Date('2023-12-31')
      )
      
      const job = await trainingService.startTraining(
        'Test Model',
        dataset.id,
        {
          hyperparameters: {
            n_estimators: 100,
            max_depth: 10
          }
        }
      )
      
      expect(job.id).toBeDefined()
      expect(job.modelId).toBeDefined()
      expect(['queued', 'preparing', 'training'].includes(job.status)).toBe(true)
      expect(job.logs.length).toBeGreaterThan(0)
    })

    test('can track job status', async () => {
      const dataset = await trainingService.createYieldPredictionDataset(
        'corn',
        new Date('2023-01-01'),
        new Date('2023-12-31')
      )
      
      const job = await trainingService.startTraining(
        'Test Model 2',
        dataset.id,
        {}
      )
      
      const status = trainingService.getJobStatus(job.id)
      expect(status).toBeDefined()
      expect(status?.id).toBe(job.id)
      expect(status?.modelId).toBe(job.modelId)
    })
  })

  describe('Model Deployment and Prediction', () => {
    test('can make predictions', async () => {
      const sampleInput = {
        temperature: [22, 24, 26, 28],
        precipitation: [45, 50, 60, 80],
        ndvi: [0.3, 0.4, 0.6, 0.75]
      }
      
      const prediction = await mlOpsPipeline.predict({
        modelId: 'test_model',
        input: sampleInput
      })
      
      expect(prediction.modelId).toBe('test_model')
      expect(prediction.prediction).toBeDefined()
      expect(prediction.confidence).toBeGreaterThan(0)
      expect(prediction.processingTime).toBeGreaterThanOrEqual(0)
      expect(prediction.timestamp).toBeInstanceOf(Date)
    })

    test('can monitor model performance', async () => {
      const monitoring = await mlOpsPipeline.monitorModel('test_model', 'latest')
      
      expect(monitoring.performanceMetrics).toBeDefined()
      expect(monitoring.predictionStats).toBeDefined()
      expect(monitoring.predictionStats.totalPredictions).toBeGreaterThan(0)
      expect(monitoring.predictionStats.avgLatency).toBeGreaterThan(0)
      expect(monitoring.recommendations).toBeInstanceOf(Array)
      expect(typeof monitoring.driftDetected).toBe('boolean')
    })

    test('can create A/B tests', async () => {
      const test = await mlOpsPipeline.createABTest(
        'model_a',
        'model_b',
        0.5
      )
      
      expect(test.testId).toBeDefined()
      expect(test.modelA).toBe('model_a')
      expect(test.modelB).toBe('model_b')
      expect(test.trafficSplit).toBe(0.5)
      expect(test.status).toBe('active')
      expect(test.startTime).toBeInstanceOf(Date)
      expect(test.endTime).toBeInstanceOf(Date)
    })
  })

  describe('AutoML', () => {
    test('can run AutoML optimization', async () => {
      const dataset = await trainingService.createYieldPredictionDataset(
        'corn',
        new Date('2023-01-01'),
        new Date('2023-12-31')
      )
      
      const result = await trainingService.runAutoML(
        'AutoML Test Model',
        dataset.id,
        {
          targetMetric: 'rmse',
          trials: 1,
          searchSpace: [
            {
              hyperparameter: 'n_estimators',
              type: 'choice',
              values: [50, 100, 200]
            },
            {
              hyperparameter: 'max_depth',
              type: 'choice',
              values: [5, 10, 15]
            }
          ]
        }
      )
      
      expect(result.bestModel).toBeDefined()
      expect(result.bestParams).toBeDefined()
      expect(result.bestScore).toBeGreaterThan(0)
      expect(result.trials.length).toBe(1)
      expect(result.trials[0]).toHaveProperty('params')
      expect(result.trials[0]).toHaveProperty('score')
    })
  })

  describe('Model Lifecycle', () => {
    test('can register and deploy models', async () => {
      const metadata = await mlOpsPipeline.registerModel(
        'Test Lifecycle Model',
        'regression',
        'scikit-learn',
        'Test model for lifecycle validation',
        'test-user'
      )
      
      expect(metadata.id).toBeDefined()
      expect(metadata.name).toBe('Test Lifecycle Model')
      expect(metadata.type).toBe('regression')
      expect(metadata.framework).toBe('scikit-learn')
      expect(metadata.status).toBe('training')
    })

    test('supports model versioning', async () => {
      // Test that models have version information
      const metadata = await mlOpsPipeline.registerModel(
        'Versioned Model',
        'classification',
        'tensorflow',
        'Model with version tracking',
        'test-user'
      )
      
      expect(metadata.version).toBeDefined()
      expect(metadata.createdAt).toBeInstanceOf(Date)
      expect(metadata.updatedAt).toBeInstanceOf(Date)
    })
  })
})