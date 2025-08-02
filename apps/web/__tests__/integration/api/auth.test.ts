import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/auth/register/route'

describe('/api/auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should reject registration with invalid email', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: 'ValidPass123!',
          name: 'Test User'
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error.message).toContain('email')
    })

    it('should reject registration with weak password', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User'
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error.message).toContain('password')
    })

    it('should reject registration with missing required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com'
          // Missing password and name
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

    it('should reject registration with empty request body', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {},
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should handle malformed JSON', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: 'invalid json',
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(req as any)

      expect(response.status).toBe(400)
    })
  })
})