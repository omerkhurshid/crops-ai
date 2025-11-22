import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api/errors'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../../../lib/api/middleware'
import { z } from 'zod'

// Validation schema for field creation
const createFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  area: z.number().min(0, 'Area must be non-negative'),
  boundaries: z.array(z.object({
    lat: z.number(),
    lng: z.number()
  })).optional(),
  color: z.string().optional(),
  cropType: z.string().optional(),
  fieldType: z.enum(['crop', 'livestock']).optional(),
  soilType: z.string().optional()
})

// GET /api/farms/[id]/fields - Get fields for a farm
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const farmId = params.id

      // Verify farm ownership
      const farm = await prisma.farm.findFirst({
        where: {
          id: farmId,
          ownerId: request.user.id
        }
      })

      if (!farm) {
        return createErrorResponse('Farm not found or access denied', 404)
      }

      // Get fields for this farm
      const fields = await prisma.field.findMany({
        where: {
          farmId: farmId
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      return createSuccessResponse({ fields })
      
    } catch (error) {
      console.error('Error fetching fields:', error)
      return createErrorResponse('Failed to fetch fields', 500)
    }
  })
)

// POST /api/farms/[id]/fields - Create a new field
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const farmId = params.id
      const body = await request.json()
      
      console.log('📍 Field creation request:', {
        farmId,
        userId: request.user.id,
        bodyKeys: Object.keys(body)
      })

      // Validate request body
      const fieldData = createFieldSchema.parse(body)

      // Verify farm ownership
      const farm = await prisma.farm.findFirst({
        where: {
          id: farmId,
          ownerId: request.user.id
        }
      })

      if (!farm) {
        return createErrorResponse('Farm not found or access denied', 404)
      }

      // Prepare field data for database
      const dbFieldData = {
        farmId: farmId,
        name: fieldData.name,
        area: fieldData.area,
        // Store boundaries as JSON if provided
        boundary: fieldData.boundaries ? JSON.stringify(fieldData.boundaries) : null,
        // Store additional metadata as JSON
        metadata: JSON.stringify({
          color: fieldData.color,
          cropType: fieldData.cropType,
          fieldType: fieldData.fieldType
        }),
        soilType: fieldData.soilType
      }

      console.log('🏗️ Creating field with data:', dbFieldData)

      const field = await prisma.field.create({
        data: dbFieldData
      })

      console.log('✅ Field created successfully:', field.id)
      return createSuccessResponse({ field }, 201)

    } catch (error) {
      console.error('❌ Field creation error:', error)
      
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0]
        return createErrorResponse(`Validation error: ${firstError.message}`, 400)
      }
      
      return createErrorResponse('Failed to create field', 500)
    }
  })
)