#!/bin/bash

# Fix import paths in API routes
echo "Fixing import paths in API routes..."

cd apps/web

# Find all TypeScript files in src/app/api and replace @/lib imports
find src/app/api -name "*.ts" -type f | while read file; do
  # Calculate the relative path from the file to src/lib
  dir=$(dirname "$file")
  # Count how many directories deep we are from src/
  depth=$(echo "$dir" | grep -o "/" | wc -l)
  depth=$((depth - 1))  # Subtract 1 because src/ is the base
  
  # Create the relative path prefix
  prefix=""
  for ((i=0; i<depth; i++)); do
    prefix="../$prefix"
  done
  
  # Replace @/lib with the relative path
  sed -i.bak "s|from '@/lib|from '${prefix}lib|g" "$file"
  rm "${file}.bak"
done

echo "Import paths fixed!"