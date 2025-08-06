# Crops.AI Deployment Steps

## Current Status ✅
- ✅ All environment variables configured
- ✅ Build successful
- ✅ Services configured (Supabase, Redis, Cloudinary, OpenWeatherMap, Sentinel Hub)
- ⚠️ Database connection needs verification

## Deployment Steps

### 1. Login to Vercel CLI
```bash
/Users/omerkhurshid/.npm-global/bin/vercel login
```

### 2. Deploy to Vercel
```bash
cd /Users/omerkhurshid/Crops.AI/apps/web
/Users/omerkhurshid/.npm-global/bin/vercel --prod
```

When prompted:
- Set up and deploy: Yes
- Which scope: Select your account
- Link to existing project?: No (create new)
- Project name: `crops-ai-beta` (or your preference)
- Directory: `./` (current directory)
- Override settings?: No

### 3. Add Environment Variables in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from `VERCEL-ENV-VARS.txt`:

```
DATABASE_URL = postgresql://postgres:H4tchet!23@db.drtbsioeqfodcaelukpo.supabase.co:5432/postgres
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

**IMPORTANT**: After deployment, add:
```
NEXTAUTH_URL = https://your-deployment-url.vercel.app
```

### 4. Fix Database Connection

The Supabase connection string appears to have an issue. Please verify in your Supabase dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → Database
4. Copy the correct connection string
5. Update the DATABASE_URL and DIRECT_URL in Vercel

The format should be:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 5. Push Database Schema

Once the database connection is working:

```bash
cd /Users/omerkhurshid/Crops.AI/packages/database
DATABASE_URL="your-correct-connection-string" npx prisma db push
```

### 6. Redeploy if Needed

If you update environment variables:
```bash
cd /Users/omerkhurshid/Crops.AI/apps/web
/Users/omerkhurshid/.npm-global/bin/vercel --prod
```

## Alternative: Use Deployment Script

```bash
cd /Users/omerkhurshid/Crops.AI
./scripts/deploy-beta.sh
```

## Verification Steps

After deployment:
1. Visit your deployment URL
2. Check `/api/health` endpoint
3. Try registering a new user
4. Test weather data loading
5. Monitor logs in Vercel dashboard

## Troubleshooting

### Database Connection Issues
- Verify Supabase project is active
- Check connection string format
- Ensure password is properly encoded if it contains special characters
- Try connection pooling URL if direct connection fails

### Build Errors
- Check Vercel build logs
- Ensure all environment variables are set
- Verify Prisma client is generated

### Runtime Errors
- Check Vercel function logs
- Verify API keys are working
- Check browser console for errors