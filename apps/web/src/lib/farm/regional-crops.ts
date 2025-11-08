/**
 * Regional Crop Database
 * 
 * Provides structured crop recommendations based on geographic location,
 * climate data, soil types, and regional agricultural patterns.
 */
export interface CropOption {
  id: string;
  name: string;
  scientificName: string;
  category: 'grain' | 'vegetable' | 'fruit' | 'nut' | 'fiber' | 'oilseed' | 'pulse' | 'forage';
  icon: string;
  plantingWindow: {
    start: string; // MM-DD format
    end: string;
    optimal: string; // Description of optimal timing
  };
  harvestWindow: {
    start: string;
    end: string;
    duration: number; // days from planting
  };
  climateZones: string[]; // USDA hardiness zones
  soilRequirements: {
    ph: { min: number; max: number };
    drainage: 'well-drained' | 'moderate' | 'poor' | 'any';
    fertility: 'high' | 'moderate' | 'low';
  };
  waterRequirements: 'high' | 'moderate' | 'low';
  spacing: {
    rows: number; // inches between rows
    plants: number; // inches between plants
  };
  yield: {
    typical: number; // per acre
    unit: string;
  };
  marketValue: {
    avgPrice: number; // per unit
    demand: 'high' | 'moderate' | 'low';
    stability: 'stable' | 'volatile';
  };
  challenges: string[];
  benefits: string[];
  companions: string[]; // Crop IDs that grow well together
  rotationBenefits: string[];
}
export interface RegionalData {
  region: string;
  state: string;
  climateZone: string;
  averageRainfall: number; // inches per year
  growingSeason: number; // frost-free days
  primarySoilTypes: string[];
  recommendedCrops: {
    primary: string[]; // Most profitable/suitable crop IDs
    secondary: string[]; // Alternative options
    experimental: string[]; // Emerging opportunities
  };
  seasonalPatterns: {
    spring: string[];
    summer: string[];
    fall: string[];
    winter: string[];
  };
  marketFactors: {
    localDemand: string[];
    exportOpportunities: string[];
    processingFacilities: string[];
  };
}
// Comprehensive crop database
export const CROP_DATABASE: Record<string, CropOption> = {
  // === GRAINS ===
  'corn-field': {
    id: 'corn-field',
    name: 'Field Corn (Dent)',
    scientificName: 'Zea mays var. indentata',
    category: 'grain',
    icon: 'wheat',
    plantingWindow: { start: '04-15', end: '06-15', optimal: 'Late April to mid-May when soil reaches 50°F' },
    harvestWindow: { start: '09-15', end: '11-15', duration: 120 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 30, plants: 6 },
    yield: { typical: 180, unit: 'bushels' },
    marketValue: { avgPrice: 5.50, demand: 'high', stability: 'volatile' },
    challenges: ['Corn rootworm', 'European corn borer', 'Gray leaf spot', 'Weather dependency'],
    benefits: ['High yield potential', 'Multiple end uses', 'Established markets', 'Crop insurance available'],
    companions: ['soybeans', 'winter-wheat'],
    rotationBenefits: ['Improves soil structure', 'Breaks disease cycles']
  },
  'soybeans': {
    id: 'soybeans',
    name: 'Soybeans',
    scientificName: 'Glycine max',
    category: 'oilseed',
    icon: 'sprout',
    plantingWindow: { start: '05-01', end: '06-20', optimal: 'Mid-May after soil warms to 60°F' },
    harvestWindow: { start: '09-20', end: '10-31', duration: 100 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 30, plants: 2 },
    yield: { typical: 50, unit: 'bushels' },
    marketValue: { avgPrice: 13.50, demand: 'high', stability: 'volatile' },
    challenges: ['Soybean cyst nematode', 'Sudden death syndrome', 'White mold'],
    benefits: ['Nitrogen fixation', 'Strong export demand', 'Drought tolerance', 'Good rotation crop'],
    companions: ['corn-field', 'winter-wheat'],
    rotationBenefits: ['Adds nitrogen to soil', 'Breaks pest cycles', 'Improves soil biology']
  },
  'winter-wheat': {
    id: 'winter-wheat',
    name: 'Winter Wheat',
    scientificName: 'Triticum aestivum',
    category: 'grain',
    icon: 'wheat',
    plantingWindow: { start: '09-15', end: '11-01', optimal: 'Late September for vernalization' },
    harvestWindow: { start: '06-15', end: '07-31', duration: 240 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b'],
    soilRequirements: { ph: { min: 6.0, max: 7.5 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 7, plants: 1 },
    yield: { typical: 60, unit: 'bushels' },
    marketValue: { avgPrice: 6.50, demand: 'moderate', stability: 'stable' },
    challenges: ['Wheat streak mosaic', 'Hessian fly', 'Fusarium head blight'],
    benefits: ['Early cash flow', 'Excellent rotation crop', 'Cover crop benefits', 'Lower input costs'],
    companions: ['corn-field', 'soybeans'],
    rotationBenefits: ['Suppresses weeds', 'Reduces erosion', 'Different pest profile']
  },
  // === VEGETABLES ===
  'sweet-corn': {
    id: 'sweet-corn',
    name: 'Sweet Corn',
    scientificName: 'Zea mays var. saccharata',
    category: 'vegetable',
    icon: 'wheat',
    plantingWindow: { start: '04-20', end: '07-15', optimal: 'Succession plantings every 2 weeks' },
    harvestWindow: { start: '07-01', end: '09-30', duration: 75 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b'],
    soilRequirements: { ph: { min: 6.0, max: 6.8 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 30, plants: 8 },
    yield: { typical: 800, unit: 'dozen ears' },
    marketValue: { avgPrice: 4.50, demand: 'high', stability: 'stable' },
    challenges: ['Corn earworm', 'Birds', 'Market timing critical'],
    benefits: ['Premium pricing', 'Direct market potential', 'Consumer demand'],
    companions: ['beans', 'squash'],
    rotationBenefits: ['Heavy feeder rotation']
  },
  'tomatoes': {
    id: 'tomatoes',
    name: 'Processing Tomatoes',
    scientificName: 'Solanum lycopersicum',
    category: 'vegetable',
    icon: 'sun',
    plantingWindow: { start: '05-15', end: '06-15', optimal: 'After last frost, soil 60°F+' },
    harvestWindow: { start: '08-15', end: '10-15', duration: 90 },
    climateZones: ['4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 60, plants: 18 },
    yield: { typical: 40, unit: 'tons' },
    marketValue: { avgPrice: 85.00, demand: 'high', stability: 'stable' },
    challenges: ['Late blight', 'Bacterial spot', 'Labor intensive'],
    benefits: ['Contract pricing', 'High value per acre', 'Processing demand'],
    companions: ['basil', 'peppers'],
    rotationBenefits: ['Avoid nightshade rotation']
  },
  // === SPECIALTY/CASH CROPS ===
  'hemp-industrial': {
    id: 'hemp-industrial',
    name: 'Industrial Hemp',
    scientificName: 'Cannabis sativa',
    category: 'fiber',
    icon: 'tree-pine',
    plantingWindow: { start: '05-15', end: '06-30', optimal: 'After last frost, regulated crop' },
    harvestWindow: { start: '09-01', end: '10-15', duration: 120 },
    climateZones: ['4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a'],
    soilRequirements: { ph: { min: 6.0, max: 7.5 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 30, plants: 4 },
    yield: { typical: 3, unit: 'tons fiber' },
    marketValue: { avgPrice: 800.00, demand: 'moderate', stability: 'volatile' },
    challenges: ['Regulatory compliance', 'Limited processing', 'Market development'],
    benefits: ['High value potential', 'Sustainable crop', 'Multiple end uses'],
    companions: ['legumes'],
    rotationBenefits: ['Deep taproot', 'Natural pest deterrent']
  },
  'sunflowers': {
    id: 'sunflowers',
    name: 'Sunflowers (Oil)',
    scientificName: 'Helianthus annuus',
    category: 'oilseed',
    icon: 'flower-2',
    plantingWindow: { start: '05-01', end: '06-15', optimal: 'Soil temperature 50°F+' },
    harvestWindow: { start: '09-15', end: '10-31', duration: 120 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b'],
    soilRequirements: { ph: { min: 6.0, max: 8.0 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'low',
    spacing: { rows: 30, plants: 8 },
    yield: { typical: 2000, unit: 'lbs' },
    marketValue: { avgPrice: 0.22, demand: 'moderate', stability: 'stable' },
    challenges: ['Birds', 'Sclerotinia', 'Head rot'],
    benefits: ['Drought tolerance', 'Good rotation crop', 'Pollinator support'],
    companions: ['beans', 'corn-field'],
    rotationBenefits: ['Deep root system', 'Scavenges nutrients']
  }
};
// Regional recommendations database
export const REGIONAL_DATABASE: Record<string, RegionalData> = {
  'midwest-corn-belt': {
    region: 'Midwest Corn Belt',
    state: 'IA, IL, IN, OH',
    climateZone: '5a-6a',
    averageRainfall: 35,
    growingSeason: 160,
    primarySoilTypes: ['Mollisols', 'Alfisols'],
    recommendedCrops: {
      primary: ['corn-field', 'soybeans'],
      secondary: ['winter-wheat', 'oats'],
      experimental: ['hemp-industrial', 'cover-crop-mixes']
    },
    seasonalPatterns: {
      spring: ['corn-field', 'soybeans', 'oats'],
      summer: ['sweet-corn', 'vegetables'],
      fall: ['winter-wheat'],
      winter: ['cover-crops']
    },
    marketFactors: {
      localDemand: ['feed-corn', 'soybean-meal'],
      exportOpportunities: ['soybeans-china', 'corn-exports'],
      processingFacilities: ['ethanol-plants', 'soybean-crushers']
    }
  },
  'great-plains-north': {
    region: 'Northern Great Plains',
    state: 'ND, SD, MT',
    climateZone: '3a-4b',
    averageRainfall: 18,
    growingSeason: 130,
    primarySoilTypes: ['Mollisols', 'Aridisols'],
    recommendedCrops: {
      primary: ['winter-wheat', 'spring-wheat', 'sunflowers'],
      secondary: ['barley', 'canola', 'flax'],
      experimental: ['quinoa', 'buckwheat']
    },
    seasonalPatterns: {
      spring: ['spring-wheat', 'sunflowers', 'barley'],
      summer: ['pulse-crops'],
      fall: ['winter-wheat'],
      winter: ['fallow']
    },
    marketFactors: {
      localDemand: ['livestock-feed'],
      exportOpportunities: ['wheat-exports', 'sunflower-oil'],
      processingFacilities: ['grain-elevators', 'oil-crushers']
    }
  },
  'california-central-valley': {
    region: 'California Central Valley',
    state: 'CA',
    climateZone: '8b-9a',
    averageRainfall: 12,
    growingSeason: 300,
    primarySoilTypes: ['Entisols', 'Inceptisols'],
    recommendedCrops: {
      primary: ['tomatoes', 'almonds', 'grapes'],
      secondary: ['cotton', 'rice', 'corn-silage'],
      experimental: ['pistachios', 'pomegranates']
    },
    seasonalPatterns: {
      spring: ['tomatoes', 'cotton', 'rice'],
      summer: ['processing-vegetables'],
      fall: ['harvest-nuts-fruits'],
      winter: ['cover-crops', 'cool-season-vegetables']
    },
    marketFactors: {
      localDemand: ['processing-tomatoes', 'dairy-feed'],
      exportOpportunities: ['nuts-asia', 'wine-exports'],
      processingFacilities: ['food-processors', 'wineries']
    }
  }
};
/**
 * Get crop recommendations based on location
 */
export function getCropRecommendations(
  latitude: number, 
  longitude: number, 
  farmType: 'crops' | 'livestock' = 'crops'
): {
  region: string;
  primary: CropOption[];
  secondary: CropOption[];
  seasonal: Record<string, CropOption[]>;
  reasoning: string;
} {
  // Determine region based on coordinates
  let regionKey = 'midwest-corn-belt'; // default
  // Midwest Corn Belt (rough boundaries)
  if (latitude >= 40 && latitude <= 45 && longitude >= -95 && longitude <= -82) {
    regionKey = 'midwest-corn-belt';
  }
  // Northern Great Plains
  else if (latitude >= 45 && latitude <= 49 && longitude >= -104 && longitude <= -96) {
    regionKey = 'great-plains-north';
  }
  // California Central Valley
  else if (latitude >= 35 && latitude <= 40 && longitude >= -122 && longitude <= -119) {
    regionKey = 'california-central-valley';
  }
  const regionalData = REGIONAL_DATABASE[regionKey];
  const primary = regionalData.recommendedCrops.primary
    .map(id => CROP_DATABASE[id])
    .filter(Boolean);
  const secondary = regionalData.recommendedCrops.secondary
    .map(id => CROP_DATABASE[id])
    .filter(Boolean);
  const seasonal = Object.entries(regionalData.seasonalPatterns).reduce((acc, [season, cropIds]) => {
    acc[season] = cropIds.map(id => CROP_DATABASE[id]).filter(Boolean);
    return acc;
  }, {} as Record<string, CropOption[]>);
  const reasoning = `Based on your location in the ${regionalData.region} (Climate Zone ${regionalData.climateZone}), ` +
    `with ${regionalData.averageRainfall}" annual rainfall and ${regionalData.growingSeason} frost-free days. ` +
    `Primary soil types: ${regionalData.primarySoilTypes.join(', ')}.`;
  return {
    region: regionalData.region,
    primary,
    secondary,
    seasonal,
    reasoning
  };
}
/**
 * Get livestock recommendations (simplified for now)
 */
export function getLivestockRecommendations(latitude: number, longitude: number) {
  // This would be expanded with regional livestock data
  return {
    primary: [
      { id: 'beef-cattle', name: 'Beef Cattle', icon: '🐄', suitability: 'high' },
      { id: 'dairy-cattle', name: 'Dairy Cattle', icon: '🐄', suitability: 'moderate' }
    ],
    secondary: [
      { id: 'poultry', name: 'Poultry', icon: '🐔', suitability: 'high' },
      { id: 'swine', name: 'Swine', icon: '🐖', suitability: 'moderate' }
    ]
  };
}