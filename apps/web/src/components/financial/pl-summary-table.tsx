'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2,
  Link2,
  Download
} from 'lucide-react';
interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
}
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
interface PLSummaryTableProps {
  summary: FinancialSummary;
  farmId: string;
  dateRange: { start: Date; end: Date };
}
interface DetailedBreakdown {
  incomeByCategory: CategoryBreakdown[];
  expensesByCategory: CategoryBreakdown[];
}
const CATEGORY_ICONS: Record<string, string> = {
  // Income
  CROP_SALES: '🌾',
  LIVESTOCK_SALES: '🐄',
  SUBSIDIES: '💰',
  LEASE_INCOME: '🏡',
  OTHER_INCOME: '📈',
  // Expenses
  SEEDS: '🌱',
  FERTILIZER: '🧪',
  PESTICIDES: '🚿',
  LABOR: '👨‍🌾',
  MACHINERY: '🚜',
  FUEL: '⛽',
  IRRIGATION: '💧',
  STORAGE: '🏪',
  INSURANCE: '🛡️',
  OVERHEAD: '🏢',
  OTHER_EXPENSE: '📄',
};
const CATEGORY_LABELS: Record<string, string> = {
  // Income
  CROP_SALES: 'Crop Sales',
  LIVESTOCK_SALES: 'Livestock Sales',
  SUBSIDIES: 'Subsidies',
  LEASE_INCOME: 'Lease Income',
  OTHER_INCOME: 'Other Income',
  // Expenses
  SEEDS: 'Seeds',
  FERTILIZER: 'Fertilizer',
  PESTICIDES: 'Pesticides',
  LABOR: 'Labor',
  MACHINERY: 'Machinery',
  FUEL: 'Fuel',
  IRRIGATION: 'Irrigation',
  STORAGE: 'Storage',
  INSURANCE: 'Insurance',
  OVERHEAD: 'Overhead',
  OTHER_EXPENSE: 'Other Expenses',
};
export function PLSummaryTable({ summary, farmId, dateRange }: PLSummaryTableProps) {
  const [breakdown, setBreakdown] = useState<DetailedBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['income', 'expenses']));
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };
  const fetchBreakdown = async () => {
    if (breakdown) return; // Already loaded
    try {
      setLoading(true);
      const response = await fetch(
        `/api/financial/summary?farmId=${farmId}&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setBreakdown(data.breakdown);
      }
    } catch (error) {
      console.error('Error fetching breakdown:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBreakdown();
  }, [farmId, dateRange]);
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };
  const getCategoryPercentage = (amount: number, total: number) => {
    return total > 0 ? (amount / total) * 100 : 0;
  };
  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/financial/export?farmId=${farmId}&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}&format=pdf`,
        { method: 'POST' }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `financial-summary-${farmId}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">P&L Summary</h3>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      <div className="space-y-4">
        {/* Income Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('income')}
            className="w-full flex items-center justify-between p-4 hover:bg-[#FAFAF7] transition-colors"
          >
            <div className="flex items-center space-x-3">
              {expandedSections.has('income') ? (
                <ChevronDown className="h-4 w-4 text-[#555555]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[#555555]" />
              )}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#8FBF7F] rounded-full"></div>
                <span className="font-medium text-[#1A1A1A]">Income</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#8FBF7F]">
                {formatCurrency(summary.totalIncome)}
              </span>
              <TrendingUp className="h-4 w-4 text-[#8FBF7F]" />
            </div>
          </button>
          {expandedSections.has('income') && breakdown && (
            <div className="px-4 pb-4 space-y-2">
              {breakdown.incomeByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between py-2 pl-8 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{CATEGORY_ICONS[item.category] || '📊'}</span>
                    <span className="text-[#555555]">{CATEGORY_LABELS[item.category] || item.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#555555]">
                      {getCategoryPercentage(item.amount, summary.totalIncome).toFixed(1)}%
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
              {breakdown.incomeByCategory.length === 0 && (
                <div className="text-center py-4 text-[#555555]">
                  No income recorded for this period
                </div>
              )}
            </div>
          )}
        </div>
        {/* Expenses Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('expenses')}
            className="w-full flex items-center justify-between p-4 hover:bg-[#FAFAF7] transition-colors"
          >
            <div className="flex items-center space-x-3">
              {expandedSections.has('expenses') ? (
                <ChevronDown className="h-4 w-4 text-[#555555]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[#555555]" />
              )}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-[#1A1A1A]">Expenses</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </span>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </button>
          {expandedSections.has('expenses') && breakdown && (
            <div className="px-4 pb-4 space-y-2">
              {breakdown.expensesByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between py-2 pl-8 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{CATEGORY_ICONS[item.category] || '📊'}</span>
                    <span className="text-[#555555]">{CATEGORY_LABELS[item.category] || item.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#555555]">
                      {getCategoryPercentage(item.amount, summary.totalExpenses).toFixed(1)}%
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
              {breakdown.expensesByCategory.length === 0 && (
                <div className="text-center py-4 text-[#555555]">
                  No expenses recorded for this period
                </div>
              )}
            </div>
          )}
        </div>
        {/* Net Profit Section */}
        <div className="border-2 border-[#E6E6E6] rounded-lg bg-[#FAFAF7]">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  summary.netProfit >= 0 ? 'bg-[#8FBF7F]' : 'bg-red-500'
                }`}></div>
                <span className="font-semibold text-[#1A1A1A]">Net Profit</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-bold text-lg ${
                  summary.netProfit >= 0 ? 'text-[#8FBF7F]' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.netProfit)}
                </span>
                {summary.netProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-[#8FBF7F]" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-[#555555]">
              Profit margin: {formatPercentage(summary.profitMargin)} • 
              Expense ratio: {formatPercentage(summary.totalIncome > 0 ? (summary.totalExpenses / summary.totalIncome) * 100 : 0)}
            </div>
          </div>
        </div>
        {/* Loading State */}
        {loading && breakdown === null && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-[#555555] mt-2">Loading detailed breakdown...</p>
          </div>
        )}
      </div>
    </Card>
  );
}