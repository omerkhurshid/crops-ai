'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { AddBreedingForm } from '../../../../components/livestock/add-breeding-form'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
export default function AddBreedingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [breedingAnimals, setBreedingAnimals] = useState<any[]>([])
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
            router.push('/farms/create-unifiedfrom=breeding')
            return
          }
          // Fetch animals for breeding
          const animalsResponse = await fetch('/api/livestock/animals')
          if (animalsResponse.ok) {
            const animals = await animalsResponse.json()
            // Filter for active animals only
            const activeAnimals = animals.filter((animal: any) => animal.status === 'active')
            setBreedingAnimals(activeAnimals)
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
            <p className="text-gray-600 mb-6">You need to create a farm before adding breeding records.</p>
            <button 
              onClick={() => router.push('/farms/create-unifiedfrom=breeding')}
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
            href="/livestock/breeding"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Breeding Management
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Breeding Record</h1>
          <p className="text-gray-600">Record a new breeding event or pregnancy</p>
        </div>
        {/* Add Breeding Form */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Breeding Information</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <AddBreedingForm 
              farms={userFarms} 
              animals={breedingAnimals}
              userId={session?.user?.id || ''}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}