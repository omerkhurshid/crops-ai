'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { BreedingManagement } from '../../../components/livestock/breeding-management'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { ClientFloatingButton } from '../../../components/ui/client-floating-button'
import { Plus, Heart, Calendar, Users, TrendingUp } from 'lucide-react'


export default function BreedingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userFarms, setUserFarms] = useState<any[]>([])
  const [breedingRecords, setBreedingRecords] = useState<any[]>([])
  const [breedingAnimals, setBreedingAnimals] = useState<any[]>([])
  const [stats, setStats] = useState({ 
    total: 0, 
    activePregnancies: 0, 
    upcomingBirths: 0, 
    successRate: 0 
  })
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
            router.push('/farms/create?from=breeding')
            return
          }

          // Fetch breeding records
          const breedingResponse = await fetch('/api/livestock/breeding')
          if (breedingResponse.ok) {
            const records = await breedingResponse.json()
            setBreedingRecords(records)

            // Calculate stats on client side
            const calculatedStats = {
              total: records.length,
              activePregnancies: records.filter((record: any) => 
                record.status === 'pregnant' || record.status === 'breeding'
              ).length,
              upcomingBirths: 0, // Will calculate below
              successRate: 0 // Will calculate below
            }

            // Upcoming births in next 30 days
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
            calculatedStats.upcomingBirths = records.filter((record: any) => 
              record.expectedDueDate && 
              new Date(record.expectedDueDate) <= thirtyDaysFromNow &&
              new Date(record.expectedDueDate) >= new Date() &&
              !record.actualBirthDate
            ).length

            // Success rate calculation
            const completedBreedings = records.filter((record: any) => 
              record.status === 'completed' || record.actualBirthDate
            )
            const successfulBreedings = records.filter((record: any) => 
              record.actualBirthDate && (record.numberOfOffspring || 0) > 0
            )
            calculatedStats.successRate = completedBreedings.length > 0 
              ? (successfulBreedings.length / completedBreedings.length) * 100 
              : 0

            setStats(calculatedStats)
          }

          // Fetch animals for breeding
          const animalsResponse = await fetch('/api/livestock/animals')
          if (animalsResponse.ok) {
            const animals = await animalsResponse.json()
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
          <p className="ml-4 text-gray-600">Loading breeding data...</p>
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
            <p className="text-gray-600 mb-6">You need to create a farm before managing breeding records.</p>
            <button 
              onClick={() => router.push('/farms/create?from=breeding')}
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Breeding Management</h1>
            <p className="text-gray-600">Track breeding cycles and reproductive performance</p>
          </div>
          <div className="flex gap-3">
            <ClientFloatingButton
              href="/livestock/breeding/add"
              icon={<Plus className="h-5 w-5" />}
              label="Add Breeding Record"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Breeding Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Pregnancies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activePregnancies}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Births (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingBirths}</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>

          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>

        {/* Breeding Management */}
        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle>Breeding Records</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <BreedingManagement 
              breedingRecords={breedingRecords} 
              farms={userFarms}
              animals={breedingAnimals}
            />
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}