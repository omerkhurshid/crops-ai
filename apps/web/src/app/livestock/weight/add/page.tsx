'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '../../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { AddWeightForm } from '../../../../components/livestock/add-weight-form'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'


export default function AddWeightPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [animals, setAnimals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch farms
        const farmsResponse = await fetch('/api/farms')
        if (farmsResponse.ok) {
          const farms = await farmsResponse.json()
          setUserFarms(farms)

          // If no farms, redirect to farm creation
          if (farms.length === 0) {
            router.push('/farms/create?from=weight')
            return
          }

          // Fetch animals for weight tracking
          const animalsResponse = await fetch('/api/livestock/animals')
          if (animalsResponse.ok) {
            const animalsData = await animalsResponse.json()
            // Filter for active animals only
            const activeAnimals = animalsData.filter((animal: any) => animal.status === 'active')
            setAnimals(activeAnimals)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
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

  // If no farms, show empty state (this is also handled in useEffect)
  if (userFarms.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Farms Available</h2>
            <p className="text-gray-600 mb-6">You need to create a farm before tracking animal weights.</p>
            <button 
              onClick={() => router.push('/farms/create?from=weight')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Create Farm
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/livestock/weight"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Weight Tracking
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Weight</h1>
          <p className="text-gray-600">Track animal weight and body condition</p>
        </div>

        {/* Add Weight Form */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Weight Measurement</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <AddWeightForm 
              farms={userFarms} 
              animals={animals}
              userId={session?.user?.id || ''}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}