# Test Coverage Documentation

This document outlines the comprehensive test coverage setup for the Crops.AI web application.

## Current Status - Phase 9 Complete ✅

**Last Updated:** August 2, 2025  
**Status:** Testing & Quality Assurance Phase 100% Complete  
**Next Phase:** Phase 10 - Beta Launch & Iteration

### 🏆 **PHASE 9: TESTING & QUALITY ASSURANCE - 100% COMPLETE**

#### 🧪 **Testing Infrastructure (Completed)**
- ✅ **Jest & React Testing Library** - Full setup with TypeScript support
- ✅ **API Testing Framework** - Supertest-based integration testing
- ✅ **End-to-End Testing** - Playwright with multi-browser support
- ✅ **Test Database Setup** - SQLite-based test environment with Prisma
- ✅ **Comprehensive Mocking** - External services, database, and data factories

#### 📊 **Test Coverage System (Completed)**
- ✅ **Automated Coverage Reporting** - 80% line coverage, 70% branch/function coverage
- ✅ **GitHub Actions Integration** - Automated CI/CD with coverage uploads
- ✅ **Codecov Integration** - Historical tracking and PR comments
- ✅ **Local Coverage Tools** - HTML reports, badges, and threshold validation
- ✅ **Multi-format Reports** - LCOV, Cobertura, HTML, and JSON formats

#### 🛡️ **Security & Quality (Completed)**
- ✅ **ESLint Security Plugin** - Configured with security rules and object injection detection
- ✅ **Security Audit System** - Comprehensive vulnerability scanning with npm audit and Snyk
- ✅ **OWASP Compliance** - Security checklist and compliance documentation
- ✅ **Automated Security Testing** - GitHub Actions workflow for continuous security monitoring

#### ⚡ **Performance Testing (Completed)**
- ✅ **Artillery.js Load Testing** - Comprehensive API endpoint testing with performance thresholds
- ✅ **Bundle Size Analysis** - Automated bundle size monitoring and optimization
- ✅ **Lighthouse CI** - Core Web Vitals monitoring and performance audits
- ✅ **Performance Budgets** - Automated performance regression detection in CI/CD
- ✅ **GitHub Actions Integration** - Automated performance testing on every commit

#### 📝 **Test Suite Coverage**

**Unit Tests (35+ tests)**
- React components (Button, Card, Input, Authentication forms)
- API utilities (Error handling, validation, middleware)
- Business logic (ML models, yield prediction, data pipeline)
- Service functions (Weather, satellite, database operations)

**Integration Tests (20+ tests)**
- Health check API endpoints
- Authentication & user management APIs  
- Weather service integration
- Machine learning prediction APIs
- Satellite image processing APIs
- Database operations and data flow

**End-to-End Tests (15+ scenarios)**
- Complete authentication flow
- Dashboard navigation and functionality
- Farm management workflows
- Responsive design validation
- Error handling and edge cases

#### 🏗️ **Testing Architecture**

**Three-Layer Testing Pyramid**
```
    /\     E2E Tests (Playwright)
   /  \    ↑ User workflows & critical paths
  /____\   
 /      \  Integration Tests (Jest + Supertest)  
/        \ ↑ API endpoints & data flow
/__________\
Unit Tests (Jest + RTL)
↑ Components, utilities, business logic
```

**Mock Strategy**
- External APIs: Weather, Satellite, ML services
- Database: Prisma mocks + SQLite test database
- Authentication: NextAuth session mocks
- File Storage: Cloudinary/S3 mocks
- Cache: Redis mock with in-memory storage

**Data Management**
- Faker.js Integration: Realistic test data generation
- Factory Pattern: Consistent, relationship-aware data creation
- Test Database: Isolated, transactional test environment
- Seed Data: Pre-configured scenarios for complex testing

#### 📋 **Quality Metrics**

**Current Coverage Status**
- Lines: 80%+ (Target: 90%)
- Functions: 70%+ (Target: 85%)
- Branches: 70%+ (Target: 80%)
- Statements: 80%+ (Target: 90%)

