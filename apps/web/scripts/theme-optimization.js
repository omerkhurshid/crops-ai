#!/usr/bin/env node

/**
 * Theme Consistency Optimization Script
 * Analyzes and optimizes color usage and typography across the application
 */

const fs = require('fs')
const path = require('path')

class ThemeOptimizer {
  constructor() {
    this.projectRoot = process.cwd()
    this.results = {
      colors: new Map(),
      typography: new Map(),
      spacing: new Map(),
      recommendations: []
    }
  }

  analyzeThemeConsistency() {
    console.log('🎨 Analyzing Theme Consistency...\n')
    
    const componentFiles = this.findFiles('src/components', '.tsx', '.ts')
    const appFiles = this.findFiles('src/app', '.tsx', '.ts')
    const allFiles = [...componentFiles, ...appFiles]
    
    console.log(`Found ${allFiles.length} files to analyze\n`)
    
    allFiles.forEach(file => this.analyzeFile(file))
    
    this.generateOptimizations()
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.relative(this.projectRoot, filePath)
    
    // Extract Tailwind color classes
    this.extractColors(content, relativePath)
    
    // Extract typography classes
    this.extractTypography(content, relativePath)
    
    // Extract spacing classes
    this.extractSpacing(content, relativePath)
  }

  extractColors(content, filePath) {
    // Comprehensive color patterns
    const colorPatterns = [
      // Standard Tailwind colors
      /(?:bg-|text-|border-|ring-|from-|to-|via-)([a-z]+-\d+)/g,
      // Custom color names
      /(?:bg-|text-|border-|ring-|from-|to-|via-)(sage|earth|cream|golden)-?(\d+)?/g,
      // Opacity variants
      /(?:bg-|text-|border-)([a-z]+-\d+)\/(\d+)/g,
      // Custom CSS colors
      /#[0-9a-fA-F]{6}/g,
      /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
      /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g
    ]

    colorPatterns.forEach(pattern => {
      const matches = content.match(pattern) || []
      matches.forEach(match => {
        const count = this.results.colors.get(match) || { count: 0, files: new Set() }
        count.count++
        count.files.add(filePath)
        this.results.colors.set(match, count)
      })
    })
  }

  extractTypography(content, filePath) {
    // Typography patterns
    const typographyPatterns = [
      // Font sizes
      /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/g,
      // Font weights
      /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/g,
      // Font families
      /font-(sans|serif|mono)/g,
      // Line heights
      /leading-(none|tight|snug|normal|relaxed|loose|\d+)/g
    ]

    typographyPatterns.forEach(pattern => {
      const matches = content.match(pattern) || []
      matches.forEach(match => {
        const count = this.results.typography.get(match) || { count: 0, files: new Set() }
        count.count++
        count.files.add(filePath)
        this.results.typography.set(match, count)
      })
    })
  }

  extractSpacing(content, filePath) {
    // Spacing patterns
    const spacingPatterns = [
      // Padding
      /p[xytrbl]?-(\d+\.?\d*)/g,
      // Margin
      /m[xytrbl]?-(\d+\.?\d*)/g,
      // Gap
      /gap-(\d+\.?\d*)/g,
      // Space between
      /space-[xy]-(\d+\.?\d*)/g
    ]

    spacingPatterns.forEach(pattern => {
      const matches = content.match(pattern) || []
      matches.forEach(match => {
        const count = this.results.spacing.get(match) || { count: 0, files: new Set() }
        count.count++
        count.files.add(filePath)
        this.results.spacing.set(match, count)
      })
    })
  }

  generateOptimizations() {
    console.log('🔍 Analysis Results:\n')
    
    this.analyzeColorUsage()
    this.analyzeTypographyUsage()
    this.analyzeSpacingUsage()
    this.generateRecommendations()
    this.createOptimizedConfig()
  }

