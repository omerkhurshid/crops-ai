/**
 * API Response Caching System
 * Provides intelligent caching for API responses to improve performance
 */

import { Logger } from '@crops-ai/shared'

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  staleWhileRevalidate?: boolean // Return stale data while fetching fresh
}

export class APICache {
  private static instance: APICache
  private cache = new Map<string, CacheEntry>()
  private pendingRequests = new Map<string, Promise<any>>()
  
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly DEFAULT_MAX_SIZE = 100
  
  private constructor() {
    // Clear expired entries every minute
    setInterval(() => this.clearExpired(), 60 * 1000)
  }

  static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache()
    }
    return APICache.instance
  }

  /**
   * Get cached data or fetch if not available/expired
   */
  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = this.DEFAULT_TTL, staleWhileRevalidate = true } = options
    
    const cached = this.cache.get(key)
    const now = Date.now()
    
    // Return fresh data if available
    if (cached && (now - cached.timestamp) < cached.ttl) {
      Logger.debug('Cache hit', { key, age: now - cached.timestamp })
      return cached.data
    }

    // Handle stale-while-revalidate
    if (cached && staleWhileRevalidate) {
      Logger.debug('Serving stale data while revalidating', { key })
      
      // Start background refresh (don't await)
      this.refreshInBackground(key, fetcher, ttl).catch(error => {
        Logger.error('Background refresh failed', { key, error })
      })
      
      return cached.data
    }

    // Deduplicate concurrent requests
    if (this.pendingRequests.has(key)) {
      Logger.debug('Deduplicating concurrent request', { key })
      return this.pendingRequests.get(key)!
    }

    // Fetch fresh data
    const fetchPromise = this.fetchAndCache(key, fetcher, ttl)
    this.pendingRequests.set(key, fetchPromise)
    
    try {
      const result = await fetchPromise
      this.pendingRequests.delete(key)
      return result
    } catch (error) {
      this.pendingRequests.delete(key)
      
      // Return stale data as fallback if available
      if (cached) {
        Logger.warn('Fetch failed, serving stale data', { key, error })
        return cached.data
      }
      
      throw error
    }
  }

  /**
   * Manually set cache entry
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.ensureSpaceAvailable()
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      key
    })
    
    Logger.debug('Cache set', { key, ttl })
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      Logger.debug('Cache invalidated', { key })
    }
    return deleted
  }

  /**
   * Invalidate all entries matching pattern
   */
  invalidatePattern(pattern: string): number {
    let count = 0
    const regex = new RegExp(pattern)
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    
    Logger.debug('Cache pattern invalidated', { pattern, count })
    return count
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    Logger.info('Cache cleared', { entriesRemoved: size })
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    entries: { key: string; age: number; ttl: number }[]
  } {
    const now = Date.now()
    const entries = Array.from(this.cache.values()).map(entry => ({
      key: entry.key,
      age: now - entry.timestamp,
      ttl: entry.ttl
    }))
    
    return { size: this.cache.size, entries }
  }

  /**
   * Prefetch data for given key
   */
  async prefetch<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      await this.fetchAndCache(key, fetcher, ttl)
      Logger.debug('Data prefetched', { key })
    } catch (error) {
      Logger.warn('Prefetch failed', { key, error })
    }
  }

  private async fetchAndCache<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number
  ): Promise<T> {
    Logger.debug('Fetching fresh data', { key })
    
    const startTime = Date.now()
    const data = await fetcher()
    const fetchTime = Date.now() - startTime
    
    this.set(key, data, ttl)
    
    Logger.debug('Data fetched and cached', { 
      key, 
      fetchTime,
      dataSize: JSON.stringify(data).length 
    })
    
    return data
  }

  private async refreshInBackground<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number
  ): Promise<void> {
    try {
      await this.fetchAndCache(key, fetcher, ttl)
    } catch (error) {
      // Background refresh failures are logged but don't throw
      Logger.error('Background refresh failed', { key, error })
    }
  }

  private clearExpired(): void {
    const now = Date.now()
    let cleared = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleared++
      }
    }
    
    if (cleared > 0) {
      Logger.debug('Expired entries cleared', { count: cleared })
    }
  }

  private ensureSpaceAvailable(): void {
    if (this.cache.size >= this.DEFAULT_MAX_SIZE) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
        Logger.debug('Evicted oldest cache entry', { key: oldestKey })
      }
    }
  }
}

// Export singleton instance
export const apiCache = APICache.getInstance()

/**
 * Cache configuration presets for different data types
 */
export const CachePresets = {
  // Static data that rarely changes
  STATIC: { ttl: 60 * 60 * 1000, staleWhileRevalidate: true }, // 1 hour
  
  // Real-time data that changes frequently  
  REALTIME: { ttl: 30 * 1000, staleWhileRevalidate: true }, // 30 seconds
  
  // User-specific data
  USER_DATA: { ttl: 5 * 60 * 1000, staleWhileRevalidate: true }, // 5 minutes
  
  // Farm/field data
  FARM_DATA: { ttl: 10 * 60 * 1000, staleWhileRevalidate: true }, // 10 minutes
  
  // Weather data
  WEATHER: { ttl: 15 * 60 * 1000, staleWhileRevalidate: true }, // 15 minutes
  
  // Satellite imagery and analysis
  SATELLITE: { ttl: 30 * 60 * 1000, staleWhileRevalidate: true }, // 30 minutes
  
  // Market/pricing data
  MARKET: { ttl: 2 * 60 * 1000, staleWhileRevalidate: true }, // 2 minutes
} as const

/**
 * Generate cache key for API requests
 */
export function generateCacheKey(
  endpoint: string, 
  params?: Record<string, any>
): string {
  const baseKey = endpoint.replace(/^\//, '').replace(/\//g, ':')
  
  if (!params || Object.keys(params).length === 0) {
    return baseKey
  }
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&')
    
  return `${baseKey}?${sortedParams}`
}