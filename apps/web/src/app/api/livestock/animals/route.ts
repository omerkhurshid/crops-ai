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
    const farmId = searchParams.get('farmId')
    const whereClause: any = { userId: user.id }
    if (farmId) {
      whereClause.farmId = farmId
    }
    const animals = await prisma.animal.findMany({
      where: whereClause,
      include: {
        farm: { select: { name: true } },
        healthRecords: {
          take: 1,
          orderBy: { recordDate: 'desc' }
        },
        weightRecords: {
          take: 2,
          orderBy: { weighDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(animals)
  } catch (error) {
    console.error('Error fetching animals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch animals' },
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
    if (!data.tagNumber || !data.species || !data.gender || !data.farmId) {
      return NextResponse.json(
        { error: 'Missing required fields: tagNumber, species, gender, farmId' },
        { status: 400 }
      )
    }
    // Verify farm ownership
    const farm = await prisma.farm.findFirst({
      where: {
        id: data.farmId,
        ownerId: user.id
      }
    })
    if (!farm) {
      return NextResponse.json(
        { error: 'Farm not found or not owned by user' },
        { status: 404 }
      )
    }
    // Check for duplicate tag number within the farm
    const existingAnimal = await prisma.animal.findFirst({
      where: {
        farmId: data.farmId,
        tagNumber: data.tagNumber
      }
    })
    if (existingAnimal) {
      return NextResponse.json(
        { error: 'An animal with this tag number already exists on this farm' },
        { status: 409 }
      )
    }
    // Create the animal
    const animalData = {
      userId: user.id,
      farmId: data.farmId,
      tagNumber: data.tagNumber,
      name: data.name || null,
      species: data.species,
      breed: data.breed || null,
      gender: data.gender,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      birthWeight: data.birthWeight || null,
      currentWeight: data.currentWeight || null,
      motherId: data.motherId || null,
      fatherId: data.fatherId || null,
      color: data.color || null,
      markings: data.markings || null,
      purchasePrice: data.purchasePrice || null,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      currentValue: data.currentValue || null,
      notes: data.notes || null,
      status: 'active'
    }
    const animal = await prisma.animal.create({
      data: animalData,
      include: {
        farm: { select: { name: true } }
      }
    })
    // If current weight is provided, create an initial weight record
    if (data.currentWeight) {
      await prisma.weightRecord.create({
        data: {
          animalId: animal.id,
          farmId: data.farmId,
          userId: user.id,
          weight: data.currentWeight,
          weighDate: new Date(),
          notes: 'Initial weight record'
        }
      })
    }
    return NextResponse.json(animal, { status: 201 })
  } catch (error) {
    console.error('Error creating animal:', error)
    return NextResponse.json(
      { error: 'Failed to create animal' },
      { status: 500 }
    )
  }
}