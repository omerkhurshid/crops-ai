// Logger replaced with console for local development

export interface LogContext {
  requestId?: string
  userId?: string
  userRole?: string
  operation?: string
  resourceType?: string
  resourceId?: string
  farmId?: string
  fieldId?: string
  ip?: string
  userAgent?: string
  duration?: number
  [key: string]: any
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: LogContext
  timestamp: string
  environment: string
  version: string
}

export class AppLogger {
  private static instance: AppLogger
  private context: LogContext = {}

  private constructor() {}

  static getInstance(): AppLogger {
    if (!AppLogger.instance) {
      AppLogger.instance = new AppLogger()
    }
    return AppLogger.instance
  }

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context }
  }

  clearContext() {
    this.context = {}
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    additionalContext?: LogContext
  ): LogEntry {
    return {
      level,
      message,
      context: { ...this.context, ...additionalContext },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0'
    }
  }

  debug(message: string, context?: LogContext) {
    const entry = this.createLogEntry('debug', message, context)

    this.sendToExternalServices(entry)
  }

  info(message: string, context?: LogContext) {
    const entry = this.createLogEntry('info', message, context)

    this.sendToExternalServices(entry)
  }

  warn(message: string, context?: LogContext) {
    const entry = this.createLogEntry('warn', message, context)

    this.sendToExternalServices(entry)
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error
    }
    
    const entry = this.createLogEntry('error', message, errorContext)

    this.sendToExternalServices(entry)
  }

  private sendToExternalServices(entry: LogEntry) {
    // In production, send to external logging services
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with services like:
      // - Sentry for error tracking
      // - DataDog for logging
      // - LogRocket for session replay
      // - PostHog for analytics
    }
  }

  // Specialized logging methods for common operations
  
  apiCall(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    this.info(`API ${method} ${path}`, {
      ...context,
      operation: 'api_call',
      method,
      path,
      statusCode,
      duration
    })
  }

  authentication(action: 'login' | 'logout' | 'register' | 'password_change', userId: string, context?: LogContext) {
    this.info(`User ${action}`, {
      ...context,
      operation: 'authentication',
      action,
      userId
    })
  }

  dataAccess(action: 'read' | 'write' | 'delete', resourceType: string, resourceId: string, context?: LogContext) {
    this.info(`Data ${action}: ${resourceType}`, {
      ...context,
      operation: 'data_access',
      action,
      resourceType,
      resourceId
    })
  }

  businessOperation(operation: string, context?: LogContext) {
    this.info(`Business operation: ${operation}`, {
      ...context,
      operation: 'business'
    })
  }

  security(event: string, context?: LogContext) {
    this.warn(`Security event: ${event}`, {
      ...context,
      operation: 'security'
    })
  }

  performance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug'
    this[level](`Performance: ${operation}`, {
      ...context,
      operation: 'performance',
      duration
    })
  }
}

// Export singleton instance
export const logger = AppLogger.getInstance()

// Specialized loggers for different domains
export class AuthLogger {
  static login(userId: string, context?: LogContext) {
    logger.authentication('login', userId, context)
  }

  static logout(userId: string, context?: LogContext) {
    logger.authentication('logout', userId, context)
  }

  static register(userId: string, context?: LogContext) {
    logger.authentication('register', userId, context)
  }

  static passwordChange(userId: string, context?: LogContext) {
    logger.authentication('password_change', userId, context)
  }

  static authFailure(reason: string, context?: LogContext) {
    logger.security(`Authentication failure: ${reason}`, context)
  }

  static accessDenied(userId: string, resource: string, context?: LogContext) {
    logger.security(`Access denied for user ${userId} to ${resource}`, {
      ...context,
      userId,
      resource
    })
  }
}

export class FarmLogger {
  static farmCreated(farmId: string, userId: string, context?: LogContext) {
    logger.businessOperation('farm_created', {
      ...context,
      farmId,
      userId,
      resourceType: 'farm',
      resourceId: farmId
    })
  }

  static farmUpdated(farmId: string, userId: string, context?: LogContext) {
    logger.businessOperation('farm_updated', {
      ...context,
      farmId,
      userId,
      resourceType: 'farm',
      resourceId: farmId
    })
  }

  static farmDeleted(farmId: string, userId: string, context?: LogContext) {
    logger.businessOperation('farm_deleted', {
      ...context,
      farmId,
      userId,
      resourceType: 'farm',
      resourceId: farmId
    })
  }

  static managerAdded(farmId: string, managerId: string, addedBy: string, context?: LogContext) {
    logger.businessOperation('farm_manager_added', {
      ...context,
      farmId,
      managerId,
      addedBy,
      resourceType: 'farm',
      resourceId: farmId
    })
  }

  static cropPlanted(farmId: string, fieldId: string, cropId: string, userId: string, context?: LogContext) {
    logger.businessOperation('crop_planted', {
      ...context,
      farmId,
      fieldId,
      cropId,
      userId,
      resourceType: 'crop',
      resourceId: cropId
    })
  }

  static cropHarvested(farmId: string, fieldId: string, cropId: string, yieldAmount: number, userId: string, context?: LogContext) {
    logger.businessOperation('crop_harvested', {
      ...context,
      farmId,
      fieldId,
      cropId,
      yield: yieldAmount,
      userId,
      resourceType: 'crop',
      resourceId: cropId
    })
  }
}

export class DataLogger {
  static weatherDataIngested(fieldId: string, recordCount: number, context?: LogContext) {
    logger.businessOperation('weather_data_ingested', {
      ...context,
      fieldId,
      recordCount,
      resourceType: 'weather_data'
    })
  }

  static satelliteDataIngested(fieldId: string, ndvi: number, context?: LogContext) {
    logger.businessOperation('satellite_data_ingested', {
      ...context,
      fieldId,
      ndvi,
      resourceType: 'satellite_data'
    })
  }

  static reportGenerated(reportType: string, userId: string, context?: LogContext) {
    logger.businessOperation('report_generated', {
      ...context,
      reportType,
      userId,
      resourceType: 'report'
    })
  }
}

// Request correlation middleware helper
export function withRequestLogging() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const requestId = Math.random().toString(36).substring(7)
      const startTime = Date.now()
      
      logger.setContext({ requestId })
      
      try {
        const result = await originalMethod.apply(this, args)
        const duration = Date.now() - startTime
        
        logger.performance(`${target.constructor.name}.${propertyKey}`, duration, {
          requestId,
          success: true
        })
        
        return result
      } catch (error) {
        const duration = Date.now() - startTime
        
        logger.error(`Error in ${target.constructor.name}.${propertyKey}`, error, {
          requestId,
          duration,
          success: false
        })
        
        throw error
      } finally {
        logger.clearContext()
      }
    }

    return descriptor
  }
}