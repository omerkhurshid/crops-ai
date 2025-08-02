/**
 * @jest-environment node
 */
import { yieldPrediction } from '../../../lib/ml/yield-prediction'

// Mock the dependencies
jest.mock('../../../lib/weather/historical', () => ({
  historicalWeatherService: {
    getHistoricalAnalysis: jest.fn().mockResolvedValue({
      averageTemp: 22,
      totalRainfall: 450,
      growingDegreeDays: 1200,
      extremes: {
        maxTemp: 35,
        minTemp: 5,
        maxRainfall: 25
      }
    })
  }
}))

jest.mock('../../../lib/satellite/ndvi-analysis', () => ({
  ndviAnalyzer: {
    getFieldNDVIHistory: jest.fn().mockResolvedValue({
      average: 0.75,
      trend: 'increasing',
      healthScore: 85,
      timeSeriesData: [
        { date: new Date('2025-06-01'), ndvi: 0.65 },
        { date: new Date('2025-07-01'), ndvi: 0.75 },
        { date: new Date('2025-08-01'), ndvi: 0.80 }
      ]
    })
  }
}))

describe('Yield Prediction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('predictYield', () => {
    it('should generate yield prediction for valid field data', async () => {
      const predictionInput = {
        fieldId: 'field-123',
        cropType: 'corn',
        plantingDate: new Date('2025-04-15'),
        currentStage: 'vegetative' as const,
        fieldSize: 100,
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        soilData: {
          type: 'loam',
          ph: 6.5,
          organicMatter: 3.2,
          nitrogen: 45,
          phosphorus: 22,
          potassium: 180
        }
      }

      const result = await yieldPrediction.predictYield(predictionInput)

      expect(result).toHaveProperty('fieldId', 'field-123')
      expect(result).toHaveProperty('cropType', 'corn')
      expect(result).toHaveProperty('predictedYield')
      expect(result.predictedYield).toHaveProperty('value')
      expect(result.predictedYield).toHaveProperty('unit')
      expect(result.predictedYield).toHaveProperty('confidence')
      expect(result).toHaveProperty('factors')
      expect(result.factors).toHaveProperty('weather')
      expect(result.factors).toHaveProperty('soil')
      expect(result.factors).toHaveProperty('satellite')
      expect(result.factors).toHaveProperty('management')
    })

    it('should handle different crop types', async () => {
      const wheatInput = {
        fieldId: 'field-456',
        cropType: 'wheat',
        plantingDate: new Date('2025-03-01'),
        currentStage: 'flowering' as const,
        fieldSize: 50,
        location: {
          latitude: 41.8781,
          longitude: -87.6298
        },
        soilData: {
          type: 'clay',
          ph: 7.0,
          organicMatter: 2.8,
          nitrogen: 38,
          phosphorus: 18,
          potassium: 165
        }
      }

      const result = await yieldPrediction.predictYield(wheatInput)

      expect(result.cropType).toBe('wheat')
      expect(result.predictedYield.unit).toBe('bushels/acre')
    })

    it('should calculate realistic yield ranges based on crop type', async () => {
      const soyInput = {
        fieldId: 'field-789',
        cropType: 'soy',
        plantingDate: new Date('2025-05-01'),
        currentStage: 'reproductive' as const,
        fieldSize: 75,
        location: {
          latitude: 39.7817,
          longitude: -89.6501
        },
        soilData: {
          type: 'silt_loam',
          ph: 6.8,
          organicMatter: 4.1,
          nitrogen: 25,
          phosphorus: 28,
          potassium: 195
        }
      }

      const result = await yieldPrediction.predictYield(soyInput)

      expect(result.cropType).toBe('soy')
      expect(result.predictedYield.value).toBeGreaterThan(0)
      expect(result.predictedYield.value).toBeLessThan(100) // Realistic soy yield range
      expect(result.predictedYield.confidence).toBeGreaterThan(0)
      expect(result.predictedYield.confidence).toBeLessThanOrEqual(1)
    })
  })

  describe('trainModel', () => {
    it('should train model with training data', async () => {
      const trainingData = [
        {
          id: '1',
          farmId: 'farm-1',
          fieldId: 'field-1',
          season: '2024',
          cropType: 'corn',
          features: {
            weather: {
              temperature: 22,
              rainfall: 450,
              humidity: 65,
              windSpeed: 10,
              growingDegreeDays: 1200
            },
            soil: {
              ph: 6.5,
              organicMatter: 3.2,
              nitrogen: 45,
              phosphorus: 22,
              potassium: 180,
              moisture: 0.35
            },
            satellite: {
              ndvi: 0.75,
              healthScore: 85,
              stressLevel: 0.15
            },
            management: {
              irrigationFrequency: 2,
              fertilizerApplications: 3,
              pestApplications: 1,
              plantingDensity: 32000
            }
          },
          target: {
            yield: 165.5,
            quality: {
              grade: 'A',
              moistureContent: 14.5,
              proteinContent: 8.2,
              testWeight: 58.5
            },
            profitability: 850,
            sustainability: {
              carbonFootprint: 120,
              waterUsage: 650,
              soilHealth: 75
            }
          },
          metadata: {
            harvestDate: new Date('2024-09-15'),
            weatherStation: 'KORD',
            dataQuality: 'high'
          }
        }
      ]

      const result = await yieldPrediction.trainModel('corn', trainingData)

      expect(result).toHaveProperty('modelId')
      expect(result).toHaveProperty('cropType', 'corn')
      expect(result).toHaveProperty('performance')
      expect(result.performance).toHaveProperty('accuracy')
      expect(result.performance).toHaveProperty('rmse')
      expect(result).toHaveProperty('trainingSize', 1)
      expect(result).toHaveProperty('lastTrained')
    })
  })

  describe('getModelPerformance', () => {
    it('should return model performance metrics', async () => {
      const performance = await yieldPrediction.getModelPerformance('corn')

      expect(performance).toHaveProperty('accuracy')
      expect(performance).toHaveProperty('rmse')
      expect(performance).toHaveProperty('mae')
      expect(performance).toHaveProperty('r2Score')
      expect(performance.accuracy).toBeGreaterThan(0)
      expect(performance.accuracy).toBeLessThanOrEqual(1)
    })
  })

  describe('getAvailableModels', () => {
    it('should return list of available crop models', async () => {
      const models = await yieldPrediction.getAvailableModels()

      expect(Array.isArray(models)).toBe(true)
      expect(models.length).toBeGreaterThan(0)
      
      models.forEach(model => {
        expect(model).toHaveProperty('cropType')
        expect(model).toHaveProperty('modelId')
        expect(model).toHaveProperty('performance')
        expect(model).toHaveProperty('lastTrained')
        expect(model).toHaveProperty('trainingSize')
      })
    })
  })
})