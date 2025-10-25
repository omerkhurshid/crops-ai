# Production API Keys Setup Guide

## 🚀 Complete Production API Configuration

This guide covers setting up all external API keys needed for Crops.AI production deployment.

## Required API Keys

### 1. OpenWeather API Key
**Required for:** Weather data, forecasts, agricultural insights

#### Setup Steps:
1. Visit [OpenWeatherMap API](https://openweathermap.org/api)
2. Create a free account
3. Subscribe to:
   - Current Weather Data (free tier: 1,000 calls/day)
   - 5 Day / 3 Hour Forecast (free tier: 1,000 calls/day)
   - Geocoding API (free tier: 1,000 calls/day)
4. Copy your API key

#### Environment Variable:
```bash
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

#### Recommended Plan:
- **Free Tier:** 1,000 calls/day (suitable for testing)
- **Startup Plan:** $40/month for 100,000 calls/day
- **Developer Plan:** $180/month for 1,000,000 calls/day

---

### 2. Google Maps API Key
**Required for:** Map visualization, geocoding, field boundary mapping

#### Setup Steps:
1. Follow `GOOGLE_MAPS_SETUP.md` for detailed instructions
2. Enable required APIs:
   - Maps JavaScript API
   - Places API (optional)
   - Geocoding API (optional)
3. Apply security restrictions
4. Set usage quotas

#### Environment Variables:
```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

### 3. Cloudinary Configuration
**Required for:** Image storage, field photo uploads, image optimization

#### Setup Steps:
1. Visit [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Go to Dashboard > Account Details
4. Copy: Cloud Name, API Key, API Secret

#### Environment Variables:
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

#### Free Tier Limits:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 monthly transformations

---

### 4. Redis Cache (Upstash)
**Required for:** Caching, session storage, rate limiting

#### Setup Steps:
1. Visit [Upstash](https://upstash.com/)
2. Create a free account
3. Create a new Redis database
4. Choose region closest to your deployment
5. Copy REST URL and Token

#### Environment Variables:
```bash
UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

#### Free Tier:
- 10,000 commands per day
- 256 MB storage

---

### 5. Sentinel Hub (Satellite Data)
**Required for:** Satellite imagery, NDVI analysis

#### Setup Steps:
1. Visit [Sentinel Hub](https://www.sentinel-hub.com/)
2. Create account and configure OAuth application
3. Get Client ID and Client Secret
4. Configure data access permissions

#### Environment Variables:
```bash
SENTINEL_HUB_CLIENT_ID=your_client_id_here
SENTINEL_HUB_CLIENT_SECRET=your_client_secret_here
```

#### Trial Account:
- 1,000 processing units per month
- Access to Sentinel-2, Landsat data

---

## Database Configuration

### Supabase (PostgreSQL)
Already configured in current .env file:
```bash
DATABASE_URL="postgresql://postgres.drtbsioeqfodcaelukpo:H4tchet!23@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres:H4tchet!23@db.drtbsioeqfodcaelukpo.supabase.co:5432/postgres"
```

---

## Authentication Configuration

### NextAuth
Already configured:
```bash
NEXTAUTH_URL=http://localhost:3001  # Update for production domain
NEXTAUTH_SECRET=iUiqN5OysPkmzTg0Vhm3R9kGjrvj5Phs7pneuH0uHtc=
```

### Optional: Google OAuth
For social login (optional):
```bash
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

---

## Cost Estimation

### Monthly Costs (Estimated)

| Service | Free Tier | Paid Plan | Monthly Cost |
|---------|-----------|-----------|--------------|
| OpenWeather | 1K calls/day | 100K calls/day | $40 |
| Google Maps | $200 credit | Pay-as-use | $50-200 |
| Cloudinary | 25GB/month | 75GB/month | $89 |
| Upstash Redis | 10K commands/day | 100K commands/day | $20 |
| Sentinel Hub | 1K units/month | 10K units/month | $40 |
| **Total** | **Free** | **Startup** | **$239-399/month** |

### Recommended Startup Plan:
- Start with free tiers for all services
- Monitor usage and upgrade as needed
- Expected cost for 1000 active users: ~$100-200/month

---

## Security Best Practices

### ✅ DO:
- Rotate API keys quarterly
- Set usage limits and billing alerts
- Use environment variables, never hardcode
- Enable API restrictions where possible
- Monitor usage regularly
- Use separate keys for dev/staging/prod

### ❌ DON'T:
- Commit API keys to version control
- Share keys via email/Slack/Discord
- Use production keys in development
- Ignore usage spikes or billing alerts

---

## Production Deployment Checklist

### Pre-Deployment:
- [ ] All API keys configured and tested
- [ ] Usage quotas and billing alerts set
- [ ] Security restrictions applied
- [ ] Rate limiting implemented
- [ ] Error handling tested
- [ ] Monitoring setup

### Environment Variables for Production:
```bash
# Update these for your production environment
NEXTAUTH_URL=https://your-production-domain.com
OPENWEATHER_API_KEY=your_production_openweather_key
GOOGLE_MAPS_API_KEY=your_production_google_maps_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_google_maps_key
CLOUDINARY_CLOUD_NAME=your_production_cloudinary_name
CLOUDINARY_API_KEY=your_production_cloudinary_key
CLOUDINARY_API_SECRET=your_production_cloudinary_secret
UPSTASH_REDIS_REST_URL=your_production_redis_url
UPSTASH_REDIS_REST_TOKEN=your_production_redis_token
SENTINEL_HUB_CLIENT_ID=your_production_sentinel_id
SENTINEL_HUB_CLIENT_SECRET=your_production_sentinel_secret
```

### Post-Deployment:
- [ ] Test all API integrations
- [ ] Verify rate limiting works
- [ ] Check error handling
- [ ] Monitor performance
- [ ] Set up usage alerts
- [ ] Document any issues

---

## Troubleshooting

### Common Issues:

1. **Google Maps not loading**
   - Check API key restrictions
   - Verify domain is whitelisted
   - Check browser console for errors

2. **Weather data not updating**
   - Verify OpenWeather API key
   - Check usage limits
   - Test API endpoint directly

3. **Images not uploading**
   - Check Cloudinary configuration
   - Verify upload presets
   - Check file size limits

4. **Caching not working**
   - Test Redis connection
   - Check Upstash dashboard
   - Verify network connectivity

### Getting Help:
- Check service status pages
- Review API documentation
- Contact support for paid plans
- Use community forums for troubleshooting

---

## Monitoring and Alerts

### Set up monitoring for:
- API usage and quotas
- Error rates
- Response times
- Billing alerts
- Security events

### Recommended Tools:
- Service provider dashboards
- Application monitoring (e.g., Vercel Analytics)
- Custom logging and alerting
- Cost monitoring and alerts

This completes your production API setup. All services should now be properly configured for deployment.