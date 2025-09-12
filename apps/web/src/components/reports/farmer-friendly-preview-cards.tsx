'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TrafficLightStatus } from '../ui/traffic-light-status';
import { InfoTooltip } from '../ui/info-tooltip';
import { 
  TrendingUp, TrendingDown, Eye, ArrowRight,
  BarChart3, Leaf, DollarSign, CloudRain, TreePine, Users,
  CheckCircle, AlertCircle, ThumbsUp, Target
} from 'lucide-react';
import Link from 'next/link';

// Farm Performance Preview Card - Farmer-Friendly Version
export function FarmPerformancePreview({ farmId }: { farmId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <ThumbsUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-sage-800">Your Farm is Doing Great!</p>
            <p className="text-sm text-sage-600">Better than 8 out of 10 similar farms</p>
          </div>
        </div>
        <TrafficLightStatus 
          status="excellent"
          size="md"
          showText={false}
        />
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Key Wins This Season:</span>
        </div>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Your yield is 15% higher than neighbors</li>
          <li>• You're spending 8% less per acre than average</li>
          <li>• Profit margins are in the top 20% for your region</li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-xl font-bold text-sage-800">185</div>
          <div className="text-xs text-sage-600">bushels per acre</div>
          <div className="text-xs text-green-600 mt-1">+15% vs area avg</div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-xl font-bold text-sage-800">$850</div>
          <div className="text-xs text-sage-600">cost per acre</div>
          <div className="text-xs text-green-600 mt-1">-8% vs area avg</div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-xl font-bold text-sage-800">$400</div>
          <div className="text-xs text-sage-600">profit per acre</div>
          <div className="text-xs text-green-600 mt-1">Top 20%</div>
        </div>
      </div>

      <Link href={`/reports/performance/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          See How You Compare to Others
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
          <CloudRain className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-lg font-semibold text-sage-800">Weather Was Your Friend</p>
            <p className="text-sm text-sage-600">Mother Nature helped boost your yields</p>
          </div>
        </div>
        <TrafficLightStatus 
          status="good"
          size="md"
          showText={false}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">What Went Right:</span>
        </div>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-center justify-between">
            <span>🌧️ Rain came just when crops needed it</span>
            <span className="font-medium">+15% above normal</span>
          </div>
          <div className="flex items-center justify-between">
            <span>☀️ Temperatures stayed in the sweet spot</span>
            <span className="font-medium">Perfect range</span>
          </div>
          <div className="flex items-center justify-between">
            <span>❄️ No frost scares this season</span>
            <span className="font-medium text-green-600">Zero risk</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-sage-700">
        <span className="font-medium">Bottom line:</span> Good weather likely added $45/acre to your profit
      </div>

      <Link href={`/reports/weather/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          See Full Weather Story
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
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Leaf className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-sage-800">Most Crops Look Healthy</p>
            <p className="text-sm text-sage-600">A few spots need your attention</p>
          </div>
        </div>
        <TrafficLightStatus 
          status="good"
          size="md"
          showText={false}
        />
      </div>

      <div className="space-y-3">
        {/* Visual health bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-sage-600">Overall Field Health</span>
            <span className="font-medium text-sage-800">88% Good</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full relative" style={{ width: '88%' }}>
              <div className="absolute right-0 top-0 h-3 w-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-r-full"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-sage-600 mt-1">
            <span>✅ 88% Thriving</span>
            <span>⚠️ 12% Needs help</span>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">Action Needed:</p>
              <p className="text-orange-700">South Field shows water stress signs. Check irrigation system.</p>
            </div>
          </div>
        </div>

        <div className="text-sm text-sage-700">
          <span className="font-medium">Good news:</span> Catching issues early can save 10-15% of your yield
        </div>
      </div>

      <Link href={`/reports/crop-health/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          Show Me Problem Areas
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
          <DollarSign className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-lg font-semibold text-sage-800">Making Good Money</p>
            <p className="text-sm text-sage-600">Profitable season with room to improve</p>
          </div>
        </div>
        <TrafficLightStatus 
          status="good"
          size="md"
          showText={false}
        />
      </div>

      {/* Big profit number */}
      <div className="text-center bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-3xl font-bold text-green-800 mb-1">$62,500</div>
        <div className="text-sm text-green-600 mb-2">Total profit this season</div>
        <div className="text-xs text-green-600 flex items-center justify-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>$5,200 more than last year</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-700">$187,500</div>
          <div className="text-xs text-blue-600 mb-1">Money In</div>
          <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +12% vs last year
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-orange-700">$125,000</div>
          <div className="text-xs text-orange-600 mb-1">Money Out</div>
          <div className="text-xs text-green-600 flex items-center justify-center gap-1">
            <TrendingDown className="h-3 w-3" />
            -8% vs last year
          </div>
        </div>
      </div>

      <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-sage-600" />
            <span className="text-sm font-medium text-sage-800">vs Other Farms:</span>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Better than 75%
          </Badge>
        </div>
      </div>

      <Link href={`/reports/financial/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          See Where Your Money Goes
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
          <TreePine className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-lg font-semibold text-sage-800">Good Environmental Steward</p>
            <p className="text-sm text-sage-600">Doing well for the planet and your wallet</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-sage-800">B+</span>
          <InfoTooltip
            title="Sustainability Score"
            description="Based on water use, soil health, and carbon footprint compared to similar farms."
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">🌊 Water Smart</span>
            <span className="text-sm font-bold text-blue-800">78%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
          </div>
          <p className="text-xs text-blue-700 mt-1">Using water efficiently, but room to improve</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">🌱 Carbon Footprint</span>
            <span className="text-sm font-bold text-green-800">-15%</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-xs text-green-700 mt-1">15% lower than average - great job!</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-800">🏞️ Soil Health</span>
            <span className="text-sm font-bold text-amber-800">Good</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '72%' }}></div>
          </div>
          <p className="text-xs text-amber-700 mt-1">Healthy soil, consider cover crops for A+ rating</p>
        </div>
      </div>

      <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 text-center">
        <div className="text-sm text-sage-700">
          <span className="font-medium">Potential incentives:</span> You may qualify for $2,500 in conservation payments
        </div>
      </div>

      <Link href={`/reports/sustainability/${farmId}`} className="block">
        <Button className="w-full bg-sage-700 hover:bg-sage-800">
          <Eye className="h-4 w-4 mr-2" />
          Find Conservation Opportunities
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