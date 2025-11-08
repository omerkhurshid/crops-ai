// Tooltip content definitions for agricultural terms
// This file is kept separate to avoid React Server Component bundler issues
export const TOOLTIP_CONTENT = {
  // Farm & Field Related
  farm: {
    title: "Farm",
    description: "A collection of fields managed under a single agricultural operation with shared resources and management practices."
  },
  field: {
    title: "Field", 
    description: "An individual plot of agricultural land where specific crops are grown, monitored, and managed."
  },
  area: {
    title: "Field Area",
    description: "The total cultivated area of the field measured in hectares (ha) or acres, used for yield calculations and resource planning."
  },
  soilType: {
    title: "Soil Type",
    description: "Classification of soil composition affecting water retention, nutrient availability, and suitable farming practices."
  },
  cropType: {
    title: "Crop Type",
    description: "The specific agricultural plant variety grown in this field, determining growth requirements and management practices."
  },
  // Satellite & Health Metrics
  ndvi: {
    title: "NDVI (Vegetation Index)",
    description: "Normalized Difference Vegetation Index measures crop health and density using satellite imagery. Values range from -1 to 1, with higher values indicating healthier vegetation."
  },
  evi: {
    title: "EVI (Enhanced Vegetation Index)", 
    description: "Improved vegetation index that reduces atmospheric and soil background effects, providing more accurate vegetation monitoring."
  },
  savi: {
    title: "SAVI (Soil-Adjusted Vegetation Index)",
    description: "Vegetation index that minimizes soil brightness influences, especially useful in areas with sparse vegetation coverage."
  },
  gndvi: {
    title: "GNDVI (Green NDVI)",
    description: "Green Normalized Difference Vegetation Index is more sensitive to chlorophyll content and plant stress than standard NDVI."
  },
  ndwi: {
    title: "NDWI (Water Index)",
    description: "Normalized Difference Water Index measures plant water content and stress levels, crucial for irrigation management."
  },
  lai: {
    title: "LAI (Leaf Area Index)",
    description: "Measures the total leaf area per ground area unit, indicating crop canopy development and photosynthetic capacity."
  },
  ndmi: {
    title: "NDMI (Moisture Index)",
    description: "Normalized Difference Moisture Index measures vegetation water content and drought stress levels."
  },
  fvc: {
    title: "FVC (Fractional Vegetation Cover)",
    description: "Percentage of ground area covered by green vegetation, indicating crop density and development stage."
  },
  healthScore: {
    title: "Crop Health Score",
    description: "AI-calculated overall health rating (0-100%) based on vegetation indices, weather conditions, and growth stage analysis."
  },
  // Weather Related  
  temperature: {
    title: "Temperature",
    description: "Current air temperature in Celsius, critical for crop development, pest activity, and farming operation timing."
  },
  humidity: {
    title: "Humidity",
    description: "Relative humidity percentage affecting plant disease pressure, transpiration rates, and spray application conditions."
  },
  precipitation: {
    title: "Precipitation", 
    description: "Rainfall amount in millimeters, essential for irrigation planning and crop water stress assessment."
  },
  windSpeed: {
    title: "Wind Speed",
    description: "Wind velocity in km/h affecting spray drift, pollination, crop damage risk, and evapotranspiration rates."
  },
  growingDegreeDays: {
    title: "Growing Degree Days",
    description: "Accumulated heat units above base temperature, used to predict crop development stages and optimal timing for field operations."
  },
  // Market & Financial
  commodityPrice: {
    title: "Commodity Price",
    description: "Current market price per bushel/ton for crops, used for profitability analysis and selling decisions."
  },
  priceChange: {
    title: "Price Change",
    description: "Percentage change in commodity price over the selected period, indicating market trends and volatility."
  },
  marketVolume: {
    title: "Trading Volume",
    description: "Number of contracts traded, indicating market activity and liquidity for price discovery."
  },
  // AI & Predictions
  confidence: {
    title: "Confidence Level",
    description: "AI model's certainty percentage in the prediction accuracy, based on data quality and historical performance."
  },
  yieldPrediction: {
    title: "Yield Prediction",
    description: "AI-forecasted crop yield based on current conditions, weather patterns, and historical performance data."
  },
  stressLevel: {
    title: "Stress Level",
    description: "Crop stress indicator from satellite analysis, ranging from none to severe, helping identify problem areas."
  },
  riskAssessment: {
    title: "Risk Assessment",
    description: "Probability of adverse conditions affecting crop development, including weather, disease, and pest threats."
  },
  // Health Analysis
  zones: {
    title: "Health Zones",
    description: "Field areas categorized by vegetation health: excellent (>85%), good (70-85%), moderate (50-70%), stressed (<50%)."
  },
  vegetationIndices: {
    title: "Vegetation Indices",
    description: "Collection of satellite-derived metrics measuring different aspects of crop health, water stress, and development."
  },
  stressAnalysis: {
    title: "Stress Analysis",
    description: "AI-powered assessment of crop stress factors including drought, disease, nutrient deficiency, and pest pressure."
  },
  drought: {
    title: "Drought Stress",
    description: "Water deficit stress level affecting crop growth, measured through satellite moisture indices and weather data."
  },
  disease: {
    title: "Disease Pressure",
    description: "Likelihood and severity of plant diseases based on environmental conditions and crop health indicators."
  },
  nutrient: {
    title: "Nutrient Status",
    description: "Plant nutrient availability and deficiency assessment using vegetation indices and soil data analysis."
  },
  pest: {
    title: "Pest Pressure",
    description: "Insect and pest activity levels determined by weather patterns, crop stage, and regional pest monitoring data."
  },
  // Yield Predictions
  currentYield: {
    title: "Current Projection",
    description: "Expected yield based on current field conditions, crop development stage, and remaining growing season."
  },
  potentialYield: {
    title: "Potential Yield", 
    description: "Maximum achievable yield under optimal management and favorable weather conditions for the remainder of the season."
  },
  recommendations: {
    title: "Management Recommendations",
    description: "AI-generated actionable suggestions for improving crop health, yield potential, and farm management efficiency."
  }
} as const