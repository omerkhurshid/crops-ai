'use client'
import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, MetricCard } from '../ui/modern-card'
import { TrafficLightStatus } from '../ui/traffic-light-status'
import { InfoTooltip } from '../ui/info-tooltip'
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Calculator,
  Banknote,
  PiggyBank,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
interface Farm {
  id: string
  name: string
  totalArea: number
}
interface SimplifiedMetrics {
  profitPerAcre: number
  revenuePerAcre: number
  costPerAcre: number
  breakEvenPrice: number
  currentMarketPrice: number
  profitMargin: number
  isAboveBreakeven: boolean
  totalProfit: number
  totalRevenue: number
  totalCosts: number
}
interface SimplifiedFinancialMetricsProps {
  farm: Farm
}
export function SimplifiedFinancialMetrics({ farm }: SimplifiedFinancialMetricsProps) {
  const [metrics, setMetrics] = useState<SimplifiedMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchSimplifiedMetrics()
  }, [farm.id])
  const fetchSimplifiedMetrics = async () => {
    try {
      setLoading(true)
      // Fetch real financial data from API
      const response = await fetch(`/api/financial/metrics?farmId=${farm.id}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      } else {
        // No data available
        setMetrics(null)
      }
    } catch (error) {
      console.error('Error fetching simplified metrics:', error)
      setMetrics(null)
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
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-[#F5F5F5] rounded-lg"></div>
        ))}
      </div>
    )
  }
  const acreage = farm.totalArea * 2.47105
  if (loading) {
    return (
      <div className="space-y-6">
        <ModernCard variant="floating">
          <ModernCardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78] mx-auto"></div>
            <p className="text-[#555555] mt-4">Loading financial data...</p>
          </ModernCardContent>
        </ModernCard>
      </div>
    )
  }
  if (!metrics) {
    return (
      <div className="space-y-6">
        <ModernCard variant="floating">
          <ModernCardContent className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-sage-400" />
            <h3 className="text-lg font-semibold mb-2 text-[#555555]">No financial data available yet</h3>
            <p className="text-[#555555]">Connect your financial records to see your farm's metrics.</p>
          </ModernCardContent>
        </ModernCard>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard variant="floating">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F8FAF8] rounded-lg">
                <Calculator className="h-5 w-5 text-[#8FBF7F]" />
              </div>
              <div>
                <ModernCardTitle className="text-[#1A1A1A]">Farm Financial Health</ModernCardTitle>
                <p className="text-sm text-[#555555] mt-1">Simple metrics that matter to your bottom line</p>
              </div>
            </div>
            {/* Overall Health Status */}
            <TrafficLightStatus 
              status={metrics.isAboveBreakeven && metrics.profitPerAcre > 50 ? 'excellent' : 
                     metrics.isAboveBreakeven ? 'warning' : 'critical'}
              showText={true}
              showIcon={true}
              size="lg"
            />
          </div>
        </ModernCardHeader>
      </ModernCard>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profit Per Acre */}
        <MetricCard
          title="Profit per acre"
          value={formatCurrency(metrics.profitPerAcre)}
          description={`Total: ${formatCurrency(metrics.totalProfit)} (${acreage.toFixed(1)} acres)`}
          icon={<DollarSign className="h-6 w-6" />}
          variant={metrics.profitPerAcre > 0 ? 'glass' : 'glow'}
          tooltip={{
            title: "Profit Per Acre",
            description: "This is how much money you make per acre after all costs. Higher is better!"
          }}
        />
        {/* Break-Even Price */}
        <MetricCard
          title="Break-even price"
          value={formatPrice(metrics.breakEvenPrice)}
          description={`Market: ${formatPrice(metrics.currentMarketPrice)}`}
          icon={<Target className="h-6 w-6" />}
          variant={metrics.isAboveBreakeven ? 'glass' : 'glow'}
          trend={metrics.isAboveBreakeven ? 'up' : 'down'}
          tooltip={{
            title: "Break-Even Price",
            description: "The minimum price you need to sell your crop to cover all costs. Current market price should be above this."
          }}
        />
        {/* Revenue Per Acre */}
        <MetricCard
          title="Revenue per acre"
          value={formatCurrency(metrics.revenuePerAcre)}
          description={`Total: ${formatCurrency(metrics.totalRevenue)}`}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="glow"
          tooltip={{
            title: "Revenue Per Acre",
            description: "Total income generated per acre before costs are subtracted."
          }}
        />
        {/* Cost Per Acre */}
        <MetricCard
          title="Cost per acre"
          value={formatCurrency(metrics.costPerAcre)}
          description={`Total: ${formatCurrency(metrics.totalCosts)}`}
          icon={<Banknote className="h-6 w-6" />}
          variant="soft"
          tooltip={{
            title: "Cost Per Acre",
            description: "All expenses (seeds, fertilizer, fuel, labor) divided by total acres. Lower is better."
          }}
        />
      </div>
      {/* Quick Insights */}
      <ModernCard variant="soft">
        <ModernCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#F8FAF8] rounded-lg">
              <PiggyBank className="h-5 w-5 text-[#555555]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A] mb-2">What This Means for Your Farm</h3>
              <div className="space-y-2 text-sm text-[#555555]">
                {metrics.isAboveBreakeven ? (
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#8FBF7F]" />
                    <span>Good news! Current market prices are above your break-even point.</span>
                  </p>
                ) : (
                  <p className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>Warning: Current market prices are below your break-even point. Consider reducing costs or waiting for better prices.</span>
                  </p>
                )}
                <p>
                  • Your profit margin is <strong>{metrics.profitMargin.toFixed(1)}%</strong>
                  {metrics.profitMargin > 20 ? " - Excellent!" : 
                   metrics.profitMargin > 10 ? " - Good" : 
                   metrics.profitMargin > 0 ? " - Break-even territory" : " - Needs improvement"}
                </p>
                <p>
                  • To increase profitability: Focus on reducing cost per acre or increasing yield per acre
                </p>
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}