'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '../../../../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { Navbar } from '../../../../../components/navigation/navbar'
import { FieldForm } from '../../../../../components/farm/field-form'
import { ArrowLeft } from 'lucide-react'
export default function CreateFieldPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [farm, setFarm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    async function fetchFarm() {
      try {
        const response = await fetch(`/api/farms/${params.id}`)
        if (response.ok) {
          const farmData = await response.json()
          setFarm(farmData)
        } else if (response.status === 404) {
          router.push('/farms')
        }
      } catch (error) {
        console.error('Error fetching farm:', error)
        router.push('/farms')
      } finally {
        setIsLoading(false)
      }
    }
    fetchFarm()
  }, [session, status, router, params.id])
  if (status === 'loading' || isLoading) {
    return (
      <div className="minimal-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78]"></div>
          <p className="ml-4 text-[#555555]">Loading farm data...</p>
        </div>
      </div>
    )
  }
  if (!session || !farm) {
    return null
  }
  return (
    <div className="minimal-page">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <Link href={`/farms/${farm.id}`} className="inline-flex items-center text-sm text-[#555555] hover:text-[#1A1A1A] mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {farm.name}
          </Link>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Add New Field</h1>
          <p className="text-[#555555] mt-2">
            Create a new field for monitoring and management
          </p>
        </div>
        <FieldForm 
          farmId={farm.id} 
          farmName={farm.name}
          farmLatitude={farm.latitude}
          farmLongitude={farm.longitude}
          farmTotalArea={farm.totalArea}
          existingFields={farm.fields}
        />
      </main>
    </div>
  )
}