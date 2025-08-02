#!/usr/bin/env node

/**
 * Security Audit Script
 * Comprehensive security testing and vulnerability scanning
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const SECURITY_DIR = path.join(__dirname, '..', 'security-reports')
const TIMESTAMP = new Date().toISOString().split('T')[0]

// Ensure security reports directory exists
if (!fs.existsSync(SECURITY_DIR)) {
  fs.mkdirSync(SECURITY_DIR, { recursive: true })
}

console.log('🔒 Starting Comprehensive Security Audit...\n')

const results = {
  timestamp: new Date().toISOString(),
  eslint: { status: 'pending', issues: 0, warnings: 0, errors: 0 },
  npmAudit: { status: 'pending', vulnerabilities: 0, summary: {} },
  snyk: { status: 'pending', issues: 0, summary: {} },
  summary: { critical: 0, high: 0, medium: 0, low: 0 }
}

// 1. ESLint Security Scan
console.log('🔍 Running ESLint Security Scan...')
try {
  const eslintOutput = execSync('npm run security:lint', { 
    encoding: 'utf8',
    stdio: 'pipe'
  })
  
  results.eslint.status = 'passed'
  console.log('✅ ESLint security scan completed - no issues found\n')
} catch (error) {
  results.eslint.status = 'failed'
  const output = error.stdout || error.stderr || ''
  
  // Parse ESLint output for security issues
  const lines = output.split('\n')
  let warningCount = 0
  let errorCount = 0
  
  lines.forEach(line => {
    if (line.includes('Warning:')) warningCount++
    if (line.includes('Error:')) errorCount++
  })
  
  results.eslint.warnings = warningCount
  results.eslint.errors = errorCount
  results.eslint.issues = warningCount + errorCount
  
  console.log(`⚠️  ESLint found ${results.eslint.issues} security issues:`)
  console.log(`   - ${errorCount} errors`)
  console.log(`   - ${warningCount} warnings\n`)
  
  // Save detailed ESLint report
  fs.writeFileSync(
    path.join(SECURITY_DIR, `eslint-security-${TIMESTAMP}.txt`),
    output
  )
}

// 2. npm audit
console.log('📦 Running npm audit...')
try {
  const auditOutput = execSync('npm audit --json', { 
    encoding: 'utf8',
    stdio: 'pipe'
  })
  
  const auditData = JSON.parse(auditOutput)
  results.npmAudit.status = 'passed'
  results.npmAudit.vulnerabilities = auditData.metadata.vulnerabilities.total || 0
  results.npmAudit.summary = auditData.metadata.vulnerabilities
  
  if (results.npmAudit.vulnerabilities === 0) {
    console.log('✅ npm audit found no vulnerabilities\n')
  } else {
    console.log(`⚠️  npm audit found ${results.npmAudit.vulnerabilities} vulnerabilities:`)
    Object.entries(results.npmAudit.summary).forEach(([level, count]) => {
      if (count > 0) {
        console.log(`   - ${level}: ${count}`)
        results.summary[level] += count
      }
    })
    console.log('')
  }
  
  // Save npm audit report
  fs.writeFileSync(
    path.join(SECURITY_DIR, `npm-audit-${TIMESTAMP}.json`),
    JSON.stringify(auditData, null, 2)
  )
} catch (error) {
  results.npmAudit.status = 'failed'
  const output = error.stdout || error.stderr || ''
  
  try {
    const auditData = JSON.parse(output)
    results.npmAudit.vulnerabilities = auditData.metadata.vulnerabilities.total || 0
    results.npmAudit.summary = auditData.metadata.vulnerabilities
    
    console.log(`⚠️  npm audit found ${results.npmAudit.vulnerabilities} vulnerabilities:`)
    Object.entries(results.npmAudit.summary).forEach(([level, count]) => {
      if (count > 0) {
        console.log(`   - ${level}: ${count}`)
        results.summary[level] += count
      }
    })
    console.log('')
  } catch (parseError) {
    console.log('❌ Failed to parse npm audit output\n')
  }
}

// 3. Snyk scan (if authenticated)
console.log('🛡️  Running Snyk vulnerability scan...')
try {
  const snykOutput = execSync('npx snyk test --json', { 
    encoding: 'utf8',
    stdio: 'pipe'
  })
  
  const snykData = JSON.parse(snykOutput)
  results.snyk.status = 'passed'
  results.snyk.issues = snykData.vulnerabilities ? snykData.vulnerabilities.length : 0
  
  if (results.snyk.issues === 0) {
    console.log('✅ Snyk found no vulnerabilities\n')
  } else {
    console.log(`⚠️  Snyk found ${results.snyk.issues} vulnerabilities\n`)
  }
  
  // Save Snyk report
  fs.writeFileSync(
    path.join(SECURITY_DIR, `snyk-${TIMESTAMP}.json`),
    JSON.stringify(snykData, null, 2)
  )
} catch (error) {
  results.snyk.status = 'skipped'
  console.log('⏭️  Snyk scan skipped (authentication required)')
  console.log('   Run `npx snyk auth` to enable Snyk scanning\n')
}

// 4. Custom security checks
console.log('🔍 Running custom security checks...')

const customChecks = {
  hardcodedSecrets: 0,
  unsafePatterns: 0,
  missingSecurityHeaders: 0
}

// Check for hardcoded secrets
const secretPatterns = [
  /(?:api[_-]?key|apikey)[\s]*[=:]\s*['"]\w+['"]/gi,
  /(?:secret|password|pwd)[\s]*[=:]\s*['"]\w+['"]/gi,
  /(?:token|auth)[\s]*[=:]\s*['"]\w+['"]/gi,
  /sk_live_\w+/gi,
  /pk_live_\w+/gi
]

function scanDirectory(dir) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath)
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      const content = fs.readFileSync(filePath, 'utf8')
      
      secretPatterns.forEach(pattern => {
        const matches = content.match(pattern)
        if (matches) {
          customChecks.hardcodedSecrets += matches.length
        }
      })
      
      // Check for unsafe patterns
      if (content.includes('eval(') || content.includes('new Function(')) {
        customChecks.unsafePatterns++
      }
    }
  })
}

scanDirectory(path.join(__dirname, '..', 'src'))

console.log(`🔍 Custom security checks completed:`)
console.log(`   - Hardcoded secrets: ${customChecks.hardcodedSecrets}`)
console.log(`   - Unsafe patterns: ${customChecks.unsafePatterns}`)
console.log('')

// 5. Generate security report
results.customChecks = customChecks
results.summary.total = results.eslint.issues + results.npmAudit.vulnerabilities + results.snyk.issues + customChecks.hardcodedSecrets + customChecks.unsafePatterns

const reportContent = `# Security Audit Report

**Generated:** ${results.timestamp}

## Summary

- **Total Issues:** ${results.summary.total}
- **Critical:** ${results.summary.critical || 0}
- **High:** ${results.summary.high || 0}
- **Medium:** ${results.summary.medium || 0}
- **Low:** ${results.summary.low || 0}

## ESLint Security Scan

- **Status:** ${results.eslint.status}
- **Issues:** ${results.eslint.issues}
- **Errors:** ${results.eslint.errors}
- **Warnings:** ${results.eslint.warnings}

## npm audit

- **Status:** ${results.npmAudit.status}
- **Vulnerabilities:** ${results.npmAudit.vulnerabilities}
${Object.entries(results.npmAudit.summary).map(([level, count]) => 
  count > 0 ? `- **${level}:** ${count}` : ''
).filter(Boolean).join('\n')}

## Snyk Scan

- **Status:** ${results.snyk.status}
- **Issues:** ${results.snyk.issues}

## Custom Security Checks

- **Hardcoded Secrets:** ${customChecks.hardcodedSecrets}
- **Unsafe Patterns:** ${customChecks.unsafePatterns}

## Recommendations

${results.summary.total === 0 ? 
  '✅ No security issues found. Keep up the good work!' : 
  `⚠️  Found ${results.summary.total} security issues that should be addressed:`
}

${results.eslint.issues > 0 ? '- Review ESLint security warnings and fix object injection vulnerabilities' : ''}
${results.npmAudit.vulnerabilities > 0 ? '- Update dependencies to fix known vulnerabilities' : ''}
${results.snyk.issues > 0 ? '- Review Snyk findings and apply recommended fixes' : ''}
${customChecks.hardcodedSecrets > 0 ? '- Remove hardcoded secrets and use environment variables' : ''}
${customChecks.unsafePatterns > 0 ? '- Replace unsafe patterns with safer alternatives' : ''}

## Next Steps

1. Fix high and critical severity issues first
2. Update dependencies regularly
3. Enable Snyk monitoring for continuous security
4. Implement security headers in production
5. Set up automated security scanning in CI/CD
`

fs.writeFileSync(
  path.join(SECURITY_DIR, `security-report-${TIMESTAMP}.md`),
  reportContent
)

fs.writeFileSync(
  path.join(SECURITY_DIR, `security-results-${TIMESTAMP}.json`),
  JSON.stringify(results, null, 2)
)

console.log('📋 Security Audit Summary:')
console.log(`   - Total Issues: ${results.summary.total}`)
console.log(`   - ESLint Issues: ${results.eslint.issues}`)
console.log(`   - npm Vulnerabilities: ${results.npmAudit.vulnerabilities}`)
console.log(`   - Snyk Issues: ${results.snyk.issues}`)
console.log(`   - Custom Check Issues: ${customChecks.hardcodedSecrets + customChecks.unsafePatterns}`)
console.log('')
console.log(`📁 Reports saved to: ${SECURITY_DIR}`)

// Exit with error code if critical issues found
if (results.summary.critical > 0 || results.summary.high > 0) {
  console.log('')
  console.log('❌ Critical or high severity security issues found!')
  process.exit(1)
} else if (results.summary.total > 0) {
  console.log('')
  console.log('⚠️  Security issues found but not critical')
  process.exit(0)
} else {
  console.log('')
  console.log('✅ No security issues found!')
  process.exit(0)
}