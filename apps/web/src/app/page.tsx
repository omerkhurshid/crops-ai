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
      
      {/* Full Page Glassmorphic Layout */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
        
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {/* Large Extended Glass Container */}
          <div className="glass-hero-extended p-8 md:p-12 lg:p-16 text-center min-h-[80vh] flex flex-col justify-center">
            
            {/* Top Badge */}
            <div className="mb-12">
              <Badge className="glass-badge text-white border-white/30 px-8 py-4 text-base font-medium rounded-full">
                <Sparkles className="h-5 w-5 mr-3" />
                AI-Powered Precision Agriculture
              </Badge>
            </div>
            
            {/* Main Title */}
            <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-extralight mb-12 text-white tracking-tight drop-shadow-2xl leading-none">
              Crops<span className="text-white/70">.AI</span>
            </h1>
            
            {/* Description */}
            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-16 max-w-5xl mx-auto leading-relaxed font-light">
              Transform your agricultural operations with intelligent decision-support, 
              real-time monitoring, and predictive analytics powered by cutting-edge AI technology.
            </p>
            
            {/* Elegant Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/register">
                <button className="glass-button-primary px-10 py-4 text-white font-medium text-lg rounded-full min-w-[220px] transition-all duration-300">
                  <ArrowRight className="h-5 w-5 mr-3 inline" />
                  Start Free Trial
                </button>
              </Link>
              <Link href="/login">
                <button className="glass-button-secondary px-10 py-4 text-white font-medium text-lg rounded-full min-w-[220px] transition-all duration-300">
                  <Users className="h-5 w-5 mr-3 inline" />
                  Sign In
                </button>
              </Link>
            </div>
            
            {/* Elegant Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-white/70">
              <div className="flex items-center gap-3 glass-indicator px-6 py-3 rounded-full">
                <Shield className="h-5 w-5" />
                <span className="text-base font-light">Bank-grade Security</span>
              </div>
              <div className="flex items-center gap-3 glass-indicator px-6 py-3 rounded-full">
                <BarChart className="h-5 w-5" />
                <span className="text-base font-light">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-3 glass-indicator px-6 py-3 rounded-full">
                <Users className="h-5 w-5" />
                <span className="text-base font-light">10,000+ Farmers</span>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Section with Glass Cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="glass-feature inline-block px-6 py-3 rounded-full mb-6">
              <span className="text-white font-medium">Advanced Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-white drop-shadow-lg">
              Powerful Tools for Modern Farming
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Everything you need to optimize your farm&apos;s productivity and sustainability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="glass-feature p-8 text-white text-center group hover:scale-105 transition-all duration-300">
              <div className="p-6 glass-hero mx-auto w-fit mb-6 rounded-2xl">
                <CloudRain className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Weather Intelligence</h3>
              <p className="text-white/90 leading-relaxed mb-4">
                Real-time weather data and hyperlocal forecasting for precise farm management decisions
              </p>
              <InfoTooltip {...TOOLTIP_CONTENT.temperature} variant="light" />
            </div>
            
            <div className="glass-feature p-8 text-white text-center group hover:scale-105 transition-all duration-300">
              <div className="p-6 glass-hero mx-auto w-fit mb-6 rounded-2xl">
                <Satellite className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Satellite Monitoring</h3>
              <p className="text-white/90 leading-relaxed mb-4">
                Track crop health with advanced satellite imagery, NDVI analysis, and stress detection
              </p>
              <InfoTooltip {...TOOLTIP_CONTENT.ndvi} variant="light" />
            </div>
            
            <div className="glass-feature p-8 text-white text-center group hover:scale-105 transition-all duration-300">
              <div className="p-6 glass-hero mx-auto w-fit mb-6 rounded-2xl">
                <Brain className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">AI Recommendations</h3>
              <p className="text-white/90 leading-relaxed mb-4">
                Get intelligent insights for planting, irrigation, and harvest optimization
              </p>
              <InfoTooltip {...TOOLTIP_CONTENT.confidence} variant="light" />
            </div>
          </div>

          {/* CTA Section */}
          <div className="glass-hero max-w-4xl mx-auto text-center py-16 px-8">
            <div className="flex justify-center mb-6">
              <div className="glass-feature px-6 py-3 rounded-full">
                <span className="text-white font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Ready to Transform?
                </span>
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-white">
              Start Your Agricultural Revolution Today
            </h3>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join thousands of farmers who are already using Crops.AI to increase yields, 
              reduce costs, and make data-driven decisions for sustainable agriculture
            </p>
            <Link href="/register">
              <InlineFloatingButton
                icon={<Target className="h-5 w-5" />}
                label="Start Your Free Trial"
                showLabel={true}
                variant="primary"
                size="lg"
                className="min-w-[250px] bg-white/20 hover:bg-white/30 border-white/40"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="glass-feature p-6 text-white text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">10K+</div>
              <div className="text-sm md:text-lg font-medium opacity-90">Active Farmers</div>
            </div>
            <div className="glass-feature p-6 text-white text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">2M+</div>
              <div className="text-sm md:text-lg font-medium opacity-90">Hectares Monitored</div>
            </div>
            <div className="glass-feature p-6 text-white text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">95%</div>
              <div className="text-sm md:text-lg font-medium opacity-90">Accuracy Rate</div>
            </div>
            <div className="glass-feature p-6 text-white text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">24/7</div>
              <div className="text-sm md:text-lg font-medium opacity-90">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Glass Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-feature p-12 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white mb-12">
              <div>
                <h4 className="font-semibold mb-4 text-white">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/features" className="hover:text-white/80 transition-colors text-white/90">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-white/80 transition-colors text-white/90">Pricing</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white/80 transition-colors text-white/90">Dashboard Demo</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-white">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/crop-health" className="hover:text-white/80 transition-colors text-white/90">Crop Health</Link></li>
                  <li><Link href="/weather" className="hover:text-white/80 transition-colors text-white/90">Weather Intelligence</Link></li>
                  <li><Link href="/recommendations" className="hover:text-white/80 transition-colors text-white/90">AI Recommendations</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-white">Management</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/farms" className="hover:text-white/80 transition-colors text-white/90">Farm Management</Link></li>
                  <li><Link href="/financial" className="hover:text-white/80 transition-colors text-white/90">Financial Tracking</Link></li>
                  <li><Link href="/fields" className="hover:text-white/80 transition-colors text-white/90">Field Operations</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-white">Account</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/register" className="hover:text-white/80 transition-colors text-white/90">Sign Up</Link></li>
                  <li><Link href="/login" className="hover:text-white/80 transition-colors text-white/90">Sign In</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white/80 transition-colors text-white/90">Dashboard</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-white/80">
                <p>© 2025 Crops.AI. All rights reserved.</p>
                <p>Photo by <span className="font-medium">Bernd 📷 Dittrich</span></p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/80">Built with</span>
                <div className="glass-hero px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-white">Next.js</span>
                </div>
                <div className="glass-hero px-3 py-1 rounded-full">
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