  analyzeColorUsage() {
    console.log('🎨 Color Usage Analysis:')
    
    const sortedColors = Array.from(this.results.colors.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
    
    console.log('   Top 20 most used colors:')
    sortedColors.forEach(([color, data], index) => {
      console.log(`   ${index + 1}. ${color} - used ${data.count} times in ${data.files.size} files`)
    })
    
    // Find rare colors (used only once)
    const rareColors = Array.from(this.results.colors.entries())
      .filter(([_, data]) => data.count === 1)
    
    console.log(`\\n   📊 Color Statistics:`)
    console.log(`      Total unique colors: ${this.results.colors.size}`)
    console.log(`      Rare colors (used once): ${rareColors.length}`)
    console.log(`      Color consistency ratio: ${((this.results.colors.size - rareColors.length) / this.results.colors.size * 100).toFixed(1)}%`)
    
    if (rareColors.length > 10) {
      this.results.recommendations.push({
        type: 'colors',
        severity: 'medium',
        message: `${rareColors.length} colors are used only once`,
        action: 'Consider consolidating rare colors into your design system'
      })
    }
  }

  analyzeTypographyUsage() {
    console.log('\\n📝 Typography Usage Analysis:')
    
    const fontSizes = Array.from(this.results.typography.entries())
      .filter(([key]) => key.startsWith('text-'))
      .sort((a, b) => b[1].count - a[1].count)
    
    const fontWeights = Array.from(this.results.typography.entries())
      .filter(([key]) => key.startsWith('font-'))
      .sort((a, b) => b[1].count - a[1].count)
    
    console.log('   Most used font sizes:')
    fontSizes.slice(0, 10).forEach(([size, data], index) => {
      console.log(`   ${index + 1}. ${size} - used ${data.count} times`)
    })
    
    console.log('\\n   Most used font weights:')
    fontWeights.slice(0, 5).forEach(([weight, data], index) => {
      console.log(`   ${index + 1}. ${weight} - used ${data.count} times`)
    })
    
    if (fontSizes.length > 8) {
      this.results.recommendations.push({
        type: 'typography',
        severity: 'low',
        message: `${fontSizes.length} different font sizes detected`,
        action: 'Consider using a more limited typography scale (6-8 sizes)'
      })
    }
  }

  analyzeSpacingUsage() {
    console.log('\\n📏 Spacing Usage Analysis:')
    
    const spacingValues = new Set()
    this.results.spacing.forEach((data, spacing) => {
      const match = spacing.match(/(\d+\.?\d*)/)
      if (match) {
        spacingValues.add(match[1])
      }
    })
    
    const sortedSpacing = Array.from(this.results.spacing.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
    
    console.log('   Most used spacing values:')
    sortedSpacing.forEach(([spacing, data], index) => {
      console.log(`   ${index + 1}. ${spacing} - used ${data.count} times`)
    })
    
    console.log(`\\n   📊 Spacing Statistics:`)
    console.log(`      Unique spacing values: ${spacingValues.size}`)
    console.log(`      Total spacing classes: ${this.results.spacing.size}`)
    
    if (spacingValues.size > 15) {
      this.results.recommendations.push({
        type: 'spacing',
        severity: 'low',
        message: `${spacingValues.size} different spacing values detected`,
        action: 'Consider using a consistent spacing scale (8-12 values)'
      })
    }
  }

  generateRecommendations() {
    console.log('\\n💡 Theme Optimization Recommendations:')
    
    if (this.results.recommendations.length === 0) {
      console.log('   ✅ No major theme consistency issues found!')
      return
    }
    
    this.results.recommendations.forEach((rec, index) => {
      const icon = rec.severity === 'high' ? '🚨' : rec.severity === 'medium' ? '⚠️' : 'ℹ️'
      console.log(`\\n   ${icon} ${rec.message}`)
      console.log(`      → ${rec.action}`)
    })
    
    // Additional general recommendations
    console.log('\\n📋 General Recommendations:')
    console.log('   • Create a centralized design token system')
    console.log('   • Use CSS custom properties for consistent theming')
    console.log('   • Implement a design system component library')
    console.log('   • Use Tailwind config to enforce color palette')
    console.log('   • Regular theme consistency audits')
  }

  createOptimizedConfig() {
    console.log('\\n🔧 Creating Optimized Theme Configuration...')
    
    // Extract most used colors for optimization
    const primaryColors = Array.from(this.results.colors.entries())
      .filter(([color]) => color.includes('sage') || color.includes('green') || color.includes('earth'))
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
    
    const optimizedConfig = {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#d9f2d9',
          200: '#b3e5b3',
          300: '#8dd88d',
          400: '#67cb67',
          500: '#41be41', // Primary green
          600: '#369836',
          700: '#2a722a',
          800: '#1e4c1e',
          900: '#132613'
        },
        sage: {
          50: '#f8faf8',
          100: '#e8f1e8',
          200: '#d1e3d1',
          300: '#a6c8a6',
          400: '#7aad7a',
          500: '#4f924f', // Primary sage
          600: '#3f753f',
          700: '#2f582f',
          800: '#1f3b1f',
          900: '#0f1e0f'
        },
        earth: {
          50: '#faf9f7',
          100: '#f0ede6',
          200: '#e1dbc8',
          300: '#c7b89a',
          400: '#ad956c',
          500: '#937240', // Primary earth
          600: '#765b33',
          700: '#594427',
          800: '#3c2d1a',
          900: '#1e160d'
        }
      },
      typography: {
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          serif: ['Merriweather', 'serif'],
          mono: ['JetBrains Mono', 'monospace']
        },
        fontSize: {
          xs: ['0.75rem', { lineHeight: '1rem' }],
          sm: ['0.875rem', { lineHeight: '1.25rem' }],
          base: ['1rem', { lineHeight: '1.5rem' }],
          lg: ['1.125rem', { lineHeight: '1.75rem' }],
          xl: ['1.25rem', { lineHeight: '1.75rem' }],
          '2xl': ['1.5rem', { lineHeight: '2rem' }],
          '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
          '4xl': ['2.25rem', { lineHeight: '2.5rem' }]
        }
      },
      spacing: {
        0: '0px',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem'
      }
    }
    
    const configPath = path.join(this.projectRoot, 'optimized-theme-config.json')
    fs.writeFileSync(configPath, JSON.stringify(optimizedConfig, null, 2))
    
    console.log(`   ✅ Optimized theme configuration saved to: optimized-theme-config.json`)
    console.log('   📋 Use this configuration to update your Tailwind config')
  }

  findFiles(dir, ...extensions) {
    const files = []
    const fullDir = path.join(this.projectRoot, dir)
    
    if (!fs.existsSync(fullDir)) return files
    
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
    
    scan(fullDir)
    return files
  }

  async runOptimization() {
    console.log('🎨 Starting Theme Consistency Optimization...\\n')
    
    this.analyzeThemeConsistency()
    
    console.log('\\n✅ Theme Analysis Complete!')
    console.log('\\n🎯 Next Steps:')
    console.log('   1. Review the optimized theme configuration')
    console.log('   2. Update your Tailwind config with consistent colors')
    console.log('   3. Implement design tokens for better consistency')
    console.log('   4. Create component variants using the optimized palette')
    console.log('   5. Run this analysis periodically to maintain consistency')
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new ThemeOptimizer()
  optimizer.runOptimization().catch(console.error)
}

module.exports = ThemeOptimizer