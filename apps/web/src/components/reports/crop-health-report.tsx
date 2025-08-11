'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Leaf, Activity, TrendingUp, TrendingDown, Download, 
  RefreshCw, AlertTriangle, Target, Zap, Eye,
  BarChart3, Satellite, Brain
} from 'lucide-react';

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
    affectedFields: string[];
    actionRequired: string;
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
        setData(getMockHealthData());
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      setData(getMockHealthData());
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

  const getMockHealthData = (): CropHealthData => ({
    summary: {
      overallHealth: 87,
      avgNDVI: 0.78,
      stressedArea: 8.5,
      healthyArea: 91.5,
      improvementTrend: 12.3
    },
    fieldAnalysis: [
      {
        fieldId: '1',
        fieldName: 'North Field',
        cropType: 'Corn',
        healthScore: 92,
        ndvi: 0.82,
        stressFactors: [
          { type: 'drought', severity: 15, affected_area: 2.3 },
          { type: 'nutrient', severity: 8, affected_area: 1.1 }
        ],
        recommendations: [
          'Monitor soil moisture in southwest section',
          'Consider nitrogen application in low-NDVI areas'
        ]
      },
      {
        fieldId: '2',
        fieldName: 'South Field',
        cropType: 'Soybeans',
        healthScore: 85,
        ndvi: 0.75,
        stressFactors: [
          { type: 'disease', severity: 22, affected_area: 3.7 },
          { type: 'pest', severity: 12, affected_area: 1.8 }
        ],
        recommendations: [
          'Apply fungicide to affected areas',
          'Increase pest scouting frequency'
        ]
      }
    ],
    trends: {
      healthHistory: [
        { date: '2024-05-01', avgHealth: 72, ndvi: 0.65 },
        { date: '2024-06-01', avgHealth: 81, ndvi: 0.73 },
        { date: '2024-07-01', avgHealth: 87, ndvi: 0.78 },
        { date: '2024-08-01', avgHealth: 89, ndvi: 0.82 }
      ],
      seasonalPattern: {
        spring: 75,
        summer: 88,
        fall: 82,
        winter: 45
      }
    },
    alerts: [
      {
        level: 'medium',
        message: 'Disease pressure detected in South Field',
        affectedFields: ['South Field'],
        actionRequired: 'Apply preventive fungicide within 48 hours'
      },
      {
        level: 'low',
        message: 'Minor nutrient deficiency in North Field',
        affectedFields: ['North Field'],
        actionRequired: 'Plan fertilizer application for next week'
      }
    ]
  });

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBackground = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStressColor = (severity: number) => {
    if (severity <= 10) return 'text-green-600';
    if (severity <= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStressIcon = (type: string) => {
    switch (type) {
      case 'drought': return <Zap className="h-4 w-4 text-orange-600" />;
      case 'disease': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'nutrient': return <Target className="h-4 w-4 text-blue-600" />;
      case 'pest': return <Eye className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
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
        <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Unable to load crop health data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Crop Health Analysis</h3>
          <p className="text-sm text-gray-600">Satellite-based vegetation health monitoring and analysis</p>
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

      {/* Health Summary */}
      <Card className={`border-2 ${getHealthBackground(data.summary.overallHealth)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Overall Crop Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className={`text-3xl font-bold ${getHealthColor(data.summary.overallHealth)}`}>
                {data.summary.overallHealth}%
              </div>
              <p className="text-xs text-gray-600">Overall Health</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{data.summary.avgNDVI.toFixed(2)}</div>
              <p className="text-xs text-gray-600">Avg NDVI</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{data.summary.healthyArea.toFixed(1)}%</div>
              <p className="text-xs text-gray-600">Healthy Area</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">{data.summary.stressedArea.toFixed(1)}%</div>
              <p className="text-xs text-gray-600">Stressed Area</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {data.summary.improvementTrend >= 0 ? '+' : ''}{data.summary.improvementTrend.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600">Trend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Field-by-Field Analysis</CardTitle>
          <CardDescription>Detailed health assessment for each field</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.fieldAnalysis.map((field) => (
              <div key={field.fieldId} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{field.fieldName}</h4>
                    <p className="text-sm text-gray-600">{field.cropType}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getHealthColor(field.healthScore)}`}>
                      {field.healthScore}%
                    </div>
                    <p className="text-xs text-gray-600">Health Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Health Metrics */}
                  <div>
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Satellite className="h-4 w-4" />
                      Vegetation Metrics
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">NDVI Index:</span>
                        <span className="font-medium">{field.ndvi.toFixed(3)}</span>
                      </div>
                      <Progress value={field.ndvi * 100} className="mt-1" />
                    </div>
                  </div>

                  {/* Stress Factors */}
                  <div>
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Stress Factors
                    </h5>
                    <div className="space-y-2">
                      {field.stressFactors.map((stress, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStressIcon(stress.type)}
                            <span className="text-sm capitalize">{stress.type}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${getStressColor(stress.severity)}`}>
                              {stress.severity}%
                            </span>
                            <p className="text-xs text-gray-500">{stress.affected_area}ha</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-4">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Recommendations
                  </h5>
                  <div className="space-y-1">
                    {field.recommendations.map((rec, index) => (
                      <p key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>Historical health patterns and seasonal analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Historical Trend */}
            <div>
              <h5 className="font-medium mb-3">Health History</h5>
              <div className="space-y-2">
                {data.trends.healthHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{new Date(entry.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getHealthColor(entry.avgHealth)}`}>
                        {entry.avgHealth}%
                      </span>
                      <span className="text-xs text-gray-500">NDVI: {entry.ndvi.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seasonal Pattern */}
            <div>
              <h5 className="font-medium mb-3">Seasonal Patterns</h5>
              <div className="space-y-3">
                {Object.entries(data.trends.seasonalPattern).map(([season, value]) => (
                  <div key={season} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{season}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={value} className="w-20" />
                      <span className={`text-sm font-medium ${getHealthColor(value)}`}>
                        {value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Current Health Alerts</CardTitle>
          <CardDescription>Issues requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.alerts.map((alert, index) => (
              <div key={index} className={`p-4 border-2 rounded-lg ${getAlertColor(alert.level)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-sm opacity-75">
                      Affected: {alert.affectedFields.join(', ')}
                    </div>
                  </div>
                  <Badge className={getAlertColor(alert.level)}>
                    {alert.level}
                  </Badge>
                </div>
                <p className="text-sm font-medium mt-2">
                  Action Required: {alert.actionRequired}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}