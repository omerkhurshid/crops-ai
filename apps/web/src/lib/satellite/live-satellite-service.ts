/**
 * Live Satellite Service with Fallback
 * Manages real satellite data integration with intelligent fallbacks
 */

import { SentinelHubService } from './sentinel-hub'
import { NDVIAnalysisService } from './ndvi-analysis'
import { planetLabsService } from './planet-labs'
import { copernicusService } from './copernicus-service'
import { prisma } from '../prisma'

export interface LiveSatelliteConfig {
  preferLiveData: boolean
  fallbackToMock: boolean
  cacheResults: boolean
  maxRetries: number
}

export interface SatelliteDataPoint {
  fieldId: string
  captureDate: Date
  ndvi: number
  ndviChange: number | null
  stressLevel: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
  imageUrl: string | null
  metadata: {
    source: 'sentinel-hub' | 'mock' | 'planet-labs'
    cloudCoverage?: number
    resolution?: number
    bands?: string[]
    planetImageId?: string
    analysisConfidence?: number
  }
}

class LiveSatelliteService {
  private sentinelHub: SentinelHubService
  private ndviAnalyzer: NDVIAnalysisService
  private config: LiveSatelliteConfig

  constructor(config?: Partial<LiveSatelliteConfig>) {
    this.sentinelHub = new SentinelHubService()
    this.ndviAnalyzer = new NDVIAnalysisService()
    
    this.config = {
      preferLiveData: true,
      fallbackToMock: true,
      cacheResults: true,
      maxRetries: 3,
      ...config
    }
  }

  /**
   * Get the latest satellite data for a field with intelligent fallbacks
   */
  async getLatestFieldData(fieldId: string): Promise<SatelliteDataPoint | null> {
    try {
      // Get field information including boundary
      const field = await this.getFieldWithBoundary(fieldId)
      if (!field) {
        throw new Error(`Field ${fieldId} not found`)
      }

      // Try to get live data first
      if (this.config.preferLiveData) {
        // Try Planet Labs first for highest resolution
        const planetData = await this.fetchPlanetLabsData(field)
        if (planetData) {
          if (this.config.cacheResults) {
            await this.cacheData(planetData)
          }
          return planetData
        }

        // Try Copernicus/ESA Sentinel-2 for real NDVI data
        const copernicusData = await this.fetchCopernicusData(field)
        if (copernicusData) {
          if (this.config.cacheResults) {
            await this.cacheData(copernicusData)
          }
          return copernicusData
        }

        // Fallback to Sentinel Hub
        const sentinelData = await this.fetchLiveSatelliteData(field)
        if (sentinelData) {
          if (this.config.cacheResults) {
            await this.cacheData(sentinelData)
          }
          return sentinelData
        }
      }

      // Fallback to cached data
      const cachedData = await this.getCachedData(fieldId)
      if (cachedData && !this.isDataStale(cachedData)) {
        return this.formatCachedData(cachedData)
      }

      // Fallback to mock data if configured
      if (this.config.fallbackToMock) {
        return await this.generateMockData(field)
      }

      return null

    } catch (error) {
      console.error('Error getting satellite data:', error)
      
      // Last resort fallback
      if (this.config.fallbackToMock) {
        const field = await this.getFieldWithBoundary(fieldId)
        if (field) {
          return await this.generateMockData(field)
        }
      }
      
      return null
    }
  }

  /**
   * Fetch real NDVI data from ESA Copernicus Sentinel-2
   */
  private async fetchCopernicusData(field: any): Promise<SatelliteDataPoint | null> {
    try {
      // Calculate field bounds from boundary or farm coordinates
      const bounds = this.calculateFieldBounds(field)
      
      // Get latest NDVI calculation from Copernicus
      const ndviCalculation = await copernicusService.getLatestFieldNDVI(field.id, bounds)
      
      if (!ndviCalculation) {
        console.log('No Copernicus NDVI data available for field:', field.id)
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
        imageUrl: null, // Copernicus service doesn't provide direct image URLs
        metadata: {
          source: 'sentinel-hub', // Keep as sentinel-hub for compatibility
          cloudCoverage: ndviCalculation.cloudCover,
          resolution: 10, // Sentinel-2 10m resolution for visible/NIR bands
          bands: ['B04', 'B08'], // Red and NIR bands used for NDVI
          analysisConfidence: this.getConfidenceFromQuality(ndviCalculation.quality)
        }
      }

    } catch (error) {
      console.error('Error fetching Copernicus data:', error)
      return null
    }
  }

