#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps you add all environment variables to Vercel

echo "🔧 Vercel Environment Variables Setup"
echo "===================================="
echo ""
echo "This script will generate commands to add environment variables to Vercel."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Copy and paste these commands one by one in your terminal:"
echo ""
echo "# First, link your project (if not already linked)"
echo "vercel link"
echo ""
echo "# Then add each environment variable:"
echo ""

cat << 'EOF'
vercel env add DATABASE_URL production
# Paste: postgresql://postgres:H4tchet!23@db.drtbsioeqfodcaelukpo.supabase.co:5432/postgres

vercel env add DIRECT_URL production  
# Paste: postgresql://postgres:H4tchet!23@db.drtbsioeqfodcaelukpo.supabase.co:5432/postgres

vercel env add NEXTAUTH_SECRET production
# Paste: iUiqN5OysPkmzTg0Vhm3R9kGjrvj5Phs7pneuH0uHtc=

vercel env add UPSTASH_REDIS_REST_URL production
# Paste: https://willing-ant-7628.upstash.io

vercel env add UPSTASH_REDIS_REST_TOKEN production
# Paste: AR3MAAIjcDE1YjUxMjdjNjIyNGU0YTc3OGVhN2Q5N2IwNjgxYWQyZHAxMA

vercel env add CLOUDINARY_CLOUD_NAME production
# Paste: diqvzdrdq

vercel env add CLOUDINARY_API_KEY production
# Paste: 742839462557168

vercel env add CLOUDINARY_API_SECRET production
# Paste: PjIudH97El9uNRe5XeRy80OOc9o

vercel env add OPENWEATHER_API_KEY production
# Paste: 7c0956bac2c9dabb9aec97f3da9bdf9b

vercel env add SENTINEL_HUB_CLIENT_ID production
# Paste: 51c4b312-1fd8-4db7-83f8-d8d8a44f7307

vercel env add SENTINEL_HUB_CLIENT_SECRET production
# Paste: 9YObbAxUoKMAe5lCHG90z6MmnrnlVsno

vercel env add NODE_ENV production
# Paste: production
EOF

echo ""
echo "# After deployment, add NEXTAUTH_URL with your actual deployment URL:"
echo "vercel env add NEXTAUTH_URL production"
echo "# Paste: https://your-actual-deployment-url.vercel.app"
echo ""
echo "===================================="
echo "Alternative: Manual Setup in Vercel Dashboard"
echo "===================================="
echo ""
echo "1. Go to your Vercel project settings"
echo "2. Click on 'Environment Variables' in the left sidebar"
echo "3. Add each variable manually using the values above"
echo ""
echo "TIP: You can also create a .env.local file and use 'vercel env pull' later"