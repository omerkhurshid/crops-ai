'use client'
import { useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Calculator, DollarSign, TrendingUp, Target } from 'lucide-react'
export function ROICalculator() {
  const [farmSize, setFarmSize] = useState(500)
  const [currentYield, setCurrentYield] = useState(150)
  const [results, setResults] = useState<null | {
    yieldIncrease: number
    costSavings: number
    totalSavings: number
    roi: number
  }>(null)
  const calculateROI = () => {
    // Conservative estimates based on agricultural research
    const yieldImprovement = 0.08 // 8% yield improvement
    const costReduction = 0.12 // 12% cost reduction through efficiency
    const pricePerBushel = 5.50 // Average corn price
    const costPerAcre = 650 // Average production cost per acre
    const yieldIncrease = farmSize * currentYield * yieldImprovement
    const yieldValue = yieldIncrease * pricePerBushel
    const costSavings = farmSize * costPerAcre * costReduction
    const totalSavings = yieldValue + costSavings
    const annualCost = 15 * farmSize // $15 per acre annually
    const roi = ((totalSavings - annualCost) / annualCost) * 100
    setResults({
      yieldIncrease: Math.round(yieldIncrease),
      costSavings: Math.round(costSavings),
      totalSavings: Math.round(totalSavings),
      roi: Math.round(roi)
    })
  }
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAF8]/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-light text-[#1A1A1A] mb-4">
            Calculate Your Potential ROI
          </h2>
          <p className="text-lg text-[#555555] max-w-2xl mx-auto">
            See how Cropple.ai could impact your farming operation's profitability
          </p>
        </div>
        <ModernCard variant="floating">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#555555]" />
              ROI Calculator
            </ModernCardTitle>
            <ModernCardDescription>
              Estimate your potential savings with precision agriculture technology
            </ModernCardDescription>
          </ModernCardHeader>
          <ModernCardContent className="space-y-6">
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-2">
                  Farm Size (acres)
                </label>
                <input
                  type="number"
                  value={farmSize}
                  onChange={(e) => setFarmSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#DDE4D8] rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-[#7A8F78]"
                  min="1"
                  max="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#555555] mb-2">
                  Current Yield (bushels/acre)
                </label>
                <input
                  type="number"
                  value={currentYield}
                  onChange={(e) => setCurrentYield(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#DDE4D8] rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-[#7A8F78]"
                  min="50"
                  max="300"
                />
              </div>
            </div>
            <Button 
              onClick={calculateROI}
              className="w-full bg-[#5E6F5A] hover:bg-[#7A8F78]"
              size="lg"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Your ROI
            </Button>
            {/* Results Section */}
            {results && (
              <div className="border-t border-[#DDE4D8] pt-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 text-center">
                  Your Potential Annual Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-[#F8FAF8] rounded-lg border border-[#DDE4D8]">
                    <div className="text-2xl font-bold text-green-700">
                      {results.yieldIncrease.toLocaleString()} bu
                    </div>
                    <div className="text-sm text-green-600">Additional Yield</div>
                    <div className="text-xs text-green-500 mt-1">8% improvement</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">
                      ${results.costSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600">Cost Savings</div>
                    <div className="text-xs text-blue-500 mt-1">Efficiency gains</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">
                      {results.roi}%
                    </div>
                    <div className="text-sm text-purple-600">Return on Investment</div>
                    <div className="text-xs text-purple-500 mt-1">Annual ROI</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-sage-50 to-#FAFAF7 rounded-lg p-6 border border-[#DDE4D8]">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#F8FAF8] rounded-lg">
                      <DollarSign className="h-5 w-5 text-[#555555]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A] mb-2">
                        Total Annual Value: ${results.totalSavings.toLocaleString()}
                      </h4>
                      <p className="text-sm text-[#555555]">
                        These estimates are based on industry averages and research from agricultural universities. 
                        Actual results depend on your specific conditions, but many farmers see improvements within the first season.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button size="lg" className="bg-[#5E6F5A] hover:bg-[#7A8F78]">
                    <Target className="h-4 w-4 mr-2" />
                    Start Your Free Trial
                  </Button>
                  <p className="text-xs text-sage-500 mt-2">
                    No credit card required • See results in your first season
                  </p>
                </div>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      </div>
    </section>
  )
}