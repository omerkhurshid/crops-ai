/**
 * Mock implementations for external services
 * Used for testing without making actual API calls
 */

// Mock OpenWeatherMap API responses
export const mockWeatherAPI = {
  currentWeather: (lat: number, lon: number) => ({
    coord: { lon, lat },
    weather: [
      {
        id: 802,
        main: 'Clouds',
        description: 'scattered clouds',
        icon: '03d',
      },
    ],
    base: 'stations',
    main: {
      temp: 75.2,
      feels_like: 74.8,
      temp_min: 72.5,
      temp_max: 78.1,
      pressure: 1013,
      humidity: 65,
    },
    visibility: 10000,
    wind: {
      speed: 12.5,
      deg: 230,
    },
    clouds: {
      all: 40,
    },
    dt: 1640995200,
    sys: {
      type: 1,
      id: 5122,
      country: 'US',
      sunrise: 1640951400,
      sunset: 1640987700,
    },
    timezone: -18000,
    id: 5128581,
    name: 'New York',
    cod: 200,
  }),

  forecast: (lat: number, lon: number) => ({
    cod: '200',
    message: 0,
    cnt: 40,
    list: Array.from({ length: 40 }, (_, i) => ({
      dt: 1640995200 + i * 10800, // 3 hour intervals
      main: {
        temp: 70 + Math.random() * 15,
        feels_like: 70 + Math.random() * 15,
        temp_min: 68 + Math.random() * 10,
        temp_max: 75 + Math.random() * 10,
        pressure: 1010 + Math.random() * 10,
        sea_level: 1010 + Math.random() * 10,
        grnd_level: 1005 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        temp_kf: 0,
      },
      weather: [
        {
          id: 800 + Math.floor(Math.random() * 4),
          main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
          description: 'weather description',
          icon: '01d',
        },
      ],
      clouds: {
        all: Math.floor(Math.random() * 100),
      },
      wind: {
        speed: 5 + Math.random() * 15,
        deg: Math.floor(Math.random() * 360),
        gust: 10 + Math.random() * 20,
      },
      visibility: 10000,
      pop: Math.random() * 0.8,
      rain: Math.random() > 0.7 ? { '3h': Math.random() * 5 } : undefined,
      sys: {
        pod: i % 8 < 4 ? 'd' : 'n',
      },
      dt_txt: new Date(1640995200000 + i * 10800000).toISOString(),
    })),
    city: {
      id: 5128581,
      name: 'New York',
      coord: { lat, lon },
      country: 'US',
      population: 8175133,
      timezone: -18000,
      sunrise: 1640951400,
      sunset: 1640987700,
    },
  }),

  historicalWeather: (lat: number, lon: number, date: Date) => ({
    lat,
    lon,
    timezone: 'America/New_York',
    timezone_offset: -18000,
    data: [
      {
        dt: Math.floor(date.getTime() / 1000),
        sunrise: Math.floor(date.getTime() / 1000) - 21600,
        sunset: Math.floor(date.getTime() / 1000) + 21600,
        temp: 72.5,
        feels_like: 71.8,
        pressure: 1015,
        humidity: 62,
        dew_point: 58.3,
        clouds: 25,
        visibility: 10000,
        wind_speed: 10.5,
        wind_deg: 225,
        weather: [
          {
            id: 801,
            main: 'Clouds',
            description: 'few clouds',
            icon: '02d',
          },
        ],
      },
    ],
  }),
}

// Mock Sentinel Hub API responses
export const mockSentinelAPI = {
  searchImages: (bbox: number[], dateFrom: string, dateTo: string) => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[bbox[0], bbox[1]], [bbox[2], bbox[1]], [bbox[2], bbox[3]], [bbox[0], bbox[3]], [bbox[0], bbox[1]]]],
        },
        properties: {
          id: 'S2A_MSIL2A_20240101T154701_N0509_R054_T18TXP_20240101T154701',
          datetime: '2024-01-01T15:47:01Z',
          platform: 'sentinel-2a',
          constellation: 'sentinel-2',
          instruments: ['msi'],
          cloudCover: 15.5,
          'eo:cloud_cover': 15.5,
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[bbox[0], bbox[1]], [bbox[2], bbox[1]], [bbox[2], bbox[3]], [bbox[0], bbox[3]], [bbox[0], bbox[1]]]],
        },
        properties: {
          id: 'S2B_MSIL2A_20240104T154701_N0509_R054_T18TXP_20240104T154701',
          datetime: '2024-01-04T15:47:01Z',
          platform: 'sentinel-2b',
          constellation: 'sentinel-2',
          instruments: ['msi'],
          cloudCover: 8.2,
          'eo:cloud_cover': 8.2,
        },
      },
    ],
  }),

  processImage: (imageId: string, bbox: number[]) => ({
    imageId,
    processedAt: new Date().toISOString(),
    bbox,
    bands: {
      B04: 'https://example.com/processed/B04.tif',
      B08: 'https://example.com/processed/B08.tif',
      RGB: 'https://example.com/processed/RGB.png',
    },
    statistics: {
      ndvi: {
        min: -0.2,
        max: 0.95,
        mean: 0.72,
        std: 0.15,
      },
      cloudMask: {
        cloudPixels: 1520,
        totalPixels: 10000,
        cloudPercentage: 15.2,
      },
    },
  }),

  calculateNDVI: (redBand: number[][], nirBand: number[][]) => {
    const height = redBand.length
    const width = redBand[0].length
    const ndvi = Array(height).fill(null).map(() => Array(width).fill(0))
    
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const red = redBand[i][j]
        const nir = nirBand[i][j]
        ndvi[i][j] = (nir - red) / (nir + red)
      }
    }
    
    return {
      data: ndvi,
      stats: {
        min: -0.1,
        max: 0.85,
        mean: 0.68,
        std: 0.12,
      },
    }
  },
}

