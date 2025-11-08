'use client'
import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wheat,
  Fuel,
  Wrench,
  Users,
  Minus,
  Plus,
  BarChart3,
  Target,
  AlertTriangle
} from 'lucide-react'
import { cn } from '../../lib/utils'
interface ProfitCalculatorProps {
  farmId?: string
  className?: string
}
interface CalculatorInputs {
  acres: number
  crop: string
  expectedYield: number
  pricePerUnit: number
  // Costs
  seedCost: number
  fertilizerCost: number
  fuelCost: number
  laborCost: number
  equipmentCost: number
  otherCosts: number
}
interface ProfitResults {
  totalRevenue: number
  totalCosts: number
  grossProfit: number
  profitPerAcre: number
  profitMargin: number
  breakEvenYield: number
  breakEvenPrice: number
}
const cropDefaults = {
  corn: { yield: 180, price: 4.20, unit: 'bu' },
  soybeans: { yield: 50, price: 11.50, unit: 'bu' },
  wheat: { yield: 65, price: 5.80, unit: 'bu' },
  barley: { yield: 70, price: 4.50, unit: 'bu' },
  oats: { yield: 80, price: 3.20, unit: 'bu' }
}
export function ProfitCalculator({ farmId, className }: ProfitCalculatorProps) {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    acres: 100,
    crop: 'corn',
    expectedYield: 180,
    pricePerUnit: 4.20,
    seedCost: 120,
    fertilizerCost: 280,
    fuelCost: 85,
    laborCost: 45,
    equipmentCost: 90,
    otherCosts: 60
  })
  const [results, setResults] = useState<ProfitResults | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  // Update defaults when crop changes
  useEffect(() => {
    const crop = inputs.crop as keyof typeof cropDefaults
    if (cropDefaults[crop]) {
      setInputs(prev => ({
        ...prev,
        expectedYield: cropDefaults[crop].yield,
        pricePerUnit: cropDefaults[crop].price
      }))
    }
  }, [inputs.crop])
  // Calculate results whenever inputs change
  useEffect(() => {
    calculateProfit()
  }, [inputs])
  const calculateProfit = () => {
    const totalRevenue = inputs.acres * inputs.expectedYield * inputs.pricePerUnit
    const costsPerAcre = inputs.seedCost + inputs.fertilizerCost + inputs.fuelCost + 
                        inputs.laborCost + inputs.equipmentCost + inputs.otherCosts
    const totalCosts = inputs.acres * costsPerAcre
    const grossProfit = totalRevenue - totalCosts
    const profitPerAcre = grossProfit / inputs.acres
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    // Break-even calculations
    const breakEvenYield = costsPerAcre / inputs.pricePerUnit
    const breakEvenPrice = costsPerAcre / inputs.expectedYield
    setResults({
      totalRevenue,
      totalCosts,
      grossProfit,
      profitPerAcre,
      profitMargin,
      breakEvenYield,
      breakEvenPrice
    })
  }
  const updateInput = (field: keyof CalculatorInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: Math.max(0, value) }))
  }
  const getCropUnit = () => {
    const crop = inputs.crop as keyof typeof cropDefaults
    return cropDefaults[crop]?.unit || 'bu'
  }
  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600'
    if (profit < 0) return 'text-red-600'
    return 'text-gray-600'
  }
  const getProfitIndicator = (profit: number, margin: number) => {
    if (profit > 0 && margin > 15) return { icon: TrendingUp, text: 'Excellent', color: 'text-green-600' }
    if (profit > 0 && margin > 5) return { icon: TrendingUp, text: 'Good', color: 'text-green-600' }
    if (profit > 0) return { icon: TrendingUp, text: 'Modest', color: 'text-yellow-600' }
    if (profit < 0) return { icon: TrendingDown, text: 'Loss', color: 'text-red-600' }
    return { icon: Minus, text: 'Break Even', color: 'text-gray-600' }
  }
  if (!results) return null
  const indicator = getProfitIndicator(results.grossProfit, results.profitMargin)
  return (
    <ModernCard variant="soft" className={className}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Profit Calculator
          </ModernCardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Simple View' : 'Detailed View'}
          </Button>
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-6">
        {/* Quick Setup */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <select
              value={inputs.crop}
              onChange={(e) => setInputs(prev => ({ ...prev, crop: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="corn">Corn</option>
              <option value="soybeans">Soybeans</option>
              <option value="wheat">Wheat</option>
              <option value="barley">Barley</option>
              <option value="oats">Oats</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acres</label>
            <input
              type="number"
              value={inputs.acres}
              onChange={(e) => updateInput('acres', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Yield ({getCropUnit()}/acre)
            </label>
            <input
              type="number"
              value={inputs.expectedYield}
              onChange={(e) => updateInput('expectedYield', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per {getCropUnit()}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.pricePerUnit}
                onChange={(e) => updateInput('pricePerUnit', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        {/* Results Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                ${results.totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Minus className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">Total Costs</span>
              </div>
              <div className="text-2xl font-bold text-red-700">
                ${results.totalCosts.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <indicator.icon className={cn("h-5 w-5", indicator.color)} />
                <span className="text-sm font-medium text-gray-600">Net Profit</span>
              </div>
              <div className={cn("text-2xl font-bold", getProfitColor(results.grossProfit))}>
                ${results.grossProfit.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {indicator.text} • {results.profitMargin.toFixed(1)}% margin
              </div>
            </div>
          </div>
        </div>
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              ${results.profitPerAcre.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Profit per Acre</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {results.breakEvenYield.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Break-even Yield</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              ${results.breakEvenPrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Break-even Price</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {results.profitMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Profit Margin</div>
          </div>
        </div>
        {/* Detailed Cost Breakdown */}
        {showDetails && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Cost Breakdown (per acre)
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'seedCost', label: 'Seeds', icon: Wheat },
                { key: 'fertilizerCost', label: 'Fertilizer', icon: Target },
                { key: 'fuelCost', label: 'Fuel', icon: Fuel },
                { key: 'laborCost', label: 'Labor', icon: Users },
                { key: 'equipmentCost', label: 'Equipment', icon: Wrench },
                { key: 'otherCosts', label: 'Other', icon: DollarSign }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={inputs[key as keyof CalculatorInputs]}
                      onChange={(e) => updateInput(key as keyof CalculatorInputs, parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Recommendations */}
        {results.grossProfit < 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Improve Profitability</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Increase yield to {Math.ceil(results.breakEvenYield)} {getCropUnit()}/acre to break even</li>
                  <li>• Or get ${results.breakEvenPrice.toFixed(2)} per {getCropUnit()} to break even</li>
                  <li>• Consider reducing input costs or exploring premium markets</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {results.profitMargin > 15 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Great Profit Potential!</h4>
                <p className="text-sm text-green-700">
                  This operation shows strong profitability. Consider expanding acreage or similar crops.
                </p>
              </div>
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}