  /**
   * Fetch high-resolution data from Planet Labs
   */
  private async fetchPlanetLabsData(field: any): Promise<SatelliteDataPoint | null> {
    try {
      if (!planetLabsService.isConfigured()) {
        console.log('Planet Labs not configured, skipping high-resolution data fetch')
        return null
      }

      // Create field geometry from boundary
      let fieldGeometry
      if (field.boundary) {
        // This would need to convert PostGIS geography to GeoJSON
        fieldGeometry = this.convertBoundaryToGeoJSON(field.boundary)
      } else {
        // Create geometry from farm center point
        fieldGeometry = planetLabsService.createFieldGeometry([
          { lat: field.farm.latitude - 0.001, lng: field.farm.longitude - 0.001 },
          { lat: field.farm.latitude - 0.001, lng: field.farm.longitude + 0.001 },
          { lat: field.farm.latitude + 0.001, lng: field.farm.longitude + 0.001 },
          { lat: field.farm.latitude + 0.001, lng: field.farm.longitude - 0.001 }
        ])
      }

      // Get field statistics from Planet Labs
      const analytics = await planetLabsService.getFieldStatistics(field.id, fieldGeometry)
      
      if (!analytics) {
        return null
      }

      // Get previous data for comparison
      const previousData = await this.getPreviousSatelliteData(field.id)
      const ndviChange = previousData ? analytics.analysis.vegetation.ndvi.mean - previousData.ndvi : null

      return {
        fieldId: field.id,
        captureDate: new Date(analytics.acquisitionDate),
        ndvi: analytics.analysis.vegetation.ndvi.mean,
        ndviChange,
        stressLevel: this.calculateStressLevel(analytics.analysis.vegetation.ndvi.mean),
        imageUrl: null, // Planet Labs images require separate download
        metadata: {
          source: 'planet-labs',
          cloudCoverage: undefined, // Planet Labs pre-filters for low cloud cover
          resolution: analytics.resolution,
          bands: ['Red', 'NIR', 'Blue', 'Green'], // PlanetScope bands
          planetImageId: analytics.imageId,
          analysisConfidence: 0.9 // High confidence for Planet Labs data
        }
      }

    } catch (error) {
      console.error('Error fetching Planet Labs data:', error)
      return null
    }
  }

  /**
   * Fetch live satellite data from Sentinel Hub
   */
  private async fetchLiveSatelliteData(field: any): Promise<SatelliteDataPoint | null> {
    try {
      // Check if Sentinel Hub is configured
      if (!process.env.SENTINEL_HUB_CLIENT_ID || !process.env.SENTINEL_HUB_CLIENT_SECRET) {
        console.log('Sentinel Hub not configured, skipping live data fetch')
        return null
      }

      // Calculate bounding box from field boundary
      const bbox = this.calculateBoundingBox(field.boundary)
      
      // Get recent imagery (last 30 days)
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // Fetch NDVI imagery
      const ndviImage = await this.sentinelHub.getNDVIImage({
        bbox,
        fromTime: startDate.toISOString().split('T')[0],
        toTime: endDate.toISOString().split('T')[0],
        width: 512,
        height: 512,
        format: 'image/tiff',
        evalscript: this.getNDVIEvalScript(),
        dataFilter: {
          maxCloudCoverage: 30
        }
      })

      if (!ndviImage) {
        return null
      }

      // Analyze NDVI values
      const ndviStats = await this.ndviAnalyzer.analyzeNDVIImage(ndviImage.imageUrl, field.boundary)
      
      // Get previous data for comparison
      const previousData = await this.getPreviousSatelliteData(field.id)
      const ndviChange = previousData ? ndviStats.mean - previousData.ndvi : null

      return {
        fieldId: field.id,
        captureDate: new Date(ndviImage.acquisitionDate),
        ndvi: ndviStats.mean,
        ndviChange,
        stressLevel: this.calculateStressLevel(ndviStats.mean),
        imageUrl: ndviImage.imageUrl,
        metadata: {
          source: 'sentinel-hub',
          cloudCoverage: ndviImage.cloudCoverage,
          resolution: ndviImage.resolution,
          bands: ['B4', 'B8'] // Red and NIR bands for NDVI
        }
      }

    } catch (error) {
      console.error('Error fetching live satellite data:', error)
      return null
    }
  }

