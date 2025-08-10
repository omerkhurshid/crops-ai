'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

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
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  const trendColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';
  const TrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : null;

  return (
    <Card className={`p-6 ${colorClasses[color]} border`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white bg-opacity-50">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm opacity-75">{subtitle}</p>
            )}
          </div>
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${trendColor}`}>
            {TrendIcon && <TrendIcon className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </Card>
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
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Season Snapshot</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </Badge>
            <Badge variant="secondary">
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
      </div>

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

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.grossProfit)}
            </p>
            <p className="text-sm text-gray-600">Gross Profit</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalIncome > 0 ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-600">Expense Ratio</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalIncome / acreage)}
            </p>
            <p className="text-sm text-gray-600">Revenue per Acre</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalExpenses / acreage)}
            </p>
            <p className="text-sm text-gray-600">Cost per Acre</p>
          </div>
        </div>
      </div>
    </Card>
  );
}