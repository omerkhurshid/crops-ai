#!/bin/bash

# Manual Deployment Script for Crops.AI
# Run this after logging into Vercel manually

set -e

echo "🚀 Manual Crops.AI Deployment Script"
echo "Prerequisites: You must have already run 'vercel login'"

# Navigate to web directory
cd "$(dirname "$0")/../apps/web"

# Check if logged in
if ! npx vercel whoami > /dev/null 2>&1; then
    echo "❌ Not logged into Vercel. Please run:"
    echo "   npx vercel login"
    exit 1
fi

echo "✅ Vercel authentication verified"

# Check environment file
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found"
    exit 1
fi

echo "✅ Environment file found"

# Setup database first
echo "📊 Setting up database..."
export $(cat .env.production | grep -v '^#' | xargs)
npx prisma generate
npx prisma db push

# Create Vercel project (interactive)
echo "🔧 Creating Vercel project..."
echo "When prompted:"
echo "  - Set up and deploy? → Y"
echo "  - Which scope? → Your personal account"
echo "  - Link to existing project? → N"
echo "  - Project name → crops-ai-beta (or your choice)"
echo "  - Directory → ./ (current directory)"
echo "  - Want to modify settings? → N"

npx vercel

echo "⚙️ Adding environment variables to Vercel..."

# Add all environment variables to Vercel
npx vercel env add DATABASE_URL production <<< "$DATABASE_URL"
npx vercel env add DIRECT_URL production <<< "$DIRECT_URL"
npx vercel env add NEXTAUTH_URL production <<< "$NEXTAUTH_URL"
npx vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"
npx vercel env add UPSTASH_REDIS_REST_URL production <<< "$UPSTASH_REDIS_REST_URL"
npx vercel env add UPSTASH_REDIS_REST_TOKEN production <<< "$UPSTASH_REDIS_REST_TOKEN"
npx vercel env add CLOUDINARY_CLOUD_NAME production <<< "$CLOUDINARY_CLOUD_NAME"
npx vercel env add CLOUDINARY_API_KEY production <<< "$CLOUDINARY_API_KEY"
npx vercel env add CLOUDINARY_API_SECRET production <<< "$CLOUDINARY_API_SECRET"
npx vercel env add OPENWEATHER_API_KEY production <<< "$OPENWEATHER_API_KEY"
npx vercel env add SENTINEL_HUB_CLIENT_ID production <<< "$SENTINEL_HUB_CLIENT_ID"
npx vercel env add SENTINEL_HUB_CLIENT_SECRET production <<< "$SENTINEL_HUB_CLIENT_SECRET"
npx vercel env add NODE_ENV production <<< "production"

echo "🚀 Deploying to production..."
npx vercel --prod

echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "1. Visit your Vercel dashboard to see the deployment"
echo "2. Test the application at the provided URL"
echo "3. Verify all features work correctly"

# Get deployment info
echo "📊 Deployment info:"
npx vercel ls --scope="$(npx vercel whoami)" | head -5