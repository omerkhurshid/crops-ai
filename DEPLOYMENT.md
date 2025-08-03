# Crops.AI Beta Deployment Guide

Complete setup guide for deploying Crops.AI to production on Vercel with Supabase, Upstash Redis, and other services.

## Pre-Deployment Checklist

### ✅ Required Accounts & Services

1. **Vercel Account** - https://vercel.com
2. **Supabase Account** - https://supabase.com
3. **Upstash Account** - https://upstash.com
4. **Cloudinary Account** - https://cloudinary.com
5. **OpenWeatherMap API** - https://openweathermap.org/api
6. **Sentinel Hub Account** - https://www.sentinel-hub.com/
7. **Google OAuth** (optional) - https://console.developers.google.com

### ✅ Development Prerequisites

- [ ] All tests passing (`npm run test:all`)
- [ ] Security scan clean (`npm run security:all`)
- [ ] Performance tests within thresholds (`npm run perf:test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization and set project details:
   - **Name**: `crops-ai-beta`
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to your users (US East for US users)

### 1.2 Configure Database

```sql
-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable Row Level Security
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fields ENABLE ROW LEVEL SECURITY;

-- Create database indexes for performance
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_location ON weather_data USING GIST(location);
```

### 1.3 Get Database URLs

From Supabase Dashboard → Settings → Database:
- **Connection String**: Copy for `DATABASE_URL`
- **Direct Connection**: Copy for `DIRECT_URL`

## Step 2: Cache Setup (Upstash Redis)

### 2.1 Create Redis Instance

1. Go to https://console.upstash.com
2. Click "Create Database"
3. Configure:
   - **Name**: `crops-ai-beta-cache`
   - **Type**: Regional
   - **Region**: Same as your Vercel deployment region
   - **TLS**: Enabled

### 2.2 Get Redis Credentials

From Upstash Dashboard → Database → REST API:
- Copy `UPSTASH_REDIS_REST_URL`
- Copy `UPSTASH_REDIS_REST_TOKEN`

## Step 3: File Storage (Cloudinary)

### 3.1 Setup Cloudinary

1. Go to https://cloudinary.com/console
2. Create account or sign in
3. From Dashboard, copy:
   - **Cloud Name**: `CLOUDINARY_CLOUD_NAME`
   - **API Key**: `CLOUDINARY_API_KEY`
   - **API Secret**: `CLOUDINARY_API_SECRET`

### 3.2 Configure Upload Settings

```javascript
// Recommended Cloudinary settings for production
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  upload_preset: 'crops_ai_uploads' // Create this preset in Cloudinary
}
```

## Step 4: External APIs

### 4.1 OpenWeatherMap API

1. Go to https://openweathermap.org/api
2. Sign up and verify email
3. Go to API Keys section
4. Copy your API key for `OPENWEATHER_API_KEY`

### 4.2 Sentinel Hub API

1. Go to https://www.sentinel-hub.com/
2. Create account and sign in
3. Go to Dashboard → User Settings
4. Create OAuth client:
   - **Name**: `crops-ai-beta`
   - **Redirect URI**: `https://your-domain.vercel.app/api/auth/callback/sentinel`
5. Copy `Client ID` and `Client Secret`

### 4.3 Google OAuth (Optional)

1. Go to https://console.developers.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Configure:
   - **Application Type**: Web application
   - **Authorized origins**: `https://your-domain.vercel.app`
   - **Authorized redirect URIs**: `https://your-domain.vercel.app/api/auth/callback/google`

## Step 5: Vercel Deployment

### 5.1 Connect Repository

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 5.2 Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

#### Database
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
DIRECT_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

