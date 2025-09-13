'use client'

import { Badge } from '../ui/badge'
import { 
  Scissors, 
  AlertTriangle,
  Droplets,
  Clock,
  CheckCircle
} from 'lucide-react'

interface CropAction {
  id: string
  cropName: string
  action: string
  dueDate: string
  priority: 'urgent' | 'due_soon' | 'upcoming'
  location: string
  daysUntil: number
  icon: React.ReactNode
}

const mockNextActions: CropAction[] = [
  {
    id: '1',
    cropName: 'Sweet Corn',
    action: 'Start harvesting',
    dueDate: '2024-03-15',
    priority: 'urgent',
    location: 'South Field A',
    daysUntil: 0,
    icon: <Scissors className="h-4 w-4" />
  },
  {
    id: '2',
    cropName: 'Cucumbers',
    action: 'Pest inspection',
    dueDate: '2024-03-18',
    priority: 'due_soon',
    location: 'Greenhouse B',
    daysUntil: 3,
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    id: '3',
    cropName: 'Winter Wheat',
    action: 'Fertilizer application',
    dueDate: '2024-03-20',
    priority: 'due_soon',
    location: 'North Field',
    daysUntil: 5,
    icon: <Droplets className="h-4 w-4" />
  },
  {
    id: '4',
    cropName: 'Tomatoes',
    action: 'Transplant seedlings',
    dueDate: '2024-03-25',
    priority: 'upcoming',
    location: 'Greenhouse A',
    daysUntil: 10,
    icon: <Clock className="h-4 w-4" />
  }
]

const priorityConfig = {
  urgent: {
    color: 'bg-fk-danger/10 text-fk-danger border-fk-danger/30',
    label: 'Urgent',
    iconBg: 'bg-fk-danger/10'
  },
  due_soon: {
    color: 'bg-fk-warning/10 text-fk-warning border-fk-warning/30',
    label: 'Due Soon',
    iconBg: 'bg-fk-warning/10'
  },
  upcoming: {
    color: 'bg-fk-info/10 text-fk-info border-fk-info/30',
    label: 'Upcoming',
    iconBg: 'bg-fk-info/10'
  }
}

interface FarmerFriendlyActionsListProps {
  farmId: string
}

export function FarmerFriendlyActionsList({ farmId }: FarmerFriendlyActionsListProps) {
  const getDaysText = (days: number) => {
    if (days === 0) return 'Today!'
    if (days === 1) return 'Tomorrow'
    if (days < 7) return `${days} days`
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1 week' : `${weeks} weeks`
  }

  return (
    <div className="space-y-3">
      {mockNextActions.map((action) => (
        <div 
          key={action.id} 
          className="p-4 bg-surface rounded-card border border-fk-border hover:border-fk-primary/30 hover:shadow-fk-md transition-all duration-micro cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-control ${priorityConfig[action.priority].iconBg}`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-fk-text truncate">
                {action.action}
              </h4>
              <p className="text-xs text-fk-text-muted">
                {action.cropName} • {action.location}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge className={`text-xs font-medium ${priorityConfig[action.priority].color}`}>
              {getDaysText(action.daysUntil)}
            </Badge>
            {action.priority === 'urgent' && (
              <span className="text-xs text-fk-danger font-semibold">Action needed</span>
            )}
          </div>
        </div>
      ))}
      
      {/* View All Link */}
      <button className="w-full text-center py-3 text-sm text-fk-accent-sky hover:text-fk-primary font-semibold transition-colors duration-micro">
        View all tasks →
      </button>
    </div>
  )
}