// Mock Redis client
export const mockRedisClient = {
  data: new Map<string, any>(),
  
  get: jest.fn(async (key: string) => {
    const value = mockRedisClient.data.get(key)
    return value ? JSON.stringify(value) : null
  }),
  
  set: jest.fn(async (key: string, value: string, options?: any) => {
    mockRedisClient.data.set(key, JSON.parse(value))
    return 'OK'
  }),
  
  del: jest.fn(async (key: string) => {
    mockRedisClient.data.delete(key)
    return 1
  }),
  
  exists: jest.fn(async (key: string) => {
    return mockRedisClient.data.has(key) ? 1 : 0
  }),
  
  expire: jest.fn(async (key: string, seconds: number) => {
    // Mock expiration (not actually implemented)
    return 1
  }),
  
  keys: jest.fn(async (pattern: string) => {
    const keys = Array.from(mockRedisClient.data.keys())
    if (pattern === '*') return keys
    
    const regex = new RegExp(pattern.replace('*', '.*'))
    return keys.filter(key => regex.test(key))
  }),
  
  flushall: jest.fn(async () => {
    mockRedisClient.data.clear()
    return 'OK'
  }),
  
  // Reset mock data between tests
  reset: () => {
    mockRedisClient.data.clear()
    jest.clearAllMocks()
  },
}

// Mock Cloudinary responses
export const mockCloudinary = {
  upload: jest.fn(async (file: string, options: any) => ({
    public_id: `crops-ai/${options.folder}/${Date.now()}`,
    version: 1640995200,
    signature: 'mock-signature',
    width: 1920,
    height: 1080,
    format: 'jpg',
    resource_type: 'image',
    created_at: new Date().toISOString(),
    tags: options.tags || [],
    bytes: 512000,
    type: 'upload',
    etag: 'mock-etag',
    placeholder: false,
    url: `https://res.cloudinary.com/demo/image/upload/v1640995200/crops-ai/${options.folder}/image.jpg`,
    secure_url: `https://res.cloudinary.com/demo/image/upload/v1640995200/crops-ai/${options.folder}/image.jpg`,
    folder: `crops-ai/${options.folder}`,
    access_mode: 'public',
  })),

  destroy: jest.fn(async (publicId: string) => ({
    result: 'ok',
  })),

  resources: jest.fn(async (options: any) => ({
    resources: [
      {
        public_id: 'crops-ai/fields/field-123/image1',
        format: 'jpg',
        version: 1640995200,
        resource_type: 'image',
        type: 'upload',
        created_at: '2024-01-01T12:00:00Z',
        bytes: 256000,
        width: 1280,
        height: 720,
        url: 'https://res.cloudinary.com/demo/image/upload/v1640995200/crops-ai/fields/field-123/image1.jpg',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v1640995200/crops-ai/fields/field-123/image1.jpg',
      },
    ],
    next_cursor: null,
  })),
}

// Mock NextAuth session
export const mockAuthSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'FARM_OWNER',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
}

// Mock ML model responses
export const mockMLModels = {
  yieldPrediction: (features: any) => ({
    prediction: {
      yield: 185.5 + Math.random() * 20 - 10, // Random variation around baseline
      unit: 'bushels/acre',
      confidence: 0.82 + Math.random() * 0.1,
      confidenceInterval: {
        lower: 175.2,
        upper: 195.8,
      },
    },
    factors: {
      weather: 0.3,
      soil: 0.25,
      management: 0.25,
      historical: 0.2,
    },
    recommendations: [
      {
        type: 'irrigation',
        priority: 'high',
        action: 'Increase irrigation frequency',
        expectedImpact: '+5-8% yield',
      },
      {
        type: 'fertilizer',
        priority: 'medium',
        action: 'Apply nitrogen supplement',
        expectedImpact: '+3-5% yield',
      },
    ],
    metadata: {
      modelVersion: 'yield-v2.1',
      trainingDate: '2024-01-01',
      dataPoints: 15420,
    },
  }),

  cropHealthAnalysis: (ndvi: number, weather: any) => ({
    healthScore: 0.75 + Math.random() * 0.15,
    status: ndvi > 0.7 ? 'healthy' : ndvi > 0.5 ? 'moderate' : 'stressed',
    stressFactors: [
      ndvi < 0.6 && { factor: 'water_stress', severity: 'moderate', confidence: 0.78 },
      weather.temperature > 90 && { factor: 'heat_stress', severity: 'high', confidence: 0.85 },
    ].filter(Boolean),
    recommendations: [
      'Monitor soil moisture levels closely',
      'Consider protective measures against heat stress',
    ],
  }),
}

// Helper to setup all mocks
export const setupAllMocks = () => {
  // Mock fetch for external API calls
  global.fetch = jest.fn((url: string) => {
    if (url.includes('openweathermap.org')) {
      return Promise.resolve({
        ok: true,
        json: async () => mockWeatherAPI.currentWeather(40.7128, -74.0060),
      } as Response)
    }
    
    if (url.includes('sentinel-hub')) {
      return Promise.resolve({
        ok: true,
        json: async () => mockSentinelAPI.searchImages([-74.1, 40.7, -74.0, 40.8], '2024-01-01', '2024-01-31'),
      } as Response)
    }
    
    return Promise.reject(new Error('Unknown API endpoint'))
  })

  // Reset all mocks
  mockRedisClient.reset()
  mockCloudinary.upload.mockClear()
  mockCloudinary.destroy.mockClear()
  mockCloudinary.resources.mockClear()
}