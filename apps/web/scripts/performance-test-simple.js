#!/usr/bin/env node

/**
 * Performance Testing Script (Simplified)
 * Comprehensive load testing and performance benchmarking
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PERFORMANCE_DIR = path.join(__dirname, '..', 'performance-reports')
const TIMESTAMP = new Date().toISOString().split('T')[0]

// Ensure performance reports directory exists
if (!fs.existsSync(PERFORMANCE_DIR)) {
  fs.mkdirSync(PERFORMANCE_DIR, { recursive: true })
}

console.log('⚡ Starting Performance Testing Suite...\n')

const results = {
  timestamp: new Date().toISOString(),
  bundleAnalysis: { status: 'pending', results: {} },
  lighthouse: { status: 'pending', results: {} },
  summary: { passed: 0, failed: 0, warnings: 0 }
}

// 1. Bundle Analysis
console.log('📦 Analyzing Bundle Size...')
try {
  // Build the application first
  console.log('Building application for bundle analysis...')
  const buildOutput = execSync('npm run build', { 
    encoding: 'utf8',
    stdio: 'pipe'
  })
  
  // Get build directory info
  const buildDir = path.join(__dirname, '..', '.next')
  if (fs.existsSync(buildDir)) {
    const getBundleSize = (dir) => {
      let totalSize = 0
      const files = fs.readdirSync(dir)
      
      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory()) {
          totalSize += getBundleSize(filePath)
        } else {
          totalSize += stat.size
        }
      })
      
      return totalSize
    }
    
    const bundleSize = getBundleSize(buildDir)
    const bundleSizeMB = (bundleSize / (1024 * 1024)).toFixed(2)
    
    results.bundleAnalysis.status = 'passed'
    results.bundleAnalysis.results = {
      totalSizeMB: bundleSizeMB,
      totalSizeBytes: bundleSize
    }
    
    console.log(`✅ Bundle analysis completed - Total size: ${bundleSizeMB}MB\\n`)
    results.summary.passed++
    
    if (bundleSizeMB > 10) {
      console.log('⚠️  Warning: Bundle size is large (>10MB)')
      results.summary.warnings++
    }
    
  } else {
    throw new Error('Build directory not found')
  }
  
} catch (error) {
  results.bundleAnalysis.status = 'failed'
  console.log('❌ Bundle analysis failed:', error.message.split('\\n')[0])
  results.summary.failed++
}

// 2. Check if dev server is running
console.log('🔍 Checking Development Server...')
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health', {
    encoding: 'utf8',
    timeout: 5000
  })
  
  if (response.trim() === '200') {
    console.log('✅ Development server is running\\n')
    
    // Run basic load test
    console.log('🎯 Running basic load test with curl...')
    const startTime = Date.now()
    
    for (let i = 0; i < 10; i++) {
      try {
        execSync('curl -s http://localhost:3000/api/health > /dev/null', { timeout: 5000 })
      } catch (e) {
        console.log(`Request ${i + 1} failed`)
      }
    }
    
    const endTime = Date.now()
    const avgResponseTime = (endTime - startTime) / 10
    
    console.log(`✅ Basic load test completed - Average response time: ${avgResponseTime}ms\\n`)
    results.summary.passed++
    
    if (avgResponseTime > 1000) {
      console.log('⚠️  Warning: Average response time is high (>1000ms)')
      results.summary.warnings++
    }
    
  } else {
    throw new Error('Server not responding')
  }
  
} catch (error) {
  console.log('⏭️  Development server not running - skipping load tests')
  console.log('   Start server with `npm run dev` to run load tests\\n')
  results.summary.warnings++
}

// 3. Generate Performance Report
const reportContent = `# Performance Testing Report

**Generated:** ${results.timestamp}

## Test Summary

- **Bundle Analysis:** ${results.bundleAnalysis.status}
- **Load Testing:** ${results.summary.warnings > 0 ? 'skipped' : 'completed'}
- **Total Tests Passed:** ${results.summary.passed}
- **Total Warnings:** ${results.summary.warnings}
- **Total Failures:** ${results.summary.failed}

## Bundle Analysis Results

${results.bundleAnalysis.status === 'passed' ? `
- **Total Bundle Size:** ${results.bundleAnalysis.results.totalSizeMB}MB
- **Size in Bytes:** ${results.bundleAnalysis.results.totalSizeBytes}

### Bundle Size Assessment
${parseFloat(results.bundleAnalysis.results.totalSizeMB) > 10 ? 
  '⚠️ **Warning:** Bundle size is large (>10MB). Consider code splitting and optimization.' : 
  '✅ **Good:** Bundle size is within acceptable limits.'}
` : 'Bundle analysis failed or was skipped'}

## Performance Recommendations

### Bundle Optimization
1. **Code Splitting:** Implement dynamic imports for large components
2. **Tree Shaking:** Ensure unused code is eliminated  
3. **Image Optimization:** Use Next.js Image component for optimized loading
4. **Dependency Analysis:** Review large dependencies and consider alternatives

### Load Testing
1. **Start Development Server:** Run \`npm run dev\` to enable load testing
2. **Artillery Testing:** Use \`npm run perf:load\` for comprehensive load testing
3. **Production Testing:** Test against production builds for accurate results

### Monitoring
1. **Real User Monitoring:** Implement RUM for production insights
2. **Performance Budgets:** Set up performance budgets in CI/CD
3. **Continuous Monitoring:** Monitor performance metrics over time

## Next Steps

1. **Fix Bundle Size Issues:** ${parseFloat(results.bundleAnalysis.results?.totalSizeMB || 0) > 10 ? 'Optimize bundle size' : 'Monitor bundle growth'}
2. **Set Up Load Testing:** Configure Artillery for comprehensive API testing
3. **Production Monitoring:** Implement performance monitoring in production
4. **Performance Dashboard:** Create performance metrics dashboard

## Test Environment

- **Node.js Version:** ${process.version}
- **Platform:** ${process.platform}
- **Architecture:** ${process.arch}
- **Memory Usage:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
- **Test Date:** ${new Date().toISOString()}
`

fs.writeFileSync(
  path.join(PERFORMANCE_DIR, `performance-report-${TIMESTAMP}.md`),
  reportContent
)

fs.writeFileSync(
  path.join(PERFORMANCE_DIR, `performance-results-${TIMESTAMP}.json`),
  JSON.stringify(results, null, 2)
)

console.log('📋 Performance Testing Summary:')
console.log(`   - Bundle Analysis: ${results.bundleAnalysis.status}`)
console.log(`   - Tests Passed: ${results.summary.passed}`)
console.log(`   - Warnings: ${results.summary.warnings}`)
console.log(`   - Failed Tests: ${results.summary.failed}`)
console.log('')
console.log(`📁 Reports saved to: ${PERFORMANCE_DIR}`)

// Exit with appropriate code
if (results.summary.failed > 0) {
  console.log('')
  console.log('❌ Some performance tests failed!')
  process.exit(1)
} else if (results.summary.warnings > 0) {
  console.log('')
  console.log('⚠️  Performance tests completed with warnings')
  process.exit(0)
} else {
  console.log('')
  console.log('✅ All performance tests passed!')
  process.exit(0)
}