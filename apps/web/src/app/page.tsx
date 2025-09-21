import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { InlineFloatingButton } from '../components/ui/floating-button'
import { ClientFloatingButton } from '../components/ui/client-floating-button'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../components/ui/modern-card'
import { InfoTooltip } from '../components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../lib/tooltip-content'
import { Badge } from '../components/ui/badge'
import { InteractiveDemo } from '../components/landing/interactive-demo'
import { ROICalculator } from '../components/landing/roi-calculator'
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
      
      {/* Hero Section with Modern Design */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Card */}
          <ModernCard variant="floating" className="text-center mb-16 p-8 md:p-16 bg-gradient-to-br from-white to-sage-50/50">
            
            <ModernCardContent>
              {/* Top Badge */}
              <div className="mb-8">
                <Badge variant="outline" className="bg-sage-600 text-white border-sage-500 px-6 py-3 text-sm font-medium">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Real-time Agricultural Intelligence Platform
                </Badge>
              </div>
              
              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-6 text-sage-800 tracking-tight leading-none">
                Cropple<span className="text-sage-600">.ai</span>
              </h1>
              
              {/* Tagline */}
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-sage-700 mb-6 max-w-4xl mx-auto leading-tight font-normal">
                Your Farm Command Center. Make Smarter Decisions Daily.
              </h2>
              
              <p className="text-lg text-sage-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Get instant answers to "Should I spray today?", "When should I harvest?", and "Which fields need attention?"
                — all from one unified dashboard that saves you 2 hours every day.
              </p>
              
              {/* CTA Button */}
              <div className="mb-8">
                <Link href="/register">
                  <button className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 px-6 py-3 sm:px-8 sm:py-4 text-white font-medium text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center">
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Start Your Free 30-Day Trial</span>
                    <span className="sm:hidden">Start Free Trial</span>
                  </button>
                </Link>
                <p className="text-sage-500 text-xs sm:text-sm mt-3">No credit card required • Setup in 5 minutes</p>
              </div>
            </ModernCardContent>
          </ModernCard>
            
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Decision Support Card */}
            <ModernCard variant="soft" className="text-center hover:shadow-lg transition-all duration-300 group">
              <ModernCardHeader className="pb-4">
                <div className="p-4 bg-sage-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-sage-200 transition-colors">
                  <Satellite className="h-8 w-8 text-sage-700" />
                </div>
                <ModernCardTitle className="text-sage-800">"Should I Spray Today?"</ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <ModernCardDescription className="text-sage-600 leading-relaxed">
                  Get instant yes/no answers with weather windows, crop readiness, and application timing. 
                  Never miss the perfect spray window again.
                </ModernCardDescription>
              </ModernCardContent>
            </ModernCard>
            
            {/* Harvest Timing Card */}
            <ModernCard variant="soft" className="text-center hover:shadow-lg transition-all duration-300 group">
              <ModernCardHeader className="pb-4">
                <div className="p-4 bg-earth-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-earth-200 transition-colors">
                  <CloudRain className="h-8 w-8 text-earth-700" />
                </div>
                <ModernCardTitle className="text-sage-800">"When Should I Harvest?"</ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <ModernCardDescription className="text-sage-600 leading-relaxed">
                  Combine crop maturity, weather forecasts, and market prices into clear harvest timing recommendations. 
                  Maximize quality and profits.
                </ModernCardDescription>
              </ModernCardContent>
            </ModernCard>
            
            {/* Financial Insights Card */}
            <ModernCard variant="soft" className="text-center hover:shadow-lg transition-all duration-300 group">
              <ModernCardHeader className="pb-4">
                <div className="p-4 bg-sage-100 rounded-full w-fit mx-auto mb-4 group-hover:bg-sage-200 transition-colors">
                  <TrendingUp className="h-8 w-8 text-sage-700" />
                </div>
                <ModernCardTitle className="text-sage-800">"Which Fields Are Making Money?"</ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <ModernCardDescription className="text-sage-600 leading-relaxed">
                  See profit per acre by field, track every expense with voice logging, and get market signals. 
                  Focus your efforts where they matter most.
                </ModernCardDescription>
              </ModernCardContent>
            </ModernCard>
            
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-sage-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-sage-800 mb-4">
              Real Farmers. Real Results.
            </h2>
            <p className="text-lg text-sage-600 max-w-3xl mx-auto">
              See how Cropple.ai is transforming farms across the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 - Small Farm */}
            <ModernCard variant="soft" className="p-8">
              <ModernCardHeader>
                <div className="flex items-center mb-4">
                  <div className="bg-sage-100 p-2 rounded-full mr-3">
                    <Users className="h-6 w-6 text-sage-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-sage-800">Sarah Chen</h4>
                    <p className="text-sage-600 text-sm">120-acre Family Farm, Iowa</p>
                  </div>
                </div>
              </ModernCardHeader>
              <ModernCardContent>
                <p className="text-sage-700 leading-relaxed mb-4">
                  "I used to spend hours every morning checking weather, walking fields, and planning my day. 
                  Now Cropple.ai tells me exactly what needs attention. The real-time monitoring has helped me catch issues early."
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Time Savings
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Early Detection
                  </Badge>
                </div>
              </ModernCardContent>
            </ModernCard>
            
            {/* Testimonial 2 - Medium Farm */}
            <ModernCard variant="soft" className="p-8">
              <ModernCardHeader>
                <div className="flex items-center mb-4">
                  <div className="bg-earth-100 p-2 rounded-full mr-3">
                    <Users className="h-6 w-6 text-earth-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-sage-800">Marcus Johnson</h4>
                    <p className="text-sage-600 text-sm">850-acre Wheat & Soy, Kansas</p>
                  </div>
                </div>
              </ModernCardHeader>
              <ModernCardContent>
                <p className="text-sage-700 leading-relaxed mb-4">
                  "The weather alerts and harvest timing recommendations have been invaluable. Being able to make 
                  informed decisions about when to harvest based on weather forecasts has improved our operation's efficiency."
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Weather Alerts
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Better Timing
                  </Badge>
                </div>
              </ModernCardContent>
            </ModernCard>
            
            {/* Testimonial 3 - Large Operation */}
            <ModernCard variant="soft" className="p-8">
              <ModernCardHeader>
                <div className="flex items-center mb-4">
                  <div className="bg-sage-100 p-2 rounded-full mr-3">
                    <Users className="h-6 w-6 text-sage-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-sage-800">Rodriguez Farms LLC</h4>
                    <p className="text-sage-600 text-sm">3,200 acres, California</p>
                  </div>
                </div>
              </ModernCardHeader>
              <ModernCardContent>
                <p className="text-sage-700 leading-relaxed mb-4">
                  "Instead of driving to each field every morning, I get a priority list on my phone with 
                  specific actions needed for each field. The centralized dashboard has streamlined our operations significantly."
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Water Efficiency
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Streamlined Ops
                  </Badge>
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>
          
          {/* Impact Stats */}
          <ModernCard variant="floating" className="mt-16 p-8 bg-gradient-to-r from-sage-600/10 to-earth-600/10">
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
          </ModernCard>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <ROICalculator />
      
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