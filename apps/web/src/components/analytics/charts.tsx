'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { TrendingUp, TrendingDown, BarChart3, Calendar, Download } from 'lucide-react'

interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

interface TimeSeriesChartProps {
  title: string
  description?: string
  data: ChartDataPoint[]
  color?: string
  unit?: string
  height?: number
  showTrend?: boolean
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  description?: string
  icon?: React.ReactNode
}

interface AnalyticsDashboardProps {
  farmId: string
  timeRange?: '7d' | '30d' | '90d' | '1y'
}

// Simple line chart component (since we can't use external chart libraries)
export function SimpleLineChart({ title, description, data, color = '#10b981', unit = '', height = 200, showTrend = true }: TimeSeriesChartProps) {
  if (!data || data.length === 0) return null

  const minValue = Math.min(...data.map(d => d.value))
  const maxValue = Math.max(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((point.value - minValue) / range) * 100
    return `${x},${y}`
  }).join(' ')

  const currentValue = data[data.length - 1]?.value || 0
  const previousValue = data[data.length - 2]?.value || 0
  const change = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {showTrend && (
            <Badge className={`${change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-2xl font-bold" style={{ color }}>
            {currentValue.toFixed(1)}{unit}
          </div>
          <div className="text-sm text-gray-600">
            Current value • {data.length} data points
          </div>
        </div>
        
        <div className="relative" style={{ height: `${height}px` }}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Area under curve */}
            <path
              d={`M 0,100 L ${points} L 100,100 Z`}
              fill={color}
              fillOpacity="0.1"
            />
            
            {/* Main line */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Data points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((point.value - minValue) / range) * 100
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={color}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
            <span>{maxValue.toFixed(1)}</span>
            <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
            <span>{minValue.toFixed(1)}</span>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{new Date(data[0]?.date).toLocaleDateString()}</span>
          <span>{new Date(data[data.length - 1]?.date).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricCard({ title, value, change, unit = '', trend, description, icon }: MetricCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />
    return null
  }

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}{unit}
              </p>
              {change !== undefined && (
                <div className={`flex items-center ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="text-sm font-medium ml-1">
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {icon && (
            <div className="ml-4 p-2 bg-gray-100 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsDashboard({ farmId, timeRange = '30d' }: AnalyticsDashboardProps) {
  const [selectedRange, setSelectedRange] = useState(timeRange)

  // Mock data generation
  const generateMockData = (days: number, baseValue: number, variation: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = []
    let currentValue = baseValue
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      
      // Add some realistic variation
      currentValue += (Math.random() - 0.5) * variation
      currentValue = Math.max(0, currentValue)
      
      data.push({
        date: date.toISOString(),
        value: currentValue
      })
    }
    
    return data
  }

  const getDaysFromRange = (range: string) => {
    switch (range) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '1y': return 365
      default: return 30
    }
  }

  const days = getDaysFromRange(selectedRange)
  
  // Generate mock data for different metrics
  const ndviData = generateMockData(days, 0.7, 0.1)
  const temperatureData = generateMockData(days, 22, 8)
  const humidityData = generateMockData(days, 65, 20)
  const precipitationData = generateMockData(days, 2, 5)

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ]

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Farm Analytics Dashboard</CardTitle>
              <CardDescription>
                Comprehensive data analysis and trends for your farm operations
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {timeRangeOptions.map(option => (
                <Button
                  key={option.value}
                  variant={selectedRange === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Average NDVI"
          value={ndviData[ndviData.length - 1]?.value.toFixed(2) || '0.00'}
          change={5.2}
          trend="up"
          description="Vegetation health index"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        />
        
        <MetricCard
          title="Field Coverage"
          value="248.5"
          unit=" ha"
          change={-1.8}
          trend="down"
          description="Total monitored area"
          icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
        />
        
        <MetricCard
          title="Health Score"
          value="87"
          unit="%"
          change={3.1}
          trend="up"
          description="Overall crop health"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        />
        
        <MetricCard
          title="Stressed Areas"
          value="12.3"
          unit="%"
          change={-8.4}
          trend="down"
          description="Areas requiring attention"
          icon={<TrendingDown className="h-5 w-5 text-red-600" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChart
          title="NDVI Trend"
          description="Vegetation health over time"
          data={ndviData}
          color="#10b981"
          unit=""
          height={250}
        />
        
        <SimpleLineChart
          title="Temperature"
          description="Average daily temperature"
          data={temperatureData}
          color="#f59e0b"
          unit="°C"
          height={250}
        />
        
        <SimpleLineChart
          title="Humidity"
          description="Relative humidity levels"
          data={humidityData}
          color="#3b82f6"
          unit="%"
          height={250}
        />
        
        <SimpleLineChart
          title="Precipitation"
          description="Daily rainfall measurements"
          data={precipitationData}
          color="#8b5cf6"
          unit="mm"
          height={250}
        />
      </div>

      {/* Additional Analytics */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
          <CardDescription>
            Detailed insights into farm performance and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800 mb-2">94%</div>
              <div className="text-sm font-medium text-green-700">Data Accuracy</div>
              <div className="text-xs text-green-600 mt-1">
                High-quality satellite data coverage
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800 mb-2">15%</div>
              <div className="text-sm font-medium text-blue-700">Yield Improvement</div>
              <div className="text-xs text-blue-600 mt-1">
                Compared to regional average
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-800 mb-2">$8,400</div>
              <div className="text-sm font-medium text-purple-700">Cost Savings</div>
              <div className="text-xs text-purple-600 mt-1">
                Through precision agriculture
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}