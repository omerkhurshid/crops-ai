import { NextRequest, NextResponse } from 'next/server'
import { createSampleFieldBoundaries, getFieldsInRegion } from '../../../../lib/database/field-boundary-utils'
import { prisma } from '../../../../lib/prisma'

/**
 * Admin endpoint to populate field boundaries for existing fields
 * POST /api/admin/populate-boundaries
 */
export async function POST(request: NextRequest) {
  try {
    // Check database connection first
    await prisma.$queryRaw`SELECT 1`
    
    console.log('Starting field boundary population...')
    
    // Create sample boundaries for all fields without boundaries
    await createSampleFieldBoundaries()
    
    // Get count of fields with boundaries
    const fieldsWithBoundaries = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM fields 
      WHERE boundary IS NOT NULL
    ` as Array<{ count: bigint }>
    
    const totalFieldsWithBoundaries = Number(fieldsWithBoundaries[0].count)
    
    return NextResponse.json({
      success: true,
      message: `Field boundaries populated successfully`,
      fieldsWithBoundaries: totalFieldsWithBoundaries,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error populating field boundaries:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to populate field boundaries',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Get status of field boundaries
 * GET /api/admin/populate-boundaries
 */
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get statistics about field boundaries
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_fields,
        COUNT(boundary) as fields_with_boundaries,
        COUNT(CASE WHEN boundary IS NULL THEN 1 END) as fields_without_boundaries
      FROM fields
    ` as Array<{
      total_fields: bigint
      fields_with_boundaries: bigint  
      fields_without_boundaries: bigint
    }>
    
    const result = {
      totalFields: Number(stats[0].total_fields),
      fieldsWithBoundaries: Number(stats[0].fields_with_boundaries),
      fieldsWithoutBoundaries: Number(stats[0].fields_without_boundaries),
      completionPercentage: stats[0].total_fields > 0n 
        ? Math.round((Number(stats[0].fields_with_boundaries) / Number(stats[0].total_fields)) * 100)
        : 0
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error getting field boundary status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get field boundary status',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}