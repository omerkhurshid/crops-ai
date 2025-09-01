import { Navbar } from '../../components/navigation/navbar'
import Link from 'next/link'
import { Badge } from '../../components/ui/badge'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { InlineFloatingButton } from '../../components/ui/floating-button'
import { 
  Check, X, Star, Zap, Users, Building2, Crown, 
  ArrowRight, DollarSign, Calculator, HelpCircle,
  Sprout, MapPin, Activity, Brain, Shield, Headphones
} from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      icon: <Sprout className="h-6 w-6" />,
      price: 29,
      period: "per month",
      description: "Perfect for small farms getting started with precision agriculture",
      features: [
        "Up to 100 acres monitoring",
        "Weekly satellite updates",
        "Basic weather forecasting",
        "Mobile app access",
        "Email support",
        "3 months data history"
      ],
      limitations: [
        "Limited to 2 farms",
        "Basic AI recommendations",
        "No financial forecasting",
        "No team collaboration"
      ],
      popular: false,
      cta: "Start Free Trial",
      color: "sage"
    },
    {
      name: "Professional",
      icon: <Activity className="h-6 w-6" />,
      price: 99,
      period: "per month",
      description: "Advanced features for growing operations and professional farmers",
      features: [
        "Up to 1,000 acres monitoring",
        "Daily satellite updates",
        "Hyperlocal weather predictions",
        "Advanced AI recommendations",
        "Financial P&L tracking",
        "Multi-currency support",
        "12 months data history",
        "Priority support",
        "Team collaboration (5 users)",
        "Custom alerts & notifications"
      ],
      limitations: [
        "Limited to 10 farms",
        "Standard API access"
      ],
      popular: true,
      cta: "Most Popular",
      color: "forest"
    },
    {
      name: "Enterprise",
      icon: <Building2 className="h-6 w-6" />,
      price: 299,
      period: "per month",
      description: "Complete solution for large operations and agricultural enterprises",
      features: [
        "Unlimited acres & farms",
        "Real-time satellite monitoring",
        "Advanced ML analytics",
        "Financial forecasting & budgets",
        "Custom integrations",
        "API access & webhooks",
        "Unlimited data history",
        "White-label options",
        "Unlimited team members",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom training sessions"
      ],
      limitations: [],
      popular: false,
      cta: "Contact Sales",
      color: "golden"
    }
  ]

  const addOns = [
    {
      name: "IoT Sensor Integration",
      price: 15,
      description: "Connect soil moisture, weather stations, and equipment sensors"
    },
    {
      name: "Advanced Analytics",
      price: 25,
      description: "Machine learning insights, yield predictions, and market analysis"
    },
    {
      name: "Premium Support",
      price: 50,
      description: "24/7 priority support with agricultural experts"
    },
    {
      name: "Custom Integrations",
      price: "Custom",
      description: "ERP, accounting, and equipment management system connections"
    }
  ]

  const faq = [
    {
      question: "How accurate is the satellite monitoring?",
      answer: "Our satellite monitoring uses enterprise-grade imagery from ESA Copernicus and Planet Labs with 10m resolution. NDVI and vegetation health metrics maintain 90%+ accuracy compared to ground truth measurements."
    },
    {
      question: "Can I switch plans at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle, and we'll prorate any differences."
    },
    {
      question: "Is there a free trial?",
      answer: "All plans include a 14-day free trial with full access to features. No credit card required to start your trial."
    },
    {
      question: "What currencies do you support?",
      answer: "We support USD, CAD, EUR, GBP, AUD for both billing and financial tracking within the platform."
    },
    {
      question: "Do you offer volume discounts?",
      answer: "Yes, we offer custom pricing for operations over 10,000 acres or organizations managing multiple farms. Contact our sales team for details."
    },
    {
      question: "How often is satellite data updated?",
      answer: "Starter plan receives weekly updates, Professional gets daily updates, and Enterprise has access to real-time monitoring with multiple satellite sources."
    }
  ]

  return (
    <div className="minimal-page">
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <DollarSign className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <Calculator className="h-8 w-8 text-sage-600" />
      </div>
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <Badge className="bg-sage-100 text-sage-700 border-sage-200 mb-8 px-6 py-2 text-sm">
            <Star className="h-4 w-4 mr-2" />
            Transparent Pricing
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-light text-sage-800 mb-8 tracking-tight">
            Choose Your
            <br />
            <span className="text-sage-500">Farming Plan</span>
          </h1>
          
          <p className="text-xl text-sage-600 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
            Scale your agricultural intelligence with flexible pricing designed for farms of all sizes. 
            Start free, upgrade as you grow.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-sage-600">
              <Check className="h-5 w-5 text-sage-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2 text-sage-600">
              <Check className="h-5 w-5 text-sage-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2 text-sage-600">
              <Check className="h-5 w-5 text-sage-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <ModernCard 
              key={index} 
              variant={plan.popular ? "glow" : "floating"} 
              className={`relative hover:scale-105 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-sage-200 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-sage-600 text-white border-sage-700 px-4 py-1">
                    <Crown className="h-4 w-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <ModernCardHeader className={`${plan.popular ? 'bg-gradient-to-br from-sage-50/90 to-forest-50/90' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${
                    plan.color === 'sage' ? 'bg-sage-100 text-sage-700' :
                    plan.color === 'forest' ? 'bg-forest-100 text-forest-700' :
                    'bg-golden-100 text-golden-700'
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <ModernCardTitle className="text-xl text-sage-800">{plan.name}</ModernCardTitle>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-sage-800">
                      ${plan.name === 'Enterprise' ? 'Custom' : plan.price}
                    </span>
                    {plan.name !== 'Enterprise' && (
                      <span className="text-sage-600">/{plan.period}</span>
                    )}
                  </div>
                </div>
                
                <ModernCardDescription className="text-sage-600 leading-relaxed">
                  {plan.description}
                </ModernCardDescription>
              </ModernCardHeader>
              
              <ModernCardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-sage-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-sage-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <div className="border-t border-sage-200/50 pt-3 mt-6"></div>
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start gap-3 opacity-60">
                          <X className="h-5 w-5 text-sage-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-sage-600">{limitation}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                
                <div className="pt-6">
                  {plan.name === 'Enterprise' ? (
                    <InlineFloatingButton
                      icon={<Users className="h-4 w-4" />}
                      label="Contact Sales"
                      showLabel={true}
                      variant="primary"
                      className="w-full"
                    />
                  ) : (
                    <Link href="/register">
                      <InlineFloatingButton
                        icon={<ArrowRight className="h-4 w-4" />}
                        label={plan.popular ? "Start Free Trial" : "Get Started"}
                        showLabel={true}
                        variant={plan.popular ? "primary" : "secondary"}
                        className="w-full"
                      />
                    </Link>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-sage-800 mb-4">Optional Add-ons</h2>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              Enhance your plan with specialized features and premium services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addOns.map((addon, index) => (
              <ModernCard key={index} variant="soft" className="hover:variant-floating transition-all">
                <ModernCardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sage-800 mb-2">{addon.name}</h3>
                      <p className="text-sm text-sage-600 leading-relaxed">{addon.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-sage-800">
                        {typeof addon.price === 'string' ? addon.price : `$${addon.price}`}
                      </div>
                      {typeof addon.price === 'number' && (
                        <div className="text-sm text-sage-500">/month</div>
                      )}
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="mb-20">
          <ModernCard variant="glow" className="overflow-hidden">
            <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-cream-50 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-sage-100 rounded-2xl">
                  <Calculator className="h-8 w-8 text-sage-700" />
                </div>
              </div>
              <ModernCardTitle className="text-2xl text-sage-800 mb-4">Calculate Your ROI</ModernCardTitle>
              <ModernCardDescription className="text-lg max-w-2xl mx-auto mb-8">
                See how Crops.AI can improve your farm&apos;s profitability with data-driven insights
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-sage-800">15-30%</div>
                  <div className="text-sage-600 font-medium">Yield Increase</div>
                  <div className="text-sm text-sage-500">Through optimized timing and resource management</div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-sage-800">20-40%</div>
                  <div className="text-sage-600 font-medium">Cost Reduction</div>
                  <div className="text-sm text-sage-500">Via precision application and waste reduction</div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-sage-800">25%+</div>
                  <div className="text-sage-600 font-medium">Loss Prevention</div>
                  <div className="text-sm text-sage-500">Through predictive analytics and early warnings</div>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-sage-600 mb-6">
                  For a 500-acre farm, this typically means <strong className="text-sage-800">$50,000-$150,000</strong> in additional annual profit
                </p>
                <InlineFloatingButton
                  icon={<Calculator className="h-4 w-4" />}
                  label="Get Custom ROI Estimate"
                  showLabel={true}
                  variant="primary"
                />
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-sage-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              Get answers to common questions about our pricing and features
            </p>
          </div>
          
          <div className="space-y-4">
            {faq.map((item, index) => (
              <ModernCard key={index} variant="soft">
                <ModernCardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="h-5 w-5 text-sage-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sage-800 mb-2">{item.question}</h3>
                      <p className="text-sage-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <ModernCard variant="floating" className="overflow-hidden max-w-4xl mx-auto">
          <ModernCardHeader className="bg-gradient-to-r from-sage-50 to-earth-50 text-center py-12">
            <div className="flex justify-center mb-4">
              <Badge className="bg-white text-sage-700 border-sage-200">
                <Zap className="h-4 w-4 mr-2" />
                Start Your Journey Today
              </Badge>
            </div>
            <ModernCardTitle className="text-3xl md:text-4xl font-light mb-6">
              Ready to Transform Your Farm?
            </ModernCardTitle>
            <ModernCardDescription className="text-lg max-w-2xl mx-auto mb-8">
              Join thousands of farmers already using AI-powered insights to increase profitability 
              and make smarter decisions. Start your free trial today.
            </ModernCardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <InlineFloatingButton
                  icon={<ArrowRight className="h-5 w-5" />}
                  label="Start 14-Day Free Trial"
                  showLabel={true}
                  variant="primary"
                  size="lg"
                  className="min-w-[250px]"
                />
              </Link>
              <Link href="/features">
                <InlineFloatingButton
                  icon={<Activity className="h-5 w-5" />}
                  label="View All Features"
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