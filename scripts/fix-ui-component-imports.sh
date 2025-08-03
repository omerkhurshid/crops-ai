#!/bin/bash

echo "Fixing UI component import paths..."

cd apps/web

# Fix UI components that import @/lib -> ../../lib
find src/components/ui -name "*.tsx" -type f -exec sed -i.bak 's|from "@/lib|from "../../lib|g' {} \;

# Remove backup files
find src/components/ui -name "*.bak" -delete

echo "UI component import paths fixed!"