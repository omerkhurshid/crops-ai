#!/usr/bin/env node

/**
 * Script to remove console.log statements from production code
 * Keeps console.error for important error handling
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function removeConsoleLogs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Remove console.log, console.warn, console.info but keep console.error
  const cleanedContent = content
    .replace(/\s*console\.(log|warn|info)\([^)]*\);?\s*/g, '')
    .replace(/\s*console\.(log|warn|info)\([^)]*\)\s*/g, ' ')
    // Clean up extra whitespace and empty lines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s*\n/gm, '');
  
  if (content !== cleanedContent) {
    fs.writeFileSync(filePath, cleanedContent, 'utf8');
    console.log(`✅ Cleaned: ${filePath}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🧹 Removing console.log statements from production code...\n');
  
  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/tests/**', '**/*.test.*', '**/*.spec.*']
  });
  
  let cleanedCount = 0;
  
  files.forEach(file => {
    if (removeConsoleLogs(file)) {
      cleanedCount++;
    }
  });
  
  console.log(`\n✨ Cleaned ${cleanedCount} files`);
  console.log('📝 Note: Kept console.error statements for error handling');
}

if (require.main === module) {
  main();
}

module.exports = { removeConsoleLogs };