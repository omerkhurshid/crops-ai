'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from '../../../../lib/auth-unified'
import { Navbar } from '../../../../components/navigation/navbar'
import { CropHealthReport } from '../../../../components/reports/crop-health-report'
import { Button } from '../../../../components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CropHealthReportPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  const farmId = params?.farmId as string

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    setIsLoading(false)
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center">
        <div className="text-sage-600">Loading...</div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/reports" className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-sage-800 mb-2">
                Crop Health Report
              </h1>
              <p className="text-sage-600">
                Satellite analysis of your crop health and stress levels
              </p>
            </div>
          </div>
        </div>

        <CropHealthReport farmId={farmId} />
      </main>
    </div>
  )
}