'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Navbar } from '../../../components/navigation/navbar'
import { 
  AlertTriangle, 
  Thermometer, 
  Wind, 
  CloudRain, 
  Snowflake, 
  Flame, 
  Sun,
  MapPin,
  Clock,
  TrendingUp,
  Settings
} from 'lucide-react'

interface WeatherAlert {
  id: string
  alertType: 'frost' | 'storm' | 'drought' | 'heat' | 'wind' | 'hail' | 'flood' | 'fire_risk'
  severity: 'minor' | 'moderate' | 'severe' | 'extreme'
  title: string
  description: string
  startTime: string
  endTime?: string
  location: {
    latitude: number
    longitude: number
    name?: string
  }
  recommendations: string[]
  affectedAreas: string[]
  confidence: number
  isActive: boolean
  priority: number
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
}

interface AlertSummary {
  totalAlerts: number
  activeAlertsCount: number
  severityBreakdown: {
    minor: number
    moderate: number
    severe: number
    extreme: number
  }
  alertTypeBreakdown: Record<string, number>
  highestPriority: number
}

export default function WeatherAlertsPage() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [summary, setSummary] = useState<AlertSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertType, setAlertType] = useState<'basic' | 'advanced' | 'field'>('advanced')
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    name: 'Demo Location'
  })

  useEffect(() => {
    fetchWeatherAlerts()
  }, [alertType, selectedLocation])

  const fetchWeatherAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
        type: alertType
      })

      const response = await fetch(`/api/weather/alerts?${params}`)
      
      if (!response.ok) throw new Error('Failed to fetch weather alerts')
      
      const data = await response.json()
      
      setAlerts(data.alerts || [])
      setSummary(data.summary || null)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'frost': return <Snowflake className="h-5 w-5" />
      case 'heat': return <Sun className="h-5 w-5" />
      case 'wind': return <Wind className="h-5 w-5" />
      case 'flood': return <CloudRain className="h-5 w-5" />
      case 'drought': return <Thermometer className="h-5 w-5" />
      case 'fire_risk': return <Flame className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'extreme': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'watch': return 'text-blue-600'
      case 'warning': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500">Loading weather alerts...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-agricultural">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Weather Alerts</h1>
            <p className="text-gray-600">Advanced weather monitoring and extreme event alerts</p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <select
                value={`${selectedLocation.latitude},${selectedLocation.longitude}`}
                onChange={(e) => {
                  const [lat, lng] = e.target.value.split(',').map(Number)
                  setSelectedLocation({
                    latitude: lat,
                    longitude: lng,
                    name: e.target.options[e.target.selectedIndex].text
                  })
                }}
                className="rounded-md border-gray-300 shadow-sm focus:border-crops-green-500 focus:ring-crops-green-500"
              >
                <option value="40.7128,-74.0060">New York, NY</option>
                <option value="39.7391,-104.9847">Denver, CO</option>
                <option value="32.7767,-96.7970">Dallas, TX</option>
                <option value="37.7749,-122.4194">San Francisco, CA</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as 'basic' | 'advanced' | 'field')}
                className="rounded-md border-gray-300 shadow-sm focus:border-crops-green-500 focus:ring-crops-green-500"
              >
                <option value="basic">Basic Alerts</option>
                <option value="advanced">Advanced Monitoring</option>
                <option value="field">Field-Specific</option>
              </select>
            </div>

            <Button onClick={fetchWeatherAlerts} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Alerts'}
            </Button>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Error: {error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Statistics */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                      <div className="text-2xl font-bold text-gray-900">{summary.totalAlerts}</div>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                      <div className="text-2xl font-bold text-orange-600">{summary.activeAlertsCount}</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Highest Priority</p>
                      <div className="text-2xl font-bold text-red-600">{summary.highestPriority}</div>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Severe/Extreme</p>
                      <div className="text-2xl font-bold text-red-600">
                        {summary.severityBreakdown.severe + summary.severityBreakdown.extreme}
                      </div>
                    </div>
                    <Flame className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Alert Cards */}
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500 py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No weather alerts</p>
                  <p className="text-sm">Current conditions are normal for your area</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${
                  alert.severity === 'extreme' ? 'border-l-red-500' :
                  alert.severity === 'severe' ? 'border-l-orange-500' :
                  alert.severity === 'moderate' ? 'border-l-yellow-500' : 'border-l-blue-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          alert.severity === 'extreme' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'severe' ? 'bg-orange-100 text-orange-600' :
                          alert.severity === 'moderate' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {getAlertIcon(alert.alertType)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getAlertColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className={getUrgencyColor(alert.farmImpact.urgencyLevel)}>
                              {alert.farmImpact.urgencyLevel.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Priority: {alert.priority}/10
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(alert.startTime)}</span>
                        </div>
                        {alert.endTime && (
                          <div>Until: {formatTime(alert.endTime)}</div>
                        )}
                        <div className="mt-1">
                          Confidence: {(alert.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {alert.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Farm Impact */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Farm Impact Assessment</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Estimated Damage:</span>
                            <Badge className={`ml-2 ${
                              alert.farmImpact.estimatedDamage === 'severe' ? 'bg-red-100 text-red-800' :
                              alert.farmImpact.estimatedDamage === 'high' ? 'bg-orange-100 text-orange-800' :
                              alert.farmImpact.estimatedDamage === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {alert.farmImpact.estimatedDamage.toUpperCase()}
                            </Badge>
                          </div>
                          {alert.farmImpact.cropsAtRisk.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Crops at Risk:</span>
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
                      </div>

                      {/* Action Required */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Required Actions</h4>
                        
                        {alert.actionRequired.immediate.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-red-600 mb-1">🚨 Immediate</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {alert.actionRequired.immediate.map((action, idx) => (
                                <li key={idx} className="flex items-start space-x-1">
                                  <span>•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {alert.actionRequired.shortTerm.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-orange-600 mb-1">⏰ Short-term</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {alert.actionRequired.shortTerm.map((action, idx) => (
                                <li key={idx} className="flex items-start space-x-1">
                                  <span>•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {alert.actionRequired.monitoring.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-blue-600 mb-1">👁️ Monitor</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {alert.actionRequired.monitoring.map((action, idx) => (
                                <li key={idx} className="flex items-start space-x-1">
                                  <span>•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recommendations */}
                    {alert.recommendations.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">General Recommendations</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {alert.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start space-x-1">
                              <span>•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}