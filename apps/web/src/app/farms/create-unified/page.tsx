'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '../../../lib/auth-unified'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { ThreeStepFarmCreator } from '../../../components/farm/three-step-farm-creator'
import { LoadingSpinner } from '../../../components/ui/loading'

export default function CreateUnifiedFarmPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Farm</h1>
          <p className="text-lg text-gray-600">Set up your farm in three easy steps</p>
        </div>
        <ThreeStepFarmCreator />
      </div>
    </DashboardLayout>
  )
}