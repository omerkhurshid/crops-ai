'use client'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { Badge } from '../../../../components/ui/badge'
import { Alert, AlertDescription } from '../../../../components/ui/alert'
import { 
  DollarSign, Calculator, TrendingUp, PieChart, AlertTriangle,
  CheckCircle, BarChart3, Target, Info, Lightbulb
} from 'lucide-react'
export default function FinancialCalculationsPage() {
  return (
    <DashboardLayout>
      <main className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-6 w-6 text-[#5E6F5A]" />
            <span className="text-[#7A8F78]">Financial Management</span>
          </div>
          <h1 className="text-3xl font-bold text-[#7A8F78] mb-4">
            Understanding Financial Calculations & ROI Analysis
          </h1>
          <div className="flex items-center gap-4 text-sm text-[#7A8F78]">
            <Badge variant="outline">12 min read</Badge>
            <span>•</span>
            <span>Last updated: January 2025</span>
          </div>
        </div>
        {/* Introduction */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardContent className="p-8">
            <p className="text-lg text-[#5E6F5A] leading-relaxed mb-4">
              Cropple.ai automatically calculates key financial metrics to help you understand which parts of your farm 
              are most profitable and where you can improve your returns. No spreadsheets required!
            </p>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Key Benefit:</strong> Get instant insights into profit margins, cost per hectare, 
                and ROI by field, crop type, or entire farm operations.
              </AlertDescription>
            </Alert>
          </ModernCardContent>
        </ModernCard>
        {/* Core Financial Metrics */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Core Financial Metrics We Track
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[#7A8F78] mb-3">1. Revenue per Hectare</h3>
                <div className="bg-[#F8FAF8] p-4 rounded-lg">
                  <p className="text-sm font-mono text-[#5E6F5A] mb-2">
                    Revenue/ha = (Yield × Market Price) / Field Area
                  </p>
                  <p className="text-sm text-[#7A8F78]">
                    Shows how much money each hectare of your land generates. Higher is better.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[#7A8F78] mb-3">2. Cost per Hectare</h3>
                <div className="bg-earth-50 p-4 rounded-lg">
                  <p className="text-sm font-mono text-earth-700 mb-2">
                    Cost/ha = (Total Input Costs + Labor + Equipment) / Field Area
                  </p>
                  <p className="text-sm text-earth-600">
                    Tracks all expenses associated with farming each hectare. Lower is better.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[#7A8F78] mb-3">3. Profit Margin</h3>
                <div className="bg-[#F8FAF8] p-4 rounded-lg">
                  <p className="text-sm font-mono text-[#7A8F78] mb-2">
                    Profit Margin = (Revenue - Total Costs) / Revenue × 100
                  </p>
                  <p className="text-sm text-[#7A8F78]">
                    Percentage of revenue that becomes profit. Industry average is 10-15%.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[#7A8F78] mb-3">4. Return on Investment (ROI)</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-mono text-blue-700 mb-2">
                    ROI = (Net Profit / Total Investment) × 100
                  </p>
                  <p className="text-sm text-blue-600">
                    How much profit you make for every dollar invested. Higher percentages are better.
                  </p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Cost Categories */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              How We Categorize Your Costs
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[#7A8F78] mb-3">Direct Field Costs</h4>
                <ul className="text-sm text-[#5E6F5A] space-y-2">
                  <li>• <strong>Seeds/Seedlings:</strong> All planting materials</li>
                  <li>• <strong>Fertilizers:</strong> NPK, organic amendments, micronutrients</li>
                  <li>• <strong>Pesticides:</strong> Herbicides, insecticides, fungicides</li>
                  <li>• <strong>Fuel & Equipment:</strong> Tractor hours, machinery costs</li>
                  <li>• <strong>Labor:</strong> Field work, harvest labor</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#7A8F78] mb-3">Overhead Costs</h4>
                <ul className="text-sm text-[#5E6F5A] space-y-2">
                  <li>• <strong>Land Costs:</strong> Rent, mortgage payments, taxes</li>
                  <li>• <strong>Insurance:</strong> Crop insurance, liability coverage</li>
                  <li>• <strong>Storage:</strong> Grain bins, cold storage, drying</li>
                  <li>• <strong>Administration:</strong> Office, accounting, legal</li>
                  <li>• <strong>Marketing:</strong> Transportation, commission fees</li>
                </ul>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* ROI Analysis Examples */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ROI Analysis Examples
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-[#5E6F5A]">
                Here's how different farming decisions impact your ROI:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-[#8FBF7F] pl-4">
                  <h4 className="font-semibold text-[#7A8F78] mb-2">High ROI Example: Precision Application</h4>
                  <div className="text-sm text-[#5E6F5A] space-y-1">
                    <p>• <strong>Investment:</strong> $50/ha for variable-rate fertilizer application</p>
                    <p>• <strong>Yield Increase:</strong> 8% better yields (0.4 tonnes/ha extra)</p>
                    <p>• <strong>Additional Revenue:</strong> $200/ha</p>
                    <p>• <strong>ROI:</strong> (200 - 50) / 50 = 300%</p>
                  </div>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-[#7A8F78] mb-2">Medium ROI Example: Preventive Fungicide</h4>
                  <div className="text-sm text-[#5E6F5A] space-y-1">
                    <p>• <strong>Investment:</strong> $80/ha for fungicide application</p>
                    <p>• <strong>Disease Prevention:</strong> Avoided 15% yield loss</p>
                    <p>• <strong>Protected Revenue:</strong> $150/ha</p>
                    <p>• <strong>ROI:</strong> (150 - 80) / 80 = 87.5%</p>
                  </div>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-[#7A8F78] mb-2">Low ROI Example: Excessive Nitrogen</h4>
                  <div className="text-sm text-[#5E6F5A] space-y-1">
                    <p>• <strong>Investment:</strong> $120/ha for extra nitrogen application</p>
                    <p>• <strong>Yield Increase:</strong> Minimal (2% = 0.1 tonnes/ha)</p>
                    <p>• <strong>Additional Revenue:</strong> $50/ha</p>
                    <p>• <strong>ROI:</strong> (50 - 120) / 120 = -58% (Loss!)</p>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Break-Even Analysis */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Break-Even Analysis Made Simple
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-4">
              <p className="text-[#5E6F5A]">
                Your break-even point is the minimum yield or price needed to cover all costs:
              </p>
              <div className="bg-[#F8FAF8] p-6 rounded-lg">
                <h4 className="font-semibold text-[#7A8F78] mb-3">Break-Even Yield</h4>
                <p className="text-sm font-mono text-[#5E6F5A] mb-2">
                  Break-Even Yield = Total Costs per Hectare / Market Price per Tonne
                </p>
                <div className="text-sm text-[#7A8F78]">
                  <p><strong>Example:</strong> If your costs are $1,200/ha and wheat is $300/tonne:</p>
                  <p>Break-even = 1,200 ÷ 300 = 4.0 tonnes/ha needed to break even</p>
                </div>
              </div>
              <div className="bg-earth-50 p-6 rounded-lg">
                <h4 className="font-semibold text-earth-800 mb-3">Break-Even Price</h4>
                <p className="text-sm font-mono text-earth-700 mb-2">
                  Break-Even Price = Total Costs per Hectare / Expected Yield per Hectare
                </p>
                <div className="text-sm text-earth-600">
                  <p><strong>Example:</strong> If your costs are $1,200/ha and you expect 5 tonnes/ha:</p>
                  <p>Break-even price = 1,200 ÷ 5 = $240/tonne minimum needed</p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Profit Optimization Tips */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              5 Ways to Improve Your Profit Margins
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-[#7A8F78]">1.</span>
                <div>
                  <h4 className="font-semibold text-[#7A8F78]">Optimize Input Timing</h4>
                  <p className="text-[#5E6F5A] text-sm">
                    Apply fertilizers and pesticides only when needed. Our AI recommendations help avoid waste.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#7A8F78]">2.</span>
                <div>
                  <h4 className="font-semibold text-[#7A8F78]">Focus on Your Best Fields</h4>
                  <p className="text-[#5E6F5A] text-sm">
                    Invest more in high-performing fields and consider alternative uses for low-ROI areas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#7A8F78]">3.</span>
                <div>
                  <h4 className="font-semibold text-[#7A8F78]">Reduce Post-Harvest Losses</h4>
                  <p className="text-[#5E6F5A] text-sm">
                    Improve harvesting timing and storage to minimize quality losses and maximize price.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#7A8F78]">4.</span>
                <div>
                  <h4 className="font-semibold text-[#7A8F78]">Plan Marketing Strategy</h4>
                  <p className="text-[#5E6F5A] text-sm">
                    Don't sell everything at harvest. Store quality grain and sell when prices are higher.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#7A8F78]">5.</span>
                <div>
                  <h4 className="font-semibold text-[#7A8F78]">Track Everything</h4>
                  <p className="text-[#5E6F5A] text-sm">
                    Record all costs and activities. You can't improve what you don't measure.
                  </p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Reading Your Financial Dashboard */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How to Read Your Financial Dashboard
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-4">
              <div className="border-l-4 border-[#8FBF7F] pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-[#7A8F78]" />
                  <Badge className="bg-[#F8FAF8] text-[#7A8F78]">Profit Margin {'>'}15%</Badge>
                </div>
                <p className="text-[#5E6F5A] text-sm">
                  <strong>Excellent Performance:</strong> Your operation is highly profitable. 
                  Consider expanding successful practices to other fields.
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-yellow-600" />
                  <Badge className="bg-yellow-100 text-yellow-800">Profit Margin 5-15%</Badge>
                </div>
                <p className="text-[#5E6F5A] text-sm">
                  <strong>Good Performance:</strong> Healthy margins with room for improvement. 
                  Look for cost reduction opportunities.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <Badge className="bg-red-100 text-red-800">Profit Margin {'<'}5%</Badge>
                </div>
                <p className="text-[#5E6F5A] text-sm">
                  <strong>Needs Attention:</strong> Margins are thin. Review input costs and consider 
                  higher-value crops or improved practices.
                </p>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Final Tips */}
        <Alert>
          <DollarSign className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> Set financial alerts in your dashboard to get notified when 
            costs exceed budgets or when market prices hit your target selling points. Most successful 
            farmers review their financial metrics weekly during growing season.
          </AlertDescription>
        </Alert>
      </main>
    </DashboardLayout>
  )
}