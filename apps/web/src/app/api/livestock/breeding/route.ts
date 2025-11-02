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

    const breedingRecords = await prisma.breedingRecord.findMany({
      where: whereClause,
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
      },
      orderBy: { breedingDate: 'desc' }
    })

    return NextResponse.json(breedingRecords)
  } catch (error) {
    console.error('Error fetching breeding records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch breeding records' },
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
    if (!data.animalId || !data.breedingDate || !data.breedingType) {
      return NextResponse.json(
        { error: 'Missing required fields: animalId, breedingDate, breedingType' },
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

    // If mate is specified, verify mate ownership
    if (data.mateId) {
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

    // Calculate expected due date based on species
    let expectedDueDate = null
    if (data.breedingDate) {
      const breedingDate = new Date(data.breedingDate)
      const gestationPeriods: { [key: string]: number } = {
        cattle: 283, // 283 days
        sheep: 147,  // 147 days
        goat: 150,   // 150 days
        pig: 114,    // 114 days
        horse: 340   // 340 days
      }
      
      const gestationDays = gestationPeriods[animal.species] || 150
      expectedDueDate = new Date(breedingDate.getTime() + gestationDays * 24 * 60 * 60 * 1000)
    }

    const breedingRecord = await prisma.breedingRecord.create({
      data: {
        animalId: data.animalId,
        farmId: animal.farmId,
        userId: user.id,
        mateId: data.mateId || null,
        breedingDate: new Date(data.breedingDate),
        breedingType: data.breedingType,
        expectedDueDate: expectedDueDate,
        actualBirthDate: data.actualBirthDate ? new Date(data.actualBirthDate) : null,
        numberOfOffspring: data.numberOfOffspring || null,
        cost: data.cost || null,
        notes: data.notes || null,
        pregnancyStatus: data.status || 'unknown'
      },
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

    return NextResponse.json(breedingRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating breeding record:', error)
    return NextResponse.json(
      { error: 'Failed to create breeding record' },
      { status: 500 }
    )
  }
}