/**
 * Comprehensive Agricultural Crop Database
 * Based on FAO, USDA, and World Crops Database classification systems
 * Organized by botanical families and agricultural categories
 */

export interface ComprehensiveCropOption {
  id: string;
  name: string;
  scientificName: string;
  botanicalFamily: string;
  category: 'grain' | 'legume' | 'vegetable' | 'fruit' | 'nut' | 'fiber' | 'oilseed' | 'sugar' | 'spice' | 'forage' | 'industrial';
  subCategory?: string;
  icon: string;
  plantingWindow: {
    start: string; // MM-DD format
    end: string;
    optimal: string;
  };
  harvestWindow: {
    start: string;
    end: string;
    duration: number; // days from planting
  };
  climateZones: string[];
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
    typical: number;
    unit: string;
  };
  marketValue: {
    avgPrice: number;
    demand: 'high' | 'moderate' | 'low';
    stability: 'stable' | 'volatile';
  };
  challenges: string[];
  benefits: string[];
  companions: string[];
  rotationBenefits: string[];
  nutritionalValue?: string;
  commonVarieties?: string[];
}

// Comprehensive crop database organized by botanical families
export const COMPREHENSIVE_CROP_DATABASE: Record<string, ComprehensiveCropOption> = {
  
  // ========================================
  // POACEAE FAMILY (GRASSES) - CEREALS
  // ========================================
  
  'wheat-winter': {
    id: 'wheat-winter',
    name: 'Winter Wheat',
    scientificName: 'Triticum aestivum',
    botanicalFamily: 'Poaceae',
    category: 'grain',
    subCategory: 'cereal',
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
    rotationBenefits: ['Suppresses weeds', 'Reduces erosion', 'Different pest profile'],
    commonVarieties: ['Hard Red Winter', 'Soft Red Winter']
  },

  'wheat-spring': {
    id: 'wheat-spring',
    name: 'Spring Wheat',
    scientificName: 'Triticum aestivum',
    botanicalFamily: 'Poaceae',
    category: 'grain',
    subCategory: 'cereal',
    icon: 'wheat',
    plantingWindow: { start: '03-15', end: '05-15', optimal: 'Early April when soil workable' },
    harvestWindow: { start: '07-15', end: '09-15', duration: 120 },
    climateZones: ['2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b'],
    soilRequirements: { ph: { min: 6.0, max: 7.5 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 7, plants: 1 },
    yield: { typical: 45, unit: 'bushels' },
    marketValue: { avgPrice: 7.50, demand: 'moderate', stability: 'stable' },
    challenges: ['Rust diseases', 'Scab', 'Weather dependency'],
    benefits: ['High protein content', 'Premium pricing', 'Good rotation crop'],
    companions: ['barley', 'oats'],
    rotationBenefits: ['Breaks disease cycles', 'Soil structure improvement'],
    commonVarieties: ['Hard Red Spring', 'Durum']
  },

  'corn-dent': {
    id: 'corn-dent',
    name: 'Dent Corn (Field Corn)',
    scientificName: 'Zea mays var. indentata',
    botanicalFamily: 'Poaceae',
    category: 'grain',
    subCategory: 'cereal',
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
    rotationBenefits: ['Improves soil structure', 'Breaks disease cycles'],
    nutritionalValue: 'High carbohydrate content, moderate protein'
  },

  'rice-long-grain': {
    id: 'rice-long-grain',
    name: 'Long Grain Rice',
    scientificName: 'Oryza sativa var. indica',
    botanicalFamily: 'Poaceae',
    category: 'grain',
    subCategory: 'cereal',
    icon: 'wheat',
    plantingWindow: { start: '04-01', end: '06-15', optimal: 'May when soil temperature reaches 60°F' },
    harvestWindow: { start: '08-15', end: '10-31', duration: 120 },
    climateZones: ['8a', '8b', '9a', '9b', '10a', '10b'],
    soilRequirements: { ph: { min: 5.5, max: 7.0 }, drainage: 'poor', fertility: 'moderate' },
    waterRequirements: 'high',
    spacing: { rows: 6, plants: 4 },
    yield: { typical: 7500, unit: 'lbs' },
    marketValue: { avgPrice: 14.50, demand: 'high', stability: 'stable' },
    challenges: ['Rice blast', 'Sheath blight', 'Water management', 'Bird damage'],
    benefits: ['Staple food crop', 'High yield', 'Export potential', 'Multiple varieties'],
    companions: ['fish-farming', 'duck-farming'],
    rotationBenefits: ['Soil conditioning', 'Weed suppression'],
    commonVarieties: ['Jasmine', 'Basmati', 'Carolina Gold']
  },

  'barley': {
    id: 'barley',
    name: 'Barley',
    scientificName: 'Hordeum vulgare',
    botanicalFamily: 'Poaceae',
    category: 'grain',
    subCategory: 'cereal',
    icon: 'wheat',
    plantingWindow: { start: '03-01', end: '05-15', optimal: 'Early spring when soil workable' },
    harvestWindow: { start: '07-01', end: '08-31', duration: 90 },
    climateZones: ['2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a'],
    soilRequirements: { ph: { min: 6.2, max: 7.8 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 7, plants: 1 },
    yield: { typical: 70, unit: 'bushels' },
    marketValue: { avgPrice: 5.25, demand: 'moderate', stability: 'stable' },
    challenges: ['Barley yellow dwarf', 'Spot blotch', 'Lodging'],
    benefits: ['Drought tolerance', 'Short season', 'Multiple uses', 'Good rotation crop'],
    companions: ['peas', 'canola'],
    rotationBenefits: ['Early harvest allows cover crops', 'Reduces disease pressure'],
    commonVarieties: ['Six-row', 'Two-row', 'Hulless']
  },

  'oats': {
    id: 'oats',
    name: 'Oats',
    scientificName: 'Avena sativa',
    botanicalFamily: 'Poaceae',
    category: 'grain',
    subCategory: 'cereal',
    icon: 'wheat',
    plantingWindow: { start: '03-15', end: '05-01', optimal: 'Early spring in cool weather' },
    harvestWindow: { start: '07-15', end: '09-15', duration: 100 },
    climateZones: ['2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'moderate', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 6, plants: 1 },
    yield: { typical: 80, unit: 'bushels' },
    marketValue: { avgPrice: 4.75, demand: 'moderate', stability: 'stable' },
    challenges: ['Crown rust', 'Barley yellow dwarf', 'Lodging'],
    benefits: ['Cool weather tolerance', 'Soil improvement', 'Multiple uses', 'Good cover crop'],
    companions: ['legumes', 'grass-mixtures'],
    rotationBenefits: ['Soil conditioning', 'Weed suppression', 'Erosion control']
  },

  'sorghum': {
    id: 'sorghum',
    name: 'Grain Sorghum',
    scientificName: 'Sorghum bicolor',
    botanicalFamily: 'Poaceae',
    category: 'grain',
    subCategory: 'cereal',
    icon: 'wheat',
    plantingWindow: { start: '05-01', end: '07-15', optimal: 'Late May when soil is warm' },
    harvestWindow: { start: '09-15', end: '11-30', duration: 110 },
    climateZones: ['5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b'],
    soilRequirements: { ph: { min: 5.8, max: 8.0 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'low',
    spacing: { rows: 30, plants: 4 },
    yield: { typical: 85, unit: 'bushels' },
    marketValue: { avgPrice: 5.00, demand: 'moderate', stability: 'stable' },
    challenges: ['Sugarcane aphid', 'Head smut', 'Birds'],
    benefits: ['Drought tolerance', 'Heat tolerance', 'Late planting option', 'Multiple uses'],
    companions: ['cotton', 'soybeans'],
    rotationBenefits: ['Deep root system', 'Drought reserve crop']
  },

  // ========================================
  // FABACEAE FAMILY (LEGUMES)
  // ========================================

  'soybeans': {
    id: 'soybeans',
    name: 'Soybeans',
    scientificName: 'Glycine max',
    botanicalFamily: 'Fabaceae',
    category: 'legume',
    subCategory: 'oilseed',
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
    companions: ['corn-dent', 'winter-wheat'],
    rotationBenefits: ['Adds nitrogen to soil', 'Breaks pest cycles', 'Improves soil biology'],
    nutritionalValue: 'High protein (35-40%), high oil content (18-20%)'
  },

  'dry-beans': {
    id: 'dry-beans',
    name: 'Dry Beans',
    scientificName: 'Phaseolus vulgaris',
    botanicalFamily: 'Fabaceae',
    category: 'legume',
    subCategory: 'pulse',
    icon: 'sprout',
    plantingWindow: { start: '05-15', end: '06-30', optimal: 'Late May after soil warms to 60°F' },
    harvestWindow: { start: '08-15', end: '09-30', duration: 90 },
    climateZones: ['4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 30, plants: 4 },
    yield: { typical: 2200, unit: 'lbs' },
    marketValue: { avgPrice: 45.00, demand: 'moderate', stability: 'stable' },
    challenges: ['White mold', 'Bacterial blight', 'Bean beetle'],
    benefits: ['Nitrogen fixation', 'High protein', 'Premium pricing', 'Long storage'],
    companions: ['corn', 'squash'],
    rotationBenefits: ['Soil nitrogen addition', 'Disease break'],
    commonVarieties: ['Navy', 'Pinto', 'Black', 'Kidney']
  },

  'peas-field': {
    id: 'peas-field',
    name: 'Field Peas',
    scientificName: 'Pisum sativum',
    botanicalFamily: 'Fabaceae',
    category: 'legume',
    subCategory: 'pulse',
    icon: 'sprout',
    plantingWindow: { start: '03-15', end: '05-15', optimal: 'Early spring in cool weather' },
    harvestWindow: { start: '07-01', end: '08-15', duration: 85 },
    climateZones: ['2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b'],
    soilRequirements: { ph: { min: 6.0, max: 7.5 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 7, plants: 2 },
    yield: { typical: 35, unit: 'bushels' },
    marketValue: { avgPrice: 8.50, demand: 'moderate', stability: 'stable' },
    challenges: ['Powdery mildew', 'Root rot', 'Pea weevil'],
    benefits: ['Nitrogen fixation', 'Cool season crop', 'Soil improvement', 'Animal feed'],
    companions: ['barley', 'canola'],
    rotationBenefits: ['Early nitrogen release', 'Soil structure improvement']
  },

  'chickpeas': {
    id: 'chickpeas',
    name: 'Chickpeas (Garbanzo Beans)',
    scientificName: 'Cicer arietinum',
    botanicalFamily: 'Fabaceae',
    category: 'legume',
    subCategory: 'pulse',
    icon: 'sprout',
    plantingWindow: { start: '04-01', end: '06-01', optimal: 'Late spring after frost danger' },
    harvestWindow: { start: '08-15', end: '09-30', duration: 90 },
    climateZones: ['5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b'],
    soilRequirements: { ph: { min: 6.2, max: 7.8 }, drainage: 'well-drained', fertility: 'low' },
    waterRequirements: 'low',
    spacing: { rows: 30, plants: 4 },
    yield: { typical: 1800, unit: 'lbs' },
    marketValue: { avgPrice: 65.00, demand: 'high', stability: 'stable' },
    challenges: ['Ascochyta blight', 'Root rot', 'Heat stress'],
    benefits: ['Drought tolerance', 'High protein', 'Premium market', 'Nitrogen fixation'],
    companions: ['wheat', 'barley'],
    rotationBenefits: ['Nitrogen addition', 'Deep rooting'],
    nutritionalValue: 'High protein (20-25%), high fiber'
  },

  'lentils': {
    id: 'lentils',
    name: 'Lentils',
    scientificName: 'Lens culinaris',
    botanicalFamily: 'Fabaceae',
    category: 'legume',
    subCategory: 'pulse',
    icon: 'sprout',
    plantingWindow: { start: '04-15', end: '05-30', optimal: 'Late April to early May' },
    harvestWindow: { start: '08-01', end: '09-15', duration: 95 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a'],
    soilRequirements: { ph: { min: 6.0, max: 8.0 }, drainage: 'well-drained', fertility: 'low' },
    waterRequirements: 'low',
    spacing: { rows: 7, plants: 1 },
    yield: { typical: 1200, unit: 'lbs' },
    marketValue: { avgPrice: 75.00, demand: 'high', stability: 'stable' },
    challenges: ['Anthracnose', 'Root rot', 'Heat sensitivity'],
    benefits: ['High protein', 'Premium pricing', 'Nitrogen fixation', 'Drought tolerance'],
    companions: ['barley', 'flax'],
    rotationBenefits: ['Soil nitrogen addition', 'Disease break'],
    commonVarieties: ['Red', 'Green', 'Black']
  },

  // ========================================
  // SOLANACEAE FAMILY (NIGHTSHADES)
  // ========================================

  'potatoes': {
    id: 'potatoes',
    name: 'Potatoes',
    scientificName: 'Solanum tuberosum',
    botanicalFamily: 'Solanaceae',
    category: 'vegetable',
    subCategory: 'tuber',
    icon: 'sun',
    plantingWindow: { start: '04-15', end: '06-15', optimal: 'When soil temperature reaches 45°F' },
    harvestWindow: { start: '08-01', end: '10-15', duration: 90 },
    climateZones: ['2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a'],
    soilRequirements: { ph: { min: 5.0, max: 6.2 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 36, plants: 12 },
    yield: { typical: 400, unit: 'cwt' },
    marketValue: { avgPrice: 12.00, demand: 'high', stability: 'stable' },
    challenges: ['Late blight', 'Colorado potato beetle', 'Scab'],
    benefits: ['High yield', 'Multiple uses', 'Storage capability', 'High nutrition'],
    companions: ['beans', 'corn'],
    rotationBenefits: ['Avoid nightshade rotation', 'Heavy feeder'],
    commonVarieties: ['Russet', 'Red', 'Yukon Gold', 'Fingerling']
  },

  'tomatoes-processing': {
    id: 'tomatoes-processing',
    name: 'Processing Tomatoes',
    scientificName: 'Solanum lycopersicum',
    botanicalFamily: 'Solanaceae',
    category: 'vegetable',
    subCategory: 'fruit-vegetable',
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
    rotationBenefits: ['Avoid nightshade rotation'],
    commonVarieties: ['Paste', 'Sauce', 'Whole pack']
  },

  // ========================================
  // BRASSICACEAE FAMILY (CRUCIFERS)
  // ========================================

  'canola': {
    id: 'canola',
    name: 'Canola',
    scientificName: 'Brassica napus',
    botanicalFamily: 'Brassicaceae',
    category: 'oilseed',
    subCategory: 'oil-crop',
    icon: 'flower-2',
    plantingWindow: { start: '04-15', end: '05-30', optimal: 'Late April to early May' },
    harvestWindow: { start: '07-15', end: '08-30', duration: 90 },
    climateZones: ['2a', '2b', '3a', '3b', '4a', '4b', '5a'],
    soilRequirements: { ph: { min: 6.0, max: 7.5 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 7, plants: 1 },
    yield: { typical: 35, unit: 'bushels' },
    marketValue: { avgPrice: 18.50, demand: 'high', stability: 'volatile' },
    challenges: ['Flea beetles', 'Sclerotinia stem rot', 'Blackleg'],
    benefits: ['High oil content', 'Good rotation crop', 'Early harvest', 'Premium pricing'],
    companions: ['wheat', 'barley'],
    rotationBenefits: ['Disease break', 'Soil conditioning']
  },

  // ========================================
  // ASTERACEAE FAMILY (SUNFLOWER FAMILY)
  // ========================================

  'sunflowers': {
    id: 'sunflowers',
    name: 'Oil Sunflowers',
    scientificName: 'Helianthus annuus',
    botanicalFamily: 'Asteraceae',
    category: 'oilseed',
    subCategory: 'oil-crop',
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
    companions: ['beans', 'corn-dent'],
    rotationBenefits: ['Deep root system', 'Scavenges nutrients'],
    commonVarieties: ['Oil type', 'Confection type']
  },

  // ========================================
  // ROSACEAE FAMILY (ROSE FAMILY) - FRUITS
  // ========================================

  'apples': {
    id: 'apples',
    name: 'Apples',
    scientificName: 'Malus domestica',
    botanicalFamily: 'Rosaceae',
    category: 'fruit',
    subCategory: 'tree-fruit',
    icon: 'tree-pine',
    plantingWindow: { start: '03-01', end: '05-01', optimal: 'Early spring while dormant' },
    harvestWindow: { start: '08-15', end: '11-15', duration: 1095 }, // 3 years to production
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 240, plants: 120 }, // 20ft x 10ft spacing
    yield: { typical: 900, unit: 'bushels' },
    marketValue: { avgPrice: 28.00, demand: 'high', stability: 'stable' },
    challenges: ['Apple scab', 'Codling moth', 'Fire blight', 'Hail damage'],
    benefits: ['Long production life', 'High value', 'Storage capability', 'Multiple varieties'],
    companions: ['grass-cover', 'clover'],
    rotationBenefits: ['Perennial system', 'Soil protection'],
    commonVarieties: ['Red Delicious', 'Gala', 'Honeycrisp', 'Granny Smith']
  },

  // ========================================
  // VITACEAE FAMILY (GRAPE FAMILY)
  // ========================================

  'grapes-wine': {
    id: 'grapes-wine',
    name: 'Wine Grapes',
    scientificName: 'Vitis vinifera',
    botanicalFamily: 'Vitaceae',
    category: 'fruit',
    subCategory: 'vine-fruit',
    icon: 'tree-pine',
    plantingWindow: { start: '03-15', end: '05-15', optimal: 'Early spring while dormant' },
    harvestWindow: { start: '08-15', end: '10-15', duration: 1095 }, // 3 years to production
    climateZones: ['6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b'],
    soilRequirements: { ph: { min: 6.5, max: 7.5 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 108, plants: 72 }, // 9ft x 6ft spacing
    yield: { typical: 4, unit: 'tons' },
    marketValue: { avgPrice: 1200.00, demand: 'high', stability: 'volatile' },
    challenges: ['Powdery mildew', 'Phylloxera', 'Pierce\'s disease', 'Weather dependency'],
    benefits: ['High value crop', 'Long production life', 'Tourism potential', 'Premium markets'],
    companions: ['cover-crops', 'roses'],
    rotationBenefits: ['Perennial system', 'Erosion control'],
    commonVarieties: ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir', 'Merlot']
  },

  // ========================================
  // MALVACEAE FAMILY - FIBER CROPS
  // ========================================

  'cotton': {
    id: 'cotton',
    name: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    botanicalFamily: 'Malvaceae',
    category: 'fiber',
    subCategory: 'natural-fiber',
    icon: 'tree-pine',
    plantingWindow: { start: '04-15', end: '06-15', optimal: 'When soil temperature reaches 65°F' },
    harvestWindow: { start: '09-15', end: '12-15', duration: 160 },
    climateZones: ['7a', '7b', '8a', '8b', '9a', '9b', '10a'],
    soilRequirements: { ph: { min: 5.8, max: 8.0 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 38, plants: 4 },
    yield: { typical: 800, unit: 'lbs lint' },
    marketValue: { avgPrice: 0.70, demand: 'high', stability: 'volatile' },
    challenges: ['Boll weevil', 'Bollworm', 'Verticillium wilt', 'Weather sensitivity'],
    benefits: ['High value fiber', 'Multiple products', 'Established markets', 'Technology adoption'],
    companions: ['corn', 'sorghum'],
    rotationBenefits: ['Deep rooting', 'Residue management'],
    commonVarieties: ['Upland', 'Pima']
  },

  // ========================================
  // CUCURBITACEAE FAMILY (GOURD FAMILY)
  // ========================================

  'pumpkins': {
    id: 'pumpkins',
    name: 'Pumpkins',
    scientificName: 'Cucurbita pepo',
    botanicalFamily: 'Cucurbitaceae',
    category: 'vegetable',
    subCategory: 'vine-crop',
    icon: 'sun',
    plantingWindow: { start: '05-15', end: '07-01', optimal: 'Late May after soil warms' },
    harvestWindow: { start: '09-15', end: '10-31', duration: 110 },
    climateZones: ['4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 120, plants: 60 }, // 10ft x 5ft spacing
    yield: { typical: 20, unit: 'tons' },
    marketValue: { avgPrice: 180.00, demand: 'moderate', stability: 'seasonal' },
    challenges: ['Squash bugs', 'Powdery mildew', 'Bacterial wilt', 'Weather dependency'],
    benefits: ['High value specialty crop', 'Seasonal demand', 'Direct marketing', 'Agritourism'],
    companions: ['corn', 'beans'],
    rotationBenefits: ['Heavy feeder', 'Soil coverage'],
    commonVarieties: ['Jack-o-lantern', 'Pie', 'Miniature', 'Giant']
  }
};

// Category definitions for organization
export const CROP_CATEGORIES = {
  grain: {
    name: 'Grains & Cereals',
    description: 'Staple grain crops and cereal production',
    icon: 'wheat',
    families: ['Poaceae']
  },
  legume: {
    name: 'Legumes & Pulses', 
    description: 'Nitrogen-fixing crops and protein-rich legumes',
    icon: 'sprout',
    families: ['Fabaceae']
  },
  vegetable: {
    name: 'Vegetables',
    description: 'Fresh produce and vegetable crops',
    icon: 'sun',
    families: ['Solanaceae', 'Brassicaceae', 'Cucurbitaceae', 'Apiaceae']
  },
  fruit: {
    name: 'Fruits',
    description: 'Tree fruits, vine fruits, and berry crops',
    icon: 'tree-pine',
    families: ['Rosaceae', 'Vitaceae', 'Rutaceae']
  },
  oilseed: {
    name: 'Oil Seeds',
    description: 'Oil-producing crops and seeds',
    icon: 'flower-2',
    families: ['Asteraceae', 'Brassicaceae', 'Fabaceae']
  },
  fiber: {
    name: 'Fiber Crops',
    description: 'Natural fiber and textile crops',
    icon: 'tree-pine',
    families: ['Malvaceae', 'Linaceae']
  }
};

// Helper function to get crops by category
export function getCropsByCategory() {
  const categorized: Record<string, ComprehensiveCropOption[]> = {};
  
  Object.values(COMPREHENSIVE_CROP_DATABASE).forEach(crop => {
    if (!categorized[crop.category]) {
      categorized[crop.category] = [];
    }
    categorized[crop.category].push(crop);
  });
  
  // Sort crops within each category
  Object.keys(categorized).forEach(category => {
    categorized[category].sort((a, b) => a.name.localeCompare(b.name));
  });
  
  return categorized;
}

// Helper function to get crops by botanical family
export function getCropsByFamily() {
  const familyGrouped: Record<string, ComprehensiveCropOption[]> = {};
  
  Object.values(COMPREHENSIVE_CROP_DATABASE).forEach(crop => {
    if (!familyGrouped[crop.botanicalFamily]) {
      familyGrouped[crop.botanicalFamily] = [];
    }
    familyGrouped[crop.botanicalFamily].push(crop);
  });
  
  return familyGrouped;
}