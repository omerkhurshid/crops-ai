import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../lib/auth/session'
import { prisma } from '../../../lib/prisma'
import { rateLimitWithFallback } from '../../../lib/rate-limit'

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
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const reportType = searchParams.get('type') || 'overview'

    if (!farmId) {
      return NextResponse.json({ error: 'farmId is required' }, { status: 400 })
    }

    // Verify user owns the farm
    const farm = await prisma.farm.findFirst({
      where: { 
        id: farmId,
        ownerId: user.id
      }
    })

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found or access denied' }, { status: 404 })
    }

    // Generate report data based on type
    let reportData: any = {}

    try {
      switch (reportType) {
        case 'overview':
          // Farm overview report
          const [fields, crops, transactions, tasks] = await Promise.all([
            prisma.field.findMany({
              where: { farmId },
              select: { id: true, name: true, area: true, cropType: true }
            }),
            prisma.crop.findMany({
              where: { 
                field: { farmId } 
              },
              select: { cropType: true, status: true, yield: true }
            }).catch(() => []),
            prisma.financialTransaction.findMany({
              where: { farmId },
              orderBy: { transactionDate: 'desc' },
              take: 10
            }).catch(() => []),
            prisma.task.findMany({
              where: { farmId },
              orderBy: { createdAt: 'desc' },
              take: 5
            }).catch(() => [])
          ])

          reportData = {
            farm: {
              id: farm.id,
              name: farm.name,
              totalArea: farm.totalArea,
              fieldsCount: fields.length
            },
            fields,
            crops: {
              total: crops.length,
              byType: crops.reduce((acc: any, crop: any) => {
                acc[crop.cropType] = (acc[crop.cropType] || 0) + 1
                return acc
              }, {}),
              byStatus: crops.reduce((acc: any, crop: any) => {
                acc[crop.status] = (acc[crop.status] || 0) + 1
                return acc
              }, {})
            },
            recentTransactions: transactions.slice(0, 5),
            recentTasks: tasks
          }
          break

        case 'financial':
          // Financial report
          const financialData = await prisma.financialTransaction.findMany({
            where: { farmId },
            orderBy: { transactionDate: 'desc' }
          }).catch(() => [])

          const income = financialData
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + Number(t.amount), 0)
          
          const expenses = financialData
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0)

          reportData = {
            summary: {
              totalIncome: income,
              totalExpenses: expenses,
              netProfit: income - expenses,
              transactionCount: financialData.length
            },
            transactions: financialData.slice(0, 20),
            monthlyBreakdown: financialData.reduce((acc: any, transaction: any) => {
              const month = transaction.transactionDate.toISOString().slice(0, 7)
              if (!acc[month]) acc[month] = { income: 0, expenses: 0 }
              
              if (transaction.type === 'INCOME') {
                acc[month].income += Number(transaction.amount)
              } else {
                acc[month].expenses += Number(transaction.amount)
              }
              return acc
            }, {})
          }
          break

        case 'crop-health':
          // Crop health report
          const fieldsWithHealth = await prisma.field.findMany({
            where: { farmId },
            include: {
              satelliteData: {
                orderBy: { captureDate: 'desc' },
                take: 1
              },
              crops: {
                where: {
                  status: { in: ['PLANTED', 'GROWING'] }
                }
              }
            }
          }).catch(() => [])

          reportData = {
            fieldsHealth: fieldsWithHealth.map(field => ({
              id: field.id,
              name: field.name,
              area: field.area,
              cropType: field.cropType,
              lastNdvi: field.satelliteData[0]?.ndvi || null,
              stressLevel: field.satelliteData[0]?.stressLevel || 'NONE',
              activeCrops: field.crops.length
            })),
            overallHealth: {
              totalFields: fieldsWithHealth.length,
              healthyFields: fieldsWithHealth.filter(f => 
                f.satelliteData[0]?.stressLevel === 'NONE' || 
                f.satelliteData[0]?.stressLevel === 'LOW'
              ).length,
              avgNdvi: fieldsWithHealth.reduce((sum, f) => 
                sum + (f.satelliteData[0]?.ndvi || 0), 0
              ) / fieldsWithHealth.length || 0
            }
          }
          break

        default:
          return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
      }
    } catch (dbError: any) {

      // Return empty report data if database queries fail
      reportData = {
        message: 'Report data unavailable - some database tables may not exist yet',
        farmId,
        reportType,
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json({
      reportType,
      farmId,
      data: reportData,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}