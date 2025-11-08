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
    const animal = await prisma.animal.findUnique({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        farm: { select: { id: true, name: true } },
        mother: { select: { id: true, tagNumber: true, name: true } },
        father: { select: { id: true, tagNumber: true, name: true } },
        motherOffspring: { 
          select: { id: true, tagNumber: true, name: true, birthDate: true },
          where: { status: 'active' }
        },
        fatherOffspring: { 
          select: { id: true, tagNumber: true, name: true, birthDate: true },
          where: { status: 'active' }
        },
        healthRecords: {
          orderBy: { recordDate: 'desc' },
          take: 10
        },
        breedingRecords: {
          orderBy: { breedingDate: 'desc' },
          take: 5,
          include: {
            mate: { select: { tagNumber: true, name: true } }
          }
        },
        weightRecords: {
          orderBy: { weighDate: 'desc' },
          take: 20
        },
        feedRecords: {
          orderBy: { feedDate: 'desc' },
          take: 10
        }
      }
    })
    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 })
    }
    return NextResponse.json(animal)
  } catch (error) {
    console.error('Error fetching animal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch animal' },
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
    // Verify animal ownership
    const existingAnimal = await prisma.animal.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })
    if (!existingAnimal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 })
    }
    // If tag number is being changed, check for duplicates
    if (data.tagNumber && data.tagNumber !== existingAnimal.tagNumber) {
      const duplicateAnimal = await prisma.animal.findFirst({
        where: {
          farmId: existingAnimal.farmId,
          tagNumber: data.tagNumber,
          id: { not: params.id }
        }
      })
      if (duplicateAnimal) {
        return NextResponse.json(
          { error: 'An animal with this tag number already exists on this farm' },
          { status: 409 }
        )
      }
    }
    // Update the animal
    const updateData: any = {}
    if (data.tagNumber !== undefined) updateData.tagNumber = data.tagNumber
    if (data.name !== undefined) updateData.name = data.name || null
    if (data.species !== undefined) updateData.species = data.species
    if (data.breed !== undefined) updateData.breed = data.breed || null
    if (data.gender !== undefined) updateData.gender = data.gender
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null
    if (data.birthWeight !== undefined) updateData.birthWeight = data.birthWeight || null
    if (data.currentWeight !== undefined) updateData.currentWeight = data.currentWeight || null
    if (data.motherId !== undefined) updateData.motherId = data.motherId || null
    if (data.fatherId !== undefined) updateData.fatherId = data.fatherId || null
    if (data.color !== undefined) updateData.color = data.color || null
    if (data.markings !== undefined) updateData.markings = data.markings || null
    if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice || null
    if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null
    if (data.currentValue !== undefined) updateData.currentValue = data.currentValue || null
    if (data.notes !== undefined) updateData.notes = data.notes || null
    if (data.status !== undefined) updateData.status = data.status
    const animal = await prisma.animal.update({
      where: { id: params.id },
      data: updateData,
      include: {
        farm: { select: { name: true } }
      }
    })
    return NextResponse.json(animal)
  } catch (error) {
    console.error('Error updating animal:', error)
    return NextResponse.json(
      { error: 'Failed to update animal' },
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
    // Verify animal ownership
    const animal = await prisma.animal.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })
    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 })
    }
    // Soft delete by setting status to 'removed'
    await prisma.animal.update({
      where: { id: params.id },
      data: { status: 'removed' }
    })
    return NextResponse.json({ message: 'Animal removed successfully' })
  } catch (error) {
    console.error('Error deleting animal:', error)
    return NextResponse.json(
      { error: 'Failed to delete animal' },
      { status: 500 }
    )
  }
}