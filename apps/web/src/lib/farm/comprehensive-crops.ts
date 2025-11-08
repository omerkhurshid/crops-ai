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
    marketValue: { avgPrice: 180.00, demand: 'moderate', stability: 'volatile' },
    challenges: ['Squash bugs', 'Powdery mildew', 'Bacterial wilt', 'Weather dependency'],
    benefits: ['High value specialty crop', 'Seasonal demand', 'Direct marketing', 'Agritourism'],
    companions: ['corn', 'beans'],
    rotationBenefits: ['Heavy feeder', 'Soil coverage'],
    commonVarieties: ['Jack-o-lantern', 'Pie', 'Miniature', 'Giant']
  },
  'cucumbers': {
    id: 'cucumbers',
    name: 'Cucumbers',
    scientificName: 'Cucumis sativus',
    botanicalFamily: 'Cucurbitaceae',
    category: 'vegetable',
    subCategory: 'vine-crop',
    icon: 'sun',
    plantingWindow: { start: '05-01', end: '07-15', optimal: 'After soil reaches 65°F' },
    harvestWindow: { start: '06-15', end: '09-30', duration: 60 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 60, plants: 12 },
    yield: { typical: 300, unit: 'bushels' },
    marketValue: { avgPrice: 25.00, demand: 'high', stability: 'stable' },
    challenges: ['Cucumber beetles', 'Bacterial wilt', 'Powdery mildew'],
    benefits: ['Fast growing', 'High yield', 'Multiple harvests', 'Fresh market demand'],
    companions: ['beans', 'peas', 'radishes'],
    rotationBenefits: ['Quick turnover', 'Good cover crop'],
    commonVarieties: ['Slicing', 'Pickling', 'Burpless', 'Armenian']
  },
  'watermelons': {
    id: 'watermelons',
    name: 'Watermelons',
    scientificName: 'Citrullus lanatus',
    botanicalFamily: 'Cucurbitaceae',
    category: 'fruit',
    subCategory: 'vine-crop',
    icon: 'sun',
    plantingWindow: { start: '05-15', end: '06-15', optimal: 'When soil is consistently 70°F+' },
    harvestWindow: { start: '07-15', end: '09-15', duration: 85 },
    climateZones: ['5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'high',
    spacing: { rows: 96, plants: 36 },
    yield: { typical: 25000, unit: 'lbs' },
    marketValue: { avgPrice: 0.15, demand: 'high', stability: 'stable' },
    challenges: ['Anthracnose', 'Fusarium wilt', 'Aphids', 'Space requirements'],
    benefits: ['High summer demand', 'Premium varieties', 'Direct sales potential'],
    companions: ['radishes', 'nasturtiums'],
    rotationBenefits: ['Deep rooting', 'Ground coverage'],
    commonVarieties: ['Seedless', 'Seeded', 'Mini', 'Yellow/Orange']
  },
  // ========================================
  // ALLIACEAE FAMILY (ONION FAMILY)
  // ========================================
  'onions': {
    id: 'onions',
    name: 'Onions',
    scientificName: 'Allium cepa',
    botanicalFamily: 'Alliaceae',
    category: 'vegetable',
    subCategory: 'bulb',
    icon: 'sun',
    plantingWindow: { start: '03-15', end: '05-01', optimal: 'Early spring for sets, fall for overwintering' },
    harvestWindow: { start: '07-01', end: '09-15', duration: 110 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'moderate',
    spacing: { rows: 12, plants: 4 },
    yield: { typical: 40000, unit: 'lbs' },
    marketValue: { avgPrice: 0.35, demand: 'high', stability: 'stable' },
    challenges: ['Onion maggots', 'Thrips', 'Botrytis', 'Storage requirements'],
    benefits: ['Long storage life', 'Year-round demand', 'Multiple varieties', 'Processing options'],
    companions: ['carrots', 'lettuce', 'beets'],
    rotationBenefits: ['Disease suppression', 'Soil improvement'],
    commonVarieties: ['Yellow', 'Red', 'White', 'Sweet']
  },
  'garlic': {
    id: 'garlic',
    name: 'Garlic',
    scientificName: 'Allium sativum',
    botanicalFamily: 'Alliaceae',
    category: 'vegetable',
    subCategory: 'bulb',
    icon: 'sun',
    plantingWindow: { start: '10-01', end: '11-15', optimal: 'Fall planting for cold vernalization' },
    harvestWindow: { start: '06-15', end: '07-31', duration: 240 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'moderate',
    spacing: { rows: 12, plants: 4 },
    yield: { typical: 10000, unit: 'lbs' },
    marketValue: { avgPrice: 15.00, demand: 'high', stability: 'stable' },
    challenges: ['White rot', 'Nematodes', 'Requires vernalization', 'Labor intensive'],
    benefits: ['Premium pricing', 'Long storage', 'High demand', 'Value-added potential'],
    companions: ['tomatoes', 'peppers', 'cabbage'],
    rotationBenefits: ['Natural pest deterrent', 'Soil health'],
    commonVarieties: ['Hardneck', 'Softneck', 'Elephant']
  },
  // ========================================
  // APIACEAE FAMILY (CARROT FAMILY)
  // ========================================
  'carrots': {
    id: 'carrots',
    name: 'Carrots',
    scientificName: 'Daucus carota',
    botanicalFamily: 'Apiaceae',
    category: 'vegetable',
    subCategory: 'root',
    icon: 'sun',
    plantingWindow: { start: '04-01', end: '07-15', optimal: 'Spring and succession plantings' },
    harvestWindow: { start: '06-15', end: '11-15', duration: 75 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a'],
    soilRequirements: { ph: { min: 6.0, max: 6.8 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 12, plants: 2 },
    yield: { typical: 30000, unit: 'lbs' },
    marketValue: { avgPrice: 0.45, demand: 'high', stability: 'stable' },
    challenges: ['Carrot rust fly', 'Root maggots', 'Requires loose soil', 'Slow germination'],
    benefits: ['Storage crop', 'Processing options', 'Baby carrot market', 'Year-round demand'],
    companions: ['onions', 'leeks', 'rosemary'],
    rotationBenefits: ['Deep rooting', 'Soil structure improvement'],
    commonVarieties: ['Nantes', 'Imperator', 'Chantenay', 'Rainbow']
  },
  'celery': {
    id: 'celery',
    name: 'Celery',
    scientificName: 'Apium graveolens',
    botanicalFamily: 'Apiaceae',
    category: 'vegetable',
    subCategory: 'stalk',
    icon: 'sun',
    plantingWindow: { start: '02-15', end: '04-01', optimal: 'Start indoors 10-12 weeks before last frost' },
    harvestWindow: { start: '07-01', end: '10-15', duration: 120 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'moderate', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 24, plants: 6 },
    yield: { typical: 60000, unit: 'lbs' },
    marketValue: { avgPrice: 1.25, demand: 'moderate', stability: 'stable' },
    challenges: ['Requires constant moisture', 'Blackheart', 'Aphids', 'Labor intensive'],
    benefits: ['High value crop', 'Steady demand', 'Juicing market', 'Long harvest window'],
    companions: ['tomatoes', 'beans', 'leeks'],
    rotationBenefits: ['Heavy feeder rotation'],
    commonVarieties: ['Pascal', 'Utah', 'Golden', 'Cutting celery']
  },
  // ========================================
  // ADDITIONAL BRASSICACEAE FAMILY
  // ========================================
  'cabbage': {
    id: 'cabbage',
    name: 'Cabbage',
    scientificName: 'Brassica oleracea var. capitata',
    botanicalFamily: 'Brassicaceae',
    category: 'vegetable',
    subCategory: 'cole-crop',
    icon: 'sun',
    plantingWindow: { start: '03-15', end: '07-15', optimal: 'Early spring and late summer for fall crop' },
    harvestWindow: { start: '06-01', end: '11-15', duration: 80 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b'],
    soilRequirements: { ph: { min: 6.0, max: 6.5 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'moderate',
    spacing: { rows: 24, plants: 12 },
    yield: { typical: 40000, unit: 'lbs' },
    marketValue: { avgPrice: 0.25, demand: 'moderate', stability: 'stable' },
    challenges: ['Cabbage worms', 'Aphids', 'Club root', 'Splitting'],
    benefits: ['Storage capability', 'Processing market', 'Sauerkraut production', 'Cold hardy'],
    companions: ['dill', 'onions', 'potatoes'],
    rotationBenefits: ['Biofumigation properties', 'Heavy feeder'],
    commonVarieties: ['Green', 'Red', 'Savoy', 'Napa']
  },
  'broccoli': {
    id: 'broccoli',
    name: 'Broccoli',
    scientificName: 'Brassica oleracea var. italica',
    botanicalFamily: 'Brassicaceae',
    category: 'vegetable',
    subCategory: 'cole-crop',
    icon: 'sun',
    plantingWindow: { start: '03-01', end: '08-15', optimal: 'Early spring and late summer' },
    harvestWindow: { start: '05-15', end: '11-30', duration: 70 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 30, plants: 18 },
    yield: { typical: 8000, unit: 'lbs' },
    marketValue: { avgPrice: 2.50, demand: 'high', stability: 'stable' },
    challenges: ['Cabbage worms', 'Aphids', 'Head rot', 'Temperature sensitivity'],
    benefits: ['High nutrition value', 'Premium pricing', 'Side shoot production', 'Fresh market demand'],
    companions: ['beets', 'onions', 'herbs'],
    rotationBenefits: ['Disease break', 'Soil improvement'],
    commonVarieties: ['Calabrese', 'Sprouting', 'Romanesco', 'Purple']
  },
  // ========================================
  // CHENOPODIACEAE FAMILY (GOOSEFOOT FAMILY)
  // ========================================
  'spinach': {
    id: 'spinach',
    name: 'Spinach',
    scientificName: 'Spinacia oleracea',
    botanicalFamily: 'Chenopodiaceae',
    category: 'vegetable',
    subCategory: 'leafy-green',
    icon: 'sprout',
    plantingWindow: { start: '03-01', end: '05-15', optimal: 'Early spring and fall' },
    harvestWindow: { start: '04-15', end: '06-30', duration: 45 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a'],
    soilRequirements: { ph: { min: 6.5, max: 7.0 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'moderate',
    spacing: { rows: 12, plants: 3 },
    yield: { typical: 8000, unit: 'lbs' },
    marketValue: { avgPrice: 3.50, demand: 'high', stability: 'stable' },
    challenges: ['Downy mildew', 'Aphids', 'Bolting in heat', 'Short harvest window'],
    benefits: ['Quick maturity', 'High nutrition', 'Baby leaf market', 'Multiple cuts'],
    companions: ['strawberries', 'radishes', 'cabbage'],
    rotationBenefits: ['Quick turnover', 'Soil coverage'],
    commonVarieties: ['Smooth leaf', 'Savoy', 'Semi-savoy', 'Baby spinach']
  },
  'sugar-beets': {
    id: 'sugar-beets',
    name: 'Sugar Beets',
    scientificName: 'Beta vulgaris',
    botanicalFamily: 'Chenopodiaceae',
    category: 'sugar',
    subCategory: 'root',
    icon: 'sun',
    plantingWindow: { start: '04-01', end: '05-15', optimal: 'As soon as soil can be worked' },
    harvestWindow: { start: '09-15', end: '11-15', duration: 160 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a'],
    soilRequirements: { ph: { min: 6.5, max: 7.5 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'moderate',
    spacing: { rows: 22, plants: 5 },
    yield: { typical: 25, unit: 'tons' },
    marketValue: { avgPrice: 65.00, demand: 'moderate', stability: 'stable' },
    challenges: ['Cercospora leaf spot', 'Rhizoctonia', 'Nematodes', 'Processing contracts required'],
    benefits: ['Contract stability', 'Rotation benefits', 'Biofuel potential', 'Livestock feed byproduct'],
    companions: ['beans', 'onions'],
    rotationBenefits: ['Deep taproot', 'Reduces nematodes'],
    commonVarieties: ['Rhizoctonia resistant', 'High sugar content', 'Early harvest']
  },
  // ========================================
  // ASTERACEAE FAMILY (LETTUCE/SUNFLOWER)
  // ========================================
  'lettuce': {
    id: 'lettuce',
    name: 'Lettuce',
    scientificName: 'Lactuca sativa',
    botanicalFamily: 'Asteraceae',
    category: 'vegetable',
    subCategory: 'leafy-green',
    icon: 'sprout',
    plantingWindow: { start: '03-15', end: '08-15', optimal: 'Cool season succession plantings' },
    harvestWindow: { start: '05-01', end: '10-31', duration: 50 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'high',
    spacing: { rows: 12, plants: 10 },
    yield: { typical: 25000, unit: 'lbs' },
    marketValue: { avgPrice: 1.75, demand: 'high', stability: 'stable' },
    challenges: ['Tip burn', 'Bottom rot', 'Aphids', 'Heat stress'],
    benefits: ['Quick turnover', 'Multiple varieties', 'Year-round demand', 'Baby leaf market'],
    companions: ['carrots', 'radishes', 'chives'],
    rotationBenefits: ['Fast growing', 'Soil coverage'],
    commonVarieties: ['Romaine', 'Iceberg', 'Butterhead', 'Leaf lettuce']
  },
  // ========================================
  // ADDITIONAL SOLANACEAE FAMILY
  // ========================================
  'peppers-bell': {
    id: 'peppers-bell',
    name: 'Bell Peppers',
    scientificName: 'Capsicum annuum',
    botanicalFamily: 'Solanaceae',
    category: 'vegetable',
    subCategory: 'fruit-vegetable',
    icon: 'sun',
    plantingWindow: { start: '05-15', end: '06-15', optimal: 'After soil reaches 65°F' },
    harvestWindow: { start: '07-15', end: '10-15', duration: 80 },
    climateZones: ['4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a'],
    soilRequirements: { ph: { min: 6.0, max: 6.8 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'moderate',
    spacing: { rows: 30, plants: 18 },
    yield: { typical: 30000, unit: 'lbs' },
    marketValue: { avgPrice: 1.50, demand: 'high', stability: 'volatile' },
    challenges: ['Bacterial spot', 'Aphids', 'Blossom end rot', 'Sunscald'],
    benefits: ['Premium colored varieties', 'Extended harvest', 'Fresh market demand', 'Greenhouse option'],
    companions: ['tomatoes', 'basil', 'carrots'],
    rotationBenefits: ['Nightshade rotation'],
    commonVarieties: ['Green', 'Red', 'Yellow', 'Orange', 'Purple']
  },
  'peppers-hot': {
    id: 'peppers-hot',
    name: 'Hot Peppers',
    scientificName: 'Capsicum spp.',
    botanicalFamily: 'Solanaceae',
    category: 'vegetable',
    subCategory: 'spice',
    icon: 'sun',
    plantingWindow: { start: '05-15', end: '06-15', optimal: 'After soil reaches 70°F' },
    harvestWindow: { start: '07-15', end: '10-31', duration: 90 },
    climateZones: ['5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b'],
    soilRequirements: { ph: { min: 6.0, max: 6.8 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 30, plants: 18 },
    yield: { typical: 8000, unit: 'lbs' },
    marketValue: { avgPrice: 4.50, demand: 'high', stability: 'stable' },
    challenges: ['Aphids', 'Pepper weevil', 'Viruses', 'Cross-pollination'],
    benefits: ['Value-added products', 'Specialty markets', 'Long shelf life', 'Ethnic markets'],
    companions: ['basil', 'oregano', 'tomatoes'],
    rotationBenefits: ['Natural pest deterrent'],
    commonVarieties: ['Jalapeño', 'Habanero', 'Cayenne', 'Thai', 'Ghost pepper']
  },
  'eggplant': {
    id: 'eggplant',
    name: 'Eggplant',
    scientificName: 'Solanum melongena',
    botanicalFamily: 'Solanaceae',
    category: 'vegetable',
    subCategory: 'fruit-vegetable',
    icon: 'sun',
    plantingWindow: { start: '05-15', end: '06-30', optimal: 'When night temps stay above 50°F' },
    harvestWindow: { start: '07-15', end: '10-15', duration: 80 },
    climateZones: ['5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a'],
    soilRequirements: { ph: { min: 5.5, max: 6.8 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 36, plants: 24 },
    yield: { typical: 35000, unit: 'lbs' },
    marketValue: { avgPrice: 1.25, demand: 'moderate', stability: 'stable' },
    challenges: ['Flea beetles', 'Verticillium wilt', 'Cold sensitive', 'Colorado potato beetle'],
    benefits: ['Ethnic market demand', 'Multiple varieties', 'Extended harvest', 'Ornamental value'],
    companions: ['peppers', 'beans', 'peas'],
    rotationBenefits: ['Nightshade rotation'],
    commonVarieties: ['Black Beauty', 'Japanese', 'Italian', 'White', 'Thai']
  },
  // ========================================
  // LINACEAE FAMILY (FLAX FAMILY)
  // ========================================
  'flax': {
    id: 'flax',
    name: 'Flax (Linseed)',
    scientificName: 'Linum usitatissimum',
    botanicalFamily: 'Linaceae',
    category: 'oilseed',
    subCategory: 'fiber-oil',
    icon: 'flower-2',
    plantingWindow: { start: '04-15', end: '05-30', optimal: 'Early spring when soil is 50°F' },
    harvestWindow: { start: '08-01', end: '09-15', duration: 100 },
    climateZones: ['2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 6, plants: 1 },
    yield: { typical: 25, unit: 'bushels' },
    marketValue: { avgPrice: 22.00, demand: 'moderate', stability: 'volatile' },
    challenges: ['Pasmo disease', 'Fusarium wilt', 'Aster yellows', 'Market volatility'],
    benefits: ['Omega-3 market', 'Fiber production', 'Industrial uses', 'Good rotation crop'],
    companions: ['wheat', 'barley'],
    rotationBenefits: ['Disease break', 'Soil conditioning'],
    commonVarieties: ['Brown seed', 'Golden seed', 'Fiber types']
  },
  // ========================================
  // ADDITIONAL GRAIN CROPS
  // ========================================
  'rye': {
    id: 'rye',
    name: 'Rye',
    scientificName: 'Secale cereale',
    botanicalFamily: 'Poaceae',
    category: 'grain',
    subCategory: 'cereal',
    icon: 'wheat',
    plantingWindow: { start: '09-01', end: '10-15', optimal: 'Early fall for winter rye' },
    harvestWindow: { start: '06-15', end: '07-31', duration: 280 },
    climateZones: ['2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a'],
    soilRequirements: { ph: { min: 5.0, max: 7.0 }, drainage: 'any', fertility: 'low' },
    waterRequirements: 'low',
    spacing: { rows: 7, plants: 1 },
    yield: { typical: 40, unit: 'bushels' },
    marketValue: { avgPrice: 5.75, demand: 'moderate', stability: 'stable' },
    challenges: ['Ergot', 'Limited markets', 'Lodging', 'Volunteer issues'],
    benefits: ['Winter hardy', 'Poor soil tolerance', 'Cover crop value', 'Erosion control'],
    companions: ['legumes', 'clover'],
    rotationBenefits: ['Excellent cover crop', 'Weed suppression'],
    commonVarieties: ['Winter rye', 'Spring rye', 'Hybrid rye']
  },
  'millet': {
    id: 'millet',
    name: 'Pearl Millet',
    scientificName: 'Pennisetum glaucum',
    botanicalFamily: 'Poaceae',
    category: 'grain',
    subCategory: 'cereal',
    icon: 'wheat',
    plantingWindow: { start: '05-15', end: '07-01', optimal: 'When soil reaches 65°F' },
    harvestWindow: { start: '08-15', end: '10-15', duration: 75 },
    climateZones: ['5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a'],
    soilRequirements: { ph: { min: 5.5, max: 7.0 }, drainage: 'well-drained', fertility: 'low' },
    waterRequirements: 'low',
    spacing: { rows: 30, plants: 3 },
    yield: { typical: 50, unit: 'bushels' },
    marketValue: { avgPrice: 8.50, demand: 'moderate', stability: 'stable' },
    challenges: ['Bird damage', 'Limited markets', 'Chinch bugs', 'Harvest timing'],
    benefits: ['Drought tolerance', 'Quick maturity', 'Gluten-free market', 'Forage option'],
    companions: ['legumes', 'sorghum'],
    rotationBenefits: ['Summer annual option', 'Low input'],
    commonVarieties: ['Grain types', 'Forage types', 'Hybrid pearl']
  },
  'quinoa': {
    id: 'quinoa',
    name: 'Quinoa',
    scientificName: 'Chenopodium quinoa',
    botanicalFamily: 'Chenopodiaceae',
    category: 'grain',
    subCategory: 'pseudocereal',
    icon: 'wheat',
    plantingWindow: { start: '04-15', end: '06-01', optimal: 'After last frost when soil is 60°F' },
    harvestWindow: { start: '08-15', end: '10-15', duration: 120 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a'],
    soilRequirements: { ph: { min: 6.0, max: 8.5 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'low',
    spacing: { rows: 14, plants: 4 },
    yield: { typical: 1200, unit: 'lbs' },
    marketValue: { avgPrice: 2.50, demand: 'high', stability: 'stable' },
    challenges: ['Saponin removal', 'Harvest equipment', 'Processing requirements', 'Weed competition'],
    benefits: ['Premium pricing', 'Gluten-free', 'Complete protein', 'Drought tolerance'],
    companions: ['beans', 'mint'],
    rotationBenefits: ['Different pest profile', 'Soil improvement'],
    commonVarieties: ['White', 'Red', 'Black', 'Rainbow']
  },
  // ========================================
  // NUT CROPS
  // ========================================
  'almonds': {
    id: 'almonds',
    name: 'Almonds',
    scientificName: 'Prunus dulcis',
    botanicalFamily: 'Rosaceae',
    category: 'nut',
    subCategory: 'tree-nut',
    icon: 'tree-pine',
    plantingWindow: { start: '01-15', end: '03-15', optimal: 'Bare root in dormant season' },
    harvestWindow: { start: '08-15', end: '10-15', duration: 1460 }, // 4 years to production
    climateZones: ['7a', '7b', '8a', '8b', '9a', '9b', '10a'],
    soilRequirements: { ph: { min: 6.0, max: 7.5 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 264, plants: 180 }, // 22ft x 15ft
    yield: { typical: 2000, unit: 'lbs shelled' },
    marketValue: { avgPrice: 2.75, demand: 'high', stability: 'volatile' },
    challenges: ['Frost damage', 'Navel orangeworm', 'Water requirements', 'Bee dependency'],
    benefits: ['Long production life', 'High value', 'Mechanized harvest', 'Export demand'],
    companions: ['cover-crops'],
    rotationBenefits: ['Permanent crop', 'Carbon sequestration'],
    commonVarieties: ['Nonpareil', 'Carmel', 'Monterey', 'Butte']
  },
  'walnuts': {
    id: 'walnuts',
    name: 'Walnuts',
    scientificName: 'Juglans regia',
    botanicalFamily: 'Juglandaceae',
    category: 'nut',
    subCategory: 'tree-nut',
    icon: 'tree-pine',
    plantingWindow: { start: '01-15', end: '03-15', optimal: 'Dormant season planting' },
    harvestWindow: { start: '09-15', end: '11-15', duration: 2190 }, // 6 years to production
    climateZones: ['5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a'],
    soilRequirements: { ph: { min: 6.0, max: 7.5 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 360, plants: 300 }, // 30ft x 25ft
    yield: { typical: 3, unit: 'tons in-shell' },
    marketValue: { avgPrice: 0.65, demand: 'moderate', stability: 'stable' },
    challenges: ['Codling moth', 'Walnut blight', 'Husk fly', 'Long establishment'],
    benefits: ['Timber value', 'Long life', 'Processing options', 'Health food market'],
    companions: ['nitrogen-fixing-cover'],
    rotationBenefits: ['Agroforestry potential', 'Wildlife habitat'],
    commonVarieties: ['Chandler', 'Howard', 'Tulare', 'Serr']
  },
  'pecans': {
    id: 'pecans',
    name: 'Pecans',
    scientificName: 'Carya illinoinensis',
    botanicalFamily: 'Juglandaceae',
    category: 'nut',
    subCategory: 'tree-nut',
    icon: 'tree-pine',
    plantingWindow: { start: '01-15', end: '03-15', optimal: 'Late winter while dormant' },
    harvestWindow: { start: '10-01', end: '12-15', duration: 2555 }, // 7 years to production
    climateZones: ['6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b'],
    soilRequirements: { ph: { min: 6.0, max: 7.0 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 480, plants: 480 }, // 40ft x 40ft
    yield: { typical: 1200, unit: 'lbs in-shell' },
    marketValue: { avgPrice: 2.25, demand: 'high', stability: 'volatile' },
    challenges: ['Pecan scab', 'Aphids', 'Alternate bearing', 'Long establishment'],
    benefits: ['Native crop', 'Long production life', 'Holiday demand', 'Shade value'],
    companions: ['legume-cover'],
    rotationBenefits: ['Silvopasture potential', 'Carbon storage'],
    commonVarieties: ['Desirable', 'Pawnee', 'Stuart', 'Kiowa']
  },
  // ========================================
  // BERRY CROPS
  // ========================================
  'strawberries': {
    id: 'strawberries',
    name: 'Strawberries',
    scientificName: 'Fragaria × ananassa',
    botanicalFamily: 'Rosaceae',
    category: 'fruit',
    subCategory: 'berry',
    icon: 'tree-pine',
    plantingWindow: { start: '04-01', end: '05-15', optimal: 'Early spring for June-bearing' },
    harvestWindow: { start: '05-15', end: '07-15', duration: 60 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a'],
    soilRequirements: { ph: { min: 5.5, max: 6.8 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 42, plants: 12 },
    yield: { typical: 15000, unit: 'lbs' },
    marketValue: { avgPrice: 3.50, demand: 'high', stability: 'volatile' },
    challenges: ['Gray mold', 'Spider mites', 'Labor intensive', 'Short shelf life'],
    benefits: ['U-pick potential', 'High value', 'Quick return', 'Value-added options'],
    companions: ['borage', 'thyme', 'lettuce'],
    rotationBenefits: ['Annual rotation possible'],
    commonVarieties: ['June-bearing', 'Everbearing', 'Day-neutral']
  },
  'blueberries': {
    id: 'blueberries',
    name: 'Blueberries',
    scientificName: 'Vaccinium corymbosum',
    botanicalFamily: 'Ericaceae',
    category: 'fruit',
    subCategory: 'berry',
    icon: 'tree-pine',
    plantingWindow: { start: '03-01', end: '05-01', optimal: 'Early spring or fall' },
    harvestWindow: { start: '06-15', end: '08-31', duration: 1095 }, // 3 years to full production
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b'],
    soilRequirements: { ph: { min: 4.5, max: 5.5 }, drainage: 'well-drained', fertility: 'moderate' },
    waterRequirements: 'high',
    spacing: { rows: 120, plants: 60 }, // 10ft x 5ft
    yield: { typical: 8000, unit: 'lbs' },
    marketValue: { avgPrice: 4.50, demand: 'high', stability: 'stable' },
    challenges: ['Soil pH requirements', 'Bird pressure', 'SWD', 'Establishment cost'],
    benefits: ['Long production life', 'U-pick market', 'Fresh market premium', 'Freezing option'],
    companions: ['azaleas', 'rhododendrons'],
    rotationBenefits: ['Perennial system', 'Pollinator support'],
    commonVarieties: ['Northern highbush', 'Southern highbush', 'Rabbiteye']
  },
  // ========================================
  // FORAGE CROPS
  // ========================================
  'alfalfa': {
    id: 'alfalfa',
    name: 'Alfalfa',
    scientificName: 'Medicago sativa',
    botanicalFamily: 'Fabaceae',
    category: 'forage',
    subCategory: 'legume-hay',
    icon: 'sprout',
    plantingWindow: { start: '04-01', end: '05-15', optimal: 'Spring or late summer' },
    harvestWindow: { start: '05-15', end: '10-15', duration: 60 },
    climateZones: ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a'],
    soilRequirements: { ph: { min: 6.5, max: 7.5 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'moderate',
    spacing: { rows: 7, plants: 0 }, // broadcast or drilled
    yield: { typical: 6, unit: 'tons dry matter' },
    marketValue: { avgPrice: 180.00, demand: 'high', stability: 'stable' },
    challenges: ['Alfalfa weevil', 'Potato leafhopper', 'Winter kill', 'Stand establishment'],
    benefits: ['Nitrogen fixation', 'Multiple cuts', 'High protein', 'Dairy demand'],
    companions: ['grass-mixtures'],
    rotationBenefits: ['Soil improvement', 'Deep rooting'],
    commonVarieties: ['Fall dormancy 4-5', 'Round-up ready', 'Low lignin']
  },
  'timothy': {
    id: 'timothy',
    name: 'Timothy Grass',
    scientificName: 'Phleum pratense',
    botanicalFamily: 'Poaceae',
    category: 'forage',
    subCategory: 'grass-hay',
    icon: 'wheat',
    plantingWindow: { start: '04-01', end: '05-15', optimal: 'Early spring or late summer' },
    harvestWindow: { start: '06-15', end: '09-30', duration: 60 },
    climateZones: ['2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a'],
    soilRequirements: { ph: { min: 5.5, max: 7.0 }, drainage: 'moderate', fertility: 'moderate' },
    waterRequirements: 'moderate',
    spacing: { rows: 7, plants: 0 }, // broadcast or drilled
    yield: { typical: 3, unit: 'tons dry matter' },
    marketValue: { avgPrice: 150.00, demand: 'moderate', stability: 'stable' },
    challenges: ['Slow establishment', 'Summer dormancy', 'Lower yield than alfalfa'],
    benefits: ['Horse hay market', 'Winter hardy', 'Non-bloating', 'Easy to cure'],
    companions: ['clover', 'alfalfa'],
    rotationBenefits: ['Sod formation', 'Erosion control'],
    commonVarieties: ['Early maturity', 'Late maturity', 'Improved varieties']
  },
  // ========================================
  // ADDITIONAL SPECIALTY CROPS
  // ========================================
  'hops': {
    id: 'hops',
    name: 'Hops',
    scientificName: 'Humulus lupulus',
    botanicalFamily: 'Cannabaceae',
    category: 'industrial',
    subCategory: 'brewing',
    icon: 'flower-2',
    plantingWindow: { start: '04-01', end: '05-15', optimal: 'After last frost' },
    harvestWindow: { start: '08-15', end: '09-30', duration: 1095 }, // 3 years to full production
    climateZones: ['4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a'],
    soilRequirements: { ph: { min: 6.0, max: 7.5 }, drainage: 'well-drained', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 168, plants: 42 }, // 14ft x 3.5ft
    yield: { typical: 1800, unit: 'lbs dried' },
    marketValue: { avgPrice: 5.50, demand: 'moderate', stability: 'volatile' },
    challenges: ['Downy mildew', 'Spider mites', 'Trellis system cost', 'Processing requirements'],
    benefits: ['Craft brewery demand', 'Perennial crop', 'Contract potential', 'Agritourism'],
    companions: ['cover-crops'],
    rotationBenefits: ['Vertical growing', 'Unique market'],
    commonVarieties: ['Cascade', 'Centennial', 'Chinook', 'Citra']
  },
  'lavender': {
    id: 'lavender',
    name: 'Lavender',
    scientificName: 'Lavandula angustifolia',
    botanicalFamily: 'Lamiaceae',
    category: 'spice',
    subCategory: 'herb',
    icon: 'flower-2',
    plantingWindow: { start: '04-15', end: '06-01', optimal: 'After last frost' },
    harvestWindow: { start: '06-15', end: '08-15', duration: 90 },
    climateZones: ['5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a'],
    soilRequirements: { ph: { min: 6.5, max: 8.0 }, drainage: 'well-drained', fertility: 'low' },
    waterRequirements: 'low',
    spacing: { rows: 36, plants: 24 },
    yield: { typical: 1000, unit: 'bundles' },
    marketValue: { avgPrice: 15.00, demand: 'high', stability: 'stable' },
    challenges: ['Root rot in wet soils', 'Winter damage', 'Harvest timing', 'Drying requirements'],
    benefits: ['Value-added products', 'Agritourism', 'Essential oil market', 'Low maintenance'],
    companions: ['rosemary', 'thyme'],
    rotationBenefits: ['Pollinator support', 'Deer resistant'],
    commonVarieties: ['English', 'French', 'Spanish', 'Hybrid']
  },
  'sugarcane': {
    id: 'sugarcane',
    name: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    botanicalFamily: 'Poaceae',
    category: 'sugar',
    subCategory: 'cane',
    icon: 'wheat',
    plantingWindow: { start: '08-15', end: '10-15', optimal: 'Late summer/early fall planting' },
    harvestWindow: { start: '10-01', end: '03-31', duration: 365 },
    climateZones: ['9a', '9b', '10a', '10b', '11a', '11b'],
    soilRequirements: { ph: { min: 5.5, max: 7.5 }, drainage: 'moderate', fertility: 'high' },
    waterRequirements: 'high',
    spacing: { rows: 60, plants: 0 }, // continuous planting
    yield: { typical: 35, unit: 'tons' },
    marketValue: { avgPrice: 35.00, demand: 'moderate', stability: 'stable' },
    challenges: ['Mosaic virus', 'Borers', 'Ratoon stunting', 'Processing infrastructure'],
    benefits: ['Ethanol production', 'Multiple harvests', 'Soil conservation', 'Byproduct value'],
    companions: ['legume-rotation'],
    rotationBenefits: ['Soil organic matter', 'Weed suppression'],
    commonVarieties: ['Commercial hybrids', 'Energy cane varieties']
  }
};
// Category definitions for organization
export const CROP_CATEGORIES = {
  grain: {
    name: 'Grains & Cereals',
    description: 'Staple grain crops and cereal production',
    icon: 'wheat',
    families: ['Poaceae', 'Chenopodiaceae']
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
    families: ['Solanaceae', 'Brassicaceae', 'Cucurbitaceae', 'Apiaceae', 'Alliaceae', 'Chenopodiaceae', 'Asteraceae']
  },
  fruit: {
    name: 'Fruits',
    description: 'Tree fruits, vine fruits, and berry crops',
    icon: 'tree-pine',
    families: ['Rosaceae', 'Vitaceae', 'Rutaceae', 'Ericaceae', 'Cucurbitaceae']
  },
  oilseed: {
    name: 'Oil Seeds',
    description: 'Oil-producing crops and seeds',
    icon: 'flower-2',
    families: ['Asteraceae', 'Brassicaceae', 'Fabaceae', 'Linaceae']
  },
  fiber: {
    name: 'Fiber Crops',
    description: 'Natural fiber and textile crops',
    icon: 'tree-pine',
    families: ['Malvaceae', 'Linaceae']
  },
  nut: {
    name: 'Nuts',
    description: 'Tree nuts and nut crops',
    icon: 'tree-pine',
    families: ['Rosaceae', 'Juglandaceae']
  },
  sugar: {
    name: 'Sugar Crops',
    description: 'Sugar-producing crops',
    icon: 'sun',
    families: ['Chenopodiaceae', 'Poaceae']
  },
  forage: {
    name: 'Forage & Feed',
    description: 'Livestock feed and forage crops',
    icon: 'sprout',
    families: ['Fabaceae', 'Poaceae']
  },
  spice: {
    name: 'Herbs & Spices',
    description: 'Culinary and aromatic herbs',
    icon: 'flower-2',
    families: ['Solanaceae', 'Lamiaceae']
  },
  industrial: {
    name: 'Industrial Crops',
    description: 'Specialty and industrial crops',
    icon: 'flower-2',
    families: ['Cannabaceae']
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