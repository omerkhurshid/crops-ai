import { Redis } from '@upstash/redis';
import { getConfig } from './config/environment';
import { Logger } from '@crops-ai/shared';

// Get validated configuration
const config = getConfig();

// Create Redis instance with validated environment variables
export const redis = new Redis({
  url: config.UPSTASH_REDIS_REST_URL,
  token: config.UPSTASH_REDIS_REST_TOKEN
});

// Utility functions for common Redis operations
export class RedisManager {
  /**
   * Set a key-value pair with optional expiration
   */
  static async set(key: string, value: any, options?: { ex?: number; nx?: boolean }): Promise<string | null> {
    try {
      // Handle Redis SET options properly
      if (options) {
        const setOptions: any = {};
        if (options.ex) setOptions.ex = options.ex;
        if (options.nx) setOptions.nx = options.nx;
        return await redis.set(key, JSON.stringify(value), setOptions);
      }
      
      return await redis.set(key, JSON.stringify(value));
    } catch (error) {
      Logger.error('Redis SET error', error, { key });
      return null;
    }
  }

  /**
   * Get a value by key
   */
  static async get(key: string): Promise<any> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      Logger.error('Redis GET error', error, { key });
      return null;
    }
  }

  /**
   * Delete a key
   */
  static async del(key: string): Promise<number> {
    try {
      return await redis.del(key);
    } catch (error) {
      Logger.error('Redis DEL error', error, { key });
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      Logger.error('Redis EXISTS error', error, { key });
      return false;
    }
  }

  /**
   * Set expiration on a key
   */
  static async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await redis.expire(key, seconds);
      return result === 1;
    } catch (error) {
      Logger.error('Redis EXPIRE error', error, { key, seconds });
      return false;
    }
  }

  /**
   * Increment a numeric value
   */
  static async incr(key: string): Promise<number> {
    try {
      return await redis.incr(key);
    } catch (error) {
      Logger.error('Redis INCR error', error, { key });
      return 0;
    }
  }
}

// For backwards compatibility, export the Redis instance directly
export default redis;