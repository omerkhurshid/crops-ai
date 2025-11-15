/**
 * Production-safe logging utility
 * Only logs in development, silent in production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args)
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, ...args)
  },
  
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment && process.env.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }
}