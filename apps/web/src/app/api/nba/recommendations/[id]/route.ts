import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth/session'
import { prisma } from '../../../../../lib/prisma'
import { z } from 'zod'

const updateRecommendationSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']).optional(),
  userResponse: z.string().optional(),
  actualOutcome: z.object({
    completed: z.boolean(),
    actualYield: z.number().optional(),
    actualCost: z.number().optional(),
    actualRevenue: z.number().optional(),
    satisfactionRating: z.number().int().min(1).max(5).optional(),
    notes: z.string().optional(),
    wouldRecommendAgain: z.boolean().optional()
  }).optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updateData = updateRecommendationSchema.parse(body)

    // Find the recommendation
    const recommendation = await prisma.decisionRecommendation.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    // Update the recommendation
    const updatedRecommendation = await prisma.decisionRecommendation.update({
      where: { id: params.id },
      data: {
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.userResponse && { userResponse: updateData.userResponse }),
        ...(updateData.actualOutcome && { actualOutcome: updateData.actualOutcome as any }),
        ...(updateData.status === 'COMPLETED' && { completedAt: new Date() }),
        updatedAt: new Date()
      }
    })

    // If status is COMPLETED and we have actual outcome data, create decision execution record
    if (updateData.status === 'COMPLETED' && updateData.actualOutcome) {
      await prisma.decisionExecution.create({
        data: {
          templateId: 'generic-recommendation', // TODO: Link to actual template
          userId: user.id,
          farmId: recommendation.farmId,
          inputs: {
            recommendationId: recommendation.id,
            originalDecision: {
              type: recommendation.type,
              priority: recommendation.priority,
              targetField: recommendation.targetField
            }
          } as any,
          recommendation: {
            title: recommendation.title,
            description: recommendation.description,
            actionSteps: recommendation.actionSteps
          } as any,
          userAction: updateData.userResponse || 'COMPLETED',
          actualOutcome: updateData.actualOutcome as any,
          satisfaction: updateData.actualOutcome.satisfactionRating,
          feedback: updateData.actualOutcome.notes,
          completedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      recommendation: {
        id: updatedRecommendation.id,
        status: updatedRecommendation.status,
        userResponse: updatedRecommendation.userResponse,
        actualOutcome: updatedRecommendation.actualOutcome,
        completedAt: updatedRecommendation.completedAt,
        updatedAt: updatedRecommendation.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recommendation = await prisma.decisionRecommendation.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        farm: {
          select: { id: true, name: true }
        }
      }
    })

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    return NextResponse.json({
      recommendation: {
        id: recommendation.id,
        type: recommendation.type,
        priority: recommendation.priority,
        title: recommendation.title,
        description: recommendation.description,
        confidence: recommendation.confidence,
        totalScore: recommendation.totalScore,
        timing: {
          idealStart: recommendation.idealStart,
          idealEnd: recommendation.idealEnd,
          mustCompleteBy: recommendation.mustCompleteBy
        },
        estimatedImpact: {
          revenue: recommendation.estimatedRevenue,
          costSavings: recommendation.estimatedCostSaving,
          yieldIncrease: recommendation.estimatedYieldGain
        },
        weatherRequirements: recommendation.weatherRequirements,
        resourceRequirements: recommendation.resourceRequirements,
        explanation: recommendation.explanation,
        actionSteps: recommendation.actionSteps,
        alternatives: recommendation.alternatives,
        targetField: recommendation.targetField,
        relatedDecisions: recommendation.relatedDecisions,
        status: recommendation.status,
        userResponse: recommendation.userResponse,
        actualOutcome: recommendation.actualOutcome,
        farm: recommendation.farm,
        createdAt: recommendation.createdAt,
        updatedAt: recommendation.updatedAt,
        completedAt: recommendation.completedAt
      }
    })

  } catch (error) {
    console.error('Error fetching recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recommendation = await prisma.decisionRecommendation.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    // Soft delete by updating status
    await prisma.decisionRecommendation.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        userResponse: 'Dismissed by user',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to delete recommendation' },
      { status: 500 }
    )
  }
}