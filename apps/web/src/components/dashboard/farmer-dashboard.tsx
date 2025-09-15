'use client'

import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { FarmerMetricCard, CropHealthCard, StressLevelCard } from '../ui/farmer-metric-card'
import { LivestockMetricCard } from '../ui/livestock-metric-card'
import { PriorityActionsList, createSampleActions } from '../ui/priority-action'
import { TrafficLightStatus, getHealthStatus, getStressStatus } from '../ui/traffic-light-status'
import { convertHealthScore, convertRecommendation, getFarmerTerm } from '../../lib/farmer-language'
import { MorningBriefing } from './morning-briefing'
import { UrgentTasks, UrgentTasksMobile } from './urgent-tasks'
import { MarketTicker, MobileMarketTicker } from './market-ticker'
import { Button } from '../ui/button'
import { useScreenSize } from '../../hooks/useResponsive'
import { TodaysTasksSummary } from './todays-tasks-summary'
import { RecommendationsWidget } from '../analytics/recommendations-widget'
import { FarmsMap } from '../farms/farms-map'
import { QuickActions } from './quick-actions'
import { WeatherAlertsWidget } from './weather-alerts-widget'
import { HarvestAlerts } from './harvest-alerts'
import { WeatherTasksGenerator } from './weather-tasks-generator'
import { RegionalComparison } from './regional-comparison'
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

