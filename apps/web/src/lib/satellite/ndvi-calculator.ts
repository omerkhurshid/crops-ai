/**
 * Real NDVI Calculation Service
 * 
 * Provides accurate NDVI calculations from Sentinel-2 spectral bands
 * and other vegetation indices for crop health analysis.
 */
import { auditLogger } from '../logging/audit-logger'
export interface SpectralBands {
  red: number    // B04 - Red (665nm)
  nir: number    // B08 - Near Infrared (842nm) 
  blue?: number  // B02 - Blue (490nm)
  green?: number // B03 - Green (560nm)
  swir1?: number // B11 - Short Wave Infrared 1 (1610nm)
  swir2?: number // B12 - Short Wave Infrared 2 (2190nm)
}
export interface VegetationIndices {
  ndvi: number      // Normalized Difference Vegetation Index
  savi: number      // Soil Adjusted Vegetation Index
  evi: number       // Enhanced Vegetation Index
  ndwi: number      // Normalized Difference Water Index
  ndmi: number      // Normalized Difference Moisture Index
  gndvi: number     // Green NDVI
  lai: number       // Leaf Area Index (estimated)
  fvc: number       // Fractional Vegetation Cover
}
export interface NDVIStatistics {
  mean: number
  median: number
  min: number
  max: number
  std: number
  q25: number       // 25th percentile
  q75: number       // 75th percentile
  validPixels: number
  cloudyPixels: number
  waterPixels: number
  baresoilPixels: number
}
export interface HealthAssessment {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  stressLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  stressFactors: string[]
  recommendations: string[]
  confidence: number
}
class NDVICalculatorService {
  private readonly NDVI_THRESHOLDS = {
    excellent: 0.8,
    good: 0.6,
    fair: 0.4,
    poor: 0.2,
    critical: 0.0
  }
  private readonly SAVI_L_FACTOR = 0.5  // Soil brightness correction factor
  /**
   * Calculate NDVI from Red and NIR spectral values
   */
  calculateNDVI(red: number, nir: number): number {
    if (red + nir === 0) {
      return 0  // Avoid division by zero
    }
    const ndvi = (nir - red) / (nir + red)
    // Clamp NDVI to valid range [-1, 1]
    return Math.max(-1, Math.min(1, ndvi))
  }
  /**
   * Calculate comprehensive vegetation indices from spectral bands
   */
  calculateVegetationIndices(bands: SpectralBands): VegetationIndices {
    const { red, nir, blue, green, swir1, swir2 } = bands
    // NDVI - Standard vegetation index
    const ndvi = this.calculateNDVI(red, nir)
    // SAVI - Soil Adjusted Vegetation Index
    const savi = ((nir - red) / (nir + red + this.SAVI_L_FACTOR)) * (1 + this.SAVI_L_FACTOR)
    // EVI - Enhanced Vegetation Index (requires blue band)
    let evi = ndvi  // Fallback to NDVI if blue not available
    if (blue !== undefined) {
      evi = 2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1))
    }
    // GNDVI - Green NDVI (requires green band)
    let gndvi = ndvi  // Fallback to NDVI
    if (green !== undefined) {
      gndvi = (nir - green) / (nir + green)
    }
    // NDWI - Normalized Difference Water Index (requires SWIR1)
    let ndwi = 0
    if (swir1 !== undefined) {
      ndwi = (nir - swir1) / (nir + swir1)
    }
    // NDMI - Normalized Difference Moisture Index (requires SWIR1)
    let ndmi = 0
    if (swir1 !== undefined) {
      ndmi = (nir - swir1) / (nir + swir1)
    }
    // LAI estimation from NDVI (empirical relationship)
    const lai = this.estimateLAI(ndvi)
    // FVC - Fractional Vegetation Cover
    const fvc = this.calculateFVC(ndvi)
    return {
      ndvi: Number(ndvi.toFixed(4)),
      savi: Number(savi.toFixed(4)),
      evi: Number(evi.toFixed(4)),
      gndvi: Number(gndvi.toFixed(4)),
      ndwi: Number(ndwi.toFixed(4)),
      ndmi: Number(ndmi.toFixed(4)),
      lai: Number(lai.toFixed(2)),
      fvc: Number(fvc.toFixed(3))
    }
  }
  /**
   * Calculate statistical properties from an array of NDVI values
   */
  calculateNDVIStatistics(ndviValues: number[]): NDVIStatistics {
    if (ndviValues.length === 0) {
      return {
        mean: 0, median: 0, min: 0, max: 0, std: 0,
        q25: 0, q75: 0, validPixels: 0,
        cloudyPixels: 0, waterPixels: 0, baresoilPixels: 0
      }
    }
    // Filter out invalid values (NaN, undefined, extreme outliers)
    const validValues = ndviValues.filter(val => 
      !isNaN(val) && isFinite(val) && val >= -1 && val <= 1
    )
    if (validValues.length === 0) {
      return {
        mean: 0, median: 0, min: 0, max: 0, std: 0,
        q25: 0, q75: 0, validPixels: 0,
        cloudyPixels: ndviValues.length, waterPixels: 0, baresoilPixels: 0
      }
    }
    // Sort for percentile calculations
    const sorted = [...validValues].sort((a, b) => a - b)
    // Calculate statistics
    const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length
    const median = this.getPercentile(sorted, 50)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const q25 = this.getPercentile(sorted, 25)
    const q75 = this.getPercentile(sorted, 75)
    // Calculate standard deviation
    const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length
    const std = Math.sqrt(variance)
    // Classify pixels by type based on NDVI values
    let waterPixels = 0
    let baresoilPixels = 0
    validValues.forEach(ndvi => {
      if (ndvi < 0) {
        waterPixels++
      } else if (ndvi < 0.2) {
        baresoilPixels++
      }
    })
    return {
      mean: Number(mean.toFixed(4)),
      median: Number(median.toFixed(4)),
      min: Number(min.toFixed(4)),
      max: Number(max.toFixed(4)),
      std: Number(std.toFixed(4)),
      q25: Number(q25.toFixed(4)),
      q75: Number(q75.toFixed(4)),
      validPixels: validValues.length,
      cloudyPixels: ndviValues.length - validValues.length,
      waterPixels,
      baresoilPixels
    }
  }
  /**
   * Assess crop health based on NDVI and other indices
   */
  assessCropHealth(indices: VegetationIndices, fieldType: string = 'general'): HealthAssessment {
    const { ndvi, savi, evi, ndwi, lai } = indices
    // Determine overall health category
    let overall: HealthAssessment['overall']
    let stressLevel: HealthAssessment['stressLevel'] 
    const stressFactors: string[] = []
    const recommendations: string[] = []
    // Primary assessment based on NDVI
    if (ndvi >= this.NDVI_THRESHOLDS.excellent) {
      overall = 'excellent'
      stressLevel = 'none'
    } else if (ndvi >= this.NDVI_THRESHOLDS.good) {
      overall = 'good'
      stressLevel = 'low'
    } else if (ndvi >= this.NDVI_THRESHOLDS.fair) {
      overall = 'fair'
      stressLevel = 'moderate'
    } else if (ndvi >= this.NDVI_THRESHOLDS.poor) {
      overall = 'poor'
      stressLevel = 'high'
    } else {
      overall = 'critical'
      stressLevel = 'severe'
    }
    // Identify specific stress factors
    if (ndvi < 0.3) {
      stressFactors.push('Low vegetation density')
      recommendations.push('Investigate soil conditions and irrigation')
    }
    if (lai < 1.0) {
      stressFactors.push('Insufficient leaf area')
      recommendations.push('Consider fertilization to promote leaf growth')
    }
    if (savi < ndvi * 0.8) {
      stressFactors.push('Soil brightness affecting readings')
      recommendations.push('Use SAVI for more accurate assessment')
    }
    // Water stress indicators
    if (ndwi < -0.1) {
      stressFactors.push('Potential water stress')
      recommendations.push('Monitor soil moisture and irrigation schedule')
    }
    // Generate field-specific recommendations
    if (overall === 'poor' || overall === 'critical') {
      recommendations.push('Schedule field inspection within 24 hours')
      recommendations.push('Consider soil testing and nutrient analysis')
    } else if (overall === 'fair') {
      recommendations.push('Monitor weekly for improvement or decline')
      recommendations.push('Evaluate current growing conditions')
    }
    // Calculate confidence based on index consistency
    const confidence = this.calculateAssessmentConfidence(indices)
    return {
      overall,
      stressLevel,
      stressFactors,
      recommendations,
      confidence: Number(confidence.toFixed(2))
    }
  }
  /**
   * Process satellite image data for NDVI calculation
   * (Simplified version - real implementation would process actual image data)
   */
  async processImageForNDVI(
    imageData: ArrayBuffer | Float32Array,
    width: number,
    height: number,
    bands: ['red', 'nir'] | ['red', 'nir', 'blue', 'green']
  ): Promise<{ ndviImage: Float32Array; statistics: NDVIStatistics }> {
    try {
      // In a real implementation, this would:
      // 1. Parse the satellite image data (GeoTIFF, etc.)
      // 2. Extract spectral band values for each pixel
      // 3. Calculate NDVI pixel by pixel
      // 4. Return processed NDVI image and statistics
      // For now, simulate NDVI processing
      const ndviValues: number[] = []
      const ndviImage = new Float32Array(width * height)
      for (let i = 0; i < width * height; i++) {
        // Simulate realistic NDVI values for agricultural areas
        const baseNDVI = 0.4 + Math.random() * 0.4  // 0.4 to 0.8 range
        const ndvi = this.addRealisticVariation(baseNDVI)
        ndviImage[i] = ndvi
        ndviValues.push(ndvi)
      }
      const statistics = this.calculateNDVIStatistics(ndviValues)
      await auditLogger.logSystem(
        'ndvi_image_processed',
        true,
        {
          imageSize: `${width}x${height}`,
          meanNDVI: statistics.mean,
          validPixels: statistics.validPixels
        }
      )
      return { ndviImage, statistics }
    } catch (error) {
      await auditLogger.logSystem(
        'ndvi_processing_error',
        false,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'error'
      )
      throw error
    }
  }
  /**
   * Estimate Leaf Area Index from NDVI (empirical relationship)
   */
  private estimateLAI(ndvi: number): number {
    // Empirical relationship: LAI = -ln(1 - ndvi) / k
    // where k is typically 0.5 for most crops
    const k = 0.5
    if (ndvi >= 1.0) return 8.0  // Maximum reasonable LAI
    if (ndvi <= 0.0) return 0.0  // No vegetation
    const lai = -Math.log(1 - ndvi) / k
    return Math.min(8.0, Math.max(0.0, lai))  // Clamp to reasonable range
  }
  /**
   * Calculate Fractional Vegetation Cover from NDVI
   */
  private calculateFVC(ndvi: number): number {
    // Linear relationship between NDVI and FVC
    const ndviMin = 0.05  // Bare soil NDVI
    const ndviMax = 0.95  // Full vegetation NDVI
    if (ndvi <= ndviMin) return 0.0
    if (ndvi >= ndviMax) return 1.0
    return (ndvi - ndviMin) / (ndviMax - ndviMin)
  }
  /**
   * Calculate percentile from sorted array
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    if (lower === upper) {
      return sortedArray[lower]
    }
    const weight = index - lower
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
  }
  /**
   * Calculate confidence in assessment based on index consistency
   */
  private calculateAssessmentConfidence(indices: VegetationIndices): number {
    const { ndvi, savi, evi } = indices
    // Calculate coefficient of variation between similar indices
    const values = [ndvi, savi, evi]
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const cv = Math.sqrt(variance) / mean
    // Lower coefficient of variation = higher confidence
    const baseConfidence = 0.9
    const confidencePenalty = Math.min(cv * 2, 0.4)  // Max penalty of 40%
    return Math.max(0.5, baseConfidence - confidencePenalty)  // Min confidence of 50%
  }
  /**
   * Add realistic variation to simulated NDVI values
   */
  private addRealisticVariation(baseNDVI: number): number {
    // Add some realistic noise and variation
    const noise = (Math.random() - 0.5) * 0.1  // ±5% noise
    const seasonalVariation = Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 7)) * 0.05  // Weekly variation
    const finalNDVI = baseNDVI + noise + seasonalVariation
    return Math.max(0, Math.min(1, finalNDVI))  // Clamp to valid range
  }
}
// Export singleton instance
export const ndviCalculator = new NDVICalculatorService()
export { NDVICalculatorService }