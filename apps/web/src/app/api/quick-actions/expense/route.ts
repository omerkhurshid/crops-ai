import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'
import { FinancialCategory } from '@prisma/client'

const expenseSchema = z.object({
  farmId: z.string(),
  amount: z.number().positive(),
  category: z.enum(['seeds', 'fertilizer', 'fuel', 'equipment', 'labor', 'maintenance', 'other']),
  description: z.string().optional(),
  date: z.string().optional()
})

// Map frontend categories to database enum values
const categoryMapping: Record<string, FinancialCategory> = {
  seeds: FinancialCategory.SEEDS,
  fertilizer: FinancialCategory.FERTILIZER,
  fuel: FinancialCategory.FUEL,
  equipment: FinancialCategory.MACHINERY,
  labor: FinancialCategory.LABOR,
  maintenance: FinancialCategory.OTHER_EXPENSE,
  other: FinancialCategory.OTHER_EXPENSE
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = expenseSchema.parse(body)

    const farm = await prisma.farm.findFirst({
      where: {
        id: validatedData.farmId,
        ownerId: user.id
      }
    })

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    const transaction = await prisma.financialTransaction.create({
      data: {
        type: 'EXPENSE',
        amount: validatedData.amount,
        category: categoryMapping[validatedData.category],
        notes: validatedData.description,
        createdById: user.id,
        transactionDate: validatedData.date ? new Date(validatedData.date) : new Date(),
        userId: user.id,
        farmId: validatedData.farmId
      }
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.notes,
        date: transaction.transactionDate
      }
    })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
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

    const expenses = await prisma.financialTransaction.findMany({
      where: {
        userId: user.id,
        type: 'EXPENSE'
      },
      include: {
        farm: {
          select: { id: true, name: true }
        }
      },
      orderBy: { transactionDate: 'desc' },
      take: 10
    })

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}