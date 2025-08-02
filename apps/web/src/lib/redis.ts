import { Redis } from '@upstash/redis';

// Create Redis instance with environment variables
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

// Utility functions for common Redis operations
export class RedisManager {
  /**
   * Set a key-value pair with optional expiration
   */
  static async set(key: string, value: any, options?: { ex?: number; nx?: boolean }): Promise<string | null> {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn('[Upstash Redis] Redis client was initialized without url or token. Failed to execute command.');
        return null;
      }
      
      // Handle Redis SET options properly
      if (options) {
        const setOptions: any = {};
        if (options.ex) setOptions.ex = options.ex;
        if (options.nx) setOptions.nx = options.nx;
        return await redis.set(key, JSON.stringify(value), setOptions);
      }
      
      return await redis.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Redis SET error:', error);
      return null;
    }
  }

  /**
   * Get a value by key
   */
  static async get(key: string): Promise<any> {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn('[Upstash Redis] Redis client was initialized without url or token. Failed to execute command.');
        return null;
      }
      
      const value = await redis.get(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Delete a key
   */
  static async del(key: string): Promise<number> {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return 0;
      }
      
      return await redis.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return false;
      }
      
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Set expiration on a key
   */
  static async expire(key: string, seconds: number): Promise<boolean> {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return false;
      }
      
      const result = await redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  /**
   * Increment a numeric value
   */
  static async incr(key: string): Promise<number> {
    try {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return 0;
      }
      
      return await redis.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 0;
    }
  }
}

// For backwards compatibility, export the Redis instance directly
export default redis;