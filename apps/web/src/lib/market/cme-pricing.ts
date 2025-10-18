/**
 * CME Group API Integration for Commodity Pricing
 * 
 * Provides real-time and historical commodity pricing data from Chicago
 * Mercantile Exchange for agricultural commodities including corn, wheat,
 * soybeans, and other crops.
 */

export interface CMEConfig {
  apiKey: string
  baseUrl: string
  marketDataUrl: string
}

export interface CommodityPrice {
  symbol: string
  name: string
  exchange: string
  price: number
  currency: string
  unit: string // bushel, ton, cwt, etc.
  change: number
  changePercent: number
  volume: number
  openInterest?: number
  lastUpdate: string
  sessionDate: string
}

export interface PriceHistory {
  symbol: string
  prices: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    adjustedClose?: number
  }>
}

export interface MarketSummary {
  date: string
  commodities: {
    grains: CommodityPrice[]
    livestock: CommodityPrice[]
    softs: CommodityPrice[]
  }
  marketIndicators: {
    grainIndex: number
    volatilityIndex: number
    trends: {
      bullish: string[]
      bearish: string[]
      neutral: string[]
    }
  }
}

class CMEPricingService {
  private config: CMEConfig
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private priceCache = new Map<string, { data: CommodityPrice; timestamp: number }>()

  constructor() {
    this.config = {
      apiKey: process.env.CME_API_KEY || '',
      baseUrl: 'https://www.cmegroup.com/market-data-platform',
      marketDataUrl: 'https://api.cmegroup.com/v1'
    }

    if (!this.config.apiKey) {

    }
  }

  /**
   * Check if CME API is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.config.apiKey)
  }

  /**
   * Get current price for a commodity
   */
  async getCommodityPrice(symbol: string): Promise<CommodityPrice | null> {
    try {
      // Check cache first
      const cached = this.priceCache.get(symbol)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data
      }

      if (!this.isConfigured()) {
        return this.getMockPrice(symbol)
      }

      const response = await fetch(`${this.config.marketDataUrl}/quotes/${symbol}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {

        return this.getMockPrice(symbol)
      }

      const data = await response.json()
      const price = this.formatPriceData(data)
      
      // Cache the result
      this.priceCache.set(symbol, {
        data: price,
        timestamp: Date.now()
      })

      return price

    } catch (error) {
      console.error(`Error fetching CME price for ${symbol}:`, error)
      return this.getMockPrice(symbol)
    }
  }

  /**
   * Get multiple commodity prices
   */
  async getMultiplePrices(symbols: string[]): Promise<CommodityPrice[]> {
    try {
      const pricePromises = (symbols || []).map(symbol => this.getCommodityPrice(symbol))
      const prices = await Promise.all(pricePromises)
      return prices.filter(price => price !== null) as CommodityPrice[]
    } catch (error) {
      console.error('Error fetching multiple commodity prices:', error)
      return []
    }
  }

  /**
   * Get agricultural commodity prices overview
   */
  async getAgriculturalPrices(): Promise<MarketSummary> {
    try {
      const grainSymbols = ['ZC', 'ZW', 'ZS'] // Corn, Wheat, Soybeans futures
      const livestockSymbols = ['LE', 'HE'] // Live Cattle, Lean Hogs
      const softsSymbols = ['KC', 'SB', 'CC'] // Coffee, Sugar, Cocoa

      const [grains, livestock, softs] = await Promise.all([
        this.getMultiplePrices(grainSymbols),
        this.getMultiplePrices(livestockSymbols),
        this.getMultiplePrices(softsSymbols)
      ])

      const allCommodities = [...grains, ...livestock, ...softs]
      
      return {
        date: new Date().toISOString().split('T')[0],
        commodities: {
          grains,
          livestock,
          softs
        },
        marketIndicators: {
          grainIndex: this.calculateGrainIndex(grains),
          volatilityIndex: this.calculateVolatilityIndex(allCommodities),
          trends: this.analyzeTrends(allCommodities)
        }
      }

    } catch (error) {
      console.error('Error getting agricultural prices overview:', error)
      return this.getMockMarketSummary()
    }
  }

  /**
   * Get price history for a commodity
   */
  async getPriceHistory(symbol: string, days: number = 30): Promise<PriceHistory | null> {
    try {
      if (!this.isConfigured()) {
        return this.getMockPriceHistory(symbol, days)
      }

      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
      
      const response = await fetch(
        `${this.config.marketDataUrl}/historical/${symbol}?start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(15000)
        }
      )

