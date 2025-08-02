#!/usr/bin/env node

/**
 * Performance Testing Script
 * Comprehensive load testing and performance benchmarking
 */

import { execSync, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PERFORMANCE_DIR = path.join(__dirname, '..', 'performance-reports')
const TIMESTAMP = new Date().toISOString().split('T')[0]

// Ensure performance reports directory exists
if (!fs.existsSync(PERFORMANCE_DIR)) {
  fs.mkdirSync(PERFORMANCE_DIR, { recursive: true })
}

async function runPerformanceTests() {
  console.log('⚡ Starting Performance Testing Suite...\n')

  const results = {
  timestamp: new Date().toISOString(),
  artillery: { status: 'pending', results: {} },
  lighthouse: { status: 'pending', results: {} },
  bundleAnalysis: { status: 'pending', results: {} },
  summary: { passed: 0, failed: 0, warnings: 0 }
}

// 1. Artillery Load Testing
console.log('🎯 Running Artillery Load Tests...')
try {
  const artilleryConfigPath = path.join(__dirname, '..', 'performance', 'artillery-config.yml')
  
  if (!fs.existsSync(artilleryConfigPath)) {
    throw new Error('Artillery configuration not found')
  }
  
  console.log('Starting Next.js development server...')
  
  // Start Next.js dev server in background
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: true
  })
  
  // Wait for server to start
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log('Next.js server should be ready')
      resolve()
    }, 10000)
  })
  
  try {
    console.log('Running Artillery load tests...')
    const artilleryOutput = execSync(`npx artillery run ${artilleryConfigPath} --output ${path.join(PERFORMANCE_DIR, `artillery-${TIMESTAMP}.json`)}`, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 300000 // 5 minute timeout
    })
    
    results.artillery.status = 'passed'
    console.log('✅ Artillery load tests completed successfully\\n')
    
    // Parse Artillery results
    const artilleryResultsPath = path.join(PERFORMANCE_DIR, `artillery-${TIMESTAMP}.json`)
    if (fs.existsSync(artilleryResultsPath)) {
      const artilleryData = JSON.parse(fs.readFileSync(artilleryResultsPath, 'utf8'))
      results.artillery.results = {
        scenarios: artilleryData.aggregate?.counters || {},
        latency: artilleryData.aggregate?.latency || {},
        errors: artilleryData.aggregate?.errors || {}
      }
    }
    
  } catch (artilleryError) {
    results.artillery.status = 'failed'
    console.log('❌ Artillery load tests failed:', artilleryError.message)
    results.summary.failed++
  } finally {
    // Kill dev server
    try {
      devServer.kill('SIGTERM')
      console.log('Development server stopped')
    } catch (e) {
      console.log('Could not stop development server')
    }
  }
  
} catch (error) {
  results.artillery.status = 'skipped'
  console.log('⏭️  Artillery tests skipped:', error.message)
  console.log('   Run this after starting the development server\\n')
}

// 2. Bundle Analysis
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
    
    if (bundleSizeMB > 10) {
      console.log('⚠️  Warning: Bundle size is large (>10MB)')
      results.summary.warnings++
    }
    
  } else {
    throw new Error('Build directory not found')
  }
  
} catch (error) {
  results.bundleAnalysis.status = 'failed'
  console.log('❌ Bundle analysis failed:', error.message)
  results.summary.failed++
}

// 3. API Endpoint Performance (without dev server)
console.log('🔍 Testing API Endpoint Performance...')
try {
  const apiTests = [
    { name: 'Health Check', path: '/api/health' },
    { name: 'GraphQL', path: '/api/graphql' }
  ]
  
  const apiResults = []
  
  // Note: These would require the server to be running
  console.log('⏭️  API endpoint tests require development server')
  console.log('   Start server with `npm run dev` and run tests manually\\n')
  
  results.summary.warnings++
  
} catch (error) {
  console.log('❌ API performance tests failed:', error.message)
  results.summary.failed++
}

// 4. Generate Performance Report
const reportContent = `# Performance Testing Report

**Generated:** ${results.timestamp}

## Test Summary

- **Artillery Load Tests:** ${results.artillery.status}
- **Bundle Analysis:** ${results.bundleAnalysis.status}
- **API Performance:** skipped (requires dev server)

## Artillery Load Test Results

${results.artillery.status === 'passed' ? `
### Scenarios Executed
${Object.entries(results.artillery.results.scenarios || {}).map(([key, value]) => 
  `- **${key}:** ${value}`
).join('\\n')}

### Latency Metrics
${Object.entries(results.artillery.results.latency || {}).map(([key, value]) => 
  `- **${key}:** ${value}ms`
).join('\\n')}

### Error Rates
${Object.entries(results.artillery.results.errors || {}).map(([key, value]) => 
  `- **${key}:** ${value}`
).join('\\n')}
` : 'Load tests were not executed - requires development server'}

## Bundle Analysis

${results.bundleAnalysis.status === 'passed' ? `
- **Total Bundle Size:** ${results.bundleAnalysis.results.totalSizeMB}MB
- **Size in Bytes:** ${results.bundleAnalysis.results.totalSizeBytes}

### Recommendations
${results.bundleAnalysis.results.totalSizeMB > 10 ? 
  '⚠️ Consider code splitting and lazy loading to reduce bundle size' : 
  '✅ Bundle size is within acceptable limits'}
` : 'Bundle analysis failed or was skipped'}

## Performance Recommendations

### Load Testing
1. **Run with Development Server:** Start \`npm run dev\` before running performance tests
2. **Production Testing:** Test against production builds for accurate results
3. **Continuous Monitoring:** Set up performance monitoring in CI/CD

### Bundle Optimization
1. **Code Splitting:** Implement dynamic imports for large components
2. **Tree Shaking:** Ensure unused code is eliminated
3. **Image Optimization:** Use Next.js Image component for optimized loading

### API Performance
1. **Caching:** Implement Redis caching for frequently accessed data
2. **Database Optimization:** Add proper indexing and query optimization
3. **Rate Limiting:** Implement rate limiting to prevent abuse

## Next Steps

1. Set up production performance monitoring
2. Implement performance budgets in CI/CD
3. Configure real user monitoring (RUM)
4. Set up alerts for performance degradation
5. Create performance dashboard

## Test Environment

- **Node.js Version:** ${process.version}
- **Platform:** ${process.platform}
- **Architecture:** ${process.arch}
- **Memory Usage:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
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
console.log(`   - Artillery Tests: ${results.artillery.status}`)
console.log(`   - Bundle Analysis: ${results.bundleAnalysis.status}`)
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
}

// Run the performance tests
runPerformanceTests().catch(error => {
  console.error('Performance testing failed:', error)
  process.exit(1)
})