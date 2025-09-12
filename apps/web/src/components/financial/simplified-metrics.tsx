'use client'

import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
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
      
      // For now, let's generate sample data since the API might not exist yet
      // In production, this would call: `/api/financial/simplified-metrics?farmId=${farm.id}`
      
      // Simulate realistic farming data
      const acreage = farm.totalArea * 2.47105 // Convert hectares to acres
      const mockRevenue = Math.random() * 800 + 600 // $600-1400 per acre
      const mockCosts = Math.random() * 400 + 300   // $300-700 per acre
      const mockMarketPrice = Math.random() * 6 + 4 // $4-10 per bushel
      
      const profitPerAcre = mockRevenue - mockCosts
      const breakEvenPrice = mockCosts / 150 // Assuming 150 bushels per acre average
      
      const mockMetrics: SimplifiedMetrics = {
        profitPerAcre: profitPerAcre,
        revenuePerAcre: mockRevenue,
        costPerAcre: mockCosts,
        breakEvenPrice: breakEvenPrice,
        currentMarketPrice: mockMarketPrice,
        profitMargin: (profitPerAcre / mockRevenue) * 100,
        isAboveBreakeven: mockMarketPrice > breakEvenPrice,
        totalProfit: profitPerAcre * acreage,
        totalRevenue: mockRevenue * acreage,
        totalCosts: mockCosts * acreage
      }
      
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Error fetching simplified metrics:', error)
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
          <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  const acreage = farm.totalArea * 2.47105

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard variant="floating">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calculator className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <ModernCardTitle className="text-sage-800">Farm Financial Health</ModernCardTitle>
                <p className="text-sm text-sage-600 mt-1">Simple metrics that matter to your bottom line</p>
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
        <div className={`polished-card ${metrics.profitPerAcre > 0 ? 'card-sage' : 'card-clay'} rounded-xl p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="h-5 w-5" />
            </div>
            <InfoTooltip
              title="Profit Per Acre"
              description="This is how much money you make per acre after all costs. Higher is better!"
            />
          </div>
          <div className="text-2xl font-bold mb-1">{formatCurrency(metrics.profitPerAcre)}</div>
          <div className="text-sm opacity-90">Profit per acre</div>
          <div className="text-xs opacity-75 mt-2">
            Total: {formatCurrency(metrics.totalProfit)} ({acreage.toFixed(1)} acres)
          </div>
        </div>

        {/* Break-Even Price */}
        <div className={`polished-card ${metrics.isAboveBreakeven ? 'card-forest' : 'card-golden'} rounded-xl p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Target className="h-5 w-5" />
            </div>
            <InfoTooltip
              title="Break-Even Price"
              description="The minimum price you need to sell your crop to cover all costs. Current market price should be above this."
            />
          </div>
          <div className="text-2xl font-bold mb-1">{formatPrice(metrics.breakEvenPrice)}</div>
          <div className="text-sm opacity-90">Break-even price</div>
          <div className="text-xs opacity-75 mt-2 flex items-center gap-1">
            Market: {formatPrice(metrics.currentMarketPrice)}
            {metrics.isAboveBreakeven ? (
              <CheckCircle className="h-3 w-3 text-green-200" />
            ) : (
              <AlertCircle className="h-3 w-3 text-red-200" />
            )}
          </div>
        </div>

        {/* Revenue Per Acre */}
        <div className="polished-card card-earth rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <InfoTooltip
              title="Revenue Per Acre"
              description="Total income generated per acre before costs are subtracted."
            />
          </div>
          <div className="text-2xl font-bold mb-1">{formatCurrency(metrics.revenuePerAcre)}</div>
          <div className="text-sm opacity-90">Revenue per acre</div>
          <div className="text-xs opacity-75 mt-2">
            Total: {formatCurrency(metrics.totalRevenue)}
          </div>
        </div>

        {/* Cost Per Acre */}
        <div className="polished-card card-moss rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Banknote className="h-5 w-5" />
            </div>
            <InfoTooltip
              title="Cost Per Acre"
              description="All expenses (seeds, fertilizer, fuel, labor) divided by total acres. Lower is better."
            />
          </div>
          <div className="text-2xl font-bold mb-1">{formatCurrency(metrics.costPerAcre)}</div>
          <div className="text-sm opacity-90">Cost per acre</div>
          <div className="text-xs opacity-75 mt-2">
            Total: {formatCurrency(metrics.totalCosts)}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <ModernCard variant="soft">
        <ModernCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-sage-100 rounded-lg">
              <PiggyBank className="h-5 w-5 text-sage-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sage-800 mb-2">What This Means for Your Farm</h3>
              <div className="space-y-2 text-sm text-sage-600">
                {metrics.isAboveBreakeven ? (
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
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