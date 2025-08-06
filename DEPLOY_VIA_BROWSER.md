# Deploy Crops.AI via Vercel Browser Interface

## Step 1: Push Code to GitHub (if not already done)

1. **Create a new repository on GitHub**
   - Go to https://github.com/new
   - Name: `crops-ai-beta`
   - Make it private or public (your choice)
   - Don't initialize with README (we have files already)

2. **Push your code** (run these commands):
   ```bash
   cd /Users/omerkhurshid/Crops.AI
   git init
   git add .
   git commit -m "Initial commit - Crops.AI beta ready for deployment"
   git branch -M main
   git remote add origin https://github.com/[YOUR-USERNAME]/crops-ai-beta.git
   git push -u origin main
   ```

## Step 2: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with GitHub (recommended)

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Choose **"Import Git Repository"**
   - Select your `crops-ai-beta` repository
   - Click **"Import"**

3. **Configure Project**
   - **Project Name**: `crops-ai-beta`
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `apps/web` ← **IMPORTANT!**
   - **Build Command**: Leave default (`npm run build`)
   - **Output Directory**: Leave default (`.next`)
   - **Install Command**: Leave default (`npm install`)

4. **Environment Variables** (Add during setup)
   Click **"Environment Variables"** and add all from your `VERCEL-ENV-VARS.txt`:

   ```
   DATABASE_URL = postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   
   DIRECT_URL = postgresql://postgres:H4tchet!23@db.drtbsioeqfodcaelukpo.supabase.co:5432/postgres
   
   NEXTAUTH_SECRET = iUiqN5OysPkmzTg0Vhm3R9kGjrvj5Phs7pneuH0uHtc=
   
   UPSTASH_REDIS_REST_URL = https://willing-ant-7628.upstash.io
   
   UPSTASH_REDIS_REST_TOKEN = AR3MAAIjcDE1YjUxMjdjNjIyNGU0YTc3OGVhN2Q5N2IwNjgxYWQyZHAxMA
   
   CLOUDINARY_CLOUD_NAME = diqvzdrdq
   
   CLOUDINARY_API_KEY = 742839462557168
   
   CLOUDINARY_API_SECRET = PjIudH97El9uNRe5XeRy80OOc9o
   
   OPENWEATHER_API_KEY = 7c0956bac2c9dabb9aec97f3da9bdf9b
   
   SENTINEL_HUB_CLIENT_ID = 51c4b312-1fd8-4db7-83f8-d8d8a44f7307
   
   SENTINEL_HUB_CLIENT_SECRET = 9YObbAxUoKMAe5lCHG90z6MmnrnlVsno
   
   NODE_ENV = production
   ```

   **IMPORTANT**: Don't add `NEXTAUTH_URL` yet - you'll get the URL after deployment.

5. **Deploy**
   - Click **"Deploy"**
   - Wait for deployment to complete (5-10 minutes)

## Step 3: Update NEXTAUTH_URL

After deployment:
1. Copy your deployment URL (e.g., `https://crops-ai-beta-abc123.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Add: `NEXTAUTH_URL = https://your-deployment-url.vercel.app`
4. **Redeploy**: Go to **Deployments** tab → Click **"Redeploy"** on latest deployment

## Step 4: Create Database Schema

After successful deployment, you have two options:

### Option A: Supabase SQL Editor (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL to create tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('FARM_OWNER', 'FARM_MANAGER', 'AGRONOMIST', 'ADMIN');
CREATE TYPE "CropStatus" AS ENUM ('PLANNED', 'PLANTED', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED', 'FAILED');
CREATE TYPE "StressLevel" AS ENUM ('NONE', 'LOW', 'MODERATE', 'HIGH', 'SEVERE');

-- Create tables (continue with full schema...)
```

### Option B: Manual Prisma Push
Create a temporary API route in your deployed app to run the schema push.

## Step 5: Test Deployment

Visit these URLs:
- `https://your-app.vercel.app` - Homepage
- `https://your-app.vercel.app/api/health` - Health check
- `https://your-app.vercel.app/register` - Registration

## Advantages of Browser Deployment

✅ **No CLI setup needed**
✅ **Visual environment variable management**
✅ **Automatic GitHub integration**
✅ **Easy redeployment**
✅ **Built-in domain management**
✅ **Real-time deployment logs**

## Troubleshooting

If build fails:
1. Check **Deployments** → **View Logs**
2. Most common issue: Wrong root directory (should be `apps/web`)
3. Environment variables missing
4. Check **Settings** → **Functions** for runtime errors