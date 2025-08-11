'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Cloud, Droplets, Thermometer, Wind, Sun, Download, 
  RefreshCw, TrendingUp, TrendingDown, AlertTriangle,
  Zap, Activity
} from 'lucide-react';

interface WeatherImpactData {
  summary: {
    overallImpact: 'positive' | 'neutral' | 'negative';
    impactScore: number;
    criticalEvents: number;
    avgTemperature: number;
    totalRainfall: number;
    stressDays: number;
  };
  impacts: {
    temperature: {
      effect: 'beneficial' | 'neutral' | 'harmful';
      score: number;
      details: string;
    };
    precipitation: {
      effect: 'beneficial' | 'neutral' | 'harmful';
      score: number;
      details: string;
    };
    humidity: {
      effect: 'beneficial' | 'neutral' | 'harmful';
      score: number;
      details: string;
    };
    wind: {
      effect: 'beneficial' | 'neutral' | 'harmful';
      score: number;
      details: string;
    };
  };
  events: Array<{
    date: string;
    type: 'drought' | 'flood' | 'frost' | 'heat' | 'storm';
    severity: 'low' | 'medium' | 'high';
    impact: string;
    yieldEffect: number;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    benefit: string;
    timeframe: string;
  }>;
}

interface WeatherImpactReportProps {
  farmId: string;
}

export function WeatherImpactReport({ farmId }: WeatherImpactReportProps) {
  const [data, setData] = useState<WeatherImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchWeatherImpactData();
  }, [farmId]);

  const fetchWeatherImpactData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/weather-impact?farmId=${farmId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        setData(getMockWeatherData());
      }
    } catch (error) {
      console.error('Error fetching weather impact data:', error);
      setData(getMockWeatherData());
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
          type: 'weather-impact',
          format: 'pdf'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather-impact-report-${new Date().toISOString().split('T')[0]}.pdf`;
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

  const getMockWeatherData = (): WeatherImpactData => ({
    summary: {
      overallImpact: 'positive',
      impactScore: 78,
      criticalEvents: 2,
      avgTemperature: 22.5,
      totalRainfall: 485,
      stressDays: 12
    },
    impacts: {
      temperature: {
        effect: 'beneficial',
        score: 85,
        details: 'Optimal temperature range maintained for 85% of growing season'
      },
      precipitation: {
        effect: 'neutral',
        score: 72,
        details: 'Above average rainfall with good distribution throughout season'
      },
      humidity: {
        effect: 'beneficial',
        score: 80,
        details: 'Humidity levels favorable for crop development with minimal disease pressure'
      },
      wind: {
        effect: 'neutral',
        score: 68,
        details: 'Moderate wind speeds, occasional high winds during storm events'
      }
    },
    events: [
      {
        date: '2024-06-15',
        type: 'drought',
        severity: 'medium',
        impact: '2-week dry period during critical growth phase',
        yieldEffect: -8.5
      },
      {
        date: '2024-08-03',
        type: 'storm',
        severity: 'low',
        impact: 'Heavy rainfall and wind, minimal crop damage',
        yieldEffect: -2.1
      }
    ],
    recommendations: [
      {
        priority: 'high',
        action: 'Install supplemental irrigation for drought resilience',
        benefit: 'Reduce yield risk by 15-20% during dry periods',
        timeframe: 'Before next growing season'
      },
      {
        priority: 'medium',
        action: 'Implement windbreaks on exposed field edges',
        benefit: 'Protect crops from wind damage and reduce evaporation',
        timeframe: 'Next 2-3 years'
      },
      {
        priority: 'low',
        action: 'Consider heat-tolerant varieties for changing climate',
        benefit: 'Maintain yields under increasing temperature stress',
        timeframe: 'Next 3-5 years'
      }
    ]
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getEffectColor = (effect: string) => {
    switch (effect) {
      case 'beneficial': return 'text-green-600';
      case 'harmful': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getEffectIcon = (effect: string) => {
    switch (effect) {
      case 'beneficial': return <TrendingUp className="h-4 w-4" />;
      case 'harmful': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'drought': return <Sun className="h-4 w-4 text-orange-600" />;
      case 'flood': return <Droplets className="h-4 w-4 text-blue-600" />;
      case 'frost': return <Thermometer className="h-4 w-4 text-blue-400" />;
      case 'heat': return <Zap className="h-4 w-4 text-red-600" />;
      case 'storm': return <Wind className="h-4 w-4 text-gray-600" />;
      default: return <Cloud className="h-4 w-4 text-gray-600" />;
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
        <p className="text-gray-600">Unable to load weather impact data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Weather Impact Analysis</h3>
          <p className="text-sm text-gray-600">How weather conditions affected your crops this season</p>
        </div>
        <Button
          onClick={generateReport}
          disabled={generating}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {generating ? 'Generating...' : 'Download Report'}
        </Button>
      </div>

      {/* Summary */}
      <Card className={`border-2 ${getImpactColor(data.summary.overallImpact)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{data.summary.impactScore}%</div>
              <p className="text-xs text-gray-600">Impact Score</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{data.summary.criticalEvents}</div>
              <p className="text-xs text-gray-600">Critical Events</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{data.summary.avgTemperature}°C</div>
              <p className="text-xs text-gray-600">Avg Temperature</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{data.summary.totalRainfall}mm</div>
              <p className="text-xs text-gray-600">Total Rainfall</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{data.summary.stressDays}</div>
              <p className="text-xs text-gray-600">Stress Days</p>
            </div>
            <div className={`text-2xl font-bold capitalize ${getEffectColor(data.summary.overallImpact)}`}>
              {data.summary.overallImpact}
            </div>
            <p className="text-xs text-gray-600">Overall Impact</p>
          </div>
        </CardContent>
      </Card>

      {/* Weather Factors Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Factor Analysis</CardTitle>
          <CardDescription>How different weather conditions affected crop performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.impacts).map(([factor, impact]) => (
              <div key={factor} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getEffectColor(impact.effect)} bg-opacity-10`}>
                    {factor === 'temperature' && <Thermometer className="h-5 w-5" />}
                    {factor === 'precipitation' && <Droplets className="h-5 w-5" />}
                    {factor === 'humidity' && <Cloud className="h-5 w-5" />}
                    {factor === 'wind' && <Wind className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{factor}</span>
                      <span className={`flex items-center gap-1 ${getEffectColor(impact.effect)}`}>
                        {getEffectIcon(impact.effect)}
                        <span className="text-sm capitalize">{impact.effect}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{impact.details}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${getEffectColor(impact.effect)}`}>
                    {impact.score}%
                  </div>
                  <Progress 
                    value={impact.score} 
                    className="w-20 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Weather Events */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Weather Events</CardTitle>
          <CardDescription>Significant weather events that impacted crop yield</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.events.map((event, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{event.type}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${event.yieldEffect >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {event.yieldEffect >= 0 ? '+' : ''}{event.yieldEffect.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600">Yield impact</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{event.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Climate Adaptation Recommendations</CardTitle>
          <CardDescription>Actions to improve weather resilience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 border-2 rounded-lg ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium">{rec.action}</div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                    {rec.priority} priority
                  </span>
                </div>
                <p className="text-sm mb-2">{rec.benefit}</p>
                <p className="text-xs text-gray-600">Timeline: {rec.timeframe}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}