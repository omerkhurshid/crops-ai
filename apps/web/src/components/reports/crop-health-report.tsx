'use client';
import React, { useState, useEffect } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card';
import { Button } from '../ui/button';
import { TrafficLightStatus, getHealthStatus, getStressStatus } from '../ui/traffic-light-status';
import { FarmerMetricCard } from '../ui/farmer-metric-card';
import { Badge } from '../ui/badge';
import { 
  Leaf, Activity, TrendingUp, TrendingDown, Download, 
  RefreshCw, AlertTriangle, Target, Zap, Eye,
  BarChart3, Satellite, Brain, Shield, Droplets
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { convertHealthScore, getFarmerTerm } from '../../lib/farmer-language';
interface CropHealthData {
  summary: {
    overallHealth: number;
    avgNDVI: number;
    stressedArea: number;
    healthyArea: number;
    improvementTrend: number;
  };
  fieldAnalysis: Array<{
    fieldId: string;
    fieldName: string;
    cropType: string;
    healthScore: number;
    ndvi: number;
    stressFactors: Array<{
      type: 'drought' | 'disease' | 'nutrient' | 'pest';
      severity: number;
      affected_area: number;
    }>;
    recommendations: string[];
  }>;
  trends: {
    healthHistory: Array<{
      date: string;
      avgHealth: number;
      ndvi: number;
    }>;
    seasonalPattern: {
      spring: number;
      summer: number;
      fall: number;
      winter: number;
    };
  };
  alerts: Array<{
    level: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    fieldId: string;
    actionRequired: boolean;
  }>;
}
interface CropHealthReportProps {
  farmId: string;
}
export function CropHealthReport({ farmId }: CropHealthReportProps) {
  const [data, setData] = useState<CropHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  useEffect(() => {
    fetchHealthData();
  }, [farmId]);
  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/crop-health?farmId=${farmId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
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
          type: 'crop-health',
          format: 'pdf'
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crop-health-report-${new Date().toISOString().split('T')[0]}.pdf`;
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
  const getStressFactorIcon = (type: string) => {
    switch (type) {
      case 'drought': return <Droplets className="h-4 w-4 text-orange-600" />;
      case 'disease': return <Shield className="h-4 w-4 text-red-600" />;
      case 'nutrient': return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'pest': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-[#555555]" />;
    }
  };
  const getStressFactorName = (type: string) => {
    switch (type) {
      case 'drought': return 'Water Stress';
      case 'disease': return 'Disease';
      case 'nutrient': return 'Nutrient Deficiency';
      case 'pest': return 'Pest Pressure';
      default: return 'Unknown';
    }
  };
  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-[#7A8F78] border-blue-200';
      default: return 'bg-[#F5F5F5] text-[#1A1A1A] border-[#F3F4F6]';
    }
  };
  if (loading) {
    return (
      <ModernCard variant="soft">
        <ModernCardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-sage-400 mr-3" />
            <span className="text-[#555555]">Analyzing crop health...</span>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }
  if (!data) {
    return (
      <ModernCard variant="soft">
        <ModernCardContent className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-sage-400 mx-auto mb-4" />
          <p className="text-[#555555]">Unable to load crop health data</p>
          <Button 
            onClick={fetchHealthData}
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
          <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
            How Healthy Your Crops Are
          </h3>
          <p className="text-[#555555]">
            Satellite analysis of your crop health and stress levels
          </p>
        </div>
        <Button
          onClick={generateReport}
          disabled={generating}
          className="bg-[#5E6F5A] hover:bg-[#7A8F78] w-full sm:w-auto"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {generating ? 'Creating Report...' : 'Download Report'}
        </Button>
      </div>
      {/* Overall Health Summary */}
      <ModernCard variant="glow" className="overflow-hidden">
        <ModernCardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <Leaf className="h-6 w-6 text-[#7A8F78]" />
            <div>
              <ModernCardTitle className="text-[#1A1A1A]">
                Overall Crop Health
              </ModernCardTitle>
              <ModernCardDescription>
                How healthy your crops are right now
              </ModernCardDescription>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <TrafficLightStatus 
                status={getHealthStatus(data.summary.overallHealth)} 
                size="lg"
                showIcon={true}
                showText={false}
              />
              <div className="text-4xl font-bold text-[#1A1A1A]">
                {data.summary.overallHealth}%
              </div>
            </div>
            <p className="text-lg text-[#555555] mb-4">
              {convertHealthScore(data.summary.overallHealth)}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-[#555555]">
              {data.summary.improvementTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-[#8FBF7F]" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span>
                {data.summary.improvementTrend > 0 ? '+' : ''}{data.summary.improvementTrend.toFixed(1)}% 
                improvement this week
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FarmerMetricCard
              title="Healthy Areas"
              value={`${data.summary.healthyArea}%`}
              subtitle="Of your fields look good"
              status="excellent"
              icon={<Leaf className="h-5 w-5 text-[#8FBF7F]" />}
            />
            <FarmerMetricCard
              title="Stressed Areas"
              value={`${data.summary.stressedArea}%`}
              subtitle="Of your fields need attention"
              status={getStressStatus(data.summary.stressedArea)}
              icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
            />
            <FarmerMetricCard
              title="Plant Vigor"
              value={data.summary.avgNDVI.toFixed(2)}
              subtitle="Satellite vegetation index"
              status={data.summary.avgNDVI > 0.7 ? 'excellent' : data.summary.avgNDVI > 0.5 ? 'good' : 'warning'}
              icon={<Satellite className="h-5 w-5 text-[#7A8F78]" />}
            />
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Field-by-Field Analysis */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#555555]" />
            Field-by-Field Health
          </ModernCardTitle>
          <ModernCardDescription>
            How each of your fields is doing
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-4">
            {data.fieldAnalysis.map((field) => (
              <div key={field.fieldId} className="p-4 bg-white rounded-xl border border-[#F8FAF8]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TrafficLightStatus 
                      status={getHealthStatus(field.healthScore)} 
                      size="md"
                      showText={false}
                    />
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A]">{field.fieldName}</h4>
                      <p className="text-sm text-[#555555]">{field.cropType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#1A1A1A]">{field.healthScore}%</div>
                    <div className="text-sm text-[#555555]">Health Score</div>
                  </div>
                </div>
                {/* Stress Factors */}
                {field.stressFactors.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-[#1A1A1A] mb-2">Issues Found:</h5>
                    <div className="space-y-2">
                      {field.stressFactors.map((stress, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {getStressFactorIcon(stress.type)}
                          <span className="text-[#555555]">
                            {getStressFactorName(stress.type)} affecting {stress.affected_area}% of field
                          </span>
                          <Badge variant="outline" className="ml-auto">
                            Severity: {stress.severity}/5
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Recommendations */}
                <div>
                  <h5 className="text-sm font-medium text-[#1A1A1A] mb-2">What to do:</h5>
                  <ul className="space-y-1">
                    {field.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-[#555555] flex items-start gap-2">
                        <span className="text-sage-400 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
      {/* Health Alerts */}
      {data.alerts.length > 0 && (
        <ModernCard variant="soft">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Health Alerts
            </ModernCardTitle>
            <ModernCardDescription>
              Issues that need your attention
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-3">
              {data.alerts.map((alert, index) => (
                <div key={index} className="p-4 bg-white rounded-xl border border-[#F8FAF8]">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={cn("border", getAlertColor(alert.level))}>
                      {alert.level.toUpperCase()}
                    </Badge>
                    {alert.actionRequired && (
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-[#555555] leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Health Trends */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#555555]" />
            Health Trends
          </ModernCardTitle>
          <ModernCardDescription>
            How your crop health has changed over time
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#F8FAF8] rounded-xl border border-green-100">
              <div className="text-sm font-medium text-[#555555] mb-1">Spring</div>
              <div className="text-xl font-bold text-[#1A1A1A]">{data.trends.seasonalPattern.spring}%</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="text-sm font-medium text-[#555555] mb-1">Summer</div>
              <div className="text-xl font-bold text-[#1A1A1A]">{data.trends.seasonalPattern.summer}%</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-sm font-medium text-[#555555] mb-1">Fall</div>
              <div className="text-xl font-bold text-[#1A1A1A]">{data.trends.seasonalPattern.fall}%</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-sm font-medium text-[#555555] mb-1">Winter</div>
              <div className="text-xl font-bold text-[#1A1A1A]">{data.trends.seasonalPattern.winter}%</div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
}