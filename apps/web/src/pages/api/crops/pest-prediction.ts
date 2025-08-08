/**
 * API Endpoint: Disease/Pest Outbreak Prediction
 * 
 * Provides comprehensive pest and disease risk assessment and prevention recommendations
 * for fields using environmental conditions, crop stage data, and ML models.
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { auditLogger } from '../../../lib/logging/audit-logger'
import { diseasePestPrediction } from '../../../lib/ml/disease-pest-prediction'
import { rateLimit } from '../../../lib/middleware/rate-limit'

interface PestPredictionRequest {
  fieldId: string
  cropType: string
  latitude: number
  longitude: number
  plantingDate: string
  fieldBounds?: {
    north: number
    south: number
    east: number
    west: number
  }
  action?: 'predict' | 'history' | 'recommendations'
}

interface PestPredictionResponse {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    timestamp: string
    processingTime: number
    confidence: number
    dataSource: string
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PestPredictionResponse>
) {
  const startTime = Date.now()
  let params: any = {}
  
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(req as any)
    if (!rateLimitResult.success) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      })
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      })
    }

    // Extract parameters from request
    if (req.method === 'POST') {
      params = req.body
    } else {
      // GET request - extract from query params
      params = {
        fieldId: req.query.fieldId as string,
        cropType: req.query.cropType as string,
        latitude: parseFloat(req.query.latitude as string),
        longitude: parseFloat(req.query.longitude as string),
        plantingDate: req.query.plantingDate as string,
        action: (req.query.action as 'predict' | 'history' | 'recommendations') || 'predict'
      }

      if (req.query.fieldBounds) {
        try {
          params.fieldBounds = JSON.parse(req.query.fieldBounds as string)
        } catch (e) {
          // Invalid fieldBounds JSON, continue without it
        }
      }
    }

    // Validate required parameters
    if (!params.fieldId || !params.cropType || !params.latitude || !params.longitude || !params.plantingDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: fieldId, cropType, latitude, longitude, plantingDate'
      })
    }

    // Validate data types
    if (isNaN(params.latitude) || isNaN(params.longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude values'
      })
    }

    // Validate date
    const plantingDate = new Date(params.plantingDate)
    if (isNaN(plantingDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid planting date format. Use ISO date string.'
      })
    }

    // Validate crop type
    const supportedCrops = ['corn', 'soybean', 'wheat']
    if (!supportedCrops.includes(params.cropType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported crop type: ${params.cropType}. Supported types: ${supportedCrops.join(', ')}`
      })
    }

    // Log API request
    await auditLogger.logML('pest_prediction_request', params.fieldId, undefined, undefined, {
      fieldId: params.fieldId,
      cropType: params.cropType,
      action: params.action || 'predict'
    })

    let result: any

    // Handle different actions
    switch (params.action || 'predict') {
      case 'predict':
        result = await diseasePestPrediction.predictOutbreaks(
          params.fieldId,
          params.cropType,
          params.latitude,
          params.longitude,
          plantingDate,
          params.fieldBounds
        )
        break

      case 'history':
        result = await diseasePestPrediction.getPredictionHistory(
          params.fieldId,
          params.cropType,
          plantingDate
        )
        break

      case 'recommendations':
        // Get current predictions and extract recommendations
        const predictions = await diseasePestPrediction.predictOutbreaks(
          params.fieldId,
          params.cropType,
          params.latitude,
          params.longitude,
          plantingDate,
          params.fieldBounds
        )
        
        result = {
          fieldId: params.fieldId,
          cropType: params.cropType,
          timestamp: new Date().toISOString(),
          recommendations: predictions.threats.flatMap((threat: any) => [
            ...threat.preventiveMeasures,
            ...threat.treatments.map((t: any) => t.method)
          ]).filter((rec: string, index: number, array: string[]) => 
            array.indexOf(rec) === index // Remove duplicates
          ),
          monitoring: predictions.threats.flatMap((threat: any) => 
            threat.monitoringSchedule || []
          ),
          totalThreats: predictions.threats.length,
          highRiskThreats: predictions.threats.filter((t: any) => t.riskLevel === 'high').length,
          avgRiskScore: predictions.threats.reduce((sum: number, t: any) => sum + t.riskScore, 0) / predictions.threats.length
        }
        break

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Supported actions: predict, history, recommendations'
        })
    }

    const processingTime = Date.now() - startTime

    // Calculate average confidence from result
    let confidence = 0.8 // Default confidence
    if (result.threats && Array.isArray(result.threats)) {
      confidence = result.threats.reduce((sum: number, threat: any) => 
        sum + (threat.confidence || 0.8), 0) / result.threats.length
    }

    // Log successful response
    await auditLogger.logML('pest_prediction_success', params.fieldId, undefined, undefined, {
      fieldId: params.fieldId,
      action: params.action || 'predict',
      processingTime,
      confidence,
      threatCount: result.threats?.length || 0
    })

    return res.status(200).json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
        confidence,
        dataSource: 'integrated_ml_model'
      }
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    // Log error
    await auditLogger.logML('pest_prediction_error', params.fieldId || 'unknown', undefined, undefined, {
      error: errorMessage,
      processingTime
    })

    console.error('Pest prediction API error:', error)

    return res.status(500).json({
      success: false,
      error: 'Internal server error during pest prediction',
      metadata: {
        timestamp: new Date().toISOString(),
        processingTime,
        confidence: 0,
        dataSource: 'error'
      }
    })
  }
}