'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  DollarSign, TrendingUp, TrendingDown, BarChart3, 
  Calendar, AlertCircle, Target, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react'
interface MarketDashboardProps {
  cropTypes?: string[]
}
interface CommodityPrice {
  crop: string
  currentPrice: number
  previousPrice: number
  change: number
  changePercent: number
  unit: string
  exchange: string
  lastUpdated: string
  trend: 'up' | 'down' | 'stable'
  weekHigh: number
  weekLow: number
  volume: number
}
interface MarketInsight {
  id: string
  type: 'opportunity' | 'warning' | 'trend'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  timeframe: string
  recommendation: string
}
// Removed mock data - fetch real prices from API
export function MarketDashboard({ cropTypes = [] }: MarketDashboardProps) {
  const [prices, setPrices] = useState<CommodityPrice[]>([])
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchMarketData()
  }, [cropTypes])
  const fetchMarketData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/market/live-prices')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setPrices(data.data.prices || [])
          setInsights(data.data.insights || [])
        } else {
          setPrices([])
          setInsights([])
        }
      } else {
        setPrices([])
        setInsights([])
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error)
      setPrices([])
      setInsights([])
    } finally {
      setLoading(false)
    }
  }
  const refreshPrices = async () => {
    await fetchMarketData()
  }
  const getPriceColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-[#8FBF7F]'
    if (changePercent < 0) return 'text-red-600'
    return 'text-[#555555]'
  }
  const getBadgeColor = (changePercent: number) => {
    if (changePercent > 0) return 'bg-[#F8FAF8] text-[#7A8F78]'
    if (changePercent < 0) return 'bg-red-100 text-red-800'
    return 'bg-[#F5F5F5] text-gray-900'
  }
  const getInsightColor = (type: string, impact: string) => {
    if (type === 'opportunity') return 'border-l-4 border-l-green-500 bg-[#F8FAF8]'
    if (type === 'warning') return 'border-l-4 border-l-red-500 bg-red-50'
    return 'border-l-4 border-l-blue-500 bg-blue-50'
  }
  const getInsightIcon = (type: string) => {
    if (type === 'opportunity') return <TrendingUp className="h-5 w-5 text-[#8FBF7F]" />
    if (type === 'warning') return <AlertCircle className="h-5 w-5 text-red-600" />
    return <BarChart3 className="h-5 w-5 text-[#7A8F78]" />
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Market Intelligence</h3>
          <p className="text-sm text-[#555555]">Live commodity prices and market insights</p>
        </div>
        <Button onClick={refreshPrices} disabled={loading} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Updating...' : 'Refresh'}
        </Button>
      </div>
      {/* Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {prices.map((price) => (
          <Card key={price.crop} className="border-2 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{price.crop}</CardTitle>
                <Badge className={`${getBadgeColor(price.changePercent)} text-xs`}>
                  {price.changePercent > 0 ? '+' : ''}{price.changePercent.toFixed(2)}%
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {price.exchange} • {new Date(price.lastUpdated).toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    ${price.currentPrice.toFixed(price.unit.includes('lb') ? 4 : 2)}
                  </span>
                  <div className="flex items-center">
                    {price.change > 0 ? (
                      <ArrowUp className="h-4 w-4 text-[#8FBF7F]" />
                    ) : price.change < 0 ? (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span className={`text-sm font-medium ${getPriceColor(price.changePercent)}`}>
                      {price.change > 0 ? '+' : ''}{price.change.toFixed(price.unit.includes('lb') ? 4 : 2)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-[#555555]">
                  <div className="flex justify-between">
                    <span>Week High:</span>
                    <span>${price.weekHigh.toFixed(price.unit.includes('lb') ? 4 : 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Week Low:</span>
                    <span>${price.weekLow.toFixed(price.unit.includes('lb') ? 4 : 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span>{(price.volume / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Market Insights */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Market Insights & Recommendations</CardTitle>
          <CardDescription>
            AI-powered analysis of market conditions and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg ${getInsightColor(insight.type, insight.impact)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {insight.timeframe}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{insight.description}</p>
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4" />
                        <span className="font-medium text-sm">Recommendation</span>
                      </div>
                      <p className="text-sm">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Quick Actions */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Marketing Tools</CardTitle>
          <CardDescription>
            Take action based on current market conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-start text-left">
              <DollarSign className="h-6 w-6 mb-2" />
              <span className="font-medium">Price Alerts</span>
              <span className="text-sm text-[#555555] mt-1">
                Set up notifications for target prices
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start text-left">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="font-medium">Market Analysis</span>
              <span className="text-sm text-[#555555] mt-1">
                Detailed charts and historical data
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start text-left">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="font-medium">Contract Opportunities</span>
              <span className="text-sm text-[#555555] mt-1">
                Find forward contract options
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}