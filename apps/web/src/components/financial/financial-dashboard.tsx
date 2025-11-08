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
import { FarmFinancialOverview } from './farm-financial-overview';
import { FieldFinancialDashboard } from './field-financial-dashboard';
import { SeasonSnapshot } from './season-snapshot';
import { TransactionList } from './transaction-list';
import { TransactionModal } from './transaction-modal';
import { PLSummaryTable } from './pl-summary-table';
import { TrendChart } from './trend-chart';
import { ForecastView } from './forecast-view';
import { AnalyticsView } from './analytics-view';
import { SimplifiedFinancialMetrics } from './simplified-metrics';
import { SimpleCashFlowForecast } from './simple-cashflow-forecast';
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
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<any>(null);
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
  const handleFieldSelect = async (fieldId: string) => {
    try {
      // Fetch field details
      const response = await fetch(`/api/fields?farmId=${farm.id}`);
      if (response.ok) {
        const data = await response.json();
        const field = data.fields.find((f: any) => f.id === fieldId);
        if (field) {
          setSelectedField(field);
          setSelectedFieldId(fieldId);
        }
      }
    } catch (error) {
      console.error('Error fetching field details:', error);
    }
  };
  const handleBackToFarmOverview = () => {
    setSelectedFieldId(null);
    setSelectedField(null);
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
  // Show field-level dashboard if a field is selected
  if (selectedFieldId && selectedField) {
    return (
      <FieldFinancialDashboard
        field={selectedField}
        onBack={handleBackToFarmOverview}
      />
    );
  }
  // Show farm-level overview by default
  return (
    <div className="space-y-6">
      <FarmFinancialOverview
        farm={farm}
        onFieldSelect={handleFieldSelect}
        onAddTransaction={() => handleAddTransaction('INCOME')}
      />
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