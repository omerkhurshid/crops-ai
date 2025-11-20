'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'
interface AddAnimalFormProps {
  farms: any[]
  parentAnimals: any[]
  userId: string
}
export function AddAnimalForm({ farms, parentAnimals, userId }: AddAnimalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    farmId: farms[0]?.id || '',
    tagNumber: '',
    name: '',
    species: 'cattle',
    breed: '',
    gender: 'female',
    birthDate: '',
    birthWeight: '',
    motherId: '',
    fatherId: '',
    color: '',
    markings: '',
    currentWeight: '',
    purchasePrice: '',
    purchaseDate: '',
    currentValue: '',
    notes: ''
  })
  const speciesOptions = [
    'cattle', 'sheep', 'goat', 'pig', 'chicken', 'horse', 'duck', 'goose', 'turkey'
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
      if (!formData.tagNumber || !formData.species || !formData.gender) {
        throw new Error('Please fill in all required fields')
      }
      // Check for duplicate tag number
      const response = await fetch('/api/livestock/animals/check-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tagNumber: formData.tagNumber, 
          farmId: formData.farmId 
        })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to validate tag number')
      }
      const { exists } = await response.json()
      if (exists) {
        throw new Error('An animal with this tag number already exists on this farm')
      }
      // Submit animal data
      const submitResponse = await fetch('/api/livestock/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          birthWeight: formData.birthWeight ? parseFloat(formData.birthWeight) : null,
          currentWeight: formData.currentWeight ? parseFloat(formData.currentWeight) : null,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
          birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
          purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
          motherId: formData.motherId || null,
          fatherId: formData.fatherId || null
        })
      })
      if (!submitResponse.ok) {
        const error = await submitResponse.json()
        throw new Error(error.message || 'Failed to add animal')
      }
      const newAnimal = await submitResponse.json()
      toast.success('Animal added successfully!')
      router.push(`/livestock/animals/${newAnimal.id}`)
    } catch (error) {
      console.error('Error adding animal:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add animal')
    } finally {
      setIsSubmitting(false)
    }
  }
  const motherOptions = parentAnimals.filter(animal => 
    animal.gender === 'female' && animal.species === formData.species
  )
  const fatherOptions = parentAnimals.filter(animal => 
    animal.gender === 'male' && animal.species === formData.species
  )
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="farmId">Farm *</Label>
          <select
            id="farmId"
            name="farmId"
            value={formData.farmId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {farms.map(farm => (
              <option key={farm.id} value={farm.id}>{farm.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="tagNumber">Tag Number *</Label>
          <Input
            id="tagNumber"
            name="tagNumber"
            value={formData.tagNumber}
            onChange={handleInputChange}
            placeholder="e.g., 001, A-123"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Name (Optional)</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Bessie"
          />
        </div>
        <div>
          <Label htmlFor="species">Species *</Label>
          <select
            id="species"
            name="species"
            value={formData.species}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {speciesOptions.map(species => (
              <option key={species} value={species}>
                {species.charAt(0).toUpperCase() + species.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            placeholder="e.g., Holstein, Angus"
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>
      {/* Birth Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="birthDate">Birth Date</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="birthWeight">Birth Weight (lbs)</Label>
          <Input
            id="birthWeight"
            name="birthWeight"
            type="number"
            step="0.1"
            value={formData.birthWeight}
            onChange={handleInputChange}
            placeholder="e.g., 75"
          />
        </div>
        <div>
          <Label htmlFor="currentWeight">Current Weight (lbs)</Label>
          <Input
            id="currentWeight"
            name="currentWeight"
            type="number"
            step="0.1"
            value={formData.currentWeight}
            onChange={handleInputChange}
            placeholder="e.g., 1200"
          />
        </div>
      </div>
      {/* Parentage */}
      {parentAnimals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="motherId">Mother</Label>
            <select
              id="motherId"
              name="motherId"
              value={formData.motherId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select mother...</option>
              {motherOptions.map(animal => (
                <option key={animal.id} value={animal.id}>
                  #{animal.tagNumber} {animal.name && `(${animal.name})`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="fatherId">Father</Label>
            <select
              id="fatherId"
              name="fatherId"
              value={formData.fatherId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select father...</option>
              {fatherOptions.map(animal => (
                <option key={animal.id} value={animal.id}>
                  #{animal.tagNumber} {animal.name && `(${animal.name})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {/* Physical Characteristics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            placeholder="e.g., Black, Brown, White"
          />
        </div>
        <div>
          <Label htmlFor="markings">Markings</Label>
          <Input
            id="markings"
            name="markings"
            value={formData.markings}
            onChange={handleInputChange}
            placeholder="e.g., White blaze, Spot on left flank"
          />
        </div>
      </div>
      {/* Financial Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
          <Input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={handleInputChange}
            placeholder="e.g., 1500"
          />
        </div>
        <div>
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="currentValue">Current Value ($)</Label>
          <Input
            id="currentValue"
            name="currentValue"
            type="number"
            step="0.01"
            value={formData.currentValue}
            onChange={handleInputChange}
            placeholder="e.g., 1800"
          />
        </div>
      </div>
      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Any additional notes about this animal..."
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
          {isSubmitting ? 'Adding Animal...' : 'Add Animal'}
        </Button>
      </div>
    </form>
  )
}