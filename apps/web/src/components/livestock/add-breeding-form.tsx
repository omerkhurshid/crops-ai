'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'
interface AddBreedingFormProps {
  farms: any[]
  animals: any[]
  userId: string
}
export function AddBreedingForm({ farms, animals, userId }: AddBreedingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    animalId: '',
    mateId: '',
    breedingDate: '',
    breedingType: 'natural',
    breedingMethod: '',
    veterinarian: '',
    cost: '',
    notes: '',
    status: 'breeding'
  })
  const breedingTypes = [
    'natural',
    'artificial_insemination',
    'embryo_transfer'
  ]
  const breedingMethods = [
    'live_cover',
    'fresh_ai',
    'frozen_ai',
    'cooled_ai',
    'embryo_transfer'
  ]
  const statuses = [
    'breeding',
    'pregnant',
    'completed',
    'failed'
  ]
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!formData.animalId || !formData.breedingDate || !formData.breedingType) {
        throw new Error('Please fill in all required fields')
      }
      // Submit breeding record
      const response = await fetch('/api/livestock/breeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          mateId: formData.mateId || null
        })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add breeding record')
      }
      const newRecord = await response.json()
      toast.success('Breeding record added successfully!')
      router.push('/livestock/breeding')
    } catch (error) {
      console.error('Error adding breeding record:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add breeding record')
    } finally {
      setIsSubmitting(false)
    }
  }
  // Filter animals for the selected animal
  const selectedAnimal = animals.find(animal => animal.id === formData.animalId)
  // Filter potential mates based on selected animal's species and opposite gender
  const potentialMates = selectedAnimal 
    ? animals.filter(animal => 
        animal.species === selectedAnimal.species && 
        animal.gender !== selectedAnimal.gender &&
        animal.id !== selectedAnimal.id
      )
    : []
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
            className="w-full px-3 py-2 border border-[#F3F4F6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select animal...</option>
            {animals.map(animal => (
              <option key={animal.id} value={animal.id}>
                #{animal.tagNumber} {animal.name && `(${animal.name})`} - {animal.species} ({animal.gender}) - {animal.farm.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="mateId">Mate (Optional)</Label>
          <select
            id="mateId"
            name="mateId"
            value={formData.mateId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-[#F3F4F6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedAnimal}
          >
            <option value="">Select mate...</option>
            {potentialMates.map(animal => (
              <option key={animal.id} value={animal.id}>
                #{animal.tagNumber} {animal.name && `(${animal.name})`} - {animal.farm.name}
              </option>
            ))}
          </select>
          {selectedAnimal && potentialMates.length === 0 && (
            <p className="text-sm text-[#555555] mt-1">
              No compatible mates available (different gender, same species)
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="breedingDate">Breeding Date *</Label>
          <Input
            id="breedingDate"
            name="breedingDate"
            type="date"
            value={formData.breedingDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="breedingType">Breeding Type *</Label>
          <select
            id="breedingType"
            name="breedingType"
            value={formData.breedingType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-[#F3F4F6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {breedingTypes.map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="breedingMethod">Breeding Method</Label>
          <select
            id="breedingMethod"
            name="breedingMethod"
            value={formData.breedingMethod}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-[#F3F4F6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select method...</option>
            {breedingMethods.map(method => (
              <option key={method} value={method}>
                {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-[#F3F4F6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="veterinarian">Veterinarian</Label>
          <Input
            id="veterinarian"
            name="veterinarian"
            value={formData.veterinarian}
            onChange={handleInputChange}
            placeholder="Dr. Smith"
          />
        </div>
        <div>
          <Label htmlFor="cost">Cost ($)</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={handleInputChange}
            placeholder="150.00"
          />
        </div>
      </div>
      {/* Expected Due Date Display */}
      {selectedAnimal && formData.breedingDate && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Expected Due Date</h4>
          <p className="text-blue-800">
            Based on {selectedAnimal.species} gestation period: {
              (() => {
                const breedingDate = new Date(formData.breedingDate)
                const gestationPeriods: { [key: string]: number } = {
                  cattle: 283,
                  sheep: 147,
                  goat: 150,
                  pig: 114,
                  horse: 340
                }
                const gestationDays = gestationPeriods[selectedAnimal.species] || 150
                const dueDate = new Date(breedingDate.getTime() + gestationDays * 24 * 60 * 60 * 1000)
                return dueDate.toLocaleDateString()
              })()
            }
          </p>
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
          placeholder="Any additional notes about this breeding event..."
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
          {isSubmitting ? 'Adding Breeding Record...' : 'Add Breeding Record'}
        </Button>
      </div>
    </form>
  )
}