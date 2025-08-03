#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this after updating .env.production with your actual values

echo "🔧 Setting up Vercel environment variables..."

# Check if .env.production exists
if [ ! -f "apps/web/.env.production" ]; then
    echo "❌ .env.production not found. Please create it first."
    exit 1
fi

cd apps/web

echo "Adding environment variables to Vercel..."

# Read .env.production and add each variable to Vercel
while IFS= read -r line; do
    # Skip comments and empty lines
    if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
        continue
    fi
    
    # Extract key=value
    if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Remove quotes from value
        value=$(echo "$value" | sed 's/^"//; s/"$//')
        
        echo "Setting $key..."
        vercel env add "$key" production <<< "$value"
    fi
done < .env.production

echo "✅ Environment variables added to Vercel!"
echo "Next: Run 'vercel --prod' to deploy"

cd ../../