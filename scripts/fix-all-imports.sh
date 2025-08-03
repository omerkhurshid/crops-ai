#!/bin/bash

echo "Fixing all import paths..."

cd apps/web

# Fix all files that have wrong import paths
find src/app/api -name "*.ts" -type f -exec sed -i.bak 's|from '\''../../../lib|from '\''../../../../lib|g' {} \;

# Remove backup files
find src/app/api -name "*.bak" -delete

echo "All import paths fixed!"