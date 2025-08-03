#!/bin/bash

echo "Fixing depth-specific import paths..."

cd apps/web

# Fix files at depth 3 (src/app/api/X/) - these need ../../../lib
find src/app/api -maxdepth 1 -name "*.ts" -type f -exec sed -i.bak 's|from '\''../../../../lib|from '\''../../../lib|g' {} \;

# Fix graphql specifically
sed -i.bak 's|from '\''../../../../lib|from '\''../../../lib|g' src/app/api/graphql/route.ts

# Fix health specifically  
sed -i.bak 's|from '\''../../../../lib|from '\''../../../lib|g' src/app/api/health/route.ts

# Fix users specifically
sed -i.bak 's|from '\''../../../../lib|from '\''../../../lib|g' src/app/api/users/route.ts

# Remove backup files
find src/app/api -name "*.bak" -delete

echo "Depth-specific import paths fixed!"