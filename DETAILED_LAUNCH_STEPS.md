# 🚀 Detailed Production Launch Steps

## 🔑 **Demo Login Credentials**

**Available for Testing:**
- **Email**: `demo@crops.ai`
- **Password**: `Demo123!`

**Alternative Users** (if database seeded):
- **Farm Manager**: `manager@crops.ai` / `Demo123!`
- **Agronomist**: `agronomist@crops.ai` / `Demo123!`

---

## 🔴 **CRITICAL STEPS - Launch Blockers**

### 1. **Stripe Payment Integration** ⚡ HIGHEST PRIORITY

#### Step 1.1: Set up Stripe Account
```bash
# Go to https://stripe.com
# Create account or use existing
# Get API keys from Dashboard
```

#### Step 1.2: Install Stripe Dependencies
```bash
cd /Users/omerkhurshid/Crops.AI/apps/web
npm install stripe @stripe/stripe-js
```

#### Step 1.3: Add Environment Variables
**In Vercel Dashboard:**
```bash
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Step 1.4: Create Payment Components
```bash
# Create these files:
mkdir -p src/components/billing
mkdir -p src/app/api/stripe

# Files to create:
# - src/components/billing/subscription-plans.tsx
# - src/components/billing/billing-dashboard.tsx  
# - src/app/api/stripe/checkout/route.ts
# - src/app/api/stripe/webhooks/route.ts
# - src/app/api/stripe/portal/route.ts
```

#### Step 1.5: Update Database Schema
```prisma
# Add to schema.prisma:
model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  stripeCustomerId  String?
  stripeSubscriptionId String?
  stripePriceId     String?
  status            String?
  currentPeriodEnd  DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

# Add to User model:
subscription      Subscription?
```

**Time Required**: 2-3 days

---

### 2. **Environment Variables Check** ⚡ HIGH PRIORITY

#### Step 2.1: Verify Current Vercel Variables
```bash
# Check if these are set in Vercel:
vercel env ls
```

#### Step 2.2: Required Variables Status
**✅ Likely Already Set:**
- `DATABASE_URL` 
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `GOOGLE_MAPS_API_KEY`
- `OPENWEATHER_API_KEY`

**🔴 Need to Verify/Add:**
- `NEXTAUTH_SECRET` (generate new for production)
- `RESEND_API_KEY` (for email service)
- `SENTRY_DSN` (for error tracking)

#### Step 2.3: Generate Production Secrets
```bash
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to Vercel:
vercel env add NEXTAUTH_SECRET production
# Paste the generated secret
```

**Time Required**: 30 minutes

---

### 3. **Database Migration** ⚡ MEDIUM PRIORITY

#### Step 3.1: Check Database Connection
```bash
# Test current connection
npm run db:status
# or
npx prisma db pull
```

#### Step 3.2: Run Migration
```bash
# Push schema changes
npx prisma db push

# Verify migration
npx prisma studio
```

#### Step 3.3: Seed Demo Data (Optional)
```bash
# If demo users don't exist, run seeding
npm run db:seed
```

**Time Required**: 15 minutes

---

## 🟡 **HIGH PRIORITY - Week 1**

### 4. **Basic Admin Dashboard** 

#### Step 4.1: Create Admin Routes
```bash
mkdir -p src/app/admin
# Create:
# - src/app/admin/page.tsx (overview)
# - src/app/admin/users/page.tsx (user management)
# - src/app/admin/billing/page.tsx (subscriptions)
```

#### Step 4.2: Add Admin Protection
```typescript
// Add to middleware.ts
if (pathname.startsWith('/admin')) {
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
```

**Time Required**: 1-2 days

### 5. **SEO Optimization**

#### Step 5.1: Fix Metadata Warnings
```typescript
// Add to app/layout.tsx
export const metadata = {
  metadataBase: new URL('https://crops.ai'),
  // ... other metadata
}
```

#### Step 5.2: Create Sitemap
```bash
# Create src/app/sitemap.ts
export default function sitemap() {
  return [
    { url: 'https://crops.ai', lastModified: new Date() },
    { url: 'https://crops.ai/features', lastModified: new Date() },
    // ... other pages
  ]
}
```

**Time Required**: 4 hours

---

## 📊 **Current Environment Status Check**

### Vercel Variables You Likely Have:
- ✅ `DATABASE_URL` (Supabase connection)
- ✅ `NEXTAUTH_URL` (https://crops.ai)
- ✅ `GOOGLE_MAPS_API_KEY`
- ✅ `OPENWEATHER_API_KEY`

### Variables to Add/Verify:
- 🔴 `NEXTAUTH_SECRET` (must be production-specific)
- 🔴 `STRIPE_SECRET_KEY` (when Stripe is set up)
- 🔴 `STRIPE_PUBLISHABLE_KEY`
- 🔴 `RESEND_API_KEY` (for email)

---

## ⏰ **Recommended Implementation Order**

### **Option 1: Minimum Viable Launch (1 week)**
1. **Day 1**: Generate `NEXTAUTH_SECRET`, verify database migration
2. **Days 2-4**: Implement Stripe integration 
3. **Day 5**: Basic admin dashboard
4. **Day 6**: SEO fixes and testing
5. **Day 7**: Production launch

### **Option 2: Beta Launch (2 days)**
1. **Today**: Fix environment variables + database migration
2. **Tomorrow**: Beta launch without payments
3. **Week 2**: Add Stripe for monetization

---

## 🎯 **Immediate Next Actions**

1. **Test Current Demo Login**: Try `demo@crops.ai` / `Demo123!` on your live site
2. **Check Vercel Environment**: Verify which variables are already set
3. **Choose Launch Strategy**: Stripe integration vs Beta launch
4. **Database Status**: Check if demo users exist in production DB

**The platform is 85% ready - only payment integration is the true blocker!** 🌾