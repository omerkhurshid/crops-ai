'use client'

import { useRouter } from 'next/navigation'

interface LivestockQuickActionsProps {
  className?: string
}

export function LivestockQuickActions({ className = "" }: LivestockQuickActionsProps) {
  const router = useRouter()

  return (
    <div className={`mt-4 pt-3 border-t border-earth-200 flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => router.push('/livestock/add-animal')}
        className="bg-earth-600 hover:bg-earth-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        Add First Animal
      </button>
      <button
        onClick={() => router.push('/livestock/add-event')}
        className="bg-white hover:bg-earth-50 text-earth-700 border border-earth-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        Log Health Event
      </button>
      <button
        onClick={() => router.push('/help/articles/livestock-basics')}
        className="bg-white hover:bg-earth-50 text-earth-700 border border-earth-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        Learn More
      </button>
    </div>
  )
}