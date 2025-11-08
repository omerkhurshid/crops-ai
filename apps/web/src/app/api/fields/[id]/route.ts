import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../../lib/api/middleware'
// GET /api/fields/[id] - Get specific field
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const fieldId = params.id
      if (!fieldId) {
        throw new ValidationError('Field ID is required')
      }
      // Find field and verify ownership
      const field = await prisma.field.findFirst({
        where: {
          id: fieldId,
          farm: { ownerId: request.user.id }
        },
        include: {
          farm: {
            select: {
              id: true,
              name: true
            }
          },
          satelliteData: {
            select: {
              captureDate: true,
              ndvi: true,
              stressLevel: true
            },
            orderBy: { captureDate: 'desc' },
            take: 1
          }
        }
      })
      if (!field) {
        throw new ValidationError('Field not found or access denied')
      }
      // Transform field data
      const transformedField = {
        id: field.id,
        name: field.name,
        farmId: field.farmId,
        farmName: field.farm?.name,
        area: field.area,
        soilType: field.soilType,
        color: field.color,
        cropType: field.cropType,
        status: field.status,
        createdAt: field.createdAt,
        lastAnalysis: field.satelliteData?.[0] ? {
          date: field.satelliteData[0].captureDate,
          ndvi: field.satelliteData[0].ndvi,
          stressLevel: field.satelliteData[0].stressLevel?.toLowerCase()
        } : null
      }
      return createSuccessResponse({ field: transformedField })
    } catch (error) {
      return handleApiError(error)
    }
  })
)
// PATCH /api/fields/[id] - Update field
export const PATCH = apiMiddleware.protected(
  withMethods(['PATCH'], async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const fieldId = params.id
      if (!fieldId) {
        throw new ValidationError('Field ID is required')
      }
      const body = await request.json()
      const { name, color, cropType, status, soilType, area } = body
      // Find field and verify ownership
      const existingField = await prisma.field.findFirst({
        where: {
          id: fieldId,
          farm: { ownerId: request.user.id }
        }
      })
      if (!existingField) {
        throw new ValidationError('Field not found or access denied')
      }
      // Prepare update data
      const updateData: any = {}
      if (name !== undefined) updateData.name = name.trim()
      if (color !== undefined) updateData.color = color
      if (cropType !== undefined) updateData.cropType = cropType?.trim() || null
      if (status !== undefined) updateData.status = status
      if (soilType !== undefined) updateData.soilType = soilType?.trim() || null
      if (area !== undefined && !isNaN(parseFloat(area))) updateData.area = parseFloat(area)
      // Update field
      const updatedField = await prisma.field.update({
        where: { id: fieldId },
        data: updateData,
        include: {
          farm: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      return createSuccessResponse({ 
        field: updatedField,
        message: 'Field updated successfully'
      })
    } catch (error) {
      return handleApiError(error)
    }
  })
)
// DELETE /api/fields/[id] - Delete field
export const DELETE = apiMiddleware.protected(
  withMethods(['DELETE'], async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const fieldId = params.id
      if (!fieldId) {
        throw new ValidationError('Field ID is required')
      }
      // Find field and verify ownership
      const existingField = await prisma.field.findFirst({
        where: {
          id: fieldId,
          farm: { ownerId: request.user.id }
        }
      })
      if (!existingField) {
        throw new ValidationError('Field not found or access denied')
      }
      // Delete field
      await prisma.field.delete({
        where: { id: fieldId }
      })
      return createSuccessResponse({ 
        message: 'Field deleted successfully'
      })
    } catch (error) {
      return handleApiError(error)
    }
  })
)