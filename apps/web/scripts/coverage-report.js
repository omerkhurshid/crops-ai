#!/usr/bin/env node

/**
 * Coverage Report Generator
 * Generates comprehensive test coverage reports for all test suites
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const COVERAGE_DIR = path.join(__dirname, '..', 'coverage')
const REPORTS_DIR = path.join(COVERAGE_DIR, 'reports')

// Ensure directories exist
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true })
}

console.log('🧪 Generating Test Coverage Reports...\n')

// Run unit tests with coverage
console.log('📊 Running unit tests with coverage...')
try {
  execSync('npm run test:coverage', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  })
  console.log('✅ Unit test coverage complete\n')
} catch (error) {
  console.error('❌ Unit test coverage failed\n')
}

// Copy unit test coverage
if (fs.existsSync(path.join(COVERAGE_DIR, 'lcov.info'))) {
  fs.copyFileSync(
    path.join(COVERAGE_DIR, 'lcov.info'),
    path.join(REPORTS_DIR, 'unit-lcov.info')
  )
}

// Run integration tests with coverage
console.log('📊 Running integration tests with coverage...')
try {
  execSync('npm run test:integration:coverage', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      DATABASE_URL: 'file:./test.db'
    }
  })
  console.log('✅ Integration test coverage complete\n')
} catch (error) {
  console.error('❌ Integration test coverage failed\n')
}

// Copy integration test coverage
if (fs.existsSync(path.join(COVERAGE_DIR, 'lcov.info'))) {
  fs.copyFileSync(
    path.join(COVERAGE_DIR, 'lcov.info'),
    path.join(REPORTS_DIR, 'integration-lcov.info')
  )
}

// Merge coverage reports if both exist
if (fs.existsSync(path.join(REPORTS_DIR, 'unit-lcov.info')) && 
    fs.existsSync(path.join(REPORTS_DIR, 'integration-lcov.info'))) {
  
  console.log('🔀 Merging coverage reports...')
  
  try {
    // Check if lcov is installed
    execSync('which lcov', { stdio: 'ignore' })
    
    // Merge using lcov
    execSync(`lcov -a ${path.join(REPORTS_DIR, 'unit-lcov.info')} -a ${path.join(REPORTS_DIR, 'integration-lcov.info')} -o ${path.join(REPORTS_DIR, 'merged-lcov.info')}`, {
      stdio: 'inherit'
    })
    
    // Generate HTML report from merged coverage
    execSync(`genhtml ${path.join(REPORTS_DIR, 'merged-lcov.info')} -o ${path.join(REPORTS_DIR, 'html')}`, {
      stdio: 'inherit'
    })
    
    console.log('✅ Coverage reports merged successfully\n')
  } catch (error) {
    console.log('⚠️  lcov not installed. Install with: brew install lcov (macOS) or apt-get install lcov (Linux)\n')
  }
}

// Generate coverage summary
console.log('📋 Coverage Summary:\n')

function parseLcovFile(filePath) {
  if (!fs.existsSync(filePath)) return null
  
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  
  let totalLines = 0
  let coveredLines = 0
  let totalFunctions = 0
  let coveredFunctions = 0
  let totalBranches = 0
  let coveredBranches = 0
  
  lines.forEach(line => {
    if (line.startsWith('LH:')) coveredLines += parseInt(line.substring(3))
    if (line.startsWith('LF:')) totalLines += parseInt(line.substring(3))
    if (line.startsWith('FNH:')) coveredFunctions += parseInt(line.substring(4))
    if (line.startsWith('FNF:')) totalFunctions += parseInt(line.substring(4))
    if (line.startsWith('BRH:')) coveredBranches += parseInt(line.substring(4))
    if (line.startsWith('BRF:')) totalBranches += parseInt(line.substring(4))
  })
  
  return {
    lines: totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : 0,
    functions: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(2) : 0,
    branches: totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(2) : 0,
  }
}

// Display unit test coverage
const unitCoverage = parseLcovFile(path.join(REPORTS_DIR, 'unit-lcov.info'))
if (unitCoverage) {
  console.log('Unit Tests:')
  console.log(`  Lines:     ${unitCoverage.lines}%`)
  console.log(`  Functions: ${unitCoverage.functions}%`)
  console.log(`  Branches:  ${unitCoverage.branches}%`)
  console.log('')
}

// Display integration test coverage
const integrationCoverage = parseLcovFile(path.join(REPORTS_DIR, 'integration-lcov.info'))
if (integrationCoverage) {
  console.log('Integration Tests:')
  console.log(`  Lines:     ${integrationCoverage.lines}%`)
  console.log(`  Functions: ${integrationCoverage.functions}%`)
  console.log(`  Branches:  ${integrationCoverage.branches}%`)
  console.log('')
}

// Display merged coverage
const mergedCoverage = parseLcovFile(path.join(REPORTS_DIR, 'merged-lcov.info'))
if (mergedCoverage) {
  console.log('Combined Coverage:')
  console.log(`  Lines:     ${mergedCoverage.lines}%`)
  console.log(`  Functions: ${mergedCoverage.functions}%`)
  console.log(`  Branches:  ${mergedCoverage.branches}%`)
  console.log('')
}

// Generate coverage badge
function generateBadge(label, percentage, color) {
  const colors = {
    red: '#e05d44',
    orange: '#fe7d37',
    yellow: '#dfb317',
    yellowgreen: '#a4a61d',
    green: '#97ca00',
    brightgreen: '#4c1',
  }
  
  let badgeColor = 'red'
  if (percentage >= 90) badgeColor = 'brightgreen'
  else if (percentage >= 80) badgeColor = 'green'
  else if (percentage >= 70) badgeColor = 'yellowgreen'
  else if (percentage >= 60) badgeColor = 'yellow'
  else if (percentage >= 50) badgeColor = 'orange'
  
  return `https://img.shields.io/badge/${label}-${percentage}%25-${colors[badgeColor]}`
}

// Create README with badges
if (mergedCoverage) {
  const badgeContent = `# Test Coverage

![Lines Coverage](${generateBadge('lines', mergedCoverage.lines)})
![Functions Coverage](${generateBadge('functions', mergedCoverage.functions)})
![Branches Coverage](${generateBadge('branches', mergedCoverage.branches)})

## Coverage Reports

- [HTML Report](./reports/html/index.html)
- [Unit Test Coverage](./reports/unit-lcov.info)
- [Integration Test Coverage](./reports/integration-lcov.info)
- [Merged Coverage](./reports/merged-lcov.info)

Generated on: ${new Date().toISOString()}
`
  
  fs.writeFileSync(path.join(COVERAGE_DIR, 'README.md'), badgeContent)
}

console.log('✨ Coverage report generation complete!')
console.log(`📁 Reports saved to: ${COVERAGE_DIR}`)

// Check coverage thresholds
const thresholds = {
  lines: 80,
  functions: 70,
  branches: 70,
}

if (mergedCoverage) {
  let failed = false
  
  Object.entries(thresholds).forEach(([type, threshold]) => {
    if (parseFloat(mergedCoverage[type]) < threshold) {
      console.error(`\n❌ Coverage threshold not met for ${type}: ${mergedCoverage[type]}% < ${threshold}%`)
      failed = true
    }
  })
  
  if (failed) {
    process.exit(1)
  }
}