**Test Performance**
- Unit Tests: ~2 seconds (fast feedback)
- Integration Tests: ~10 seconds (realistic scenarios)
- E2E Tests: ~60 seconds (complete workflows)

#### 🔧 **Development Tools**

**Available Commands**
```bash
# Unit Testing
npm run test              # Run unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage

# Integration Testing  
npm run test:integration  # API integration tests
npm run test:integration:coverage # With coverage

# End-to-End Testing
npm run test:e2e         # Full E2E suite
npm run test:e2e:ui      # Interactive UI mode
npm run test:e2e:debug   # Debug mode

# Coverage Reporting
npm run coverage:report  # Comprehensive report
npm run coverage:open    # Open HTML report
npm run coverage:serve   # Local server

# Complete Testing
npm run test:all         # All test suites
```

**CI/CD Integration**
- GitHub Actions: Automated testing on push/PR
- Multi-Node Testing: Node.js 18.x and 20.x
- Coverage Upload: Automatic Codecov integration
- PR Comments: Coverage change notifications
- Artifact Storage: Coverage reports archived

#### 📚 **Documentation Completed**
- Testing Guide: Comprehensive testing strategies (`__tests__/README.md`)
- Mock Documentation: Mock usage patterns (`__tests__/mocks/README.md`)
- Coverage Guide: Coverage reporting documentation (this file)
- Example Tests: Real-world testing examples across all test types

#### 🎯 **Next Steps (Security & Performance)**
1. **Security Audit**: Vulnerability scanning, dependency audits, OWASP compliance
2. **Performance Testing**: Load testing, stress testing, benchmarking
3. **Beta Launch Preparation**: Production-ready quality gates

---

## Overview

We maintain high code quality through automated test coverage reporting across all test types:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and data flow testing
- **End-to-End Tests**: Complete user workflow testing

## Coverage Requirements

### Coverage Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Lines | 80% | 90% |
| Functions | 70% | 85% |
| Branches | 70% | 80% |
| Statements | 80% | 90% |

### Coverage Scope

**Included in Coverage:**
- All source files in `src/` directory
- Components, services, and utilities
- API routes and GraphQL resolvers
- Business logic and data processing

**Excluded from Coverage:**
- Type definition files (`*.d.ts`)
- Story files (`*.stories.{js,jsx,ts,tsx}`)
- Index files (`**/index.{js,jsx,ts,tsx}`)
- Layout and page components (Next.js specific)
- Database connection files
- Middleware files

## Running Coverage Reports

### Local Development

```bash
# Run unit tests with coverage
npm run test:coverage

# Run integration tests with coverage
npm run test:integration:coverage

# Generate comprehensive coverage report
npm run coverage:report

# Open coverage report in browser
npm run coverage:open

# Serve coverage report on local server
npm run coverage:serve
```

### Continuous Integration

Coverage reports are automatically generated on:
- Every push to `main` and `develop` branches
- All pull requests
- Release builds

### Coverage Report Generation

The `coverage:report` script performs the following:

1. **Runs all test suites** with coverage collection
2. **Merges coverage data** from different test types
3. **Generates HTML reports** for visual inspection
4. **Creates coverage badges** for documentation
5. **Validates coverage thresholds** and fails if not met

## Coverage Reports Structure

```
coverage/
├── lcov-report/           # HTML coverage report
│   ├── index.html         # Main coverage overview
│   └── ...               # File-by-file coverage details
├── reports/               # Individual test suite reports
│   ├── unit-lcov.info     # Unit test coverage data
│   ├── integration-lcov.info # Integration test coverage
│   ├── merged-lcov.info   # Combined coverage data
│   └── html/              # Merged HTML report
├── lcov.info             # Latest coverage data (LCOV format)
├── cobertura-coverage.xml # Cobertura format (for CI tools)
└── README.md             # Coverage summary with badges
```

## GitHub Actions Integration

### Automated Coverage Workflow

**File:** `.github/workflows/test-coverage.yml`

**Triggers:**
- Push to main/develop branches
- Pull requests
- Manual workflow dispatch

