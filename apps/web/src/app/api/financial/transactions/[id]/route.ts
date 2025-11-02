import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../../lib/auth/server';
import { prisma } from '../../../../../lib/prisma';
import { z } from 'zod';
import { TransactionType, FinancialCategory, Prisma } from '@prisma/client';
import { AuditLogger } from '../../../../../lib/audit-logger';

// Validation schema for transaction update
const updateTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  category: z.nativeEnum(FinancialCategory).optional(),
  subcategory: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  transactionDate: z.string().datetime().optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.any().optional(),
});

// GET /api/financial/transactions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await prisma.financialTransaction.findUnique({
      where: { id: params.id },
      include: {
        field: true,
        crop: true,
        marketPrice: true,
        farm: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Verify user has access to the farm
    const hasAccess = transaction.farm.ownerId === user.id ||
      await prisma.farmManager.findFirst({
        where: {
          farmId: transaction.farmId,
          userId: user.id,
        },
      });

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

// PUT /api/financial/transactions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTransactionSchema.parse(body);

    // Fetch existing transaction
    const existingTransaction = await prisma.financialTransaction.findUnique({
      where: { id: params.id },
      include: { farm: true },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Verify user has access to the farm
    const hasAccess = existingTransaction.farm.ownerId === user.id ||
      await prisma.farmManager.findFirst({
        where: {
          farmId: existingTransaction.farmId,
          userId: user.id,
        },
      });

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update transaction
    const updatedTransaction = await prisma.financialTransaction.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        amount: validatedData.amount ? new Prisma.Decimal(validatedData.amount) : undefined,
        quantity: validatedData.quantity ? new Prisma.Decimal(validatedData.quantity) : undefined,
        unitPrice: validatedData.unitPrice ? new Prisma.Decimal(validatedData.unitPrice) : undefined,
        transactionDate: validatedData.transactionDate ? new Date(validatedData.transactionDate) : undefined,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : undefined,
      },
      include: {
        field: true,
        crop: true,
        marketPrice: true,
      },
    });

    // Log the action
    await AuditLogger.logFinancialTransaction(
      'update',
      user.id,
      updatedTransaction.id,
      {
        farmId: updatedTransaction.farmId,
        changes: validatedData,
      },
      request
    );

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

// DELETE /api/financial/transactions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch existing transaction
    const existingTransaction = await prisma.financialTransaction.findUnique({
      where: { id: params.id },
      include: { farm: true },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Verify user has access to the farm
    const hasAccess = existingTransaction.farm.ownerId === user.id ||
      await prisma.farmManager.findFirst({
        where: {
          farmId: existingTransaction.farmId,
          userId: user.id,
        },
      });

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete transaction
    await prisma.financialTransaction.delete({
      where: { id: params.id },
    });

    // Update budget actuals if applicable
    const budgetDate = new Date(existingTransaction.transactionDate);
    await prisma.financialBudget.updateMany({
      where: {
        farmId: existingTransaction.farmId,
        category: existingTransaction.category,
        year: budgetDate.getFullYear(),
        month: budgetDate.getMonth() + 1,
      },
      data: {
        actualAmount: {
          decrement: existingTransaction.type === TransactionType.EXPENSE 
            ? existingTransaction.amount 
            : new Prisma.Decimal(0),
        },
      },
    });

    // Log the action
    await AuditLogger.logFinancialTransaction(
      'delete',
      user.id,
      params.id,
      {
        farmId: existingTransaction.farmId,
        type: existingTransaction.type,
        category: existingTransaction.category,
        amount: existingTransaction.amount.toString(),
      },
      request
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}