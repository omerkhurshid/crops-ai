/**
 * Performance Optimization Utilities
 * Advanced caching, memoization, and performance monitoring
 */

import { cache, CacheKeys, CacheTTL, CacheTags } from '../cache/redis-client'

/**
 * Memoization decorator for expensive function calls
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string,
  ttl: number = CacheTTL.FARM_DATA
): T {
  const cache = new Map<string, { value: ReturnType<T>, expires: number }>()

  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args)
    const now = Date.now()
    const cached = cache.get(key)

    if (cached && now < cached.expires) {
      return cached.value
    }

    const result = fn(...args)
    cache.set(key, {
      value: result,
      expires: now + (ttl * 1000)
    })

    return result
  }) as T
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): T {
  let inThrottle: boolean

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

/**
 * Cache-aware API wrapper
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    tags?: string[]
    forceRefresh?: boolean
  } = {}
): Promise<T> {
  const { ttl = CacheTTL.FARM_DATA, tags = [], forceRefresh = false } = options

  if (!forceRefresh) {
    const cached = await cache.get<T>(key)
    if (cached !== null) {
      return cached
    }
  }

  const result = await fetcher()
  await cache.set(key, result, { ttl, tags })
  return result
}

/**
 * Batch API requests to reduce round trips
 */
export class BatchProcessor<T, R> {
  private batch: T[] = []
  private promises: Array<{ resolve: (value: R) => void, reject: (error: Error) => void }> = []
  private timeoutId: NodeJS.Timeout | null = null

  constructor(
    private processBatch: (items: T[]) => Promise<R[]>,
    private batchSize: number = 10,
    private maxWaitTime: number = 100
  ) {}

  async add(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.batch.push(item)
      this.promises.push({ resolve, reject })

      if (this.batch.length >= this.batchSize) {
        this.processPending()
      } else if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => this.processPending(), this.maxWaitTime)
      }
    })
  }

  private async processPending() {
    if (this.batch.length === 0) return

    const currentBatch = [...this.batch]
    const currentPromises = [...this.promises]
    
    this.batch = []
    this.promises = []
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    try {
      const results = await this.processBatch(currentBatch)
      currentPromises.forEach((promise, index) => {
        promise.resolve(results[index])
      })
    } catch (error) {
      currentPromises.forEach(promise => {
        promise.reject(error as Error)
      })
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>()
  private static metrics = new Map<string, { count: number, totalTime: number, avgTime: number }>()

  static startTimer(label: string): void {
    this.timers.set(label, Date.now())
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label)
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(label)

    // Update metrics
    const existing = this.metrics.get(label) || { count: 0, totalTime: 0, avgTime: 0 }
    existing.count++
    existing.totalTime += duration
    existing.avgTime = existing.totalTime / existing.count
    this.metrics.set(label, existing)

    return duration
  }

  static getMetrics(label?: string) {
    if (label) {
      return this.metrics.get(label)
    }
    return Object.fromEntries(this.metrics.entries())
  }

  static clearMetrics(): void {
    this.metrics.clear()
    this.timers.clear()
  }
}

/**
 * Resource preloading utilities
 */
export class ResourcePreloader {
  private static preloadCache = new Set<string>()

  static async preloadData<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { priority?: 'high' | 'low', ttl?: number } = {}
  ): Promise<void> {
    if (this.preloadCache.has(key)) return

    this.preloadCache.add(key)

    try {
      const result = await fetcher()
      await cache.set(key, result, { ttl: options.ttl || CacheTTL.FARM_DATA })
    } catch (error) {
      console.warn(`Preload failed for ${key}:`, error)
      this.preloadCache.delete(key)
    }
  }

  static preloadCriticalData(farmId: string): Promise<void[]> {
    return Promise.all([
      this.preloadData(CacheKeys.farmData(farmId), async () => {
        // This would fetch from your API
        const response = await fetch(`/api/farms/${farmId}`)
        return response.json()
      }),
      this.preloadData(CacheKeys.financialSummary(farmId, 'current'), async () => {
        const response = await fetch(`/api/financial/summary?farmId=${farmId}`)
        return response.json()
      }),
      this.preloadData(CacheKeys.nbaRecommendations(farmId), async () => {
        const response = await fetch(`/api/nba/recommendations?farmId=${farmId}`)
        return response.json()
      })
    ])
  }
}

/**
 * Image optimization utilities
 */
export class ImageOptimizer {
  static getOptimizedImageUrl(
    originalUrl: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'auto'
    } = {}
  ): string {
    if (!originalUrl) return originalUrl

    const { width, height, quality = 80, format = 'auto' } = options
    
    // If using Next.js Image optimization
    const params = new URLSearchParams()
    if (width) params.append('w', width.toString())
    if (height) params.append('h', height.toString())
    params.append('q', quality.toString())
    if (format !== 'auto') params.append('f', format)
    
    return `/_next/image?url=${encodeURIComponent(originalUrl)}&${params.toString()}`
  }

  static async preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }
}

/**
 * Database query optimization
 */
export class QueryOptimizer {
  private static queryCache = new Map<string, any>()

  static async optimizedQuery<T>(
    queryFn: () => Promise<T>,
    cacheKey: string,
    options: {
      ttl?: number
      tags?: string[]
      staleWhileRevalidate?: boolean
    } = {}
  ): Promise<T> {
    const { ttl = CacheTTL.FARM_DATA, tags = [], staleWhileRevalidate = false } = options

    // Check cache first
    let cached = await cache.get<T>(cacheKey)
    
    if (cached !== null) {
      if (staleWhileRevalidate) {
        // Return cached data immediately, refresh in background
        queryFn().then(fresh => cache.set(cacheKey, fresh, { ttl, tags }))
      }
      return cached
    }

    // Execute query and cache result
    const result = await queryFn()
    await cache.set(cacheKey, result, { ttl, tags })
    return result
  }

  static async batchQueries<T>(
    queries: Array<() => Promise<T>>,
    maxConcurrency: number = 5
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < queries.length; i += maxConcurrency) {
      const batch = queries.slice(i, i + maxConcurrency)
      const batchResults = await Promise.all(batch.map(query => query()))
      results.push(...batchResults)
    }
    
    return results
  }
}

/**
 * Component performance optimization hooks
 */
export function usePerformanceOptimization() {
  return {
    memoize,
    debounce,
    throttle,
    preloadCriticalData: ResourcePreloader.preloadCriticalData,
    startTimer: PerformanceMonitor.startTimer,
    endTimer: PerformanceMonitor.endTimer,
    getMetrics: PerformanceMonitor.getMetrics
  }
}