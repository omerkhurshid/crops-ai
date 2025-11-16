#!/usr/bin/env node

/**
 * Detailed Google Maps API test
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// Load environment
const envPath = path.join(__dirname, 'apps/web/.env')
const envContent = fs.readFileSync(envPath, 'utf8')
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim()
  }
})

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          })
        } catch {
          resolve({
            status: res.statusCode,
            data: data
          })
        }
      })
    }).on('error', reject)
  })
}

async function testGoogleMaps() {
  console.log('🗺️  Testing Google Maps API in detail...')
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  console.log(`Using API key: ${apiKey.substring(0, 10)}...`)
  
  try {
    // Test geocoding API with a simple request
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=New+York&key=${apiKey}`
    console.log(`Testing URL: ${url}`)
    
    const response = await httpGet(url)
    
    console.log(`\nResponse status: ${response.status}`)
    console.log(`Response data:`)
    console.log(JSON.stringify(response.data, null, 2))
    
    if (response.status === 200) {
      if (response.data.status === 'OK') {
        console.log('\n✅ SUCCESS: Google Maps API is working!')
        console.log(`Found ${response.data.results.length} results for New York`)
      } else if (response.data.status === 'REQUEST_DENIED') {
        console.log('\n❌ REQUEST_DENIED - Common causes:')
        console.log('1. Geocoding API not enabled in Google Cloud Console')
        console.log('2. Billing not set up (Google Maps requires billing)')
        console.log('3. API key has restrictions that block this request')
        console.log('4. API key quota exceeded')
        
        if (response.data.error_message) {
          console.log(`\nError message: ${response.data.error_message}`)
        }
      } else {
        console.log(`\n❌ API Error: ${response.data.status}`)
        if (response.data.error_message) {
          console.log(`Error message: ${response.data.error_message}`)
        }
      }
    } else {
      console.log(`\n❌ HTTP Error: ${response.status}`)
    }
    
  } catch (error) {
    console.log(`\n❌ Network Error: ${error.message}`)
  }
}

testGoogleMaps()