// Monitoring and error tracking utilities

export interface LogContext {
  userId?: string
  farmId?: string
  fieldId?: string
  sessionId?: string
  requestId?: string
  [key: string]: any
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export class Logger {
  private static context: LogContext = {}

  static setContext(context: LogContext): void {
    Logger.context = { ...Logger.context, ...context }
  }

  static clearContext(): void {
    Logger.context = {}
  }

  static debug(message: string, data?: any): void {
    Logger.log(LogLevel.DEBUG, message, data)
  }

  static info(message: string, data?: any): void {
    Logger.log(LogLevel.INFO, message, data)
  }

  static warn(message: string, data?: any): void {
    Logger.log(LogLevel.WARN, message, data)
  }

  static error(message: string, error?: Error | any, data?: any): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...data
    } : { error, ...data }
    
    Logger.log(LogLevel.ERROR, message, errorData)
  }

  static fatal(message: string, error?: Error | any, data?: any): void {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...data
    } : { error, ...data }
    
    Logger.log(LogLevel.FATAL, message, errorData)
  }

  private static log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      context: Logger.context,
      data
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === LogLevel.ERROR || level === LogLevel.FATAL ? 'error' :
                           level === LogLevel.WARN ? 'warn' : 'log'
      console[consoleMethod](`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '')
    }

    // In production, this would be sent to your logging service
    // (Sentry, CloudWatch, DataDog, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Send to external logging service
      Logger.sendToLoggingService(logEntry)
    }
  }

  private static sendToLoggingService(logEntry: any): void {
    // Implementation for sending logs to external service
    // This will be implemented when we add Sentry or other monitoring
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()

  static startTimer(label: string): void {
    PerformanceMonitor.timers.set(label, Date.now())
  }

  static endTimer(label: string): number {
    const startTime = PerformanceMonitor.timers.get(label)
    if (!startTime) {
      Logger.warn(`Timer '${label}' was not started`)
      return 0
    }

    const duration = Date.now() - startTime
    PerformanceMonitor.timers.delete(label)
    
    Logger.info(`Performance: ${label}`, { duration })
    return duration
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    PerformanceMonitor.startTimer(label)
    try {
      const result = await fn()
      PerformanceMonitor.endTimer(label)
      return result
    } catch (error) {
      PerformanceMonitor.endTimer(label)
      throw error
    }
  }

  static measure<T>(label: string, fn: () => T): T {
    PerformanceMonitor.startTimer(label)
    try {
      const result = fn()
      PerformanceMonitor.endTimer(label)
      return result
    } catch (error) {
      PerformanceMonitor.endTimer(label)
      throw error
    }
  }
}

// Error tracking utilities
export class ErrorTracker {
  static captureException(error: Error, context?: LogContext): void {
    Logger.error('Exception captured', error, context)
    
    // In production, send to Sentry or other error tracking service
    if (process.env.NODE_ENV === 'production') {
      ErrorTracker.sendToErrorService(error, context)
    }
  }

  static captureMessage(message: string, level: LogLevel = LogLevel.INFO, context?: LogContext): void {
    // Use the public methods instead of private log method
    switch (level) {
      case LogLevel.DEBUG:
        Logger.debug(message, context)
        break
      case LogLevel.INFO:
        Logger.info(message, context)
        break
      case LogLevel.WARN:
        Logger.warn(message, context)
        break
      case LogLevel.ERROR:
        Logger.error(message, undefined, context)
        break
      case LogLevel.FATAL:
        Logger.fatal(message, undefined, context)
        break
      default:
        Logger.info(message, context)
    }
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      ErrorTracker.sendMessageToErrorService(message, level, context)
    }
  }

  private static sendToErrorService(error: Error, context?: LogContext): void {
    // Implementation for sending errors to Sentry
    // This will be implemented when we add Sentry SDK
  }

  private static sendMessageToErrorService(message: string, level: LogLevel, context?: LogContext): void {
    // Implementation for sending messages to error tracking service
    // This will be implemented when we add Sentry SDK
  }
}

// API response time tracking
export function withMetrics<T extends (...args: any[]) => any>(
  fn: T,
  metricName: string
): T {
  return ((...args: any[]) => {
    return PerformanceMonitor.measure(metricName, () => fn(...args))
  }) as T
}

export function withAsyncMetrics<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  metricName: string
): T {
  return ((...args: any[]) => {
    return PerformanceMonitor.measureAsync(metricName, () => fn(...args))
  }) as T
}