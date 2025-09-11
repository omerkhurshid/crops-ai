'use client'

import React from 'react'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { TrafficLightStatus, getHealthStatus } from '../ui/traffic-light-status'
import { 
  Sun, CloudRain, TrendingUp, TrendingDown, MapPin, 
  DollarSign, Thermometer, Droplets, Wind, AlertTriangle
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface MorningBriefingProps {
  farmName: string
  totalAcres: number
  overallHealth: number
  healthTrend: number
  stressedAreas: number
  stressTrend: number
  weather: {
    current: {
      temp: number
      condition: string
      icon: 'sun' | 'cloud' | 'rain' | 'storm'
    }
    today: {
      high: number
      low: number
      precipitation: number
      windSpeed: number
    }
    alerts: Array<{
      type: string
      severity: 'low' | 'medium' | 'high'
      message: string
    }>
  }
  financials: {
    netYTD: number
    trend: number
    lastUpdate: string
  }
  urgentTasksCount: number
  className?: string
}

const weatherIcons = {
  sun: Sun,
  cloud: CloudRain,
  rain: CloudRain,
  storm: CloudRain
}

export function MorningBriefing({
  farmName,
  totalAcres,
  overallHealth,
  healthTrend,
  stressedAreas,
  stressTrend,
  weather,
  financials,
  urgentTasksCount,
  className
}: MorningBriefingProps) {
  const WeatherIcon = weatherIcons[weather.current.icon]
  const healthStatus = getHealthStatus(overallHealth)
  
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <ModernCard variant="glow" className={cn('overflow-hidden', className)}>
      <ModernCardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-sage-700 to-earth-700 text-white p-6 pb-4">
          <h1 className="text-2xl font-bold mb-2">{greeting()}! 👋</h1>
          <div className="flex items-center gap-2 text-sage-100">
            <MapPin className="h-4 w-4" />
            <span>{farmName} • {totalAcres} acres</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Farm Status */}
            <div>
              <h3 className="text-sm font-medium text-sage-600 mb-3">Farm Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrafficLightStatus status={healthStatus} size="sm" showIcon={true} />
                    <span className="text-sm text-sage-700">Overall Health</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sage-800">{overallHealth}%</span>
                    <TrendIndicator value={healthTrend} />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-sage-700">Areas Needing Attention</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sage-800">{stressedAreas}%</span>
                    <TrendIndicator value={stressTrend} />
                  </div>
                </div>

                {urgentTasksCount > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        {urgentTasksCount} urgent task{urgentTasksCount > 1 ? 's' : ''} waiting
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Weather Summary */}
            <div>
              <h3 className="text-sm font-medium text-sage-600 mb-3">Weather Now</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <WeatherIcon className="h-8 w-8 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold text-sage-800">
                        {weather.current.temp}°F
                      </div>
                      <div className="text-xs text-sage-600">{weather.current.condition}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-sage-600">H: {weather.today.high}°</div>
                    <div className="text-sage-600">L: {weather.today.low}°</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sage-700">{weather.today.precipitation}" rain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <span className="text-sage-700">{weather.today.windSpeed} mph</span>
                  </div>
                </div>

                {weather.alerts.length > 0 && (
                  <div className={cn(
                    'mt-3 p-3 rounded-lg border',
                    weather.alerts[0].severity === 'high' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  )}>
                    <div className="text-xs font-medium text-sage-800">
                      {weather.alerts[0].type}: {weather.alerts[0].message}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Snapshot */}
            <div>
              <h3 className="text-sm font-medium text-sage-600 mb-3">Financials</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-sage-700">Net Profit YTD</span>
                    <TrendIndicator value={financials.trend} size="sm" />
                  </div>
                  <div className={cn(
                    'text-2xl font-bold',
                    financials.netYTD >= 0 ? 'text-green-700' : 'text-red-700'
                  )}>
                    {financials.netYTD >= 0 ? '+' : '-'}${Math.abs(financials.netYTD).toLocaleString()}
                  </div>
                  <div className="text-xs text-sage-500 mt-1">
                    Updated {financials.lastUpdate}
                  </div>
                </div>

                <div className="pt-3 border-t border-sage-200">
                  <div className="text-xs font-medium text-sage-600 mb-1">Quick Actions</div>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 bg-sage-100 hover:bg-sage-200 rounded-lg text-sage-700 transition-colors">
                      + Income
                    </button>
                    <button className="text-xs px-3 py-1.5 bg-sage-100 hover:bg-sage-200 rounded-lg text-sage-700 transition-colors">
                      + Expense
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Summary Bar */}
          <div className="mt-6 pt-4 border-t border-sage-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sage-600">All systems operational</span>
                </div>
                <div className="text-sage-500">
                  Last satellite update: 2 hours ago
                </div>
              </div>
              <button className="text-sm text-sage-700 hover:text-sage-800 font-medium">
                View detailed analytics →
              </button>
            </div>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}

// Helper component for trend indicators
function TrendIndicator({ 
  value, 
  size = 'md' 
}: { 
  value: number
  size?: 'sm' | 'md' 
}) {
  if (value === 0) return null
  
  const Icon = value > 0 ? TrendingUp : TrendingDown
  const color = value > 0 ? 'text-green-600' : 'text-red-600'
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  
  return (
    <div className={cn('flex items-center gap-0.5', color)}>
      <Icon className={iconSize} />
      <span className={cn('font-medium', textSize)}>
        {value > 0 ? '+' : ''}{value}%
      </span>
    </div>
  )
}