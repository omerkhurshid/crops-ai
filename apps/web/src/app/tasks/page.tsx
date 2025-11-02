'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '../../lib/auth-unified'
import { useEffect, useState } from 'react'
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

interface Farm {
  id: string
  name: string
  totalArea?: number
}

export default function TasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    async function fetchUserData() {
      try {
        setLoading(true)
        
        // Fetch user's farms to determine the appropriate farmId for TaskBoard
        const farmsResponse = await fetch('/api/farms')
        
        if (!farmsResponse.ok) {
          throw new Error('Failed to fetch farms')
        }

        const farmsData = await farmsResponse.json()
        const userFarms = farmsData.farms || []
        
        setFarms(userFarms)
        
        // Auto-select first farm if available
        if (userFarms.length > 0) {
          setSelectedFarm(userFarms[0])
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load farm data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-sage-200 p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <DashboardLayout>
        <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading tasks: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </main>
      </DashboardLayout>
    )
  }

  // No farms state
  if (farms.length === 0) {
    return (
      <DashboardLayout>
        <main className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-light text-sage-800 mb-2">Farm Tasks</h1>
            <p className="text-lg text-sage-600 mb-6">
              Organize and track your daily farm operations
            </p>
          </div>

          <ModernCard variant="floating">
            <ModernCardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sage-100 to-sage-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckSquare className="h-10 w-10 text-sage-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-sage-800 mb-4">
                No Farms Found
              </h3>
              
              <p className="text-sage-600 mb-6">
                You need to create a farm before you can start managing tasks. 
                Tasks help you organize and track your daily farm operations.
              </p>
              
              <button
                onClick={() => router.push('/farms/create')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Farm
              </button>
            </ModernCardContent>
          </ModernCard>
        </main>
      </DashboardLayout>
    )
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
            <TaskBoard 
              farmId={selectedFarm?.id || session.user.id} 
              showAssignments={true} 
            />
          </ModernCardContent>
        </ModernCard>

        {/* Quick Actions - will show when user has tasks or team members */}
      </main>
    </DashboardLayout>
  )
}