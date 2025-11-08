import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'
const harvestSchema = z.object({
  farmId: z.string(),
  fieldName: z.string(),
  cropType: z.enum(['wheat', 'corn', 'soybeans', 'barley', 'oats', 'other']),
  quantity: z.number().positive(),
  unit: z.string().default('tons'),
  qualityNotes: z.string().optional(),
  date: z.string().optional()
})
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const validatedData = harvestSchema.parse(body)
    const farm = await prisma.farm.findFirst({
      where: {
        id: validatedData.farmId,
        ownerId: user.id
      }
    })
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }
    const harvestRecord = await prisma.harvestRecord.create({
      data: {
        farmId: validatedData.farmId,
        fieldName: validatedData.fieldName,
        cropType: validatedData.cropType.toUpperCase(),
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        qualityNotes: validatedData.qualityNotes,
        harvestDate: validatedData.date ? new Date(validatedData.date) : new Date(),
        userId: user.id
      }
    })
    const priceMap: Record<string, number> = {
      WHEAT: 280,
      CORN: 220,
      SOYBEANS: 450,
      BARLEY: 250,
      OATS: 200,
      OTHER: 300
    }
    const estimatedPricePerTon = priceMap[validatedData.cropType.toUpperCase()] || 300
    const estimatedRevenue = validatedData.quantity * estimatedPricePerTon
    await prisma.financialTransaction.create({
      data: {
        type: 'INCOME',
        amount: estimatedRevenue,
        category: 'HARVEST' as any,
        notes: `Harvest: ${validatedData.quantity}${validatedData.unit} of ${validatedData.cropType} from ${validatedData.fieldName}`,
        createdById: user.id,
        transactionDate: validatedData.date ? new Date(validatedData.date) : new Date(),
        userId: user.id,
        farmId: validatedData.farmId
      }
    })
    return NextResponse.json({
      success: true,
      harvest: {
        id: harvestRecord.id,
        quantity: harvestRecord.quantity,
        cropType: harvestRecord.cropType,
        fieldName: harvestRecord.fieldName,
        estimatedRevenue,
        date: harvestRecord.harvestDate
      }
    })
  } catch (error) {
    console.error('Error creating harvest record:', error)
    return NextResponse.json(
      { error: 'Failed to create harvest record' },
      { status: 500 }
    )
  }
}
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const harvests = await prisma.harvestRecord.findMany({
      where: {
        userId: user.id
      },
      include: {
        farm: {
          select: { id: true, name: true }
        }
      },
      orderBy: { harvestDate: 'desc' },
      take: 10
    })
    return NextResponse.json({ harvests })
  } catch (error) {
    console.error('Error fetching harvest records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch harvest records' },
      { status: 500 }
    )
  }
}