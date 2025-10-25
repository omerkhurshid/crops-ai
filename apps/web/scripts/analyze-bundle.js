#!/usr/bin/env node

/**
 * Bundle Analysis and Optimization Script
 * Provides detailed analysis of bundle size and performance optimizations
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class BundleAnalyzer {
  constructor() {
    this.projectRoot = process.cwd()
    this.buildDir = path.join(this.projectRoot, '.next')
    this.results = {
      bundleSize: {},
      recommendations: [],
      performance: {},
      caching: {}
    }
  }

  async analyzeBundleSize() {
    console.log('📦 Analyzing Bundle Size...\n')

    try {
      // Run Next.js build with bundle analysis
      console.log('Building project with bundle analysis...')
      execSync('ANALYZE=true npm run build', { stdio: 'inherit', cwd: this.projectRoot })

      // Check if analysis files were generated
      const clientAnalysis = path.join(this.projectRoot, 'client-bundle-analysis.html')
      const serverAnalysis = path.join(this.projectRoot, 'server-bundle-analysis.html')

      if (fs.existsSync(clientAnalysis)) {
        console.log('✅ Client bundle analysis generated: client-bundle-analysis.html')
      }
      if (fs.existsSync(serverAnalysis)) {
        console.log('✅ Server bundle analysis generated: server-bundle-analysis.html')
      }

      // Analyze build artifacts
      this.analyzeBuildArtifacts()

    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message)
      console.log('Running fallback analysis...')
      this.analyzeBuildArtifacts()
    }
  }

  analyzeBuildArtifacts() {
    console.log('\\n📊 Analyzing Build Artifacts...')

    if (!fs.existsSync(this.buildDir)) {
      console.log('⚠️ No build directory found. Run "npm run build" first.')
      return
    }

    // Analyze static files
    const staticDir = path.join(this.buildDir, 'static')
    if (fs.existsSync(staticDir)) {
      this.analyzeStaticFiles(staticDir)
    }

    // Analyze server chunks
    const serverDir = path.join(this.buildDir, 'server')
    if (fs.existsSync(serverDir)) {
      this.analyzeServerFiles(serverDir)
    }

    this.generateRecommendations()
  }

  analyzeStaticFiles(staticDir) {
    const chunks = path.join(staticDir, 'chunks')
    if (!fs.existsSync(chunks)) return

    const jsFiles = this.findFiles(chunks, '.js')
    const cssFiles = this.findFiles(chunks, '.css')

    let totalJSSize = 0
    let totalCSSSize = 0
    let largestJS = { size: 0, file: '' }
    let largestCSS = { size: 0, file: '' }

    jsFiles.forEach(file => {
      const stats = fs.statSync(file)
      totalJSSize += stats.size
      if (stats.size > largestJS.size) {
        largestJS = { size: stats.size, file: path.basename(file) }
      }
    })

    cssFiles.forEach(file => {
      const stats = fs.statSync(file)
      totalCSSSize += stats.size
      if (stats.size > largestCSS.size) {
        largestCSS = { size: stats.size, file: path.basename(file) }
      }
    })

    this.results.bundleSize = {
      totalJS: this.formatBytes(totalJSSize),
      totalCSS: this.formatBytes(totalCSSSize),
      jsFiles: jsFiles.length,
      cssFiles: cssFiles.length,
      largestJS: {
        file: largestJS.file,
        size: this.formatBytes(largestJS.size)
      },
      largestCSS: {
        file: largestCSS.file,
        size: this.formatBytes(largestCSS.size)
      }
    }

    console.log(`   📄 JavaScript: ${this.results.bundleSize.totalJS} (${jsFiles.length} files)`)
    console.log(`   🎨 CSS: ${this.results.bundleSize.totalCSS} (${cssFiles.length} files)`)
    console.log(`   📦 Largest JS: ${largestJS.file} (${this.formatBytes(largestJS.size)})`)
    
    if (largestJS.size > 500 * 1024) { // > 500KB
      this.results.recommendations.push({
        type: 'bundle-size',
        severity: 'high',
        message: `Large JavaScript chunk detected: ${largestJS.file} (${this.formatBytes(largestJS.size)})`,
        action: 'Consider code splitting or dynamic imports'
      })
    }
  }

  analyzeServerFiles(serverDir) {
    const serverFiles = this.findFiles(serverDir, '.js')
    let totalServerSize = 0

    serverFiles.forEach(file => {
      const stats = fs.statSync(file)
      totalServerSize += stats.size
    })

    this.results.bundleSize.totalServer = this.formatBytes(totalServerSize)
    console.log(`   🖥️ Server: ${this.formatBytes(totalServerSize)} (${serverFiles.length} files)`)
  }

  generateRecommendations() {
    console.log('\\n💡 Performance Recommendations:')

    // Check for common optimization opportunities
    this.checkImageOptimization()
    this.checkCachingStrategy()
    this.checkCodeSplitting()
    this.checkUnusedDependencies()

    if (this.results.recommendations.length === 0) {
      console.log('   ✅ No major optimization issues found!')
    } else {
      this.results.recommendations.forEach((rec, index) => {
        const icon = rec.severity === 'high' ? '🚨' : rec.severity === 'medium' ? '⚠️' : 'ℹ️'
        console.log(`   ${icon} ${rec.message}`)
        console.log(`      → ${rec.action}`)
      })
    }
  }

  checkImageOptimization() {
    const publicDir = path.join(this.projectRoot, 'public')
    if (!fs.existsSync(publicDir)) return

    const images = [
      ...this.findFiles(publicDir, '.jpg', '.jpeg'),
      ...this.findFiles(publicDir, '.png'),
      ...this.findFiles(publicDir, '.gif')
    ]

    let largeImages = 0
    images.forEach(img => {
      const stats = fs.statSync(img)
      if (stats.size > 500 * 1024) { // > 500KB
        largeImages++
      }
    })

    if (largeImages > 0) {
      this.results.recommendations.push({
        type: 'images',
        severity: 'medium',
        message: `${largeImages} large images found in public directory`,
        action: 'Optimize images using next/image and WebP format'
      })
    }
  }

  checkCachingStrategy() {
    // Check for proper caching headers in next.config.js
    const nextConfigPath = path.join(this.projectRoot, 'next.config.js')
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf8')
      
      if (!config.includes('Cache-Control')) {
        this.results.recommendations.push({
          type: 'caching',
          severity: 'medium',
          message: 'No explicit cache control headers found',
          action: 'Add Cache-Control headers for static assets'
        })
      }

      if (!config.includes('sw-') && !config.includes('service-worker')) {
        this.results.recommendations.push({
          type: 'caching',
          severity: 'low',
          message: 'No service worker detected',
          action: 'Consider implementing service worker for offline caching'
        })
      }
    }
  }

  checkCodeSplitting() {
    // Check for dynamic imports in components
    const componentsDir = path.join(this.projectRoot, 'src/components')
    const componentFiles = this.findFiles(componentsDir, '.tsx', '.ts')

    let dynamicImports = 0
    componentFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      if (content.includes('dynamic(') || content.includes('lazy(')) {
        dynamicImports++
      }
    })

    if (dynamicImports < 5 && componentFiles.length > 50) {
      this.results.recommendations.push({
        type: 'code-splitting',
        severity: 'medium',
        message: 'Limited use of code splitting detected',
        action: 'Use dynamic imports for large components and route-based splitting'
      })
    }
  }

  checkUnusedDependencies() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json')
    if (!fs.existsSync(packageJsonPath)) return

    // This is a simplified check - in production, use tools like depcheck
    this.results.recommendations.push({
      type: 'dependencies',
      severity: 'low',
      message: 'Consider auditing dependencies for unused packages',
      action: 'Run "npx depcheck" to identify unused dependencies'
    })
  }

  findFiles(dir, ...extensions) {
    const files = []
    
    if (!fs.existsSync(dir)) return files

    const scan = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir)
        
        items.forEach(item => {
          const fullPath = path.join(currentDir, item)
          const stat = fs.statSync(fullPath)
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scan(fullPath)
          } else if (stat.isFile()) {
            const ext = path.extname(item)
            if (extensions.some(extension => ext === extension)) {
              files.push(fullPath)
            }
          }
        })
      } catch (error) {
        // Ignore permission errors
      }
    }
    
    scan(dir)
    return files
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  generateCachingStrategy() {
    console.log('\\n🔄 Caching Strategy Recommendations:')
    
    const strategies = [
      {
        resource: 'Static Assets (images, fonts, icons)',
        strategy: 'Cache-Control: public, max-age=31536000, immutable',
        reason: 'These files rarely change and can be cached for a year'
      },
      {
        resource: 'API Responses',
        strategy: 'Cache-Control: private, max-age=300, stale-while-revalidate=600',
        reason: 'Cache for 5 minutes, allow stale content for 10 minutes'
      },
      {
        resource: 'Weather Data',
        strategy: 'Cache-Control: public, max-age=1800, stale-while-revalidate=3600',
        reason: 'Weather updates every 30 minutes but can serve stale for 1 hour'
      },
      {
        resource: 'Satellite Imagery',
        strategy: 'Cache-Control: public, max-age=86400, stale-while-revalidate=172800',
        reason: 'Satellite data updates daily but stale data is acceptable for 2 days'
      },
      {
        resource: 'User Dashboard Data',
        strategy: 'Cache-Control: private, no-cache, must-revalidate',
        reason: 'User-specific data should always be fresh'
      }
    ]

    strategies.forEach(strategy => {
      console.log(`   📦 ${strategy.resource}`)
      console.log(`      Header: ${strategy.strategy}`)
      console.log(`      Reason: ${strategy.reason}\\n`)
    })
  }

  async runAnalysis() {
    console.log('🚀 Starting Bundle Analysis and Optimization Review...\\n')
    
    await this.analyzeBundleSize()
    this.generateCachingStrategy()
    
    console.log('\\n📊 Analysis Complete!')
    console.log('\\n📋 Summary:')
    console.log(`   📦 Bundle Size Analysis: ${Object.keys(this.results.bundleSize).length > 0 ? 'Complete' : 'Failed'}`)
    console.log(`   💡 Recommendations Generated: ${this.results.recommendations.length}`)
    console.log(`   🔄 Caching Strategy: Provided`)
    
    console.log('\\n🎯 Next Steps:')
    console.log('   1. Review bundle analysis HTML files')
    console.log('   2. Implement recommended optimizations')
    console.log('   3. Add caching headers to next.config.js')
    console.log('   4. Consider implementing service worker')
    console.log('   5. Monitor bundle size in CI/CD pipeline')
  }
}

// Install webpack-bundle-analyzer if not present
function ensureBundleAnalyzer() {
  try {
    require.resolve('webpack-bundle-analyzer')
  } catch (error) {
    console.log('📦 Installing webpack-bundle-analyzer...')
    execSync('npm install --save-dev webpack-bundle-analyzer', { stdio: 'inherit' })
  }
}

// Run analysis if called directly
if (require.main === module) {
  ensureBundleAnalyzer()
  const analyzer = new BundleAnalyzer()
  analyzer.runAnalysis().catch(console.error)
}

module.exports = BundleAnalyzer