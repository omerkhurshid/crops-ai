'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { InfoTooltip } from '../ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../lib/tooltip-content'
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle, 
  Droplets, Bug, CloudRain, Thermometer, 
  CheckCircle, XCircle, Loader2
} from 'lucide-react'

interface FarmHealthMetrics {
  overallHealth: number
  ndviScore: number
  soilMoisture: number
  pestRisk: 'low' | 'medium' | 'high'
  weatherRisk: 'low' | 'medium' | 'high'
  irrigationNeeded: boolean
  lastUpdated: string
  trend: 'improving' | 'stable' | 'declining'
  criticalAlerts: Array<{
    type: 'pest' | 'weather' | 'irrigation' | 'disease'
    severity: 'warning' | 'critical'
    message: string
  }>
}

interface FarmHealthCardProps {
  farmId: string
  farmName: string
  compact?: boolean
}

export function FarmHealthCard({ farmId, farmName, compact = false }: FarmHealthCardProps) {
  const [metrics, setMetrics] = useState<FarmHealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealthMetrics()
  }, [farmId])

  const fetchHealthMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch farm health data
      const response = await fetch(`/api/satellite/farm-health?farmId=${farmId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch health metrics')
      }

      const data = await response.json()
      
      // Process the field data into farm-level metrics
      if (!data.success || !data.fields || data.fields.length === 0) {
        throw new Error('No health data available')
      }
      
      const fields = data.fields
      
      // Calculate farm-level metrics from field data
      const totalFields = fields.length
      
      // Prevent division by zero and handle missing data
      const overallHealth = totalFields > 0 ? Math.round(
        fields.reduce((sum: number, field: any) => sum + (field.healthScore || 0), 0) / totalFields
      ) : 0
      
      const averageNDVI = totalFields > 0 ? 
        fields.reduce((sum: number, field: any) => 
          sum + (field.indices?.ndvi || 0), 0) / totalFields : 0
      
      // Calculate average soil moisture from NDWI
      const soilMoisture = totalFields > 0 ? Math.round(
        fields.reduce((sum: number, field: any) => 
          sum + ((field.indices?.ndwi || 0) * 100), 0) / totalFields
      ) : 0
      
      // Determine farm-level risks based on field conditions
      const stressLevels = fields.map((field: any) => field.stressLevel)
      const highStressFields = stressLevels.filter((level: string) => level === 'high' || level === 'severe').length
      const moderateStressFields = stressLevels.filter((level: string) => level === 'moderate').length
      
      const pestRisk = highStressFields > 0 ? 'high' : 
                      moderateStressFields > totalFields / 2 ? 'medium' : 'low'
      
      const weatherRisk = highStressFields > totalFields / 3 ? 'high' : 
                         moderateStressFields > 0 ? 'medium' : 'low'
      
      // Check if any field needs irrigation based on low NDWI
      const irrigationNeeded = fields.some((field: any) => field.indices.ndwi < 0.3)
      
      // Determine trend based on health scores
      const trend = overallHealth >= 80 ? 'improving' : 
                   overallHealth >= 60 ? 'stable' : 'declining'
      
      // Generate critical alerts
      const criticalAlerts: Array<{
        type: 'pest' | 'disease' | 'weather' | 'irrigation'
        severity: 'warning' | 'critical'
        message: string
      }> = []
      if (highStressFields > 0) {
        criticalAlerts.push({
          type: 'pest' as const,
          severity: 'critical' as const,
          message: `${highStressFields} field${highStressFields > 1 ? 's' : ''} showing high stress levels`
        })
      }
      if (irrigationNeeded) {
        criticalAlerts.push({
          type: 'irrigation' as const,
          severity: 'warning' as const,
          message: 'Some fields have low soil moisture - consider irrigation'
        })
      }
      
      const lastUpdated = fields.length > 0 ? 
        new Date(Math.max(...fields.map((f: any) => new Date(f.lastUpdate).getTime()))).toISOString() :
        new Date().toISOString()
      
      const processedMetrics: FarmHealthMetrics = {
        overallHealth,
        ndviScore: averageNDVI,
        soilMoisture,
        pestRisk: pestRisk as 'low' | 'medium' | 'high',
        weatherRisk: weatherRisk as 'low' | 'medium' | 'high',
        irrigationNeeded,
        lastUpdated,
        trend: trend as 'improving' | 'stable' | 'declining',
        criticalAlerts
      }

      setMetrics(processedMetrics)
    } catch (err) {
      console.error('Error fetching health metrics:', err)
      setError('Unable to load health metrics')
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50'
    if (score >= 60) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <ModernCard variant="soft">
        <ModernCardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-sage-600" />
        </ModernCardContent>
      </ModernCard>
    )
  }

  if (!metrics || error) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100">
          <Activity className="h-4 w-4 text-sage-500" />
          <span className="text-sm text-sage-600">Analyzing...</span>
        </div>
      )
    }
    return (
      <ModernCard variant="soft">
        <ModernCardContent className="flex flex-col items-center justify-center py-8 text-center">
          <XCircle className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-600">Health data unavailable</p>
          <p className="text-sm text-gray-500">Add fields and satellite data to monitor health</p>
        </ModernCardContent>
      </ModernCard>
    )
  }

  if (compact) {
    // Compact view for farms list
    return (
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getHealthBgColor(metrics.overallHealth)}`}>
          <Activity className={`h-4 w-4 ${getHealthColor(metrics.overallHealth)}`} />
          <span className={`font-medium ${getHealthColor(metrics.overallHealth)}`}>
            {metrics.overallHealth}%
          </span>
          {getTrendIcon(metrics.trend)}
        </div>
        
        {metrics.criticalAlerts.length > 0 && (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {metrics.criticalAlerts.length} Alert{metrics.criticalAlerts.length > 1 ? 's' : ''}
          </Badge>
        )}
        
        {metrics.irrigationNeeded && (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Droplets className="h-3 w-3 mr-1" />
            Irrigation
          </Badge>
        )}
      </div>
    )
  }

  // Full view for farm detail page
  return (
    <ModernCard variant="floating" className="overflow-hidden">
      <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ModernCardTitle className="text-sage-800">Farm Health Overview</ModernCardTitle>
            <InfoTooltip {...TOOLTIP_CONTENT.healthScore} />
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(metrics.trend)}
            <span className="text-sm text-sage-600 capitalize">{metrics.trend}</span>
          </div>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-6">
        {/* Overall Health Score */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getHealthBgColor(metrics.overallHealth)}`}>
            <div>
              <div className={`text-3xl font-bold ${getHealthColor(metrics.overallHealth)}`}>
                {metrics.overallHealth}%
              </div>
              <div className="text-sm text-sage-600">Health Score</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-sage-600" />
              <span className="text-sm text-sage-700">NDVI</span>
              <InfoTooltip {...TOOLTIP_CONTENT.ndvi} size="sm" />
            </div>
            <span className="font-semibold text-sage-800">{metrics.ndviScore.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">Moisture</span>
            </div>
            <span className="font-semibold text-blue-800">{metrics.soilMoisture}%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-sage-600" />
              <span className="text-sm text-sage-700">Pest Risk</span>
            </div>
            <Badge className={getRiskColor(metrics.pestRisk)}>
              {metrics.pestRisk}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-sage-600" />
              <span className="text-sm text-sage-700">Weather</span>
            </div>
            <Badge className={getRiskColor(metrics.weatherRisk)}>
              {metrics.weatherRisk}
            </Badge>
          </div>
        </div>

        {/* Critical Alerts */}
        {metrics.criticalAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-sage-800">Active Alerts</h4>
            {metrics.criticalAlerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg flex items-start gap-2 ${
                  alert.severity === 'critical' ? 'bg-red-50' : 'bg-yellow-50'
                }`}
              >
                <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                  alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <p className={`text-sm ${
                  alert.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Action Items */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-sage-800">Recommended Actions</h4>
          <div className="space-y-2">
            {metrics.irrigationNeeded ? (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Droplets className="h-4 w-4" />
                <span>Schedule irrigation within 24-48 hours</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>Irrigation levels optimal</span>
              </div>
            )}
            
            {metrics.pestRisk === 'high' ? (
              <div className="flex items-center gap-2 text-sm text-red-700">
                <Bug className="h-4 w-4" />
                <span>Schedule pest inspection immediately</span>
              </div>
            ) : metrics.pestRisk === 'medium' ? (
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <Bug className="h-4 w-4" />
                <span>Monitor for pest activity</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>No pest threats detected</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-sage-500 text-center">
          Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}