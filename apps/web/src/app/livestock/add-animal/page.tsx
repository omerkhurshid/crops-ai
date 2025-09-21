'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Textarea } from '../../../components/ui/textarea'
import { ArrowLeft, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddAnimalPage() {
  const router = useRouter()
  const [farms, setFarms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    farmId: '',
    animalType: 'cattle',
    breed: '',
    tagNumber: '',
    birthDate: '',
    weight: '',
    healthStatus: 'healthy',
    notes: ''
  })

  useEffect(() => {
    fetchFarms()
  }, [])

  const fetchFarms = async () => {
    try {
      const response = await fetch('/api/farms')
      if (response.ok) {
        const farmData = await response.json()
        setFarms(farmData)
        if (farmData.length > 0) {
          setFormData(prev => ({ ...prev, farmId: farmData[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching farms:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // For now, just show a message that this feature is not yet implemented
      toast.success('Animal registration feature coming soon!')
      setTimeout(() => {
        router.push('/livestock')
      }, 1500)
    } catch (error: any) {
      toast.error('Error adding animal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Livestock
          </Button>
          
          <h1 className="text-4xl font-light text-sage-800 mb-2">Add Animal</h1>
          <p className="text-lg text-sage-600">
            Register a new animal to your herd
          </p>
        </div>

        <ModernCard>
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Animal Registration
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="farmId">Farm</Label>
                  <Select 
                    value={formData.farmId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, farmId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a farm" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id}>
                          {farm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="animalType">Animal Type</Label>
                  <Select 
                    value={formData.animalType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, animalType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cattle">Cattle</SelectItem>
                      <SelectItem value="sheep">Sheep</SelectItem>
                      <SelectItem value="goats">Goats</SelectItem>
                      <SelectItem value="pigs">Pigs</SelectItem>
                      <SelectItem value="poultry">Poultry</SelectItem>
                      <SelectItem value="horses">Horses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tagNumber">Tag/ID Number</Label>
                  <Input
                    id="tagNumber"
                    value={formData.tagNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagNumber: e.target.value }))}
                    placeholder="Enter animal identification number"
                  />
                </div>

                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="Enter breed (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="Enter weight in kilograms (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="healthStatus">Health Status</Label>
                  <Select 
                    value={formData.healthStatus} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, healthStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthy">Healthy</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="recovering">Recovering</SelectItem>
                      <SelectItem value="pregnant">Pregnant</SelectItem>
                      <SelectItem value="quarantine">Quarantine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this animal (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding Animal...' : 'Add Animal'}
                </Button>
              </div>
            </form>
          </ModernCardContent>
        </ModernCard>
      </div>
    </DashboardLayout>
  )
}