      if (!response.ok) {
        return this.getMockPriceHistory(symbol, days)
      }

      const data = await response.json()
      return this.formatHistoricalData(symbol, data)

    } catch (error) {
      console.error(`Error fetching price history for ${symbol}:`, error)
      return this.getMockPriceHistory(symbol, days)
    }
  }

  /**
   * Calculate price forecast based on trends
   */
  async getPriceForecast(symbol: string): Promise<{
    symbol: string
    currentPrice: number
    forecast: {
      oneWeek: { price: number; confidence: number }
      oneMonth: { price: number; confidence: number }
      threeMonths: { price: number; confidence: number }
    }
    factors: string[]
  } | null> {
    try {
      const currentPrice = await this.getCommodityPrice(symbol)
      if (!currentPrice) return null

      const history = await this.getPriceHistory(symbol, 90)
      if (!history) return null

      // Simple trend-based forecast (in production would use more sophisticated models)
      const recentPrices = (history.prices || []).slice(-30).map(p => p.close)
      const trend = this.calculateTrend(recentPrices)
      const volatility = this.calculateVolatility(recentPrices)

      const basePrice = currentPrice.price
      
      return {
        symbol,
        currentPrice: basePrice,
        forecast: {
          oneWeek: {
            price: basePrice * (1 + trend * 0.1),
            confidence: Math.max(0.3, 0.8 - volatility)
          },
          oneMonth: {
            price: basePrice * (1 + trend * 0.4),
            confidence: Math.max(0.2, 0.7 - volatility)
          },
          threeMonths: {
            price: basePrice * (1 + trend * 1.2),
            confidence: Math.max(0.1, 0.5 - volatility)
          }
        },
        factors: this.getMarketFactors(symbol)
      }

    } catch (error) {
      console.error(`Error generating price forecast for ${symbol}:`, error)
      return null
    }
  }

  /**
   * Format raw CME data to our standard format
   */
  private formatPriceData(data: any): CommodityPrice {
    return {
      symbol: data.symbol || 'UNKNOWN',
      name: this.getCommodityName(data.symbol),
      exchange: 'CME',
      price: data.last || data.price || 0,
      currency: data.currency || 'USD',
      unit: this.getCommodityUnit(data.symbol),
      change: data.change || 0,
      changePercent: data.changePercent || 0,
      volume: data.volume || 0,
      openInterest: data.openInterest,
      lastUpdate: data.timestamp || new Date().toISOString(),
      sessionDate: data.sessionDate || new Date().toISOString().split('T')[0]
    }
  }

  /**
   * Generate mock price data for fallback
   */
  private getMockPrice(symbol: string): CommodityPrice {
    const basePrice = this.getBasePriceForSymbol(symbol)
    const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
    const price = basePrice * (1 + variation)
    const change = basePrice * variation
    
    return {
      symbol,
      name: this.getCommodityName(symbol),
      exchange: 'CME',
      price: Math.round(price * 100) / 100,
      currency: 'USD',
      unit: this.getCommodityUnit(symbol),
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(variation * 100 * 100) / 100,
      volume: Math.floor(Math.random() * 100000) + 10000,
      lastUpdate: new Date().toISOString(),
      sessionDate: new Date().toISOString().split('T')[0]
    }
  }

  /**
   * Get base price for mock data
   */
  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: Record<string, number> = {
      'ZC': 450, // Corn (cents/bushel)
      'ZW': 650, // Wheat (cents/bushel)
      'ZS': 1200, // Soybeans (cents/bushel)
      'LE': 150, // Live Cattle ($/cwt)
      'HE': 80, // Lean Hogs ($/cwt)
      'KC': 180, // Coffee (cents/lb)
      'SB': 20, // Sugar (cents/lb)
      'CC': 2800 // Cocoa ($/metric ton)
    }
    return basePrices[symbol] || 100
  }

  /**
   * Get commodity name from symbol
   */
  private getCommodityName(symbol: string): string {
    const names: Record<string, string> = {
      'ZC': 'Corn',
      'ZW': 'Wheat',
      'ZS': 'Soybeans',
      'LE': 'Live Cattle',
      'HE': 'Lean Hogs',
      'KC': 'Coffee',
      'SB': 'Sugar #11',
      'CC': 'Cocoa'
    }
    return names[symbol] || symbol
  }

  /**
   * Get commodity unit from symbol
   */
  private getCommodityUnit(symbol: string): string {
    const units: Record<string, string> = {
      'ZC': 'cents/bushel',
      'ZW': 'cents/bushel', 
      'ZS': 'cents/bushel',
      'LE': '$/cwt',
      'HE': '$/cwt',
      'KC': 'cents/lb',
      'SB': 'cents/lb',
      'CC': '$/metric ton'
    }
    return units[symbol] || 'USD'
  }

  /**
   * Calculate grain index from grain prices
   */
  private calculateGrainIndex(grains: CommodityPrice[]): number {
    if (grains.length === 0) return 100
    
    const totalChange = (grains || []).reduce((sum, grain) => sum + grain.changePercent, 0)
    return 100 + (totalChange / grains.length)
  }

  /**
   * Calculate market volatility index
   */
  private calculateVolatilityIndex(commodities: CommodityPrice[]): number {
    if (commodities.length === 0) return 0
    
    const changes = (commodities || []).map(c => Math.abs(c.changePercent))
    const avgVolatility = changes.reduce((a, b) => a + b, 0) / changes.length
    return Math.round(avgVolatility * 100) / 100
  }

  /**
   * Analyze market trends
   */
  private analyzeTrends(commodities: CommodityPrice[]) {
    const bullish = (commodities || []).filter(c => c.changePercent > 2).map(c => c.symbol)
    const bearish = (commodities || []).filter(c => c.changePercent < -2).map(c => c.symbol)
    const neutral = (commodities || []).filter(c => Math.abs(c.changePercent) <= 2).map(c => c.symbol)
    
    return { bullish, bearish, neutral }
  }

  /**
   * Generate mock historical data
   */
  private getMockPriceHistory(symbol: string, days: number): PriceHistory {
    const basePrice = this.getBasePriceForSymbol(symbol)
    const prices = []
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const variation = (Math.random() - 0.5) * 0.05 // ±2.5% daily variation
      const price = basePrice * (1 + variation)
      
      prices.push({
        date: date.toISOString().split('T')[0],
        open: price * 0.995,
        high: price * 1.02,
        low: price * 0.98,
        close: price,
        volume: Math.floor(Math.random() * 50000) + 10000
      })
    }
    
    return { symbol, prices }
  }

  /**
   * Generate mock market summary
   */
  private getMockMarketSummary(): MarketSummary {
    return {
      date: new Date().toISOString().split('T')[0],
      commodities: {
        grains: [
          this.getMockPrice('ZC'),
          this.getMockPrice('ZW'),
          this.getMockPrice('ZS')
        ],
        livestock: [
          this.getMockPrice('LE'),
          this.getMockPrice('HE')
        ],
        softs: [
          this.getMockPrice('KC'),
          this.getMockPrice('SB')
        ]
      },
      marketIndicators: {
        grainIndex: 102.5,
        volatilityIndex: 1.8,
        trends: {
          bullish: ['ZS'],
          bearish: ['ZW'],
          neutral: ['ZC', 'LE', 'HE']
        }
      }
    }
  }

  // Helper methods for forecast calculations
  private calculateTrend(prices: number[]): number {
    if (prices.length < 2) return 0
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2))
    const secondHalf = prices.slice(Math.floor(prices.length / 2))
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    return (avgSecond - avgFirst) / avgFirst
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0
    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    return Math.sqrt(variance)
  }

  private getMarketFactors(symbol: string): string[] {
    const factors: Record<string, string[]> = {
      'ZC': ['Weather conditions', 'Export demand', 'Ethanol production', 'Feed demand'],
      'ZW': ['Global production', 'Export competition', 'Weather in key regions', 'Currency fluctuations'],
      'ZS': ['China trade relations', 'Crush margins', 'Weather in South America', 'Competing oilseeds']
    }
    return factors[symbol] || ['Supply and demand', 'Weather conditions', 'Economic factors']
  }

  private formatHistoricalData(symbol: string, data: any): PriceHistory {
    return {
      symbol,
      prices: (data || []).map((item: any) => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        adjustedClose: item.adjustedClose
      }))
    }
  }
}

// Export singleton instance
export const cmePricingService = new CMEPricingService()
export { CMEPricingService }