'use client'

import { useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { InlineFloatingButton } from '../ui/floating-button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Sprout, MapPin, Calendar, DollarSign, Settings, 
  CheckCircle2, ArrowRight, ArrowLeft, Info, Lightbulb,
  Target, Activity, CloudRain, BarChart3, Users, X, Eye
} from 'lucide-react'

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
  isOptional?: boolean
  estimatedTime?: string
}

interface GuidedFarmSetupProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function GuidedFarmSetup({ onComplete, onSkip }: GuidedFarmSetupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const steps: SetupStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Crops.AI',
      description: 'Let\'s set up your agricultural management system',
      icon: <Sprout className="h-6 w-6" />,
      estimatedTime: '1 minute',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl mx-auto w-fit mb-4">
              <Sprout className="h-12 w-12 text-sage-700" />
            </div>
            <h3 className="text-2xl font-semibold text-sage-800 mb-3">
              Transform Your Farming with AI
            </h3>
            <p className="text-sage-600 max-w-2xl mx-auto leading-relaxed">
              You&apos;re about to unlock the power of precision agriculture with satellite monitoring, 
              AI-powered insights, and data-driven decision making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-sage-50 rounded-xl">
              <Activity className="h-8 w-8 text-sage-600 mx-auto mb-2" />
              <h4 className="font-medium text-sage-800 mb-1">Crop Health Monitoring</h4>
              <p className="text-xs text-sage-600">Real-time satellite analysis</p>
            </div>
            <div className="text-center p-4 bg-earth-50 rounded-xl">
              <CloudRain className="h-8 w-8 text-earth-600 mx-auto mb-2" />
              <h4 className="font-medium text-earth-800 mb-1">Weather Intelligence</h4>
              <p className="text-xs text-earth-600">Hyperlocal forecasting</p>
            </div>
            <div className="text-center p-4 bg-cream-50 rounded-xl">
              <Target className="h-8 w-8 text-sage-600 mx-auto mb-2" />
              <h4 className="font-medium text-sage-800 mb-1">AI Recommendations</h4>
              <p className="text-xs text-sage-600">Personalized insights</p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This setup takes about 10 minutes and will unlock all platform features. 
              You can always skip steps and return later.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <InlineFloatingButton
              icon={<Sprout className="h-4 w-4" />}
              label="Set Up My Farm"
              variant="primary"
              size="md"
              showLabel={true}
              onClick={() => handleNext()}
            />
            <InlineFloatingButton
              icon={<Eye className="h-4 w-4" />}
              label="Explore with Demo Data"
              variant="secondary"
              size="md"
              showLabel={true}
              onClick={() => {
                // Enable demo mode and redirect to dashboard
                localStorage.setItem('demoMode', 'true')
                if (onComplete) onComplete()
              }}
            />
          </div>
        </div>
      )
    },
    {
      id: 'farm-basics',
      title: 'Farm Information',
      description: 'Add your farm name, location, and basic details',
      icon: <MapPin className="h-6 w-6" />,
      estimatedTime: '3 minutes',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-sage-800 mb-3">Farm Details</h3>
            <p className="text-sage-600 mb-6">
              Let&apos;s start with basic information about your agricultural operation.
            </p>
          </div>

          <div className="bg-sage-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sage-200 rounded-lg">
                <Sprout className="h-5 w-5 text-sage-700" />
              </div>
              <div>
                <h4 className="font-semibold text-sage-800">What you&apos;ll provide:</h4>
                <p className="text-sm text-sage-600">Essential farm information for setup</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-sage-700">
                  <CheckCircle2 className="h-4 w-4 text-sage-600" />
                  Farm name and description
                </div>
                <div className="flex items-center gap-2 text-sm text-sage-700">
                  <CheckCircle2 className="h-4 w-4 text-sage-600" />
                  Geographic location (GPS coordinates)
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-sage-700">
                  <CheckCircle2 className="h-4 w-4 text-sage-600" />
                  Total farm area in hectares
                </div>
                <div className="flex items-center gap-2 text-sm text-sage-700">
                  <CheckCircle2 className="h-4 w-4 text-sage-600" />
                  Primary crop types
                </div>
              </div>
            </div>
          </div>

          <div className="bg-sage-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-sage-800 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-sage-600" />
              Quick Start Tips
            </h4>
            <ul className="text-sm text-sage-700 space-y-1">
              <li>• Farm name can be simple: "Johnson Farm" or "Prairie View Ranch"</li>
              <li>• Location helps us provide accurate weather and market data</li>
              <li>• Area estimate is fine - you can update this later</li>
              <li>• Popular crops: Corn, Soybeans, Wheat, Cotton, Barley</li>
            </ul>
          </div>

          <div className="text-center">
            <InlineFloatingButton
              icon={<MapPin className="h-4 w-4" />}
              label="Add Farm Information"
              variant="primary"
              size="md"
              showLabel={true}
              onClick={() => {
                // Redirect to farm creation
                window.location.href = '/farms/create?guided=true'
              }}
            />
          </div>
        </div>
      )
    },
    {
      id: 'field-mapping',
      title: 'Field Boundaries',
      description: 'Define your field boundaries for satellite monitoring',
      icon: <Target className="h-6 w-6" />,
      estimatedTime: '5 minutes',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-sage-800 mb-3">Map Your Fields</h3>
            <p className="text-sage-600 mb-6">
              Precise field boundaries enable accurate satellite monitoring and field-specific insights.
            </p>
          </div>

          <div className="bg-gradient-to-r from-earth-50 to-sage-50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-earth-200 rounded-xl">
                <Target className="h-6 w-6 text-earth-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-earth-800 mb-2">Why field mapping matters:</h4>
                <ul className="space-y-2 text-sm text-earth-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-earth-600 rounded-full"></div>
                    Enables precise satellite health monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-earth-600 rounded-full"></div>
                    Provides field-specific weather forecasts
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-earth-600 rounded-full"></div>
                    Generates targeted AI recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-earth-600 rounded-full"></div>
                    Tracks individual field performance
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Field Mapping Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border">
                <h5 className="font-medium text-gray-800 mb-1">Quick Start</h5>
                <p className="text-sm text-gray-600">Add 1-3 fields with estimated boundaries</p>
                <p className="text-xs text-green-600 mt-1">✓ 5 minutes • Good for beginners</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h5 className="font-medium text-gray-800 mb-1">Precision Mapping</h5>
                <p className="text-sm text-gray-600">Draw exact boundaries on satellite map</p>
                <p className="text-xs text-blue-600 mt-1">✓ 15 minutes • Maximum accuracy</p>
              </div>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro tip:</strong> Fields should be at least 1 hectare (2.5 acres) for optimal satellite coverage. 
              You can add multiple fields and update boundaries anytime.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-3">
            <p className="text-sm text-sage-600">
              Complete farm setup first, then return to add field boundaries
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <InlineFloatingButton
                icon={<Target className="h-4 w-4" />}
                label="Quick Field Setup"
                variant="primary"
                size="sm"
                showLabel={true}
                onClick={() => window.location.href = '/fields?quick=true'}
              />
              <InlineFloatingButton
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="I'll Add Fields Later"
                variant="secondary"
                size="sm"
                showLabel={true}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features-overview',
      title: 'Platform Features',
      description: 'Discover the powerful tools at your disposal',
      icon: <BarChart3 className="h-6 w-6" />,
      estimatedTime: '2 minutes',
      isOptional: true,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-sage-800 mb-3">Your Farming Command Center</h3>
            <p className="text-sage-600 mb-6">
              Explore the comprehensive suite of tools designed to optimize your agricultural operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-sage-200 rounded-xl hover:bg-sage-50 transition-colors">
              <div className="flex items-start gap-3">
                <Activity className="h-6 w-6 text-sage-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-sage-800 mb-1">Crop Health</h4>
                  <p className="text-sm text-sage-600 leading-relaxed">
                    Real-time satellite monitoring, NDVI analysis, and stress detection
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-sage-200 rounded-xl hover:bg-sage-50 transition-colors">
              <div className="flex items-start gap-3">
                <CloudRain className="h-6 w-6 text-sage-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-sage-800 mb-1">Weather Intelligence</h4>
                  <p className="text-sm text-sage-600 leading-relaxed">
                    Hyperlocal forecasts, alerts, and agricultural weather insights
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-sage-200 rounded-xl hover:bg-sage-50 transition-colors">
              <div className="flex items-start gap-3">
                <Target className="h-6 w-6 text-sage-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-sage-800 mb-1">AI Recommendations</h4>
                  <p className="text-sm text-sage-600 leading-relaxed">
                    Personalized farming advice based on your specific conditions
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-sage-200 rounded-xl hover:bg-sage-50 transition-colors">
              <div className="flex items-start gap-3">
                <DollarSign className="h-6 w-6 text-sage-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-sage-800 mb-1">Financial Tracking</h4>
                  <p className="text-sm text-sage-600 leading-relaxed">
                    Comprehensive expense tracking and profitability analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sage-50 to-earth-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-sage-800 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-sage-600" />
              Immediate Value You'll Get
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-sage-700">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Real-time crop health monitoring
              </div>
              <div className="flex items-center gap-2 text-sage-700">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                7-day weather forecasts for your fields
              </div>
              <div className="flex items-center gap-2 text-sage-700">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                AI recommendations for optimal timing
              </div>
              <div className="flex items-center gap-2 text-sage-700">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Financial tracking and profitability analysis
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-sage-600">
              Ready to explore all features and start optimizing your farm?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <InlineFloatingButton
                icon={<ArrowRight className="h-4 w-4" />}
                label="Go to Dashboard"
                variant="primary"
                size="md"
                showLabel={true}
                onClick={() => {
                  if (onComplete) onComplete()
                }}
              />
              <InlineFloatingButton
                icon={<Eye className="h-4 w-4" />}
                label="Feature Tour"
                variant="secondary"
                size="md"
                showLabel={true}
                onClick={() => window.open('/features', '_blank')}
              />
            </div>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      if (!completedSteps.includes(currentStepData.id)) {
        setCompletedSteps([...completedSteps, currentStepData.id])
      }
    } else {
      if (onComplete) onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (onSkip) onSkip()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <ModernCard variant="soft" className="mb-8">
        <ModernCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sage-100 rounded-lg">
                {currentStepData.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-sage-800">
                  Step {currentStep + 1} of {steps.length}
                </h2>
                <p className="text-sm text-sage-600">
                  {currentStepData.title}
                  {currentStepData.estimatedTime && ` • ${currentStepData.estimatedTime}`}
                  {currentStepData.isOptional && (
                    <Badge variant="outline" className="ml-2">Optional</Badge>
                  )}
                </p>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </ModernCardContent>
      </ModernCard>

      {/* Step Content */}
      <ModernCard variant="floating">
        <ModernCardHeader>
          <ModernCardTitle className="text-2xl">{currentStepData.title}</ModernCardTitle>
          <ModernCardDescription className="text-lg">
            {currentStepData.description}
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          {currentStepData.content}
        </ModernCardContent>
      </ModernCard>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <InlineFloatingButton
              icon={<ArrowLeft className="h-4 w-4" />}
              label="Previous"
              variant="ghost"
              onClick={handlePrevious}
            />
          )}
          <InlineFloatingButton
            icon={<X className="h-4 w-4" />}
            label="Skip Setup"
            variant="ghost"
            onClick={handleSkip}
          />
        </div>

        <InlineFloatingButton
          icon={currentStep === steps.length - 1 ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          label={currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
          variant="primary"
          showLabel={true}
          onClick={handleNext}
        />
      </div>
    </div>
  )
}