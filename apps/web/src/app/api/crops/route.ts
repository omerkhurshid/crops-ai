import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../lib/auth/server'
import { prisma } from '../../../lib/prisma'
import { rateLimitWithFallback } from '../../../lib/rate-limit'
export async function GET(request: NextRequest) {
  // Apply rate limiting for API endpoints
  const { success, headers } = await rateLimitWithFallback(request, 'api')
  if (!success) {
    return new Response('Too Many Requests. Please try again later.', {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': headers['X-RateLimit-Reset'],
        'Content-Type': 'text/plain',
      },
    })
  }
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const year = searchParams.get('year')
    if (!farmId) {
      return NextResponse.json({ error: 'farmId is required' }, { status: 400 })
    }
    // Build where clause
    const where: any = {
      field: {
        farm: {
          id: farmId,
          ownerId: user.id
        }
      }
    }
    // Filter by year if provided
    if (year) {
      const yearNum = parseInt(year)
      where.OR = [
        {
          plantingDate: {
            gte: new Date(yearNum, 0, 1),
            lt: new Date(yearNum + 1, 0, 1)
          }
        },
        {
          expectedHarvestDate: {
            gte: new Date(yearNum, 0, 1),
            lt: new Date(yearNum + 1, 0, 1)
          }
        }
      ]
    }
    let crops: any[] = []
    try {
      crops = await prisma.crop.findMany({
        where,
        include: {
          field: {
            select: { 
              name: true,
              area: true
            }
          }
        },
        orderBy: [
          { plantingDate: 'asc' }
        ]
      })
    } catch (dbError: any) {
      // Return empty array if table doesn't exist yet
      crops = []
    }
    // Transform crops to include enhanced planning data
    const enhancedCrops = crops.map(crop => ({
      id: crop.id,
      cropName: crop.cropType,
      variety: crop.variety || '',
      location: crop.field?.name || 'Unknown Field',
      bedNumber: '',
      plantedQuantity: crop.field?.area || 0,
      unit: 'hectares',
      startDate: crop.plantingDate?.toISOString() || '',
      plantDate: crop.plantingDate?.toISOString() || '',
      harvestDate: crop.expectedHarvestDate?.toISOString() || '',
      estimatedYield: 0, // Would be calculated from NDVI data
      yieldUnit: 'tons',
      status: crop.status?.toLowerCase() || 'planned',
      notes: ''
    }))
    return NextResponse.json(enhancedCrops)
  } catch (error) {
    console.error('Error fetching crops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crops' },
      { status: 500 }
    )
  }
}
export async function POST(request: NextRequest) {
  // Apply rate limiting for API endpoints
  const { success, headers } = await rateLimitWithFallback(request, 'api')
  if (!success) {
    return new Response('Too Many Requests. Please try again later.', {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': headers['X-RateLimit-Reset'],
        'Content-Type': 'text/plain',
      },
    })
  }
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { 
      cropId, 
      fieldId, 
      plantingDate, 
      harvestDate, 
      quantity, 
      unit, 
      variety, 
      notes,
      farmId
    } = body
    // Validate required fields
    if (!cropId || !fieldId || !plantingDate || !farmId) {
      return NextResponse.json({ 
        error: 'Missing required fields: cropId, fieldId, plantingDate, farmId' 
      }, { status: 400 })
    }
    // Verify user owns the farm
    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        ownerId: user.id
      }
    })
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found or not owned by user' }, { status: 404 })
    }
    // Verify field belongs to farm
    const field = await prisma.field.findFirst({
      where: {
        id: fieldId,
        farmId: farmId
      }
    })
    if (!field) {
      return NextResponse.json({ error: 'Field not found or not in specified farm' }, { status: 404 })
    }
    // Get crop information from our knowledge database
    const { getCropById } = await import('../../../lib/crop-planning/crop-knowledge')
    const cropInfo = getCropById(cropId)
    if (!cropInfo) {
      return NextResponse.json({ error: 'Invalid crop type' }, { status: 400 })
    }
    // Create crop planning entry
    const crop = await prisma.crop.create({
      data: {
        fieldId: fieldId,
        cropType: cropInfo.name,
        variety: variety || cropInfo.variety || '',
        plantingDate: new Date(plantingDate),
        expectedHarvestDate: harvestDate ? new Date(harvestDate) : new Date(new Date(plantingDate).getTime() + (cropInfo.daysToMaturity * 24 * 60 * 60 * 1000)),
        status: 'PLANNED'
      },
      include: {
        field: {
          select: {
            name: true,
            area: true,
            farm: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })
    // Transform response to match frontend expectations
    const response = {
      id: crop.id,
      cropName: crop.cropType,
      variety: crop.variety,
      location: crop.field.name,
      bedNumber: '',
      plantedQuantity: quantity || field.area,
      unit: unit || 'hectares',
      startDate: crop.plantingDate.toISOString(),
      plantDate: crop.plantingDate.toISOString(),
      harvestDate: crop.expectedHarvestDate?.toISOString() || '',
      estimatedYield: 0,
      yieldUnit: 'tons',
      status: 'planned',
      notes: '',
      cropInfo: cropInfo,
      farmName: crop.field.farm.name
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating crop plan:', error)
    return NextResponse.json(
      { error: 'Failed to create crop plan' },
      { status: 500 }
    )
  }
}