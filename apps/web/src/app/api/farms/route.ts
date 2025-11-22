import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { createSuccessResponse } from '../../../lib/api/errors'
import { validateRequestBody, validateQueryParams, createFarmSchema, paginationSchema } from '../../../lib/api/validation'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../lib/api/middleware'
// Logger replaced with console for local development
// GET /api/farms - List farms with pagination
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const pagination = validateQueryParams(
        paginationSchema,
        Object.fromEntries(searchParams)
      )
      const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = pagination
      const skip = (page - 1) * limit
      const orderBy = sortBy ? { [sortBy]: sortOrder as 'asc' | 'desc' } : { createdAt: 'desc' as const }
      // Filter farms based on user role
      // Note: Temporarily simplified to only check ownership until farm_managers table is created
      const where = request.user.role === 'ADMIN' ? {} : {
        ownerId: request.user.id
      }
      const [farms, total] = await Promise.all([
        prisma.farm.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            _count: {
              select: {
                fields: true
              }
            }
          }
        }),
        prisma.farm.count({ where })
      ])
      return createSuccessResponse({
        farms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Get farms error', error, { userId: request.user.id })
      throw error
    }
  })
)
// POST /api/farms - Create new farm
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: AuthenticatedRequest) => {
    let body: any = null
    let finalData: any = null
    
    try {
      // Parse request body once and store it
      body = await request.json()
      console.log('🚜 Farm Creation Request:', {
        userId: request.user?.id,
        email: request.user?.email,
        bodyKeys: Object.keys(body),
        requestHeaders: Object.fromEntries(request.headers.entries())
      })

      const farmData = validateRequestBody(createFarmSchema, body)
      
      // User authentication verified by middleware - using Supabase user ID directly
      console.log('✅ Authenticated Supabase user:', {
        id: request.user.id,
        email: request.user.email,
        name: request.user.name
      })

      // Extract and prepare data - only keep fields that exist in database schema
      const { description, metadata, primaryProduct, ...dbFarmData } = farmData
      
      // Only include fields that actually exist in the database schema
      finalData = {
        name: dbFarmData.name,
        ownerId: request.user.id,
        latitude: dbFarmData.latitude,
        longitude: dbFarmData.longitude,
        address: dbFarmData.address || '',
        region: dbFarmData.region || null,
        country: dbFarmData.country,
        totalArea: dbFarmData.totalArea,
        location: dbFarmData.address || `${dbFarmData.name} Farm`
      }

      console.log('🏗️ Creating farm with data:', finalData)

      // Create farm and fields in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the farm
        const farm = await tx.farm.create({
          data: finalData
        })

        // Create fields if provided in the original request
        const fields = []
        if (body.fields && Array.isArray(body.fields)) {
          for (const fieldData of body.fields) {
            const field = await tx.field.create({
              data: {
                farmId: farm.id,
                name: fieldData.name || 'Field',
                area: fieldData.area || 0,
                color: fieldData.color,
                cropType: fieldData.cropType,
                status: fieldData.fieldType || 'crop',
                soilType: fieldData.soilType,
                isActive: true
              }
            })
            fields.push(field)
          }
        }

        return { farm, fields }
      })

      console.log('✅ Farm and fields created successfully:', result.farm.id, `with ${result.fields.length} fields`)
      return createSuccessResponse({ 
        farm: result.farm, 
        fields: result.fields 
      }, 201)

    } catch (error) {
      console.error('❌ Farm creation error details:', {
        errorType: error?.constructor?.name,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : null,
        userId: request.user?.id || 'unknown',
        userEmail: request.user?.email || 'unknown',
        requestBody: body,
        finalData: finalData,
        isPrismaError: error && typeof error === 'object' && 'code' in error && typeof (error as any).code === 'string' && (error as any).code.startsWith('P')
      })

      // Handle Prisma-specific errors
      if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as any
        switch (prismaError.code) {
          case 'P2002':
            throw new Error('A farm with this name already exists')
          case 'P2003':
            throw new Error('Invalid user reference - user may not exist')
          case 'P2025':
            throw new Error('User not found')
          default:
            throw new Error(`Database error: ${prismaError.message}`)
        }
      }

      throw error // Re-throw to let middleware handle it
    }
  })
)