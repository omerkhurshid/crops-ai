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
        <div className=\"bg-white p-3 border rounded-lg shadow-lg\">\n          <p className=\"font-medium mb-2\">{label}</p>\n          {payload.map((entry: any, index: number) => (\n            <p key={index} style={{ color: entry.color }} className=\"text-sm\">\n              {entry.name}: {formatCurrency(entry.value)}\n            </p>\n          ))}\n        </div>\n      );\n    }\n    return null;\n  };\n\n  if (loading) {\n    return (\n      <Card className=\"p-6\">\n        <div className=\"animate-pulse\">\n          <div className=\"h-4 bg-gray-200 rounded w-1/3 mb-4\"></div>\n          <div className=\"h-64 bg-gray-200 rounded\"></div>\n        </div>\n      </Card>\n    );\n  }\n\n  if (data.length === 0) {\n    return (\n      <Card className=\"p-6\">\n        <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Financial Trends</h3>\n        <div className=\"text-center py-12\">\n          <div className=\"text-gray-400 mb-2\">📊</div>\n          <p className=\"text-gray-600\">No trend data available for the selected period.</p>\n        </div>\n      </Card>\n    );\n  }\n\n  return (\n    <Card className=\"p-6\">\n      <div className=\"flex items-center justify-between mb-6\">\n        <h3 className=\"text-lg font-semibold text-gray-900\">Financial Trends</h3>\n        \n        <div className=\"flex items-center space-x-2\">\n          <Badge \n            variant={chartType === 'line' ? 'default' : 'outline'}\n            className=\"cursor-pointer\"\n            onClick={() => setChartType('line')}\n          >\n            Line\n          </Badge>\n          <Badge \n            variant={chartType === 'bar' ? 'default' : 'outline'}\n            className=\"cursor-pointer\"\n            onClick={() => setChartType('bar')}\n          >\n            Bar\n          </Badge>\n        </div>\n      </div>\n\n      <div className=\"h-80\">\n        <ResponsiveContainer width=\"100%\" height=\"100%\">\n          {chartType === 'line' ? (\n            <LineChart data={data}>\n              <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#f0f0f0\" />\n              <XAxis \n                dataKey=\"month\" \n                stroke=\"#666\"\n                fontSize={12}\n              />\n              <YAxis \n                stroke=\"#666\"\n                fontSize={12}\n                tickFormatter={formatCurrency}\n              />\n              <Tooltip content={<CustomTooltip />} />\n              <Legend />\n              <Line \n                type=\"monotone\" \n                dataKey=\"income\" \n                stroke=\"#22c55e\" \n                strokeWidth={2}\n                name=\"Income\"\n                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}\n                activeDot={{ r: 6 }}\n              />\n              <Line \n                type=\"monotone\" \n                dataKey=\"expenses\" \n                stroke=\"#ef4444\" \n                strokeWidth={2}\n                name=\"Expenses\"\n                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}\n                activeDot={{ r: 6 }}\n              />\n              <Line \n                type=\"monotone\" \n                dataKey=\"profit\" \n                stroke=\"#3b82f6\" \n                strokeWidth={2}\n                name=\"Profit\"\n                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}\n                activeDot={{ r: 6 }}\n              />\n            </LineChart>\n          ) : (\n            <BarChart data={data}>\n              <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#f0f0f0\" />\n              <XAxis \n                dataKey=\"month\" \n                stroke=\"#666\"\n                fontSize={12}\n              />\n              <YAxis \n                stroke=\"#666\"\n                fontSize={12}\n                tickFormatter={formatCurrency}\n              />\n              <Tooltip content={<CustomTooltip />} />\n              <Legend />\n              <Bar dataKey=\"income\" fill=\"#22c55e\" name=\"Income\" />\n              <Bar dataKey=\"expenses\" fill=\"#ef4444\" name=\"Expenses\" />\n              <Bar dataKey=\"profit\" fill=\"#3b82f6\" name=\"Profit\" />\n            </BarChart>\n          )}\n        </ResponsiveContainer>\n      </div>\n\n      {/* Summary Stats */}\n      <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t\">\n        <div className=\"text-center\">\n          <p className=\"text-sm text-gray-600\">Total Income</p>\n          <p className=\"text-lg font-semibold text-green-600\">\n            {formatCurrency(data.reduce((sum, item) => sum + item.income, 0))}\n          </p>\n        </div>\n        \n        <div className=\"text-center\">\n          <p className=\"text-sm text-gray-600\">Total Expenses</p>\n          <p className=\"text-lg font-semibold text-red-600\">\n            {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0))}\n          </p>\n        </div>\n        \n        <div className=\"text-center\">\n          <p className=\"text-sm text-gray-600\">Net Profit</p>\n          <p className={`text-lg font-semibold ${\n            data.reduce((sum, item) => sum + item.profit, 0) >= 0 \n              ? 'text-green-600' \n              : 'text-red-600'\n          }`}>\n            {formatCurrency(data.reduce((sum, item) => sum + item.profit, 0))}\n          </p>\n        </div>\n      </div>\n    </Card>\n  );\n}