/**
 * Alpha Vantage Market Data Service with Rate Limiting
 * 
 * Handles the 5 calls/minute and 500 calls/day limits intelligently
 * using caching, queuing, and smart data management.
 */

import { CacheService } from '@crops-ai/shared'
import { prisma } from '../prisma'

interface AlphaVantageConfig {
  apiKey: string
  baseUrl: string
  rateLimit: {
    perMinute: number
    perDay: number
  }
}

interface MarketPrice {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  timestamp: Date
  source: 'live' | 'cached'
}

class AlphaVantageService {
  private config: AlphaVantageConfig
  private callsThisMinute: number = 0
  private callsToday: number = 0
  private lastMinuteReset: Date = new Date()
  private lastDayReset: Date = new Date()
  
  // Cache durations
  private readonly PRICE_CACHE_DURATION = 15 * 60 // 15 minutes
  private readonly HISTORY_CACHE_DURATION = 60 * 60 // 1 hour
  private readonly STATIC_DATA_CACHE_DURATION = 24 * 60 * 60 // 24 hours

  constructor() {
    this.config = {
      apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
      baseUrl: 'https://www.alphavantage.co/query',
      rateLimit: {
        perMinute: 5,
        perDay: 500
      }
    }
  }

  /**
   * Get commodity prices with intelligent caching
   */
  async getCommodityPrices(symbols: string[]): Promise<MarketPrice[]> {
    const prices: MarketPrice[] = []
    
    for (const symbol of symbols) {
      // Step 1: Check Redis cache first (15 min)
      const cacheKey = `market:price:${symbol}`
      const cached = await CacheService.get<MarketPrice>(cacheKey)
      
      if (cached) {
        prices.push({ ...cached, source: 'cached' })
        continue
      }

      // Step 2: Check database for recent prices (< 30 min old)
      const dbPrice = await this.getRecentPriceFromDB(symbol)
      if (dbPrice) {
        prices.push({ ...dbPrice, source: 'cached' })
        // Also cache in Redis for faster access
        await CacheService.set(cacheKey, dbPrice, this.PRICE_CACHE_DURATION)
        continue
      }

      // Step 3: Fetch from API if within rate limits
      if (this.canMakeApiCall()) {
        try {
          const livePrice = await this.fetchLivePrice(symbol)
          if (livePrice) {
            prices.push({ ...livePrice, source: 'live' })
            // Cache immediately
            await this.cachePrice(symbol, livePrice)
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error)
          // Fall back to stale data if available
          const stalePrice = await this.getStalePrice(symbol)
          if (stalePrice) {
            prices.push({ ...stalePrice, source: 'cached' })
          }
        }
      } else {
        // Rate limited - use stale data
        const stalePrice = await this.getStalePrice(symbol)
        if (stalePrice) {
          prices.push({ ...stalePrice, source: 'cached' })
        }
      }
    }
    
    return prices
  }

  /**
   * Check if we can make an API call without hitting rate limits
   */
  private canMakeApiCall(): boolean {
    this.updateRateLimitCounters()
    
    if (this.callsThisMinute >= this.config.rateLimit.perMinute) {
      console.log('Rate limit: Max calls per minute reached')
      return false
    }
    
    if (this.callsToday >= this.config.rateLimit.perDay) {
      console.log('Rate limit: Daily limit reached')
      return false
    }
    
    return true
  }

  /**
   * Update rate limit counters
   */
  private updateRateLimitCounters() {
    const now = new Date()
    
    // Reset minute counter
    if (now.getTime() - this.lastMinuteReset.getTime() >= 60000) {
      this.callsThisMinute = 0
      this.lastMinuteReset = now
    }
    
    // Reset daily counter at midnight
    if (now.getDate() !== this.lastDayReset.getDate()) {
      this.callsToday = 0
      this.lastDayReset = now
    }
  }

  /**
   * Fetch live price from Alpha Vantage
   */
  private async fetchLivePrice(symbol: string): Promise<MarketPrice | null> {
    // Increment counters
    this.callsThisMinute++
    this.callsToday++
    
    const commodityMap: { [key: string]: string } = {
      'ZC': 'CORN',
      'ZW': 'WHEAT', 
      'ZS': 'SOYBEANS',
      'CORN': 'CORN',
      'WHEAT': 'WHEAT',
      'SOYBEANS': 'SOYBEANS'
    }

    const alphaSymbol = commodityMap[symbol] || symbol
    
    try {
      const response = await fetch(
        `${this.config.baseUrl}?function=GLOBAL_QUOTE&symbol=${alphaSymbol}&apikey=${this.config.apiKey}`,
        { signal: AbortSignal.timeout(10000) }
      )
      
      const data = await response.json()
      
      if (data['Global Quote']) {
        const quote = data['Global Quote']
        return {
          symbol,
          name: this.getCommodityName(symbol),
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          timestamp: new Date(),
          source: 'live'
        }
      }
      
      return null
    } catch (error) {
      console.error('Alpha Vantage API error:', error)
      throw error
    }
  }

  /**
   * Get recent price from database (< 30 min old)
   */
  private async getRecentPriceFromDB(symbol: string): Promise<MarketPrice | null> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    
    const recentPrice = await prisma.marketPrice.findFirst({
      where: {
        commodity: symbol,
        date: { gte: thirtyMinutesAgo }
      },
      orderBy: { date: 'desc' }
    })
    
