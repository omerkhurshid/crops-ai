'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { 
  ArrowLeft,
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Sprout,
  BarChart3,
  Target,
  Calendar,
  Plus,
  Upload,
  Download,
  PieChart,
  Activity
} from 'lucide-react'
import { TransactionList } from './transaction-list'
import { TransactionModal } from './transaction-modal'
import { TrendChart } from './trend-chart'
import { PLSummaryTable } from './pl-summary-table'
interface Field {
  id: string
  name: string
  farmId: string
  farmName: string
  area: number
  soilType?: string
}
interface FieldFinancialSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  grossProfit: number
  profitMargin: number
  profitPerAcre: number
  profitChange: number
  transactionCount: number
  lastTransactionDate?: string
}
interface FieldFinancialDashboardProps {
  field: Field
  onBack: () => void
}
export function FieldFinancialDashboard({ field, onBack }: FieldFinancialDashboardProps) {
  const [summary, setSummary] = useState<FieldFinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    end: new Date(),
  })
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
  }
  const fetchFieldSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/financial/summary?farmId=${field.farmId}&fieldId=${field.id}&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
      )
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching field financial summary:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchFieldSummary()
  }, [field.id, dateRange])
  const handleAddTransaction = (type: 'INCOME' | 'EXPENSE') => {
    setTransactionType(type)
    setShowTransactionModal(true)
  }
  const handleTransactionAdded = () => {
    setShowTransactionModal(false)
    fetchFieldSummary() // Refresh summary
  }
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Field Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Farm Overview
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{field.name}</h1>
          <p className="text-gray-600">
            {field.farmName} • {field.area.toFixed(1)} acres
            {field.soilType && ` • ${field.soilType} soil`}
          </p>
        </div>
      </div>
      {/* Field Financial Summary */}
      <ModernCard variant="floating" className="overflow-hidden">
        <ModernCardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center justify-between">
            <div>
              <ModernCardTitle className="text-xl text-blue-800 mb-2">
                Field Financial Performance
              </ModernCardTitle>
              <ModernCardDescription className="flex items-center gap-2 text-blue-700">
                <Calendar className="h-4 w-4" />
                {dateRange.start.getFullYear()} Performance Summary
              </ModernCardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleAddTransaction('INCOME')} className="bg-sage-600 hover:bg-sage-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
              <Button onClick={() => handleAddTransaction('EXPENSE')} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </ModernCardHeader>
        {summary && (
          <ModernCardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Total Income</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(summary.totalIncome)}
                </p>
                <div className="text-sm text-gray-500">
                  {formatCurrency(summary.totalIncome / field.area)}/acre
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(summary.totalExpenses)}
                </p>
                <div className="text-sm text-gray-500">
                  {formatCurrency(summary.totalExpenses / field.area)}/acre
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Net Profit</span>
                </div>
                <p className={`text-2xl font-bold ${
                  summary.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {formatCurrency(summary.netProfit)}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">
                    {formatCurrency(summary.profitPerAcre)}/acre
                  </span>
                  {summary.profitChange !== 0 && (
                    <div className="flex items-center gap-1">
                      {summary.profitChange > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-xs ${
                        summary.profitChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(summary.profitChange)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Transactions</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {summary.transactionCount}
                </p>
                {summary.lastTransactionDate && (
                  <div className="text-sm text-gray-500">
                    Last: {new Date(summary.lastTransactionDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            {/* Profit Margin Badge */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Profit Margin:</span>
                  <Badge variant={summary.profitMargin >= 20 ? 'default' : summary.profitMargin >= 10 ? 'secondary' : 'destructive'}>
                    {summary.profitMargin.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-1" />
                    Import Data
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export Report
                  </Button>
                </div>
              </div>
            </div>
          </ModernCardContent>
        )}
      </ModernCard>
      {/* Field Financial Details Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            P&L Summary
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <TransactionList
            farmId={field.farmId}
            fieldId={field.id}
            onRefresh={fetchFieldSummary}
          />
        </TabsContent>
        <TabsContent value="analysis">
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Financial Analysis</ModernCardTitle>
              <ModernCardDescription>
                Detailed breakdown of income and expense categories for {field.name}
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Detailed income and expense breakdowns with interactive charts will be available soon.
                </p>
              </div>
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
        <TabsContent value="trends">
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Financial Trends</ModernCardTitle>
              <ModernCardDescription>
                Monthly income and expense trends for {field.name}
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Field-Specific Trends Coming Soon
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Detailed field-level financial trends and analysis charts will be available soon.
                </p>
              </div>
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
        <TabsContent value="summary">
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>P&L Summary</ModernCardTitle>
              <ModernCardDescription>
                Profit and loss breakdown for {field.name}
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              {summary && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Income</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(summary.totalIncome)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(summary.totalIncome / field.area)}/acre
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Expenses</h4>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(summary.totalExpenses)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(summary.totalExpenses / field.area)}/acre
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Net Profit</h4>
                      <p className={`text-2xl font-bold ${
                        summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(summary.netProfit)}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Margin:</span>
                        <Badge variant={summary.profitMargin >= 20 ? 'default' : summary.profitMargin >= 10 ? 'secondary' : 'destructive'}>
                          {summary.profitMargin.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
      </Tabs>
      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        farmId={field.farmId}
        fieldId={field.id}
        type={transactionType}
        onSuccess={handleTransactionAdded}
      />
    </div>
  )
}