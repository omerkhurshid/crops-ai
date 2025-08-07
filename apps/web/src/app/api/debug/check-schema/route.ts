import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    console.log('=== COMPREHENSIVE SCHEMA CHECK ===')
    
    // Check farms table structure
    const farmsColumns: any[] = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'farms'
      ORDER BY ordinal_position
    `
    
    console.log('Farms table columns:', farmsColumns)
    
    // Check for any constraints
    const constraints: any[] = await prisma.$queryRaw`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'farms'
    `
    
    console.log('Farms table constraints:', constraints)
    
    // Get column details for NOT NULL constraints
    const notNullColumns: any[] = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'farms' 
      AND is_nullable = 'NO'
    `
    
    console.log('NOT NULL columns:', notNullColumns)
    
    // Try to create a test farm with minimal required fields
    let testResult = null
    try {
      const minimalData = {
        name: 'Schema Test Farm',
        ownerId: 'test-user-id',
        latitude: 40.7128,
        longitude: -74.0060,
        totalArea: 100
      }
      
      console.log('Attempting minimal farm creation:', minimalData)
      
      const testFarm = await prisma.farm.create({
        data: minimalData
      })
      
      await prisma.farm.delete({ where: { id: testFarm.id } })
      testResult = { success: true, message: 'Minimal farm creation successful' }
    } catch (error) {
      console.error('Minimal farm creation failed:', error)
      testResult = { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }
    
    // Compare Prisma schema fields with database columns
    const prismaFields = [
      'id', 'name', 'ownerId', 'latitude', 'longitude', 
      'address', 'region', 'country', 'totalArea', 
      'createdAt', 'updatedAt'
    ]
    
    const dbColumnNames = farmsColumns.map(col => col.column_name)
    const missingInDb = prismaFields.filter(field => !dbColumnNames.includes(field))
    const extraInDb = dbColumnNames.filter(col => !prismaFields.includes(col))
    
    return NextResponse.json({
      success: true,
      schema: {
        columns: farmsColumns,
        constraints: constraints,
        notNullColumns: notNullColumns.map(c => c.column_name),
        prismaExpectedFields: prismaFields,
        missingInDatabase: missingInDb,
        extraInDatabase: extraInDb
      },
      testResult,
      recommendation: missingInDb.length > 0 ? 
        'Database is missing columns defined in Prisma schema. Run migrations.' : 
        'Schema appears to be in sync'
    })
  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error)
    }, { status: 500 })
  }
}