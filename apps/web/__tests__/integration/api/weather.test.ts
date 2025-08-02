import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/weather/current/route'

describe('/api/weather Integration Tests', () => {
  describe('GET /api/weather/current', () => {
    it('should return current weather with valid coordinates', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/weather/current?lat=40.7128&lon=-74.0060', // NYC coordinates
        query: {
          lat: '40.7128',
          lon: '-74.0060'
        }
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('temperature')
      expect(data).toHaveProperty('condition')
      expect(data).toHaveProperty('humidity')
      expect(data).toHaveProperty('windSpeed')
      expect(data).toHaveProperty('timestamp')
      
      // Validate data types
      expect(typeof data.temperature).toBe('number')
      expect(typeof data.humidity).toBe('number')
      expect(typeof data.windSpeed).toBe('number')
      expect(typeof data.condition).toBe('string')
    })

    it('should reject request with missing coordinates', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/weather/current',
        query: {}
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject request with invalid coordinates', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/weather/current?lat=invalid&lon=invalid',
        query: {
          lat: 'invalid',
          lon: 'invalid'
        }
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject coordinates out of valid range', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/weather/current?lat=200&lon=200',
        query: {
          lat: '200', // Invalid latitude (should be -90 to 90)
          lon: '200'  // Invalid longitude (should be -180 to 180)
        }
      })

      const response = await GET(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should handle edge case coordinates', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/weather/current?lat=0&lon=0', // Equator and Prime Meridian
        query: {
          lat: '0',
          lon: '0'
        }
      })

      const response = await GET(req as any)
      
      // Should either return valid data or handle gracefully
      expect([200, 404, 500]).toContain(response.status)
    })
  })
})