    if (recentPrice) {
      // Calculate change from previous day
      const previousPrice = await this.getPreviousDayPrice(symbol)
      const change = previousPrice ? recentPrice.price - previousPrice : 0
      const changePercent = previousPrice ? (change / previousPrice) * 100 : 0
      
      return {
        symbol,
        name: this.getCommodityName(symbol),
        price: recentPrice.price,
        change,
        changePercent,
        timestamp: recentPrice.date,
        source: 'cached'
      }
    }
    
    return null
  }

  /**
   * Get stale price (any price from today)
   */
  private async getStalePrice(symbol: string): Promise<MarketPrice | null> {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const stalePrice = await prisma.marketPrice.findFirst({
      where: {
        commodity: symbol,
        date: { gte: todayStart }
      },
      orderBy: { date: 'desc' }
    })
    
    if (stalePrice) {
      return {
        symbol,
        name: this.getCommodityName(symbol),
        price: stalePrice.price,
        change: 0, // Can't calculate without more data
        changePercent: 0,
        timestamp: stalePrice.date,
        source: 'cached'
      }
    }
    
    // Last resort: get most recent price regardless of date
    const anyPrice = await prisma.marketPrice.findFirst({
      where: { commodity: symbol },
      orderBy: { date: 'desc' }
    })
    
    if (anyPrice) {
      return {
        symbol,
        name: this.getCommodityName(symbol),
        price: anyPrice.price,
        change: 0,
        changePercent: 0,
        timestamp: anyPrice.date,
        source: 'cached'
      }
    }
    
    return null
  }

  /**
   * Cache price in both Redis and database
   */
  private async cachePrice(symbol: string, price: MarketPrice) {
    // Cache in Redis
    const cacheKey = `market:price:${symbol}`
    await CacheService.set(cacheKey, price, this.PRICE_CACHE_DURATION)
    
    // Store in database
    try {
      await prisma.marketPrice.upsert({
        where: {
          commodity_date: {
            commodity: symbol,
            date: price.timestamp
          }
        },
        create: {
          commodity: symbol,
          market: 'Alpha Vantage',
          price: price.price,
          currency: 'USD',
          unit: this.getCommodityUnit(symbol),
          date: price.timestamp
        },
        update: {
          price: price.price
        }
      })
    } catch (error) {
      console.error('Error caching to database:', error)
    }
  }

  /**
   * Get previous trading day price for change calculation
   */
  private async getPreviousDayPrice(symbol: string): Promise<number | null> {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(23, 59, 59, 999)
    
    const previousPrice = await prisma.marketPrice.findFirst({
      where: {
        commodity: symbol,
        date: { lte: yesterday }
      },
      orderBy: { date: 'desc' }
    })
    
    return previousPrice?.price || null
  }

  /**
   * Smart batch fetching for dashboard
   * Optimizes API calls by fetching only what's needed
   */
  async getDashboardPrices(): Promise<{
    prices: MarketPrice[]
    nextUpdateIn: number
    dataFreshness: 'live' | 'recent' | 'stale'
  }> {
    const mainCommodities = ['CORN', 'WHEAT', 'SOYBEANS']
    const prices = await this.getCommodityPrices(mainCommodities)
    
    // Determine data freshness
    const now = new Date()
    const oldestPrice = prices.reduce((oldest, p) => 
      p.timestamp < oldest.timestamp ? p : oldest
    )
    
    const ageInMinutes = (now.getTime() - oldestPrice.timestamp.getTime()) / 60000
    
    let dataFreshness: 'live' | 'recent' | 'stale'
    let nextUpdateIn: number
    
    if (ageInMinutes < 15) {
      dataFreshness = 'live'
      nextUpdateIn = 15 - ageInMinutes
    } else if (ageInMinutes < 60) {
      dataFreshness = 'recent'
      nextUpdateIn = 5 // Try again in 5 minutes
    } else {
      dataFreshness = 'stale'
      nextUpdateIn = 1 // Try again soon
    }
    
    return {
      prices,
      nextUpdateIn: Math.ceil(nextUpdateIn),
      dataFreshness
    }
  }

  /**
   * Get remaining API calls for today
   */
  getRateLimitStatus(): {
    callsToday: number
    callsRemaining: number
    resetsAt: Date
  } {
    this.updateRateLimitCounters()
    
    const resetsAt = new Date()
    resetsAt.setDate(resetsAt.getDate() + 1)
    resetsAt.setHours(0, 0, 0, 0)
    
    return {
      callsToday: this.callsToday,
      callsRemaining: this.config.rateLimit.perDay - this.callsToday,
      resetsAt
    }
  }

  /**
   * Helper methods
   */
  private getCommodityName(symbol: string): string {
    const names: { [key: string]: string } = {
      'ZC': 'Corn',
      'ZW': 'Wheat',
      'ZS': 'Soybeans',
      'CORN': 'Corn',
      'WHEAT': 'Wheat',
      'SOYBEANS': 'Soybeans',
      'LC': 'Live Cattle',
      'FC': 'Feeder Cattle',
      'LH': 'Lean Hogs'
    }
    return names[symbol] || symbol
  }

  private getCommodityUnit(symbol: string): string {
    const units: { [key: string]: string } = {
      'ZC': 'bushel',
      'ZW': 'bushel',
      'ZS': 'bushel',
      'CORN': 'bushel',
      'WHEAT': 'bushel',
      'SOYBEANS': 'bushel',
      'LC': 'lb',
      'FC': 'lb',
      'LH': 'lb'
    }
    return units[symbol] || 'unit'
  }
}

// Export singleton instance
export const alphaVantageService = new AlphaVantageService()