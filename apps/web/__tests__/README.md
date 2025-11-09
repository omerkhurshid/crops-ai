# Testing Documentation

This directory contains the comprehensive testing setup for the Cropple.ai web application.

## Testing Strategy

We implement a three-layer testing approach:

1. **Unit Tests** - Fast, isolated tests for individual components and functions
2. **Integration Tests** - API endpoint testing with mocked dependencies
3. **End-to-End Tests** - Full user workflow testing with Playwright

## Directory Structure

```
__tests__/
├── unit/                    # Unit tests (Jest + React Testing Library)
│   ├── components/          # React component tests
│   ├── lib/                 # Utility and service tests
│   └── utils/               # Test utilities and mocks
├── integration/             # Integration tests (Jest + Supertest)
│   ├── api/                 # API endpoint tests
│   ├── setup/               # Test environment setup
│   └── utils/               # Integration test helpers
├── e2e/                     # End-to-end tests (Playwright)
│   ├── auth.spec.ts         # Authentication flow tests
│   ├── navigation.spec.ts   # Navigation and routing tests
│   ├── dashboard.spec.ts    # Dashboard functionality tests
│   └── farms.spec.ts        # Farms page tests
└── README.md               # This file
```

## Running Tests

### Unit Tests
```bash
npm run test                 # Run all unit tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage report
```

### Integration Tests
```bash
npm run test:integration             # Run integration tests
npm run test:integration:watch       # Run integration tests in watch mode
npm run test:integration:coverage    # Run integration tests with coverage
```

### End-to-End Tests
```bash
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Run E2E tests with UI mode
npm run test:e2e:headed     # Run E2E tests in headed mode (visible browser)
npm run test:e2e:debug      # Run E2E tests in debug mode
```

### All Tests
```bash
npm run test:all            # Run all test suites
```

## Test Configuration

### Jest Configuration
- **Unit Tests**: `jest.config.js` - Uses jsdom environment for React components
- **Integration Tests**: `jest.integration.config.js` - Uses node environment for API testing

### Playwright Configuration
- **E2E Tests**: `playwright.config.ts` - Configured for multiple browsers and devices
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Features**: Screenshots on failure, video recording, trace collection

## Test Environment Setup

### Environment Variables
Integration and E2E tests use mock environment variables to avoid external dependencies:
- Mock API keys for weather and satellite services
- Test database URLs
- Mock authentication secrets

### Mock Services
- External API calls are mocked in test environment
- Database operations use test-specific configurations
- Authentication uses demo user credentials

## Writing Tests

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Integration Tests
```typescript
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/my-endpoint/route'

describe('/api/my-endpoint', () => {
  it('should return expected data', async () => {
    const { req } = createMocks({ method: 'GET' })
    const response = await GET(req as any)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('expectedField')
  })
})
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test'

test('should complete user workflow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'demo@cropple.ai')
  await page.fill('input[type="password"]', 'Demo123!')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

## Test Coverage

Coverage reports are generated for both unit and integration tests:
- **Unit Tests**: Components, utilities, and business logic
- **Integration Tests**: API endpoints and data flow
- **E2E Tests**: User workflows and critical paths

## Continuous Integration

All test suites are configured to run in CI environments:
- Unit tests run on every commit
- Integration tests verify API functionality
- E2E tests validate critical user workflows
- Coverage reports are generated and tracked

## Best Practices

1. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
2. **Fast Feedback**: Unit tests should run quickly for rapid development
3. **Isolation**: Tests should not depend on external services or state
4. **Reliability**: Tests should be deterministic and not flaky
5. **Maintainability**: Tests should be easy to understand and update

## Troubleshooting

### Common Issues
1. **Integration test failures**: Check environment variables and mock configurations
2. **E2E test timeouts**: Increase timeout values for slow operations
3. **Browser issues**: Ensure Playwright browsers are installed: `npx playwright install`

### Debug Mode
- Use `npm run test:e2e:debug` to debug E2E tests step by step
- Use `console.log` in integration tests for debugging API responses
- Check coverage reports to identify untested code paths