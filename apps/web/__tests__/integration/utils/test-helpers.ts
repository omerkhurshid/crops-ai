import { createMocks } from 'node-mocks-http'
import type { NextRequest } from 'next/server'

/**
 * Creates a mock Next.js request for testing API routes
 */
export function createMockRequest(options: {
  method: string
  url?: string
  body?: any
  query?: Record<string, string>
  headers?: Record<string, string>
}) {
  const { req } = createMocks({
    method: options.method,
    url: options.url,
    body: options.body,
    query: options.query,
    headers: {
      'content-type': 'application/json',
      ...options.headers,
    },
  })

  return req as unknown as NextRequest
}

/**
 * Extracts JSON data from a Response object
 */
export async function extractJsonFromResponse(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${text}`)
  }
}

/**
 * Validates API error response structure
 */
export function validateErrorResponse(data: any, expectedStatus?: number) {
  expect(data).toHaveProperty('error')
  expect(data.error).toHaveProperty('message')
  expect(typeof data.error.message).toBe('string')
  
  if (expectedStatus) {
    expect(data.error).toHaveProperty('status', expectedStatus)
  }
}

/**
 * Validates successful API response structure
 */
export function validateSuccessResponse(data: any, requiredFields: string[]) {
  requiredFields.forEach(field => {
    expect(data).toHaveProperty(field)
  })
}

/**
 * Mock farm data for testing
 */
export const mockFarmData = {
  id: 'test-farm-1',
  name: 'Test Farm',
  location: 'Test Location',
  coordinates: {
    lat: 40.7128,
    lon: -74.0060
  },
  size: 100,
  crops: ['corn', 'soybeans'],
  ownerId: 'test-user-1'
}

/**
 * Mock field data for testing
 */
export const mockFieldData = {
  id: 'test-field-1',
  name: 'Test Field',
  farmId: 'test-farm-1',
  cropType: 'corn',
  coordinates: {
    lat: 40.7128,
    lon: -74.0060
  },
  size: 25,
  plantingDate: '2024-04-15',
  expectedHarvestDate: '2024-09-15'
}

/**
 * Mock weather data for testing
 */
export const mockWeatherData = {
  temperature: 75,
  humidity: 65,
  windSpeed: 12,
  pressure: 30.15,
  condition: 'partly_cloudy',
  visibility: 10,
  uvIndex: 6,
  cloudCover: 25
}

/**
 * Mock ML prediction request data
 */
export const mockPredictionData = {
  farmId: 'test-farm-1',
  fieldId: 'test-field-1',
  cropType: 'corn',
  features: {
    weather: {
      temperature: 75,
      humidity: 65,
      rainfall: 2.5,
      windSpeed: 12
    },
    soil: {
      ph: 6.5,
      nitrogen: 45,
      phosphorus: 30,
      potassium: 40,
      organicMatter: 3.2
    },
    satellite: {
      ndvi: 0.75,
      moisture: 0.65,
      greenness: 0.8
    }
  }
}

/**
 * Validation helpers for coordinate ranges
 */
export const coordinateValidators = {
  isValidLatitude: (lat: number) => lat >= -90 && lat <= 90,
  isValidLongitude: (lon: number) => lon >= -180 && lon <= 180,
  isValidNDVI: (ndvi: number) => ndvi >= -1 && ndvi <= 1,
  isValidConfidence: (confidence: number) => confidence >= 0 && confidence <= 1
}

/**
 * Test timeout constants
 */
export const TEST_TIMEOUTS = {
  FAST: 5000,      // 5 seconds for quick API calls
  MEDIUM: 10000,   // 10 seconds for moderate processing
  SLOW: 20000,     // 20 seconds for heavy processing (ML, satellite)
  VERY_SLOW: 30000 // 30 seconds for very heavy operations
}

/**
 * Common test patterns for API responses
 */
export const commonResponseValidators = {
  validateTimestamp: (timestamp: string) => {
    expect(typeof timestamp).toBe('string')
    expect(new Date(timestamp).getTime()).not.toBeNaN()
  },
  
  validateUUID: (id: string) => {
    expect(typeof id).toBe('string')
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  },
  
  validateURL: (url: string) => {
    expect(typeof url).toBe('string')
    expect(url).toMatch(/^https?:\/\/.+/)
  }
}