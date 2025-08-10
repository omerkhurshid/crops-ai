export interface CropCategory {
  id: string
  name: string
  icon: string
  description: string
  items: CropItem[]
}

export interface CropItem {
  id: string
  name: string
  scientificName?: string
  growingSeasonDays?: number
  primaryHarvestSeason?: string[]
  commonVarieties?: string[]
  monitoringParameters: string[]
}

export interface LivestockCategory {
  id: string
  name: string
  icon: string
  description: string
  items: LivestockItem[]
}

export interface LivestockItem {
  id: string
  name: string
  scientificName?: string
  primaryPurpose: string[]
  typicalHerdSize?: string
  housingRequirements?: string
  monitoringParameters: string[]
}

export const cropCategories: CropCategory[] = [
  {
    id: 'grains-cereals',
    name: 'Grains & Cereals',
    icon: '🌾',
    description: 'Staple grain crops and cereal production',
    items: [
      {
        id: 'wheat',
        name: 'Wheat',
        scientificName: 'Triticum aestivum',
        growingSeasonDays: 120,
        primaryHarvestSeason: ['Summer', 'Fall'],
        commonVarieties: ['Hard Red Winter', 'Soft Red Winter', 'Hard Red Spring', 'Durum'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Temperature', 'Precipitation', 'Growth Stage', 'Disease Detection']
      },
      {
        id: 'corn',
        name: 'Corn/Maize',
        scientificName: 'Zea mays',
        growingSeasonDays: 100,
        primaryHarvestSeason: ['Fall'],
        commonVarieties: ['Dent Corn', 'Sweet Corn', 'Flint Corn', 'Popcorn'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Temperature', 'Nitrogen Levels', 'Pest Detection']
      },
      {
        id: 'rice',
        name: 'Rice',
        scientificName: 'Oryza sativa',
        growingSeasonDays: 105,
        primaryHarvestSeason: ['Fall'],
        commonVarieties: ['Japonica', 'Indica', 'Jasmine', 'Basmati'],
        monitoringParameters: ['Water Level', 'NDVI', 'Temperature', 'Disease Detection', 'Growth Stage']
      },
      {
        id: 'barley',
        name: 'Barley',
        scientificName: 'Hordeum vulgare',
        growingSeasonDays: 90,
        primaryHarvestSeason: ['Summer'],
        commonVarieties: ['Six-row', 'Two-row', 'Hulless'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Temperature', 'Disease Detection']
      },
      {
        id: 'oats',
        name: 'Oats',
        scientificName: 'Avena sativa',
        growingSeasonDays: 100,
        primaryHarvestSeason: ['Summer', 'Fall'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Temperature', 'Growth Stage']
      }
    ]
  },
  {
    id: 'fruits-tree-crops',
    name: 'Fruits & Tree Crops',
    icon: '🍎',
    description: 'Orchards, vineyards, and perennial fruit production',
    items: [
      {
        id: 'apples',
        name: 'Apples',
        scientificName: 'Malus domestica',
        primaryHarvestSeason: ['Fall'],
        commonVarieties: ['Red Delicious', 'Granny Smith', 'Gala', 'Honeycrisp'],
        monitoringParameters: ['NDVI', 'Canopy Health', 'Pest Detection', 'Fruit Development', 'Soil Moisture']
      },
      {
        id: 'grapes',
        name: 'Grapes',
        scientificName: 'Vitis vinifera',
        primaryHarvestSeason: ['Fall'],
        commonVarieties: ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir', 'Merlot'],
        monitoringParameters: ['NDVI', 'Canopy Health', 'Sugar Content', 'Disease Detection', 'Weather Conditions']
      },
      {
        id: 'citrus',
        name: 'Citrus Fruits',
        scientificName: 'Citrus spp.',
        primaryHarvestSeason: ['Winter', 'Spring'],
        commonVarieties: ['Orange', 'Lemon', 'Lime', 'Grapefruit'],
        monitoringParameters: ['NDVI', 'Canopy Health', 'Pest Detection', 'Soil Moisture', 'Temperature']
      }
    ]
  },
  {
    id: 'vegetables-leafy',
    name: 'Vegetables & Leafy Greens',
    icon: '🥬',
    description: 'Fresh produce, vegetables, and leafy green production',
    items: [
      {
        id: 'lettuce',
        name: 'Lettuce',
        scientificName: 'Lactuca sativa',
        growingSeasonDays: 65,
        primaryHarvestSeason: ['Spring', 'Fall'],
        commonVarieties: ['Iceberg', 'Romaine', 'Butterhead', 'Leaf'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Temperature', 'Pest Detection', 'Growth Stage']
      },
      {
        id: 'tomatoes',
        name: 'Tomatoes',
        scientificName: 'Solanum lycopersicum',
        growingSeasonDays: 80,
        primaryHarvestSeason: ['Summer', 'Fall'],
        commonVarieties: ['Beefsteak', 'Cherry', 'Roma', 'Heirloom'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Temperature', 'Disease Detection', 'Fruit Development']
      },
      {
        id: 'potatoes',
        name: 'Potatoes',
        scientificName: 'Solanum tuberosum',
        growingSeasonDays: 90,
        primaryHarvestSeason: ['Fall'],
        commonVarieties: ['Russet', 'Red', 'Yukon Gold', 'Fingerling'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Temperature', 'Disease Detection', 'Tuber Development']
      }
    ]
  },
  {
    id: 'legumes-pulses',
    name: 'Legumes & Pulses',
    icon: '🫘',
    description: 'Nitrogen-fixing crops and protein-rich legumes',
    items: [
      {
        id: 'soybeans',
        name: 'Soybeans',
        scientificName: 'Glycine max',
        growingSeasonDays: 100,
        primaryHarvestSeason: ['Fall'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Nitrogen Levels', 'Pod Development', 'Disease Detection']
      },
      {
        id: 'chickpeas',
        name: 'Chickpeas',
        scientificName: 'Cicer arietinum',
        growingSeasonDays: 90,
        primaryHarvestSeason: ['Summer'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Temperature', 'Pod Development']
      }
    ]
  },
  {
    id: 'cash-fiber',
    name: 'Cash & Fiber Crops',
    icon: '🌿',
    description: 'Commercial and industrial crop production',
    items: [
      {
        id: 'cotton',
        name: 'Cotton',
        scientificName: 'Gossypium spp.',
        growingSeasonDays: 160,
        primaryHarvestSeason: ['Fall'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Temperature', 'Pest Detection', 'Boll Development']
      },
      {
        id: 'sugarcane',
        name: 'Sugarcane',
        scientificName: 'Saccharum officinarum',
        growingSeasonDays: 365,
        primaryHarvestSeason: ['Winter'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Sugar Content', 'Growth Stage']
      }
    ]
  },
  {
    id: 'oil-seeds-nuts',
    name: 'Oil Seeds & Nuts',
    icon: '🥜',
    description: 'Oil-producing crops and tree nuts',
    items: [
      {
        id: 'sunflower',
        name: 'Sunflower',
        scientificName: 'Helianthus annuus',
        growingSeasonDays: 90,
        primaryHarvestSeason: ['Fall'],
        monitoringParameters: ['NDVI', 'Soil Moisture', 'Head Development', 'Oil Content']
      },
      {
        id: 'almonds',
        name: 'Almonds',
        scientificName: 'Prunus dulcis',
        primaryHarvestSeason: ['Fall'],
        monitoringParameters: ['NDVI', 'Canopy Health', 'Nut Development', 'Water Stress', 'Pest Detection']
      }
    ]
  }
]

export const livestockCategories: LivestockCategory[] = [
  {
    id: 'dairy-cattle',
    name: 'Dairy Cattle',
    icon: '🐄',
    description: 'Milk-producing cattle operations',
    items: [
      {
        id: 'holstein',
        name: 'Holstein',
        scientificName: 'Bos taurus',
        primaryPurpose: ['Milk Production'],
        typicalHerdSize: '50-500 head',
        housingRequirements: 'Dairy barn with milking parlor',
        monitoringParameters: ['Pasture Health', 'Water Sources', 'Milk Production', 'Animal Health', 'Feed Quality']
      },
      {
        id: 'jersey',
        name: 'Jersey',
        scientificName: 'Bos taurus',
        primaryPurpose: ['High-Fat Milk Production'],
        typicalHerdSize: '30-200 head',
        housingRequirements: 'Dairy barn with milking parlor',
        monitoringParameters: ['Pasture Health', 'Water Sources', 'Milk Production', 'Animal Health', 'Feed Quality']
      }
    ]
  },
  {
    id: 'beef-cattle',
    name: 'Beef Cattle',
    icon: '🥩',
    description: 'Meat-producing cattle operations',
    items: [
      {
        id: 'angus',
        name: 'Angus',
        scientificName: 'Bos taurus',
        primaryPurpose: ['Meat Production'],
        typicalHerdSize: '50-1000 head',
        housingRequirements: 'Open pasture with shelter',
        monitoringParameters: ['Pasture Health', 'Water Sources', 'Weight Gain', 'Animal Count', 'Rotational Grazing']
      },
      {
        id: 'hereford',
        name: 'Hereford',
        scientificName: 'Bos taurus',
        primaryPurpose: ['Meat Production'],
        typicalHerdSize: '50-1000 head',
        housingRequirements: 'Open pasture with shelter',
        monitoringParameters: ['Pasture Health', 'Water Sources', 'Weight Gain', 'Animal Count', 'Rotational Grazing']
      }
    ]
  },
  {
    id: 'small-ruminants',
    name: 'Small Ruminants',
    icon: '🐑',
    description: 'Sheep and goat operations',
    items: [
      {
        id: 'sheep-wool',
        name: 'Wool Sheep',
        scientificName: 'Ovis aries',
        primaryPurpose: ['Wool Production', 'Meat'],
        typicalHerdSize: '100-1000 head',
        housingRequirements: 'Pasture with basic shelter',
        monitoringParameters: ['Pasture Health', 'Water Sources', 'Wool Quality', 'Animal Count', 'Predator Detection']
      },
      {
        id: 'dairy-goats',
        name: 'Dairy Goats',
        scientificName: 'Capra aegagrus hircus',
        primaryPurpose: ['Milk Production'],
        typicalHerdSize: '20-200 head',
        housingRequirements: 'Barn with milking area',
        monitoringParameters: ['Pasture Health', 'Water Sources', 'Milk Production', 'Animal Health', 'Browse Quality']
      }
    ]
  },
  {
    id: 'poultry',
    name: 'Poultry',
    icon: '🐔',
    description: 'Chicken, turkey, and waterfowl operations',
    items: [
      {
        id: 'laying-hens',
        name: 'Laying Hens',
        scientificName: 'Gallus gallus domesticus',
        primaryPurpose: ['Egg Production'],
        typicalHerdSize: '1000-100000 birds',
        housingRequirements: 'Layer house with nesting boxes',
        monitoringParameters: ['Feed Consumption', 'Egg Production', 'Bird Health', 'Environmental Conditions', 'Mortality Rate']
      },
      {
        id: 'broilers',
        name: 'Broiler Chickens',
        scientificName: 'Gallus gallus domesticus',
        primaryPurpose: ['Meat Production'],
        typicalHerdSize: '10000-50000 birds',
        housingRequirements: 'Broiler house with climate control',
        monitoringParameters: ['Feed Consumption', 'Weight Gain', 'Bird Health', 'Environmental Conditions', 'Mortality Rate']
      },
      {
        id: 'turkeys',
        name: 'Turkeys',
        scientificName: 'Meleagris gallopavo',
        primaryPurpose: ['Meat Production'],
        typicalHerdSize: '5000-20000 birds',
        housingRequirements: 'Turkey house with larger space requirements',
        monitoringParameters: ['Feed Consumption', 'Weight Gain', 'Bird Health', 'Environmental Conditions']
      }
    ]
  },
  {
    id: 'swine',
    name: 'Swine',
    icon: '🐷',
    description: 'Pig farming operations',
    items: [
      {
        id: 'commercial-pigs',
        name: 'Commercial Pigs',
        scientificName: 'Sus scrofa domesticus',
        primaryPurpose: ['Meat Production'],
        typicalHerdSize: '500-5000 head',
        housingRequirements: 'Climate-controlled pig barn',
        monitoringParameters: ['Feed Consumption', 'Weight Gain', 'Animal Health', 'Environmental Conditions', 'Reproduction']
      }
    ]
  },
  {
    id: 'aquaculture',
    name: 'Aquaculture',
    icon: '🐟',
    description: 'Fish and aquatic animal farming',
    items: [
      {
        id: 'salmon',
        name: 'Salmon',
        scientificName: 'Salmo salar',
        primaryPurpose: ['Meat Production'],
        typicalHerdSize: '10000-100000 fish',
        housingRequirements: 'Ponds, cages, or recirculating systems',
        monitoringParameters: ['Water Quality', 'Fish Health', 'Feed Consumption', 'Growth Rate', 'Dissolved Oxygen']
      },
      {
        id: 'tilapia',
        name: 'Tilapia',
        scientificName: 'Oreochromis niloticus',
        primaryPurpose: ['Meat Production'],
        typicalHerdSize: '5000-50000 fish',
        housingRequirements: 'Ponds or tanks',
        monitoringParameters: ['Water Quality', 'Fish Health', 'Feed Consumption', 'Growth Rate', 'Temperature']
      }
    ]
  },
  {
    id: 'other-livestock',
    name: 'Other Livestock',
    icon: '🐎',
    description: 'Specialty livestock and alternative animals',
    items: [
      {
        id: 'horses',
        name: 'Horses',
        scientificName: 'Equus caballus',
        primaryPurpose: ['Recreation', 'Sport', 'Work'],
        typicalHerdSize: '5-50 head',
        housingRequirements: 'Stable with paddocks',
        monitoringParameters: ['Pasture Health', 'Animal Health', 'Exercise Tracking', 'Feed Quality']
      },
      {
        id: 'alpacas',
        name: 'Alpacas',
        scientificName: 'Vicugna pacos',
        primaryPurpose: ['Fiber Production', 'Breeding'],
        typicalHerdSize: '10-100 head',
        housingRequirements: 'Pasture with three-sided shelter',
        monitoringParameters: ['Pasture Health', 'Fiber Quality', 'Animal Health', 'Breeding Records']
      },
      {
        id: 'bees',
        name: 'Honeybees',
        scientificName: 'Apis mellifera',
        primaryPurpose: ['Honey Production', 'Pollination'],
        typicalHerdSize: '10-100 hives',
        housingRequirements: 'Beehives in suitable locations',
        monitoringParameters: ['Hive Health', 'Honey Production', 'Population Count', 'Disease Detection', 'Weather Conditions']
      }
    ]
  }
]

export type FarmType = 'crops' | 'livestock' | 'mixed'

export const farmTypeOptions = [
  {
    id: 'crops' as FarmType,
    name: 'Crop Production',
    icon: '🌾',
    description: 'Growing plants for food, fiber, fuel, or other commercial purposes',
    benefits: [
      'NDVI & vegetation health monitoring',
      'Growth stage tracking',
      'Weather-based irrigation scheduling',
      'Pest & disease early detection',
      'Yield prediction & optimization'
    ]
  },
  {
    id: 'livestock' as FarmType,
    name: 'Livestock Production',
    icon: '🐄',
    description: 'Raising animals for meat, dairy, eggs, fiber, or other products',
    benefits: [
      'Pasture health monitoring',
      'Animal counting & tracking',
      'Rotational grazing management',
      'Water source monitoring',
      'Feed quality assessment'
    ]
  },
  {
    id: 'mixed' as FarmType,
    name: 'Mixed Farming',
    icon: '🚜',
    description: 'Integrated crop and livestock production systems',
    benefits: [
      'Complete farm ecosystem monitoring',
      'Crop-livestock integration insights',
      'Holistic resource management',
      'Diversified risk management',
      'Sustainable farming practices'
    ]
  }
]