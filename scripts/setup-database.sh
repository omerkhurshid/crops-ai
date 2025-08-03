#!/bin/bash

# Database Setup Script for Production
echo "🗄️ Setting up production database..."

cd apps/web

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found. Please create it first."
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema to production..."
npx prisma db push

echo "✅ Database setup complete!"
echo "You can view your database at: https://supabase.com/dashboard/project/[your-project-id]"

cd ../../