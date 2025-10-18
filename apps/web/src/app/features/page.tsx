import { Navbar } from '../../components/navigation/navbar'
import Link from 'next/link'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription, MetricCard } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { 
  CloudRain, Satellite, Brain, DollarSign, Activity, MapPin, 
  BarChart3, TrendingUp, Shield, Users, CheckCircle, ArrowRight,
  Zap, Target, Layers, TreePine, AlertTriangle, Calendar,
  Smartphone, Globe, Lock, Headphones
} from 'lucide-react'

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <CloudRain className="h-8 w-8" />,
      title: "Weather Forecasts",
      description: "Accurate weather updates for your farm with alerts for bad weather",
      features: ["Current weather updates", "2-day detailed forecasts", "Weather history trends", "Frost & storm alerts"]
    },
    {
      icon: <Satellite className="h-8 w-8" />,
      title: "Field Health Tracking",
      description: "Check how healthy your crops are and spot problems early",
      features: ["Weekly health updates", "Problem spotting", "Growth tracking", "Compare with past years"]
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Smart Recommendations",
      description: "Get helpful tips and suggestions to improve your farming",
      features: ["When to plant advice", "Watering schedules", "Pest warnings", "Best harvest times"]
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Money Management",
      description: "Track your farm income and expenses to see how much profit you're making",
      features: ["Track income & expenses", "Profit per acre reports", "Budget planning", "Money forecasts"]
    }
  ]

  const advancedFeatures = [
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Crop Health Tracking",
      description: "Check how healthy your crops are anytime"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Field Mapping",
      description: "Draw your field boundaries and calculate field sizes automatically"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Yield Prediction Analytics",
      description: "ML-based harvest forecasting with confidence intervals and scenario planning"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Market Intelligence",
      description: "Real-time commodity pricing and selling optimization recommendations"
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Smart Alert System",
      description: "Personalized notifications for weather, pests, diseases, and market opportunities"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Seasonal Planning",
      description: "Crop rotation planning and multi-year optimization strategies"
    }
  ]

  const platformFeatures = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile-First Design",
      description: "Responsive interface optimized for field use on any device"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-Currency Support",
      description: "Financial tracking in USD, CAD, EUR, GBP, AUD and more"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-grade encryption and data protection with audit trails"
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "Expert Support",
      description: "24/7 technical support with agricultural expertise"
    }
  ]

  return (
    <div className="minimal-page">
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <Layers className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <Target className="h-8 w-8 text-sage-600" />
      </div>
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <Badge className="bg-sage-100 text-sage-700 border-sage-200 mb-8 px-6 py-2 text-sm">
            <Zap className="h-4 w-4 mr-2" />
            Comprehensive Feature Set
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-light text-sage-800 mb-8 tracking-tight">
            Everything You Need for
            <br />
            <span className="text-sage-500">Smart Farming</span>
          </h1>
          
          <p className="text-xl text-sage-600 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
            From real-time crop monitoring to financial forecasting, Crops.AI provides a complete 
            suite of AI-powered tools for modern agriculture.
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
            <Link href="/pricing">
              <InlineFloatingButton
                icon={<DollarSign className="h-5 w-5" />}
                label="View Pricing"
                showLabel={true}
                variant="ghost"
                size="lg"
                className="min-w-[200px]"
              />
            </Link>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-sage-800 mb-4">Core Features</h2>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              Four pillars of intelligent farm management working together to optimize your operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => (
              <ModernCard key={index} variant="floating" className="hover:scale-105 transition-all duration-300">
                <ModernCardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-sage-100 rounded-xl text-sage-700">
                      {feature.icon}
                    </div>
                    <div>
                      <ModernCardTitle className="text-xl text-sage-800">{feature.title}</ModernCardTitle>
                    </div>
                  </div>
                  <ModernCardDescription className="mt-3">
                    {feature.description}
                  </ModernCardDescription>
                </ModernCardHeader>
                <ModernCardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-sage-600">
                        <CheckCircle className="h-4 w-4 text-sage-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Advanced Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-sage-800 mb-4">Advanced Capabilities</h2>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              Sophisticated tools for precision agriculture and data-driven decision making
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <ModernCard key={index} variant="soft" className="hover:variant-floating transition-all duration-300">
                <ModernCardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-sage-100 rounded-lg text-sage-700 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sage-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-sage-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Platform Features */}
        <div className="mb-20">
          <ModernCard variant="glow" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50 text-center">
              <ModernCardTitle className="text-2xl text-sage-800 mb-2">Platform Excellence</ModernCardTitle>
              <ModernCardDescription className="text-lg max-w-2xl mx-auto">
                Built with enterprise-grade infrastructure and user-centric design
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {platformFeatures.map((feature, index) => (
                  <div key={index} className="text-center group">
                    <div className="p-4 bg-sage-50 rounded-2xl mb-4 group-hover:bg-sage-100 transition-colors">
                      <div className="text-sage-700 mx-auto mb-3">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-sage-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-sage-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Technology Stack */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-sage-800 mb-4">Powered by Advanced Technology</h2>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              Cutting-edge infrastructure ensuring reliability, accuracy, and scalability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ModernCard variant="soft" className="text-center">
              <ModernCardContent className="p-8">
                <div className="p-6 bg-white/20 rounded-2xl mx-auto w-fit mb-6 backdrop-blur-sm">
                  <Satellite className="h-10 w-10 text-sage-700" />
                </div>
                <h3 className="text-xl font-semibold text-sage-800 mb-4">Satellite Data Sources</h3>
                <ul className="text-sage-700 text-sm space-y-2">
                  <li>ESA Copernicus Sentinel-2</li>
                  <li>Planet Labs Imagery</li>
                  <li>NASA Landsat Program</li>
                  <li>10m Resolution Updates</li>
                </ul>
              </ModernCardContent>
            </ModernCard>
            
            <ModernCard variant="glass" className="text-center">
              <ModernCardContent className="p-8">
                <div className="p-6 bg-white/20 rounded-2xl mx-auto w-fit mb-6 backdrop-blur-sm">
                  <Brain className="h-10 w-10 text-forest-700" />
                </div>
                <h3 className="text-xl font-semibold text-forest-800 mb-4">AI & Machine Learning</h3>
                <ul className="text-forest-700 text-sm space-y-2">
                  <li>TensorFlow & PyTorch</li>
                  <li>Computer Vision Models</li>
                  <li>Predictive Analytics</li>
                  <li>85%+ Accuracy Rate</li>
                </ul>
              </ModernCardContent>
            </ModernCard>
            
            <ModernCard variant="glow" className="text-center">
              <ModernCardContent className="p-8">
                <div className="p-6 bg-white/20 rounded-2xl mx-auto w-fit mb-6 backdrop-blur-sm">
                  <Shield className="h-10 w-10 text-earth-700" />
                </div>
                <h3 className="text-xl font-semibold text-earth-800 mb-4">Enterprise Infrastructure</h3>
                <ul className="text-earth-700 text-sm space-y-2">
                  <li>AWS Cloud Platform</li>
                  <li>99.9% Uptime SLA</li>
                  <li>Bank-grade Security</li>
                  <li>Global CDN Network</li>
                </ul>
              </ModernCardContent>
            </ModernCard>
          </div>
        </div>

        {/* CTA Section */}
        <ModernCard variant="floating" className="overflow-hidden max-w-4xl mx-auto">
          <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-earth-50 text-center py-12">
            <div className="flex justify-center mb-4">
              <Badge className="bg-white text-sage-700 border-sage-200">
                <Target className="h-4 w-4 mr-2" />
                Ready to Get Started?
              </Badge>
            </div>
            <ModernCardTitle className="text-3xl md:text-4xl font-light mb-6">
              Transform Your Farm Today
            </ModernCardTitle>
            <ModernCardDescription className="text-lg max-w-2xl mx-auto mb-8">
              Join thousands of farmers already using Crops.AI to increase yields, reduce costs, 
              and make smarter farming decisions with AI-powered insights.
            </ModernCardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <Link href="/dashboard">
                <InlineFloatingButton
                  icon={<Users className="h-5 w-5" />}
                  label="View Demo"
                  showLabel={true}
                  variant="ghost"
                  size="lg"
                  className="min-w-[200px]"
                />
              </Link>
            </div>
          </ModernCardHeader>
        </ModernCard>
      </main>
    </div>
  )
}