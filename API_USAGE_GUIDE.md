# API Usage Guide - Crops.AI

## Public APIs (No Authentication Required)

### 1. **Public Health Check**
```bash
GET /api/health/public
```
Returns system health status including database and weather API connectivity.

**Example:**
```bash
curl https://YOUR_APP_URL/api/health/public
```

### 2. **Crop Search**
```bash
GET /api/agriculture/crops/search?q={query}
```
Search comprehensive agricultural database.

**Parameters:**
- `q` (required): Search query
- `limit` (optional): Number of results (default: 20)
- `type` (optional): Crop type filter

**Example:**
```bash
curl "https://YOUR_APP_URL/api/agriculture/crops/search?q=corn"
curl "https://YOUR_APP_URL/api/agriculture/crops/search?q=corn&limit=5&type=cereal"
```

### 3. **Weather Geocoding**
```bash
GET /api/weather/geocoding?address={location}
```
Convert location names to coordinates.

**Parameters:**
- `address` (required): Location name
- `country` (optional): Country code (e.g., "US")
- `limit` (optional): Number of results

**Example:**
```bash
curl "https://YOUR_APP_URL/api/weather/geocoding?address=Iowa"
curl "https://YOUR_APP_URL/api/weather/geocoding?address=Des+Moines&country=US"
```

### 4. **Weather Reverse Geocoding**
```bash
GET /api/weather/reverse-geocoding?lat={latitude}&lon={longitude}
```
Convert coordinates to location names.

**Example:**
```bash
curl "https://YOUR_APP_URL/api/weather/reverse-geocoding?lat=41.8781&lon=-87.6298"
```

### 5. **Debug Schema**
```bash
GET /api/debug/schema
```
Check database connection and schema (development/debugging).

**Example:**
```bash
curl https://YOUR_APP_URL/api/debug/schema
```

## Protected APIs (Authentication Required)

### 1. **System Health (Admin Only)**
```bash
GET /api/admin/system-health
```
Detailed system health metrics (requires admin authentication).

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "timestamp": "2025-10-11T21:11:04.662Z"
  }
}
```

## Common Issues and Solutions

### 1. **Weather API Returns Mock Data**
- **Issue**: No real weather data
- **Solution**: Set `OPENWEATHER_API_KEY` in Vercel environment variables

### 2. **"Invalid address or parameters" Error**
- **Issue**: Wrong parameter name
- **Solution**: Use `address` not `q` for geocoding

### 3. **"Unauthorized" Error**
- **Issue**: Trying to access admin endpoints
- **Solution**: Use public endpoints or authenticate as admin

### 4. **Google Maps Not Loading**
- **Issue**: Missing API key
- **Solution**: Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel

## Environment Variable Status Check

Use the public health endpoint to check which services are configured:

```bash
curl https://YOUR_APP_URL/api/health/public | jq '.'
```

Response will show:
```json
{
  "environment": {
    "hasOpenWeatherKey": true,    // Weather API configured
    "hasGoogleMapsKey": false,    // Maps not configured
    "hasSupabaseUrl": true        // Database configured
  }
}
```

## Testing Your Integration

### Quick Test Script
```bash
#!/bin/bash
APP_URL="https://YOUR_APP_URL"

echo "1. Testing Public Health..."
curl -s "$APP_URL/api/health/public" | jq '.'

echo -e "\n2. Testing Crop Search..."
curl -s "$APP_URL/api/agriculture/crops/search?q=corn" | jq '.'

echo -e "\n3. Testing Weather Geocoding..."
curl -s "$APP_URL/api/weather/geocoding?address=Iowa" | jq '.'

echo -e "\n4. Testing Database Schema..."
curl -s "$APP_URL/api/debug/schema" | jq '.'
```

## API Rate Limits

- Public endpoints: 100 requests/minute
- Authenticated endpoints: 500 requests/minute
- Admin endpoints: 1000 requests/minute

Rate limiting is implemented using Redis/Upstash when configured.