/**
 * Centralized Environment Configuration
 * Validates and exposes environment variables safely
 */

import { Logger } from '@crops-ai/shared'

interface EnvironmentConfig {
  // App Configuration
  NODE_ENV: 'development' | 'production' | 'test'
  NEXT_PUBLIC_APP_VERSION: string
  
  // Authentication
  NEXTAUTH_SECRET: string
  
  // Database
  DATABASE_URL: string
  
  // Redis
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
  
  // External APIs
  OPENWEATHER_API_KEY: string
  GOOGLE_MAPS_API_KEY: string
  
  // Optional APIs
  ALPHA_VANTAGE_API_KEY?: string
  CME_API_KEY?: string
  RESEND_API_KEY?: string
  
  // Alerting
  ALERT_WEBHOOK_URL?: string
  SLACK_CHANNEL?: string
  ALERT_EMAIL_RECIPIENTS?: string
  DISCORD_WEBHOOK_URL?: string
  
  // Email
  EMAIL_FROM?: string
  
  // Demo Configuration
  ENABLE_DEMO_USERS?: string
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator
  private _config: EnvironmentConfig | null = null

  private constructor() {}

  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator()
    }
    return EnvironmentValidator.instance
  }

  /**
   * Validate and load environment configuration
   * Throws error if required variables are missing
   */
  validateAndLoad(): EnvironmentConfig {
    if (this._config) {
      return this._config
    }

    const errors: string[] = []
    
    // Required variables
    const requiredVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
    }

    // Check required variables
    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value || value.trim() === '') {
        errors.push(`Missing required environment variable: ${key}`)
      }
    }

    // Validate NODE_ENV
    if (requiredVars.NODE_ENV && !['development', 'production', 'test'].includes(requiredVars.NODE_ENV)) {
      errors.push('NODE_ENV must be one of: development, production, test')
    }

    // Validate NEXTAUTH_SECRET length
    if (requiredVars.NEXTAUTH_SECRET && requiredVars.NEXTAUTH_SECRET.length < 32) {
      errors.push('NEXTAUTH_SECRET must be at least 32 characters long')
    }

    // Validate Redis URL format
    if (requiredVars.UPSTASH_REDIS_REST_URL && !requiredVars.UPSTASH_REDIS_REST_URL.startsWith('https://')) {
      errors.push('UPSTASH_REDIS_REST_URL must be a valid HTTPS URL')
    }

    // Production-specific validations
    if (requiredVars.NODE_ENV === 'production') {
      if (process.env.ENABLE_DEMO_USERS === 'true') {
        errors.push('Demo users cannot be enabled in production')
      }
    }

    if (errors.length > 0) {
      const errorMessage = `Environment validation failed:\n${errors.join('\n')}`
      Logger.error('Environment validation failed', new Error(errorMessage))
      throw new Error(errorMessage)
    }

    // Build validated config
    this._config = {
      NODE_ENV: requiredVars.NODE_ENV as 'development' | 'production' | 'test',
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      NEXTAUTH_SECRET: requiredVars.NEXTAUTH_SECRET!,
      DATABASE_URL: requiredVars.DATABASE_URL!,
      UPSTASH_REDIS_REST_URL: requiredVars.UPSTASH_REDIS_REST_URL!,
      UPSTASH_REDIS_REST_TOKEN: requiredVars.UPSTASH_REDIS_REST_TOKEN!,
      OPENWEATHER_API_KEY: requiredVars.OPENWEATHER_API_KEY!,
      GOOGLE_MAPS_API_KEY: requiredVars.GOOGLE_MAPS_API_KEY!,
      
      // Optional variables
      ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
      CME_API_KEY: process.env.CME_API_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      ALERT_WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL,
      SLACK_CHANNEL: process.env.SLACK_CHANNEL,
      ALERT_EMAIL_RECIPIENTS: process.env.ALERT_EMAIL_RECIPIENTS,
      DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
      EMAIL_FROM: process.env.EMAIL_FROM,
      ENABLE_DEMO_USERS: process.env.ENABLE_DEMO_USERS
    }

    Logger.info('Environment configuration validated successfully', {
      nodeEnv: this._config.NODE_ENV,
      hasRequiredVars: true,
      optionalVarsCount: Object.values(this._config).filter(v => v === undefined).length
    })

    return this._config
  }

  /**
   * Get validated configuration
   * Validates on first access
   */
  getConfig(): EnvironmentConfig {
    return this.validateAndLoad()
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.getConfig().NODE_ENV === 'production'
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.getConfig().NODE_ENV === 'development'
  }

  /**
   * Check if running in test
   */
  isTest(): boolean {
    return this.getConfig().NODE_ENV === 'test'
  }

  /**
   * Get a safe configuration summary for logging
   * Excludes sensitive values
   */
  getConfigSummary() {
    const config = this.getConfig()
    return {
      NODE_ENV: config.NODE_ENV,
      NEXT_PUBLIC_APP_VERSION: config.NEXT_PUBLIC_APP_VERSION,
      hasNextAuthSecret: !!config.NEXTAUTH_SECRET,
      hasDatabaseUrl: !!config.DATABASE_URL,
      hasRedisConfig: !!(config.UPSTASH_REDIS_REST_URL && config.UPSTASH_REDIS_REST_TOKEN),
      hasOpenWeatherKey: !!config.OPENWEATHER_API_KEY,
      hasGoogleMapsKey: !!config.GOOGLE_MAPS_API_KEY,
      optionalApiKeys: {
        alphaVantage: !!config.ALPHA_VANTAGE_API_KEY,
        cme: !!config.CME_API_KEY,
        resend: !!config.RESEND_API_KEY
      },
      alertingConfigured: !!(config.ALERT_WEBHOOK_URL || config.SLACK_CHANNEL || config.DISCORD_WEBHOOK_URL)
    }
  }
}

// Export singleton instance
export const envValidator = EnvironmentValidator.getInstance()

// Export config getter for convenience
export const getConfig = () => envValidator.getConfig()

// Export environment checks
export const isProduction = () => envValidator.isProduction()
export const isDevelopment = () => envValidator.isDevelopment()
export const isTest = () => envValidator.isTest()