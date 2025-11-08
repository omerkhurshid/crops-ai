'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Cloud, 
  DollarSign,
  BarChart3,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
interface Forecast {
  id: string;
  forecastDate: string;
  forecastType: string;
  predictedYield?: number;
  predictedPrice?: number;
  predictedRevenue?: number;
  predictedCost?: number;
  confidenceScore: number;
  assumptions?: any;
}
interface ForecastViewProps {
  farmId: string;
  onRefresh: () => void;
}
export function ForecastView({ farmId, onRefresh }: ForecastViewProps) {
  const [forecasts, setForecasts] = useState<Record<string, Forecast[]>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scenario, setScenario] = useState<'optimistic' | 'realistic' | 'pessimistic'>('realistic');
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => {
    fetchForecasts();
  }, [farmId]);
  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/financial/forecast?farmId=${farmId}&forecastHorizon=3`);
      if (response.ok) {
        const data = await response.json();
        setForecasts(data.forecasts || {});
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching forecasts:', error);
    } finally {
      setLoading(false);
    }
  };
  const generateForecast = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/financial/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          options: {
            includeWeatherImpact: true,
            includeMarketTrends: true,
            scenarioType: scenario,
          },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        await fetchForecasts(); // Refresh forecasts
        onRefresh(); // Refresh parent dashboard
      } else {
        alert('Failed to generate forecast');
      }
    } catch (error) {
      console.error('Error generating forecast:', error);
      alert('Failed to generate forecast');
    } finally {
      setGenerating(false);
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };
  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'optimistic':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pessimistic':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  const revenueForecasts = forecasts.revenue || [];
  const costForecasts = forecasts.cost || [];
  const totalPredictedRevenue = revenueForecasts.reduce(
    (sum, f) => sum + (f.predictedRevenue || 0), 0
  );
  const totalPredictedCost = costForecasts.reduce(
    (sum, f) => sum + (f.predictedCost || 0), 0
  );
  const predictedProfit = totalPredictedRevenue - totalPredictedCost;
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Forecast</h3>
            <p className="text-gray-600">
              AI-powered predictions based on satellite data, weather patterns, and market trends
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={scenario} onValueChange={(value: any) => setScenario(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="optimistic">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Optimistic</span>
                  </div>
                </SelectItem>
                <SelectItem value="realistic">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Realistic</span>
                  </div>
                </SelectItem>
                <SelectItem value="pessimistic">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4" />
                    <span>Pessimistic</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={generateForecast}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Forecast
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
      {/* Forecast Summary */}
      {(revenueForecasts.length > 0 || costForecasts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Predicted Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPredictedRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Next 3 months</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Predicted Costs</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalPredictedCost)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Next 3 months</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${
                  predictedProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(predictedProfit)}
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${
                predictedProfit >= 0 ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Projected profit</p>
          </Card>
        </div>
      )}
      {/* Detailed Forecasts */}
      {revenueForecasts.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Revenue Forecasts
          </h4>
          <div className="space-y-3">
            {revenueForecasts.map((forecast) => (
              <div key={forecast.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{formatDate(forecast.forecastDate)}</span>
                    <Badge className={getScenarioColor(forecast.assumptions?.scenario || 'realistic')}>
                      {forecast.assumptions?.scenario || 'Realistic'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className={getConfidenceColor(forecast.confidenceScore)}>
                      {forecast.confidenceScore.toFixed(0)}% confidence
                    </span>
                    {forecast.assumptions?.avgNDVI && (
                      <span className="flex items-center space-x-1">
                        <span>🛰️</span>
                        <span>NDVI: {(forecast.assumptions.avgNDVI * 100).toFixed(0)}%</span>
                      </span>
                    )}
                    {forecast.assumptions?.weatherImpact && (
                      <span className="flex items-center space-x-1">
                        <Cloud className="h-3 w-3" />
                        <span>Weather factor</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(forecast.predictedRevenue || 0)}
                  </p>
                  {forecast.predictedYield && (
                    <p className="text-xs text-gray-500">
                      Est. yield: {forecast.predictedYield.toFixed(1)} t/ha
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* Cost Forecasts */}
      {costForecasts.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
            Cost Forecasts
          </h4>
          <div className="space-y-3">
            {costForecasts.map((forecast) => (
              <div key={forecast.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{formatDate(forecast.forecastDate)}</span>
                    <Badge className={getScenarioColor(forecast.assumptions?.scenario || 'realistic')}>
                      {forecast.assumptions?.scenario || 'Realistic'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className={getConfidenceColor(forecast.confidenceScore)}>
                      {forecast.confidenceScore.toFixed(0)}% confidence
                    </span>
                    <span>
                      Based on {forecast.assumptions?.historicalMonths || 12} months of data
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(forecast.predictedCost || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* No Forecasts State */}
      {revenueForecasts.length === 0 && costForecasts.length === 0 && (
        <Card className="p-12 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecasts Available</h3>
          <p className="text-gray-600 mb-6">
            Generate AI-powered financial forecasts based on your farm data, satellite imagery, and market trends.
          </p>
          <Button
            onClick={generateForecast}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Forecast...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Your First Forecast
              </>
            )}
          </Button>
        </Card>
      )}
      {/* Disclaimer */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 mb-1">Forecast Disclaimer</p>
            <p className="text-amber-700">
              These forecasts are AI-generated predictions based on historical data, satellite imagery, and market trends. 
              Actual results may vary due to weather, market conditions, and other factors beyond our control.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}