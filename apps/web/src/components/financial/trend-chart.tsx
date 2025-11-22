'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}
interface TrendChartProps {
  farmId: string;
  dateRange: { start: Date; end: Date };
}
export function TrendChart({ farmId, dateRange }: TrendChartProps) {
  const [data, setData] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  useEffect(() => {
    fetchTrendData();
  }, [farmId, dateRange]);
  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/financial/summary?farmId=${farmId}&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
      );
      if (response.ok) {
        const responseData = await response.json();
        const monthlyTrends = responseData.monthlyTrends || [];
        // Transform data for chart
        const chartData = monthlyTrends.map((trend: any) => ({
          month: new Date(trend.month + '-01').toLocaleDateString('en-US', { 
            month: 'short', 
            year: '2-digit' 
          }),
          income: trend.income,
          expenses: trend.expenses,
          profit: trend.income - trend.expenses,
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-[#F5F5F5] rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-[#F5F5F5] rounded"></div>
        </div>
      </Card>
    );
  }
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Financial Trends</h3>
        <div className="text-center py-12">
          <div className="text-[#555555] mb-2">📊</div>
          <p className="text-[#555555]">No trend data available for the selected period.</p>
        </div>
      </Card>
    );
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Financial Trends</h3>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={chartType === 'line' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setChartType('line')}
          >
            Line
          </Badge>
          <Badge 
            variant={chartType === 'bar' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setChartType('bar')}
          >
            Bar
          </Badge>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Income"
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Expenses"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Profit"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t">
        <div className="text-center">
          <p className="text-sm text-[#555555]">Total Income</p>
          <p className="text-lg font-semibold text-[#8FBF7F]">
            {formatCurrency(data.reduce((sum, item) => sum + item.income, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-[#555555]">Total Expenses</p>
          <p className="text-lg font-semibold text-red-600">
            {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-[#555555]">Net Profit</p>
          <p className={`text-lg font-semibold ${
            data.reduce((sum, item) => sum + item.profit, 0) >= 0 
              ? 'text-[#8FBF7F]' 
              : 'text-red-600'
          }`}>
            {formatCurrency(data.reduce((sum, item) => sum + item.profit, 0))}
          </p>
        </div>
      </div>
    </Card>
  );
}