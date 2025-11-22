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
      title: 'Welcome to Cropple.AI',
      description: 'Let\'s set up your agricultural management system',
      icon: <Sprout className="h-6 w-6" />,
      estimatedTime: '1 minute',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="p-4 bg-gradient-to-br from-sage-100 to-#F8FAF8 rounded-2xl mx-auto w-fit mb-4">
              <Sprout className="h-12 w-12 text-[#555555]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#1A1A1A] mb-3">
              Smart Farming Made Simple
            </h3>
            <p className="text-[#555555] max-w-2xl mx-auto leading-relaxed">
              Get field health updates, weather alerts, and farming recommendations 
              to help you grow better crops and increase profits.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#F8FAF8] rounded-xl">
              <Activity className="h-8 w-8 text-[#555555] mx-auto mb-2" />
              <h4 className="font-medium text-[#1A1A1A] mb-1">Field Health Checks</h4>
              <p className="text-xs text-[#555555]">See how your crops are doing</p>
            </div>
            <div className="text-center p-4 bg-[#F8FAF8] rounded-xl">
              <CloudRain className="h-8 w-8 text-[#7A8F78] mx-auto mb-2" />
              <h4 className="font-medium text-[#7A8F78] mb-1">Weather Forecasts</h4>
              <p className="text-xs text-[#7A8F78]">Weather updates for your farm</p>
            </div>
            <div className="text-center p-4 bg-[#FAFAF7] rounded-xl">
              <Target className="h-8 w-8 text-[#555555] mx-auto mb-2" />
              <h4 className="font-medium text-[#1A1A1A] mb-1">Smart Suggestions</h4>
              <p className="text-xs text-[#555555]">Tips to improve your farm</p>
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
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Farm Details</h3>
            <p className="text-[#555555] mb-6">
              Let&apos;s start with basic information about your farm.
            </p>
          </div>
          <div className="bg-[#F8FAF8] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#DDE4D8] rounded-lg">
                <Sprout className="h-5 w-5 text-[#555555]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1A1A1A]">What you&apos;ll provide:</h4>
                <p className="text-sm text-[#555555]">Essential farm information for setup</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <CheckCircle2 className="h-4 w-4 text-[#555555]" />
                  Farm name and description
                </div>
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <CheckCircle2 className="h-4 w-4 text-[#555555]" />
                  Your farm's location
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <CheckCircle2 className="h-4 w-4 text-[#555555]" />
                  How many acres you farm
                </div>
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <CheckCircle2 className="h-4 w-4 text-[#555555]" />
                  Primary crop types
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#F8FAF8] rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-[#1A1A1A] mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[#555555]" />
              Quick Start Tips
            </h4>
            <ul className="text-sm text-[#555555] space-y-1">
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
                window.location.href = '/farms/create-unifiedguided=true'
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
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Map Your Fields</h3>
            <p className="text-[#555555] mb-6">
              Mapping your fields helps us track each field's health and give you specific recommendations.
            </p>
          </div>
          <div className="bg-gradient-to-r from-[#F8FAF8] to-[#F8FAF8] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#DDE4D8] rounded-xl">
                <Target className="h-6 w-6 text-[#7A8F78]" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#7A8F78] mb-2">Why field mapping helps:</h4>
                <ul className="space-y-2 text-sm text-[#7A8F78]">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#7A8F78] rounded-full"></div>
                    Check each field's health individually
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#7A8F78] rounded-full"></div>
                    Get weather updates for each field
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#7A8F78] rounded-full"></div>
                    Receive tips specific to each field
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#7A8F78] rounded-full"></div>
                    Track how each field is performing
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-[#7A8F78] mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-[#7A8F78]" />
              Field Mapping Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border">
                <h5 className="font-medium text-[#1A1A1A] mb-1">Quick Start</h5>
                <p className="text-sm text-[#555555]">Add 1-3 fields with estimated boundaries</p>
                <p className="text-xs text-[#8FBF7F] mt-1">✓ 5 minutes • Good for beginners</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <h5 className="font-medium text-[#1A1A1A] mb-1">Detailed Mapping</h5>
                <p className="text-sm text-[#555555]">Draw exact field shapes on the map</p>
                <p className="text-xs text-[#7A8F78] mt-1">✓ 15 minutes • Most accurate</p>
              </div>
            </div>
          </div>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Tip:</strong> Fields should be at least 2.5 acres for best results. 
              You can add multiple fields and change boundaries anytime.
            </AlertDescription>
          </Alert>
          <div className="text-center space-y-3">
            <p className="text-sm text-[#555555]">
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
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Your Farming Command Center</h3>
            <p className="text-[#555555] mb-6">
              Explore the tools that will help you grow better crops and increase profits.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-[#DDE4D8] rounded-xl hover:bg-[#F8FAF8] transition-colors">
              <div className="flex items-start gap-3">
                <Activity className="h-6 w-6 text-[#555555] mt-1" />
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-1">Crop Health</h4>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    Check how healthy your crops are and spot problems early
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-[#DDE4D8] rounded-xl hover:bg-[#F8FAF8] transition-colors">
              <div className="flex items-start gap-3">
                <CloudRain className="h-6 w-6 text-[#555555] mt-1" />
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-1">Weather Forecasts</h4>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    Get accurate weather forecasts and alerts for your farm
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-[#DDE4D8] rounded-xl hover:bg-[#F8FAF8] transition-colors">
              <div className="flex items-start gap-3">
                <Target className="h-6 w-6 text-[#555555] mt-1" />
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-1">Smart Recommendations</h4>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    Get farming advice tailored specifically to your farm
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-[#DDE4D8] rounded-xl hover:bg-[#F8FAF8] transition-colors">
              <div className="flex items-start gap-3">
                <DollarSign className="h-6 w-6 text-[#555555] mt-1" />
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-1">Financial Tracking</h4>
                  <p className="text-sm text-[#555555] leading-relaxed">
                    Comprehensive expense tracking and profitability analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-sage-50 to-#F8FAF8 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#555555]" />
              Immediate Value You'll Get
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-[#555555]">
                <CheckCircle2 className="h-4 w-4 text-[#8FBF7F]" />
                Check crop health anytime
              </div>
              <div className="flex items-center gap-2 text-[#555555]">
                <CheckCircle2 className="h-4 w-4 text-[#8FBF7F]" />
                Weekly weather forecasts for your fields
              </div>
              <div className="flex items-center gap-2 text-[#555555]">
                <CheckCircle2 className="h-4 w-4 text-[#8FBF7F]" />
                Smart suggestions for best timing
              </div>
              <div className="flex items-center gap-2 text-[#555555]">
                <CheckCircle2 className="h-4 w-4 text-[#8FBF7F]" />
                Financial tracking and profitability analysis
              </div>
            </div>
          </div>
          <div className="text-center space-y-3">
            <p className="text-sm text-[#555555]">
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
              <div className="p-2 bg-[#F8FAF8] rounded-lg">
                {currentStepData.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#1A1A1A]">
                  Step {currentStep + 1} of {steps.length}
                </h2>
                <p className="text-sm text-[#555555]">
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