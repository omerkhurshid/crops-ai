'use client'
import React from 'react'
import { ModernCard, ModernCardContent, MetricCard } from '@/components/ui/modern-card'
import { Badge } from '@/components/ui/badge'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '@/lib/tooltip-content'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Wallet, PiggyBank, Calculator } from 'lucide-react'
interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  grossProfit: number;
  profitMargin: number;
  profitPerAcre: number;
  profitChange: number;
  transactionCount: number;
}
interface Farm {
  id: string;
  name: string;
  totalArea: number;
}
interface DateRange {
  start: Date;
  end: Date;
}
interface SeasonSnapshotProps {
  summary: FinancialSummary;
  farm: Farm;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}
export function SeasonSnapshot({ summary, farm, dateRange, onDateRangeChange }: SeasonSnapshotProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };
  const acreage = farm.totalArea * 2.47105; // Convert hectares to acres
  return (
    <div className="space-y-6">
      {/* Main Profit Overview */}
      <ModernCard variant="floating" className="overflow-hidden">
        <ModernCardContent className="p-8 bg-gradient-to-r from-sage-50 to-cream-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-sage-800">Financial Overview</h2>
            <div className="flex items-center space-x-2">
              <Badge className="bg-sage-100 text-sage-700 border-sage-200">
                {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
              </Badge>
              <Badge className="bg-earth-100 text-earth-700 border-earth-200">
                {summary.transactionCount} transactions
              </Badge>
            </div>
          </div>
        {/* Main Profit Display */}
        <div className="text-center py-6 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Net Profit</p>
          <p className={`text-4xl font-bold ${
            summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(summary.netProfit)}
          </p>
          {summary.profitChange !== 0 && (
            <div className={`flex items-center justify-center mt-2 ${
              summary.profitChange > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.profitChange > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {summary.profitChange > 0 ? '+' : ''}{summary.profitChange.toFixed(1)}% vs last period
              </span>
            </div>
          )}
        </div>
        </ModernCardContent>
      </ModernCard>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Income"
          value={formatCurrency(summary.totalIncome)}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="glass"
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={<TrendingDown className="h-6 w-6" />}
          variant="glow"
        />
        <MetricCard
          title="Profit Margin"
          value={formatPercentage(summary.profitMargin)}
          description="of total income"
          icon={<BarChart3 className="h-6 w-6" />}
          variant="glass"
        />
        <MetricCard
          title="Profit per Acre"
          value={formatCurrency(summary.profitPerAcre)}
          description={`${acreage.toFixed(0)} total acres`}
          icon={<DollarSign className="h-6 w-6" />}
          variant="glow"
        />
      </div>
    </div>
  );
}