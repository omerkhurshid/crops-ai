'use client'
import { useState, useEffect } from 'react'
import { useUserPreferences } from '../../contexts/user-preferences-context'
import { formatCurrency, formatArea } from '../../lib/user-preferences'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../ui/modern-card'
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
  const { preferences } = useUserPreferences()
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
  // Currency formatting now uses user preferences
  const formatCurrencyAmount = (amount: number) => {
    return formatCurrency(amount, preferences)
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
        <MetricCard
          title="Net Profit"
          value={formatCurrencyAmount(summary.netProfit)}
          change={summary.profitChange}
          trend={summary.profitChange >= 0 ? 'up' : 'down'}
          icon={<DollarSign className="h-6 w-6" />}
          description="vs. previous period"
          variant="glass"
        />
        {/* Total Revenue */}
        <MetricCard
          title="Total Revenue"
          value={formatCurrencyAmount(summary.totalIncome)}
          icon={<TrendingUp className="h-6 w-6" />}
          description={`${formatCurrencyAmount(summary.totalExpenses)} expenses`}
          variant="floating"
        />
        {/* Profit per Hectare */}
        <MetricCard
          title={`Profit per ${preferences.landUnit === 'hectares' ? 'ha' : preferences.landUnit === 'acres' ? 'acre' : 'm²'}`}
          value={formatCurrencyAmount(summary.profitPerArea)}
          icon={<Building2 className="h-6 w-6" />}
          description={`Across ${formatArea(summary.totalArea, preferences)}`}
          variant="glow"
        />
        {/* Transactions */}
        <MetricCard
          title="Transactions"
          value={summary.transactionCount.toString()}
          icon={<Activity className="h-6 w-6" />}
          description="this period"
          variant="soft"
        />
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
      {/* Monthly Trends Chart */}
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