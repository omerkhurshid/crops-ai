#!/bin/bash

# Crops.AI Deployment Script
# This script commits and deploys all changes to production

echo "🚀 Starting Crops.AI deployment process..."

# Navigate to project root
cd /Users/omerkhurshid/crops.ai

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the Crops.AI root directory"
    exit 1
fi

# Stage all changes
echo "📦 Staging all changes..."
git add .

# Create commit with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "💾 Creating commit..."
git commit -m "Production deployment - $TIMESTAMP

- Security hardening: Removed hardcoded credentials
- Performance optimization: Added React memoization and lazy loading
- Database optimization: 78 performance indexes
- API security: Rate limiting and input validation
- UX improvements: Proper no-data and loading states
- Bundle optimization: Next.js performance config
- Memory leak prevention: Cleanup hooks
- Demo data removal: All pages now use real data only"

# Push to main branch
echo "📤 Pushing to GitHub..."
git push origin main

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
cd apps/web
vercel --prod

echo "✅ Deployment complete!"
echo "📊 Summary:"
echo "- Code pushed to GitHub"
echo "- Production deployment triggered on Vercel"
echo "- Visit your Vercel dashboard to monitor deployment progress"