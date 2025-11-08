import { NextRequest } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../../lib/api/errors'
import { apiMiddleware, withMethods, AuthenticatedRequest } from '../../../../../lib/api/middleware'
// GET /api/farms/[id]/map-data - Get farm boundaries and field data for map visualization
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const farmId = params.id
      if (!farmId) {
        throw new ValidationError('Farm ID is required')
      }
      // Find farm and verify ownership
      const farm = await prisma.farm.findFirst({
        where: {
          id: farmId,
          ownerId: request.user.id
        },
        include: {
          fields: {
            include: {
              satelliteData: {
                select: {
                  captureDate: true,
                  ndvi: true,
                  stressLevel: true
                },
                orderBy: { captureDate: 'desc' },
                take: 1
              }
            }
          }
        }
      })
      if (!farm) {
        throw new ValidationError('Farm not found or access denied')
      }
      // Get farm boundary from PostGIS
      let farmBoundary = null
      try {
        const boundaryResult = await prisma.$queryRaw`
          SELECT ST_AsGeoJSON(boundary) as boundary_geojson 
          FROM farms 
          WHERE id = ${farmId} AND boundary IS NOT NULL
        ` as any[]
        if (boundaryResult.length > 0 && boundaryResult[0].boundary_geojson) {
          const geoJson = JSON.parse(boundaryResult[0].boundary_geojson)
          // Convert GeoJSON coordinates to lat/lng format
          if (geoJson.type === 'Polygon' && geoJson.coordinates && geoJson.coordinates[0]) {
            farmBoundary = geoJson.coordinates[0].map((coord: number[]) => ({
              lat: coord[1],
              lng: coord[0]
            }))
          }
        }
      } catch (error) {
      }
      // Process fields with boundaries
      const fieldsWithBoundaries = await Promise.all(
        farm.fields.map(async (field) => {
          let fieldBoundary = null
          // Get field boundary from PostGIS
          try {
            const fieldBoundaryResult = await prisma.$queryRaw`
              SELECT ST_AsGeoJSON(boundary) as boundary_geojson 
              FROM fields 
              WHERE id = ${field.id} AND boundary IS NOT NULL
            ` as any[]
            if (fieldBoundaryResult.length > 0 && fieldBoundaryResult[0].boundary_geojson) {
              const geoJson = JSON.parse(fieldBoundaryResult[0].boundary_geojson)
              if (geoJson.type === 'Polygon' && geoJson.coordinates && geoJson.coordinates[0]) {
                fieldBoundary = geoJson.coordinates[0].map((coord: number[]) => ({
                  lat: coord[1],
                  lng: coord[0]
                }))
              }
            }
          } catch (error) {
          }
          return {
            id: field.id,
            name: field.name,
            area: field.area,
            color: field.color,
            cropType: field.cropType,
            status: field.status || 'active',
            soilType: field.soilType,
            boundary: fieldBoundary,
            lastAnalysis: field.satelliteData?.[0] ? {
              date: field.satelliteData[0].captureDate,
              ndvi: field.satelliteData[0].ndvi,
              stressLevel: field.satelliteData[0].stressLevel?.toLowerCase()
            } : null
          }
        })
      )
      // Farm data for map
      const farmData = {
        id: farm.id,
        name: farm.name,
        latitude: farm.latitude,
        longitude: farm.longitude,
        totalArea: farm.totalArea,
        address: farm.address,
        boundary: farmBoundary
      }
      return createSuccessResponse({
        farm: farmData,
        fields: fieldsWithBoundaries,
        summary: {
          totalFields: fieldsWithBoundaries.length,
          mappedFields: fieldsWithBoundaries.filter(f => f.boundary).length,
          totalMappedArea: fieldsWithBoundaries
            .filter(f => f.boundary)
            .reduce((sum, field) => sum + field.area, 0),
          coveragePercentage: farm.totalArea > 0 
            ? (fieldsWithBoundaries.reduce((sum, field) => sum + field.area, 0) / farm.totalArea) * 100 
            : 0
        }
      })
    } catch (error) {
      return handleApiError(error)
    }
  })
)