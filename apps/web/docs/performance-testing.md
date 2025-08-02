# Performance Testing Guide

This document outlines the performance testing setup and procedures for the Crops.AI web application.

## Overview

Performance testing ensures the application meets user expectations under various load conditions. Our testing strategy includes:

- **Bundle Size Analysis** - Monitor JavaScript bundle size
- **Load Testing** - Test API endpoints under concurrent load
- **Lighthouse Audits** - Core Web Vitals and performance metrics
- **CI/CD Integration** - Automated performance monitoring

## Testing Infrastructure

### Tools Used

1. **Artillery.js** - Load testing and API performance
2. **Lighthouse CI** - Web performance audits
3. **Next.js Build Analysis** - Bundle size monitoring
4. **GitHub Actions** - Automated testing in CI/CD

### Test Scripts

#### Available NPM Scripts

```bash
# Run comprehensive performance tests
npm run perf:test

# Run Artillery load tests (requires dev server)
npm run perf:load

# Run bundle analysis
npm run perf:bundle

# Run Lighthouse audit (requires dev server)
npm run perf:lighthouse

# Run all performance tests
npm run perf:all
```

## Performance Testing Configuration

### Artillery Configuration

The Artillery configuration (`performance/artillery-config.yml`) defines:

- **Test Phases**: Warm-up, ramp-up, load test, stress test, spike test
- **Performance Thresholds**: P95 latency < 500ms, error rate < 1%
- **Test Scenarios**: Health checks, authentication, weather APIs, satellite APIs

#### Test Scenarios Covered

1. **Health Check** (10% of traffic)
   - Basic health endpoint monitoring
   - Response time validation

2. **Authentication Flow** (20% of traffic)
   - User registration endpoints
   - Session management testing

3. **Weather API Endpoints** (30% of traffic)
   - Current weather data
   - Forecast retrieval
   - Agricultural weather data

4. **Satellite API Endpoints** (25% of traffic)
   - NDVI calculations
   - Satellite image processing

5. **Farms Management** (15% of traffic)
   - Farm CRUD operations
   - Location-based queries

### Performance Thresholds

#### Response Time Targets
- **P95 Latency**: < 500ms for API endpoints
- **P99 Latency**: < 1000ms for API endpoints
- **Average Response**: < 200ms for health checks

#### Error Rate Targets
- **Maximum Error Rate**: < 1% for production
- **Maximum Error Rate**: < 5% for development

#### Bundle Size Targets
- **Total Bundle Size**: < 10MB (warning threshold)
- **Initial Bundle**: < 2MB for first page load

## Running Performance Tests

### Local Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Run performance tests**:
   ```bash
   npm run perf:test
   ```

3. **View results**:
   - Reports saved to `performance-reports/` directory
   - Open HTML reports in browser

### Automated Testing

Performance tests run automatically:
- **On every push** to main/develop branches
- **On pull requests** to main/develop
- **Weekly schedule** (Sundays at 3 AM UTC)

### CI/CD Pipeline

The GitHub Actions workflow includes:

1. **Build Analysis** - Bundle size monitoring
2. **Load Testing** - Artillery API testing
3. **Lighthouse Audit** - Web performance metrics
4. **Threshold Validation** - Automated pass/fail criteria

## Performance Monitoring

### Key Metrics Tracked

#### API Performance
- Response time percentiles (P50, P95, P99)
- Throughput (requests per second)
- Error rates by endpoint
- Concurrent user capacity

#### Frontend Performance
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

#### Resource Utilization
- Bundle size trends
- Memory usage patterns
- CPU utilization
- Network performance

### Reports and Artifacts

#### Generated Reports
- **Performance Summary**: `performance-report-YYYY-MM-DD.md`
- **Raw Results**: `performance-results-YYYY-MM-DD.json`
- **Artillery Report**: `artillery-report.html`
- **Lighthouse Report**: `lighthouse/` directory

#### Report Retention
- **Local Reports**: Stored in `performance-reports/`
- **CI Artifacts**: Retained for 30 days
- **Historical Data**: Tracked in performance dashboard

## Performance Optimization Strategies

### Bundle Optimization

1. **Code Splitting**
   ```typescript
   // Use dynamic imports for large components
   const HeavyComponent = lazy(() => import('./HeavyComponent'))
   ```

2. **Tree Shaking**
   ```typescript
   // Import only what you need
   import { specific } from 'library'
   // Instead of: import * as all from 'library'
   ```

3. **Image Optimization**
   ```typescript
   // Use Next.js Image component
   import Image from 'next/image'
   ```

### API Optimization

1. **Caching Strategy**
   - Redis for frequently accessed data
   - HTTP caching headers
   - CDN for static assets

2. **Database Optimization**
   - Proper indexing
   - Query optimization
   - Connection pooling

3. **Rate Limiting**
   - Prevent abuse
   - Ensure fair resource allocation

### Server Optimization

1. **Serverless Functions**
   - Optimized for cold starts
   - Proper memory allocation
   - Timeout configuration

2. **Edge Computing**
   - Vercel Edge Functions
   - Geographic distribution
   - Reduced latency

## Troubleshooting Performance Issues

### Common Issues

1. **High Bundle Size**
   - Analyze webpack bundle analyzer
   - Remove unused dependencies
   - Implement code splitting

2. **Slow API Responses**
   - Check database query performance
   - Implement caching
   - Optimize algorithm complexity

3. **High Error Rates**
   - Review error logs
   - Check rate limiting
   - Validate input handling

### Debugging Tools

1. **Local Profiling**
   ```bash
   # Use Node.js profiling
   node --prof server.js
   
   # Analyze profile
   node --prof-process isolate-*.log
   ```

2. **Production Monitoring**
   - Vercel Analytics
   - Sentry error tracking
   - Custom performance metrics

## Performance Budget

### Established Budgets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Bundle Size | < 5MB | 5-10MB | > 10MB |
| P95 Latency | < 300ms | 300-500ms | > 500ms |
| Error Rate | < 0.5% | 0.5-1% | > 1% |
| LCP | < 2.5s | 2.5-4s | > 4s |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |

### Budget Enforcement

- **CI/CD Checks**: Fail builds that exceed critical thresholds
- **Alerts**: Notify team when warnings are triggered
- **Dashboards**: Monitor trends and regression

## Best Practices

### Development

1. **Regular Testing**: Run performance tests locally before commits
2. **Profiling**: Use browser dev tools for frontend optimization
3. **Monitoring**: Track performance metrics in development

### Deployment

1. **Staging Tests**: Run full performance suite on staging
2. **Gradual Rollout**: Monitor performance during deployments
3. **Rollback Plan**: Have quick rollback procedures ready

### Maintenance

1. **Regular Reviews**: Weekly performance review meetings
2. **Trend Analysis**: Monitor long-term performance trends
3. **Capacity Planning**: Scale resources based on performance data

## References

- [Artillery.js Documentation](https://artillery.io/docs/)
- [Lighthouse Performance Auditing](https://developers.google.com/web/tools/lighthouse)
- [Next.js Performance Best Practices](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)

---

**Last Updated**: August 2, 2025  
**Next Review**: September 2, 2025  
**Document Owner**: Development Team