/**
 * Simplified Satellite Service - Production Ready
 * Uses only working satellite data sources: Google Earth Engine + ESA Copernicus
 */

import { NDVIAnalysisService } from './ndvi-analysis'
import { copernicusService } from './copernicus-service' 
import { analyzeCroppleField } from './google-earth-engine-service'
import { prisma } from '../prisma'

export interface SatelliteDataPoint {
  fieldId: string
  captureDate: Date
  ndvi: number
  ndviChange: number | null
  stressLevel: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
  imageUrl: string | null
  metadata: {
    source: 'google-earth-engine' | 'copernicus'
    cloudCoverage?: number
    resolution?: number
    confidence?: number
  }
}

export class SimplifiedSatelliteService {
  private ndviAnalyzer: NDVIAnalysisService

  constructor() {
    this.ndviAnalyzer = new NDVIAnalysisService()
  }

  /**
   * Get latest satellite data for a field using free sources
   */
  async getLatestFieldData(fieldId: string): Promise<SatelliteDataPoint | null> {
    try {
      // Get field information
      const field = await this.getFieldWithBoundary(fieldId)
      if (!field) {
        console.log(`Field ${fieldId} not found`)
        return null
      }

      // Try Google Earth Engine first (free, unlimited)
      const geeData = await this.fetchGoogleEarthEngineData(field)
      if (geeData) {
        await this.cacheData(geeData)
        return geeData
      }

      // Fallback to ESA Copernicus (free, direct access)  
      const copernicusData = await this.fetchCopernicusData(field)
      if (copernicusData) {
        await this.cacheData(copernicusData)
        return copernicusData
      }

      // Use cached data if available
      const cachedData = await this.getCachedData(fieldId)
      if (cachedData && !this.isDataStale(cachedData)) {
        return this.formatCachedData(cachedData)
      }

      console.log(`No satellite data available for field ${fieldId}`)
      return null

    } catch (error) {
      console.error('Error getting satellite data:', error)
      return null
    }
  }

  /**
   * Fetch data from Google Earth Engine (primary source)
   */
  private async fetchGoogleEarthEngineData(field: any): Promise<SatelliteDataPoint | null> {
    try {
      // Only try if we have field boundaries
      if (!field.boundaries && !field.farm.latitude) {
        return null
      }

      // Create boundary coordinates from farm location if no field boundaries
      let boundaries
      if (field.boundaries) {
        boundaries = field.boundaries
      } else {
        // Create a small polygon around farm center
        const lat = field.farm.latitude
        const lng = field.farm.longitude
        const offset = 0.001 // ~100m
        boundaries = [[
          [lng - offset, lat - offset],
          [lng + offset, lat - offset], 
          [lng + offset, lat + offset],
          [lng - offset, lat + offset],
          [lng - offset, lat - offset]
        ]]
      }

      // Analyze field using Google Earth Engine
      const analysis = await analyzeCroppleField(field.id, boundaries)
      
      // Get previous data for comparison
      const previousData = await this.getPreviousSatelliteData(field.id)
      const ndviChange = previousData ? analysis.satelliteData.ndvi.mean - previousData.ndvi : null

      return {
        fieldId: field.id,
        captureDate: analysis.analysisDate,
        ndvi: analysis.satelliteData.ndvi.mean,
        ndviChange,
        stressLevel: this.mapStressLevel(analysis.healthAssessment.stressLevel),
        imageUrl: analysis.imageUrls.ndvi || null,
        metadata: {
          source: 'google-earth-engine',
          cloudCoverage: analysis.imageMetadata.cloudCoverage,
          resolution: analysis.imageMetadata.resolution,
          confidence: analysis.healthAssessment.confidence / 100
        }
      }

    } catch (error) {
      console.error('Google Earth Engine error:', error)
      return null
    }
  }

  /**
   * Fetch data from ESA Copernicus (backup source)
   */
  private async fetchCopernicusData(field: any): Promise<SatelliteDataPoint | null> {
    try {
      const bounds = this.calculateFieldBounds(field)
      const ndviCalculation = await copernicusService.getLatestFieldNDVI(field.id, bounds)
      
      if (!ndviCalculation) {
        return null
      }

      // Get previous data for comparison
      const previousData = await this.getPreviousSatelliteData(field.id)
      const ndviChange = previousData ? ndviCalculation.meanNDVI - previousData.ndvi : null

      return {
        fieldId: field.id,
        captureDate: new Date(ndviCalculation.date),
        ndvi: ndviCalculation.meanNDVI,
        ndviChange,
        stressLevel: this.calculateStressLevel(ndviCalculation.meanNDVI),
        imageUrl: null,
        metadata: {
          source: 'copernicus',
          cloudCoverage: ndviCalculation.cloudCover,
          resolution: 10, // Sentinel-2 10m resolution
          confidence: this.getConfidenceFromQuality(ndviCalculation.quality)
        }
      }
    } catch (error) {
      console.error('Copernicus service error:', error)
      return null
    }
  }

