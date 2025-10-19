/**
 * Google Earth Engine Integration for Cropple.ai
 * 
 * Unlimited area, free tier with 250k requests/month, 10m resolution
 * More complex but infinitely scalable
 */

// Logger replaced with console for local development

export interface GEEConfig {
  serviceAccountEmail: string
  privateKey: string
  projectId: string
}

export interface FieldAnalysisRequest {
  fieldId: string
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  startDate: string
  endDate: string
  cropType?: string
  plantingDate?: string
}

export interface GEEAnalysisResult {
  fieldId: string
  analysisDate: Date
  satelliteData: {
    ndvi: {
      mean: number
      median: number
      min: number
      max: number
      std: number
      percentile25: number
      percentile75: number
    }
    evi: {
      mean: number
      median: number
      min: number
      max: number
      std: number
    }
    savi: {
      mean: number
      std: number
    }
    ndwi: {
      mean: number // Water/moisture content
      std: number
    }
  }
  imageMetadata: {
    acquisitionDate: Date
    satellite: 'Sentinel-2' | 'Landsat-8' | 'Landsat-9'
    cloudCoverage: number
    pixelCount: number
    resolution: number
  }
  healthAssessment: {
    score: number // 0-100
    category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
    stressLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe'
    confidence: number
  }
  trends: {
    ndviChange: number // vs 30 days ago
    seasonalTrend: 'improving' | 'stable' | 'declining'
    historicalPercentile: number // vs same time previous years
  }
  recommendations: string[]
  imageUrls: {
    trueColor: string
    falseColor: string  
    ndvi: string
    evi: string
  }
}

export class GoogleEarthEngineService {
  private config: GEEConfig
  private readonly GEE_API_ENDPOINT = 'https://earthengine.googleapis.com'

  constructor(config: GEEConfig) {
    this.config = config
  }

  /**
   * Analyze field health using Google Earth Engine
   * This is the main function farmers will use
   */
  async analyzeFieldHealth(request: FieldAnalysisRequest): Promise<GEEAnalysisResult> {
    try {
      // 1. Generate Earth Engine JavaScript code
      const eeScript = this.generateEEScript(request)
      
      // 2. Execute the script on Google's servers
      const rawResults = await this.executeEEScript(eeScript)
      
      // 3. Process results and generate insights
      const analysis = this.processEEResults(rawResults, request)
      
      // 4. Generate farmer-friendly recommendations
      const recommendations = this.generateFarmerRecommendations(analysis, request)
      
      // Validate that we have real satellite data
      if (!analysis.satelliteData || !analysis.healthAssessment) {
        throw new Error('Google Earth Engine analysis failed: No satellite data returned. Check GEE API configuration and field coordinates.')
      }

      // Validate essential NDVI data 
      if (!analysis.satelliteData.ndvi || analysis.satelliteData.ndvi.mean === 0) {
        throw new Error('Invalid NDVI data received from Google Earth Engine. Field may be outside satellite coverage area.')
      }

      return {
        fieldId: request.fieldId || 'unknown',
        analysisDate: new Date(),
        satelliteData: analysis.satelliteData,
        healthAssessment: analysis.healthAssessment,
        trends: {
          ndviChange: analysis.trends?.ndviChange || 0,
          seasonalTrend: analysis.trends?.seasonalTrend || 'stable',
          historicalPercentile: analysis.trends?.historicalPercentile || 50
        },
        imageMetadata: analysis.imageMetadata || {
          acquisitionDate: new Date(),
          satellite: 'Sentinel-2' as 'Sentinel-2' | 'Landsat-8' | 'Landsat-9',
          cloudCoverage: 100, // High cloud coverage indicates no valid data
          pixelCount: 0,
          resolution: 10
        },
        imageUrls: analysis.imageUrls || {
          trueColor: '',
          falseColor: '',
          ndvi: '',
          evi: ''
        },
        recommendations
      }
      
    } catch (error) {
      console.error('GEE analysis failed', error)
      throw new Error(`Satellite analysis failed: ${error}`)
    }
  }

