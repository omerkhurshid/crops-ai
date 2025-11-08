import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { prisma } from '../../../../lib/prisma'
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const animalId = searchParams.get('animalId')
    const farmId = searchParams.get('farmId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const whereClause: any = {
      animal: { userId: user.id }
    }
    if (animalId) {
      whereClause.animalId = animalId
    }
    if (farmId) {
      whereClause.animal = {
        ...whereClause.animal,
        farmId: farmId
      }
    }
    if (startDate && endDate) {
      whereClause.weighDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    const weightRecords = await prisma.weightRecord.findMany({
      where: whereClause,
      include: {
        animal: {
          select: { 
            id: true, 
            tagNumber: true, 
            name: true, 
            species: true,
            birthDate: true,
            farm: { select: { name: true } }
          }
        }
      },
      orderBy: { weighDate: 'desc' }
    })
    return NextResponse.json(weightRecords)
  } catch (error) {
    console.error('Error fetching weight records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weight records' },
      { status: 500 }
    )
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const data = await request.json()
    // Validate required fields
    if (!data.animalId || !data.weighDate || !data.weight) {
      return NextResponse.json(
        { error: 'Missing required fields: animalId, weighDate, weight' },
        { status: 400 }
      )
    }
    // Verify animal ownership
    const animal = await prisma.animal.findFirst({
      where: {
        id: data.animalId,
        userId: user.id
      }
    })
    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found or not owned by user' },
        { status: 404 }
      )
    }
    const weightRecord = await prisma.weightRecord.create({
      data: {
        animalId: data.animalId,
        farmId: animal.farmId,
        userId: user.id,
        weighDate: new Date(data.weighDate),
        weight: parseFloat(data.weight),
        notes: data.notes || null
      },
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
    // Update the animal's current weight
    await prisma.animal.update({
      where: { id: data.animalId },
      data: { currentWeight: parseFloat(data.weight) }
    })
    return NextResponse.json(weightRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating weight record:', error)
    return NextResponse.json(
      { error: 'Failed to create weight record' },
      { status: 500 }
    )
  }
}