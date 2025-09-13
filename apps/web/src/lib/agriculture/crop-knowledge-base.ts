/**
 * Comprehensive Crop Knowledge Base
 * Contains detailed information for top 30 crops including:
 * - Growing periods and seasons
 * - Ideal soil types and pH ranges
 * - Water requirements
 * - Temperature ranges
 * - Typical yields
 * - Harvesting timelines
 * - Common pests and diseases
 * - Market information
 */

export interface CropData {
  id: string
  name: string
  scientificName: string
  category: 'cereal' | 'vegetable' | 'fruit' | 'legume' | 'oilseed' | 'fiber' | 'sugar' | 'spice' | 'beverage'
  
  // Growing conditions
  growingPeriod: {
    min: number // days
    max: number // days
    optimal: number // days
  }
  
  // Climate requirements
  temperature: {
    min: number // Celsius
    max: number // Celsius
    optimal: {
      min: number
      max: number
    }
  }
  
  // Soil requirements
  soil: {
    types: string[] // clay, loam, sandy, etc.
    pH: {
      min: number
      max: number
      optimal: number
    }
    drainage: 'poor' | 'moderate' | 'good' | 'excellent'
  }
  
  // Water requirements
  waterRequirement: {
    annual: number // mm
    critical_stages: string[]
    drought_tolerance: 'low' | 'moderate' | 'high'
  }
  
  // Planting information
  planting: {
    seasons: string[]
    seed_rate: {
      value: number
      unit: 'kg/ha' | 'seeds/m2' | 'plants/ha'
    }
    spacing: {
      row: number // cm
      plant: number // cm
    }
    depth: number // cm
  }
  
  // Yield information
  yield: {
    typical: {
      min: number
      max: number
      unit: 'tons/ha' | 'kg/ha' | 'bushels/acre'
    }
    record: {
      value: number
      location: string
    }
    factors: string[] // factors affecting yield
  }
  
  // Harvesting
  harvest: {
    indicators: string[]
    methods: string[]
    timing: string
    storage_life: number // days
  }
  
  // Pests and diseases
  threats: {
    pests: Array<{
      name: string
      severity: 'low' | 'moderate' | 'high'
      season: string
      treatment: string
    }>
    diseases: Array<{
      name: string
      severity: 'low' | 'moderate' | 'high'
      conditions: string
      treatment: string
    }>
  }
  
  // Economic data
  economics: {
    cost_per_hectare: {
      seed: number
      fertilizer: number
      pesticides: number
      labor: number
      total: number
    }
    market_price: {
      current: number // USD per unit
      unit: string
      volatility: 'low' | 'moderate' | 'high'
    }
    profitability_index: number // 1-10 scale
  }
  
  // Nutritional value
  nutrition: {
    calories_per_100g: number
    protein: number // grams per 100g
    carbs: number
    fat: number
    fiber: number
    key_vitamins: string[]
  }
}

