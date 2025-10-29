import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { SettingsForm } from '../../components/settings/settings-form'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Get full user data including preferences
  let fullUser = null
  try {
    fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        landUnit: true,
        temperatureUnit: true,
        timezone: true,
        language: true
      }
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    // Use the basic user data as fallback
    fullUser = user
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-light text-sage-800 mb-3">Account Settings</h1>
          <p className="text-lg text-sage-600 leading-relaxed">
            Manage your account preferences and system settings
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-sage-200">
          <SettingsForm user={fullUser || user} />
        </div>
      </div>
    </DashboardLayout>
  )
}