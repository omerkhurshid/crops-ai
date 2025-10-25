/**
 * Tests for Enhanced Cache System
 */

import { EnhancedCache, enhancedCache } from '../enhanced-cache'

describe('EnhancedCache', () => {
  let cache: EnhancedCache

  beforeEach(() => {
    cache = new EnhancedCache()
  })

  afterEach(() => {
    cache.clear()
    cache.destroy()
  })

  describe('Basic Cache Operations', () => {
    it('should store and retrieve data', () => {
      const testData = { test: 'value' }
      cache.set('test-key', testData)
      
      const retrieved = cache.get('test-key')
      expect(retrieved).toEqual(testData)
    })

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent')
      expect(result).toBeNull()
    })

    it('should respect TTL expiration', async () => {
      const testData = { test: 'value' }
      cache.set('test-key', testData, { ttl: 100 }) // 100ms TTL
      
      // Should be available immediately
      expect(cache.get('test-key')).toEqual(testData)
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Should be expired
      expect(cache.get('test-key')).toBeNull()
    })

    it('should delete specific keys', () => {
      cache.set('test-key', { test: 'value' })
      expect(cache.get('test-key')).toBeTruthy()
      
      const deleted = cache.delete('test-key')
      expect(deleted).toBe(true)
      expect(cache.get('test-key')).toBeNull()
    })

    it('should clear all cache', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      cache.clear()
      
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('Tag-based Cache Invalidation', () => {
    it('should clear cache by tags', () => {
      cache.set('user1', { name: 'John' }, { tags: ['user', 'profile'] })
      cache.set('user2', { name: 'Jane' }, { tags: ['user', 'admin'] })
      cache.set('weather1', { temp: 25 }, { tags: ['weather'] })
      
      const cleared = cache.clearByTags(['user'])
      
      expect(cleared).toBe(2)
      expect(cache.get('user1')).toBeNull()
      expect(cache.get('user2')).toBeNull()
      expect(cache.get('weather1')).toBeTruthy()
    })
  })

  describe('Weather Data Caching', () => {
    it('should cache and retrieve weather data', () => {
      const weatherData = { temperature: 25, humidity: 60 }
      const location = 'test-location'
      
      cache.cacheWeatherData(location, weatherData, 'current')
      
      const retrieved = cache.getWeatherData(location, 'current')
      expect(retrieved).toEqual(weatherData)
    })

    it('should use appropriate TTL for different weather types', () => {
      const location = 'test-location'
      const data = { temp: 25 }
      
      cache.cacheWeatherData(location, data, 'current')
      cache.cacheWeatherData(location, data, 'forecast')
      cache.cacheWeatherData(location, data, 'historical')
      
      // All should be immediately available
      expect(cache.getWeatherData(location, 'current')).toEqual(data)
      expect(cache.getWeatherData(location, 'forecast')).toEqual(data)
      expect(cache.getWeatherData(location, 'historical')).toEqual(data)
    })
  })

  describe('User Data Caching', () => {
    it('should cache user profile data', () => {
      const userData = { id: '1', name: 'John Doe' }
      const userId = 'user123'
      
      cache.cacheUserData(userId, userData, 'profile')
      
      const retrieved = cache.getUserData(userId, 'profile')
      expect(retrieved).toEqual(userData)
    })

    it('should handle different user data types', () => {
      const userId = 'user123'
      const profileData = { name: 'John' }
      const preferencesData = { theme: 'dark' }
      const dashboardData = { widgets: ['weather'] }
      
      cache.cacheUserData(userId, profileData, 'profile')
      cache.cacheUserData(userId, preferencesData, 'preferences')
      cache.cacheUserData(userId, dashboardData, 'dashboard')
      
      expect(cache.getUserData(userId, 'profile')).toEqual(profileData)
      expect(cache.getUserData(userId, 'preferences')).toEqual(preferencesData)
      expect(cache.getUserData(userId, 'dashboard')).toEqual(dashboardData)
    })
  })

  describe('ML Prediction Caching', () => {
    it('should cache ML predictions', () => {
      const prediction = { result: 'healthy', confidence: 0.95 }
      const modelId = 'disease-model-v1'
      const inputHash = 'hash123'
      
      cache.cacheMLPrediction(modelId, inputHash, prediction, 'disease')
      
      const retrieved = cache.getMLPrediction(modelId, inputHash, 'disease')
      expect(retrieved).toEqual(prediction)
    })

    it('should handle different ML prediction types', () => {
      const modelId = 'test-model'
      const inputHash = 'hash123'
      const diseaseData = { disease: 'none' }
      const yieldData = { yield: 180 }
      const weatherData = { alert: 'frost' }
      
      cache.cacheMLPrediction(modelId, inputHash, diseaseData, 'disease')
      cache.cacheMLPrediction(modelId, inputHash, yieldData, 'yield')
      cache.cacheMLPrediction(modelId, inputHash, weatherData, 'weather')
      
      expect(cache.getMLPrediction(modelId, inputHash, 'disease')).toEqual(diseaseData)
      expect(cache.getMLPrediction(modelId, inputHash, 'yield')).toEqual(yieldData)
      expect(cache.getMLPrediction(modelId, inputHash, 'weather')).toEqual(weatherData)
    })
  })

  describe('Cache-aside Pattern', () => {
    it('should fetch data when not cached', async () => {
      const fetchFunction = jest.fn().mockResolvedValue({ data: 'fresh' })
      
      const result = await cache.getOrFetch('test-key', fetchFunction)
      
      expect(fetchFunction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ data: 'fresh' })
      expect(cache.get('test-key')).toEqual({ data: 'fresh' })
    })

    it('should return cached data without fetching', async () => {
      const cachedData = { data: 'cached' }
      const fetchFunction = jest.fn().mockResolvedValue({ data: 'fresh' })
      
      cache.set('test-key', cachedData)
      
      const result = await cache.getOrFetch('test-key', fetchFunction)
      
      expect(fetchFunction).not.toHaveBeenCalled()
      expect(result).toEqual(cachedData)
    })
  })

  describe('Stale-while-revalidate Pattern', () => {
    it('should return fresh data when not cached', async () => {
      const fetchFunction = jest.fn().mockResolvedValue({ data: 'fresh' })
      
      const result = await cache.getStaleWhileRevalidate('test-key', fetchFunction, { ttl: 1000 })
      
      expect(fetchFunction).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ data: 'fresh' })
    })

    it('should return cached data when fresh', async () => {
      const cachedData = { data: 'cached' }
      const fetchFunction = jest.fn().mockResolvedValue({ data: 'fresh' })
      
      cache.set('test-key', cachedData, { ttl: 10000 }) // Long TTL
      
      const result = await cache.getStaleWhileRevalidate('test-key', fetchFunction, { 
        ttl: 10000, 
        staleTime: 5000 
      })
      
      expect(fetchFunction).not.toHaveBeenCalled()
      expect(result).toEqual(cachedData)
    })
  })

  describe('Cache Statistics', () => {
    it('should provide cache statistics', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      const stats = cache.getStats()
      
      expect(stats.total).toBe(2)
      expect(stats.active).toBe(2)
      expect(stats.expired).toBe(0)
      expect(typeof stats.memoryUsage).toBe('string')
      expect(typeof stats.hitRate).toBe('number')
    })
  })

  describe('Satellite Data Caching', () => {
    it('should cache satellite data', () => {
      const satelliteData = { ndvi: 0.8, date: '2024-01-01' }
      const fieldId = 'field123'
      const date = '2024-01-01'
      
      cache.cacheSatelliteData(fieldId, date, satelliteData)
      
      const retrieved = cache.getSatelliteData(fieldId, date)
      expect(retrieved).toEqual(satelliteData)
    })
  })

  describe('TTL Constants', () => {
    it('should have appropriate TTL values', () => {
      expect(EnhancedCache.TTL.WEATHER_CURRENT).toBe(30 * 60 * 1000) // 30 minutes
      expect(EnhancedCache.TTL.SATELLITE_CURRENT).toBe(60 * 60 * 1000) // 1 hour
      expect(EnhancedCache.TTL.USER_DASHBOARD).toBe(5 * 60 * 1000) // 5 minutes
      expect(EnhancedCache.TTL.ML_PREDICTIONS).toBe(30 * 60 * 1000) // 30 minutes
    })
  })
})

describe('Singleton enhancedCache', () => {
  afterEach(() => {
    enhancedCache.clear()
  })

  it('should be available as singleton', () => {
    expect(enhancedCache).toBeDefined()
    expect(enhancedCache).toBeInstanceOf(EnhancedCache)
  })

  it('should maintain state across calls', () => {
    enhancedCache.set('test', { value: 'persistent' })
    
    expect(enhancedCache.get('test')).toEqual({ value: 'persistent' })
  })
})