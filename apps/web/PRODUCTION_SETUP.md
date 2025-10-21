# 🚀 Crops.AI Production Setup Guide

## 🎯 Current Status
✅ **Working**: Authentication, Database, Farm Management, Financial Tracking, Livestock  
⚠️ **Needs Setup**: Satellite Data, Weather API, Google Maps, File Storage, Caching  
❌ **Placeholder**: ML Models, Market Data, Email System

---

## 🔑 Required API Keys & Services

### 1. Google Maps API Setup
**Current Status**: ⚠️ Key exists but needs verification

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project: "Crops.AI"
3. Enable APIs:
   - Maps JavaScript API
   - Places API  
   - Geocoding API
   - Static Maps API (for satellite overlays)
4. Create API key and add to `.env`:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_key_here
   ```
5. Set API restrictions:
   - HTTP referrers: `https://cropple.ai/*`, `http://localhost:3000/*`
   - APIs: Maps JavaScript API, Places API, Geocoding API

**Cost**: ~$200/month for 100k map loads

---

### 2. OpenWeatherMap API
**Current Status**: ❌ Using mock data

**Steps:**
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Subscribe to "One Call API 3.0" ($0.0015/call)
3. Get API key and update `.env`:
   ```bash
   OPENWEATHER_API_KEY=your_actual_key_here
   ```

**Cost**: ~$50/month for 30k calls

---

### 3. Sentinel Hub (Satellite Data)
**Current Status**: ⚠️ Credentials exist but need testing

**Steps:**
1. Verify account at [Sentinel Hub](https://www.sentinel-hub.com/)
2. Test credentials in `.env`:
   ```bash
   SENTINEL_HUB_CLIENT_ID=51c4b312-1fd8-4db7-83f8-d8d8a44f7307
   SENTINEL_HUB_CLIENT_SECRET=9YObbAxUoKMAe5lCHG90z6MmnrnlVsno
   ```
3. Test API call: `npm run test:satellite`

**Cost**: ~$100/month for satellite imagery processing

---

### 4. Redis Cache (Upstash)
**Current Status**: ❌ Using placeholder values

**Steps:**
1. Sign up at [Upstash](https://upstash.com/)
2. Create Redis database
3. Get connection details:
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

**Cost**: Free tier available, ~$25/month for production

---

### 5. Cloudinary (File Storage)
**Current Status**: ❌ Using placeholder values

**Steps:**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get credentials from dashboard:
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_secret
   ```

**Cost**: Free tier available, ~$89/month for production

---

## 🛠️ Technical Implementation

### Update Environment Variables
Replace all placeholder values in `.env.production`:

```bash
# Required for production
OPENWEATHER_API_KEY=your_real_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_real_key
SENTINEL_HUB_CLIENT_ID=your_real_id
SENTINEL_HUB_CLIENT_SECRET=your_real_secret
UPSTASH_REDIS_REST_URL=your_real_url
UPSTASH_REDIS_REST_TOKEN=your_real_token
CLOUDINARY_CLOUD_NAME=your_real_name
CLOUDINARY_API_KEY=your_real_key
CLOUDINARY_API_SECRET=your_real_secret
```

### Test API Connections
```bash
# Test weather API
npm run test:weather

# Test satellite data
npm run test:satellite  

# Test Google Maps
npm run test:maps

# Test Redis cache
npm run test:redis

# Test file upload
npm run test:upload
```

---

## 🎬 Homepage Demo Replacement

### Before (Fake Animation)
- Simulated NDVI visualization
- Fake satellite data
- Animated field colors
- No real maps

### After (Real Google Maps + NDVI)
- ✅ Real Google Maps satellite view
- ✅ Actual Iowa corn field (41.5868, -93.6250)
- ✅ Real NDVI data from Sentinel Hub
- ✅ Interactive field boundary overlay
- ✅ Live satellite analysis

**Implementation**: `src/components/demos/real-google-maps-ndvi.tsx`

---

## 📊 Production Readiness Checklist

### ✅ Ready for Production
- [x] User authentication & management
- [x] Farm/field database operations
- [x] Financial tracking & calculations  
- [x] Livestock management system
- [x] Task management workflows
- [x] Database with PostGIS support
- [x] Basic API structure

### 🔨 Needs Implementation
- [ ] **Real Google Maps integration** (in progress)
- [ ] **Live satellite NDVI overlays** (in progress)
- [ ] **Actual weather data** (API key needed)
- [ ] **File upload system** (Cloudinary setup)
- [ ] **Performance caching** (Redis setup)
- [ ] **Email notifications** (Resend setup)
- [ ] **ML model deployment** (requires training)
- [ ] **Market data feeds** (API integration)

### 🚨 Critical for Launch
1. **Replace all mock/placeholder data with real APIs**
2. **Set up production infrastructure (Redis, monitoring)**
3. **Test all external service integrations**
4. **Verify Google Maps functionality**
5. **Ensure satellite data pipeline works**

---

## 💰 Estimated Monthly Costs

| Service | Usage | Cost |
|---------|-------|------|
| Google Maps | 100k loads | $200 |
| OpenWeather | 30k calls | $50 |
| Sentinel Hub | Satellite processing | $100 |
| Upstash Redis | Caching | $25 |
| Cloudinary | File storage | $89 |
| Vercel | Hosting | $20 |
| Supabase | Database | $25 |
| **Total** | | **~$509/month** |

---

## 🎯 Next Steps

1. **Immediate**: Replace homepage animation with real Google Maps
2. **Week 1**: Set up all API keys and test integrations  
3. **Week 2**: Deploy ML models and market data feeds
4. **Week 3**: Performance optimization and monitoring
5. **Week 4**: Production launch readiness

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.production

# Test current implementation  
npm run dev

# Test API integrations
npm run test:apis

# Build for production
npm run build

# Deploy to production
vercel deploy --prod
```

---

**Status**: 🔄 Currently implementing real Google Maps + NDVI integration to replace fake homepage animation.