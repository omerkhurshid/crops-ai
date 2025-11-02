# Environment Setup Guide

## Production Environment Variables

The following environment variables are required for production deployment:

### Core Configuration
```bash
NODE_ENV=production
```

### Database
```bash
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### Authentication (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_USE_SUPABASE_AUTH=true
```

### Caching (Upstash Redis)
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxMAAIjcDE1YjUxMjdjNjIyNGU0YTc3...
```

### External APIs
```bash
# Weather Data
OPENWEATHER_API_KEY=your_openweather_api_key

# Satellite Imagery
SENTINEL_HUB_CLIENT_ID=your_sentinel_client_id
SENTINEL_HUB_CLIENT_SECRET=your_sentinel_secret

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Email Service
```bash
RESEND_API_KEY=re_your_resend_api_key
```

## Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/omerkhurshid/crops-ai.git
cd crops-ai
```

2. **Install dependencies:**
```bash
npm install
```

3. **Copy environment template:**
```bash
cp .env.example .env.local
```

4. **Set up your environment variables in `.env.local`**

5. **Run database migrations:**
```bash
npx prisma generate
npx prisma db push
```

6. **Start development server:**
```bash
npm run dev
```

## Deployment

### Vercel Deployment

1. **Connect your GitHub repository to Vercel**

2. **Add environment variables in Vercel dashboard:**
   - Go to Project Settings → Environment Variables
   - Add all the production environment variables listed above

3. **Deploy:**
   - Automatic deployment on push to `main` branch
   - Manual deployment via Vercel dashboard

### Build Configuration

The project uses Turborepo for optimized builds:

```json
{
  "buildCommand": "turbo run build --filter=web",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## Health Checks

Once deployed, verify your setup:

1. **Application Health:**
   ```
   GET https://your-domain.com/api/health
   ```

2. **Authentication:**
   ```
   POST https://your-domain.com/api/auth/supabase-signin
   ```

3. **Redis Caching:**
   - Check health endpoint for cache status
   - Verify rate limiting is working

## Security Notes

- Never commit environment variables to version control
- Use Vercel's environment variable encryption
- Rotate API keys regularly
- Monitor rate limiting and error logs
- Set up alerts for failed authentication attempts

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check TypeScript errors: `npm run type-check`
   - Verify environment variables are set
   - Check Prisma schema: `npx prisma validate`

2. **Authentication Issues:**
   - Verify Supabase environment variables
   - Check JWT token configuration
   - Ensure row-level security is properly configured

3. **Rate Limiting:**
   - Check Redis connection in health endpoint
   - Verify Upstash credentials
   - Monitor rate limit headers in API responses

### Support

For deployment issues, check:
- [PRD.md](./PRD.md) for technical specifications
- [GitHub Issues](https://github.com/omerkhurshid/crops-ai/issues) for bug reports
- Vercel deployment logs for specific errors