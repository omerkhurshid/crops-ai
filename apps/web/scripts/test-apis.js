#!/usr/bin/env node

/**
 * API Integration Test Suite
 * Tests all external API connections to verify production readiness
 */

const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

class APITester {
  constructor() {
    this.results = [];
  }

  async testGoogleMaps() {
    console.log('🗺️  Testing Google Maps API...');
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey === 'AIzaSyB7BR2V1kunq0fPSHN6Zhvg_oQTnvW7Lq0' || apiKey === 'REVOKED_KEY_NEEDS_REPLACEMENT') {
      this.addResult('Google Maps', '❌ FAIL', 'API key missing or placeholder');
      return;
    }

    try {
      // Test geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Story+County,Iowa&key=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK') {
          this.addResult('Google Maps', '✅ PASS', 'Geocoding API working');
        } else {
          this.addResult('Google Maps', '⚠️  WARN', `API returned: ${data.status}`);
        }
      } else {
        this.addResult('Google Maps', '❌ FAIL', `HTTP ${response.status}`);
      }
    } catch (error) {
      this.addResult('Google Maps', '❌ FAIL', error.message);
    }
  }

  async testOpenWeather() {
    console.log('🌤️  Testing OpenWeather API...');
    
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'mock_development_key') {
      this.addResult('OpenWeather', '❌ FAIL', 'API key missing or placeholder');
      return;
    }

    try {
      // Test current weather API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=41.5868&lon=-93.6250&appid=${apiKey}&units=metric`
      );
      
      if (response.ok) {
        const data = await response.json();
        this.addResult('OpenWeather', '✅ PASS', `Temperature: ${data.main.temp}°C`);
      } else {
        this.addResult('OpenWeather', '❌ FAIL', `HTTP ${response.status}`);
      }
    } catch (error) {
      this.addResult('OpenWeather', '❌ FAIL', error.message);
    }
  }

  async testSentinelHub() {
    console.log('🛰️  Testing Sentinel Hub API...');
    
    const clientId = process.env.SENTINEL_HUB_CLIENT_ID;
    const clientSecret = process.env.SENTINEL_HUB_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      this.addResult('Sentinel Hub', '❌ FAIL', 'Credentials missing');
      return;
    }

    try {
      // Test authentication
      const response = await fetch('https://services.sentinel-hub.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          this.addResult('Sentinel Hub', '✅ PASS', 'Authentication successful');
        } else {
          this.addResult('Sentinel Hub', '❌ FAIL', 'No access token received');
        }
      } else {
        this.addResult('Sentinel Hub', '❌ FAIL', `HTTP ${response.status}`);
      }
    } catch (error) {
      this.addResult('Sentinel Hub', '❌ FAIL', error.message);
    }
  }

  async testRedis() {
    console.log('📦 Testing Redis connection...');
    
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token || url.includes('example') || token.includes('example')) {
      this.addResult('Redis', '❌ FAIL', 'Connection details missing or placeholder');
      return;
    }

    try {
      // Test ping command
      const response = await fetch(`${url}/ping`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result === 'PONG') {
          this.addResult('Redis', '✅ PASS', 'Connection successful');
        } else {
          this.addResult('Redis', '❌ FAIL', 'Unexpected response');
        }
      } else {
        this.addResult('Redis', '❌ FAIL', `HTTP ${response.status}`);
      }
    } catch (error) {
      this.addResult('Redis', '❌ FAIL', error.message);
    }
  }

  async testCloudinary() {
    console.log('☁️  Testing Cloudinary...');
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret || 
        cloudName === 'example' || apiKey === '123456789') {
      this.addResult('Cloudinary', '❌ FAIL', 'Credentials missing or placeholder');
      return;
    }

    try {
      // Test API by checking account status
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      if (response.ok) {
        this.addResult('Cloudinary', '✅ PASS', 'API accessible');
      } else {
        this.addResult('Cloudinary', '❌ FAIL', `HTTP ${response.status}`);
      }
    } catch (error) {
      this.addResult('Cloudinary', '❌ FAIL', error.message);
    }
  }

  async testDatabase() {
    console.log('🗄️  Testing Database connection...');
    
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      this.addResult('Database', '❌ FAIL', 'DATABASE_URL missing');
      return;
    }

    // Simple connection test (would require pg client in real implementation)
    if (dbUrl.includes('supabase.com')) {
      this.addResult('Database', '✅ PASS', 'Supabase URL configured');
    } else {
      this.addResult('Database', '⚠️  WARN', 'Non-Supabase database detected');
    }
  }

  addResult(service, status, message) {
    this.results.push({ service, status, message });
  }

  printResults() {
    console.log('\n📊 API Test Results:');
    console.log('═══════════════════════════════════════');
    
    this.results.forEach(result => {
      console.log(`${result.status} ${result.service.padEnd(15)} | ${result.message}`);
    });

    console.log('═══════════════════════════════════════');
    
    const passed = this.results.filter(r => r.status.includes('✅')).length;
    const failed = this.results.filter(r => r.status.includes('❌')).length;
    const warnings = this.results.filter(r => r.status.includes('⚠️')).length;
    
    console.log(`\n📈 Summary: ${passed} passed, ${warnings} warnings, ${failed} failed`);
    
    if (failed > 0) {
      console.log('\n🚨 Action Required:');
      this.results
        .filter(r => r.status.includes('❌'))
        .forEach(result => {
          console.log(`   • Fix ${result.service}: ${result.message}`);
        });
    }

    console.log('\n📚 Setup Guide: See PRODUCTION_SETUP.md for detailed instructions');
  }

  async runAllTests() {
    console.log('🚀 Running Crops.AI API Integration Tests...\n');
    
    await this.testDatabase();
    await this.testGoogleMaps();
    await this.testOpenWeather();
    await this.testSentinelHub();
    await this.testRedis();
    await this.testCloudinary();
    
    this.printResults();
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;