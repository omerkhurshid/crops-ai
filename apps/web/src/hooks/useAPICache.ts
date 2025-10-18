/**
 * React Hook for API Caching
 * Provides a React-friendly interface to the API cache system
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiCache, CachePresets, generateCacheKey, type CacheOptions } from '../lib/cache/api-cache'
// Logger replaced with console for local development

interface UseAPICacheOptions<T> extends CacheOptions {
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  retryOnError?: boolean
  retryCount?: number
  retryDelay?: number
}

interface UseAPICacheResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  invalidate: () => void
  prefetch: () => Promise<void>
}

/**
 * Hook for cached API calls with React state management
 */
export function useAPICache<T>(
  key: string | null,
  fetcher: (() => Promise<T>) | null,
  options: UseAPICacheOptions<T> = {}
): UseAPICacheResult<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    retryOnError = true,
    retryCount = 3,
    retryDelay = 1000,
    ...cacheOptions
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (): Promise<void> => {
    if (!key || !fetcher || !enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await apiCache.get(key, fetcher, cacheOptions)
      
      if (mountedRef.current) {
        setData(result)
        setError(null)
        retryCountRef.current = 0
        onSuccess?.(result)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      
      if (mountedRef.current) {
        setError(error)
        onError?.(error)
        
        // Retry logic
        if (retryOnError && retryCountRef.current < retryCount) {
          retryCountRef.current += 1
          console.warn('Retrying API call', { 
            key, 
            attempt: retryCountRef.current, 
            maxRetries: retryCount 
          })
          
          setTimeout(() => {
            if (mountedRef.current) {
              fetchData()
            }
          }, retryDelay * retryCountRef.current)
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [key, fetcher, enabled, cacheOptions, onSuccess, onError, retryOnError, retryCount, retryDelay])

  const invalidate = useCallback(() => {
    if (key) {
      apiCache.invalidate(key)
      setData(null)
    }
  }, [key])

  const prefetch = useCallback(async (): Promise<void> => {
    if (key && fetcher) {
      await apiCache.prefetch(key, fetcher, cacheOptions.ttl)
    }
  }, [key, fetcher, cacheOptions.ttl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate,
    prefetch
  }
}

/**
 * Hook for cached farm data
 */
export function useCachedFarmData(farmId: string | null) {
  return useAPICache(
    farmId ? generateCacheKey('/api/farms/:id', { id: farmId }) : null,
    farmId ? () => fetch(`/api/farms/${farmId}`).then(res => res.json()) : null,
    CachePresets.FARM_DATA
  )
}

/**
 * Hook for cached weather data
 */
export function useCachedWeatherData(farmId: string | null) {
  return useAPICache(
    farmId ? generateCacheKey('/api/weather/current', { farmId }) : null,
    farmId ? () => fetch(`/api/weather/current?farmId=${farmId}`).then(res => res.json()) : null,
    CachePresets.WEATHER
  )
}

/**
 * Hook for cached crop data
 */
export function useCachedCropData(farmId: string | null) {
  return useAPICache(
    farmId ? generateCacheKey('/api/crops', { farmId }) : null,
    farmId ? () => fetch(`/api/crops?farmId=${farmId}`).then(res => res.json()) : null,
    CachePresets.FARM_DATA
  )
}

/**
 * Hook for cached livestock data
 */
export function useCachedLivestockData(farmId: string | null) {
  return useAPICache(
    farmId ? generateCacheKey('/api/livestock', { farmId }) : null,
    farmId ? () => fetch(`/api/livestock?farmId=${farmId}`).then(res => res.json()) : null,
    CachePresets.FARM_DATA
  )
}

/**
 * Hook for cached task data
 */
export function useCachedTaskData(farmId: string | null) {
  return useAPICache(
    farmId ? generateCacheKey('/api/tasks', { farmId }) : null,
    farmId ? () => fetch(`/api/tasks?farmId=${farmId}`).then(res => res.json()) : null,
    CachePresets.USER_DATA
  )
}

/**
 * Hook for cached satellite data
 */
export function useCachedSatelliteData(farmId: string | null, fieldId?: string) {
  const params = fieldId ? { farmId, fieldId } : { farmId }
  
  return useAPICache(
    farmId ? generateCacheKey('/api/satellite/analysis', params) : null,
    farmId ? () => {
      const url = fieldId 
        ? `/api/satellite/analysis?farmId=${farmId}&fieldId=${fieldId}`
        : `/api/satellite/analysis?farmId=${farmId}`
      return fetch(url).then(res => res.json())
    } : null,
    CachePresets.SATELLITE
  )
}

/**
 * Hook for cached market data
 */
export function useCachedMarketData(commodities: string[] = []) {
  const key = commodities.length > 0 
    ? generateCacheKey('/api/market/prices', { commodities: commodities.sort() })
    : null
    
  return useAPICache(
    key,
    commodities.length > 0 ? () => {
      const params = new URLSearchParams()
      commodities.forEach(c => params.append('commodity', c))
      return fetch(`/api/market/prices?${params}`).then(res => res.json())
    } : null,
    CachePresets.MARKET
  )
}

/**
 * Hook to prefetch multiple data sources
 */
export function usePrefetchFarmData(farmId: string | null) {
  const farmData = useCachedFarmData(farmId)
  const weatherData = useCachedWeatherData(farmId)
  const cropData = useCachedCropData(farmId)
  const taskData = useCachedTaskData(farmId)

  const prefetchAll = useCallback(async () => {
    if (!farmId) return
    
    await Promise.allSettled([
      farmData.prefetch(),
      weatherData.prefetch(),
      cropData.prefetch(),
      taskData.prefetch()
    ])
  }, [farmId, farmData, weatherData, cropData, taskData])

  return { prefetchAll }
}

/**
 * Hook to invalidate related cache entries
 */
export function useCacheInvalidation() {
  const invalidateFarmData = useCallback((farmId: string) => {
    apiCache.invalidatePattern(`farms.*${farmId}`)
    apiCache.invalidatePattern(`weather.*${farmId}`)
    apiCache.invalidatePattern(`crops.*${farmId}`)
    apiCache.invalidatePattern(`tasks.*${farmId}`)
    apiCache.invalidatePattern(`livestock.*${farmId}`)
    apiCache.invalidatePattern(`satellite.*${farmId}`)
  }, [])

  const invalidateWeatherData = useCallback(() => {
    apiCache.invalidatePattern('weather.*')
  }, [])

  const invalidateMarketData = useCallback(() => {
    apiCache.invalidatePattern('market.*')
  }, [])

  return {
    invalidateFarmData,
    invalidateWeatherData,
    invalidateMarketData,
    invalidateAll: apiCache.clear.bind(apiCache)
  }
}