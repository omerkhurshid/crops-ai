/**
 * Redis Cache Client
 * High-performance caching layer for NBA system
 */
import { Redis } from '@upstash/redis'
export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
}
export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalKeys: number
}
class RedisCache {
  private client: Redis | null = null
  private isConnected = false
  private stats = { hits: 0, misses: 0 }
  constructor() {
    this.initializeClient()
  }
  private initializeClient() {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!redisUrl || !redisToken || redisUrl === 'https://example.upstash.io' || redisToken === 'example_token') {
      return
    }
    try {
      this.client = new Redis({
        url: redisUrl,
        token: redisToken,
      })
      this.isConnected = true
    } catch (error) {
      console.error('Failed to initialize Redis:', error)
      this.isConnected = false
    }
  }
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected || !this.client) {
        return this.getFromMemoryCache<T>(key)
      }
      const value = await this.client.get(key)
      if (value !== null) {
        this.stats.hits++
        return JSON.parse(value as string)
      }
      this.stats.misses++
      return null
    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.misses++
      return null
    }
  }
  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (!this.isConnected || !this.client) {
        return this.setInMemoryCache(key, value, options)
      }
      const serializedValue = JSON.stringify(value)
      if (options.ttl) {
        await this.client.setex(key, options.ttl, serializedValue)
      } else {
        await this.client.set(key, serializedValue)
      }
      // Store cache tags for invalidation
      if (options.tags) {
        for (const tag of options.tags) {
          await this.client.sadd(`tag:${tag}`, key)
        }
      }
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }
  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.client) {
        return this.deleteFromMemoryCache(key)
      }
      const result = await this.client.del(key)
      return result > 0
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }
  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<boolean> {
    try {
      if (!this.isConnected || !this.client) {
        return this.invalidateMemoryCacheByTags(tags)
      }
      for (const tag of tags) {
        const keys = await this.client.smembers(`tag:${tag}`)
        if (keys.length > 0) {
          await this.client.del(...keys)
          await this.client.del(`tag:${tag}`)
        }
      }
      return true
    } catch (error) {
      console.error('Cache invalidation error:', error)
      return false
    }
  }
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      totalKeys: this.memoryCache.size
    }
  }
  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushall()
      }
      this.memoryCache.clear()
      this.stats = { hits: 0, misses: 0 }
      return true
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  }
  // In-memory cache fallback
  private memoryCache = new Map<string, { value: any, expires?: number, tags?: string[] }>()
  private getFromMemoryCache<T>(key: string): T | null {
    const item = this.memoryCache.get(key)
    if (!item) {
      this.stats.misses++
      return null
    }
    if (item.expires && Date.now() > item.expires) {
      this.memoryCache.delete(key)
      this.stats.misses++
      return null
    }
    this.stats.hits++
    return item.value
  }
  private setInMemoryCache<T>(key: string, value: T, options: CacheOptions = {}): boolean {
    const expires = options.ttl ? Date.now() + (options.ttl * 1000) : undefined
    this.memoryCache.set(key, { value, expires, tags: options.tags })
    return true
  }
  private deleteFromMemoryCache(key: string): boolean {
    return this.memoryCache.delete(key)
  }
  private invalidateMemoryCacheByTags(tags: string[]): boolean {
    let invalidated = false
    this.memoryCache.forEach((item, key) => {
      if (item.tags && item.tags.some(tag => tags.includes(tag))) {
        this.memoryCache.delete(key)
        invalidated = true
      }
    })
    return invalidated
  }
}
// Singleton instance
export const cache = new RedisCache()
// Cache key builders
export const CacheKeys = {
  weather: (lat: number, lon: number) => `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`,
  forecast: (lat: number, lon: number, days: number) => `forecast:${lat.toFixed(2)}:${lon.toFixed(2)}:${days}`,
  nbaRecommendations: (farmId: string) => `nba:recommendations:${farmId}`,
  farmData: (farmId: string) => `farm:data:${farmId}`,
  financialSummary: (farmId: string, period: string) => `financial:summary:${farmId}:${period}`,
  cropHealth: (fieldId: string) => `crop:health:${fieldId}`,
  ndviData: (fieldId: string, date: string) => `ndvi:${fieldId}:${date}`,
  marketPrices: (commodity: string) => `market:prices:${commodity}`,
  user: (userId: string) => `user:${userId}`,
  session: (sessionId: string) => `session:${sessionId}`,
} as const
// Cache TTL constants (in seconds)
export const CacheTTL = {
  WEATHER_CURRENT: 300,      // 5 minutes
  WEATHER_FORECAST: 1800,    // 30 minutes  
  NBA_RECOMMENDATIONS: 3600, // 1 hour
  FARM_DATA: 1800,          // 30 minutes
  FINANCIAL_SUMMARY: 3600,   // 1 hour
  CROP_HEALTH: 900,         // 15 minutes
  NDVI_DATA: 86400,         // 24 hours
  MARKET_PRICES: 300,       // 5 minutes
  USER_DATA: 1800,          // 30 minutes
  SESSION: 3600,            // 1 hour
} as const
// Cache tags for organized invalidation
export const CacheTags = {
  WEATHER: 'weather',
  NBA: 'nba', 
  FARM: 'farm',
  FINANCIAL: 'financial',
  CROP: 'crop',
  MARKET: 'market',
  USER: 'user',
} as const