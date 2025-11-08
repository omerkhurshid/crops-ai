'use client'
import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Thermometer, Droplets, Wind, Eye, CloudRain, 
  AlertTriangle, Clock, Calendar, Sunrise, Sunset,
  Umbrella, RefreshCw, Target, CheckCircle2
} from 'lucide-react'
import { InfoTooltip } from '../ui/info-tooltip'
interface WeatherAction {
  id: string
  action: string
  urgency: 'now' | 'today' | 'this-week'
  reason: string
  impact: string
  timeWindow?: string
}
interface WeatherData {
  current: {
    temperature: number
    condition: string
    humidity: number
    windSpeed: number
    windDirection: string
    pressure: number
    visibility: number
    uvIndex: number
    dewPoint: number
  }
  today: {
    high: number
    low: number
    sunrise: string
    sunset: string
    precipitation: number
    windGust: number
  }
  forecast: Array<{
    date: string
    day: string
    high: number
    low: number
    condition: string
    precipitation: number
    icon: string
  }>
  alerts: Array<{
    type: string
    severity: 'minor' | 'moderate' | 'severe' | 'extreme'
    message: string
    action: string
  }>
  farmingActions: WeatherAction[]
}
interface IntegratedWeatherDashboardProps {
  latitude?: number
  longitude?: number
  className?: string
}
export function IntegratedWeatherDashboard({ latitude, longitude, className }: IntegratedWeatherDashboardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchWeatherData()
  }, [latitude, longitude])
  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/weather?lat=${latitude}&lng=${longitude}`)
      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }
      const data = await response.json()
      if (data.success && data.weather) {
        setWeather(data.weather)
      } else {
        setWeather(null)
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
    } finally {
      setLoading(false)
    }
  }
  const getConditionIcon = (condition: string) => {
    const icons: Record<string, string> = {
      'Sunny': '☀️',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Rain': '🌧️',
      'Thunderstorms': '⛈️',
      'Snow': '🌨️'
    }
    return icons[condition] || '🌤️'
  }
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      minor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      moderate: 'bg-orange-100 text-orange-800 border-orange-200',
      severe: 'bg-red-100 text-red-800 border-red-200',
      extreme: 'bg-red-200 text-red-900 border-red-300'
    }
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200'
  }
  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      now: 'bg-red-100 text-red-800',
      today: 'bg-orange-100 text-orange-800',
      'this-week': 'bg-blue-100 text-blue-800'
    }
    return colors[urgency] || 'bg-gray-100 text-gray-800'
  }
  if (loading) {
    return (
      <ModernCard className={className}>
        <ModernCardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-sage-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-sage-100 rounded"></div>
              ))}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  if (!weather) return null
  return (
    <ModernCard variant="soft" className={className}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            {getConditionIcon(weather.current.condition)}
            Weather & Farming Conditions
            <InfoTooltip 
              title="Weather for Farming" 
              description="This shows current weather conditions and what you should do on your farm based on the weather. We combine weather data with farming best practices."
            />
          </ModernCardTitle>
          <Button onClick={fetchWeatherData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-6">
        {/* Weather Alerts - Integrated at top */}
        {weather.alerts.length > 0 && (
          <div className="space-y-2">
            {weather.alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-sm mt-1 font-semibold">→ {alert.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Current Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Current Weather */}
          <div className="space-y-4">
            <div className="text-center bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-6">
              <div className="text-6xl mb-2">{getConditionIcon(weather.current.condition)}</div>
              <div className="text-3xl font-bold text-blue-900 mb-1">{weather.current.temperature}°C</div>
              <div className="text-blue-700 font-medium">{weather.current.condition}</div>
              <div className="text-sm text-blue-600 mt-2">
                High {weather.today.high}° • Low {weather.today.low}°
              </div>
            </div>
            {/* Detailed Conditions */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 bg-sage-50 rounded">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>{weather.current.humidity}% humidity</span>
                <InfoTooltip 
                  title="Humidity" 
                  description="High humidity (above 80%) can cause disease problems. Low humidity (below 40%) can stress plants. Ideal for most crops is 50-70%."
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-2 p-2 bg-sage-50 rounded">
                <Wind className="h-4 w-4 text-gray-500" />
                <span>{weather.current.windSpeed} km/h {weather.current.windDirection}</span>
                <InfoTooltip 
                  title="Wind Speed" 
                  description="Wind above 15 km/h makes spraying difficult. Strong winds (25+ km/h) can damage crops and increase water loss."
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-2 p-2 bg-sage-50 rounded">
                <Sunrise className="h-4 w-4 text-yellow-500" />
                <span>Sunrise {weather.today.sunrise}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-sage-50 rounded">
                <Sunset className="h-4 w-4 text-orange-500" />
                <span>Sunset {weather.today.sunset}</span>
              </div>
            </div>
          </div>
          {/* Right: Farming Actions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sage-800 flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Weather-Based Actions
            </h4>
            {weather.farmingActions.map((action) => (
              <div key={action.id} className="bg-white border border-sage-200 rounded-lg p-3">
                <div className="flex items-start gap-2 mb-2">
                  <Badge className={`text-xs ${getUrgencyColor(action.urgency)}`}>
                    {action.urgency.toUpperCase()}
                  </Badge>
                  {action.timeWindow && (
                    <span className="text-xs text-sage-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {action.timeWindow}
                    </span>
                  )}
                </div>
                <h5 className="font-medium text-sage-900 mb-1">{action.action}</h5>
                <p className="text-xs text-sage-600 mb-2">{action.reason}</p>
                <div className="bg-green-50 p-2 rounded text-xs text-green-800">
                  <strong>Impact:</strong> {action.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 4-Day Forecast */}
        <div>
          <h4 className="font-semibold text-sage-800 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            4-Day Outlook
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {weather.forecast.map((day) => (
              <div key={day.date} className="bg-white border border-sage-200 rounded-lg p-3 text-center">
                <div className="text-sm font-medium text-sage-800 mb-1">{day.day}</div>
                <div className="text-2xl mb-2">{day.icon}</div>
                <div className="text-sm text-sage-600 mb-1">{day.condition}</div>
                <div className="text-sm font-medium">
                  {day.high}° / {day.low}°
                </div>
                {day.precipitation > 0 && (
                  <div className="flex items-center justify-center gap-1 text-xs text-blue-600 mt-1">
                    <Umbrella className="h-3 w-3" />
                    {day.precipitation}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}