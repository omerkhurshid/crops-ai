# Infrastructure Setup Guide

This guide will help you set up the complete infrastructure for Crops.AI using modern serverless services.

## Overview

Our infrastructure stack:
- **Hosting**: Vercel (frontend + API routes)
- **Database**: Supabase or Neon (PostgreSQL with PostGIS)
- **Cache**: Upstash Redis (serverless Redis)
- **File Storage**: Cloudinary or AWS S3
- **Monitoring**: Vercel Analytics + Sentry
- **Authentication**: NextAuth.js or Clerk

## 1. Vercel Setup

### Prerequisites
- GitHub account with the Crops.AI repository
- Vercel account (free tier available)

### Steps
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Import your Crops.AI repository
3. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables (see Environment Variables section)
5. Deploy!

### Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 2. Database Setup with Supabase

### Option A: Supabase (Recommended)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Choose region closest to your users
   - Note down the project URL and API keys

2. **Enable PostGIS Extension**
   ```sql
   -- Run in Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Set Environment Variables**
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. **Run Database Migrations**
   ```bash
   cd packages/database
   npx prisma db push
   ```

### Option B: Neon

1. **Create Project**
   - Go to [neon.tech](https://neon.tech)
   - Create new project with PostgreSQL
   - Enable PostGIS extension

2. **Configure Connection**
   ```bash
   DATABASE_URL=postgresql://user:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb
   DIRECT_URL=postgresql://user:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb
   ```

## 3. Redis Setup with Upstash

1. **Create Database**
   - Go to [upstash.com](https://upstash.com)
   - Create new Redis database
   - Choose region closest to your Vercel deployment

2. **Get Connection Details**
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

## 4. File Storage Setup

### Option A: Cloudinary (Recommended for Images)

1. **Create Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Get API Credentials**
   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   STORAGE_PROVIDER=cloudinary
   ```

### Option B: AWS S3

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://crops-ai-storage-your-unique-suffix
   ```

2. **Create IAM User with S3 Access**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::crops-ai-storage-your-unique-suffix/*"
       }
     ]
   }
   ```

3. **Set Environment Variables**
   ```bash
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=crops-ai-storage-your-unique-suffix
   STORAGE_PROVIDER=s3
   ```

## 5. Authentication Setup

### Option A: NextAuth.js (Open Source)

1. **Generate Secret**
   ```bash
   openssl rand -base64 32
   ```

2. **Configure Environment**
   ```bash
   NEXTAUTH_SECRET=your-generated-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

### Option B: Clerk (Managed Service)

1. **Create Application**
   - Go to [clerk.com](https://clerk.com)
   - Create new application

2. **Get API Keys**
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

## 6. Monitoring Setup

### Vercel Analytics
- Automatically enabled for Vercel deployments
- View analytics in Vercel dashboard

### Sentry Error Tracking

1. **Create Project**
   - Go to [sentry.io](https://sentry.io)
   - Create new Next.js project

2. **Configure**
   ```bash
   SENTRY_DSN=your-sentry-dsn
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

## 7. API Keys for External Services

### Weather APIs
```bash
# OpenWeatherMap (free tier: 1000 calls/day)
OPENWEATHER_API_KEY=your-api-key

# Meteomatics (premium, more accurate)
METEOMATICS_USERNAME=your-username
METEOMATICS_PASSWORD=your-password
```

### Satellite Imagery
```bash
# Sentinel Hub (free tier available)
SENTINEL_HUB_CLIENT_ID=your-client-id
SENTINEL_HUB_CLIENT_SECRET=your-client-secret

# Planet Labs (commercial)
PLANET_API_KEY=your-api-key
```

### Market Data
```bash
# CME Group (commodity prices)
CME_GROUP_API_KEY=your-api-key
```

## 8. Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Settings > Environment Variables
3. Add all variables for Production, Preview, and Development
4. Use different values for different environments

## 9. Testing the Setup

1. **Local Development**
   ```bash
   npm run dev
   ```

2. **Build Test**
   ```bash
   npm run build
   ```

3. **Type Check**
   ```bash
   npm run type-check
   ```

4. **Database Connection**
   ```bash
   cd packages/database
   npx prisma studio
   ```

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to git
   - Use different secrets for different environments
   - Rotate secrets regularly

2. **Database Security**
   - Enable Row Level Security (RLS) in Supabase
   - Use database roles and permissions
   - Regular security audits

3. **API Security**
   - Rate limiting (built into Vercel)
   - Input validation
   - CORS configuration

## Cost Optimization

1. **Free Tiers Available**
   - Vercel: Generous free tier for personal projects
   - Supabase: 2 free projects
   - Upstash: 10K requests/day free
   - Cloudinary: 25 credits/month free

2. **Monitoring Costs**
   - Set up billing alerts
   - Monitor usage dashboards
   - Optimize database queries

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify Node.js version compatibility
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure PostGIS extension is enabled

3. **API Rate Limits**
   - Implement caching with Redis
   - Add retry logic with exponential backoff
   - Monitor API usage

### Getting Help

- Check Vercel deployment logs
- Use Prisma Studio for database debugging
- Monitor Sentry for runtime errors
- Check service status pages for downtime

## Next Steps

After infrastructure is set up:
1. Deploy to Vercel
2. Test all integrations
3. Set up monitoring alerts
4. Configure backup procedures
5. Plan for scaling