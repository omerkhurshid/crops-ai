import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth/session';
import { prisma } from '../../../../lib/prisma';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';
import { TransactionType } from '@prisma/client';

// GET /api/financial/user-summary - Get user-level financial summary across all farms
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ValidationError('User authentication required');
      }

      const { searchParams } = new URL(request.url);
      const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = searchParams.get('endDate') || new Date().toISOString();

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Get all user's farms
      const userFarms = await prisma.farm.findMany({
        where: { ownerId: user.id },
        select: {
          id: true,
          name: true,
          totalArea: true,
          address: true,
          location: true,
        }
      });

      if (userFarms.length === 0) {
        return createSuccessResponse({
          summary: {
            totalIncome: 0,
            totalExpenses: 0,
            netProfit: 0,
            profitMargin: 0,
            totalFarms: 0,
            totalArea: 0,
            profitPerArea: 0,
            transactionCount: 0,
            profitChange: 0
          },
          farmBreakdown: [],
          monthlyTrends: [],
          categoryBreakdown: { income: [], expenses: [] }
        });
      }

      const farmIds = userFarms.map(farm => farm.id);

      // Base where clause for transactions
      const baseWhere = {
        farmId: { in: farmIds },
        transactionDate: {
          gte: start,
          lte: end,
        },
      };

      // Aggregate financial data across all farms
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
        // Handle missing financial transactions table
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
      const profitMargin = income > 0 ? (netProfit / income) * 100 : 0;
      const totalArea = userFarms.reduce((sum, farm) => sum + farm.totalArea, 0);
      const profitPerArea = totalArea > 0 ? netProfit / totalArea : 0;

      // Farm-level breakdown
      let farmBreakdown: any[] = [];
      
      try {
        farmBreakdown = await Promise.all(
          userFarms.map(async (farm) => {
            const [farmIncome, farmExpenses, farmTransactionCount] = await Promise.all([
              prisma.financialTransaction.aggregate({
                where: { 
                  farmId: farm.id,
                  type: TransactionType.INCOME,
                  transactionDate: { gte: start, lte: end }
                },
                _sum: { amount: true },
              }),
              prisma.financialTransaction.aggregate({
                where: { 
                  farmId: farm.id,
                  type: TransactionType.EXPENSE,
                  transactionDate: { gte: start, lte: end }
                },
                _sum: { amount: true },
              }),
              prisma.financialTransaction.count({
                where: { 
                  farmId: farm.id,
                  transactionDate: { gte: start, lte: end }
                }
              })
            ]);

            const farmIncomeAmount = Number(farmIncome._sum.amount || 0);
            const farmExpenseAmount = Number(farmExpenses._sum.amount || 0);
            const farmNetProfit = farmIncomeAmount - farmExpenseAmount;

            return {
              id: farm.id,
              name: farm.name,
              totalArea: farm.totalArea,
              address: farm.address,
              location: farm.location,
              income: farmIncomeAmount,
              expenses: farmExpenseAmount,
              netProfit: farmNetProfit,
              profitMargin: farmIncomeAmount > 0 ? (farmNetProfit / farmIncomeAmount) * 100 : 0,
              profitPerArea: farm.totalArea > 0 ? farmNetProfit / farm.totalArea : 0,
              transactionCount: farmTransactionCount
            };
          })
        );
      } catch (error: any) {
        if (error.code === 'P2021' || error.code === 'P2010') {
          farmBreakdown = userFarms.map(farm => ({
            id: farm.id,
            name: farm.name,
            totalArea: farm.totalArea,
            address: farm.address,
            location: farm.location,
            income: 0,
            expenses: 0,
            netProfit: 0,
            profitMargin: 0,
            profitPerArea: 0,
            transactionCount: 0
          }));
        } else {
          throw error;
        }
      }

      // Monthly trends across all farms
      let monthlyTrends: any[] = [];
      let categoryBreakdown: {
        income: Array<{ category: string; amount: number; count: number }>;
        expenses: Array<{ category: string; amount: number; count: number }>;
      } = { income: [], expenses: [] };

      try {
        const transactions = await prisma.financialTransaction.findMany({
          where: baseWhere,
          orderBy: { transactionDate: 'asc' },
          select: {
            transactionDate: true,
            type: true,
            amount: true,
            category: true
          }
        });

        // Process monthly trends
        const monthlyData = transactions.reduce((acc, transaction) => {
          const monthKey = `${transaction.transactionDate.getFullYear()}-${String(transaction.transactionDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (!acc[monthKey]) {
            acc[monthKey] = { month: monthKey, income: 0, expenses: 0, profit: 0 };
          }
          
          if (transaction.type === TransactionType.INCOME) {
            acc[monthKey].income += Number(transaction.amount);
          } else {
            acc[monthKey].expenses += Number(transaction.amount);
          }
          
          acc[monthKey].profit = acc[monthKey].income - acc[monthKey].expenses;
          
          return acc;
        }, {} as Record<string, { month: string; income: number; expenses: number; profit: number }>);

        monthlyTrends = Object.values(monthlyData);

        // Process category breakdown
        const incomeByCategory = await prisma.financialTransaction.groupBy({
          by: ['category'],
          where: { ...baseWhere, type: TransactionType.INCOME },
          _sum: { amount: true },
          _count: true,
        });

        const expensesByCategory = await prisma.financialTransaction.groupBy({
          by: ['category'],
          where: { ...baseWhere, type: TransactionType.EXPENSE },
          _sum: { amount: true },
          _count: true,
        });

        categoryBreakdown = {
          income: incomeByCategory.map(item => ({
            category: item.category,
            amount: Number(item._sum.amount || 0),
            count: item._count,
          })),
          expenses: expensesByCategory.map(item => ({
            category: item.category,
            amount: Number(item._sum.amount || 0),
            count: item._count,
          }))
        };
      } catch (error: any) {
        if (error.code === 'P2021' || error.code === 'P2010') {
          monthlyTrends = [];
          categoryBreakdown = { income: [], expenses: [] };
        } else {
          throw error;
        }
      }

      // Calculate profit change compared to previous period
      const periodLength = end.getTime() - start.getTime();
      const previousStart = new Date(start.getTime() - periodLength);
      const previousEnd = new Date(start.getTime() - 1);

      let profitChange = 0;
      try {
        const [previousIncome, previousExpenses] = await Promise.all([
          prisma.financialTransaction.aggregate({
            where: {
              farmId: { in: farmIds },
              type: TransactionType.INCOME,
              transactionDate: { gte: previousStart, lte: previousEnd },
            },
            _sum: { amount: true },
          }),
          prisma.financialTransaction.aggregate({
            where: {
              farmId: { in: farmIds },
              type: TransactionType.EXPENSE,
              transactionDate: { gte: previousStart, lte: previousEnd },
            },
            _sum: { amount: true },
          })
        ]);

        const previousNetProfit = Number(previousIncome._sum.amount || 0) - Number(previousExpenses._sum.amount || 0);
        
        if (previousNetProfit !== 0) {
          profitChange = ((netProfit - previousNetProfit) / Math.abs(previousNetProfit)) * 100;
        }
      } catch (error: any) {
        if (error.code !== 'P2021' && error.code !== 'P2010') {
          throw error;
        }
      }

      return createSuccessResponse({
        summary: {
          totalIncome: income,
          totalExpenses: expenses,
          netProfit,
          profitMargin,
          totalFarms: userFarms.length,
          totalArea,
          profitPerArea,
          transactionCount,
          profitChange
        },
        farmBreakdown: farmBreakdown.sort((a, b) => b.netProfit - a.netProfit),
        monthlyTrends,
        categoryBreakdown,
        period: {
          start,
          end
        }
      });

    } catch (error) {
      return handleApiError(error);
    }
  })
);