  /**
   * Map GEE stress levels to our format
   */
  private mapStressLevel(geeStress: string): 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' {
    switch (geeStress.toLowerCase()) {
      case 'none': return 'NONE'
      case 'low': return 'LOW' 
      case 'moderate': return 'MODERATE'
      case 'high': return 'HIGH'
      case 'severe': return 'SEVERE'
      default: return 'MODERATE'
    }
  }

  /**
   * Calculate stress level from NDVI value
   */
  private calculateStressLevel(ndvi: number): 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' {
    if (ndvi >= 0.7) return 'NONE'
    if (ndvi >= 0.6) return 'LOW'
    if (ndvi >= 0.4) return 'MODERATE' 
    if (ndvi >= 0.2) return 'HIGH'
    return 'SEVERE'
  }

  /**
   * Calculate field bounds for Copernicus service
   */
  private calculateFieldBounds(field: any): { north: number; south: number; east: number; west: number } {
    const centerLat = field.farm.latitude
    const centerLng = field.farm.longitude
    const offset = 0.005 // ~0.5km radius

    return {
      north: centerLat + offset,
      south: centerLat - offset,
      east: centerLng + offset,
      west: centerLng - offset
    }
  }

  /**
   * Convert quality rating to confidence score
   */
  private getConfidenceFromQuality(quality: 'excellent' | 'good' | 'fair' | 'poor'): number {
    switch (quality) {
      case 'excellent': return 0.95
      case 'good': return 0.85
      case 'fair': return 0.7
      case 'poor': return 0.5
      default: return 0.6
    }
  }

  /**
   * Get previous satellite data for trend analysis
   */
  private async getPreviousSatelliteData(fieldId: string): Promise<SatelliteDataPoint | null> {
    try {
      const previousData = await prisma.satelliteData.findFirst({
        where: { fieldId },
        orderBy: { captureDate: 'desc' }
      })

      if (!previousData) return null

      return {
        fieldId: previousData.fieldId,
        captureDate: previousData.captureDate,
        ndvi: previousData.ndvi,
        ndviChange: previousData.ndviChange,
        stressLevel: previousData.stressLevel as any,
        imageUrl: previousData.imageUrl,
        metadata: { source: 'copernicus' as const }
      }
    } catch (error) {
      console.error('Error fetching previous satellite data:', error)
      return null
    }
  }

  /**
   * Cache satellite data to database
   */
  private async cacheData(data: SatelliteDataPoint): Promise<void> {
    try {
      await prisma.satelliteData.create({
        data: {
          fieldId: data.fieldId,
          captureDate: data.captureDate,
          ndvi: data.ndvi,
          ndviChange: data.ndviChange,
          stressLevel: data.stressLevel,
          imageUrl: data.imageUrl
        }
      })
    } catch (error) {
      console.error('Error caching satellite data:', error)
    }
  }

  /**
   * Get cached data from database
   */
  private async getCachedData(fieldId: string) {
    return await prisma.satelliteData.findFirst({
      where: { fieldId },
      orderBy: { captureDate: 'desc' }
    })
  }

  /**
   * Check if cached data is stale (older than 7 days)
   */
  private isDataStale(data: any): boolean {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return data.captureDate < sevenDaysAgo
  }

  /**
   * Format cached data to match our interface
   */
  private formatCachedData(cached: any): SatelliteDataPoint {
    return {
      fieldId: cached.fieldId,
      captureDate: cached.captureDate,
      ndvi: cached.ndvi,
      ndviChange: cached.ndviChange,
      stressLevel: cached.stressLevel,
      imageUrl: cached.imageUrl,
      metadata: {
        source: 'copernicus',
        resolution: 10
      }
    }
  }

  /**
   * Get field with boundary information
   */
  private async getFieldWithBoundary(fieldId: string) {
    return await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        farm: true
      }
    })
  }
}

// Export singleton instance
export const simplifiedSatelliteService = new SimplifiedSatelliteService()

// For backward compatibility, export as the main service
export const liveSatelliteService = simplifiedSatelliteService