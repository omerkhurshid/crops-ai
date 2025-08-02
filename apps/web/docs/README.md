# Crops.AI Documentation

This directory contains comprehensive documentation for the Crops.AI web application.

## Documentation Index

### Testing & Quality Assurance

- **[Testing Coverage](./testing-coverage.md)** - Complete test implementation status and coverage reports
- **[Security Checklist](./security-checklist.md)** - OWASP security controls and compliance documentation
- **[Performance Testing](./performance-testing.md)** - Performance testing setup, configuration, and best practices

### API Documentation

- **GraphQL Schema** - Available at `/api/graphql` when server is running
- **REST API Endpoints** - Documented in individual route files under `src/app/api/`

### Development Guides

#### Testing
- **Unit Testing**: Components, utilities, and business logic
- **Integration Testing**: API endpoints and database operations
- **End-to-End Testing**: Complete user workflows with Playwright
- **Security Testing**: Vulnerability scanning and OWASP compliance
- **Performance Testing**: Load testing and performance monitoring

#### Security
- **Authentication**: NextAuth.js implementation
- **Authorization**: Role-based access control
- **Input Validation**: Zod schema validation
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Vulnerability Management**: Continuous monitoring and remediation

#### Performance
- **Bundle Optimization**: Code splitting and tree shaking
- **Caching Strategy**: Redis and browser caching
- **Load Testing**: Artillery.js configuration
- **Monitoring**: Lighthouse CI and performance budgets

## Quick Reference

### Test Commands
```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # End-to-end tests

# Security testing
npm run security:scan    # Comprehensive security audit
npm run security:all     # All security checks

# Performance testing
npm run perf:test        # Performance test suite
npm run perf:load        # Load testing with Artillery
```

### Development Workflow

1. **Setup**: Install dependencies and configure environment
2. **Development**: Write code with TDD approach
3. **Testing**: Run comprehensive test suite
4. **Security**: Perform security scans
5. **Performance**: Validate performance metrics
6. **Documentation**: Update relevant documentation
7. **Pull Request**: Submit for review with all checks passing

### Quality Gates

All code must pass:
- ✅ Unit, integration, and e2e tests
- ✅ TypeScript type checking
- ✅ ESLint code quality checks
- ✅ Security vulnerability scans
- ✅ Performance threshold validation
- ✅ Code coverage requirements (85%+)

## Architecture Overview

### Frontend
- **Framework**: Next.js 14+ with App Router
- **UI**: React with TypeScript and Tailwind CSS
- **State Management**: React Context and hooks
- **Forms**: React Hook Form with Zod validation

### Backend
- **API**: Next.js API Routes with GraphQL (Apollo Server)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **Caching**: Upstash Redis for session and data caching

### External Integrations
- **Weather**: OpenWeatherMap API
- **Satellite**: Sentinel Hub API
- **Storage**: Cloudinary for image/file storage
- **Hosting**: Vercel for deployment
- **Monitoring**: Sentry for error tracking

### Mobile (React Native)
- **Framework**: Expo with React Native
- **Offline Support**: SQLite with data synchronization
- **Navigation**: Expo Router
- **Notifications**: Expo Notifications

## Contributing

Please refer to the main [CONTRIBUTING.md](../../../CONTRIBUTING.md) for contribution guidelines.

## Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: This documentation is updated continuously
- **Code Review**: All changes require review and automated testing

---

**Last Updated**: August 2, 2025  
**Documentation Version**: 2.0  
**Next Review**: September 2, 2025