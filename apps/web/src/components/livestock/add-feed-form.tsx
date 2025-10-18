'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'

interface AddFeedFormProps {
  farms: any[]
  animals: any[]
  userId: string
}

export function AddFeedForm({ farms, animals, userId }: AddFeedFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    animalId: '',
    feedDate: new Date().toISOString().split('T')[0],
    feedType: 'hay',
    brand: '',
    quantity: '',
    unit: 'lbs',
    costPerUnit: '',
    totalCost: '',
    protein: '',
    fat: '',
    fiber: '',
    calcium: '',
    phosphorus: '',
    notes: ''
  })

  const feedTypes = [
    'hay',
    'grain',
    'pellets',
    'corn',
    'oats',
    'barley',
    'wheat',
    'soybean_meal',
    'alfalfa',
    'grass',
    'silage',
    'mineral_supplement',
    'vitamin_supplement'
  ]

  const units = ['lbs', 'kg', 'oz', 'tons', 'bales', 'scoops']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Auto-calculate total cost when quantity or cost per unit changes
    if (name === 'quantity' || name === 'costPerUnit') {
      const newFormData = { ...formData, [name]: value }
      const quantity = parseFloat(newFormData.quantity) || 0
      const costPerUnit = parseFloat(newFormData.costPerUnit) || 0
      if (quantity > 0 && costPerUnit > 0) {
        const totalCost = quantity * costPerUnit
        setFormData(prev => ({ ...prev, [name]: value, totalCost: totalCost.toFixed(2) }))
      } else {
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.animalId || !formData.feedDate || !formData.feedType || !formData.quantity) {
        throw new Error('Please fill in all required fields')
      }

      // Submit feed record
      const response = await fetch('/api/livestock/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          quantity: parseFloat(formData.quantity),
          costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : null,
          totalCost: formData.totalCost ? parseFloat(formData.totalCost) : null,
          protein: formData.protein ? parseFloat(formData.protein) : null,
          fat: formData.fat ? parseFloat(formData.fat) : null,
          fiber: formData.fiber ? parseFloat(formData.fiber) : null,
          calcium: formData.calcium ? parseFloat(formData.calcium) : null,
          phosphorus: formData.phosphorus ? parseFloat(formData.phosphorus) : null,
          brand: formData.brand || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add feed record')
      }

      const newRecord = await response.json()
      
      toast.success('Feed record added successfully!')
      router.push('/livestock/feed')
    } catch (error) {
      console.error('Error adding feed record:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add feed record')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <Label htmlFor="feedDate">Feed Date *</Label>
          <Input
            id="feedDate"
            name="feedDate"
            type="date"
            value={formData.feedDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="feedType">Feed Type *</Label>
          <select
            id="feedType"
            name="feedType"
            value={formData.feedType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {feedTypes.map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="e.g., Purina, Nutrena"
          />
        </div>
      </div>

      {/* Quantity and Cost */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="0.1"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="50"
            required
          />
        </div>

        <div>
          <Label htmlFor="unit">Unit</Label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="costPerUnit">Cost per {formData.unit} ($)</Label>
          <Input
            id="costPerUnit"
            name="costPerUnit"
            type="number"
            step="0.01"
            value={formData.costPerUnit}
            onChange={handleInputChange}
            placeholder="0.25"
          />
        </div>

        <div>
          <Label htmlFor="totalCost">Total Cost ($)</Label>
          <Input
            id="totalCost"
            name="totalCost"
            type="number"
            step="0.01"
            value={formData.totalCost}
            onChange={handleInputChange}
            placeholder="12.50"
          />
        </div>
      </div>

      {/* Nutrition Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nutrition Information (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <Label htmlFor="protein">Protein (%)</Label>
            <Input
              id="protein"
              name="protein"
              type="number"
              step="0.1"
              value={formData.protein}
              onChange={handleInputChange}
              placeholder="18.0"
            />
          </div>

          <div>
            <Label htmlFor="fat">Fat (%)</Label>
            <Input
              id="fat"
              name="fat"
              type="number"
              step="0.1"
              value={formData.fat}
              onChange={handleInputChange}
              placeholder="3.5"
            />
          </div>

          <div>
            <Label htmlFor="fiber">Fiber (%)</Label>
            <Input
              id="fiber"
              name="fiber"
              type="number"
              step="0.1"
              value={formData.fiber}
              onChange={handleInputChange}
              placeholder="25.0"
            />
          </div>

          <div>
            <Label htmlFor="calcium">Calcium (%)</Label>
            <Input
              id="calcium"
              name="calcium"
              type="number"
              step="0.01"
              value={formData.calcium}
              onChange={handleInputChange}
              placeholder="0.75"
            />
          </div>

          <div>
            <Label htmlFor="phosphorus">Phosphorus (%)</Label>
            <Input
              id="phosphorus"
              name="phosphorus"
              type="number"
              step="0.01"
              value={formData.phosphorus}
              onChange={handleInputChange}
              placeholder="0.45"
            />
          </div>
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
          placeholder="Any additional notes about this feeding..."
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
          {isSubmitting ? 'Adding Feed Record...' : 'Add Feed Record'}
        </Button>
      </div>
    </form>
  )
}