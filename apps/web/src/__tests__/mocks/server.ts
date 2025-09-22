/**
 * MSW server setup for API mocking
 */

import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock data
const mockFarm = {
  id: 'farm-1',
  name: 'Test Farm',
  latitude: 40.7128,
  longitude: -74.0060,
  totalArea: 100,
  ownerId: 'user-1',
  fields: [
    {
      id: 'test-field-1',
      name: 'North Field',
      area: 50,
      crops: [
        {
          cropType: 'corn',
          plantingDate: '2024-04-01',
          status: 'GROWING'
        }
      ]
    }
  ]
}

const mockRecommendations = {
  success: true,
  recommendations: [
    {
      id: 'rec-1',
      type: 'SPRAY',
      priority: 'HIGH',
      title: 'Apply Fungicide to North Field',
      description: 'Weather conditions are optimal for fungicide application',
      confidence: 85,
      totalScore: 78,
      timing: {
        idealStart: '2024-05-01T06:00:00Z',
        idealEnd: '2024-05-01T18:00:00Z'
      },
      estimatedImpact: {
        revenue: 1500,
        costSavings: 500
      },
      explanation: 'High humidity detected, preventive fungicide application recommended',
      actionSteps: ['Check sprayer', 'Mix chemicals', 'Apply in morning'],
      status: 'PENDING'
    }
  ],
  metadata: {
    farmName: 'Test Farm',
    totalDecisionsEvaluated: 5,
    recommendationsReturned: 1,
    averageConfidence: 85,
    generatedAt: '2024-05-01T12:00:00Z'
  }
}

const mockWeather = {
  date: '2024-05-01T12:00:00Z',
  temperature: 22,
  humidity: 65,
  precipitation: 0,
  windSpeed: 12,
  windDirection: 180,
  pressure: 1013,
  cloudCover: 30,
  conditions: 'partly cloudy'
}

const mockFinancialData = {
  totalRevenue: 50000,
  totalExpenses: 35000,
  netProfit: 15000,
  transactions: [
    {
      id: 'tx-1',
      type: 'EXPENSE',
      amount: 1500,
      category: 'FERTILIZER',
      description: 'Spring fertilizer application',
      transactionDate: '2024-04-15T00:00:00Z'
    }
  ]
}

// Request handlers
export const handlers = [
  // NBA Recommendations
  http.post('/api/nba/recommendations', () => {
    return HttpResponse.json(mockRecommendations)
  }),

  http.get('/api/nba/recommendations', () => {
    return HttpResponse.json({ recommendations: mockRecommendations.recommendations })
  }),

  // Farm data
  http.get('/api/farms/:farmId', ({ params }) => {
    return HttpResponse.json(mockFarm)
  }),

  http.get('/api/farms', () => {
    return HttpResponse.json([mockFarm])
  }),

  // Weather data
  http.get('/api/weather/current', () => {
    return HttpResponse.json(mockWeather)
  }),

  http.get('/api/weather/forecast', () => {
    return HttpResponse.json({
      forecast: Array.from({ length: 7 }, (_, i) => ({
        ...mockWeather,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        temperature: 20 + Math.random() * 10
      }))
    })
  }),

  // Financial data
  http.get('/api/financial/summary', () => {
    return HttpResponse.json(mockFinancialData)
  }),

  http.get('/api/financial/transactions', () => {
    return HttpResponse.json({ transactions: mockFinancialData.transactions })
  }),

  // Authentication
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
      }
    })
  }),

  // Error handlers for testing error states
  http.get('/api/error/500', () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.get('/api/error/404', () => {
    return new HttpResponse(null, { status: 404 })
  }),

  http.get('/api/error/timeout', () => {
    return new Promise(() => {}) // Never resolves to simulate timeout
  }),
]

export const server = setupServer(...handlers)