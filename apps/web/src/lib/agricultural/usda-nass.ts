/**
 * USDA NASS API Integration
 * 
 * Provides access to USDA National Agricultural Statistics Service data
 * for crop production, yields, planted acres, and agricultural statistics.
 */
export interface USDANassConfig {
  apiKey: string
  baseUrl: string
}
export interface CropStatistic {
  year: number
  state: string
  county?: string
  commodity: string
  dataItem: string
  value: number
  unit: string
  source: string
}
export interface YieldData {
  commodity: string
  state: string
  county?: string
  years: Array<{
    year: number
    yield: number
    plantedAcres: number
    harvestedAcres: number
    production: number
  }>
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable'
    rate: number // annual change rate
    confidence: number
  }
}
export interface RegionalComparison {
  commodity: string
  year: number
  nationalAverage: number
  stateAverages: Array<{
    state: string
    yield: number
    percentOfNational: number
    rank: number
  }>
  topProducers: Array<{
    state: string
    production: number
    marketShare: number
  }>
}
export interface CropBenchmarks {
  commodity: string
  region: {
    state: string
    county?: string
  }
  benchmarks: {
    yield: {
      average: number
      topQuartile: number
      topDecile: number
      unit: string
    }
    efficiency: {
      averageInputCost: number
      topQuartileInputCost: number
      profitPerAcre: number
    }
    timing: {
      optimalPlantingWindow: {
        start: string // MM-DD format
        end: string
      }
      averageHarvestDate: string
    }
  }
}
class USDANassService {
  private config: USDANassConfig
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours for USDA data
  private cache = new Map<string, { data: any; timestamp: number }>()
  constructor() {
    this.config = {
      apiKey: process.env.USDA_NASS_API_KEY || '',
      baseUrl: 'https://quickstats.nass.usda.gov/api'
    }
    if (!this.config.apiKey) {
    }
  }
  /**
   * Check if USDA NASS API is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.config.apiKey)
  }
  /**
   * Get crop yield data for a specific location and commodity
   */
  async getCropYieldData(
    commodity: string, 
    state: string, 
    county?: string,
    yearRange: number = 10
  ): Promise<YieldData | null> {
    try {
      const cacheKey = `yield_${commodity}_${state}_${county || 'state'}_${yearRange}`
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data
      }
      if (!this.isConfigured()) {
        throw new Error('USDA NASS API not configured. Historical yield data unavailable.')
      }
      const currentYear = new Date().getFullYear()
      const startYear = currentYear - yearRange
      const params = new URLSearchParams({
        key: this.config.apiKey,
        source_desc: 'SURVEY',
        sector_desc: 'CROPS',
        group_desc: 'FIELD CROPS',
        commodity_desc: commodity.toUpperCase(),
        statisticcat_desc: 'YIELD',
        state_name: state.toUpperCase(),
        year__GE: startYear.toString(),
        format: 'json'
      })
      if (county) {
        params.append('county_name', county.toUpperCase())
      }
      const response = await fetch(`${this.config.baseUrl}/api_GET?${params}`, {
        signal: AbortSignal.timeout(15000)
      })
      if (!response.ok) {
        throw new Error(`USDA NASS API error (${response.status}): Unable to fetch yield data`)
      }
      const data = await response.json()
      const yieldData = this.processYieldData(data.data || [], commodity, state, county)
      this.cache.set(cacheKey, {
        data: yieldData,
        timestamp: Date.now()
      })
      return yieldData
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch USDA yield data: ${error.message}`)
      }
      throw new Error('USDA yield data service unavailable')
    }
  }
  /**
   * Get regional comparison data for a commodity
   */
  async getRegionalComparison(commodity: string, year?: number): Promise<RegionalComparison | null> {
    try {
      const targetYear = year || new Date().getFullYear() - 1 // Previous year data
      const cacheKey = `regional_${commodity}_${targetYear}`
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data
      }
      if (!this.isConfigured()) {
        throw new Error('USDA NASS API not configured. Regional comparison data unavailable.')
      }
      // Get yield data for all states
      const params = new URLSearchParams({
        key: this.config.apiKey,
        source_desc: 'SURVEY',
        sector_desc: 'CROPS',
        group_desc: 'FIELD CROPS',
        commodity_desc: commodity.toUpperCase(),
        statisticcat_desc: 'YIELD',
        agg_level_desc: 'STATE',
        year: targetYear.toString(),
        format: 'json'
      })
      const response = await fetch(`${this.config.baseUrl}/api_GET?${params}`, {
        signal: AbortSignal.timeout(20000)
      })
      if (!response.ok) {
        throw new Error(`USDA NASS API error (${response.status}): Unable to fetch regional comparison data`)
      }
      const data = await response.json()
      const comparison = this.processRegionalData(data.data || [], commodity, targetYear)
      this.cache.set(cacheKey, {
        data: comparison,
        timestamp: Date.now()
      })
      return comparison
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch regional comparison: ${error.message}`)
      }
      throw new Error('USDA regional comparison service unavailable')
    }
  }
  /**
   * Get crop benchmarks for performance comparison
   */
  async getCropBenchmarks(
    commodity: string, 
    state: string, 
    county?: string
  ): Promise<CropBenchmarks | null> {
    try {
      const yieldData = await this.getCropYieldData(commodity, state, county, 5)
      const regionalData = await this.getRegionalComparison(commodity)
      if (!yieldData || !regionalData) {
        throw new Error('Insufficient data to calculate crop benchmarks. USDA data required.')
      }
      // Calculate benchmarks from historical data
      const yields = yieldData.years.map(y => y.yield).filter(y => y > 0)
      yields.sort((a, b) => b - a) // Descending order
      const averageYield = yields.reduce((a, b) => a + b, 0) / yields.length
      const topQuartileYield = yields[Math.floor(yields.length * 0.25)]
      const topDecileYield = yields[Math.floor(yields.length * 0.1)]
      return {
        commodity,
        region: { state, county },
        benchmarks: {
          yield: {
            average: Math.round(averageYield * 10) / 10,
            topQuartile: Math.round(topQuartileYield * 10) / 10,
            topDecile: Math.round(topDecileYield * 10) / 10,
            unit: this.getYieldUnit(commodity)
          },
          efficiency: {
            averageInputCost: this.estimateInputCost(commodity, averageYield),
            topQuartileInputCost: this.estimateInputCost(commodity, topQuartileYield),
            profitPerAcre: this.estimateProfitability(commodity, topQuartileYield)
          },
          timing: {
            optimalPlantingWindow: this.getOptimalPlantingWindow(commodity, state),
            averageHarvestDate: this.getAverageHarvestDate(commodity, state)
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to calculate crop benchmarks: ${error.message}`)
      }
      throw new Error('Crop benchmarks service unavailable')
    }
  }
  /**
   * Process raw USDA yield data into our format
   */
  private processYieldData(data: any[], commodity: string, state: string, county?: string): YieldData {
    const processedYears = data
      .filter(item => item.statisticcat_desc === 'YIELD' && item.Value && item.Value !== '(D)')
      .map(item => ({
        year: parseInt(item.year),
        yield: parseFloat(item.Value.replace(/,/g, '')),
        plantedAcres: 0, // Would need separate API call
        harvestedAcres: 0, // Would need separate API call
        production: 0 // Would need separate API call
      }))
      .sort((a, b) => a.year - b.year)
    const trend = this.calculateTrend(processedYears.map(y => y.yield))
    return {
      commodity,
      state,
      county,
      years: processedYears,
      trend
    }
  }
  /**
   * Process regional comparison data
   */
  private processRegionalData(data: any[], commodity: string, year: number): RegionalComparison {
    const stateData = data
      .filter(item => item.statisticcat_desc === 'YIELD' && item.Value && item.Value !== '(D)')
      .map(item => ({
        state: item.state_name,
        yield: parseFloat(item.Value.replace(/,/g, '')),
        production: 0 // Would need separate query
      }))
      .sort((a, b) => b.yield - a.yield)
    const nationalAverage = stateData.reduce((sum, s) => sum + s.yield, 0) / stateData.length
    const stateAverages = stateData.map((state, index) => ({
      state: state.state,
      yield: state.yield,
      percentOfNational: Math.round((state.yield / nationalAverage) * 100),
      rank: index + 1
    }))
    const topProducers = stateData.slice(0, 10).map(state => ({
      state: state.state,
      production: state.production,
      marketShare: 0 // Would calculate from total production data
    }))
    return {
      commodity,
      year,
      nationalAverage: Math.round(nationalAverage * 10) / 10,
      stateAverages,
      topProducers
    }
  }
  /**
   * Calculate trend from yield data
   */
  private calculateTrend(yields: number[]): YieldData['trend'] {
    if (yields.length < 3) {
      return { direction: 'stable', rate: 0, confidence: 0.1 }
    }
    // Simple linear regression
    const n = yields.length
    const x = Array.from({ length: n }, (_, i) => i)
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = yields.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * yields[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const avgYield = sumY / n
    const direction = slope > avgYield * 0.01 ? 'increasing' : 
                     slope < -avgYield * 0.01 ? 'decreasing' : 'stable'
    const rate = Math.abs(slope / avgYield) * 100 // Percentage change per year
    // Calculate R-squared for confidence
    const yMean = avgYield
    const yPredicted = x.map(xi => (sumY / n) + slope * (xi - sumX / n))
    const ssRes = yields.reduce((sum, yi, i) => sum + Math.pow(yi - yPredicted[i], 2), 0)
    const ssTot = yields.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    const rSquared = 1 - (ssRes / ssTot)
    return {
      direction,
      rate: Math.round(rate * 100) / 100,
      confidence: Math.max(0.1, Math.min(0.9, rSquared))
    }
  }
  // Helper methods for calculations
  private getBaseYield(commodity: string): number {
    const baseYields: Record<string, number> = {
      'CORN': 175, // bushels per acre
      'SOYBEANS': 50,
      'WHEAT': 45,
      'COTTON': 800, // pounds per acre
      'RICE': 7500 // pounds per acre
    }
    return baseYields[commodity.toUpperCase()] || 100
  }
  private getYieldUnit(commodity: string): string {
    const units: Record<string, string> = {
      'CORN': 'bu/acre',
      'SOYBEANS': 'bu/acre',
      'WHEAT': 'bu/acre',
      'COTTON': 'lbs/acre',
      'RICE': 'lbs/acre'
    }
    return units[commodity.toUpperCase()] || 'units/acre'
  }
  private estimateInputCost(commodity: string, yieldValue: number): number {
    // Rough input cost estimates per acre
    const baseCosts: Record<string, number> = {
      'CORN': 450,
      'SOYBEANS': 350,
      'WHEAT': 280,
      'COTTON': 650,
      'RICE': 800
    }
    const baseCost = baseCosts[commodity.toUpperCase()] || 400
    // Higher yields typically require higher inputs
    return Math.round(baseCost * (1 + (yieldValue / this.getBaseYield(commodity) - 1) * 0.3))
  }
  private estimateProfitability(commodity: string, yieldValue: number): number {
    const inputCost = this.estimateInputCost(commodity, yieldValue)
    const revenue = yieldValue * this.getCommodityPrice(commodity)
    return Math.round(revenue - inputCost)
  }
  private getCommodityPrice(commodity: string): number {
    // Rough price estimates per unit
    const prices: Record<string, number> = {
      'CORN': 4.50, // per bushel
      'SOYBEANS': 12.00,
      'WHEAT': 6.50,
      'COTTON': 0.65, // per pound
      'RICE': 0.13 // per pound
    }
    return prices[commodity.toUpperCase()] || 5.00
  }
  private getOptimalPlantingWindow(commodity: string, state: string): { start: string; end: string } {
    // Simplified planting windows - would be more sophisticated in production
    const windows: Record<string, { start: string; end: string }> = {
      'CORN': { start: '04-15', end: '05-31' },
      'SOYBEANS': { start: '05-01', end: '06-15' },
      'WHEAT': { start: '09-15', end: '10-31' },
      'COTTON': { start: '04-01', end: '06-15' },
      'RICE': { start: '03-15', end: '05-31' }
    }
    return windows[commodity.toUpperCase()] || { start: '04-01', end: '06-30' }
  }
  private getAverageHarvestDate(commodity: string, state: string): string {
    const dates: Record<string, string> = {
      'CORN': '10-15',
      'SOYBEANS': '10-01',
      'WHEAT': '07-15',
      'COTTON': '09-30',
      'RICE': '09-15'
    }
    return dates[commodity.toUpperCase()] || '09-15'
  }
}
// Export singleton instance
export const usdaNassService = new USDANassService()
export { USDANassService }