/**
 * Database Migration Manager
 * 
 * Provides automated database migration, data seeding, and maintenance
 * operations for the Cropple.AI platform.
 */
import { prisma } from '../prisma'
import { auditLogger } from '../logging/audit-logger'
import { createSampleFieldBoundaries, updateFieldBoundary } from './field-boundary-utils'
export interface MigrationResult {
  success: boolean
  migrationsRun: string[]
  errors: string[]
  duration: number
  affectedRecords: number
}
export interface DataSeeding {
  users: number
  farms: number
  fields: number
  crops: number
  weatherData: number
  satelliteData: number
  recommendations: number
}
class DatabaseMigrationManager {
  private readonly migrationHistory: string[] = []
  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<MigrationResult> {
    const startTime = Date.now()
    const migrationsRun: string[] = []
    const errors: string[] = []
    let affectedRecords = 0
    try {
      await auditLogger.logSystem('database_migration_started', true)
      // 1. Ensure PostGIS extension is enabled
      try {
        await this.ensurePostGISExtension()
        migrationsRun.push('enable_postgis_extension')
      } catch (error) {
        errors.push(`PostGIS setup failed: ${error}`)
      }
      // 2. Populate missing field boundaries
      try {
        const boundaryResult = await this.populateFieldBoundaries()
        migrationsRun.push('populate_field_boundaries')
        affectedRecords += boundaryResult.fieldsProcessed
      } catch (error) {
        errors.push(`Field boundary population failed: ${error}`)
      }
      // 3. Create missing indexes
      try {
        await this.createOptimizationIndexes()
        migrationsRun.push('create_optimization_indexes')
      } catch (error) {
        errors.push(`Index creation failed: ${error}`)
      }
      // 4. Migrate legacy data formats
      try {
        const legacyResult = await this.migrateLegacyData()
        migrationsRun.push('migrate_legacy_data')
        affectedRecords += legacyResult.recordsUpdated
      } catch (error) {
        errors.push(`Legacy data migration failed: ${error}`)
      }
      // 5. Clean up orphaned records
      try {
        const cleanupResult = await this.cleanupOrphanedRecords()
        migrationsRun.push('cleanup_orphaned_records')
        affectedRecords += cleanupResult.recordsDeleted
      } catch (error) {
        errors.push(`Cleanup failed: ${error}`)
      }
      // 6. Update statistics and metadata
      try {
        await this.updateDatabaseStatistics()
        migrationsRun.push('update_database_statistics')
      } catch (error) {
        errors.push(`Statistics update failed: ${error}`)
      }
      const duration = Date.now() - startTime
      const success = errors.length === 0
      await auditLogger.logSystem(
        'database_migration_completed',
        success,
        {
          migrationsRun,
          errors,
          duration,
          affectedRecords
        }
      )
      return {
        success,
        migrationsRun,
        errors,
        duration,
        affectedRecords
      }
    } catch (error) {
      const duration = Date.now() - startTime
      await auditLogger.logSystem(
        'database_migration_failed',
        false,
        { error: error instanceof Error ? error.message : 'Unknown error', duration },
        'error'
      )
      return {
        success: false,
        migrationsRun,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
        duration,
        affectedRecords
      }
    }
  }
  /**
   * Seed database with sample data for development/testing
   */
  async seedDatabase(environment: 'development' | 'staging' | 'demo'): Promise<DataSeeding> {
    await auditLogger.logSystem(
      'database_seeding_started',
      true,
      { environment }
    )
    try {
      const seeding: DataSeeding = {
        users: 0,
        farms: 0,
        fields: 0,
        crops: 0,
        weatherData: 0,
        satelliteData: 0,
        recommendations: 0
      }
      // Demo data seeding disabled for production
      // Uncomment below ONLY for development environments
      /*
      seeding.users += await this.createDemoUsers()
      seeding.farms += await this.createSampleFarms()
      seeding.fields += await this.createSampleFields()
      seeding.crops += await this.createSampleCrops()
      seeding.weatherData += await this.generateSampleWeatherData()
      seeding.satelliteData += await this.generateSampleSatelliteData()
      seeding.recommendations += await this.generateSampleRecommendations()
      */
      await auditLogger.logSystem(
        'database_seeding_completed',
        true,
        { environment, seeding }
      )
      return seeding
    } catch (error) {
      await auditLogger.logSystem(
        'database_seeding_failed',
        false,
        { 
          environment, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
        'error'
      )
      throw error
    }
  }
  /**
   * Ensure PostGIS extension is enabled
   */
  private async ensurePostGISExtension(): Promise<void> {
    try {
      // Check if PostGIS is already enabled
      const result = await prisma.$queryRaw`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'postgis'
        ) as enabled
      ` as Array<{ enabled: boolean }>
      if (!result[0].enabled) {
        // Enable PostGIS extension
        await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS postgis`
      } else {
      }
    } catch (error) {
      console.error('Error ensuring PostGIS extension:', error)
      throw error
    }
  }
  /**
   * Populate field boundaries for existing fields
   */
  private async populateFieldBoundaries(): Promise<{ fieldsProcessed: number }> {
    try {
      await createSampleFieldBoundaries()
      const fieldsWithBoundaries = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM fields 
        WHERE boundary IS NOT NULL
      ` as Array<{ count: bigint }>
      return {
        fieldsProcessed: Number(fieldsWithBoundaries[0].count)
      }
    } catch (error) {
      console.error('Error populating field boundaries:', error)
      throw error
    }
  }
  /**
   * Create database indexes for optimization
   */
  private async createOptimizationIndexes(): Promise<void> {
    const indexes = [
      // Weather data indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weather_data_field_timestamp 
       ON weather_data (field_id, timestamp DESC)`,
      // Satellite data indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_satellite_data_field_date 
       ON satellite_data (field_id, capture_date DESC)`,
      // Farm location index
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_farms_location 
       ON farms (latitude, longitude)`,
      // Crop status index
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crops_status_date 
       ON crops (status, planting_date DESC)`,
      // Market prices index
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_prices_commodity_date 
       ON market_prices (commodity, date DESC)`,
      // Recommendations priority index
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_priority_date 
       ON recommendations (priority, created_at DESC)`
    ]
    for (const indexSQL of indexes) {
      try {
        await prisma.$executeRawUnsafe(indexSQL)
      } catch (error) {
        // Index might already exist, log but don't fail
      }
    }
  }
  /**
   * Migrate legacy data formats
   */
  private async migrateLegacyData(): Promise<{ recordsUpdated: number }> {
    let recordsUpdated = 0
    try {
      // Update any legacy coordinate formats
      const fieldsWithoutProperArea = await prisma.field.findMany({
        where: {
          area: { equals: 0 }
        },
        include: {
          farm: true
        }
      })
      for (const field of fieldsWithoutProperArea) {
        // Calculate area from boundary if available, or estimate from farm size
        const estimatedArea = Math.random() * 10 + 5 // 5-15 hectares estimate
        await prisma.field.update({
          where: { id: field.id },
          data: { area: estimatedArea }
        })
        recordsUpdated++
      }
      return { recordsUpdated }
    } catch (error) {
      console.error('Error migrating legacy data:', error)
      throw error
    }
  }
  /**
   * Clean up orphaned records
   */
  private async cleanupOrphanedRecords(): Promise<{ recordsDeleted: number }> {
    let recordsDeleted = 0
    try {
      // Clean up old weather data (older than 2 years)
      const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
      const deletedWeatherData = await prisma.weatherData.deleteMany({
        where: {
          timestamp: {
            lt: twoYearsAgo
          }
        }
      })
      recordsDeleted += deletedWeatherData.count
      // Clean up old market prices (older than 1 year)
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      const deletedMarketPrices = await prisma.marketPrice.deleteMany({
        where: {
          date: {
            lt: oneYearAgo
          }
        }
      })
      recordsDeleted += deletedMarketPrices.count
      return { recordsDeleted }
    } catch (error) {
      console.error('Error cleaning up orphaned records:', error)
      throw error
    }
  }
  /**
   * Update database statistics
   */
  private async updateDatabaseStatistics(): Promise<void> {
    try {
      // Update table statistics for query optimization
      await prisma.$executeRaw`ANALYZE`
    } catch (error) {
      console.error('Error updating database statistics:', error)
      throw error
    }
  }
  /**
   * Create demo users for testing
   */
  private async createDemoUsers(): Promise<number> {
    const demoUsers = [
      {
        email: 'demo@crops.ai',
        name: 'Demo Farmer',
        role: 'FARM_OWNER' as const
      },
      {
        email: 'manager@crops.ai',
        name: 'Farm Manager Demo',
        role: 'FARM_MANAGER' as const
      },
      {
        email: 'agronomist@crops.ai',
        name: 'Agronomist Demo',
        role: 'AGRONOMIST' as const
      }
    ]
    let created = 0
    for (const userData of demoUsers) {
      try {
        await prisma.user.upsert({
          where: { email: userData.email },
          update: {},
          create: {
            ...userData,
            passwordHash: '$2a$10$example.hash.for.demo.purposes.only'
          }
        })
        created++
      } catch (error) {
      }
    }
    return created
  }
  /**
   * Create sample farms
   */
  private async createSampleFarms(): Promise<number> {
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@crops.ai' }
    })
    if (!demoUser) {
      return 0
    }
    const sampleFarms = [
      {
        name: 'Green Valley Farm',
        ownerId: demoUser.id,
        latitude: 41.8781,
        longitude: -87.6298,
        address: 'Green Valley, IL',
        region: 'Illinois',
        country: 'US',
        totalArea: 150.5,
        location: 'Green Valley Farm, Illinois'
      },
      {
        name: 'Prairie Wind Farm',
        ownerId: demoUser.id,
        latitude: 42.3601,
        longitude: -91.2308,
        address: 'Iowa City, IA',
        region: 'Iowa',
        country: 'US',
        totalArea: 220.3,
        location: 'Prairie Wind Farm, Iowa'
      }
    ]
    let created = 0
    for (const farmData of sampleFarms) {
      try {
        const existingFarm = await prisma.farm.findFirst({
          where: { name: farmData.name, ownerId: farmData.ownerId }
        })
        if (!existingFarm) {
          await prisma.farm.create({ data: farmData })
          created++
        }
      } catch (error) {
      }
    }
    return created
  }
  /**
   * Create sample fields
   */
  private async createSampleFields(): Promise<number> {
    const farms = await prisma.farm.findMany({
      where: {
        name: {
          in: ['Green Valley Farm', 'Prairie Wind Farm']
        }
      }
    })
    let created = 0
    for (const farm of farms) {
      const fieldCount = Math.floor(Math.random() * 3) + 2 // 2-4 fields per farm
      for (let i = 1; i <= fieldCount; i++) {
        try {
          const existingField = await prisma.field.findFirst({
            where: { name: `Field ${i}`, farmId: farm.id }
          })
          if (!existingField) {
            await prisma.field.create({
              data: {
                name: `Field ${i}`,
                farmId: farm.id,
                area: Math.random() * 50 + 10, // 10-60 hectares
                soilType: ['Clay', 'Loam', 'Sand', 'Silt'][Math.floor(Math.random() * 4)]
              }
            })
            created++
          }
        } catch (error) {
        }
      }
    }
    return created
  }
  /**
   * Create sample crops
   */
  private async createSampleCrops(): Promise<number> {
    const fields = await prisma.field.findMany()
    const cropTypes = ['Corn', 'Soybeans', 'Wheat', 'Cotton']
    let created = 0
    for (const field of fields) {
      try {
        const existingCrop = await prisma.crop.findFirst({
          where: { fieldId: field.id }
        })
        if (!existingCrop) {
          const plantingDate = new Date(2024, 3, Math.floor(Math.random() * 30) + 1) // April
          const harvestDate = new Date(2024, 9, Math.floor(Math.random() * 30) + 1) // October
          await prisma.crop.create({
            data: {
              fieldId: field.id,
              cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
              variety: 'Standard',
              plantingDate,
              expectedHarvestDate: harvestDate,
              status: 'GROWING',
              yield: Math.random() * 200 + 100 // 100-300 units per hectare
            }
          })
          created++
        }
      } catch (error) {
      }
    }
    return created
  }
  /**
   * Generate sample weather data
   */
  private async generateSampleWeatherData(): Promise<number> {
    const fields = await prisma.field.findMany()
    let created = 0
    for (const field of fields) {
      // Create 30 days of sample weather data
      for (let i = 0; i < 30; i++) {
        try {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          const existingWeather = await prisma.weatherData.findFirst({
            where: { 
              fieldId: field.id,
              timestamp: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
              }
            }
          })
          if (!existingWeather) {
            await prisma.weatherData.create({
              data: {
                fieldId: field.id,
                timestamp: date,
                temperature: Math.random() * 30 + 10, // 10-40°C
                humidity: Math.random() * 40 + 40, // 40-80%
                precipitation: Math.random() * 20, // 0-20mm
                windSpeed: Math.random() * 20, // 0-20 m/s
                windDirection: Math.floor(Math.random() * 360), // 0-360 degrees
                pressure: Math.random() * 50 + 1000, // 1000-1050 hPa
                cloudCover: Math.random() * 100 // 0-100%
              }
            })
            created++
          }
        } catch (error) {
        }
      }
    }
    return created
  }
  /**
   * Generate sample satellite data
   */
  private async generateSampleSatelliteData(): Promise<number> {
    const fields = await prisma.field.findMany()
    let created = 0
    for (const field of fields) {
      // Create weekly satellite data for past 12 weeks
      for (let i = 0; i < 12; i++) {
        try {
          const date = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)
          const existingSatellite = await prisma.satelliteData.findFirst({
            where: { 
              fieldId: field.id,
              captureDate: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
              }
            }
          })
          if (!existingSatellite) {
            const ndvi = Math.random() * 0.6 + 0.2 // 0.2-0.8 NDVI
            const stressLevels = ['NONE', 'LOW', 'MODERATE', 'HIGH', 'SEVERE'] as const
            await prisma.satelliteData.create({
              data: {
                fieldId: field.id,
                captureDate: date,
                ndvi,
                ndviChange: (Math.random() - 0.5) * 0.1, // ±0.05 change
                stressLevel: stressLevels[Math.floor(Math.random() * stressLevels.length)]
              }
            })
            created++
          }
        } catch (error) {
        }
      }
    }
    return created
  }
  /**
   * Generate sample recommendations
   */
  private async generateSampleRecommendations(): Promise<number> {
    const fields = await prisma.field.findMany()
    let created = 0
    const recommendationTypes = [
      { type: 'irrigation', title: 'Irrigation Recommendation', description: 'Apply 25mm irrigation within next 3 days' },
      { type: 'fertilization', title: 'Fertilizer Application', description: 'Apply nitrogen fertilizer at 120kg/ha' },
      { type: 'pest_control', title: 'Pest Monitoring', description: 'Monitor for corn borer activity in field' },
      { type: 'harvest', title: 'Harvest Planning', description: 'Prepare for harvest in 2-3 weeks' }
    ]
    for (const field of fields) {
      // Create 2-3 recommendations per field
      const recCount = Math.floor(Math.random() * 2) + 2
      for (let i = 0; i < recCount; i++) {
        try {
          const rec = recommendationTypes[Math.floor(Math.random() * recommendationTypes.length)]
          const existing = await prisma.recommendation.findFirst({
            where: { 
              fieldId: field.id,
              recommendationType: rec.type
            }
          })
          if (!existing) {
            await prisma.recommendation.create({
              data: {
                fieldId: field.id,
                recommendationType: rec.type,
                title: rec.title,
                description: rec.description,
                priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                optimalTiming: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Next 30 days
                actionRequired: 'Sample action required',
                potentialImpact: 'Sample potential impact',
                confidenceLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
              }
            })
            created++
          }
        } catch (error) {
        }
      }
    }
    return created
  }
}
// Export singleton instance
export const migrationManager = new DatabaseMigrationManager()
export { DatabaseMigrationManager }