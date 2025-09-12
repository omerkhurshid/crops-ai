'use client'

import { Navbar } from '../../../components/navigation/navbar'
import { UnifiedFarmCreator } from '../../../components/farm/unified-farm-creator'

export default function CreateUnifiedFarmPage() {
  return (
    <div className="minimal-page">
      <Navbar />
      
      <main className="max-w-6xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <UnifiedFarmCreator />
      </main>
    </div>
  )
}