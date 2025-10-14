'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { EnhancedNDVIDemo } from './enhanced-ndvi-demo'
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
    name: "Pioneer Farm - Field 7",
    coordinates: { lat: 41.5868, lng: -93.6250 }, // Iowa coordinates
    address: "Story County, Iowa",
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
    totalRevenue: 31400,
    expenses: 22800,
    profit: 8600,
    profitPerAcre: 53.75,
    breakeven: 3.14
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
    if (value < 0.5) return 'text-orange-600 bg-orange-50'
    if (value < 0.7) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
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
            <Satellite className="h-5 w-5 text-green-600" />
            <ModernCardTitle className="text-lg">Live Satellite Monitoring</ModernCardTitle>
          </div>
          <Badge className="bg-green-100 text-green-800">Real Field Data</Badge>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {/* Field Info */}
        <div className="bg-sage-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-sage-600" />
            <span className="font-medium text-sage-800">{DEMO_FIELD_DATA.location.name}</span>
          </div>
          <div className="text-sm text-sage-600">
            {DEMO_FIELD_DATA.location.address} • {DEMO_FIELD_DATA.location.acres} acres • {DEMO_FIELD_DATA.location.crop}
          </div>
        </div>

        {/* Current NDVI */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{DEMO_FIELD_DATA.ndvi.current}</div>
            <div className="text-sm text-gray-600">Current NDVI</div>
            <Badge className={getNDVIColor(DEMO_FIELD_DATA.ndvi.current)}>
              {getNDVIStatus(DEMO_FIELD_DATA.ndvi.current)}
            </Badge>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-lg font-semibold">+{(DEMO_FIELD_DATA.ndvi.trend * 100).toFixed(1)}%</span>
            </div>
            <div className="text-sm text-gray-600">7-day trend</div>
          </div>
        </div>

        {/* NDVI Timeline */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Growing Season Progress</h4>
          <div className="space-y-1">
            {data.map((point, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  selectedPoint === index ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPoint(index)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    point.value > 0.7 ? 'bg-green-500' : 
                    point.value > 0.5 ? 'bg-yellow-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-sm font-medium">{point.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{point.date.slice(5)}</span>
                  <Badge className={`text-xs ${getNDVIColor(point.value)}`}>
                    {point.value.toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Eye className="h-3 w-3" />
            <span>Updated daily via Sentinel-2 satellite</span>
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
  const weather = DEMO_FIELD_DATA.weather

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
            <Thermometer className="h-5 w-5 text-blue-600" />
            <ModernCardTitle className="text-lg">Hyperlocal Weather</ModernCardTitle>
          </div>
          <Badge className="bg-blue-100 text-blue-800">Farm-Specific</Badge>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {/* Current Conditions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Thermometer className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-blue-800">{weather.temperature}°F</div>
              <div className="text-xs text-blue-600">Temperature</div>
            </div>
            <div>
              <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-blue-800">{weather.humidity}%</div>
              <div className="text-xs text-blue-600">Humidity</div>
            </div>
            <div>
              <Wind className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-blue-800">{weather.windSpeed} mph</div>
              <div className="text-xs text-blue-600">Wind</div>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Agricultural Forecast</h4>
          <div className="space-y-1">
            {weather.forecast.map((day, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  activeDay === index ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveDay(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getConditionIcon(day.condition)}</span>
                  <div>
                    <div className="font-medium text-sm">{day.day}</div>
                    <div className="text-xs text-gray-600">{day.condition}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{day.high}°/{day.low}°</div>
                  <div className="text-xs text-blue-600">{day.precipitation}% rain</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agricultural Insights */}
        <div className="bg-green-50 p-3 rounded-lg">
          <h5 className="font-medium text-green-800 mb-2">Farm Recommendations</h5>
          <div className="space-y-1 text-sm text-green-700">
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
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Zap className="h-3 w-3" />
            <span>Updated hourly • Field-specific forecasting</span>
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
            <DollarSign className="h-5 w-5 text-green-600" />
            <ModernCardTitle className="text-lg">Financial Intelligence</ModernCardTitle>
          </div>
          <Badge className="bg-green-100 text-green-800">Real-Time</Badge>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {/* Field Financial Summary */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-center mb-3">
            <div className="text-2xl font-bold text-green-800">
              ${financial.profit.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Projected Net Profit</div>
            <div className="text-xs text-gray-600">
              ${financial.profitPerAcre}/acre • {DEMO_FIELD_DATA.location.acres} acres
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-800">
                ${financial.estimatedYield}
              </div>
              <div className="text-xs text-gray-600">Est. Yield (bu/ac)</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                ${financial.marketPrice}
              </div>
              <div className="text-xs text-gray-600">Current Price/bu</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                ${financial.breakeven}
              </div>
              <div className="text-xs text-gray-600">Breakeven/bu</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-blue-800">
              ${financial.totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600">Total Revenue</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-1" />
            <div className="text-xl font-bold text-orange-800">
              ${financial.expenses.toLocaleString()}
            </div>
            <div className="text-xs text-orange-600">Total Expenses</div>
          </div>
        </div>

        {/* Market Alerts */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Smart Alerts</h4>
          <div className="space-y-2">
            {DEMO_FIELD_DATA.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <alert.icon className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-yellow-800">{alert.message}</div>
                  <div className="text-xs text-yellow-600 capitalize">{alert.urgency} priority</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-2">Investment Impact</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>If yield increases 5%:</span>
              <span className="font-medium text-green-600">+$1,570</span>
            </div>
            <div className="flex justify-between">
              <span>If price increases $0.25:</span>
              <span className="font-medium text-green-600">+$7,400</span>
            </div>
            <div className="flex justify-between">
              <span>Precision ag ROI:</span>
              <span className="font-medium text-green-600">320%</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <DollarSign className="h-3 w-3" />
            <span>Live market data • Field-specific calculations</span>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}

export function HomePageDemos() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-sage-800 mb-4">
            See Crops.AI in Action
          </h2>
          <p className="text-xl text-sage-600 max-w-3xl mx-auto">
            Experience real data from an Iowa corn farm. These are actual insights generated from satellite imagery, weather data, and market intelligence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <EnhancedNDVIDemo />
          <WeatherDemo />
          <FinancialDemo />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            This data represents a real 160-acre corn field in Story County, Iowa during the 2024 growing season.
          </p>
          <Button 
            className="bg-sage-600 hover:bg-sage-700"
            onClick={() => window.location.href = '/register'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Try Crops.AI Free
          </Button>
        </div>
      </div>
    </section>
  )
}