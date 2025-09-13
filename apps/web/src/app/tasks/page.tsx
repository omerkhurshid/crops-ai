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

        {/* Overview Cards - will be populated by TaskBoard component */}

        {/* Task Board */}
        <ModernCard variant="floating">
          <ModernCardContent className="p-6">
            <TaskBoard farmId={user.id} showAssignments={true} />
          </ModernCardContent>
        </ModernCard>

        {/* Quick Actions - will show when user has tasks or team members */}
      </main>
    </DashboardLayout>
  )
}