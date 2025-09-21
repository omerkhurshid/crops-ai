'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  CloudRain, Sun, Droplets, Thermometer, Wind, 
  AlertTriangle, CheckCircle2, Clock, TrendingUp,
  MapPin, Zap
} from 'lucide-react'

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  precipitation: number
  recommendation: string
  urgency: 'low' | 'medium' | 'high'
}

const DEMO_LOCATIONS = [
  { name: 'Iowa Corn Belt', lat: 42.0, lon: -93.5 },
  { name: 'Nebraska Plains', lat: 41.5, lon: -99.9 },
  { name: 'Illinois Valley', lat: 40.0, lon: -89.2 }
]

const WEATHER_SCENARIOS = [
  {
    temperature: 82,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    precipitation: 0,
    recommendation: 'Perfect conditions for spraying - apply fungicide between 6-10 AM',
    urgency: 'high' as const
  },
  {
    temperature: 89,
    condition: 'Hot & Windy',
    humidity: 45,
    windSpeed: 15,
    precipitation: 0,
    recommendation: 'Avoid spraying - wind too high, check irrigation systems',
    urgency: 'medium' as const
  },
  {
    temperature: 75,
    condition: 'Light Rain',
    humidity: 85,
    windSpeed: 5,
    precipitation: 0.2,
    recommendation: 'Good conditions for nitrogen application - rain will help uptake',
    urgency: 'high' as const
  }
]

export function InteractiveDemo() {
  const [currentLocation, setCurrentLocation] = useState(0)
  const [currentWeather, setCurrentWeather] = useState(0)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setCurrentWeather(prev => (prev + 1) % WEATHER_SCENARIOS.length)
        setCurrentLocation(prev => (prev + 1) % DEMO_LOCATIONS.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isLive])

  const location = DEMO_LOCATIONS[currentLocation]
  const weather = WEATHER_SCENARIOS[currentWeather]

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Rain')) return <CloudRain className="h-6 w-6 text-blue-500" />
    if (condition.includes('Hot')) return <Sun className="h-6 w-6 text-orange-500" />
    return <Sun className="h-6 w-6 text-yellow-500" />
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-light text-sage-800 mb-4">
            See Cropple.ai in Action
          </h2>
          <p className="text-lg text-sage-600 max-w-2xl mx-auto">
            Experience how our AI analyzes real weather data to provide instant farming decisions
          </p>
        </div>

        <ModernCard variant="floating" className="overflow-hidden">
          <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
            <div className="flex items-center justify-between">
              <div>
                <ModernCardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-sage-600" />
                  Farm Dashboard Demo
                </ModernCardTitle>
                <ModernCardDescription>
                  Live weather analysis for {location.name}
                </ModernCardDescription>
              </div>
              <Button 
                onClick={() => setIsLive(!isLive)}
                variant={isLive ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {isLive ? 'Live Demo' : 'Start Demo'}
              </Button>
            </div>
          </ModernCardHeader>
          
          <ModernCardContent className="p-6">
            {/* Weather Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-sage-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {getWeatherIcon(weather.condition)}
                </div>
                <div className="text-2xl font-bold text-sage-800">{weather.temperature}°F</div>
                <div className="text-sm text-sage-600">{weather.condition}</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Droplets className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-800">{weather.humidity}%</div>
                <div className="text-sm text-blue-600">Humidity</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Wind className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-800">{weather.windSpeed} mph</div>
                <div className="text-sm text-green-600">Wind Speed</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <CloudRain className="h-6 w-6 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-800">{weather.precipitation}"</div>
                <div className="text-sm text-purple-600">Precipitation</div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-gradient-to-r from-sage-50 to-cream-50 rounded-lg p-6 border border-sage-200">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${weather.urgency === 'high' ? 'bg-red-100' : weather.urgency === 'medium' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  {weather.urgency === 'high' ? 
                    <AlertTriangle className="h-5 w-5 text-red-600" /> :
                    weather.urgency === 'medium' ?
                    <Clock className="h-5 w-5 text-yellow-600" /> :
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-sage-800">AI Recommendation</h3>
                    <Badge className={`${getUrgencyColor(weather.urgency)} border`}>
                      {weather.urgency.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                  <p className="text-sage-700 leading-relaxed">
                    {weather.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setCurrentWeather(prev => (prev + 1) % WEATHER_SCENARIOS.length)}
                variant="outline"
                className="flex-1"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Try Different Weather
              </Button>
              <Button 
                onClick={() => setCurrentLocation(prev => (prev + 1) % DEMO_LOCATIONS.length)}
                variant="outline"
                className="flex-1"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Change Location
              </Button>
            </div>
          </ModernCardContent>
        </ModernCard>

        <div className="text-center mt-8">
          <p className="text-sage-600 mb-4">
            This is just a preview. The full platform includes crop health monitoring, financial tracking, and much more.
          </p>
          <Button size="lg" className="bg-sage-700 hover:bg-sage-800">
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </section>
  )
}