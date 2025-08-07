import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { migrationManager } from '../../../../lib/database/migration-manager'
import { auditLogger } from '../../../../lib/logging/audit-logger'

/**
 * Run database migrations
 * POST /api/admin/migrate
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    // Only allow admin users to run migrations
    if (!user || user.role !== 'ADMIN') {
      await auditLogger.logAuthorization(
        'database_migration_attempt',
        'migration_system',
        'database_migrations',
        user?.id || 'unknown',
        false,
        'Insufficient privileges',
        request
      )
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { action, environment } = body

    switch (action) {
      case 'run_migrations':
        const migrationResult = await migrationManager.runMigrations()
        
        await auditLogger.logSystem(
          'manual_migration_triggered',
          migrationResult.success,
          {
            triggeredBy: user.id,
            result: migrationResult
          }
        )

        return NextResponse.json({
          success: migrationResult.success,
          data: migrationResult,
          message: migrationResult.success 
            ? 'Migrations completed successfully'
            : 'Migrations completed with errors'
        })

      case 'seed_database':
        if (!environment || !['development', 'staging', 'demo'].includes(environment)) {
          return NextResponse.json({
            error: 'Valid environment required for seeding (development, staging, demo)'
          }, { status: 400 })
        }

        const seedingResult = await migrationManager.seedDatabase(environment)
        
        await auditLogger.logSystem(
          'database_seeding_triggered',
          true,
          {
            triggeredBy: user.id,
            environment,
            result: seedingResult
          }
        )

        return NextResponse.json({
          success: true,
          data: seedingResult,
          message: `Database seeded successfully for ${environment}`
        })

      default:
        await auditLogger.logSecurityIncident(
          'suspicious_activity',
          'medium',
          { 
            action: 'unknown_migration_action',
            providedAction: action,
            userId: user.id
          },
          true,
          request
        )
        
        return NextResponse.json({
          error: 'Unknown migration action'
        }, { status: 400 })
    }

  } catch (error) {
    await auditLogger.logSystem(
      'migration_api_error',
      false,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'error'
    )
    
    console.error('Error in migration API:', error)
    
    return NextResponse.json({
      error: 'Migration operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get migration status and information
 * GET /api/admin/migrate
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    // Only allow admin users to view migration status
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get database status information
    const status = await getDatabaseStatus()
    
    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('Error getting migration status:', error)
    
    return NextResponse.json({
      error: 'Failed to get migration status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get current database status
 */
async function getDatabaseStatus() {
  try {
    // Check database connectivity
    const connectionTest = await testDatabaseConnection()
    
    // Get table statistics
    const tableStats = await getTableStatistics()
    
    // Check for pending migrations/issues
    const issues = await checkDatabaseIssues()
    
    return {
      connection: connectionTest,
      tables: tableStats,
      issues,
      lastChecked: new Date().toISOString()
    }

  } catch (error) {
    return {
      connection: { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      tables: [],
      issues: ['Database connection failed'],
      lastChecked: new Date().toISOString()
    }
  }
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  try {
    const result = await migrationManager['prisma'].$queryRaw`SELECT 1 as test`
    return {
      status: 'connected',
      message: 'Database connection successful',
      responseTime: Date.now()
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

/**
 * Get table statistics
 */
async function getTableStatistics() {
  try {
    const tables = [
      { name: 'users', query: 'SELECT COUNT(*) as count FROM users' },
      { name: 'farms', query: 'SELECT COUNT(*) as count FROM farms' },
      { name: 'fields', query: 'SELECT COUNT(*) as count FROM fields' },
      { name: 'crops', query: 'SELECT COUNT(*) as count FROM crops' },
      { name: 'weather_data', query: 'SELECT COUNT(*) as count FROM weather_data' },
      { name: 'satellite_data', query: 'SELECT COUNT(*) as count FROM satellite_data' },
      { name: 'recommendations', query: 'SELECT COUNT(*) as count FROM recommendations' },
      { name: 'market_prices', query: 'SELECT COUNT(*) as count FROM market_prices' }
    ]

    const stats = []
    
    for (const table of tables) {
      try {
        const result = await migrationManager['prisma'].$queryRawUnsafe(table.query) as Array<{ count: bigint }>
        stats.push({
          name: table.name,
          recordCount: Number(result[0].count),
          status: 'ok'
        })
      } catch (error) {
        stats.push({
          name: table.name,
          recordCount: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return stats

  } catch (error) {
    console.error('Error getting table statistics:', error)
    return []
  }
}

/**
 * Check for database issues
 */
async function checkDatabaseIssues() {
  const issues = []

  try {
    // Check for fields without boundaries
    const fieldsWithoutBoundaries = await migrationManager['prisma'].$queryRaw`
      SELECT COUNT(*) as count FROM fields WHERE boundary IS NULL
    ` as Array<{ count: bigint }>

    if (Number(fieldsWithoutBoundaries[0].count) > 0) {
      issues.push(`${Number(fieldsWithoutBoundaries[0].count)} fields missing boundary data`)
    }

    // Check for farms without fields
    const farmsWithoutFields = await migrationManager['prisma'].$queryRaw`
      SELECT COUNT(*) as count FROM farms 
      WHERE id NOT IN (SELECT DISTINCT farm_id FROM fields)
    ` as Array<{ count: bigint }>

    if (Number(farmsWithoutFields[0].count) > 0) {
      issues.push(`${Number(farmsWithoutFields[0].count)} farms have no fields defined`)
    }

    // Check for old data that needs cleanup
    const oldWeatherData = await migrationManager['prisma'].$queryRaw`
      SELECT COUNT(*) as count FROM weather_data 
      WHERE timestamp < NOW() - INTERVAL '2 years'
    ` as Array<{ count: bigint }>

    if (Number(oldWeatherData[0].count) > 1000) {
      issues.push(`${Number(oldWeatherData[0].count)} old weather records should be archived`)
    }

    // Check PostGIS extension
    const postgisCheck = await migrationManager['prisma'].$queryRaw`
      SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
      ) as enabled
    ` as Array<{ enabled: boolean }>

    if (!postgisCheck[0].enabled) {
      issues.push('PostGIS extension is not enabled')
    }

  } catch (error) {
    issues.push(`Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return issues
}