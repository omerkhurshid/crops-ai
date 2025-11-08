import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../lib/auth/server';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';
import { TransactionType, FinancialCategory, Prisma } from '@prisma/client';
import { AuditLogger } from '../../../../lib/audit-logger';
// Validation schema for transaction input
const transactionSchema = z.object({
  farmId: z.string().cuid(),
  fieldId: z.string().cuid().optional(),
  cropId: z.string().cuid().optional(),
  type: z.nativeEnum(TransactionType),
  category: z.nativeEnum(FinancialCategory),
  subcategory: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  transactionDate: z.string().datetime(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.any().optional(),
});
const querySchema = z.object({
  farmId: z.string().cuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  category: z.nativeEnum(FinancialCategory).optional(),
  fieldId: z.string().cuid().optional(),
  cropId: z.string().cuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});
// GET /api/financial/transactions
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const query = querySchema.parse(params);
    // Verify user has access to the farm
    const farm = await prisma.farm.findFirst({
      where: {
        id: query.farmId,
        ownerId: user.id,
      },
    });
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found or access denied' }, { status: 404 });
    }
    // Build where clause
    const where: Prisma.FinancialTransactionWhereInput = {
      farmId: query.farmId,
      ...(query.type && { type: query.type }),
      ...(query.category && { category: query.category }),
      ...(query.fieldId && { fieldId: query.fieldId }),
      ...(query.cropId && { cropId: query.cropId }),
      ...(query.startDate && { transactionDate: { gte: new Date(query.startDate) } }),
      ...(query.endDate && { transactionDate: { lte: new Date(query.endDate) } }),
    };
    // Fetch transactions with relations and graceful handling
    let transactions: any[] = [];
    let total = 0;
    let summary: any = { _sum: { amount: null }, _count: 0 };
    let incomeSum: any = { _sum: { amount: null } };
    let expenseSum: any = { _sum: { amount: null } };
    try {
      [transactions, total, summary, incomeSum, expenseSum] = await Promise.all([
        prisma.financialTransaction.findMany({
          where,
          include: {
            field: true,
            crop: true,
            marketPrice: true,
          },
          orderBy: { transactionDate: 'desc' },
          take: query.limit,
          skip: query.offset,
        }),
        prisma.financialTransaction.count({ where }),
        prisma.financialTransaction.aggregate({
          where,
          _sum: { amount: true },
          _count: true,
        }),
        prisma.financialTransaction.aggregate({
          where: { ...where, type: TransactionType.INCOME },
          _sum: { amount: true },
        }),
        prisma.financialTransaction.aggregate({
          where: { ...where, type: TransactionType.EXPENSE },
          _sum: { amount: true },
        }),
      ]);
    } catch (error: any) {
      // If financial_transactions table doesn't exist, return empty data
      if (error.code === 'P2021' || error.code === 'P2010') {
        // Financial transactions table does not exist - returning empty transaction data
        transactions = [];
        total = 0;
        summary = { _sum: { amount: null }, _count: 0 };
        incomeSum = { _sum: { amount: null } };
        expenseSum = { _sum: { amount: null } };
      } else {
        throw error;
      }
    }
    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
      },
      summary: {
        totalIncome: Number(incomeSum._sum.amount || 0),
        totalExpenses: Number(expenseSum._sum.amount || 0),
        netProfit: Number(incomeSum._sum.amount || 0) - Number(expenseSum._sum.amount || 0),
        count: summary._count,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
// POST /api/financial/transactions
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const validatedData = transactionSchema.parse(body);
    // Verify user has access to the farm
    const farm = await prisma.farm.findFirst({
      where: {
        id: validatedData.farmId,
        ownerId: user.id,
      },
    });
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found or access denied' }, { status: 404 });
    }
    // Create transaction with graceful handling
    let transaction: any;
    try {
      // Prepare the data with proper field handling
      const transactionData = {
        userId: user.id,
        farmId: validatedData.farmId,
        fieldId: validatedData.fieldId || null,
        cropId: validatedData.cropId || null,
        type: validatedData.type,
        category: validatedData.category,
        subcategory: validatedData.subcategory || null,
        amount: new Prisma.Decimal(validatedData.amount),
        currency: validatedData.currency || 'USD',
        quantity: validatedData.quantity ? new Prisma.Decimal(validatedData.quantity) : null,
        unitPrice: validatedData.unitPrice ? new Prisma.Decimal(validatedData.unitPrice) : null,
        transactionDate: new Date(validatedData.transactionDate),
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : null,
        notes: validatedData.notes || null,
        tags: validatedData.tags || [],
        attachments: validatedData.attachments || null,
        createdById: user.id,
      };
      // Creating financial transaction with validated data
      transaction = await prisma.financialTransaction.create({
        data: transactionData,
        include: {
          field: true,
          crop: true,
          marketPrice: true,
        },
      });
    } catch (error: any) {
      console.error('Transaction creation error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      // If financial_transactions table doesn't exist, return error message
      if (error.code === 'P2021' || error.code === 'P2010') {
        return NextResponse.json({ 
          error: 'Financial transactions feature is not yet available. Please contact support to enable this feature.',
          code: 'FEATURE_NOT_AVAILABLE'
        }, { status: 503 });
      } else {
        // Return the actual error for debugging
        return NextResponse.json({ 
          error: 'Failed to create transaction',
          details: error.message,
          code: error.code
        }, { status: 400 });
      }
    }
    // Update budget actuals if applicable
    try {
      const budgetDate = new Date(transaction.transactionDate);
      await prisma.financialBudget.updateMany({
        where: {
          farmId: transaction.farmId,
          category: transaction.category,
          year: budgetDate.getFullYear(),
          month: budgetDate.getMonth() + 1,
        },
        data: {
          actualAmount: {
            increment: transaction.type === TransactionType.EXPENSE 
              ? transaction.amount 
              : new Prisma.Decimal(0),
          },
        },
      });
    } catch (budgetError: any) {
      // If financial_budget table doesn't exist, just log and continue
      if (budgetError.code === 'P2021' || budgetError.code === 'P2010') {
        // Financial budget table does not exist - skipping budget update
      } else {
      }
    }
    // Log the action
    try {
      await AuditLogger.logFinancialTransaction(
        'create',
        user.id,
        transaction.id,
        {
          farmId: transaction.farmId,
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount.toString(),
        },
        request
      );
    } catch (auditError) {
      // Log audit errors but don't fail the request
    }
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}