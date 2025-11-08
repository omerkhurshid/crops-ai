'use client';
import React, { useState, useEffect } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TrafficLightStatus, getHealthStatus } from '../ui/traffic-light-status';
import { FarmerMetricCard } from '../ui/farmer-metric-card';
import { 
  TrendingUp, TrendingDown, Download, RefreshCw, BarChart3, 
  Target, Leaf, DollarSign, Activity, AlertCircle, Award, Tractor
} from 'lucide-react';
import { cn, ensureArray } from '../../lib/utils';
import { convertHealthScore, getFarmerTerm } from '../../lib/farmer-language';
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
        // No data available
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setData(null);
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
  // Removed mock data function - only show real data from API
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  const getScoreStatus = (score: number) => {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
  };
  const getTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  if (loading) {
    return (
      <ModernCard variant="soft">
        <ModernCardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-sage-400 mr-3" />
            <span className="text-sage-600">Loading farm performance data...</span>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }
  if (!data) {
    return (
      <ModernCard variant="soft">
        <ModernCardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 text-sage-400 mx-auto mb-4" />
          <p className="text-sage-600">Unable to load performance data</p>
          <Button 
            onClick={fetchPerformanceData}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </ModernCardContent>
      </ModernCard>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-sage-800 mb-2">
            How Your Farm is Performing
          </h3>
          <p className="text-sage-600">
            See how well your farm is doing compared to last year
          </p>
        </div>
        <Button
          onClick={generateReport}
          disabled={generating}
          className="bg-sage-700 hover:bg-sage-800 w-full sm:w-auto"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {generating ? 'Creating Report...' : 'Download Report'}
        </Button>
      </div>
      {/* Overall Performance Score */}
      <ModernCard variant="glow" className="overflow-hidden">
        <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-earth-50">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-sage-700" />
            <div>
              <ModernCardTitle className="text-sage-800">
                Overall Farm Score
              </ModernCardTitle>
              <ModernCardDescription>
                How well your farm is performing overall
              </ModernCardDescription>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <TrafficLightStatus 
                status={getScoreStatus(data.overallScore)} 
                size="lg"
                showIcon={true}
                showText={false}
              />
              <div className="text-4xl font-bold text-sage-800">
                {data.overallScore}%
              </div>
            </div>
            <p className="text-lg text-sage-600">
              {convertHealthScore(data.overallScore)}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FarmerMetricCard
              title="Crop Production"
              value={`${data.yieldEfficiency}%`}
              subtitle="How much you're growing"
              status={getScoreStatus(data.yieldEfficiency)}
              icon={<Leaf className="h-5 w-5 text-green-600" />}
            />
            <FarmerMetricCard
              title="Resource Efficiency"
              value={`${data.resourceUtilization}%`}
              subtitle="How well you use inputs"
              status={getScoreStatus(data.resourceUtilization)}
              icon={<Tractor className="h-5 w-5 text-earth-600" />}
            />
            <FarmerMetricCard
              title="Profit Margin"
              value={`${data.profitability}%`}
              subtitle="How profitable you are"
              status={getScoreStatus(data.profitability)}
              icon={<DollarSign className="h-5 w-5 text-sage-600" />}
            />
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Performance Trends */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sage-700" />
            How You&apos;re Trending
          </ModernCardTitle>
          <ModernCardDescription>
            Comparing this year to last year
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Leaf className="h-5 w-5 text-green-600" />
                <span className="font-medium text-sage-800">Crop Yield</span>
                {getTrendIcon(data.trends.yield.change)}
              </div>
              <div className="text-2xl font-bold text-sage-800 mb-1">
                {data.trends.yield.current} bu/acre
              </div>
              <div className="text-sm text-sage-600">
                {data.trends.yield.change >= 0 ? '+' : ''}{data.trends.yield.change.toFixed(1)}% vs last year
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-sage-800">Operating Costs</span>
                {getTrendIcon(-data.trends.costs.change)} {/* Negative because lower costs are better */}
              </div>
              <div className="text-2xl font-bold text-sage-800 mb-1">
                {formatCurrency(data.trends.costs.current)}/acre
              </div>
              <div className="text-sm text-sage-600">
                {data.trends.costs.change >= 0 ? '+' : ''}{data.trends.costs.change.toFixed(1)}% vs last year
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-sage-50 to-green-50 rounded-xl border border-sage-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Target className="h-5 w-5 text-sage-600" />
                <span className="font-medium text-sage-800">Profit per Acre</span>
                {getTrendIcon(data.trends.profit.change)}
              </div>
              <div className="text-2xl font-bold text-sage-800 mb-1">
                {formatCurrency(data.trends.profit.current)}
              </div>
              <div className="text-sm text-sage-600">
                {data.trends.profit.change >= 0 ? '+' : ''}{data.trends.profit.change.toFixed(1)}% vs last year
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Top Performing Fields */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Your Best Fields
          </ModernCardTitle>
          <ModernCardDescription>
            Fields that are making you the most money
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-3">
            {ensureArray(data.topPerformingFields).map((field, index) => (
              <div key={field.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-sage-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                    index === 0 && "bg-yellow-100 text-yellow-800 border-2 border-yellow-300",
                    index === 1 && "bg-gray-100 text-gray-700 border-2 border-gray-300",
                    index === 2 && "bg-orange-100 text-orange-800 border-2 border-orange-300"
                  )}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sage-800">{field.name}</div>
                    <div className="text-sm text-sage-600">{field.cropType}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-sage-800">
                    {formatCurrency(field.profitPerAcre)}<span className="text-sm font-normal">/acre</span>
                  </div>
                  <div className="text-sm text-sage-600">{field.efficiency}% efficient</div>
                </div>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Improvement Areas */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-sage-700" />
            Ways to Improve
          </ModernCardTitle>
          <ModernCardDescription>
            AI suggestions to make your farm even better
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            {ensureArray(data.improvementAreas).map((area, index) => (
              <div key={index} className="p-4 bg-white rounded-xl border border-sage-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="font-semibold text-sage-800">{area.area}</div>
                  <Badge className={cn("border", getImpactColor(area.impact))}>
                    {area.impact === 'high' ? '🔥 High Impact' : 
                     area.impact === 'medium' ? '⚡ Medium Impact' : 
                     '✨ Low Impact'}
                  </Badge>
                </div>
                <p className="text-sage-700 leading-relaxed">{area.recommendation}</p>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
}