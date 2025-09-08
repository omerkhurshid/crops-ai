import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'

const livestockEventSchema = z.object({
  farmId: z.string(),
  livestockType: z.enum(['cattle', 'sheep', 'goats', 'pigs', 'poultry', 'other']),
  eventType: z.enum(['vaccination', 'breeding', 'calving', 'health_check', 'treatment', 'death', 'sale', 'other']),
  animalCount: z.number().int().positive(),
  notes: z.string().optional(),
  date: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = livestockEventSchema.parse(body)

    const farm = await prisma.farm.findFirst({
      where: {
        id: validatedData.farmId,
        ownerId: user.id
      }
    })

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    const livestockEvent = await prisma.livestockEvent.create({
      data: {
        farmId: validatedData.farmId,
        livestockType: validatedData.livestockType.toUpperCase(),
        eventType: validatedData.eventType.toUpperCase(),
        animalCount: validatedData.animalCount,
        notes: validatedData.notes,
        eventDate: validatedData.date ? new Date(validatedData.date) : new Date(),
        userId: user.id
      }
    })

    if (['sale', 'treatment'].includes(validatedData.eventType)) {
      const estimatedCosts = {
        treatment: 50 * validatedData.animalCount,
        sale: -500 * validatedData.animalCount
      }
      
      const amount = estimatedCosts[validatedData.eventType as keyof typeof estimatedCosts] || 0
      
      if (amount !== 0) {
        await prisma.financialTransaction.create({
          data: {
            type: amount > 0 ? 'EXPENSE' : 'INCOME',
            amount: Math.abs(amount),
            category: 'LIVESTOCK' as any,
            notes: `${validatedData.eventType.toUpperCase()}: ${validatedData.animalCount} ${validatedData.livestockType}`,
            createdById: user.id,
            transactionDate: validatedData.date ? new Date(validatedData.date) : new Date(),
            userId: user.id,
            farmId: validatedData.farmId
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      event: {
        id: livestockEvent.id,
        eventType: livestockEvent.eventType,
        livestockType: livestockEvent.livestockType,
        animalCount: livestockEvent.animalCount,
        notes: livestockEvent.notes,
        date: livestockEvent.eventDate
      }
    })
  } catch (error) {
    console.error('Error creating livestock event:', error)
    return NextResponse.json(
      { error: 'Failed to create livestock event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await prisma.livestockEvent.findMany({
      where: {
        userId: user.id
      },
      include: {
        farm: {
          select: { id: true, name: true }
        }
      },
      orderBy: { eventDate: 'desc' },
      take: 20
    })

    const summary = {
      totalEvents: events.length,
      recentVaccinations: events.filter(e => e.eventType === 'VACCINATION' && 
        new Date(e.eventDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      recentBirths: events.filter(e => e.eventType === 'CALVING' && 
        new Date(e.eventDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    }

    return NextResponse.json({ events, summary })
  } catch (error) {
    console.error('Error fetching livestock events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch livestock events' },
      { status: 500 }
    )
  }
}