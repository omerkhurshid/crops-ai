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
      <div className=\"flex items-center justify-between\">\n        <div className=\"flex items-center space-x-3\">\n          <div className=\"p-2 rounded-lg bg-white bg-opacity-50\">\n            {icon}\n          </div>\n          <div>\n            <p className=\"text-sm font-medium opacity-75\">{title}</p>\n            <p className=\"text-2xl font-bold\">{value}</p>\n            {subtitle && (\n              <p className=\"text-sm opacity-75\">{subtitle}</p>\n            )}\n          </div>\n        </div>\n        \n        {change !== undefined && (\n          <div className={`flex items-center space-x-1 ${trendColor}`}>\n            {TrendIcon && <TrendIcon className=\"h-4 w-4\" />}\n            <span className=\"text-sm font-medium\">\n              {change > 0 ? '+' : ''}{change.toFixed(1)}%\n            </span>\n          </div>\n        )}\n      </div>\n    </Card>\n  );\n}\n\nexport function SeasonSnapshot({ summary, farm, dateRange, onDateRangeChange }: SeasonSnapshotProps) {\n  const formatCurrency = (amount: number) => {\n    return new Intl.NumberFormat('en-US', {\n      style: 'currency',\n      currency: 'USD',\n      minimumFractionDigits: 0,\n      maximumFractionDigits: 0,\n    }).format(amount);\n  };\n\n  const formatPercentage = (percentage: number) => {\n    return `${percentage.toFixed(1)}%`;\n  };\n\n  const acreage = farm.totalArea * 2.47105; // Convert hectares to acres\n\n  return (\n    <Card className=\"p-6\">\n      <div className=\"mb-6\">\n        <div className=\"flex items-center justify-between mb-4\">\n          <h2 className=\"text-xl font-semibold text-gray-900\">Season Snapshot</h2>\n          <div className=\"flex items-center space-x-2\">\n            <Badge variant=\"outline\">\n              {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}\n            </Badge>\n            <Badge variant=\"secondary\">\n              {summary.transactionCount} transactions\n            </Badge>\n          </div>\n        </div>\n\n        {/* Main Profit Display */}\n        <div className=\"text-center py-6 border-b border-gray-200\">\n          <p className=\"text-sm text-gray-600 mb-2\">Net Profit</p>\n          <p className={`text-4xl font-bold ${\n            summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'\n          }`}>\n            {formatCurrency(summary.netProfit)}\n          </p>\n          {summary.profitChange !== 0 && (\n            <div className={`flex items-center justify-center mt-2 ${\n              summary.profitChange > 0 ? 'text-green-600' : 'text-red-600'\n            }`}>\n              {summary.profitChange > 0 ? (\n                <TrendingUp className=\"h-4 w-4 mr-1\" />\n              ) : (\n                <TrendingDown className=\"h-4 w-4 mr-1\" />\n              )}\n              <span className=\"text-sm font-medium\">\n                {summary.profitChange > 0 ? '+' : ''}{summary.profitChange.toFixed(1)}% vs last period\n              </span>\n            </div>\n          )}\n        </div>\n      </div>\n\n      {/* Key Metrics Grid */}\n      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">\n        <MetricCard\n          title=\"Total Income\"\n          value={formatCurrency(summary.totalIncome)}\n          icon={<TrendingUp className=\"h-5 w-5\" />}\n          color=\"green\"\n        />\n        \n        <MetricCard\n          title=\"Total Expenses\"\n          value={formatCurrency(summary.totalExpenses)}\n          icon={<TrendingDown className=\"h-5 w-5\" />}\n          color=\"red\"\n        />\n        \n        <MetricCard\n          title=\"Profit Margin\"\n          value={formatPercentage(summary.profitMargin)}\n          subtitle=\"of total income\"\n          icon={<BarChart3 className=\"h-5 w-5\" />}\n          color=\"blue\"\n        />\n        \n        <MetricCard\n          title=\"Profit per Acre\"\n          value={formatCurrency(summary.profitPerAcre)}\n          subtitle={`${acreage.toFixed(0)} total acres`}\n          icon={<DollarSign className=\"h-5 w-5\" />}\n          color=\"gray\"\n        />\n      </div>\n\n      {/* Quick Stats */}\n      <div className=\"mt-6 pt-6 border-t border-gray-200\">\n        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-center\">\n          <div>\n            <p className=\"text-2xl font-bold text-gray-900\">\n              {formatCurrency(summary.grossProfit)}\n            </p>\n            <p className=\"text-sm text-gray-600\">Gross Profit</p>\n          </div>\n          \n          <div>\n            <p className=\"text-2xl font-bold text-gray-900\">\n              {summary.totalIncome > 0 ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1) : 0}%\n            </p>\n            <p className=\"text-sm text-gray-600\">Expense Ratio</p>\n          </div>\n          \n          <div>\n            <p className=\"text-2xl font-bold text-gray-900\">\n              {formatCurrency(summary.totalIncome / acreage)}\n            </p>\n            <p className=\"text-sm text-gray-600\">Revenue per Acre</p>\n          </div>\n          \n          <div>\n            <p className=\"text-2xl font-bold text-gray-900\">\n              {formatCurrency(summary.totalExpenses / acreage)}\n            </p>\n            <p className=\"text-sm text-gray-600\">Cost per Acre</p>\n          </div>\n        </div>\n      </div>\n    </Card>\n  );\n}