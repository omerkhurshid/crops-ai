import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { TaskBoard } from '../../components/tasks/task-board'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
import { InfoTooltip } from '../../components/ui/info-tooltip'
import { 
  Plus,
  Calendar,
  Users,
  CheckSquare,
  TrendingUp,
  Clock
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      {/* Floating Action Button */}
      <ClientFloatingButton
        icon={<Plus className="h-5 w-5" />}
        label="New Task"
        variant="primary"
      />
      
      {/* Animated Background with Floating Elements */}
      <div className="absolute top-20 left-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float">
        <CheckSquare className="h-8 w-8 text-sage-600" />
      </div>
      <div className="absolute bottom-20 right-20 p-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-floating animate-float" style={{ animationDelay: '2s' }}>
        <Calendar className="h-8 w-8 text-sage-600" />
      </div>
      
      <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-16">
          {/* Modern Header */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-sage-100 to-earth-100 rounded-2xl">
                <CheckSquare className="h-10 w-10 text-sage-700" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-light text-sage-800 tracking-tight">
                  Farm Tasks
                </h1>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <p className="text-xl text-sage-600 font-light">
                    Organize and track your daily farm operations
                  </p>
                  <InfoTooltip 
                    title="Task Management" 
                    description="Kanban-style task board for managing farm workflows, assignments, and progress tracking."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl">
                  <Calendar className="h-6 w-6 text-blue-700" />
                </div>
                <InfoTooltip title="Today's Focus" description="Critical tasks that need attention today" />
              </div>
              <ModernCardTitle>Today's Priority</ModernCardTitle>
              <ModernCardDescription>
                Focus on the most urgent tasks to keep your farm running smoothly
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
                <div className="text-sm text-blue-600">tasks due today</div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-green-700" />
                </div>
                <InfoTooltip title="Team Productivity" description="Weekly completion rate and efficiency metrics" />
              </div>
              <ModernCardTitle>Team Performance</ModernCardTitle>
              <ModernCardDescription>
                Track completion rates and team productivity
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-green-600 mb-2">87%</div>
                <div className="text-sm text-green-600">completion rate</div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft" className="group hover:shadow-soft transition-all duration-300">
            <ModernCardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl">
                  <Clock className="h-6 w-6 text-orange-700" />
                </div>
                <InfoTooltip title="Time Tracking" description="Estimated vs actual hours for better planning" />
              </div>
              <ModernCardTitle>Time Efficiency</ModernCardTitle>
              <ModernCardDescription>
                Monitor time estimates vs actual completion
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-orange-600 mb-2">32</div>
                <div className="text-sm text-orange-600">hours this week</div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Task Board */}
        <ModernCard variant="floating">
          <ModernCardContent className="p-6">
            <TaskBoard farmId={user.id} showAssignments={true} />
          </ModernCardContent>
        </ModernCard>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModernCard variant="glow">
            <ModernCardHeader>
              <ModernCardTitle className="text-sage-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </ModernCardTitle>
              <ModernCardDescription>
                Manage worker assignments and permissions
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <span className="text-sm font-medium">John Smith - Field Operations</span>
                  <span className="text-xs text-sage-600">5 active tasks</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <span className="text-sm font-medium">Sarah Johnson - Livestock</span>
                  <span className="text-xs text-sage-600">3 active tasks</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                  <span className="text-sm font-medium">Mike Rodriguez - Equipment</span>
                  <span className="text-xs text-sage-600">2 active tasks</span>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard variant="soft">
            <ModernCardHeader>
              <ModernCardTitle className="text-sage-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </ModernCardTitle>
              <ModernCardDescription>
                Critical tasks approaching their due dates
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Apply Fertilizer - South Field</span>
                  <span className="text-xs text-red-600 font-medium">Due tomorrow</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">Plant Corn in North Field</span>
                  <span className="text-xs text-orange-600 font-medium">Due in 2 days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Check Cattle Health</span>
                  <span className="text-xs text-gray-600">Due in 3 days</span>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      </main>
    </DashboardLayout>
  )
}