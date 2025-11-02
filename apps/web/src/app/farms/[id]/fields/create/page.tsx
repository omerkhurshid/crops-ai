import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthenticatedUser } from '../../../../../lib/auth/server'
import { Navbar } from '../../../../../components/navigation/navbar'
import { FieldForm } from '../../../../../components/farm/field-form'
import { prisma } from '../../../../../lib/prisma'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getFarm(farmId: string, userId: string) {
  const farm = await prisma.farm.findFirst({
    where: { 
      id: farmId,
      ownerId: userId
    },
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      totalArea: true,
      fields: {
        select: {
          id: true,
          name: true,
          area: true
        }
      }
    }
  })
  
  return farm
}

export default async function CreateFieldPage({ params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    redirect('/login')
  }

  const farm = await getFarm(params.id, user.id)

  if (!farm) {
    redirect('/farms')
  }

  return (
    <div className="minimal-page">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <Link href={`/farms/${farm.id}`} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {farm.name}
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Add New Field</h1>
          <p className="text-gray-600 mt-2">
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