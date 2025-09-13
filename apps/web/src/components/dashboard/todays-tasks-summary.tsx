'use client'

import React from 'react'
import Link from 'next/link'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  AlertTriangle, 
  Clock, 
  Tractor, 
  Sprout, 
  Users, 
  Calendar,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { ensureArray } from '../../lib/utils'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'crop' | 'livestock' | 'equipment' | 'general'
  assignedTo?: string
  assignedToName?: string
  dueDate?: string
  estimatedHours?: number
}

interface TodaysTasksSummaryProps {
  farmId: string
}

// Mock data matching the task board structure
const mockTasks: Task[] = [
  {
    id: '4',
    title: 'Apply Fertilizer - South Field',
    description: 'Apply nitrogen fertilizer to south field corn. Rate: 150 lbs/acre.',
    status: 'todo',
    priority: 'urgent',
    category: 'crop',
    assignedTo: 'john',
    assignedToName: 'John Smith',
    dueDate: '2024-04-13',
    estimatedHours: 8
  },
  {
    id: '1',
    title: 'Plant Corn in North Field',
    description: 'Plant 500 acres of corn in the north field. Weather window looks optimal for next 3 days.',
    status: 'todo',
    priority: 'high',
    category: 'crop',
    assignedTo: 'john',
    assignedToName: 'John Smith',
    dueDate: '2024-04-15',
    estimatedHours: 16
  },
  {
    id: '2',
    title: 'Check Cattle Health',
    description: 'Weekly health check for Herd A. Look for signs of respiratory issues.',
    status: 'in_progress',
    priority: 'medium',
    category: 'livestock',
    assignedTo: 'sarah',
    assignedToName: 'Sarah Johnson',
    dueDate: '2024-04-12',
    estimatedHours: 4
  }
]

const categoryIcons = {
  crop: <Sprout className="h-4 w-4" />,
  livestock: <Users className="h-4 w-4" />,
  equipment: <Tractor className="h-4 w-4" />,
  general: <Calendar className="h-4 w-4" />
}

const priorityConfig = {
  urgent: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Urgent'
  },
  high: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'High'
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Medium'
  },
  low: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Low'
  }
}

const statusConfig = {
  todo: {
    color: 'bg-gray-100 text-gray-800',
    label: 'To Do'
  },
  in_progress: {
    color: 'bg-blue-100 text-blue-800',
    label: 'In Progress'
  },
  done: {
    color: 'bg-green-100 text-green-800',
    label: 'Done'
  }
}

export function TodaysTasksSummary({ farmId }: TodaysTasksSummaryProps) {
  // Filter tasks for today - high priority, urgent, or due today
  const todaysTasks = mockTasks.filter(task => {
    const isHighPriority = task.priority === 'urgent' || task.priority === 'high'
    const isInProgress = task.status === 'in_progress'
    const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString()
    
    return (isHighPriority || isInProgress || isDueToday) && task.status !== 'done'
  }).slice(0, 3) // Show top 3 tasks

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`
    return `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`
  }

  const formatEstimatedTime = (hours?: number) => {
    if (!hours) return 'Unknown'
    if (hours < 1) return `${Math.round(hours * 60)} min`
    if (hours === 1) return '1 hour'
    return `${hours} hours`
  }

  return (
    <div className="space-y-4">
      {ensureArray(todaysTasks).map((task) => (
        <ModernCard 
          key={task.id} 
          variant="soft" 
          className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-orange-400"
        >
          <ModernCardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    task.priority === 'urgent' ? 'bg-red-50' :
                    task.priority === 'high' ? 'bg-orange-50' :
                    'bg-blue-50'
                  }`}>
                    {categoryIcons[task.category as keyof typeof categoryIcons] || categoryIcons.general}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sage-900 text-sm mb-1 truncate">
                      {task.title}
                    </h4>
                    <p className="text-xs text-sage-600 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                    
                    {/* Task Meta */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-xs ${priorityConfig[task.priority as keyof typeof priorityConfig]?.color || ''}`}>
                        {priorityConfig[task.priority as keyof typeof priorityConfig]?.label || task.priority}
                      </Badge>
                      <Badge className={`text-xs ${statusConfig[task.status as keyof typeof statusConfig]?.color || ''}`}>
                        {statusConfig[task.status as keyof typeof statusConfig]?.label || task.status}
                      </Badge>
                      {task.assignedToName && (
                        <div className="text-xs text-sage-500">
                          → {task.assignedToName}
                        </div>
                      )}
                    </div>
                    
                    {/* Due date and time estimate */}
                    <div className="flex items-center gap-4 text-xs text-sage-500">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className={
                            getDaysUntilDue(task.dueDate).includes('Overdue') || getDaysUntilDue(task.dueDate) === 'Due today'
                              ? 'text-red-600 font-medium'
                              : ''
                          }>
                            {getDaysUntilDue(task.dueDate)}
                          </span>
                        </div>
                      )}
                      {task.estimatedHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>~{formatEstimatedTime(task.estimatedHours)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="flex-shrink-0 ml-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </ModernCardContent>
        </ModernCard>
      ))}
      
      {todaysTasks.length === 0 && (
        <ModernCard variant="soft" className="text-center">
          <ModernCardContent className="p-8">
            <div className="text-4xl mb-4">🎉</div>
            <h4 className="font-semibold text-sage-800 mb-2">All caught up!</h4>
            <p className="text-sage-600 text-sm mb-4">
              No urgent tasks for today. Great work staying on top of your farm operations!
            </p>
            <Link href="/tasks">
              <Button variant="outline" size="sm">
                View All Tasks
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </ModernCardContent>
        </ModernCard>
      )}
      
      {todaysTasks.length > 0 && (
        <div className="text-center">
          <Link href="/tasks">
            <Button variant="outline" className="w-full">
              View Complete Task Board
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}