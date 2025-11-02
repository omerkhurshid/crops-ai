# Cropple.ai - Smart Agriculture Platform

AI-powered land and crop management platform designed to optimize agricultural productivity through intelligent decision-support, real-time monitoring, and predictive analytics.

**🚀 PRODUCTION READY**: Live deployment at [cropple.ai](https://cropple.ai) with Supabase Authentication, Redis caching, and comprehensive API suite.

**🏗️ Architecture**: Modern full-stack TypeScript application with Next.js 14, PostgreSQL, and Redis infrastructure.

**🔒 Security**: Enterprise-grade security with rate limiting, input validation, and comprehensive monitoring.

## Overview

Crops.AI democratizes access to precision agriculture tools for farms of all sizes (0.1 to 10,000+ acres), serving both remote land owners and active farm managers.

## Key Features

- **Weather Intelligence**: Real-time weather data and hyperlocal forecasting
- **Satellite Monitoring**: Crop health tracking with NDVI analysis
- **AI Recommendations**: Intelligent insights for planting, irrigation, and harvest
- **Financial Tracking**: Cost management and ROI optimization
- **Mobile Support**: Offline-capable mobile app for field operations
- **Market Intelligence**: Commodity pricing and demand forecasting

## Tech Stack ✅ **PRODUCTION IMPLEMENTATION**

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: React 18 + TypeScript (strict mode)
- **Styling**: Tailwind CSS + FieldKit Design System
- **Components**: Radix UI primitives
- **Maps**: Google Maps API with React Google Maps
- **Icons**: Lucide React icon library

### **Backend**
- **API**: Next.js API Routes (RESTful)
- **GraphQL**: Apollo Server integration
- **ORM**: Prisma 5.x with PostgreSQL
- **Validation**: Zod schema validation
- **Error Handling**: Centralized error middleware

### **Infrastructure**
- **Database**: PostgreSQL + PostGIS (spatial data)
- **Cache**: Upstash Redis with automatic fallbacks
- **Authentication**: Supabase Auth (migrated from NextAuth)
- **Hosting**: Vercel with automatic deployments
- **Storage**: Cloudinary for images
- **Monitoring**: Sentry for error tracking

### **Security & Performance**
- **Rate Limiting**: Redis-based with tiered limits
- **Input Validation**: Comprehensive Zod schemas
- **Testing**: Jest + Playwright for E2E
- **Performance**: Built-in Next.js optimization
- **CI/CD**: GitHub Actions with Vercel integration

## Project Structure

```
crops-ai/
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native mobile app
├── packages/
│   ├── shared/       # Shared types, utils, and constants
│   ├── ui/           # Shared UI components
│   └── database/     # Prisma schema and database utilities
├── docs/             # Documentation
└── scripts/          # Build and deployment scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd crops-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

## Development

### Available Scripts

#### Development
- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run start` - Start production server
- `npm run clean` - Clean build artifacts

#### Code Quality
- `npm run lint` - Run ESLint across all packages
- `npm run type-check` - Run TypeScript type checking

#### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:all` - Run all test suites

#### Security
- `npm run security:lint` - Run ESLint security scan
- `npm run security:audit` - Run npm audit
- `npm run security:snyk` - Run Snyk vulnerability scan
- `npm run security:scan` - Run comprehensive security audit
- `npm run security:all` - Run all security checks

#### Performance
- `npm run perf:test` - Run performance testing suite
- `npm run perf:load` - Run Artillery load tests
- `npm run perf:bundle` - Analyze bundle size
- `npm run perf:lighthouse` - Run Lighthouse audit
- `npm run perf:all` - Run all performance tests

### Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Architecture

### Design Principles

- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **SOLID**: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

### Security ✅ **ENTERPRISE-GRADE**

- **Authentication**: Supabase Auth with JWT tokens and row-level security
- **Rate Limiting**: Multi-tiered Redis-based protection (5-150 req/min)
- **Input Validation**: Comprehensive Zod schema validation on all endpoints
- **Error Handling**: Centralized error middleware with Sentry integration
- **Session Security**: Secure token management with automatic refresh
- **API Protection**: CORS, CSRF, and request sanitization
- **Monitoring**: Real-time error tracking and performance monitoring

### Testing & Quality Assurance

- **Unit Testing**: Jest with React Testing Library
- **Integration Testing**: API endpoint testing
- **End-to-End Testing**: Playwright for user workflows
- **Security Testing**: Comprehensive vulnerability scanning
- **Performance Testing**: Artillery.js load testing and Lighthouse audits
- **Code Coverage**: 85%+ coverage requirement
- **CI/CD Integration**: Automated testing in GitHub Actions

### Performance

- **Bundle Optimization**: Code splitting and tree shaking
- **Load Testing**: Artillery.js with performance thresholds
- **Core Web Vitals**: Lighthouse CI monitoring
- **Performance Budgets**: Automated performance regression detection
- **Caching Strategy**: Redis caching and CDN optimization

## Roadmap

See [PRD.md](PRD.md) for the complete product roadmap and feature specifications.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.