#### Authentication
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=[generate-32-char-random-string]
```

#### External Services
```
UPSTASH_REDIS_REST_URL=https://[your-redis].upstash.io
UPSTASH_REDIS_REST_TOKEN=[your-redis-token]
CLOUDINARY_CLOUD_NAME=[your-cloud-name]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-api-secret]
OPENWEATHER_API_KEY=[your-openweather-key]
SENTINEL_HUB_CLIENT_ID=[your-client-id]
SENTINEL_HUB_CLIENT_SECRET=[your-client-secret]
```

#### Optional OAuth
```
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
```

### 5.3 Custom Domain (Optional)

1. Purchase domain (e.g., crops.ai, farming.app)
2. In Vercel Dashboard → Project → Settings → Domains
3. Add custom domain
4. Configure DNS records as instructed
5. Update `NEXTAUTH_URL` to use custom domain

## Step 6: Database Migration

### 6.1 Run Prisma Migrations

```bash
# Generate Prisma client for production
npx prisma generate

# Push schema to production database
npx prisma db push

# (Optional) Seed with initial data
npx prisma db seed
```

### 6.2 Verify Database Schema

```bash
# Connect to production database and verify tables
npx prisma studio
```

## Step 7: Post-Deployment Configuration

### 7.1 Verify Deployment

Check these endpoints:
- `https://your-domain.vercel.app/api/health` - Should return 200
- `https://your-domain.vercel.app/api/graphql` - GraphQL playground
- `https://your-domain.vercel.app` - Frontend loads correctly

### 7.2 Test Authentication

1. Try registering a new user
2. Test Google OAuth (if enabled)
3. Verify user session persistence
4. Test logout functionality

### 7.3 Test Core Features

1. **Weather API**: Check weather data loading
2. **Satellite Data**: Verify satellite image processing
3. **Farm Management**: Create and manage farms
4. **File Upload**: Test image upload to Cloudinary

### 7.4 Performance Monitoring

Set up monitoring:
1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Configure Sentry (optional)
3. **Database Monitoring**: Use Supabase metrics
4. **Uptime Monitoring**: Set up external monitoring

## Step 8: Security Checklist

### 8.1 Security Headers

Verify security headers are set (check vercel.json):
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Strict-Transport-Security
- ✅ Referrer-Policy

### 8.2 API Security

- ✅ Rate limiting configured
- ✅ CORS properly configured
- ✅ Authentication required for protected routes
- ✅ Input validation on all endpoints
- ✅ SQL injection protection (Prisma ORM)

### 8.3 Run Security Scan

```bash
npm run security:all
```

## Step 9: Beta User Setup

### 9.1 Create Beta User Accounts

Option 1: Manual registration
- Users register through normal signup flow
- Enable accounts manually if approval required

Option 2: Invite system
- Create invite codes in database
- Implement invite-only registration

### 9.2 Beta Testing Checklist

Provide beta users with:
- [ ] App URL and login instructions
- [ ] Feature overview and testing focus areas
- [ ] Feedback collection method (forms, email, in-app)
- [ ] Known limitations and expected issues
- [ ] Support contact information

## Step 10: Monitoring & Maintenance

### 10.1 Set Up Alerts

1. **Vercel**: Configure deployment notifications
2. **Supabase**: Set up database alerts
3. **Upstash**: Configure Redis monitoring
4. **Error Tracking**: Set up Sentry alerts (optional)

### 10.2 Backup Strategy

1. **Database**: Supabase provides automatic backups
2. **User Uploads**: Cloudinary provides redundancy
3. **Code**: Ensure Git repository is backed up

### 10.3 Update Schedule

1. **Dependencies**: Weekly security updates
2. **Features**: Based on beta feedback
3. **Performance**: Monitor and optimize continuously

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify all dependencies are installed
   - Check TypeScript errors

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check Supabase project status
   - Ensure database schema is migrated

3. **Authentication Problems**
   - Verify NEXTAUTH_URL matches domain
   - Check NEXTAUTH_SECRET is set
   - Verify OAuth credentials

4. **API Rate Limits**
   - Monitor external API usage
   - Implement caching for frequently accessed data
   - Consider upgrading API plans if needed

### Debug Commands

```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Test database connection
npx prisma db push --accept-data-loss

# Run health checks
curl https://your-domain.vercel.app/api/health
```

## Support

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/docs
- **Project Issues**: Create GitHub issue in repository

---

**Deployment Checklist Date**: August 2, 2025  
**Next Review**: After beta feedback collection  
**Maintainer**: Development Team