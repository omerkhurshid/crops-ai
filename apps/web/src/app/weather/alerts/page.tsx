'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Navbar } from '../../../components/navigation/navbar'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
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
      <div className="minimal-page">
        <Navbar />
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-50/80 to-earth-50/80 -z-10"></div>
        <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-sage-600 text-lg">Loading weather alerts...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="minimal-page">
      <Navbar />
      
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Settings className="h-5 w-5" />}
        label="Alert Settings"
        variant="primary"
      />
      
      {/* Animated Background with Floating Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-50/80 to-earth-50/80 -z-10"></div>
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <AlertTriangle className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <CloudRain className="h-8 w-8 text-sage-600" />
      </div>
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          {/* Enhanced Header */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl relative overflow-hidden">
                <AlertTriangle className="h-10 w-10 text-sage-700 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-sage-200/30 to-earth-200/30 animate-pulse-soft"></div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-light text-sage-800 mb-6 tracking-tight">
              Weather Alerts
            </h1>
            <p className="text-xl text-sage-600 font-light leading-relaxed mb-6">
              Advanced weather monitoring and extreme event alerts for agricultural protection
            </p>
            <Badge className="bg-sage-100 text-sage-700 border-sage-200">
              <CloudRain className="h-4 w-4 mr-2" />
              Real-time Monitoring
            </Badge>
          </div>
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
            <ModernCard className="mb-6 border-red-200 bg-red-50">
              <ModernCardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Error: {error}</span>
                </div>
              </ModernCardContent>
            </ModernCard>
          )}

          {/* Summary Statistics */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="polished-card card-sage rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{summary.totalAlerts}</div>
                <div className="text-xl font-medium mb-2">Total Alerts</div>
                <div className="text-sm opacity-90">Monitoring all conditions</div>
              </div>

              <div className="polished-card card-earth rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{summary.activeAlertsCount}</div>
                <div className="text-xl font-medium mb-2">Active Alerts</div>
                <div className="text-sm opacity-90">Requiring attention</div>
              </div>

              <div className="polished-card card-golden rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{summary.highestPriority}</div>
                <div className="text-xl font-medium mb-2">Highest Priority</div>
                <div className="text-sm opacity-90">Maximum alert level</div>
              </div>

              <div className="polished-card card-forest rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Flame className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {summary.severityBreakdown.severe + summary.severityBreakdown.extreme}
                </div>
                <div className="text-xl font-medium mb-2">Severe/Extreme</div>
                <div className="text-sm opacity-90">High-impact alerts</div>
              </div>
            </div>
          )}

          {/* Alert Cards */}
          {alerts.length === 0 ? (
            <ModernCard variant="soft">
              <ModernCardContent className="pt-6">
                <div className="text-center text-sage-500 py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-sage-300" />
                  <p className="text-lg font-medium text-sage-700">No weather alerts</p>
                  <p className="text-sm">Current conditions are normal for your area</p>
                </div>
              </ModernCardContent>
            </ModernCard>
          ) : (
            <div className="space-y-6">
              {alerts.map((alert) => (
                <ModernCard key={alert.id} variant="floating" className={`border-l-4 ${
                  alert.severity === 'extreme' ? 'border-l-red-500' :
                  alert.severity === 'severe' ? 'border-l-orange-500' :
                  alert.severity === 'moderate' ? 'border-l-yellow-500' : 'border-l-blue-500'
                }`}>
                  <ModernCardHeader>
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
                          <ModernCardTitle className="text-lg text-sage-800">{alert.title}</ModernCardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getAlertColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className={getUrgencyColor(alert.farmImpact.urgencyLevel)}>
                              {alert.farmImpact.urgencyLevel.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-sage-500">
                              Priority: {alert.priority}/10
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-sage-500">
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
                    <ModernCardDescription className="mt-2">
                      {alert.description}
                    </ModernCardDescription>
                  </ModernCardHeader>
                  <ModernCardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Farm Impact */}
                      <div>
                        <h4 className="font-medium text-sage-800 mb-3">Farm Impact Assessment</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-sage-600">Estimated Damage:</span>
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
                              <span className="text-sm font-medium text-sage-600">Crops at Risk:</span>
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
                        <h4 className="font-medium text-sage-800 mb-3">Required Actions</h4>
                        
                        {alert.actionRequired.immediate.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-red-600 mb-1">🚨 Immediate</h5>
                            <ul className="text-sm text-sage-600 space-y-1">
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
                            <ul className="text-sm text-sage-600 space-y-1">
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
                            <ul className="text-sm text-sage-600 space-y-1">
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
                        <h4 className="font-medium text-sage-800 mb-2">General Recommendations</h4>
                        <ul className="text-sm text-sage-600 space-y-1">
                          {alert.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start space-x-1">
                              <span>•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </ModernCardContent>
                </ModernCard>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}