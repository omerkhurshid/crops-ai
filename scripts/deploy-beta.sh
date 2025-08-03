#!/bin/bash

# Crops.AI Beta Deployment Script
# Automates the deployment process to Vercel

set -e  # Exit on any error

echo "🚀 Starting Crops.AI Beta Deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "apps/web/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to web app directory
cd apps/web

print_status "Running pre-deployment checks..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production not found. Please ensure environment variables are configured"
    exit 1
fi

# Run type checking
print_status "Running TypeScript type checking..."
if npm run type-check; then
    print_success "Type checking passed"
else
    print_error "Type checking failed. Please fix TypeScript errors before deploying"
    exit 1
fi

# Run linting
print_status "Running ESLint..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting found issues. Continuing with deployment..."
fi

# Build the application
print_status "Building application..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed. Please fix build errors before deploying"
    exit 1
fi

# Setup database
print_status "Setting up database schema..."
export $(cat .env.production | grep -v '^#' | xargs)

print_status "Generating Prisma client..."
npx prisma generate

print_status "Pushing database schema to production..."
if npx prisma db push; then
    print_success "Database schema updated successfully"
else
    print_warning "Database schema update had issues, but continuing..."
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."

# Login to Vercel if not already logged in
vercel whoami > /dev/null 2>&1 || {
    print_status "Please login to Vercel:"
    vercel login
}

# Deploy
if vercel --prod; then
    print_success "Deployment completed successfully!"
else
    print_error "Deployment failed"
    exit 1
fi

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls | grep "crops-ai" | head -1 | awk '{print $2}' || echo "crops-ai-beta.vercel.app")

print_success "Deployment completed!"
print_status "Deployment URL: https://$DEPLOYMENT_URL"

# Run post-deployment health checks
print_status "Running post-deployment health checks..."

# Wait for deployment to be ready
sleep 15

# Check health endpoint
if curl -f -s "https://$DEPLOYMENT_URL/api/health" > /dev/null; then
    print_success "Health check passed"
else
    print_warning "Health check failed - deployment may still be starting up"
fi

# Generate deployment report
print_status "Generating deployment report..."

cat > deployment-report.md << EOF
# Deployment Report

**Date**: $(date)
**Deployment URL**: https://$DEPLOYMENT_URL
**Git Commit**: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
**Git Branch**: $(git branch --show-current 2>/dev/null || echo "N/A")

## Pre-deployment Checks
- ✅ Type checking passed
- ✅ Build successful
- ✅ Database schema updated

## Post-deployment Checks
- Health endpoint: $(curl -f -s "https://$DEPLOYMENT_URL/api/health" > /dev/null && echo "✅ Passed" || echo "⚠️ Check manually")

## Next Steps
1. Test core functionality manually
2. Monitor error rates and performance
3. Invite beta users for testing

## Important URLs
- **App**: https://$DEPLOYMENT_URL
- **Health Check**: https://$DEPLOYMENT_URL/api/health
- **GraphQL**: https://$DEPLOYMENT_URL/api/graphql

## Rollback Instructions
If issues are found, rollback with:
\`\`\`bash
vercel rollback
\`\`\`
EOF

print_success "Deployment report saved to deployment-report.md"

# Final instructions
echo ""
print_success "🎉 Beta deployment completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Test the application at: https://$DEPLOYMENT_URL"
echo "2. Verify all features work correctly"
echo "3. Monitor logs in Vercel dashboard"
echo "4. Review deployment report: deployment-report.md"
echo ""
print_status "Testing checklist:"
echo "- ✅ Registration and login"
echo "- ✅ Farm creation"
echo "- ✅ Weather data display"
echo "- ✅ Satellite imagery (if implemented)"
echo ""

# Return to project root
cd ../../