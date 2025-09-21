'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TrafficLightStatus } from '../ui/traffic-light-status';
import { InfoTooltip } from '../ui/info-tooltip';
import { 
  TrendingUp, TrendingDown, Eye, ArrowRight,
  BarChart3, Leaf, DollarSign, CloudRain, TreePine, Users,
  CheckCircle, AlertCircle, ThumbsUp, Target, Plus
} from 'lucide-react';
import Link from 'next/link';

// Farm Performance Preview Card - Farmer-Friendly Version
export function FarmPerformancePreview({ farmId }: { farmId: string }) {
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch(`/api/reports/performance/${farmId}`)
        if (response.ok) {
          const data = await response.json()
          setPerformanceData(data)
        }
      } catch (error) {
        console.error('Error fetching performance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [farmId])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <BarChart3 className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900 mb-1">No Performance Data</p>
          <p className="text-sm text-gray-600">Add crop yields and expenses to track performance</p>
        </div>
        <Link href={`/reports/performance/${farmId}`} className="block">
          <Button className="bg-sage-700 hover:bg-sage-800">
            <Plus className="h-4 w-4 mr-2" />
            Start Tracking
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-sage-800">Farm Performance</p>
            <p className="text-sm text-sage-600">Current season metrics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-xl font-bold text-green-600">{performanceData.yieldPerAcre || 'N/A'}</div>
          <div className="text-xs text-sage-600">yield per acre</div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-xl font-bold text-red-600">{performanceData.costPerAcre || 'N/A'}</div>
          <div className="text-xs text-sage-600">cost per acre</div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-xl font-bold text-blue-600">{performanceData.profitPerAcre || 'N/A'}</div>
          <div className="text-xs text-sage-600">profit per acre</div>
        </div>
      </div>

      <Link href={`/reports/performance/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          View Detailed Performance
        </Button>
      </Link>
    </div>
  );
}

// Weather Impact Preview Card - Farmer-Friendly Version
export function WeatherImpactPreview({ farmId }: { farmId: string }) {
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(`/api/reports/weather-impact/${farmId}`)
        if (response.ok) {
          const data = await response.json()
          setWeatherData(data)
        }
      } catch (error) {
        console.error('Error fetching weather impact data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [farmId])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!weatherData) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <CloudRain className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900 mb-1">No Weather Data</p>
          <p className="text-sm text-gray-600">Enable weather tracking for insights</p>
        </div>
        <Link href={`/weather`} className="block">
          <Button className="bg-sage-700 hover:bg-sage-800">
            <Plus className="h-4 w-4 mr-2" />
            Setup Weather
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CloudRain className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-lg font-semibold text-sage-800">Weather Impact</p>
            <p className="text-sm text-sage-600">Last 30 days analysis</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-sage-200 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sage-800">Rainfall Impact</span>
            <span className={`text-sm ${
              weatherData.rainfallImpact === 'positive' ? 'text-green-600' : 
              weatherData.rainfallImpact === 'negative' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {weatherData.rainfallAmount} mm
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sage-800">Temperature Stress</span>
            <span className={`text-sm ${
              weatherData.temperatureStress === 'low' ? 'text-green-600' : 
              weatherData.temperatureStress === 'high' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {weatherData.temperatureStress}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sage-800">Growth Conditions</span>
            <span className={`text-sm ${
              weatherData.growthConditions === 'optimal' ? 'text-green-600' : 
              weatherData.growthConditions === 'poor' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {weatherData.growthConditions}
            </span>
          </div>
        </div>
      </div>

      <Link href={`/weather`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          View Weather Analytics
        </Button>
      </Link>
    </div>
  );
}

// Crop Health Preview Card - Farmer-Friendly Version  
export function CropHealthPreview({ farmId }: { farmId: string }) {
  const [cropHealthData, setCropHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCropHealthData = async () => {
      try {
        const response = await fetch(`/api/reports/crop-health/${farmId}`)
        if (response.ok) {
          const data = await response.json()
          setCropHealthData(data)
        }
      } catch (error) {
        console.error('Error fetching crop health data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCropHealthData()
  }, [farmId])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!cropHealthData) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <Leaf className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900 mb-1">No Crop Health Data</p>
          <p className="text-sm text-gray-600">Add fields and crops to monitor health</p>
        </div>
        <Link href={`/crop-health`} className="block">
          <Button className="bg-sage-700 hover:bg-sage-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Crops
          </Button>
        </Link>
      </div>
    )
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  const healthColor = getHealthColor(cropHealthData.overallHealth)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${healthColor}-100 rounded-full flex items-center justify-center`}>
            <Leaf className={`h-5 w-5 text-${healthColor}-600`} />
          </div>
          <div>
            <p className="text-lg font-semibold text-sage-800">Crop Health</p>
            <p className="text-sm text-sage-600">{cropHealthData.fieldCount} fields monitored</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-sage-600">Overall Field Health</span>
            <span className={`font-medium text-${healthColor}-600`}>{cropHealthData.overallHealth}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className={`bg-${healthColor}-500 h-3 rounded-full`} style={{ width: `${cropHealthData.overallHealth}%` }}></div>
          </div>
        </div>

        {cropHealthData.issues && cropHealthData.issues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800">{cropHealthData.issues.length} Issues Detected</p>
                <p className="text-red-700">{cropHealthData.issues[0]?.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Link href={`/crop-health`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          View Crop Health Details
        </Button>
      </Link>
    </div>
  );
}

// Financial Summary Preview Card - Farmer-Friendly Version
export function FinancialSummaryPreview({ farmId }: { farmId: string }) {
  const [financialData, setFinancialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const response = await fetch(`/api/financial/farm-summary/${farmId}`)
        if (response.ok) {
          const data = await response.json()
          setFinancialData(data)
        }
      } catch (error) {
        console.error('Error fetching financial data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [farmId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!financialData) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <DollarSign className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900 mb-1">No Financial Data</p>
          <p className="text-sm text-gray-600">Add transactions to track income and expenses</p>
        </div>
        <Link href={`/financial`} className="block">
          <Button className="bg-sage-700 hover:bg-sage-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-lg font-semibold text-sage-800">Financial Summary</p>
            <p className="text-sm text-sage-600">Current year performance</p>
          </div>
        </div>
      </div>

      <div className="text-center bg-white border border-sage-200 rounded-lg p-4">
        <div className={`text-3xl font-bold mb-1 ${
          financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatCurrency(financialData.netProfit)}
        </div>
        <div className="text-sm text-sage-600 mb-2">Net profit this year</div>
        <div className="text-xs text-sage-500">
          {financialData.transactionCount} transactions recorded
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-700">{formatCurrency(financialData.income)}</div>
          <div className="text-xs text-green-600 mb-1">Income</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-700">{formatCurrency(financialData.expenses)}</div>
          <div className="text-xs text-red-600 mb-1">Expenses</div>
        </div>
      </div>

      <Link href={`/reports/financial/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          View Financial Details
        </Button>
      </Link>
    </div>
  );
}

// Sustainability Preview Card - Farmer-Friendly Version
export function SustainabilityPreview({ farmId }: { farmId: string }) {
  const [sustainabilityData, setSustainabilityData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSustainabilityData = async () => {
      try {
        const response = await fetch(`/api/reports/sustainability/${farmId}`)
        if (response.ok) {
          const data = await response.json()
          setSustainabilityData(data)
        }
      } catch (error) {
        console.error('Error fetching sustainability data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSustainabilityData()
  }, [farmId])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!sustainabilityData) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <TreePine className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-900 mb-1">No Sustainability Data</p>
          <p className="text-sm text-gray-600">Add environmental tracking to monitor sustainability</p>
        </div>
        <Link href={`/reports/sustainability/${farmId}`} className="block">
          <Button className="bg-sage-700 hover:bg-sage-800">
            <Plus className="h-4 w-4 mr-2" />
            Start Tracking
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TreePine className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-lg font-semibold text-sage-800">Sustainability Score</p>
            <p className="text-sm text-sage-600">Environmental impact metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-600">{sustainabilityData.score || 'N/A'}</span>
          <InfoTooltip
            title="Sustainability Score"
            description="Track water use, soil health, and carbon footprint compared to similar farms."
          />
        </div>
      </div>

      <div className="space-y-3">
        {sustainabilityData.waterUsage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Water Usage</span>
              <span className="text-sm text-blue-600">{sustainabilityData.waterUsage.efficiency}% efficient</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${sustainabilityData.waterUsage.efficiency}%` }}></div>
            </div>
          </div>
        )}
        
        {sustainabilityData.carbonFootprint && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Carbon Footprint</span>
              <span className="text-sm text-green-600">{sustainabilityData.carbonFootprint.rating}</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${sustainabilityData.carbonFootprint.score}%` }}></div>
            </div>
          </div>
        )}

        {sustainabilityData.soilHealth && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-800">Soil Health</span>
              <span className="text-sm text-amber-600">{sustainabilityData.soilHealth.status}</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${sustainabilityData.soilHealth.score}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <Link href={`/reports/sustainability/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          View Sustainability Details
        </Button>
      </Link>
    </div>
  );
}

// Custom Report Builder Preview - Farmer-Friendly Version
export function CustomReportPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="h-6 w-6 text-sage-600" />
        </div>
        <h3 className="text-lg font-semibold text-sage-800 mb-2">
          Create Your Own Report
        </h3>
        <p className="text-sm text-sage-600">
          Mix and match the information that matters most to you
        </p>
      </div>

      <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
        <p className="text-sm font-medium text-sage-800 mb-3">Popular combinations:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-sage-700">
            <Target className="h-4 w-4 text-sage-600" />
            <span>Profit + Weather + Yield (Season Summary)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-sage-700">
            <Target className="h-4 w-4 text-sage-600" />
            <span>Crop Health + Soil + Sustainability (Field Report)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-sage-700">
            <Target className="h-4 w-4 text-sage-600" />
            <span>Costs + Revenue + Benchmarking (Financial Deep Dive)</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-sage-700">
          <span className="w-5 h-5 bg-sage-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
          <span>Pick what to include</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-sage-700">
          <span className="w-5 h-5 bg-sage-600 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
          <span>Choose time period</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-sage-700">
          <span className="w-5 h-5 bg-sage-600 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
          <span>Get your custom insights</span>
        </div>
      </div>

      <Link href={`/reports/custom/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <ArrowRight className="h-4 w-4 mr-2" />
          Build My Report
        </Button>
      </Link>
    </div>
  );
}