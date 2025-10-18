import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { Navbar } from '../../components/navigation/navbar'
import { GuidedFarmSetup } from '../../components/onboarding/guided-farm-setup'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

async function getUserStats(userId: string) {
  try {
    const [farmCount, fieldCount] = await Promise.all([
      prisma.farm.count({
        where: { ownerId: userId }
      }),
      prisma.field.count({
        where: { 
          farm: { ownerId: userId }
        }
      })
    ])

    return {
      totalFarms: farmCount,
      totalFields: fieldCount
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      totalFarms: 0,
      totalFields: 0
    }
  }
}

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const stats = await getUserStats(user.id)

  return (
    <div className="minimal-page">
      <Navbar />
      
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-sage-800 mb-4 tracking-tight">
            Let's Increase Your Farm Profits
          </h1>
          <p className="text-xl text-sage-600 font-light max-w-2xl mx-auto leading-relaxed">
            In just 5 minutes, we'll show you personalized recommendations to boost your yields and profits
          </p>
          
          {/* Value proposition callout */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-8 max-w-xl mx-auto">
            <div className="text-2xl font-bold text-green-700 mb-2">
              Average farmer saves $15,000+ per season
            </div>
            <p className="text-green-600">
              With better timing decisions and early problem detection
            </p>
          </div>
        </div>

        <GuidedFarmSetup 
          onComplete={() => {
            window.location.href = '/dashboard'
          }}
          onSkip={() => {
            window.location.href = '/dashboard'
          }}
        />
      </main>
    </div>
  )
}