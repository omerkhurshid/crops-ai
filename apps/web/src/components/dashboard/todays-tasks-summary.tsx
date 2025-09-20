'use client'

import React, { useState, useEffect } from 'react'
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
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([])
  const [tomorrowsTasks, setTomorrowsTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch(`/api/tasks?farmId=${farmId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            
            const tasks = ensureArray(data.data.tasks || data.data)
            
            // Filter tasks for today
            const todayFiltered = tasks.filter((task: any) => {
              if (task.status === 'completed') return false
              
              const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === today.toDateString()
              const isInProgress = task.status === 'in_progress'
              const isOverdue = task.dueDate && new Date(task.dueDate) < today
              
              return isDueToday || isInProgress || isOverdue
            }).slice(0, 5)
            
            // Filter tasks for tomorrow
            const tomorrowFiltered = tasks.filter((task: any) => {
              if (task.status === 'completed') return false
              
              const isDueTomorrow = task.dueDate && new Date(task.dueDate).toDateString() === tomorrow.toDateString()
              const isHighPriority = task.priority === 'urgent' || task.priority === 'high'
              
              return isDueTomorrow || (isHighPriority && !task.dueDate)
            }).slice(0, 5)
            
            setTodaysTasks(todayFiltered)
            setTomorrowsTasks(tomorrowFiltered)
          }
        } else {
          // Use fallback mock data
          const today = new Date()
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          
          setTodaysTasks(mockTasks.filter(task => {
            if (task.status === 'done') return false
            const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === today.toDateString()
            const isInProgress = task.status === 'in_progress'
            const isOverdue = task.dueDate && new Date(task.dueDate) < today
            return isDueToday || isInProgress || isOverdue
          }).slice(0, 5))
          
          setTomorrowsTasks(mockTasks.filter(task => {
            if (task.status === 'done') return false
            const isDueTomorrow = task.dueDate && new Date(task.dueDate).toDateString() === tomorrow.toDateString()
            const isHighPriority = task.priority === 'urgent' || task.priority === 'high'
            return isDueTomorrow || (isHighPriority && !task.dueDate)
          }).slice(0, 5))
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
        // Use fallback mock data on error
        const today = new Date()
        setTodaysTasks(mockTasks.filter(task => {
          if (task.status === 'done') return false
          const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === today.toDateString()
          const isInProgress = task.status === 'in_progress'
          const isOverdue = task.dueDate && new Date(task.dueDate) < today
          return isDueToday || isInProgress || isOverdue
        }).slice(0, 5))
        setTomorrowsTasks([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTasks()
  }, [farmId])

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

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white/50 rounded-lg border border-sage-200 p-3 hover:shadow-sm transition-all duration-200 cursor-pointer">
      <div className="flex items-start gap-2">
        <div className={`p-1.5 rounded ${
          task.priority === 'urgent' ? 'bg-red-100' :
          task.priority === 'high' ? 'bg-orange-100' :
          'bg-blue-100'
        }`}>
          {categoryIcons[task.category as keyof typeof categoryIcons] || categoryIcons.general}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sage-900 text-sm mb-1 truncate">
            {task.title}
          </h4>
          
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`text-xs px-1.5 py-0.5 ${priorityConfig[task.priority as keyof typeof priorityConfig]?.color || ''}`}>
              {priorityConfig[task.priority as keyof typeof priorityConfig]?.label || task.priority}
            </Badge>
            {task.assignedToName && (
              <span className="text-xs text-sage-500">{task.assignedToName}</span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-sage-500">
            {task.dueDate && (
              <span className={
                getDaysUntilDue(task.dueDate).includes('Overdue') ? 'text-red-600 font-medium' : ''
              }>
                {getDaysUntilDue(task.dueDate)}
              </span>
            )}
            {task.estimatedHours && (
              <span>~{formatEstimatedTime(task.estimatedHours)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Today's Tasks */}
      <div>
        <h3 className="text-lg font-semibold text-sage-800 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-sage-600" />
          Today
          <span className="text-sm font-normal text-sage-600">({todaysTasks.length} tasks)</span>
        </h3>
        <div className="space-y-3">
          {todaysTasks.length > 0 ? (
            ensureArray(todaysTasks).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="text-center py-8 bg-sage-50 rounded-lg border border-sage-200">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sage-600 text-sm">No tasks due today!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Tomorrow's Tasks */}
      <div>
        <h3 className="text-lg font-semibold text-sage-800 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-sage-600" />
          Tomorrow
          <span className="text-sm font-normal text-sage-600">({tomorrowsTasks.length} tasks)</span>
        </h3>
        <div className="space-y-3">
          {tomorrowsTasks.length > 0 ? (
            ensureArray(tomorrowsTasks).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="text-center py-8 bg-sage-50 rounded-lg border border-sage-200">
              <div className="text-2xl mb-2">🌟</div>
              <p className="text-sage-600 text-sm">Clear schedule tomorrow!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* View All Tasks Button */}
      <div className="md:col-span-2 text-center mt-4">
        <Link href="/tasks">
          <Button variant="outline" className="w-full md:w-auto">
            View Complete Task Board
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}