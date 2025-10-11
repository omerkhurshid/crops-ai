import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// This is a one-time setup route - delete after use
export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with proper admin auth
    const adminKey = request.headers.get('x-admin-key')
    
    if (process.env.NODE_ENV === 'production' && adminKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test database connection
    await prisma.$connect()
    
    // Run a simple query to test if tables exist
    try {
      await prisma.user.findFirst()
      return NextResponse.json({ 
        success: true, 
        message: 'Database tables already exist and are accessible',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      // Tables don't exist, but connection works
      return NextResponse.json({ 
        success: false,
        error: 'Tables do not exist. Please run database migration.',
        message: 'Database connection successful, but tables need to be created',
        instructions: [
          '1. Go to Supabase Dashboard → SQL Editor',
          '2. Create tables by running the Prisma schema',
          '3. Then run the performance indexes SQL file'
        ],
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}