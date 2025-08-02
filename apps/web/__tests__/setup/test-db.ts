/**
 * Test Database Setup
 * Configures an in-memory SQLite database for testing
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

// Test database URL (SQLite in-memory)
const TEST_DATABASE_URL = 'file:./test.db'

// Global test database client
let testPrisma: PrismaClient | null = null

/**
 * Get or create test Prisma client
 */
export function getTestPrismaClient(): PrismaClient {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_DATABASE_URL,
        },
      },
      log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  return testPrisma
}

/**
 * Setup test database
 * Creates a fresh database and runs migrations
 */
export async function setupTestDatabase() {
  try {
    // Remove existing test database if it exists
    const dbPath = path.join(process.cwd(), 'test.db')
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
    }

    // Set test database URL
    process.env.DATABASE_URL = TEST_DATABASE_URL

    // Run migrations
    execSync('npx prisma db push --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: TEST_DATABASE_URL,
      },
    })

    // Get test client
    const prisma = getTestPrismaClient()
    
    // Verify connection
    await prisma.$connect()
    
    return prisma
  } catch (error) {
    console.error('Failed to setup test database:', error)
    throw error
  }
}

/**
 * Cleanup test database
 * Disconnects and removes test database
 */
export async function cleanupTestDatabase() {
  try {
    if (testPrisma) {
      await testPrisma.$disconnect()
      testPrisma = null
    }

    // Remove test database file
    const dbPath = path.join(process.cwd(), 'test.db')
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
    }
  } catch (error) {
    console.error('Failed to cleanup test database:', error)
  }
}

/**
 * Reset test database
 * Clears all data but keeps schema
 */
export async function resetTestDatabase() {
  const prisma = getTestPrismaClient()
  
  // Get all table names
  const tables = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%' 
    AND name NOT LIKE '_prisma_%'
  `
  
  // Clear all tables
  for (const { name } of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${name}"`)
  }
}

/**
 * Seed test database with sample data
 */
export async function seedTestDatabase() {
  const prisma = getTestPrismaClient()
  
  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'farmer1@test.com',
        name: 'Test Farmer 1',
        password: '$2a$10$test.hashed.password',
        role: 'FARM_OWNER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'farmer2@test.com',
        name: 'Test Farmer 2',
        password: '$2a$10$test.hashed.password',
        role: 'FARM_OWNER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Test Admin',
        password: '$2a$10$test.hashed.password',
        role: 'ADMIN',
      },
    }),
  ])

  // Create test farms
  const farms = await Promise.all([
    prisma.farm.create({
      data: {
        name: 'Green Valley Farm',
        location: 'Iowa, USA',
        latitude: 41.878,
        longitude: -93.0977,
        size: 250,
        ownerId: users[0].id,
      },
    }),
    prisma.farm.create({
      data: {
        name: 'Sunrise Acres',
        location: 'Nebraska, USA',
        latitude: 41.4925,
        longitude: -99.9018,
        size: 180,
        ownerId: users[0].id,
      },
    }),
    prisma.farm.create({
      data: {
        name: 'Prairie Fields',
        location: 'Kansas, USA',
        latitude: 39.0119,
        longitude: -98.4842,
        size: 320,
        ownerId: users[1].id,
      },
    }),
  ])

  // Create test fields
  const fields = await Promise.all([
    prisma.field.create({
      data: {
        name: 'North Field',
        farmId: farms[0].id,
        cropType: 'corn',
        size: 80,
        plantingDate: new Date('2024-04-15'),
        expectedHarvestDate: new Date('2024-09-15'),
        boundary: {
          type: 'Polygon',
          coordinates: [[
            [-93.1, 41.88],
            [-93.095, 41.88],
            [-93.095, 41.875],
            [-93.1, 41.875],
            [-93.1, 41.88],
          ]],
        },
      },
    }),
    prisma.field.create({
      data: {
        name: 'South Field',
        farmId: farms[0].id,
        cropType: 'soybeans',
        size: 100,
        plantingDate: new Date('2024-05-01'),
        expectedHarvestDate: new Date('2024-10-01'),
        boundary: {
          type: 'Polygon',
          coordinates: [[
            [-93.1, 41.875],
            [-93.095, 41.875],
            [-93.095, 41.87],
            [-93.1, 41.87],
            [-93.1, 41.875],
          ]],
        },
      },
    }),
  ])

  // Create test weather data
  const weatherData = []
  for (const field of fields) {
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      weatherData.push(
        prisma.weatherData.create({
          data: {
            fieldId: field.id,
            temperature: 70 + Math.random() * 20,
            humidity: 50 + Math.random() * 30,
            rainfall: Math.random() > 0.7 ? Math.random() * 5 : 0,
            windSpeed: 5 + Math.random() * 15,
            condition: ['sunny', 'partly_cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
            timestamp: date,
          },
        })
      )
    }
  }
  
  await Promise.all(weatherData)

  return { users, farms, fields }
}

/**
 * Test database transaction helper
 * Automatically rolls back after test
 */
export async function withTestTransaction<T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = getTestPrismaClient()
  
  return prisma.$transaction(async (tx) => {
    try {
      const result = await fn(tx as PrismaClient)
      throw new Error('ROLLBACK')
    } catch (error: any) {
      if (error.message === 'ROLLBACK') {
        return result as T
      }
      throw error
    }
  }, {
    maxWait: 5000,
    timeout: 10000,
  }).catch((error) => {
    if (error.message === 'ROLLBACK') {
      return error.result
    }
    throw error
  })
}

/**
 * Test utilities for database queries
 */
export const testDbUtils = {
  // Count records in a table
  async countRecords(table: string): Promise<number> {
    const prisma = getTestPrismaClient()
    const result = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT COUNT(*) as count FROM "${table}"`
    )
    return result[0].count
  },

  // Check if record exists
  async recordExists(table: string, where: Record<string, any>): Promise<boolean> {
    const prisma = getTestPrismaClient()
    const whereClause = Object.entries(where)
      .map(([key, value]) => `"${key}" = ?`)
      .join(' AND ')
    const values = Object.values(where)
    
    const result = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT COUNT(*) as count FROM "${table}" WHERE ${whereClause}`,
      ...values
    )
    return result[0].count > 0
  },

  // Get last inserted record
  async getLastInserted(table: string): Promise<any> {
    const prisma = getTestPrismaClient()
    const result = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${table}" ORDER BY "createdAt" DESC LIMIT 1`
    )
    return Array.isArray(result) ? result[0] : null
  },
}

// Setup and teardown hooks for Jest
export const testDatabaseHooks = {
  // Setup before all tests
  beforeAll: async () => {
    await setupTestDatabase()
  },

  // Setup before each test
  beforeEach: async () => {
    await resetTestDatabase()
    await seedTestDatabase()
  },

  // Cleanup after each test
  afterEach: async () => {
    await resetTestDatabase()
  },

  // Cleanup after all tests
  afterAll: async () => {
    await cleanupTestDatabase()
  },
}