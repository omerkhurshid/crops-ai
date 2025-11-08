import { NextRequest } from 'next/server';
import { prisma } from './prisma';
interface AuditLogEntry {
  userId: string | null;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
export class AuditLogger {
  /**
   * Log an audit event to the database
   */
  static async logEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          oldValues: entry.oldValues,
          newValues: entry.newValues,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to write audit log to database:', error);
      // Fallback to console logging
    }
  }
  /**
   * Log authentication events
   */
  static async logAuth(
    action: 'login' | 'logout' | 'register' | 'password_reset' | 'failed_login',
    userId: string | null,
    metadata: any = {},
    request?: NextRequest
  ): Promise<void> {
    await this.logEvent({
      userId,
      action,
      resource: 'authentication',
      newValues: {
        ...metadata,
        timestamp: new Date().toISOString()
      },
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown'
    });
  }
  /**
   * Log farm management operations
   */
  static async logFarmOperation(
    action: 'create' | 'update' | 'delete' | 'view',
    userId: string,
    farmId: string,
    oldValues?: any,
    newValues?: any,
    request?: NextRequest
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: `farm_${action}`,
      resource: 'farm',
      resourceId: farmId,
      oldValues,
      newValues,
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown'
    });
  }
  /**
   * Log financial transactions
   */
  static async logFinancialTransaction(
    action: 'create' | 'update' | 'delete',
    userId: string,
    transactionId: string,
    transactionData: any,
    request?: NextRequest
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: `financial_${action}`,
      resource: 'financial_transaction',
      resourceId: transactionId,
      newValues: {
        ...transactionData,
        amount: typeof transactionData.amount === 'number' ? transactionData.amount : '[REDACTED]'
      },
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown'
    });
  }
  /**
   * Log data access events
   */
  static async logDataAccess(
    resource: string,
    resourceId: string | null,
    userId: string | null,
    action: 'read' | 'export' | 'download',
    metadata: any = {},
    request?: NextRequest
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: `data_${action}`,
      resource,
      resourceId: resourceId || undefined,
      newValues: metadata,
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown'
    });
  }
  /**
   * Log system administration events
   */
  static async logAdminAction(
    action: string,
    userId: string,
    resource: string,
    resourceId?: string,
    details?: any,
    request?: NextRequest
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: `admin_${action}`,
      resource,
      resourceId,
      newValues: details,
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown'
    });
  }
  /**
   * Log security events
   */
  static async logSecurityEvent(
    action: 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access' | 'permission_denied',
    userId: string | null,
    details: any,
    request?: NextRequest
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: `security_${action}`,
      resource: 'security',
      newValues: {
        ...details,
        severity: action === 'suspicious_activity' ? 'high' : 'medium',
        timestamp: new Date().toISOString()
      },
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown'
    });
  }
  /**
   * Get audit logs for a user
   */
  static async getUserAuditLogs(
    userId: string,
    limit: number = 100,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      const where: any = { userId };
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = startDate;
        if (endDate) where.timestamp.lte = endDate;
      }
      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit
      });
      return logs;
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      return [];
    }
  }
  /**
   * Get audit logs for a resource
   */
  static async getResourceAuditLogs(
    resource: string,
    resourceId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          resource,
          resourceId
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });
      return logs;
    } catch (error) {
      console.error('Error fetching resource audit logs:', error);
      return [];
    }
  }
  /**
   * Search audit logs
   */
  static async searchAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100
  ): Promise<any[]> {
    try {
      const where: any = {};
      if (filters.userId) where.userId = filters.userId;
      if (filters.action) where.action = { contains: filters.action };
      if (filters.resource) where.resource = filters.resource;
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
      }
      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit
      });
      return logs;
    } catch (error) {
      console.error('Error searching audit logs:', error);
      return [];
    }
  }
  /**
   * Clean up old audit logs
   */
  static async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const result = await prisma.auditLog.deleteMany({
        where: {
          timestamp: { lt: cutoffDate }
        }
      });
      return result.count;
    } catch (error) {
      console.error('Error cleaning up audit logs:', error);
      return 0;
    }
  }
}
export async function logAuditEvent(
  entry: Omit<AuditLogEntry, 'timestamp'>
): Promise<void> {
  await AuditLogger.logEvent(entry);
}
export function createAuditLogger(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return {
    log: (entry: Omit<AuditLogEntry, 'ipAddress' | 'userAgent' | 'timestamp'>) =>
      AuditLogger.logEvent({
        ...entry,
        ipAddress,
        userAgent,
      }),
    logAuth: (action: any, userId: string | null, metadata?: any) =>
      AuditLogger.logAuth(action, userId, metadata, request),
    logFarmOperation: (action: any, userId: string, farmId: string, oldValues?: any, newValues?: any) =>
      AuditLogger.logFarmOperation(action, userId, farmId, oldValues, newValues, request),
    logFinancialTransaction: (action: any, userId: string, transactionId: string, transactionData: any) =>
      AuditLogger.logFinancialTransaction(action, userId, transactionId, transactionData, request),
    logDataAccess: (resource: string, resourceId: string | null, userId: string | null, action: any, metadata?: any) =>
      AuditLogger.logDataAccess(resource, resourceId, userId, action, metadata, request),
    logSecurityEvent: (action: any, userId: string | null, details: any) =>
      AuditLogger.logSecurityEvent(action, userId, details, request)
  };
}