**Actions Performed:**
1. Run tests across Node.js versions (18.x, 20.x)
2. Generate coverage reports
3. Upload to Codecov
4. Comment on pull requests with coverage changes
5. Archive coverage artifacts

### Codecov Integration

Coverage data is automatically uploaded to [Codecov](https://codecov.io) for:
- Historical coverage tracking
- Pull request coverage comparison
- Coverage visualization
- Team collaboration features

**Setup Required:**
- Add `CODECOV_TOKEN` to GitHub repository secrets
- Configure Codecov webhook for pull request comments

### Pull Request Coverage Comments

Automated comments on pull requests include:
- Coverage percentage changes
- Files with significant coverage changes
- Coverage threshold violations
- Direct links to detailed reports

## Best Practices

### Writing Testable Code

1. **Keep functions pure** when possible
2. **Inject dependencies** for easier mocking
3. **Separate business logic** from framework code
4. **Use meaningful test descriptions**
5. **Test edge cases** and error conditions

### Coverage Guidelines

1. **Aim for high coverage** but prioritize meaningful tests
2. **Test behavior, not implementation**
3. **Cover critical paths** thoroughly
4. **Don't ignore uncovered code** - either test it or justify exclusion
5. **Review coverage reports** regularly

### Handling Low Coverage

When coverage drops below thresholds:

1. **Identify uncovered areas** using HTML reports
2. **Prioritize critical code paths**
3. **Add tests for uncovered branches**
4. **Consider excluding non-testable code**
5. **Update tests when refactoring**

## Coverage Exclusions

### Programmatic Exclusions

Use coverage comments to exclude specific lines:

```typescript
// istanbul ignore next
function debugOnlyFunction() {
  // This function is excluded from coverage
}

// istanbul ignore if
if (process.env.NODE_ENV === 'development') {
  // Development-only code excluded
}
```

### Configuration Exclusions

Update `jest.config.js` to exclude files:

```javascript
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}',
  '!src/**/*.d.ts',           // Type definitions
  '!src/**/*.stories.tsx',    // Storybook files
  '!src/**/index.{js,ts}',    // Index files
]
```

## Troubleshooting

### Common Issues

**Coverage not updating:**
- Clear coverage cache: `rm -rf coverage/`
- Ensure all test files are running
- Check for syntax errors in test files

**Low coverage warnings:**
- Review uncovered lines in HTML report
- Add tests for missed branches
- Consider if code is actually testable

**CI failures:**
- Check coverage thresholds in configuration
- Verify all required environment variables
- Review test stability and flakiness

### Debug Commands

```bash
# View current coverage without running tests
npm run coverage:open

# Run specific test file with coverage
npx jest --coverage src/components/Button.test.tsx

# Generate coverage for specific directory
npx jest --coverage --collectCoverageOnlyFrom=src/lib/**

# Debug coverage collection
npx jest --coverage --verbose
```

## Integration with IDEs

### VS Code

**Extensions:**
- Coverage Gutters: Shows coverage directly in editor
- Jest: Integrated test running and coverage

**Configuration:**
```json
{
  "coverage-gutters.coverageFileNames": [
    "lcov.info",
    "coverage/lcov.info"
  ],
  "coverage-gutters.showLineCoverage": true,
  "coverage-gutters.showRulerCoverage": true
}
```

### WebStorm/IntelliJ

Built-in coverage support:
1. Run tests with coverage
2. View coverage in editor gutters
3. Generate coverage reports
4. Set coverage thresholds

## Monitoring and Alerts

### Coverage Tracking

- **Codecov Dashboard**: Historical trends and insights
- **GitHub Actions**: Automated threshold enforcement
- **Pull Request Reviews**: Coverage change validation

### Alerts Setup

Configure alerts for:
- Coverage drops below threshold
- Significant coverage decreases
- Long-term coverage trends
- Critical file coverage changes

## Contributing

When contributing code:

1. **Run tests locally** before submitting PR
2. **Ensure coverage thresholds** are met
3. **Add tests for new features**
4. **Update tests when modifying code**
5. **Review coverage reports** in PR comments

For questions about test coverage, please refer to the testing documentation or contact the development team.