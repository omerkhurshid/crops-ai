import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cropStageDetection } from '@/lib/ml/crop-stage-detection'
import { createSuccessResponse, handleApiError, ValidationError } from '@/lib/api/errors'
import { apiMiddleware, withMethods } from '@/lib/api/middleware'
import { auditLogger } from '@/lib/logging/audit-logger'

const stageDetectionSchema = z.object({
  fieldId: z.string().min(1),
  cropType: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  plantingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  fieldBounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }).optional()
})

const stageHistorySchema = z.object({
  fieldId: z.string().min(1),
  cropType: z.string().min(1),
  plantingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  })
})

const transitionPredictionSchema = z.object({
  fieldId: z.string().min(1),
  cropType: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  currentStage: z.string().min(1)
})

// POST /api/crops/stage-detection - Detect current crop stage
export const POST = apiMiddleware.basic(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validation = stageDetectionSchema.safeParse(body)
      
      if (!validation.success) {
        throw new ValidationError('Invalid request body: ' + validation.error.errors.map(e => e.message).join(', '))
      }

      const { fieldId, cropType, latitude, longitude, plantingDate, fieldBounds } = validation.data
      const plantingDateObj = new Date(plantingDate)

      const detection = await cropStageDetection.detectCropStage(
        fieldId,
        cropType,
        latitude,
        longitude,
        plantingDateObj,
        fieldBounds
      )

      await auditLogger.logML('crop_stage_detection_requested', fieldId, undefined, undefined, {
        fieldId,
        cropType,
        latitude,
        longitude,
        detectedStage: detection.currentStage.stage,
        confidence: detection.stageConfidence
      })

      return createSuccessResponse({
        detection,
        message: 'Crop stage detected successfully'
      })

    } catch (error) {
      await auditLogger.logAPI('crop_stage_detection_error', 'POST', false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error')
      
      return handleApiError(error)
    }
  })
)

// GET /api/crops/stage-detection/history?fieldId=123&cropType=corn&plantingDate=2024-04-15
export const GET = apiMiddleware.basic(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      
      const fieldId = searchParams.get('fieldId') || ''
      const cropType = searchParams.get('cropType') || ''
      const plantingDate = searchParams.get('plantingDate') || ''
      const action = searchParams.get('action') || 'history'

      if (action === 'history') {
        const validation = stageHistorySchema.safeParse({
          fieldId,
          cropType,
          plantingDate
        })

        if (!validation.success) {
          throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '))
        }

        const plantingDateObj = new Date(plantingDate)
        const history = await cropStageDetection.getCropStageHistory(
          fieldId,
          cropType,
          plantingDateObj
        )

        await auditLogger.logAPI('crop_stage_history_requested', 'GET', true, {
          fieldId,
          cropType,
          plantingDate,
          stagesFound: history.stageHistory.length
        })

        return createSuccessResponse({
          history,
          message: 'Crop stage history retrieved successfully'
        })

      } else if (action === 'transition') {
        const latitude = parseFloat(searchParams.get('latitude') || '0')
        const longitude = parseFloat(searchParams.get('longitude') || '0')
        const currentStage = searchParams.get('currentStage') || ''

        const validation = transitionPredictionSchema.safeParse({
          fieldId,
          cropType,
          latitude,
          longitude,
          currentStage
        })

        if (!validation.success) {
          throw new ValidationError('Invalid parameters: ' + validation.error.errors.map(e => e.message).join(', '))
        }

        const prediction = await cropStageDetection.predictStageTransition(
          fieldId,
          cropType,
          latitude,
          longitude,
          currentStage
        )

        await auditLogger.logAPI('stage_transition_prediction_requested', 'GET', true, {
          fieldId,
          cropType,
          currentStage,
          nextStage: prediction.nextStage,
          transitionProbability: prediction.transitionProbability
        })

        return createSuccessResponse({
          prediction,
          message: 'Stage transition prediction generated successfully'
        })

      } else {
        throw new ValidationError('Invalid action. Use "history" or "transition"')
      }

    } catch (error) {
      await auditLogger.logAPI('crop_stage_api_error', 'GET', false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error')
      
      return handleApiError(error)
    }
  })
)