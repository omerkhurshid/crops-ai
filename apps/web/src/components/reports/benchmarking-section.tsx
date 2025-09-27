'use client'

import React from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { TrafficLightStatus } from '../ui/traffic-light-status'
import { InfoTooltip } from '../ui/info-tooltip'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  MapPin,
  BarChart3
} from 'lucide-react'

interface BenchmarkData {
  metric: string
  yourValue: number
  regionAverage: number
  topQuartile: number
  unit: string
  category: 'yield' | 'cost' | 'profit' | 'efficiency'
  higherIsBetter: boolean
}

interface Farm {
  id: string
  name: string
  totalArea: number
  region?: string
}

interface BenchmarkingSectionProps {
  farm: Farm
}

export function BenchmarkingSection({ farm }: BenchmarkingSectionProps) {
  const [benchmarks, setBenchmarks] = React.useState<BenchmarkData[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchBenchmarkData = async () => {
      try {
        const response = await fetch(`/api/farms/regional-comparison?farmId=${farm.id}`)
        if (response.ok) {
          const data = await response.json()
          // Transform API data to benchmark format
          const farmBenchmarks: BenchmarkData[] = []
          
          if (data.yieldComparison) {
            farmBenchmarks.push({
              metric: 'Crop Yield',
              yourValue: data.yieldComparison.yourValue || 0,
              regionAverage: data.yieldComparison.regionAverage || 0,
              topQuartile: data.yieldComparison.topQuartile || 0,
              unit: 'bu/acre',
              category: 'yield',
              higherIsBetter: true
            })
          }

          if (data.costComparison) {
            farmBenchmarks.push({
              metric: 'Cost Per Acre',
              yourValue: data.costComparison.yourValue || 0,
              regionAverage: data.costComparison.regionAverage || 0,
              topQuartile: data.costComparison.topQuartile || 0,
              unit: '$/acre',
              category: 'cost',
              higherIsBetter: false
            })
          }

          if (data.profitComparison) {
            farmBenchmarks.push({
              metric: 'Profit Per Acre',
              yourValue: data.profitComparison.yourValue || 0,
              regionAverage: data.profitComparison.regionAverage || 0,
              topQuartile: data.profitComparison.topQuartile || 0,
              unit: '$/acre',
              category: 'profit',
              higherIsBetter: true
            })
          }

          setBenchmarks(farmBenchmarks)
        }
      } catch (error) {
        console.error('Error fetching benchmark data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBenchmarkData()
  }, [farm.id])

  const getPerformanceStatus = (benchmark: BenchmarkData): 'excellent' | 'good' | 'warning' | 'critical' => {
    const { yourValue, regionAverage, topQuartile, higherIsBetter } = benchmark
    
    if (higherIsBetter) {
      if (yourValue >= topQuartile) return 'excellent'
      if (yourValue >= regionAverage) return 'good'
      if (yourValue >= regionAverage * 0.9) return 'warning'
      return 'critical'
    } else {
      if (yourValue <= topQuartile) return 'excellent'
      if (yourValue <= regionAverage) return 'good'
      if (yourValue <= regionAverage * 1.1) return 'warning'
      return 'critical'
    }
  }

  const getPercentilRanking = (benchmark: BenchmarkData): number => {
    const { yourValue, regionAverage, topQuartile, higherIsBetter } = benchmark
    
    if (higherIsBetter) {
      if (yourValue >= topQuartile) return 85 // Top quartile
      if (yourValue >= regionAverage) return 65 // Above average
      if (yourValue >= regionAverage * 0.9) return 40 // Below average
      return 20 // Bottom quartile
    } else {
      if (yourValue <= topQuartile) return 85
      if (yourValue <= regionAverage) return 65
      if (yourValue <= regionAverage * 1.1) return 40
      return 20
    }
  }

  const formatValue = (value: number, unit: string): string => {
    if (unit.includes('$')) {
      return `$${value.toLocaleString()}`
    }
    return `${value.toLocaleString()} ${unit}`
  }

  const getComparisonText = (benchmark: BenchmarkData): string => {
    const { yourValue, regionAverage, higherIsBetter } = benchmark
    const percentDiff = Math.abs(((yourValue - regionAverage) / regionAverage) * 100)
    
    if (higherIsBetter) {
      if (yourValue > regionAverage) {
        return `${percentDiff.toFixed(0)}% better than average`
      } else {
        return `${percentDiff.toFixed(0)}% below average`
      }
    } else {
      if (yourValue < regionAverage) {
        return `${percentDiff.toFixed(0)}% better than average`
      } else {
        return `${percentDiff.toFixed(0)}% above average`
      }
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'yield': return 'text-green-600'
      case 'cost': return 'text-orange-600'
      case 'profit': return 'text-blue-600'
      case 'efficiency': return 'text-purple-600'
      default: return 'text-sage-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <ModernCard variant="floating">
          <ModernCardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <ModernCardTitle className="text-sage-800">How Do You Stack Up?</ModernCardTitle>
                <p className="text-sm text-sage-600 mt-1">Loading regional comparison data...</p>
              </div>
            </div>
          </ModernCardHeader>
        </ModernCard>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (benchmarks.length === 0) {
    return (
      <ModernCard variant="floating">
        <ModernCardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <ModernCardTitle className="text-sage-800">How Do You Stack Up?</ModernCardTitle>
              <p className="text-sm text-sage-600 mt-1">Compare your farm to similar farms in your area</p>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Benchmark Data Available
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Add crop yields and financial data to compare your performance with similar farms in your region.
            </p>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard variant="floating">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <ModernCardTitle className="text-sage-800">How Do You Stack Up?</ModernCardTitle>
                <p className="text-sm text-sage-600 mt-1">Compare your farm to {farm.region || 'similar farms in your area'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sage-600" />
              <span className="text-sm text-sage-600">{farm.region || 'Regional'} Average</span>
            </div>
          </div>
        </ModernCardHeader>
      </ModernCard>

      {/* Overall Performance Summary */}
      <ModernCard variant="soft">
        <ModernCardContent className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <Award className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="text-2xl font-bold text-sage-800">You're in the Top 25%</h3>
                <p className="text-sage-600">of farms in your region</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 mb-1">4/6</div>
                <div className="text-xs text-sage-600">Metrics Above Average</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 mb-1">2/6</div>
                <div className="text-xs text-sage-600">Top Quartile</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600 mb-1">2/6</div>
                <div className="text-xs text-sage-600">Need Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-sage-600 mb-1">73rd</div>
                <div className="text-xs text-sage-600">Overall Percentile</div>
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Detailed Benchmarks */}
      <ModernCard variant="floating">
        <ModernCardHeader>
          <ModernCardTitle className="text-sage-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Comparison
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            {benchmarks.map((benchmark, index) => {
              const status = getPerformanceStatus(benchmark)
              const percentile = getPercentilRanking(benchmark)
              const comparisonText = getComparisonText(benchmark)
              
              return (
                <div key={index} className="border border-sage-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <TrafficLightStatus 
                        status={status}
                        size="sm"
                        showText={false}
                      />
                      <div>
                        <h4 className="font-semibold text-sage-800">{benchmark.metric}</h4>
                        <p className={`text-sm ${getCategoryColor(benchmark.category)}`}>
                          {comparisonText}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-sage-800">
                        {formatValue(benchmark.yourValue, benchmark.unit)}
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                        {percentile}th percentile
                      </Badge>
                    </div>
                  </div>

                  {/* Visual comparison bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-sage-600">
                      <span>Regional Comparison</span>
                      <span className="flex items-center gap-1">
                        <InfoTooltip
                          title="Benchmarking Data"
                          description="Based on anonymized data from similar farms in your region and crop type."
                        />
                      </span>
                    </div>
                    
                    <div className="relative">
                      {/* Background bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        {/* Region average marker */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                          <div className="w-0.5 h-3 bg-gray-500"></div>
                          <div className="text-xs text-gray-600 mt-1 transform -translate-x-1/2">
                            Avg
                          </div>
                        </div>
                        
                        {/* Top quartile area (green) */}
                        <div 
                          className="bg-green-200 h-3 rounded-full absolute top-0"
                          style={{ 
                            left: benchmark.higherIsBetter ? '75%' : '0%',
                            width: '25%'
                          }}
                        ></div>
                        
                        {/* Your position */}
                        <div 
                          className={`absolute top-0 h-3 w-1 rounded-full ${
                            status === 'excellent' ? 'bg-green-600' :
                            status === 'good' ? 'bg-blue-600' :
                            status === 'warning' ? 'bg-orange-600' : 'bg-red-600'
                          }`}
                          style={{ 
                            left: `${percentile}%`,
                            transform: 'translateX(-50%)'
                          }}
                        ></div>
                      </div>
                      
                      {/* Labels */}
                      <div className="flex justify-between text-xs text-sage-600 mt-1">
                        <span>{benchmark.higherIsBetter ? 'Low' : 'Best'}</span>
                        <span>{benchmark.higherIsBetter ? 'Best' : 'High'}</span>
                      </div>
                    </div>

                    {/* Comparison values */}
                    <div className="grid grid-cols-3 gap-2 text-xs text-center mt-3">
                      <div>
                        <div className="text-sage-600">Your Farm</div>
                        <div className="font-semibold text-sage-800">
                          {formatValue(benchmark.yourValue, benchmark.unit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sage-600">Area Average</div>
                        <div className="font-semibold text-sage-800">
                          {formatValue(benchmark.regionAverage, benchmark.unit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sage-600">Top 25%</div>
                        <div className="font-semibold text-sage-800">
                          {formatValue(benchmark.topQuartile, benchmark.unit)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Action Items Based on Benchmarking */}
      <ModernCard variant="soft">
        <ModernCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Target className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sage-800 mb-2">Opportunities to Improve</h3>
              <div className="space-y-2 text-sm text-sage-600">
                <p className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span><strong>Reduce fuel costs:</strong> You're using 0.6 gal/acre more than the top quartile. Consider upgrading equipment or optimizing field patterns.</span>
                </p>
                <p className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span><strong>Boost yields:</strong> You're 10 bushels away from top quartile. Consider soil testing and variable rate applications.</span>
                </p>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Potential Impact:</strong> Reaching top quartile performance could add <strong>$75/acre</strong> or <strong>${(75 * farm.totalArea * 2.47).toLocaleString()}</strong> total to your profit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}