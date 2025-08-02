/**
 * Data Factory for Test Data Generation
 * Provides utilities to create realistic test data
 */

import { faker } from '@faker-js/faker'
import type { User, Farm, Field, WeatherData, SatelliteImage, MLPrediction } from '@prisma/client'

// Install faker if not already installed
// npm install --save-dev @faker-js/faker

/**
 * Base factory class with common functionality
 */
abstract class BaseFactory<T> {
  protected sequence = 0
  
  abstract build(overrides?: Partial<T>): T
  
  buildMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.build(overrides))
  }
  
  reset(): void {
    this.sequence = 0
  }
}

/**
 * User factory
 */
export class UserFactory extends BaseFactory<User> {
  build(overrides?: Partial<User>): User {
    this.sequence++
    
    return {
      id: `user-${this.sequence}`,
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: '$2a$10$' + faker.string.alphanumeric(22), // Mock bcrypt hash
      role: faker.helpers.arrayElement(['FARM_OWNER', 'FARM_MANAGER', 'FIELD_OPERATOR', 'VIEWER']),
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    } as User
  }
  
  buildFarmOwner(overrides?: Partial<User>): User {
    return this.build({ role: 'FARM_OWNER', ...overrides })
  }
  
  buildAdmin(overrides?: Partial<User>): User {
    return this.build({ role: 'ADMIN', ...overrides })
  }
}

/**
 * Farm factory
 */
export class FarmFactory extends BaseFactory<Farm> {
  build(overrides?: Partial<Farm>): Farm {
    this.sequence++
    
    const location = faker.helpers.arrayElement([
      { state: 'Iowa', lat: 41.878, lon: -93.0977 },
      { state: 'Nebraska', lat: 41.4925, lon: -99.9018 },
      { state: 'Kansas', lat: 39.0119, lon: -98.4842 },
      { state: 'Illinois', lat: 40.6331, lon: -89.3985 },
      { state: 'Indiana', lat: 40.2672, lon: -86.1349 },
    ])
    
    return {
      id: `farm-${this.sequence}`,
      name: faker.company.name() + ' Farm',
      location: `${faker.location.city()}, ${location.state}, USA`,
      latitude: location.lat + faker.number.float({ min: -0.5, max: 0.5 }),
      longitude: location.lon + faker.number.float({ min: -0.5, max: 0.5 }),
      size: faker.number.int({ min: 50, max: 1000 }),
      ownerId: `user-${faker.number.int({ min: 1, max: 10 })}`,
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    } as Farm
  }
  
  buildLargeFarm(overrides?: Partial<Farm>): Farm {
    return this.build({
      size: faker.number.int({ min: 500, max: 2000 }),
      ...overrides,
    })
  }
  
  buildSmallFarm(overrides?: Partial<Farm>): Farm {
    return this.build({
      size: faker.number.int({ min: 10, max: 100 }),
      ...overrides,
    })
  }
}

/**
 * Field factory
 */
export class FieldFactory extends BaseFactory<Field> {
  build(overrides?: Partial<Field>): Field {
    this.sequence++
    
    const cropType = faker.helpers.arrayElement(['corn', 'soybeans', 'wheat', 'cotton', 'rice'])
    const plantingDate = faker.date.between({ 
      from: new Date(new Date().getFullYear(), 2, 1), // March
      to: new Date(new Date().getFullYear(), 4, 30)  // May
    })
    
    // Calculate expected harvest date based on crop type
    const growthPeriod = {
      corn: 120,
      soybeans: 100,
      wheat: 110,
      cotton: 140,
      rice: 130,
    }[cropType] || 120
    
    const expectedHarvestDate = new Date(plantingDate)
    expectedHarvestDate.setDate(expectedHarvestDate.getDate() + growthPeriod)
    
    // Generate a simple rectangular boundary
    const baseLat = faker.number.float({ min: 40, max: 42 })
    const baseLon = faker.number.float({ min: -95, max: -93 })
    const width = faker.number.float({ min: 0.005, max: 0.02 })
    const height = faker.number.float({ min: 0.005, max: 0.02 })
    
    return {
      id: `field-${this.sequence}`,
      name: faker.helpers.arrayElement(['North', 'South', 'East', 'West']) + ' Field ' + this.sequence,
      farmId: `farm-${faker.number.int({ min: 1, max: 10 })}`,
      cropType,
      size: faker.number.int({ min: 10, max: 200 }),
      plantingDate,
      expectedHarvestDate,
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [baseLon, baseLat],
          [baseLon + width, baseLat],
          [baseLon + width, baseLat + height],
          [baseLon, baseLat + height],
          [baseLon, baseLat],
        ]],
      },
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    } as Field
  }
  
  buildCornField(overrides?: Partial<Field>): Field {
    return this.build({ cropType: 'corn', ...overrides })
  }
  
  buildSoybeanField(overrides?: Partial<Field>): Field {
    return this.build({ cropType: 'soybeans', ...overrides })
  }
}

