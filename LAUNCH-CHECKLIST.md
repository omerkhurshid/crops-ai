# 🚀 Beta Launch Checklist

## ✅ **Pre-Deployment Checklist**

### Service Accounts Setup
- [ ] **Supabase**: Project created, database URL copied
- [ ] **Upstash Redis**: Database created, URL and token copied  
- [ ] **Cloudinary**: Account created, credentials copied
- [ ] **OpenWeatherMap**: API key obtained
- [ ] **Sentinel Hub**: Client ID and secret obtained
- [ ] **Vercel**: Account created, CLI installed

### Environment Configuration
- [ ] **Update `.env.production`** with your actual credentials
- [ ] **Generate NextAuth secret** (already done: `iUiqN5OysPkmzTg0Vhm3R9kGjrvj5Phs7pneuH0uHtc=`)
- [ ] **Verify all values** in `.env.production` are real (no placeholders)

## 🚀 **Deployment Steps**

### Step 1: Update Environment File
```bash
# Edit apps/web/.env.production with your real values
code apps/web/.env.production
```

### Step 2: Run Pre-Deployment Tests
```bash
cd apps/web
npm run type-check    # Fix any TypeScript errors
npm run lint         # Fix any linting errors  
npm run test         # Ensure tests pass
npm run build        # Ensure build succeeds
```

### Step 3: Setup Database
```bash
# From project root
./scripts/setup-database.sh
```

### Step 4: Deploy to Vercel (Choose one method)

**Method A: Automated Script (Recommended)**
```bash
# From project root
./scripts/deploy-beta.sh
```

**Method B: Manual Deployment**
```bash
cd apps/web

# Login to Vercel
vercel login

# Set environment variables
../scripts/setup-vercel-env.sh

# Deploy to production
vercel --prod
```

### Step 5: Verify Deployment
After deployment, test these URLs (replace with your actual domain):

- [ ] **Health Check**: `https://your-app.vercel.app/api/health`
- [ ] **Homepage**: `https://your-app.vercel.app`
- [ ] **GraphQL**: `https://your-app.vercel.app/api/graphql`
- [ ] **Registration**: Try creating a new account

## 🧪 **Post-Deployment Testing**

### Test Core Features
- [ ] **User Registration**: Create new account
- [ ] **Authentication**: Login/logout works
- [ ] **Farm Creation**: Add a new farm
- [ ] **Weather Data**: Check weather displays correctly
- [ ] **Satellite Data**: Verify satellite images load

### Performance Checks
- [ ] **Page Load Speed**: < 3 seconds
- [ ] **API Response Times**: < 500ms for most endpoints
- [ ] **Mobile Responsiveness**: Test on mobile device

## 🎯 **Beta User Setup**

### Create Beta Invites (Optional)
If you want invite-only registration:

```sql
-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS beta_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  invite_code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL
);

-- Add some invite codes
INSERT INTO beta_invites (email, invite_code) VALUES
('test@example.com', 'BETA-001'),
('farmer@example.com', 'BETA-002');
```

### First Beta Users
1. **Create test accounts** for yourself and team
2. **Test all major workflows** end-to-end
3. **Document any issues** found during testing
4. **Invite 3-5 trusted users** for initial feedback

## 🚨 **Troubleshooting**

### Common Issues

**Build Failures**
```bash
# Check for TypeScript errors
npm run type-check

# Check for dependency issues
npm ci
```

**Database Connection Issues**
- Verify DATABASE_URL format is correct
- Check Supabase project is running
- Ensure IP is whitelisted (usually automatic)

**Environment Variable Issues**
```bash
# List Vercel env vars
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME production
```

**Deployment Issues**
```bash
# View deployment logs
vercel logs

# Check deployment status
vercel ls
```

## 📞 **Support Resources**

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: Create GitHub issue

## 🎉 **Success Criteria**

Your beta launch is successful when:
- [ ] All health checks pass
- [ ] You can register and login
- [ ] Core features work (farms, weather, satellite)
- [ ] No critical errors in logs
- [ ] Ready to invite beta users

---

**Next Step**: Once deployed successfully, follow `BETA-TESTING.md` to set up your beta program!