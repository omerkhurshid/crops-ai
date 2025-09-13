'use client';

import React from 'react';
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-sage-800">Farm Performance</p>
            <p className="text-sm text-sage-600">Add data to see how you're doing</p>
          </div>
        </div>
      </div>
      
      <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-sage-600" />
          <span className="text-sm font-medium text-sage-800">Get Started:</span>
        </div>
        <ul className="text-sm text-sage-700 space-y-1">
          <li>• Add crop yields to track performance</li>
          <li>• Record expenses to monitor costs</li>
          <li>• Track field activities for insights</li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-xl font-bold text-sage-800">--</div>
          <div className="text-xs text-sage-600">yield per acre</div>
          <div className="text-xs text-sage-500 mt-1">Add crop data</div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-xl font-bold text-sage-800">--</div>
          <div className="text-xs text-sage-600">cost per acre</div>
          <div className="text-xs text-sage-500 mt-1">Add expenses</div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-xl font-bold text-sage-800">--</div>
          <div className="text-xs text-sage-600">profit per acre</div>
          <div className="text-xs text-sage-500 mt-1">Data needed</div>
        </div>
      </div>

      <Link href={`/reports/performance/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          Set Up Performance Tracking
        </Button>
      </Link>
    </div>
  );
}

// Weather Impact Preview Card - Farmer-Friendly Version
export function WeatherImpactPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CloudRain className="h-8 w-8 text-gray-600" />
          <div>
            <p className="text-lg font-semibold text-sage-800">Weather Impact</p>
            <p className="text-sm text-sage-600">Connect weather data for insights</p>
          </div>
        </div>
      </div>

      <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-sage-600" />
          <span className="text-sm font-medium text-sage-800">Weather Tracking Helps You:</span>
        </div>
        <div className="space-y-2 text-sm text-sage-700">
          <div className="flex items-center justify-between">
            <span>🌧️ Plan irrigation timing</span>
            <span className="text-xs text-sage-500">Setup needed</span>
          </div>
          <div className="flex items-center justify-between">
            <span>☀️ Optimize planting dates</span>
            <span className="text-xs text-sage-500">Setup needed</span>
          </div>
          <div className="flex items-center justify-between">
            <span>❄️ Protect from frost damage</span>
            <span className="text-xs text-sage-500">Setup needed</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-sage-700">
        <span className="font-medium">Get started:</span> Connect your weather station or enable location services
      </div>

      <Link href={`/reports/weather/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          Set Up Weather Tracking
        </Button>
      </Link>
    </div>
  );
}

// Crop Health Preview Card - Farmer-Friendly Version  
export function CropHealthPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Leaf className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-sage-800">Crop Health Monitoring</p>
            <p className="text-sm text-sage-600">Add fields to track crop health</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Visual health bar - empty state */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-sage-600">Overall Field Health</span>
            <span className="font-medium text-sage-800">No data yet</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gray-300 h-3 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="flex justify-center text-xs text-sage-600 mt-1">
            <span>Add crops and fields to see health status</span>
          </div>
        </div>

        <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-sage-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-sage-800">Get Started:</p>
              <p className="text-sage-700">Add your crops and fields to monitor health, spot issues early, and get alerts.</p>
            </div>
          </div>
        </div>

        <div className="text-sm text-sage-700">
          <span className="font-medium">Coming soon:</span> Satellite monitoring and AI-powered crop health analysis
        </div>
      </div>

      <Link href={`/reports/crop-health/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          Set Up Crop Monitoring
        </Button>
      </Link>
    </div>
  );
}

// Financial Summary Preview Card - Farmer-Friendly Version
export function FinancialSummaryPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-gray-600" />
          <div>
            <p className="text-lg font-semibold text-sage-800">Financial Tracking</p>
            <p className="text-sm text-sage-600">Add transactions to track profit</p>
          </div>
        </div>
      </div>

      {/* Empty profit display */}
      <div className="text-center bg-sage-50 border border-sage-200 rounded-lg p-4">
        <div className="text-3xl font-bold text-sage-800 mb-1">$0</div>
        <div className="text-sm text-sage-600 mb-2">Total profit this year</div>
        <div className="text-xs text-sage-500 flex items-center justify-center gap-1">
          <Plus className="h-3 w-3" />
          <span>Add income and expenses to track</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-sage-700">$0</div>
          <div className="text-xs text-sage-600 mb-1">Money In</div>
          <div className="text-xs text-sage-500 flex items-center justify-center gap-1">
            <Plus className="h-3 w-3" />
            Add income
          </div>
        </div>
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-sage-700">$0</div>
          <div className="text-xs text-sage-600 mb-1">Money Out</div>
          <div className="text-xs text-sage-500 flex items-center justify-center gap-1">
            <Plus className="h-3 w-3" />
            Add expenses
          </div>
        </div>
      </div>

      <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-sage-600" />
            <span className="text-sm font-medium text-sage-800">Get Started:</span>
          </div>
          <Badge className="bg-sage-100 text-sage-700 border-sage-200">
            Track finances
          </Badge>
        </div>
      </div>

      <Link href={`/reports/financial/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          Start Tracking Finances
        </Button>
      </Link>
    </div>
  );
}

// Sustainability Preview Card - Farmer-Friendly Version
export function SustainabilityPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TreePine className="h-8 w-8 text-gray-600" />
          <div>
            <p className="text-lg font-semibold text-sage-800">Sustainability Tracking</p>
            <p className="text-sm text-sage-600">Monitor environmental impact</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-sage-800">--</span>
          <InfoTooltip
            title="Sustainability Score"
            description="Track water use, soil health, and carbon footprint compared to similar farms."
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sage-800">🌊 Water Usage</span>
            <span className="text-sm text-sage-600">Not tracked</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-300 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-sage-600 mt-1">Add irrigation data to track efficiency</p>
        </div>
        
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sage-800">🌱 Carbon Footprint</span>
            <span className="text-sm text-sage-600">Not tracked</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-300 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-sage-600 mt-1">Track fuel and fertilizer use to calculate</p>
        </div>

        <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sage-800">🏞️ Soil Health</span>
            <span className="text-sm text-sage-600">Not tracked</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-300 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-sage-600 mt-1">Add soil tests to track health metrics</p>
        </div>
      </div>

      <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 text-center">
        <div className="text-sm text-sage-700">
          <span className="font-medium">Future benefit:</span> Find government incentives and conservation payments
        </div>
      </div>

      <Link href={`/reports/sustainability/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          Learn About Sustainability
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