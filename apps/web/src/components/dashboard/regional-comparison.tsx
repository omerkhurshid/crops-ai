'use client'

import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  TrendingUp,
  TrendingDown,
  MapPin,
  Users,
  Award,
  BarChart3,
  Eye,
  Info,
  ChevronRight,
  Leaf,
  DollarSign,
  Droplets,
  Thermometer,
  Target
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface RegionalMetric {
  metric: string
  yourValue: number
  regionAverage: number
  regionMedian: number
  percentile: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  category: 'yield' | 'financial' | 'efficiency' | 'sustainability'
}

interface RegionalComparison {
  region: string
  farmCount: number
  totalArea: number
  cropType: string
  seasonYear: number
  metrics: RegionalMetric[]
  ranking: {
    overall: number
    totalFarms: number
    category: string
  }
  insights: string[]
  benchmarkGoals: Array<{
    metric: string
    currentValue: number
    targetValue: number
    improvement: string
    priority: 'high' | 'medium' | 'low'
  }>
}

interface RegionalComparisonProps {
  farmData?: {
    latitude?: number
    longitude?: number
    totalArea?: number
    region?: string
  }
  crops?: any[]
  className?: string
}

export function RegionalComparison({ farmData, crops, className }: RegionalComparisonProps) {
  const [comparison, setComparison] = useState<RegionalComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showBenchmarks, setShowBenchmarks] = useState(false)

  useEffect(() => {
    generateRegionalComparison()
  }, [farmData, crops])

  const generateRegionalComparison = async () => {
    try {
      const region = farmData?.region || determineRegionFromCoordinates(farmData?.latitude, farmData?.longitude)
      const currentYear = new Date().getFullYear()
      const primaryCrop = crops?.[0]?.cropType || 'CORN'
      
      // Always try to fetch real regional benchmark data first
      try {
        const realBenchmarkData = await fetchRealBenchmarkData(region, primaryCrop, farmData)
        if (realBenchmarkData && realBenchmarkData.metrics.length > 0) {

          setComparison(realBenchmarkData)
          setLoading(false)
          return
        } else {

        }
      } catch (error) {
        console.error('Error fetching real benchmark data:', error)
      }

      // If API fails, fetch from our analytical benchmark service

      try {
        // Use our ML-powered analytical service for real benchmarks
        const analyticalResponse = await fetch('/api/ml/benchmarks/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            farmId: 'default',
            region,
            cropType: primaryCrop,
            farmSize: farmData?.totalArea,
            location: {
              latitude: farmData?.latitude,
              longitude: farmData?.longitude
            }
          })
        })

        if (analyticalResponse.ok) {
          const analyticalData = await analyticalResponse.json()
          
          if (analyticalData.success && analyticalData.benchmarks) {
            const transformedData = transformAnalyticalBenchmarks(analyticalData.benchmarks, region, primaryCrop)
            setComparison(transformedData)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.error('Error fetching analytical benchmarks:', error)
      }

      // Only if all data sources fail, show no data state
      setComparison(null)
    } catch (error) {
      console.error('Error generating regional comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRealBenchmarkData = async (region: string, cropType: string, farmData: any): Promise<RegionalComparison | null> => {
    const requestData = {
      region,
      cropType,
      year: new Date().getFullYear(),
      farmLocation: {
        latitude: farmData?.latitude,
        longitude: farmData?.longitude
      },
      farmSize: farmData?.totalArea,
      comparisonType: 'comprehensive'
    }

    const response = await fetch('/api/benchmarks/regional-comparison', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    if (response.ok) {
      const result = await response.json()
      
      // Handle the API response structure properly
      const data = result.data || result
      const benchmarkData = data.benchmarkData || data
      
      if (benchmarkData && benchmarkData.metrics && benchmarkData.metrics.length > 0) {
        return {
          region: benchmarkData.region || region,
          farmCount: benchmarkData.farmCount || 0,
          totalArea: benchmarkData.totalArea || 0,
          cropType: benchmarkData.cropType || cropType,
          seasonYear: benchmarkData.year || new Date().getFullYear(),
          metrics: transformBenchmarkMetrics(benchmarkData.metrics || [], farmData),
          ranking: {
            overall: benchmarkData.ranking?.overall || 50,
            totalFarms: benchmarkData.ranking?.totalFarms || 100,
            category: benchmarkData.ranking?.category || 'Average'
          },
          insights: benchmarkData.insights || [],
          benchmarkGoals: benchmarkData.benchmarkGoals || []
        }
      }
    }

    return null
  }

  const transformBenchmarkMetrics = (benchmarkMetrics: any[], farmData: any): RegionalMetric[] => {
    return benchmarkMetrics.map(metric => ({
      metric: metric.name || metric.metric,
      yourValue: metric.farmValue || metric.yourValue || 0,
      regionAverage: metric.regionAverage || metric.average || 0,
      regionMedian: metric.regionMedian || metric.median || 0,
      percentile: metric.percentile || 50,
      unit: metric.unit || '',
      trend: metric.trend || 'stable',
      trendPercentage: metric.trendPercentage || 0,
      category: normalizeCategoryName(metric.category || 'yield')
    }))
  }

  const transformAnalyticalBenchmarks = (analyticalData: any, region: string, cropType: string): RegionalComparison => {
    // Transform ML analytical service data to our format
    return {
      region,
      farmCount: analyticalData.regionStats?.farmCount || 150,
      totalArea: analyticalData.regionStats?.totalArea || 45000,
      cropType,
      seasonYear: new Date().getFullYear(),
      metrics: analyticalData.metrics || [],
      ranking: {
        overall: analyticalData.ranking?.position || 75,
        totalFarms: analyticalData.ranking?.totalFarms || 150,
        category: analyticalData.ranking?.category || 'Average'
      },
      insights: analyticalData.insights || [],
      benchmarkGoals: analyticalData.goals || []
    }
  }

  const normalizeCategoryName = (category: string): 'yield' | 'financial' | 'efficiency' | 'sustainability' => {
    const categoryMap: Record<string, 'yield' | 'financial' | 'efficiency' | 'sustainability'> = {
      'production': 'yield',
      'productivity': 'yield',
      'economic': 'financial',
      'financial': 'financial',
      'cost': 'financial',
      'efficiency': 'efficiency',
      'resource': 'efficiency',
      'environmental': 'sustainability',
      'sustainability': 'sustainability'
    }
    
    return categoryMap[category.toLowerCase()] || 'yield'
  }

  const determineRegionFromCoordinates = (latitude?: number, longitude?: number): string => {
    if (!latitude || !longitude) return 'Midwest Corn Belt'
    
    // Regional boundaries based on major agricultural regions
    if (latitude >= 40 && latitude <= 45 && longitude >= -105 && longitude <= -80) {
      return 'Midwest Corn Belt'
    } else if (latitude >= 30 && latitude <= 37 && longitude >= -100 && longitude <= -90) {
      return 'Great Plains'
    } else if (latitude >= 32 && latitude <= 40 && longitude >= -120 && longitude <= -115) {
      return 'California Central Valley'
    } else if (latitude >= 35 && latitude <= 42 && longitude >= -125 && longitude <= -115) {
      return 'Pacific Northwest'
    } else if (latitude >= 25 && latitude <= 35 && longitude >= -85 && longitude <= -75) {
      return 'Southeast'
    } else if (latitude >= 35 && latitude <= 42 && longitude >= -80 && longitude <= -70) {
      return 'Northeast'
    } else {
      return 'Regional Average'
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      yield: Leaf,
      financial: DollarSign,
      efficiency: Target,
      sustainability: Droplets
    }
    return icons[category as keyof typeof icons] || BarChart3
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return 'text-green-600 bg-green-100'
    if (percentile >= 50) return 'text-blue-600 bg-blue-100'
    if (percentile >= 25) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-600" />
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-600" />
    return <div className="w-3 h-0.5 bg-gray-400 rounded"></div>
  }

  const filteredMetrics = selectedCategory === 'all' 
    ? comparison?.metrics 
    : comparison?.metrics.filter(m => m.category === selectedCategory)

  if (loading) {
    return (
      <ModernCard variant="soft" className={className}>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600 animate-pulse" />
            Regional Comparison
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }

  if (!comparison) {
    return (
      <ModernCard variant="soft" className={className}>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            Regional Comparison
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="text-center py-6">
            <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Regional data not available</p>
            <p className="text-xs text-gray-500">Set farm location to enable regional benchmarking</p>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }

  return (
    <ModernCard variant="soft" className={className}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <ModernCardTitle className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              Regional Benchmarking
              <Badge className={cn('text-xs', getPercentileColor(comparison.ranking.overall))}>
                #{comparison.ranking.overall} of {comparison.ranking.totalFarms}
              </Badge>
            </ModernCardTitle>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {comparison.region}
              </span>
              <span>{comparison.farmCount} farms</span>
              <span>{comparison.totalArea.toLocaleString()} total acres</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowBenchmarks(!showBenchmarks)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {showBenchmarks ? 'Hide' : 'Show'} Goals
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mt-4">
          {['all', 'yield', 'financial', 'efficiency', 'sustainability'].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </ModernCardHeader>

      <ModernCardContent className="space-y-4">
        {/* Performance Overview */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{comparison.ranking.category}</div>
            <div className="text-xs text-gray-600">Overall Rating</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {Math.round(comparison.metrics.reduce((sum, m) => sum + m.percentile, 0) / comparison.metrics.length)}%
            </div>
            <div className="text-xs text-gray-600">Avg Percentile</div>
          </div>
        </div>

        {/* Metrics Comparison */}
        <div className="space-y-3">
          {filteredMetrics?.map((metric) => {
            const Icon = getCategoryIcon(metric.category)
            const performanceDiff = metric.yourValue - metric.regionAverage
            const isGoodDiff = metric.metric.includes('Cost') || metric.metric.includes('Carbon') 
              ? performanceDiff < 0  // Lower is better for costs/carbon
              : performanceDiff > 0  // Higher is better for yield/profit
            
            return (
              <div key={metric.metric} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-sm">{metric.metric}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <Badge className={cn('text-xs', getPercentileColor(metric.percentile))}>
                    {metric.percentile}th percentile
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Your Farm</span>
                    <span className="font-semibold">
                      {metric.yourValue.toFixed(metric.unit.includes('$') ? 0 : 1)} {metric.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Region Avg</span>
                    <span className="font-medium">
                      {metric.regionAverage.toFixed(metric.unit.includes('$') ? 0 : 1)} {metric.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Difference</span>
                    <span className={cn('font-medium', isGoodDiff ? 'text-green-600' : 'text-red-600')}>
                      {isGoodDiff ? '+' : ''}{performanceDiff.toFixed(metric.unit.includes('$') ? 0 : 1)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Benchmark Goals */}
        {showBenchmarks && comparison.benchmarkGoals.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm text-gray-800 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Improvement Targets
            </h4>
            {comparison.benchmarkGoals.map((goal, idx) => (
              <div key={idx} className={cn(
                'p-3 rounded-lg border-l-4',
                goal.priority === 'high' ? 'bg-red-50 border-red-400' :
                goal.priority === 'medium' ? 'bg-orange-50 border-orange-400' :
                'bg-blue-50 border-blue-400'
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{goal.metric}</span>
                  <Badge variant="outline" className="text-xs">
                    {goal.priority} priority
                  </Badge>
                </div>
                <div className="text-xs text-gray-700">
                  <span>Target: {goal.improvement}</span>
                  <span className="ml-3">
                    ({goal.currentValue.toFixed(1)} → {goal.targetValue.toFixed(1)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Insights */}
        {comparison.insights.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-medium text-sm text-gray-800 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Regional Insights
            </h4>
            {comparison.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-blue-50 rounded">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}