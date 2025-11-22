'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  CheckCircle,
  MapPin,
  Sprout,
  Users,
  BarChart3,
  ArrowRight,
  Lightbulb,
  Target,
  Gift,
  Sparkles
} from 'lucide-react'
interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href?: string
  action?: () => void
  completed: boolean
  priority: 'essential' | 'important' | 'helpful'
}
interface GuidedSetupProps {
  userId: string
  onComplete?: () => void
  className?: string
}
export function GuidedSetup({ userId, onComplete, className = '' }: GuidedSetupProps) {
  const router = useRouter()
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [loading, setLoading] = useState(true)
  const [showDemo, setShowDemo] = useState(false)
  useEffect(() => {
    loadOnboardingProgress()
  }, [userId])
  const loadOnboardingProgress = async () => {
    try {
      // Check user's current setup progress
      const [farmsRes, fieldsRes, cropsRes] = await Promise.all([
        fetch('/api/farms'),
        fetch('/api/fields'),
        fetch('/api/crops')
      ])
      const [farms, fields, crops] = await Promise.all([
        farmsRes.ok ? farmsRes.json() : { farms: [] },
        fieldsRes.ok ? fieldsRes.json() : [],
        cropsRes.ok ? cropsRes.json() : []
      ])
      const hasFarms = farms.farms?.length > 0
      const hasFields = fields.length > 0 
      const hasCrops = crops.length > 0
      setSteps([
        {
          id: 'create-farm',
          title: 'Add Your First Farm',
          description: 'Set up your farm location and basic details to get started',
          icon: <MapPin className="h-6 w-6 text-[#555555]" />,
          href: '/farms/create-unified',
          completed: hasFarms,
          priority: 'essential'
        },
        {
          id: 'add-fields',
          title: 'Define Your Fields',
          description: 'Map out your field boundaries for precise monitoring',
          icon: <Sprout className="h-6 w-6 text-[#8FBF7F]" />,
          href: hasFarms ? '/farms' : undefined,
          completed: hasFields,
          priority: 'essential'
        },
        {
          id: 'plant-crops',
          title: 'Record Your Crops',
          description: 'Add current plantings to track growth and get insights',
          icon: <Sprout className="h-6 w-6 text-emerald-600" />,
          href: hasFields ? '/crop-planning' : undefined,
          completed: hasCrops,
          priority: 'essential'
        },
        {
          id: 'try-recommendations',
          title: 'Get Smart Recommendations',
          description: 'Generate personalized insights based on your farm data',
          icon: <Lightbulb className="h-6 w-6 text-yellow-600" />,
          action: () => generateRecommendations(),
          completed: false,
          priority: 'important'
        },
        {
          id: 'explore-analytics',
          title: 'Explore Analytics',
          description: 'See how your farm compares and track performance',
          icon: <BarChart3 className="h-6 w-6 text-[#7A8F78]" />,
          href: '/reports',
          completed: false,
          priority: 'helpful'
        },
        {
          id: 'add-livestock',
          title: 'Track Livestock (Optional)',
          description: 'Monitor animal health and productivity',
          icon: <Users className="h-6 w-6 text-purple-600" />,
          href: '/livestock',
          completed: false,
          priority: 'helpful'
        }
      ])
    } catch (error) {
      console.error('Error loading onboarding progress:', error)
    } finally {
      setLoading(false)
    }
  }
  const generateRecommendations = async () => {
    if (steps.find(s => s.id === 'create-farm')?.completed) {
      const farmId = await getCurrentFarmId()
      if (farmId) {
        router.push(`/dashboard?generateRecommendations=true&farmId=${farmId}`)
      }
    }
  }
  const getCurrentFarmId = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/farms')
      const data = await response.json()
      return data.farms?.[0]?.id || null
    } catch {
      return null
    }
  }
  const enableDemoMode = () => {
    setShowDemo(true)
    router.push('/dashboard?demo=true')
  }
  const completedSteps = steps.filter(s => s.completed).length
  const totalEssentialSteps = steps.filter(s => s.priority === 'essential').length
  const completedEssentialSteps = steps.filter(s => s.completed && s.priority === 'essential').length
  const progressPercentage = totalEssentialSteps > 0 ? (completedEssentialSteps / totalEssentialSteps) * 100 : 0
  const priorityColors = {
    essential: 'border-red-200 bg-red-50',
    important: 'border-orange-200 bg-orange-50', 
    helpful: 'border-blue-200 bg-blue-50'
  }
  const priorityLabels = {
    essential: 'Required',
    important: 'Recommended',
    helpful: 'Optional'
  }
  if (loading) {
    return (
      <ModernCard className={className}>
        <ModernCardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#F5F5F5] rounded w-1/2"></div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 bg-[#F5F5F5] rounded"></div>
              ))}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }
  return (
    <ModernCard className={className}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <ModernCardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#555555]" />
              Welcome to Cropple.AI
              {completedEssentialSteps === totalEssentialSteps && (
                <Badge className="bg-[#F8FAF8] text-[#7A8F78] border-[#DDE4D8]">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Setup Complete!
                </Badge>
              )}
            </ModernCardTitle>
            <p className="text-[#555555] mt-2">
              Let&apos;s get your farm set up in just a few steps. You&apos;ll be tracking crops and getting insights in no time!
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {completedSteps}/{steps.length}
            </div>
            <div className="text-sm text-[#555555]">steps completed</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-[#555555] mb-2">
            <span>Essential setup</span>
            <span>{completedEssentialSteps}/{totalEssentialSteps} done</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        {/* Demo mode option */}
        {completedSteps === 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Want to explore first?
                </h4>
                <p className="text-purple-700 text-sm mt-1">
                  Try our demo mode to see what Cropple.AI can do with sample farm data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={enableDemoMode}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Gift className="h-4 w-4 mr-1" />
                Try Demo
              </Button>
            </div>
          </div>
        )}
        {/* Setup steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                step.completed 
                  ? 'border-[#DDE4D8] bg-[#F8FAF8]' 
                  : priorityColors[step.priority]
              } ${step.href || step.action ? 'hover:shadow-sm cursor-pointer' : ''}`}
              onClick={() => {
                if (step.href) router.push(step.href)
                if (step.action) step.action()
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    step.completed ? 'bg-[#F8FAF8]' : 'bg-white'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-6 w-6 text-[#8FBF7F]" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${
                        step.completed ? 'text-[#7A8F78]' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </h4>
                      <Badge 
                        className={`text-xs ${
                          step.priority === 'essential' ? 'bg-red-100 text-red-700 border-red-200' :
                          step.priority === 'important' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {priorityLabels[step.priority]}
                      </Badge>
                    </div>
                    <p className={`text-sm ${
                      step.completed ? 'text-[#7A8F78]' : 'text-[#555555]'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                {!step.completed && (step.href || step.action) && (
                  <ArrowRight className="h-4 w-4 text-[#555555]" />
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Completion celebration */}
        {completedEssentialSteps === totalEssentialSteps && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-[#DDE4D8] rounded-lg p-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-[#8FBF7F] mx-auto mb-3" />
              <h4 className="font-semibold text-[#7A8F78] mb-2">
                Great job! Your farm is set up
              </h4>
              <p className="text-[#7A8F78] text-sm mb-4">
                You&apos;re now ready to get personalized insights and recommendations for your farm
              </p>
              <Button 
                onClick={onComplete}
                className="bg-[#7A8F78] hover:bg-[#7A8F78] text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start Farming Smarter
              </Button>
            </div>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}