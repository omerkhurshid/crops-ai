'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, TrendingDown, Download, Eye, ArrowRight,
  BarChart3, Leaf, DollarSign, CloudRain, TreePine
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Link from 'next/link';
// Farm Performance Preview Card
export function FarmPerformancePreview({ farmId }: { farmId: string }) {
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchPerformanceData() {
      try {
        const response = await fetch(`/api/reports/performance-summary?farmId=${farmId}`)
        if (response.ok) {
          const data = await response.json()
          setPerformanceData(data)
        }
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPerformanceData()
  }, [farmId])
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-[#DDE4D8] rounded"></div>
          <div className="h-4 bg-[#DDE4D8] rounded"></div>
          <div className="h-16 bg-[#DDE4D8] rounded"></div>
        </div>
      </div>
    )
  }
  if (!performanceData) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50 text-sage-400" />
          <h3 className="text-lg font-semibold mb-2 text-[#555555]">No performance data available yet</h3>
          <p className="text-[#555555]">Performance reports will appear here once data is collected.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F8FAF8] rounded-full flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-[#1A1A1A]">{performanceData.overallScore || 'N/A'}%</span>
        </div>
        <Badge variant="outline" className="bg-[#F8FAF8] text-green-700 border-[#DDE4D8]">
          {performanceData.monthlyChange || 'No data'}
        </Badge>
      </div>
      <p className="text-sm text-[#555555]">
        {performanceData.summary || 'Performance summary not available'}
      </p>
      <div className="flex gap-4 text-center">
        <div className="flex-1">
          <div className="text-lg font-semibold text-[#1A1A1A]">{performanceData.yield || 'N/A'}</div>
          <div className="text-xs text-[#555555]">bu/acre yield</div>
        </div>
        <div className="flex-1 border-x border-[#DDE4D8]">
          <div className="text-lg font-semibold text-[#1A1A1A]">{performanceData.cost || 'N/A'}</div>
          <div className="text-xs text-[#555555]">cost/acre</div>
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-[#1A1A1A]">{performanceData.profit || 'N/A'}</div>
          <div className="text-xs text-[#555555]">profit/acre</div>
        </div>
      </div>
      <Link href={`/reports/performance/${farmId}`} className="block">
        <Button className="w-full bg-[#5E6F5A] hover:bg-[#7A8F78]">
          <Eye className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </Link>
    </div>
  );
}
// Weather Impact Preview Card
export function WeatherImpactPreview({ farmId }: { farmId: string }) {
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetchWeatherData() {
      try {
        const response = await fetch(`/api/reports/weather-impact?farmId=${farmId}`)
        if (response.ok) {
          const data = await response.json()
          setWeatherData(data)
        }
      } catch (error) {
        console.error('Failed to fetch weather data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchWeatherData()
  }, [farmId])
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-[#DDE4D8] rounded"></div>
          <div className="h-4 bg-[#DDE4D8] rounded"></div>
          <div className="h-20 bg-[#DDE4D8] rounded"></div>
        </div>
      </div>
    )
  }
  if (!weatherData) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <CloudRain className="h-12 w-12 mx-auto mb-4 opacity-50 text-sage-400" />
          <h3 className="text-lg font-semibold mb-2 text-[#555555]">No weather impact data available yet</h3>
          <p className="text-[#555555]">Weather reports will appear here once data is collected.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudRain className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-[#1A1A1A]">Weather Impact</span>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {weatherData.status || 'N/A'}
        </Badge>
      </div>
      <p className="text-sm text-[#555555]">
        {weatherData.summary || 'Weather impact summary not available'}
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555555]">Rainfall</span>
          <span className="font-medium text-[#1A1A1A]">{weatherData.rainfall || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555555]">Temperature</span>
          <span className="font-medium text-[#1A1A1A]">{weatherData.temperature || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#555555]">Frost Risk</span>
          <span className="font-medium text-green-600">{weatherData.frostRisk || 'N/A'}</span>
        </div>
      </div>
      <Link href={`/reports/weather/${farmId}`} className="block">
        <Button className="w-full bg-[#5E6F5A] hover:bg-[#7A8F78]">
          <Eye className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </Link>
    </div>
  );
}
// Crop Health Preview Card
export function CropHealthPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F8FAF8] rounded-full flex items-center justify-center">
            <Leaf className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-[#1A1A1A]">84%</span>
        </div>
        <Badge variant="outline" className="bg-[#F8FAF8] text-green-700 border-[#DDE4D8]">
          Healthy
        </Badge>
      </div>
      <p className="text-sm text-[#555555]">
        Most of your crops are healthy with minor stress areas
      </p>
      <div className="space-y-2">
        <div className="w-full bg-[#F8FAF8] rounded-full h-2">
          <div className="bg-[#8FBF7F] h-2 rounded-full" style={{ width: '88%' }}></div>
        </div>
        <div className="flex justify-between text-xs text-[#555555]">
          <span>88% Healthy</span>
          <span>12% Stressed</span>
        </div>
      </div>
      <div className="text-sm text-[#555555]">
        <span className="font-medium">Top Issue:</span> Water stress in South Field
      </div>
      <Link href={`/reports/crop-health/${farmId}`} className="block">
        <Button className="w-full bg-[#5E6F5A] hover:bg-[#7A8F78]">
          <Eye className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </Link>
    </div>
  );
}
// Financial Summary Preview Card
export function FinancialSummaryPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-[#555555]" />
          <span className="text-lg font-semibold text-[#1A1A1A]">Financial Health</span>
        </div>
        <Badge variant="outline" className="bg-[#F8FAF8] text-green-700 border-[#DDE4D8]">
          Profitable
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F8FAF8] p-3 rounded-lg">
          <div className="text-xs text-green-600 mb-1">Revenue</div>
          <div className="text-lg font-bold text-green-700">$187,500</div>
          <div className="text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +12% YTD
          </div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-xs text-orange-600 mb-1">Expenses</div>
          <div className="text-lg font-bold text-orange-700">$125,000</div>
          <div className="text-xs text-orange-600 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            -8% YTD
          </div>
        </div>
      </div>
      <div className="text-center p-3 bg-[#F8FAF8] rounded-lg">
        <div className="text-xs text-[#555555] mb-1">Net Profit</div>
        <div className="text-xl font-bold text-[#1A1A1A]">$62,500</div>
      </div>
      <Link href={`/reports/financial/${farmId}`} className="block">
        <Button className="w-full bg-[#5E6F5A] hover:bg-[#7A8F78]">
          <Eye className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </Link>
    </div>
  );
}
// Sustainability Preview Card
export function SustainabilityPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TreePine className="h-6 w-6 text-green-600" />
          <span className="text-lg font-semibold text-[#1A1A1A]">Sustainability</span>
        </div>
        <Badge variant="outline" className="bg-[#F8FAF8] text-green-700 border-[#DDE4D8]">
          B+ Score
        </Badge>
      </div>
      <p className="text-sm text-[#555555]">
        Good environmental practices with room for improvement
      </p>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#555555]">Water Efficiency</span>
            <span className="font-medium text-[#1A1A1A]">78%</span>
          </div>
          <div className="w-full bg-[#F8FAF8] rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#555555]">Carbon Footprint</span>
            <span className="font-medium text-[#1A1A1A]">-15%</span>
          </div>
          <div className="w-full bg-[#F8FAF8] rounded-full h-1.5">
            <div className="bg-[#8FBF7F] h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#555555]">Soil Health</span>
            <span className="font-medium text-[#1A1A1A]">Good</span>
          </div>
          <div className="w-full bg-[#F8FAF8] rounded-full h-1.5">
            <div className="bg-[#8FBF7F] h-1.5 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
      </div>
      <Link href={`/reports/sustainability/${farmId}`} className="block">
        <Button className="w-full bg-[#5E6F5A] hover:bg-[#7A8F78]">
          <Eye className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </Link>
    </div>
  );
}
// Custom Report Builder Preview
export function CustomReportPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <BarChart3 className="h-12 w-12 text-sage-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
          Build Custom Reports
        </h3>
        <p className="text-sm text-[#555555]">
          Select metrics and date ranges to create personalized insights
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-[#555555]">
          <span className="w-5 h-5 bg-[#F8FAF8] rounded-full flex items-center justify-center text-xs">1</span>
          <span>Choose report template</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#555555]">
          <span className="w-5 h-5 bg-[#F8FAF8] rounded-full flex items-center justify-center text-xs">2</span>
          <span>Select metrics to include</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#555555]">
          <span className="w-5 h-5 bg-[#F8FAF8] rounded-full flex items-center justify-center text-xs">3</span>
          <span>Set date range</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#555555]">
          <span className="w-5 h-5 bg-[#F8FAF8] rounded-full flex items-center justify-center text-xs">4</span>
          <span>Generate & download</span>
        </div>
      </div>
      <Link href={`/reports/custom/${farmId}`} className="block">
        <Button className="w-full bg-[#5E6F5A] hover:bg-[#7A8F78]">
          <ArrowRight className="h-4 w-4 mr-2" />
          Create Custom Report
        </Button>
      </Link>
    </div>
  );
}