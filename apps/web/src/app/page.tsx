import { Navbar } from '../components/navigation/navbar'
import Link from 'next/link'
import { InlineFloatingButton } from '../components/ui/floating-button'
import { ClientFloatingButton } from '../components/ui/client-floating-button'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../components/ui/modern-card'
import { InfoTooltip } from '../components/ui/info-tooltip'
import { TOOLTIP_CONTENT } from '../lib/tooltip-content'
import { Badge } from '../components/ui/badge'
import { 
  Sprout, CloudRain, Satellite, Brain, TrendingUp, Shield, 
  BarChart, Users, ArrowRight, Sparkles, Zap, Target
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-agricultural">
      <Navbar />
      
      {/* Full Page Glassmorphic Layout - Extended */}
      <section className="relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
        
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {/* Large Extended Glass Container - Goes all the way down */}
          <div className="glass-hero-extended p-8 md:p-12 lg:p-16 text-center">
            
            {/* Top Badge */}
            <div className="mb-8">
              <div className="glass-badge text-white border-white/30 px-6 py-3 text-sm font-medium rounded-full inline-flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Trusted by 10,000+ Farmers Worldwide
              </div>
            </div>
            
            {/* Main Title - Smaller */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight mb-6 text-white tracking-tight drop-shadow-2xl leading-none">
              Crops<span className="text-white/70">.AI</span>
            </h1>
            
            {/* Updated Tagline - Farmer-focused messaging */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-white/95 mb-4 max-w-4xl mx-auto leading-tight font-light">
              Grow More. Work Less. Save Money.
            </h2>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of farmers who increased yields by up to 30%, reduced operational costs by 15%, 
              and saved 5+ hours per week with AI-powered farm management
            </p>
            
            {/* Single CTA Button */}
            <div className="mb-12">
              <Link href="/register">
                <button className="glass-button-primary px-12 py-5 text-white font-medium text-lg rounded-full min-w-[300px] transition-all duration-300 shadow-lg">
                  <ArrowRight className="h-5 w-5 mr-3 inline" />
                  Start Your Free 30-Day Trial
                </button>
              </Link>
              <p className="text-white/60 text-sm mt-3">No credit card required • Setup in 5 minutes</p>
            </div>
            
            {/* Feature Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Satellite Imagery Tile */}
              <div className="glass-feature-tile p-6 rounded-2xl text-center hover:scale-105 transition-transform">
                <div className="p-4 glass-indicator rounded-full w-fit mx-auto mb-4">
                  <Satellite className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">See Problems Before They Spread</h3>
                <p className="text-white/80 leading-relaxed text-sm">
                  Spot crop stress, pest infestations, and irrigation issues days before they're visible. 
                  Save entire harvests with early detection.
                </p>
              </div>
              
              {/* Weather Data Tile */}
              <div className="glass-feature-tile p-6 rounded-2xl text-center hover:scale-105 transition-transform">
                <div className="p-4 glass-indicator rounded-full w-fit mx-auto mb-4">
                  <CloudRain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Never Miss the Perfect Window</h3>
                <p className="text-white/80 leading-relaxed text-sm">
                  Get field-specific weather alerts for planting, spraying, and harvesting. 
                  Make decisions with confidence, not guesswork.
                </p>
              </div>
              
              {/* Financial Management Tile */}
              <div className="glass-feature-tile p-6 rounded-2xl text-center hover:scale-105 transition-transform">
                <div className="p-4 glass-indicator rounded-full w-fit mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Know Your True Profit Per Acre</h3>
                <p className="text-white/80 leading-relaxed text-sm">
                  Track costs, compare field performance, and get market insights. 
                  Make data-driven decisions that boost your bottom line.
                </p>
              </div>
              
            </div>
            
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4 drop-shadow-lg">
              Real Farmers. Real Results.
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
              See how Crops.AI is transforming farms across the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 - Small Farm */}
            <div className="glass-feature-tile p-8 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="glass-indicator p-2 rounded-full mr-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Sarah Chen</h4>
                  <p className="text-white/70 text-sm">120-acre Family Farm, Iowa</p>
                </div>
              </div>
              <p className="text-white/90 leading-relaxed mb-4">
                "Crops.AI helped us identify nitrogen deficiency in our corn fields 2 weeks early. 
                We saved $18,000 in potential losses and increased our yield by 23% this season."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-white/70">
                  <span className="text-white font-semibold">+23%</span> Yield
                </div>
                <div className="text-white/70">
                  <span className="text-white font-semibold">$18K</span> Saved
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 - Medium Farm */}
            <div className="glass-feature-tile p-8 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="glass-indicator p-2 rounded-full mr-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Marcus Johnson</h4>
                  <p className="text-white/70 text-sm">850-acre Wheat & Soy, Kansas</p>
                </div>
              </div>
              <p className="text-white/90 leading-relaxed mb-4">
                "The weather alerts alone paid for the subscription 10x over. We harvested just before 
                a hailstorm that would've destroyed 40% of our wheat crop."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-white/70">
                  <span className="text-white font-semibold">40%</span> Crop Saved
                </div>
                <div className="text-white/70">
                  <span className="text-white font-semibold">10x</span> ROI
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 - Large Operation */}
            <div className="glass-feature-tile p-8 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="glass-indicator p-2 rounded-full mr-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Rodriguez Farms LLC</h4>
                  <p className="text-white/70 text-sm">3,200 acres, California</p>
                </div>
              </div>
              <p className="text-white/90 leading-relaxed mb-4">
                "Managing multiple fields was a nightmare. Now I check everything from my phone. 
                We cut water usage by 30% and labor costs by $45,000 annually."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-white/70">
                  <span className="text-white font-semibold">-30%</span> Water
                </div>
                <div className="text-white/70">
                  <span className="text-white font-semibold">$45K</span> Labor Saved
                </div>
              </div>
            </div>
          </div>
          
          {/* Impact Stats */}
          <div className="mt-16 glass-hero-extended p-8 rounded-3xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">$2.3M</div>
                <div className="text-white/70">Saved by farmers in 2024</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">15,000+</div>
                <div className="text-white/70">Active fields monitored</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">98%</div>
                <div className="text-white/70">Customer satisfaction</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-white/70">AI monitoring & alerts</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer inside glass container */}
      <footer className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-hero-extended p-8 md:p-12 lg:p-16 rounded-3xl">
            <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-white/80">
                <p>© 2025 Crops.AI. All rights reserved.</p>
                <p>Photo by <span className="font-medium">Bernd 📷 Dittrich</span></p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/80">Built with</span>
                <div className="glass-indicator px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-white">Next.js</span>
                </div>
                <div className="glass-indicator px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-white">AI/ML</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}