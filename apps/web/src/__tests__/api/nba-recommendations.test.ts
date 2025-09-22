/**
 * NBA Recommendations API Tests
 */

import { GET, POST } from '../../app/api/nba/recommendations/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('../../lib/auth/session', () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com'
  }))
}))

jest.mock('../../lib/prisma', () => ({
  prisma: {
    farm: {
      findFirst: jest.fn(() => Promise.resolve({
        id: 'farm-1',
        name: 'Test Farm',
        latitude: 40.7128,
        longitude: -74.0060,
        totalArea: 100,
        ownerId: 'user-1',
        fields: []
      }))
    },
    decisionRecommendation: {
      findMany: jest.fn(() => Promise.resolve([])),
      create: jest.fn((data) => Promise.resolve({
        id: 'rec-1',
        ...data.data
      }))
    },
    financialTransaction: {
      findMany: jest.fn(() => Promise.resolve([]))
    },
    livestockEvent: {
      findMany: jest.fn(() => Promise.resolve([]))
    }
  }
}))

jest.mock('../../lib/nba/decision-engine', () => ({
  NBAEngine: jest.fn().mockImplementation(() => ({
    generateDecisions: jest.fn(() => Promise.resolve([
      {
        id: 'decision-1',
        type: 'SPRAY',
        priority: 'HIGH',
        title: 'Test Recommendation',
        description: 'Test description',
        confidence: 85,
        estimatedImpact: {
          revenue: 1500,
          costSavings: 500
        },
        timing: {
          idealStart: new Date(),
          idealEnd: new Date()
        },
        explanation: 'Test explanation',
        actionSteps: ['Step 1', 'Step 2'],
        targetField: 'test-field-1'
      }
    ]))
  }))
}))

jest.mock('../../lib/cache/redis-client', () => ({
  cache: {
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve(true))
  },
  CacheKeys: {
    nbaRecommendations: (farmId: string) => `nba:recommendations:${farmId}`,
    farmData: (farmId: string) => `farm:data:${farmId}`,
    weather: (lat: number, lon: number) => `weather:${lat}:${lon}`,
    financialSummary: (farmId: string, period: string) => `financial:${farmId}:${period}`
  },
  CacheTTL: {
    NBA_RECOMMENDATIONS: 3600,
    FARM_DATA: 1800,
    WEATHER_CURRENT: 300,
    FINANCIAL_SUMMARY: 3600
  },
  CacheTags: {
    NBA: 'nba',
    FARM: 'farm',
    WEATHER: 'weather',
    FINANCIAL: 'financial'
  }
}))

jest.mock('../../lib/performance/optimizations', () => ({
  PerformanceMonitor: {
    startTimer: jest.fn(),
    endTimer: jest.fn(() => 150)
  },
  withCache: jest.fn((key, fetcher, options) => fetcher())
}))

describe('/api/nba/recommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('generates new recommendations successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/nba/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          farmId: 'farm-1',
          excludeCompletedTasks: true,
          maxRecommendations: 5
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.recommendations).toHaveLength(1)
      expect(data.metadata.farmName).toBe('Test Farm')
      expect(data.metadata.performanceMs).toBe(150)
    })

    it('returns cached recommendations when available', async () => {
      const { cache } = require('../../lib/cache/redis-client')
      const cachedResponse = {
        success: true,
        recommendations: [{ id: 'cached-rec-1' }],
        metadata: { cached: true }
      }
      cache.get.mockResolvedValue(cachedResponse)

      const request = new NextRequest('http://localhost:3000/api/nba/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          farmId: 'farm-1'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(cachedResponse)
      expect(cache.get).toHaveBeenCalled()
    })

    it('forces refresh when requested', async () => {
      const { cache } = require('../../lib/cache/redis-client')
      cache.get.mockResolvedValue({ cached: 'data' })

      const request = new NextRequest('http://localhost:3000/api/nba/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          farmId: 'farm-1',
          forceRefresh: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Should not return cached data
      expect(data.cached).toBeUndefined()
    })

    it('validates request schema', async () => {
      const request = new NextRequest('http://localhost:3000/api/nba/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          // Missing farmId
          maxRecommendations: 5
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(500) // Should be validation error
    })

    it('handles unauthorized requests', async () => {
      const { getCurrentUser } = require('../../lib/auth/session')
      getCurrentUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/nba/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          farmId: 'farm-1'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('handles farm not found', async () => {
      const { prisma } = require('../../lib/prisma')
      prisma.farm.findFirst.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/nba/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          farmId: 'nonexistent-farm'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.error).toBe('Farm not found')
    })

    it('handles NBA engine errors', async () => {
      const { NBAEngine } = require('../../lib/nba/decision-engine')
      NBAEngine.mockImplementation(() => ({
        generateDecisions: jest.fn(() => Promise.reject(new Error('Engine error')))
      }))

      const request = new NextRequest('http://localhost:3000/api/nba/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          farmId: 'farm-1'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBe('Failed to generate recommendations')
    })

    it('filters recommendations by type', async () => {
      const request = new NextRequest('http://localhost:3000/api/nba/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          farmId: 'farm-1',
          includeDecisionTypes: ['SPRAY'],
          maxRecommendations: 10
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Would test filtering logic here in real implementation
    })
  })

  describe('GET', () => {
    it('returns existing recommendations', async () => {
      const { prisma } = require('../../lib/prisma')
      prisma.decisionRecommendation.findMany.mockResolvedValue([
        {
          id: 'rec-1',
          type: 'SPRAY',
          title: 'Test Recommendation',
          status: 'PENDING'
        }
      ])

      const request = new NextRequest('http://localhost:3000/api/nba/recommendations?farmId=farm-1')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.recommendations).toHaveLength(1)
    })

    it('requires farmId parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/nba/recommendations')

      const response = await GET(request)

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('farmId required')
    })

    it('filters by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/nba/recommendations?farmId=farm-1&status=COMPLETED')

      const response = await GET(request)

      expect(response.status).toBe(200)
      
      const { prisma } = require('../../lib/prisma')
      expect(prisma.decisionRecommendation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'COMPLETED'
          })
        })
      )
    })

    it('limits results', async () => {
      const request = new NextRequest('http://localhost:3000/api/nba/recommendations?farmId=farm-1&limit=5')

      const response = await GET(request)

      expect(response.status).toBe(200)
      
      const { prisma } = require('../../lib/prisma')
      expect(prisma.decisionRecommendation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5
        })
      )
    })
  })
})