/**
 * Comprehensive Audit Logging System
 * 
 * Provides structured logging for security events, user actions,
 * system events, and performance monitoring with multiple output
 * destinations and log levels.
 */
export interface AuditEvent {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'security' | 'performance'
  category: string
  action: string
  userId?: string
  userEmail?: string
  userRole?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  resourceId?: string
  details: Record<string, any>
  metadata: {
    source: string
    environment: string
    version: string
    requestId?: string
    sessionId?: string
  }
  duration?: number
  success: boolean
  errorCode?: string
  errorMessage?: string
}
export interface SecurityEvent extends AuditEvent {
  level: 'security'
  securityType: 'authentication' | 'authorization' | 'data_access' | 'rate_limit' | 'malicious_activity'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  blocked: boolean
}
export interface PerformanceEvent extends AuditEvent {
  level: 'performance'
  performanceType: 'api_response' | 'database_query' | 'external_api' | 'ml_processing'
  duration: number
  threshold?: number
  exceeded: boolean
}
class AuditLogger {
  private environment: string
  private version: string
  private enabledLevels: Set<string>
  private outputs: LogOutput[]
  constructor() {
    this.environment = process.env.NODE_ENV || 'development'
    this.version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    this.enabledLevels = new Set(['info', 'warn', 'error', 'security', 'performance'])
    this.outputs = [
      new ConsoleOutput(),
      new FileOutput(),
      // new DatabaseOutput(), // Enable in production
      // new ExternalServiceOutput(), // For services like DataDog, Sentry
    ]
  }
  /**
   * Log a general audit event
   */
  async log(event: Partial<AuditEvent>): Promise<void> {
    const fullEvent: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'general',
      action: 'unknown',
      details: {},
      metadata: {
        source: 'crops-ai',
        environment: this.environment,
        version: this.version
      },
      success: true,
      ...event
    }
    if (!this.enabledLevels.has(fullEvent.level)) {
      return
    }
    await this.writeToOutputs(fullEvent)
  }
  /**
   * Log user authentication events
   */
  async logAuth(
    action: 'login' | 'logout' | 'register' | 'password_change' | 'failed_login',
    userId?: string,
    userEmail?: string,
    success: boolean = true,
    details: Record<string, any> = {},
    request?: any
  ): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'security',
      category: 'authentication',
      action,
      userId,
      userEmail,
      ipAddress: this.extractIpAddress(request),
      userAgent: request?.headers?.get('user-agent'),
      details,
      metadata: {
        source: 'crops-ai-auth',
        environment: this.environment,
        version: this.version,
        requestId: request?.id,
        sessionId: request?.sessionId
      },
      success,
      securityType: 'authentication',
      riskLevel: success ? 'low' : action === 'failed_login' ? 'medium' : 'low',
      blocked: !success
    }
    await this.writeToOutputs(securityEvent)
  }
  /**
   * Log authorization events
   */
  async logAuthorization(
    action: string,
    resource: string,
    resourceId: string,
    userId: string,
    allowed: boolean,
    reason?: string,
    request?: any
  ): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'security',
      category: 'authorization',
      action,
      userId,
      resource,
      resourceId,
      ipAddress: this.extractIpAddress(request),
      details: {
        allowed,
        reason: reason || (allowed ? 'Access granted' : 'Access denied')
      },
      metadata: {
        source: 'crops-ai-auth',
        environment: this.environment,
        version: this.version,
        requestId: request?.id
      },
      success: allowed,
      securityType: 'authorization',
      riskLevel: allowed ? 'low' : 'medium',
      blocked: !allowed
    }
    await this.writeToOutputs(securityEvent)
  }
  /**
   * Log data access events
   */
  async logDataAccess(
    action: 'read' | 'create' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    userId: string,
    details: Record<string, any> = {},
    request?: any
  ): Promise<void> {
    await this.log({
      level: 'security',
      category: 'data_access',
      action: `${resource}_${action}`,
      userId,
      resource,
      resourceId,
      ipAddress: this.extractIpAddress(request),
      details,
      metadata: {
        source: 'crops-ai-data',
        environment: this.environment,
        version: this.version,
        requestId: request?.id
      }
    })
  }
  /**
   * Log API performance events
   */
  async logPerformance(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    userId?: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    const threshold = this.getPerformanceThreshold(endpoint)
    const exceeded = duration > threshold
    const performanceEvent: PerformanceEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'performance',
      category: 'api_performance',
      action: `${method}_${endpoint}`,
      userId,
      duration,
      threshold,
      exceeded,
      details: {
        ...details,
        statusCode,
        endpoint,
        method
      },
      metadata: {
        source: 'crops-ai-api',
        environment: this.environment,
        version: this.version
      },
      success: statusCode < 400,
      performanceType: 'api_response'
    }
    await this.writeToOutputs(performanceEvent)
  }
  /**
   * Log security incidents
   */
  async logSecurityIncident(
    type: 'rate_limit_exceeded' | 'malicious_request' | 'suspicious_activity' | 'data_breach_attempt',
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>,
    blocked: boolean = true,
    request?: any
  ): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'security',
      category: 'security_incident',
      action: type,
      ipAddress: this.extractIpAddress(request),
      userAgent: request?.headers?.get('user-agent'),
      details,
      metadata: {
        source: 'crops-ai-security',
        environment: this.environment,
        version: this.version,
        requestId: request?.id
      },
      success: false,
      securityType: 'malicious_activity',
      riskLevel,
      blocked
    }
    await this.writeToOutputs(securityEvent)
    // Alert for high/critical incidents
    if (riskLevel === 'high' || riskLevel === 'critical') {
      await this.sendSecurityAlert(securityEvent)
    }
  }
  /**
   * Log system events
   */
  async logSystem(
    action: string,
    success: boolean,
    details: Record<string, any> = {},
    level: 'info' | 'warn' | 'error' = 'info'
  ): Promise<void> {
    await this.log({
      level,
      category: 'system',
      action,
      details,
      success,
      metadata: {
        source: 'crops-ai-system',
        environment: this.environment,
        version: this.version
      }
    })
  }
  /**
   * Log ML/AI model events
   */
  async logML(
    action: string,
    modelName: string,
    userId?: string,
    duration?: number,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.log({
      level: 'info',
      category: 'ml_processing',
      action,
      userId,
      duration,
      resource: 'ml_model',
      resourceId: modelName,
      details,
      success: true,
      metadata: {
        source: 'crops-ai-ml',
        environment: this.environment,
        version: this.version
      }
    })
  }
  /**
   * Write event to all configured outputs
   */
  private async writeToOutputs(event: AuditEvent): Promise<void> {
    const promises = this.outputs.map(output => 
      output.write(event).catch(error => {
        console.error('Failed to write to log output:', error)
      })
    )
    await Promise.allSettled(promises)
  }
  /**
   * Generate unique event ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  /**
   * Extract IP address from request
   */
  private extractIpAddress(request?: any): string | undefined {
    if (!request) return undefined
    return request.ip || 
           request.headers?.get('x-forwarded-for') ||
           request.headers?.get('x-real-ip') ||
           request.connection?.remoteAddress
  }
  /**
   * Get performance threshold for endpoint
   */
  private getPerformanceThreshold(endpoint: string): number {
    const thresholds: Record<string, number> = {
      '/api/satellite': 5000,  // 5 seconds for satellite processing
      '/api/ml': 10000,        // 10 seconds for ML predictions
      '/api/weather': 2000,    // 2 seconds for weather data
      '/api/farms': 1000,      // 1 second for farm operations
      '/api/auth': 1000,       // 1 second for auth operations
    }
    for (const [path, threshold] of Object.entries(thresholds)) {
      if (endpoint.startsWith(path)) {
        return threshold
      }
    }
    return 2000 // Default 2 seconds
  }
  /**
   * Send security alert for high-risk incidents
   */
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // In production, this would send alerts via email, Slack, PagerDuty, etc.
    console.error('🚨 SECURITY ALERT:', {
      type: event.action,
      riskLevel: event.riskLevel,
      details: event.details,
      timestamp: event.timestamp
    })
  }
}
/**
 * Abstract base class for log outputs
 */
abstract class LogOutput {
  abstract write(event: AuditEvent): Promise<void>
}
/**
 * Console output for development
 */
class ConsoleOutput extends LogOutput {
  async write(event: AuditEvent): Promise<void> {
    const logMethod = event.level === 'error' ? console.error :
                     event.level === 'warn' ? console.warn :
                     event.level === 'security' ? console.warn :
                     console.log
    logMethod(`[${event.level.toUpperCase()}] ${event.category}:${event.action}`, {
      id: event.id,
      timestamp: event.timestamp,
      userId: event.userId,
      success: event.success,
      duration: event.duration,
      details: event.details
    })
  }
}
/**
 * File output for persistent logging
 */
class FileOutput extends LogOutput {
  async write(event: AuditEvent): Promise<void> {
    // In production, write to log files with rotation
    // For now, just store in memory or skip
    return Promise.resolve()
  }
}
/**
 * Database output for queryable logs
 */
class DatabaseOutput extends LogOutput {
  async write(event: AuditEvent): Promise<void> {
    try {
      // Would store in database table for querying and analysis
      // await prisma.auditLog.create({ data: event })
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to write audit log to database:', error)
    }
  }
}
// Export singleton instance
export const auditLogger = new AuditLogger()
export { AuditLogger }