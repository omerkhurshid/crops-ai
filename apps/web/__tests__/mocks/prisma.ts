/**
 * Prisma Client Mock for Testing
 * This mock provides a complete implementation of Prisma Client for testing
 */

import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

// Mock the actual Prisma module
jest.mock('@/lib/db', () => ({
  __esModule: true,
  prisma: prismaMock,
}))

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock)
})

// Mock data generators
export const mockGenerators = {
  user: (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$10$hashedpassword',
    role: 'FARM_OWNER',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  farm: (overrides = {}) => ({
    id: 'farm-123',
    name: 'Test Farm',
    location: 'Test Location',
    latitude: 40.7128,
    longitude: -74.0060,
    size: 100,
    ownerId: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  field: (overrides = {}) => ({
    id: 'field-123',
    name: 'Test Field',
    farmId: 'farm-123',
    cropType: 'corn',
    size: 25,
    plantingDate: new Date('2024-04-15'),
    expectedHarvestDate: new Date('2024-09-15'),
    boundary: {
      type: 'Polygon',
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  weatherData: (overrides = {}) => ({
    id: 'weather-123',
    fieldId: 'field-123',
    temperature: 75,
    humidity: 65,
    rainfall: 2.5,
    windSpeed: 12,
    condition: 'partly_cloudy',
    timestamp: new Date('2024-01-01T12:00:00Z'),
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }),

  satelliteImage: (overrides = {}) => ({
    id: 'satellite-123',
    fieldId: 'field-123',
    imageUrl: 'https://example.com/satellite-image.tif',
    captureDate: new Date('2024-01-01'),
    cloudCover: 15,
    resolution: 10,
    ndvi: 0.75,
    processingStatus: 'completed',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  mlPrediction: (overrides = {}) => ({
    id: 'prediction-123',
    fieldId: 'field-123',
    modelId: 'yield-v1',
    predictionType: 'yield',
    value: 185.5,
    confidence: 0.85,
    metadata: {
      factors: {
        weather: 0.3,
        soil: 0.25,
        management: 0.25,
        historical: 0.2,
      },
    },
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }),
}

// Common mock implementations
export const commonMocks = {
  // Mock successful user creation
  createUser: () => {
    prismaMock.user.create.mockResolvedValue(mockGenerators.user())
  },

  // Mock user lookup
  findUser: (user = mockGenerators.user()) => {
    prismaMock.user.findUnique.mockResolvedValue(user)
    prismaMock.user.findFirst.mockResolvedValue(user)
  },

  // Mock farm operations
  findUserFarms: (farms = [mockGenerators.farm()]) => {
    prismaMock.farm.findMany.mockResolvedValue(farms)
  },

  // Mock field operations
  findFarmFields: (fields = [mockGenerators.field()]) => {
    prismaMock.field.findMany.mockResolvedValue(fields)
  },

  // Mock weather data
  findWeatherData: (data = [mockGenerators.weatherData()]) => {
    prismaMock.weatherData.findMany.mockResolvedValue(data)
  },

  // Mock satellite images
  findSatelliteImages: (images = [mockGenerators.satelliteImage()]) => {
    prismaMock.satelliteImage.findMany.mockResolvedValue(images)
  },

  // Mock ML predictions
  findPredictions: (predictions = [mockGenerators.mlPrediction()]) => {
    prismaMock.mLPrediction.findMany.mockResolvedValue(predictions)
  },
}

// Test data sets for different scenarios
export const testDataSets = {
  // Complete farm with all related data
  completeFarm: () => {
    const user = mockGenerators.user()
    const farm = mockGenerators.farm({ ownerId: user.id })
    const fields = [
      mockGenerators.field({ farmId: farm.id, name: 'North Field' }),
      mockGenerators.field({ farmId: farm.id, name: 'South Field' }),
    ]
    const weatherData = fields.map(field =>
      mockGenerators.weatherData({ fieldId: field.id })
    )
    const satelliteImages = fields.map(field =>
      mockGenerators.satelliteImage({ fieldId: field.id })
    )
    const predictions = fields.map(field =>
      mockGenerators.mlPrediction({ fieldId: field.id })
    )

    return { user, farm, fields, weatherData, satelliteImages, predictions }
  },

  // Multiple users with farms
  multipleUsers: () => {
    const users = [
      mockGenerators.user({ id: 'user-1', email: 'user1@example.com' }),
      mockGenerators.user({ id: 'user-2', email: 'user2@example.com' }),
    ]
    const farms = [
      mockGenerators.farm({ id: 'farm-1', ownerId: 'user-1' }),
      mockGenerators.farm({ id: 'farm-2', ownerId: 'user-1' }),
      mockGenerators.farm({ id: 'farm-3', ownerId: 'user-2' }),
    ]

    return { users, farms }
  },

  // Time series weather data
  weatherTimeSeries: (fieldId: string, days = 7) => {
    const data = []
    const now = new Date()
    
    for (let i = 0; i < days * 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push(mockGenerators.weatherData({
        id: `weather-${i}`,
        fieldId,
        timestamp,
        temperature: 70 + Math.random() * 20,
        humidity: 50 + Math.random() * 30,
        rainfall: Math.random() > 0.7 ? Math.random() * 5 : 0,
      }))
    }

    return data
  },
}

// Utility functions for setting up complex scenarios
export const setupMockScenario = {
  // Setup authenticated user with farms
  authenticatedUser: () => {
    const data = testDataSets.completeFarm()
    commonMocks.findUser(data.user)
    commonMocks.findUserFarms([data.farm])
    commonMocks.findFarmFields(data.fields)
    return data
  },

  // Setup user with no data
  newUser: () => {
    const user = mockGenerators.user()
    commonMocks.findUser(user)
    commonMocks.findUserFarms([])
    commonMocks.findFarmFields([])
    return user
  },

  // Setup error scenarios
  databaseError: () => {
    prismaMock.user.findUnique.mockRejectedValue(new Error('Database connection failed'))
    prismaMock.farm.findMany.mockRejectedValue(new Error('Database connection failed'))
  },
}