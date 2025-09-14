// Comprehensive Agricultural Knowledge Base
// Based on USDA data, extension service research, and agricultural best practices

export interface CropKnowledge {
  name: string
  varieties: string[]
  regions: {
    optimal: string[]
    suitable: string[]
    challenging: string[]
  }
  benchmarkYields: {
    [region: string]: {
      average: number
      top25Percent: number
      top10Percent: number
      unit: string
    }
  }
  growthStages: {
    stage: string
    daysFromPlanting: [number, number] // min-max days
    criticalFactors: string[]
    commonIssues: string[]
    actions: string[]
  }[]
  nutritionNeeds: {
    stage: string
    nitrogen: number
    phosphorus: number
    potassium: number
    criticalPeriod: boolean
  }[]
  pestCalendar: {
    pest: string
    riskPeriod: string // e.g., "30-60 days after planting"
    region: string[]
    severity: 'low' | 'medium' | 'high'
    prevention: string[]
    treatment: string[]
  }[]
  diseaseRisks: {
    disease: string
    conditions: string[] // weather conditions that trigger
    symptoms: string[]
    prevention: string[]
    criticalStage: string
  }[]
  marketPatterns: {
    harvestPeak: string // month
    pricePatterns: {
      month: string
      relativePrice: number // 1.0 = average, 1.2 = 20% above average
      volatility: 'low' | 'medium' | 'high'
    }[]
    storageRecommendation: {
      costPerBushel: number
      optimalSellMonth: string
      maxStorageDays: number
    }
  }
  rotationBenefits: {
    followsWith: string[] // crops that benefit following this one
    avoidAfter: string[] // crops to avoid after this one
    soilBenefits: string[]
  }
}

export interface LivestockKnowledge {
  species: string
  breeds: string[]
  managementCalendar: {
    month: string
    activities: {
      category: 'health' | 'breeding' | 'nutrition' | 'housing'
      action: string
      priority: 'low' | 'medium' | 'high'
      ageGroup?: string
    }[]
  }[]
  healthBenchmarks: {
    metric: string
    optimal: [number, number]
    units: string
    checkFrequency: string
  }[]
  breedingCalendar: {
    optimalBreedingMonths: string[]
    gestationDays: number
    birthingSeasonOptimal: string[]
    breedingAge: {
      female: number
      male: number
      units: 'months' | 'years'
    }
  }
  nutritionRequirements: {
    lifeStage: string
    feedType: string
    dailyAmount: number
    units: string
    supplements: string[]
  }[]
  commonHealthIssues: {
    condition: string
    symptoms: string[]
    seasonalRisk: string[]
    prevention: string[]
    treatment: string
  }[]
}

