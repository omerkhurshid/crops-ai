/**
 * Comprehensive crop database seed data
 * Production-ready crop information for agricultural management
 */

import { ProduceCategory, ClimateZone, SoilType, WaterRequirement, SunRequirement, GrowthHabit } from '@prisma/client'

export interface CropSeedData {
  name: string
  scientificName: string
  category: ProduceCategory
  description: string
  climateZones: ClimateZone[]
  hardinessZoneMin?: number
  hardinessZoneMax?: number
  soilTypes: SoilType[]
  soilPhMin?: number
  soilPhMax?: number
  waterRequirement: WaterRequirement
  sunRequirement: SunRequirement
  growthHabit: GrowthHabit
  plantingDepth?: number
  plantSpacing?: number
  rowSpacing?: number
  germinationDays?: number
  daysToMaturity?: number
  matureHeight?: number
  matureSpread?: number
  companionPlants: string[]
  incompatibleWith: string[]
  commonPests: string[]
  commonDiseases: string[]
  varieties: {
    name: string
    description: string
    daysToMaturity?: number
    yieldPerPlant?: number
    yieldUnit?: string
    marketDemand?: string
    premiumVariety?: boolean
    diseaseResistance: string[]
    droughtTolerant?: boolean
    coldTolerant?: boolean
    heatTolerant?: boolean
    color?: string
    size?: string
    shape?: string
  }[]
  nutritionalData?: {
    calories?: number
    protein?: number
    carbohydrates?: number
    fiber?: number
    sugar?: number
    fat?: number
    vitaminA?: number
    vitaminC?: number
    calcium?: number
    iron?: number
    potassium?: number
  }
}

