'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '../../lib/auth-unified'
import { useEffect, useState } from 'react'
import { Navbar } from '../../components/navigation/navbar'
import { GuidedFarmSetup } from '../../components/onboarding/guided-farm-setup'
export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalFields: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    const fetchUserStats = async () => {
      try {
        // Fetch farms and fields data
        const [farmsResponse, fieldsResponse] = await Promise.all([
          fetch('/api/farms'),
          fetch('/api/fields')
        ])
        if (farmsResponse.ok && fieldsResponse.ok) {
          const farms = await farmsResponse.json()
          const fields = await fieldsResponse.json()
          setStats({
            totalFarms: farms.length,
            totalFields: fields.length
          })
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserStats()
  }, [session, status, router])
  if (status === 'loading' || isLoading) {
    return (
      <div className="minimal-page">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F78]"></div>
          <p className="ml-4 text-[#555555]">Loading...</p>
        </div>
      </div>
    )
  }
  if (!session) {
    return null
  }
  return (
    <div className="minimal-page">
      <Navbar />
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-[#7A8F78] mb-4 tracking-tight">
            Let's Increase Your Farm Profits
          </h1>
          <p className="text-xl text-[#7A8F78] font-light max-w-2xl mx-auto leading-relaxed">
            In just 5 minutes, we'll show you personalized recommendations to boost your yields and profits
          </p>
          {/* Value proposition callout */}
          <div className="bg-[#F8FAF8] border border-[#DDE4D8] rounded-xl p-6 mt-8 max-w-xl mx-auto">
            <div className="text-2xl font-bold text-[#7A8F78] mb-2">
              Average farmer saves $15,000+ per season
            </div>
            <p className="text-[#7A8F78]">
              With better timing decisions and early problem detection
            </p>
          </div>
        </div>
        <GuidedFarmSetup 
          onComplete={() => {
            router.push('/dashboard')
          }}
          onSkip={() => {
            router.push('/dashboard')
          }}
        />
      </main>
    </div>
  )
}