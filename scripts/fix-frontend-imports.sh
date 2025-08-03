#!/bin/bash

echo "Fixing frontend import paths..."

cd apps/web

# Fix all frontend pages and components with @/ imports
find src/app -name "*.tsx" -type f -exec sed -i.bak 's|from '\''@/|from '\''../../|g' {} \;

# Fix components that import from @/
find src/components -name "*.tsx" -type f -exec sed -i.bak 's|from '\''@/|from '\''../|g' {} \;

# Remove backup files
find src -name "*.bak" -delete

echo "Frontend import paths fixed!"