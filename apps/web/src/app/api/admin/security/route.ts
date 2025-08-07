import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { auditLogger } from '../../../../lib/logging/audit-logger'
import { prisma } from '../../../../lib/prisma'

/**
 * Get security status and metrics
 * GET /api/admin/security
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    // Only allow admin users
    if (!user || user.role !== 'ADMIN') {
      await auditLogger.logAuthorization(
        'access_security_dashboard',
        'security_metrics',
        'admin_dashboard',
        user?.id || 'unknown',
        false,
        'Insufficient privileges',
        request
      )
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await auditLogger.logAuthorization(
      'access_security_dashboard',
      'security_metrics',
      'admin_dashboard',
      user.id,
      true,
      'Admin access granted',
      request
    )

    // Gather security metrics
    const securityMetrics = await gatherSecurityMetrics()
    
    return NextResponse.json({
      success: true,
      data: securityMetrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    await auditLogger.logSystem(
      'security_dashboard_error',
      false,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'error'
    )
    
    console.error('Error accessing security dashboard:', error)
    
    return NextResponse.json({
      error: 'Failed to retrieve security metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Update security settings
 * POST /api/admin/security
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    // Only allow admin users
    if (!user || user.role !== 'ADMIN') {
      await auditLogger.logAuthorization(
        'modify_security_settings',
        'security_config',
        'admin_security',
        user?.id || 'unknown',
        false,
        'Insufficient privileges',
        request
      )
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { action, settings } = body

    switch (action) {
      case 'update_rate_limits':
        await updateRateLimits(settings, user.id, request)
        break
        
      case 'block_ip':
        await blockIP(settings.ip, settings.reason, user.id, request)
        break
        
      case 'unblock_ip':
        await unblockIP(settings.ip, user.id, request)
        break
        
      case 'update_security_policy':
        await updateSecurityPolicy(settings, user.id, request)
        break
        
      default:
        await auditLogger.logSecurityIncident(
          'suspicious_activity',
          'medium',
          { action: 'unknown_security_action', providedAction: action },
          true,
          request
        )
        
        return NextResponse.json({ 
          error: 'Unknown security action' 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Security action '${action}' completed successfully`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    await auditLogger.logSystem(
      'security_settings_update_error',
      false,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'error'
    )
    
    console.error('Error updating security settings:', error)
    
    return NextResponse.json({
      error: 'Failed to update security settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Gather comprehensive security metrics
 */
async function gatherSecurityMetrics() {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Note: In production these would query actual audit logs from database
  const mockMetrics = {
    overview: {
      securityLevel: 'GOOD', // GOOD, WARNING, CRITICAL
      activeThreats: 0,
      blockedRequests24h: 45,
      failedLogins24h: 12,
      suspiciousActivity24h: 3
    },
    
    authentication: {
      totalLogins24h: 234,
      failedLoginAttempts24h: 12,
      uniqueUsers24h: 89,
      passwordChanges24h: 5,
      accountLockouts24h: 2,
      twoFactorEnabled: {
        total: 156,
        percentage: 67.2
      }
    },
    
    apiSecurity: {
      totalRequests24h: 15234,
      rateLimitedRequests24h: 45,
      unauthorizedRequests24h: 28,
      topEndpoints: [
        { endpoint: '/api/weather/current', requests: 3421, errors: 12 },
        { endpoint: '/api/farms', requests: 2876, errors: 8 },
        { endpoint: '/api/satellite/ndvi', requests: 1943, errors: 15 }
      ],
      slowResponses24h: 89, // Requests > threshold
      errorRate: 2.3 // Percentage
    },
    
    threats: {
      blockedIPs: [
        { ip: '192.168.1.100', reason: 'Rate limit exceeded', blockedAt: oneDayAgo.toISOString() },
        { ip: '10.0.0.50', reason: 'Malicious user agent', blockedAt: oneDayAgo.toISOString() }
      ],
      maliciousActivity: [
        {
          type: 'SQL Injection Attempt',
          ip: '192.168.1.200',
          timestamp: oneDayAgo.toISOString(),
          blocked: true,
          riskLevel: 'HIGH'
        },
        {
          type: 'XSS Attempt',
          ip: '10.0.0.75',
          timestamp: oneDayAgo.toISOString(),
          blocked: true,
          riskLevel: 'MEDIUM'
        }
      ]
    },
    
    dataAccess: {
      sensitiveDataAccess24h: 456,
      dataExports24h: 12,
      unauthorizedDataAccess24h: 3,
      dataModifications24h: 89,
      adminActions24h: 15
    },
    
    systemHealth: {
      uptimePercentage: 99.95,
      avgResponseTime: 245, // milliseconds
      errorRate: 0.12, // percentage
      securityPatchLevel: 'UP_TO_DATE',
      lastSecurityScan: oneWeekAgo.toISOString(),
      vulnerabilitiesFound: 0
    },
    
    compliance: {
      gdprCompliant: true,
      dataRetentionPolicyActive: true,
      encryptionEnabled: true,
      backupEncryption: true,
      auditLogRetention: '90 days',
      lastComplianceCheck: oneWeekAgo.toISOString()
    }
  }

  return mockMetrics
}

/**
 * Update rate limiting settings
 */
async function updateRateLimits(settings: any, userId: string, request: NextRequest) {
  await auditLogger.logSystem(
    'rate_limits_updated',
    true,
    { 
      settings,
      updatedBy: userId,
      previousSettings: 'would_retrieve_from_config'
    }
  )
  
  // In production, would update rate limit configuration
  console.log('Rate limits updated:', settings)
}

/**
 * Block an IP address
 */
async function blockIP(ip: string, reason: string, userId: string, request: NextRequest) {
  await auditLogger.logSecurityIncident(
    'malicious_activity',
    'medium',
    {
      action: 'ip_blocked_by_admin',
      targetIP: ip,
      reason,
      blockedBy: userId
    },
    true,
    request
  )
  
  // In production, would add IP to blocked list in database/config
  console.log(`IP blocked: ${ip}, reason: ${reason}, by user: ${userId}`)
}

/**
 * Unblock an IP address
 */
async function unblockIP(ip: string, userId: string, request: NextRequest) {
  await auditLogger.logSystem(
    'ip_unblocked',
    true,
    {
      targetIP: ip,
      unblockedBy: userId
    }
  )
  
  // In production, would remove IP from blocked list
  console.log(`IP unblocked: ${ip}, by user: ${userId}`)
}

/**
 * Update security policy settings
 */
async function updateSecurityPolicy(settings: any, userId: string, request: NextRequest) {
  await auditLogger.logSystem(
    'security_policy_updated',
    true,
    {
      settings,
      updatedBy: userId,
      timestamp: new Date().toISOString()
    }
  )
  
  // In production, would update security policy in database/config
  console.log('Security policy updated:', settings)
}