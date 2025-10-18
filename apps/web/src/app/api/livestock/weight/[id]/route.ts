import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth/session'
import { prisma } from '../../../../../lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const weightRecord = await prisma.weightRecord.findFirst({
      where: {
        id: params.id,
        animal: { userId: user.id }
      },
      include: {
        animal: {
          select: { 
            id: true, 
            tagNumber: true, 
            name: true, 
            species: true,
            farm: { select: { name: true } }
          }
        }
      }
    })

    if (!weightRecord) {
      return NextResponse.json({ error: 'Weight record not found' }, { status: 404 })
    }

    return NextResponse.json(weightRecord)
  } catch (error) {
    console.error('Error fetching weight record:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weight record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Verify weight record ownership
    const existingRecord = await prisma.weightRecord.findFirst({
      where: {
        id: params.id,
        animal: { userId: user.id }
      }
    })

    if (!existingRecord) {
      return NextResponse.json({ error: 'Weight record not found' }, { status: 404 })
    }

    const updateData: any = {}
    
    if (data.weighDate !== undefined) updateData.weighDate = new Date(data.weighDate)
    if (data.weight !== undefined) updateData.weight = parseFloat(data.weight)
    if (data.bodyConditionScore !== undefined) updateData.bodyConditionScore = data.bodyConditionScore ? parseFloat(data.bodyConditionScore) : null
    if (data.notes !== undefined) updateData.notes = data.notes || null

    const weightRecord = await prisma.weightRecord.update({
      where: { id: params.id },
      data: updateData,
      include: {
        animal: {
          select: { 
            id: true, 
            tagNumber: true, 
            name: true, 
            species: true 
          }
        }
      }
    })

    // If weight was updated, update the animal's current weight if this is the most recent record
    if (data.weight !== undefined) {
      const mostRecentRecord = await prisma.weightRecord.findFirst({
        where: { animalId: existingRecord.animalId },
        orderBy: { weighDate: 'desc' }
      })

      if (mostRecentRecord && mostRecentRecord.id === params.id) {
        await prisma.animal.update({
          where: { id: existingRecord.animalId },
          data: { currentWeight: parseFloat(data.weight) }
        })
      }
    }

    return NextResponse.json(weightRecord)
  } catch (error) {
    console.error('Error updating weight record:', error)
    return NextResponse.json(
      { error: 'Failed to update weight record' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify weight record ownership
    const weightRecord = await prisma.weightRecord.findFirst({
      where: {
        id: params.id,
        animal: { userId: user.id }
      }
    })

    if (!weightRecord) {
      return NextResponse.json({ error: 'Weight record not found' }, { status: 404 })
    }

    await prisma.weightRecord.delete({
      where: { id: params.id }
    })

    // Update animal's current weight to the most recent remaining record
    const mostRecentRecord = await prisma.weightRecord.findFirst({
      where: { animalId: weightRecord.animalId },
      orderBy: { weighDate: 'desc' }
    })

    if (mostRecentRecord) {
      await prisma.animal.update({
        where: { id: weightRecord.animalId },
        data: { currentWeight: mostRecentRecord.weight }
      })
    }

    return NextResponse.json({ message: 'Weight record deleted successfully' })
  } catch (error) {
    console.error('Error deleting weight record:', error)
    return NextResponse.json(
      { error: 'Failed to delete weight record' },
      { status: 500 }
    )
  }
}