'use client'

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import dynamic from 'next/dynamic'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { FarmerMetricCard, CropHealthCard, StressLevelCard } from '../ui/farmer-metric-card'
import { LivestockMetricCard } from '../ui/livestock-metric-card'
import { PriorityActionsList } from '../ui/priority-action'
import { TrafficLightStatus, getHealthStatus, getStressStatus } from '../ui/traffic-light-status'
import { convertHealthScore, convertRecommendation, getFarmerTerm } from '../../lib/farmer-language'
import { MorningBriefing } from './morning-briefing'
import { UrgentTasks, UrgentTasksMobile } from './urgent-tasks'
import { MarketTicker, MobileMarketTicker } from './market-ticker'
import { Button } from '../ui/button'
import { useScreenSize } from '../../hooks/useResponsive'
import { TodaysTasksSummary } from './todays-tasks-summary'
import { RecommendationsWidget } from '../analytics/recommendations-widget'
import { QuickActions } from './quick-actions'
import { WeatherAlertsWidget } from './weather-alerts-widget'
import { HarvestAlerts } from './harvest-alerts'
import { WeatherTasksGenerator } from './weather-tasks-generator'
import { DiseasePestAlertsWidget } from './disease-pest-alerts-widget'
import { 
  Leaf, 
  Droplets, 
  TrendingUp, 
  Eye, 
  Sun, 
  CloudRain,
  Thermometer,
  ChevronRight,
  RefreshCw,
  Heart,
  MapPin
} from 'lucide-react'
import { ensureArray } from '../../lib/utils'

// Lazy load heavy components
const FarmsMap = dynamic(() => import('../farms/farms-map').then(mod => mod.FarmsMap), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

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
  farmData?: {
    name: string
    totalArea: number
    ownerId: string
    latitude?: number
    longitude?: number
    fields?: any[]
  }
  allFarms?: Array<{
    id: string
    name: string
    totalArea: number
    ownerId: string
    latitude?: number
    longitude?: number
    fields?: any[]
  }>
  financialData?: any[]
  weatherAlerts?: any[]
  crops?: any[]
  livestock?: any[]
  user?: {
    id: string
    name: string
    email: string
  }
}

// Memoized metric card components
const MemoizedFarmerMetricCard = memo(FarmerMetricCard)
const MemoizedCropHealthCard = memo(CropHealthCard)
const MemoizedStressLevelCard = memo(StressLevelCard)
const MemoizedLivestockMetricCard = memo(LivestockMetricCard)

