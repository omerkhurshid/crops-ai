import { createMocks } from 'node-mocks-http'
import { GET as getModels } from '@/app/api/ml/models/route'
import { POST as predict } from '@/app/api/ml/predict/route'
import { GET as getRecommendations } from '@/app/api/ml/recommendations/route'

describe('/api/ml Integration Tests', () => {
  describe('GET /api/ml/models', () => {
    it('should return available ML models', async () => {
      const { req } = createMocks({
        method: 'GET',
      })

      const response = await getModels(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data.models)).toBe(true)
      expect(data.models.length).toBeGreaterThan(0)
      
      // Validate model structure
      data.models.forEach((model: any) => {
        expect(model).toHaveProperty('id')
        expect(model).toHaveProperty('name')
        expect(model).toHaveProperty('version')
        expect(model).toHaveProperty('type')
        expect(model).toHaveProperty('description')
      })
    })

    it('should include metadata about models', async () => {
      const { req } = createMocks({
        method: 'GET',
      })

      const response = await getModels(req as any)
      const data = await response.json()

      expect(data).toHaveProperty('metadata')
      expect(data.metadata).toHaveProperty('totalModels')
      expect(data.metadata).toHaveProperty('lastUpdated')
    })
  })

  describe('POST /api/ml/predict', () => {
    it('should make yield prediction with valid farm data', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          farmId: 'farm-1',
          fieldId: 'field-1',
          cropType: 'corn',
          features: {
            weather: {
              temperature: 75,
              humidity: 65,
              rainfall: 2.5
            },
            soil: {
              ph: 6.5,
              nitrogen: 45,
              phosphorus: 30,
              potassium: 40
            },
            satellite: {
              ndvi: 0.75,
              moisture: 0.65
            }
          }
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await predict(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('prediction')
      expect(data.prediction).toHaveProperty('yield')
      expect(data.prediction).toHaveProperty('confidence')
      expect(data.prediction).toHaveProperty('factors')
      
      // Validate prediction values
      expect(typeof data.prediction.yield).toBe('number')
      expect(data.prediction.yield).toBeGreaterThan(0)
      expect(typeof data.prediction.confidence).toBe('number')
      expect(data.prediction.confidence).toBeGreaterThanOrEqual(0)
      expect(data.prediction.confidence).toBeLessThanOrEqual(1)
    })

    it('should reject prediction with missing required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          farmId: 'farm-1',
          // Missing fieldId, cropType, and features
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await predict(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject prediction with invalid crop type', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          farmId: 'farm-1',
          fieldId: 'field-1',
          cropType: 'invalid-crop',
          features: {
            weather: { temperature: 75, humidity: 65, rainfall: 2.5 },
            soil: { ph: 6.5, nitrogen: 45, phosphorus: 30, potassium: 40 },
            satellite: { ndvi: 0.75, moisture: 0.65 }
          }
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await predict(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('GET /api/ml/recommendations', () => {
    it('should return recommendations with valid farm ID', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/ml/recommendations?farmId=farm-1',
        query: {
          farmId: 'farm-1'
        }
      })

      const response = await getRecommendations(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('recommendations')
      expect(Array.isArray(data.recommendations)).toBe(true)
      
      // Validate recommendation structure
      data.recommendations.forEach((rec: any) => {
        expect(rec).toHaveProperty('type')
        expect(rec).toHaveProperty('priority')
        expect(rec).toHaveProperty('action')
        expect(rec).toHaveProperty('description')
        expect(rec).toHaveProperty('confidence')
      })
    })

    it('should reject request with missing farm ID', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/ml/recommendations',
        query: {}
      })

      const response = await getRecommendations(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should handle non-existent farm ID gracefully', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/ml/recommendations?farmId=non-existent',
        query: {
          farmId: 'non-existent'
        }
      })

      const response = await getRecommendations(req as any)
      
      // Should return empty recommendations or 404
      expect([200, 404]).toContain(response.status)
    })
  })
})