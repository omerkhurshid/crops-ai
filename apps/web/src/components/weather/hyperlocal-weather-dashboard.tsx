'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { HyperlocalForecast, WeatherAlert, CropWeatherAdvisory } from '../../lib/weather/hyperlocal-weather'
import { AlertTriangle, CloudRain, Sun, Thermometer, Wind, Eye, Gauge } from 'lucide-react'
interface HyperlocalWeatherDashboardProps {
  latitude: number
  longitude: number
  elevation?: number
  fieldId?: string
  cropType?: string
  growthStage?: string
  className?: string
}
export function HyperlocalWeatherDashboard({ 
  latitude, 
  longitude, 
  elevation,
  fieldId,
  cropType,
  growthStage,
  className 
}: HyperlocalWeatherDashboardProps) {
  const [forecast, setForecast] = useState<HyperlocalForecast | null>(null)
  const [cropAdvisory, setCropAdvisory] = useState<CropWeatherAdvisory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('current')
  useEffect(() => {
    if (latitude && longitude) {
      fetchHyperlocalWeather()
    }
  }, [latitude, longitude, elevation, fieldId, cropType, growthStage])
  const fetchHyperlocalWeather = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = `/api/weather/hyperlocal?latitude=${latitude}&longitude=${longitude}`
      if (elevation) url += `&elevation=${elevation}`
      if (fieldId) url += `&fieldId=${fieldId}`
      // Fetch basic hyperlocal forecast
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }
      const data = await response.json()
      setForecast(data.data)
      // If crop data is available, fetch crop-specific advisory
      if (cropType && growthStage) {
        const cropResponse = await fetch('/api/weather/hyperlocal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude,
            longitude,
            cropType,
            growthStage,
            fieldId
          })
        })
        if (cropResponse.ok) {
          const cropData = await cropResponse.json()
          setCropAdvisory(cropData.data.cropAdvisory)
        }
      }
    } catch (err) {
      setError('Failed to fetch hyperlocal weather data')
      console.error('Hyperlocal weather fetch error:', err)
    } finally {
      setLoading(false)
    }
  }
  const getWeatherIcon = (conditions: string) => {
    const iconMap: Record<string, string> = {
      'Clear': '☀️',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Light Rain': '🌦️',
      'Heavy Rain': '🌧️',
      'Thunderstorm': '⛈️',
      'Snow': '🌨️',
      'Fog': '🌫️'
    }
    return iconMap[conditions] || '🌤️'
  }
  const getAlertIcon = (alertType: WeatherAlert['type']) => {
    const iconMap: Record<string, React.ReactNode> = {
      frost: <Thermometer className="h-4 w-4" />,
      freeze: <Thermometer className="h-4 w-4" />,
      storm: <CloudRain className="h-4 w-4" />,
      drought: <Sun className="h-4 w-4" />,
      flood: <CloudRain className="h-4 w-4" />,
      wind: <Wind className="h-4 w-4" />,
      hail: <CloudRain className="h-4 w-4" />
    }
    return iconMap[alertType] || <AlertTriangle className="h-4 w-4" />
  }
  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    const colorMap: Record<string, string> = {
      low: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      moderate: 'text-orange-600 bg-orange-50 border-orange-200',
      high: 'text-red-600 bg-red-50 border-red-200',
      extreme: 'text-red-800 bg-red-100 border-red-300'
    }
    return colorMap[severity] || 'text-[#555555] bg-[#FAFAF7] border-[#F3F4F6]'
  }
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  }
  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#F5F5F5] rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-[#F5F5F5] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (error || !forecast) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Failed to load hyperlocal weather data'}
            <Button onClick={fetchHyperlocalWeather} className="mt-2" size="sm">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Hyperlocal Weather</h2>
          <p className="text-sm text-[#555555]">
            Field-specific forecast • Confidence: {formatConfidence(forecast.metadata.confidence)}
          </p>
        </div>
        <Button onClick={fetchHyperlocalWeather} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      {/* Active Weather Alerts */}
      {forecast.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">Active Weather Alerts</h3>
          {forecast.alerts.map((alert, index) => (
            <Alert key={index} className={`${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <AlertTitle className="flex items-center space-x-2">
                    <span>Weather Alert: {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</span>
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <p>{alert.description}</p>
                    {/* Farming Impact */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Affected Crops:</p>
                        <ul className="list-disc list-inside text-[#555555]">
                          {alert.farmingImpact.crops.map((crop, i) => (
                            <li key={i}>{crop}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Affected Operations:</p>
                        <ul className="list-disc list-inside text-[#555555]">
                          {alert.farmingImpact.operations.map((operation, i) => (
                            <li key={i}>{operation}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Recommendations:</p>
                        <ul className="list-disc list-inside text-[#555555]">
                          {alert.farmingImpact.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}
      {/* Crop Advisory */}
      {cropAdvisory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🌱</span>
              <span>Crop-Specific Advisory</span>
              <Badge variant="outline">
                {cropAdvisory.cropType} • {cropAdvisory.growthStage}
              </Badge>
            </CardTitle>
            <CardDescription>
              Personalized recommendations for your crop at current growth stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recommendations */}
              <div>
                <h4 className="font-semibold text-[#7A8F78] mb-2">✅ Recommendations</h4>
                <ul className="space-y-1 text-sm">
                  {cropAdvisory.recommendations.map((rec, i) => (
                    <li key={i} className="text-[#555555]">• {rec}</li>
                  ))}
                  {cropAdvisory.recommendations.length === 0 && (
                    <p className="text-[#555555] italic">No specific recommendations at this time</p>
                  )}
                </ul>
              </div>
              {/* Risks */}
              <div>
                <h4 className="font-semibold text-red-700 mb-2">⚠️ Risks</h4>
                <ul className="space-y-1 text-sm">
                  {cropAdvisory.risks.map((risk, i) => (
                    <li key={i} className="text-[#555555]">• {risk}</li>
                  ))}
                  {cropAdvisory.risks.length === 0 && (
                    <p className="text-[#555555] italic">No significant risks identified</p>
                  )}
                </ul>
              </div>
              {/* Opportunities */}
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">🌟 Opportunities</h4>
                <ul className="space-y-1 text-sm">
                  {cropAdvisory.opportunities.map((opp, i) => (
                    <li key={i} className="text-[#555555]">• {opp}</li>
                  ))}
                  {cropAdvisory.opportunities.length === 0 && (
                    <p className="text-[#555555] italic">No special opportunities identified</p>
                  )}
                </ul>
              </div>
            </div>
            <div className="mt-4 text-right">
              <Badge variant="secondary">
                Advisory Confidence: {formatConfidence(cropAdvisory.confidence)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Weather Tabs */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="hourly">48h Hourly</TabsTrigger>
          <TabsTrigger value="daily">7-Day Daily</TabsTrigger>
        </TabsList>
        {/* Current Weather */}
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <span className="text-4xl">{getWeatherIcon('Clear')}</span>
                <div>
                  <div className="text-3xl font-bold">
                    {Math.round(forecast.current.temperature)}°C
                  </div>
                  <div className="text-sm text-[#555555]">
                    Current conditions
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-[#555555]" />
                  <div>
                    <p className="text-sm text-[#555555]">Humidity</p>
                    <p className="font-semibold">{Math.round(forecast.current.humidity)}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="h-4 w-4 text-[#555555]" />
                  <div>
                    <p className="text-sm text-[#555555]">Wind</p>
                    <p className="font-semibold">{Math.round(forecast.current.windSpeed)} m/s</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-[#555555]" />
                  <div>
                    <p className="text-sm text-[#555555]">Pressure</p>
                    <p className="font-semibold">{Math.round(forecast.current.pressure)} hPa</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-[#555555]" />
                  <div>
                    <p className="text-sm text-[#555555]">Visibility</p>
                    <p className="font-semibold">{Math.round(forecast.current.visibility)} km</p>
                  </div>
                </div>
              </div>
              {/* Data Sources */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-[#555555] mb-2">Data Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {forecast.metadata.sources.map((source, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {source.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              {/* Topographical Adjustments */}
              {forecast.metadata.adjustments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-[#555555] mb-2">Local Adjustments:</p>
                  <div className="space-y-1">
                    {forecast.metadata.adjustments.map((adj, i) => (
                      <p key={i} className="text-xs text-[#555555]">
                        {adj.description}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Hourly Forecast */}
        <TabsContent value="hourly">
          <Card>
            <CardHeader>
              <CardTitle>48-Hour Hourly Forecast</CardTitle>
              <CardDescription>Field-specific hourly predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4">
                  {forecast.hourly.slice(0, 24).map((hour, i) => (
                    <div key={i} className="flex-shrink-0 text-center p-3 bg-[#FAFAF7] rounded-lg min-w-[80px]">
                      <p className="text-xs text-[#555555]">
                        {new Date(hour.timestamp).toLocaleTimeString('en-US', { 
                          hour: 'numeric',
                          hour12: true 
                        })}
                      </p>
                      <div className="text-lg my-1">☀️</div>
                      <p className="text-sm font-semibold">
                        {Math.round(hour.temperature)}°
                      </p>
                      <div className="text-xs text-[#555555] mt-1">
                        <div>{Math.round(hour.precipitation)}mm</div>
                        <div>{Math.round(hour.windSpeed)}m/s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Daily Forecast */}
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Daily Forecast</CardTitle>
              <CardDescription>Extended outlook with confidence levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecast.daily.map((day, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 bg-[#FAFAF7] rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-[#555555]">{day.conditions}</p>
                    </div>
                    <div className="text-2xl">
                      {getWeatherIcon(day.conditions)}
                    </div>
                    <div className="text-right min-w-[120px]">
                      <p className="font-semibold">
                        {Math.round(day.temperatureMax)}° / {Math.round(day.temperatureMin)}°
                      </p>
                      <div className="text-sm text-[#555555]">
                        <div>{Math.round(day.precipitation.total)}mm ({Math.round(day.precipitation.probability * 100)}%)</div>
                        <div className="text-xs">
                          Confidence: {formatConfidence(day.confidence)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}