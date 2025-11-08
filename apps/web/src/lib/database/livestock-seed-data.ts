/**
 * Comprehensive livestock database seed data
 * Production-ready livestock information for agricultural management
 */
export interface LivestockSeedData {
  name: string
  scientificName: string
  category: string
  description: string
  primaryPurpose: string[]
  typicalHerdSize: string
  housingRequirements: string
  lifespan: number
  matureWeight: number
  breedingAge: number
  gestationPeriod?: number
  avgOffspring: number
  feedRequirements: string[]
  spaceRequirements: string
  climateAdaptation: string[]
  commonDiseases: string[]
  vaccineSchedule: string[]
  monitoringParameters: string[]
  marketDemand: string
  avgPrice: number
  priceUnit: string
  varieties: {
    name: string
    description: string
    origin: string
    specialCharacteristics: string[]
    productionFocus: string
    matureWeight: number
    temperament: string
    climateAdaptation: string[]
    marketPremium: boolean
  }[]
}
export const livestockSeedData: LivestockSeedData[] = [
  // DAIRY CATTLE
  {
    name: 'Holstein',
    scientificName: 'Bos taurus',
    category: 'DAIRY_CATTLE',
    description: 'World\'s highest producing dairy cattle breed',
    primaryPurpose: ['Milk Production'],
    typicalHerdSize: '50-500 head',
    housingRequirements: 'Dairy barn with milking parlor, climate control',
    lifespan: 20,
    matureWeight: 650,
    breedingAge: 15,
    gestationPeriod: 280,
    avgOffspring: 1,
    feedRequirements: ['Hay', 'Silage', 'Grain', 'Protein supplements'],
    spaceRequirements: '1.5-2 acres per head for grazing',
    climateAdaptation: ['Temperate', 'Cool climates'],
    commonDiseases: ['Mastitis', 'Ketosis', 'Milk Fever', 'Lameness'],
    vaccineSchedule: ['IBR', 'BVD', 'PI3', 'BRSV', 'Clostridial'],
    monitoringParameters: ['Milk Production', 'Body Condition Score', 'Reproduction', 'Health Records'],
    marketDemand: 'High',
    avgPrice: 1500,
    priceUnit: 'per head',
    varieties: [
      {
        name: 'Holstein-Friesian',
        description: 'Classic black and white dairy breed',
        origin: 'Netherlands',
        specialCharacteristics: ['High milk production', 'Large frame', 'Docile temperament'],
        productionFocus: 'Milk volume',
        matureWeight: 650,
        temperament: 'Docile',
        climateAdaptation: ['Temperate', 'Cool'],
        marketPremium: false
      },
      {
        name: 'Red Holstein',
        description: 'Red and white color variant of Holstein',
        origin: 'Netherlands',
        specialCharacteristics: ['Heat tolerance', 'Good milk production', 'Hardy'],
        productionFocus: 'Milk production with heat tolerance',
        matureWeight: 630,
        temperament: 'Docile',
        climateAdaptation: ['Temperate', 'Warm temperate'],
        marketPremium: true
      }
    ]
  },
  {
    name: 'Jersey',
    scientificName: 'Bos taurus',
    category: 'DAIRY_CATTLE',
    description: 'High butterfat content dairy breed',
    primaryPurpose: ['High-Fat Milk Production'],
    typicalHerdSize: '30-200 head',
    housingRequirements: 'Dairy barn with milking parlor',
    lifespan: 18,
    matureWeight: 400,
    breedingAge: 14,
    gestationPeriod: 280,
    avgOffspring: 1,
    feedRequirements: ['Quality pasture', 'Hay', 'Concentrates'],
    spaceRequirements: '1-1.5 acres per head for grazing',
    climateAdaptation: ['Temperate', 'Warm climates'],
    commonDiseases: ['Mastitis', 'Ketosis', 'Displaced Abomasum'],
    vaccineSchedule: ['IBR', 'BVD', 'PI3', 'BRSV', 'Leptospirosis'],
    monitoringParameters: ['Milk Fat Content', 'Body Weight', 'Reproduction', 'Pasture Health'],
    marketDemand: 'High',
    avgPrice: 1800,
    priceUnit: 'per head',
    varieties: [
      {
        name: 'Jersey',
        description: 'Traditional Jersey breed',
        origin: 'Jersey Island',
        specialCharacteristics: ['High butterfat', 'Efficient feed conversion', 'Heat tolerant'],
        productionFocus: 'High-quality milk',
        matureWeight: 400,
        temperament: 'Alert but gentle',
        climateAdaptation: ['Temperate', 'Subtropical'],
        marketPremium: true
      }
    ]
  },
  // BEEF CATTLE
  {
    name: 'Angus',
    scientificName: 'Bos taurus',
    category: 'BEEF_CATTLE',
    description: 'Premium beef breed known for marbling',
    primaryPurpose: ['Meat Production'],
    typicalHerdSize: '50-1000 head',
    housingRequirements: 'Open pasture with shelter',
    lifespan: 18,
    matureWeight: 850,
    breedingAge: 15,
    gestationPeriod: 283,
    avgOffspring: 1,
    feedRequirements: ['Grass', 'Hay', 'Grain finishing'],
    spaceRequirements: '2-5 acres per head depending on pasture quality',
    climateAdaptation: ['Temperate', 'Cool climates'],
    commonDiseases: ['BRD', 'Pinkeye', 'Foot Rot', 'Bloat'],
    vaccineSchedule: ['7-way Clostridial', 'IBR', 'BVD', 'PI3', 'BRSV'],
    monitoringParameters: ['Weight Gain', 'Body Condition', 'Reproduction', 'Pasture Rotation'],
    marketDemand: 'Very High',
    avgPrice: 2000,
    priceUnit: 'per head',
    varieties: [
      {
        name: 'Black Angus',
        description: 'Premium black beef cattle',
        origin: 'Scotland',
        specialCharacteristics: ['Excellent marbling', 'Polled', 'Early maturity'],
        productionFocus: 'Premium beef production',
        matureWeight: 850,
        temperament: 'Docile',
        climateAdaptation: ['Temperate', 'Cool'],
        marketPremium: true
      },
      {
        name: 'Red Angus',
        description: 'Red variant of Angus',
        origin: 'Scotland',
        specialCharacteristics: ['Heat tolerance', 'Good marbling', 'Maternal ability'],
        productionFocus: 'Beef production with heat tolerance',
        matureWeight: 800,
        temperament: 'Docile',
        climateAdaptation: ['Temperate', 'Warm temperate'],
        marketPremium: true
      }
    ]
  },
  {
    name: 'Hereford',
    scientificName: 'Bos taurus',
    category: 'BEEF_CATTLE',
    description: 'Hardy beef breed with excellent foraging ability',
    primaryPurpose: ['Meat Production'],
    typicalHerdSize: '50-1000 head',
    housingRequirements: 'Open pasture with minimal shelter',
    lifespan: 18,
    matureWeight: 800,
    breedingAge: 15,
    gestationPeriod: 285,
    avgOffspring: 1,
    feedRequirements: ['Grass', 'Browse', 'Hay', 'Minimal grain'],
    spaceRequirements: '2-5 acres per head',
    climateAdaptation: ['Temperate', 'Semi-arid', 'Cool'],
    commonDiseases: ['Pinkeye', 'BRD', 'Foot problems'],
    vaccineSchedule: ['7-way Clostridial', 'IBR', 'BVD', 'PI3'],
    monitoringParameters: ['Foraging Behavior', 'Weight Gain', 'Eye Health', 'Hoof Care'],
    marketDemand: 'High',
    avgPrice: 1700,
    priceUnit: 'per head',
    varieties: [
      {
        name: 'Polled Hereford',
        description: 'Naturally hornless Hereford',
        origin: 'England',
        specialCharacteristics: ['Polled', 'Hardy', 'Good mothers', 'Foraging ability'],
        productionFocus: 'Efficient beef production',
        matureWeight: 800,
        temperament: 'Calm',
        climateAdaptation: ['Temperate', 'Semi-arid'],
        marketPremium: false
      }
    ]
  },
  // SHEEP
  {
    name: 'Merino',
    scientificName: 'Ovis aries',
    category: 'SHEEP',
    description: 'Premium wool-producing sheep breed',
    primaryPurpose: ['Wool Production', 'Meat'],
    typicalHerdSize: '100-2000 head',
    housingRequirements: 'Pasture with basic three-sided shelter',
    lifespan: 12,
    matureWeight: 80,
    breedingAge: 7,
    gestationPeriod: 150,
    avgOffspring: 1.5,
    feedRequirements: ['Grass', 'Legumes', 'Hay', 'Grain supplements'],
    spaceRequirements: '4-10 sheep per acre depending on pasture',
    climateAdaptation: ['Temperate', 'Semi-arid', 'Mediterranean'],
    commonDiseases: ['Internal parasites', 'Foot rot', 'Pneumonia'],
    vaccineSchedule: ['CDT', 'Overeating disease'],
    monitoringParameters: ['Wool Quality', 'Body Condition', 'Parasite Load', 'Breeding Records'],
    marketDemand: 'High',
    avgPrice: 200,
    priceUnit: 'per head',
    varieties: [
      {
        name: 'Australian Merino',
        description: 'World\'s finest wool producer',
        origin: 'Australia',
        specialCharacteristics: ['Ultra-fine wool', 'Adaptable', 'Wrinkled skin'],
        productionFocus: 'Premium wool production',
        matureWeight: 80,
        temperament: 'Alert',
        climateAdaptation: ['Temperate', 'Semi-arid'],
        marketPremium: true
      },
      {
        name: 'American Merino',
        description: 'Adapted Merino for American conditions',
        origin: 'United States',
        specialCharacteristics: ['Fine wool', 'Hardy', 'Good mothers'],
        productionFocus: 'Wool and meat production',
        matureWeight: 85,
        temperament: 'Docile',
        climateAdaptation: ['Temperate', 'Continental'],
        marketPremium: true
      }
    ]
  },
  // GOATS
  {
    name: 'Saanen',
    scientificName: 'Capra aegagrus hircus',
    category: 'GOATS',
    description: 'High-producing dairy goat breed',
    primaryPurpose: ['Milk Production'],
    typicalHerdSize: '20-200 head',
    housingRequirements: 'Barn with milking area and outdoor access',
    lifespan: 15,
    matureWeight: 65,
    breedingAge: 7,
    gestationPeriod: 150,
    avgOffspring: 2,
    feedRequirements: ['Browse', 'Hay', 'Grain', 'Pasture'],
    spaceRequirements: '200-500 sq ft per goat in barn, 250 sq ft pasture',
    climateAdaptation: ['Temperate', 'Cool climates'],
    commonDiseases: ['CAE', 'Johnes', 'Mastitis', 'Internal parasites'],
    vaccineSchedule: ['CDT', 'Pneumonia'],
    monitoringParameters: ['Milk Production', 'Kidding Records', 'Browse Quality', 'Herd Health'],
    marketDemand: 'Medium',
    avgPrice: 300,
    priceUnit: 'per head',
    varieties: [
      {
        name: 'Saanen',
        description: 'Classic white dairy goat',
        origin: 'Switzerland',
        specialCharacteristics: ['High milk production', 'Large size', 'White color'],
        productionFocus: 'Milk production',
        matureWeight: 65,
        temperament: 'Gentle',
        climateAdaptation: ['Temperate', 'Cool'],
        marketPremium: true
      }
    ]
  },
  // POULTRY
  {
    name: 'Rhode Island Red',
    scientificName: 'Gallus gallus domesticus',
    category: 'POULTRY',
    description: 'Dual-purpose chicken breed for eggs and meat',
    primaryPurpose: ['Egg Production', 'Meat Production'],
    typicalHerdSize: '25-10000 birds',
    housingRequirements: 'Chicken coop with nesting boxes and outdoor run',
    lifespan: 8,
    matureWeight: 3,
    breedingAge: 5,
    gestationPeriod: 21,
    avgOffspring: 200,
    feedRequirements: ['Layer feed', 'Scratch grains', 'Greens', 'Grit'],
    spaceRequirements: '4 sq ft per bird in coop, 10 sq ft in run',
    climateAdaptation: ['Temperate', 'Continental', 'Subtropical'],
    commonDiseases: ['Newcastle', 'Marek\'s', 'Coccidiosis', 'Respiratory infections'],
    vaccineSchedule: ['Marek\'s', 'Newcastle', 'Bronchitis'],
    monitoringParameters: ['Egg Production', 'Feed Conversion', 'Mortality Rate', 'Behavior'],
    marketDemand: 'High',
    avgPrice: 25,
    priceUnit: 'per bird',
    varieties: [
      {
        name: 'Rhode Island Red',
        description: 'Hardy dual-purpose breed',
        origin: 'Rhode Island, USA',
        specialCharacteristics: ['Cold hardy', 'Good foragers', 'Reliable layers'],
        productionFocus: 'Eggs and meat',
        matureWeight: 3,
        temperament: 'Calm',
        climateAdaptation: ['Temperate', 'Cold'],
        marketPremium: false
      }
    ]
  },
  {
    name: 'Leghorn',
    scientificName: 'Gallus gallus domesticus',
    category: 'POULTRY',
    description: 'High egg-producing chicken breed',
    primaryPurpose: ['Egg Production'],
    typicalHerdSize: '1000-100000 birds',
    housingRequirements: 'Layer house with automated systems',
    lifespan: 7,
    matureWeight: 2.2,
    breedingAge: 4.5,
    gestationPeriod: 21,
    avgOffspring: 280,
    feedRequirements: ['Layer feed', 'Calcium supplements', 'Clean water'],
    spaceRequirements: '1.5 sq ft per bird in cage, 4 sq ft in floor system',
    climateAdaptation: ['Temperate', 'Warm', 'Mediterranean'],
    commonDiseases: ['Newcastle', 'Avian Influenza', 'Salmonella'],
    vaccineSchedule: ['Marek\'s', 'Newcastle', 'Bronchitis', 'Fowl Pox'],
    monitoringParameters: ['Daily Egg Count', 'Feed Efficiency', 'Mortality', 'Water Consumption'],
    marketDemand: 'Very High',
    avgPrice: 20,
    priceUnit: 'per bird',
    varieties: [
      {
        name: 'White Leghorn',
        description: 'Most productive egg-laying breed',
        origin: 'Italy',
        specialCharacteristics: ['High egg production', 'Efficient feed conversion', 'White eggs'],
        productionFocus: 'Maximum egg production',
        matureWeight: 2.2,
        temperament: 'Active',
        climateAdaptation: ['Temperate', 'Warm'],
        marketPremium: false
      }
    ]
  },
  // SWINE
  {
    name: 'Yorkshire',
    scientificName: 'Sus scrofa domesticus',
    category: 'SWINE',
    description: 'Large white pig breed for commercial production',
    primaryPurpose: ['Meat Production', 'Breeding'],
    typicalHerdSize: '500-5000 head',
    housingRequirements: 'Climate-controlled pig barn with farrowing crates',
    lifespan: 12,
    matureWeight: 300,
    breedingAge: 7,
    gestationPeriod: 114,
    avgOffspring: 10,
    feedRequirements: ['Corn', 'Soybean meal', 'Vitamins', 'Minerals'],
    spaceRequirements: '8 sq ft per finishing pig, 14 sq ft for breeding sows',
    climateAdaptation: ['Temperate', 'Continental'],
    commonDiseases: ['PRRS', 'Swine Flu', 'Pneumonia', 'Diarrhea'],
    vaccineSchedule: ['PRRS', 'Mycoplasma', 'Circovirus'],
    monitoringParameters: ['Feed Conversion', 'Growth Rate', 'Reproductive Performance', 'Health Status'],
    marketDemand: 'Very High',
    avgPrice: 150,
    priceUnit: 'per head',
    varieties: [
      {
        name: 'Yorkshire',
        description: 'Large white commercial pig',
        origin: 'England',
        specialCharacteristics: ['Large litters', 'Good mothers', 'Lean meat'],
        productionFocus: 'Commercial pork production',
        matureWeight: 300,
        temperament: 'Docile',
        climateAdaptation: ['Temperate', 'Cool'],
        marketPremium: false
      }
    ]
  }
]