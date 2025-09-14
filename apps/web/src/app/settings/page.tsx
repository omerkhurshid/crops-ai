import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth/session'
import { DashboardLayout } from '../../components/layout/dashboard-layout'
import { SettingsForm } from '../../components/settings/settings-form'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-sage-800 mb-2">Account Settings</h1>
          <p className="text-lg text-sage-600">
            Manage your account preferences and system settings
          </p>
        </div>

        <SettingsForm user={user} />
      </div>
    </DashboardLayout>
  )
}