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
  LIVESTOCK_SALES: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
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
  OTHER_EXPENSE: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
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
      // This would normally call the API
      // const response = await fetch(`/api/financial/farm-detail/${farmId}`)
      // For now, using mock data
      setFarmData(getMockFarmData())
    } catch (error) {
      console.error('Error fetching farm financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMockFarmData = (): FarmFinancialData => ({
    id: farmId,
    name: 'Green Valley Farm',
    totalArea: 245.5,
    income: 156000,
    expenses: 89000,
    netProfit: 67000,
    profitMargin: 42.9,
    profitPerArea: 273,
    transactionCount: 28,
    transactions: [
      {
        id: '1',
        type: 'INCOME',
        category: 'CROP_SALES',
        amount: 45000,
        transactionDate: new Date().toISOString(),
        notes: 'Corn harvest - 200 bushels @ $225/bushel',
        field: { id: '1', name: 'North Field' },
        crop: { id: '1', cropType: 'Corn' }
      },
      {
        id: '2',
        type: 'EXPENSE',
        category: 'FERTILIZER',
        amount: 3500,
        transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Spring fertilizer application - 15 tons',
        field: { id: '1', name: 'North Field' }
      },
      {
        id: '3',
        type: 'EXPENSE',
        category: 'SEEDS',
        amount: 2800,
        transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Soybean seeds - premium variety',
        field: { id: '2', name: 'South Field' }
      },
      {
        id: '4',
        type: 'INCOME',
        category: 'SUBSIDIES',
        amount: 12000,
        transactionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Federal crop insurance payment'
      },
      {
        id: '5',
        type: 'EXPENSE',
        category: 'LABOR',
        amount: 4200,
        transactionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Harvest crew wages - 3 days'
      }
    ],
    monthlyData: [
      { month: 'Jan', income: 8000, expenses: 12000, profit: -4000 },
      { month: 'Feb', income: 5000, expenses: 8000, profit: -3000 },
      { month: 'Mar', income: 15000, expenses: 18000, profit: -3000 },
      { month: 'Apr', income: 25000, expenses: 20000, profit: 5000 },
      { month: 'May', income: 35000, expenses: 15000, profit: 20000 },
      { month: 'Jun', income: 68000, expenses: 16000, profit: 52000 }
    ]
  })

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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const filteredTransactions = farmData?.transactions.filter(t => {
    if (filter === 'all') return true
    if (filter === 'income') return t.type === 'INCOME'
    if (filter === 'expense') return t.type === 'EXPENSE'
    return true
  }) || []

  const handleAddTransaction = (type: 'INCOME' | 'EXPENSE') => {
    setTransactionType(type)
    setShowTransactionModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-sage-100 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-sage-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-sage-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!farmData) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600">Farm financial data not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-sage-800">{farmData.name}</h2>
            <p className="text-sage-600 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {farmData.totalArea.toFixed(1)} hectares
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleAddTransaction('INCOME')} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
          <Button onClick={() => handleAddTransaction('EXPENSE')} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="polished-card card-sage rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-white" />
            <Badge className={`${farmData.netProfit >= 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {farmData.profitMargin.toFixed(1)}% margin
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-2">{formatCurrency(farmData.netProfit)}</div>
          <div className="text-lg font-medium mb-2">Net Profit</div>
          <div className="text-sm opacity-90 flex items-center gap-1">
            {farmData.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {formatCurrency(farmData.profitPerArea)} per ha
          </div>
        </div>

        <div className="polished-card card-forest rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold mb-2">{formatCurrency(farmData.income)}</div>
          <div className="text-lg font-medium mb-2">Total Income</div>
          <div className="text-sm opacity-90">
            This year to date
          </div>
        </div>

        <div className="polished-card card-earth rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold mb-2">{formatCurrency(farmData.expenses)}</div>
          <div className="text-lg font-medium mb-2">Total Expenses</div>
          <div className="text-sm opacity-90">
            {farmData.transactionCount} transactions
          </div>
        </div>
      </div>

      {/* P&L Statement */}
      <ModernCard variant="floating">
        <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
          <ModernCardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sage-600" />
            Profit & Loss Statement
          </ModernCardTitle>
          <ModernCardDescription>
            Financial performance breakdown for {farmData.name}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-sage-200">
              <span className="font-medium text-sage-800">Total Income</span>
              <span className="font-bold text-green-600">{formatCurrency(farmData.income)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-sage-200">
              <span className="font-medium text-sage-800">Total Expenses</span>
              <span className="font-bold text-red-600">({formatCurrency(farmData.expenses)})</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-sage-300">
              <span className="font-bold text-lg text-sage-800">Net Profit</span>
              <span className={`font-bold text-lg ${farmData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(farmData.netProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-sage-600">Profit Margin</span>
              <span className="text-sm font-medium">{farmData.profitMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-sage-600">Profit per Hectare</span>
              <span className="text-sm font-medium">{formatCurrency(farmData.profitPerArea)}</span>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Transactions List */}
      <ModernCard variant="floating">
        <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
          <div className="flex items-center justify-between">
            <div>
              <ModernCardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-sage-600" />
                Transaction History
              </ModernCardTitle>
              <ModernCardDescription>
                All financial transactions for {farmData.name}
              </ModernCardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter(filter === 'all' ? 'income' : filter === 'income' ? 'expense' : 'all')}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filter === 'all' ? 'All' : filter === 'income' ? 'Income' : 'Expenses'}
              </Button>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="p-6 space-y-3">
              {filteredTransactions.map((transaction) => {
                const categoryStyle = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS.OTHER_EXPENSE
                
                return (
                  <div
                    key={transaction.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all hover:shadow-sm",
                      transaction.type === 'INCOME' 
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                        : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs font-medium",
                              categoryStyle.bg,
                              categoryStyle.text,
                              categoryStyle.border
                            )}
                          >
                            {transaction.category.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transaction.transactionDate)}
                          </span>
                        </div>
                        
                        {transaction.notes && (
                          <p className="text-sm text-gray-700 mb-2">
                            {transaction.notes}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {transaction.field && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {transaction.field.name}
                            </span>
                          )}
                          {transaction.crop && (
                            <span className="flex items-center gap-1">
                              🌾 {transaction.crop.cropType}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={cn(
                          "text-lg font-bold",
                          transaction.type === 'INCOME' ? "text-green-700" : "text-red-700"
                        )}>
                          {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
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
          onClose={() => setShowTransactionModal(false)}
          farmId={farmId}
          type={transactionType}
          onSuccess={() => {
            fetchFarmData()
            setShowTransactionModal(false)
          }}
        />
      )}
    </div>
  )
}