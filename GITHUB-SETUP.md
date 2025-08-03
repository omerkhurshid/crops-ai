# 🚀 GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

1. **Go to GitHub**: Visit https://github.com/new
2. **Repository Details**:
   - **Repository name**: `crops-ai` or `crops-ai-beta`
   - **Description**: `🌾 AI-powered precision agriculture platform for farmers - satellite monitoring, weather analytics, and yield optimization`
   - **Visibility**: Choose Private (recommended for beta) or Public
   - **Initialize**: ❌ **DO NOT** check "Add a README file", ".gitignore", or "license" (we already have these)

3. **Click "Create repository"**

## Step 2: Add Remote and Push Code

Once you create the repository, GitHub will show you commands like this:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/crops-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Connect Vercel to GitHub

1. **Go to Vercel**: Visit https://vercel.com/dashboard
2. **Import Project**: Click "Add New" → "Project"
3. **Import from GitHub**: 
   - Select your `crops-ai` repository
   - Click "Import"
4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

## Step 4: Add Environment Variables in Vercel

In the Vercel project settings, add these environment variables:

```bash
DATABASE_URL=postgresql://postgres:H4tchet!23@db.drtbsioeqfodcaelukpo.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:H4tchet!23@db.drtbsioeqfodcaelukpo.supabase.co:5432/postgres
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=iUiqN5OysPkmzTg0Vhm3R9kGjrvj5Phs7pneuH0uHtc=
UPSTASH_REDIS_REST_URL=https://willing-ant-7628.upstash.io
UPSTASH_REDIS_REST_TOKEN=AR3MAAIjcDE1YjUxMjdjNjIyNGU0YTc3OGVhN2Q5N2IwNjgxYWQyZHAxMA
CLOUDINARY_CLOUD_NAME=diqvzdrdq
CLOUDINARY_API_KEY=742839462557168
CLOUDINARY_API_SECRET=PjIudH97El9uNRe5XeRy80OOc9o
OPENWEATHER_API_KEY=7c0956bac2c9dabb9aec97f3da9bdf9b
SENTINEL_HUB_CLIENT_ID=51c4b312-1fd8-4db7-83f8-d8d8a44f7307
SENTINEL_HUB_CLIENT_SECRET=9YObbAxUoKMAe5lCHG90z6MmnrnlVsno
NODE_ENV=production
```

## Step 5: Deploy

1. **First Deployment**: Vercel will automatically deploy after importing
2. **Subsequent Deployments**: Every push to `main` branch will auto-deploy
3. **Production URL**: You'll get a URL like `https://crops-ai-beta.vercel.app`

## Step 6: Update NEXTAUTH_URL

After deployment, update the `NEXTAUTH_URL` environment variable in Vercel with your actual deployment URL.

## Benefits of GitHub + Vercel Integration

✅ **Automatic Deployments**: Every push triggers a new deployment
✅ **Preview Deployments**: Every pull request gets its own preview URL  
✅ **Rollback Capability**: Easy to rollback to previous deployments
✅ **GitHub Actions**: CI/CD pipelines run automatically
✅ **Collaboration**: Team can contribute via pull requests
✅ **Version Control**: Complete history of all changes

## Next Steps

After successful deployment:

1. **Test the application** at your Vercel URL
2. **Verify all features** work correctly
3. **Monitor logs** in Vercel dashboard
4. **Create your first farm** and test the flow
5. **Invite beta users** for testing

---

**Ready to proceed?** Follow the steps above and let me know when you've created the GitHub repository!