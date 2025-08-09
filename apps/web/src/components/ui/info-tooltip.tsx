'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function InfoTooltip({ 
  title, 
  description, 
  position = 'top', 
  size = 'sm',
  className = '' 
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const tooltipPositions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowPositions = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800'
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-sage-500 hover:text-sage-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-300 rounded-full p-1"
        type="button"
        aria-label={`Information about ${title}`}
      >
        <Info className={`${sizeClasses[size]} opacity-60 hover:opacity-100 transition-opacity`} />
      </button>
      
      {isVisible && (
        <div className={`absolute z-50 ${tooltipPositions[position]} pointer-events-none`}>
          <div className="bg-slate-800/95 backdrop-blur-sm text-white text-sm rounded-lg px-3 py-2 shadow-lg border border-slate-700/50 max-w-xs">
            <div className="font-medium text-cream-100 mb-1">{title}</div>
            <div className="text-slate-200 text-xs leading-relaxed">{description}</div>
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrowPositions[position]}`}></div>
        </div>
      )}
    </div>
  )
}

// Predefined tooltip content for common agricultural terms
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
  }
}