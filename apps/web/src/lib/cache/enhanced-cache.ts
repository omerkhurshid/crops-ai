/**
 * Enhanced Caching System for Crops.AI
 * Provides intelligent caching for different types of data with appropriate TTLs
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
  tags?: string[]
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  tags?: string[] // Tags for cache invalidation
  serialize?: boolean // Whether to serialize the data
  compress?: boolean // Whether to compress large data
}

class EnhancedCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 1000 // Maximum number of entries
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup process
    this.startCleanup()
  }

  // Predefined TTL strategies for different data types
  static TTL = {
    // Weather data
    WEATHER_CURRENT: 30 * 60 * 1000, // 30 minutes
    WEATHER_FORECAST: 60 * 60 * 1000, // 1 hour
    WEATHER_HISTORICAL: 24 * 60 * 60 * 1000, // 24 hours

    // Satellite data
    SATELLITE_CURRENT: 60 * 60 * 1000, // 1 hour
    SATELLITE_HISTORICAL: 7 * 24 * 60 * 60 * 1000, // 1 week
    NDVI_DATA: 24 * 60 * 60 * 1000, // 24 hours

    // Financial data
    MARKET_PRICES: 15 * 60 * 1000, // 15 minutes
    FINANCIAL_REPORTS: 60 * 60 * 1000, // 1 hour
    BUDGET_DATA: 24 * 60 * 60 * 1000, // 24 hours

    // User data
    USER_PROFILE: 30 * 60 * 1000, // 30 minutes
    USER_PREFERENCES: 60 * 60 * 1000, // 1 hour
    USER_DASHBOARD: 5 * 60 * 1000, // 5 minutes

    // Farm data
    FARM_INFO: 60 * 60 * 1000, // 1 hour
    FIELD_BOUNDARIES: 7 * 24 * 60 * 60 * 1000, // 1 week
    CROP_DATA: 60 * 60 * 1000, // 1 hour

    // ML predictions
    ML_PREDICTIONS: 30 * 60 * 1000, // 30 minutes
    DISEASE_PREDICTIONS: 60 * 60 * 1000, // 1 hour
    YIELD_PREDICTIONS: 24 * 60 * 60 * 1000, // 24 hours

    // Static content
    STATIC_CONTENT: 24 * 60 * 60 * 1000, // 24 hours
    API_METADATA: 60 * 60 * 1000, // 1 hour
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || EnhancedCache.TTL.USER_DASHBOARD
    
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
      tags: options.tags
    }

    this.cache.set(key, entry)
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear cache by tags
   */
  clearByTags(tags: string[]): number {
    let cleared = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key)
        cleared++
      }
    }
    
    return cleared
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let expired = 0
    let total = this.cache.size

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++
      }
    }

    return {
      total,
      expired,
      active: total - expired,
      memoryUsage: this.getMemoryUsage(),
      hitRate: this.calculateHitRate()
    }
  }

  /**
   * Weather-specific caching helpers
   */
  cacheWeatherData(location: string, data: any, type: 'current' | 'forecast' | 'historical' = 'current') {
    const ttlMap = {
      current: EnhancedCache.TTL.WEATHER_CURRENT,
      forecast: EnhancedCache.TTL.WEATHER_FORECAST,
      historical: EnhancedCache.TTL.WEATHER_HISTORICAL
    }

    this.set(`weather:${type}:${location}`, data, {
      ttl: ttlMap[type],
      tags: ['weather', type, location]
    })
  }

  getWeatherData(location: string, type: 'current' | 'forecast' | 'historical' = 'current') {
    return this.get(`weather:${type}:${location}`)
  }

  /**
   * Satellite data caching helpers
   */
  cacheSatelliteData(fieldId: string, date: string, data: any) {
    this.set(`satellite:${fieldId}:${date}`, data, {
      ttl: EnhancedCache.TTL.SATELLITE_CURRENT,
      tags: ['satellite', fieldId, date]
    })
  }

  getSatelliteData(fieldId: string, date: string) {
    return this.get(`satellite:${fieldId}:${date}`)
  }

  /**
   * User data caching helpers
   */
  cacheUserData(userId: string, data: any, type: 'profile' | 'preferences' | 'dashboard' = 'profile') {
    const ttlMap = {
      profile: EnhancedCache.TTL.USER_PROFILE,
      preferences: EnhancedCache.TTL.USER_PREFERENCES,
      dashboard: EnhancedCache.TTL.USER_DASHBOARD
    }

    this.set(`user:${type}:${userId}`, data, {
      ttl: ttlMap[type],
      tags: ['user', type, userId]
    })
  }

  getUserData(userId: string, type: 'profile' | 'preferences' | 'dashboard' = 'profile') {
    return this.get(`user:${type}:${userId}`)
  }

  /**
   * ML prediction caching helpers
   */
  cacheMLPrediction(modelId: string, inputHash: string, prediction: any, type: 'disease' | 'yield' | 'weather' = 'disease') {
    const ttlMap = {
      disease: EnhancedCache.TTL.DISEASE_PREDICTIONS,
      yield: EnhancedCache.TTL.YIELD_PREDICTIONS,
      weather: EnhancedCache.TTL.ML_PREDICTIONS
    }

    this.set(`ml:${type}:${modelId}:${inputHash}`, prediction, {
      ttl: ttlMap[type],
      tags: ['ml', type, modelId]
    })
  }

  getMLPrediction(modelId: string, inputHash: string, type: 'disease' | 'yield' | 'weather' = 'disease') {
    return this.get(`ml:${type}:${modelId}:${inputHash}`)
  }

  /**
   * Cache-aside pattern with async data fetching
   */
  async getOrFetch<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    const data = await fetchFunction()
    
    // Cache the result
    this.set(key, data, options)
    
    return data
  }

  /**
   * Stale-while-revalidate pattern
   */
  async getStaleWhileRevalidate<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions & { staleTime?: number } = {}
  ): Promise<T> {
    const entry = this.cache.get(key)
    const now = Date.now()
    const staleTime = options.staleTime || (options.ttl || EnhancedCache.TTL.USER_DASHBOARD) / 2

    // If we have cached data and it's not stale, return it
    if (entry && (now - entry.timestamp) < staleTime) {
      return entry.data
    }

    // If we have cached data but it's stale, return it and fetch fresh data in background
    if (entry && (now - entry.timestamp) < entry.ttl) {
      // Return stale data immediately
      setTimeout(async () => {
        try {
          const freshData = await fetchFunction()
          this.set(key, freshData, options)
        } catch (error) {
          console.error('Background refresh failed:', error)
        }
      }, 0)
      
      return entry.data
    }

    // No cached data or expired, fetch fresh data
    const data = await fetchFunction()
    this.set(key, data, options)
    return data
  }

  /**
   * Private methods
   */
  private evictOldest(): void {
    let oldest: { key: string; timestamp: number } | null = null
    
    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = { key, timestamp: entry.timestamp }
      }
    }
    
    if (oldest) {
      this.cache.delete(oldest.key)
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000) // Cleanup every 5 minutes
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key)
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key))
  }

  private getMemoryUsage(): string {
    // Rough estimation of memory usage
    let size = 0
    for (const entry of this.cache.values()) {
      size += JSON.stringify(entry).length
    }
    return this.formatBytes(size)
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private calculateHitRate(): number {
    // This would require tracking hits/misses in a production implementation
    return 0.85 // Placeholder
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

// Create singleton instance
export const enhancedCache = new EnhancedCache()

// Export types for TypeScript
export type { CacheOptions, CacheEntry }
export { EnhancedCache }