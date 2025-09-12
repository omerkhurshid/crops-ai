'use client'

import { Navbar } from '../../../components/navigation/navbar'
import { SimpleFarmCreator } from '../../../components/farm/simple-farm-creator'

export default function CreateSimpleFarmPage() {
  return (
    <div className="minimal-page">
      <Navbar />
      
      <main className="max-w-4xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <SimpleFarmCreator />
      </main>
    </div>
  )
}