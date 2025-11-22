'use client'
import React from 'react'
import { DashboardDataProvider, useDashboardData } from './dashboard-data-provider'
import { OptimizedWeatherAlerts } from './optimized-weather-alerts'
import { OptimizedRecommendations } from './optimized-recommendations'
import { MorningBriefing } from './morning-briefing'
import { FarmsMap } from '../farms/farms-map'
import { TodaysTasksSummary } from './todays-tasks-summary'
import { MarketTicker, MobileMarketTicker } from './market-ticker'
import { useScreenSize } from '../../hooks/useResponsive'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
interface OptimizedFarmerDashboardProps {
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
function DashboardContent({ 
  farmId, 
  farmData, 
  financialData, 
  weatherAlerts, 
  crops, 
  livestock, 
  user 
}: OptimizedFarmerDashboardProps) {
  const { loading, error, lastUpdated, refetch } = useDashboardData()
  const { isMobile } = useScreenSize()
  // Calculate quick stats from passed data
  const totalFields = farmData?.fields?.length || 0
  const totalArea = farmData?.totalArea || 0
  const activeAlerts = weatherAlerts?.filter(alert => alert.isActive)?.length || 0
  if (error) {
    return (
      <ModernCard variant="soft" className="border-red-200 bg-red-50">
        <ModernCardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Failed to load dashboard</h3>
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={refetch}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <div className="space-y-6">
      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-[#555555] bg-blue-50 p-3 rounded-lg">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading latest data...
        </div>
      )}
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4" role="region" aria-label="Total fields count">
          <div className="text-2xl font-bold text-[#555555]" aria-label={`${totalFields} fields`}>{totalFields}</div>
          <div className="text-sm text-[#555555]">Fields</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4" role="region" aria-label="Total farm area">
          <div className="text-2xl font-bold text-[#8FBF7F]" aria-label={`${totalArea.toFixed(1)} hectares`}>{totalArea.toFixed(1)}</div>
          <div className="text-sm text-[#555555]">Hectares</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4" role="region" aria-label="Total crops count">
          <div className="text-2xl font-bold text-blue-600" aria-label={`${crops?.length || 0} crops`}>{crops?.length || 0}</div>
          <div className="text-sm text-[#555555]">Crops</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-orange-600">{activeAlerts}</div>
            {activeAlerts === 0 && <CheckCircle className="h-5 w-5 text-[#8FBF7F]" />}
          </div>
          <div className="text-sm text-[#555555]">Active Alerts</div>
        </div>
      </div>
      {/* Morning Briefing - Only show core weather data initially */}
      <MorningBriefing 
        farmName={farmData?.name || "Your Farm"}
        userName={user?.name}
        totalAcres={totalArea}
        overallHealth={85} // From satellite data
        healthTrend={3}
        stressedAreas={10}
        stressTrend={-2}
        weather={{
          current: {
            temp: 75,
            condition: "Partly Cloudy",
            icon: "cloud"
          },
          today: {
            high: 82,
            low: 65,
            precipitation: 20,
            windSpeed: 12
          },
          forecast: [],
          alerts: weatherAlerts?.map(alert => ({
            type: alert.alertType,
            severity: alert.severity || 'low',
            message: alert.message
          })) || []
        }}
        financials={{
          netYTD: 0,
          trend: 0,
          lastUpdate: 'No data'
        }}
        urgentTasksCount={0}
        plantingsCount={crops?.filter((c: any) => c.status === 'PLANNED').length || 0}
        growingCount={crops?.filter((c: any) => c.status === 'GROWING').length || 0}
        readyToHarvestCount={crops?.filter((c: any) => {
          if (!c.expectedHarvestDate) return false
          const harvestDate = new Date(c.expectedHarvestDate)
          const today = new Date()
          const daysToHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          return daysToHarvest >= 0 && daysToHarvest <= 14
        }).length || 0}
        fieldsNeedingAttention={[]}
        livestockCount={livestock?.length || 0}
        livestockHealthStatus="good"
        lastSatelliteUpdate={lastUpdated || undefined}
      />
      {/* Market Ticker */}
      {isMobile ? (
        <MobileMarketTicker className="-mx-4 sm:mx-0 sm:rounded-lg" />
      ) : (
        <MarketTicker className="-mx-4 sm:mx-0 sm:rounded-lg" />
      )}
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks and Weather */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <TodaysTasksSummary farmId={farmId} />
          {/* Weather Alerts - Optimized */}
          <OptimizedWeatherAlerts maxAlerts={5} />
        </div>
        {/* Right Column - Recommendations */}
        <div className="space-y-6">
          {/* AI Recommendations - Optimized */}
          <OptimizedRecommendations limit={4} />
        </div>
      </div>
      {/* Farms Map */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">
              Farm Overview
            </h2>
            <p className="text-[#555555]">
              Interactive map showing your farm location and health status
            </p>
          </div>
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <FarmsMap 
          farms={[{
            id: String(farmId) || "farm-1",
            name: farmData?.name || "Your Farm",
            totalArea: farmData?.totalArea || 0,
            latitude: farmData?.latitude || 41.8781,
            longitude: farmData?.longitude || -87.6298,
            health: 85,
            healthTrend: 3,
            stressedAreas: 10,
            fieldsCount: farmData?.fields?.length || 0,
            isPrimary: true
          }]}
          onFarmSelect={(farmId) => {
            // Handle farm selection
          }}
          selectedFarmId={farmId}
          className="mb-6"
        />
      </div>
    </div>
  )
}
export function OptimizedFarmerDashboard(props: OptimizedFarmerDashboardProps) {
  return (
    <DashboardDataProvider
      farmId={props.farmId}
      farmData={{
        latitude: props.farmData?.latitude,
        longitude: props.farmData?.longitude,
        totalArea: props.farmData?.totalArea
      }}
      crops={props.crops}
    >
      <DashboardContent {...props} />
    </DashboardDataProvider>
  )
}