  /**
   * Generate Earth Engine JavaScript for field analysis
   * This runs on Google's servers, not locally
   */
  private generateEEScript(request: FieldAnalysisRequest): string {
    return `
      // Define field geometry
      var fieldGeometry = ee.Geometry.Polygon(${JSON.stringify(request.geometry.coordinates)});
      
      // Load Sentinel-2 collection
      var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
        .filterDate('${request.startDate}', '${request.endDate}')
        .filterBounds(fieldGeometry)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        .sort('system:time_start', false);
      
      // Function to calculate vegetation indices
      var addIndices = function(image) {
        // NDVI = (NIR - Red) / (NIR + Red)
        var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
        
        // EVI = 2.5 * (NIR - Red) / (NIR + 6 * Red - 7.5 * Blue + 1)
        var evi = image.expression(
          '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
          {
            'NIR': image.select('B8'),
            'RED': image.select('B4'),
            'BLUE': image.select('B2')
          }
        ).rename('EVI');
        
        // SAVI = (NIR - Red) / (NIR + Red + L) * (1 + L), L = 0.5
        var savi = image.expression(
          '((NIR - RED) / (NIR + RED + 0.5)) * 1.5',
          {
            'NIR': image.select('B8'),
            'RED': image.select('B4')
          }
        ).rename('SAVI');
        
        // NDWI = (Green - NIR) / (Green + NIR) - moisture content
        var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
        
        return image.addBands([ndvi, evi, savi, ndwi]);
      };
      
      // Apply indices to collection
      var withIndices = sentinel2.map(addIndices);
      
      // Get the most recent clear image
      var latestImage = withIndices.first();
      
      // Calculate statistics for the field
      var stats = latestImage.select(['NDVI', 'EVI', 'SAVI', 'NDWI']).reduceRegion({
        reducer: ee.Reducer.mean()
          .combine(ee.Reducer.median(), '', true)
          .combine(ee.Reducer.minMax(), '', true)
          .combine(ee.Reducer.stdDev(), '', true)
          .combine(ee.Reducer.percentile([25, 75]), '', true),
        geometry: fieldGeometry,
        scale: 10,
        maxPixels: 1e9
      });
      
      // Get image metadata
      var metadata = {
        acquisitionDate: latestImage.date().format('YYYY-MM-dd'),
        satellite: latestImage.get('SPACECRAFT_NAME'),
        cloudCoverage: latestImage.get('CLOUDY_PIXEL_PERCENTAGE'),
        pixelCount: latestImage.select('NDVI').reduceRegion({
          reducer: ee.Reducer.count(),
          geometry: fieldGeometry, 
          scale: 10,
          maxPixels: 1e9
        }).get('NDVI')
      };
      
      // Calculate historical comparison (same time last year)
      var lastYear = ee.ImageCollection('COPERNICUS/S2_SR')
        .filterDate(ee.Date('${request.startDate}').advance(-1, 'year'), 
                   ee.Date('${request.endDate}').advance(-1, 'year'))
        .filterBounds(fieldGeometry)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
        .map(addIndices);
      
      var lastYearNDVI = lastYear.select('NDVI').mean().reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: fieldGeometry,
        scale: 10,
        maxPixels: 1e9
      });
      
      // Export results
      var results = {
        stats: stats,
        metadata: metadata,
        historicalNDVI: lastYearNDVI.get('NDVI'),
        fieldArea: fieldGeometry.area().divide(10000), // hectares
        processingDate: ee.Date(Date.now()).format('YYYY-MM-dd HH:mm:ss')
      };
      
      // Return as JSON
      print(JSON.stringify(results));
    `
  }

