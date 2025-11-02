import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { modelRegistry } from '../../../../lib/ml/model-registry'
import { mlOpsPipeline } from '../../../../lib/ml/mlops-pipeline'
import { trainingService } from '../../../../lib/ml/training-service'
import { auditLogger } from '../../../../lib/logging/audit-logger'

/**
 * MLOps Pipeline API
 * Manages model registry, deployment, and monitoring
 */

/**
 * GET /api/ml/mlops
 * Get registered models and MLOps status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'registry'

    await auditLogger.logDataAccess(
      'read',
      'mlops',
      action,
      user.id,
      { action },
      request
    )

    switch (action) {
      case 'registry': {
        // Get all registered models
        const category = searchParams.get('category')
        let models
        
        if (category) {
          models = modelRegistry.getModelsByCategory(category as any)
        } else {
          models = [
            ...modelRegistry.getModelsByCategory('yield_prediction'),
            ...modelRegistry.getModelsByCategory('crop_health'),
            ...modelRegistry.getModelsByCategory('weather'),
            ...modelRegistry.getModelsByCategory('pest_disease'),
            ...modelRegistry.getModelsByCategory('soil'),
            ...modelRegistry.getModelsByCategory('market')
          ]
        }

        const stats = modelRegistry.getStatistics()

        return NextResponse.json({
          success: true,
          data: {
            models,
            statistics: stats,
            categories: Object.keys(stats.byCategory)
          }
        })
      }

      case 'jobs': {
        // Get active training jobs
        const jobs = trainingService.getActiveJobs()
        
        return NextResponse.json({
          success: true,
          data: {
            activeJobs: jobs,
            count: jobs.length
          }
        })
      }

      case 'status': {
        // Get specific job status
        const jobId = searchParams.get('jobId')
        
        if (!jobId) {
          return NextResponse.json(
            { error: 'jobId parameter required' },
            { status: 400 }
          )
        }

        const job = trainingService.getJobStatus(jobId)
        
        if (!job) {
          return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          data: job
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    await auditLogger.logSystem(
      'mlops_get_error',
      false,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'error'
    )

    return NextResponse.json(
      { error: 'MLOps operation failed' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ml/mlops
 * Execute MLOps operations
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'action parameter required' },
        { status: 400 }
      )
    }

    await auditLogger.logML(
      'mlops_action',
      action,
      user.id,
      undefined,
      body
    )

    switch (action) {
      case 'deploy': {
        // Deploy a model from registry
        const { modelId, environment = 'development' } = body
        
        if (!modelId) {
          return NextResponse.json(
            { error: 'modelId required for deployment' },
            { status: 400 }
          )
        }

        const endpointUrl = await modelRegistry.deployModel(modelId, environment)
        
        return NextResponse.json({
          success: true,
          data: {
            modelId,
            environment,
            endpointUrl,
            status: 'deployed'
          }
        })
      }

      case 'predict': {
        // Make prediction using deployed model
        const { modelId, input } = body
        
        if (!modelId || !input) {
          return NextResponse.json(
            { error: 'modelId and input required for prediction' },
            { status: 400 }
          )
        }

        const prediction = await mlOpsPipeline.predict({
          modelId,
          input,
          metadata: { userId: user.id }
        })

        return NextResponse.json({
          success: true,
          data: prediction
        })
      }

      case 'train': {
        // Start model training
        const { modelName, datasetId, config } = body
        
        if (!modelName || !datasetId) {
          return NextResponse.json(
            { error: 'modelName and datasetId required for training' },
            { status: 400 }
          )
        }

        const job = await trainingService.startTraining(
          modelName,
          datasetId,
          config || {}
        )

        return NextResponse.json({
          success: true,
          data: {
            jobId: job.id,
            modelId: job.modelId,
            status: job.status,
            message: 'Training job started successfully'
          }
        })
      }

      case 'automl': {
        // Run AutoML optimization
        const { modelName, datasetId, targetMetric = 'rmse', trials = 20 } = body
        
        if (!modelName || !datasetId) {
          return NextResponse.json(
            { error: 'modelName and datasetId required for AutoML' },
            { status: 400 }
          )
        }

        const result = await trainingService.runAutoML(
          modelName,
          datasetId,
          {
            targetMetric,
            trials,
            searchSpace: [
              {
                hyperparameter: 'n_estimators',
                type: 'choice',
                values: [50, 100, 200, 300]
              },
              {
                hyperparameter: 'max_depth',
                type: 'choice',
                values: [5, 10, 15, 20, null]
              },
              {
                hyperparameter: 'learning_rate',
                type: 'loguniform',
                min: 0.01,
                max: 0.3
              }
            ]
          }
        )

        return NextResponse.json({
          success: true,
          data: result
        })
      }

      case 'monitor': {
        // Monitor deployed model
        const { modelId, version = 'latest' } = body
        
        if (!modelId) {
          return NextResponse.json(
            { error: 'modelId required for monitoring' },
            { status: 400 }
          )
        }

        const metrics = await mlOpsPipeline.monitorModel(modelId, version)
        
        return NextResponse.json({
          success: true,
          data: metrics
        })
      }

      case 'recommend': {
        // Get model recommendations
        const { cropType, dataAvailable = [], objective = 'yield' } = body
        
        const recommendations = modelRegistry.recommendModels({
          cropType,
          dataAvailable,
          objective
        })

        return NextResponse.json({
          success: true,
          data: {
            recommendations,
            count: recommendations.length
          }
        })
      }

      case 'ab_test': {
        // Create A/B test
        const { modelA, modelB, trafficSplit = 0.5 } = body
        
        if (!modelA || !modelB) {
          return NextResponse.json(
            { error: 'modelA and modelB required for A/B test' },
            { status: 400 }
          )
        }

        const test = await mlOpsPipeline.createABTest(
          modelA,
          modelB,
          trafficSplit
        )

        return NextResponse.json({
          success: true,
          data: test
        })
      }

      case 'create_dataset': {
        // Create training dataset
        const { type = 'yield', cropType, startDate, endDate } = body
        
        if (type === 'yield' && cropType) {
          const dataset = await trainingService.createYieldPredictionDataset(
            cropType,
            new Date(startDate || '2023-01-01'),
            new Date(endDate || '2024-12-31')
          )

          return NextResponse.json({
            success: true,
            data: {
              datasetId: dataset.id,
              name: dataset.name,
              samples: dataset.samples,
              features: dataset.features.length,
              splits: dataset.splits
            }
          })
        }

        return NextResponse.json(
          { error: 'Unsupported dataset type' },
          { status: 400 }
        )
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    await auditLogger.logSystem(
      'mlops_post_error',
      false,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'error'
    )

    return NextResponse.json(
      { error: 'MLOps operation failed' },
      { status: 500 }
    )
  }
}