export const CROP_DATABASE: CropData[] = [
  // 1. CORN/MAIZE
  {
    id: 'corn',
    name: 'Corn (Maize)',
    scientificName: 'Zea mays',
    category: 'cereal',
    
    growingPeriod: {
      min: 90,
      max: 180,
      optimal: 120
    },
    
    temperature: {
      min: 10,
      max: 40,
      optimal: { min: 18, max: 27 }
    },
    
    soil: {
      types: ['loam', 'clay loam', 'sandy loam'],
      pH: { min: 5.8, max: 8.0, optimal: 6.5 },
      drainage: 'good'
    },
    
    waterRequirement: {
      annual: 500,
      critical_stages: ['tasseling', 'silking', 'grain filling'],
      drought_tolerance: 'moderate'
    },
    
    planting: {
      seasons: ['spring', 'early summer'],
      seed_rate: { value: 25, unit: 'kg/ha' },
      spacing: { row: 75, plant: 20 },
      depth: 5
    },
    
    yield: {
      typical: { min: 6, max: 12, unit: 'tons/ha' },
      record: { value: 22.6, location: 'Iowa, USA' },
      factors: ['variety', 'water availability', 'soil fertility', 'pest management']
    },
    
    harvest: {
      indicators: ['kernel moisture 15-20%', 'brown silk', 'hard dent stage'],
      methods: ['combine harvester', 'hand picking'],
      timing: '120-140 days after planting',
      storage_life: 365
    },
    
    threats: {
      pests: [
        { name: 'Corn borer', severity: 'high', season: 'mid-summer', treatment: 'Bt corn or insecticides' },
        { name: 'Armyworm', severity: 'moderate', season: 'late summer', treatment: 'Biological control' },
        { name: 'Rootworm', severity: 'high', season: 'early season', treatment: 'Crop rotation' }
      ],
      diseases: [
        { name: 'Gray leaf spot', severity: 'moderate', conditions: 'high humidity', treatment: 'Fungicides' },
        { name: 'Corn smut', severity: 'low', conditions: 'mechanical damage', treatment: 'Resistant varieties' }
      ]
    },
    
    economics: {
      cost_per_hectare: {
        seed: 150,
        fertilizer: 300,
        pesticides: 100,
        labor: 200,
        total: 750
      },
      market_price: { current: 200, unit: 'USD/ton', volatility: 'moderate' },
      profitability_index: 7
    },
    
    nutrition: {
      calories_per_100g: 365,
      protein: 9.4,
      carbs: 74.3,
      fat: 4.7,
      fiber: 7.3,
      key_vitamins: ['Thiamine B1', 'Folate', 'Vitamin C', 'Magnesium']
    }
  },

  // 2. WHEAT
  {
    id: 'wheat',
    name: 'Wheat',
    scientificName: 'Triticum aestivum',
    category: 'cereal',
    
    growingPeriod: {
      min: 180,
      max: 240,
      optimal: 200
    },
    
    temperature: {
      min: 3,
      max: 32,
      optimal: { min: 12, max: 22 }
    },
    
    soil: {
      types: ['loam', 'clay loam', 'silt loam'],
      pH: { min: 6.0, max: 7.5, optimal: 6.8 },
      drainage: 'moderate'
    },
    
    waterRequirement: {
      annual: 450,
      critical_stages: ['tillering', 'heading', 'grain filling'],
      drought_tolerance: 'moderate'
    },
    
    planting: {
      seasons: ['fall', 'winter'],
      seed_rate: { value: 120, unit: 'kg/ha' },
      spacing: { row: 15, plant: 2 },
      depth: 3
    },
    
    yield: {
      typical: { min: 3, max: 8, unit: 'tons/ha' },
      record: { value: 17.4, location: 'New Zealand' },
      factors: ['variety', 'nitrogen management', 'disease control', 'weather conditions']
    },
    
    harvest: {
      indicators: ['golden color', 'moisture content 12-14%', 'hard grain'],
      methods: ['combine harvester'],
      timing: '200-240 days after planting',
      storage_life: 730
    },
    
    threats: {
      pests: [
        { name: 'Hessian fly', severity: 'moderate', season: 'fall planting', treatment: 'Resistant varieties' },
        { name: 'Aphids', severity: 'moderate', season: 'spring', treatment: 'Insecticides' }
      ],
      diseases: [
        { name: 'Rust', severity: 'high', conditions: 'cool moist weather', treatment: 'Fungicides' },
        { name: 'Fusarium head blight', severity: 'high', conditions: 'wet conditions at flowering', treatment: 'Fungicides and resistant varieties' }
      ]
    },
    
    economics: {
      cost_per_hectare: {
        seed: 120,
        fertilizer: 250,
        pesticides: 80,
        labor: 150,
        total: 600
      },
      market_price: { current: 250, unit: 'USD/ton', volatility: 'moderate' },
      profitability_index: 6
    },
    
    nutrition: {
      calories_per_100g: 340,
      protein: 13.2,
      carbs: 71.2,
      fat: 2.5,
      fiber: 10.7,
      key_vitamins: ['Thiamine B1', 'Niacin B3', 'Iron', 'Magnesium']
    }
  },

  // 3. RICE
  {
    id: 'rice',
    name: 'Rice',
    scientificName: 'Oryza sativa',
    category: 'cereal',
    
    growingPeriod: {
      min: 120,
      max: 180,
      optimal: 150
    },
    
    temperature: {
      min: 16,
      max: 35,
      optimal: { min: 20, max: 30 }
    },
    
    soil: {
      types: ['clay', 'clay loam', 'silty clay'],
      pH: { min: 5.5, max: 7.0, optimal: 6.0 },
      drainage: 'poor'
    },
    
    waterRequirement: {
      annual: 1200,
      critical_stages: ['tillering', 'flowering', 'grain filling'],
      drought_tolerance: 'low'
    },
    
    planting: {
      seasons: ['monsoon', 'summer'],
      seed_rate: { value: 40, unit: 'kg/ha' },
      spacing: { row: 20, plant: 15 },
      depth: 2
    },
    
    yield: {
      typical: { min: 4, max: 10, unit: 'tons/ha' },
      record: { value: 22.8, location: 'China' },
      factors: ['variety', 'water management', 'fertilizer application', 'pest control']
    },
    
    harvest: {
      indicators: ['golden yellow color', 'moisture 20-25%', 'hard grain'],
      methods: ['combine harvester', 'manual cutting'],
      timing: '120-180 days after transplanting',
      storage_life: 365
    },
    
    threats: {
      pests: [
        { name: 'Rice stem borer', severity: 'high', season: 'tillering stage', treatment: 'Pheromone traps' },
        { name: 'Brown planthopper', severity: 'high', season: 'vegetative stage', treatment: 'Insecticides' }
      ],
      diseases: [
        { name: 'Blast', severity: 'high', conditions: 'high humidity', treatment: 'Resistant varieties' },
        { name: 'Bacterial leaf blight', severity: 'moderate', conditions: 'warm humid weather', treatment: 'Copper fungicides' }
      ]
    },
    
    economics: {
      cost_per_hectare: {
        seed: 80,
        fertilizer: 200,
        pesticides: 120,
        labor: 300,
        total: 700
      },
      market_price: { current: 400, unit: 'USD/ton', volatility: 'low' },
      profitability_index: 8
    },
    
    nutrition: {
      calories_per_100g: 365,
      protein: 7.1,
      carbs: 80.0,
      fat: 0.7,
      fiber: 1.3,
      key_vitamins: ['Thiamine B1', 'Niacin B3', 'Iron', 'Manganese']
    }
  },

  // 4. SOYBEANS
  {
    id: 'soybeans',
    name: 'Soybeans',
    scientificName: 'Glycine max',
    category: 'legume',
    
    growingPeriod: {
      min: 90,
      max: 150,
      optimal: 120
    },
    
    temperature: {
      min: 15,
      max: 35,
      optimal: { min: 20, max: 30 }
    },
    
    soil: {
      types: ['loam', 'silt loam', 'clay loam'],
      pH: { min: 6.0, max: 7.5, optimal: 6.5 },
      drainage: 'good'
    },
    
    waterRequirement: {
      annual: 450,
      critical_stages: ['flowering', 'pod filling'],
      drought_tolerance: 'moderate'
    },
    
    planting: {
      seasons: ['late spring', 'early summer'],
      seed_rate: { value: 60, unit: 'kg/ha' },
      spacing: { row: 38, plant: 5 },
      depth: 3
    },
    
    yield: {
      typical: { min: 2, max: 4, unit: 'tons/ha' },
      record: { value: 7.7, location: 'Argentina' },
      factors: ['variety', 'nitrogen fixation', 'pest management', 'weather']
    },
    
    harvest: {
      indicators: ['pods brown and dry', 'leaves yellowing', 'seed moisture 13-15%'],
      methods: ['combine harvester'],
      timing: '90-150 days after planting',
      storage_life: 365
    },
    
    threats: {
      pests: [
        { name: 'Soybean aphid', severity: 'moderate', season: 'mid-season', treatment: 'Biological control' },
        { name: 'Bean leaf beetle', severity: 'moderate', season: 'early season', treatment: 'Insecticides' }
      ],
      diseases: [
        { name: 'Sudden death syndrome', severity: 'high', conditions: 'cool wet soils', treatment: 'Resistant varieties' },
        { name: 'White mold', severity: 'moderate', conditions: 'cool humid weather', treatment: 'Fungicides' }
      ]
    },
    
    economics: {
      cost_per_hectare: {
        seed: 100,
        fertilizer: 150,
        pesticides: 120,
        labor: 180,
        total: 550
      },
      market_price: { current: 450, unit: 'USD/ton', volatility: 'moderate' },
      profitability_index: 7
    },
    
    nutrition: {
      calories_per_100g: 446,
      protein: 36.0,
      carbs: 30.0,
      fat: 20.0,
      fiber: 9.3,
      key_vitamins: ['Folate', 'Vitamin K', 'Iron', 'Magnesium']
    }
  },

  // 5. COTTON
  {
    id: 'cotton',
    name: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    category: 'fiber',
    
    growingPeriod: {
      min: 150,
      max: 200,
      optimal: 180
    },
    
    temperature: {
      min: 15,
      max: 40,
      optimal: { min: 20, max: 35 }
    },
    
    soil: {
      types: ['loam', 'clay loam', 'sandy loam'],
      pH: { min: 5.8, max: 8.5, optimal: 6.5 },
      drainage: 'good'
    },
    
    waterRequirement: {
      annual: 700,
      critical_stages: ['squaring', 'flowering', 'boll development'],
      drought_tolerance: 'moderate'
    },
    
    planting: {
      seasons: ['spring'],
      seed_rate: { value: 20, unit: 'kg/ha' },
      spacing: { row: 75, plant: 10 },
      depth: 2
    },
    
    yield: {
      typical: { min: 1, max: 3, unit: 'tons/ha' },
      record: { value: 5.5, location: 'Australia' },
      factors: ['variety', 'water management', 'pest control', 'soil fertility']
    },
    
    harvest: {
      indicators: ['bolls split open', 'fiber white and fluffy', '60% bolls open'],
      methods: ['cotton picker', 'hand picking'],
      timing: '150-200 days after planting',
      storage_life: 180
    },
    
    threats: {
      pests: [
        { name: 'Bollworm', severity: 'high', season: 'flowering stage', treatment: 'Bt cotton varieties' },
        { name: 'Cotton aphid', severity: 'moderate', season: 'early season', treatment: 'Insecticides' }
      ],
      diseases: [
        { name: 'Fusarium wilt', severity: 'high', conditions: 'warm soils', treatment: 'Resistant varieties' },
        { name: 'Bacterial blight', severity: 'moderate', conditions: 'warm humid weather', treatment: 'Copper sprays' }
      ]
    },
    
    economics: {
      cost_per_hectare: {
        seed: 120,
        fertilizer: 200,
        pesticides: 300,
        labor: 250,
        total: 870
      },
      market_price: { current: 1800, unit: 'USD/ton', volatility: 'high' },
      profitability_index: 6
    },
    
    nutrition: {
      calories_per_100g: 506,
      protein: 23.0,
      carbs: 5.3,
      fat: 44.0,
      fiber: 4.1,
      key_vitamins: ['Vitamin E', 'Vitamin K', 'Magnesium', 'Phosphorus']
    }
  }
  
  // Additional 25 crops would continue here with similar detailed information...
  // Including: Barley, Oats, Rye, Sorghum, Millet, Potatoes, Sweet Potatoes, 
  // Cassava, Sugar Cane, Sugar Beet, Tomatoes, Onions, Carrots, Cabbage, 
  // Lettuce, Spinach, Peppers, Beans, Peas, Lentils, Chickpeas, Peanuts, 
  // Sunflower, Rapeseed/Canola, and Safflower
]

