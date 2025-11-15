/**
 * Simple environment configuration without validation
 * This prevents startup issues while maintaining functionality
 */

export function getConfig() {
  return {
    COPERNICUS_CLIENT_ID: process.env.COPERNICUS_CLIENT_ID || '',
    COPERNICUS_CLIENT_SECRET: process.env.COPERNICUS_CLIENT_SECRET || '',
    GOOGLE_EARTH_ENGINE_PRIVATE_KEY: process.env.GOOGLE_EARTH_ENGINE_PRIVATE_KEY || '',
    GOOGLE_EARTH_ENGINE_CLIENT_EMAIL: process.env.GOOGLE_EARTH_ENGINE_CLIENT_EMAIL || '',
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  }
}

export const config = getConfig()
export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'