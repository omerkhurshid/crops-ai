'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { AddFeedForm } from '../../../../components/livestock/add-feed-form'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
export default function AddFeedPage() {
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
            router.push('/farms/create-unifiedfrom=feed')
            return
          }
          // Fetch animals for feeding
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78]"></div>
          <p className="ml-4 text-[#555555]">Loading...</p>
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
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">No Farms Available</h2>
            <p className="text-[#555555] mb-6">You need to create a farm before recording feed information.</p>
            <button 
              onClick={() => router.push('/farms/create-unifiedfrom=feed')}
              className="bg-[#7A8F78] text-white px-4 py-2 rounded-lg"
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
            href="/livestock/feed"
            className="flex items-center text-[#555555] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Feed Management
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Record Feeding</h1>
          <p className="text-[#555555]">Track feed costs and nutrition information</p>
        </div>
        {/* Add Feed Form */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Feed Information</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <AddFeedForm 
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