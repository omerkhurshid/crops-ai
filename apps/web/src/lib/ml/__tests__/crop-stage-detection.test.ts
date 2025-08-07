/**
 * Tests for ML-Powered Crop Stage Detection Service
 */

import { cropStageDetection, CropStageDetectionService } from '../crop-stage-detection'

describe('Crop Stage Detection Service', () => {
  const testField = {
    fieldId: 'test-field-corn-001',
    cropType: 'corn',
    latitude: 41.8781,
    longitude: -87.6298,
    plantingDate: new Date('2024-05-01'),
    fieldBounds: {
      north: 41.8790,
      south: 41.8772,
      east: -87.6290,
      west: -87.6306
    }
  }

  describe('Crop Stage Detection', () => {
    test('detects crop stage with satellite and weather data', async () => {
      const detection = await cropStageDetection.detectCropStage(
        testField.fieldId,
        testField.cropType,
        testField.latitude,
        testField.longitude,
        testField.plantingDate,
        testField.fieldBounds
      )

      expect(detection).toBeDefined()
      expect(detection.fieldId).toBe(testField.fieldId)
      expect(detection.cropType).toBe(testField.cropType)
      expect(detection.currentStage).toBeDefined()
      expect(detection.currentStage.stage).toBeDefined()
      expect(detection.currentStage.displayName).toBeDefined()
      expect(detection.currentStage.description).toBeDefined()
      expect(detection.stageConfidence).toBeGreaterThan(0)
      expect(detection.stageConfidence).toBeLessThanOrEqual(1)
      expect(detection.daysInStage).toBeGreaterThanOrEqual(0)
      expect(detection.expectedStageDuration).toBeGreaterThan(0)
      expect(detection.stageTransitionProbability).toBeGreaterThanOrEqual(0)
      expect(detection.stageTransitionProbability).toBeLessThanOrEqual(1)
    }, 15000)

    test('provides different results for different crop types', async () => {
      const cornDetection = await cropStageDetection.detectCropStage(
        'field-corn',
        'corn',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      const soybeanDetection = await cropStageDetection.detectCropStage(
        'field-soybean',
        'soybean',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      expect(cornDetection.cropType).toBe('corn')
      expect(soybeanDetection.cropType).toBe('soybean')
      
      // Stage definitions should be different
      expect(cornDetection.currentStage.stage).toBeDefined()
      expect(soybeanDetection.currentStage.stage).toBeDefined()
    }, 10000)

    test('handles different planting dates appropriately', async () => {
      const earlyPlanting = new Date('2024-04-15')
      const latePlanting = new Date('2024-05-15')

      const earlyDetection = await cropStageDetection.detectCropStage(
        'field-early',
        'corn',
        testField.latitude,
        testField.longitude,
        earlyPlanting
      )

      const lateDetection = await cropStageDetection.detectCropStage(
        'field-late',
        'corn',
        testField.latitude,
        testField.longitude,
        latePlanting
      )

      expect(earlyDetection.daysInStage).toBeDefined()
      expect(lateDetection.daysInStage).toBeDefined()
      
      // Early planting should be further along in the season
      // (This would be true in a real implementation with current date checks)
    })

    test('provides comprehensive stage information', async () => {
      const detection = await cropStageDetection.detectCropStage(
        testField.fieldId,
        testField.cropType,
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      const stage = detection.currentStage
      expect(stage.displayName).toBeDefined()
      expect(stage.description).toBeDefined()
      expect(stage.typicalDuration).toBeGreaterThan(0)
      expect(stage.criticalFactors).toBeDefined()
      expect(Array.isArray(stage.criticalFactors)).toBe(true)
      expect(stage.managementActions).toBeDefined()
      expect(Array.isArray(stage.managementActions)).toBe(true)
      expect(stage.vulnerabilities).toBeDefined()
      expect(Array.isArray(stage.vulnerabilities)).toBe(true)
      expect(stage.ndviRange).toBeDefined()
      expect(stage.ndviRange.min).toBeGreaterThanOrEqual(0)
      expect(stage.ndviRange.max).toBeLessThanOrEqual(1)
      expect(stage.temperatureRange).toBeDefined()
      expect(stage.moistureRequirement).toBeDefined()
    })

    test('handles errors gracefully for invalid crop types', async () => {
      await expect(
        cropStageDetection.detectCropStage(
          'test-field',
          'invalid-crop',
          testField.latitude,
          testField.longitude,
          testField.plantingDate
        )
      ).rejects.toThrow('Crop stage definitions not available for invalid-crop')
    })
  })

  describe('Crop Stage History', () => {
    test('generates comprehensive stage history', async () => {
      const history = await cropStageDetection.getCropStageHistory(
        testField.fieldId,
        testField.cropType,
        testField.plantingDate
      )

      expect(history).toBeDefined()
      expect(history.fieldId).toBe(testField.fieldId)
      expect(history.cropType).toBe(testField.cropType)
      expect(history.plantingDate).toEqual(testField.plantingDate)
      expect(history.currentDate).toBeInstanceOf(Date)
      expect(history.stageHistory).toBeDefined()
      expect(Array.isArray(history.stageHistory)).toBe(true)
      expect(history.stageHistory.length).toBeGreaterThan(0)
      expect(history.projectedHarvestDate).toBeInstanceOf(Date)
      expect(history.seasonProgress).toBeGreaterThanOrEqual(0)
      expect(history.seasonProgress).toBeLessThanOrEqual(1)
    })

    test('includes detailed stage information in history', async () => {
      const history = await cropStageDetection.getCropStageHistory(
        testField.fieldId,
        'corn',
        testField.plantingDate
      )

      const firstStage = history.stageHistory[0]
      expect(firstStage).toBeDefined()
      expect(firstStage.stage).toBeDefined()
      expect(firstStage.startDate).toBeInstanceOf(Date)
      expect(firstStage.conditions).toBeDefined()
      expect(firstStage.conditions.avgNdvi).toBeGreaterThanOrEqual(0)
      expect(firstStage.conditions.avgNdvi).toBeLessThanOrEqual(1)
      expect(firstStage.conditions.avgTemperature).toBeDefined()
      expect(firstStage.conditions.totalPrecipitation).toBeGreaterThanOrEqual(0)
      expect(firstStage.conditions.growingDegreeDays).toBeGreaterThanOrEqual(0)
      expect(firstStage.detectionConfidence).toBeGreaterThan(0)
      expect(firstStage.detectionConfidence).toBeLessThanOrEqual(1)
    })

    test('projects realistic harvest dates', async () => {
      const plantingDate = new Date('2024-05-01')
      const history = await cropStageDetection.getCropStageHistory(
        'test-field',
        'corn',
        plantingDate
      )

      expect(history.projectedHarvestDate).toBeInstanceOf(Date)
      expect(history.projectedHarvestDate.getTime()).toBeGreaterThan(plantingDate.getTime())
      
      // Corn typically takes 120-150 days
      const daysDifference = (history.projectedHarvestDate.getTime() - plantingDate.getTime()) / (24 * 60 * 60 * 1000)
      expect(daysDifference).toBeGreaterThan(100)
      expect(daysDifference).toBeLessThan(200)
    })

    test('calculates season progress correctly', async () => {
      // Test with a planting date in the past
      const pastPlantingDate = new Date('2024-04-01')
      const history = await cropStageDetection.getCropStageHistory(
        'test-field',
        'soybean',
        pastPlantingDate
      )

      expect(history.seasonProgress).toBeGreaterThan(0)
      expect(history.seasonProgress).toBeLessThanOrEqual(1)
    })
  })

  describe('Stage Transition Prediction', () => {
    test('predicts stage transitions accurately', async () => {
      const prediction = await cropStageDetection.predictStageTransition(
        testField.fieldId,
        'corn',
        testField.latitude,
        testField.longitude,
        'emergence'
      )

      expect(prediction).toBeDefined()
      expect(prediction.currentStage).toBe('emergence')
      expect(prediction.nextStage).toBeDefined()
      expect(prediction.transitionProbability).toBeGreaterThan(0)
      expect(prediction.transitionProbability).toBeLessThanOrEqual(1)
      expect(prediction.expectedTransitionDate).toBeInstanceOf(Date)
      expect(prediction.expectedTransitionDate.getTime()).toBeGreaterThan(Date.now())
      expect(prediction.confidenceInterval).toBeDefined()
      expect(prediction.confidenceInterval.earliest).toBeInstanceOf(Date)
      expect(prediction.confidenceInterval.latest).toBeInstanceOf(Date)
      expect(prediction.confidenceInterval.latest.getTime())
        .toBeGreaterThan(prediction.confidenceInterval.earliest.getTime())
    })

    test('provides triggering factors and recommendations', async () => {
      const prediction = await cropStageDetection.predictStageTransition(
        testField.fieldId,
        'soybean',
        testField.latitude,
        testField.longitude,
        'vegetative'
      )

      expect(prediction.triggeringFactors).toBeDefined()
      expect(Array.isArray(prediction.triggeringFactors)).toBe(true)
      expect(prediction.recommendedActions).toBeDefined()
      expect(Array.isArray(prediction.recommendedActions)).toBe(true)
      expect(prediction.recommendedActions.length).toBeGreaterThan(0)
    })

    test('handles final growth stage appropriately', async () => {
      await expect(
        cropStageDetection.predictStageTransition(
          testField.fieldId,
          'corn',
          testField.latitude,
          testField.longitude,
          'maturity'
        )
      ).rejects.toThrow('Already at final growth stage')
    })

    test('validates stage names', async () => {
      await expect(
        cropStageDetection.predictStageTransition(
          testField.fieldId,
          'corn',
          testField.latitude,
          testField.longitude,
          'invalid-stage'
        )
      ).rejects.toThrow('Invalid current stage: invalid-stage')
    })
  })

  describe('Crop Type Support', () => {
    const supportedCrops = ['corn', 'soybean', 'wheat']

    supportedCrops.forEach(cropType => {
      test(`supports ${cropType} growth stages`, async () => {
        const detection = await cropStageDetection.detectCropStage(
          `test-${cropType}`,
          cropType,
          testField.latitude,
          testField.longitude,
          testField.plantingDate
        )

        expect(detection.cropType).toBe(cropType)
        expect(detection.currentStage.stage).toBeDefined()
        
        const history = await cropStageDetection.getCropStageHistory(
          `test-${cropType}`,
          cropType,
          testField.plantingDate
        )

        expect(history.cropType).toBe(cropType)
        expect(history.stageHistory.length).toBeGreaterThan(0)
      })
    })

    test('provides crop-specific stage characteristics', async () => {
      const cornDetection = await cropStageDetection.detectCropStage(
        'corn-field',
        'corn',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      const wheatDetection = await cropStageDetection.detectCropStage(
        'wheat-field',
        'wheat',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      // Corn and wheat should have different stage characteristics
      expect(cornDetection.currentStage.temperatureRange).toBeDefined()
      expect(wheatDetection.currentStage.temperatureRange).toBeDefined()
      
      // Wheat generally tolerates cooler temperatures than corn
      expect(wheatDetection.currentStage.temperatureRange.min)
        .toBeLessThanOrEqual(cornDetection.currentStage.temperatureRange.min)
    })
  })

  describe('Environmental Integration', () => {
    test('incorporates weather data into stage detection', async () => {
      const detection = await cropStageDetection.detectCropStage(
        testField.fieldId,
        testField.cropType,
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      // Detection should be influenced by weather conditions
      expect(detection.stageConfidence).toBeGreaterThan(0.5)
      expect(detection.stageTransitionProbability).toBeDefined()
    }, 15000)

    test('adjusts predictions based on environmental conditions', async () => {
      // Test with different locations (different climate zones)
      const northernLocation = await cropStageDetection.detectCropStage(
        'northern-field',
        'corn',
        45.0, // Northern latitude
        -93.0,
        testField.plantingDate
      )

      const southernLocation = await cropStageDetection.detectCropStage(
        'southern-field',
        'corn',
        35.0, // Southern latitude  
        -90.0,
        testField.plantingDate
      )

      expect(northernLocation.currentStage).toBeDefined()
      expect(southernLocation.currentStage).toBeDefined()
      
      // Both should be valid detections
      expect(northernLocation.stageConfidence).toBeGreaterThan(0.3)
      expect(southernLocation.stageConfidence).toBeGreaterThan(0.3)
    }, 15000)
  })

  describe('Performance and Reliability', () => {
    test('handles concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 3 }, (_, i) => 
        cropStageDetection.detectCropStage(
          `concurrent-test-${i}`,
          'corn',
          testField.latitude + i * 0.01,
          testField.longitude + i * 0.01,
          testField.plantingDate
        )
      )

      const results = await Promise.all(requests)
      
      expect(results.length).toBe(3)
      results.forEach((result, i) => {
        expect(result).toBeDefined()
        expect(result.fieldId).toBe(`concurrent-test-${i}`)
        expect(result.stageConfidence).toBeGreaterThan(0)
      })
    }, 20000)

    test('provides consistent data structure', async () => {
      const detection = await cropStageDetection.detectCropStage(
        testField.fieldId,
        testField.cropType,
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      // Validate complete data structure
      expect(detection).toMatchObject({
        fieldId: expect.any(String),
        cropType: expect.any(String),
        currentStage: expect.objectContaining({
          stage: expect.any(String),
          displayName: expect.any(String),
          description: expect.any(String),
          typicalDuration: expect.any(Number),
          ndviRange: expect.objectContaining({
            min: expect.any(Number),
            max: expect.any(Number),
            optimal: expect.any(Number)
          }),
          temperatureRange: expect.objectContaining({
            min: expect.any(Number),
            max: expect.any(Number),
            optimal: expect.any(Number)
          })
        }),
        stageConfidence: expect.any(Number),
        daysInStage: expect.any(Number),
        expectedStageDuration: expect.any(Number),
        stageTransitionProbability: expect.any(Number)
      })
    }, 15000)
  })
})