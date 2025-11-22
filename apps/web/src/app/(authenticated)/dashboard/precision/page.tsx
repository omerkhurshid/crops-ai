'use client'
import { useSession } from '../../../../lib/auth-unified'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UnifiedFarmDashboard } from '../../../../components/precision/unified-farm-dashboard'
export default function PrecisionDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [farm, setFarm] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    // Fetch user's first farm
    const fetchFarm = async () => {
      try {
        const response = await fetch('/api/farms')
        if (response.ok) {
          const farms = await response.json()
          if (farms && farms.length > 0) {
            setFarm(farms[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch farm:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFarm()
  }, [session, status, router])
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A1A1A]"></div>
      </div>
    )
  }
  if (!session) {
    return null // Will redirect
  }
  // Default demo farm if no farm exists  
  const defaultFarm = {
    id: 'precision-dashboard-farm',
    name: 'Precision Agriculture Demo Farm',
    latitude: 36.7783,
    longitude: -119.4179
  }
  const farmData = farm || defaultFarm
  const farmLocation = {
    lat: farmData.latitude || 36.7783,
    lng: farmData.longitude || -119.4179
  }
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {session.user.name}</h1>
        <p className="text-[#555555]">
          Role: {session.user.role} | Farm: {farmData.name}
        </p>
      </div>
      <UnifiedFarmDashboard 
        farmId={farmData.id}
        farmLocation={farmLocation}
      />
    </div>
  )
}