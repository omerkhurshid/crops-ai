'use client'
import React from 'react'
import { useUserPreferences } from '../../contexts/user-preferences-context'
import { formatTemperature, formatCurrency } from '../../lib/user-preferences'
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
    return firstName ? `${timeGreeting}, ${firstName}` : `${timeGreeting}`
  }
  const getHealthExplanation = (health: number) => {
    if (health >= 85) return 'Excellent (your crops are thriving)'
    if (health >= 70) return 'Good (crops are healthy)'  
    if (health >= 55) return 'Fair (some areas could improve)'
    return 'Needs Attention (crops need immediate care)'
  }
  const getLivestockHealthExplanation = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'Good (most animals are healthy)'
      case 'warning': return 'Warning (some animals need attention)'
      case 'critical': return 'Critical (many animals need care)'
      default: return 'Good'
    }
  }
  return (
    <ModernCard variant="glow" data-tour="dashboard-stats" className={cn('overflow-hidden', className)}>
      <ModernCardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-sage-600 to-sage-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">{greeting()}</h1>
              <div className="text-sage-100 text-sm">
                <span>{totalAcres} acres under management</span>
                {farmName && farmName !== 'Your Farm' && <span className="opacity-75 ml-2">• {farmName}</span>}
              </div>
            </div>
            <div className="text-right text-sage-100">
              <div className="text-xs uppercase tracking-wide opacity-75">Last Updated</div>
              <div className="text-sm">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Farm Status */}
            <div className="pb-6 md:pb-0 md:pr-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Farm Status
              </h3>
              <div className="space-y-4">
                {/* Health Summary - Clean Design */}
                <div className="p-4 bg-white rounded-lg border border-[#F3F4F6] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#555555]">Overall Health</span>
                    <TrendIndicator value={healthTrend} />
                  </div>
                  {/* Simplified Progress Display */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallHealth / 100)}`}
                          className={cn(
                            "transition-all duration-300 ease-out",
                            overallHealth >= 80 ? 'text-[#8FBF7F]' : 
                            overallHealth >= 60 ? 'text-amber-500' : 'text-red-500'
                          )}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn(
                          'text-sm font-bold',
                          overallHealth >= 80 ? 'text-[#7A8F78]' : 
                          overallHealth >= 60 ? 'text-amber-700' : 'text-red-700'
                        )}>
                          {overallHealth}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        'text-base font-medium mb-1',
                        overallHealth >= 80 ? 'text-[#7A8F78]' : 
                        overallHealth >= 60 ? 'text-amber-700' : 'text-red-700'
                      )}>
                        {overallHealth >= 80 ? 'Excellent' : 
                         overallHealth >= 60 ? 'Good' : 'Needs Attention'}
                      </div>
                      <div className="text-xs text-[#555555]">
                        {overallHealth >= 80 ? 'Most fields look great' :
                         overallHealth >= 60 ? 'Some areas need watching' :
                         'Several fields need attention'}
                      </div>
                    </div>
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
                        livestockHealthStatus === 'good' ? 'bg-[#F8FAF8] text-[#7A8F78]' :
                        livestockHealthStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {livestockCount} animals
                      </span>
                    </div>
                    <div className="text-xs text-[#7A8F78]">
                      {getLivestockHealthExplanation(livestockHealthStatus)}
                    </div>
                  </div>
                )}
                {/* Crop Stats - Clean Professional Layout */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-[#FAFAF7] rounded-lg border border-[#F5F5F5]">
                    <div className="text-xl font-bold text-gray-900">{plantingsCount}</div>
                    <div className="text-xs text-[#555555] font-medium">Planned</div>
                  </div>
                  <div className="text-center p-3 bg-[#FAFAF7] rounded-lg border border-[#F5F5F5]">
                    <div className="text-xl font-bold text-[#7A8F78]">{growingCount}</div>
                    <div className="text-xs text-[#555555] font-medium">Growing</div>
                  </div>
                  <div className="text-center p-3 bg-[#FAFAF7] rounded-lg border border-[#F5F5F5]">
                    <div className="text-xl font-bold text-amber-700">{readyToHarvestCount}</div>
                    <div className="text-xs text-[#555555] font-medium">Ready</div>
                  </div>
                </div>
                {/* Fields Needing Attention */}
                {fieldsNeedingAttention.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-[#555555] mb-1">Fields needing attention:</div>
                    <div className="flex flex-wrap gap-1">
                      {fieldsNeedingAttention.slice(0, 3).map((field, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                          {field}
                        </span>
                      ))}
                      {fieldsNeedingAttention.length > 3 && (
                        <Link href="/ai-insights" className="text-xs px-2 py-1 bg-[#F8FAF8] text-[#555555] rounded-full hover:bg-[#DDE4D8]">
                          +{fieldsNeedingAttention.length - 3} more →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                {/* Livestock Status */}
                {livestockCount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#DDE4D8]">
                    <span className="text-sm text-[#555555]">Livestock</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{livestockCount} head</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        livestockHealthStatus === 'good' ? 'bg-[#F8FAF8] text-[#7A8F78]' :
                        livestockHealthStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      )}>
                        {livestockHealthStatus}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Weather Conditions */}
            <div className="py-6 md:py-0 md:px-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Weather Conditions
              </h3>
              <div className="space-y-4">
                {/* Current Weather - Clean Design */}
                <div className="p-4 bg-white rounded-lg border border-[#F3F4F6] shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <WeatherIcon className="h-8 w-8 text-[#7A8F78]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatTemperature(weather.current.temp, preferences)}
                        </div>
                        <div className="text-sm text-[#555555] capitalize">{weather.current.condition}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#555555] font-medium">H: {weather.today.high}°</div>
                      <div className="text-sm text-[#555555] font-medium">L: {weather.today.low}°</div>
                    </div>
                  </div>
                  {/* Weather Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-[#555555]">Rain: {weather.today.precipitation}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-[#555555]">Wind: {weather.today.windSpeed} mph</span>
                    </div>
                  </div>
                </div>
                {/* 3-Day Forecast */}
                {weather.forecast && weather.forecast.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-[#555555] mb-2">3-Day Forecast:</div>
                    <div className="grid grid-cols-3 gap-2">
                      {weather.forecast.slice(0, 3).map((day, i) => (
                        <div key={i} className="text-center p-2 bg-[#F8FAF8] rounded border">
                          <div className="text-xs text-[#555555] mb-1">
                            {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {day.high}°/{day.low}°
                          </div>
                          <div className="text-xs text-[#555555] capitalize">{day.condition}</div>
                          <div className="text-xs text-[#7A8F78]">{day.precipitation}%</div>
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
                    <div className="text-xs text-gray-900">
                      {weather.alerts[0].type}: {weather.alerts[0].message}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Financial Performance */}
            <div className="pt-6 md:pt-0 md:pl-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Financial Performance
              </h3>
              <div className="space-y-4">
                {/* Net Profit - Clean Design */}
                <div className="p-4 bg-white rounded-lg border border-[#F3F4F6] shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#555555] font-medium">Net Profit YTD</span>
                    <TrendIndicator value={financials.trend} size="sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      financials.netYTD >= 0 ? 'bg-[#F8FAF8]' : 'bg-red-50'
                    )}>
                      <DollarSign className={cn(
                        'h-6 w-6',
                        financials.netYTD >= 0 ? 'text-[#8FBF7F]' : 'text-red-600'
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        'text-2xl font-bold',
                        financials.netYTD >= 0 ? 'text-[#7A8F78]' : 'text-red-700'
                      )}>
                        {financials.netYTD >= 0 ? '' : '-'}{formatCurrency(Math.abs(financials.netYTD), preferences)}
                      </div>
                      <div className="text-xs text-[#555555]">
                        {financials.netYTD >= 0 ? 'Profit so far this year' : 'Loss so far this year'}
                      </div>
                    </div>
                  </div>
                  {/* Yearly Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#555555]">Yearly Progress</span>
                      <span className="text-[#555555]">{Math.round((new Date().getMonth() + 1) / 12 * 100)}%</span>
                    </div>
                    <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#FAFAF7]0 rounded-full transition-all duration-300"
                        style={{ width: `${(new Date().getMonth() + 1) / 12 * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/financial">
                    <button className="w-full text-sm px-3 py-2 bg-[#F5F5F5] hover:bg-[#F5F5F5] rounded-lg text-[#555555] transition-colors flex items-center justify-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Transaction
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* Action Bar */}
          <div className="mt-6 pt-4 border-t border-[#F3F4F6]">
            <div className="flex items-center justify-end">
              <Link href="/crop-health">
                <button className="text-sm text-[#555555] hover:text-gray-900 font-medium">
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
  const color = value > 0 ? 'text-[#8FBF7F]' : 'text-red-600'
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