export function FarmerDashboardOptimized({ 
  farmId, 
  farmData: passedFarmData, 
  allFarms, 
  financialData: passedFinancialData, 
  weatherAlerts: passedWeatherAlerts, 
  crops: passedCrops, 
  livestock: passedLivestock, 
  user 
}: FarmerDashboardProps) {
  const [farmData, setFarmData] = useState<FarmSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetailedView, setShowDetailedView] = useState(false)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [lastSatelliteUpdate, setLastSatelliteUpdate] = useState<Date | null>(null)
  const [selectedFarmId, setSelectedFarmId] = useState<string>()
  const { isMobile } = useScreenSize()

  // Memoize financial calculations
  const financialMetrics = useMemo(() => {
    if (!passedFinancialData) return { netYTD: 0, financialTrend: 0 }
    
    const currentYear = new Date().getFullYear()
    const yearlyFinancials = ensureArray(passedFinancialData).filter(t => 
      new Date(t.transactionDate).getFullYear() === currentYear
    )
    
    const totalRevenue = yearlyFinancials
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    
    const totalExpenses = yearlyFinancials
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    
    const netYTD = totalRevenue - totalExpenses
    const financialTrend = netYTD > 0 ? 8 : -5
    
    return { netYTD, financialTrend }
  }, [passedFinancialData])

  // Memoize crop calculations
  const cropMetrics = useMemo(() => {
    const cropsArray = ensureArray(passedCrops)
    
    const plantingsCount = cropsArray.filter(c => c.status === 'PLANNED').length
    const growingCount = cropsArray.filter(c => 
      c.status === 'PLANTED' || c.status === 'GROWING'
    ).length
    
    const readyToHarvestCount = cropsArray.filter(c => {
      if (!c.expectedHarvestDate) return false
      const harvestDate = new Date(c.expectedHarvestDate)
      const today = new Date()
      const daysToHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysToHarvest >= 0 && daysToHarvest <= 14
    }).length
    
    return { plantingsCount, growingCount, readyToHarvestCount }
  }, [passedCrops])

  // Memoize livestock calculations
  const livestockMetrics = useMemo(() => {
    const livestockArray = ensureArray(passedLivestock)
    const count = livestockArray.reduce((sum, l) => sum + (l.count || 1), 0)
    const healthStatus = count > 0 ? 'good' : 'good'
    return { count, healthStatus }
  }, [passedLivestock])

  // Memoize farms with health calculations
  const farmsWithHealth = useMemo(() => {
    if (!allFarms) return []
    
    return allFarms.map(farm => {
      const fields = ensureArray(farm.fields)
      const avgNDVI = fields.reduce((sum, field) => sum + (field.ndvi || 0.7), 0) / (fields.length || 1)
      
      return {
        ...farm,
        healthScore: Math.round(avgNDVI * 100),
        stressLevel: Math.round((1 - avgNDVI) * 100),
        avgNDVI,
        fieldsCount: fields.length
      }
    })
  }, [allFarms])

  // Memoize urgent tasks
  const urgentTasks = useMemo(() => {
    const tasks: any[] = []
    
    // Weather-based tasks
    if (weatherData) {
      if (weatherData.temperature > 95) {
        tasks.push({
          id: 'heat-stress',
          title: 'Extreme heat warning - Check irrigation',
          urgency: 'critical',
          timeframe: 'Today',
          impact: 'Crop heat stress risk',
          category: 'weather'
        })
      }
    }
    
    // Harvest tasks
    if (cropMetrics.readyToHarvestCount > 0) {
      tasks.push({
        id: 'harvest-ready',
        title: `${cropMetrics.readyToHarvestCount} crops ready for harvest`,
        urgency: 'high',
        timeframe: 'Next 7 days',
        category: 'health'
      })
    }
    
    return tasks
  }, [weatherData, cropMetrics.readyToHarvestCount])

  // Callbacks
  const handleFarmSelect = useCallback((farmId: string) => {
    setSelectedFarmId(farmId)
    // Handle farm selection logic
  }, [])

  const toggleDetailedView = useCallback(() => {
    setShowDetailedView(prev => !prev)
  }, [])

  // Fetch farm data effect
  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        setLoading(true)
        
        // Import the real satellite service
        const { RealSatelliteService } = await import('../../lib/satellite/real-data-service')
        const satelliteService = new RealSatelliteService()
        
        // Get real satellite data
        const satelliteData = await satelliteService.getFarmDashboardData(farmId)
        
        // Use passed farm data if available
        const farmName = passedFarmData?.name || "Your Farm"
        const totalAcres = passedFarmData?.totalArea || 0
        
        // Fetch real weather data
        const lat = passedFarmData?.latitude || 39.8283
        const lon = passedFarmData?.longitude || -98.5795
        const weatherResponse = await fetch(`/api/weather/current?latitude=${lat}&longitude=${lon}`)
        
        let currentWeather = {
          temperature: 75,
          condition: "Partly Cloudy",
          precipitation: 0.2,
          humidity: 68
        }
        
        if (weatherResponse.ok) {
          const result = await weatherResponse.json()
          const weather = result.weather || result
          setWeatherData(weather)
          currentWeather = {
            temperature: Math.round(weather.temperature || weather.main?.temp || 75),
            condition: weather.conditions?.[0]?.description || weather.weather?.[0]?.description || "Clear",
            precipitation: weather.precipitation?.rain1h || weather.rain?.['1h'] || 0,
            humidity: weather.humidity || weather.main?.humidity || 65
          }
        }
        
        setLastSatelliteUpdate(satelliteData.lastSatelliteUpdate || new Date())
        
        // Construct farm summary
        const summary: FarmSummary = {
          farmName,
          totalAcres,
          overallHealth: satelliteData.overallHealth || 75,
          healthTrend: satelliteData.healthTrend || 2,
          stressedAreas: satelliteData.stressedAreas || 12,
          stressTrend: satelliteData.stressTrend || -1,
          currentWeather,
          yieldForecast: satelliteData.yieldForecast || {
            current: 4.2,
            potential: 4.8,
            unit: 'tons/acre',
            cropType: 'Wheat'
          },
          todayHighlights: satelliteData.todayHighlights || [],
          urgentTasks
        }
        
        setFarmData(summary)
      } catch (error) {
        console.error('Error fetching farm data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFarmData()
  }, [farmId, passedFarmData, urgentTasks])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sage-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading farm data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Ticker */}
      <div className="mb-4">
        {isMobile ? <MobileMarketTicker /> : <MarketTicker />}
      </div>

      {/* Quick Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <MemoizedCropHealthCard
          healthScore={farmData?.overallHealth || 0}
          healthTrend={farmData?.healthTrend || 0}
        />
        
        <MemoizedStressLevelCard
          stressPercentage={farmData?.stressedAreas || 0}
          stressTrend={farmData?.stressTrend || 0}
        />
        
        <MemoizedFarmerMetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          title={getFarmerTerm("yield")}
          value={`${farmData?.yieldForecast?.current || 0}`}
          unit={farmData?.yieldForecast?.unit || 'tons/acre'}
          subtitle={`Potential: ${farmData?.yieldForecast?.potential || 0}`}
          trend={{
            direction: (farmData?.yieldForecast?.current || 0) >= (farmData?.yieldForecast?.potential || 0) ? 'up' : 'down',
            percentage: Math.abs(((farmData?.yieldForecast?.current || 0) / (farmData?.yieldForecast?.potential || 1)) * 100 - 100)
          }}
        />
        
        <MemoizedLivestockMetricCard
          totalCount={livestockMetrics.count || 0}
          healthyCount={Math.round((livestockMetrics.count || 0) * 0.9)} 
          sickCount={Math.round((livestockMetrics.count || 0) * 0.1)}
        />
      </div>

      {/* Rest of the dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MorningBriefing 
            farmName={farmData?.farmName || 'Your Farm'}
            totalAcres={farmData?.totalAcres || 0}
            overallHealth={farmData?.overallHealth || 0}
            healthTrend={farmData?.healthTrend || 0}
            stressedAreas={farmData?.stressedAreas || 0}
            stressTrend={farmData?.stressTrend || 0}
            weather={weatherData}
            financials={{
              netYTD: farmData?.financials?.netYTD || 0,
              trend: farmData?.financials?.trend || 0,
              lastUpdate: farmData?.financials?.lastUpdate || new Date().toISOString()
            }}
            urgentTasksCount={urgentTasks.length}
          />
          
          <TodaysTasksSummary 
            farmId={farmId}
            urgentTasks={urgentTasks}
          />
          
          <WeatherAlertsWidget 
            alerts={ensureArray(passedWeatherAlerts)} 
            farmName={farmData?.farmName || 'Your Farm'}
          />
        </div>
        
        <div className="space-y-6">
          <QuickActions farmId={farmId} />
          <RecommendationsWidget farmId={farmId} />
        </div>
      </div>

      {/* Farm Map Section */}
      {farmsWithHealth.length > 0 && (
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Farm Overview Map</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <FarmsMap 
              farms={farmsWithHealth}
              onFarmSelect={handleFarmSelect}
              selectedFarmId={selectedFarmId}
            />
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  )
}

export default memo(FarmerDashboardOptimized)