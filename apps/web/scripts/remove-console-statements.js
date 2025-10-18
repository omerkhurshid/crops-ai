#!/usr/bin/env node

/**
 * Remove Console Statements Script
 * Removes console.log, console.warn, console.error statements from production code
 */

const fs = require('fs')
const path = require('path')

class ConsoleRemover {
  constructor() {
    this.removedCount = 0
    this.filesModified = 0
    this.srcDir = path.join(__dirname, '../src')
  }

  removeConsoleStatements() {
    console.log('🧹 Removing console statements for production...\n')
    
    this.processDirectory(this.srcDir)
    
    console.log(`\n✅ Cleanup complete!`)
    console.log(`📁 Files modified: ${this.filesModified}`)
    console.log(`🗑️  Console statements removed: ${this.removedCount}`)
  }

  processDirectory(dir) {
    if (!fs.existsSync(dir)) return

    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.processDirectory(filePath)
      } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
        this.processFile(filePath)
      }
    })
  }

  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const originalContent = content
      
      // Remove console statements but preserve critical error logging
      let modifiedContent = content
        // Remove console.log statements
        .replace(/^\s*console\.log\(.*?\);?\s*$/gm, '')
        // Remove console.warn statements  
        .replace(/^\s*console\.warn\(.*?\);?\s*$/gm, '')
        // Keep console.error in API routes and error boundaries for debugging
        .replace(/^\s*console\.error\((?!.*error|.*catch|.*boundary).*?\);?\s*$/gm, '')
        // Remove inline console statements
        .replace(/console\.log\([^)]*\)\s*[;,]?\s*/g, '')
        .replace(/console\.warn\([^)]*\)\s*[;,]?\s*/g, '')
        // Clean up empty lines left behind
        .replace(/\n\s*\n\s*\n/g, '\n\n')

      if (modifiedContent !== originalContent) {
        // Count removed statements
        const originalLines = originalContent.split('\n')
        const modifiedLines = modifiedContent.split('\n')
        const removedLines = originalLines.length - modifiedLines.length
        
        this.removedCount += removedLines
        this.filesModified++
        
        fs.writeFileSync(filePath, modifiedContent, 'utf8')
        
        const relativePath = path.relative(this.srcDir, filePath)
        console.log(`📝 ${relativePath} - removed ${removedLines} console statements`)
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message)
    }
  }
}

// Run cleanup
const remover = new ConsoleRemover()
remover.removeConsoleStatements()