// Corn Knowledge Base
export const CORN_KNOWLEDGE: CropKnowledge = {
  name: "Corn",
  varieties: ["Dent Corn", "Sweet Corn", "Popcorn", "Flint Corn"],
  regions: {
    optimal: ["Iowa", "Illinois", "Nebraska", "Minnesota", "Indiana"],
    suitable: ["Ohio", "Wisconsin", "South Dakota", "Kansas", "Missouri"],
    challenging: ["Arizona", "Nevada", "Alaska", "Vermont", "Maine"]
  },
  benchmarkYields: {
    "Iowa": { average: 202, top25Percent: 220, top10Percent: 240, unit: "bu/acre" },
    "Illinois": { average: 214, top25Percent: 235, top10Percent: 255, unit: "bu/acre" },
    "Nebraska": { average: 195, top25Percent: 215, top10Percent: 235, unit: "bu/acre" },
    "National": { average: 177, top25Percent: 195, top10Percent: 215, unit: "bu/acre" }
  },
  growthStages: [
    {
      stage: "Emergence (VE)",
      daysFromPlanting: [4, 10],
      criticalFactors: ["Soil temperature", "Moisture", "Seed depth"],
      commonIssues: ["Poor emergence", "Cutworm damage", "Seed rot"],
      actions: ["Monitor emergence rate", "Scout for pests", "Check soil moisture"]
    },
    {
      stage: "Vegetative (V6-V12)",
      daysFromPlanting: [30, 60],
      criticalFactors: ["Nitrogen availability", "Weed control", "Root development"],
      commonIssues: ["Nitrogen deficiency", "Weed competition", "European corn borer"],
      actions: ["Side-dress nitrogen", "Post-emergence herbicide", "Scout for borers"]
    },
    {
      stage: "Tasseling/Silking (VT-R1)",
      daysFromPlanting: [65, 75],
      criticalFactors: ["Water stress", "Heat stress", "Pollination"],
      commonIssues: ["Drought stress", "Heat damage", "Poor pollination"],
      actions: ["Monitor water status", "Assess pollination success", "Scout for diseases"]
    },
    {
      stage: "Grain Filling (R2-R5)",
      daysFromPlanting: [80, 120],
      criticalFactors: ["Water availability", "Disease pressure", "Nutrient uptake"],
      commonIssues: ["Foliar diseases", "Stalk rot", "Ear rots"],
      actions: ["Monitor disease development", "Assess stalk integrity", "Plan harvest timing"]
    }
  ],
  nutritionNeeds: [
    { stage: "Planting", nitrogen: 30, phosphorus: 40, potassium: 40, criticalPeriod: false },
    { stage: "V6-V10", nitrogen: 120, phosphorus: 20, potassium: 60, criticalPeriod: true },
    { stage: "VT-R2", nitrogen: 80, phosphorus: 10, potassium: 100, criticalPeriod: true },
    { stage: "R3-R6", nitrogen: 20, phosphorus: 5, potassium: 40, criticalPeriod: false }
  ],
  pestCalendar: [
    {
      pest: "European Corn Borer",
      riskPeriod: "45-65 days after planting",
      region: ["Midwest", "Northeast"],
      severity: "high",
      prevention: ["Bt varieties", "Crop rotation", "Residue management"],
      treatment: ["Insecticide application", "Biological control"]
    },
    {
      pest: "Corn Rootworm",
      riskPeriod: "30-50 days after planting",
      region: ["Corn Belt"],
      severity: "high",
      prevention: ["Rotation with soybeans", "Bt varieties", "Soil insecticide"],
      treatment: ["Foliar insecticide", "Root assessment"]
    },
    {
      pest: "Armyworm",
      riskPeriod: "20-40 days after planting",
      region: ["Southern US", "Midwest"],
      severity: "medium",
      prevention: ["Field scouting", "Beneficial insects"],
      treatment: ["Targeted insecticide", "Biological control"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Gray Leaf Spot",
      conditions: ["High humidity", "Warm temperatures (75-85°F)", "Extended leaf wetness"],
      symptoms: ["Rectangular gray lesions", "Yellowing leaves"],
      prevention: ["Resistant varieties", "Crop rotation", "Residue management"],
      criticalStage: "VT-R4"
    },
    {
      disease: "Northern Corn Leaf Blight",
      conditions: ["Cool temperatures (65-80°F)", "High humidity", "Extended dew periods"],
      symptoms: ["Long elliptical lesions", "Tan to gray color"],
      prevention: ["Resistant varieties", "Crop rotation"],
      criticalStage: "V12-R3"
    }
  ],
  marketPatterns: {
    harvestPeak: "October",
    pricePatterns: [
      { month: "January", relativePrice: 1.05, volatility: "medium" },
      { month: "February", relativePrice: 1.08, volatility: "medium" },
      { month: "March", relativePrice: 1.12, volatility: "high" },
      { month: "April", relativePrice: 1.15, volatility: "high" },
      { month: "May", relativePrice: 1.18, volatility: "high" },
      { month: "June", relativePrice: 1.20, volatility: "high" },
      { month: "July", relativePrice: 1.10, volatility: "high" },
      { month: "August", relativePrice: 1.05, volatility: "high" },
      { month: "September", relativePrice: 0.95, volatility: "medium" },
      { month: "October", relativePrice: 0.85, volatility: "low" },
      { month: "November", relativePrice: 0.90, volatility: "low" },
      { month: "December", relativePrice: 1.00, volatility: "medium" }
    ],
    storageRecommendation: {
      costPerBushel: 0.25,
      optimalSellMonth: "May",
      maxStorageDays: 240
    }
  },
  rotationBenefits: {
    followsWith: ["Soybeans", "Wheat", "Cover crops"],
    avoidAfter: ["Corn (continuous)", "Sorghum"],
    soilBenefits: ["Nitrogen depletion requires legume rotation", "Improves soil structure with deep roots"]
  }
}

// Soybeans Knowledge Base
export const SOYBEAN_KNOWLEDGE: CropKnowledge = {
  name: "Soybeans",
  varieties: ["Conventional", "Roundup Ready", "Liberty Link", "Non-GMO"],
  regions: {
    optimal: ["Iowa", "Illinois", "Minnesota", "Indiana", "Ohio"],
    suitable: ["Missouri", "Wisconsin", "South Dakota", "Kansas", "Nebraska"],
    challenging: ["Arizona", "Nevada", "Alaska", "Vermont", "Maine"]
  },
  benchmarkYields: {
    "Iowa": { average: 60, top25Percent: 65, top10Percent: 70, unit: "bu/acre" },
    "Illinois": { average: 62, top25Percent: 67, top10Percent: 72, unit: "bu/acre" },
    "Minnesota": { average: 55, top25Percent: 60, top10Percent: 65, unit: "bu/acre" },
    "National": { average: 51, top25Percent: 56, top10Percent: 61, unit: "bu/acre" }
  },
  growthStages: [
    {
      stage: "Emergence (VE)",
      daysFromPlanting: [5, 10],
      criticalFactors: ["Soil temperature", "Moisture", "Planting depth"],
      commonIssues: ["Poor emergence", "Damping-off", "Bean leaf beetle"],
      actions: ["Monitor stand establishment", "Scout for early pests", "Check nodulation"]
    },
    {
      stage: "Flowering (R1-R2)",
      daysFromPlanting: [35, 50],
      criticalFactors: ["Water availability", "Pollination", "Disease pressure"],
      commonIssues: ["Water stress", "Thrips damage", "White mold"],
      actions: ["Monitor water status", "Scout for diseases", "Assess flower retention"]
    },
    {
      stage: "Pod Fill (R3-R6)",
      daysFromPlanting: [60, 100],
      criticalFactors: ["Water stress", "Nutrient availability", "Disease management"],
      commonIssues: ["Sudden death syndrome", "Brown stem rot", "Stink bugs"],
      actions: ["Monitor pod development", "Assess disease pressure", "Plan harvest"]
    }
  ],
  nutritionNeeds: [
    { stage: "Planting", nitrogen: 20, phosphorus: 30, potassium: 40, criticalPeriod: false },
    { stage: "V3-V6", nitrogen: 15, phosphorus: 15, potassium: 20, criticalPeriod: false },
    { stage: "R1-R3", nitrogen: 80, phosphorus: 25, potassium: 60, criticalPeriod: true },
    { stage: "R4-R6", nitrogen: 40, phosphorus: 10, potassium: 80, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Soybean Aphid",
      riskPeriod: "June-August",
      region: ["Upper Midwest"],
      severity: "high",
      prevention: ["Natural enemies", "Field scouting"],
      treatment: ["Foliar insecticide when threshold reached"]
    },
    {
      pest: "Bean Leaf Beetle",
      riskPeriod: "Emergence and late season",
      region: ["Midwest", "Southern US"],
      severity: "medium",
      prevention: ["Early planting", "Crop rotation"],
      treatment: ["Seed treatment", "Foliar application"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Sudden Death Syndrome",
      conditions: ["Cool wet springs", "Compacted soils", "High SCN populations"],
      symptoms: ["Yellow patches between leaf veins", "Brown roots"],
      prevention: ["Resistant varieties", "SCN management", "Drainage improvement"],
      criticalStage: "R3-R6"
    }
  ],
  marketPatterns: {
    harvestPeak: "October",
    pricePatterns: [
      { month: "January", relativePrice: 1.02, volatility: "medium" },
      { month: "February", relativePrice: 1.05, volatility: "medium" },
      { month: "March", relativePrice: 1.08, volatility: "high" },
      { month: "April", relativePrice: 1.12, volatility: "high" },
      { month: "May", relativePrice: 1.15, volatility: "high" },
      { month: "June", relativePrice: 1.18, volatility: "high" },
      { month: "July", relativePrice: 1.10, volatility: "high" },
      { month: "August", relativePrice: 1.05, volatility: "high" },
      { month: "September", relativePrice: 0.98, volatility: "medium" },
      { month: "October", relativePrice: 0.90, volatility: "low" },
      { month: "November", relativePrice: 0.95, volatility: "low" },
      { month: "December", relativePrice: 1.00, volatility: "medium" }
    ],
    storageRecommendation: {
      costPerBushel: 0.35,
      optimalSellMonth: "June",
      maxStorageDays: 180
    }
  },
  rotationBenefits: {
    followsWith: ["Corn", "Wheat", "Small grains"],
    avoidAfter: ["Soybeans (continuous)", "Other legumes"],
    soilBenefits: ["Fixes nitrogen for following crops", "Breaks disease cycles for cereals"]
  }
}

// Cattle Knowledge Base
export const CATTLE_KNOWLEDGE: LivestockKnowledge = {
  species: "Cattle",
  breeds: ["Angus", "Hereford", "Charolais", "Simmental", "Holstein", "Jersey"],
  managementCalendar: [
    {
      month: "January",
      activities: [
        { category: "health", action: "Pregnancy check", priority: "high" },
        { category: "nutrition", action: "Monitor body condition", priority: "high" },
        { category: "housing", action: "Check shelter adequacy", priority: "medium" }
      ]
    },
    {
      month: "February",
      activities: [
        { category: "breeding", action: "Begin calving season preparations", priority: "high" },
        { category: "health", action: "Vaccinate pregnant cows", priority: "high" },
        { category: "nutrition", action: "Increase protein in diet", priority: "medium" }
      ]
    },
    {
      month: "March",
      activities: [
        { category: "breeding", action: "Peak calving season", priority: "high" },
        { category: "health", action: "Monitor for calving complications", priority: "high" },
        { category: "nutrition", action: "Provide high-energy feed", priority: "high" }
      ]
    },
    {
      month: "April",
      activities: [
        { category: "breeding", action: "Begin breeding season", priority: "high" },
        { category: "health", action: "Vaccinate calves", priority: "high", ageGroup: "0-3 months" },
        { category: "nutrition", action: "Turn out to spring pasture", priority: "medium" }
      ]
    },
    {
      month: "May",
      activities: [
        { category: "breeding", action: "Peak breeding season", priority: "high" },
        { category: "health", action: "Fly control program", priority: "medium" },
        { category: "nutrition", action: "Monitor pasture quality", priority: "medium" }
      ]
    },
    {
      month: "June",
      activities: [
        { category: "breeding", action: "Continue breeding program", priority: "high" },
        { category: "health", action: "Heat stress prevention", priority: "high" },
        { category: "nutrition", action: "Supplement minerals", priority: "medium" }
      ]
    }
  ],
  healthBenchmarks: [
    { metric: "Body Condition Score", optimal: [5, 7], units: "1-9 scale", checkFrequency: "monthly" },
    { metric: "Weight Gain", optimal: [2.5, 3.5], units: "lbs/day", checkFrequency: "weekly" },
    { metric: "Temperature", optimal: [101, 102.5], units: "°F", checkFrequency: "as needed" },
    { metric: "Conception Rate", optimal: [85, 95], units: "percent", checkFrequency: "annually" }
  ],
  breedingCalendar: {
    optimalBreedingMonths: ["April", "May", "June"],
    gestationDays: 283,
    birthingSeasonOptimal: ["February", "March", "April"],
    breedingAge: {
      female: 15,
      male: 12,
      units: "months"
    }
  },
  nutritionRequirements: [
    {
      lifeStage: "Lactating Cow",
      feedType: "High-quality hay + grain",
      dailyAmount: 32,
      units: "lbs dry matter",
      supplements: ["Protein", "Minerals", "Vitamins A, D, E"]
    },
    {
      lifeStage: "Growing Calf",
      feedType: "Starter grain + milk/replacer",
      dailyAmount: 8,
      units: "lbs",
      supplements: ["Calf starter", "Fresh water", "Minerals"]
    }
  ],
  commonHealthIssues: [
    {
      condition: "Bovine Respiratory Disease",
      symptoms: ["Coughing", "Nasal discharge", "Depression", "Fever"],
      seasonalRisk: ["Fall", "Winter", "Spring"],
      prevention: ["Vaccination", "Minimize stress", "Good ventilation"],
      treatment: "Consult veterinarian for antibiotic protocol"
    },
    {
      condition: "Mastitis",
      symptoms: ["Swollen udder", "Abnormal milk", "Heat in udder"],
      seasonalRisk: ["Year-round"],
      prevention: ["Clean environment", "Proper milking procedures", "Dry cow therapy"],
      treatment: "Antibiotic treatment as prescribed"
    }
  ]
}

// Wheat Knowledge Base
export const WHEAT_KNOWLEDGE: CropKnowledge = {
  name: "Wheat",
  varieties: ["Hard Red Winter", "Hard Red Spring", "Soft Red Winter", "Durum", "White Wheat"],
  regions: {
    optimal: ["Kansas", "North Dakota", "Montana", "Washington", "Oklahoma"],
    suitable: ["Texas", "Colorado", "Nebraska", "South Dakota", "Idaho"],
    challenging: ["Florida", "Louisiana", "Hawaii", "Alaska", "Maine"]
  },
  benchmarkYields: {
    "Kansas": { average: 52, top25Percent: 60, top10Percent: 68, unit: "bu/acre" },
    "North Dakota": { average: 46, top25Percent: 52, top10Percent: 58, unit: "bu/acre" },
    "Montana": { average: 48, top25Percent: 55, top10Percent: 62, unit: "bu/acre" },
    "National": { average: 47, top25Percent: 54, top10Percent: 61, unit: "bu/acre" }
  },
  growthStages: [
    {
      stage: "Tillering",
      daysFromPlanting: [25, 45],
      criticalFactors: ["Stand establishment", "Early vigor", "Root development"],
      commonIssues: ["Poor stands", "Winter kill", "Early weed competition"],
      actions: ["Scout for winterkill", "Apply early nitrogen", "Weed control"]
    },
    {
      stage: "Jointing",
      daysFromPlanting: [120, 140],
      criticalFactors: ["Nitrogen availability", "Disease pressure", "Stem development"],
      commonIssues: ["Nitrogen deficiency", "Stripe rust", "Powdery mildew"],
      actions: ["Top-dress nitrogen", "Fungicide application", "Scout for diseases"]
    },
    {
      stage: "Heading/Flowering",
      daysFromPlanting: [140, 160],
      criticalFactors: ["Water availability", "Temperature stress", "Disease control"],
      commonIssues: ["Head scab", "Rust diseases", "Heat stress"],
      actions: ["Monitor for Fusarium head blight", "Assess grain fill potential"]
    }
  ],
  nutritionNeeds: [
    { stage: "Tillering", nitrogen: 40, phosphorus: 30, potassium: 25, criticalPeriod: true },
    { stage: "Jointing", nitrogen: 60, phosphorus: 15, potassium: 40, criticalPeriod: true },
    { stage: "Heading", nitrogen: 30, phosphorus: 10, potassium: 30, criticalPeriod: false }
  ],
  pestCalendar: [
    {
      pest: "Hessian Fly",
      riskPeriod: "Fall planting and spring growth",
      region: ["Great Plains", "Midwest"],
      severity: "high",
      prevention: ["Resistant varieties", "Delayed planting", "Destroy volunteer wheat"],
      treatment: ["Seed treatment", "Foliar insecticide if threshold met"]
    },
    {
      pest: "Wheat Stem Sawfly",
      riskPeriod: "Stem elongation through harvest",
      region: ["Northern Great Plains"],
      severity: "high",
      prevention: ["Solid stem varieties", "Crop rotation", "Early harvest"],
      treatment: ["No effective chemical control", "Swath at high moisture"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Fusarium Head Blight (Scab)",
      conditions: ["Warm temperatures (75-85°F)", "High humidity during flowering", "Extended wet periods"],
      symptoms: ["Bleached spikelets", "Pink/orange fungal growth", "Shriveled kernels"],
      prevention: ["Resistant varieties", "Fungicide at flowering", "Crop rotation"],
      criticalStage: "Flowering"
    },
    {
      disease: "Stripe Rust",
      conditions: ["Cool temperatures (50-60°F)", "High humidity", "Dew formation"],
      symptoms: ["Yellow stripes on leaves", "Pustules in lines", "Early senescence"],
      prevention: ["Resistant varieties", "Fungicide application", "Balanced fertility"],
      criticalStage: "Jointing to Heading"
    }
  ],
  marketPatterns: {
    harvestPeak: "July",
    pricePatterns: [
      { month: "January", relativePrice: 1.10, volatility: "medium" },
      { month: "February", relativePrice: 1.12, volatility: "medium" },
      { month: "March", relativePrice: 1.15, volatility: "high" },
      { month: "April", relativePrice: 1.18, volatility: "high" },
      { month: "May", relativePrice: 1.20, volatility: "high" },
      { month: "June", relativePrice: 1.15, volatility: "high" },
      { month: "July", relativePrice: 0.85, volatility: "low" },
      { month: "August", relativePrice: 0.88, volatility: "low" },
      { month: "September", relativePrice: 0.92, volatility: "medium" },
      { month: "October", relativePrice: 0.95, volatility: "medium" },
      { month: "November", relativePrice: 1.00, volatility: "medium" },
      { month: "December", relativePrice: 1.05, volatility: "medium" }
    ],
    storageRecommendation: {
      costPerBushel: 0.20,
      optimalSellMonth: "May",
      maxStorageDays: 300
    }
  },
  rotationBenefits: {
    followsWith: ["Soybeans", "Canola", "Sunflowers", "Fallow"],
    avoidAfter: ["Wheat", "Barley", "Rye"],
    soilBenefits: ["Breaks disease cycles", "Improves soil structure", "Efficient water use"]
  }
}

// Cotton Knowledge Base
export const COTTON_KNOWLEDGE: CropKnowledge = {
  name: "Cotton",
  varieties: ["Upland Cotton", "Pima Cotton", "Bt Cotton", "Roundup Ready"],
  regions: {
    optimal: ["Texas", "Georgia", "Arkansas", "Mississippi", "North Carolina"],
    suitable: ["Alabama", "Tennessee", "Louisiana", "South Carolina", "Missouri"],
    challenging: ["Northern states", "Mountain regions", "Pacific Northwest"]
  },
  benchmarkYields: {
    "Texas": { average: 820, top25Percent: 950, top10Percent: 1100, unit: "lbs/acre" },
    "Georgia": { average: 950, top25Percent: 1100, top10Percent: 1250, unit: "lbs/acre" },
    "Mississippi": { average: 1050, top25Percent: 1200, top10Percent: 1350, unit: "lbs/acre" },
    "National": { average: 900, top25Percent: 1050, top10Percent: 1200, unit: "lbs/acre" }
  },
  growthStages: [
    {
      stage: "Squaring",
      daysFromPlanting: [35, 55],
      criticalFactors: ["Square retention", "Insect pressure", "Growth regulation"],
      commonIssues: ["Plant bugs", "Square drop", "Excessive growth"],
      actions: ["Monitor square retention", "Scout for plant bugs", "Growth regulator application"]
    },
    {
      stage: "First Bloom",
      daysFromPlanting: [55, 70],
      criticalFactors: ["Water management", "Nutrient availability", "Boll retention"],
      commonIssues: ["Bollworms", "Water stress", "Potassium deficiency"],
      actions: ["Peak water demand period", "Monitor for bollworms", "Foliar nutrients if needed"]
    },
    {
      stage: "Boll Development",
      daysFromPlanting: [70, 120],
      criticalFactors: ["Boll load", "Late season insects", "Defoliation timing"],
      commonIssues: ["Boll rot", "Stink bugs", "Weather damage"],
      actions: ["Monitor boll opening", "Scout for stink bugs", "Plan defoliation"]
    }
  ],
  nutritionNeeds: [
    { stage: "Early Square", nitrogen: 40, phosphorus: 30, potassium: 40, criticalPeriod: false },
    { stage: "First Bloom", nitrogen: 60, phosphorus: 20, potassium: 60, criticalPeriod: true },
    { stage: "Peak Bloom", nitrogen: 40, phosphorus: 15, potassium: 80, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Bollworm/Budworm",
      riskPeriod: "Squaring through boll maturity",
      region: ["All cotton regions"],
      severity: "high",
      prevention: ["Bt varieties", "Beneficial insects", "Trap monitoring"],
      treatment: ["Targeted insecticide based on thresholds"]
    },
    {
      pest: "Tarnished Plant Bug",
      riskPeriod: "Square formation through early bloom",
      region: ["Mid-South", "Southeast"],
      severity: "high",
      prevention: ["Field borders management", "Early planting", "Host plant removal"],
      treatment: ["Insecticide at threshold levels"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Verticillium Wilt",
      conditions: ["Cool soil temperatures", "High soil moisture", "Infected soil"],
      symptoms: ["Leaf yellowing", "Vascular discoloration", "Premature defoliation"],
      prevention: ["Resistant varieties", "Crop rotation", "Soil management"],
      criticalStage: "Throughout season"
    }
  ],
  marketPatterns: {
    harvestPeak: "October",
    pricePatterns: [
      { month: "January", relativePrice: 1.02, volatility: "medium" },
      { month: "February", relativePrice: 1.05, volatility: "medium" },
      { month: "March", relativePrice: 1.08, volatility: "high" },
      { month: "April", relativePrice: 1.12, volatility: "high" },
      { month: "May", relativePrice: 1.15, volatility: "high" },
      { month: "June", relativePrice: 1.10, volatility: "high" },
      { month: "July", relativePrice: 1.05, volatility: "high" },
      { month: "August", relativePrice: 1.00, volatility: "medium" },
      { month: "September", relativePrice: 0.95, volatility: "medium" },
      { month: "October", relativePrice: 0.90, volatility: "low" },
      { month: "November", relativePrice: 0.92, volatility: "low" },
      { month: "December", relativePrice: 0.98, volatility: "medium" }
    ],
    storageRecommendation: {
      costPerBushel: 0.30,
      optimalSellMonth: "May",
      maxStorageDays: 240
    }
  },
  rotationBenefits: {
    followsWith: ["Corn", "Soybeans", "Peanuts", "Small grains"],
    avoidAfter: ["Cotton (continuous)", "Okra", "Other malvaceous crops"],
    soilBenefits: ["Deep taproot improves soil structure", "Efficient nutrient scavenger"]
  }
}

// Rice Knowledge Base
export const RICE_KNOWLEDGE: CropKnowledge = {
  name: "Rice",
  varieties: ["Long Grain", "Medium Grain", "Short Grain", "Jasmine", "Basmati"],
  regions: {
    optimal: ["Arkansas", "Louisiana", "California", "Texas", "Mississippi"],
    suitable: ["Missouri", "Florida"],
    challenging: ["Northern states", "Arid regions without irrigation"]
  },
  benchmarkYields: {
    "Arkansas": { average: 7500, top25Percent: 8200, top10Percent: 8800, unit: "lbs/acre" },
    "Louisiana": { average: 7200, top25Percent: 7900, top10Percent: 8500, unit: "lbs/acre" },
    "California": { average: 8500, top25Percent: 9200, top10Percent: 9800, unit: "lbs/acre" },
    "National": { average: 7600, top25Percent: 8300, top10Percent: 8900, unit: "lbs/acre" }
  },
  growthStages: [
    {
      stage: "Seedling/Tillering",
      daysFromPlanting: [14, 35],
      criticalFactors: ["Stand establishment", "Flood management", "Weed control"],
      commonIssues: ["Poor emergence", "Water weevil", "Weed competition"],
      actions: ["Establish permanent flood", "Scout for insects", "Apply herbicides"]
    },
    {
      stage: "Panicle Development",
      daysFromPlanting: [65, 85],
      criticalFactors: ["Nitrogen timing", "Water depth", "Disease management"],
      commonIssues: ["Blast disease", "Straighthead disorder", "Nitrogen deficiency"],
      actions: ["Midseason nitrogen", "Maintain flood depth", "Fungicide if needed"]
    },
    {
      stage: "Grain Filling",
      daysFromPlanting: [85, 115],
      criticalFactors: ["Water management", "Disease control", "Harvest timing"],
      commonIssues: ["Kernel smut", "Stink bugs", "Lodging"],
      actions: ["Monitor grain moisture", "Scout for late insects", "Drain timing"]
    }
  ],
  nutritionNeeds: [
    { stage: "Pre-flood", nitrogen: 70, phosphorus: 40, potassium: 60, criticalPeriod: true },
    { stage: "Midseason", nitrogen: 50, phosphorus: 0, potassium: 30, criticalPeriod: true },
    { stage: "Boot", nitrogen: 30, phosphorus: 0, potassium: 20, criticalPeriod: false }
  ],
  pestCalendar: [
    {
      pest: "Rice Water Weevil",
      riskPeriod: "3-4 weeks after flooding",
      region: ["All rice regions"],
      severity: "high",
      prevention: ["Seed treatment", "Delayed flooding", "Cultural practices"],
      treatment: ["Foliar insecticide after flood"]
    },
    {
      pest: "Rice Stink Bug",
      riskPeriod: "Heading through grain maturity",
      region: ["Southern rice regions"],
      severity: "medium",
      prevention: ["Field borders management", "Timely harvest"],
      treatment: ["Insecticide based on sweep net counts"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Rice Blast",
      conditions: ["High nitrogen", "Cool nights with heavy dew", "Susceptible varieties"],
      symptoms: ["Diamond-shaped lesions", "Neck rot", "Node blast"],
      prevention: ["Resistant varieties", "Balanced fertility", "Fungicide timing"],
      criticalStage: "Tillering through Heading"
    },
    {
      disease: "Sheath Blight",
      conditions: ["Dense canopy", "High humidity", "Warm temperatures"],
      symptoms: ["Oval lesions on sheaths", "Lodging", "Unfilled grains"],
      prevention: ["Lower seeding rates", "Resistant varieties", "Fungicides"],
      criticalStage: "Panicle Development"
    }
  ],
  marketPatterns: {
    harvestPeak: "September",
    pricePatterns: [
      { month: "January", relativePrice: 1.08, volatility: "medium" },
      { month: "February", relativePrice: 1.10, volatility: "medium" },
      { month: "March", relativePrice: 1.12, volatility: "medium" },
      { month: "April", relativePrice: 1.15, volatility: "high" },
      { month: "May", relativePrice: 1.18, volatility: "high" },
      { month: "June", relativePrice: 1.20, volatility: "high" },
      { month: "July", relativePrice: 1.15, volatility: "high" },
      { month: "August", relativePrice: 1.05, volatility: "medium" },
      { month: "September", relativePrice: 0.90, volatility: "low" },
      { month: "October", relativePrice: 0.92, volatility: "low" },
      { month: "November", relativePrice: 0.95, volatility: "medium" },
      { month: "December", relativePrice: 1.00, volatility: "medium" }
    ],
    storageRecommendation: {
      costPerBushel: 0.35,
      optimalSellMonth: "June",
      maxStorageDays: 270
    }
  },
  rotationBenefits: {
    followsWith: ["Soybeans", "Corn", "Grain sorghum", "Fallow"],
    avoidAfter: ["Rice (continuous more than 2 years)"],
    soilBenefits: ["Unique flooding breaks weed/pest cycles", "Increases soil organic matter in water"]
  }
}

// Swine (Pigs) Knowledge Base
export const SWINE_KNOWLEDGE: LivestockKnowledge = {
  species: "Swine",
  breeds: ["Yorkshire", "Duroc", "Hampshire", "Landrace", "Berkshire", "Chester White"],
  managementCalendar: [
    {
      month: "January",
      activities: [
        { category: "breeding", action: "Plan spring breeding schedule", priority: "high" },
        { category: "health", action: "Vaccinate breeding stock", priority: "high" },
        { category: "housing", action: "Check ventilation and heating", priority: "medium" }
      ]
    },
    {
      month: "February",
      activities: [
        { category: "breeding", action: "Begin spring breeding", priority: "high" },
        { category: "nutrition", action: "Adjust feed for lactating sows", priority: "high" },
        { category: "health", action: "Monitor for respiratory issues", priority: "medium" }
      ]
    },
    {
      month: "March",
      activities: [
        { category: "breeding", action: "Pregnancy check sows", priority: "high" },
        { category: "health", action: "Deworm breeding herd", priority: "medium" },
        { category: "housing", action: "Prepare farrowing areas", priority: "high" }
      ]
    },
    {
      month: "April",
      activities: [
        { category: "breeding", action: "Monitor farrowing", priority: "high", ageGroup: "Sows" },
        { category: "health", action: "Process newborn piglets", priority: "high", ageGroup: "0-7 days" },
        { category: "nutrition", action: "Start creep feeding", priority: "medium", ageGroup: "7-21 days" }
      ]
    },
    {
      month: "June",
      activities: [
        { category: "health", action: "Vaccinate weaned pigs", priority: "high", ageGroup: "4-8 weeks" },
        { category: "housing", action: "Check cooling systems", priority: "high" },
        { category: "nutrition", action: "Monitor feed intake in heat", priority: "high" }
      ]
    }
  ],
  healthBenchmarks: [
    { metric: "Farrowing Rate", optimal: [85, 95], units: "percent", checkFrequency: "per breeding group" },
    { metric: "Pigs Weaned/Sow/Year", optimal: [26, 30], units: "piglets", checkFrequency: "annually" },
    { metric: "Feed Conversion Ratio", optimal: [2.6, 3.0], units: "feed:gain", checkFrequency: "per group" },
    { metric: "Mortality Rate", optimal: [0, 3], units: "percent", checkFrequency: "monthly" },
    { metric: "Average Daily Gain", optimal: [1.7, 2.0], units: "lbs/day", checkFrequency: "weekly" }
  ],
  breedingCalendar: {
    optimalBreedingMonths: ["Year-round with management"],
    gestationDays: 114,
    birthingSeasonOptimal: ["Controlled environment allows year-round"],
    breedingAge: {
      female: 8,
      male: 8,
      units: "months"
    }
  },
  nutritionRequirements: [
    {
      lifeStage: "Lactating Sow",
      feedType: "High-energy lactation diet",
      dailyAmount: 15,
      units: "lbs",
      supplements: ["Calcium", "Phosphorus", "Lysine", "Energy"]
    },
    {
      lifeStage: "Growing Pig (50-100 lbs)",
      feedType: "Grower ration",
      dailyAmount: 4,
      units: "lbs",
      supplements: ["Balanced amino acids", "Minerals", "Vitamins"]
    },
    {
      lifeStage: "Finishing Pig (100-250 lbs)",
      feedType: "Finisher ration",
      dailyAmount: 7,
      units: "lbs",
      supplements: ["Lower protein", "Energy dense"]
    }
  ],
  commonHealthIssues: [
    {
      condition: "Porcine Reproductive and Respiratory Syndrome (PRRS)",
      symptoms: ["Reproductive failure", "Respiratory disease", "Poor growth"],
      seasonalRisk: ["Year-round"],
      prevention: ["Vaccination", "Biosecurity", "All-in/all-out production"],
      treatment: "Consult veterinarian for herd-specific protocol"
    },
    {
      condition: "Swine Influenza",
      symptoms: ["Coughing", "Fever", "Lethargy", "Nasal discharge"],
      seasonalRisk: ["Fall", "Winter"],
      prevention: ["Vaccination", "Ventilation", "Minimize stress"],
      treatment: "Supportive care, antibiotics for secondary infections"
    }
  ]
}

// Poultry (Chickens) Knowledge Base
export const POULTRY_KNOWLEDGE: LivestockKnowledge = {
  species: "Poultry (Layers)",
  breeds: ["Leghorn", "Rhode Island Red", "Plymouth Rock", "Australorp", "Orpington"],
  managementCalendar: [
    {
      month: "January",
      activities: [
        { category: "housing", action: "Ensure adequate ventilation without drafts", priority: "high" },
        { category: "nutrition", action: "Increase feed energy for cold weather", priority: "medium" },
        { category: "health", action: "Monitor for respiratory issues", priority: "high" }
      ]
    },
    {
      month: "March",
      activities: [
        { category: "breeding", action: "Order replacement chicks", priority: "high" },
        { category: "housing", action: "Deep clean before new flock", priority: "high" },
        { category: "health", action: "Vaccination schedule planning", priority: "medium" }
      ]
    },
    {
      month: "April",
      activities: [
        { category: "health", action: "Vaccinate new chicks", priority: "high", ageGroup: "Day-old" },
        { category: "housing", action: "Set up brooder areas", priority: "high" },
        { category: "nutrition", action: "Start chick starter feed", priority: "high", ageGroup: "0-8 weeks" }
      ]
    },
    {
      month: "July",
      activities: [
        { category: "housing", action: "Maximize cooling and ventilation", priority: "high" },
        { category: "health", action: "Monitor for heat stress", priority: "high" },
        { category: "nutrition", action: "Adjust calcium for heat", priority: "medium" }
      ]
    }
  ],
  healthBenchmarks: [
    { metric: "Egg Production Rate", optimal: [85, 95], units: "percent", checkFrequency: "daily" },
    { metric: "Mortality Rate", optimal: [0, 5], units: "percent annually", checkFrequency: "weekly" },
    { metric: "Feed Conversion", optimal: [3.5, 4.2], units: "lbs feed/dozen eggs", checkFrequency: "monthly" },
    { metric: "Body Weight", optimal: [4.0, 4.5], units: "lbs at 20 weeks", checkFrequency: "monthly" }
  ],
  breedingCalendar: {
    optimalBreedingMonths: ["March", "April", "May"],
    gestationDays: 21,
    birthingSeasonOptimal: ["Spring", "Early Summer"],
    breedingAge: {
      female: 6,
      male: 6,
      units: "months"
    }
  },
  nutritionRequirements: [
    {
      lifeStage: "Layer (Peak Production)",
      feedType: "Layer mash/pellets 16-18% protein",
      dailyAmount: 0.25,
      units: "lbs",
      supplements: ["Calcium carbonate", "Phosphorus", "Vitamin D3"]
    },
    {
      lifeStage: "Growing Pullet (0-8 weeks)",
      feedType: "Starter 20-22% protein",
      dailyAmount: 0.15,
      units: "lbs",
      supplements: ["Coccidiostat", "Vitamins", "Trace minerals"]
    }
  ],
  commonHealthIssues: [
    {
      condition: "Infectious Bronchitis",
      symptoms: ["Respiratory distress", "Drop in egg production", "Watery eyes"],
      seasonalRisk: ["Winter", "Spring"],
      prevention: ["Vaccination", "Biosecurity", "Good ventilation"],
      treatment: "Supportive care, antibiotics for secondary infections"
    },
    {
      condition: "Coccidiosis",
      symptoms: ["Bloody droppings", "Lethargy", "Poor growth"],
      seasonalRisk: ["Warm, humid conditions"],
      prevention: ["Coccidiostat in feed", "Clean, dry litter", "Good sanitation"],
      treatment: "Amprolium in water"
    }
  ]
}

// Sheep Knowledge Base
export const SHEEP_KNOWLEDGE: LivestockKnowledge = {
  species: "Sheep",
  breeds: ["Suffolk", "Hampshire", "Dorper", "Merino", "Rambouillet", "Katahdin"],
  managementCalendar: [
    {
      month: "January",
      activities: [
        { category: "breeding", action: "Mid-gestation ultrasound", priority: "high" },
        { category: "nutrition", action: "Increase feed for pregnant ewes", priority: "high" },
        { category: "housing", action: "Prepare lambing areas", priority: "medium" }
      ]
    },
    {
      month: "March",
      activities: [
        { category: "breeding", action: "Peak lambing season", priority: "high" },
        { category: "health", action: "Process newborn lambs", priority: "high", ageGroup: "0-3 days" },
        { category: "nutrition", action: "Peak lactation feeding", priority: "high" }
      ]
    },
    {
      month: "May",
      activities: [
        { category: "health", action: "Vaccinate lambs CDT", priority: "high", ageGroup: "6-8 weeks" },
        { category: "nutrition", action: "Turn out to spring pasture", priority: "medium" },
        { category: "breeding", action: "Wean lambs", priority: "medium", ageGroup: "60-90 days" }
      ]
    },
    {
      month: "September",
      activities: [
        { category: "breeding", action: "Fall breeding season begins", priority: "high" },
        { category: "health", action: "Pre-breeding health check", priority: "high" },
        { category: "nutrition", action: "Flush feeding for ewes", priority: "medium" }
      ]
    }
  ],
  healthBenchmarks: [
    { metric: "Lambing Rate", optimal: [175, 200], units: "percent", checkFrequency: "per lambing season" },
    { metric: "Weaning Weight", optimal: [60, 80], units: "lbs at 90 days", checkFrequency: "per lamb crop" },
    { metric: "Ewe Body Condition", optimal: [3.0, 3.5], units: "1-5 scale", checkFrequency: "monthly" },
    { metric: "Lamb Survival Rate", optimal: [92, 98], units: "percent", checkFrequency: "per lambing" }
  ],
  breedingCalendar: {
    optimalBreedingMonths: ["August", "September", "October"],
    gestationDays: 147,
    birthingSeasonOptimal: ["February", "March", "April"],
    breedingAge: {
      female: 7,
      male: 7,
      units: "months"
    }
  },
  nutritionRequirements: [
    {
      lifeStage: "Lactating Ewe (twins)",
      feedType: "High-quality hay + grain",
      dailyAmount: 7,
      units: "lbs dry matter",
      supplements: ["Protein supplement", "Calcium", "Selenium/Vitamin E"]
    },
    {
      lifeStage: "Growing Lamb",
      feedType: "Creep feed + pasture",
      dailyAmount: 3,
      units: "lbs",
      supplements: ["Coccidiostat", "Trace minerals"]
    }
  ],
  commonHealthIssues: [
    {
      condition: "Internal Parasites",
      symptoms: ["Anemia", "Bottle jaw", "Poor growth", "Diarrhea"],
      seasonalRisk: ["Spring", "Summer", "Fall"],
      prevention: ["Pasture rotation", "FAMACHA scoring", "Selective deworming"],
      treatment: "Targeted anthelmintic based on fecal egg counts"
    },
    {
      condition: "Pregnancy Toxemia",
      symptoms: ["Lethargy", "Separated from flock", "Grinding teeth"],
      seasonalRisk: ["Late gestation"],
      prevention: ["Adequate nutrition", "Avoid obesity", "Minimize stress"],
      treatment: "Propylene glycol, supportive care"
    }
  ]
}

// Sorghum Knowledge Base
export const SORGHUM_KNOWLEDGE: CropKnowledge = {
  name: "Sorghum",
  varieties: ["Grain Sorghum", "Forage Sorghum", "Sweet Sorghum", "Biomass Sorghum"],
  regions: {
    optimal: ["Kansas", "Texas", "Oklahoma", "Nebraska", "Colorado"],
    suitable: ["New Mexico", "Arizona", "Missouri", "Arkansas", "Louisiana"],
    challenging: ["Northern states", "Pacific Northwest", "New England"]
  },
  benchmarkYields: {
    "Kansas": { average: 75, top25Percent: 85, top10Percent: 95, unit: "bu/acre" },
    "Texas": { average: 65, top25Percent: 75, top10Percent: 85, unit: "bu/acre" },
    "Oklahoma": { average: 70, top25Percent: 80, top10Percent: 90, unit: "bu/acre" },
    "National": { average: 68, top25Percent: 78, top10Percent: 88, unit: "bu/acre" }
  },
  growthStages: [
    {
      stage: "Emergence to 5-leaf",
      daysFromPlanting: [7, 25],
      criticalFactors: ["Stand establishment", "Early vigor", "Weed control"],
      commonIssues: ["Poor emergence", "Chinch bug", "Weed competition"],
      actions: ["Monitor stand counts", "Scout for insects", "Apply pre-emergence herbicide"]
    },
    {
      stage: "Boot Stage",
      daysFromPlanting: [45, 60],
      criticalFactors: ["Water availability", "Nitrogen needs", "Disease pressure"],
      commonIssues: ["Sugarcane aphid", "Head smut", "Drought stress"],
      actions: ["Scout for aphids", "Apply fungicide if needed", "Monitor soil moisture"]
    },
    {
      stage: "Grain Filling",
      daysFromPlanting: [65, 90],
      criticalFactors: ["Temperature stress", "Bird damage", "Harvest timing"],
      commonIssues: ["Grain mold", "Stink bugs", "Lodging"],
      actions: ["Monitor grain moisture", "Bird control measures", "Plan harvest"]
    }
  ],
  nutritionNeeds: [
    { stage: "Planting", nitrogen: 30, phosphorus: 35, potassium: 30, criticalPeriod: false },
    { stage: "5-leaf to Boot", nitrogen: 50, phosphorus: 15, potassium: 40, criticalPeriod: true },
    { stage: "Heading", nitrogen: 30, phosphorus: 10, potassium: 30, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Sugarcane Aphid",
      riskPeriod: "Boot stage through harvest",
      region: ["Southern Plains", "Southeast"],
      severity: "high",
      prevention: ["Resistant hybrids", "Beneficial insects", "Early planting"],
      treatment: ["Selective insecticides", "Transform or Sivanto"]
    },
    {
      pest: "Sorghum Midge",
      riskPeriod: "Flowering period",
      region: ["All sorghum regions"],
      severity: "medium",
      prevention: ["Early planting", "Uniform flowering", "Resistant varieties"],
      treatment: ["Insecticide at bloom"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Anthracnose",
      conditions: ["Warm, humid conditions", "Extended leaf wetness", "Susceptible hybrids"],
      symptoms: ["Red lesions on leaves", "Stalk rot", "Top dieback"],
      prevention: ["Resistant hybrids", "Crop rotation", "Residue management"],
      criticalStage: "Throughout season"
    }
  ],
  marketPatterns: {
    harvestPeak: "October",
    pricePatterns: [
      { month: "January", relativePrice: 1.05, volatility: "medium" },
      { month: "February", relativePrice: 1.08, volatility: "medium" },
      { month: "March", relativePrice: 1.10, volatility: "medium" },
      { month: "April", relativePrice: 1.12, volatility: "high" },
      { month: "May", relativePrice: 1.15, volatility: "high" },
      { month: "June", relativePrice: 1.12, volatility: "high" },
      { month: "July", relativePrice: 1.08, volatility: "medium" },
      { month: "August", relativePrice: 1.00, volatility: "medium" },
      { month: "September", relativePrice: 0.92, volatility: "low" },
      { month: "October", relativePrice: 0.88, volatility: "low" },
      { month: "November", relativePrice: 0.95, volatility: "medium" },
      { month: "December", relativePrice: 1.00, volatility: "medium" }
    ],
    storageRecommendation: {
      costPerBushel: 0.18,
      optimalSellMonth: "May",
      maxStorageDays: 240
    }
  },
  rotationBenefits: {
    followsWith: ["Soybeans", "Cotton", "Sunflowers", "Fallow"],
    avoidAfter: ["Sorghum", "Corn", "Johnsongrass areas"],
    soilBenefits: ["Drought tolerance improves soil in dry years", "Efficient nutrient user"]
  }
}

// Canola Knowledge Base
export const CANOLA_KNOWLEDGE: CropKnowledge = {
  name: "Canola",
  varieties: ["Spring Canola", "Winter Canola", "Roundup Ready", "Liberty Link", "Clearfield"],
  regions: {
    optimal: ["North Dakota", "Montana", "Minnesota", "Washington", "Oregon"],
    suitable: ["Idaho", "South Dakota", "Wisconsin", "Kansas", "Oklahoma"],
    challenging: ["Southern states", "Desert regions", "Tropical areas"]
  },
  benchmarkYields: {
    "North Dakota": { average: 1800, top25Percent: 2100, top10Percent: 2400, unit: "lbs/acre" },
    "Montana": { average: 1650, top25Percent: 1900, top10Percent: 2200, unit: "lbs/acre" },
    "Washington": { average: 2200, top25Percent: 2500, top10Percent: 2800, unit: "lbs/acre" },
    "National": { average: 1750, top25Percent: 2000, top10Percent: 2300, unit: "lbs/acre" }
  },
  growthStages: [
    {
      stage: "Rosette",
      daysFromPlanting: [20, 45],
      criticalFactors: ["Root development", "Winter hardiness", "Weed control"],
      commonIssues: ["Flea beetles", "Winter kill", "Weed competition"],
      actions: ["Monitor flea beetle damage", "Apply herbicides", "Check winter survival"]
    },
    {
      stage: "Bolting to Flowering",
      daysFromPlanting: [45, 65],
      criticalFactors: ["Sulfur availability", "Pollinator activity", "Disease control"],
      commonIssues: ["Sclerotinia", "Blackleg", "Diamondback moth"],
      actions: ["Fungicide application", "Monitor for insects", "Ensure sulfur nutrition"]
    },
    {
      stage: "Pod Development",
      daysFromPlanting: [65, 90],
      criticalFactors: ["Pod retention", "Heat stress", "Harvest timing"],
      commonIssues: ["Pod shatter", "Alternaria", "Bertha armyworm"],
      actions: ["Monitor seed color change", "Swath timing decisions", "Desiccation planning"]
    }
  ],
  nutritionNeeds: [
    { stage: "Rosette", nitrogen: 50, phosphorus: 30, potassium: 40, criticalPeriod: true },
    { stage: "Bolting", nitrogen: 70, phosphorus: 20, potassium: 50, criticalPeriod: true },
    { stage: "Flowering", nitrogen: 30, phosphorus: 15, potassium: 30, criticalPeriod: false }
  ],
  pestCalendar: [
    {
      pest: "Flea Beetles",
      riskPeriod: "Emergence to 4-leaf stage",
      region: ["All canola regions"],
      severity: "high",
      prevention: ["Seed treatment", "Early vigor varieties", "Seeding rate"],
      treatment: ["Foliar insecticide at 25% defoliation"]
    },
    {
      pest: "Cabbage Seedpod Weevil",
      riskPeriod: "Bud to early flower",
      region: ["Northern Plains"],
      severity: "medium",
      prevention: ["Trap monitoring", "Border sprays", "Natural enemies"],
      treatment: ["Insecticide at economic threshold"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Sclerotinia Stem Rot",
      conditions: ["Cool, wet conditions at flowering", "Dense canopy", "High humidity"],
      symptoms: ["White mold on stems", "Bleached stems", "Premature ripening"],
      prevention: ["Crop rotation", "Fungicide at 20-30% bloom", "Lower seeding rates"],
      criticalStage: "Flowering"
    },
    {
      disease: "Blackleg",
      conditions: ["Infected stubble", "Wet conditions", "Susceptible varieties"],
      symptoms: ["Stem cankers", "Lodging", "Premature death"],
      prevention: ["Resistant varieties", "4-year rotation", "Fungicide seed treatment"],
      criticalStage: "Rosette to Stem Extension"
    }
  ],
  marketPatterns: {
    harvestPeak: "August",
    pricePatterns: [
      { month: "January", relativePrice: 1.10, volatility: "high" },
      { month: "February", relativePrice: 1.12, volatility: "high" },
      { month: "March", relativePrice: 1.15, volatility: "high" },
      { month: "April", relativePrice: 1.18, volatility: "high" },
      { month: "May", relativePrice: 1.20, volatility: "high" },
      { month: "June", relativePrice: 1.15, volatility: "high" },
      { month: "July", relativePrice: 1.05, volatility: "medium" },
      { month: "August", relativePrice: 0.90, volatility: "low" },
      { month: "September", relativePrice: 0.92, volatility: "low" },
      { month: "October", relativePrice: 0.95, volatility: "medium" },
      { month: "November", relativePrice: 1.00, volatility: "medium" },
      { month: "December", relativePrice: 1.05, volatility: "medium" }
    ],
    storageRecommendation: {
      costPerBushel: 0.40,
      optimalSellMonth: "May",
      maxStorageDays: 270
    }
  },
  rotationBenefits: {
    followsWith: ["Wheat", "Barley", "Corn", "Soybeans"],
    avoidAfter: ["Canola", "Mustard", "Other brassicas"],
    soilBenefits: ["Deep taproot breaks compaction", "Good for wheat rotation", "Reduces cereal diseases"]
  }
}

// Barley Knowledge Base
export const BARLEY_KNOWLEDGE: CropKnowledge = {
  name: "Barley",
  varieties: ["Malting Barley", "Feed Barley", "Spring Barley", "Winter Barley", "Hulless Barley"],
  regions: {
    optimal: ["Montana", "Idaho", "North Dakota", "Minnesota", "Washington"],
    suitable: ["Wyoming", "Colorado", "Oregon", "Wisconsin", "Utah"],
    challenging: ["Southern states", "High humidity regions", "Tropical areas"]
  },
  benchmarkYields: {
    "Montana": { average: 70, top25Percent: 80, top10Percent: 90, unit: "bu/acre" },
    "Idaho": { average: 85, top25Percent: 95, top10Percent: 105, unit: "bu/acre" },
    "North Dakota": { average: 65, top25Percent: 75, top10Percent: 85, unit: "bu/acre" },
    "National": { average: 72, top25Percent: 82, top10Percent: 92, unit: "bu/acre" }
  },
  growthStages: [
    {
      stage: "Tillering",
      daysFromPlanting: [20, 35],
      criticalFactors: ["Stand density", "Nitrogen timing", "Weed control"],
      commonIssues: ["Russian wheat aphid", "Wireworms", "Wild oats"],
      actions: ["Topdress nitrogen", "Scout for aphids", "Apply herbicides"]
    },
    {
      stage: "Heading",
      daysFromPlanting: [50, 65],
      criticalFactors: ["Disease control", "Protein management", "Water stress"],
      commonIssues: ["Net blotch", "Spot blotch", "Head blight"],
      actions: ["Fungicide application", "Monitor for diseases", "Assess protein levels"]
    },
    {
      stage: "Grain Fill",
      daysFromPlanting: [65, 85],
      criticalFactors: ["Kernel plumpness", "Test weight", "Pre-harvest sprouting"],
      commonIssues: ["Kernel blight", "Bird damage", "Lodging"],
      actions: ["Monitor grain moisture", "Plan harvest timing", "Quality testing"]
    }
  ],
  nutritionNeeds: [
    { stage: "Planting", nitrogen: 30, phosphorus: 25, potassium: 25, criticalPeriod: false },
    { stage: "Tillering", nitrogen: 40, phosphorus: 15, potassium: 30, criticalPeriod: true },
    { stage: "Boot", nitrogen: 30, phosphorus: 10, potassium: 25, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Cereal Leaf Beetle",
      riskPeriod: "Flag leaf emergence",
      region: ["Northern Plains", "Great Lakes"],
      severity: "medium",
      prevention: ["Resistant varieties", "Natural enemies", "Crop rotation"],
      treatment: ["Insecticide at threshold"]
    },
    {
      pest: "Aphids (Multiple Species)",
      riskPeriod: "Boot to soft dough",
      region: ["All barley regions"],
      severity: "medium",
      prevention: ["Early planting", "Beneficial insects", "Balanced fertility"],
      treatment: ["Selective insecticides"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Fusarium Head Blight",
      conditions: ["Warm, humid at flowering", "Corn residue", "Extended wetness"],
      symptoms: ["Bleached heads", "Pink kernels", "DON contamination"],
      prevention: ["Resistant varieties", "Fungicide at heading", "Crop rotation"],
      criticalStage: "Heading to Flowering"
    },
    {
      disease: "Net Blotch",
      conditions: ["Cool, wet conditions", "Infected residue", "Dense stands"],
      symptoms: ["Net-like lesions", "Leaf death", "Yield loss"],
      prevention: ["Resistant varieties", "Seed treatment", "Crop rotation"],
      criticalStage: "Seedling to Boot"
    }
  ],
  marketPatterns: {
    harvestPeak: "July",
    pricePatterns: [
      { month: "January", relativePrice: 1.08, volatility: "medium" },
      { month: "February", relativePrice: 1.10, volatility: "medium" },
      { month: "March", relativePrice: 1.12, volatility: "high" },
      { month: "April", relativePrice: 1.15, volatility: "high" },
      { month: "May", relativePrice: 1.18, volatility: "high" },
      { month: "June", relativePrice: 1.10, volatility: "medium" },
      { month: "July", relativePrice: 0.88, volatility: "low" },
      { month: "August", relativePrice: 0.90, volatility: "low" },
      { month: "September", relativePrice: 0.95, volatility: "medium" },
      { month: "October", relativePrice: 1.00, volatility: "medium" },
      { month: "November", relativePrice: 1.02, volatility: "medium" },
      { month: "December", relativePrice: 1.05, volatility: "medium" }
    ],
    storageRecommendation: {
      costPerBushel: 0.22,
      optimalSellMonth: "May",
      maxStorageDays: 300
    }
  },
  rotationBenefits: {
    followsWith: ["Canola", "Pulse crops", "Potatoes", "Sugar beets"],
    avoidAfter: ["Barley", "Wheat", "Rye"],
    soilBenefits: ["Early harvest allows cover crops", "Good nurse crop for alfalfa", "Breaks disease cycles"]
  }
}

// Sunflower Knowledge Base
export const SUNFLOWER_KNOWLEDGE: CropKnowledge = {
  name: "Sunflower",
  varieties: ["Oil Type", "Confection Type", "High Oleic", "NuSun", "Dwarf Varieties"],
  regions: {
    optimal: ["North Dakota", "South Dakota", "Kansas", "Colorado", "Nebraska"],
    suitable: ["Minnesota", "Texas", "Montana", "California", "Missouri"],
    challenging: ["High humidity Southeast", "Short season areas", "Heavy clay soils"]
  },
  benchmarkYields: {
    "North Dakota": { average: 1650, top25Percent: 1900, top10Percent: 2200, unit: "lbs/acre" },
    "South Dakota": { average: 1550, top25Percent: 1800, top10Percent: 2100, unit: "lbs/acre" },
    "Kansas": { average: 1450, top25Percent: 1700, top10Percent: 2000, unit: "lbs/acre" },
    "National": { average: 1500, top25Percent: 1750, top10Percent: 2050, unit: "lbs/acre" }
  },
  growthStages: [
    {
      stage: "Vegetative (V-E to V-8)",
      daysFromPlanting: [7, 35],
      criticalFactors: ["Stand establishment", "Weed control", "Early nutrition"],
      commonIssues: ["Cutworms", "Wire worms", "Weed competition"],
      actions: ["Monitor emergence", "Apply post herbicides", "Side-dress fertilizer"]
    },
    {
      stage: "Reproductive (R1-R5)",
      daysFromPlanting: [45, 65],
      criticalFactors: ["Pollination", "Water needs", "Disease pressure"],
      commonIssues: ["Sunflower moth", "Rust", "Downy mildew"],
      actions: ["Monitor for insects", "Fungicide if needed", "Ensure water availability"]
    },
    {
      stage: "Seed Fill (R6-R9)",
      daysFromPlanting: [65, 100],
      criticalFactors: ["Bird damage", "Seed fill", "Harvest timing"],
      commonIssues: ["Head rot", "Birds", "Lodging"],
      actions: ["Bird control", "Monitor moisture", "Desiccation timing"]
    }
  ],
  nutritionNeeds: [
    { stage: "Planting", nitrogen: 40, phosphorus: 30, potassium: 60, criticalPeriod: false },
    { stage: "V-8 to R-1", nitrogen: 60, phosphorus: 20, potassium: 80, criticalPeriod: true },
    { stage: "R-5", nitrogen: 20, phosphorus: 10, potassium: 40, criticalPeriod: false }
  ],
  pestCalendar: [
    {
      pest: "Sunflower Moth",
      riskPeriod: "R3-R5 (pollen shed)",
      region: ["All sunflower regions"],
      severity: "high",
      prevention: ["Early planting", "Trap monitoring", "Pheromone traps"],
      treatment: ["Insecticide at moth flight"]
    },
    {
      pest: "Red Sunflower Seed Weevil",
      riskPeriod: "R5 (flowering)",
      region: ["Northern Plains"],
      severity: "medium",
      prevention: ["Early planting", "Field borders", "Crop rotation"],
      treatment: ["Insecticide based on field counts"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Sclerotinia Head Rot",
      conditions: ["Cool, wet during bloom", "Dense stands", "High humidity"],
      symptoms: ["Soft rot of head", "White mold", "Shredded appearance"],
      prevention: ["Crop rotation", "Wider spacing", "Resistant hybrids"],
      criticalStage: "R5-R6"
    },
    {
      disease: "Rust",
      conditions: ["Moderate temperatures", "High humidity", "Volunteer sunflowers"],
      symptoms: ["Orange pustules", "Premature defoliation", "Reduced seed fill"],
      prevention: ["Resistant hybrids", "Fungicides", "Eliminate volunteers"],
      criticalStage: "R1-R6"
    }
  ],
  marketPatterns: {
    harvestPeak: "October",
    pricePatterns: [
      { month: "January", relativePrice: 1.05, volatility: "medium" },
      { month: "February", relativePrice: 1.08, volatility: "medium" },
      { month: "March", relativePrice: 1.12, volatility: "high" },
      { month: "April", relativePrice: 1.15, volatility: "high" },
      { month: "May", relativePrice: 1.18, volatility: "high" },
      { month: "June", relativePrice: 1.10, volatility: "medium" },
      { month: "July", relativePrice: 1.05, volatility: "medium" },
      { month: "August", relativePrice: 0.98, volatility: "medium" },
      { month: "September", relativePrice: 0.92, volatility: "low" },
      { month: "October", relativePrice: 0.88, volatility: "low" },
      { month: "November", relativePrice: 0.95, volatility: "medium" },
      { month: "December", relativePrice: 1.00, volatility: "medium" }
    ],
    storageRecommendation: {
      costPerBushel: 0.35,
      optimalSellMonth: "May",
      maxStorageDays: 240
    }
  },
  rotationBenefits: {
    followsWith: ["Small grains", "Corn", "Soybeans", "Fallow"],
    avoidAfter: ["Sunflower", "Canola", "Dry beans", "Sugar beets"],
    soilBenefits: ["Deep taproot accesses nutrients", "Good for saline soils", "Mycorrhizal associations benefit next crop"]
  }
}

// PHASE 1: HIGH-VALUE VEGETABLE CROPS

// Tomatoes Knowledge Base
export const TOMATOES_KNOWLEDGE: CropKnowledge = {
  name: "Tomatoes",
  varieties: ["Determinate", "Indeterminate", "Cherry", "Roma", "Beefsteak", "Heirloom"],
  regions: {
    optimal: ["California", "Florida", "North Carolina", "Virginia", "New Jersey"],
    suitable: ["Georgia", "Tennessee", "Ohio", "Michigan", "Pennsylvania"],
    challenging: ["Alaska", "North Dakota", "Montana", "Wyoming", "Maine"]
  },
  benchmarkYields: {
    "California": { average: 45, top25Percent: 55, top10Percent: 65, unit: "tons/acre" },
    "Florida": { average: 35, top25Percent: 42, top10Percent: 50, unit: "tons/acre" },
    "National": { average: 38, top25Percent: 46, top10Percent: 55, unit: "tons/acre" }
  },
  growthStages: [
    {
      stage: "Seedling (0-2 weeks)",
      daysFromPlanting: [7, 14],
      criticalFactors: ["Temperature control", "Light exposure", "Moisture management"],
      commonIssues: ["Damping off", "Temperature stress", "Overwatering"],
      actions: ["Monitor greenhouse conditions", "Adjust watering", "Check for disease"]
    },
    {
      stage: "Vegetative Growth (2-8 weeks)",
      daysFromPlanting: [14, 56],
      criticalFactors: ["Nitrogen nutrition", "Pruning", "Support structures"],
      commonIssues: ["Nutrient deficiency", "Aphid pressure", "Growth irregularities"],
      actions: ["Apply nitrogen fertilizer", "Install stakes/cages", "Scout for pests"]
    },
    {
      stage: "Flowering (8-12 weeks)",
      daysFromPlanting: [56, 84],
      criticalFactors: ["Pollination", "Calcium availability", "Water consistency"],
      commonIssues: ["Blossom end rot", "Poor fruit set", "Hornworm damage"],
      actions: ["Ensure consistent watering", "Monitor calcium levels", "Hand pollinate if needed"]
    },
    {
      stage: "Fruit Development (12-18 weeks)",
      daysFromPlanting: [84, 126],
      criticalFactors: ["Water management", "Disease prevention", "Harvest timing"],
      commonIssues: ["Cracking", "Late blight", "Fruit rot"],
      actions: ["Maintain consistent moisture", "Apply fungicides", "Begin selective harvest"]
    }
  ],
  nutritionNeeds: [
    { stage: "Seedling", nitrogen: 50, phosphorus: 80, potassium: 100, criticalPeriod: false },
    { stage: "Vegetative", nitrogen: 150, phosphorus: 50, potassium: 200, criticalPeriod: true },
    { stage: "Flowering", nitrogen: 120, phosphorus: 60, potassium: 250, criticalPeriod: true },
    { stage: "Fruiting", nitrogen: 100, phosphorus: 40, potassium: 300, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Tomato Hornworm",
      riskPeriod: "Mid-season through harvest",
      region: ["Southeast", "Southwest", "Mid-Atlantic"],
      severity: "high",
      prevention: ["Bt sprays", "Beneficial wasps", "Hand removal"],
      treatment: ["Bacillus thuringiensis", "Spinosad", "Manual removal"]
    },
    {
      pest: "Aphids",
      riskPeriod: "Early season",
      region: ["National"],
      severity: "medium",
      prevention: ["Reflective mulch", "Beneficial insects", "Row covers"],
      treatment: ["Insecticidal soap", "Neem oil", "Predatory insects"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Late Blight",
      conditions: ["Cool temperatures", "High humidity", "Wet foliage"],
      symptoms: ["Dark spots on leaves", "White fuzzy growth", "Fruit rot"],
      prevention: ["Resistant varieties", "Proper spacing", "Avoid overhead watering"],
      criticalStage: "Flowering to harvest"
    },
    {
      disease: "Blossom End Rot",
      conditions: ["Calcium deficiency", "Inconsistent watering", "pH imbalance"],
      symptoms: ["Dark sunken spots on fruit bottom", "Leathery texture"],
      prevention: ["Consistent watering", "Calcium application", "Soil pH management"],
      criticalStage: "Early fruit development"
    }
  ],
  marketPatterns: {
    harvestPeak: "July-September",
    pricePatterns: [
      { month: "May", relativePrice: 1.4, volatility: "high" },
      { month: "June", relativePrice: 1.2, volatility: "medium" },
      { month: "July", relativePrice: 0.8, volatility: "low" },
      { month: "August", relativePrice: 0.7, volatility: "low" },
      { month: "September", relativePrice: 0.9, volatility: "medium" },
      { month: "October", relativePrice: 1.3, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.50,
      optimalSellMonth: "October-November",
      maxStorageDays: 21
    }
  },
  rotationBenefits: {
    followsWith: ["Lettuce", "Broccoli", "Carrots", "Beans"],
    avoidAfter: ["Potatoes", "Peppers", "Eggplant"],
    soilBenefits: ["Deep root system", "Organic matter addition"]
  }
}

// Potatoes Knowledge Base  
export const POTATOES_KNOWLEDGE: CropKnowledge = {
  name: "Potatoes",
  varieties: ["Russet Burbank", "Red Pontiacs", "Yukon Gold", "Fingerling", "Purple Majesty"],
  regions: {
    optimal: ["Idaho", "Washington", "Wisconsin", "North Dakota", "Colorado"],
    suitable: ["Maine", "Oregon", "Minnesota", "Michigan", "Montana"],
    challenging: ["Florida", "Arizona", "Nevada", "Hawaii", "Louisiana"]
  },
  benchmarkYields: {
    "Idaho": { average: 525, top25Percent: 600, top10Percent: 700, unit: "cwt/acre" },
    "Washington": { average: 580, top25Percent: 650, top10Percent: 750, unit: "cwt/acre" },
    "Wisconsin": { average: 450, top25Percent: 520, top10Percent: 600, unit: "cwt/acre" },
    "National": { average: 460, top25Percent: 530, top10Percent: 620, unit: "cwt/acre" }
  },
  growthStages: [
    {
      stage: "Planting to Emergence (0-3 weeks)",
      daysFromPlanting: [10, 21],
      criticalFactors: ["Soil temperature", "Seed piece quality", "Planting depth"],
      commonIssues: ["Slow emergence", "Seed rot", "Uneven stands"],
      actions: ["Monitor soil conditions", "Check emergence rates", "Assess stand uniformity"]
    },
    {
      stage: "Vegetative Growth (3-8 weeks)",
      daysFromPlanting: [21, 56],
      criticalFactors: ["Nitrogen availability", "Weed control", "Hilling"],
      commonIssues: ["Colorado potato beetle", "Weed competition", "Nitrogen deficiency"],
      actions: ["Hill potatoes", "Apply nitrogen", "Scout for beetles"]
    },
    {
      stage: "Tuber Initiation (8-10 weeks)",
      daysFromPlanting: [56, 70],
      criticalFactors: ["Water consistency", "Temperature management", "Calcium availability"],
      commonIssues: ["Heat stress", "Irregular watering", "Tuber cracking"],
      actions: ["Maintain consistent irrigation", "Monitor soil temperature", "Apply calcium"]
    },
    {
      stage: "Tuber Bulking (10-16 weeks)",
      daysFromPlanting: [70, 112],
      criticalFactors: ["Water management", "Potassium nutrition", "Disease prevention"],
      commonIssues: ["Late blight", "Scab", "Hollow heart"],
      actions: ["Monitor disease pressure", "Apply potassium", "Manage irrigation timing"]
    }
  ],
  nutritionNeeds: [
    { stage: "Planting", nitrogen: 30, phosphorus: 120, potassium: 100, criticalPeriod: false },
    { stage: "Vegetative", nitrogen: 120, phosphorus: 40, potassium: 150, criticalPeriod: true },
    { stage: "Tuber Initiation", nitrogen: 80, phosphorus: 30, potassium: 200, criticalPeriod: true },
    { stage: "Bulking", nitrogen: 60, phosphorus: 20, potassium: 250, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Colorado Potato Beetle",
      riskPeriod: "Early to mid-season",
      region: ["Eastern US", "Great Lakes", "Northeast"],
      severity: "high",
      prevention: ["Crop rotation", "Resistant varieties", "Early scouting"],
      treatment: ["Spinosad", "Imidacloprid", "Bacillus thuringiensis"]
    },
    {
      pest: "Potato Leafhopper",
      riskPeriod: "Mid-season",
      region: ["Eastern US", "Midwest"],
      severity: "medium",
      prevention: ["Row covers", "Beneficial insects", "Early detection"],
      treatment: ["Pyrethroid insecticides", "Neem oil"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Late Blight",
      conditions: ["Cool moist weather", "High humidity", "Poor air circulation"],
      symptoms: ["Water-soaked lesions", "White growth on leaves", "Tuber rot"],
      prevention: ["Resistant varieties", "Fungicide programs", "Proper spacing"],
      criticalStage: "Vegetative to bulking"
    },
    {
      disease: "Common Scab",
      conditions: ["High soil pH", "Dry conditions", "High soil temperature"],
      symptoms: ["Corky lesions on tubers", "Rough skin texture"],
      prevention: ["Maintain soil pH 5.2-6.0", "Consistent moisture", "Organic matter"],
      criticalStage: "Tuber development"
    }
  ],
  marketPatterns: {
    harvestPeak: "September-October",
    pricePatterns: [
      { month: "November", relativePrice: 1.1, volatility: "medium" },
      { month: "December", relativePrice: 1.0, volatility: "low" },
      { month: "January", relativePrice: 1.0, volatility: "low" },
      { month: "February", relativePrice: 1.1, volatility: "medium" },
      { month: "March", relativePrice: 1.2, volatility: "medium" },
      { month: "April", relativePrice: 1.3, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.25,
      optimalSellMonth: "March-April",
      maxStorageDays: 240
    }
  },
  rotationBenefits: {
    followsWith: ["Corn", "Small grains", "Legumes"],
    avoidAfter: ["Tomatoes", "Peppers", "Eggplant"],
    soilBenefits: ["Soil structure improvement", "Organic matter addition"]
  }
}

// Onions Knowledge Base
export const ONIONS_KNOWLEDGE: CropKnowledge = {
  name: "Onions",
  varieties: ["Yellow Storage", "Sweet Onions", "Red Onions", "White Onions", "Shallots"],
  regions: {
    optimal: ["Washington", "Idaho", "Oregon", "California", "Colorado"],
    suitable: ["New York", "Michigan", "Georgia", "Texas", "Utah"],
    challenging: ["Florida", "Alaska", "Vermont", "Maine", "Hawaii"]
  },
  benchmarkYields: {
    "Washington": { average: 950, top25Percent: 1100, top10Percent: 1300, unit: "cwt/acre" },
    "Idaho": { average: 850, top25Percent: 1000, top10Percent: 1200, unit: "cwt/acre" },
    "Oregon": { average: 800, top25Percent: 950, top10Percent: 1100, unit: "cwt/acre" },
    "National": { average: 650, top25Percent: 800, top10Percent: 950, unit: "cwt/acre" }
  },
  growthStages: [
    {
      stage: "Seedling/Transplant (0-4 weeks)",
      daysFromPlanting: [0, 28],
      criticalFactors: ["Temperature control", "Moisture management", "Light intensity"],
      commonIssues: ["Damping off", "Transplant shock", "Poor establishment"],
      actions: ["Monitor greenhouse conditions", "Gradual hardening", "Consistent watering"]
    },
    {
      stage: "Vegetative Growth (4-12 weeks)",
      daysFromPlanting: [28, 84],
      criticalFactors: ["Nitrogen nutrition", "Weed control", "Day length"],
      commonIssues: ["Weed competition", "Thrips damage", "Nitrogen deficiency"],
      actions: ["Apply nitrogen fertilizer", "Cultivate for weeds", "Scout for thrips"]
    },
    {
      stage: "Bulb Initiation (12-16 weeks)",
      daysFromPlanting: [84, 112],
      criticalFactors: ["Day length trigger", "Temperature", "Water management"],
      commonIssues: ["Premature bolting", "Irregular bulbing", "Water stress"],
      actions: ["Monitor day length", "Adjust irrigation", "Reduce nitrogen"]
    },
    {
      stage: "Bulb Development (16-22 weeks)",
      daysFromPlanting: [112, 154],
      criticalFactors: ["Potassium nutrition", "Disease prevention", "Harvest timing"],
      commonIssues: ["Bacterial rot", "Neck rot", "Sunscald"],
      actions: ["Apply potassium", "Fungicide applications", "Begin curing process"]
    }
  ],
  nutritionNeeds: [
    { stage: "Transplant", nitrogen: 40, phosphorus: 60, potassium: 80, criticalPeriod: false },
    { stage: "Vegetative", nitrogen: 100, phosphorus: 30, potassium: 120, criticalPeriod: true },
    { stage: "Bulb Initiation", nitrogen: 60, phosphorus: 20, potassium: 150, criticalPeriod: true },
    { stage: "Bulb Development", nitrogen: 30, phosphorus: 15, potassium: 180, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Onion Thrips",
      riskPeriod: "Mid to late season",
      region: ["National"],
      severity: "high",
      prevention: ["Blue sticky traps", "Reflective mulch", "Beneficial insects"],
      treatment: ["Spinosad", "Imidacloprid", "Predatory mites"]
    },
    {
      pest: "Onion Maggot",
      riskPeriod: "Early season",
      region: ["Northern US", "Pacific Northwest"],
      severity: "medium",
      prevention: ["Crop rotation", "Row covers", "Delayed planting"],
      treatment: ["Soil insecticides", "Beneficial nematodes"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Downy Mildew",
      conditions: ["Cool moist conditions", "High humidity", "Poor air circulation"],
      symptoms: ["Yellow streaks on leaves", "Fuzzy growth", "Bulb rot"],
      prevention: ["Resistant varieties", "Proper spacing", "Fungicide programs"],
      criticalStage: "Vegetative to bulbing"
    },
    {
      disease: "Bacterial Soft Rot",
      conditions: ["Warm temperatures", "High moisture", "Wounds or injuries"],
      symptoms: ["Soft watery rot", "Foul odor", "Collapsing tissue"],
      prevention: ["Avoid injuries", "Proper curing", "Good drainage"],
      criticalStage: "Harvest and storage"
    }
  ],
  marketPatterns: {
    harvestPeak: "August-September",
    pricePatterns: [
      { month: "September", relativePrice: 0.9, volatility: "low" },
      { month: "October", relativePrice: 1.0, volatility: "low" },
      { month: "December", relativePrice: 1.1, volatility: "medium" },
      { month: "February", relativePrice: 1.2, volatility: "medium" },
      { month: "April", relativePrice: 1.3, volatility: "high" },
      { month: "June", relativePrice: 1.4, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.30,
      optimalSellMonth: "April-June",
      maxStorageDays: 300
    }
  },
  rotationBenefits: {
    followsWith: ["Brassicas", "Legumes", "Small grains"],
    avoidAfter: ["Garlic", "Leeks", "Other alliums"],
    soilBenefits: ["Pest disruption", "Different root zone"]
  }
}

// PHASE 2: TREE CROPS

// Apples Knowledge Base
export const APPLES_KNOWLEDGE: CropKnowledge = {
  name: "Apples",
  varieties: ["Red Delicious", "Gala", "Granny Smith", "Fuji", "Honeycrisp", "Golden Delicious"],
  regions: {
    optimal: ["Washington", "New York", "Michigan", "Pennsylvania", "Virginia"],
    suitable: ["North Carolina", "California", "Wisconsin", "Minnesota", "Oregon"],
    challenging: ["Florida", "Texas", "Arizona", "Nevada", "Hawaii"]
  },
  benchmarkYields: {
    "Washington": { average: 58, top25Percent: 70, top10Percent: 85, unit: "tons/acre" },
    "New York": { average: 45, top25Percent: 55, top10Percent: 68, unit: "tons/acre" },
    "Michigan": { average: 42, top25Percent: 52, top10Percent: 65, unit: "tons/acre" },
    "National": { average: 48, top25Percent: 58, top10Percent: 72, unit: "tons/acre" }
  },
  growthStages: [
    {
      stage: "Dormant Season (Winter)",
      daysFromPlanting: [0, 90],
      criticalFactors: ["Chill hours", "Pruning", "Winter protection"],
      commonIssues: ["Winter damage", "Inadequate chill", "Pruning wounds"],
      actions: ["Dormant pruning", "Apply dormant oil", "Protect from cold damage"]
    },
    {
      stage: "Bud Break to Bloom (Spring)",
      daysFromPlanting: [90, 120],
      criticalFactors: ["Frost protection", "Pollination", "Disease prevention"],
      commonIssues: ["Spring frost", "Poor pollination", "Fire blight"],
      actions: ["Monitor frost risk", "Ensure pollinators", "Apply fungicides"]
    },
    {
      stage: "Fruit Set to Cell Division (Early Summer)",
      daysFromPlanting: [120, 180],
      criticalFactors: ["Water management", "Thinning", "Nutrient uptake"],
      commonIssues: ["June drop", "Overcropping", "Nitrogen deficiency"],
      actions: ["Hand thin fruit", "Apply fertilizer", "Monitor water stress"]
    },
    {
      stage: "Fruit Development to Harvest (Late Summer)",
      daysFromPlanting: [180, 240],
      criticalFactors: ["Water consistency", "Pest management", "Harvest timing"],
      commonIssues: ["Codling moth", "Apple scab", "Sunburn"],
      actions: ["Monitor pest traps", "Apply protective sprays", "Begin harvest testing"]
    }
  ],
  nutritionNeeds: [
    { stage: "Dormant", nitrogen: 20, phosphorus: 30, potassium: 40, criticalPeriod: false },
    { stage: "Bud Break", nitrogen: 80, phosphorus: 20, potassium: 100, criticalPeriod: true },
    { stage: "Fruit Set", nitrogen: 60, phosphorus: 15, potassium: 120, criticalPeriod: true },
    { stage: "Fruit Development", nitrogen: 40, phosphorus: 10, potassium: 150, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Codling Moth",
      riskPeriod: "Late spring through summer",
      region: ["Pacific Northwest", "Northeast", "Mid-Atlantic"],
      severity: "high",
      prevention: ["Pheromone traps", "Mating disruption", "Beneficial insects"],
      treatment: ["Insect growth regulators", "Spinosad", "Bacillus thuringiensis"]
    },
    {
      pest: "Apple Maggot",
      riskPeriod: "Mid to late summer",
      region: ["Northeast", "Great Lakes"],
      severity: "high",
      prevention: ["Red sphere traps", "Sanitation", "Early harvest"],
      treatment: ["Targeted sprays", "Beneficial nematodes", "Trap crops"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Apple Scab",
      conditions: ["Cool wet weather", "High humidity", "Poor air circulation"],
      symptoms: ["Olive-green spots on leaves", "Fruit lesions", "Defoliation"],
      prevention: ["Resistant varieties", "Fungicide programs", "Proper pruning"],
      criticalStage: "Bud break to fruit set"
    },
    {
      disease: "Fire Blight",
      conditions: ["Warm humid weather", "Recent pruning", "Young tissue"],
      symptoms: ["Wilted shoots", "Blackened branches", "Oozing cankers"],
      prevention: ["Resistant varieties", "Avoid excess nitrogen", "Prune in dry weather"],
      criticalStage: "Bloom to early fruit development"
    }
  ],
  marketPatterns: {
    harvestPeak: "September-October",
    pricePatterns: [
      { month: "September", relativePrice: 0.9, volatility: "low" },
      { month: "October", relativePrice: 1.0, volatility: "low" },
      { month: "November", relativePrice: 1.1, volatility: "medium" },
      { month: "December", relativePrice: 1.2, volatility: "medium" },
      { month: "February", relativePrice: 1.3, volatility: "high" },
      { month: "May", relativePrice: 1.4, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.75,
      optimalSellMonth: "February-May",
      maxStorageDays: 180
    }
  },
  rotationBenefits: {
    followsWith: ["Cover crops", "Grass strips", "Companion plants"],
    avoidAfter: ["Stone fruits", "Other pome fruits"],
    soilBenefits: ["Deep root system", "Perennial ground cover", "Carbon sequestration"]
  }
}

// Almonds Knowledge Base
export const ALMONDS_KNOWLEDGE: CropKnowledge = {
  name: "Almonds",
  varieties: ["Nonpareil", "Carmel", "Monterey", "Butte", "Padre", "Fritz"],
  regions: {
    optimal: ["California"],
    suitable: ["Mediterranean climates", "Australia", "Spain"],
    challenging: ["Humid climates", "Cold winter areas", "Short season regions"]
  },
  benchmarkYields: {
    "California": { average: 2800, top25Percent: 3200, top10Percent: 3800, unit: "lbs/acre" },
    "Central Valley": { average: 3000, top25Percent: 3400, top10Percent: 4000, unit: "lbs/acre" },
    "National": { average: 2800, top25Percent: 3200, top10Percent: 3800, unit: "lbs/acre" }
  },
  growthStages: [
    {
      stage: "Dormancy (November-February)",
      daysFromPlanting: [0, 90],
      criticalFactors: ["Chill accumulation", "Pruning", "Dormant applications"],
      commonIssues: ["Insufficient chill", "Winter damage", "Navel orangeworm"],
      actions: ["Dormant pruning", "Mummy nut removal", "Apply dormant treatments"]
    },
    {
      stage: "Bloom (February-March)",
      daysFromPlanting: [90, 120],
      criticalFactors: ["Pollination", "Weather conditions", "Bee activity"],
      commonIssues: ["Rain during bloom", "Poor pollination", "Frost damage"],
      actions: ["Place bee hives", "Monitor weather", "Support pollinators"]
    },
    {
      stage: "Nut Development (April-July)",
      daysFromPlanting: [120, 210],
      criticalFactors: ["Water management", "Hull split timing", "Disease prevention"],
      commonIssues: ["Water stress", "Hull rot", "Brown rot"],
      actions: ["Maintain consistent irrigation", "Monitor hull split", "Fungicide applications"]
    },
    {
      stage: "Harvest (August-October)",
      daysFromPlanting: [210, 270],
      criticalFactors: ["Harvest timing", "Drying", "Storage"],
      commonIssues: ["Delayed harvest", "Rain damage", "Aflatoxin risk"],
      actions: ["Monitor moisture content", "Quick drying", "Proper storage"]
    }
  ],
  nutritionNeeds: [
    { stage: "Dormant", nitrogen: 30, phosphorus: 20, potassium: 40, criticalPeriod: false },
    { stage: "Bloom", nitrogen: 100, phosphorus: 15, potassium: 80, criticalPeriod: true },
    { stage: "Nut Fill", nitrogen: 150, phosphorus: 10, potassium: 120, criticalPeriod: true },
    { stage: "Post Harvest", nitrogen: 50, phosphorus: 25, potassium: 100, criticalPeriod: false }
  ],
  pestCalendar: [
    {
      pest: "Navel Orangeworm",
      riskPeriod: "Hull split through harvest",
      region: ["California", "Mediterranean climates"],
      severity: "high",
      prevention: ["Mummy nut removal", "Early harvest", "Pheromone traps"],
      treatment: ["Targeted insecticides", "Mating disruption", "Biological control"]
    },
    {
      pest: "Peach Twig Borer",
      riskPeriod: "Spring through summer",
      region: ["California", "Southwest"],
      severity: "medium",
      prevention: ["Dormant sprays", "Beneficial insects", "Monitoring traps"],
      treatment: ["Selective insecticides", "Biological controls"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Brown Rot",
      conditions: ["Wet weather during bloom", "High humidity", "Wounded tissue"],
      symptoms: ["Blossom blight", "Twig dieback", "Fruit rot"],
      prevention: ["Fungicide programs", "Pruning for air circulation", "Sanitation"],
      criticalStage: "Bloom through hull split"
    },
    {
      disease: "Hull Rot",
      conditions: ["Wet conditions", "Late season moisture", "Poor air circulation"],
      symptoms: ["Hull discoloration", "Kernel damage", "Quality reduction"],
      prevention: ["Good orchard sanitation", "Proper spacing", "Timely harvest"],
      criticalStage: "Hull split to harvest"
    }
  ],
  marketPatterns: {
    harvestPeak: "August-September",
    pricePatterns: [
      { month: "August", relativePrice: 0.8, volatility: "high" },
      { month: "September", relativePrice: 0.9, volatility: "medium" },
      { month: "October", relativePrice: 1.0, volatility: "low" },
      { month: "December", relativePrice: 1.1, volatility: "medium" },
      { month: "March", relativePrice: 1.2, volatility: "high" },
      { month: "June", relativePrice: 1.3, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.15,
      optimalSellMonth: "March-June",
      maxStorageDays: 365
    }
  },
  rotationBenefits: {
    followsWith: ["Permanent crops", "Cover crops", "Bee-friendly plants"],
    avoidAfter: ["Stone fruits", "Susceptible crops"],
    soilBenefits: ["Deep rooting", "Nitrogen fixation (with cover crops)", "Soil structure"]
  }
}

// Grapes Knowledge Base
export const GRAPES_KNOWLEDGE: CropKnowledge = {
  name: "Grapes",
  varieties: ["Cabernet Sauvignon", "Chardonnay", "Thompson Seedless", "Red Globe", "Pinot Noir"],
  regions: {
    optimal: ["California", "Washington", "New York", "Oregon"],
    suitable: ["Texas", "Virginia", "North Carolina", "Michigan"],
    challenging: ["Florida", "Alaska", "Very humid regions", "Extreme cold areas"]
  },
  benchmarkYields: {
    "California": { average: 8.5, top25Percent: 10.5, top10Percent: 12.5, unit: "tons/acre" },
    "Washington": { average: 7.2, top25Percent: 8.8, top10Percent: 10.5, unit: "tons/acre" },
    "New York": { average: 6.8, top25Percent: 8.2, top10Percent: 9.8, unit: "tons/acre" },
    "National": { average: 7.8, top25Percent: 9.2, top10Percent: 11.0, unit: "tons/acre" }
  },
  growthStages: [
    {
      stage: "Dormancy (Winter)",
      daysFromPlanting: [0, 90],
      criticalFactors: ["Chill accumulation", "Pruning", "Winter protection"],
      commonIssues: ["Inadequate chill", "Pruning timing", "Cold damage"],
      actions: ["Winter pruning", "Apply dormant sprays", "Protect from cold"]
    },
    {
      stage: "Bud Break to Flowering (Spring)",
      daysFromPlanting: [90, 150],
      criticalFactors: ["Frost protection", "Disease prevention", "Shoot positioning"],
      commonIssues: ["Spring frost", "Powdery mildew", "Excessive vigor"],
      actions: ["Monitor frost risk", "Apply fungicides", "Canopy management"]
    },
    {
      stage: "Fruit Set to Veraison (Early Summer)",
      daysFromPlanting: [150, 210],
      criticalFactors: ["Water management", "Cluster thinning", "Pest control"],
      commonIssues: ["Water stress", "Overcropping", "Berry moths"],
      actions: ["Regulate irrigation", "Thin clusters", "Monitor for pests"]
    },
    {
      stage: "Veraison to Harvest (Late Summer)",
      daysFromPlanting: [210, 270],
      criticalFactors: ["Sugar accumulation", "Disease prevention", "Harvest timing"],
      commonIssues: ["Bunch rot", "Bird damage", "Weather damage"],
      actions: ["Monitor sugar levels", "Apply protective measures", "Schedule harvest"]
    }
  ],
  nutritionNeeds: [
    { stage: "Dormant", nitrogen: 20, phosphorus: 30, potassium: 50, criticalPeriod: false },
    { stage: "Bud Break", nitrogen: 60, phosphorus: 20, potassium: 80, criticalPeriod: true },
    { stage: "Fruit Set", nitrogen: 40, phosphorus: 15, potassium: 120, criticalPeriod: true },
    { stage: "Veraison", nitrogen: 20, phosphorus: 10, potassium: 150, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Grape Berry Moth",
      riskPeriod: "Bloom through harvest",
      region: ["Eastern US", "Great Lakes"],
      severity: "high",
      prevention: ["Pheromone traps", "Canopy management", "Beneficial insects"],
      treatment: ["Targeted insecticides", "Bacillus thuringiensis", "Mating disruption"]
    },
    {
      pest: "European Grapevine Moth",
      riskPeriod: "Spring through fall",
      region: ["California", "Mediterranean climates"],
      severity: "high",
      prevention: ["Monitoring programs", "Sanitation", "Biological control"],
      treatment: ["Selective insecticides", "Sterile insect technique"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Powdery Mildew",
      conditions: ["Moderate temperatures", "High humidity", "Poor air circulation"],
      symptoms: ["White powdery growth", "Leaf distortion", "Berry splitting"],
      prevention: ["Resistant varieties", "Canopy management", "Fungicide programs"],
      criticalStage: "Bud break through fruit set"
    },
    {
      disease: "Botrytis Bunch Rot",
      conditions: ["Cool moist weather", "Dense canopies", "Wounded berries"],
      symptoms: ["Gray fuzzy growth", "Berry shrinkage", "Quality loss"],
      prevention: ["Canopy management", "Cluster thinning", "Good air circulation"],
      criticalStage: "Veraison through harvest"
    }
  ],
  marketPatterns: {
    harvestPeak: "August-October",
    pricePatterns: [
      { month: "September", relativePrice: 0.9, volatility: "medium" },
      { month: "October", relativePrice: 1.0, volatility: "low" },
      { month: "November", relativePrice: 1.1, volatility: "medium" },
      { month: "January", relativePrice: 1.2, volatility: "high" },
      { month: "April", relativePrice: 1.3, volatility: "high" },
      { month: "July", relativePrice: 1.4, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.20,
      optimalSellMonth: "April-July",
      maxStorageDays: 120
    }
  },
  rotationBenefits: {
    followsWith: ["Cover crops", "Companion plants", "Sustainable practices"],
    avoidAfter: ["Infected vineyards", "Contaminated soils"],
    soilBenefits: ["Deep root system", "Soil structure", "Erosion control"]
  }
}

// PHASE 3: SPECIALTY HIGH-VALUE CROPS

// Strawberries Knowledge Base
export const STRAWBERRIES_KNOWLEDGE: CropKnowledge = {
  name: "Strawberries",
  varieties: ["June-bearing", "Everbearing", "Day-neutral", "Albion", "Seascape", "Chandler"],
  regions: {
    optimal: ["California", "Florida", "North Carolina", "Oregon", "Washington"],
    suitable: ["New York", "Michigan", "Wisconsin", "Maine", "Virginia"],
    challenging: ["Arizona", "Nevada", "North Dakota", "Alaska"]
  },
  benchmarkYields: {
    "California": { average: 25, top25Percent: 30, top10Percent: 35, unit: "tons/acre" },
    "Florida": { average: 20, top25Percent: 24, top10Percent: 28, unit: "tons/acre" },
    "National": { average: 22, top25Percent: 26, top10Percent: 30, unit: "tons/acre" }
  },
  growthStages: [
    {
      stage: "Planting/Establishment (0-4 weeks)",
      daysFromPlanting: [0, 28],
      criticalFactors: ["Root establishment", "Water management", "Temperature control"],
      commonIssues: ["Transplant shock", "Crown rot", "Poor establishment"],
      actions: ["Ensure proper planting depth", "Consistent moisture", "Monitor plant health"]
    },
    {
      stage: "Vegetative Growth (4-12 weeks)",
      daysFromPlanting: [28, 84],
      criticalFactors: ["Runner management", "Nutrient balance", "Disease prevention"],
      commonIssues: ["Excessive runners", "Nutrient deficiencies", "Gray mold"],
      actions: ["Remove excess runners", "Apply balanced fertilizer", "Improve air circulation"]
    },
    {
      stage: "Flowering/Fruit Set (12-16 weeks)",
      daysFromPlanting: [84, 112],
      criticalFactors: ["Pollination", "Frost protection", "Water consistency"],
      commonIssues: ["Poor pollination", "Frost damage", "Irregular watering"],
      actions: ["Protect from frost", "Ensure pollinators", "Maintain consistent irrigation"]
    },
    {
      stage: "Harvest (16-26 weeks)",
      daysFromPlanting: [112, 182],
      criticalFactors: ["Harvest timing", "Quality maintenance", "Pest management"],
      commonIssues: ["Overripe fruit", "Spider mites", "Sap beetles"],
      actions: ["Harvest every 2-3 days", "Monitor for pests", "Maintain cool chain"]
    }
  ],
  nutritionNeeds: [
    { stage: "Planting", nitrogen: 30, phosphorus: 50, potassium: 60, criticalPeriod: false },
    { stage: "Vegetative", nitrogen: 80, phosphorus: 30, potassium: 100, criticalPeriod: true },
    { stage: "Flowering", nitrogen: 60, phosphorus: 40, potassium: 120, criticalPeriod: true },
    { stage: "Harvest", nitrogen: 50, phosphorus: 25, potassium: 140, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Spider Mites",
      riskPeriod: "Hot dry periods",
      region: ["National"],
      severity: "high",
      prevention: ["Maintain humidity", "Beneficial predators", "Avoid water stress"],
      treatment: ["Predatory mites", "Miticides", "Horticultural oils"]
    },
    {
      pest: "Sap Beetles",
      riskPeriod: "Harvest period",
      region: ["Warm climates"],
      severity: "medium",
      prevention: ["Timely harvest", "Sanitation", "Trap crops"],
      treatment: ["Remove overripe fruit", "Targeted traps", "Insecticides"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Gray Mold (Botrytis)",
      conditions: ["Cool humid weather", "Dense canopies", "Poor air circulation"],
      symptoms: ["Gray fuzzy growth", "Fruit rot", "Flower blight"],
      prevention: ["Proper spacing", "Air circulation", "Fungicide programs"],
      criticalStage: "Flowering through harvest"
    }
  ],
  marketPatterns: {
    harvestPeak: "May-July",
    pricePatterns: [
      { month: "December", relativePrice: 1.8, volatility: "high" },
      { month: "February", relativePrice: 1.6, volatility: "high" },
      { month: "May", relativePrice: 1.0, volatility: "medium" },
      { month: "June", relativePrice: 0.8, volatility: "low" },
      { month: "July", relativePrice: 0.9, volatility: "medium" },
      { month: "November", relativePrice: 1.5, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 2.00,
      optimalSellMonth: "Immediate sale",
      maxStorageDays: 7
    }
  },
  rotationBenefits: {
    followsWith: ["Lettuce", "Brassicas", "Small grains"],
    avoidAfter: ["Nightshades", "Stone fruits", "Previous strawberries"],
    soilBenefits: ["Soil structure", "Organic matter from roots"]
  }
}

// Blueberries Knowledge Base
export const BLUEBERRIES_KNOWLEDGE: CropKnowledge = {
  name: "Blueberries",
  varieties: ["Northern Highbush", "Southern Highbush", "Rabbiteye", "Lowbush", "Half-high"],
  regions: {
    optimal: ["Maine", "Michigan", "Georgia", "North Carolina", "Oregon"],
    suitable: ["Washington", "New Jersey", "Florida", "Minnesota", "Wisconsin"],
    challenging: ["Arizona", "Nevada", "Kansas", "High pH soils"]
  },
  benchmarkYields: {
    "Michigan": { average: 12, top25Percent: 15, top10Percent: 18, unit: "tons/acre" },
    "Georgia": { average: 10, top25Percent: 13, top10Percent: 16, unit: "tons/acre" },
    "National": { average: 11, top25Percent: 14, top10Percent: 17, unit: "tons/acre" }
  },
  growthStages: [
    {
      stage: "Dormancy (Winter)",
      daysFromPlanting: [0, 90],
      criticalFactors: ["Chill requirements", "Pruning", "Soil pH maintenance"],
      commonIssues: ["Insufficient chill", "Scale insects", "Root damage"],
      actions: ["Dormant pruning", "Apply sulfur for pH", "Monitor chill hours"]
    },
    {
      stage: "Bloom/Pollination (Spring)",
      daysFromPlanting: [90, 120],
      criticalFactors: ["Pollination", "Frost protection", "Bee activity"],
      commonIssues: ["Poor bee activity", "Frost damage", "Disease pressure"],
      actions: ["Ensure adequate bees", "Frost protection measures", "Disease monitoring"]
    },
    {
      stage: "Fruit Development (Late Spring)",
      daysFromPlanting: [120, 180],
      criticalFactors: ["Water management", "Nutrient availability", "Bird protection"],
      commonIssues: ["Water stress", "Nutrient deficiency", "Bird damage"],
      actions: ["Maintain soil moisture", "Apply fertilizer", "Install bird netting"]
    },
    {
      stage: "Harvest (Summer)",
      daysFromPlanting: [180, 240],
      criticalFactors: ["Harvest timing", "Quality maintenance", "Pest management"],
      commonIssues: ["Spotted wing drosophila", "Overripe fruit", "Heat stress"],
      actions: ["Monitor for SWD", "Regular harvest", "Provide shade if needed"]
    }
  ],
  nutritionNeeds: [
    { stage: "Dormant", nitrogen: 40, phosphorus: 20, potassium: 30, criticalPeriod: false },
    { stage: "Bloom", nitrogen: 80, phosphorus: 15, potassium: 60, criticalPeriod: true },
    { stage: "Fruit Development", nitrogen: 60, phosphorus: 10, potassium: 80, criticalPeriod: true },
    { stage: "Post Harvest", nitrogen: 30, phosphorus: 25, potassium: 50, criticalPeriod: false }
  ],
  pestCalendar: [
    {
      pest: "Spotted Wing Drosophila",
      riskPeriod: "Fruit ripening period",
      region: ["National"],
      severity: "high",
      prevention: ["Early harvest", "Sanitation", "Fine mesh covers"],
      treatment: ["Targeted insecticides", "Mass trapping", "Sterile insect release"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Mummy Berry",
      conditions: ["Cool moist springs", "Infected plant debris", "Dense plantings"],
      symptoms: ["Shoot blight", "Mummified berries", "Reduced yield"],
      prevention: ["Sanitation", "Fungicide programs", "Resistant varieties"],
      criticalStage: "Bud break through fruit set"
    }
  ],
  marketPatterns: {
    harvestPeak: "June-August",
    pricePatterns: [
      { month: "January", relativePrice: 1.5, volatility: "high" },
      { month: "June", relativePrice: 0.8, volatility: "low" },
      { month: "July", relativePrice: 0.7, volatility: "low" },
      { month: "August", relativePrice: 0.9, volatility: "medium" },
      { month: "December", relativePrice: 1.4, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.80,
      optimalSellMonth: "December-March",
      maxStorageDays: 120
    }
  },
  rotationBenefits: {
    followsWith: ["Acid-loving plants", "Cover crops", "Understory crops"],
    avoidAfter: ["High pH crops", "Deep cultivation crops"],
    soilBenefits: ["Acidifies soil", "Shallow root system", "Perennial ground cover"]
  }
}

// PHASE 4: REGIONAL/ADDITIONAL CROPS

// Peanuts Knowledge Base
export const PEANUTS_KNOWLEDGE: CropKnowledge = {
  name: "Peanuts",
  varieties: ["Runner", "Virginia", "Spanish", "Valencia"],
  regions: {
    optimal: ["Georgia", "Alabama", "Florida", "North Carolina", "South Carolina"],
    suitable: ["Texas", "Virginia", "Oklahoma", "Arkansas"],
    challenging: ["Northern states", "High elevation", "Short seasons"]
  },
  benchmarkYields: {
    "Georgia": { average: 4200, top25Percent: 4800, top10Percent: 5500, unit: "lbs/acre" },
    "Alabama": { average: 3800, top25Percent: 4400, top10Percent: 5000, unit: "lbs/acre" },
    "National": { average: 4000, top25Percent: 4600, top10Percent: 5200, unit: "lbs/acre" }
  },
  growthStages: [
    {
      stage: "Planting to Emergence (0-2 weeks)",
      daysFromPlanting: [7, 14],
      criticalFactors: ["Soil temperature", "Moisture", "Seed quality"],
      commonIssues: ["Poor emergence", "Seed rot", "Thrips damage"],
      actions: ["Monitor soil temperature", "Ensure adequate moisture", "Scout for thrips"]
    },
    {
      stage: "Vegetative Growth (2-6 weeks)",
      daysFromPlanting: [14, 42],
      criticalFactors: ["Nitrogen fixation", "Weed control", "Disease prevention"],
      commonIssues: ["Weed competition", "Early leaf spot", "Thrips"],
      actions: ["Cultivate for weeds", "Begin disease monitoring", "Control thrips"]
    },
    {
      stage: "Flowering/Pegging (6-12 weeks)",
      daysFromPlanting: [42, 84],
      criticalFactors: ["Calcium availability", "Water management", "Disease control"],
      commonIssues: ["Calcium deficiency", "Leaf spot diseases", "Water stress"],
      actions: ["Apply gypsum", "Maintain consistent moisture", "Fungicide applications"]
    },
    {
      stage: "Pod Fill/Maturation (12-20 weeks)",
      daysFromPlanting: [84, 140],
      criticalFactors: ["Water consistency", "Disease management", "Harvest timing"],
      commonIssues: ["White mold", "Pod rot", "Aflatoxin risk"],
      actions: ["Monitor disease pressure", "Maintain soil moisture", "Plan harvest timing"]
    }
  ],
  nutritionNeeds: [
    { stage: "Planting", nitrogen: 25, phosphorus: 60, potassium: 100, criticalPeriod: false },
    { stage: "Vegetative", nitrogen: 20, phosphorus: 40, potassium: 80, criticalPeriod: true },
    { stage: "Flowering", nitrogen: 15, phosphorus: 30, potassium: 120, criticalPeriod: true },
    { stage: "Pod Fill", nitrogen: 10, phosphorus: 20, potassium: 150, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Thrips",
      riskPeriod: "Early season",
      region: ["Southeast", "South Central"],
      severity: "high",
      prevention: ["Resistant varieties", "Beneficial insects", "Early scouting"],
      treatment: ["Systemic insecticides", "Foliar applications"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Early Leaf Spot",
      conditions: ["Warm humid weather", "Poor air circulation", "Extended leaf wetness"],
      symptoms: ["Small dark spots on leaves", "Yellowing", "Defoliation"],
      prevention: ["Resistant varieties", "Crop rotation", "Fungicide programs"],
      criticalStage: "Vegetative through pod fill"
    }
  ],
  marketPatterns: {
    harvestPeak: "September-November",
    pricePatterns: [
      { month: "October", relativePrice: 0.9, volatility: "low" },
      { month: "November", relativePrice: 1.0, volatility: "low" },
      { month: "February", relativePrice: 1.1, volatility: "medium" },
      { month: "June", relativePrice: 1.2, volatility: "high" },
      { month: "August", relativePrice: 1.3, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.40,
      optimalSellMonth: "June-August",
      maxStorageDays: 300
    }
  },
  rotationBenefits: {
    followsWith: ["Cotton", "Corn", "Small grains"],
    avoidAfter: ["Legumes", "Previous peanuts"],
    soilBenefits: ["Nitrogen fixation", "Deep taproot", "Soil structure improvement"]
  }
}

// Sugar Beets Knowledge Base  
export const SUGAR_BEETS_KNOWLEDGE: CropKnowledge = {
  name: "Sugar Beets",
  varieties: ["Monogerm", "Multigerm", "Roundup Ready", "Conventional"],
  regions: {
    optimal: ["North Dakota", "Minnesota", "Idaho", "Michigan", "Montana"],
    suitable: ["Nebraska", "Wyoming", "Colorado", "Oregon", "Washington"],
    challenging: ["Southern states", "Hot humid climates", "Short day regions"]
  },
  benchmarkYields: {
    "North Dakota": { average: 28, top25Percent: 32, top10Percent: 36, unit: "tons/acre" },
    "Minnesota": { average: 26, top25Percent: 30, top10Percent: 34, unit: "tons/acre" },
    "National": { average: 27, top25Percent: 31, top10Percent: 35, unit: "tons/acre" }
  },
  growthStages: [
    {
      stage: "Planting to Emergence (0-3 weeks)",
      daysFromPlanting: [10, 21],
      criticalFactors: ["Soil temperature", "Moisture", "Seed bed preparation"],
      commonIssues: ["Poor emergence", "Crusting", "Seedling diseases"],
      actions: ["Monitor soil conditions", "Break crusts", "Scout for diseases"]
    },
    {
      stage: "Canopy Development (3-8 weeks)",
      daysFromPlanting: [21, 56],
      criticalFactors: ["Weed control", "Nitrogen availability", "Root establishment"],
      commonIssues: ["Weed competition", "Nitrogen deficiency", "Root maggot"],
      actions: ["Herbicide applications", "Side-dress nitrogen", "Monitor for pests"]
    },
    {
      stage: "Root Development (8-16 weeks)",
      daysFromPlanting: [56, 112],
      criticalFactors: ["Water management", "Disease prevention", "Nutrient balance"],
      commonIssues: ["Cercospora leaf spot", "Water stress", "Potassium deficiency"],
      actions: ["Maintain irrigation", "Fungicide applications", "Monitor nutrient status"]
    },
    {
      stage: "Sugar Accumulation (16-24 weeks)",
      daysFromPlanting: [112, 168],
      criticalFactors: ["Temperature", "Water stress management", "Harvest timing"],
      commonIssues: ["Storage root rot", "Excessive nitrogen", "Pest damage"],
      actions: ["Reduce nitrogen", "Monitor disease", "Plan harvest timing"]
    }
  ],
  nutritionNeeds: [
    { stage: "Planting", nitrogen: 50, phosphorus: 80, potassium: 100, criticalPeriod: false },
    { stage: "Canopy", nitrogen: 120, phosphorus: 40, potassium: 80, criticalPeriod: true },
    { stage: "Root Development", nitrogen: 80, phosphorus: 20, potassium: 120, criticalPeriod: true },
    { stage: "Sugar Accumulation", nitrogen: 30, phosphorus: 15, potassium: 150, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Sugar Beet Root Maggot",
      riskPeriod: "Early to mid-season",
      region: ["Northern Great Plains", "Pacific Northwest"],
      severity: "high",
      prevention: ["Crop rotation", "Delayed planting", "Resistant varieties"],
      treatment: ["Soil insecticides", "Beneficial nematodes"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Cercospora Leaf Spot",
      conditions: ["Warm humid weather", "Extended leaf wetness", "Dense canopies"],
      symptoms: ["Small gray spots with purple borders", "Yellowing", "Defoliation"],
      prevention: ["Resistant varieties", "Crop rotation", "Fungicide programs"],
      criticalStage: "Canopy development through harvest"
    }
  ],
  marketPatterns: {
    harvestPeak: "September-November",
    pricePatterns: [
      { month: "October", relativePrice: 1.0, volatility: "low" },
      { month: "November", relativePrice: 1.0, volatility: "low" },
      { month: "December", relativePrice: 1.0, volatility: "low" },
      { month: "January", relativePrice: 1.0, volatility: "low" }
    ],
    storageRecommendation: {
      costPerBushel: 0.20,
      optimalSellMonth: "Contract delivery",
      maxStorageDays: 60
    }
  },
  rotationBenefits: {
    followsWith: ["Wheat", "Corn", "Sunflower"],
    avoidAfter: ["Beets", "Spinach", "Chard"],
    soilBenefits: ["Deep taproot", "Soil structure", "Residue management"]
  }
}

// PHASE 5: QUICK ADDITIONAL CROPS (Abbreviated entries for speed)

// Carrots Knowledge Base
export const CARROTS_KNOWLEDGE: CropKnowledge = {
  name: "Carrots",
  varieties: ["Imperator", "Chantenay", "Danvers", "Paris Market", "Purple Haze"],
  regions: {
    optimal: ["California", "Washington", "Wisconsin", "Michigan", "Texas"],
    suitable: ["Oregon", "Colorado", "North Carolina", "Minnesota"],
    challenging: ["Hot humid climates", "Heavy clay soils"]
  },
  benchmarkYields: {
    "California": { average: 35, top25Percent: 42, top10Percent: 50, unit: "tons/acre" },
    "National": { average: 28, top25Percent: 35, top10Percent: 42, unit: "tons/acre" }
  },
  growthStages: [
    {
      stage: "Germination (0-2 weeks)",
      daysFromPlanting: [10, 21],
      criticalFactors: ["Soil temperature", "Moisture consistency", "Seed bed quality"],
      commonIssues: ["Poor germination", "Crusting", "Damping off"],
      actions: ["Maintain moisture", "Light cultivation", "Monitor emergence"]
    },
    {
      stage: "Root Development (2-12 weeks)",
      daysFromPlanting: [21, 84],
      criticalFactors: ["Soil structure", "Consistent moisture", "Weed control"],
      commonIssues: ["Forked roots", "Weed competition", "Carrot fly"],
      actions: ["Avoid cultivation", "Precise irrigation", "Scout for pests"]
    }
  ],
  nutritionNeeds: [
    { stage: "Germination", nitrogen: 40, phosphorus: 60, potassium: 80, criticalPeriod: false },
    { stage: "Root Development", nitrogen: 80, phosphorus: 40, potassium: 120, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Carrot Rust Fly",
      riskPeriod: "Early to mid-season",
      region: ["Pacific Northwest", "Northeast"],
      severity: "high",
      prevention: ["Row covers", "Crop rotation", "Delayed planting"],
      treatment: ["Beneficial nematodes", "Targeted sprays"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Alternaria Leaf Blight",
      conditions: ["Warm humid weather", "Extended leaf wetness"],
      symptoms: ["Dark spots on leaves", "Yellowing", "Defoliation"],
      prevention: ["Resistant varieties", "Fungicide programs"],
      criticalStage: "Mid to late season"
    }
  ],
  marketPatterns: {
    harvestPeak: "August-October",
    pricePatterns: [
      { month: "August", relativePrice: 0.9, volatility: "low" },
      { month: "December", relativePrice: 1.2, volatility: "medium" },
      { month: "March", relativePrice: 1.4, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.30,
      optimalSellMonth: "February-April",
      maxStorageDays: 180
    }
  },
  rotationBenefits: {
    followsWith: ["Brassicas", "Legumes", "Lettuce"],
    avoidAfter: ["Other root crops", "Parsley family"],
    soilBenefits: ["Taproot breaks compaction", "Organic matter"]
  }
}

// Lettuce Knowledge Base
export const LETTUCE_KNOWLEDGE: CropKnowledge = {
  name: "Lettuce",
  varieties: ["Iceberg", "Romaine", "Butterhead", "Leaf", "Green Leaf", "Red Leaf"],
  regions: {
    optimal: ["California", "Arizona", "Florida", "New Jersey"],
    suitable: ["Washington", "Oregon", "North Carolina", "Georgia"],
    challenging: ["Very hot climates", "High humidity regions"]
  },
  benchmarkYields: {
    "California": { average: 28, top25Percent: 32, top10Percent: 38, unit: "tons/acre" },
    "Arizona": { average: 25, top25Percent: 30, top10Percent: 35, unit: "tons/acre" },
    "National": { average: 26, top25Percent: 31, top10Percent: 36, unit: "tons/acre" }
  },
  growthStages: [
    {
      stage: "Germination/Transplant (0-2 weeks)",
      daysFromPlanting: [7, 14],
      criticalFactors: ["Temperature control", "Moisture management"],
      commonIssues: ["Poor germination", "Transplant shock"],
      actions: ["Monitor conditions", "Gradual hardening"]
    },
    {
      stage: "Head Formation (2-8 weeks)",
      daysFromPlanting: [14, 56],
      criticalFactors: ["Cool temperatures", "Consistent moisture", "Nitrogen"],
      commonIssues: ["Bolting", "Tip burn", "Aphids"],
      actions: ["Temperature management", "Regular irrigation", "Pest monitoring"]
    }
  ],
  nutritionNeeds: [
    { stage: "Transplant", nitrogen: 80, phosphorus: 40, potassium: 60, criticalPeriod: true },
    { stage: "Head Formation", nitrogen: 100, phosphorus: 30, potassium: 80, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Aphids",
      riskPeriod: "Throughout growing season",
      region: ["National"],
      severity: "medium",
      prevention: ["Beneficial insects", "Reflective mulch"],
      treatment: ["Insecticidal soap", "Predatory insects"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Downy Mildew",
      conditions: ["Cool moist conditions", "High humidity"],
      symptoms: ["Yellow spots", "Fuzzy growth underneath"],
      prevention: ["Good air circulation", "Resistant varieties"],
      criticalStage: "Head formation"
    }
  ],
  marketPatterns: {
    harvestPeak: "Year-round in optimal regions",
    pricePatterns: [
      { month: "January", relativePrice: 1.2, volatility: "medium" },
      { month: "July", relativePrice: 0.8, volatility: "low" },
      { month: "December", relativePrice: 1.3, volatility: "high" }
    ],
    storageRecommendation: {
      costPerBushel: 0.80,
      optimalSellMonth: "Immediate sale",
      maxStorageDays: 14
    }
  },
  rotationBenefits: {
    followsWith: ["Brassicas", "Root crops", "Alliums"],
    avoidAfter: ["Heavy nitrogen feeders"],
    soilBenefits: ["Light soil impact", "Quick turnover"]
  }
}

// Broccoli Knowledge Base
export const BROCCOLI_KNOWLEDGE: CropKnowledge = {
  name: "Broccoli",
  varieties: ["Calabrese", "Sprouting", "De Cicco", "Waltham", "Green Magic"],
  regions: {
    optimal: ["California", "Oregon", "Washington", "New York"],
    suitable: ["Wisconsin", "Michigan", "North Carolina", "Texas"],
    challenging: ["Hot summer regions", "Very humid climates"]
  },
  benchmarkYields: {
    "California": { average: 12, top25Percent: 15, top10Percent: 18, unit: "tons/acre" },
    "National": { average: 10, top25Percent: 13, top10Percent: 16, unit: "tons/acre" }
  },
  growthStages: [
    {
      stage: "Transplant Establishment (0-3 weeks)",
      daysFromPlanting: [7, 21],
      criticalFactors: ["Cool temperatures", "Moisture consistency"],
      commonIssues: ["Transplant shock", "Cutworms"],
      actions: ["Monitor establishment", "Protect from pests"]
    },
    {
      stage: "Head Development (3-12 weeks)",
      daysFromPlanting: [21, 84],
      criticalFactors: ["Temperature control", "Nutrition", "Water management"],
      commonIssues: ["Premature flowering", "Clubroot", "Cabbage worms"],
      actions: ["Temperature management", "Regular feeding", "Pest control"]
    }
  ],
  nutritionNeeds: [
    { stage: "Establishment", nitrogen: 60, phosphorus: 50, potassium: 80, criticalPeriod: true },
    { stage: "Head Development", nitrogen: 120, phosphorus: 40, potassium: 100, criticalPeriod: true }
  ],
  pestCalendar: [
    {
      pest: "Cabbage Worms",
      riskPeriod: "Throughout growing season",
      region: ["National"],
      severity: "high",
      prevention: ["Row covers", "Bt sprays", "Beneficial wasps"],
      treatment: ["Bacillus thuringiensis", "Spinosad"]
    }
  ],
  diseaseRisks: [
    {
      disease: "Clubroot",
      conditions: ["Acidic soils", "High moisture", "Cool conditions"],
      symptoms: ["Stunted growth", "Yellowing", "Swollen roots"],
      prevention: ["Soil pH management", "Resistant varieties", "Drainage"],
      criticalStage: "Throughout growth"
    }
  ],
  marketPatterns: {
    harvestPeak: "Fall and spring",
    pricePatterns: [
      { month: "October", relativePrice: 0.9, volatility: "low" },
      { month: "December", relativePrice: 1.2, volatility: "medium" },
      { month: "April", relativePrice: 0.8, volatility: "low" }
    ],
    storageRecommendation: {
      costPerBushel: 1.00,
      optimalSellMonth: "Immediate sale",
      maxStorageDays: 10
    }
  },
  rotationBenefits: {
    followsWith: ["Legumes", "Root crops", "Lettuce"],
    avoidAfter: ["Other brassicas", "Cabbage family"],
    soilBenefits: ["Heavy nutrient user", "Soil conditioning"]
  }
}

// Knowledge base registry - 24 CROP TYPES DEPLOYED
export const CROP_KNOWLEDGE_BASE: { [key: string]: CropKnowledge } = {
  // Field crops (9 core types)
  "corn": CORN_KNOWLEDGE,
  "soybeans": SOYBEAN_KNOWLEDGE,
  "soybean": SOYBEAN_KNOWLEDGE, // alias
  "wheat": WHEAT_KNOWLEDGE,
  "cotton": COTTON_KNOWLEDGE,
  "rice": RICE_KNOWLEDGE,
  "sorghum": SORGHUM_KNOWLEDGE,
  "canola": CANOLA_KNOWLEDGE,
  "barley": BARLEY_KNOWLEDGE,
  "sunflower": SUNFLOWER_KNOWLEDGE,
  "sunflowers": SUNFLOWER_KNOWLEDGE, // alias
  
  // High-value vegetable crops (6 types)
  "tomatoes": TOMATOES_KNOWLEDGE,
  "potatoes": POTATOES_KNOWLEDGE,
  "onions": ONIONS_KNOWLEDGE,
  "carrots": CARROTS_KNOWLEDGE,
  "lettuce": LETTUCE_KNOWLEDGE,
  "broccoli": BROCCOLI_KNOWLEDGE,
  
  // Tree/fruit crops (3 types)
  "apples": APPLES_KNOWLEDGE,
  "almonds": ALMONDS_KNOWLEDGE,
  "grapes": GRAPES_KNOWLEDGE,
  
  // Specialty berry crops (2 types) 
  "strawberries": STRAWBERRIES_KNOWLEDGE,
  "blueberries": BLUEBERRIES_KNOWLEDGE,
  
  // Regional specialty crops (4 types)
  "peanuts": PEANUTS_KNOWLEDGE,
  "sugar_beets": SUGAR_BEETS_KNOWLEDGE,
  "sugarbeets": SUGAR_BEETS_KNOWLEDGE, // alias
  "beets": SUGAR_BEETS_KNOWLEDGE // alias
}

// Goats Knowledge Base
export const GOATS_KNOWLEDGE: LivestockKnowledge = {
  species: "Goats",
  breeds: ["Boer", "Spanish", "Kiko", "Nubian", "Alpine", "Saanen", "Angora"],
  managementCalendar: [
    {
      month: "January",
      activities: [
        { category: "breeding", action: "Pregnancy check does", priority: "high" },
        { category: "health", action: "Hoof trimming", priority: "medium" },
        { category: "nutrition", action: "Increase feed for pregnant does", priority: "high" }
      ]
    },
    {
      month: "March",
      activities: [
        { category: "breeding", action: "Kidding season begins", priority: "high" },
        { category: "health", action: "CDT vaccination for kids", priority: "high", ageGroup: "2-4 weeks" },
        { category: "nutrition", action: "Creep feed for kids", priority: "medium" }
      ]
    },
    {
      month: "May",
      activities: [
        { category: "health", action: "Parasite monitoring FAMACHA", priority: "high" },
        { category: "breeding", action: "Wean kids", priority: "medium", ageGroup: "3-4 months" },
        { category: "nutrition", action: "Rotate pastures", priority: "medium" }
      ]
    },
    {
      month: "September",
      activities: [
        { category: "breeding", action: "Fall breeding season", priority: "high" },
        { category: "health", action: "Pre-breeding health check", priority: "high" },
        { category: "nutrition", action: "Flush feeding", priority: "medium" }
      ]
    }
  ],
  healthBenchmarks: [
    { metric: "Kidding Rate", optimal: [150, 200], units: "percent", checkFrequency: "per breeding" },
    { metric: "Average Daily Gain", optimal: [0.3, 0.5], units: "lbs/day", checkFrequency: "monthly" },
    { metric: "Body Condition Score", optimal: [2.5, 3.5], units: "1-5 scale", checkFrequency: "monthly" },
    { metric: "Mortality Rate", optimal: [0, 5], units: "percent", checkFrequency: "annually" }
  ],
  breedingCalendar: {
    optimalBreedingMonths: ["August", "September", "October", "November"],
    gestationDays: 150,
    birthingSeasonOptimal: ["February", "March", "April"],
    breedingAge: {
      female: 7,
      male: 6,
      units: "months"
    }
  },
  nutritionRequirements: [
    {
      lifeStage: "Lactating Doe",
      feedType: "16% protein grain + hay",
      dailyAmount: 4,
      units: "lbs",
      supplements: ["Calcium", "Phosphorus", "Copper"]
    },
    {
      lifeStage: "Growing Kid",
      feedType: "Creep feed 18% protein",
      dailyAmount: 1,
      units: "lbs",
      supplements: ["Coccidiostat", "Minerals"]
    }
  ],
  commonHealthIssues: [
    {
      condition: "Internal Parasites",
      symptoms: ["Anemia", "Bottle jaw", "Weight loss", "Rough coat"],
      seasonalRisk: ["Spring", "Summer", "Fall"],
      prevention: ["FAMACHA scoring", "Pasture rotation", "Browse feeding"],
      treatment: "Targeted deworming based on fecal counts"
    },
    {
      condition: "Caseous Lymphadenitis (CL)",
      symptoms: ["External abscesses", "Internal abscesses", "Weight loss"],
      seasonalRisk: ["Year-round"],
      prevention: ["Closed herd", "Quarantine new animals", "Vaccination"],
      treatment: "Isolate and lance abscesses with care"
    }
  ]
}

// Dairy Cows Knowledge Base (specialized from cattle)
export const DAIRY_CATTLE_SPECIALIZED: LivestockKnowledge = {
  species: "Dairy Cattle",
  breeds: ["Holstein", "Jersey", "Brown Swiss", "Guernsey", "Ayrshire", "Milking Shorthorn"],
  managementCalendar: [
    {
      month: "January",
      activities: [
        { category: "health", action: "Pregnancy check dry cows", priority: "high" },
        { category: "nutrition", action: "Monitor body condition dry cows", priority: "high" },
        { category: "breeding", action: "AI breeding program review", priority: "medium" }
      ]
    },
    {
      month: "Daily",
      activities: [
        { category: "health", action: "Mastitis screening at milking", priority: "high" },
        { category: "nutrition", action: "TMR mixing and delivery", priority: "high" },
        { category: "breeding", action: "Heat detection", priority: "high" }
      ]
    },
    {
      month: "March",
      activities: [
        { category: "health", action: "Hoof trimming schedule", priority: "high" },
        { category: "breeding", action: "Synchronization protocols", priority: "medium" },
        { category: "nutrition", action: "Transition cow management", priority: "high" }
      ]
    }
  ],
  healthBenchmarks: [
    { metric: "Milk Production", optimal: [70, 90], units: "lbs/day", checkFrequency: "daily" },
    { metric: "Somatic Cell Count", optimal: [0, 200000], units: "cells/mL", checkFrequency: "monthly" },
    { metric: "Conception Rate", optimal: [35, 45], units: "percent", checkFrequency: "21-day cycle" },
    { metric: "Dry Matter Intake", optimal: [50, 55], units: "lbs/day", checkFrequency: "daily" }
  ],
  breedingCalendar: {
    optimalBreedingMonths: ["Year-round with 60-90 day voluntary waiting period"],
    gestationDays: 280,
    birthingSeasonOptimal: ["Year-round calving"],
    breedingAge: {
      female: 13,
      male: 12,
      units: "months"
    }
  },
  nutritionRequirements: [
    {
      lifeStage: "Peak Lactation",
      feedType: "TMR 18-20% protein",
      dailyAmount: 55,
      units: "lbs dry matter",
      supplements: ["Bypass protein", "Fat supplements", "Buffers"]
    },
    {
      lifeStage: "Dry Cow",
      feedType: "Low potassium forage",
      dailyAmount: 26,
      units: "lbs dry matter",
      supplements: ["Anionic salts", "Vitamin E", "Selenium"]
    }
  ],
  commonHealthIssues: [
    {
      condition: "Milk Fever (Hypocalcemia)",
      symptoms: ["Down cow", "Cold ears", "Muscle tremors"],
      seasonalRisk: ["At calving"],
      prevention: ["Proper dry cow nutrition", "DCAD diet", "Calcium management"],
      treatment: "IV calcium immediately"
    },
    {
      condition: "Ketosis",
      symptoms: ["Decreased milk", "Weight loss", "Sweet breath"],
      seasonalRisk: ["Early lactation"],
      prevention: ["Proper transition feeding", "Monitor BCS", "Energy density"],
      treatment: "Propylene glycol, dextrose"
    }
  ]
}

// Turkeys Knowledge Base
export const TURKEY_KNOWLEDGE: LivestockKnowledge = {
  species: "Turkeys",
  breeds: ["Broad Breasted White", "Broad Breasted Bronze", "Heritage Varieties", "Beltsville Small White"],
  managementCalendar: [
    {
      month: "March",
      activities: [
        { category: "housing", action: "Brooder preparation", priority: "high" },
        { category: "health", action: "Order poults and vaccines", priority: "high" },
        { category: "nutrition", action: "Starter feed preparation", priority: "high" }
      ]
    },
    {
      month: "April",
      activities: [
        { category: "health", action: "Poult arrival and vaccination", priority: "high", ageGroup: "Day-old" },
        { category: "housing", action: "Brooder temperature 95°F", priority: "high" },
        { category: "nutrition", action: "28% starter feed", priority: "high", ageGroup: "0-8 weeks" }
      ]
    },
    {
      month: "July",
      activities: [
        { category: "housing", action: "Range or pasture access", priority: "medium" },
        { category: "health", action: "Blackhead prevention", priority: "high" },
        { category: "nutrition", action: "Grower feed 20-24%", priority: "high", ageGroup: "8-16 weeks" }
      ]
    },
    {
      month: "October",
      activities: [
        { category: "breeding", action: "Select breeding stock", priority: "medium" },
        { category: "health", action: "Pre-processing health check", priority: "high" },
        { category: "nutrition", action: "Finisher feed", priority: "high", ageGroup: "16+ weeks" }
      ]
    }
  ],
  healthBenchmarks: [
    { metric: "Feed Conversion", optimal: [2.5, 3.0], units: "lbs feed/lb gain", checkFrequency: "weekly" },
    { metric: "Mortality Rate", optimal: [0, 5], units: "percent", checkFrequency: "weekly" },
    { metric: "Market Weight (toms)", optimal: [35, 45], units: "lbs at 20 weeks", checkFrequency: "at processing" },
    { metric: "Market Weight (hens)", optimal: [18, 22], units: "lbs at 16 weeks", checkFrequency: "at processing" }
  ],
  breedingCalendar: {
    optimalBreedingMonths: ["February", "March"],
    gestationDays: 28,
    birthingSeasonOptimal: ["April", "May"],
    breedingAge: {
      female: 7,
      male: 7,
      units: "months"
    }
  },
  nutritionRequirements: [
    {
      lifeStage: "Starter (0-8 weeks)",
      feedType: "Turkey starter 28% protein",
      dailyAmount: 0.25,
      units: "lbs increasing to 2 lbs",
      supplements: ["Amprolium", "Vitamins", "Trace minerals"]
    },
    {
      lifeStage: "Finisher (16+ weeks)",
      feedType: "Turkey finisher 16% protein",
      dailyAmount: 1.0,
      units: "lbs",
      supplements: ["Minerals", "Probiotics"]
    }
  ],
  commonHealthIssues: [
    {
      condition: "Blackhead (Histomoniasis)",
      symptoms: ["Sulfur-colored droppings", "Darkened head", "Lethargy"],
      seasonalRisk: ["Warm, wet conditions"],
      prevention: ["Separate from chickens", "Good sanitation", "Deworming"],
      treatment: "Limited treatment options, prevention critical"
    },
    {
      condition: "Turkey Pox",
      symptoms: ["Lesions on head/neck", "Respiratory distress", "Growth retardation"],
      seasonalRisk: ["Summer", "Fall"],
      prevention: ["Vaccination", "Mosquito control", "Biosecurity"],
      treatment: "Supportive care, antibiotics for secondary infections"
    }
  ]
}

// Horses Knowledge Base
export const HORSES_KNOWLEDGE: LivestockKnowledge = {
  species: "Horses",
  breeds: ["Quarter Horse", "Thoroughbred", "Arabian", "Paint", "Appaloosa", "Warmblood"],
  managementCalendar: [
    {
      month: "January",
      activities: [
        { category: "health", action: "Annual Coggins test", priority: "high" },
        { category: "nutrition", action: "Adjust feed for cold weather", priority: "high" },
        { category: "housing", action: "Check blankets and shelter", priority: "medium" }
      ]
    },
    {
      month: "March",
      activities: [
        { category: "health", action: "Spring vaccinations (EWT, WNV)", priority: "high" },
        { category: "breeding", action: "Mare breeding soundness", priority: "high" },
        { category: "nutrition", action: "Transition to spring pasture slowly", priority: "high" }
      ]
    },
    {
      month: "May",
      activities: [
        { category: "health", action: "Dental examination", priority: "high" },
        { category: "breeding", action: "Peak breeding season", priority: "high" },
        { category: "health", action: "Deworming based on FEC", priority: "medium" }
      ]
    },
    {
      month: "September",
      activities: [
        { category: "health", action: "Fall vaccinations", priority: "high" },
        { category: "nutrition", action: "Body condition scoring", priority: "medium" },
        { category: "housing", action: "Winterize facilities", priority: "medium" }
      ]
    }
  ],
  healthBenchmarks: [
    { metric: "Body Condition Score", optimal: [5, 6], units: "1-9 scale", checkFrequency: "monthly" },
    { metric: "Heart Rate", optimal: [28, 44], units: "beats/minute", checkFrequency: "as needed" },
    { metric: "Temperature", optimal: [99, 101], units: "°F", checkFrequency: "as needed" },
    { metric: "Hoof Growth", optimal: [0.25, 0.35], units: "inches/month", checkFrequency: "every 6-8 weeks" }
  ],
  breedingCalendar: {
    optimalBreedingMonths: ["April", "May", "June", "July"],
    gestationDays: 340,
    birthingSeasonOptimal: ["March", "April", "May", "June"],
    breedingAge: {
      female: 36,
      male: 24,
      units: "months"
    }
  },
  nutritionRequirements: [
    {
      lifeStage: "Maintenance (1100 lb horse)",
      feedType: "Grass hay + pasture",
      dailyAmount: 22,
      units: "lbs",
      supplements: ["Salt", "Mineral block", "Vitamin E if no pasture"]
    },
    {
      lifeStage: "Lactating Mare",
      feedType: "High quality hay + grain",
      dailyAmount: 30,
      units: "lbs",
      supplements: ["Calcium", "Phosphorus", "Increased protein"]
    },
    {
      lifeStage: "Performance Horse",
      feedType: "Hay + performance grain",
      dailyAmount: 25,
      units: "lbs",
      supplements: ["Electrolytes", "Joint supplements", "B vitamins"]
    }
  ],
  commonHealthIssues: [
    {
      condition: "Colic",
      symptoms: ["Pawing", "Rolling", "Looking at sides", "Not eating"],
      seasonalRisk: ["Year-round", "Higher with weather changes"],
      prevention: ["Consistent feeding", "Parasite control", "Dental care", "Water access"],
      treatment: "Veterinary emergency - walk horse, no feed until vet arrives"
    },
    {
      condition: "Laminitis",
      symptoms: ["Reluctance to move", "Heat in hooves", "Digital pulse", "Rocked back stance"],
      seasonalRisk: ["Spring", "Rich pasture season"],
      prevention: ["Limit rich pasture", "Maintain proper weight", "Regular hoof care"],
      treatment: "Immediate veterinary care, anti-inflammatories, corrective shoeing"
    }
  ]
}

export const LIVESTOCK_KNOWLEDGE_BASE: { [key: string]: LivestockKnowledge } = {
  "cattle": CATTLE_KNOWLEDGE,
  "beef_cattle": CATTLE_KNOWLEDGE,
  "dairy_cattle": DAIRY_CATTLE_SPECIALIZED,
  "dairy": DAIRY_CATTLE_SPECIALIZED,
  "swine": SWINE_KNOWLEDGE,
  "pigs": SWINE_KNOWLEDGE,
  "hogs": SWINE_KNOWLEDGE,
  "poultry": POULTRY_KNOWLEDGE,
  "chickens": POULTRY_KNOWLEDGE,
  "layers": POULTRY_KNOWLEDGE,
  "sheep": SHEEP_KNOWLEDGE,
  "lambs": SHEEP_KNOWLEDGE,
  "goats": GOATS_KNOWLEDGE,
  "goat": GOATS_KNOWLEDGE,
  "turkeys": TURKEY_KNOWLEDGE,
  "turkey": TURKEY_KNOWLEDGE,
  "horses": HORSES_KNOWLEDGE,
  "horse": HORSES_KNOWLEDGE,
  "equine": HORSES_KNOWLEDGE
}

// Helper functions
export function getCropKnowledge(cropType: string): CropKnowledge | null {
  const normalized = cropType.toLowerCase().replace(/[^a-z]/g, '')
  return CROP_KNOWLEDGE_BASE[normalized] || null
}

export function getLivestockKnowledge(species: string): LivestockKnowledge | null {
  const normalized = species.toLowerCase().replace(/[^a-z_]/g, '')
  return LIVESTOCK_KNOWLEDGE_BASE[normalized] || null
}

export function getBenchmarkYield(cropType: string, region: string): number | null {
  const knowledge = getCropKnowledge(cropType)
  if (!knowledge) return null
  
  return knowledge.benchmarkYields[region]?.average || 
         knowledge.benchmarkYields["National"]?.average || 
         null
}

export function getCurrentGrowthStage(cropType: string, daysFromPlanting: number): string {
  const knowledge = getCropKnowledge(cropType)
  if (!knowledge) return "Unknown"
  
  for (const stage of knowledge.growthStages) {
    if (daysFromPlanting >= stage.daysFromPlanting[0] && 
        daysFromPlanting <= stage.daysFromPlanting[1]) {
      return stage.stage
    }
  }
  
  return "Mature"
}

export function getPestRiskLevel(cropType: string, daysFromPlanting: number, region: string): 'low' | 'medium' | 'high' {
  const knowledge = getCropKnowledge(cropType)
  if (!knowledge) return 'low'
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  
  let highestRisk: 'low' | 'medium' | 'high' = 'low'
  
  for (const pest of knowledge.pestCalendar) {
    if (pest.region.some(r => region.toLowerCase().includes(r.toLowerCase()))) {
      // Simple risk period parsing - in production, make this more sophisticated
      if (pest.riskPeriod.includes(`${daysFromPlanting}`)) {
        if (pest.severity === 'high') highestRisk = 'high'
        else if (pest.severity === 'medium' && highestRisk !== 'high') highestRisk = 'medium'
      }
    }
  }
  
  return highestRisk
}

export function getOptimalSellMonth(cropType: string): string {
  const knowledge = getCropKnowledge(cropType)
  return knowledge?.marketPatterns.storageRecommendation.optimalSellMonth || "Unknown"
}

export function shouldStoreForBetterPrice(cropType: string, currentMonth: string): boolean {
  const knowledge = getCropKnowledge(cropType)
  if (!knowledge) return false
  
  const currentPattern = knowledge.marketPatterns.pricePatterns.find(p => p.month === currentMonth)
  const optimalPattern = knowledge.marketPatterns.pricePatterns.find(
    p => p.month === knowledge.marketPatterns.storageRecommendation.optimalSellMonth
  )
  
  if (!currentPattern || !optimalPattern) return false
  
  const priceDifference = optimalPattern.relativePrice - currentPattern.relativePrice
  const storageCostAdjustment = 0.05 // 5% to account for storage costs
  
  return priceDifference > storageCostAdjustment
}