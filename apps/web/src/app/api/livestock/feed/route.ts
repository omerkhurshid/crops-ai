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
      whereClause.feedDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    const feedRecords = await prisma.feedRecord.findMany({
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
        }
      },
      orderBy: { feedDate: 'desc' }
    })
    return NextResponse.json(feedRecords)
  } catch (error) {
    console.error('Error fetching feed records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed records' },
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
    if (!data.animalId || !data.feedDate || !data.feedType || !data.quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: animalId, feedDate, feedType, quantity' },
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
    const feedRecord = await prisma.feedRecord.create({
      data: {
        animalId: data.animalId,
        farmId: animal.farmId,
        userId: user.id,
        feedDate: new Date(data.feedDate),
        feedType: data.feedType,
        feedName: data.brand || '',
        quantity: parseFloat(data.quantity),
        unit: data.unit || 'lbs',
        costPerUnit: data.costPerUnit ? parseFloat(data.costPerUnit) : null,
        totalCost: data.totalCost ? parseFloat(data.totalCost) : null,
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
    return NextResponse.json(feedRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating feed record:', error)
    return NextResponse.json(
      { error: 'Failed to create feed record' },
      { status: 500 }
    )
  }
}