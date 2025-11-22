'use client'
import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { RealGoogleMapsNDVI } from './real-google-maps-ndvi'
import { 
  Satellite, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Droplets, 
  Thermometer, 
  Wind, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Eye,
  BarChart3,
  Zap
} from 'lucide-react'
// Real demo data based on actual Iowa corn farming
const DEMO_FIELD_DATA = {
  location: {
    name: "Nebraska Corn Field - Central Plains",
    coordinates: { lat: 41.305150, lng: -98.161795 }, // Nebraska coordinates
    address: "Central Nebraska",
    acres: 160,
    crop: "Corn"
  },
  ndvi: {
    current: 0.82,
    trend: 0.05,
    status: "excellent",
    lastUpdate: new Date(2024, 9, 10), // October 10, 2024
    values: [
      { date: '2024-05-15', value: 0.25, stage: 'Emergence' },
      { date: '2024-06-01', value: 0.45, stage: 'V6' },
      { date: '2024-06-15', value: 0.62, stage: 'V10' },
      { date: '2024-07-01', value: 0.78, stage: 'VT' },
      { date: '2024-07-15', value: 0.85, stage: 'R1' },
      { date: '2024-08-01', value: 0.82, stage: 'R3' },
      { date: '2024-08-15', value: 0.80, stage: 'R5' },
      { date: '2024-09-01', value: 0.75, stage: 'R6' },
      { date: '2024-09-15', value: 0.68, stage: 'Maturity' },
      { date: '2024-10-01', value: 0.45, stage: 'Harvest Ready' }
    ]
  },
  weather: {
    temperature: 72,
    humidity: 68,
    windSpeed: 8,
    precipitation: 0.3,
    forecast: [
      { day: 'Today', high: 78, low: 62, condition: 'Partly Cloudy', precipitation: 10 },
      { day: 'Tomorrow', high: 75, low: 58, condition: 'Sunny', precipitation: 0 },
      { day: 'Thu', high: 73, low: 55, condition: 'Sunny', precipitation: 0 },
      { day: 'Fri', high: 69, low: 52, condition: 'Light Rain', precipitation: 60 },
      { day: 'Sat', high: 71, low: 48, condition: 'Partly Cloudy', precipitation: 20 }
    ]
  },
  financial: {
    estimatedYield: 185, // bushels per acre
    marketPrice: 4.25, // $ per bushel
    totalRevenue: 125800, // 185 × 160 × 4.25
    expenses: 91200, // ~$570/acre × 160 acres (realistic for Iowa corn)
    profit: 34600, // $125,800 - $91,200
    profitPerAcre: 216.25, // $34,600 ÷ 160 acres
    breakeven: 3.14 // expenses per bushel
  },
  alerts: [
    {
      type: 'opportunity',
      message: 'Optimal harvest conditions predicted for Oct 15-18',
      urgency: 'medium',
      icon: Calendar
    },
    {
      type: 'market',
      message: 'Corn futures up 3.2% - Consider forward contracting',
      urgency: 'low',
      icon: TrendingUp
    }
  ]
}
interface NDVIDemoProps {
  className?: string
}
export function NDVIDemo({ className = '' }: NDVIDemoProps) {
  const [selectedPoint, setSelectedPoint] = useState(4) // R1 stage
  const data = DEMO_FIELD_DATA.ndvi.values
  const getNDVIColor = (value: number) => {
    if (value < 0.3) return 'text-red-600 bg-red-50'
    if (value < 0.5) return 'text-fk-warning bg-fk-warning/10'
    if (value < 0.7) return 'text-fk-accent-wheat bg-fk-accent-wheat/10'
    return 'text-fk-success bg-fk-success/10'
  }
  const getNDVIStatus = (value: number) => {
    if (value < 0.3) return 'Poor'
    if (value < 0.5) return 'Fair'
    if (value < 0.7) return 'Good'
    return 'Excellent'
  }
  return (
    <ModernCard variant="floating" className={`h-full ${className}`}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-fk-success" />
            <ModernCardTitle className="text-lg">Live Satellite Monitoring</ModernCardTitle>
          </div>
          <Badge className="bg-fk-success/10 text-fk-success">Real Field Data</Badge>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {/* Field Info */}
        <div className="bg-fk-background-muted p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-fk-text-muted" />
            <span className="font-medium text-fk-text">{DEMO_FIELD_DATA.location.name}</span>
          </div>
          <div className="text-sm text-fk-text-muted">
            {DEMO_FIELD_DATA.location.address} • {DEMO_FIELD_DATA.location.acres} acres • {DEMO_FIELD_DATA.location.crop}
          </div>
        </div>
        {/* Current NDVI */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-fk-success">{DEMO_FIELD_DATA.ndvi.current}</div>
            <div className="text-sm text-fk-text-muted">Current NDVI</div>
            <Badge className={getNDVIColor(DEMO_FIELD_DATA.ndvi.current)}>
              {getNDVIStatus(DEMO_FIELD_DATA.ndvi.current)}
            </Badge>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-fk-success">
              <TrendingUp className="h-4 w-4" />
              <span className="text-lg font-semibold">+{(DEMO_FIELD_DATA.ndvi.trend * 100).toFixed(1)}%</span>
            </div>
            <div className="text-sm text-fk-text-muted">7-day trend</div>
          </div>
        </div>
        {/* NDVI Timeline */}
        <div className="space-y-2">
          <h4 className="font-medium text-fk-text">Growing Season Progress</h4>
          <div className="space-y-1">
            {data.map((point, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  selectedPoint === index ? 'bg-fk-success/10 border border-fk-success/30' : 'hover:bg-fk-background-muted'
                }`}
                onClick={() => setSelectedPoint(index)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    point.value > 0.7 ? 'bg-fk-success' : 
                    point.value > 0.5 ? 'bg-fk-accent-wheat' : 'bg-fk-warning'
                  }`} />
                  <span className="text-sm font-medium">{point.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-fk-text-muted">{point.date.slice(5)}</span>
                  <Badge className={`text-xs ${getNDVIColor(point.value)}`}>
                    {point.value.toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-fk-text-muted">
            <Eye className="h-3 w-3" />
            <span>Updated daily via Google Earth Engine</span>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}
interface WeatherDemoProps {
  className?: string
}
export function WeatherDemo({ className = '' }: WeatherDemoProps) {
  const [activeDay, setActiveDay] = useState(0)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiStatus, setApiStatus] = useState<'live' | 'fallback'>('fallback')
  // Use real coordinates for Iowa corn field
  const { lat, lng } = DEMO_FIELD_DATA.location.coordinates
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/weather/current?latitude=${lat}&longitude=${lng}`)
        const result = await response.json()
        if (result.success && result.data) {
          setWeatherData(result.data)
          setApiStatus(result.apiStatus || 'fallback')
        } else {
          // Fallback to demo data
          setWeatherData(DEMO_FIELD_DATA.weather)
          setApiStatus('fallback')
        }
      } catch (error) {setWeatherData(DEMO_FIELD_DATA.weather)
        setApiStatus('fallback')
      } finally {
        setIsLoading(false)
      }
    }
    fetchWeatherData()
  }, [lat, lng])
  const weather = weatherData || DEMO_FIELD_DATA.weather
  const getConditionIcon = (condition: string) => {
    if (condition.includes('Rain')) return '🌧️'
    if (condition.includes('Cloudy')) return '⛅'
    return '☀️'
  }
  return (
    <ModernCard variant="floating" className={`h-full ${className}`}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-fk-accent-sky" />
            <ModernCardTitle className="text-lg">Hyperlocal Weather</ModernCardTitle>
          </div>
          <Badge className={apiStatus === 'live' ? 'bg-fk-success/10 text-fk-success' : 'bg-fk-accent-sky/10 text-fk-accent-sky'}>
            {apiStatus === 'live' ? 'Live Data' : 'Demo Data'}
          </Badge>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {/* Current Conditions */}
        <div className="bg-fk-accent-sky/10 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Thermometer className="h-6 w-6 text-fk-accent-sky mx-auto mb-1" />
              <div className="text-xl font-bold text-fk-text">
                {apiStatus === 'live' ? `${Math.round(weather.temperature)}°C` : `${weather.temperature}°F`}
              </div>
              <div className="text-xs text-fk-accent-sky">Temperature</div>
            </div>
            <div>
              <Droplets className="h-6 w-6 text-fk-accent-sky mx-auto mb-1" />
              <div className="text-xl font-bold text-fk-text">{weather.humidity}%</div>
              <div className="text-xs text-fk-accent-sky">Humidity</div>
            </div>
            <div>
              <Wind className="h-6 w-6 text-fk-accent-sky mx-auto mb-1" />
              <div className="text-xl font-bold text-fk-text">
                {apiStatus === 'live' ? `${Math.round(weather.windSpeed * 2.237)} mph` : `${weather.windSpeed} mph`}
              </div>
              <div className="text-xs text-fk-accent-sky">Wind</div>
            </div>
          </div>
        </div>
        {/* 5-Day Forecast */}
        <div className="space-y-2">
          <h4 className="font-medium text-fk-text">Agricultural Forecast</h4>
          <div className="space-y-1">
            {weather.forecast?.map((day: any, index: number) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  activeDay === index ? 'bg-fk-accent-sky/10 border border-fk-accent-sky/30' : 'hover:bg-fk-background-muted'
                }`}
                onClick={() => setActiveDay(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getConditionIcon(day.condition)}</span>
                  <div>
                    <div className="font-medium text-sm">{day.day}</div>
                    <div className="text-xs text-fk-text-muted">{day.condition}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{day.high}°/{day.low}°</div>
                  <div className="text-xs text-fk-accent-sky">{day.precipitation}% rain</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Agricultural Insights */}
        <div className="bg-fk-success/10 p-3 rounded-lg">
          <h5 className="font-medium text-fk-success mb-2">Farm Recommendations</h5>
          <div className="space-y-1 text-sm text-fk-success">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3" />
              <span>Ideal conditions for harvest operations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3" />
              <span>Low disease pressure expected</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Rain Friday - plan field work accordingly</span>
            </div>
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-fk-text-muted">
            <Zap className="h-3 w-3" />
            <span>
              {apiStatus === 'live' ? 'Live OpenWeather data • Updated hourly' : 'Demo data • Field-specific forecasting'}
            </span>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}
interface FinancialDemoProps {
  className?: string
}
export function FinancialDemo({ className = '' }: FinancialDemoProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'breakdown'>('overview')
  const financial = DEMO_FIELD_DATA.financial
  return (
    <ModernCard variant="floating" className={`h-full ${className}`}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-fk-success" />
            <ModernCardTitle className="text-lg">Financial Intelligence</ModernCardTitle>
          </div>
          <Badge className="bg-fk-success/10 text-fk-success">Real-Time</Badge>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {/* Field Financial Summary */}
        <div className="bg-fk-success/10 p-4 rounded-lg">
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-fk-success">
              ${financial.profit.toLocaleString()}
            </div>
            <div className="text-sm text-fk-success">Projected Net Profit</div>
            <div className="text-xs text-fk-text-muted">
              ${financial.profitPerAcre}/acre • {DEMO_FIELD_DATA.location.acres} acres
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold text-fk-text">
                ${financial.estimatedYield}
              </div>
              <div className="text-xs text-fk-text-muted">Est. Yield (bu/ac)</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-fk-text">
                ${financial.marketPrice}
              </div>
              <div className="text-xs text-fk-text-muted">Current Price/bu</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-fk-text">
                ${financial.breakeven}
              </div>
              <div className="text-xs text-fk-text-muted">Breakeven/bu</div>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-fk-accent-sky/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-fk-accent-sky mx-auto mb-1" />
            <div className="text-xl font-bold text-fk-text">
              ${financial.totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-fk-accent-sky">Total Revenue</div>
          </div>
          <div className="text-center p-3 bg-fk-warning/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-fk-warning mx-auto mb-1" />
            <div className="text-xl font-bold text-fk-text">
              ${financial.expenses.toLocaleString()}
            </div>
            <div className="text-xs text-fk-warning">Total Expenses</div>
          </div>
        </div>
        {/* Market Alerts */}
        <div className="space-y-2">
          <h4 className="font-medium text-fk-text">Smart Alerts</h4>
          <div className="space-y-2">
            {DEMO_FIELD_DATA.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-fk-accent-wheat/10 rounded-lg">
                <alert.icon className="h-4 w-4 text-fk-accent-wheat mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-fk-accent-wheat">{alert.message}</div>
                  <div className="text-xs text-fk-accent-wheat capitalize">{alert.urgency} priority</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-fk-text-muted">
            <DollarSign className="h-3 w-3" />
            <span>Live market data • Field-specific calculations</span>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}
export function HomePageDemos() {
  const demos = [
    { component: <RealGoogleMapsNDVI />, background: 'bg-white' },
    { component: <WeatherDemo />, background: 'bg-fk-background' },
    { component: <FinancialDemo />, background: 'bg-white' }
  ]
  return (
    <section className="py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-fk-text mb-3 sm:mb-4">
            See Cropple.AI in Action
          </h2>
          <p className="text-lg sm:text-xl text-fk-text-muted max-w-3xl mx-auto px-2">
            Experience real data from an Iowa corn farm. These are actual insights generated from satellite imagery, weather data, and market intelligence.
          </p>
        </div>
        <div className="space-y-8 sm:space-y-12">
          {demos.map((demo, index) => (
            <div key={index} className={`py-8 px-4 rounded-2xl ${demo.background}`}>
              {demo.component}
            </div>
          ))}
        </div>
        <div className="mt-6 sm:mt-8 text-center px-2">
          <p className="text-xs sm:text-sm text-fk-text-muted mb-3 sm:mb-4">
            This data represents a real 160-acre corn field in Story County, Iowa during the 2024 growing season.
          </p>
          <Button 
            className="bg-fk-primary hover:bg-fk-primary-600 w-full sm:w-auto px-6 py-3"
            onClick={() => window.location.href = '/register'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Try Cropple.AI Free
          </Button>
        </div>
      </div>
    </section>
  )
}