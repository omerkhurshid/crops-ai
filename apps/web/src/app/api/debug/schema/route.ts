import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    console.log('=== DATABASE SCHEMA INSPECTION ===')
    
    // Try to describe the farms table by attempting to query with different field combinations
    const farmFields: string[] = []
    
    // Test each potential field individually
    const potentialFields = ['id', 'name', 'ownerId', 'latitude', 'longitude', 'address', 'region', 'country', 'totalArea', 'createdAt', 'updatedAt']
    
    for (const field of potentialFields) {
      try {
        const query = `SELECT "${field}" FROM "farms" LIMIT 1`
        await prisma.$queryRaw`SELECT 1 as test` // Test basic connectivity first
        // For now, let's just check if we can connect
        farmFields.push(`${field}: unknown`)
      } catch (error) {
        // Field doesn't exist or other error
        farmFields.push(`${field}: error - ${error instanceof Error ? error.message : 'unknown error'}`)
      }
    }
    
    // Try to get the first farm to see what fields exist
    let existingFarm = null
    try {
      existingFarm = await prisma.farm.findFirst({
        take: 1
      })
    } catch (error) {
      console.error('Error querying existing farm:', error)
    }
    
    // Get table structure info if possible
    let rawTableInfo = null
    try {
      // This is a PostgreSQL specific query to get column information
      rawTableInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'farms'
        ORDER BY ordinal_position;
      `
    } catch (error) {
      console.error('Error getting table info:', error)
    }

    return NextResponse.json({
      success: true,
      schema: {
        farmFields,
        existingFarm,
        rawTableInfo,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing'
        }
      }
    })

  } catch (error) {
    console.error('Schema inspection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error)
    }, { status: 500 })
  }
}