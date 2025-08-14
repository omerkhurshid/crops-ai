'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { InlineFloatingButton } from '../ui/floating-button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
  Download,
  Upload,
  Calendar,
  AlertCircle,
  Target,
} from 'lucide-react';
import { SeasonSnapshot } from './season-snapshot';
import { TransactionList } from './transaction-list';
import { TransactionModal } from './transaction-modal';
import { PLSummaryTable } from './pl-summary-table';
import { TrendChart } from './trend-chart';
import { ForecastView } from './forecast-view';
import { AnalyticsView } from './analytics-view';

interface Farm {
  id: string;
  name: string;
  totalArea: number;
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

interface FinancialDashboardProps {
  farm: Farm;
  initialData?: FinancialSummary;
}

export function FinancialDashboard({ farm, initialData }: FinancialDashboardProps) {
  const [summary, setSummary] = useState<FinancialSummary | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    end: new Date(),
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  // Fetch financial summary
  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/financial/summary?farmId=${farm.id}&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [farm.id, dateRange]);

  const handleAddTransaction = (type: 'INCOME' | 'EXPENSE') => {
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const handleTransactionAdded = () => {
    setShowTransactionModal(false);
    fetchSummary(); // Refresh summary
  };

  if (loading && !summary) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Currency Selector */}
      <div className="polished-card card-golden rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Financial Dashboard</h1>
            <p className="text-white/90">{farm.name} • {farm.totalArea.toFixed(1)} hectares</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-transparent border-0 text-white font-medium focus:outline-none cursor-pointer"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code} className="text-gray-900 bg-white">
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
            </div>
            
            <InlineFloatingButton
              onClick={() => handleAddTransaction('INCOME')}
              icon={<Plus className="h-4 w-4" />}
              label="Income"
              showLabel={true}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            />
            
            <InlineFloatingButton
              onClick={() => handleAddTransaction('EXPENSE')}
              icon={<Plus className="h-4 w-4" />}
              label="Expense"
              showLabel={true}
              variant="ghost"
              className="text-white border-white/30 hover:bg-white/10"
            />
            
            <InlineFloatingButton
              icon={<Upload className="h-4 w-4" />}
              label="Import"
              variant="ghost"
              className="text-white border-white/30 hover:bg-white/10"
            />
          </div>
        </div>
      </div>

      {/* Season Snapshot */}
      {summary && (
        <SeasonSnapshot
          summary={summary}
          farm={farm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Forecast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* P&L Summary Table */}
            {summary && (
              <PLSummaryTable
                summary={summary}
                farmId={farm.id}
                dateRange={dateRange}
              />
            )}
            
            {/* Trends Chart */}
            <TrendChart
              farmId={farm.id}
              dateRange={dateRange}
            />
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList
            farmId={farm.id}
            onRefresh={fetchSummary}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsView
            farmId={farm.id}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="forecast">
          <ForecastView
            farmId={farm.id}
            onRefresh={fetchSummary}
          />
        </TabsContent>
      </Tabs>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        farmId={farm.id}
        type={transactionType}
        onSuccess={handleTransactionAdded}
      />
    </div>
  );
}