'use client'
import React, { useState, useEffect, memo } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  AlertTriangle, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Snowflake, 
  Sun,
  Flame,
  Eye,
  Clock,
  ChevronRight,
  Loader2,
  MapPin
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { convertWeatherAlert } from '../../lib/farmer-language'
interface WeatherAlert {
  id: string
  alertType: 'frost' | 'storm' | 'drought' | 'heat' | 'wind' | 'hail' | 'flood' | 'fire_risk'
  severity: 'minor' | 'moderate' | 'severe' | 'extreme'
  title: string
  description: string
  startTime: string
  endTime?: string
  farmImpact: {
    cropsAtRisk: string[]
    estimatedDamage: 'low' | 'medium' | 'high' | 'severe'
    urgencyLevel: 'watch' | 'warning' | 'critical'
  }
  actionRequired: {
    immediate: string[]
    shortTerm: string[]
    monitoring: string[]
  }
  isActive: boolean
  priority: number
  confidence: number
}
interface WeatherAlertsWidgetProps {
  farmData?: {
    latitude?: number
    longitude?: number
  }
  className?: string
}
export const WeatherAlertsWidget = memo(function WeatherAlertsWidget({ farmData, className }: WeatherAlertsWidgetProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  useEffect(() => {
    fetchWeatherAlerts()
  }, [farmData])
  const fetchWeatherAlerts = async () => {
    if (!farmData?.latitude || !farmData?.longitude) {
      setLoading(false)
      return
    }
    try {
      const params = new URLSearchParams({
        latitude: farmData.latitude.toString(),
        longitude: farmData.longitude.toString(),
        type: 'advanced'
      })
      const response = await fetch(`/api/weather/alerts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      } else {
        setAlerts([])
      }
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }
  const getAlertIcon = (type: string) => {
    const iconMap = {
      frost: Snowflake,
      heat: Sun,
      wind: Wind,
      flood: CloudRain,
      drought: Thermometer,
      fire_risk: Flame,
      storm: CloudRain,
      hail: CloudRain
    }
    const IconComponent = iconMap[type as keyof typeof iconMap] || AlertTriangle
    return <IconComponent className="h-5 w-5" />
  }
  const getSeverityColor = (severity: string, urgency: string) => {
    if (urgency === 'critical' || severity === 'extreme') {
      return 'bg-red-100 border-red-200 text-red-800'
    }
    if (urgency === 'warning' || severity === 'severe') {
      return 'bg-orange-100 border-orange-200 text-orange-800'
    }
    if (severity === 'moderate') {
      return 'bg-yellow-100 border-yellow-200 text-yellow-800'
    }
    return 'bg-blue-100 border-blue-200 text-blue-800'
  }
  const getFarmerFriendlyAlert = (alert: WeatherAlert): string => {
    // Convert technical alert to farmer language
    const typeMap = {
      frost: 'Frost Risk',
      heat: 'Heat Warning',
      wind: 'High Winds',
      drought: 'Dry Conditions',
      storm: 'Storm Alert',
      flood: 'Flooding Risk',
      hail: 'Hail Warning',
      fire_risk: 'Fire Risk'
    }
    const severityMap = {
      minor: 'Light',
      moderate: 'Moderate',
      severe: 'Strong',
      extreme: 'Severe'
    }
    const alertType = typeMap[alert.alertType] || alert.alertType
    const severity = severityMap[alert.severity] || alert.severity
    return `${severity} ${alertType}`
  }
  const getActionableMessage = (alert: WeatherAlert): string => {
    if (alert.actionRequired.immediate.length > 0) {
      return alert.actionRequired.immediate[0]
    }
    if (alert.actionRequired.shortTerm.length > 0) {
      return alert.actionRequired.shortTerm[0]
    }
    return "Monitor conditions closely"
  }
  const activeAlerts = alerts.filter(alert => alert.isActive)
  const displayAlerts = showAll ? activeAlerts : activeAlerts.slice(0, 3)
  if (loading) {
    return (
      <ModernCard variant="soft" data-tour="weather-section" className={className}>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Weather Alerts
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  if (activeAlerts.length === 0) {
    return (
      <ModernCard variant="soft" data-tour="weather-section" className={className}>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-green-600" />
            Weather Outlook
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <Sun className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">All Clear</p>
              <p className="text-sm text-green-600">No weather concerns for your farm</p>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <ModernCard variant="soft" data-tour="weather-section" className={className}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Weather Alerts
            {activeAlerts.length > 0 && (
              <Badge className="bg-orange-100 text-orange-800">
                {activeAlerts.length}
              </Badge>
            )}
          </ModernCardTitle>
          {activeAlerts.length > 3 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `+${activeAlerts.length - 3} More`}
            </Button>
          )}
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {displayAlerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'p-4 rounded-lg border-2',
              getSeverityColor(alert.severity, alert.farmImpact.urgencyLevel)
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/70 rounded-lg">
                  {getAlertIcon(alert.alertType)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    {getFarmerFriendlyAlert(alert)}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        alert.farmImpact.urgencyLevel === 'critical' ? 'border-red-500 text-red-700' :
                        alert.farmImpact.urgencyLevel === 'warning' ? 'border-orange-500 text-orange-700' :
                        'border-blue-500 text-blue-700'
                      )}
                    >
                      {alert.farmImpact.urgencyLevel.toUpperCase()}
                    </Badge>
                    <span className="text-xs opacity-75">
                      {(alert.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs opacity-75">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(alert.startTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {/* Farmer-friendly description */}
            <p className="text-sm mb-3 leading-relaxed">
              {alert.description}
            </p>
            {/* What to do */}
            <div className="bg-white/50 p-3 rounded-md">
              <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                What to do:
              </h5>
              <p className="text-sm text-gray-700">
                {getActionableMessage(alert)}
              </p>
            </div>
            {/* Crops at risk */}
            {alert.farmImpact.cropsAtRisk.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-medium text-gray-600">
                  Crops that could be affected:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {alert.farmImpact.cropsAtRisk.map((crop, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {/* Location info if available */}
        {farmData?.latitude && farmData?.longitude && (
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
            <MapPin className="h-3 w-3" />
            <span>
              Alerts for {farmData.latitude.toFixed(2)}, {farmData.longitude.toFixed(2)}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchWeatherAlerts}
              className="ml-auto text-xs h-6"
            >
              Refresh
            </Button>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
})