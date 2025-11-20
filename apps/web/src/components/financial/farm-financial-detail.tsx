'use client'
import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { TransactionModal } from './transaction-modal'
import { 
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, 
  MapPin, Calendar, Plus, Filter, FileText, Activity
} from 'lucide-react'
import { cn } from '../../lib/utils'
interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  subcategory?: string
  amount: number
  transactionDate: string
  paymentDate?: string
  notes?: string
  field?: {
    id: string
    name: string
  }
  crop?: {
    id: string
    cropType: string
  }
}
interface FarmFinancialData {
  id: string
  name: string
  totalArea: number
  income: number
  expenses: number
  netProfit: number
  profitMargin: number
  profitPerArea: number
  transactionCount: number
  transactions: Transaction[]
  monthlyData: Array<{
    month: string
    income: number
    expenses: number
    profit: number
  }>
}
interface FarmFinancialDetailProps {
  farmId: string
  onBack: () => void
}
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // Income categories
  CROP_SALES: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  LIVESTOCK_SALES: { bg: 'bg-[#F8FAF8]', text: 'text-green-800', border: 'border-green-300' },
  SUBSIDIES: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  LEASE_INCOME: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  OTHER_INCOME: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  // Expense categories
  SEEDS: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  FERTILIZER: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  PESTICIDES: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  LABOR: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  MACHINERY: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  FUEL: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  IRRIGATION: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  STORAGE: { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
  INSURANCE: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  OTHER_EXPENSE: { bg: 'bg-[#F5F5F5]', text: 'text-[#1A1A1A]', border: 'border-[#E6E6E6]' },
}
export function FarmFinancialDetail({ farmId, onBack }: FarmFinancialDetailProps) {
  const [farmData, setFarmData] = useState<FarmFinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  useEffect(() => {
    fetchFarmData()
  }, [farmId])
  const fetchFarmData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/financial/farm-detail/${farmId}`)
      if (response.ok) {
        const data = await response.json()
        setFarmData(data)
      } else {
        setFarmData(null)
      }
    } catch (error) {
      console.error('Error fetching farm financial data:', error)
      setFarmData(null)
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  const handleAddTransaction = (type: 'INCOME' | 'EXPENSE') => {
    setTransactionType(type)
    setShowTransactionModal(true)
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7A8F78]"></div>
      </div>
    )
  }
  if (!farmData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">Financial Data Unavailable</h3>
        <p className="text-[#555555] mb-4">No financial transactions found for this farm.</p>
        <Button onClick={() => handleAddTransaction('INCOME')} className="mr-2">
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
        <Button onClick={() => handleAddTransaction('EXPENSE')} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>
    )
  }
  const filteredTransactions = farmData.transactions.filter(t => {
    if (filter === 'all') return true
    if (filter === 'income') return t.type === 'INCOME'
    if (filter === 'expense') return t.type === 'EXPENSE'
    return true
  })
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-[#1A1A1A]">{farmData.name}</h2>
            <p className="text-[#555555]">{farmData.totalArea.toFixed(1)} hectares</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleAddTransaction('EXPENSE')}>
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
          <Button onClick={() => handleAddTransaction('INCOME')}>
            <Plus className="h-4 w-4 mr-1" />
            Add Income
          </Button>
        </div>
      </div>
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard>
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#555555]">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(farmData.income)}
                </p>
              </div>
              <div className="p-3 bg-[#F8FAF8] rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        <ModernCard>
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#555555]">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(farmData.expenses)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        <ModernCard>
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#555555]">Net Profit</p>
                <p className={cn(
                  "text-2xl font-bold",
                  farmData.netProfit >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(farmData.netProfit)}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                farmData.netProfit >= 0 ? "bg-[#F8FAF8]" : "bg-red-100"
              )}>
                <DollarSign className={cn(
                  "h-6 w-6",
                  farmData.netProfit >= 0 ? "text-green-600" : "text-red-600"
                )} />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        <ModernCard>
          <ModernCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#555555]">Profit Margin</p>
                <p className="text-2xl font-bold text-blue-600">
                  {farmData.profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
      {/* Monthly Trend Chart */}
      <ModernCard>
        <ModernCardHeader>
          <ModernCardTitle>Monthly Financial Trend</ModernCardTitle>
          <ModernCardDescription>Income, expenses, and profit over the year</ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {farmData.monthlyData.map((month) => {
              const maxValue = Math.max(...farmData.monthlyData.map(m => Math.max(m.income, m.expenses)))
              const incomeHeight = (month.income / maxValue) * 100
              const expenseHeight = (month.expenses / maxValue) * 100
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full h-48 flex items-end gap-1">
                    <div className="flex-1 bg-[#8FBF7F] rounded-t transition-all hover:bg-[#7A8F78]"
                         style={{ height: `${incomeHeight}%` }}
                         title={`Income: ${formatCurrency(month.income)}`}
                    />
                    <div className="flex-1 bg-red-500 rounded-t transition-all hover:bg-red-600"
                         style={{ height: `${expenseHeight}%` }}
                         title={`Expenses: ${formatCurrency(month.expenses)}`}
                    />
                  </div>
                  <span className="text-xs text-[#555555]">{month.month}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8FBF7F] rounded"></div>
              <span className="text-sm text-[#555555]">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-[#555555]">Expenses</span>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Recent Transactions */}
      <ModernCard>
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <ModernCardTitle>Recent Transactions</ModernCardTitle>
              <ModernCardDescription>{farmData.transactionCount} total transactions</ModernCardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter(filter === 'all' ? 'income' : filter === 'income' ? 'expense' : 'all')}
              >
                <Filter className="h-4 w-4 mr-1" />
                {filter === 'all' ? 'All' : filter === 'income' ? 'Income' : 'Expense'}
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="p-6 space-y-3">
              {filteredTransactions.map((transaction) => {
                const categoryStyle = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS.OTHER_EXPENSE
                return (
                  <div
                    key={transaction.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all hover:shadow-sm",
                      transaction.type === 'INCOME' 
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-[#DDE4D8]" 
                        : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs font-medium border",
                              categoryStyle.bg,
                              categoryStyle.text,
                              categoryStyle.border
                            )}
                          >
                            {transaction.category.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-[#555555]">
                            {formatDate(transaction.transactionDate)}
                          </span>
                        </div>
                        {transaction.notes && (
                          <p className="text-sm text-[#555555]">
                            {transaction.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#555555]">
                          {transaction.field && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {transaction.field.name}
                            </span>
                          )}
                          {transaction.crop && (
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {transaction.crop.cropType}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={cn(
                        "text-lg font-bold",
                        transaction.type === 'INCOME' ? "text-green-700" : "text-red-700"
                      )}>
                        {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </ModernCardContent>
      </ModernCard>
      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          type={transactionType}
          farmId={farmId}
          onClose={() => setShowTransactionModal(false)}
          onSuccess={() => {
            setShowTransactionModal(false)
            fetchFarmData()
          }}
        />
      )}
    </div>
  )
}