  /**
   * Execute Earth Engine script using REST API
   */
  private async executeEEScript(script: string): Promise<any> {
    try {
      // Get OAuth token
      const token = await this.getGEEAccessToken()
      
      // Execute script
      const response = await fetch(`${this.GEE_API_ENDPOINT}/v1alpha/projects/${this.config.projectId}:run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expression: script,
          returnValue: true
        })
      })

      if (!response.ok) {
        throw new Error(`GEE API error: ${response.statusText}`)
      }

      return await response.json()
      
    } catch (error) {
      console.error('GEE script execution failed', error)
      throw error
    }
  }

  /**
   * Process raw GEE results into farmer-friendly data
   */
  private processEEResults(rawResults: any, request: FieldAnalysisRequest): Partial<GEEAnalysisResult> {
    const stats = rawResults.stats
    
    // Extract NDVI statistics
    const ndviStats = {
      mean: stats.NDVI_mean || 0,
      median: stats.NDVI_median || 0, 
      min: stats.NDVI_min || 0,
      max: stats.NDVI_max || 0,
      std: stats.NDVI_stdDev || 0,
      percentile25: stats.NDVI_p25 || 0,
      percentile75: stats.NDVI_p75 || 0
    }

    // Calculate health score (0-100)
    let healthScore = 0
    if (ndviStats.mean > 0.8) healthScore = 95
    else if (ndviStats.mean > 0.6) healthScore = 85
    else if (ndviStats.mean > 0.4) healthScore = 65
    else if (ndviStats.mean > 0.2) healthScore = 40
    else healthScore = 20

    // Determine stress level
    let stressLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe'
    if (healthScore > 85) stressLevel = 'none'
    else if (healthScore > 70) stressLevel = 'low'
    else if (healthScore > 50) stressLevel = 'moderate'
    else if (healthScore > 30) stressLevel = 'high'
    else stressLevel = 'severe'

    // Calculate trend vs historical
    const historicalNDVI = rawResults.historicalNDVI || ndviStats.mean
    const ndviChange = ndviStats.mean - historicalNDVI

    return {
      fieldId: request.fieldId,
      satelliteData: {
        ndvi: ndviStats,
        evi: {
          mean: stats.EVI_mean || 0,
          median: stats.EVI_median || 0,
          min: stats.EVI_min || 0,
          max: stats.EVI_max || 0,
          std: stats.EVI_stdDev || 0
        },
        savi: {
          mean: stats.SAVI_mean || 0,
          std: stats.SAVI_stdDev || 0
        },
        ndwi: {
          mean: stats.NDWI_mean || 0,
          std: stats.NDWI_stdDev || 0
        }
      },
      imageMetadata: {
        acquisitionDate: new Date(rawResults.metadata?.acquisitionDate || Date.now()),
        satellite: (rawResults.metadata?.satellite || 'Sentinel-2') as 'Sentinel-2' | 'Landsat-8' | 'Landsat-9',
        cloudCoverage: rawResults.metadata?.cloudCoverage || 15,
        pixelCount: rawResults.metadata?.pixelCount || 1000,
        resolution: 10
      },
      healthAssessment: {
        score: healthScore,
        category: this.getHealthCategory(healthScore),
        stressLevel,
        confidence: this.calculateConfidence(rawResults)
      },
      trends: {
        ndviChange,
        seasonalTrend: ndviChange > 0.05 ? 'improving' : ndviChange < -0.05 ? 'declining' : 'stable',
        historicalPercentile: this.calculatePercentile(ndviStats.mean, historicalNDVI)
      }
    }
  }

  /**
   * Generate actionable recommendations for farmers
   */
  private generateFarmerRecommendations(analysis: Partial<GEEAnalysisResult>, request: FieldAnalysisRequest): string[] {
    const recommendations: string[] = []
    const ndvi = analysis.satelliteData?.ndvi
    const health = analysis.healthAssessment
    const trends = analysis.trends

    if (!ndvi || !health) return ['Unable to generate recommendations - insufficient data']

    // Health-based recommendations
    if (health.stressLevel === 'severe') {
      recommendations.push('🚨 Severe stress detected - immediate field inspection recommended')
      recommendations.push('💧 Check irrigation system and soil moisture levels')
    } else if (health.stressLevel === 'high') {
      recommendations.push('⚠️ High stress levels - monitor closely and consider intervention')
    } else if (health.stressLevel === 'low' || health.stressLevel === 'none') {
      recommendations.push('✅ Crop health looks good - maintain current management practices')
    }

    // Variability recommendations
    if (ndvi.std > 0.15) {
      recommendations.push('📊 High variability detected - scout for pest, disease, or nutrient issues')
    }

    // Trend recommendations  
    if (trends?.seasonalTrend === 'declining') {
      recommendations.push('📉 Declining trend detected - investigate potential causes')
    } else if (trends?.seasonalTrend === 'improving') {
      recommendations.push('📈 Positive trend - current practices are working well')
    }

    // Timing recommendations based on NDVI
    if (ndvi.mean > 0.7) {
      recommendations.push('🌱 Peak growing season - optimal time for monitoring and management')
    }

    return recommendations
  }

  private getHealthCategory(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score > 90) return 'excellent'
    if (score > 75) return 'good'
    if (score > 50) return 'fair'
    if (score > 25) return 'poor'
    return 'critical'
  }

  private calculateConfidence(results: any): number {
    // Base confidence on data quality factors
    let confidence = 100
    
    if (results.metadata.cloudCoverage > 10) confidence -= 20
    if (results.metadata.cloudCoverage > 25) confidence -= 30
    
    return Math.max(50, confidence)
  }

  private calculatePercentile(current: number, historical: number): number {
    // Simplified percentile calculation
    if (current > historical * 1.2) return 90
    if (current > historical * 1.1) return 75
    if (current > historical * 0.9) return 50
    if (current > historical * 0.8) return 25
    return 10
  }

  /**
   * Get Google OAuth token for Earth Engine API
   */
  private async getGEEAccessToken(): Promise<string> {
    // Implementation would use JWT + Google OAuth flow
    // This is a simplified version - real implementation needs proper OAuth
    throw new Error('OAuth implementation required - see Google Earth Engine authentication docs')
  }
}

/**
 * Example usage for Cropple.ai
 */
export async function analyzeCroppleField(
  fieldId: string,
  boundaries: number[][][],
  plantingDate?: Date
): Promise<GEEAnalysisResult> {
  // Initialize config only on server-side to prevent client-side environment validation
  let config: any = null;
  if (typeof window === 'undefined') {
    const { getConfig } = require('../config/environment');
    config = getConfig();
  }
  
  if (!config) {
    throw new Error('Google Earth Engine service can only be used server-side');
  }
  
  const geeService = new GoogleEarthEngineService({
    serviceAccountEmail: config.GEE_SERVICE_ACCOUNT_EMAIL!,
    privateKey: config.GEE_PRIVATE_KEY!,
    projectId: config.GEE_PROJECT_ID!
  })

  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

  return await geeService.analyzeFieldHealth({
    fieldId,
    geometry: {
      type: 'Polygon',
      coordinates: boundaries
    },
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    plantingDate: plantingDate?.toISOString().split('T')[0]
  })
}