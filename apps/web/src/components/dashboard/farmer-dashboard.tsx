'use client'

import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { FarmerMetricCard, CropHealthCard, StressLevelCard, YieldPotentialCard } from '../ui/farmer-metric-card'
import { PriorityActionsList, createSampleActions } from '../ui/priority-action'
import { TrafficLightStatus, getHealthStatus, getStressStatus } from '../ui/traffic-light-status'
import { convertHealthScore, convertRecommendation, getFarmerTerm } from '../../lib/farmer-language'
import { Button } from '../ui/button'
import { 
  Leaf, 
  Droplets, 
  TrendingUp, 
  Eye, 
  Sun, 
  CloudRain,
  Thermometer,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

interface FarmSummary {
  farmName: string
  totalAcres: number
  overallHealth: number
  stressedAreas: number
  currentWeather: {
    temperature: number
    condition: string
    precipitation: number
    humidity: number
  }
  yieldForecast: {
    current: number
    potential: number
    unit: string
    cropType: string
  }
  todayHighlights: string[]
}

interface FarmerDashboardProps {
  farmId: string
}

export function FarmerDashboard({ farmId }: FarmerDashboardProps) {
  const [farmData, setFarmData] = useState<FarmSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetailedView, setShowDetailedView] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockData: FarmSummary = {
      farmName: "Johnson Family Farm",
      totalAcres: 78,
      overallHealth: 82,
      stressedAreas: 8.5,
      currentWeather: {
        temperature: 75,
        condition: "Partly Cloudy",
        precipitation: 0.2,
        humidity: 68
      },
      yieldForecast: {
        current: 185,
        potential: 220,
        unit: "bu/acre",
        cropType: "Corn"
      },
      todayHighlights: [
        "North field showing excellent growth",
        "Light rain expected tomorrow afternoon",
        "Corn is 5 days ahead of schedule"
      ]
    }

    setTimeout(() => {
      setFarmData(mockData)
      setLoading(false)
    }, 1000)
  }, [farmId])

  const sampleActions = createSampleActions()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!farmData) return null

  const healthStatus = getHealthStatus(farmData.overallHealth)
  const stressStatus = getStressStatus(farmData.stressedAreas)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <ModernCard variant="glow" className="overflow-hidden">
        <ModernCardContent className="p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-sage-100 rounded-2xl">
                  <Leaf className="h-6 w-6 text-sage-700" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-sage-800">
                    Good morning! 👋
                  </h1>
                  <p className="text-sage-600">
                    {farmData.farmName} • {farmData.totalAcres} acres
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-sage-700">
                {farmData.todayHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-sage-400 rounded-full"></div>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Weather */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <Sun className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-sage-800">
                  {farmData.currentWeather.temperature}°F
                </div>
                <div className="text-xs text-sage-600">
                  {farmData.currentWeather.condition}
                </div>
              </div>
              
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                <CloudRain className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-sage-800">
                  {farmData.currentWeather.precipitation}"
                </div>
                <div className="text-xs text-sage-600">
                  Rain today
                </div>
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Key Metrics - Simplified to 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <CropHealthCard
          healthScore={farmData.overallHealth}
          showMore={true}
          onShowMore={() => setShowDetailedView(true)}
        />
        
        <StressLevelCard
          stressPercentage={farmData.stressedAreas}
          showMore={true}
          onShowMore={() => setShowDetailedView(true)}
        />
        
        <YieldPotentialCard
          currentYield={farmData.yieldForecast.current}
          potentialYield={farmData.yieldForecast.potential}
          unit={farmData.yieldForecast.unit}
          showMore={true}
          onShowMore={() => setShowDetailedView(true)}
        />
      </div>

      {/* Priority Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-sage-800 mb-2">
              What to do today
            </h2>
            <p className="text-sage-600">
              Your most important farm tasks right now
            </p>
          </div>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <PriorityActionsList
          actions={sampleActions}
          maxActions={2}
          onActionUpdate={(id, status) => {
            console.log(`Action ${id} updated to ${status}`)
          }}
        />
      </div>

      {/* Progressive Disclosure - Detailed View Button */}
      {!showDetailedView && (
        <ModernCard variant="soft" className="hover:shadow-soft transition-all duration-300 cursor-pointer touch-manipulation active:scale-[0.98]">
          <ModernCardContent 
            className="p-6 text-center min-h-[48px] flex items-center justify-center"
            onClick={() => setShowDetailedView(true)}
          >
            <div className="flex items-center justify-center gap-3">
              <Eye className="h-5 w-5 text-sage-600" />
              <span className="text-lg font-medium text-sage-800">
                View Detailed Analysis
              </span>
              <ChevronRight className="h-5 w-5 text-sage-600" />
            </div>
            <p className="text-sm text-sage-600 mt-2">
              See vegetation indices, weather details, and in-depth field analysis
            </p>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Detailed View (Progressive Disclosure) */}
      {showDetailedView && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-sage-800">
              Detailed Analysis
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setShowDetailedView(false)}
            >
              Hide Details
            </Button>
          </div>

          {/* Technical Details (now using farmer-friendly terms) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <FarmerMetricCard
              title={getFarmerTerm('ndvi', 'vegetation')}
              value="0.78"
              subtitle="Excellent plant health"
              status="excellent"
              icon={<Leaf className="h-5 w-5 text-green-600" />}
            />
            
            <FarmerMetricCard
              title={getFarmerTerm('ndwi', 'vegetation')}
              value="0.35"
              subtitle="Good moisture levels"
              status="good"
              icon={<Droplets className="h-5 w-5 text-blue-600" />}
            />
            
            <FarmerMetricCard
              title="Growth Rate"
              value="105%"
              subtitle="Ahead of normal schedule"
              status="excellent"
              trend={{
                direction: 'up',
                percentage: 5,
                label: 'vs. average'
              }}
              icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            />
            
            <FarmerMetricCard
              title="Weather Forecast"
              value="Favorable"
              subtitle="Good conditions for next 7 days"
              status="good"
              icon={<Sun className="h-5 w-5 text-orange-600" />}
            />
          </div>
        </div>
      )}
    </div>
  )
}