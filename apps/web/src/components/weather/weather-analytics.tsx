'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { Thermometer, TrendingUp, Droplets, Sprout } from 'lucide-react'
import { AggregatedWeatherData, HourlyWeatherData } from '../../lib/weather/aggregator'
interface WeatherAnalyticsProps {
  latitude: number
  longitude: number
  className?: string
}
interface IrrigationRecommendation {
  recommendation: 'immediate' | 'soon' | 'monitor' | 'delay'
  reasonCode: string
  description: string
  nextCheckHours: number
  irrigationAmount?: number
}
interface FieldAnalysis {
  centerPoint: AggregatedWeatherData | null
  variations: {
    temperatureVariation: number
    precipitationVariation: number
    microclimateRisk: 'low' | 'moderate' | 'high'
  }
}
export function WeatherAnalytics({ latitude, longitude, className }: WeatherAnalyticsProps) {
  const [aggregatedData, setAggregatedData] = useState<AggregatedWeatherData | null>(null)
  const [hourlyData, setHourlyData] = useState<HourlyWeatherData | null>(null)
  const [irrigationRec, setIrrigationRec] = useState<IrrigationRecommendation | null>(null)
  const [fieldAnalysis, setFieldAnalysis] = useState<FieldAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  useEffect(() => {
    if (latitude && longitude) {
      fetchAnalyticsData()
    }
  }, [latitude, longitude])
  const fetchAnalyticsData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch different types of analytics data
      const [aggregatedResponse, hourlyResponse, irrigationResponse] = await Promise.allSettled([
        fetch(`/api/weather/aggregate?latitude=${latitude}&longitude=${longitude}&type=aggregated`),
        fetch(`/api/weather/aggregate?latitude=${latitude}&longitude=${longitude}&type=hourly`),
        fetch(`/api/weather/aggregate?latitude=${latitude}&longitude=${longitude}&type=irrigation`)
      ])
      // Process aggregated data
      if (aggregatedResponse.status === 'fulfilled' && aggregatedResponse.value.ok) {
        const data = await aggregatedResponse.value.json()
        setAggregatedData(data.data)
      }
      // Process hourly data
      if (hourlyResponse.status === 'fulfilled' && hourlyResponse.value.ok) {
        const data = await hourlyResponse.value.json()
        setHourlyData(data.data)
      }
      // Process irrigation recommendations
      if (irrigationResponse.status === 'fulfilled' && irrigationResponse.value.ok) {
        const data = await irrigationResponse.value.json()
        setIrrigationRec(data.data)
      }
    } catch (err) {
      setError('Failed to fetch weather analytics data')
      console.error('Weather analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'immediate': return 'bg-red-100 text-red-800 border-red-200'
      case 'soon': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'monitor': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delay': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600'
      case 'moderate': return 'text-orange-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }
  const formatStatistic = (value: number, unit: string = '') => {
    return `${value.toFixed(1)}${unit}`
  }
  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert>
          <AlertDescription className="text-red-600">
            {error}
            <Button onClick={fetchAnalyticsData} variant="outline" size="sm" className="ml-4">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Weather Analytics</h2>
        <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="agriculture">Agriculture</TabsTrigger>
          <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {aggregatedData ? (
            <>
              {/* Weather Statistics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Temperature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average</span>
                        <span className="font-semibold">{formatStatistic(aggregatedData.statistics.temperature.average, '°C')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Range</span>
                        <span className="font-semibold">
                          {formatStatistic(aggregatedData.statistics.temperature.min, '°C')} - {formatStatistic(aggregatedData.statistics.temperature.max, '°C')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Std Dev</span>
                        <span className="font-semibold">{formatStatistic(aggregatedData.statistics.temperature.standardDeviation, '°C')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Humidity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average</span>
                        <span className="font-semibold">{formatStatistic(aggregatedData.statistics.humidity.average, '%')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Range</span>
                        <span className="font-semibold">
                          {formatStatistic(aggregatedData.statistics.humidity.min, '%')} - {formatStatistic(aggregatedData.statistics.humidity.max, '%')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Precipitation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average</span>
                        <span className="font-semibold">{formatStatistic(aggregatedData.statistics.precipitation.average, '%')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Max</span>
                        <span className="font-semibold">{formatStatistic(aggregatedData.statistics.precipitation.max, '%')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Data Quality */}
              {hourlyData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Data Quality Summary</CardTitle>
                    <CardDescription>
                      Analysis of weather data completeness and reliability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Quality</p>
                        <Badge variant="outline" className={
                          hourlyData.summary.dataQuality === 'excellent' ? 'bg-green-50 text-green-700' :
                          hourlyData.summary.dataQuality === 'good' ? 'bg-blue-50 text-blue-700' :
                          hourlyData.summary.dataQuality === 'fair' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }>
                          {hourlyData.summary.dataQuality}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data Points</p>
                        <p className="font-semibold">{hourlyData.summary.totalHours}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Gaps</p>
                        <p className="font-semibold">{hourlyData.summary.gapsCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="text-sm">{new Date(hourlyData.summary.lastUpdated).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Thermometer className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Weather Analytics Data
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-4">
                Weather analytics data is not available for this location. Please try refreshing or check your location settings.
              </p>
              <Button onClick={fetchAnalyticsData} variant="outline">
                Retry Loading Data
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          {aggregatedData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Temperature Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {aggregatedData.trends.temperatureTrend === 'rising' ? '📈' :
                       aggregatedData.trends.temperatureTrend === 'falling' ? '📉' : '📊'}
                    </span>
                    <span className="font-semibold capitalize">
                      {aggregatedData.trends.temperatureTrend}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Precipitation Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {aggregatedData.trends.precipitationTrend === 'increasing' ? '📈' :
                       aggregatedData.trends.precipitationTrend === 'decreasing' ? '📉' : '📊'}
                    </span>
                    <span className="font-semibold capitalize">
                      {aggregatedData.trends.precipitationTrend}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pressure Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {aggregatedData.trends.pressureTrend === 'rising' ? '📈' :
                       aggregatedData.trends.pressureTrend === 'falling' ? '📉' : '📊'}
                    </span>
                    <span className="font-semibold capitalize">
                      {aggregatedData.trends.pressureTrend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Trend Data Available
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Weather trend analysis requires historical data that is not currently available.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="agriculture" className="space-y-4">
          {aggregatedData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growing Degree Days</CardTitle>
                  <CardDescription>Heat accumulation that drives crop growth and development</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-3">
                    {Math.round(aggregatedData.agricultureMetrics.growingDegreeDays)}
                  </div>
                  <div className="text-sm text-gray-600 bg-green-50 p-3 rounded border-l-4 border-green-400">
                    <p className="font-medium text-green-800 mb-2">What this means:</p>
                    <p>• Each crop needs a specific amount of heat to mature</p>
                    <p>• Corn needs ~2,700 GDD, Soybeans need ~2,500 GDD</p>
                    <p>• Higher numbers = faster crop development</p>
                    <p>• Use this to time planting, harvest, and treatments</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chill Hours</CardTitle>
                  <CardDescription>Cold hours needed for fruit trees and perennial crops</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-3">
                    {aggregatedData.agricultureMetrics.chillHours}
                  </div>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="font-medium text-blue-800 mb-2">What this means:</p>
                    <p>• Many fruit trees need winter cold to produce fruit</p>
                    <p>• Apples need 800-1,200 hours, Peaches need 150-1,000</p>
                    <p>• Not enough chill = poor fruit production</p>
                    <p>• Monitor if you grow fruit trees or nuts</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Heat Stress Hours</CardTitle>
                  <CardDescription>Excessive heat that can damage crops and reduce yields</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-3">
                    {aggregatedData.agricultureMetrics.heatStressHours}
                  </div>
                  <div className="text-sm text-gray-600 bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p className="font-medium text-red-800 mb-2">What this means:</p>
                    <p>• Temperatures above 32°C stress most crops</p>
                    <p>• Can cause poor pollination, wilting, reduced yields</p>
                    <p>• High numbers = consider shade, irrigation, heat-tolerant varieties</p>
                    <p>• Critical during flowering and grain filling</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Precipitation Patterns</CardTitle>
                  <CardDescription>Wet and dry day patterns affecting field work and irrigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Wet Days</span>
                      <span className="font-semibold text-blue-600">{aggregatedData.agricultureMetrics.wetDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dry Days</span>
                      <span className="font-semibold text-orange-600">{aggregatedData.agricultureMetrics.dryDays}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                    <p className="font-medium text-yellow-800 mb-2">What this means:</p>
                    <p>• Too many wet days = delayed field work, disease risk</p>
                    <p>• Too many dry days = drought stress, irrigation needed</p>
                    <p>• Balance is key for healthy crops and field access</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Soil Moisture Status</CardTitle>
                  <CardDescription>Current water availability for your crops</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <Badge variant={aggregatedData.agricultureMetrics.irrigationNeeded ? "destructive" : "default"} className="text-lg px-4 py-2">
                      {aggregatedData.agricultureMetrics.irrigationNeeded ? 'Irrigation Needed' : 'Adequate Moisture'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="font-medium text-blue-800 mb-2">Action needed:</p>
                    {aggregatedData.agricultureMetrics.irrigationNeeded ? (
                      <>
                        <p>• Check soil moisture in your fields</p>
                        <p>• Consider turning on irrigation systems</p>
                        <p>• Monitor crops for wilting or stress signs</p>
                        <p>• Priority: vegetative crops and fruit trees</p>
                      </>
                    ) : (
                      <>
                        <p>• Current moisture levels are adequate</p>
                        <p>• Continue monitoring weather forecasts</p>
                        <p>• Good time for field work if soil isn't too wet</p>
                        <p>• Watch for signs of overwatering in low areas</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Additional practical advice card */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    💡 Practical Application Tips
                  </CardTitle>
                  <CardDescription>How to use these agriculture conditions for better farming decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">📊 For Crop Planning:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Use GDD to time herbicide and fertilizer applications</li>
                        <li>• Plan harvest timing based on heat accumulation</li>
                        <li>• Choose varieties based on your typical GDD totals</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">💧 For Water Management:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Monitor wet/dry patterns for irrigation scheduling</li>
                        <li>• Use heat stress data to time irrigation during hot periods</li>
                        <li>• Adjust irrigation based on recent precipitation</li>
                      </ul>
                    </div>
                    <div className="bg-orange-50 p-4 rounded border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">🌡️ For Heat Management:</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• High heat stress hours = consider shade cloth or cooling</li>
                        <li>• Avoid spraying during extreme heat periods</li>
                        <li>• Plan harvest for cooler parts of the day</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-4 rounded border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2">📅 For Timing Operations:</h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Use dry day counts to plan field work windows</li>
                        <li>• Combine GDD with calendar for accurate timing</li>
                        <li>• Consider heat stress when scheduling treatments</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Agriculture Data Available
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-4">
                Agricultural metrics are not currently available. This may be due to insufficient weather data or location settings.
              </p>
              <Button onClick={fetchAnalyticsData} variant="outline">
                Retry Loading Data
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="irrigation" className="space-y-4">
          {irrigationRec ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Irrigation Recommendation</CardTitle>
                <CardDescription>AI-powered irrigation guidance based on current conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge className={getRecommendationColor(irrigationRec.recommendation)}>
                    {irrigationRec.recommendation.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Next check in {irrigationRec.nextCheckHours} hours
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700">{irrigationRec.description}</p>
                </div>
                {irrigationRec.irrigationAmount && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Amount</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(irrigationRec.irrigationAmount)} mm
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2">Reason Code</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {irrigationRec.reasonCode}
                  </code>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Irrigation Data Available
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto mb-4">
                Irrigation recommendations are not currently available. This may be due to insufficient weather data or location settings.
              </p>
              <Button onClick={fetchAnalyticsData} variant="outline">
                Retry Loading Data
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}