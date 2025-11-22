'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin } from 'lucide-react'
interface Farm {
  id: string
  name: string
}
interface FarmSelectorProps {
  farms: Farm[]
  currentFarmId: string
}
export function FarmSelector({ farms, currentFarmId }: FarmSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const handleFarmChange = (farmId: string) => {
    const params = new URLSearchParams(searchParams || '')
    params.set('farmId', farmId)
    const currentPath = window.location.pathname
    router.push(`${currentPath}?${params.toString()}`)
  }
  if (farms.length <= 1) {
    return null
  }
  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#DDE4D8]/50 shadow-sm">
      <MapPin className="h-4 w-4 text-[#555555]" />
      <select
        value={currentFarmId}
        onChange={(e) => handleFarmChange(e.target.value)}
        className="bg-transparent text-#1A1A1A border-0 focus:outline-none focus:ring-0 cursor-pointer font-medium"
      >
        {farms.map((farm) => (
          <option key={farm.id} value={farm.id} className="text-gray-900 bg-white">
            {farm.name}
          </option>
        ))}
      </select>
    </div>
  )
}