/**
 * Test environment setup for integration tests
 * Sets up necessary environment variables and mocks for testing
 */

// Mock environment variables for testing
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-integration-tests'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'

// Mock external API keys (don't use real keys in tests)
process.env.OPENWEATHER_API_KEY = 'test-openweather-key'
process.env.SENTINEL_HUB_CLIENT_ID = 'test-sentinel-client-id'
process.env.SENTINEL_HUB_CLIENT_SECRET = 'test-sentinel-client-secret'

// Mock database and cache URLs
process.env.DATABASE_URL = 'file:./test.db'
process.env.REDIS_URL = 'redis://localhost:6379/1'

// Mock other service URLs
process.env.CLOUDINARY_URL = 'cloudinary://test:test@test'

// Disable console warnings during tests
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

beforeAll(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
})