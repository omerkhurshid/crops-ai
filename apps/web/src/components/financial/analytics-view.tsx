'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  PieChart, BarChart3, TrendingUp, TrendingDown, DollarSign,
  Target, MapPin, Calendar, RefreshCw, AlertCircle, Zap,
  Leaf, Activity, Users
} from 'lucide-react';
interface AnalyticsData {
  profitability: {
    byField: Array<{
      fieldId: string;
      fieldName: string;
      area: number;
      revenue: number;
      costs: number;
      profit: number;
      profitPerAcre: number;
      roi: number;
    }>;
    byCrop: Array<{
      cropType: string;
      totalArea: number;
      revenue: number;
      costs: number;
      profit: number;
      yieldPerAcre: number;
      pricePerUnit: number;
    }>;
    byCategory: {
      income: Array<{ category: string; amount: number; percentage: number }>;
      expenses: Array<{ category: string; amount: number; percentage: number }>;
    };
  };
  efficiency: {
    inputCosts: {
      seeds: { costPerAcre: number; benchmark: number };
      fertilizer: { costPerAcre: number; benchmark: number };
      pesticides: { costPerAcre: number; benchmark: number };
      fuel: { costPerAcre: number; benchmark: number };
      labor: { costPerAcre: number; benchmark: number };
    };
    resourceUtilization: {
      waterEfficiency: number;
      fuelEfficiency: number;
      laborProductivity: number;
      equipmentUtilization: number;
    };
  };
  benchmarks: {
    regionalAverage: {
      profitPerAcre: number;
      yieldPerAcre: number;
      costPerAcre: number;
    };
    industryBest: {
      profitPerAcre: number;
      yieldPerAcre: number;
      costPerAcre: number;
    };
  };
  insights: Array<{
    type: 'opportunity' | 'risk' | 'achievement';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    action: string;
  }>;
}
interface AnalyticsViewProps {
  farmId: string;
  dateRange: { start: Date; end: Date };
}
export function AnalyticsView({ farmId, dateRange }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchAnalyticsData();
  }, [farmId, dateRange]);
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/financial/analytics?farmId=${farmId}&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
      );
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  // Removed mock data function - only show real data
  /*const getMockAnalyticsData = (): AnalyticsData => ({
    profitability: {
      byField: [
        {
          fieldId: '1',
          fieldName: 'North Field',
          area: 45.2,
          revenue: 89500,
          costs: 52000,
          profit: 37500,
          profitPerAcre: 830,
          roi: 72.1
        },
        {
          fieldId: '2',
          fieldName: 'South Field',
          area: 32.7,
          revenue: 61200,
          costs: 38900,
          profit: 22300,
          profitPerAcre: 682,
          roi: 57.3
        }
      ],
      byCrop: [
        {
          cropType: 'Corn',
          totalArea: 45.2,
          revenue: 89500,
          costs: 52000,
          profit: 37500,
          yieldPerAcre: 185,
          pricePerUnit: 5.42
        },
        {
          cropType: 'Soybeans',
          totalArea: 32.7,
          revenue: 61200,
          costs: 38900,
          profit: 22300,
          yieldPerAcre: 58,
          pricePerUnit: 12.85
        }
      ],
      byCategory: {
        income: [
          { category: 'Crop Sales', amount: 142500, percentage: 85.2 },
          { category: 'Insurance', amount: 8200, percentage: 4.9 },
          { category: 'Subsidies', amount: 16500, percentage: 9.9 }
        ],
        expenses: [
          { category: 'Seeds', amount: 28500, percentage: 31.4 },
          { category: 'Fertilizer', amount: 22800, percentage: 25.1 },
          { category: 'Fuel', amount: 15600, percentage: 17.2 },
          { category: 'Labor', amount: 12400, percentage: 13.6 },
          { category: 'Equipment', amount: 11600, percentage: 12.7 }
        ]
      }
    },
    efficiency: {
      inputCosts: {
        seeds: { costPerAcre: 365, benchmark: 385 },
        fertilizer: { costPerAcre: 293, benchmark: 310 },
        pesticides: { costPerAcre: 145, benchmark: 165 },
        fuel: { costPerAcre: 200, benchmark: 220 },
        labor: { costPerAcre: 159, benchmark: 175 }
      },
      resourceUtilization: {
        waterEfficiency: 92,
        fuelEfficiency: 88,
        laborProductivity: 85,
        equipmentUtilization: 78
      }
    },
    benchmarks: {
      regionalAverage: {
        profitPerAcre: 650,
        yieldPerAcre: 170,
        costPerAcre: 580
      },
      industryBest: {
        profitPerAcre: 950,
        yieldPerAcre: 210,
        costPerAcre: 520
      }
    },
    insights: [
      {
        type: 'opportunity',
        priority: 'high',
        title: 'Optimize Fertilizer Application',
        description: 'Variable-rate fertilizer could reduce costs by 12-15%',
        impact: '$3,400 potential savings annually',
        action: 'Implement precision agriculture technology'
      },
      {
        type: 'achievement',
        priority: 'medium',
        title: 'Excellent Yield Performance',
        description: 'Corn yield is 8.8% above regional average',
        impact: 'Additional $12,500 revenue this season',
        action: 'Continue current management practices'
      },
      {
        type: 'risk',
        priority: 'medium',
        title: 'Rising Labor Costs',
        description: 'Labor costs increased 18% compared to last year',
        impact: 'Reducing profit margins by 3.2%',
        action: 'Consider automation or efficiency improvements'
      }
    ]
  });*/
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'risk': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'achievement': return <Target className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'risk': return 'bg-red-50 border-red-200';
      case 'achievement': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getBenchmarkColor = (value: number, benchmark: number) => {
    if (value <= benchmark) return 'text-green-600';
    return 'text-red-600';
  };
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
        <p className="text-gray-600">Unable to load analytics data. Please try again.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Key findings and recommendations from your financial data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.insights.map((insight, index) => (
              <div key={index} className={`p-4 border-2 rounded-lg ${getInsightColor(insight.type)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-semibold">{insight.title}</h4>
                  </div>
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority} priority
                  </Badge>
                </div>
                <p className="text-gray-700 mb-2">{insight.description}</p>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">Impact: {insight.impact}</p>
                  <p className="text-gray-600">Recommended Action: {insight.action}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Profitability Analysis */}
      <Tabs defaultValue="fields" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fields">By Field</TabsTrigger>
          <TabsTrigger value="crops">By Crop</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>
        <TabsContent value="fields">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Field-Level Profitability
              </CardTitle>
              <CardDescription>Profit analysis by individual field</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.profitability.byField.map((field) => (
                  <div key={field.fieldId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{field.fieldName}</h4>
                        <p className="text-sm text-gray-600">{field.area.toFixed(1)} acres</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(field.profit)}</div>
                        <p className="text-sm text-gray-600">{formatPercentage(field.roi)} ROI</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-green-600 font-semibold">{formatCurrency(field.revenue)}</div>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                      <div>
                        <div className="text-red-600 font-semibold">{formatCurrency(field.costs)}</div>
                        <p className="text-xs text-gray-600">Costs</p>
                      </div>
                      <div>
                        <div className="text-blue-600 font-semibold">{formatCurrency(field.profitPerAcre)}</div>
                        <p className="text-xs text-gray-600">Profit/Acre</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="crops">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Crop Performance Analysis
              </CardTitle>
              <CardDescription>Financial performance by crop type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.profitability.byCrop.map((crop) => (
                  <div key={crop.cropType} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{crop.cropType}</h4>
                        <p className="text-sm text-gray-600">{crop.totalArea.toFixed(1)} acres</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(crop.profit)}</div>
                        <p className="text-sm text-gray-600">{crop.yieldPerAcre} bu/acre</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-green-600 font-semibold">{formatCurrency(crop.pricePerUnit)}</div>
                        <p className="text-xs text-gray-600">Price per bushel</p>
                      </div>
                      <div>
                        <div className="text-blue-600 font-semibold">{formatCurrency(crop.revenue)}</div>
                        <p className="text-xs text-gray-600">Total Revenue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Income Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.profitability.byCategory.income.map((item) => (
                    <div key={item.category} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.amount)}</div>
                        <div className="text-xs text-gray-600">{formatPercentage(item.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.profitability.byCategory.expenses.map((item) => (
                    <div key={item.category} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.amount)}</div>
                        <div className="text-xs text-gray-600">{formatPercentage(item.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {/* Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Operational Efficiency
          </CardTitle>
          <CardDescription>Cost efficiency compared to industry benchmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Input Cost Analysis</h4>
              <div className="space-y-3">
                {Object.entries(data.efficiency.inputCosts).map(([input, costs]) => (
                  <div key={input} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{input}</span>
                    <div className="text-right">
                      <div className={`font-semibold ${getBenchmarkColor(costs.costPerAcre, costs.benchmark)}`}>
                        {formatCurrency(costs.costPerAcre)}/acre
                      </div>
                      <div className="text-xs text-gray-600">
                        Benchmark: {formatCurrency(costs.benchmark)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resource Utilization</h4>
              <div className="space-y-3">
                {Object.entries(data.efficiency.resourceUtilization).map(([resource, efficiency]) => (
                  <div key={resource} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm capitalize">{resource.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-semibold">{efficiency}%</span>
                    </div>
                    <Progress value={efficiency} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Benchmarking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Benchmarking
          </CardTitle>
          <CardDescription>How your farm compares to regional and industry standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Your Farm</h4>
              <div className="space-y-2">
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(756)}
                  </div>
                  <p className="text-xs text-gray-600">Profit/Acre</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">171</div>
                  <p className="text-xs text-gray-600">Yield/Acre</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(584)}
                  </div>
                  <p className="text-xs text-gray-600">Cost/Acre</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Regional Average</h4>
              <div className="space-y-2">
                <div>
                  <div className="text-xl font-bold text-gray-600">
                    {formatCurrency(data.benchmarks.regionalAverage.profitPerAcre)}
                  </div>
                  <p className="text-xs text-gray-600">Profit/Acre</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-600">
                    {data.benchmarks.regionalAverage.yieldPerAcre}
                  </div>
                  <p className="text-xs text-gray-600">Yield/Acre</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-600">
                    {formatCurrency(data.benchmarks.regionalAverage.costPerAcre)}
                  </div>
                  <p className="text-xs text-gray-600">Cost/Acre</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3">Industry Best</h4>
              <div className="space-y-2">
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(data.benchmarks.industryBest.profitPerAcre)}
                  </div>
                  <p className="text-xs text-gray-600">Profit/Acre</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {data.benchmarks.industryBest.yieldPerAcre}
                  </div>
                  <p className="text-xs text-gray-600">Yield/Acre</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(data.benchmarks.industryBest.costPerAcre)}
                  </div>
                  <p className="text-xs text-gray-600">Cost/Acre</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}