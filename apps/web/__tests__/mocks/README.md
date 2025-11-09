# Test Mocking Strategies

This directory contains comprehensive mocking utilities for testing the Cropple.ai application.

## Overview

We use a multi-layered mocking approach:

1. **Database Mocking** - Prisma client mocks and test database setup
2. **External Service Mocking** - Mock implementations for APIs (Weather, Satellite, etc.)
3. **Data Factories** - Realistic test data generation
4. **Test Database** - SQLite-based test database for integration tests

## Mock Files

### `prisma.ts`
- Deep mock of Prisma Client using `jest-mock-extended`
- Mock data generators for all database models
- Common mock implementations for typical database operations
- Test data sets for complex scenarios

### `external-services.ts`
- Mock implementations for external APIs:
  - OpenWeatherMap API
  - Sentinel Hub satellite imagery
  - Redis cache operations
  - Cloudinary image uploads
  - ML model predictions
- NextAuth session mocking

### `data-factory.ts`
- Factory classes for generating realistic test data
- Uses `@faker-js/faker` for random but realistic data
- Supports complex relationships between entities
- Time series data generation for weather and satellite data

## Usage Examples

### 1. Using Prisma Mocks

```typescript
import { prismaMock, mockGenerators, setupMockScenario } from '@/tests/mocks/prisma'

describe('User Service', () => {
  it('should find user by email', async () => {
    // Setup mock data
    const mockUser = mockGenerators.user({ email: 'test@example.com' })
    prismaMock.user.findUnique.mockResolvedValue(mockUser)
    
    // Test your service
    const user = await userService.findByEmail('test@example.com')
    
    expect(user).toEqual(mockUser)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' }
    })
  })
  
  it('should handle complete farm scenario', async () => {
    // Use pre-configured scenario
    const data = setupMockScenario.authenticatedUser()
    
    // Your test logic here
  })
})
```

### 2. Using External Service Mocks

```typescript
import { mockWeatherAPI, mockSentinelAPI, setupAllMocks } from '@/tests/mocks/external-services'

describe('Weather Service', () => {
  beforeEach(() => {
    setupAllMocks() // Setup all external mocks
  })
  
  it('should fetch current weather', async () => {
    // The mock is already set up to return data
    const weather = await weatherService.getCurrentWeather(40.7128, -74.0060)
    
    expect(weather.temperature).toBe(75.2)
    expect(weather.condition).toBe('Clouds')
  })
})
```

### 3. Using Data Factories

```typescript
import { testDataFactory } from '@/tests/utils/data-factory'

describe('Farm Management', () => {
  it('should create farm with fields', () => {
    // Generate a single farm
    const farm = testDataFactory.farm.build()
    
    // Generate multiple fields for the farm
    const fields = testDataFactory.field.buildMany(5, { farmId: farm.id })
    
    // Generate complete setup
    const setup = testDataFactory.createCompleteFarmSetup()
    // Returns: user, farm, fields, weatherData, satelliteImages, predictions
  })
})
```

### 4. Using Test Database

```typescript
import { testDatabaseHooks, getTestPrismaClient } from '@/tests/setup/test-db'
import { testDataFactory } from '@/tests/utils/data-factory'

describe('Integration Tests', () => {
  // Apply database hooks
  beforeAll(testDatabaseHooks.beforeAll)
  beforeEach(testDatabaseHooks.beforeEach)
  afterEach(testDatabaseHooks.afterEach)
  afterAll(testDatabaseHooks.afterAll)
  
  it('should query real database', async () => {
    const prisma = getTestPrismaClient()
    
    // Insert test data
    const userData = testDataFactory.user.build()
    const user = await prisma.user.create({ data: userData })
    
    // Query and verify
    const found = await prisma.user.findUnique({ where: { id: user.id } })
    expect(found).toBeTruthy()
  })
})
```

## Best Practices

### 1. Choose the Right Mock Level

- **Unit Tests**: Use Prisma mocks for fast, isolated tests
- **Integration Tests**: Use test database for realistic data interactions
- **E2E Tests**: Use minimal mocking, test against real services when possible

### 2. Reset Between Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks() // Clear mock call history
  mockRedisClient.reset() // Reset Redis mock data
  testDataFactory.reset() // Reset factory sequences
})
```

### 3. Use Factories for Consistency

```typescript
// Bad - Manual data creation
const user = {
  id: 'user-1',
  email: 'test@example.com',
  // Missing fields, inconsistent data
}

// Good - Use factory
const user = testDataFactory.user.build({
  email: 'test@example.com'
})
```

### 4. Mock at the Right Level

```typescript
// Mock external services, not your own code
jest.mock('@/lib/weather/service') // Bad
mockWeatherAPI.currentWeather() // Good

// Mock database client, not your repositories
jest.mock('@/repositories/user') // Bad
prismaMock.user.findUnique.mockResolvedValue() // Good
```

### 5. Use Realistic Data

```typescript
// Bad - Unrealistic data
const ndvi = 2.5 // NDVI should be -1 to 1

// Good - Use factory with realistic constraints
const image = testDataFactory.satellite.buildHealthyVegetation()
// Generates NDVI between 0.6 and 0.9
```

## Common Patterns

### Testing Error Scenarios

```typescript
it('should handle API errors', async () => {
  // Setup error mock
  global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
  
  // Test error handling
  await expect(weatherService.fetch()).rejects.toThrow('Network error')
})
```

### Testing Time-Dependent Code

```typescript
it('should generate weather forecast', async () => {
  // Use factory to generate time series
  const weatherData = testDataFactory.weather.buildTimeSeries('field-1', 7)
  
  // weatherData contains 7 days of hourly weather data
  expect(weatherData).toHaveLength(7 * 24)
})
```

### Testing with Relationships

```typescript
it('should load farm with all relations', async () => {
  const { user, farm, fields, weatherData } = testDataFactory.createCompleteFarmSetup()
  
  // Setup mocks with related data
  prismaMock.farm.findUnique.mockResolvedValue({
    ...farm,
    owner: user,
    fields: fields,
  })
})
```

## Debugging Tips

1. **Enable Prisma query logging** in tests:
   ```typescript
   const prisma = new PrismaClient({ log: ['query'] })
   ```

2. **Inspect mock calls**:
   ```typescript
   console.log(prismaMock.user.findMany.mock.calls)
   ```

3. **Use test database for debugging**:
   ```typescript
   // Temporarily skip mock and use real database
   const result = await getTestPrismaClient().user.findMany()
   console.log(result)
   ```

4. **Validate factory output**:
   ```typescript
   const farm = testDataFactory.farm.build()
   console.log(JSON.stringify(farm, null, 2))
   ```