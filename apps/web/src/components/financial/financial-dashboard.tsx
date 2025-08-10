'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">{farm.name} • {farm.totalArea.toFixed(1)} hectares</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleAddTransaction('INCOME')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
          
          <Button
            onClick={() => handleAddTransaction('EXPENSE')}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
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
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-600">Advanced analytics and field-level profitability analysis will be available soon.</p>
          </div>
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