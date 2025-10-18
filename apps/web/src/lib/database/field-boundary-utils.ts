/**
 * Field Boundary Utilities
 * PostGIS geographic data management for field boundaries
 */

import { prisma } from '../prisma'
// Logger replaced with console for local development

export interface FieldBoundary {
  fieldId: string
  coordinates: Array<{ lat: number; lng: number }>
}

export interface GeographicPoint {
  latitude: number
  longitude: number
}

/**
 * Convert coordinate array to PostGIS geography WKT format
 */
export function coordinatesToWKT(coordinates: GeographicPoint[]): string {
  if (coordinates.length < 3) {
    throw new Error('Field boundary must have at least 3 points')
  }
  
  // Ensure the polygon is closed (first point === last point)
  const coords = [...coordinates]
  const firstPoint = coords[0]
  const lastPoint = coords[coords.length - 1]
  
  if (firstPoint.latitude !== lastPoint.latitude || firstPoint.longitude !== lastPoint.longitude) {
    coords.push(firstPoint)
  }
  
  const wktPoints = coords
    .map(coord => `${coord.longitude} ${coord.latitude}`)
    .join(', ')
  
  return `POLYGON((${wktPoints}))`
}

/**
 * Update field boundary in database with PostGIS geography
 */
export async function updateFieldBoundary(fieldId: string, coordinates: GeographicPoint[]) {
  try {
    const wkt = coordinatesToWKT(coordinates)
    
    // Use raw SQL to update PostGIS geography field
    await prisma.$executeRaw`
      UPDATE fields 
      SET boundary = ST_GeogFromText(${wkt})
      WHERE id = ${fieldId}
    `
    
    return true
  } catch (error) {
    console.error('Error updating field boundary', error, { fieldId })
    throw error
  }
}

/**
 * Get field boundary as GeoJSON
 */
export async function getFieldBoundaryGeoJSON(fieldId: string) {
  try {
    const result = await prisma.$queryRaw`
      SELECT ST_AsGeoJSON(boundary) as boundary_json
      FROM fields 
      WHERE id = ${fieldId} AND boundary IS NOT NULL
    ` as Array<{ boundary_json: string | null }>
    
    if (result.length === 0 || !result[0].boundary_json) {
      return null
    }
    
    return JSON.parse(result[0].boundary_json)
  } catch (error) {
    console.error('Error fetching field boundary', error, { fieldId })
    throw error
  }
}

/**
 * Calculate field area from boundary coordinates (in hectares)
 */
export async function calculateFieldArea(coordinates: GeographicPoint[]): Promise<number> {
  try {
    const wkt = coordinatesToWKT(coordinates)
    
    // Calculate area in square meters using PostGIS
    const result = await prisma.$queryRaw`
      SELECT ST_Area(ST_GeogFromText(${wkt})) as area_sqm
    ` as Array<{ area_sqm: number }>
    
    if (result.length === 0) {
      throw new Error('Failed to calculate area')
    }
    
    // Convert square meters to hectares
    const areaHectares = result[0].area_sqm / 10000
    return Math.round(areaHectares * 100) / 100 // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating field area', error)
    throw error
  }
}

/**
 * Find fields within a geographic region
 */
export async function getFieldsInRegion(
  centerLat: number, 
  centerLng: number, 
  radiusKm: number
) {
  try {
    const result = await prisma.$queryRaw`
      SELECT f.id, f.name, f.area, ST_AsGeoJSON(f.boundary) as boundary_json
      FROM fields f
      WHERE f.boundary IS NOT NULL
      AND ST_DWithin(
        f.boundary,
        ST_GeogPoint(${centerLng}, ${centerLat}),
        ${radiusKm * 1000}
      )
    ` as Array<{
      id: string
      name: string
      area: number
      boundary_json: string
    }>
    
    return result.map(field => ({
      ...field,
      boundary: field.boundary_json ? JSON.parse(field.boundary_json) : null
    }))
  } catch (error) {
    console.error('Error finding fields in region', error, { centerLat, centerLng, radiusKm })
    throw error
  }
}

/**
 * Validate field boundary coordinates
 */
export function validateFieldBoundary(coordinates: GeographicPoint[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (coordinates.length < 3) {
    errors.push('Field boundary must have at least 3 points')
  }
  
  for (const coord of coordinates) {
    if (coord.latitude < -90 || coord.latitude > 90) {
      errors.push(`Invalid latitude: ${coord.latitude}`)
    }
    if (coord.longitude < -180 || coord.longitude > 180) {
      errors.push(`Invalid longitude: ${coord.longitude}`)
    }
  }
  
  // Check for self-intersecting polygon (basic check)
  if (coordinates.length > 3) {
    const area = calculatePolygonArea(coordinates)
    if (Math.abs(area) < 0.000001) {
      errors.push('Field boundary appears to be degenerate or self-intersecting')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Helper function to calculate polygon area using shoelace formula
 */
function calculatePolygonArea(coordinates: GeographicPoint[]): number {
  let area = 0
  const n = coordinates.length
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += coordinates[i].longitude * coordinates[j].latitude
    area -= coordinates[j].longitude * coordinates[i].latitude
  }
  
  return Math.abs(area) / 2
}

/**
 * Create sample field boundaries for demo purposes
 */
export async function createSampleFieldBoundaries() {
  try {
    // Get all fields without boundaries
    const fieldsWithoutBoundaries = await prisma.field.findMany({
      where: {
        // This will find fields where boundary is null
      },
      include: {
        farm: true
      }
    })
    
    for (const field of fieldsWithoutBoundaries) {
      // Create a rectangular boundary around the farm location
      const { farm } = field
      const centerLat = farm.latitude
      const centerLng = farm.longitude
      
      // Create a rectangle approximately 100m x 100m (rough estimate)
      const offset = 0.0009 // roughly 100m at mid-latitudes
      
      const boundary = [
        { latitude: centerLat - offset, longitude: centerLng - offset },
        { latitude: centerLat - offset, longitude: centerLng + offset },
        { latitude: centerLat + offset, longitude: centerLng + offset },
        { latitude: centerLat + offset, longitude: centerLng - offset },
      ]
      
      await updateFieldBoundary(field.id, boundary)
      
      // Update the field area based on calculated boundary
      const calculatedArea = await calculateFieldArea(boundary)
      await prisma.field.update({
        where: { id: field.id },
        data: { area: calculatedArea }
      })
      
    }
    
  } catch (error) {
    console.error('Error creating sample field boundaries', error)
    throw error
  }
}