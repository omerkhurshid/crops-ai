import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || (user.role !== 'ADMIN' && !user.email?.includes('admin') && !user.email?.endsWith('@cropple.ai'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check database health
    let databaseStatus: 'healthy' | 'warning' | 'error' = 'healthy'
    let dbResponseTime = 0
    
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbResponseTime = Date.now() - start
      
      if (dbResponseTime > 1000) {
        databaseStatus = 'warning'
      } else if (dbResponseTime > 5000) {
        databaseStatus = 'error'
      }
    } catch (error) {
      databaseStatus = 'error'
    }

    // Check external services
    let weatherServiceStatus: 'healthy' | 'warning' | 'error' = 'healthy'
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=41.8781&lon=-87.6298&appid=${process.env.OPENWEATHER_API_KEY}`,
        { 
          signal: AbortSignal.timeout(5000),
          headers: {
            'User-Agent': 'Crops.AI/1.0'
          }
        }
      )
      if (!weatherResponse.ok) {
        weatherServiceStatus = 'warning'
      }
    } catch (error) {
      weatherServiceStatus = 'error'
    }

    // Check satellite service (mock check)
    let satelliteServiceStatus: 'healthy' | 'warning' | 'error' = 'healthy'
    // In production, this would check actual satellite service endpoints

    // Calculate uptime (mock - in production would come from monitoring service)
    const uptime = 99.8

    // Calculate response time (mock - in production would be real metrics)
    const responseTime = dbResponseTime + Math.random() * 100

    // Calculate error rate (mock)
    const errorRate = 0.12

    return NextResponse.json({
      database: databaseStatus,
      api: 'healthy',
      satelliteService: satelliteServiceStatus,
      weatherService: weatherServiceStatus,
      uptime,
      responseTime: Math.round(responseTime),
      errorRate,
      dbResponseTime,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('System health check error:', error)
    return NextResponse.json(
      { error: 'Failed to get system health' },
      { status: 500 }
    )
  }
}