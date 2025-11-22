'use client'
import { useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Crown, 
  TrendingUp, 
  Brain, 
  Bell, 
  DollarSign, 
  BarChart3,
  Zap,
  Shield,
  Star,
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react'
interface PremiumFeaturesProps {
  userTier?: 'free' | 'premium' | 'pro'
  onUpgrade?: (tier: string) => void
}
export function PremiumFeatures({ userTier = 'free', onUpgrade }: PremiumFeaturesProps) {
  const [selectedTier, setSelectedTier] = useState<'premium' | 'pro'>('premium')
  const features = {
    free: [
      'Basic weather forecasts',
      'Field mapping (up to 3 fields)',
      'Crop planning calendar',
      'Simple financial tracking',
      'Mobile app access'
    ],
    premium: [
      'AI yield predictions (95% accuracy)',
      'Personalized smart alerts',
      'Advanced weather intelligence',
      'Market timing recommendations',
      'Unlimited fields & crops',
      'Historical data analysis',
      'Email support'
    ],
    pro: [
      'Everything in Premium',
      'Custom financial reports',
      'Regional benchmarking',
      'API access & integrations',
      'Priority phone support',
      'Advanced analytics dashboard',
      'White-label options'
    ]
  }
  const benefits = [
    {
      icon: <Brain className="h-6 w-6 text-blue-600" />,
      title: 'AI Yield Prediction',
      description: 'Get accurate harvest forecasts 2-3 months ahead with 95% accuracy',
      value: 'Save $2,500+ per season',
      tier: 'premium'
    },
    {
      icon: <Bell className="h-6 w-6 text-orange-600" />,
      title: 'Smart Alert System',
      description: 'Personalized notifications prevent crop losses and optimize timing',
      value: 'Prevent 15-25% losses',
      tier: 'premium'
    },
    {
      icon: <DollarSign className="h-6 w-6 text-[#8FBF7F]" />,
      title: 'Market Intelligence',
      description: 'Know exactly when to sell for maximum profit with AI market analysis',
      value: 'Increase revenue 10-20%',
      tier: 'premium'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
      title: 'Advanced Analytics',
      description: 'Compare your performance against similar farms in your region',
      value: 'Optimize efficiency',
      tier: 'pro'
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: 'Automation Tools',
      description: 'Automate reports, alerts, and data collection to save time',
      value: 'Save 20+ hours/month',
      tier: 'pro'
    },
    {
      icon: <Shield className="h-6 w-6 text-red-600" />,
      title: 'Risk Management',
      description: 'Early warning systems for weather, pests, and market volatility',
      value: 'Reduce risk exposure',
      tier: 'premium'
    }
  ]
  const pricing = {
    premium: {
      monthly: 8.99,
      annual: 89.99,
      savings: 17
    },
    pro: {
      monthly: 19.99,
      annual: 199.99,
      savings: 17
    }
  }
  return (
    <div className="space-y-8">
      {/* Value Proposition Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gray-900">Unlock Premium Features</h2>
        </div>
        <p className="text-lg text-[#555555] max-w-2xl mx-auto">
          Take your farming to the next level with AI-powered insights, advanced analytics, and personalized recommendations.
        </p>
      </div>
      {/* ROI Calculator */}
      <Alert className="bg-[#F8FAF8] border-[#DDE4D8]">
        <TrendingUp className="h-4 w-4 text-[#8FBF7F]" />
        <AlertDescription className="text-[#7A8F78]">
          <strong>Return on Investment:</strong> Premium users typically see 15-30% yield increases and 20-40% cost reductions, 
          paying for the subscription 10x over in the first season.
        </AlertDescription>
      </Alert>
      {/* Feature Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <ModernCard key={index} variant="soft" className="relative overflow-hidden">
            {benefit.tier === 'pro' && (
              <Badge className="absolute top-4 right-4 bg-purple-100 text-purple-800 border-purple-300">
                Pro Only
              </Badge>
            )}
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {benefit.icon}
                </div>
                <ModernCardTitle className="text-lg">{benefit.title}</ModernCardTitle>
              </div>
            </ModernCardHeader>
            <ModernCardContent>
              <p className="text-[#555555] mb-4">{benefit.description}</p>
              <div className="bg-[#F8FAF8] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-gray-900">{benefit.value}</span>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        ))}
      </div>
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Premium Tier */}
        <ModernCard 
          variant={selectedTier === 'premium' ? 'floating' : 'soft'} 
          className={`relative ${selectedTier === 'premium' ? 'ring-2 ring-#555555' : ''}`}
        >
          {selectedTier === 'premium' && (
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#7A8F78] text-white">
              Most Popular
            </Badge>
          )}
          <ModernCardHeader className="text-center">
            <ModernCardTitle className="text-2xl flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-yellow-600" />
              Premium
            </ModernCardTitle>
            <div className="text-4xl font-bold text-gray-900 my-4">
              ${pricing.premium.monthly}
              <span className="text-lg font-normal text-[#555555]">/month</span>
            </div>
            <p className="text-[#555555]">
              or ${pricing.premium.annual}/year (save {pricing.premium.savings}%)
            </p>
          </ModernCardHeader>
          <ModernCardContent>
            <ul className="space-y-3">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8FBF7F] flex-shrink-0" />
                  <span className="text-[#555555]">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full mt-6 bg-[#7A8F78] hover:bg-[#5E6F5A]"
              onClick={() => {
                setSelectedTier('premium')
                onUpgrade?.('premium')
              }}
              disabled={userTier === 'premium' || userTier === 'pro'}
            >
              {userTier === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
            </Button>
          </ModernCardContent>
        </ModernCard>
        {/* Pro Tier */}
        <ModernCard 
          variant={selectedTier === 'pro' ? 'floating' : 'soft'}
          className={`relative ${selectedTier === 'pro' ? 'ring-2 ring-purple-500' : ''}`}
        >
          <ModernCardHeader className="text-center">
            <ModernCardTitle className="text-2xl flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-purple-600" />
              Professional
            </ModernCardTitle>
            <div className="text-4xl font-bold text-gray-900 my-4">
              ${pricing.pro.monthly}
              <span className="text-lg font-normal text-[#555555]">/month</span>
            </div>
            <p className="text-[#555555]">
              or ${pricing.pro.annual}/year (save {pricing.pro.savings}%)
            </p>
          </ModernCardHeader>
          <ModernCardContent>
            <ul className="space-y-3">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8FBF7F] flex-shrink-0" />
                  <span className="text-[#555555]">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                setSelectedTier('pro')
                onUpgrade?.('pro')
              }}
              disabled={userTier === 'pro'}
            >
              {userTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </Button>
          </ModernCardContent>
        </ModernCard>
      </div>
      {/* Current Free Limitations */}
      {userTier === 'free' && (
        <ModernCard variant="soft" className="border-yellow-200 bg-yellow-50">
          <ModernCardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-yellow-600" />
              <ModernCardTitle className="text-yellow-800">Current Free Plan Limitations</ModernCardTitle>
            </div>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-2 text-yellow-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Limited to 3 fields maximum</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Basic weather forecasts only (no AI predictions)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>No personalized alerts or recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Limited historical data access</span>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}
      {/* Testimonials */}
      <div className="bg-[#F8FAF8] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">What Farmers Are Saying</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4">
            <p className="text-[#555555] italic mb-2">
              "The AI yield predictions saved me from overplanting last season. Increased my profit margins by 22%."
            </p>
            <div className="text-sm text-[#555555]">- Sarah M., Iowa (Corn & Soybeans)</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-[#555555] italic mb-2">
              "Smart alerts prevented a major aphid outbreak. The early warning was worth the subscription cost alone."
            </p>
            <div className="text-sm text-[#555555]">- Mike T., Nebraska (Wheat & Corn)</div>
          </div>
        </div>
      </div>
      {/* Money Back Guarantee */}
      <div className="text-center">
        <div className="bg-[#F8FAF8] border border-[#DDE4D8] rounded-lg p-4 inline-block">
          <div className="flex items-center gap-2 text-[#7A8F78] font-semibold">
            <Shield className="h-5 w-5" />
            30-Day Money-Back Guarantee
          </div>
          <p className="text-[#7A8F78] text-sm mt-1">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
        </div>
      </div>
    </div>
  )
}