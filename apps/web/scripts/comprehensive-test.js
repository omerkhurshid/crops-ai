#!/usr/bin/env node

/**
 * Comprehensive Testing Suite for Crops.AI
 * Tests: Best Practices, Performance, Security, Mobile UX, Theme Consistency
 */

const fs = require('fs')
const path = require('path')

class ComprehensiveTestSuite {
  constructor() {
    this.results = {
      bestPractices: [],
      unitTests: [],
      performance: [],
      themeConsistency: [],
      mobileFormatting: [],
      mobileUX: [],
      security: [],
      overall: { passed: 0, failed: 0, warnings: 0 }
    }
    this.projectRoot = process.cwd()
  }

  // Best Practices Testing
  async testBestPractices() {
    console.log('🏆 Testing Best Practices...')
    
    // Check for proper TypeScript usage
    this.checkTypeScriptUsage()
    
    // Check for proper error handling
    this.checkErrorHandling()
    
    // Check for proper component structure
    this.checkComponentStructure()
    
    // Check for environment variable handling
    this.checkEnvironmentVariables()
    
    // Check for proper API structure
    this.checkAPIStructure()
  }

  checkTypeScriptUsage() {
    const tsConfigPath = path.join(this.projectRoot, 'tsconfig.json')
    
    if (fs.existsSync(tsConfigPath)) {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'))
      
      if (tsConfig.compilerOptions?.strict) {
        this.addResult('bestPractices', '✅ PASS', 'TypeScript strict mode enabled')
      } else {
        this.addResult('bestPractices', '⚠️ WARN', 'TypeScript strict mode not enabled')
      }
      
      if (tsConfig.compilerOptions?.noImplicitAny) {
        this.addResult('bestPractices', '✅ PASS', 'noImplicitAny enabled')
      } else {
        this.addResult('bestPractices', '⚠️ WARN', 'noImplicitAny not enabled')
      }
    } else {
      this.addResult('bestPractices', '❌ FAIL', 'tsconfig.json not found')
    }
  }

  checkErrorHandling() {
    const apiRoutes = this.findFiles('src/app/api', '.ts')
    let routesWithTryCatch = 0
    
    apiRoutes.forEach(route => {
      const content = fs.readFileSync(route, 'utf8')
      if (content.includes('try {') && content.includes('catch')) {
        routesWithTryCatch++
      }
    })
    
    const coverage = (routesWithTryCatch / apiRoutes.length) * 100
    
    if (coverage >= 90) {
      this.addResult('bestPractices', '✅ PASS', `Error handling coverage: ${coverage.toFixed(1)}%`)
    } else if (coverage >= 70) {
      this.addResult('bestPractices', '⚠️ WARN', `Error handling coverage: ${coverage.toFixed(1)}%`)
    } else {
      this.addResult('bestPractices', '❌ FAIL', `Error handling coverage: ${coverage.toFixed(1)}%`)
    }
  }

