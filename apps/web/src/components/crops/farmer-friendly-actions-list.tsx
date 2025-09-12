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
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Urgent'
  },
  due_soon: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Due Soon'
  },
  upcoming: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Upcoming'
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
          className="p-3 bg-white rounded-lg border-2 border-gray-100 hover:border-orange-200 transition-all cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              action.priority === 'urgent' ? 'bg-red-50' : 
              action.priority === 'due_soon' ? 'bg-yellow-50' : 
              'bg-blue-50'
            }`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 truncate">
                {action.action}
              </h4>
              <p className="text-xs text-gray-600">
                {action.cropName} • {action.location}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Badge className={`text-xs ${priorityConfig[action.priority].color}`}>
              {getDaysText(action.daysUntil)}
            </Badge>
            {action.priority === 'urgent' && (
              <span className="text-xs text-red-600 font-medium">Action needed</span>
            )}
          </div>
        </div>
      ))}
      
      {/* View All Link */}
      <button className="w-full text-center py-2 text-sm text-sage-600 hover:text-sage-700 font-medium">
        View all tasks →
      </button>
    </div>
  )
}