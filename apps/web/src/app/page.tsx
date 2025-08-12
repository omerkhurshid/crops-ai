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
    <div className="minimal-page">
      <Navbar />
      
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Sparkles className="h-5 w-5" />}
        label="Get Started"
        variant="primary"
      />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-100/50 via-cream-50 to-earth-50/50 animate-gradient"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
          <Sprout className="h-8 w-8 text-sage-600" />
        </div>
        <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
          <Brain className="h-8 w-8 text-sage-600" />
        </div>
        <div className="absolute top-1/3 right-1/4 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '4s' }}>
          <Satellite className="h-8 w-8 text-sage-600" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Logo Badge */}
            <Badge className="bg-sage-100 text-sage-700 border-sage-200 mb-8 px-6 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Precision Agriculture
            </Badge>
            
            <h1 className="text-7xl md:text-9xl font-light mb-8 text-sage-800 tracking-tight">
              Crops<span className="text-sage-500">.AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-sage-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Transform your agricultural operations with intelligent decision-support, 
              real-time monitoring, and predictive analytics powered by cutting-edge AI technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <InlineFloatingButton
                  icon={<ArrowRight className="h-5 w-5" />}
                  label="Start Free Trial"
                  showLabel={true}
                  variant="primary"
                  size="lg"
                  className="min-w-[200px]"
                />
              </Link>
              <Link href="/login">
                <InlineFloatingButton
                  icon={<Users className="h-5 w-5" />}
                  label="Sign In"
                  showLabel={true}
                  variant="ghost"
                  size="lg"
                  className="min-w-[200px]"
                />
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 flex items-center justify-center gap-8 text-sage-500">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Bank-grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                <span className="text-sm">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">10,000+ Farmers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Modern Cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-sage-100 text-sage-700 border-sage-200 mb-4">
              Advanced Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-light mb-6 text-sage-800">
              Powerful Tools for Modern Farming
            </h2>
            <p className="text-xl text-sage-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to optimize your farm&apos;s productivity and sustainability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
              <ModernCardContent className="p-8 text-center">
                <div className="p-6 bg-gradient-to-br from-sage-100 to-sage-50 rounded-2xl mx-auto w-fit mb-6 group-hover:shadow-soft transition-all">
                  <CloudRain className="h-12 w-12 text-sage-700" />
                </div>
                <ModernCardTitle className="text-2xl mb-4">Weather Intelligence</ModernCardTitle>
                <p className="text-sage-600 leading-relaxed mb-4">
                  Real-time weather data and hyperlocal forecasting for precise farm management decisions
                </p>
                <InfoTooltip {...TOOLTIP_CONTENT.temperature} />
              </ModernCardContent>
            </ModernCard>
            
            <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
              <ModernCardContent className="p-8 text-center">
                <div className="p-6 bg-gradient-to-br from-earth-100 to-earth-50 rounded-2xl mx-auto w-fit mb-6 group-hover:shadow-soft transition-all">
                  <Satellite className="h-12 w-12 text-earth-700" />
                </div>
                <ModernCardTitle className="text-2xl mb-4">Satellite Monitoring</ModernCardTitle>
                <p className="text-sage-600 leading-relaxed mb-4">
                  Track crop health with advanced satellite imagery, NDVI analysis, and stress detection
                </p>
                <InfoTooltip {...TOOLTIP_CONTENT.ndvi} />
              </ModernCardContent>
            </ModernCard>
            
            <ModernCard variant="floating" className="group hover:scale-105 transition-all duration-300">
              <ModernCardContent className="p-8 text-center">
                <div className="p-6 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl mx-auto w-fit mb-6 group-hover:shadow-soft transition-all">
                  <Brain className="h-12 w-12 text-sage-700" />
                </div>
                <ModernCardTitle className="text-2xl mb-4">AI Recommendations</ModernCardTitle>
                <p className="text-sage-600 leading-relaxed mb-4">
                  Get intelligent insights for planting, irrigation, and harvest optimization
                </p>
                <InfoTooltip {...TOOLTIP_CONTENT.confidence} />
              </ModernCardContent>
            </ModernCard>
          </div>

          {/* CTA Section */}
          <ModernCard variant="glow" className="max-w-4xl mx-auto overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-earth-50 text-center py-12">
              <div className="flex justify-center mb-4">
                <Badge className="bg-white text-sage-700 border-sage-200">
                  <Zap className="h-4 w-4 mr-2" />
                  Ready to Transform?
                </Badge>
              </div>
              <ModernCardTitle className="text-4xl md:text-5xl font-light mb-6">
                Start Your Agricultural Revolution Today
              </ModernCardTitle>
              <ModernCardDescription className="text-lg max-w-2xl mx-auto mb-8">
                Join thousands of farmers who are already using Crops.AI to increase yields, 
                reduce costs, and make data-driven decisions for sustainable agriculture
              </ModernCardDescription>
              <Link href="/register">
                <InlineFloatingButton
                  icon={<Target className="h-5 w-5" />}
                  label="Start Your Free Trial"
                  showLabel={true}
                  variant="primary"
                  size="lg"
                  className="min-w-[250px]"
                />
              </Link>
            </ModernCardHeader>
          </ModernCard>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sage-50 to-cream-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light text-sage-800 mb-2">10K+</div>
              <div className="text-sage-600">Active Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light text-sage-800 mb-2">2M+</div>
              <div className="text-sage-600">Hectares Monitored</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light text-sage-800 mb-2">95%</div>
              <div className="text-sage-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light text-sage-800 mb-2">24/7</div>
              <div className="text-sage-600">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-br from-sage-100 to-earth-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sage-700">
            <div>
              <h4 className="font-semibold mb-4 text-sage-800">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-sage-900 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-sage-900 transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-sage-900 transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sage-800">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-sage-900 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-sage-900 transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-sage-900 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sage-800">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="hover:text-sage-900 transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-sage-900 transition-colors">Blog</Link></li>
                <li><Link href="/support" className="hover:text-sage-900 transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sage-800">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-sage-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-sage-900 transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-sage-900 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-sage-200/50 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sage-600 text-sm">© 2025 Crops.AI. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-sm text-sage-600">Built with</span>
              <Badge className="bg-sage-200 text-sage-700 border-sage-300">
                Next.js
              </Badge>
              <Badge className="bg-earth-200 text-earth-700 border-earth-300">
                AI/ML
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}