'use client'
import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, MetricCard } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { InfoTooltip } from '../ui/info-tooltip'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock
} from 'lucide-react'
interface Farm {
  id: string
  name: string
  totalArea: number
}
interface CashFlowProjection {
  period: '30_days' | '60_days'
  expectedIncome: number
  expectedExpenses: number
  netCashFlow: number
  startingBalance: number
  endingBalance: number
  keyEvents: {
    date: string
    type: 'income' | 'expense'
    description: string
    amount: number
  }[]
}
interface SimpleCashFlowForecastProps {
  farm: Farm
}
export function SimpleCashFlowForecast({ farm }: SimpleCashFlowForecastProps) {
  const [forecasts, setForecasts] = useState<{
    thirtyDay: CashFlowProjection | null
    sixtyDay: CashFlowProjection | null
  }>({
    thirtyDay: null,
    sixtyDay: null
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'30_days' | '60_days'>('30_days')
  useEffect(() => {
    fetchCashFlowForecasts()
  }, [farm.id])
  const fetchCashFlowForecasts = async () => {
    try {
      setLoading(true)
      // Fetch real cashflow forecast from API
      const response = await fetch(`/api/financial/cashflow-forecast?farmId=${farm.id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setForecasts({
            thirtyDay: result.data.thirtyDay || null,
            sixtyDay: result.data.sixtyDay || null
          })
          return
        }
      }
      // No data available
      setForecasts({
        thirtyDay: null,
        sixtyDay: null
      })
    } catch (error) {
      console.error('Error fetching cashflow forecasts:', error)
    } finally {
      setLoading(false)
    }
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }
  const currentForecast = selectedPeriod === '30_days' ? forecasts.thirtyDay : forecasts.sixtyDay
  if (!currentForecast) return null
  const isPositiveCashFlow = currentForecast.netCashFlow > 0
  const cashFlowHealthy = currentForecast.endingBalance > 10000 // $10k minimum threshold
  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <ModernCard variant="floating">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <ModernCardTitle className="text-sage-800">Cash Flow Forecast</ModernCardTitle>
                <p className="text-sm text-sage-600 mt-1">Projected income and expenses for your farm</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod('30_days')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === '30_days' 
                    ? 'bg-sage-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Next 30 Days
              </button>
              <button
                onClick={() => setSelectedPeriod('60_days')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === '60_days' 
                    ? 'bg-sage-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Next 60 Days
              </button>
            </div>
          </div>
        </ModernCardHeader>
      </ModernCard>
      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Expected Income */}
        <MetricCard
          title="Expected Income"
          value={formatCurrency(currentForecast.expectedIncome)}
          description={`Next ${selectedPeriod === '30_days' ? '30' : '60'} days`}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="glass"
          tooltip={{
            title: "Expected Income",
            description: `Money you expect to receive in the next ${selectedPeriod === '30_days' ? '30' : '60'} days from crop sales, insurance, etc.`
          }}
        />
        {/* Expected Expenses */}
        <MetricCard
          title="Expected Expenses"
          value={formatCurrency(currentForecast.expectedExpenses)}
          description={`Next ${selectedPeriod === '30_days' ? '30' : '60'} days`}
          icon={<TrendingDown className="h-6 w-6" />}
          variant="glow"
          tooltip={{
            title: "Expected Expenses",
            description: "Money you'll need to pay out for fertilizer, fuel, labor, equipment, and other costs."
          }}
        />
        {/* Net Cash Flow */}
        <MetricCard
          title="Net Cash Flow"
          value={formatCurrency(currentForecast.netCashFlow)}
          description={`Next ${selectedPeriod === '30_days' ? '30' : '60'} days`}
          icon={<DollarSign className="h-6 w-6" />}
          variant={isPositiveCashFlow ? 'glass' : 'glow'}
          trend={isPositiveCashFlow ? 'up' : 'down'}
          tooltip={{
            title: "Net Cash Flow",
            description: "Income minus expenses. Positive means more money coming in than going out."
          }}
        />
      </div>
      {/* Balance Projection */}
      <ModernCard variant="soft">
        <ModernCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-sage-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-sage-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sage-800 mb-3">Account Balance Projection</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-sage-600 mb-1">Starting Balance</p>
                  <p className="text-xl font-bold text-sage-800">{formatCurrency(currentForecast.startingBalance)}</p>
                </div>
                <div>
                  <p className="text-sage-600 mb-1">Net Change</p>
                  <p className={`text-xl font-bold ${isPositiveCashFlow ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositiveCashFlow ? '+' : ''}{formatCurrency(currentForecast.netCashFlow)}
                  </p>
                </div>
                <div>
                  <p className="text-sage-600 mb-1">Projected Balance</p>
                  <p className={`text-xl font-bold ${cashFlowHealthy ? 'text-sage-800' : 'text-red-600'}`}>
                    {formatCurrency(currentForecast.endingBalance)}
                  </p>
                </div>
              </div>
              {!cashFlowHealthy && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Low Cash Warning</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Your projected balance may be too low. Consider delaying non-essential expenses or securing additional financing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Key Upcoming Events */}
      <ModernCard variant="floating">
        <ModernCardHeader>
          <ModernCardTitle className="text-sage-800 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Key Financial Events
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-3">
            {currentForecast.keyEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    event.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {event.type === 'income' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sage-800">{event.description}</p>
                    <p className="text-sm text-sage-600">{event.date}</p>
                  </div>
                </div>
                <div className={`font-bold ${event.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {event.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(event.amount))}
                </div>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}