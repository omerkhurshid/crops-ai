'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { AggregatedWeatherData, HourlyWeatherData } from '../lib/weather/aggregator'

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
          {aggregatedData && (
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
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {aggregatedData && (
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
          )}
        </TabsContent>

        <TabsContent value="agriculture" className="space-y-4">
          {aggregatedData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Growing Degree Days</CardTitle>
                  <CardDescription>Accumulated heat units for crop development</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(aggregatedData.agricultureMetrics.growingDegreeDays)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chill Hours</CardTitle>
                  <CardDescription>Hours below 7°C for dormancy requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {aggregatedData.agricultureMetrics.chillHours}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Heat Stress</CardTitle>
                  <CardDescription>Hours above 32°C causing crop stress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {aggregatedData.agricultureMetrics.heatStressHours}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Precipitation Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Wet Days</span>
                      <span className="font-semibold text-blue-600">{aggregatedData.agricultureMetrics.wetDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dry Days</span>
                      <span className="font-semibold text-orange-600">{aggregatedData.agricultureMetrics.dryDays}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Irrigation Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={aggregatedData.agricultureMetrics.irrigationNeeded ? "destructive" : "default"}>
                    {aggregatedData.agricultureMetrics.irrigationNeeded ? 'Irrigation Needed' : 'Adequate Moisture'}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="irrigation" className="space-y-4">
          {irrigationRec && (
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}