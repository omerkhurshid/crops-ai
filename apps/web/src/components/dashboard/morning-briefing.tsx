'use client'

import React from 'react'
import { useUserPreferences } from '../../contexts/user-preferences-context'
import { formatTemperature } from '../../lib/user-preferences'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { TrafficLightStatus, getHealthStatus } from '../ui/traffic-light-status'
import { 
  Sun, CloudRain, TrendingUp, TrendingDown, MapPin, 
  DollarSign, Thermometer, Droplets, Wind, AlertTriangle,
  Sprout, Scissors, Heart, Plus
} from 'lucide-react'
import { cn } from '../../lib/utils'
import Link from 'next/link'

interface MorningBriefingProps {
  farmName: string
  userName?: string
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
    forecast?: Array<{
      date: string
      high: number
      low: number
      condition: string
      precipitation: number
    }>
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
  plantingsCount?: number
  growingCount?: number
  readyToHarvestCount?: number
  fieldsNeedingAttention?: string[]
  livestockCount?: number
  livestockHealthStatus?: 'good' | 'warning' | 'critical'
  lastSatelliteUpdate?: Date
}

const weatherIcons = {
  sun: Sun,
  cloud: CloudRain,
  rain: CloudRain,
  storm: CloudRain
}

export function MorningBriefing({
  farmName,
  userName,
  totalAcres,
  overallHealth,
  healthTrend,
  stressedAreas,
  stressTrend,
  weather,
  financials,
  urgentTasksCount,
  className,
  plantingsCount = 0,
  growingCount = 0,
  readyToHarvestCount = 0,
  fieldsNeedingAttention = [],
  livestockCount = 0,
  livestockHealthStatus = 'good',
  lastSatelliteUpdate
}: MorningBriefingProps) {
  const { preferences } = useUserPreferences()
  const WeatherIcon = weatherIcons[weather.current.icon]
  const healthStatus = getHealthStatus(overallHealth)
  
  const greeting = () => {
    const hour = new Date().getHours()
    const firstName = userName ? userName.split(' ')[0] : ''
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    
    // Debug logging to see what's happening
    console.log('MorningBriefing Debug:', { userName, firstName, timeGreeting })
    
    return firstName ? `${timeGreeting}, ${firstName}!` : `${timeGreeting}!`
  }

  const getHealthExplanation = (health: number) => {
    if (health >= 85) return 'Excellent (85%+ is considered excellent)'
    if (health >= 70) return 'Good (70-84% is considered good)'  
    if (health >= 55) return 'Average (55-69% is considered average)'
    return 'Needs Attention (below 55% needs immediate attention)'
  }

  const getLivestockHealthExplanation = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'Good (95%+ healthy animals)'
      case 'warning': return 'Warning (85-94% healthy animals)'
      case 'critical': return 'Critical (below 85% healthy animals)'
      default: return 'Good'
    }
  }

  return (
    <ModernCard variant="glow" className={cn('overflow-hidden', className)}>
      <ModernCardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-sage-700 to-earth-700 text-white p-6 pb-4">
          <h1 className="text-2xl font-bold mb-2">{greeting()}!</h1>
          <div className="text-sage-100">
            <span>{totalAcres} acres under management</span>
            {farmName && <span className="opacity-75 ml-2">• {farmName}</span>}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-sage-200">
            
            {/* Farm Status */}
            <div className="pb-6 md:pb-0 md:pr-6">
              <h3 className="text-sm font-semibold text-sage-700 mb-4">
                Farm Status
              </h3>
              <div className="space-y-3">
                {/* Health Summary */}
                <div className="p-3 bg-sage-50 rounded-lg border border-sage-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-sage-700">Overall Health</span>
                    <TrendIndicator value={healthTrend} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      'text-2xl font-bold',
                      overallHealth >= 80 ? 'text-green-700' : 
                      overallHealth >= 60 ? 'text-yellow-700' : 
                      overallHealth >= 40 ? 'text-orange-700' : 'text-red-700'
                    )}>
                      {overallHealth}%
                    </div>
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full',
                      overallHealth >= 80 ? 'bg-green-100 text-green-700' : 
                      overallHealth >= 60 ? 'bg-yellow-100 text-yellow-700' : 
                      overallHealth >= 40 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    )}>
                      {overallHealth >= 80 ? 'Excellent' : 
                       overallHealth >= 60 ? 'Good' : 
                       overallHealth >= 40 ? 'Average' : 'Critical'}
                    </span>
                  </div>
                  <div className="text-xs text-sage-600">
                    {getHealthExplanation(overallHealth)}
                  </div>
                </div>

                {/* Livestock Health */}
                {livestockCount > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-blue-700 flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        Livestock Health
                      </span>
                      <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        livestockHealthStatus === 'good' ? 'bg-green-100 text-green-700' :
                        livestockHealthStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {livestockCount} animals
                      </span>
                    </div>
                    <div className="text-xs text-blue-600">
                      {getLivestockHealthExplanation(livestockHealthStatus)}
                    </div>
                  </div>
                )}

                {/* Crop Stats - Updated */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sage-700">{plantingsCount} crops planned</span>
                    <span className="text-sage-700">{growingCount} growing</span>
                    <span className="text-sage-700">{readyToHarvestCount} ready to harvest</span>
                  </div>
                </div>

                {/* Fields Needing Attention */}
                {fieldsNeedingAttention.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-sage-600 mb-1">Fields needing attention:</div>
                    <div className="flex flex-wrap gap-1">
                      {fieldsNeedingAttention.slice(0, 3).map((field, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                          {field}
                        </span>
                      ))}
                      {fieldsNeedingAttention.length > 3 && (
                        <Link href="/ai-insights" className="text-xs px-2 py-1 bg-sage-100 text-sage-700 rounded-full hover:bg-sage-200">
                          +{fieldsNeedingAttention.length - 3} more →
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Livestock Status */}
                {livestockCount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-sage-200">
                    <span className="text-sm text-sage-700">Livestock</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sage-800">{livestockCount} head</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        livestockHealthStatus === 'good' ? 'bg-green-100 text-green-700' :
                        livestockHealthStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      )}>
                        {livestockHealthStatus}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Weather Summary - Improved */}
            <div className="py-6 md:py-0 md:px-6">
              <h3 className="text-sm font-semibold text-sage-700 mb-4">
                Weather Conditions
              </h3>
              <div className="space-y-4">
                {/* Current Weather */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <WeatherIcon className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-800">
                          {formatTemperature(weather.current.temp, preferences)}
                        </div>
                        <div className="text-xs text-blue-600 capitalize">{weather.current.condition}</div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-blue-700 font-medium">H: {weather.today.high}°</div>
                      <div className="text-blue-700 font-medium">L: {weather.today.low}°</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="text-blue-700">Precipitation: {weather.today.precipitation}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="h-3 w-3 text-blue-500" />
                      <span className="text-blue-700">Wind: {weather.today.windSpeed} mph</span>
                    </div>
                  </div>
                </div>

                {/* 3-Day Forecast */}
                {weather.forecast && weather.forecast.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-sage-600 mb-2">3-Day Forecast:</div>
                    <div className="grid grid-cols-3 gap-2">
                      {weather.forecast.slice(0, 3).map((day, i) => (
                        <div key={i} className="text-center p-2 bg-sage-50 rounded border">
                          <div className="text-xs text-sage-600 mb-1">
                            {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                          </div>
                          <div className="text-sm font-medium text-sage-800">
                            {day.high}°/{day.low}°
                          </div>
                          <div className="text-xs text-sage-600 capitalize">{day.condition}</div>
                          <div className="text-xs text-blue-600">{day.precipitation}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {weather.alerts.length > 0 && (
                  <div className={cn(
                    'mt-3 p-3 rounded-lg border',
                    weather.alerts[0].severity === 'high' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">Weather Alert</span>
                    </div>
                    <div className="text-xs text-sage-800">
                      {weather.alerts[0].type}: {weather.alerts[0].message}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Snapshot */}
            <div className="pt-6 md:pt-0 md:pl-6">
              <h3 className="text-sm font-semibold text-sage-700 mb-4">
                Financials This Year
              </h3>
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
                  <Link href="/financial">
                    <button className="w-full text-sm px-3 py-2 bg-sage-100 hover:bg-sage-200 rounded-lg text-sage-700 transition-colors">
                      Add Transaction
                    </button>
                  </Link>
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
                  Last satellite update: {lastSatelliteUpdate ? 
                    getTimeAgo(lastSatelliteUpdate) : 
                    'No recent updates'
                  }
                </div>
              </div>
              <Link href="/crop-health">
                <button className="text-sm text-sage-700 hover:text-sage-800 font-medium">
                  View detailed analytics →
                </button>
              </Link>
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

// Helper function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
}