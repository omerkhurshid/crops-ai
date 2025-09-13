import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';
import { TransactionType, FinancialCategory } from '@prisma/client';
import { rateLimitWithFallback } from '../../../../lib/rate-limit';

const summaryQuerySchema = z.object({
  farmId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(['month', 'category', 'field', 'crop']).optional(),
});

// GET /api/financial/summary
export async function GET(request: NextRequest) {
  // Apply rate limiting for API endpoints
  const { success, headers } = await rateLimitWithFallback(request, 'api')
  
  if (!success) {
    return new Response('Too Many Requests. Please try again later.', {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': headers['X-RateLimit-Reset'],
        'Content-Type': 'text/plain',
      },
    })
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const query = summaryQuerySchema.parse(params);

    // Verify user has access to the farm
    const farm = await prisma.farm.findFirst({
      where: {
        id: query.farmId,
        ownerId: session.user.id,
      },
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found or access denied' }, { status: 404 });
    }

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    // Base where clause
    const baseWhere = {
      farmId: query.farmId,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Fetch overall summary with graceful handling for missing tables
    let totalIncome: { _sum: { amount: any } } = { _sum: { amount: null } };
    let totalExpenses: { _sum: { amount: any } } = { _sum: { amount: null } };
    let transactionCount = 0;

    try {
      [totalIncome, totalExpenses, transactionCount] = await Promise.all([
        prisma.financialTransaction.aggregate({
          where: { ...baseWhere, type: TransactionType.INCOME },
          _sum: { amount: true },
        }),
        prisma.financialTransaction.aggregate({
          where: { ...baseWhere, type: TransactionType.EXPENSE },
          _sum: { amount: true },
        }),
        prisma.financialTransaction.count({ where: baseWhere }),
      ]);
    } catch (error: any) {
      // If financial_transactions table doesn't exist, return empty data
      if (error.code === 'P2021' || error.code === 'P2010') {
        console.log('Financial transactions table does not exist, returning empty financial data');
        totalIncome = { _sum: { amount: null } };
        totalExpenses = { _sum: { amount: null } };
        transactionCount = 0;
      } else {
        throw error;
      }
    }

    const income = Number(totalIncome._sum.amount || 0);
    const expenses = Number(totalExpenses._sum.amount || 0);
    const netProfit = income - expenses;
    const grossProfit = income - expenses; // Simplified for now
    const profitMargin = income > 0 ? (netProfit / income) * 100 : 0;
    const profitPerAcre = netProfit / (farm.totalArea * 2.47105); // Convert hectares to acres

    // Income by category with graceful handling
    let incomeByCategory: any[] = [];
    let expensesByCategory: any[] = [];
    let transactions: any[] = [];

    try {
      [incomeByCategory, expensesByCategory, transactions] = await Promise.all([
        prisma.financialTransaction.groupBy({
          by: ['category'],
          where: { ...baseWhere, type: TransactionType.INCOME },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.financialTransaction.groupBy({
          by: ['category'],
          where: { ...baseWhere, type: TransactionType.EXPENSE },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.financialTransaction.findMany({
          where: baseWhere,
          orderBy: { transactionDate: 'asc' },
        }),
      ]);
    } catch (error: any) {
      // If financial_transactions table doesn't exist, return empty arrays
      if (error.code === 'P2021' || error.code === 'P2010') {
        console.log('Financial transactions table does not exist, using empty data for categories and trends');
        incomeByCategory = [];
        expensesByCategory = [];
        transactions = [];
      } else {
        throw error;
      }
    }

    const monthlyTrends = transactions.reduce((acc, transaction) => {
      const monthKey = `${transaction.transactionDate.getFullYear()}-${String(transaction.transactionDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      
      if (transaction.type === TransactionType.INCOME) {
        acc[monthKey].income += Number(transaction.amount);
      } else {
        acc[monthKey].expenses += Number(transaction.amount);
      }
      
      return acc;
    }, {} as Record<string, { month: string; income: number; expenses: number }>);

    // Field profitability with graceful handling
    let fieldProfitability: any[] = [];

    try {
      fieldProfitability = await prisma.$queryRaw`
        SELECT 
          f.id,
          f.name,
          f.area,
          COALESCE(SUM(CASE WHEN ft.type = 'INCOME' THEN ft.amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN ft.type = 'EXPENSE' THEN ft.amount ELSE 0 END), 0) as expenses,
          COALESCE(SUM(CASE WHEN ft.type = 'INCOME' THEN ft.amount ELSE -ft.amount END), 0) as profit
        FROM fields f
        LEFT JOIN financial_transactions ft ON f.id = ft."fieldId"
          AND ft."farmId" = ${query.farmId}
          AND ft."transactionDate" >= ${startDate}
          AND ft."transactionDate" <= ${endDate}
        WHERE f."farmId" = ${query.farmId}
        GROUP BY f.id, f.name, f.area
      `;
    } catch (error: any) {
      // If financial_transactions table doesn't exist (P2021 or P2010), try fields only
      if (error.code === 'P2021' || error.code === 'P2010') {
        console.log('Financial transactions table does not exist, fetching fields without financial data');
        try {
          fieldProfitability = await prisma.$queryRaw`
            SELECT 
              f.id,
              f.name,
              f.area,
              0 as income,
              0 as expenses,
              0 as profit
            FROM fields f
            WHERE f."farmId" = ${query.farmId}
            GROUP BY f.id, f.name, f.area
          `;
        } catch (fieldsError: any) {
          // If fields table doesn't exist either, return empty array
          if (fieldsError.code === 'P2021' || fieldsError.code === 'P2010') {
            console.log('Fields table does not exist either, using empty field profitability');
            fieldProfitability = [];
          } else {
            throw fieldsError;
          }
        }
      } else {
        throw error;
      }
    }

    // Compare with previous period
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate.getTime() - 1);

    // Previous period comparison with graceful handling
    let previousIncome = 0;
    let profitChange = 0;

    try {
      const previousPeriodIncome = await prisma.financialTransaction.aggregate({
        where: {
          farmId: query.farmId,
          type: TransactionType.INCOME,
          transactionDate: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
        _sum: { amount: true },
      });

      previousIncome = Number(previousPeriodIncome._sum.amount || 0);
      profitChange = previousIncome > 0 
        ? ((income - previousIncome) / previousIncome) * 100 
        : 0;
    } catch (error: any) {
      // If financial_transactions table doesn't exist, use zero values
      if (error.code === 'P2021' || error.code === 'P2010') {
        console.log('Financial transactions table does not exist, using zero for previous period comparison');
        previousIncome = 0;
        profitChange = 0;
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netProfit,
        grossProfit,
        profitMargin,
        profitPerAcre,
        profitChange,
        transactionCount,
      },
      breakdown: {
        incomeByCategory: incomeByCategory.map(item => ({
          category: item.category,
          amount: Number(item._sum.amount || 0),
          count: item._count,
        })),
        expensesByCategory: expensesByCategory.map(item => ({
          category: item.category,
          amount: Number(item._sum.amount || 0),
          count: item._count,
        })),
      },
      monthlyTrends: Object.values(monthlyTrends),
      fieldProfitability,
      period: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error) {
    console.error('Error generating financial summary:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to generate financial summary' }, { status: 500 });
  }
}