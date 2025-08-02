/**
 * Example integration test using test database and mocks
 * Demonstrates how to use the test infrastructure
 */

import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/farms/route'
import { testDatabaseHooks, getTestPrismaClient } from '@/tests/setup/test-db'
import { testDataFactory } from '@/tests/utils/data-factory'
import { mockAuthSession } from '@/tests/mocks/external-services'
import { prismaMock, setupMockScenario } from '@/tests/mocks/prisma'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockAuthSession)),
}))

describe('Farms API with Test Database', () => {
  // Use test database hooks
  beforeAll(testDatabaseHooks.beforeAll)
  beforeEach(testDatabaseHooks.beforeEach)
  afterEach(testDatabaseHooks.afterEach)
  afterAll(testDatabaseHooks.afterAll)

  describe('GET /api/farms', () => {
    it('should return farms for authenticated user from test database', async () => {
      const prisma = getTestPrismaClient()
      
      // Create test data using factory
      const user = await prisma.user.create({
        data: testDataFactory.user.buildFarmOwner({ id: mockAuthSession.user.id })
      })
      
      const farms = await Promise.all(
        testDataFactory.farm.buildMany(3, { ownerId: user.id })
          .map(farm => prisma.farm.create({ data: farm }))
      )
      
      // Make request
      const { req } = createMocks({
        method: 'GET',
      })
      
      const response = await GET(req as any)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.farms).toHaveLength(3)
      expect(data.farms[0]).toHaveProperty('name')
      expect(data.farms[0]).toHaveProperty('location')
      expect(data.farms[0].ownerId).toBe(user.id)
    })

    it('should include field count for each farm', async () => {
      const prisma = getTestPrismaClient()
      
      // Create complete farm setup
      const { user, farm, fields } = testDataFactory.createCompleteFarmSetup()
      
      await prisma.user.create({ data: { ...user, id: mockAuthSession.user.id } })
      await prisma.farm.create({ data: farm })
      await Promise.all(fields.map(field => prisma.field.create({ data: field })))
      
      const { req } = createMocks({ method: 'GET' })
      const response = await GET(req as any)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.farms[0]).toHaveProperty('fieldCount', 3)
    })
  })

  describe('POST /api/farms', () => {
    it('should create a new farm', async () => {
      const prisma = getTestPrismaClient()
      
      // Ensure user exists
      await prisma.user.create({
        data: testDataFactory.user.buildFarmOwner({ id: mockAuthSession.user.id })
      })
      
      const farmData = {
        name: 'New Test Farm',
        location: 'Test Location, USA',
        latitude: 41.878,
        longitude: -93.0977,
        size: 250,
      }
      
      const { req } = createMocks({
        method: 'POST',
        body: farmData,
        headers: {
          'content-type': 'application/json',
        },
      })
      
      const response = await POST(req as any)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.farm).toHaveProperty('id')
      expect(data.farm.name).toBe(farmData.name)
      expect(data.farm.ownerId).toBe(mockAuthSession.user.id)
      
      // Verify in database
      const createdFarm = await prisma.farm.findUnique({
        where: { id: data.farm.id }
      })
      expect(createdFarm).toBeTruthy()
      expect(createdFarm?.name).toBe(farmData.name)
    })

    it('should validate required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          // Missing required fields
          name: 'Test Farm',
        },
        headers: {
          'content-type': 'application/json',
        },
      })
      
      const response = await POST(req as any)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })
})

describe('Farms API with Mocked Prisma', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/farms with mocks', () => {
    it('should handle database errors gracefully', async () => {
      // Setup error scenario
      setupMockScenario.databaseError()
      
      const { req } = createMocks({ method: 'GET' })
      const response = await GET(req as any)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error.message).toContain('Database')
    })

    it('should return empty array for user with no farms', async () => {
      // Setup user with no farms
      setupMockScenario.newUser()
      
      const { req } = createMocks({ method: 'GET' })
      const response = await GET(req as any)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.farms).toEqual([])
    })
  })
})