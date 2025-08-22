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
              <Badge className="glass-badge text-white border-white/30 px-6 py-3 text-sm font-medium rounded-full">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Precision Agriculture
              </Badge>
            </div>
            
            {/* Main Title - Smaller */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight mb-6 text-white tracking-tight drop-shadow-2xl leading-none">
              Crops<span className="text-white/70">.AI</span>
            </h1>
            
            {/* Updated Tagline - Smaller and More Specific */}
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
              Increase yields by up to 30% and reduce costs by more than 15%
            </p>
            
            {/* Single CTA Button */}
            <div className="mb-12">
              <Link href="/register">
                <button className="glass-button-primary px-12 py-4 text-white font-medium text-lg rounded-full min-w-[280px] transition-all duration-300">
                  <ArrowRight className="h-5 w-5 mr-3 inline" />
                  Get started now for free
                </button>
              </Link>
            </div>
            
            {/* Feature Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Satellite Imagery Tile */}
              <div className="glass-feature-tile p-6 rounded-2xl text-center">
                <div className="p-4 glass-indicator rounded-full w-fit mx-auto mb-4">
                  <Satellite className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Satellite Insights</h3>
                <p className="text-white/80 leading-relaxed text-sm">
                  Manage farms using satellite imagery generated insights such as NDVI, crop stress, and infestation probabilities
                </p>
              </div>
              
              {/* Weather Data Tile */}
              <div className="glass-feature-tile p-6 rounded-2xl text-center">
                <div className="p-4 glass-indicator rounded-full w-fit mx-auto mb-4">
                  <CloudRain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Weather Intelligence</h3>
                <p className="text-white/80 leading-relaxed text-sm">
                  Get weather data and alerts with hyperlocal forecasting for precise farm management decisions
                </p>
              </div>
              
              {/* Financial Management Tile */}
              <div className="glass-feature-tile p-6 rounded-2xl text-center">
                <div className="p-4 glass-indicator rounded-full w-fit mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Financial Management</h3>
                <p className="text-white/80 leading-relaxed text-sm">
                  Manage financials using account and market data for comprehensive farm economic analysis
                </p>
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