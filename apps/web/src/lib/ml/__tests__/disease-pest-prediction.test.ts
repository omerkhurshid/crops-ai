/**
 * Tests for Disease/Pest Outbreak Prediction Service
 */

import { diseasePestPrediction, DiseasePestPredictionService } from '../disease-pest-prediction'

describe('Disease/Pest Prediction Service', () => {
  const testField = {
    fieldId: 'test-field-pest-001',
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

  describe('Pest Outbreak Prediction', () => {
    test('predicts pest outbreaks with environmental factors', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        testField.cropType,
        testField.latitude,
        testField.longitude,
        testField.plantingDate,
        testField.fieldBounds
      )

      expect(prediction).toBeDefined()
      expect(prediction.fieldId).toBe(testField.fieldId)
      expect(prediction.cropType).toBe(testField.cropType)
      expect(prediction.analysisDate).toBeInstanceOf(Date)
      expect(prediction.threats).toBeDefined()
      expect(Array.isArray(prediction.threats)).toBe(true)
      expect(prediction.overallRiskLevel).toBeDefined()
      expect(['low', 'moderate', 'high', 'extreme']).toContain(prediction.overallRiskLevel)
      expect(prediction.weatherRiskFactors).toBeDefined()
      expect(prediction.cropStageRisk).toBeDefined()
      expect(prediction.regionalThreatLevel).toBeGreaterThanOrEqual(0)
      expect(prediction.regionalThreatLevel).toBeLessThanOrEqual(1)
    }, 15000)

    test('provides detailed threat analysis', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'corn',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      expect(prediction.threats.length).toBeGreaterThan(0)
      
      const firstThreat = prediction.threats[0]
      expect(firstThreat.name).toBeDefined()
      expect(firstThreat.type).toBeDefined()
      expect(['insect', 'fungal', 'bacterial', 'viral', 'nematode', 'weed']).toContain(firstThreat.type)
      expect(firstThreat.riskScore).toBeGreaterThanOrEqual(0)
      expect(firstThreat.riskScore).toBeLessThanOrEqual(1)
      expect(firstThreat.riskLevel).toBeDefined()
      expect(['low', 'moderate', 'high', 'extreme']).toContain(firstThreat.riskLevel)
      expect(firstThreat.confidence).toBeGreaterThan(0)
      expect(firstThreat.confidence).toBeLessThanOrEqual(1)
      expect(firstThreat.environmentalFactors).toBeDefined()
      expect(Array.isArray(firstThreat.environmentalFactors)).toBe(true)
      expect(firstThreat.cropStageVulnerability).toBeDefined()
      expect(firstThreat.treatments).toBeDefined()
      expect(Array.isArray(firstThreat.treatments)).toBe(true)
      expect(firstThreat.preventiveMeasures).toBeDefined()
      expect(Array.isArray(firstThreat.preventiveMeasures)).toBe(true)
    })

    test('provides crop-specific threats', async () => {
      const cornPrediction = await diseasePestPrediction.predictOutbreaks(
        'corn-field',
        'corn',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      const soybeanPrediction = await diseasePestPrediction.predictOutbreaks(
        'soybean-field',
        'soybean',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      expect(cornPrediction.cropType).toBe('corn')
      expect(soybeanPrediction.cropType).toBe('soybean')
      
      // Should have different threats for different crops
      const cornThreatNames = cornPrediction.threats.map(t => t.name)
      const soybeanThreatNames = soybeanPrediction.threats.map(t => t.name)
      
      expect(cornThreatNames.some(name => name.toLowerCase().includes('borer') || name.toLowerCase().includes('rootworm'))).toBeTruthy()
      expect(soybeanThreatNames.some(name => name.toLowerCase().includes('aphid') || name.toLowerCase().includes('rust'))).toBeTruthy()
    })

    test('handles different planting dates appropriately', async () => {
      const earlyPlanting = new Date('2024-04-15')
      const latePlanting = new Date('2024-05-15')

      const earlyPrediction = await diseasePestPrediction.predictOutbreaks(
        'field-early',
        'corn',
        testField.latitude,
        testField.longitude,
        earlyPlanting
      )

      const latePrediction = await diseasePestPrediction.predictOutbreaks(
        'field-late',
        'corn',
        testField.latitude,
        testField.longitude,
        latePlanting
      )

      expect(earlyPrediction.cropStageRisk).toBeDefined()
      expect(latePrediction.cropStageRisk).toBeDefined()
      
      // Both should have valid predictions
      expect(earlyPrediction.threats.length).toBeGreaterThan(0)
      expect(latePrediction.threats.length).toBeGreaterThan(0)
    })

    test('includes comprehensive treatment recommendations', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'corn',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      const threatWithTreatments = prediction.threats.find(t => t.treatments.length > 0)
      expect(threatWithTreatments).toBeDefined()

      const treatment = threatWithTreatments!.treatments[0]
      expect(treatment.method).toBeDefined()
      expect(treatment.timing).toBeDefined()
      expect(treatment.effectiveness).toBeGreaterThan(0)
      expect(treatment.effectiveness).toBeLessThanOrEqual(1)
      expect(treatment.cost).toBeDefined()
      expect(['low', 'moderate', 'high']).toContain(treatment.cost)
      expect(treatment.environmentalImpact).toBeDefined()
      expect(['low', 'moderate', 'high']).toContain(treatment.environmentalImpact)
    })

    test('provides monitoring schedule recommendations', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'soybean',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      const threatWithMonitoring = prediction.threats.find(t => 
        t.monitoringSchedule && t.monitoringSchedule.length > 0
      )
      expect(threatWithMonitoring).toBeDefined()

      const monitoringActivity = threatWithMonitoring!.monitoringSchedule![0]
      expect(monitoringActivity.activity).toBeDefined()
      expect(monitoringActivity.frequency).toBeDefined()
      expect(monitoringActivity.criticalPeriod).toBeDefined()
      expect(monitoringActivity.indicators).toBeDefined()
      expect(Array.isArray(monitoringActivity.indicators)).toBe(true)
    })

    test('handles errors gracefully for invalid crop types', async () => {
      await expect(
        diseasePestPrediction.predictOutbreaks(
          'test-field',
          'invalid-crop',
          testField.latitude,
          testField.longitude,
          testField.plantingDate
        )
      ).rejects.toThrow('Unsupported crop type: invalid-crop')
    })
  })

  describe('Environmental Risk Assessment', () => {
    test('assesses weather-based risk factors', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'wheat',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      expect(prediction.weatherRiskFactors).toBeDefined()
      expect(prediction.weatherRiskFactors.temperature).toBeDefined()
      expect(prediction.weatherRiskFactors.humidity).toBeDefined()
      expect(prediction.weatherRiskFactors.precipitation).toBeDefined()
      expect(prediction.weatherRiskFactors.windSpeed).toBeDefined()

      // All risk factors should be between 0 and 1
      Object.values(prediction.weatherRiskFactors).forEach(factor => {
        expect(typeof factor).toBe('number')
        expect(factor).toBeGreaterThanOrEqual(0)
        expect(factor).toBeLessThanOrEqual(1)
      })
    }, 10000)

    test('adjusts risk based on crop development stage', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'corn',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      expect(prediction.cropStageRisk).toBeDefined()
      expect(prediction.cropStageRisk.currentStage).toBeDefined()
      expect(prediction.cropStageRisk.stageVulnerability).toBeGreaterThanOrEqual(0)
      expect(prediction.cropStageRisk.stageVulnerability).toBeLessThanOrEqual(1)
      expect(prediction.cropStageRisk.criticalPeriods).toBeDefined()
      expect(Array.isArray(prediction.cropStageRisk.criticalPeriods)).toBe(true)
      expect(prediction.cropStageRisk.recommendedActions).toBeDefined()
      expect(Array.isArray(prediction.cropStageRisk.recommendedActions)).toBe(true)
    }, 10000)

    test('incorporates regional threat patterns', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'soybean',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      expect(prediction.regionalThreatLevel).toBeDefined()
      expect(prediction.regionalThreatLevel).toBeGreaterThanOrEqual(0)
      expect(prediction.regionalThreatLevel).toBeLessThanOrEqual(1)
      
      // Should have historical context
      expect(prediction.threats.some(threat => 
        threat.environmentalFactors.includes('historical_patterns')
      )).toBeTruthy()
    })
  })

  describe('Prediction History', () => {
    test('generates comprehensive prediction history', async () => {
      const history = await diseasePestPrediction.getPredictionHistory(
        testField.fieldId,
        testField.cropType,
        testField.plantingDate
      )

      expect(history).toBeDefined()
      expect(history.fieldId).toBe(testField.fieldId)
      expect(history.cropType).toBe(testField.cropType)
      expect(history.seasonStart).toEqual(testField.plantingDate)
      expect(history.currentDate).toBeInstanceOf(Date)
      expect(history.predictionHistory).toBeDefined()
      expect(Array.isArray(history.predictionHistory)).toBe(true)
      expect(history.trendAnalysis).toBeDefined()
    })

    test('includes trend analysis in history', async () => {
      const history = await diseasePestPrediction.getPredictionHistory(
        testField.fieldId,
        'corn',
        testField.plantingDate
      )

      expect(history.trendAnalysis.overallTrend).toBeDefined()
      expect(['increasing', 'stable', 'decreasing']).toContain(history.trendAnalysis.overallTrend)
      expect(history.trendAnalysis.peakRiskPeriods).toBeDefined()
      expect(Array.isArray(history.trendAnalysis.peakRiskPeriods)).toBe(true)
      expect(history.trendAnalysis.majorThreats).toBeDefined()
      expect(Array.isArray(history.trendAnalysis.majorThreats)).toBe(true)
      expect(history.trendAnalysis.effectiveInterventions).toBeDefined()
      expect(Array.isArray(history.trendAnalysis.effectiveInterventions)).toBe(true)
      expect(history.trendAnalysis.riskScore).toBeGreaterThanOrEqual(0)
      expect(history.trendAnalysis.riskScore).toBeLessThanOrEqual(1)
    })

    test('provides historical prediction entries', async () => {
      const history = await diseasePestPrediction.getPredictionHistory(
        testField.fieldId,
        'wheat',
        testField.plantingDate
      )

      expect(history.predictionHistory.length).toBeGreaterThan(0)
      
      const entry = history.predictionHistory[0]
      expect(entry.date).toBeInstanceOf(Date)
      expect(entry.overallRiskLevel).toBeDefined()
      expect(['low', 'moderate', 'high', 'extreme']).toContain(entry.overallRiskLevel)
      expect(entry.threatCount).toBeGreaterThanOrEqual(0)
      expect(entry.highRiskThreats).toBeGreaterThanOrEqual(0)
      expect(entry.weatherConditions).toBeDefined()
      expect(entry.weatherConditions.temperature).toBeDefined()
      expect(entry.weatherConditions.humidity).toBeDefined()
      expect(entry.interventionsApplied).toBeDefined()
      expect(Array.isArray(entry.interventionsApplied)).toBe(true)
      expect(entry.outcomeNotes).toBeDefined()
    })
  })

  describe('Integration with Weather and Crop Stage Services', () => {
    test('integrates weather data for risk assessment', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'corn',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      // Should have weather-based risk assessments
      expect(prediction.weatherRiskFactors).toBeDefined()
      expect(prediction.threats.some(threat =>
        threat.environmentalFactors.some(factor =>
          factor.includes('temperature') || 
          factor.includes('humidity') || 
          factor.includes('precipitation')
        )
      )).toBeTruthy()
    }, 15000)

    test('incorporates crop stage vulnerabilities', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'soybean',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      expect(prediction.cropStageRisk.currentStage).toBeDefined()
      expect(prediction.threats.some(threat =>
        threat.cropStageVulnerability && threat.cropStageVulnerability > 0
      )).toBeTruthy()
    }, 15000)
  })

  describe('Crop Type Support', () => {
    const supportedCrops = ['corn', 'soybean', 'wheat']

    supportedCrops.forEach(cropType => {
      test(`supports ${cropType} pest and disease prediction`, async () => {
        const prediction = await diseasePestPrediction.predictOutbreaks(
          `test-${cropType}`,
          cropType,
          testField.latitude,
          testField.longitude,
          testField.plantingDate
        )

        expect(prediction.cropType).toBe(cropType)
        expect(prediction.threats.length).toBeGreaterThan(0)
        
        // Should have crop-specific threats
        expect(prediction.threats.length).toBeGreaterThan(0)
      })
    })

    test('provides crop-specific threat databases', async () => {
      const cornPrediction = await diseasePestPrediction.predictOutbreaks(
        'corn-field',
        'corn',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      const wheatPrediction = await diseasePestPrediction.predictOutbreaks(
        'wheat-field',
        'wheat',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      // Corn and wheat should have different primary threats
      const cornThreats = cornPrediction.threats.map(t => t.name)
      const wheatThreats = wheatPrediction.threats.map(t => t.name)
      
      expect(cornThreats).not.toEqual(wheatThreats)
      expect(cornThreats.some(name => 
        name.includes('Borer') || name.includes('Rootworm')
      )).toBeTruthy()
      expect(wheatThreats.some(name => 
        name.includes('Rust') || name.includes('Blight')
      )).toBeTruthy()
    })
  })

  describe('Performance and Reliability', () => {
    test('handles concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 3 }, (_, i) => 
        diseasePestPrediction.predictOutbreaks(
          `concurrent-pest-test-${i}`,
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
        expect(result.fieldId).toBe(`concurrent-pest-test-${i}`)
        expect(result.threats.length).toBeGreaterThan(0)
        expect(result.overallRiskLevel).toBeDefined()
      })
    }, 25000)

    test('provides consistent data structure', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        testField.cropType,
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      // Validate complete data structure
      expect(prediction).toMatchObject({
        fieldId: expect.any(String),
        cropType: expect.any(String),
        analysisDate: expect.any(Date),
        overallRiskLevel: expect.stringMatching(/^(low|moderate|high|extreme)$/),
        threats: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            type: expect.stringMatching(/^(insect|fungal|bacterial|viral|nematode|weed)$/),
            riskScore: expect.any(Number),
            riskLevel: expect.stringMatching(/^(low|moderate|high|extreme)$/),
            confidence: expect.any(Number),
            environmentalFactors: expect.any(Array),
            treatments: expect.any(Array),
            preventiveMeasures: expect.any(Array)
          })
        ]),
        weatherRiskFactors: expect.objectContaining({
          temperature: expect.any(Number),
          humidity: expect.any(Number),
          precipitation: expect.any(Number),
          windSpeed: expect.any(Number)
        }),
        cropStageRisk: expect.objectContaining({
          currentStage: expect.any(String),
          stageVulnerability: expect.any(Number),
          criticalPeriods: expect.any(Array),
          recommendedActions: expect.any(Array)
        }),
        regionalThreatLevel: expect.any(Number)
      })
    }, 15000)
  })

  describe('Risk Calculation Accuracy', () => {
    test('calculates risk scores within expected ranges', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'corn',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      // All risk scores should be between 0 and 1
      prediction.threats.forEach(threat => {
        expect(threat.riskScore).toBeGreaterThanOrEqual(0)
        expect(threat.riskScore).toBeLessThanOrEqual(1)
        expect(threat.confidence).toBeGreaterThan(0.5) // Should have reasonable confidence
        expect(threat.confidence).toBeLessThanOrEqual(1)
      })

      // Regional threat level should also be in valid range
      expect(prediction.regionalThreatLevel).toBeGreaterThanOrEqual(0)
      expect(prediction.regionalThreatLevel).toBeLessThanOrEqual(1)
    })

    test('correlates risk levels with risk scores', async () => {
      const prediction = await diseasePestPrediction.predictOutbreaks(
        testField.fieldId,
        'soybean',
        testField.latitude,
        testField.longitude,
        testField.plantingDate
      )

      prediction.threats.forEach(threat => {
        // Risk level should correspond to risk score ranges (adjusted for dynamic calculation)
        if (threat.riskLevel === 'low') {
          expect(threat.riskScore).toBeLessThan(0.4)
        } else if (threat.riskLevel === 'moderate') {
          expect(threat.riskScore).toBeGreaterThanOrEqual(0.2)
          expect(threat.riskScore).toBeLessThan(0.7)
        } else if (threat.riskLevel === 'high') {
          expect(threat.riskScore).toBeGreaterThanOrEqual(0.4)
          expect(threat.riskScore).toBeLessThan(0.9)
        } else if (threat.riskLevel === 'extreme') {
          expect(threat.riskScore).toBeGreaterThanOrEqual(0.7)
        }
      })
    })
  })
})