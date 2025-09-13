'use client'

import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { FarmerMetricCard, CropHealthCard, StressLevelCard, YieldPotentialCard } from '../ui/farmer-metric-card'
import { PriorityActionsList, createSampleActions } from '../ui/priority-action'
import { TrafficLightStatus, getHealthStatus, getStressStatus } from '../ui/traffic-light-status'
import { convertHealthScore, convertRecommendation, getFarmerTerm } from '../../lib/farmer-language'
import { MorningBriefing } from './morning-briefing'
import { UrgentTasks, UrgentTasksMobile } from './urgent-tasks'
import { MarketTicker, MobileMarketTicker } from './market-ticker'
import { Button } from '../ui/button'
import { useScreenSize } from '../../hooks/useResponsive'
import { TodaysTasksSummary } from './todays-tasks-summary'
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
  healthTrend: number
  stressedAreas: number
  stressTrend: number
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
  urgentTasks: Array<{
    id: string
    title: string
    field?: string
    urgency: 'critical' | 'high'
    timeframe: string
    impact?: string
    category: 'water' | 'pest' | 'weather' | 'financial' | 'health'
  }>
}

interface FarmerDashboardProps {
  farmId: string
}

export function FarmerDashboard({ farmId }: FarmerDashboardProps) {
  const [farmData, setFarmData] = useState<FarmSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetailedView, setShowDetailedView] = useState(false)
  const { isMobile } = useScreenSize()

  // Fetch real satellite data
  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        // Import the real satellite service
        const { RealSatelliteService } = await import('../../lib/satellite/real-data-service')
        const satelliteService = new RealSatelliteService()
        
        // Get real satellite data
        const satelliteData = await satelliteService.getFarmDashboardData(farmId)
        
        const farmData: FarmSummary = {
          farmName: "Johnson Family Farm",
          totalAcres: 78,
          overallHealth: satelliteData.overallHealth,
          healthTrend: satelliteData.healthTrend,
          stressedAreas: satelliteData.stressedAreas,
          stressTrend: satelliteData.stressTrend,
          currentWeather: {
            temperature: 75,
            condition: "Partly Cloudy",
            precipitation: 0.2,
            humidity: 68
          },
          yieldForecast: satelliteData.yieldForecast,
          todayHighlights: satelliteData.todayHighlights,
          urgentTasks: [
            {
              id: 'urgent-1',
              title: 'Check irrigation in North Field',
              field: 'North Field (Section A)',
              urgency: 'critical',
              timeframe: '4 hours',
              impact: '$1,200 potential crop loss',
              category: 'water'
            },
            {
              id: 'urgent-2',
              title: 'Apply fungicide to wheat',
              field: 'South Field',
              urgency: 'high',
              timeframe: '24 hours',
              impact: '$800 prevention cost',
              category: 'pest'
            }
          ]
        }

        setFarmData(farmData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching farm data:', error)
        
        // No data available - set to empty/null state
        setFarmData(null)
        setLoading(false)
      }
    }

    fetchFarmData()
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

  if (!farmData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50 text-fk-text-muted" />
          <h3 className="text-lg font-semibold mb-2 text-fk-text-muted">No farm data available yet</h3>
          <p className="text-fk-text-muted">Connect your farm data sources to see your dashboard.</p>
        </div>
      </div>
    )
  }

  const healthStatus = getHealthStatus(farmData.overallHealth)
  const stressStatus = getStressStatus(farmData.stressedAreas)

  return (
    <div className="space-y-6">
      {/* Market Ticker */}
      {isMobile ? (
        <MobileMarketTicker className="-mx-4 sm:mx-0 sm:rounded-lg" />
      ) : (
        <MarketTicker className="-mx-4 sm:mx-0 sm:rounded-lg" />
      )}

      {/* Morning Briefing - Unified Dashboard */}
      <MorningBriefing 
        farmName={farmData.farmName}
        totalAcres={farmData.totalAcres}
        overallHealth={farmData.overallHealth}
        healthTrend={farmData.healthTrend}
        stressedAreas={farmData.stressedAreas}
        stressTrend={farmData.stressTrend}
        weather={{
          current: {
            temp: farmData.currentWeather.temperature,
            condition: farmData.currentWeather.condition,
            icon: 'sun'
          },
          today: {
            high: 82,
            low: 65,
            precipitation: farmData.currentWeather.precipitation,
            windSpeed: 12
          },
          alerts: []
        }}
        financials={{
          netYTD: 45230,
          trend: 12,
          lastUpdate: 'yesterday'
        }}
        urgentTasksCount={farmData.urgentTasks.length}
      />

      {/* Key Metrics - Simplified to 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <CropHealthCard
          healthScore={farmData.overallHealth}
          healthTrend={farmData.healthTrend}
          showMore={true}
          onShowMore={() => setShowDetailedView(true)}
        />
        
        <StressLevelCard
          stressPercentage={farmData.stressedAreas}
          stressTrend={farmData.stressTrend}
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

      {/* Urgent Tasks - Moved below metrics */}
      {farmData.urgentTasks.length > 0 && (
        isMobile ? (
          <UrgentTasksMobile 
            tasks={farmData.urgentTasks}
            onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
          />
        ) : (
          <UrgentTasks 
            tasks={farmData.urgentTasks}
            onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
          />
        )
      )}

      {/* Today's Tasks from Task Board */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-sage-800 mb-2">
              What to do today
            </h2>
            <p className="text-sage-600">
              Summary of your urgent and high priority tasks
            </p>
          </div>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            View All Tasks
          </Button>
        </div>
        
        <TodaysTasksSummary farmId={farmId} />
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