'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Sprout,
  BarChart3,
  Target,
  Calendar,
  Plus,
  Eye,
  ArrowRight
} from 'lucide-react'

interface Farm {
  id: string
  name: string
  totalArea: number
}

interface Field {
  id: string
  name: string
  farmId: string
  farmName: string
  area: number
  soilType?: string
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitPerAcre: number
  transactionCount: number
  lastActivity?: string
}

interface FarmFinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  profitPerAcre: number
  profitChange: number
  transactionCount: number
  fieldsCount: number
}

interface FarmFinancialOverviewProps {
  farm: Farm
  onFieldSelect: (fieldId: string) => void
  onAddTransaction: () => void
}

export function FarmFinancialOverview({ farm, onFieldSelect, onAddTransaction }: FarmFinancialOverviewProps) {
  const [summary, setSummary] = useState<FarmFinancialSummary | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
  }

  const fetchFarmSummary = async () => {
    try {
      setLoading(true)
      
      // Fetch farm financial summary
      const summaryResponse = await fetch(`/api/financial/summary?farmId=${farm.id}`)
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        setSummary(summaryData.summary)
      }

      // Fetch fields with financial data
      const fieldsResponse = await fetch(`/api/fields?farmId=${farm.id}`)
      
      if (fieldsResponse.ok) {
        const fieldsData = await fieldsResponse.json()
        
        // Get financial data for each field
        const fieldsWithFinancials = await Promise.all(
          fieldsData.fields.map(async (field: any) => {
            try {
              const fieldFinancialResponse = await fetch(
                `/api/financial/summary?farmId=${farm.id}&fieldId=${field.id}`
              )
              
              if (fieldFinancialResponse.ok) {
                const fieldFinancialData = await fieldFinancialResponse.json()
                const fieldSummary = fieldFinancialData.summary
                
                return {
                  ...field,
                  totalRevenue: fieldSummary?.totalIncome || 0,
                  totalExpenses: fieldSummary?.totalExpenses || 0,
                  netProfit: fieldSummary?.netProfit || 0,
                  profitPerAcre: fieldSummary?.profitPerAcre || 0,
                  transactionCount: fieldSummary?.transactionCount || 0,
                  lastActivity: fieldSummary?.lastTransactionDate || null
                }
              }
              
              return {
                ...field,
                totalRevenue: 0,
                totalExpenses: 0,
                netProfit: 0,
                profitPerAcre: 0,
                transactionCount: 0
              }
            } catch (error) {
              console.error(`Error fetching financial data for field ${field.id}:`, error)
              return {
                ...field,
                totalRevenue: 0,
                totalExpenses: 0,
                netProfit: 0,
                profitPerAcre: 0,
                transactionCount: 0
              }
            }
          })
        )
        
        setFields(fieldsWithFinancials)
      }
    } catch (error) {
      console.error('Error fetching farm financial overview:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarmSummary()
  }, [farm.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Farm Financial Summary Header */}
      <ModernCard variant="floating" className="overflow-hidden">
        <ModernCardHeader className="bg-gradient-to-r from-green-50/80 to-emerald-50/80">
          <div className="flex items-center justify-between">
            <div>
              <ModernCardTitle className="text-2xl text-green-800 mb-2">
                {farm.name} Financial Overview
              </ModernCardTitle>
              <ModernCardDescription className="flex items-center gap-2 text-green-700">
                <MapPin className="h-4 w-4" />
                {farm.totalArea.toFixed(1)} hectares • {fields.length} fields
              </ModernCardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={onAddTransaction} variant="sage">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
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
                  <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(summary.totalRevenue)}
                </p>
                {summary.profitChange !== 0 && (
                  <div className="flex items-center gap-1">
                    {summary.profitChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${
                      summary.profitChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(summary.profitChange)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(summary.totalExpenses)}
                </p>
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
                <div className="text-sm text-gray-500">
                  {formatCurrency(summary.profitPerAcre)}/acre
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Transactions</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {summary.transactionCount}
                </p>
                <div className="text-sm text-gray-500">this year</div>
              </div>
            </div>
          </ModernCardContent>
        )}
      </ModernCard>

      {/* Fields Financial Breakdown */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" />
            Field Performance
          </ModernCardTitle>
          <ModernCardDescription>
            Financial breakdown by individual fields
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          {fields.length === 0 ? (
            <div className="text-center py-12">
              <Sprout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fields Found</h3>
              <p className="text-gray-600 mb-4">
                Add fields to your farm to start tracking field-level financial performance.
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First Field
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <ModernCard 
                  key={field.id} 
                  variant="soft"
                  className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500"
                  onClick={() => onFieldSelect(field.id)}
                >
                  <ModernCardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {field.name}
                          </h3>
                          <Badge variant={field.netProfit >= 0 ? 'default' : 'destructive'}>
                            {field.netProfit >= 0 ? 'Profitable' : 'Loss'}
                          </Badge>
                          {field.transactionCount === 0 && (
                            <Badge variant="outline">No Transactions</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Area:</span>
                            <p className="font-medium">{field.area.toFixed(1)} acres</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Revenue:</span>
                            <p className="font-medium text-green-600">
                              {formatCurrency(field.totalRevenue)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Expenses:</span>
                            <p className="font-medium text-orange-600">
                              {formatCurrency(field.totalExpenses)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Net Profit:</span>
                            <p className={`font-medium ${
                              field.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(field.netProfit)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
                          <span>{field.transactionCount} transactions</span>
                          {field.soilType && <span>Soil: {field.soilType}</span>}
                          {field.lastActivity && (
                            <span>Last activity: {new Date(field.lastActivity).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}