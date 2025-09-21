'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { 
  ArrowUpRight, ArrowDownRight, Calendar, MapPin, 
  Tag, Plus, Filter, Search, MoreVertical
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  transactionDate: string
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

interface ColoredTransactionListProps {
  farmId?: string
  limit?: number
  onAddTransaction?: (type: 'INCOME' | 'EXPENSE') => void
  compact?: boolean
}

// Enhanced category colors with more vibrant palette
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

const CATEGORY_LABELS: Record<string, string> = {
  CROP_SALES: 'Crop Sales',
  LIVESTOCK_SALES: 'Livestock',
  SUBSIDIES: 'Subsidies',
  LEASE_INCOME: 'Lease',
  OTHER_INCOME: 'Other Income',
  SEEDS: 'Seeds',
  FERTILIZER: 'Fertilizer',
  PESTICIDES: 'Pesticides',
  LABOR: 'Labor',
  MACHINERY: 'Machinery',
  FUEL: 'Fuel',
  IRRIGATION: 'Irrigation',
  STORAGE: 'Storage',
  INSURANCE: 'Insurance',
  OTHER_EXPENSE: 'Other',
}

export function ColoredTransactionList({ 
  farmId, 
  limit = 10, 
  onAddTransaction,
  compact = false 
}: ColoredTransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  useEffect(() => {
    fetchTransactions()
  }, [farmId, limit])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: limit.toString() })
      if (farmId) params.append('farmId', farmId)
      
      const response = await fetch(`/api/financial/transactions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
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
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    if (filter === 'income') return t.type === 'INCOME'
    if (filter === 'expense') return t.type === 'EXPENSE'
    return true
  })

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setFilter(filter === 'all' ? 'income' : filter === 'income' ? 'expense' : 'all')}
            >
              <Filter className="h-4 w-4" />
              {filter === 'all' ? 'All' : filter === 'income' ? 'Income' : 'Expense'}
            </Button>
            {onAddTransaction && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onAddTransaction('INCOME')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600">Income</span>
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            </div>
            <div className="text-sm font-bold text-green-800 mt-1">
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-600">Expenses</span>
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            </div>
            <div className="text-sm font-bold text-red-800 mt-1">
              {formatCurrency(totalExpenses)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[600px] px-6">
          <div className="space-y-2 py-3">
            {filteredTransactions.map((transaction) => {
              const categoryStyle = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS.OTHER_EXPENSE
              
              return (
                <div
                  key={transaction.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer",
                    transaction.type === 'INCOME' 
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300" 
                      : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:border-red-300"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Category Badge */}
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
                          {CATEGORY_LABELS[transaction.category] || transaction.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(transaction.transactionDate)}
                        </span>
                      </div>
                      
                      {/* Description */}
                      {transaction.notes && (
                        <p className="text-sm text-gray-700 truncate">
                          {transaction.notes}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
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
                    
                    {/* Amount */}
                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-bold",
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
      </CardContent>
    </Card>
  )
}