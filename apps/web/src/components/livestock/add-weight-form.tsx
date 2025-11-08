'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'
interface AddWeightFormProps {
  farms: any[]
  animals: any[]
  userId: string
}
export function AddWeightForm({ farms, animals, userId }: AddWeightFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    animalId: '',
    weighDate: new Date().toISOString().split('T')[0],
    weight: '',
    bodyConditionScore: '',
    notes: ''
  })
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!formData.animalId || !formData.weighDate || !formData.weight) {
        throw new Error('Please fill in all required fields')
      }
      const weight = parseFloat(formData.weight)
      if (weight <= 0) {
        throw new Error('Weight must be a positive number')
      }
      if (formData.bodyConditionScore) {
        const bcs = parseFloat(formData.bodyConditionScore)
        if (bcs < 1 || bcs > 5) {
          throw new Error('Body condition score must be between 1 and 5')
        }
      }
      // Submit weight record
      const response = await fetch('/api/livestock/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          weight: weight,
          bodyConditionScore: formData.bodyConditionScore ? parseFloat(formData.bodyConditionScore) : null
        })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add weight record')
      }
      const newRecord = await response.json()
      toast.success('Weight record added successfully!')
      router.push('/livestock/weight')
    } catch (error) {
      console.error('Error adding weight record:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add weight record')
    } finally {
      setIsSubmitting(false)
    }
  }
  // Get selected animal details
  const selectedAnimal = animals.find(animal => animal.id === formData.animalId)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="animalId">Animal *</Label>
          <select
            id="animalId"
            name="animalId"
            value={formData.animalId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select animal...</option>
            {animals.map(animal => (
              <option key={animal.id} value={animal.id}>
                #{animal.tagNumber} {animal.name && `(${animal.name})`} - {animal.species} - {animal.farm.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="weighDate">Weigh Date *</Label>
          <Input
            id="weighDate"
            name="weighDate"
            type="date"
            value={formData.weighDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      {/* Weight and Body Condition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="weight">Weight (lbs) *</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="1200.5"
            required
          />
          {selectedAnimal?.currentWeight && (
            <p className="text-sm text-gray-500 mt-1">
              Previous weight: {selectedAnimal.currentWeight} lbs
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="bodyConditionScore">Body Condition Score (1-5)</Label>
          <select
            id="bodyConditionScore"
            name="bodyConditionScore"
            value={formData.bodyConditionScore}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select score...</option>
            <option value="1">1 - Very Thin</option>
            <option value="1.5">1.5</option>
            <option value="2">2 - Thin</option>
            <option value="2.5">2.5</option>
            <option value="3">3 - Moderate</option>
            <option value="3.5">3.5</option>
            <option value="4">4 - Fat</option>
            <option value="4.5">4.5</option>
            <option value="5">5 - Very Fat</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Body condition score helps assess animal health and nutrition status
          </p>
        </div>
      </div>
      {/* Weight Change Preview */}
      {selectedAnimal?.currentWeight && formData.weight && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Weight Change</h4>
          <div className="text-blue-800">
            {(() => {
              const currentWeight = parseFloat(formData.weight)
              const previousWeight = selectedAnimal.currentWeight
              const change = currentWeight - previousWeight
              const percentage = ((change / previousWeight) * 100)
              return (
                <div className="flex items-center gap-4">
                  <span>
                    {change >= 0 ? '+' : ''}{change.toFixed(1)} lbs
                  </span>
                  <span>
                    ({change >= 0 ? '+' : ''}{percentage.toFixed(1)}%)
                  </span>
                  {change >= 0 ? (
                    <span className="text-green-600 font-medium">Weight Gain</span>
                  ) : (
                    <span className="text-red-600 font-medium">Weight Loss</span>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
      {/* Age Information */}
      {selectedAnimal?.birthDate && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Animal Information</h4>
          <div className="text-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Age: </span>
                {(() => {
                  const birth = new Date(selectedAnimal.birthDate)
                  const now = new Date(formData.weighDate)
                  const monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
                  if (monthsDiff < 12) return `${monthsDiff} months`
                  const years = Math.floor(monthsDiff / 12)
                  const remainingMonths = monthsDiff % 12
                  if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`
                  return `${years}y ${remainingMonths}m`
                })()}
              </div>
              <div>
                <span className="font-medium">Species: </span>
                {selectedAnimal.species}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Any observations about the animal's condition, behavior, or health..."
          rows={3}
        />
      </div>
      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Recording Weight...' : 'Record Weight'}
        </Button>
      </div>
    </form>
  )
}