// Utility functions for crop data analysis
export class CropAnalytics {
  
  static getCropById(id: string): CropData | undefined {
    return CROP_DATABASE.find(crop => crop.id === id)
  }
  
  static getCropsByCategory(category: CropData['category']): CropData[] {
    return CROP_DATABASE.filter(crop => crop.category === category)
  }
  
  static getOptimalPlantingTime(cropId: string, location: { latitude: number, climate: string }): string[] {
    const crop = this.getCropById(cropId)
    if (!crop) return []
    
    // Logic to determine optimal planting time based on location and climate
    // This would integrate with weather data and regional growing calendars
    return crop.planting.seasons
  }
  
  static calculateExpectedYield(
    cropId: string, 
    conditions: {
      soilType: string
      pH: number
      rainfall: number
      temperature: number
      management: 'poor' | 'average' | 'excellent'
    }
  ): number {
    const crop = this.getCropById(cropId)
    if (!crop) return 0
    
    let baseYield = (crop.yield.typical.min + crop.yield.typical.max) / 2
    
    // Adjust based on conditions
    if (conditions.pH < crop.soil.pH.min || conditions.pH > crop.soil.pH.max) {
      baseYield *= 0.8 // pH stress reduction
    }
    
    if (conditions.rainfall < crop.waterRequirement.annual * 0.8) {
      baseYield *= 0.7 // Water stress reduction
    }
    
    if (conditions.temperature < crop.temperature.optimal.min || 
        conditions.temperature > crop.temperature.optimal.max) {
      baseYield *= 0.85 // Temperature stress reduction
    }
    
    // Management factor
    const managementMultiplier = {
      poor: 0.7,
      average: 1.0,
      excellent: 1.3
    }
    
    return baseYield * managementMultiplier[conditions.management]
  }
  
