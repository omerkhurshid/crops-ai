'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  AlertTriangle, Clock, CheckCircle2, DollarSign, Calendar, 
  Droplets, Bug, Sprout, TrendingUp, ArrowRight, Target,
  Timer, MapPin, Zap
} from 'lucide-react'

interface FarmerAction {
  id: string
  action: string // What the farmer needs to do
  urgency: 'now' | 'today' | 'this-week' | 'this-month'
  field?: string
  impact: string // What will happen if they do/don't do it
  cost?: number
  savings?: number
  timeRequired: string
  reason: string // Simple reason why
  dueDate?: string
  category: 'water' | 'pests' | 'growth' | 'money' | 'timing'
}

interface FarmerActionCenterProps {
  farmId: string
  className?: string
}

const urgencyConfig = {
  now: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: 'DO NOW' },
  today: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock, label: 'TODAY' },
  'this-week': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Calendar, label: 'THIS WEEK' },
  'this-month': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Target, label: 'THIS MONTH' }
}

const categoryConfig = {
  water: { icon: Droplets, color: 'text-blue-600' },
  pests: { icon: Bug, color: 'text-red-600' },
  growth: { icon: Sprout, color: 'text-green-600' },
  money: { icon: DollarSign, color: 'text-green-700' },
  timing: { icon: Timer, color: 'text-purple-600' }
}

export function FarmerActionCenter({ farmId, className }: FarmerActionCenterProps) {
  const [actions, setActions] = useState<FarmerAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActions()
  }, [farmId])

  const fetchActions = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with real API call
      const mockActions: FarmerAction[] = [
        {
          id: '1',
          action: 'Apply nitrogen fertilizer to North Field',
          urgency: 'today',
          field: 'North Field',
          impact: 'Could lose 15% yield if delayed past Thursday',
          cost: 320,
          savings: 2800,
          timeRequired: '3 hours',
          reason: 'Corn plants showing yellow leaves - nitrogen deficiency',
          dueDate: '2024-10-13',
          category: 'growth'
        },
        {
          id: '2', 
          action: 'Turn on irrigation system',
          urgency: 'now',
          field: 'South Field',
          impact: 'Prevent $4,200 stress damage',
          cost: 45,
          timeRequired: '15 minutes',
          reason: 'Soil moisture dropped to 25% - critical level',
          category: 'water'
        },
        {
          id: '3',
          action: 'Scout for aphids in soybean rows',
          urgency: 'this-week',
          field: 'East Field',
          impact: 'Early detection can save $1,800 in treatments',
          timeRequired: '1 hour',
          reason: 'Weather conditions favor aphid outbreak',
          category: 'pests'
        },
        {
          id: '4',
          action: 'Sell 500 bushels of corn',
          urgency: 'this-week',
          impact: 'Lock in $3.20/bushel before price drops',
          savings: 1600,
          timeRequired: '30 minutes',
          reason: 'Corn futures show declining trend',
          category: 'money'
        }
      ]
      
      setActions(mockActions)
    } catch (error) {
      console.error('Error fetching farmer actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const urgentActions = actions.filter(a => a.urgency === 'now' || a.urgency === 'today')
  const plannedActions = actions.filter(a => a.urgency === 'this-week' || a.urgency === 'this-month')

  if (loading) {
    return (
      <ModernCard className={className}>
        <ModernCardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-sage-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-16 bg-sage-100 rounded"></div>
              <div className="h-16 bg-sage-100 rounded"></div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }

  return (
    <ModernCard variant="soft" className={className}>
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Your Action Plan
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="space-y-6">
        
        {/* Urgent Actions */}
        {urgentActions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-800">Urgent Actions ({urgentActions.length})</span>
            </div>
            <div className="space-y-3">
              {urgentActions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        )}

        {/* Planned Actions */}
        {plannedActions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Coming Up ({plannedActions.length})</span>
            </div>
            <div className="space-y-3">
              {plannedActions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        )}

        {actions.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-sage-800 mb-2">All Caught Up!</h3>
            <p className="text-sage-600">No urgent actions needed right now. Check back tomorrow.</p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}

function ActionCard({ action }: { action: FarmerAction }) {
  const urgencyInfo = urgencyConfig[action.urgency]
  const categoryInfo = categoryConfig[action.category]
  const UrgencyIcon = urgencyInfo.icon
  const CategoryIcon = categoryInfo.icon

  return (
    <div className="bg-white border border-sage-200 rounded-lg p-4 hover:border-sage-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
          <Badge className={`text-xs font-bold ${urgencyInfo.color}`}>
            {urgencyInfo.label}
          </Badge>
          {action.field && (
            <span className="text-xs text-sage-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {action.field}
            </span>
          )}
        </div>
      </div>

      <h4 className="font-semibold text-sage-900 mb-2 text-base">
        {action.action}
      </h4>
      
      <p className="text-sm text-sage-600 mb-3">{action.reason}</p>
      
      <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
        <div className="flex items-center gap-1 text-sage-600">
          <Clock className="h-3 w-3" />
          {action.timeRequired}
        </div>
        {action.cost && (
          <div className="flex items-center gap-1 text-red-600">
            <DollarSign className="h-3 w-3" />
            ${action.cost}
          </div>
        )}
        {action.savings && (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-3 w-3" />
            Save ${action.savings}
          </div>
        )}
      </div>

      <div className="bg-sage-50 p-3 rounded-lg mb-3">
        <p className="text-sm font-medium text-sage-800">{action.impact}</p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Mark Done
        </Button>
        <Button size="sm" variant="outline" className="border-sage-300">
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}