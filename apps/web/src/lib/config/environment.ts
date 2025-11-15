/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present and valid
 */

import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  DIRECT_URL: z.string().url('Invalid direct database URL').optional(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),
  
  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1, 'Google Maps API key is required'),
  
  // Optional services (with fallbacks)
  OPENWEATHER_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  
  // App configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),
})

export type EnvConfig = z.infer<typeof envSchema>

function validateEnvironment(): EnvConfig {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // During build time, just warn instead of throwing
      if (process.env.NODE_ENV === 'development') {
        const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
        console.warn(`Environment validation warnings:\n${missingVars}`)
        // Return partial environment for build time
        return envSchema.partial().parse(process.env) as EnvConfig
      }
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

// Validate environment variables at startup
export const env = validateEnvironment()

// Helper functions
export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

// Feature flags based on available services
export const features = {
  weather: !!env.OPENWEATHER_API_KEY,
  imageUpload: !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY),
  caching: !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  monitoring: !!env.SENTRY_DSN,
}

// Configuration object for easy access
export const config = {
  database: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  },
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  auth: {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
  },
  maps: {
    apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  weather: {
    apiKey: env.OPENWEATHER_API_KEY,
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  redis: {
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  },
  sentry: {
    dsn: env.SENTRY_DSN,
  },
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    env: env.NODE_ENV,
  },
  features,
}

// Runtime configuration check
export function getConfig() {
  return config
}