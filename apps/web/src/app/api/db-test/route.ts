import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  let prisma: PrismaClient | null = null
  
  try {
    console.log('Environment variables:')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DIRECT_URL exists:', !!process.env.DIRECT_URL)
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    prisma = new PrismaClient()
    
    console.log('Attempting to connect to database...')
    await prisma.$connect()
    console.log('Database connected successfully')
    
    console.log('Attempting query...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Query successful:', result)
    
    return Response.json({ 
      success: true, 
      message: 'Database connection successful',
      result,
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        DIRECT_URL: !!process.env.DIRECT_URL
      }
    })
  } catch (error: any) {
    console.error('Database error:', error)
    return Response.json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message,
      code: error.code,
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        DIRECT_URL: !!process.env.DIRECT_URL
      }
    }, { status: 500 })
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}