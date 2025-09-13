'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { 
  Plus, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Tractor,
  Sprout,
  Users,
  MoreHorizontal
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  dueDate?: string
  farmId: string
  fieldId?: string
  cropId?: string
  userId: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  tags: string[]
  farm?: { name: string }
  field?: { name: string }
  crop?: { cropType: string; variety: string }
}

interface TaskBoardProps {
  farmId: string
  showAssignments?: boolean
}

const categoryIcons: Record<string, React.ReactNode> = {
  crop: <Sprout className="h-4 w-4" />,
  livestock: <Users className="h-4 w-4" />,
  equipment: <Tractor className="h-4 w-4" />,
  general: <AlertCircle className="h-4 w-4" />
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300', 
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300'
}

const statusConfig = {
  todo: {
    title: 'To Do',
    icon: <Clock className="h-5 w-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  in_progress: {
    title: 'In Progress', 
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  done: {
    title: 'Done',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-600', 
    bgColor: 'bg-green-50'
  }
}

export function TaskBoard({ farmId, showAssignments = true }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch tasks from API
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch(`/api/tasks?farmId=${farmId}`)
        if (response.ok) {
          const data = await response.json()
          setTasks(data)
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [farmId])

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'pending'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'completed')
  }

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    const statusMap: Record<string, Task['status']> = {
      'todo': 'pending',
      'in_progress': 'in_progress', 
      'done': 'completed'
    }

    const newStatus = statusMap[destination.droppableId]
    
    try {
      const response = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === draggableId ? updatedTask : task
          )
        )
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasksByStatus.done.length
    const inProgress = tasksByStatus.in_progress.length
    const urgent = tasks.filter(task => task.priority === 'urgent' && task.status !== 'done').length
    
    return { total, completed, inProgress, urgent }
  }

  const stats = getTaskStats()

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Task Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Urgent</p>
                <p className="text-2xl font-bold text-red-900">{stats.urgent}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Task Board</h2>
        <Button className="bg-sage-600 hover:bg-sage-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="space-y-4">
              {/* Column Header */}
              <div className={`p-4 rounded-lg ${config.bgColor} border-2 border-dashed border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={config.color}>
                      {config.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{config.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {tasksByStatus[status as keyof typeof tasksByStatus].length}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Task Cards */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-50' : ''
                    }`}
                  >
                    {tasksByStatus[status as keyof typeof tasksByStatus].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg rotate-3' : 'hover:shadow-md'
                            }`}
                          >
                            <CardContent className="p-4 space-y-3">
                              {/* Task Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {categoryIcons[task.category || 'general']}
                                  <h4 className="font-semibold text-gray-900 text-sm">{task.title}</h4>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Task Description */}
                              {task.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                              )}

                              {/* Task Meta */}
                              <div className="flex items-center justify-between">
                                <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </Badge>
                                
                                {task.estimatedHours && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.estimatedHours}h
                                  </span>
                                )}
                              </div>

                              {/* Due Date */}
                              {task.dueDate && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Calendar className="h-3 w-3" />
                                  <span className={
                                    new Date(task.dueDate) < new Date() ? 'text-red-600 font-medium' : ''
                                  }>
                                    {formatDueDate(task.dueDate)}
                                  </span>
                                </div>
                              )}

                              {/* Assignment */}
                              {showAssignments && task.assignedToName && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {task.assignedToName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-600">{task.assignedToName}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}