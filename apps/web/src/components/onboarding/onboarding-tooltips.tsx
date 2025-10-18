'use client'

import { useState, useEffect, useRef } from 'react'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { InlineFloatingButton } from '../ui/floating-button'
import { 
  X, ArrowRight, ArrowLeft, Target, Lightbulb, 
  CheckCircle2, Zap, Eye, Info
} from 'lucide-react'

interface TooltipStep {
  id: string
  target: string // CSS selector for the target element
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  showDelay?: number
  optional?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingTooltipsProps {
  steps: TooltipStep[]
  onComplete?: () => void
  onSkip?: () => void
  startDelay?: number
  showProgress?: boolean
  theme?: 'sage' | 'earth' | 'cream'
}

export function OnboardingTooltips({
  steps,
  onComplete,
  onSkip,
  startDelay = 1000,
  showProgress = true,
  theme = 'sage'
}: OnboardingTooltipsProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isActive, setIsActive] = useState(false)

  const currentStepData = steps[currentStep]

  // Initialize tooltips after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(true)
      if (steps.length > 0) {
        showStep(0)
      }
    }, startDelay)

    return () => clearTimeout(timer)
  }, [startDelay, steps])

  // Position calculation
  const calculatePosition = (target: HTMLElement, tooltipEl: HTMLElement) => {
    const targetRect = target.getBoundingClientRect()
    const tooltipRect = tooltipEl.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    let top = 0
    let left = 0
    
    switch (currentStepData?.position || 'auto') {
      case 'top':
        top = targetRect.top - tooltipRect.height - 12
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = targetRect.bottom + 12
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
        left = targetRect.left - tooltipRect.width - 12
        break
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
        left = targetRect.right + 12
        break
      case 'auto':
      default:
        // Auto positioning logic
        if (targetRect.bottom + tooltipRect.height + 12 < viewportHeight) {
          // Show below
          top = targetRect.bottom + 12
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        } else if (targetRect.top - tooltipRect.height - 12 > 0) {
          // Show above
          top = targetRect.top - tooltipRect.height - 12
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
        } else if (targetRect.right + tooltipRect.width + 12 < viewportWidth) {
          // Show to the right
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
          left = targetRect.right + 12
        } else {
          // Show to the left
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
          left = targetRect.left - tooltipRect.width - 12
        }
        break
    }

    // Constrain to viewport
    left = Math.max(12, Math.min(left, viewportWidth - tooltipRect.width - 12))
    top = Math.max(12, Math.min(top, viewportHeight - tooltipRect.height - 12))

    return { top, left }
  }

  const showStep = (stepIndex: number) => {
    if (stepIndex >= steps.length) {
      handleComplete()
      return
    }

    const step = steps[stepIndex]
    const targetEl = document.querySelector(step.target) as HTMLElement
    
    if (!targetEl) {

      // Skip to next step
      setCurrentStep(stepIndex + 1)
      return
    }

    setTargetElement(targetEl)
    setCurrentStep(stepIndex)

    // Highlight target element
    targetEl.style.position = 'relative'
    targetEl.style.zIndex = '9998'
    targetEl.style.outline = '2px solid rgb(132, 204, 22)'
    targetEl.style.outlineOffset = '2px'
    targetEl.style.borderRadius = '8px'

    // Show tooltip after brief delay
    setTimeout(() => {
      setIsVisible(true)
    }, step.showDelay || 300)
  }

  const hideCurrentHighlight = () => {
    if (targetElement) {
      targetElement.style.position = ''
      targetElement.style.zIndex = ''
      targetElement.style.outline = ''
      targetElement.style.outlineOffset = ''
      targetElement.style.borderRadius = ''
    }
  }

  const handleNext = () => {
    if (!completedSteps.includes(currentStepData.id)) {
      setCompletedSteps(prev => [...prev, currentStepData.id])
    }
    
    hideCurrentHighlight()
    setIsVisible(false)
    
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        showStep(currentStep + 1)
      } else {
        handleComplete()
      }
    }, 200)
  }

  const handlePrevious = () => {
    hideCurrentHighlight()
    setIsVisible(false)
    
    setTimeout(() => {
      if (currentStep > 0) {
        showStep(currentStep - 1)
      }
    }, 200)
  }

  const handleSkip = () => {
    hideCurrentHighlight()
    setIsVisible(false)
    setIsActive(false)
    if (onSkip) onSkip()
  }

  const handleComplete = () => {
    hideCurrentHighlight()
    setIsVisible(false)
    setIsActive(false)
    if (onComplete) onComplete()
  }

  // Update tooltip position when visible
  useEffect(() => {
    if (isVisible && targetElement && tooltipRef.current) {
      const updatePosition = () => {
        const newPosition = calculatePosition(targetElement, tooltipRef.current!)
        setPosition(newPosition)
      }
      
      updatePosition()
      
      // Update position on scroll and resize
      const handleResize = () => updatePosition()
      const handleScroll = () => updatePosition()
      
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleScroll, true)
      
      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [isVisible, targetElement, currentStep])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hideCurrentHighlight()
    }
  }, [])

  if (!isActive || !currentStepData || !isVisible) {
    return null
  }

  const themeColors = {
    sage: {
      bg: 'from-sage-50 to-white',
      border: 'border-sage-200',
      text: 'text-sage-800',
      accent: 'text-sage-600'
    },
    earth: {
      bg: 'from-earth-50 to-white',
      border: 'border-earth-200', 
      text: 'text-earth-800',
      accent: 'text-earth-600'
    },
    cream: {
      bg: 'from-cream-50 to-white',
      border: 'border-cream-200',
      text: 'text-sage-800', 
      accent: 'text-sage-600'
    }
  }

  const colors = themeColors[theme]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9997]" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 9999
        }}
        className="max-w-sm animate-in fade-in zoom-in-95 duration-300"
      >
        <ModernCard variant="floating" className={`${colors.border} shadow-2xl`}>
          <ModernCardContent className={`p-6 bg-gradient-to-br ${colors.bg}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-sage-100 to-earth-100 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-sage-700" />
                </div>
                <div>
                  <h3 className={`font-semibold ${colors.text}`}>
                    {currentStepData.title}
                  </h3>
                  {showProgress && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Step {currentStep + 1} of {steps.length}
                      </Badge>
                      {currentStepData.optional && (
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleSkip}
                className={`p-1 hover:bg-sage-100 rounded-full transition-colors ${colors.accent}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className={`${colors.accent} text-sm mb-6 leading-relaxed`}>
              {currentStepData.content}
            </p>

            {currentStepData.action && (
              <div className="mb-4">
                <InlineFloatingButton
                  label={currentStepData.action.label}
                  variant="secondary"
                  size="sm"
                  onClick={currentStepData.action.onClick}
                  icon={<Zap className="h-3 w-3" />}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <InlineFloatingButton
                    icon={<ArrowLeft className="h-3 w-3" />}
                    label="Previous"
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                  />
                )}
                <InlineFloatingButton
                  icon={<X className="h-3 w-3" />}
                  label="Skip Tour"
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                />
              </div>

              <InlineFloatingButton
                icon={currentStep === steps.length - 1 ? <CheckCircle2 className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                label={currentStep === steps.length - 1 ? "Finish" : "Next"}
                variant="primary"
                size="sm"
                showLabel={true}
                onClick={handleNext}
              />
            </div>

            {/* Progress indicator */}
            {showProgress && (
              <div className="mt-4 pt-4 border-t border-sage-200">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-sage-500' : 'bg-sage-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </ModernCardContent>
        </ModernCard>
      </div>
    </>
  )
}

// Pre-defined tooltip configurations for common scenarios
export const dashboardTooltips: TooltipStep[] = [
  {
    id: 'dashboard-overview',
    target: '[data-tour="dashboard-stats"]',
    title: 'Your Farm Overview',
    content: 'This section shows key metrics about your farms, fields, and recent activity. These numbers update automatically as you add more data.',
    position: 'bottom'
  },
  {
    id: 'add-farm',
    target: '[data-tour="add-farm-button"]',
    title: 'Add Your First Farm',
    content: 'Click here to add your first farm. You&apos;ll need basic information like farm name, location, and crop types.',
    position: 'auto',
    action: {
      label: 'Start Adding Farm',
      onClick: () => window.location.href = '/farms/create'
    }
  },
  {
    id: 'health-monitoring',
    target: '[data-tour="health-section"]',
    title: 'Crop Health Monitoring',
    content: 'Monitor your crop health using satellite imagery and AI analysis. Get alerts when issues are detected.',
    position: 'auto'
  },
  {
    id: 'weather-insights',
    target: '[data-tour="weather-section"]',
    title: 'Weather Intelligence',
    content: 'Access hyperlocal weather forecasts and agricultural insights to plan your farming activities.',
    position: 'auto'
  }
]

export const farmTooltips: TooltipStep[] = [
  {
    id: 'farm-creation-form',
    target: '[data-tour="farm-form"]',
    title: 'Farm Information',
    content: 'Fill in your farm details. Accurate location information is crucial for satellite monitoring and weather forecasts.',
    position: 'right'
  },
  {
    id: 'location-map',
    target: '[data-tour="location-map"]',
    title: 'Set Precise Location',
    content: 'Pin your farm location on the map. This ensures accurate satellite coverage and local weather data.',
    position: 'left'
  },
  {
    id: 'crop-selection',
    target: '[data-tour="crop-types"]',
    title: 'Select Crop Types',
    content: 'Choose your primary crops to receive relevant health insights and AI recommendations.',
    position: 'auto'
  }
]