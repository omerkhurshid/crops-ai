'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { MapPin, Plus, Save, AlertCircle } from 'lucide-react'
import { FieldFormWithMap } from './field-form-with-map'

interface FieldFormProps {
  farmId: string
  farmName: string
  farmLatitude: number | null
  farmLongitude: number | null
  farmTotalArea?: number
  existingFields?: Array<{ id: string; name: string; area: number }>
}

const cropTypes = [
  'Corn', 'Soybean', 'Wheat', 'Cotton', 'Rice', 'Barley', 'Oats', 'Canola', 
  'Sunflower', 'Potato', 'Tomato', 'Lettuce', 'Carrot', 'Onion', 'Other'
]

const soilTypes = [
  'Clay', 'Sandy', 'Loam', 'Silt', 'Sandy Loam', 'Clay Loam', 'Silty Clay', 
  'Silty Clay Loam', 'Sandy Clay', 'Sandy Clay Loam', 'Unknown'
]

export function FieldForm({ farmId, farmName, farmLatitude, farmLongitude, farmTotalArea, existingFields }: FieldFormProps) {
  // Use the enhanced form with map if we have coordinates
  if (farmLatitude && farmLongitude) {
    return (
      <FieldFormWithMap
        farmId={farmId}
        farmName={farmName}
        farmLatitude={farmLatitude}
        farmLongitude={farmLongitude}
        farmTotalArea={farmTotalArea}
        existingFields={existingFields}
      />
    )
  }
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    cropType: '',
    soilType: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Field name is required'
    if (!formData.area || parseFloat(formData.area) <= 0) return 'Valid area is required'
    if (!formData.cropType) return 'Crop type is required'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          farmId,
          name: formData.name,
          area: parseFloat(formData.area),
          cropType: formData.cropType || undefined,
          soilType: formData.soilType || undefined
        })
      })

      if (!response.ok) {
        const data = await response.json()
        // Handle both string errors and error objects
        const errorMessage = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || 'Failed to create field'
        throw new Error(errorMessage)
      }

      const field = await response.json()
      router.push(`/farms/${farmId}`)
      router.refresh()
    } catch (err) {
      console.error('Field creation error:', err)
      // Ensure we always display a string error message
      let errorMessage = 'An error occurred'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message)
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Field Information</CardTitle>
        <CardDescription>
          Define the basic properties of your field for {farmName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Field Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. North Field, Field A"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="area">Area (hectares) *</Label>
              <Input
                id="area"
                name="area"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 25.5"
                value={formData.area}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.area && !isNaN(parseFloat(formData.area)) && 
                  `≈ ${(parseFloat(formData.area) * 2.47).toFixed(1)} acres`}
              </p>
            </div>
          </div>

          {/* Crop and Soil Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="cropType">Crop Type *</Label>
              <select
                id="cropType"
                name="cropType"
                value={formData.cropType}
                onChange={handleChange}
                required
                disabled={loading}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a crop</option>
                {cropTypes.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="soilType">Soil Type (Optional)</Label>
              <select
                id="soilType"
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                disabled={loading}
                className="flex h-10 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select soil type</option>
                {soilTypes.map(soil => (
                  <option key={soil} value={soil}>{soil}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Farm Location Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Farm Location</span>
            </div>
            <p className="text-sm text-blue-700">
              This field will inherit location coordinates from {farmName}
              {farmLatitude && farmLongitude && 
                ` (${farmLatitude.toFixed(4)}°N, ${Math.abs(farmLongitude).toFixed(4)}°${farmLongitude < 0 ? 'W' : 'E'})`
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>Creating Field...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Field
                </>
              )}
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
      </CardContent>
    </Card>
  )
}