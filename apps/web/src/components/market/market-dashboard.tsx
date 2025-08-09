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

const mockPrices: CommodityPrice[] = [
  {
    crop: 'Wheat',
    currentPrice: 7.85,
    previousPrice: 7.67,
    change: 0.18,
    changePercent: 2.35,
    unit: '$/bushel',
    exchange: 'CBOT',
    lastUpdated: new Date().toISOString(),
    trend: 'up',
    weekHigh: 8.12,
    weekLow: 7.43,
    volume: 45200
  },
  {
    crop: 'Corn',
    currentPrice: 6.42,
    previousPrice: 6.47,
    change: -0.05,
    changePercent: -0.77,
    unit: '$/bushel',
    exchange: 'CBOT',
    lastUpdated: new Date().toISOString(),
    trend: 'down',
    weekHigh: 6.58,
    weekLow: 6.35,
    volume: 67800
  },
  {
    crop: 'Soybeans',
    currentPrice: 14.23,
    previousPrice: 14.08,
    change: 0.15,
    changePercent: 1.07,
    unit: '$/bushel',
    exchange: 'CBOT',
    lastUpdated: new Date().toISOString(),
    trend: 'up',
    weekHigh: 14.45,
    weekLow: 13.92,
    volume: 32100
  },
  {
    crop: 'Cotton',
    currentPrice: 0.7145,
    previousPrice: 0.7089,
    change: 0.0056,
    changePercent: 0.79,
    unit: '$/lb',
    exchange: 'ICE',
    lastUpdated: new Date().toISOString(),
    trend: 'up',
    weekHigh: 0.7234,
    weekLow: 0.7045,
    volume: 18900
  }
]

const mockInsights: MarketInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Wheat Prices Trending Upward',
    description: 'Strong demand from international markets pushing wheat futures higher. Consider forward contracting.',
    impact: 'high',
    timeframe: 'Next 30 days',
    recommendation: 'Consider selling 40-60% of projected wheat harvest at current levels'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Corn Market Volatility',
    description: 'Weather concerns in key growing regions creating price uncertainty. Monitor closely.',
    impact: 'medium',
    timeframe: 'Next 2 weeks',
    recommendation: 'Hold existing positions, avoid new commitments until weather patterns stabilize'
  },
  {
    id: '3',
    type: 'trend',
    title: 'Soybean Processing Demand Strong',
    description: 'Crush margins remain favorable, supporting soybean prices through summer months.',
    impact: 'medium',
    timeframe: 'Next 60 days',
    recommendation: 'Good opportunity for basis contracting with local elevators'
  }
]

export function MarketDashboard({ cropTypes = [] }: MarketDashboardProps) {
  const [prices, setPrices] = useState<CommodityPrice[]>(mockPrices)
  const [insights, setInsights] = useState<MarketInsight[]>(mockInsights)
  const [loading, setLoading] = useState(false)

  const refreshPrices = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      // Add small random variations to simulate live prices
      const updatedPrices = prices.map(price => {
        const variation = (Math.random() - 0.5) * 0.1
        const newPrice = Math.max(0, price.currentPrice + variation)
        const change = newPrice - price.previousPrice
        return {
          ...price,
          currentPrice: newPrice,
          change,
          changePercent: (change / price.previousPrice) * 100,
          trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'stable' as const,
          lastUpdated: new Date().toISOString()
        }
      })
      setPrices(updatedPrices)
      setLoading(false)
    }, 1500)
  }

  const getPriceColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-green-600'
    if (changePercent < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getBadgeColor = (changePercent: number) => {
    if (changePercent > 0) return 'bg-green-100 text-green-800'
    if (changePercent < 0) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getInsightColor = (type: string, impact: string) => {
    if (type === 'opportunity') return 'border-l-4 border-l-green-500 bg-green-50'
    if (type === 'warning') return 'border-l-4 border-l-red-500 bg-red-50'
    return 'border-l-4 border-l-blue-500 bg-blue-50'
  }

  const getInsightIcon = (type: string) => {
    if (type === 'opportunity') return <TrendingUp className="h-5 w-5 text-green-600" />
    if (type === 'warning') return <AlertCircle className="h-5 w-5 text-red-600" />
    return <BarChart3 className="h-5 w-5 text-blue-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Market Intelligence</h3>
          <p className="text-sm text-gray-600">Live commodity prices and market insights</p>
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
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : price.change < 0 ? (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span className={`text-sm font-medium ${getPriceColor(price.changePercent)}`}>
                      {price.change > 0 ? '+' : ''}{price.change.toFixed(price.unit.includes('lb') ? 4 : 2)}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
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
              <span className="text-sm text-gray-600 mt-1">
                Set up notifications for target prices
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start text-left">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="font-medium">Market Analysis</span>
              <span className="text-sm text-gray-600 mt-1">
                Detailed charts and historical data
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start text-left">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="font-medium">Contract Opportunities</span>
              <span className="text-sm text-gray-600 mt-1">
                Find forward contract options
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}