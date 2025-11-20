'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Satellite, TrendingUp, TrendingDown, Calendar, MapPin,
  BarChart3, Activity, Zap, Target, Eye, RefreshCw, Download
} from 'lucide-react';
interface VisualizationData {
  ndviTrends: Array<{
    date: string;
    fieldId: string;
    fieldName: string;
    ndvi: number;
    evi: number;
    savi: number;
  }>;
  stressHeatmap: Array<{
    fieldId: string;
    fieldName: string;
    zones: Array<{
      id: string;
      coordinates: [number, number];
      stressLevel: number;
      stressType: 'drought' | 'disease' | 'nutrient' | 'pest';
      severity: 'low' | 'medium' | 'high';
    }>;
  }>;
  seasonalPatterns: {
    spring: { avgNdvi: number; stressEvents: number };
    summer: { avgNdvi: number; stressEvents: number };
    fall: { avgNdvi: number; stressEvents: number };
    winter: { avgNdvi: number; stressEvents: number };
  };
  comparisonData: {
    thisYear: Array<{ month: string; health: number }>;
    lastYear: Array<{ month: string; health: number }>;
    benchmark: number;
  };
  alertHistory: Array<{
    date: string;
    type: 'health_decline' | 'stress_detected' | 'improvement' | 'threshold_breach';
    severity: 'low' | 'medium' | 'high' | 'critical';
    field: string;
    message: string;
    resolved: boolean;
  }>;
}
interface AdvancedVisualizationsProps {
  farmId: string;
}
export function AdvancedVisualizations({ farmId }: AdvancedVisualizationsProps) {
  const [data, setData] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  useEffect(() => {
    fetchVisualizationData();
  }, [farmId, selectedTimeframe]);
  const fetchVisualizationData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/crop-health/visualizations?farmId=${farmId}&timeframe=${selectedTimeframe}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching visualization data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  // Removed mock data function - only show real data from API
  const getStressColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-[#F8FAF8] text-green-800 border-[#DDE4D8]';
      default: return 'bg-[#F5F5F5] text-[#1A1A1A] border-[#E6E6E6]';
    }
  };
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'stress_detected': return <Zap className="h-4 w-4 text-orange-600" />;
      case 'health_decline': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'improvement': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'threshold_breach': return <Target className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-[#555555]" />;
    }
  };
  const exportData = () => {
  };
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-[#F5F5F5] rounded w-1/3"></div>
              <div className="h-32 bg-[#F5F5F5] rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">Visualization Data Unavailable</h3>
        <p className="text-[#555555]">Unable to load advanced visualization data.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#555555]" />
                <span className="text-sm font-medium">Timeframe:</span>
              </div>
              <div className="flex gap-1">
                {(['1m', '3m', '6m', '1y'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedTimeframe === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Advanced Visualizations */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">NDVI Trends</TabsTrigger>
          <TabsTrigger value="heatmap">Stress Heatmap</TabsTrigger>
          <TabsTrigger value="comparison">Year Comparison</TabsTrigger>
          <TabsTrigger value="alerts">Alert History</TabsTrigger>
        </TabsList>
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                NDVI Trend Analysis
              </CardTitle>
              <CardDescription>Vegetation index trends over time by field</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Field Trends */}
                {data.ndviTrends.reduce((acc, curr) => {
                  const existing = acc.find(item => item.fieldId === curr.fieldId);
                  if (!existing) {
                    acc.push({
                      fieldId: curr.fieldId,
                      fieldName: curr.fieldName,
                      data: [curr]
                    });
                  } else {
                    existing.data.push(curr);
                  }
                  return acc;
                }, [] as any[]).map((field) => (
                  <div key={field.fieldId} className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {field.fieldName}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['ndvi', 'evi', 'savi'].map((index) => (
                        <div key={index} className="p-3 bg-[#FAFAF7] rounded-lg">
                          <div className="text-center mb-2">
                            <div className="text-lg font-bold text-blue-600">
                              {field.data[field.data.length - 1][index].toFixed(3)}
                            </div>
                            <div className="text-xs text-[#555555] uppercase">{index}</div>
                          </div>
                          <div className="space-y-1">
                            {field.data.map((point: any, idx: number) => {
                              const prevValue = idx > 0 ? field.data[idx - 1][index] : point[index];
                              const change = ((point[index] - prevValue) / prevValue) * 100;
                              return (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <span>{new Date(point.date).toLocaleDateString()}</span>
                                  <div className="flex items-center gap-1">
                                    <span>{point[index].toFixed(3)}</span>
                                    {idx > 0 && (
                                      <span className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Field Stress Heatmap
              </CardTitle>
              <CardDescription>Spatial distribution of stress factors across fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.stressHeatmap.map((field) => (
                  <div key={field.fieldId} className="space-y-3">
                    <h4 className="font-semibold">{field.fieldName}</h4>
                    <div className="relative bg-[#F8FAF8] rounded-lg p-6 min-h-[200px]">
                      <div className="text-sm text-[#555555] mb-4">Field Visualization</div>
                      {/* Stress Zone Markers */}
                      {field.zones.map((zone) => (
                        <div
                          key={zone.id}
                          className="absolute w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${zone.coordinates[0] * 100}%`,
                            top: `${zone.coordinates[1] * 100}%`,
                          }}
                        >
                          <div className={`w-6 h-6 rounded-full ${getStressColor(zone.severity)}`}>
                            <span className="sr-only">{zone.stressType} - {zone.severity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      {field.zones.map((zone) => (
                        <div key={zone.id} className="flex items-center gap-2 text-xs">
                          <div className={`w-3 h-3 rounded-full ${getStressColor(zone.severity)}`}></div>
                          <span className="capitalize">{zone.stressType}</span>
                          <Badge className={getSeverityColor(zone.severity)}>
                            {zone.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Year-over-Year Comparison
              </CardTitle>
              <CardDescription>Health performance compared to previous year and benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.comparisonData.thisYear[data.comparisonData.thisYear.length - 1]?.health}%
                    </div>
                    <p className="text-sm text-[#555555]">This Year</p>
                  </div>
                  <div className="p-4 bg-[#FAFAF7] rounded-lg">
                    <div className="text-2xl font-bold text-[#555555]">
                      {data.comparisonData.lastYear[data.comparisonData.lastYear.length - 1]?.health}%
                    </div>
                    <p className="text-sm text-[#555555]">Last Year</p>
                  </div>
                  <div className="p-4 bg-[#F8FAF8] rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{data.comparisonData.benchmark}%</div>
                    <p className="text-sm text-[#555555]">Industry Benchmark</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Monthly Progress</h4>
                  {data.comparisonData.thisYear.map((month, index) => {
                    const lastYearValue = data.comparisonData.lastYear[index]?.health || 0;
                    const change = ((month.health - lastYearValue) / lastYearValue) * 100;
                    return (
                      <div key={month.month} className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded">
                        <span className="font-medium">{month.month}</span>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-[#555555]">
                            This year: <span className="font-semibold">{month.health}%</span>
                          </div>
                          <div className="text-sm text-[#555555]">
                            Last year: <span className="font-semibold">{lastYearValue}%</span>
                          </div>
                          <div className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Alert History
              </CardTitle>
              <CardDescription>Historical health alerts and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.alertHistory.map((alert, index) => (
                  <div key={index} className={`p-4 border-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type)}
                        <span className="font-medium">{alert.message}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {alert.resolved && (
                          <Badge className="bg-[#F8FAF8] text-green-800">
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-[#555555] flex items-center gap-4">
                      <span>Field: {alert.field}</span>
                      <span>Date: {new Date(alert.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Seasonal Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Seasonal Health Patterns
          </CardTitle>
          <CardDescription>Average health metrics and stress events by season</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.seasonalPatterns).map(([season, pattern]) => (
              <div key={season} className="text-center p-4 bg-[#FAFAF7] rounded-lg">
                <h4 className="font-semibold capitalize mb-2">{season}</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-lg font-bold text-green-600">{pattern.avgNdvi.toFixed(2)}</div>
                    <p className="text-xs text-[#555555]">Avg NDVI</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{pattern.stressEvents}</div>
                    <p className="text-xs text-[#555555]">Stress Events</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}