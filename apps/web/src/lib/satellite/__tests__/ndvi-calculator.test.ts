/**
 * Tests for NDVI Calculator Service
 */

import { ndviCalculator } from '../ndvi-calculator'

describe('NDVICalculatorService', () => {
  describe('calculateNDVI', () => {
    test('calculates correct NDVI for healthy vegetation', () => {
      const red = 0.15
      const nir = 0.45
      const expectedNDVI = (nir - red) / (nir + red) // = 0.5
      
      const result = ndviCalculator.calculateNDVI(red, nir)
      
      expect(result).toBeCloseTo(expectedNDVI, 4)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThanOrEqual(1)
    })

    test('calculates correct NDVI for water', () => {
      const red = 0.3
      const nir = 0.1
      const expectedNDVI = (nir - red) / (nir + red) // Negative value for water
      
      const result = ndviCalculator.calculateNDVI(red, nir)
      
      expect(result).toBeCloseTo(expectedNDVI, 4)
      expect(result).toBeLessThan(0)
    })

    test('handles division by zero', () => {
      const red = 0
      const nir = 0
      
      const result = ndviCalculator.calculateNDVI(red, nir)
      
      expect(result).toBe(0)
    })

    test('clamps NDVI to valid range', () => {
      const veryHighNIR = ndviCalculator.calculateNDVI(0.001, 0.999)
      const veryHighRed = ndviCalculator.calculateNDVI(0.999, 0.001)
      
      expect(veryHighNIR).toBeLessThanOrEqual(1)
      expect(veryHighNIR).toBeGreaterThanOrEqual(-1)
      expect(veryHighRed).toBeLessThanOrEqual(1)
      expect(veryHighRed).toBeGreaterThanOrEqual(-1)
    })
  })

  describe('calculateVegetationIndices', () => {
    test('calculates all vegetation indices correctly', () => {
      const bands = {
        red: 0.15,
        nir: 0.45,
        blue: 0.08,
        green: 0.12,
        swir1: 0.25,
        swir2: 0.20
      }
      
      const result = ndviCalculator.calculateVegetationIndices(bands)
      
      expect(result.ndvi).toBeGreaterThan(0)
      expect(result.ndvi).toBeLessThanOrEqual(1)
      expect(result.savi).toBeGreaterThan(0)
      expect(result.evi).toBeGreaterThan(0)
      expect(result.lai).toBeGreaterThan(0)
      expect(result.fvc).toBeGreaterThan(0)
      expect(result.fvc).toBeLessThanOrEqual(1)
      
      // NDVI should be reasonable for healthy vegetation
      expect(result.ndvi).toBeCloseTo(0.5, 1)
    })

    test('works with minimal bands (red and nir only)', () => {
      const bands = {
        red: 0.15,
        nir: 0.45
      }
      
      const result = ndviCalculator.calculateVegetationIndices(bands)
      
      expect(result.ndvi).toBeGreaterThan(0)
      expect(result.savi).toBeGreaterThan(0)
      expect(result.lai).toBeGreaterThan(0)
      
      // EVI should fallback to NDVI when blue band not available
      expect(result.evi).toBeCloseTo(result.ndvi, 2)
    })
  })

  describe('calculateNDVIStatistics', () => {
    test('calculates statistics for valid NDVI array', () => {
      const ndviValues = [0.2, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3]
      
      const result = ndviCalculator.calculateNDVIStatistics(ndviValues)
      
      expect(result.validPixels).toBe(8)
      expect(result.mean).toBeCloseTo(0.55, 2)
      expect(result.min).toBe(0.2)
      expect(result.max).toBe(0.9)
      expect(result.std).toBeGreaterThan(0)
      expect(result.median).toBeCloseTo(0.55, 2)
    })

    test('filters out invalid values', () => {
      const ndviValues = [0.5, NaN, 0.7, -999, 0.8, Infinity, 0.6]
      
      const result = ndviCalculator.calculateNDVIStatistics(ndviValues)
      
      expect(result.validPixels).toBe(4) // Only valid values: 0.5, 0.7, 0.8, 0.6
      expect(result.cloudyPixels).toBe(3) // Invalid values treated as cloudy
    })

    test('handles empty array', () => {
      const result = ndviCalculator.calculateNDVIStatistics([])
      
      expect(result.validPixels).toBe(0)
      expect(result.mean).toBe(0)
      expect(result.std).toBe(0)
    })

    test('classifies pixel types correctly', () => {
      const ndviValues = [-0.1, -0.2, 0.05, 0.1, 0.5, 0.8] // Mix of water, bare soil, vegetation
      
      const result = ndviCalculator.calculateNDVIStatistics(ndviValues)
      
      expect(result.waterPixels).toBe(2) // Negative NDVI values
      expect(result.baresoilPixels).toBe(2) // Low positive NDVI (< 0.2)
      expect(result.validPixels).toBe(6) // All values within valid range
    })
  })

  describe('assessCropHealth', () => {
    test('assesses excellent health correctly', () => {
      const indices = {
        ndvi: 0.85,
        savi: 0.80,
        evi: 0.90,
        gndvi: 0.82,
        ndwi: 0.1,
        ndmi: 0.2,
        lai: 5.0,
        fvc: 0.95
      }
      
      const result = ndviCalculator.assessCropHealth(indices)
      
      expect(result.overall).toBe('excellent')
      expect(result.stressLevel).toBe('none')
      expect(result.confidence).toBeGreaterThan(0.5)
      expect(result.stressFactors).toHaveLength(0)
    })

    test('identifies stress factors correctly', () => {
      const indices = {
        ndvi: 0.25, // Low NDVI
        savi: 0.15,
        evi: 0.30,
        gndvi: 0.20,
        ndwi: -0.15, // Water stress indicator
        ndmi: 0.1,
        lai: 0.8, // Low LAI
        fvc: 0.3
      }
      
      const result = ndviCalculator.assessCropHealth(indices)
      
      expect(result.overall).toBe('poor')
      expect(result.stressLevel).toBe('high')
      expect(result.stressFactors.length).toBeGreaterThan(0)
      expect(result.recommendations.length).toBeGreaterThan(0)
      
      // Should identify specific stress factors
      const stressText = result.stressFactors.join(' ')
      expect(stressText).toMatch(/vegetation|leaf|water/i)
    })

    test('provides appropriate recommendations', () => {
      const indices = {
        ndvi: 0.1, // Critical NDVI
        savi: 0.05,
        evi: 0.15,
        gndvi: 0.08,
        ndwi: 0.0,
        ndmi: 0.05,
        lai: 0.2,
        fvc: 0.1
      }
      
      const result = ndviCalculator.assessCropHealth(indices)
      
      expect(result.overall).toBe('critical')
      expect(result.stressLevel).toBe('severe')
      expect(result.recommendations.length).toBeGreaterThan(0)
      
      const recommendationsText = result.recommendations.join(' ')
      expect(recommendationsText).toMatch(/inspection|soil|nutrient/i)
    })
  })
})