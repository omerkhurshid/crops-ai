'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { InlineFloatingButton } from '../ui/floating-button'
import { TransactionModal } from './transaction-modal'
import { ProfitCalculator } from './profit-calculator'
import { ColorfulFarmTable } from './colorful-farm-table'
import { ColoredTransactionList } from './colored-transaction-list'
import { FarmFinancialDetail } from './farm-financial-detail'
import { 
  DollarSign, TrendingUp, TrendingDown, MapPin, BarChart3, 
  Plus, Calendar, Users, Activity, ArrowRight, Building2 
} from 'lucide-react'

interface UserFinancialSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalFarms: number
  totalArea: number
  profitPerArea: number
  transactionCount: number
  profitChange: number
}

interface FarmBreakdown {
  id: string
  name: string
  totalArea: number
  address?: string
  location?: string
  income: number
  expenses: number
  netProfit: number
  profitMargin: number
  profitPerArea: number
  transactionCount: number
}

interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  profit: number
}

interface CategoryBreakdown {
  income: Array<{ category: string; amount: number; count: number }>
  expenses: Array<{ category: string; amount: number; count: number }>
}

interface UserFinancialDashboardProps {
  onFarmSelect: (farmId: string) => void
  onAddTransaction: () => void
}

export function UserFinancialDashboard({ onFarmSelect, onAddTransaction }: UserFinancialDashboardProps) {
  const [summary, setSummary] = useState<UserFinancialSummary | null>(null)
  const [farmBreakdown, setFarmBreakdown] = useState<FarmBreakdown[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(),
  })

  const fetchUserSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/financial/user-summary?startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
        setFarmBreakdown(data.farmBreakdown || [])
        setMonthlyTrends(data.monthlyTrends || [])
        setCategoryBreakdown(data.categoryBreakdown || { income: [], expenses: [] })
      }
    } catch (error) {
      console.error('Error fetching user financial summary:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserSummary()
  }, [dateRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-sage-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-sage-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600">No financial data available</p>
      </div>
    )
  }

  // Show farm detail view if a farm is selected
  if (selectedFarmId) {
    return (
      <FarmFinancialDetail 
        farmId={selectedFarmId}
        onBack={() => setSelectedFarmId(null)}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Add Transaction */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-sage-800 mb-2">Portfolio Overview</h2>
          <p className="text-sage-600">Financial summary across all your farms</p>
        </div>
        <InlineFloatingButton
          icon={<Plus className="h-4 w-4" />}
          label="Add Transaction"
          variant="primary"
          onClick={onAddTransaction}
        />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Profit */}
        <div className="polished-card card-sage rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-white" />
            <Badge className={`${summary.profitChange >= 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {formatPercentage(summary.profitChange)}
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-2">{formatCurrency(summary.netProfit)}</div>
          <div className="text-lg font-medium mb-2">Net Profit</div>
          <div className="text-sm opacity-90 flex items-center gap-1">
            {summary.profitChange >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            vs. previous period
          </div>
        </div>

        {/* Total Revenue */}
        <div className="polished-card card-forest rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
            <Badge className="bg-white/20 text-white border-white/30">
              {summary.profitMargin.toFixed(1)}% margin
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-2">{formatCurrency(summary.totalIncome)}</div>
          <div className="text-lg font-medium mb-2">Total Revenue</div>
          <div className="text-sm opacity-90">
            {formatCurrency(summary.totalExpenses)} expenses
          </div>
        </div>

        {/* Profit per Hectare */}
        <div className="polished-card card-earth rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="h-8 w-8 text-white" />
            <Badge className="bg-white/20 text-white border-white/30">
              {summary.totalFarms} farms
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-2">{formatCurrency(summary.profitPerArea)}</div>
          <div className="text-lg font-medium mb-2">Profit per ha</div>
          <div className="text-sm opacity-90">
            Across {summary.totalArea.toFixed(1)} hectares
          </div>
        </div>

        {/* Transactions */}
        <div className="polished-card card-golden rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold mb-2">{summary.transactionCount}</div>
          <div className="text-lg font-medium mb-2">Transactions</div>
          <div className="text-sm opacity-90">
            This period
          </div>
        </div>
      </div>

      {/* Main Content Grid with Transaction List on RHS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Farm Table (2/3 width) */}
        <div className="lg:col-span-2">
          <ColorfulFarmTable 
            farms={farmBreakdown}
            onFarmSelect={setSelectedFarmId}
          />
        </div>
        
        {/* Right Column - Transaction List (1/3 width) */}
        <div className="lg:col-span-1">
          <ColoredTransactionList 
            farmId={farmBreakdown[0]?.id}
            limit={15}
            onAddTransaction={onAddTransaction}
          />
        </div>
      </div>

      {/* Monthly Trends Chart - Placeholder */}
      {monthlyTrends.length > 0 && (
        <ModernCard variant="floating">
          <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
            <ModernCardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sage-600" />
              Monthly Trends
            </ModernCardTitle>
            <ModernCardDescription>
              Revenue, expenses, and profit over time
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent className="p-6">
            <div className="h-64 flex items-center justify-center bg-sage-50 rounded-lg">
              <p className="text-sage-600">Chart visualization coming soon</p>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Profit Calculator */}
      <ProfitCalculator farmId={farmBreakdown[0]?.id} />
    </div>
  )
}