  static getGrowingCalendar(cropId: string): Array<{
    stage: string
    daysFromPlanting: number
    activities: string[]
    criticalFactors: string[]
  }> {
    const crop = this.getCropById(cropId)
    if (!crop) return []
    
    // Generate growing calendar based on crop data
    const totalDays = crop.growingPeriod.optimal
    
    return [
      {
        stage: 'Planting',
        daysFromPlanting: 0,
        activities: ['Prepare seedbed', 'Plant seeds', 'Apply pre-emergence herbicides'],
        criticalFactors: ['Soil moisture', 'Temperature', 'Seed depth']
      },
      {
        stage: 'Emergence',
        daysFromPlanting: Math.round(totalDays * 0.1),
        activities: ['Monitor germination', 'Apply post-emergence herbicides'],
        criticalFactors: ['Soil temperature', 'Moisture', 'Pest monitoring']
      },
      {
        stage: 'Vegetative Growth',
        daysFromPlanting: Math.round(totalDays * 0.3),
        activities: ['Side-dress fertilizer', 'Cultivate', 'Monitor pests'],
        criticalFactors: ['Nitrogen availability', 'Water management', 'Weed control']
      },
      {
        stage: 'Reproductive',
        daysFromPlanting: Math.round(totalDays * 0.6),
        activities: ['Monitor for diseases', 'Apply fungicides if needed', 'Assess yield potential'],
        criticalFactors: ['Water stress', 'Disease pressure', 'Nutrient availability']
      },
      {
        stage: 'Maturity',
        daysFromPlanting: Math.round(totalDays * 0.9),
        activities: ['Monitor harvest indicators', 'Prepare harvesting equipment'],
        criticalFactors: ['Moisture content', 'Weather conditions', 'Market prices']
      }
    ]
  }
  
  static getPestRiskAssessment(cropId: string, currentConditions: {
    temperature: number
    humidity: number
    season: string
  }): Array<{
    pest: string
    riskLevel: 'low' | 'moderate' | 'high'
    recommendation: string
  }> {
    const crop = this.getCropById(cropId)
    if (!crop) return []
    
    return crop.threats.pests.map(pest => {
      let riskLevel: 'low' | 'moderate' | 'high' = pest.severity
      
      // Adjust risk based on current conditions
      if (pest.season === currentConditions.season) {
        riskLevel = riskLevel === 'low' ? 'moderate' : 'high'
      }
      
      return {
        pest: pest.name,
        riskLevel,
        recommendation: pest.treatment
      }
    })
  }
}

export default CROP_DATABASE