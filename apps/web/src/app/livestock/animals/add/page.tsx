'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '../../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { AddAnimalForm } from '../../../../components/livestock/add-animal-form'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddAnimalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Fetch user's farms
    const fetchFarms = async () => {
      try {
        const response = await fetch('/api/farms')
        if (response.ok) {
          const farms = await response.json()
          setUserFarms(farms)
        }
      } catch (error: any) {
        console.error('Error fetching farms:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFarms()
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  // If no farms, show empty state
  if (userFarms.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Farms Available</h2>
            <p className="text-gray-600 mb-6">You need to create a farm before adding animals.</p>
            <Link href="/farms/create?from=animals">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg">Create Farm</button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Mock parent animals for now - would be fetched from API in real implementation
  const parentAnimals: any[] = []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/livestock/animals"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Animals
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Animal</h1>
          <p className="text-gray-600">Register a new animal in your herd</p>
        </div>

        {/* Add Animal Form */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Animal Information</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <AddAnimalForm 
              farms={userFarms} 
              parentAnimals={parentAnimals}
              userId={user.id}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}