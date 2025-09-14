import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { TaskBoard } from '../../components/tasks/task-board'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../../components/ui/modern-card'
import { ClientFloatingButton } from '../../components/ui/client-floating-button'
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
        <div className="mb-8">
          {/* Page Header - Consistent with other pages */}
          <h1 className="text-4xl font-light text-sage-800 mb-2">Farm Tasks</h1>
          <p className="text-lg text-sage-600 mb-6">
            Organize and track your daily farm operations
          </p>
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