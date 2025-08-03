#!/bin/bash

echo "Fixing component import paths..."

cd apps/web

# Fix components that wrongly import ../components/ui -> ../ui
find src/components -name "*.tsx" -type f -exec sed -i.bak 's|from '\''../components/ui/|from '\''../ui/|g' {} \;

# Remove backup files
find src/components -name "*.bak" -delete

echo "Component import paths fixed!"