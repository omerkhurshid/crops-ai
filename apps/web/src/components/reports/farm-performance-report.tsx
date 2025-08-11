'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, TrendingDown, Download, RefreshCw, BarChart3, 
  Target, Leaf, DollarSign, Activity, AlertCircle
} from 'lucide-react';

interface FarmPerformanceData {
  overallScore: number;
  yieldEfficiency: number;
  resourceUtilization: number;
  profitability: number;
  trends: {
    yield: { current: number; previous: number; change: number };
    costs: { current: number; previous: number; change: number };
    profit: { current: number; previous: number; change: number };
  };
  topPerformingFields: Array<{
    id: string;
    name: string;
    cropType: string;
    yield: number;
    profitPerAcre: number;
    efficiency: number;
  }>;
  improvementAreas: Array<{
    area: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
}

interface FarmPerformanceReportProps {
  farmId: string;
}

export function FarmPerformanceReport({ farmId }: FarmPerformanceReportProps) {
  const [data, setData] = useState<FarmPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, [farmId]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/performance?farmId=${farmId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        // Use demo data
        setData(getMockPerformanceData());
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setData(getMockPerformanceData());
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          type: 'performance',
          format: 'pdf'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-performance-report-${new Date().toISOString().split('T')[0]}.pdf`;
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

  const getMockPerformanceData = (): FarmPerformanceData => ({
    overallScore: 87,
    yieldEfficiency: 82,
    resourceUtilization: 91,
    profitability: 78,
    trends: {
      yield: { current: 185, previous: 170, change: 8.8 },
      costs: { current: 850, previous: 920, change: -7.6 },
      profit: { current: 1250, previous: 980, change: 27.6 }
    },
    topPerformingFields: [
      { id: '1', name: 'North Field', cropType: 'Corn', yield: 195, profitPerAcre: 180, efficiency: 92 },
      { id: '2', name: 'South Field', cropType: 'Soybeans', yield: 58, profitPerAcre: 120, efficiency: 89 },
      { id: '3', name: 'East Field', cropType: 'Wheat', yield: 65, profitPerAcre: 95, efficiency: 85 }
    ],
    improvementAreas: [
      { area: 'Water Management', impact: 'high', recommendation: 'Install precision irrigation systems in fields 4 and 5' },
      { area: 'Nutrient Optimization', impact: 'medium', recommendation: 'Implement variable-rate fertilizer application' },
      { area: 'Pest Management', impact: 'low', recommendation: 'Enhance integrated pest management practices' }
    ]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Unable to load performance data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Farm Performance Analysis</h3>
          <p className="text-sm text-gray-600">Comprehensive productivity and efficiency metrics</p>
        </div>
        <Button
          onClick={generateReport}
          disabled={generating}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {generating ? 'Generating...' : 'Download Report'}
        </Button>
      </div>

      {/* Overall Performance Score */}
      <Card className={`border-2 ${getScoreBackground(data.overallScore)}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Excellent performance</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-lg font-semibold ${getScoreColor(data.yieldEfficiency)}`}>
                {data.yieldEfficiency}%
              </div>
              <p className="text-xs text-gray-600">Yield Efficiency</p>
            </div>
            <div>
              <div className={`text-lg font-semibold ${getScoreColor(data.resourceUtilization)}`}>
                {data.resourceUtilization}%
              </div>
              <p className="text-xs text-gray-600">Resource Use</p>
            </div>
            <div>
              <div className={`text-lg font-semibold ${getScoreColor(data.profitability)}`}>
                {data.profitability}%
              </div>
              <p className="text-xs text-gray-600">Profitability</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Year-over-year comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Yield</span>
                {getTrendIcon(data.trends.yield.change)}
              </div>
              <div className="text-xl font-bold">{data.trends.yield.current}</div>
              <div className="text-xs text-gray-600">
                {data.trends.yield.change >= 0 ? '+' : ''}{data.trends.yield.change.toFixed(1)}% vs last year
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Costs</span>
                {getTrendIcon(data.trends.costs.change)}
              </div>
              <div className="text-xl font-bold">{formatCurrency(data.trends.costs.current)}</div>
              <div className="text-xs text-gray-600">
                {data.trends.costs.change >= 0 ? '+' : ''}{data.trends.costs.change.toFixed(1)}% vs last year
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Profit</span>
                {getTrendIcon(data.trends.profit.change)}
              </div>
              <div className="text-xl font-bold">{formatCurrency(data.trends.profit.current)}</div>
              <div className="text-xs text-gray-600">
                {data.trends.profit.change >= 0 ? '+' : ''}{data.trends.profit.change.toFixed(1)}% vs last year
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Fields</CardTitle>
          <CardDescription>Your most efficient and profitable fields</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topPerformingFields.map((field, index) => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{field.name}</div>
                    <div className="text-sm text-gray-600">{field.cropType}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(field.profitPerAcre)}/acre</div>
                  <div className="text-sm text-gray-600">{field.efficiency}% efficient</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Opportunities</CardTitle>
          <CardDescription>AI-identified areas for optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.improvementAreas.map((area, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium">{area.area}</div>
                  <Badge className={getImpactColor(area.impact)}>
                    {area.impact} impact
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{area.recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}