  /**
   * Generate realistic mock data for fallback
   */
  private async generateMockData(field: any): Promise<SatelliteDataPoint> {
    // Get previous data to maintain realistic progression
    const previousData = await this.getPreviousSatelliteData(field.id)
    
    // Generate realistic NDVI based on season and previous values
    const baseNDVI = previousData?.ndvi || this.getSeasonalBaseNDVI()
    const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
    const ndvi = Math.max(0, Math.min(1, baseNDVI + variation))
    
    const ndviChange = previousData ? ndvi - previousData.ndvi : null
    
    return {
      fieldId: field.id,
      captureDate: new Date(),
      ndvi,
      ndviChange,
      stressLevel: this.calculateStressLevel(ndvi),
      imageUrl: null,
      metadata: {
        source: 'mock',
        cloudCoverage: Math.random() * 20, // 0-20% cloud coverage
        resolution: 10, // 10m resolution like Sentinel-2
        bands: ['B4', 'B8']
      }
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
   * Get seasonal base NDVI for realistic mock data
   */
  private getSeasonalBaseNDVI(): number {
    const month = new Date().getMonth()
    
    // Northern hemisphere growing season
    if (month >= 3 && month <= 8) { // April to September
      return 0.65 + Math.sin((month - 3) * Math.PI / 6) * 0.15 // Peak in July
    } else {
      return 0.3 + Math.random() * 0.2 // Winter/dormant season
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
        source: 'mock', // Assume cached data was mock
        cloudCoverage: undefined,
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

  /**
   * Get previous satellite data for comparison
   */
  private async getPreviousSatelliteData(fieldId: string) {
    return await prisma.satelliteData.findFirst({
      where: { fieldId },
      orderBy: { captureDate: 'desc' },
      skip: 1 // Skip the most recent one to get the previous
    })
  }

  /**
   * Calculate field bounds for Copernicus service
   */
  private calculateFieldBounds(field: any): { north: number; south: number; east: number; west: number } {
    if (field.boundary) {
      // In production, this would parse the PostGIS geography field
      // For now, create bounds around the farm center
      const centerLat = field.farm.latitude
      const centerLng = field.farm.longitude
      const offset = 0.005 // ~0.5km radius
      
      return {
        north: centerLat + offset,
        south: centerLat - offset,
        east: centerLng + offset,
        west: centerLng - offset
      }
    } else {
      // Default bounds around farm location
      const centerLat = field.farm.latitude
      const centerLng = field.farm.longitude
      const offset = 0.01 // ~1km radius for unknown field size
      
      return {
        north: centerLat + offset,
        south: centerLat - offset,
        east: centerLng + offset,
        west: centerLng - offset
      }
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
   * Calculate bounding box from field boundary
   */
  private calculateBoundingBox(boundary: any) {
    // This would need to be implemented based on the actual boundary format
    // For now, return a default bounding box
    return {
      west: -98.5,
      south: 39.7,
      east: -98.3,
      north: 39.9
    }
  }

  /**
   * Convert PostGIS boundary to GeoJSON format for Planet Labs
   */
  private convertBoundaryToGeoJSON(boundary: any): GeoJSON.Polygon {
    // Placeholder implementation - in production would parse PostGIS geography
    // For now, create a simple polygon around field center
    return {
      type: 'Polygon',
      coordinates: [[
        [-98.5, 39.7],
        [-98.3, 39.7],
        [-98.3, 39.9],
        [-98.5, 39.9],
        [-98.5, 39.7]
      ]]
    }
  }

  /**
   * NDVI calculation evalscript for Sentinel Hub
   */
  private getNDVIEvalScript(): string {
    return `
      //VERSION=3
      function setup() {
        return {
          input: [{
            bands: ["B04", "B08", "SCL"]
          }],
          output: {
            bands: 1,
            sampleType: "FLOAT32"
          }
        }
      }
      
      function evaluatePixel(sample) {
        // Calculate NDVI
        let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04)
        
        // Filter out clouds and invalid pixels using Scene Classification Layer (SCL)
        if (sample.SCL === 3 || sample.SCL === 8 || sample.SCL === 9 || sample.SCL === 10) {
          return [NaN] // Cloud or cloud shadow
        }
        
        return [ndvi]
      }
    `
  }
}

// Export singleton instance
export const liveSatelliteService = new LiveSatelliteService()
export { LiveSatelliteService }