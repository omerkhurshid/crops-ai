#!/bin/bash

echo "Fixing import paths correctly..."

cd apps/web

# For files in src/app/api/auth/profile/route.ts - need to go up 4 levels
find src/app/api -name "*.ts" -type f | while read file; do
  echo "Processing: $file"
  
  # Count the depth from src/
  dir=$(dirname "$file")
  # Remove 'src/' prefix and count remaining slashes
  relative_dir=${dir#src/}
  depth=$(echo "$relative_dir" | grep -o "/" | wc -l)
  depth=$((depth + 1))  # Add 1 because we need to go up from src/ too
  
  # Create the relative path prefix
  prefix=""
  for ((i=0; i<depth; i++)); do
    prefix="../$prefix"
  done
  
  echo "  Depth: $depth, Prefix: $prefix"
  
  # Replace the imports with correct relative paths
  sed -i.bak -E "s|from '\.\./+lib|from '${prefix}lib|g" "$file"
  rm "${file}.bak" 2>/dev/null || true
done

echo "Import paths fixed correctly!"