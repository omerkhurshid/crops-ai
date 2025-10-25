# Google Maps API Key Setup Guide

## 🚨 Security First Setup

### Step 1: Create New API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Click "Create Credentials" > "API Key"
4. Copy the new key immediately

### Step 2: Apply Security Restrictions

#### API Restrictions
Enable ONLY these APIs:
- ✅ Maps JavaScript API
- ✅ Places API (if using autocomplete)
- ✅ Geocoding API (if needed)
- ❌ Disable all other APIs

#### Application Restrictions
Choose **HTTP referrers (web sites)** and add:
- `https://yourdomain.com/*`
- `https://www.yourdomain.com/*`
- `http://localhost:3000/*` (development only)
- `https://*.vercel.app/*` (if using Vercel)

#### Usage Quotas (Recommended)
- Maps JavaScript API: 25,000 map loads/day
- Places API: 1,000 requests/day (if used)
- Geocoding API: 2,500 requests/day (if used)

### Step 3: Update Environment Variables

```bash
# Replace in .env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_new_secure_key_here
GOOGLE_MAPS_API_KEY=your_new_secure_key_here
```

### Step 4: Verify Integration

Test these components work:
- HomePage demos (Google Maps NDVI)
- Farm location selection
- Field boundary mapping

### Step 5: Monitor Usage

Set up billing alerts:
- $5/month alert (free tier buffer)
- $25/month alert (usage spike warning)
- $100/month alert (emergency cap)

## Security Best Practices

### ✅ DO:
- Use HTTP referrer restrictions
- Enable only required APIs
- Set reasonable usage quotas
- Monitor usage regularly
- Rotate keys quarterly

### ❌ DON'T:
- Expose keys in client-side code without restrictions
- Use the same key for multiple projects
- Share keys via email or Slack
- Commit keys to version control

## Emergency Response Plan

If key is compromised:
1. **Immediately** delete the compromised key
2. Create new key with restrictions
3. Update all environments
4. Monitor billing for unusual usage
5. Review access logs

## Current Implementation Status

- ✅ Client-side usage in React components
- ✅ Proper environment variable handling
- ✅ Error fallbacks when API unavailable
- ⚠️ Key needs replacement (previous key revoked)

## Next Steps

1. Create new key with above restrictions
2. Update .env file
3. Test all Google Maps functionality
4. Set up monitoring and alerts
5. Document key rotation schedule