/**
 * Weather data factory
 */
export class WeatherDataFactory extends BaseFactory<WeatherData> {
  build(overrides?: Partial<WeatherData>): WeatherData {
    this.sequence++
    
    const season = faker.helpers.arrayElement(['spring', 'summer', 'fall', 'winter'])
    const baseTemp = {
      spring: 60,
      summer: 80,
      fall: 55,
      winter: 35,
    }[season]
    
    return {
      id: `weather-${this.sequence}`,
      fieldId: `field-${faker.number.int({ min: 1, max: 10 })}`,
      temperature: baseTemp + faker.number.float({ min: -15, max: 15 }),
      humidity: faker.number.float({ min: 30, max: 90 }),
      rainfall: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
      windSpeed: faker.number.float({ min: 0, max: 30 }),
      windDirection: faker.number.int({ min: 0, max: 359 }),
      pressure: faker.number.float({ min: 29.5, max: 30.5 }),
      condition: faker.helpers.arrayElement(['sunny', 'partly_cloudy', 'cloudy', 'rainy', 'stormy']),
      timestamp: faker.date.recent({ days: 7 }),
      createdAt: new Date(),
      ...overrides,
    } as WeatherData
  }
  
  buildSunnyDay(overrides?: Partial<WeatherData>): WeatherData {
    return this.build({
      temperature: faker.number.float({ min: 70, max: 85 }),
      humidity: faker.number.float({ min: 40, max: 60 }),
      rainfall: 0,
      condition: 'sunny',
      ...overrides,
    })
  }
  
  buildRainyDay(overrides?: Partial<WeatherData>): WeatherData {
    return this.build({
      temperature: faker.number.float({ min: 55, max: 70 }),
      humidity: faker.number.float({ min: 70, max: 95 }),
      rainfall: faker.number.float({ min: 0.5, max: 3 }),
      condition: 'rainy',
      ...overrides,
    })
  }
  
  buildTimeSeries(fieldId: string, days: number): WeatherData[] {
    const data: WeatherData[] = []
    const now = new Date()
    
    for (let i = 0; i < days * 24; i++) { // Hourly data
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hour = timestamp.getHours()
      
      // Simulate diurnal temperature variation
      const baseTemp = 70
      const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 15
      
      data.push(this.build({
        fieldId,
        timestamp,
        temperature: baseTemp + tempVariation + faker.number.float({ min: -5, max: 5 }),
        humidity: 60 + Math.cos(hour * Math.PI / 12) * 20,
      }))
    }
    
    return data
  }
}

/**
 * Satellite image factory
 */
export class SatelliteImageFactory extends BaseFactory<SatelliteImage> {
  build(overrides?: Partial<SatelliteImage>): SatelliteImage {
    this.sequence++
    
    return {
      id: `satellite-${this.sequence}`,
      fieldId: `field-${faker.number.int({ min: 1, max: 10 })}`,
      imageUrl: faker.image.url(),
      thumbnailUrl: faker.image.url(),
      captureDate: faker.date.recent({ days: 30 }),
      satellite: faker.helpers.arrayElement(['sentinel-2a', 'sentinel-2b', 'landsat-8', 'landsat-9']),
      cloudCover: faker.number.float({ min: 0, max: 100 }),
      resolution: faker.helpers.arrayElement([10, 20, 30]), // meters
      bands: ['B02', 'B03', 'B04', 'B08'], // Blue, Green, Red, NIR
      ndvi: faker.number.float({ min: -0.2, max: 0.9 }),
      processingStatus: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'failed']),
      metadata: {
        processingTime: faker.number.int({ min: 100, max: 5000 }),
        algorithm: 'ndvi-v2',
        qualityScore: faker.number.float({ min: 0.7, max: 1 }),
      },
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    } as SatelliteImage
  }
  
  buildHealthyVegetation(overrides?: Partial<SatelliteImage>): SatelliteImage {
    return this.build({
      ndvi: faker.number.float({ min: 0.6, max: 0.9 }),
      cloudCover: faker.number.float({ min: 0, max: 20 }),
      processingStatus: 'completed',
      ...overrides,
    })
  }
  
  buildStressedVegetation(overrides?: Partial<SatelliteImage>): SatelliteImage {
    return this.build({
      ndvi: faker.number.float({ min: 0.1, max: 0.4 }),
      cloudCover: faker.number.float({ min: 0, max: 30 }),
      processingStatus: 'completed',
      ...overrides,
    })
  }
}

