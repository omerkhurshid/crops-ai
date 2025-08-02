const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Custom Jest configuration for integration tests
const customJestConfig = {
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/integration/setup/test-env.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node', // Use node environment for API integration tests
  testMatch: [
    '<rootDir>/__tests__/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/app/api/**/*.{js,ts,jsx,tsx}',
    '!src/app/api/**/route.{js,ts,jsx,tsx}', // Exclude route handlers for now as they need special handling
    '!**/*.d.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '/dist/',
  ],
  testTimeout: 15000, // Increased timeout for integration tests
  maxWorkers: 1, // Run integration tests sequentially to avoid conflicts
  // Enable verbose output for better debugging
  verbose: true,
  // Clear mocks between tests
  clearMocks: true,
  // Reset modules between tests
  resetModules: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)