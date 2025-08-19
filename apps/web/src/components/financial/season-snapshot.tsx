'use client'

import React from 'react'
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card'
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

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon: React.ReactNode;
  color?: 'green' | 'red' | 'blue' | 'gray';
}

function MetricCard({ title, value, subtitle, change, icon, color = 'gray' }: MetricCardProps) {
  const colorMap = {
    green: 'card-sage',
    red: 'card-clay',
    blue: 'card-forest',
    gray: 'card-earth'
  };

  const TrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : null;

  return (
    <div className={`polished-card ${colorMap[color]} rounded-2xl p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          {icon}
        </div>
        {change !== undefined && (
          <div className="flex items-center space-x-1">
            {TrendIcon && <TrendIcon className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-xl font-medium mb-2">{title}</div>
      {subtitle && (
        <div className="text-sm opacity-90">{subtitle}</div>
      )}
    </div>
  );
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
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
        />
        
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={<TrendingDown className="h-5 w-5" />}
          color="red"
        />
        
        <MetricCard
          title="Profit Margin"
          value={formatPercentage(summary.profitMargin)}
          subtitle="of total income"
          icon={<BarChart3 className="h-5 w-5" />}
          color="blue"
        />
        
        <MetricCard
          title="Profit per Acre"
          value={formatCurrency(summary.profitPerAcre)}
          subtitle={`${acreage.toFixed(0)} total acres`}
          icon={<DollarSign className="h-5 w-5" />}
          color="gray"
        />
      </div>
    </div>
  );
}