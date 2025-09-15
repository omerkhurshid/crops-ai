'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  MapPin, TrendingUp, TrendingDown, ArrowRight, 
  Eye, DollarSign, Banknote, Calculator
} from 'lucide-react'
import { cn } from '../../lib/utils'

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

interface ColorfulFarmTableProps {
  farms: FarmBreakdown[]
  onFarmSelect: (farmId: string) => void
}

export function ColorfulFarmTable({ farms, onFarmSelect }: ColorfulFarmTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProfitColor = (profit: number) => {
    if (profit > 50000) return 'bg-emerald-500'
    if (profit > 20000) return 'bg-green-500'
    if (profit > 0) return 'bg-lime-500'
    if (profit > -10000) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getProfitTextColor = (profit: number) => {
    if (profit >= 0) return 'text-green-600'
    return 'text-red-600'
  }

  const getMarginBadgeColor = (margin: number) => {
    if (margin > 30) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (margin > 20) return 'bg-green-100 text-green-800 border-green-200'
    if (margin > 10) return 'bg-lime-100 text-lime-800 border-lime-200'
    if (margin > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const sortedFarms = [...farms].sort((a, b) => b.netProfit - a.netProfit)
  const maxProfit = Math.max(...farms.map(f => Math.abs(f.netProfit)))

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-sage-50 to-cream-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-sage-600" />
              Farm Financial Performance
            </CardTitle>
            <CardDescription>
              Comprehensive breakdown of revenue, expenses, and profitability by farm
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sage-600">
            {farms.length} Farms
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farm
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Profit
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit/ha
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFarms.map((farm, index) => (
                <tr 
                  key={farm.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onFarmSelect(farm.id)}
                >
                  {/* Farm Name & Location */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold",
                        getProfitColor(farm.netProfit)
                      )}>
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{farm.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {farm.address || farm.location || 'No location'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Area */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {farm.totalArea.toFixed(1)} ha
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(farm.income)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {farm.transactionCount} trans
                    </div>
                  </td>

                  {/* Expenses */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(farm.expenses)}
                    </div>
                  </td>

                  {/* Net Profit with Visual Bar */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24">
                        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "absolute top-0 h-full rounded-full transition-all duration-500",
                              farm.netProfit >= 0 ? "bg-green-500 left-0" : "bg-red-500 right-0"
                            )}
                            style={{ 
                              width: `${(Math.abs(farm.netProfit) / maxProfit) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className={cn(
                        "text-sm font-bold min-w-[80px] text-right",
                        getProfitTextColor(farm.netProfit)
                      )}>
                        {formatCurrency(farm.netProfit)}
                      </div>
                    </div>
                  </td>

                  {/* Profit Margin */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Badge className={getMarginBadgeColor(farm.profitMargin)}>
                      {farm.profitMargin.toFixed(1)}%
                    </Badge>
                  </td>

                  {/* Profit per Hectare */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={cn(
                      "text-sm font-medium flex items-center justify-end gap-1",
                      getProfitTextColor(farm.profitPerArea)
                    )}>
                      {farm.profitPerArea >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatCurrency(farm.profitPerArea)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onFarmSelect(farm.id)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Summary Footer */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Total Portfolio
                </td>
                <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {farms.reduce((sum, f) => sum + f.totalArea, 0).toFixed(1)} ha
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(farms.reduce((sum, f) => sum + f.income, 0))}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(farms.reduce((sum, f) => sum + f.expenses, 0))}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={cn(
                    "text-sm font-bold",
                    getProfitTextColor(farms.reduce((sum, f) => sum + f.netProfit, 0))
                  )}>
                    {formatCurrency(farms.reduce((sum, f) => sum + f.netProfit, 0))}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge className={getMarginBadgeColor(
                    (farms.reduce((sum, f) => sum + f.netProfit, 0) / 
                     farms.reduce((sum, f) => sum + f.income, 0)) * 100
                  )}>
                    {((farms.reduce((sum, f) => sum + f.netProfit, 0) / 
                      farms.reduce((sum, f) => sum + f.income, 0)) * 100).toFixed(1)}%
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(
                    farms.reduce((sum, f) => sum + f.netProfit, 0) / 
                    farms.reduce((sum, f) => sum + f.totalArea, 0)
                  )}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-medium text-gray-700">Profit Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Excellent (&gt;$50k)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Good ($20k-50k)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
              <span>Fair ($0-20k)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Low (-$10k-0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Loss (&lt;-$10k)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}