export function FarmerDashboard({ farmId, farmData: passedFarmData, financialData: passedFinancialData, weatherAlerts: passedWeatherAlerts, crops: passedCrops, livestock: passedLivestock, user }: FarmerDashboardProps) {
  const [farmData, setFarmData] = useState<FarmSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetailedView, setShowDetailedView] = useState(false)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [lastSatelliteUpdate, setLastSatelliteUpdate] = useState<Date | null>(null)
  const [plantingsCount, setPlantingsCount] = useState(0)
  const [growingCount, setGrowingCount] = useState(0)
  const [readyToHarvestCount, setReadyToHarvestCount] = useState(0)
  const [fieldsNeedingAttention, setFieldsNeedingAttention] = useState<string[]>([])
  const [livestockCount, setLivestockCount] = useState(0)
  const [livestockHealthStatus, setLivestockHealthStatus] = useState<'good' | 'warning' | 'critical'>('good')
  const [netYTD, setNetYTD] = useState(0)
  const [financialTrend, setFinancialTrend] = useState(0)
  const [selectedFarmId, setSelectedFarmId] = useState<string>()
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
        
        // Use passed farm data if available
        const farmName = passedFarmData?.name || "Your Farm"
        const totalAcres = passedFarmData?.totalArea || 0
        
        // Fetch real weather data
        const weatherResponse = await fetch('/api/weather/current')
        let currentWeather = {
          temperature: 75,
          condition: "Partly Cloudy",
          precipitation: 0.2,
          humidity: 68
        }
        
        if (weatherResponse.ok) {
          const weather = await weatherResponse.json()
          setWeatherData(weather)
          currentWeather = {
            temperature: Math.round(weather.main?.temp || 75),
            condition: weather.weather?.[0]?.description || "Clear",
            precipitation: weather.rain?.['1h'] || 0,
            humidity: weather.main?.humidity || 65
          }
        }
        
        // Calculate financial data
        const currentYear = new Date().getFullYear()
        let netYTD = 0
        let financialTrend = 0
        
        if (passedFinancialData) {
          const yearlyFinancials = ensureArray(passedFinancialData).filter(t => 
            new Date(t.transactionDate).getFullYear() === currentYear
          )
          const totalRevenue = yearlyFinancials
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
          const totalExpenses = yearlyFinancials
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
          netYTD = totalRevenue - totalExpenses
          
          // Calculate trend (mock for now)
          financialTrend = netYTD > 0 ? 8 : -5
        }
        
        // Calculate crop counts from crops data
        const plantingsCount = ensureArray(passedCrops).filter(c => c.status === 'PLANNED').length
        const growingCount = ensureArray(passedCrops).filter(c => c.status === 'PLANTED' || c.status === 'GROWING').length  
        const readyToHarvestCount = ensureArray(passedCrops).filter(c => {
          if (!c.expectedHarvestDate) return false
          const harvestDate = new Date(c.expectedHarvestDate)
          const today = new Date()
          const daysToHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          return daysToHarvest >= 0 && daysToHarvest <= 14
        }).length
        
        // Identify fields needing attention based on stress level
        const fieldsNeedingAttention = ensureArray(passedFarmData?.fields).filter(field => {
          // Mock logic - in real app would check NDVI/stress data
          return Math.random() < 0.3
        }).map(f => f.name).slice(0, 5)
        
        // Calculate livestock metrics
        const livestockCount = ensureArray(passedLivestock).reduce((sum, l) => sum + (l.count || 1), 0)
        const livestockHealthStatus = livestockCount > 0 ? 'good' : 'good' // Mock for now
        
        // Set state values
        setLastSatelliteUpdate(new Date())
        setPlantingsCount(plantingsCount)
        setGrowingCount(growingCount)
        setReadyToHarvestCount(readyToHarvestCount)
        setFieldsNeedingAttention(fieldsNeedingAttention)
        setLivestockCount(livestockCount)
        setLivestockHealthStatus(livestockHealthStatus)
        setNetYTD(netYTD)
        setFinancialTrend(financialTrend)
        
        const farmData: FarmSummary = {
          farmName,
          totalAcres,
          overallHealth: satelliteData.overallHealth,
          healthTrend: satelliteData.healthTrend,
          stressedAreas: satelliteData.stressedAreas,
          stressTrend: satelliteData.stressTrend,
          currentWeather,
          yieldForecast: satelliteData.yieldForecast,
          todayHighlights: satelliteData.todayHighlights,
          urgentTasks: []
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
  }, [farmId, passedFarmData, passedFinancialData, passedWeatherAlerts, passedCrops, passedLivestock])

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
      {/* Morning Briefing - Unified Dashboard */}
      <MorningBriefing 
        farmName={farmData.farmName}
        userName={user?.name}
        totalAcres={farmData.totalAcres}
        overallHealth={farmData.overallHealth}
        healthTrend={farmData.healthTrend}
        stressedAreas={farmData.stressedAreas}
        stressTrend={farmData.stressTrend}
        weather={{
          current: {
            temp: farmData.currentWeather.temperature,
            condition: farmData.currentWeather.condition,
            icon: weatherData?.weather?.[0]?.main === 'Rain' ? 'rain' : 
                weatherData?.weather?.[0]?.main === 'Clouds' ? 'cloud' : 'sun'
          },
          today: {
            high: Math.round(weatherData?.main?.temp_max || 82),
            low: Math.round(weatherData?.main?.temp_min || 65),
            precipitation: farmData.currentWeather.precipitation,
            windSpeed: Math.round(weatherData?.wind?.speed * 2.237 || 12) // Convert m/s to mph
          },
          forecast: [
            { 
              date: new Date(Date.now() + 86400000).toISOString(), 
              high: Math.round(weatherData?.main?.temp_max || 82) + Math.round(Math.random() * 6 - 3),
              low: Math.round(weatherData?.main?.temp_min || 65) + Math.round(Math.random() * 6 - 3),
              condition: 'partly cloudy', 
              precipitation: Math.round(Math.random() * 30)
            },
            { 
              date: new Date(Date.now() + 172800000).toISOString(), 
              high: Math.round(weatherData?.main?.temp_max || 82) + Math.round(Math.random() * 6 - 3),
              low: Math.round(weatherData?.main?.temp_min || 65) + Math.round(Math.random() * 6 - 3),
              condition: 'sunny', 
              precipitation: Math.round(Math.random() * 20)
            },
            { 
              date: new Date(Date.now() + 259200000).toISOString(), 
              high: Math.round(weatherData?.main?.temp_max || 82) + Math.round(Math.random() * 6 - 3),
              low: Math.round(weatherData?.main?.temp_min || 65) + Math.round(Math.random() * 6 - 3),
              condition: 'rainy', 
              precipitation: Math.round(Math.random() * 60 + 20)
            }
          ],
          alerts: ensureArray(passedWeatherAlerts).map(alert => ({
            type: alert.alertType,
            severity: alert.severity || 'low',
            message: alert.message
          }))
        }}
        financials={{
          netYTD: netYTD,
          trend: financialTrend,
          lastUpdate: passedFinancialData && passedFinancialData.length > 0 ? 
            new Date(passedFinancialData[0].transactionDate).toLocaleDateString() : 
            'No data'
        }}
        urgentTasksCount={farmData.urgentTasks.length}
        plantingsCount={plantingsCount}
        growingCount={growingCount}
        readyToHarvestCount={readyToHarvestCount}
        fieldsNeedingAttention={fieldsNeedingAttention}
        livestockCount={livestockCount}
        livestockHealthStatus={livestockHealthStatus}
        lastSatelliteUpdate={lastSatelliteUpdate || undefined}
      />


      {/* Farms Overview Map */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-sage-800 mb-2">
              <MapPin className="inline h-6 w-6 mr-2" />
              Your Farms
            </h2>
            <p className="text-sage-600">
              Interactive map showing all your farm locations and their health status
            </p>
          </div>
        </div>
        
        <FarmsMap 
          farms={[{
            id: String(farmId) || "farm-1",
            name: passedFarmData?.name || farmData?.farmName || "Your Farm",
            totalArea: passedFarmData?.totalArea || farmData?.totalAcres || 0,
            latitude: passedFarmData?.latitude || 41.8781, // Use real farm coordinates if available
            longitude: passedFarmData?.longitude || -87.6298, // Default to US Midwest as fallback
            health: farmData?.overallHealth || 85,
            healthTrend: farmData?.healthTrend || 3,
            stressedAreas: farmData?.stressedAreas || 15,
            fieldsCount: passedFarmData?.fields?.length || 0,
            isPrimary: true
          }]}
          onFarmSelect={(farmId) => {
            setSelectedFarmId(farmId)
            // In a real app, you might navigate to the farm detail page
          }}
          selectedFarmId={selectedFarmId}
          className="mb-6"
        />
      </div>

      {/* Market Ticker - Moved below metrics */}
      {isMobile ? (
        <MobileMarketTicker className="-mx-4 sm:mx-0 sm:rounded-lg" />
      ) : (
        <MarketTicker className="-mx-4 sm:mx-0 sm:rounded-lg" />
      )}

      {/* Removed urgent tasks section per requirements */}

      {/* Today's Tasks from Task Board */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-sage-800 mb-2">
              What to do today
            </h2>
            <p className="text-sage-600">
              Your prioritized task list for today and tomorrow
            </p>
          </div>
        </div>
        
        <TodaysTasksSummary farmId={farmId} />
      </div>

      {/* Weather-Based Tasks */}
      <WeatherTasksGenerator 
        farmData={{
          latitude: passedFarmData?.latitude,
          longitude: passedFarmData?.longitude
        }}
        crops={passedCrops}
        className="mb-8"
      />

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weather Alerts */}
        <WeatherAlertsWidget 
          farmData={{
            latitude: passedFarmData?.latitude,
            longitude: passedFarmData?.longitude
          }}
        />

        {/* Harvest Alerts */}
        <HarvestAlerts farmId={farmId} />
      </div>

      {/* Regional Comparison */}
      <RegionalComparison 
        farmData={{
          latitude: passedFarmData?.latitude,
          longitude: passedFarmData?.longitude,
          totalArea: passedFarmData?.totalArea
        }}
        crops={passedCrops}
        className="mb-8"
      />


      {/* Smart Recommendations */}
      <RecommendationsWidget 
        farmId={farmId} 
        limit={4}
        className="hover:shadow-soft transition-all duration-300"
      />


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

          {/* Additional technical metrics can be shown here in detailed view */}
          <div className="text-center py-8 text-sage-600">
            <p>Additional detailed metrics and analysis will be displayed here</p>
          </div>
        </div>
      )}
    </div>
  )
}