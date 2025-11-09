'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
export function FieldsHeaderActions() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isQuickMode = searchParams?.get('quick') === 'true'
  return (
    <div className="flex gap-2">
      <Button 
        className="bg-sage-600 hover:bg-sage-700"
        onClick={() => {
          const url = isQuickMode 
            ? '/farms/create-unifiedguided=true&step=fields' 
            : '/fields/create'
          router.push(url)
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Field
      </Button>
      {isQuickMode && (
        <Button 
          variant="outline"
          onClick={() => router.push('/fields/quick-setup')}
        >
          Quick Setup (5 min)
        </Button>
      )}
    </div>
  )
}