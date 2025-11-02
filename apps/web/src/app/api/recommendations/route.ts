import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../lib/auth/server'
import { prisma } from '../../../lib/prisma'
import { rateLimitWithFallback } from '../../../lib/rate-limit'
import { recommendationEngine } from '../../../lib/analytics/recommendation-engine'

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
    const fieldId = searchParams.get('fieldId')
    const generateNew = searchParams.get('generateNew') === 'true'
    const limit = searchParams.get('limit')

    if (!farmId) {
      return NextResponse.json({ error: 'farmId is required' }, { status: 400 })
    }

    // Verify user owns the farm
    let farm
    try {
      farm = await prisma.farm.findFirst({
        where: { 
          id: farmId,
          ownerId: user.id
        }
      })
    } catch (error: any) {
      console.error('Failed to query farm:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found or access denied' }, { status: 404 })
    }

    if (generateNew) {
      // Generate fresh recommendations using our analytics engine
      const newRecommendations = await recommendationEngine.generateRecommendations({
        farmId,
        fieldId: fieldId || undefined,
        currentDate: new Date()
      })

      // Save to database
      await recommendationEngine.saveRecommendations(farmId, newRecommendations)

      return NextResponse.json({
        recommendations: newRecommendations,
        generated: true,
        timestamp: new Date().toISOString()
      })
    } else {
      // Get existing recommendations from database (updated schema)
      let existingRecommendations: any[] = []
      try {
        existingRecommendations = await prisma.recommendation.findMany({
          where: {
            OR: [
              { farmId: farmId },
              { 
                field: {
                  farmId: farmId
                }
              }
            ],
            status: 'active',
            ...(fieldId && { fieldId })
          },
          include: {
            field: {
              select: {
                name: true,
                cropType: true
              }
            }
          },
          orderBy: [
            { 
              priority: 'desc' // urgent, high, medium, low
            },
            { 
              optimalTiming: 'asc' 
            }
          ],
          take: limit ? parseInt(limit) : undefined
        })
      } catch (dbError: any) {

        existingRecommendations = []
      }

      // Transform to API format
      const formattedRecommendations = existingRecommendations.map(rec => ({
        id: rec.id,
        type: rec.recommendationType,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        actionRequired: rec.actionRequired,
        potentialImpact: rec.potentialImpact,
        confidenceLevel: rec.confidenceLevel,
        estimatedCost: rec.estimatedCost ? Number(rec.estimatedCost) : undefined,
        estimatedRoi: rec.estimatedRoi ? Number(rec.estimatedRoi) : undefined,
        optimalTiming: rec.optimalTiming,
        expiresAt: rec.expiresAt,
        status: rec.status,
        fieldName: rec.field?.name,
        cropType: rec.field?.cropType,
        createdAt: rec.createdAt
      }))

      return NextResponse.json({
        recommendations: formattedRecommendations,
        generated: false,
        count: formattedRecommendations.length
      })
    }

  } catch (error) {
    console.error('Error fetching/generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recommendationId, action } = body

    if (!recommendationId || !action) {
      return NextResponse.json({ 
        error: 'recommendationId and action are required' 
      }, { status: 400 })
    }

    // Verify user owns the recommendation's farm
    const recommendation = await prisma.recommendation.findFirst({
      where: { id: recommendationId },
      include: {
        farm: true,
        field: {
          include: {
            farm: true
          }
        }
      }
    })

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    const farmOwnerId = recommendation.farm?.ownerId || recommendation.field?.farm.ownerId
    if (farmOwnerId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update recommendation status
    let newStatus: string
    switch (action) {
      case 'complete':
        newStatus = 'completed'
        break
      case 'dismiss':
        newStatus = 'dismissed'
        break
      case 'reactivate':
        newStatus = 'active'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedRecommendation = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { status: newStatus }
    })

    return NextResponse.json({
      recommendation: updatedRecommendation,
      message: `Recommendation ${action}d successfully`
    })

  } catch (error) {
    console.error('Error updating recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    )
  }
}