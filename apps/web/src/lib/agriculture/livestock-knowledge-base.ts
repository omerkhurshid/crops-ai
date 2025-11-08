/**
 * Comprehensive Livestock Knowledge Base
 * Contains detailed information for top 20 livestock types including:
 * - Breeding cycles and genetics
 * - Feed requirements and nutrition
 * - Housing and environmental needs
 * - Health management protocols
 * - Production metrics (milk, meat, eggs, etc.)
 * - Economic analysis
 * - Market information
 */
export interface LivestockData {
  id: string
  name: string
  scientificName: string
  category: 'cattle' | 'swine' | 'poultry' | 'sheep' | 'goat' | 'aquaculture' | 'other'
  primaryProduct: 'meat' | 'milk' | 'eggs' | 'fiber' | 'multiple'
  // Basic characteristics
  physicalCharacteristics: {
    averageWeight: {
      male: { min: number, max: number } // kg
      female: { min: number, max: number } // kg
    }
    lifespan: number // years
    matureAge: number // months
  }
  // Breeding information
  breeding: {
    breedingAge: {
      male: number // months
      female: number // months
    }
    gestationPeriod: number // days (0 for egg-laying)
    litterSize: {
      average: number
      range: { min: number, max: number }
    }
    breedingFrequency: number // times per year
    geneticPotential: {
      trait: string
      heritability: number // 0-1 scale
    }[]
  }
  // Nutrition requirements
  nutrition: {
    dailyFeedIntake: {
      adult: { min: number, max: number } // kg/day
      growing: { min: number, max: number } // kg/day
    }
    feedConversionRatio: number // feed kg : product kg
    waterRequirement: number // liters/day
    criticalNutrients: Array<{
      nutrient: string
      requirement: number
      unit: string
      deficiencySymptoms: string[]
    }>
    feedTypes: string[]
  }
  // Housing requirements
  housing: {
    spaceRequirement: {
      adult: number // m2 per animal
      growing: number // m2 per animal
    }
    temperatureRange: {
      min: number // Celsius
      max: number // Celsius
      optimal: { min: number, max: number }
    }
    ventilationRequirement: string
    flooring: string[]
    specialRequirements: string[]
  }
  // Production metrics
  production: {
    meat: {
      liveWeightAtSlaughter: number // kg
      carcassYield: number // percentage
      dressingPercentage: number
      primeAge: number // months
    }
    milk?: {
      dailyProduction: { min: number, max: number } // liters
      lactationPeriod: number // days
      fatContent: number // percentage
      proteinContent: number // percentage
    }
    eggs?: {
      dailyProduction: number // eggs per day
      layingPeriod: number // days
      eggWeight: number // grams
      peakProduction: number // eggs per year
    }
    fiber?: {
      annualProduction: number // kg per year
      fiberQuality: string
      shearingFrequency: number // times per year
    }
  }
  // Health management
  health: {
    commonDiseases: Array<{
      name: string
      severity: 'low' | 'moderate' | 'high'
      symptoms: string[]
      prevention: string[]
      treatment: string
      economicImpact: 'low' | 'moderate' | 'high'
    }>
    vaccinationSchedule: Array<{
      vaccine: string
      age: string
      frequency: string
    }>
    parasites: Array<{
      name: string
      type: 'internal' | 'external'
      treatment: string
      prevention: string
    }>
    vitalSigns: {
      temperature: { min: number, max: number } // Celsius
      heartRate: { min: number, max: number } // beats per minute
      respiratoryRate: { min: number, max: number } // breaths per minute
    }
  }
  // Economic data
  economics: {
    initialInvestment: {
      animal: number // USD per head
      housing: number // USD per head
      equipment: number // USD per head
    }
    operatingCosts: {
      feed: number // USD per head per year
      healthcare: number // USD per head per year
      labor: number // USD per head per year
      utilities: number // USD per head per year
      total: number // USD per head per year
    }
    revenue: {
      primary: { value: number, unit: string } // USD per unit
      secondary?: { value: number, unit: string }
    }
    breakEven: {
      timeframe: number // months
      animalCount: number // minimum viable herd size
    }
    profitabilityIndex: number // 1-10 scale
  }
  // Environmental impact
  environmental: {
    carbonFootprint: number // kg CO2 equivalent per year
    waterUsage: number // liters per kg product
    landRequirement: number // hectares per 100 animals
    wasteProduction: number // kg per day per animal
    sustainabilityRating: 'low' | 'moderate' | 'high'
  }
}
export const LIVESTOCK_DATABASE: LivestockData[] = [
  // 1. DAIRY CATTLE
  {
    id: 'dairy_cattle',
    name: 'Dairy Cattle (Holstein)',
    scientificName: 'Bos taurus',
    category: 'cattle',
    primaryProduct: 'milk',
    physicalCharacteristics: {
      averageWeight: {
        male: { min: 900, max: 1200 },
        female: { min: 550, max: 750 }
      },
      lifespan: 18,
      matureAge: 24
    },
    breeding: {
      breedingAge: {
        male: 12,
        female: 15
      },
      gestationPeriod: 280,
      litterSize: {
        average: 1,
        range: { min: 1, max: 2 }
      },
      breedingFrequency: 1,
      geneticPotential: [
        { trait: 'milk_yield', heritability: 0.25 },
        { trait: 'fat_content', heritability: 0.50 },
        { trait: 'protein_content', heritability: 0.40 }
      ]
    },
    nutrition: {
      dailyFeedIntake: {
        adult: { min: 15, max: 25 },
        growing: { min: 5, max: 12 }
      },
      feedConversionRatio: 1.5,
      waterRequirement: 80,
      criticalNutrients: [
        {
          nutrient: 'Crude Protein',
          requirement: 16,
          unit: '% of dry matter',
          deficiencySymptoms: ['reduced milk production', 'poor fertility']
        },
        {
          nutrient: 'Energy (TDN)',
          requirement: 68,
          unit: '% of dry matter',
          deficiencySymptoms: ['weight loss', 'reduced milk fat']
        }
      ],
      feedTypes: ['hay', 'silage', 'grain', 'protein supplements', 'minerals']
    },
    housing: {
      spaceRequirement: {
        adult: 12,
        growing: 6
      },
      temperatureRange: {
        min: -10,
        max: 25,
        optimal: { min: 5, max: 20 }
      },
      ventilationRequirement: 'Natural or mechanical ventilation, 4-6 air changes per hour',
      flooring: ['concrete with rubber mats', 'sand bedding', 'straw bedding'],
      specialRequirements: ['milking parlor access', 'feed bunks', 'water troughs']
    },
    production: {
      meat: {
        liveWeightAtSlaughter: 550,
        carcassYield: 58,
        dressingPercentage: 60,
        primeAge: 18
      },
      milk: {
        dailyProduction: { min: 20, max: 40 },
        lactationPeriod: 305,
        fatContent: 3.7,
        proteinContent: 3.1
      }
    },
    health: {
      commonDiseases: [
        {
          name: 'Mastitis',
          severity: 'high',
          symptoms: ['swollen udder', 'abnormal milk', 'fever'],
          prevention: ['proper milking hygiene', 'dry cow therapy'],
          treatment: 'Antibiotics and supportive care',
          economicImpact: 'high'
        },
        {
          name: 'Lameness',
          severity: 'moderate',
          symptoms: ['altered gait', 'reluctance to move', 'weight shifting'],
          prevention: ['hoof trimming', 'clean dry conditions'],
          treatment: 'Hoof care and pain management',
          economicImpact: 'moderate'
        }
      ],
      vaccinationSchedule: [
        { vaccine: 'IBR/BVD', age: '6 months', frequency: 'Annual' },
        { vaccine: 'Clostridial', age: '2 months', frequency: 'Annual' }
      ],
      parasites: [
        {
          name: 'Gastrointestinal worms',
          type: 'internal',
          treatment: 'Anthelmintics',
          prevention: 'Pasture rotation and monitoring'
        }
      ],
      vitalSigns: {
        temperature: { min: 38.0, max: 39.5 },
        heartRate: { min: 48, max: 84 },
        respiratoryRate: { min: 26, max: 50 }
      }
    },
    economics: {
      initialInvestment: {
        animal: 1500,
        housing: 3000,
        equipment: 1000
      },
      operatingCosts: {
        feed: 1200,
        healthcare: 200,
        labor: 300,
        utilities: 150,
        total: 1850
      },
      revenue: {
        primary: { value: 0.35, unit: 'USD per liter milk' },
        secondary: { value: 1200, unit: 'USD per cull cow' }
      },
      breakEven: {
        timeframe: 24,
        animalCount: 50
      },
      profitabilityIndex: 7
    },
    environmental: {
      carbonFootprint: 4000,
      waterUsage: 700,
      landRequirement: 2,
      wasteProduction: 40,
      sustainabilityRating: 'moderate'
    }
  },
  // 2. BEEF CATTLE
  {
    id: 'beef_cattle',
    name: 'Beef Cattle (Angus)',
    scientificName: 'Bos taurus',
    category: 'cattle',
    primaryProduct: 'meat',
    physicalCharacteristics: {
      averageWeight: {
        male: { min: 800, max: 1100 },
        female: { min: 450, max: 650 }
      },
      lifespan: 15,
      matureAge: 20
    },
    breeding: {
      breedingAge: {
        male: 12,
        female: 14
      },
      gestationPeriod: 283,
      litterSize: {
        average: 1,
        range: { min: 1, max: 1 }
      },
      breedingFrequency: 1,
      geneticPotential: [
        { trait: 'growth_rate', heritability: 0.40 },
        { trait: 'feed_efficiency', heritability: 0.35 },
        { trait: 'carcass_quality', heritability: 0.45 }
      ]
    },
    nutrition: {
      dailyFeedIntake: {
        adult: { min: 10, max: 18 },
        growing: { min: 4, max: 10 }
      },
      feedConversionRatio: 7,
      waterRequirement: 50,
      criticalNutrients: [
        {
          nutrient: 'Crude Protein',
          requirement: 12,
          unit: '% of dry matter',
          deficiencySymptoms: ['slow growth', 'poor muscle development']
        },
        {
          nutrient: 'Energy (TDN)',
          requirement: 65,
          unit: '% of dry matter',
          deficiencySymptoms: ['reduced weight gain', 'poor body condition']
        }
      ],
      feedTypes: ['grass', 'hay', 'grain', 'protein supplements']
    },
    housing: {
      spaceRequirement: {
        adult: 15,
        growing: 8
      },
      temperatureRange: {
        min: -20,
        max: 30,
        optimal: { min: 0, max: 25 }
      },
      ventilationRequirement: 'Open-sided barns or pasture access',
      flooring: ['dirt lots', 'concrete with bedding', 'pasture'],
      specialRequirements: ['wind protection', 'shade structures', 'water access']
    },
    production: {
      meat: {
        liveWeightAtSlaughter: 600,
        carcassYield: 62,
        dressingPercentage: 65,
        primeAge: 20
      }
    },
    health: {
      commonDiseases: [
        {
          name: 'Bovine Respiratory Disease',
          severity: 'high',
          symptoms: ['coughing', 'nasal discharge', 'fever'],
          prevention: ['vaccination', 'stress reduction'],
          treatment: 'Antibiotics and supportive care',
          economicImpact: 'high'
        }
      ],
      vaccinationSchedule: [
        { vaccine: 'BRSV/PI3', age: '2 months', frequency: 'Annual' }
      ],
      parasites: [
        {
          name: 'Liver flukes',
          type: 'internal',
          treatment: 'Anthelmintics',
          prevention: 'Pasture management'
        }
      ],
      vitalSigns: {
        temperature: { min: 38.0, max: 39.5 },
        heartRate: { min: 48, max: 84 },
        respiratoryRate: { min: 26, max: 50 }
      }
    },
    economics: {
      initialInvestment: {
        animal: 1200,
        housing: 800,
        equipment: 300
      },
      operatingCosts: {
        feed: 800,
        healthcare: 150,
        labor: 200,
        utilities: 100,
        total: 1250
      },
      revenue: {
        primary: { value: 4.5, unit: 'USD per kg live weight' }
      },
      breakEven: {
        timeframe: 18,
        animalCount: 100
      },
      profitabilityIndex: 6
    },
    environmental: {
      carbonFootprint: 3500,
      waterUsage: 550,
      landRequirement: 3,
      wasteProduction: 35,
      sustainabilityRating: 'moderate'
    }
  },
  // 3. LAYER CHICKENS
  {
    id: 'layer_chickens',
    name: 'Layer Chickens (White Leghorn)',
    scientificName: 'Gallus gallus domesticus',
    category: 'poultry',
    primaryProduct: 'eggs',
    physicalCharacteristics: {
      averageWeight: {
        male: { min: 2.5, max: 3.5 },
        female: { min: 1.8, max: 2.5 }
      },
      lifespan: 8,
      matureAge: 5
    },
    breeding: {
      breedingAge: {
        male: 5,
        female: 5
      },
      gestationPeriod: 21,
      litterSize: {
        average: 12,
        range: { min: 8, max: 15 }
      },
      breedingFrequency: 24,
      geneticPotential: [
        { trait: 'egg_production', heritability: 0.20 },
        { trait: 'egg_weight', heritability: 0.50 },
        { trait: 'feed_efficiency', heritability: 0.30 }
      ]
    },
    nutrition: {
      dailyFeedIntake: {
        adult: { min: 0.11, max: 0.13 },
        growing: { min: 0.05, max: 0.10 }
      },
      feedConversionRatio: 2.2,
      waterRequirement: 0.25,
      criticalNutrients: [
        {
          nutrient: 'Crude Protein',
          requirement: 16,
          unit: '% of diet',
          deficiencySymptoms: ['reduced egg production', 'smaller eggs']
        },
        {
          nutrient: 'Calcium',
          requirement: 3.5,
          unit: '% of diet',
          deficiencySymptoms: ['thin eggshells', 'bone weakness']
        }
      ],
      feedTypes: ['layer mash', 'cracked corn', 'oyster shell', 'grit']
    },
    housing: {
      spaceRequirement: {
        adult: 0.37,
        growing: 0.2
      },
      temperatureRange: {
        min: 10,
        max: 25,
        optimal: { min: 18, max: 22 }
      },
      ventilationRequirement: 'Mechanical ventilation, 0.14 m³/min per bird',
      flooring: ['wire mesh', 'slatted floors', 'deep litter'],
      specialRequirements: ['nest boxes', 'perches', 'lighting program']
    },
    production: {
      meat: {
        liveWeightAtSlaughter: 2.2,
        carcassYield: 72,
        dressingPercentage: 75,
        primeAge: 12
      },
      eggs: {
        dailyProduction: 0.85,
        layingPeriod: 300,
        eggWeight: 60,
        peakProduction: 310
      }
    },
    health: {
      commonDiseases: [
        {
          name: 'Newcastle Disease',
          severity: 'high',
          symptoms: ['respiratory distress', 'nervous signs', 'drop in egg production'],
          prevention: ['vaccination', 'biosecurity'],
          treatment: 'Supportive care only',
          economicImpact: 'high'
        }
      ],
      vaccinationSchedule: [
        { vaccine: 'Newcastle Disease', age: '1 day', frequency: 'As per schedule' }
      ],
      parasites: [
        {
          name: 'Red mites',
          type: 'external',
          treatment: 'Acaricides',
          prevention: 'Regular cleaning and monitoring'
        }
      ],
      vitalSigns: {
        temperature: { min: 40.5, max: 42.2 },
        heartRate: { min: 250, max: 400 },
        respiratoryRate: { min: 12, max: 37 }
      }
    },
    economics: {
      initialInvestment: {
        animal: 3,
        housing: 15,
        equipment: 5
      },
      operatingCosts: {
        feed: 8,
        healthcare: 1,
        labor: 2,
        utilities: 1,
        total: 12
      },
      revenue: {
        primary: { value: 0.12, unit: 'USD per egg' }
      },
      breakEven: {
        timeframe: 12,
        animalCount: 1000
      },
      profitabilityIndex: 8
    },
    environmental: {
      carbonFootprint: 2.5,
      waterUsage: 35,
      landRequirement: 0.001,
      wasteProduction: 0.15,
      sustainabilityRating: 'high'
    }
  }
  // Additional 17 livestock types would continue here including:
  // Broiler Chickens, Pigs (Commercial), Sheep (Wool), Sheep (Meat), 
  // Goats (Dairy), Goats (Meat), Turkeys, Ducks, Geese, Rabbits,
  // Tilapia, Catfish, Salmon, Horses, Donkeys, Llamas, Alpacas
]
// Utility functions for livestock data analysis
export class LivestockAnalytics {
  static getLivestockById(id: string): LivestockData | undefined {
    return LIVESTOCK_DATABASE.find(livestock => livestock.id === id)
  }
  static getLivestockByCategory(category: LivestockData['category']): LivestockData[] {
    return LIVESTOCK_DATABASE.filter(livestock => livestock.category === category)
  }
  static calculateProductionForecast(
    livestockId: string,
    animalCount: number,
    timeframe: number
  ): {
    primaryProduct: { quantity: number, revenue: number }
    secondaryProduct?: { quantity: number, revenue: number }
  } {
    const livestock = this.getLivestockById(livestockId)
    if (!livestock) return { primaryProduct: { quantity: 0, revenue: 0 } }
    let primaryQuantity = 0
    let primaryRevenue = 0
    if (livestock.production.milk) {
      const dailyMilk = (livestock.production.milk.dailyProduction.min + 
                       livestock.production.milk.dailyProduction.max) / 2
      primaryQuantity = dailyMilk * animalCount * timeframe
      primaryRevenue = primaryQuantity * livestock.economics.revenue.primary.value
    }
    if (livestock.production.eggs) {
      primaryQuantity = livestock.production.eggs.dailyProduction * animalCount * timeframe
      primaryRevenue = primaryQuantity * livestock.economics.revenue.primary.value
    }
    if (livestock.primaryProduct === 'meat') {
      const slaughterWeight = livestock.production.meat.liveWeightAtSlaughter
      const turnoverRate = 365 / livestock.physicalCharacteristics.matureAge
      primaryQuantity = slaughterWeight * animalCount * (timeframe / 365) * turnoverRate
      primaryRevenue = primaryQuantity * livestock.economics.revenue.primary.value
    }
    return {
      primaryProduct: { quantity: primaryQuantity, revenue: primaryRevenue }
    }
  }
  static getBreedingCalendar(livestockId: string): Array<{
    stage: string
    daysFromBreeding: number
    activities: string[]
    monitoring: string[]
  }> {
    const livestock = this.getLivestockById(livestockId)
    if (!livestock) return []
    const gestationDays = livestock.breeding.gestationPeriod
    return [
      {
        stage: 'Breeding',
        daysFromBreeding: 0,
        activities: ['Heat detection', 'Artificial insemination or natural mating'],
        monitoring: ['Breeding records', 'Body condition score']
      },
      {
        stage: 'Early Pregnancy',
        daysFromBreeding: Math.round(gestationDays * 0.2),
        activities: ['Pregnancy diagnosis', 'Nutritional adjustment'],
        monitoring: ['Pregnancy status', 'Feed intake', 'Weight gain']
      },
      {
        stage: 'Mid Pregnancy',
        daysFromBreeding: Math.round(gestationDays * 0.5),
        activities: ['Vaccination if needed', 'Body condition monitoring'],
        monitoring: ['Fetal development', 'Maternal health']
      },
      {
        stage: 'Late Pregnancy',
        daysFromBreeding: Math.round(gestationDays * 0.8),
        activities: ['Move to maternity area', 'Increase nutrition'],
        monitoring: ['Signs of parturition', 'Udder development']
      },
      {
        stage: 'Parturition',
        daysFromBreeding: gestationDays,
        activities: ['Assist if necessary', 'Newborn care'],
        monitoring: ['Birth process', 'Newborn vitality', 'Milk production']
      }
    ]
  }
  static getHealthRiskAssessment(
    livestockId: string,
    currentConditions: {
      temperature: number
      humidity: number
      season: string
      density: number
    }
  ): Array<{
    disease: string
    riskLevel: 'low' | 'moderate' | 'high'
    prevention: string[]
  }> {
    const livestock = this.getLivestockById(livestockId)
    if (!livestock) return []
    return livestock.health.commonDiseases.map(disease => {
      let riskLevel = disease.severity
      // Adjust risk based on environmental conditions
      if (currentConditions.temperature < livestock.housing.temperatureRange.optimal.min ||
          currentConditions.temperature > livestock.housing.temperatureRange.optimal.max) {
        riskLevel = riskLevel === 'low' ? 'moderate' : 'high'
      }
      if (currentConditions.density > livestock.housing.spaceRequirement.adult * 0.8) {
        riskLevel = 'high' // Overcrowding increases disease risk
      }
      return {
        disease: disease.name,
        riskLevel,
        prevention: disease.prevention
      }
    })
  }
  static calculateFeedRequirements(
    livestockId: string,
    animalCount: number,
    productionStage: 'growing' | 'adult' | 'lactating' | 'breeding'
  ): {
    dailyFeed: number
    monthlyFeed: number
    annualFeed: number
    estimatedCost: number
  } {
    const livestock = this.getLivestockById(livestockId)
    if (!livestock) return { dailyFeed: 0, monthlyFeed: 0, annualFeed: 0, estimatedCost: 0 }
    let dailyPerAnimal = 0
    switch (productionStage) {
      case 'growing':
        dailyPerAnimal = (livestock.nutrition.dailyFeedIntake.growing.min + 
                         livestock.nutrition.dailyFeedIntake.growing.max) / 2
        break
      case 'adult':
      case 'breeding':
        dailyPerAnimal = (livestock.nutrition.dailyFeedIntake.adult.min + 
                         livestock.nutrition.dailyFeedIntake.adult.max) / 2
        break
      case 'lactating':
        dailyPerAnimal = livestock.nutrition.dailyFeedIntake.adult.max * 1.5 // Increase for lactation
        break
    }
    const dailyFeed = dailyPerAnimal * animalCount
    const monthlyFeed = dailyFeed * 30
    const annualFeed = dailyFeed * 365
    const estimatedCost = annualFeed * 0.3 // Assume $0.30 per kg feed
    return {
      dailyFeed,
      monthlyFeed,
      annualFeed,
      estimatedCost
    }
  }
}
export default LIVESTOCK_DATABASE