import { createMocks } from 'node-mocks-http'
import { GET as getImages } from '@/app/api/satellite/images/route'
import { POST as calculateNDVI } from '@/app/api/satellite/ndvi/route'
import { POST as detectBoundaries } from '@/app/api/satellite/boundaries/route'

describe('/api/satellite Integration Tests', () => {
  describe('GET /api/satellite/images', () => {
    it('should return satellite images with valid coordinates and date', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/satellite/images?lat=40.7128&lon=-74.0060&date=2024-01-01',
        query: {
          lat: '40.7128',
          lon: '-74.0060',
          date: '2024-01-01'
        }
      })

      const response = await getImages(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('images')
      expect(Array.isArray(data.images)).toBe(true)
      
      if (data.images.length > 0) {
        data.images.forEach((image: any) => {
          expect(image).toHaveProperty('url')
          expect(image).toHaveProperty('date')
          expect(image).toHaveProperty('cloudCover')
          expect(image).toHaveProperty('resolution')
        })
      }
    })

    it('should reject request with missing coordinates', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/satellite/images?date=2024-01-01',
        query: {
          date: '2024-01-01'
        }
      })

      const response = await getImages(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject request with invalid date format', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/satellite/images?lat=40.7128&lon=-74.0060&date=invalid-date',
        query: {
          lat: '40.7128',
          lon: '-74.0060',
          date: 'invalid-date'
        }
      })

      const response = await getImages(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('POST /api/satellite/ndvi', () => {
    it('should calculate NDVI with valid image data', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          imageUrl: 'https://example.com/satellite-image.tif',
          coordinates: {
            lat: 40.7128,
            lon: -74.0060
          },
          date: '2024-01-01'
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await calculateNDVI(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('ndvi')
      expect(data).toHaveProperty('metadata')
      
      // Validate NDVI value range (-1 to 1)
      expect(typeof data.ndvi.averageValue).toBe('number')
      expect(data.ndvi.averageValue).toBeGreaterThanOrEqual(-1)
      expect(data.ndvi.averageValue).toBeLessThanOrEqual(1)
    })

    it('should reject request with missing image URL', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          coordinates: {
            lat: 40.7128,
            lon: -74.0060
          },
          date: '2024-01-01'
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await calculateNDVI(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject request with invalid coordinates', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          imageUrl: 'https://example.com/satellite-image.tif',
          coordinates: {
            lat: 200, // Invalid latitude
            lon: 200  // Invalid longitude
          },
          date: '2024-01-01'
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await calculateNDVI(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('POST /api/satellite/boundaries', () => {
    it('should detect field boundaries with valid image data', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          imageUrl: 'https://example.com/satellite-image.tif',
          coordinates: {
            lat: 40.7128,
            lon: -74.0060
          },
          algorithm: 'edge-detection'
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await detectBoundaries(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('boundaries')
      expect(Array.isArray(data.boundaries)).toBe(true)
      
      if (data.boundaries.length > 0) {
        data.boundaries.forEach((boundary: any) => {
          expect(boundary).toHaveProperty('coordinates')
          expect(boundary).toHaveProperty('area')
          expect(boundary).toHaveProperty('confidence')
        })
      }
    })

    it('should reject request with unsupported algorithm', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          imageUrl: 'https://example.com/satellite-image.tif',
          coordinates: {
            lat: 40.7128,
            lon: -74.0060
          },
          algorithm: 'unsupported-algorithm'
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await detectBoundaries(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should handle missing algorithm parameter', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          imageUrl: 'https://example.com/satellite-image.tif',
          coordinates: {
            lat: 40.7128,
            lon: -74.0060
          }
          // Missing algorithm
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await detectBoundaries(req as any)
      
      // Should either use default algorithm or return error
      expect([200, 400]).toContain(response.status)
    })
  })
})