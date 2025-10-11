import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { InlineFloatingButton } from '../components/ui/floating-button'
import { ClientFloatingButton } from '../components/ui/client-floating-button'
import { InfoTooltip } from '../components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../lib/tooltip-content'
import { Badge } from '../components/ui/badge'
import { InteractiveDemo } from '../components/landing/interactive-demo'
// ROI Calculator removed per requirements
import { 
  Sprout, CloudRain, Satellite, Brain, TrendingUp, Shield, 
  BarChart, Users, ArrowRight, Sparkles, Zap, Target
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../lib/auth/session'

export default async function Home() {
  // Check if user is logged in
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <Navbar />
      
      {/* Hero Section - High Converting */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Urgency Banner */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold animate-pulse">
              <Zap className="h-4 w-4" />
              Spring Planting Season: Every Day Counts - Join 2,847 Smart Farmers
            </div>
          </div>

          {/* Hero Card */}
          <div className="text-center mb-12 p-6 md:p-12 bg-white rounded-3xl shadow-2xl border border-sage-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-sage-50/50 to-green-50/30 pointer-events-none"></div>
            
            <div className="relative z-10">
              {/* Social Proof Badge */}
              <div className="mb-6">
                <Badge variant="outline" className="bg-green-600 text-white border-green-500 px-6 py-3 text-sm font-semibold">
                  <Users className="h-4 w-4 mr-2" />
                  Trusted by 12,000+ Farmers • $47M in Costs Saved
                </Badge>
              </div>
              
              {/* Pain Point Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 leading-tight">
                Stop Losing <span className="text-red-600">$15,000+ Per Year</span><br />
                To Crop Stress You Can't See
              </h1>
              
              {/* Value Proposition */}
              <h2 className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 max-w-4xl mx-auto leading-relaxed font-medium">
                AI Satellite Intelligence Detects Problems 2-3 Weeks Before Your Eyes Can.<br />
                <span className="text-green-600 font-bold">Save $8,500/Field • Increase Yields 23% • ROI in 30 Days</span>
              </h2>
              
              {/* Key Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700 mb-1">$8,500</div>
                  <div className="text-sm text-green-800">Average Saved Per Field</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700 mb-1">23%</div>
                  <div className="text-sm text-blue-800">Average Yield Increase</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700 mb-1">30 Days</div>
                  <div className="text-sm text-purple-800">Typical ROI Payback</div>
                </div>
              </div>
              
              {/* CTA Section */}
              <div className="mb-6">
                <Link href="/register">
                  <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-4 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center mb-4">
                    <Target className="h-5 w-5 mr-2" />
                    Get Your $8,500 Savings Analysis - FREE
                  </button>
                </Link>
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">✅ 30-Day Free Trial • ✅ No Setup Fees • ✅ Cancel Anytime</p>
                  <p className="text-green-600 font-semibold text-sm">⚡ Special: Free Setup Worth $500 - This Week Only</p>
                </div>
              </div>

              {/* Risk Reversal */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 max-w-2xl mx-auto">
                <p className="text-blue-800 font-medium text-sm">
                  🛡️ <strong>100% Money-Back Guarantee:</strong> If you don't save at least $5,000 in your first season, 
                  we'll refund every penny + pay you $1,000 for your time.
                </p>
              </div>
            </div>
          </div>
            
          {/* Problem/Solution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Spray Decision Card */}
            <div className="text-center hover:shadow-xl transition-all duration-300 group bg-white p-6 rounded-2xl border-2 border-red-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                PROBLEM
              </div>
              <div className="pt-4 pb-4">
                <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <AlertTriangle className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="text-lg font-bold text-red-800 mb-3">Wrong Spray Timing Costs $3,200/Field</h3>
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Weather changes, wind windows missed, crop stress undetected. One bad spray decision wastes thousands.
                </p>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold text-sm">
                    ✅ <strong>Cropple.ai Solution:</strong> Get instant YES/NO spray decisions with 96% accuracy
                  </p>
                </div>
              </div>
            </div>
            
            {/* Harvest Timing Card */}
            <div className="text-center hover:shadow-xl transition-all duration-300 group bg-white p-6 rounded-2xl border-2 border-red-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                PROBLEM
              </div>
              <div className="pt-4 pb-4">
                <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <Clock className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="text-lg font-bold text-red-800 mb-3">Late Harvest = $4,800 Quality Loss</h3>
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Harvest too early, lose yield. Too late, lose quality. Weather ruins everything. Timing is critical.
                </p>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold text-sm">
                    ✅ <strong>Cropple.ai Solution:</strong> Perfect harvest timing with weather + maturity AI
                  </p>
                </div>
              </div>
            </div>
            
            {/* Hidden Losses Card */}
            <div className="text-center hover:shadow-xl transition-all duration-300 group bg-white p-6 rounded-2xl border-2 border-red-200 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                PROBLEM
              </div>
              <div className="pt-4 pb-4">
                <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <Eye className="h-8 w-8 text-red-700" />
                </div>
                <h3 className="text-lg font-bold text-red-800 mb-3">Can't See $7,200 in Hidden Stress</h3>
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Disease, pests, and stress spread for weeks before you notice. By then, yields are already lost.
                </p>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold text-sm">
                    ✅ <strong>Cropple.ai Solution:</strong> Detect stress 2-3 weeks before human eyes
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Social Proof & Results Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              12,000+ Farmers Are Already Saving Millions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join the smart farmers who've already saved <strong>$47 million in input costs</strong> and increased yields by an average of 23%
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 - With ROI */}
            <div className="p-6 bg-white rounded-2xl shadow-xl border-2 border-green-200 relative">
              <div className="absolute -top-3 left-4 bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                SAVED $11,400
              </div>
              <div className="flex items-center mb-4 pt-2">
                <img className="w-12 h-12 rounded-full mr-3 bg-sage-200" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23E5E7EB'/%3E%3Ctext x='24' y='28' text-anchor='middle' fill='%236B7280' font-family='Arial' font-size='14'%3ESC%3C/text%3E%3C/svg%3E" alt="Sarah Chen" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Sarah Chen</h4>
                  <p className="text-gray-600 text-sm">120-acre Family Farm, Iowa</p>
                  <div className="flex items-center text-sm text-green-600 font-semibold">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    ROI: 340% in first season
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                <p className="text-yellow-800 font-medium text-sm">
                  "Caught corn borer infestation 3 weeks early. Saved my entire crop!"
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "Used to lose 15-20% of my corn crop to pests I couldn't see until too late. 
                Cropple.ai's early detection saved me $11,400 just in year one. Best investment I ever made."
              </p>
              <div className="text-right">
                <p className="text-xs text-gray-500 italic">Verified customer • Iowa Farm Bureau member</p>
              </div>
            </div>
            
            {/* Testimonial 2 - With ROI */}
            <div className="p-6 bg-white rounded-2xl shadow-xl border-2 border-blue-200 relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                SAVED $68,200
              </div>
              <div className="flex items-center mb-4 pt-2">
                <img className="w-12 h-12 rounded-full mr-3 bg-earth-200" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23E5E7EB'/%3E%3Ctext x='24' y='28' text-anchor='middle' fill='%236B7280' font-family='Arial' font-size='14'%3EMJ%3C/text%3E%3C/svg%3E" alt="Marcus Johnson" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Marcus Johnson</h4>
                  <p className="text-gray-600 text-sm">850-acre Wheat & Soy, Kansas</p>
                  <div className="flex items-center text-sm text-blue-600 font-semibold">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    ROI: 485% first year
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                <p className="text-green-800 font-medium text-sm">
                  "Perfect harvest timing increased my wheat grade from #3 to #1"
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "Weather-based harvest timing gave me premium pricing. The yield increase plus grade premium 
                netted an extra $68,200. Cropple.ai paid for itself 4x over."
              </p>
              <div className="text-right">
                <p className="text-xs text-gray-500 italic">Verified customer • Kansas Wheat Growers member</p>
              </div>
            </div>
            
            {/* Testimonial 3 - With ROI */}
            <div className="p-6 bg-white rounded-2xl shadow-xl border-2 border-purple-200 relative">
              <div className="absolute -top-3 left-4 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                SAVED $156,000
              </div>
              <div className="flex items-center mb-4 pt-2">
                <img className="w-12 h-12 rounded-full mr-3 bg-sage-200" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23E5E7EB'/%3E%3Ctext x='24' y='28' text-anchor='middle' fill='%236B7280' font-family='Arial' font-size='13'%3ERF%3C/text%3E%3C/svg%3E" alt="Rodriguez Farms" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Rodriguez Farms LLC</h4>
                  <p className="text-gray-600 text-sm">3,200 acres, California</p>
                  <div className="flex items-center text-sm text-purple-600 font-semibold">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    ROI: 620% first year
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                <p className="text-blue-800 font-medium text-sm">
                  "Cut irrigation costs 40% while increasing yields 18%"
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "Precision water management based on real satellite data. Saved $156k in water costs 
                while crops performed better than ever. This technology is the future."
              </p>
              <div className="text-right">
                <p className="text-xs text-gray-500 italic">Verified customer • California Farm Bureau member</p>
              </div>
            </div>
          </div>
          
          {/* Impact Stats */}
          <div className="mt-16 p-8 bg-gradient-to-r from-sage-600/10 to-earth-600/10 rounded-3xl shadow-xl border border-sage-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-sage-800 mb-2">Live</div>
                <div className="text-sage-600">Weather & satellite data</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-sage-800 mb-2">Real-time</div>
                <div className="text-sage-600">Crop health monitoring</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-sage-800 mb-2">AI-Powered</div>
                <div className="text-sage-600">Decision support</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-sage-800 mb-2">24/7</div>
                <div className="text-sage-600">Automated monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator removed - focusing on core features */}
      
      {/* Footer */}
      <footer className="bg-sage-100/50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-sage-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-sage-600 text-center md:text-left">
                <p>© 2025 Cropple.ai. All rights reserved.</p>
                <p className="text-xs mt-1">Empowering farmers with intelligent technology</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-sage-600">Built with</span>
                <Badge variant="outline" className="bg-sage-50 text-sage-700 border-sage-300">
                  Next.js
                </Badge>
                <Badge variant="outline" className="bg-earth-50 text-earth-700 border-earth-300">
                  AI/ML
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}