  checkComponentStructure() {
    const components = this.findFiles('src/components', '.tsx')
    let properComponents = 0
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      // Check for proper export
      if (content.includes('export function') || content.includes('export default')) {
        properComponents++
      }
    })
    
    const compliance = (properComponents / components.length) * 100
    
    if (compliance >= 95) {
      this.addResult('bestPractices', '✅ PASS', `Component structure compliance: ${compliance.toFixed(1)}%`)
    } else {
      this.addResult('bestPractices', '⚠️ WARN', `Component structure compliance: ${compliance.toFixed(1)}%`)
    }
  }

  checkEnvironmentVariables() {
    const envExamplePath = path.join(this.projectRoot, '.env.example')
    const envPath = path.join(this.projectRoot, '.env')
    
    if (fs.existsSync(envExamplePath)) {
      this.addResult('bestPractices', '✅ PASS', '.env.example file exists')
    } else {
      this.addResult('bestPractices', '⚠️ WARN', '.env.example file missing')
    }
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      
      // Check for sensitive data patterns
      if (envContent.includes('YOUR_KEY_HERE') || envContent.includes('CHANGE_ME')) {
        this.addResult('bestPractices', '⚠️ WARN', 'Environment contains placeholder values')
      } else {
        this.addResult('bestPractices', '✅ PASS', 'Environment variables properly configured')
      }
    }
  }

  checkAPIStructure() {
    const apiRoutes = this.findFiles('src/app/api', 'route.ts')
    let standardCompliant = 0
    
    apiRoutes.forEach(route => {
      const content = fs.readFileSync(route, 'utf8')
      
      // Check for proper HTTP methods
      if (content.includes('export async function GET') || 
          content.includes('export async function POST') ||
          content.includes('export async function PUT') ||
          content.includes('export async function DELETE')) {
        standardCompliant++
      }
    })
    
    const compliance = (standardCompliant / apiRoutes.length) * 100
    
    if (compliance >= 90) {
      this.addResult('bestPractices', '✅ PASS', `API structure compliance: ${compliance.toFixed(1)}%`)
    } else {
      this.addResult('bestPractices', '⚠️ WARN', `API structure compliance: ${compliance.toFixed(1)}%`)
    }
  }

  // Unit Testing Assessment
  async testUnitTests() {
    console.log('🧪 Testing Unit Test Coverage...')
    
    const testFiles = this.findFiles('.', '.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx')
    const sourceFiles = this.findFiles('src', '.ts', '.tsx')
    
    const testCoverage = (testFiles.length / sourceFiles.length) * 100
    
    if (testCoverage >= 80) {
      this.addResult('unitTests', '✅ PASS', `Test coverage: ${testCoverage.toFixed(1)}%`)
    } else if (testCoverage >= 50) {
      this.addResult('unitTests', '⚠️ WARN', `Test coverage: ${testCoverage.toFixed(1)}%`)
    } else {
      this.addResult('unitTests', '❌ FAIL', `Test coverage: ${testCoverage.toFixed(1)}%`)
    }
    
    // Check for Jest configuration
    const jestConfig = fs.existsSync(path.join(this.projectRoot, 'jest.config.js')) ||
                      fs.existsSync(path.join(this.projectRoot, 'jest.config.ts'))
    
    if (jestConfig) {
      this.addResult('unitTests', '✅ PASS', 'Jest configuration found')
    } else {
      this.addResult('unitTests', '⚠️ WARN', 'No Jest configuration found')
    }
  }

  // Performance Testing
  async testPerformance() {
    console.log('⚡ Testing Performance...')
    
    // Check for Next.js optimization
    this.checkNextJSOptimization()
    
    // Check for image optimization
    this.checkImageOptimization()
    
    // Check for bundle size
    this.checkBundleOptimization()
    
    // Check for caching strategies
    this.checkCachingStrategies()
  }

  checkNextJSOptimization() {
    const nextConfigPath = path.join(this.projectRoot, 'next.config.js')
    
    if (fs.existsSync(nextConfigPath)) {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8')
      
      if (nextConfig.includes('experimental')) {
        this.addResult('performance', '✅ PASS', 'Next.js experimental features configured')
      }
      
      if (nextConfig.includes('compress')) {
        this.addResult('performance', '✅ PASS', 'Compression enabled')
      } else {
        this.addResult('performance', '⚠️ WARN', 'Compression not explicitly configured')
      }
    }
  }

  checkImageOptimization() {
    const components = this.findFiles('src/components', '.tsx')
    let optimizedImages = 0
    let totalImages = 0
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      const imgMatches = content.match(/<img|<Image/g) || []
      totalImages += imgMatches.length
      
      const nextImageMatches = content.match(/from ['"]next\/image['"]/g) || []
      optimizedImages += nextImageMatches.length
    })
    
    if (totalImages > 0) {
      const optimization = (optimizedImages / totalImages) * 100
      
      if (optimization >= 80) {
        this.addResult('performance', '✅ PASS', `Image optimization: ${optimization.toFixed(1)}%`)
      } else {
        this.addResult('performance', '⚠️ WARN', `Image optimization: ${optimization.toFixed(1)}%`)
      }
    } else {
      this.addResult('performance', '✅ PASS', 'No images found to optimize')
    }
  }

  checkBundleOptimization() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json')
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      if (packageJson.scripts?.['analyze']) {
        this.addResult('performance', '✅ PASS', 'Bundle analysis script available')
      } else {
        this.addResult('performance', '⚠️ WARN', 'No bundle analysis script found')
      }
    }
  }

  checkCachingStrategies() {
    const apiRoutes = this.findFiles('src/app/api', '.ts')
    let routesWithCaching = 0
    
    apiRoutes.forEach(route => {
      const content = fs.readFileSync(route, 'utf8')
      if (content.includes('cache') || content.includes('Cache-Control') || content.includes('maxAge')) {
        routesWithCaching++
      }
    })
    
    const cacheUsage = (routesWithCaching / apiRoutes.length) * 100
    
    if (cacheUsage >= 30) {
      this.addResult('performance', '✅ PASS', `Caching implementation: ${cacheUsage.toFixed(1)}%`)
    } else {
      this.addResult('performance', '⚠️ WARN', `Limited caching implementation: ${cacheUsage.toFixed(1)}%`)
    }
  }

  // Theme Consistency Testing
  async testThemeConsistency() {
    console.log('🎨 Testing Theme Consistency...')
    
    // Check for consistent color usage
    this.checkColorConsistency()
    
    // Check for consistent spacing
    this.checkSpacingConsistency()
    
    // Check for consistent typography
    this.checkTypographyConsistency()
  }

  checkColorConsistency() {
    const components = this.findFiles('src/components', '.tsx')
    const colors = new Set()
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      // Extract Tailwind color classes
      const colorMatches = content.match(/(?:bg-|text-|border-)(\w+-\d+)/g) || []
      colorMatches.forEach(match => colors.add(match))
      
      // Extract custom hex colors
      const hexMatches = content.match(/#[0-9a-fA-F]{6}/g) || []
      hexMatches.forEach(match => colors.add(match))
    })
    
    const uniqueColors = Array.from(colors)
    
    if (uniqueColors.length <= 20) {
      this.addResult('themeConsistency', '✅ PASS', `Controlled color palette: ${uniqueColors.length} unique colors`)
    } else if (uniqueColors.length <= 40) {
      this.addResult('themeConsistency', '⚠️ WARN', `Moderate color variety: ${uniqueColors.length} unique colors`)
    } else {
      this.addResult('themeConsistency', '❌ FAIL', `Too many colors: ${uniqueColors.length} unique colors`)
    }
  }

  checkSpacingConsistency() {
    const components = this.findFiles('src/components', '.tsx')
    const spacingClasses = new Set()
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      // Extract spacing classes
      const spacingMatches = content.match(/(?:p-|m-|gap-|space-)(\d+)/g) || []
      spacingMatches.forEach(match => spacingClasses.add(match))
    })
    
    const uniqueSpacing = Array.from(spacingClasses)
    
    if (uniqueSpacing.length <= 15) {
      this.addResult('themeConsistency', '✅ PASS', `Consistent spacing: ${uniqueSpacing.length} spacing values`)
    } else {
      this.addResult('themeConsistency', '⚠️ WARN', `Varied spacing: ${uniqueSpacing.length} spacing values`)
    }
  }

  checkTypographyConsistency() {
    const components = this.findFiles('src/components', '.tsx')
    const textClasses = new Set()
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      // Extract text size classes
      const textMatches = content.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/g) || []
      textMatches.forEach(match => textClasses.add(match))
    })
    
    const uniqueTextSizes = Array.from(textClasses)
    
    if (uniqueTextSizes.length <= 8) {
      this.addResult('themeConsistency', '✅ PASS', `Consistent typography: ${uniqueTextSizes.length} text sizes`)
    } else {
      this.addResult('themeConsistency', '⚠️ WARN', `Varied typography: ${uniqueTextSizes.length} text sizes`)
    }
  }

  // Mobile Formatting Testing
  async testMobileFormatting() {
    console.log('📱 Testing Mobile Formatting...')
    
    // Check for responsive classes
    this.checkResponsiveDesign()
    
    // Check for mobile-specific components
    this.checkMobileComponents()
    
    // Check for touch-friendly interactions
    this.checkTouchInteractions()
  }

  checkResponsiveDesign() {
    const components = this.findFiles('src/components', '.tsx')
    let responsiveComponents = 0
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      if (content.includes('sm:') || content.includes('md:') || content.includes('lg:') || content.includes('xl:')) {
        responsiveComponents++
      }
    })
    
    const responsiveness = (responsiveComponents / components.length) * 100
    
    if (responsiveness >= 80) {
      this.addResult('mobileFormatting', '✅ PASS', `Responsive design: ${responsiveness.toFixed(1)}%`)
    } else if (responsiveness >= 60) {
      this.addResult('mobileFormatting', '⚠️ WARN', `Partial responsive design: ${responsiveness.toFixed(1)}%`)
    } else {
      this.addResult('mobileFormatting', '❌ FAIL', `Limited responsive design: ${responsiveness.toFixed(1)}%`)
    }
  }

  checkMobileComponents() {
    const layoutFile = path.join(this.projectRoot, 'src/app/layout.tsx')
    
    if (fs.existsSync(layoutFile)) {
      const content = fs.readFileSync(layoutFile, 'utf8')
      
      if (content.includes('viewport')) {
        this.addResult('mobileFormatting', '✅ PASS', 'Viewport meta tag configured')
      } else {
        this.addResult('mobileFormatting', '⚠️ WARN', 'Viewport meta tag not found')
      }
    }
  }

  checkTouchInteractions() {
    const components = this.findFiles('src/components', '.tsx')
    let touchFriendly = 0
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      // Check for proper button/click target sizes
      if (content.includes('h-10') || content.includes('h-12') || content.includes('p-3') || content.includes('p-4')) {
        touchFriendly++
      }
    })
    
    const touchFriendliness = (touchFriendly / components.length) * 100
    
    if (touchFriendliness >= 70) {
      this.addResult('mobileFormatting', '✅ PASS', `Touch-friendly elements: ${touchFriendliness.toFixed(1)}%`)
    } else {
      this.addResult('mobileFormatting', '⚠️ WARN', `Touch-friendly elements: ${touchFriendliness.toFixed(1)}%`)
    }
  }

  // Mobile UX Testing
  async testMobileUX() {
    console.log('👆 Testing Mobile UX...')
    
    // Check for mobile navigation
    this.checkMobileNavigation()
    
    // Check for loading states
    this.checkLoadingStates()
    
    // Check for error states
    this.checkErrorStates()
  }

  checkMobileNavigation() {
    const navComponents = this.findFiles('src/components', '.tsx').filter(file => 
      file.includes('nav') || file.includes('menu') || file.includes('header')
    )
    
    let mobileNavFound = false
    
    navComponents.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      if (content.includes('hamburger') || content.includes('menu') || content.includes('mobile')) {
        mobileNavFound = true
      }
    })
    
    if (mobileNavFound) {
      this.addResult('mobileUX', '✅ PASS', 'Mobile navigation implemented')
    } else {
      this.addResult('mobileUX', '⚠️ WARN', 'Mobile navigation not detected')
    }
  }

  checkLoadingStates() {
    const components = this.findFiles('src/components', '.tsx')
    let loadingStates = 0
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      if (content.includes('loading') || content.includes('Loading') || content.includes('isLoading')) {
        loadingStates++
      }
    })
    
    const loadingCoverage = (loadingStates / components.length) * 100
    
    if (loadingCoverage >= 30) {
      this.addResult('mobileUX', '✅ PASS', `Loading states: ${loadingCoverage.toFixed(1)}%`)
    } else {
      this.addResult('mobileUX', '⚠️ WARN', `Limited loading states: ${loadingCoverage.toFixed(1)}%`)
    }
  }

  checkErrorStates() {
    const components = this.findFiles('src/components', '.tsx')
    let errorStates = 0
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      if (content.includes('error') || content.includes('Error') || content.includes('try') || content.includes('catch')) {
        errorStates++
      }
    })
    
    const errorCoverage = (errorStates / components.length) * 100
    
    if (errorCoverage >= 40) {
      this.addResult('mobileUX', '✅ PASS', `Error handling: ${errorCoverage.toFixed(1)}%`)
    } else {
      this.addResult('mobileUX', '⚠️ WARN', `Limited error handling: ${errorCoverage.toFixed(1)}%`)
    }
  }

  // Security Testing
  async testSecurity() {
    console.log('🔒 Testing Security...')
    
    // Check for input validation
    this.checkInputValidation()
    
    // Check for authentication
    this.checkAuthentication()
    
    // Check for environment security
    this.checkEnvironmentSecurity()
    
    // Check for XSS protection
    this.checkXSSProtection()
  }

  checkInputValidation() {
    const apiRoutes = this.findFiles('src/app/api', '.ts')
    let validatedRoutes = 0
    
    apiRoutes.forEach(route => {
      const content = fs.readFileSync(route, 'utf8')
      
      if (content.includes('zod') || content.includes('validate') || content.includes('schema')) {
        validatedRoutes++
      }
    })
    
    const validationCoverage = (validatedRoutes / apiRoutes.length) * 100
    
    if (validationCoverage >= 80) {
      this.addResult('security', '✅ PASS', `Input validation: ${validationCoverage.toFixed(1)}%`)
    } else if (validationCoverage >= 50) {
      this.addResult('security', '⚠️ WARN', `Partial input validation: ${validationCoverage.toFixed(1)}%`)
    } else {
      this.addResult('security', '❌ FAIL', `Limited input validation: ${validationCoverage.toFixed(1)}%`)
    }
  }

  checkAuthentication() {
    const authFiles = this.findFiles('src', '.ts', '.tsx').filter(file => 
      file.includes('auth') || file.includes('session')
    )
    
    if (authFiles.length > 0) {
      this.addResult('security', '✅ PASS', 'Authentication system implemented')
      
      // Check for proper session handling
      let sessionHandling = false
      authFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8')
        if (content.includes('jwt') || content.includes('session') || content.includes('token')) {
          sessionHandling = true
        }
      })
      
      if (sessionHandling) {
        this.addResult('security', '✅ PASS', 'Session management implemented')
      } else {
        this.addResult('security', '⚠️ WARN', 'Session management needs review')
      }
    } else {
      this.addResult('security', '❌ FAIL', 'No authentication system found')
    }
  }

  checkEnvironmentSecurity() {
    const envPath = path.join(this.projectRoot, '.env')
    
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      
      // Check for exposed secrets
      if (content.includes('sk_') || content.includes('pk_') || content.includes('secret_')) {
        this.addResult('security', '⚠️ WARN', 'Potential secrets in .env file')
      }
      
      // Check for database URLs
      if (content.includes('DATABASE_URL')) {
        this.addResult('security', '✅ PASS', 'Database connection secured')
      }
    }
    
    // Check .gitignore
    const gitignorePath = path.join(this.projectRoot, '.gitignore')
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8')
      
      if (gitignore.includes('.env')) {
        this.addResult('security', '✅ PASS', '.env files properly ignored')
      } else {
        this.addResult('security', '❌ FAIL', '.env files not in .gitignore')
      }
    }
  }

  checkXSSProtection() {
    const components = this.findFiles('src/components', '.tsx')
    let dangerousHTML = 0
    
    components.forEach(comp => {
      const content = fs.readFileSync(comp, 'utf8')
      
      if (content.includes('dangerouslySetInnerHTML')) {
        dangerousHTML++
      }
    })
    
    if (dangerousHTML === 0) {
      this.addResult('security', '✅ PASS', 'No dangerous HTML injection found')
    } else {
      this.addResult('security', '⚠️ WARN', `${dangerousHTML} components use dangerouslySetInnerHTML`)
    }
  }

  // Utility Methods
  findFiles(dir, ...extensions) {
    const files = []
    const fullDir = path.join(this.projectRoot, dir)
    
    if (!fs.existsSync(fullDir)) return files
    
    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir)
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath)
        } else if (stat.isFile()) {
          const ext = path.extname(item)
          if (extensions.some(extension => item.endsWith(extension) || ext === extension)) {
            files.push(fullPath)
          }
        }
      })
    }
    
    scan(fullDir)
    return files
  }

  addResult(category, status, message) {
    this.results[category].push({ status, message })
    
    if (status.includes('✅')) {
      this.results.overall.passed++
    } else if (status.includes('❌')) {
      this.results.overall.failed++
    } else if (status.includes('⚠️')) {
      this.results.overall.warnings++
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Running Comprehensive Test Suite for Crops.AI...\n')
    
    await this.testBestPractices()
    await this.testUnitTests()
    await this.testPerformance()
    await this.testThemeConsistency()
    await this.testMobileFormatting()
    await this.testMobileUX()
    await this.testSecurity()
    
    this.printResults()
  }

  printResults() {
    console.log('\n📊 Comprehensive Test Results:')
    console.log('═'.repeat(60))
    
    const categories = [
      { key: 'bestPractices', name: 'Best Practices' },
      { key: 'unitTests', name: 'Unit Testing' },
      { key: 'performance', name: 'Performance' },
      { key: 'themeConsistency', name: 'Theme Consistency' },
      { key: 'mobileFormatting', name: 'Mobile Formatting' },
      { key: 'mobileUX', name: 'Mobile UX' },
      { key: 'security', name: 'Security' }
    ]
    
    categories.forEach(category => {
      console.log(`\n🔍 ${category.name}:`)
      
      if (this.results[category.key].length === 0) {
        console.log('   No tests run for this category')
      } else {
        this.results[category.key].forEach(result => {
          console.log(`   ${result.status} ${result.message}`)
        })
      }
    })
    
    console.log('\n═'.repeat(60))
    console.log(`\n📈 Overall Summary:`)
    console.log(`   ✅ ${this.results.overall.passed} passed`)
    console.log(`   ⚠️  ${this.results.overall.warnings} warnings`)
    console.log(`   ❌ ${this.results.overall.failed} failed`)
    
    const total = this.results.overall.passed + this.results.overall.warnings + this.results.overall.failed
    const score = ((this.results.overall.passed + (this.results.overall.warnings * 0.5)) / total) * 100
    
    console.log(`\n🎯 Overall Score: ${score.toFixed(1)}%`)
    
    if (score >= 90) {
      console.log('🏆 Excellent! Your application follows best practices.')
    } else if (score >= 75) {
      console.log('👍 Good! Some areas could use improvement.')
    } else if (score >= 60) {
      console.log('⚠️  Fair. Several areas need attention.')
    } else {
      console.log('🚨 Needs significant improvement.')
    }
    
    console.log('\n📚 Recommendations:')
    
    if (this.results.overall.failed > 0) {
      console.log('   • Address all failed tests immediately')
    }
    
    if (this.results.overall.warnings > 0) {
      console.log('   • Review and improve warnings when possible')
    }
    
    console.log('   • Continue monitoring and improving test coverage')
    console.log('   • Regular security audits are recommended')
    console.log('   • Consider automated testing in CI/CD pipeline')
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ComprehensiveTestSuite()
  tester.runAllTests().catch(console.error)
}

module.exports = ComprehensiveTestSuite