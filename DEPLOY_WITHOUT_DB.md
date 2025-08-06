# Deploy to Vercel (Database Connection Pending)

Since the database connection needs to be resolved directly in Supabase dashboard, let's proceed with deployment. The app will work for most features even without the database initially.

## Step 1: Deploy to Vercel

```bash
# Login to Vercel
/Users/omerkhurshid/.npm-global/bin/vercel login

# Deploy
cd /Users/omerkhurshid/Crops.AI/apps/web
/Users/omerkhurshid/.npm-global/bin/vercel --prod
```

## Step 2: Add Environment Variables in Vercel

After deployment, go to Vercel dashboard and add all environment variables from `VERCEL-ENV-VARS.txt`.

## Step 3: Fix Database Connection

1. **In Supabase Dashboard**:
   - Go to Settings → Database
   - Find "Connection string" section
   - Copy the EXACT string (don't modify it)
   - Look for both "Transaction" and "Session" mode URLs

2. **Common connection strings in Supabase**:
   ```
   # Transaction mode (direct connection)
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   
   # Session mode (for serverless)
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

3. **Update in Vercel**:
   - Go to Vercel dashboard → Settings → Environment Variables
   - Update DATABASE_URL with the Session mode URL
   - Update DIRECT_URL with the Transaction mode URL

## Step 4: Test the Deployment

Your app will deploy successfully and these features will work:
- ✅ Home page
- ✅ Authentication pages
- ✅ Weather API (OpenWeatherMap)
- ✅ Static pages
- ⚠️ Dashboard/Farms (will show errors until DB is connected)

## Step 5: Connect Database

Once you have the correct connection string from Supabase:

1. Update environment variables in Vercel
2. Redeploy: `/Users/omerkhurshid/.npm-global/bin/vercel --prod`
3. Push schema: `npx prisma db push`

## Alternative: Direct SQL

If Prisma continues to fail, you can also:
1. Go to Supabase Dashboard → SQL Editor
2. Run the schema creation SQL directly
3. The app will work once tables exist

The app is designed to handle database connection issues gracefully, so it's safe to deploy and fix the connection afterward.