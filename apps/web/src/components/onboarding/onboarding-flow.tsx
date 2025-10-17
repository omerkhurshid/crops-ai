'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { InlineFloatingButton } from '../ui/floating-button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import Link from 'next/link'
import { 
  Sprout, MapPin, Brain, Settings, CheckCircle2, Clock, 
  ArrowRight, Lightbulb, Target, Activity, CloudRain,
  BarChart3, Users, HelpCircle
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'in_progress' | 'completed'
  action: {
    label: string
    href?: string
    onClick?: () => void
    variant: 'primary' | 'secondary' | 'ghost'
  }
  estimatedTime?: string
  benefits?: string[]
}

interface OnboardingFlowProps {
  userStats?: {
    totalFarms?: number
    totalFields?: number
    hasWeatherData?: boolean
    hasRecommendations?: boolean
  }
  onStepComplete?: (stepId: string) => void
}

export function OnboardingFlow({ userStats, onStepComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // Define onboarding steps based on user progress
  const steps: OnboardingStep[] = [
    {
      id: 'create-farm',
      title: 'Create Your First Farm',
      description: 'Set up your agricultural operation with location, size, and basic information',
      icon: <Sprout className="h-6 w-6" />,
      status: (userStats?.totalFarms || 0) > 0 ? 'completed' : 'in_progress',
      action: {
        label: (userStats?.totalFarms || 0) > 0 ? 'View Farms' : 'Create Farm',
        href: (userStats?.totalFarms || 0) > 0 ? '/farms' : '/farms/create',
        variant: 'primary'
      },
      estimatedTime: '5 minutes',
      benefits: [
        'Enable satellite monitoring',
        'Get weather alerts for your location',
        'Access regional crop insights'
      ]
    },
    {
      id: 'add-fields',
      title: 'Define Your Fields',
      description: 'Map your field boundaries to enable precision satellite monitoring and AI analysis',
      icon: <MapPin className="h-6 w-6" />,
      status: (userStats?.totalFields || 0) > 0 ? 'completed' : 
               (userStats?.totalFarms || 0) > 0 ? 'in_progress' : 'pending',
      action: {
        label: (userStats?.totalFields || 0) > 0 ? 'Manage Fields' : 'Add First Field',
        href: (userStats?.totalFields || 0) > 0 ? '/fields' : 
              (userStats?.totalFarms || 0) > 0 ? '/farms' : undefined,
        variant: (userStats?.totalFarms || 0) > 0 ? 'primary' : 'secondary'
      },
      estimatedTime: '10 minutes',
      benefits: [
        'Satellite health monitoring',
        'Field-specific recommendations',
        'Crop stress detection'
      ]
    },
    {
      id: 'explore-features',
      title: 'Explore Core Features',
      description: 'Discover weather intelligence, crop health monitoring, and AI recommendations',
      icon: <Brain className="h-6 w-6" />,
      status: userStats?.hasWeatherData || userStats?.hasRecommendations ? 'completed' : 
               (userStats?.totalFields || 0) > 0 ? 'in_progress' : 'pending',
      action: {
        label: 'Explore Features',
        href: '/features',
        variant: (userStats?.totalFields || 0) > 0 ? 'primary' : 'ghost'
      },
      estimatedTime: '15 minutes',
      benefits: [
        'Weather forecasting',
        'Crop health analytics',
        'AI-powered insights'
      ]
    },
    {
      id: 'customize-dashboard',
      title: 'Customize Your Experience',
      description: 'Set up preferences, notifications, and personalize your dashboard',
      icon: <Settings className="h-6 w-6" />,
      status: 'pending',
      action: {
        label: 'Customize Dashboard',
        onClick: () => {
          // Dashboard customization pending
          alert('Dashboard customization coming soon!')
        },
        variant: 'ghost'
      },
      estimatedTime: '5 minutes',
      benefits: [
        'Personalized alerts',
        'Custom dashboard layout',
        'Notification preferences'
      ]
    }
  ]

  // Calculate progress
  const totalSteps = steps.length
  const completedCount = steps.filter(step => step.status === 'completed').length
  const progress = (completedCount / totalSteps) * 100

  // Update current step based on progress
  useEffect(() => {
    const nextIncompleteStep = steps.findIndex(step => step.status !== 'completed')
    if (nextIncompleteStep !== -1) {
      setCurrentStep(nextIncompleteStep)
    }
  }, [userStats])

  const handleStepAction = (step: OnboardingStep) => {
    if (step.action.onClick) {
      step.action.onClick()
    }
    if (onStepComplete) {
      onStepComplete(step.id)
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <ModernCard variant="glow" className="overflow-hidden">
        <ModernCardHeader className="bg-gradient-to-r from-sage-50/90 to-earth-50/90">
          <div className="flex items-center justify-between">
            <div>
              <ModernCardTitle className="text-2xl text-sage-800 mb-2">
                Welcome to Crops.AI!
              </ModernCardTitle>
              <ModernCardDescription className="text-lg">
                Let&apos;s get your farm management system set up in just a few steps
              </ModernCardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-sage-800">{completedCount}/{totalSteps}</div>
              <div className="text-sm text-sage-600">Steps Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-sage-700">Setup Progress</span>
              <span className="text-sm text-sage-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </ModernCardHeader>
      </ModernCard>

      {/* Step Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {steps.map((step, index) => (
          <ModernCard 
            key={step.id} 
            variant={step.status === 'completed' ? 'soft' : step.status === 'in_progress' ? 'floating' : 'default'}
            className={`transition-all duration-300 ${
              step.status === 'in_progress' ? 'ring-2 ring-sage-200' : ''
            }`}
          >
            <ModernCardHeader>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  step.status === 'completed' ? 'bg-green-100 text-green-700' :
                  step.status === 'in_progress' ? 'bg-sage-100 text-sage-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {step.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <ModernCardTitle className="text-lg">{step.title}</ModernCardTitle>
                    <Badge variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'in_progress' ? 'secondary' :
                      'outline'
                    }>
                      {step.status === 'completed' ? 'Complete' :
                       step.status === 'in_progress' ? 'In Progress' :
                       'Pending'}
                    </Badge>
                  </div>
                  <ModernCardDescription className="leading-relaxed">
                    {step.description}
                  </ModernCardDescription>
                  
                  {step.estimatedTime && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-sage-500">
                      <Clock className="h-3 w-3" />
                      <span>{step.estimatedTime}</span>
                    </div>
                  )}
                </div>
              </div>
            </ModernCardHeader>
            
            {step.benefits && (
              <ModernCardContent className="pt-0">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-sage-800 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    What you&apos;ll unlock:
                  </h4>
                  <ul className="space-y-1">
                    {step.benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-sage-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-sage-400 rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  {step.action.href ? (
                    <Link href={step.action.href}>
                      <InlineFloatingButton
                        icon={step.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                        label={step.action.label}
                        variant={step.action.variant}
                        size="sm"
                        disabled={step.status === 'pending'}
                      />
                    </Link>
                  ) : (
                    <InlineFloatingButton
                      icon={step.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                      label={step.action.label}
                      variant={step.action.variant}
                      size="sm"
                      disabled={step.status === 'pending'}
                      onClick={() => handleStepAction(step)}
                    />
                  )}
                </div>
              </ModernCardContent>
            )}
          </ModernCard>
        ))}
      </div>

      {/* Help & Support */}
      <ModernCard variant="soft">
        <ModernCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <HelpCircle className="h-6 w-6 text-blue-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sage-800 mb-2">Need Help Getting Started?</h3>
              <p className="text-sage-600 text-sm mb-4 leading-relaxed">
                Our team is here to help you make the most of Crops.AI. Access our knowledge base, 
                watch tutorial videos, or contact support directly.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/help">
                  <InlineFloatingButton
                    icon={<Lightbulb className="h-4 w-4" />}
                    label="View Tutorials"
                    variant="ghost"
                    size="sm"
                  />
                </Link>
                <Link href="/features">
                  <InlineFloatingButton
                    icon={<BarChart3 className="h-4 w-4" />}
                    label="Feature Guide"
                    variant="ghost"
                    size="sm"
                  />
                </Link>
                <InlineFloatingButton
                  icon={<Users className="h-4 w-4" />}
                  label="Contact Support"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('mailto:support@crops.ai', '_blank')}
                />
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}