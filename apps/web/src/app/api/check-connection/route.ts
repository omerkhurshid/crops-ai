import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Checking environment and connection settings...')
  
  const databaseUrl = process.env.DATABASE_URL || 'NOT SET'
  const directUrl = process.env.DIRECT_URL || 'NOT SET'
  
  // Parse the database URL to check settings
  let connectionInfo = {
    hasPooler: false,
    poolerType: 'unknown',
    host: 'unknown',
    port: 'unknown',
    isPgBouncer: false
  }
  
  try {
    if (databaseUrl !== 'NOT SET') {
      const url = new URL(databaseUrl)
      connectionInfo = {
        hasPooler: url.hostname.includes('pooler'),
        poolerType: url.port === '6543' ? 'transaction' : url.port === '5432' ? 'session' : 'unknown',
        host: url.hostname,
        port: url.port,
        isPgBouncer: url.hostname.includes('pooler') || url.port === '6543'
      }
    }
  } catch (e) {
    console.error('Error parsing DATABASE_URL:', e)
  }
  
  // Try different connection approaches
  const results: any = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: databaseUrl !== 'NOT SET',
      DIRECT_URL_SET: directUrl !== 'NOT SET',
      connectionInfo
    },
    tests: []
  }
  
  // Test 1: Check if we should append pgbouncer parameter
  try {
    const shouldUsePgBouncer = connectionInfo.isPgBouncer
    const pgBouncerParam = '?pgbouncer=true&connection_limit=1'
    const urlHasParams = databaseUrl.includes('?')
    
    results.tests.push({
      test: 'PgBouncer Configuration',
      shouldUsePgBouncer,
      urlHasParams,
      recommendation: shouldUsePgBouncer && !urlHasParams ? 
        'Add ?pgbouncer=true to DATABASE_URL' : 
        'Configuration looks correct'
    })
  } catch (e: any) {
    results.tests.push({
      test: 'PgBouncer Configuration',
      error: e.message
    })
  }
  
  // Test 2: Check Supabase pooler settings
  results.tests.push({
    test: 'Supabase Pooler Check',
    isSupabasePooler: connectionInfo.host.includes('supabase'),
    poolerPort: connectionInfo.port === '6543',
    recommendation: connectionInfo.host.includes('supabase') && connectionInfo.port === '6543' ?
      'Using Supabase transaction pooler - add ?pgbouncer=true to DATABASE_URL' :
      'Check pooler configuration'
  })
  
  return Response.json(results, { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}