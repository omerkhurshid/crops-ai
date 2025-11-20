'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { InlineFloatingButton } from '../ui/floating-button'
import { InfoTooltip } from '../ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../../lib/tooltip-content'
import { Thermometer, Droplets, Wind, Eye, CloudRain, RotateCcw } from 'lucide-react'
import { CurrentWeather, WeatherForecast, WeatherAlert, AgricultureWeatherData } from '../../lib/weather/service'
interface WeatherDashboardProps {
  latitude: number
  longitude: number
  className?: string
}
export function WeatherDashboard({ latitude, longitude, className }: WeatherDashboardProps) {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null)
  const [forecast, setForecast] = useState<WeatherForecast[]>([])
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [agricultureData, setAgricultureData] = useState<AgricultureWeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (latitude && longitude) {
      fetchWeatherData()
    }
  }, [latitude, longitude])
  const fetchWeatherData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch all weather data in parallel
      const [currentResponse, forecastResponse, alertsResponse, agriResponse] = await Promise.allSettled([
        fetch(`/api/weather/current?latitude=${latitude}&longitude=${longitude}`),
        fetch(`/api/weather/forecast?latitude=${latitude}&longitude=${longitude}&days=5`),
        fetch(`/api/weather/alerts?latitude=${latitude}&longitude=${longitude}`),
        fetch(`/api/weather/agriculture?latitude=${latitude}&longitude=${longitude}`)
      ])
      // Process current weather
      if (currentResponse.status === 'fulfilled' && currentResponse.value.ok) {
        const currentData = await currentResponse.value.json()
        setCurrentWeather(currentData.data?.weather || currentData.weather)
      }
      // Process forecast
      if (forecastResponse.status === 'fulfilled' && forecastResponse.value.ok) {
        const forecastData = await forecastResponse.value.json()
        setForecast(forecastData.data?.forecast || forecastData.forecast || [])
      }
      // Process alerts
      if (alertsResponse.status === 'fulfilled' && alertsResponse.value.ok) {
        const alertsData = await alertsResponse.value.json()
        setAlerts(alertsData.data?.alerts || alertsData.alerts || [])
      }
      // Process agriculture data
      if (agriResponse.status === 'fulfilled' && agriResponse.value.ok) {
        const agriData = await agriResponse.value.json()
        setAgricultureData(agriData.data?.data || agriData.data)
      }
    } catch (err) {
      setError('Failed to fetch weather data')
      console.error('Weather data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }
  const getWeatherIcon = (iconCode: string) => {
    // Weather icon mapping
    const iconMap: Record<string, string> = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️',
    }
    return iconMap[iconCode] || '🌤️'
  }
  const getAlertIcon = (alertType: WeatherAlert['alertType']) => {
    const iconMap: Record<string, string> = {
      frost: '🌡️',
      storm: '⛈️',
      drought: '☀️',
      heat: '🔥',
      wind: '💨',
      hail: '🧊',
      flood: '🌊'
    }
    return iconMap[alertType] || '⚠️'
  }
  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    const colorMap: Record<string, string> = {
      minor: 'text-yellow-600 bg-yellow-50',
      moderate: 'text-orange-600 bg-orange-50',
      severe: 'text-red-600 bg-red-50',
      extreme: 'text-red-800 bg-red-100'
    }
    return colorMap[severity] || 'text-[#555555] bg-[#FAFAF7]'
  }
  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#F5F5F5] rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-[#F5F5F5] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchWeatherData}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Weather Dashboard</h2>
        <Button onClick={fetchWeatherData} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">Active Weather Alerts</h3>
          {alerts.map(alert => (
            <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getAlertIcon(alert.alertType)}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm text-[#555555]">{alert.description}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    {alert.recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-[#555555]">Recommendations:</p>
                        <ul className="text-sm text-[#555555] list-disc list-inside">
                          {alert.recommendations.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Current Weather */}
      {currentWeather && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-3xl">
                {getWeatherIcon(currentWeather.conditions[0]?.icon)}
              </span>
              <div>
                <div className="text-2xl">{Math.round(currentWeather.temperature)}°C</div>
                <div className="text-sm text-[#555555]">
                  Feels like {Math.round(currentWeather.feelsLike)}°C
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              {currentWeather.conditions[0]?.description || 'Current weather'}
              {currentWeather.location.name && ` in ${currentWeather.location.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-[#555555]">Humidity</p>
                <p className="font-semibold">{currentWeather.humidity}%</p>
              </div>
              <div>
                <p className="text-sm text-[#555555]">Wind</p>
                <p className="font-semibold">{Math.round(currentWeather.windSpeed * 3.6)} km/h</p>
              </div>
              <div>
                <p className="text-sm text-[#555555]">Pressure</p>
                <p className="font-semibold">{currentWeather.pressure} hPa</p>
              </div>
              <div>
                <p className="text-sm text-[#555555]">Cloud Cover</p>
                <p className="font-semibold">{currentWeather.cloudCover}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {forecast.map(day => (
                <div key={day.id} className="text-center p-3 rounded-lg bg-[#FAFAF7]">
                  <p className="text-sm font-medium text-[#555555]">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <div className="text-2xl my-2">
                    {getWeatherIcon(day.conditions[0]?.icon)}
                  </div>
                  <p className="text-sm font-semibold">
                    {Math.round(day.temperature.max)}° / {Math.round(day.temperature.min)}°
                  </p>
                  <p className="text-xs text-[#555555] mt-1">
                    {day.precipitationProbability}% rain
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Agriculture Data */}
      {agricultureData && (
        <Card>
          <CardHeader>
            <CardTitle>Agriculture Conditions</CardTitle>
            <CardDescription>
              Specialized weather data for farming operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {agricultureData.growingDegreeDays !== undefined && (
                <div>
                  <p className="text-sm text-[#555555]">Growing Degree Days</p>
                  <p className="font-semibold">{Math.round(agricultureData.growingDegreeDays)}</p>
                </div>
              )}
              {agricultureData.frostRisk && (
                <div>
                  <p className="text-sm text-[#555555]">Frost Risk</p>
                  <p className={`font-semibold capitalize ${
                    agricultureData.frostRisk === 'high' ? 'text-red-600' :
                    agricultureData.frostRisk === 'moderate' ? 'text-orange-600' :
                    agricultureData.frostRisk === 'low' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {agricultureData.frostRisk}
                  </p>
                </div>
              )}
              {agricultureData.heatStress && (
                <div>
                  <p className="text-sm text-[#555555]">Heat Stress</p>
                  <p className={`font-semibold capitalize ${
                    agricultureData.heatStress === 'severe' ? 'text-red-800' :
                    agricultureData.heatStress === 'high' ? 'text-red-600' :
                    agricultureData.heatStress === 'moderate' ? 'text-orange-600' :
                    agricultureData.heatStress === 'low' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {agricultureData.heatStress}
                  </p>
                </div>
              )}
              {agricultureData.evapotranspiration !== undefined && (
                <div>
                  <p className="text-sm text-[#555555]">ET₀ (mm/day)</p>
                  <p className="font-semibold">{agricultureData.evapotranspiration.toFixed(1)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}