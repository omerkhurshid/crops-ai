'use client'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { MapPin } from 'lucide-react'
interface FieldsQuickActionsProps {
  isQuickMode?: boolean
}
export function FieldsQuickActions({ isQuickMode = false }: FieldsQuickActionsProps) {
  const router = useRouter()
  return (
    <div className="space-y-3">
      <button
        onClick={() => {
          const url = isQuickMode 
            ? '/farms/create-unifiedguided=true&step=fields' 
            : '/fields/create'
          router.push(url)
        }}
        className="w-full bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Create Your First Field
      </button>
      <button
        onClick={() => router.push('/fields/quick-setup')}
        className="w-full bg-white hover:bg-sage-50 text-sage-700 border border-sage-300 px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Quick Setup
      </button>
    </div>
  )
}
export function FieldsNavigateButton() {
  const router = useRouter()
  return (
    <Button
      onClick={() => router.push('/farms')}
      variant="outline"
      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
    >
      <MapPin className="h-4 w-4 mr-2" />
      Manage Farms
    </Button>
  )
}