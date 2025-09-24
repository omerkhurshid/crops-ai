'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { ArrowLeft, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddLivestockEventPage() {
  const router = useRouter()
  const [farms, setFarms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    farmId: '',
    livestockType: 'cattle',
    eventType: 'health_check',
    animalCount: 1,
    notes: '',
    eventDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchFarms()
  }, [])

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farms')
      if (response.ok) {
        const farmData = await response.json()
        // Ensure farmData is an array
        const farmsArray = Array.isArray(farmData) ? farmData : []
        setFarms(farmsArray)
        if (farmsArray.length > 0) {
          setFormData(prev => ({ ...prev, farmId: farmsArray[0].id }))
        }
      } else {
        console.error('Failed to fetch farms:', response.status)
        setFarms([]) // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching farms:', error)
      setFarms([]) // Set empty array on error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/livestock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          animalCount: parseInt(formData.animalCount.toString()),
          eventDate: new Date(formData.eventDate)
        })
      })

      if (response.ok) {
        toast.success('Livestock event added successfully!')
        router.push('/livestock')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to add livestock event')
      }
    } catch (error) {
      toast.error('Error adding livestock event')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const livestockTypes = [
    { value: 'cattle', label: 'Cattle' },
    { value: 'sheep', label: 'Sheep' },
    { value: 'goats', label: 'Goats' },
    { value: 'pigs', label: 'Pigs' },
    { value: 'chickens', label: 'Chickens' },
    { value: 'horses', label: 'Horses' },
    { value: 'other', label: 'Other' }
  ]

  const eventTypes = [
    { value: 'health_check', label: 'Health Check' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'breeding', label: 'Breeding' },
    { value: 'birth', label: 'Birth' },
    { value: 'treatment', label: 'Medical Treatment' },
    { value: 'weight', label: 'Weight Check' },
    { value: 'feeding', label: 'Feeding' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sage-600 hover:text-sage-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Livestock
          </button>
          
          <h1 className="text-4xl font-light text-sage-800 mb-2">Add Livestock Event</h1>
          <p className="text-lg text-sage-600">Record a new livestock event or activity</p>
        </div>

        <ModernCard variant="floating">
          <ModernCardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sage-100 rounded-lg">
                <Users className="h-5 w-5 text-sage-600" />
              </div>
              <ModernCardTitle>Livestock Event Details</ModernCardTitle>
            </div>
          </ModernCardHeader>
          
          <ModernCardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="farmId">Farm</Label>
                  <select
                    id="farmId"
                    value={formData.farmId}
                    onChange={(e) => setFormData(prev => ({ ...prev, farmId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a farm</option>
                    {farms && farms.length > 0 ? (
                      farms.map(farm => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No farms available</option>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="livestockType">Livestock Type</Label>
                  <select
                    id="livestockType"
                    value={formData.livestockType}
                    onChange={(e) => setFormData(prev => ({ ...prev, livestockType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    required
                  >
                    {livestockTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <select
                    id="eventType"
                    value={formData.eventType}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animalCount">Number of Animals</Label>
                  <Input
                    id="animalCount"
                    type="number"
                    min="1"
                    value={formData.animalCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, animalCount: parseInt(e.target.value) || 1 }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any additional details about this event..."
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-sage-600 hover:bg-sage-700"
                >
                  {loading ? 'Adding Event...' : 'Add Livestock Event'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}