'use client'
import { useRouter } from 'next/navigation'
interface LivestockQuickActionsProps {
  className?: string
}
export function LivestockQuickActions({ className = "" }: LivestockQuickActionsProps) {
  const router = useRouter()
  return (
    <div className={`mt-4 pt-3 border-t border-[#DDE4D8] flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => router.push('/livestock/add-animal')}
        className="bg-[#7A8F78] hover:bg-[#5E6F5A] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        Add First Animal
      </button>
      <button
        onClick={() => router.push('/livestock/add-event')}
        className="bg-white hover:bg-[#F8FAF8] text-[#7A8F78] border border-[#DDE4D8] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        Log Health Event
      </button>
      <button
        onClick={() => router.push('/help/articles/livestock-basics')}
        className="bg-white hover:bg-[#F8FAF8] text-[#7A8F78] border border-[#DDE4D8] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        Learn More
      </button>
    </div>
  )
}