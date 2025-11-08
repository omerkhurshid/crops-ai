/**
 * Trending Analytics System
 * Real-time analytics and trending calculations for farm data
 */
import { prisma } from '../prisma'
export interface TrendData {
  period: string
  value: number
  change: number
  changePercentage: number
}
export interface TrendingMetrics {
  crop_yield: TrendData[]
  revenue: TrendData[]
  expenses: TrendData[]
  efficiency: TrendData[]
  ndvi: TrendData[]
  weather_patterns: TrendData[]
}
export interface AnalyticsTimeRange {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: Date
  endDate: Date
}
export class TrendingAnalytics {
  /**
   * Get comprehensive trending metrics for a farm
   */
  static async getFarmTrends(
    farmId: string, 
    timeRange: AnalyticsTimeRange
  ): Promise<TrendingMetrics> {
    const [
      yieldTrends,
      revenueTrends,
      expenseTrends,
      efficiencyTrends,
      ndviTrends,
      weatherTrends
    ] = await Promise.all([
      this.getCropYieldTrends(farmId, timeRange),
      this.getRevenueTrends(farmId, timeRange),
      this.getExpenseTrends(farmId, timeRange),
      this.getEfficiencyTrends(farmId, timeRange),
      this.getNDVITrends(farmId, timeRange),
      this.getWeatherPatternTrends(farmId, timeRange)
    ])
    return {
      crop_yield: yieldTrends,
      revenue: revenueTrends,
      expenses: expenseTrends,
      efficiency: efficiencyTrends,
      ndvi: ndviTrends,
      weather_patterns: weatherTrends
    }
  }
  /**
   * Calculate crop yield trends over time
   */
  private static async getCropYieldTrends(
    farmId: string, 
    timeRange: AnalyticsTimeRange
  ): Promise<TrendData[]> {
    try {
      const dateFormat = this.getDateFormat(timeRange.period)
      const yieldData = await prisma.crop.groupBy({
        by: ['actualHarvestDate'],
        where: {
          field: {
            farmId
          },
          actualHarvestDate: {
            gte: timeRange.startDate,
            lte: timeRange.endDate
          },
          status: 'HARVESTED'
        },
        _avg: {
          yield: true
        }
      })
      return this.calculateTrendData(
        yieldData
          .filter(item => item.actualHarvestDate !== null)
          .map(item => ({
            period: this.formatPeriod(item.actualHarvestDate!, timeRange.period),
            value: Number(item._avg.yield || 0)
          }))
      )
    } catch (error) {
      console.error('Error calculating yield trends:', error)
      return []
    }
  }
  /**
   * Calculate revenue trends from financial transactions
   */
  private static async getRevenueTrends(
    farmId: string, 
    timeRange: AnalyticsTimeRange
  ): Promise<TrendData[]> {
    try {
      const revenueData = await prisma.financialTransaction.groupBy({
        by: ['transactionDate'],
        where: {
          farmId,
          type: 'INCOME',
          transactionDate: {
            gte: timeRange.startDate,
            lte: timeRange.endDate
          }
        },
        _sum: {
          amount: true
        }
      })
      const aggregatedData = this.aggregateByPeriod(
        revenueData.map(item => ({
          date: item.transactionDate,
          value: Number(item._sum.amount || 0)
        })),
        timeRange.period
      )
      return this.calculateTrendData(aggregatedData)
    } catch (error) {
      console.error('Error calculating revenue trends:', error)
      return []
    }
  }
  /**
   * Calculate expense trends from financial transactions
   */
  private static async getExpenseTrends(
    farmId: string, 
    timeRange: AnalyticsTimeRange
  ): Promise<TrendData[]> {
    try {
      const expenseData = await prisma.financialTransaction.groupBy({
        by: ['transactionDate'],
        where: {
          farmId,
          type: 'EXPENSE',
          transactionDate: {
            gte: timeRange.startDate,
            lte: timeRange.endDate
          }
        },
        _sum: {
          amount: true
        }
      })
      const aggregatedData = this.aggregateByPeriod(
        expenseData.map(item => ({
          date: item.transactionDate,
          value: Number(item._sum.amount || 0)
        })),
        timeRange.period
      )
      return this.calculateTrendData(aggregatedData)
    } catch (error) {
      console.error('Error calculating expense trends:', error)
      return []
    }
  }
  /**
   * Calculate operational efficiency trends
   */
  private static async getEfficiencyTrends(
    farmId: string, 
    timeRange: AnalyticsTimeRange
  ): Promise<TrendData[]> {
    try {
      // Efficiency = Revenue / Expenses ratio over time
      const [revenue, expenses] = await Promise.all([
        this.getRevenueTrends(farmId, timeRange),
        this.getExpenseTrends(farmId, timeRange)
      ])
      const efficiencyData: TrendData[] = []
      const maxLength = Math.min(revenue.length, expenses.length)
      for (let i = 0; i < maxLength; i++) {
        const revenueValue = revenue[i]?.value || 0
        const expenseValue = expenses[i]?.value || 1 // Avoid division by zero
        efficiencyData.push({
          period: revenue[i]?.period || expenses[i]?.period,
          value: expenseValue > 0 ? revenueValue / expenseValue : 0,
          change: 0, // Will be calculated by calculateTrendData
          changePercentage: 0
        })
      }
      return this.calculateTrendData(efficiencyData)
    } catch (error) {
      console.error('Error calculating efficiency trends:', error)
      return []
    }
  }
  /**
   * Calculate NDVI trends from satellite data
   */
  private static async getNDVITrends(
    farmId: string, 
    timeRange: AnalyticsTimeRange
  ): Promise<TrendData[]> {
    try {
      const ndviData = await prisma.satelliteData.groupBy({
        by: ['captureDate'],
        where: {
          field: {
            farmId
          },
          captureDate: {
            gte: timeRange.startDate,
            lte: timeRange.endDate
          }
        },
        _avg: {
          ndvi: true
        }
      })
      const aggregatedData = this.aggregateByPeriod(
        ndviData.map(item => ({
          date: item.captureDate,
          value: Number(item._avg.ndvi || 0)
        })),
        timeRange.period
      )
      return this.calculateTrendData(aggregatedData)
    } catch (error) {
      console.error('Error calculating NDVI trends:', error)
      return []
    }
  }
  /**
   * Calculate weather pattern trends
   */
  private static async getWeatherPatternTrends(
    farmId: string, 
    timeRange: AnalyticsTimeRange
  ): Promise<TrendData[]> {
    try {
      // Get farm coordinates
      const farm = await prisma.farm.findUnique({
        where: { id: farmId },
        select: { latitude: true, longitude: true }
      })
      if (!farm?.latitude || !farm?.longitude) {
        return []
      }
      // Get weather data from stored weather data
      const weatherData = await prisma.weatherData.groupBy({
        by: ['timestamp'],
        where: {
          field: {
            farmId
          },
          timestamp: {
            gte: timeRange.startDate,
            lte: timeRange.endDate
          }
        },
        _avg: {
          temperature: true,
          precipitation: true,
          humidity: true
        }
      })
      // Create composite weather score (temperature + precipitation factors)
      const aggregatedData = this.aggregateByPeriod(
        weatherData.map(item => ({
          date: item.timestamp,
          value: this.calculateWeatherScore(
            Number(item._avg.temperature || 0),
            Number(item._avg.precipitation || 0),
            Number(item._avg.humidity || 0)
          )
        })),
        timeRange.period
      )
      return this.calculateTrendData(aggregatedData)
    } catch (error) {
      console.error('Error calculating weather trends:', error)
      return []
    }
  }
  /**
   * Calculate a composite weather score for trending
   */
  private static calculateWeatherScore(temp: number, precip: number, humidity: number): number {
    // Normalize values and create a composite score
    // Optimal ranges: temp 20-25°C, precip 25-75mm, humidity 60-80%
    const tempScore = Math.max(0, 1 - Math.abs(temp - 22.5) / 22.5)
    const precipScore = Math.max(0, 1 - Math.abs(precip - 50) / 50)
    const humidityScore = Math.max(0, 1 - Math.abs(humidity - 70) / 70)
    return (tempScore + precipScore + humidityScore) / 3 * 100
  }
  /**
   * Aggregate data by time period
   */
  private static aggregateByPeriod(
    data: Array<{ date: Date, value: number }>,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Array<{ period: string, value: number }> {
    const aggregated: Record<string, { sum: number, count: number }> = {}
    data.forEach(item => {
      const periodKey = this.formatPeriod(item.date, period)
      if (!aggregated[periodKey]) {
        aggregated[periodKey] = { sum: 0, count: 0 }
      }
      aggregated[periodKey].sum += item.value
      aggregated[periodKey].count += 1
    })
    return Object.entries(aggregated).map(([period, data]) => ({
      period,
      value: data.sum / data.count // Average
    })).sort((a, b) => a.period.localeCompare(b.period))
  }
  /**
   * Calculate trend data with changes and percentages
   */
  private static calculateTrendData(
    data: Array<{ period: string, value: number }>
  ): TrendData[] {
    return data.map((item, index) => {
      const previousValue = index > 0 ? data[index - 1].value : item.value
      const change = item.value - previousValue
      const changePercentage = previousValue > 0 ? (change / previousValue) * 100 : 0
      return {
        period: item.period,
        value: item.value,
        change,
        changePercentage
      }
    })
  }
  /**
   * Format date according to period
   */
  private static formatPeriod(date: Date, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): string {
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0]
      case 'weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return weekStart.toISOString().split('T')[0]
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      case 'yearly':
        return String(date.getFullYear())
      default:
        return date.toISOString().split('T')[0]
    }
  }
  /**
   * Get SQL date format for grouping
   */
  private static getDateFormat(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): string {
    switch (period) {
      case 'daily':
        return '%Y-%m-%d'
      case 'weekly':
        return '%Y-%u'
      case 'monthly':
        return '%Y-%m'
      case 'yearly':
        return '%Y'
      default:
        return '%Y-%m-%d'
    }
  }
  /**
   * Get real-time analytics summary
   */
  static async getAnalyticsSummary(farmId: string): Promise<{
    performance: {
      efficiency: number
      profitability: number
      productivity: number
    }
    trends: {
      revenue: 'up' | 'down' | 'stable'
      yield: 'up' | 'down' | 'stable'
      costs: 'up' | 'down' | 'stable'
    }
    insights: string[]
  }> {
    try {
      const last30Days = {
        period: 'daily' as const,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      }
      const trends = await this.getFarmTrends(farmId, last30Days)
      // Calculate performance metrics
      const latestRevenue = trends.revenue[trends.revenue.length - 1]?.value || 0
      const latestExpenses = trends.expenses[trends.expenses.length - 1]?.value || 1
      const latestEfficiency = trends.efficiency[trends.efficiency.length - 1]?.value || 0
      const latestYield = trends.crop_yield[trends.crop_yield.length - 1]?.value || 0
      const efficiency = latestEfficiency * 100
      const profitability = latestExpenses > 0 ? ((latestRevenue - latestExpenses) / latestRevenue) * 100 : 0
      const productivity = latestYield
      // Determine trend directions
      const revenueTrend = this.getTrendDirection(trends.revenue)
      const yieldTrend = this.getTrendDirection(trends.crop_yield)
      const costTrend = this.getTrendDirection(trends.expenses)
      // Generate insights
      const insights = this.generateInsights(trends, { efficiency, profitability, productivity })
      return {
        performance: {
          efficiency: Math.round(efficiency),
          profitability: Math.round(profitability),
          productivity: Math.round(productivity)
        },
        trends: {
          revenue: revenueTrend,
          yield: yieldTrend,
          costs: costTrend
        },
        insights
      }
    } catch (error) {
      console.error('Error generating analytics summary:', error)
      return {
        performance: { efficiency: 0, profitability: 0, productivity: 0 },
        trends: { revenue: 'stable', yield: 'stable', costs: 'stable' },
        insights: ['Analytics data unavailable']
      }
    }
  }
  /**
   * Determine trend direction from data
   */
  private static getTrendDirection(data: TrendData[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable'
    const latest = data[data.length - 1]
    const previous = data[data.length - 2]
    const change = latest.value - previous.value
    const threshold = previous.value * 0.05 // 5% threshold
    if (change > threshold) return 'up'
    if (change < -threshold) return 'down'
    return 'stable'
  }
  /**
   * Generate actionable insights from analytics data
   */
  private static generateInsights(
    trends: TrendingMetrics, 
    performance: { efficiency: number, profitability: number, productivity: number }
  ): string[] {
    const insights: string[] = []
    // Revenue insights
    if (trends.revenue.length > 0) {
      const revenueChange = trends.revenue[trends.revenue.length - 1]?.changePercentage || 0
      if (revenueChange > 10) {
        insights.push(`Revenue increased by ${revenueChange.toFixed(1)}% - strong market performance`)
      } else if (revenueChange < -10) {
        insights.push(`Revenue decreased by ${Math.abs(revenueChange).toFixed(1)}% - consider market diversification`)
      }
    }
    // Efficiency insights
    if (performance.efficiency < 70) {
      insights.push('Operational efficiency below optimal - review resource allocation')
    } else if (performance.efficiency > 90) {
      insights.push('Excellent operational efficiency - maintain current practices')
    }
    // NDVI insights
    if (trends.ndvi.length > 0) {
      const ndviTrend = this.getTrendDirection(trends.ndvi)
      if (ndviTrend === 'down') {
        insights.push('Crop health declining - consider irrigation or fertilization')
      } else if (ndviTrend === 'up') {
        insights.push('Crop health improving - current management practices are effective')
      }
    }
    // Weather pattern insights
    if (trends.weather_patterns.length > 0) {
      const weatherScore = trends.weather_patterns[trends.weather_patterns.length - 1]?.value || 0
      if (weatherScore < 50) {
        insights.push('Challenging weather conditions - monitor crop stress indicators')
      }
    }
    return insights.slice(0, 5) // Limit to 5 insights
  }
}