/**
 * ML Prediction factory
 */
export class MLPredictionFactory extends BaseFactory<MLPrediction> {
  build(overrides?: Partial<MLPrediction>): MLPrediction {
    this.sequence++
    
    const predictionType = faker.helpers.arrayElement(['yield', 'disease', 'irrigation', 'fertilizer'])
    
    return {
      id: `prediction-${this.sequence}`,
      fieldId: `field-${faker.number.int({ min: 1, max: 10 })}`,
      modelId: `${predictionType}-model-v2`,
      predictionType,
      value: this.generatePredictionValue(predictionType),
      confidence: faker.number.float({ min: 0.7, max: 0.95 }),
      metadata: this.generateMetadata(predictionType),
      createdAt: faker.date.recent({ days: 7 }),
      ...overrides,
    } as MLPrediction
  }
  
  private generatePredictionValue(type: string): number {
    switch (type) {
      case 'yield':
        return faker.number.float({ min: 150, max: 220 }) // bushels/acre
      case 'disease':
        return faker.number.float({ min: 0, max: 1 }) // probability
      case 'irrigation':
        return faker.number.float({ min: 0, max: 10 }) // inches needed
      case 'fertilizer':
        return faker.number.float({ min: 0, max: 200 }) // lbs/acre
      default:
        return faker.number.float({ min: 0, max: 100 })
    }
  }
  
  private generateMetadata(type: string): any {
    const base = {
      modelVersion: '2.1.0',
      trainingDate: faker.date.past().toISOString(),
      features: faker.number.int({ min: 20, max: 50 }),
    }
    
    switch (type) {
      case 'yield':
        return {
          ...base,
          factors: {
            weather: faker.number.float({ min: 0.2, max: 0.4 }),
            soil: faker.number.float({ min: 0.2, max: 0.3 }),
            management: faker.number.float({ min: 0.2, max: 0.3 }),
            historical: faker.number.float({ min: 0.1, max: 0.2 }),
          },
        }
      case 'disease':
        return {
          ...base,
          diseaseType: faker.helpers.arrayElement(['rust', 'blight', 'mildew']),
          severity: faker.helpers.arrayElement(['low', 'medium', 'high']),
        }
      default:
        return base
    }
  }
  
  buildYieldPrediction(overrides?: Partial<MLPrediction>): MLPrediction {
    return this.build({
      predictionType: 'yield',
      modelId: 'yield-model-v2',
      ...overrides,
    })
  }
}

/**
 * Factory manager to coordinate multiple factories
 */
export class TestDataFactory {
  user = new UserFactory()
  farm = new FarmFactory()
  field = new FieldFactory()
  weather = new WeatherDataFactory()
  satellite = new SatelliteImageFactory()
  prediction = new MLPredictionFactory()
  
  /**
   * Create a complete farm setup with all related data
   */
  createCompleteFarmSetup() {
    const user = this.user.buildFarmOwner()
    const farm = this.farm.build({ ownerId: user.id })
    const fields = this.field.buildMany(3, { farmId: farm.id })
    
    const weatherData = fields.flatMap(field => 
      this.weather.buildTimeSeries(field.id, 7)
    )
    
    const satelliteImages = fields.flatMap(field =>
      this.satellite.buildMany(5, { fieldId: field.id })
    )
    
    const predictions = fields.map(field =>
      this.prediction.buildYieldPrediction({ fieldId: field.id })
    )
    
    return {
      user,
      farm,
      fields,
      weatherData,
      satelliteImages,
      predictions,
    }
  }
  
  /**
   * Reset all factories
   */
  reset() {
    this.user.reset()
    this.farm.reset()
    this.field.reset()
    this.weather.reset()
    this.satellite.reset()
    this.prediction.reset()
  }
}

// Export singleton instance
export const testDataFactory = new TestDataFactory()