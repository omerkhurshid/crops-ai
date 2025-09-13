import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../lib/auth/session'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'

const livestockEventSchema = z.object({
  farmId: z.string(),
  livestockType: z.string().min(1, 'Livestock type is required'),
  eventType: z.string().min(1, 'Event type is required'),
  animalCount: z.number().int().positive('Animal count must be positive'),
  notes: z.string().optional(),
  eventDate: z.string().optional().transform(str => str ? new Date(str) : new Date())
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')

    // Build where clause
    const where: any = {
      userId: user.id
    }

    if (farmId) {
      where.farmId = farmId
    }

    const livestockEvents = await prisma.livestockEvent.findMany({
      where,
      include: {
        farm: {
          select: { name: true }
        }
      },
      orderBy: { eventDate: 'desc' }
    })

    return NextResponse.json(livestockEvents)
  } catch (error) {
    console.error('Error fetching livestock events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch livestock events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = livestockEventSchema.parse(body)

    const livestockEvent = await prisma.livestockEvent.create({
      data: {
        ...data,
        userId: user.id
      },
      include: {
        farm: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(livestockEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating livestock event:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create livestock event' },
      { status: 500 }
    )
  }
}