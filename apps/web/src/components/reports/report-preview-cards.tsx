'use client';

import React from 'react';
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-sage-800">87%</span>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          +5% vs last month
        </Badge>
      </div>
      
      <p className="text-sm text-sage-600">
        Your farm is performing well above average this season
      </p>

      <div className="flex gap-4 text-center">
        <div className="flex-1">
          <div className="text-lg font-semibold text-sage-800">185</div>
          <div className="text-xs text-sage-600">bu/acre yield</div>
        </div>
        <div className="flex-1 border-x border-sage-200">
          <div className="text-lg font-semibold text-sage-800">$850</div>
          <div className="text-xs text-sage-600">cost/acre</div>
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold text-sage-800">$1,250</div>
          <div className="text-xs text-sage-600">profit/acre</div>
        </div>
      </div>

      <Link href={`/reports/performance/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      </Link>
    </div>
  );
}

// Weather Impact Preview Card
export function WeatherImpactPreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudRain className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-sage-800">Weather Impact</span>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Favorable
        </Badge>
      </div>

      <p className="text-sm text-sage-600">
        Weather conditions have been mostly favorable this season
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-sage-600">Rainfall</span>
          <span className="font-medium text-sage-800">+15% above normal</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-sage-600">Temperature</span>
          <span className="font-medium text-sage-800">Optimal range</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-sage-600">Frost Risk</span>
          <span className="font-medium text-green-600">Low</span>
        </div>
      </div>

      <Link href={`/reports/weather/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
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
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Leaf className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-sage-800">84%</span>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Healthy
        </Badge>
      </div>

      <p className="text-sm text-sage-600">
        Most of your crops are healthy with minor stress areas
      </p>

      <div className="space-y-2">
        <div className="w-full bg-sage-100 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
        </div>
        <div className="flex justify-between text-xs text-sage-600">
          <span>88% Healthy</span>
          <span>12% Stressed</span>
        </div>
      </div>

      <div className="text-sm text-sage-700">
        <span className="font-medium">Top Issue:</span> Water stress in South Field
      </div>

      <Link href={`/reports/crop-health/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
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
          <DollarSign className="h-6 w-6 text-sage-600" />
          <span className="text-lg font-semibold text-sage-800">Financial Health</span>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Profitable
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 p-3 rounded-lg">
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

      <div className="text-center p-3 bg-sage-50 rounded-lg">
        <div className="text-xs text-sage-600 mb-1">Net Profit</div>
        <div className="text-xl font-bold text-sage-800">$62,500</div>
      </div>

      <Link href={`/reports/financial/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
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
          <span className="text-lg font-semibold text-sage-800">Sustainability</span>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          B+ Score
        </Badge>
      </div>

      <p className="text-sm text-sage-600">
        Good environmental practices with room for improvement
      </p>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-sage-600">Water Efficiency</span>
            <span className="font-medium text-sage-800">78%</span>
          </div>
          <div className="w-full bg-sage-100 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-sage-600">Carbon Footprint</span>
            <span className="font-medium text-sage-800">-15%</span>
          </div>
          <div className="w-full bg-sage-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-sage-600">Soil Health</span>
            <span className="font-medium text-sage-800">Good</span>
          </div>
          <div className="w-full bg-sage-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
          </div>
        </div>
      </div>

      <Link href={`/reports/sustainability/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
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
        <h3 className="text-lg font-semibold text-sage-800 mb-2">
          Build Custom Reports
        </h3>
        <p className="text-sm text-sage-600">
          Select metrics and date ranges to create personalized insights
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-sage-700">
          <span className="w-5 h-5 bg-sage-100 rounded-full flex items-center justify-center text-xs">1</span>
          <span>Choose report template</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-sage-700">
          <span className="w-5 h-5 bg-sage-100 rounded-full flex items-center justify-center text-xs">2</span>
          <span>Select metrics to include</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-sage-700">
          <span className="w-5 h-5 bg-sage-100 rounded-full flex items-center justify-center text-xs">3</span>
          <span>Set date range</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-sage-700">
          <span className="w-5 h-5 bg-sage-100 rounded-full flex items-center justify-center text-xs">4</span>
          <span>Generate & download</span>
        </div>
      </div>

      <Link href={`/reports/custom/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <ArrowRight className="h-4 w-4 mr-2" />
          Create Custom Report
        </Button>
      </Link>
    </div>
  );
}