export const cropSeedData: CropSeedData[] = [
  // GRAINS & CEREALS
  {
    name: 'Corn',
    scientificName: 'Zea mays',
    category: 'CROPS',
    description: 'Versatile cereal grain used for food, feed, and industrial purposes',
    climateZones: ['TEMPERATE', 'SUBTROPICAL', 'CONTINENTAL'],
    hardinessZoneMin: 3,
    hardinessZoneMax: 10,
    soilTypes: ['LOAM', 'SANDY_LOAM', 'CLAY_LOAM', 'SILT_LOAM'],
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    waterRequirement: 'HIGH',
    sunRequirement: 'FULL_SUN',
    growthHabit: 'ANNUAL',
    plantingDepth: 1.5,
    plantSpacing: 8,
    rowSpacing: 30,
    germinationDays: 7,
    daysToMaturity: 100,
    matureHeight: 8,
    matureSpread: 2,
    companionPlants: ['Beans', 'Squash', 'Pumpkin', 'Cucumber'],
    incompatibleWith: ['Tomato', 'Celery'],
    commonPests: ['Corn Borer', 'Armyworm', 'Cutworm', 'Corn Rootworm'],
    commonDiseases: ['Gray Leaf Spot', 'Northern Corn Leaf Blight', 'Rust'],
    varieties: [
      {
        name: 'Dent Corn',
        description: 'Most common field corn variety for animal feed and processing',
        daysToMaturity: 100,
        yieldPerPlant: 2,
        yieldUnit: 'ears',
        marketDemand: 'High',
        diseaseResistance: ['Gray Leaf Spot'],
        droughtTolerant: true,
        color: 'Yellow',
        size: 'Large'
      },
      {
        name: 'Sweet Corn',
        description: 'Human consumption corn with high sugar content',
        daysToMaturity: 75,
        yieldPerPlant: 2,
        yieldUnit: 'ears',
        marketDemand: 'High',
        premiumVariety: true,
        diseaseResistance: ['Rust'],
        color: 'Yellow or White',
        size: 'Medium'
      }
    ],
    nutritionalData: {
      calories: 86,
      protein: 3.3,
      carbohydrates: 19,
      fiber: 2.7,
      sugar: 3.2,
      fat: 1.2,
      vitaminC: 7,
      potassium: 270
    }
  },
  {
    name: 'Wheat',
    scientificName: 'Triticum aestivum',
    category: 'CROPS',
    description: 'Primary cereal grain for bread and flour production',
    climateZones: ['TEMPERATE', 'CONTINENTAL', 'MEDITERRANEAN'],
    hardinessZoneMin: 2,
    hardinessZoneMax: 9,
    soilTypes: ['LOAM', 'CLAY_LOAM', 'SILT_LOAM'],
    soilPhMin: 6.0,
    soilPhMax: 7.5,
    waterRequirement: 'MODERATE',
    sunRequirement: 'FULL_SUN',
    growthHabit: 'ANNUAL',
    plantingDepth: 1,
    plantSpacing: 1,
    rowSpacing: 7,
    germinationDays: 5,
    daysToMaturity: 120,
    matureHeight: 4,
    matureSpread: 0.5,
    companionPlants: ['Legumes', 'Clover'],
    incompatibleWith: ['Rye grass'],
    commonPests: ['Aphids', 'Hessian Fly', 'Wheat Midge'],
    commonDiseases: ['Rust', 'Powdery Mildew', 'Septoria'],
    varieties: [
      {
        name: 'Hard Red Winter',
        description: 'High protein wheat for bread making',
        daysToMaturity: 240,
        yieldPerPlant: 0.02,
        yieldUnit: 'kg',
        marketDemand: 'High',
        diseaseResistance: ['Rust', 'Powdery Mildew'],
        coldTolerant: true,
        droughtTolerant: true,
        color: 'Red',
        size: 'Medium'
      },
      {
        name: 'Soft Red Winter',
        description: 'Lower protein wheat for pastries and crackers',
        daysToMaturity: 230,
        yieldPerPlant: 0.02,
        yieldUnit: 'kg',
        marketDemand: 'Medium',
        diseaseResistance: ['Septoria'],
        coldTolerant: true,
        color: 'Red',
        size: 'Medium'
      }
    ],
    nutritionalData: {
      calories: 339,
      protein: 13.2,
      carbohydrates: 71.2,
      fiber: 12.2,
      fat: 2.5,
      iron: 3.6,
      calcium: 29
    }
  },
  {
    name: 'Rice',
    scientificName: 'Oryza sativa',
    category: 'CROPS',
    description: 'Staple grain crop grown in flooded fields',
    climateZones: ['TROPICAL', 'SUBTROPICAL', 'TEMPERATE'],
    hardinessZoneMin: 8,
    hardinessZoneMax: 11,
    soilTypes: ['CLAY', 'CLAY_LOAM', 'SILT'],
    soilPhMin: 5.5,
    soilPhMax: 7.0,
    waterRequirement: 'VERY_HIGH',
    sunRequirement: 'FULL_SUN',
    growthHabit: 'ANNUAL',
    plantingDepth: 0.5,
    plantSpacing: 4,
    rowSpacing: 8,
    germinationDays: 7,
    daysToMaturity: 105,
    matureHeight: 3,
    matureSpread: 1,
    companionPlants: ['Azolla', 'Fish farming'],
    incompatibleWith: ['Upland crops'],
    commonPests: ['Rice Water Weevil', 'Stem Borer', 'Brown Planthopper'],
    commonDiseases: ['Blast', 'Bacterial Blight', 'Sheath Rot'],
    varieties: [
      {
        name: 'Jasmine',
        description: 'Aromatic long-grain rice',
        daysToMaturity: 105,
        yieldPerPlant: 0.025,
        yieldUnit: 'kg',
        marketDemand: 'High',
        premiumVariety: true,
        diseaseResistance: ['Blast'],
        heatTolerant: true,
        color: 'White',
        size: 'Long grain'
      },
      {
        name: 'Basmati',
        description: 'Premium aromatic rice variety',
        daysToMaturity: 120,
        yieldPerPlant: 0.02,
        yieldUnit: 'kg',
        marketDemand: 'High',
        premiumVariety: true,
        diseaseResistance: ['Bacterial Blight'],
        color: 'White',
        size: 'Long grain',
        shape: 'Slender'
      }
    ],
    nutritionalData: {
      calories: 130,
      protein: 2.7,
      carbohydrates: 28,
      fiber: 0.4,
      fat: 0.3,
      iron: 0.2
    }
  },
  {
    name: 'Soybeans',
    scientificName: 'Glycine max',
    category: 'CROPS',
    description: 'High-protein legume crop for oil and protein meal',
    climateZones: ['TEMPERATE', 'SUBTROPICAL', 'CONTINENTAL'],
    hardinessZoneMin: 3,
    hardinessZoneMax: 9,
    soilTypes: ['LOAM', 'SANDY_LOAM', 'CLAY_LOAM', 'SILT_LOAM'],
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    waterRequirement: 'MODERATE',
    sunRequirement: 'FULL_SUN',
    growthHabit: 'ANNUAL',
    plantingDepth: 1,
    plantSpacing: 4,
    rowSpacing: 30,
    germinationDays: 7,
    daysToMaturity: 100,
    matureHeight: 3,
    matureSpread: 1.5,
    companionPlants: ['Corn', 'Sunflower'],
    incompatibleWith: ['Onions', 'Garlic'],
    commonPests: ['Soybean Aphid', 'Bean Leaf Beetle', 'Stink Bug'],
    commonDiseases: ['Sudden Death Syndrome', 'White Mold', 'Frogeye Leaf Spot'],
    varieties: [
      {
        name: 'Conventional Soybeans',
        description: 'Standard variety for oil and meal production',
        daysToMaturity: 100,
        yieldPerPlant: 0.03,
        yieldUnit: 'kg',
        marketDemand: 'High',
        diseaseResistance: ['Sudden Death Syndrome'],
        droughtTolerant: true,
        color: 'Yellow',
        size: 'Medium'
      }
    ],
    nutritionalData: {
      calories: 173,
      protein: 16.6,
      carbohydrates: 9.9,
      fiber: 6,
      fat: 9,
      calcium: 277,
      iron: 5.1
    }
  },
  // VEGETABLES
  {
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    category: 'VEGETABLES',
    description: 'Popular fruit vegetable for fresh consumption and processing',
    climateZones: ['TEMPERATE', 'SUBTROPICAL', 'MEDITERRANEAN'],
    hardinessZoneMin: 2,
    hardinessZoneMax: 11,
    soilTypes: ['LOAM', 'SANDY_LOAM', 'CLAY_LOAM'],
    soilPhMin: 6.0,
    soilPhMax: 6.8,
    waterRequirement: 'HIGH',
    sunRequirement: 'FULL_SUN',
    growthHabit: 'ANNUAL',
    plantingDepth: 0.25,
    plantSpacing: 24,
    rowSpacing: 36,
    germinationDays: 7,
    daysToMaturity: 80,
    matureHeight: 6,
    matureSpread: 3,
    companionPlants: ['Basil', 'Carrots', 'Lettuce', 'Peppers'],
    incompatibleWith: ['Corn', 'Fennel', 'Brassicas'],
    commonPests: ['Hornworm', 'Aphids', 'Whitefly', 'Cutworm'],
    commonDiseases: ['Blight', 'Wilt', 'Mosaic Virus'],
    varieties: [
      {
        name: 'Beefsteak',
        description: 'Large slicing tomatoes',
        daysToMaturity: 85,
        yieldPerPlant: 4,
        yieldUnit: 'kg',
        marketDemand: 'High',
        diseaseResistance: ['Wilt'],
        color: 'Red',
        size: 'Large',
        shape: 'Round'
      },
      {
        name: 'Cherry',
        description: 'Small bite-sized tomatoes',
        daysToMaturity: 65,
        yieldPerPlant: 2,
        yieldUnit: 'kg',
        marketDemand: 'High',
        premiumVariety: true,
        diseaseResistance: ['Blight'],
        color: 'Red',
        size: 'Small',
        shape: 'Round'
      },
      {
        name: 'Roma',
        description: 'Paste tomatoes for processing',
        daysToMaturity: 75,
        yieldPerPlant: 3,
        yieldUnit: 'kg',
        marketDemand: 'Medium',
        diseaseResistance: ['Mosaic Virus'],
        color: 'Red',
        size: 'Medium',
        shape: 'Oval'
      }
    ],
    nutritionalData: {
      calories: 18,
      protein: 0.9,
      carbohydrates: 3.9,
      fiber: 1.2,
      sugar: 2.6,
      fat: 0.2,
      vitaminC: 14,
      vitaminA: 42,
      potassium: 237
    }
  },
  {
    name: 'Lettuce',
    scientificName: 'Lactuca sativa',
    category: 'VEGETABLES',
    description: 'Leafy green vegetable for salads and fresh consumption',
    climateZones: ['TEMPERATE', 'MEDITERRANEAN', 'CONTINENTAL'],
    hardinessZoneMin: 2,
    hardinessZoneMax: 11,
    soilTypes: ['LOAM', 'SANDY_LOAM', 'SILT_LOAM'],
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    waterRequirement: 'MODERATE',
    sunRequirement: 'PARTIAL_SUN',
    growthHabit: 'ANNUAL',
    plantingDepth: 0.125,
    plantSpacing: 8,
    rowSpacing: 12,
    germinationDays: 7,
    daysToMaturity: 65,
    matureHeight: 1,
    matureSpread: 1,
    companionPlants: ['Carrots', 'Radishes', 'Onions'],
    incompatibleWith: ['Celery'],
    commonPests: ['Aphids', 'Cutworm', 'Slugs'],
    commonDiseases: ['Downy Mildew', 'Lettuce Drop'],
    varieties: [
      {
        name: 'Iceberg',
        description: 'Crisp head lettuce',
        daysToMaturity: 75,
        yieldPerPlant: 0.5,
        yieldUnit: 'kg',
        marketDemand: 'High',
        diseaseResistance: ['Lettuce Drop'],
        color: 'Green',
        size: 'Large',
        shape: 'Round head'
      },
      {
        name: 'Romaine',
        description: 'Upright leafy lettuce',
        daysToMaturity: 65,
        yieldPerPlant: 0.4,
        yieldUnit: 'kg',
        marketDemand: 'High',
        diseaseResistance: ['Downy Mildew'],
        color: 'Green',
        size: 'Medium',
        shape: 'Upright'
      }
    ],
    nutritionalData: {
      calories: 15,
      protein: 1.4,
      carbohydrates: 2.9,
      fiber: 1.3,
      vitaminA: 148,
      vitaminC: 9.2,
      calcium: 36
    }
  },
  {
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    category: 'VEGETABLES',
    description: 'Starchy tuber vegetable for food and processing',
    climateZones: ['TEMPERATE', 'CONTINENTAL'],
    hardinessZoneMin: 2,
    hardinessZoneMax: 9,
    soilTypes: ['SANDY', 'SANDY_LOAM', 'LOAM'],
    soilPhMin: 5.0,
    soilPhMax: 6.5,
    waterRequirement: 'MODERATE',
    sunRequirement: 'FULL_SUN',
    growthHabit: 'ANNUAL',
    plantingDepth: 4,
    plantSpacing: 12,
    rowSpacing: 36,
    germinationDays: 14,
    daysToMaturity: 90,
    matureHeight: 2,
    matureSpread: 2,
    companionPlants: ['Beans', 'Corn', 'Cabbage'],
    incompatibleWith: ['Tomato', 'Cucumber', 'Squash'],
    commonPests: ['Colorado Potato Beetle', 'Wireworm', 'Aphids'],
    commonDiseases: ['Late Blight', 'Early Blight', 'Scab'],
    varieties: [
      {
        name: 'Russet',
        description: 'High-starch potato for baking and frying',
        daysToMaturity: 100,
        yieldPerPlant: 1.5,
        yieldUnit: 'kg',
        marketDemand: 'High',
        diseaseResistance: ['Scab'],
        color: 'Brown skin, white flesh',
        size: 'Large',
        shape: 'Oblong'
      },
      {
        name: 'Red',
        description: 'Waxy potato for boiling',
        daysToMaturity: 80,
        yieldPerPlant: 1.2,
        yieldUnit: 'kg',
        marketDemand: 'Medium',
        diseaseResistance: ['Early Blight'],
        color: 'Red skin, white flesh',
        size: 'Medium',
        shape: 'Round'
      }
    ],
    nutritionalData: {
      calories: 77,
      protein: 2,
      carbohydrates: 17,
      fiber: 2.2,
      vitaminC: 20,
      potassium: 421
    }
  },
  // FRUITS
  {
    name: 'Apple',
    scientificName: 'Malus domestica',
    category: 'FRUITS',
    description: 'Deciduous tree fruit for fresh consumption and processing',
    climateZones: ['TEMPERATE', 'CONTINENTAL'],
    hardinessZoneMin: 3,
    hardinessZoneMax: 8,
    soilTypes: ['LOAM', 'SANDY_LOAM', 'CLAY_LOAM'],
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    waterRequirement: 'MODERATE',
    sunRequirement: 'FULL_SUN',
    growthHabit: 'PERENNIAL',
    plantSpacing: 240,
    rowSpacing: 240,
    daysToMaturity: 1200,
    matureHeight: 25,
    matureSpread: 25,
    companionPlants: ['Clover', 'Comfrey'],
    incompatibleWith: ['Black Walnut'],
    commonPests: ['Codling Moth', 'Apple Maggot', 'Aphids'],
    commonDiseases: ['Fire Blight', 'Apple Scab', 'Powdery Mildew'],
    varieties: [
      {
        name: 'Red Delicious',
        description: 'Classic red apple variety',
        daysToMaturity: 1200,
        yieldPerPlant: 40,
        yieldUnit: 'kg',
        marketDemand: 'Medium',
        diseaseResistance: ['Apple Scab'],
        color: 'Red',
        size: 'Large',
        shape: 'Conical'
      },
      {
        name: 'Honeycrisp',
        description: 'Crisp, sweet apple variety',
        daysToMaturity: 1200,
        yieldPerPlant: 35,
        yieldUnit: 'kg',
        marketDemand: 'High',
        premiumVariety: true,
        diseaseResistance: ['Fire Blight'],
        coldTolerant: true,
        color: 'Red and yellow',
        size: 'Large',
        shape: 'Round'
      }
    ],
    nutritionalData: {
      calories: 52,
      protein: 0.3,
      carbohydrates: 14,
      fiber: 2.4,
      sugar: 10,
      vitaminC: 5,
      potassium: 107
    }
  },
  {
    name: 'Grape',
    scientificName: 'Vitis vinifera',
    category: 'FRUITS',
    description: 'Vine fruit for fresh consumption, wine, and raisins',
    climateZones: ['MEDITERRANEAN', 'TEMPERATE'],
    hardinessZoneMin: 6,
    hardinessZoneMax: 10,
    soilTypes: ['LOAM', 'SANDY_LOAM', 'CLAY_LOAM'],
    soilPhMin: 6.0,
    soilPhMax: 7.5,
    waterRequirement: 'MODERATE',
    sunRequirement: 'FULL_SUN',
    growthHabit: 'PERENNIAL',
    plantSpacing: 96,
    rowSpacing: 120,
    daysToMaturity: 1095,
    matureHeight: 8,
    matureSpread: 6,
    companionPlants: ['Roses', 'Oregano'],
    incompatibleWith: ['Cabbage', 'Radish'],
    commonPests: ['Grape Phylloxera', 'Leafhopper', 'Mites'],
    commonDiseases: ['Powdery Mildew', 'Downy Mildew', 'Black Rot'],
    varieties: [
      {
        name: 'Cabernet Sauvignon',
        description: 'Premium wine grape variety',
        daysToMaturity: 1095,
        yieldPerPlant: 8,
        yieldUnit: 'kg',
        marketDemand: 'High',
        premiumVariety: true,
        diseaseResistance: ['Powdery Mildew'],
        droughtTolerant: true,
        color: 'Dark purple',
        size: 'Small',
        shape: 'Round'
      },
      {
        name: 'Chardonnay',
        description: 'White wine grape variety',
        daysToMaturity: 1095,
        yieldPerPlant: 10,
        yieldUnit: 'kg',
        marketDemand: 'High',
        premiumVariety: true,
        diseaseResistance: ['Black Rot'],
        color: 'Green-yellow',
        size: 'Medium',
        shape: 'Round'
      }
    ],
    nutritionalData: {
      calories: 69,
      protein: 0.7,
      carbohydrates: 18,
      fiber: 0.9,
      sugar: 16,
      vitaminC: 4,
      potassium: 191
    }
  }
]