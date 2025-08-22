import { getCurrentUser } from '../../../../lib/auth/session'
import { redirect } from 'next/navigation'
import { UnifiedFarmDashboard } from '../../../../components/precision/unified-farm-dashboard'
import { prisma } from '../../../../lib/prisma'

export default async function PrecisionDashboardPage() {
  // Check authentication
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get the user's first farm for the demo
  let farm = null
  try {
    farm = await prisma.farm.findFirst({
      where: { userId: user.id },
      select: { id: true, name: true, latitude: true, longitude: true }
    })
  } catch (error) {
    console.error('Error loading farm:', error)
  }

  // Default demo farm if no farm exists  
  const defaultFarm = {
    id: 'precision-dashboard-farm',
    name: 'Precision Agriculture Demo Farm',
    latitude: 36.7783,
    longitude: -119.4179
  }

  const farmData = farm || defaultFarm
  const farmLocation = {
    lat: farmData.latitude || 36.7783,
    lng: farmData.longitude || -119.4179
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-600">
          Role: {user.role} | Farm: {farmData.name}
        </p>
      </div>
      
      <UnifiedFarmDashboard 
        farmId={farmData.id}
        farmLocation={farmLocation}
      />
    </div>
  )
}