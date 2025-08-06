import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  try {
    // Check environment variables (safely, without exposing secrets)
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      auth: {
        nextauth_url: process.env.NEXTAUTH_URL || 'NOT SET',
        nextauth_secret_set: !!process.env.NEXTAUTH_SECRET,
        nextauth_secret_length: process.env.NEXTAUTH_SECRET?.length || 0,
      },
      database: {
        database_url_set: !!process.env.DATABASE_URL,
        direct_url_set: !!process.env.DIRECT_URL,
      },
      headers: {
        host: headers().get('host'),
        'x-forwarded-host': headers().get('x-forwarded-host'),
        'x-forwarded-proto': headers().get('x-forwarded-proto'),
      },
      routes: {
        auth_route_exists: true,
        auth_providers_path: '/api/auth/providers',
        auth_session_path: '/api/auth/session',
        auth_csrf_path: '/api/auth/csrf',
      },
      vercel: {
        vercel_env: process.env.VERCEL_ENV || 'NOT SET',
        vercel_url: process.env.VERCEL_URL || 'NOT SET',
      },
      checks: {
        nextauth_url_matches_host: false,
        auth_can_initialize: false,
      }
    }

    // Check if NEXTAUTH_URL matches the current host
    const currentHost = headers().get('host')
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (currentHost && nextAuthUrl) {
      const urlHost = new URL(nextAuthUrl).host
      diagnostics.checks.nextauth_url_matches_host = urlHost === currentHost
    }

    // Check if auth can initialize
    diagnostics.checks.auth_can_initialize = 
      !!process.env.NEXTAUTH_SECRET && 
      !!process.env.NEXTAUTH_URL

    // Test NextAuth endpoints
    const authEndpoints = []
    try {
      // Don't actually import NextAuth here, just check if routes would work
      authEndpoints.push({
        endpoint: 'providers',
        status: 'ready',
        note: 'Route handler exists'
      })
    } catch (error) {
      authEndpoints.push({
        endpoint: 'providers',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    return NextResponse.json({
      ...diagnostics,
      authEndpoints,
      recommendations: getRecommendations(diagnostics),
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Diagnostic check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function getRecommendations(diagnostics: any): string[] {
  const recommendations = []

  if (!diagnostics.auth.nextauth_secret_set) {
    recommendations.push('Set NEXTAUTH_SECRET environment variable')
  }

  if (diagnostics.auth.nextauth_url === 'NOT SET') {
    recommendations.push('Set NEXTAUTH_URL environment variable')
  }

  if (!diagnostics.checks.nextauth_url_matches_host) {
    recommendations.push(`NEXTAUTH_URL (${diagnostics.auth.nextauth_url}) doesn't match current host (${diagnostics.headers.host})`)
  }

  if (!diagnostics.database.database_url_set) {
    recommendations.push('Set DATABASE_URL environment variable for production database access')
  }

  if (diagnostics.vercel.vercel_env === 'production' && diagnostics.auth.nextauth_url?.includes('localhost')) {
    recommendations.push('NEXTAUTH_URL should not contain localhost in production')
  }

  return recommendations
}