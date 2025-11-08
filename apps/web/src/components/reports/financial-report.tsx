'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  DollarSign, TrendingUp, TrendingDown, Download, RefreshCw, 
  AlertTriangle, PieChart, BarChart3, Target, Calculator,
  CreditCard, Receipt, Wallet, LineChart
} from 'lucide-react';
interface FinancialData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    roi: number;
    cashFlow: number;
  };
  breakdown: {
    revenue: Array<{ category: string; amount: number; percentage: number }>;
    expenses: Array<{ category: string; amount: number; percentage: number }>;
  };
  trends: {
    monthly: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
    comparison: { current: number; previous: number; change: number };
  };
  profitability: {
    byField: Array<{ field: string; area: number; revenue: number; profit: number; profitPerAcre: number }>;
    byCrop: Array<{ crop: string; revenue: number; profit: number; margin: number }>;
  };
  cashFlow: {
    operational: number;
    investment: number;
    financing: number;
    net: number;
  };
  projections: {
    nextQuarter: { revenue: number; expenses: number; profit: number };
    yearEnd: { revenue: number; expenses: number; profit: number };
  };
}
interface FinancialReportProps {
  farmId: string;
}
export function FinancialReport({ farmId }: FinancialReportProps) {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchFinancialData();
  }, [farmId]);
  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/financial?farmId=${farmId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        throw new Error('Failed to fetch financial data');
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };
  // Mock function removed for production
  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          type: 'financial',
          format: 'pdf'
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Unable to load financial data</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Financial Analysis Report</h3>
          <p className="text-sm text-gray-600">Comprehensive financial overview and profitability analysis</p>
        </div>
        <Button onClick={generateReport} disabled={generating} size="sm">
          {generating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {generating ? 'Generating...' : 'Download Report'}
        </Button>
      </div>
      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-600">{formatCurrency(data.summary.totalRevenue)}</div>
          <p className="text-xs text-gray-600">Total Revenue</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-red-600">{formatCurrency(data.summary.totalExpenses)}</div>
          <p className="text-xs text-gray-600">Total Expenses</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-blue-600">{formatCurrency(data.summary.netProfit)}</div>
          <p className="text-xs text-gray-600">Net Profit</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
          <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-purple-600">{data.summary.profitMargin.toFixed(1)}%</div>
          <p className="text-xs text-gray-600">Profit Margin</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
          <Calculator className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-orange-600">{data.summary.roi.toFixed(1)}%</div>
          <p className="text-xs text-gray-600">ROI</p>
        </div>
        <div className="text-center p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
          <Wallet className="h-6 w-6 text-teal-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-teal-600">{formatCurrency(data.summary.cashFlow)}</div>
          <p className="text-xs text-gray-600">Cash Flow</p>
        </div>
      </div>
      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">Revenue & Expenses</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.breakdown?.revenue || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">{item.category}</span>
                        <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.amount)}</div>
                        <Progress value={item.percentage} className="w-16 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.breakdown?.expenses || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium">{item.category}</span>
                        <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.amount)}</div>
                        <Progress value={item.percentage} className="w-16 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="profitability" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Field Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.profitability?.byField || []).map((field, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">{field.field}</span>
                          <div className="text-sm text-gray-600">{field.area.toFixed(1)} acres</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(field.profit)}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(field.profitPerAcre)}/acre</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">Revenue: {formatCurrency(field.revenue)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Crop Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data.profitability?.byCrop || []).map((crop, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{crop.crop}</span>
                        <div className="text-sm text-gray-600">{crop.margin.toFixed(1)}% margin</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(crop.profit)}</div>
                        <div className="text-sm text-gray-600">Revenue: {formatCurrency(crop.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Cash Flow Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{formatCurrency(data.cashFlow.operational)}</div>
                  <p className="text-sm text-gray-600">Operational</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{formatCurrency(data.cashFlow.investment)}</div>
                  <p className="text-sm text-gray-600">Investment</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{formatCurrency(data.cashFlow.financing)}</div>
                  <p className="text-sm text-gray-600">Financing</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(data.cashFlow.net)}</div>
                  <p className="text-sm text-gray-600">Net Cash Flow</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Cash Flow Summary:</strong> Strong operational cash flow indicates healthy day-to-day operations. 
                  Investment outflows represent equipment purchases and farm improvements. 
                  Net positive cash flow of {formatCurrency(data.cashFlow.net)} provides good liquidity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Financial Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3 text-center">Next Quarter Projection</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Expected Revenue:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(data.projections.nextQuarter.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Expenses:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(data.projections.nextQuarter.expenses)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Net Profit:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(data.projections.nextQuarter.profit)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3 text-center">Year-End Projection</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Expected Revenue:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(data.projections.yearEnd.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Expenses:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(data.projections.yearEnd.expenses)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Net Profit:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(data.projections.yearEnd.profit)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Projection Summary:</strong> Based on current trends and seasonal patterns, 
                  we project continued profitability growth. Year-end profit is expected to reach 
                  {formatCurrency(data.projections.yearEnd.profit)}, representing a 
                  {formatPercentage((data.projections.yearEnd.profit / data.summary.netProfit - 1) * 100)} increase 
                  from current levels.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}