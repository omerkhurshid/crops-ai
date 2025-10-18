/**
 * Public health check endpoint - no authentication required
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { checkDatabaseHealth, dbMonitor } from '../../../../lib/monitoring';

export async function GET(request: NextRequest) {
  const healthCheck = {
    status: 'healthy' as 'healthy' | 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown' as string,
      weather: 'unknown' as string,
      version: process.env.npm_package_version || '1.0.0',
      dbResponseTime: 0 as number | undefined
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasOpenWeatherKey: !!process.env.OPENWEATHER_API_KEY,
      hasGoogleMapsKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      hasSupabaseUrl: !!process.env.SUPABASE_URL
    }
  };

  // Test database connection with monitoring
  try {
    const dbHealth = await checkDatabaseHealth();
    healthCheck.services.database = dbHealth.status;
    healthCheck.services.dbResponseTime = dbHealth.responseTime;
    
    if (dbHealth.status !== 'healthy') {
      healthCheck.status = 'degraded';
    }
  } catch (error) {
    healthCheck.services.database = 'error';
    healthCheck.status = 'degraded';
  }

  // Test OpenWeather API (if key is configured)
  if (process.env.OPENWEATHER_API_KEY) {
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=40.7128&lon=-74.0060&appid=${process.env.OPENWEATHER_API_KEY}`,
        { 
          signal: AbortSignal.timeout(5000)
        }
      );
      
      if (weatherResponse.ok) {
        healthCheck.services.weather = 'healthy';
      } else if (weatherResponse.status === 401) {
        healthCheck.services.weather = 'invalid_api_key';
        healthCheck.status = 'degraded';
      } else {
        healthCheck.services.weather = 'error';
        healthCheck.status = 'degraded';
      }
    } catch (error) {
      healthCheck.services.weather = 'timeout';
      healthCheck.status = 'degraded';
    }
  } else {
    healthCheck.services.weather = 'not_configured';
  }

  return NextResponse.json(healthCheck, { 
    status: healthCheck.status === 'healthy' ? 200 : 503 
  });
}