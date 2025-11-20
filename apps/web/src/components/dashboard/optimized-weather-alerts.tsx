'use client'
import React, { useMemo } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { useWeatherData, useDashboardData } from './dashboard-data-provider'
import { 
  AlertTriangle, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Snowflake, 
  Sun,
  Flame,
  Clock,
  CheckCircle
} from 'lucide-react'
interface OptimizedWeatherAlertsProps {
  className?: string
  maxAlerts?: number
}
export function OptimizedWeatherAlerts({ className, maxAlerts = 3 }: OptimizedWeatherAlertsProps) {
  const weather = useWeatherData()
  const { loading } = useDashboardData()
  const alerts = useMemo(() => {
    if (!weather?.alerts) return []
    // Sort alerts by priority and return top ones
    return weather.alerts
      .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0))
      .slice(0, maxAlerts)
  }, [weather?.alerts, maxAlerts])
  const getAlertIcon = (type: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      frost: Snowflake,
      heat: Sun,
      wind: Wind,
      flood: CloudRain,
      drought: Thermometer,
      fire_risk: Flame,
      storm: AlertTriangle
    }
    const IconComponent = iconMap[type] || AlertTriangle
    return <IconComponent className="h-4 w-4" />
  }
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-red-100 text-red-800 border-red-200'
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }
  if (loading) {
    return (
      <ModernCard className={className}>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Weather Alerts
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-[#F5F5F5] h-16 rounded-lg" />
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <ModernCard className={className}>
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Weather Alerts
          {alerts.length > 0 && (
            <Badge variant="outline">{alerts.length}</Badge>
          )}
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-[#FAFAF7] transition-colors"
              >
                <div className="flex-shrink-0 p-2 bg-[#F5F5F5] rounded-lg">
                  {getAlertIcon(alert.alertType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-[#1A1A1A] truncate">
                      {alert.title}
                    </h4>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#555555] line-clamp-2">
                    {alert.description}
                  </p>
                  {alert.startTime && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-[#555555]">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.startTime).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-[#555555]">No active weather alerts</p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}