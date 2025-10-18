#!/usr/bin/env node

/**
 * Production Readiness Audit Script
 * Scans codebase for common production issues
 */

const fs = require('fs')
const path = require('path')

class ProductionAuditor {
  constructor() {
    this.issues = []
    this.warnings = []
    this.srcDir = path.join(__dirname, '../src')
  }

  audit() {
    console.log('🔍 Running Production Readiness Audit...\n')
    
    this.checkEnvironmentFile()
    this.scanForDevCode()
    this.checkConsoleStatements()
    this.checkMockData()
    this.checkTODOs()
    
    this.generateReport()
  }

  checkEnvironmentFile() {
    const envPath = path.join(__dirname, '../.env.local')
    
    if (!fs.existsSync(envPath)) {
      this.issues.push('❌ CRITICAL: .env.local file not found')
      return
    }

    const envContent = fs.readFileSync(envPath, 'utf8')
    
    const criticalKeys = [
      'YOUR_OPENWEATHER_API_KEY',
      'YOUR_CLOUDINARY_CLOUD_NAME', 
      'YOUR_CLOUDINARY_API_KEY',
      'YOUR_UPSTASH_REDIS_REST_URL',
      'example',
      'mock_development_key'
    ]

    criticalKeys.forEach(key => {
      if (envContent.includes(key)) {
        this.issues.push(`❌ CRITICAL: Replace placeholder "${key}" in .env.local`)
      }
    })
  }

  scanForDevCode() {
    const patterns = [
      { pattern: /console\.log\(/g, severity: 'warning', type: 'Console logging' },
      { pattern: /console\.error\(/g, severity: 'warning', type: 'Console errors' },
      { pattern: /console\.warn\(/g, severity: 'warning', type: 'Console warnings' },
      { pattern: /debugger;/g, severity: 'issue', type: 'Debugger statements' },
      { pattern: /\.only\(/g, severity: 'issue', type: 'Test .only() calls' },
      { pattern: /localhost:3000/g, severity: 'warning', type: 'Hardcoded localhost URLs' }
    ]

    this.scanDirectory(this.srcDir, patterns)
  }

  checkConsoleStatements() {
    let consoleCount = 0
    this.scanDirectory(this.srcDir, [
      { 
        pattern: /console\./g, 
        severity: 'warning', 
        type: 'Console statements',
        callback: () => consoleCount++
      }
    ])

    if (consoleCount > 50) {
      this.issues.push(`❌ HIGH: Found ${consoleCount} console statements - should use proper logging`)
    } else if (consoleCount > 10) {
      this.warnings.push(`⚠️ MEDIUM: Found ${consoleCount} console statements`)
    }
  }

  checkMockData() {
    const mockPatterns = [
      { pattern: /mock_development_key/g, severity: 'issue', type: 'Mock API keys' },
      { pattern: /example\.com/g, severity: 'warning', type: 'Example domains' },
      { pattern: /MockData|mockData/g, severity: 'warning', type: 'Mock data references' },
      { pattern: /demo.*mode/gi, severity: 'warning', type: 'Demo mode code' }
    ]

    this.scanDirectory(this.srcDir, mockPatterns)
  }

  checkTODOs() {
    let todoCount = 0
    this.scanDirectory(this.srcDir, [
      { 
        pattern: /TODO|FIXME|HACK|XXX/gi, 
        severity: 'warning', 
        type: 'TODO comments',
        callback: () => todoCount++
      }
    ])

    if (todoCount > 20) {
      this.warnings.push(`⚠️ MEDIUM: Found ${todoCount} TODO/FIXME comments`)
    }
  }

  scanDirectory(dir, patterns) {
    if (!fs.existsSync(dir)) return

    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.scanDirectory(filePath, patterns)
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        this.scanFile(filePath, patterns)
      }
    })
  }

  scanFile(filePath, patterns) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const relativePath = path.relative(this.srcDir, filePath)
      
      patterns.forEach(({ pattern, severity, type, callback }) => {
        const matches = content.match(pattern)
        if (matches) {
          const message = `${type} found in ${relativePath} (${matches.length} instances)`
          
          if (severity === 'issue') {
            this.issues.push(`❌ ${message}`)
          } else {
            this.warnings.push(`⚠️ ${message}`)
          }

          if (callback) callback()
        }
      })
    } catch (error) {
      // Skip files that can't be read
    }
  }

  generateReport() {
    console.log('📊 Production Readiness Report\n')
    console.log('=' * 50)
    
    if (this.issues.length === 0) {
      console.log('✅ No critical issues found!')
    } else {
      console.log(`\n🚨 CRITICAL ISSUES (${this.issues.length}):\n`)
      this.issues.forEach(issue => console.log(issue))
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):\n`)
      this.warnings.forEach(warning => console.log(warning))
    }

    console.log('\n' + '=' * 50)
    
    if (this.issues.length === 0 && this.warnings.length < 5) {
      console.log('🎉 Application appears ready for production!')
    } else if (this.issues.length === 0) {
      console.log('✅ No critical issues, but review warnings before deployment')
    } else {
      console.log('❌ Fix critical issues before deploying to production')
    }

    console.log(`\nSummary: ${this.issues.length} critical issues, ${this.warnings.length} warnings`)
  }
}

// Run audit
const auditor = new ProductionAuditor()
auditor.audit()