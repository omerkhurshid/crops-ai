# How to Find Your Supabase Project Reference

## Method 1: From Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard

2. **Select Your Project**
   - Click on your project (should be named something like "Crops AI" or similar)

3. **Find Project Reference in URL**
   - Look at your browser's URL bar
   - It will be: `https://supabase.com/dashboard/project/[YOUR-PROJECT-REF]`
   - The PROJECT-REF is the part after `/project/`
   - Example: If URL is `https://supabase.com/dashboard/project/drtbsioeqfodcaelukpo`
   - Then your project reference is: `drtbsioeqfodcaelukpo`

## Method 2: From Project Settings

1. **In Supabase Dashboard**, go to:
   - Settings (gear icon) → General
   - Look for "Reference ID" or "Project Reference"
   - This is your project reference

## Method 3: From Database Settings

1. **In Supabase Dashboard**, go to:
   - Settings → Database
   - Look for "Connection string" section
   - You'll see connection strings like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```
   - The PROJECT-REF is the part between `@db.` and `.supabase.co`

## Method 4: From API Settings

1. **In Supabase Dashboard**, go to:
   - Settings → API
   - Look at the "URL" field
   - It will show: `https://[PROJECT-REF].supabase.co`
   - The PROJECT-REF is the subdomain part

## Common Issues

### If you see "drtbsioeqfodcaelukpo" in your connection string:
This might be your actual project reference, but the connection is failing because:

1. **Project might be paused** (Free tier pauses after 1 week of inactivity)
   - Solution: Click "Restore" or "Unpause" in dashboard

2. **Region mismatch**
   - Check if your project region matches the connection string
   - Some regions use different formats

3. **Connection pooling**
   - Try using the "Connection pooling" connection string instead
   - In Settings → Database, look for "Connection pooling" section
   - Use port 6543 instead of 5432

## Correct Connection String Format

Once you have the correct project reference, your connection strings should be:

**Direct connection:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Connection pooling (recommended for serverless):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

## Example
If your project reference is `abcdefghijklmnop` and password is `MyPassword123`, then:
```
DATABASE_URL="postgresql://postgres:MyPassword123@db.abcdefghijklmnop.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:MyPassword123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

## Verify Connection

Test your connection string:
```bash
cd /Users/omerkhurshid/Crops.AI/packages/database
DATABASE_URL="your-connection-string" npx prisma db push --skip-generate
```

If it works, you'll see:
```
🚀 Your database is now in sync with your Prisma schema
```