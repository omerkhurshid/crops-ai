'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ModernCard, ModernCardContent } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { NoTasksState, DataPendingState } from '../ui/no-data-states'
import { 
  AlertTriangle, 
  Clock, 
  Tractor, 
  Sprout, 
  Users, 
  Calendar,
  ChevronRight,
  ArrowRight,
  Plus
} from 'lucide-react'
import { ensureArray } from '../../lib/utils'
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
    color: 'bg-blue-100 text-[#7A8F78] border-blue-200',
    label: 'Low'
  }
}
const categoryIcons = {
  crop: <Sprout className="h-4 w-4 text-[#8FBF7F]" />,
  livestock: <Users className="h-4 w-4 text-[#7A8F78]" />,
  equipment: <Tractor className="h-4 w-4 text-orange-600" />,
  general: <AlertTriangle className="h-4 w-4 text-[#555555]" />
}
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
const TaskCard = ({ task }: { task: Task }) => {
  return (
    <div className="bg-white/50 rounded-lg border border-[#DDE4D8] p-3 hover:shadow-sm transition-all duration-200 cursor-pointer">
      <div className="flex items-start gap-2">
        <div className={`p-1.5 rounded ${
          task.priority === 'urgent' ? 'bg-red-100' :
          task.priority === 'high' ? 'bg-orange-100' :
          'bg-blue-100'
        }`}>
          {categoryIcons[task.category as keyof typeof categoryIcons] || categoryIcons.general}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-#1A1A1A text-sm mb-1 truncate">
            {task.title}
          </h4>
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`text-xs px-1.5 py-0.5 ${priorityConfig[task.priority as keyof typeof priorityConfig]?.color || ''}`}>
              {priorityConfig[task.priority as keyof typeof priorityConfig]?.label || task.priority}
            </Badge>
            {task.assignedToName && (
              <span className="text-xs text-#555555">{task.assignedToName}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-#555555">
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
  );
}
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
// Removed default tasks - only show real data
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
          // No data available
          setTodaysTasks([])
          setTomorrowsTasks([])
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
        // No data available
        setTodaysTasks([])
        setTomorrowsTasks([])
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [farmId])
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModernCard>
          <ModernCardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Today's Tasks</h3>
            <DataPendingState message="Loading today's tasks..." />
          </ModernCardContent>
        </ModernCard>
        <ModernCard>
          <ModernCardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Tomorrow's Tasks</h3>
            <DataPendingState message="Loading tomorrow's tasks..." />
          </ModernCardContent>
        </ModernCard>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Today's Tasks */}
      <ModernCard>
        <ModernCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Today's Tasks</h3>
            <Link href="/tasks">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </Link>
          </div>
          {todaysTasks.length === 0 ? (
            <NoTasksState onAddTask={() => window.location.href = '/tasks'} />
          ) : (
            <div className="space-y-3">
              {todaysTasks.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {todaysTasks.length >= 5 && (
                <div className="text-center pt-2">
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm">
                      View All Tasks <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
      {/* Tomorrow's Tasks */}
      <ModernCard>
        <ModernCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Tomorrow's Tasks</h3>
            <Link href="/tasks">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {tomorrowsTasks.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 mx-auto text-[#555555] mb-2" />
              <p className="text-sm text-[#555555]">No tasks scheduled for tomorrow</p>
              <p className="text-xs text-[#555555]">You're all set for tomorrow!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tomorrowsTasks.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}