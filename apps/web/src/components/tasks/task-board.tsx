'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
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
  low: 'bg-fk-neutral/10 text-fk-neutral border-fk-neutral/30',
  medium: 'bg-fk-info/10 text-fk-info border-fk-info/30', 
  high: 'bg-fk-warning/10 text-fk-warning border-fk-warning/30',
  urgent: 'bg-fk-danger/10 text-fk-danger border-fk-danger/30'
}
const statusConfig = {
  todo: {
    title: 'To Do',
    icon: <Clock className="h-5 w-5" />,
    color: 'text-fk-text-muted',
    bgColor: 'bg-fk-neutral/10'
  },
  in_progress: {
    title: 'In Progress', 
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'text-fk-accent-sky',
    bgColor: 'bg-fk-accent-sky/10'
  },
  done: {
    title: 'Done',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-fk-success', 
    bgColor: 'bg-fk-success/10'
  }
}
export function TaskBoard({ farmId, showAssignments = true }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    category: '',
    dueDate: '',
    tags: [] as string[],
    assignedTo: ''
  })
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
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          farmId: farmId
        })
      })
      if (response.ok) {
        const createdTask = await response.json()
        setTasks(prevTasks => [...prevTasks, createdTask])
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          category: '',
          dueDate: '',
          tags: [],
          assignedTo: ''
        })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }
  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasksByStatus.done.length // This references the 'done' key in tasksByStatus which maps to 'completed' status
    const inProgress = tasksByStatus.in_progress.length
    const urgent = tasks.filter(task => task.priority === 'urgent' && task.status !== 'completed').length
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78] mx-auto"></div>
          <p className="text-[#555555] mt-4">Loading tasks...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Task Stats Header - FieldKit KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-text-muted">Total Tasks</p>
                <p className="text-2xl font-bold text-fk-text">{stats.total}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-fk-text-muted" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-accent-sky">In Progress</p>
                <p className="text-2xl font-bold text-fk-accent-sky">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-fk-accent-sky" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-success">Completed</p>
                <p className="text-2xl font-bold text-fk-success">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-fk-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface rounded-card shadow-fk-sm border border-fk-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fk-danger">Urgent</p>
                <p className="text-2xl font-bold text-fk-danger">{stats.urgent}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-fk-danger" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Add Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-fk-text">Task Board</h2>
        <Button 
          className="bg-fk-primary hover:bg-fk-primary-600 text-white rounded-control"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="space-y-4">
              {/* Column Header - FieldKit Style */}
              <div className={`p-4 rounded-card ${config.bgColor} border border-fk-border`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={config.color}>
                      {config.icon}
                    </div>
                    <h3 className="font-bold text-fk-text">{config.title}</h3>
                    <Badge className="text-xs bg-fk-primary/10 text-fk-primary border-fk-primary/30">
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
                      snapshot.isDraggingOver ? 'bg-[#FAFAF7]' : ''
                    }`}
                  >
                    {tasksByStatus[status as keyof typeof tasksByStatus].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-all duration-micro bg-surface rounded-card shadow-fk-sm border border-fk-border ${
                              snapshot.isDragging ? 'shadow-fk-lg rotate-3' : 'hover:shadow-fk-md'
                            }`}
                          >
                            <CardContent className="p-4 space-y-3">
                              {/* Task Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="text-fk-primary">
                                    {categoryIcons[task.category || 'general']}
                                  </div>
                                  <h4 className="font-semibold text-fk-text text-sm">{task.title}</h4>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-fk-primary/10">
                                  <MoreHorizontal className="h-4 w-4 text-fk-text-muted" />
                                </Button>
                              </div>
                              {/* Task Description */}
                              {task.description && (
                                <p className="text-sm text-fk-text-muted line-clamp-2">{task.description}</p>
                              )}
                              {/* Task Meta */}
                              <div className="flex items-center justify-between">
                                <Badge className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </Badge>
                              </div>
                              {/* Due Date */}
                              {task.dueDate && (
                                <div className="flex items-center gap-2 text-xs text-fk-text-muted">
                                  <Calendar className="h-3 w-3" />
                                  <span className={
                                    new Date(task.dueDate) < new Date() ? 'text-fk-danger font-semibold' : ''
                                  }>
                                    {formatDueDate(task.dueDate)}
                                  </span>
                                </div>
                              )}
                              {/* Tags */}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {task.tags.map((tag, index) => (
                                    <Badge 
                                      key={index} 
                                      className="text-xs bg-fk-primary/10 text-fk-primary border-fk-primary/30"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {/* Assignment */}
                              {(task as any).assignedTo && (
                                <div className="flex items-center gap-2 text-xs text-fk-text-muted">
                                  <User className="h-3 w-3" />
                                  <span>Assigned to {(task as any).assignedTo}</span>
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
      {/* Simple Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-surface rounded-card shadow-fk-lg border border-fk-border">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-fk-text">Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-semibold text-fk-text">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title..."
                  className="mt-1 rounded-control border-fk-border"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-semibold text-fk-text">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task description (optional)..."
                  className="mt-1 rounded-control border-fk-border"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-sm font-semibold text-fk-text">Priority</Label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                    className="mt-1 w-full p-2 rounded-control border border-fk-border bg-canvas text-fk-text"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-fk-text">Category</Label>
                  <select
                    id="category"
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="mt-1 w-full p-2 rounded-control border border-fk-border bg-canvas text-fk-text"
                  >
                    <option value="">Select category</option>
                    <option value="crop">Crop</option>
                    <option value="livestock">Livestock</option>
                    <option value="equipment">Equipment</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-sm font-semibold text-fk-text">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="mt-1 rounded-control border-fk-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedTo" className="text-sm font-semibold text-fk-text">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    placeholder="Enter owner name..."
                    className="mt-1 rounded-control border-fk-border"
                  />
                </div>
                <div>
                  <Label htmlFor="tags" className="text-sm font-semibold text-fk-text">Tags</Label>
                  <Input
                    id="tags"
                    value={newTask.tags.join(', ')}
                    onChange={(e) => setNewTask({...newTask, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                    placeholder="urgent, field1, irrigation..."
                    className="mt-1 rounded-control border-fk-border"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 bg-fk-primary hover:bg-fk-primary-600 text-white rounded-control"
                >
                  Add Task
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="flex-1 border-fk-border text-fk-text hover:bg-fk-primary/10 rounded-control"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}