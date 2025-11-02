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

    const feedRecord = await prisma.feedRecord.findFirst({
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

    if (!feedRecord) {
      return NextResponse.json({ error: 'Feed record not found' }, { status: 404 })
    }

    return NextResponse.json(feedRecord)
  } catch (error) {
    console.error('Error fetching feed record:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed record' },
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

    // Verify feed record ownership
    const existingRecord = await prisma.feedRecord.findFirst({
      where: {
        id: params.id,
        animal: { userId: user.id }
      }
    })

    if (!existingRecord) {
      return NextResponse.json({ error: 'Feed record not found' }, { status: 404 })
    }

    const updateData: any = {}
    
    if (data.feedDate !== undefined) updateData.feedDate = new Date(data.feedDate)
    if (data.feedType !== undefined) updateData.feedType = data.feedType
    if (data.brand !== undefined) updateData.brand = data.brand || null
    if (data.quantity !== undefined) updateData.quantity = parseFloat(data.quantity)
    if (data.unit !== undefined) updateData.unit = data.unit
    if (data.costPerUnit !== undefined) updateData.costPerUnit = data.costPerUnit ? parseFloat(data.costPerUnit) : null
    if (data.totalCost !== undefined) updateData.totalCost = data.totalCost ? parseFloat(data.totalCost) : null
    if (data.protein !== undefined) updateData.protein = data.protein ? parseFloat(data.protein) : null
    if (data.fat !== undefined) updateData.fat = data.fat ? parseFloat(data.fat) : null
    if (data.fiber !== undefined) updateData.fiber = data.fiber ? parseFloat(data.fiber) : null
    if (data.calcium !== undefined) updateData.calcium = data.calcium ? parseFloat(data.calcium) : null
    if (data.phosphorus !== undefined) updateData.phosphorus = data.phosphorus ? parseFloat(data.phosphorus) : null
    if (data.notes !== undefined) updateData.notes = data.notes || null

    const feedRecord = await prisma.feedRecord.update({
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

    return NextResponse.json(feedRecord)
  } catch (error) {
    console.error('Error updating feed record:', error)
    return NextResponse.json(
      { error: 'Failed to update feed record' },
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

    // Verify feed record ownership
    const feedRecord = await prisma.feedRecord.findFirst({
      where: {
        id: params.id,
        animal: { userId: user.id }
      }
    })

    if (!feedRecord) {
      return NextResponse.json({ error: 'Feed record not found' }, { status: 404 })
    }

    await prisma.feedRecord.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Feed record deleted successfully' })
  } catch (error) {
    console.error('Error deleting feed record:', error)
    return NextResponse.json(
      { error: 'Failed to delete feed record' },
      { status: 500 }
    )
  }
}