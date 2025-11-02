import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../../lib/auth/server'
import { prisma } from '../../../../../lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const breedingRecord = await prisma.breedingRecord.findFirst({
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
        },
        mate: {
          select: { 
            id: true, 
            tagNumber: true, 
            name: true 
          }
        }
      }
    })

    if (!breedingRecord) {
      return NextResponse.json({ error: 'Breeding record not found' }, { status: 404 })
    }

    return NextResponse.json(breedingRecord)
  } catch (error) {
    console.error('Error fetching breeding record:', error)
    return NextResponse.json(
      { error: 'Failed to fetch breeding record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Verify breeding record ownership
    const existingRecord = await prisma.breedingRecord.findFirst({
      where: {
        id: params.id,
        animal: { userId: user.id }
      },
      include: {
        animal: { select: { species: true } }
      }
    })

    if (!existingRecord) {
      return NextResponse.json({ error: 'Breeding record not found' }, { status: 404 })
    }

    // If mate is being changed, verify mate ownership
    if (data.mateId && data.mateId !== existingRecord.mateId) {
      const mate = await prisma.animal.findFirst({
        where: {
          id: data.mateId,
          userId: user.id
        }
      })

      if (!mate) {
        return NextResponse.json(
          { error: 'Mate animal not found or not owned by user' },
          { status: 404 }
        )
      }
    }

    // Update expected due date if breeding date changed
    let expectedDueDate = existingRecord.expectedDueDate
    if (data.breedingDate && data.breedingDate !== existingRecord.breedingDate.toISOString()) {
      const breedingDate = new Date(data.breedingDate)
      const gestationPeriods: { [key: string]: number } = {
        cattle: 283,
        sheep: 147,
        goat: 150,
        pig: 114,
        horse: 340
      }
      
      const gestationDays = gestationPeriods[existingRecord.animal.species] || 150
      expectedDueDate = new Date(breedingDate.getTime() + gestationDays * 24 * 60 * 60 * 1000)
    }

    const updateData: any = {}
    
    if (data.mateId !== undefined) updateData.mateId = data.mateId || null
    if (data.breedingDate !== undefined) {
      updateData.breedingDate = new Date(data.breedingDate)
      updateData.expectedDueDate = expectedDueDate
    }
    if (data.breedingType !== undefined) updateData.breedingType = data.breedingType
    if (data.actualBirthDate !== undefined) updateData.actualBirthDate = data.actualBirthDate ? new Date(data.actualBirthDate) : null
    if (data.numberOfOffspring !== undefined) updateData.numberOfOffspring = data.numberOfOffspring || null
    if (data.breedingMethod !== undefined) updateData.breedingMethod = data.breedingMethod || null
    if (data.veterinarian !== undefined) updateData.veterinarian = data.veterinarian || null
    if (data.cost !== undefined) updateData.cost = data.cost || null
    if (data.notes !== undefined) updateData.notes = data.notes || null
    if (data.status !== undefined) updateData.status = data.status

    const breedingRecord = await prisma.breedingRecord.update({
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
        },
        mate: {
          select: { 
            id: true, 
            tagNumber: true, 
            name: true 
          }
        }
      }
    })

    return NextResponse.json(breedingRecord)
  } catch (error) {
    console.error('Error updating breeding record:', error)
    return NextResponse.json(
      { error: 'Failed to update breeding record' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify breeding record ownership
    const breedingRecord = await prisma.breedingRecord.findFirst({
      where: {
        id: params.id,
        animal: { userId: user.id }
      }
    })

    if (!breedingRecord) {
      return NextResponse.json({ error: 'Breeding record not found' }, { status: 404 })
    }

    await prisma.breedingRecord.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Breeding record deleted successfully' })
  } catch (error) {
    console.error('Error deleting breeding record:', error)
    return NextResponse.json(
      { error: 'Failed to delete breeding record' },
      { status: 500 }
    )
  }
}