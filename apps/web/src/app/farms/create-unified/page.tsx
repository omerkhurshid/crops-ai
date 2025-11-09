'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '../../../lib/auth-unified'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { UnifiedFarmCreator } from '../../../components/farm/unified-farm-creator'
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
      <UnifiedFarmCreator />
    </DashboardLayout>
  )
}