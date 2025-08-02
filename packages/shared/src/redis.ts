import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache utility functions
export class CacheService {
  private static readonly DEFAULT_TTL = 3600 // 1 hour in seconds

  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data as T
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  static async set<T>(key: string, value: T, ttl: number = CacheService.DEFAULT_TTL): Promise<boolean> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  }

  static async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Redis DELETE error:', error)
      return false
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  }

  // Weather data caching
  static async cacheWeatherData(coordinates: { lat: number; lng: number }, data: any, ttl: number = 1800) {
    const key = `weather:${coordinates.lat}:${coordinates.lng}`
    return CacheService.set(key, data, ttl)
  }

  static async getCachedWeatherData(coordinates: { lat: number; lng: number }) {
    const key = `weather:${coordinates.lat}:${coordinates.lng}`
    return CacheService.get(key)
  }

  // Satellite data caching
  static async cacheSatelliteData(fieldId: string, data: any, ttl: number = 86400) { // 24 hours
    const key = `satellite:${fieldId}`
    return CacheService.set(key, data, ttl)
  }

  static async getCachedSatelliteData(fieldId: string) {
    const key = `satellite:${fieldId}`
    return CacheService.get(key)
  }

  // User session caching
  static async cacheUserSession(sessionId: string, userData: any, ttl: number = 86400) {
    const key = `session:${sessionId}`
    return CacheService.set(key, userData, ttl)
  }

  static async getCachedUserSession(sessionId: string) {
    const key = `session:${sessionId}`
    return CacheService.get(key)
  }
}

export { redis }