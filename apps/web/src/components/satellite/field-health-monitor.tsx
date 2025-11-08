'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import { 
  Satellite, RefreshCw, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle, Activity, MapPin, Clock,
  Droplets, Bug, Zap, Target, Calendar, BarChart3
} from 'lucide-react'
interface FieldHealthData {
  fieldId: string
  fieldName: string
  analysisDate: string
  vegetationHealth: {
    healthScore: number
    ndvi: number
    stressIndicators: {
      drought: number
      disease: number
      nutrient: number
    }
  }
  stressAlerts: Array<{
    type: 'drought' | 'disease' | 'nutrient' | 'pest' | 'general'
    severity: 'low' | 'moderate' | 'high' | 'critical'
    message: string
    affectedArea: number
    recommendation: string
  }>
  recommendations: Array<{
    type: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    title: string
    description: string
    timeframe: string
  }>
  comparisonToPrevious?: {
    change: number
    trend: 'improving' | 'declining' | 'stable'
    significance: 'high' | 'moderate' | 'low'
  }
}
interface FieldHealthMonitorProps {
  farmId?: string
  fieldIds?: string[]
  autoRefresh?: boolean
  refreshInterval?: number
}
export function FieldHealthMonitor({ 
  farmId, 
  fieldIds, 
  autoRefresh = true, 
  refreshInterval = 300000 // 5 minutes
}: FieldHealthMonitorProps) {
  const [healthData, setHealthData] = useState<FieldHealthData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Fetch field health data
  const fetchHealthData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const endpoint = '/api/satellite/field-analysis'
      const params = farmId ? { farmId } : { fieldIds }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }
      const data = await response.json()
      if (data.success && data.results) {
        setHealthData(data.results)
        setLastRefresh(new Date())
      } else {
        throw new Error(data.error || 'Failed to get analysis results')
      }
    } catch (error) {
      console.error('Error fetching field health data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  // Auto-refresh setup
  useEffect(() => {
    fetchHealthData()
    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [farmId, fieldIds, autoRefresh, refreshInterval])
  // Get health status color and icon
  const getHealthStatus = (healthScore: number) => {
    if (healthScore >= 80) {
      return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'Excellent' }
    } else if (healthScore >= 60) {
      return { color: 'text-blue-600', bg: 'bg-blue-50', icon: Activity, label: 'Good' }
    } else if (healthScore >= 40) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle, label: 'Fair' }
    } else {
      return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, label: 'Poor' }
    }
  }
  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }
  // Get stress indicator icon
  const getStressIcon = (type: string) => {
    switch (type) {
      case 'drought': return <Droplets className="h-4 w-4" />
      case 'disease': return <Bug className="h-4 w-4" />
      case 'nutrient': return <Zap className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }
  // Get alert severity badge
  const getAlertBadge = (severity: string) => {
    const variants = {
      low: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-600 text-white'
    }
    return variants[severity as keyof typeof variants] || variants.moderate
  }
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }
  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHealthData}
            className="ml-4"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Satellite className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold">Field Health Monitor</h2>
            <p className="text-sm text-gray-600">
              Real-time satellite analysis • {healthData.length} fields monitored
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {lastRefresh && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {formatTimeAgo(lastRefresh)}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealthData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      {/* Field Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthData.map((field) => {
          const healthStatus = getHealthStatus(field.vegetationHealth.healthScore)
          const criticalAlerts = field.stressAlerts.filter(alert => alert.severity === 'critical')
          const highPriorityRecommendations = field.recommendations.filter(rec => rec.priority === 'urgent' || rec.priority === 'high')
          return (
            <Card key={field.fieldId} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{field.fieldName}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {field.comparisonToPrevious && getTrendIcon(field.comparisonToPrevious.trend)}
                    <healthStatus.icon className={`h-5 w-5 ${healthStatus.color}`} />
                  </div>
                </div>
                <CardDescription className="flex items-center text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  Last analyzed: {field.analysisDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Health Score */}
                <div className={`p-3 rounded-lg ${healthStatus.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Health</span>
                    <span className={`text-sm font-semibold ${healthStatus.color}`}>
                      {healthStatus.label}
                    </span>
                  </div>
                  <Progress 
                    value={field.vegetationHealth.healthScore} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0</span>
                    <span className="font-medium">
                      {field.vegetationHealth.healthScore.toFixed(1)}%
                    </span>
                    <span>100</span>
                  </div>
                </div>
                {/* NDVI Value */}
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">NDVI Index</span>
                  <span className="font-semibold">
                    {field.vegetationHealth.ndvi.toFixed(3)}
                  </span>
                </div>
                {/* Stress Indicators */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Stress Indicators</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                      <Droplets className={`h-4 w-4 mb-1 ${
                        field.vegetationHealth.stressIndicators.drought > 0.6 ? 'text-red-500' : 
                        field.vegetationHealth.stressIndicators.drought > 0.3 ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <span className="text-gray-600">Drought</span>
                      <span className="font-semibold">
                        {(field.vegetationHealth.stressIndicators.drought * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                      <Bug className={`h-4 w-4 mb-1 ${
                        field.vegetationHealth.stressIndicators.disease > 0.6 ? 'text-red-500' : 
                        field.vegetationHealth.stressIndicators.disease > 0.3 ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <span className="text-gray-600">Disease</span>
                      <span className="font-semibold">
                        {(field.vegetationHealth.stressIndicators.disease * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded">
                      <Zap className={`h-4 w-4 mb-1 ${
                        field.vegetationHealth.stressIndicators.nutrient > 0.6 ? 'text-red-500' : 
                        field.vegetationHealth.stressIndicators.nutrient > 0.3 ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <span className="text-gray-600">Nutrient</span>
                      <span className="font-semibold">
                        {(field.vegetationHealth.stressIndicators.nutrient * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                {/* Active Alerts */}
                {field.stressAlerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Active Alerts</h4>
                    <div className="space-y-1">
                      {field.stressAlerts.slice(0, 2).map((alert, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded text-xs">
                          {getStressIcon(alert.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{alert.message}</span>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getAlertBadge(alert.severity)}`}
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mt-1 line-clamp-2">
                              {alert.recommendation}
                            </p>
                          </div>
                        </div>
                      ))}
                      {field.stressAlerts.length > 2 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{field.stressAlerts.length - 2} more alerts
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Top Recommendations */}
                {highPriorityRecommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Priority Actions</h4>
                    <div className="space-y-1">
                      {highPriorityRecommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="p-2 bg-blue-50 rounded text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{rec.title}</span>
                            <Badge 
                              variant={rec.priority === 'urgent' ? 'destructive' : 'default'}
                              className="text-xs"
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{rec.timeframe}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Trend Indicator */}
                {field.comparisonToPrevious && (
                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <span className="text-gray-600">Trend vs. Previous</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(field.comparisonToPrevious.trend)}
                      <span className={`font-semibold ${
                        field.comparisonToPrevious.trend === 'improving' ? 'text-green-600' :
                        field.comparisonToPrevious.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {(field.comparisonToPrevious.change > 0 ? '+' : '')}
                        {(field.comparisonToPrevious.change * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
              {/* Critical Alert Indicator */}
              {criticalAlerts.length > 0 && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </Card>
          )
        })}
      </div>
      {/* Loading State */}
      {isLoading && healthData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-center">
            <p className="text-lg font-medium">Analyzing Fields</p>
            <p className="text-sm text-gray-600">
              Processing satellite imagery and calculating vegetation health...
            </p>
          </div>
        </div>
      )}
      {/* Empty State */}
      {!isLoading && healthData.length === 0 && !error && (
        <div className="text-center py-12">
          <Satellite className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600">No Field Data</p>
          <p className="text-sm text-gray-500">
            Start analyzing your fields to see health monitoring data here.
          </p>
        </div>
      )}
    </div>
  )
}