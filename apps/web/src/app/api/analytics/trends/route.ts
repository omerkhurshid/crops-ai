import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { prisma } from '../../../../lib/prisma'
import { TrendingAnalytics, AnalyticsTimeRange } from '../../../../lib/analytics/trending-analytics'
import { z } from 'zod'
const trendsQuerySchema = z.object({
  farmId: z.string(),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('daily'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.coerce.number().min(1).max(365).default(30)
})
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const { farmId, period, startDate, endDate, days } = trendsQuerySchema.parse(params)
    // Verify farm ownership
    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        ownerId: user.id
      }
    })
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }
    // Calculate date range
    const endDateTime = endDate ? new Date(endDate) : new Date()
    const startDateTime = startDate ? new Date(startDate) : new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const timeRange: AnalyticsTimeRange = {
      period,
      startDate: startDateTime,
      endDate: endDateTime
    }
    // Get trending data
    const trends = await TrendingAnalytics.getFarmTrends(farmId, timeRange)
    const summary = await TrendingAnalytics.getAnalyticsSummary(farmId)
    return NextResponse.json({
      success: true,
      data: {
        trends,
        summary,
        timeRange: {
          period,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          days
        }
      }
    })
  } catch (error) {
    console.error('Error fetching analytics trends:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid parameters', 
        details: error.errors 
      }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Failed to fetch analytics trends' 
    }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { farmId, period, startDate, endDate, metrics } = body
    // Verify farm ownership
    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        ownerId: user.id
      }
    })
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }
    const timeRange: AnalyticsTimeRange = {
      period: period || 'daily',
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    }
    // Get specific metrics if requested
    let result
    if (metrics && Array.isArray(metrics)) {
      const allTrends = await TrendingAnalytics.getFarmTrends(farmId, timeRange)
      result = {}
      metrics.forEach(metric => {
        if (metric in allTrends) {
          result[metric] = allTrends[metric as keyof typeof allTrends]
        }
      })
    } else {
      result = await TrendingAnalytics.getFarmTrends(farmId, timeRange)
    }
    return NextResponse.json({
      success: true,
      data: result,
      timeRange
    })
  } catch (error) {
    console.error('Error processing analytics request:', error)
    return NextResponse.json({ 
      error: 'Failed to process analytics request' 
    }, { status: 500 })
  }
}