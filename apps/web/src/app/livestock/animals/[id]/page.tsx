'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { AnimalProfile } from '../../../../components/livestock/animal-profile'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { ArrowLeft, Edit, Heart, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
interface PageProps {
  params: {
    id: string
  }
}
export default function AnimalProfilePage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [animal, setAnimal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    // Fetch animal data
    const fetchAnimal = async () => {
      try {
        const response = await fetch(`/api/livestock/animals/${params.id}`)
        if (response.ok) {
          const animalData = await response.json()
          setAnimal(animalData)
        } else if (response.status === 404) {
          router.push('/livestock/animals')
        }
      } catch (error) {
        console.error('Error fetching animal:', error)
        router.push('/livestock/animals')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnimal()
  }, [session, status, router, params.id])
  if (status === 'loading' || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78]"></div>
          <p className="ml-4 text-[#555555]">Loading animal profile...</p>
        </div>
      </DashboardLayout>
    )
  }
  if (!session || !animal) {
    return null
  }
  // Calculate basic stats
  const healthRecords = animal.healthRecords || []
  const weightRecords = animal.weightRecords || []
  const feedRecords = animal.feedRecords || []
  const recentHealthIssues = healthRecords.filter((record: any) => 
    ['illness', 'injury'].includes(record.recordType) && 
    new Date(record.recordDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length
  const weightGain = weightRecords.length >= 2 
    ? weightRecords[0].weight - weightRecords[1].weight 
    : 0
  const feedCostLast30Days = feedRecords
    .filter((record: any) => new Date(record.feedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum: number, record: any) => sum + (record.totalCost || 0), 0)
  const currentValue = animal.currentValue || animal.purchasePrice || 0
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/livestock/animals"
              className="flex items-center text-[#555555] hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Animals
            </Link>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Animal
          </Button>
        </div>
        {/* Animal Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {animal.name || `${animal.species} #${animal.tagNumber}`}
          </h1>
          <p className="text-[#555555]">
            {animal.breed} • {animal.gender} • Born {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-[#7A8F78]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#555555]">Health Status</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recentHealthIssues === 0 ? 'Healthy' : 'Needs Attention'}
                  </p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className={`h-8 w-8 ${weightGain >= 0 ? 'text-[#7A8F78]' : 'text-red-600'}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#555555]">Weight Change</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {weightGain >= 0 ? '+' : ''}{weightGain.toFixed(1)} lbs
                  </p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#555555]">Current Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${currentValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
          <ModernCard>
            <ModernCardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-orange-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#555555]">Feed Cost (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${feedCostLast30Days.toFixed(0)}
                  </p>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
        {/* Animal Profile Component */}
        <AnimalProfile animal={animal} />
      </div>
    </DashboardLayout>
  )
}