'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../components/ui/modern-card'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { GoogleMapsFieldEditor } from '../../../components/farm/google-maps-field-editor'
import { MapPin, Plus, Trash2, Save, Loader2, Navigation } from 'lucide-react'

interface Field {
  id: string
  name: string
  area: number
  boundaries: Array<{ lat: number; lng: number }>
  centerLat: number
  centerLng: number
}

interface SimpleFarm {
  name: string
  location: string
  coordinates?: { lat: number; lng: number }
  totalArea: number
  fields: Field[]
}

export default function CreateFarmPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showMapEditor, setShowMapEditor] = useState(false)
  const [farm, setFarm] = useState<SimpleFarm>({
    name: '',
    location: '',
    totalArea: 0,
    fields: []
  })

  const addField = () => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      name: `Field ${farm.fields.length + 1}`,
      area: 0,
      boundaries: [],
      centerLat: farm.coordinates?.lat || 0,
      centerLng: farm.coordinates?.lng || 0
    }
    setFarm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    setFarm(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const removeField = (fieldId: string) => {
    setFarm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const calculateTotalArea = () => {
    const total = farm.fields.reduce((sum, field) => sum + (field.area || 0), 0)
    setFarm(prev => ({ ...prev, totalArea: total }))
  }

  const getCurrentLocation = async () => {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          })
        })
        
        const { latitude, longitude } = position.coords
        setFarm(prev => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude },
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }))
        setShowMapEditor(true)
      } catch (error) {
        alert('Could not get your location. Please enter an address manually.')
      }
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleLocationSearch = async () => {
    if (!farm.location.trim()) return
    
    // Simple geocoding with Google Maps API would go here
    // For now, just show the map editor
    setShowMapEditor(true)
  }

  const handleFieldsDetected = (fields: Field[]) => {
    setFarm(prev => ({
      ...prev,
      fields,
      totalArea: fields.reduce((sum, field) => sum + field.area, 0)
    }))
    setShowMapEditor(false)
  }

  const saveFarm = async () => {
    if (!farm.name || !farm.location) {
      alert('Please fill in farm name and location.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: farm.name,
          location: farm.location,
          latitude: farm.coordinates?.lat || 0,
          longitude: farm.coordinates?.lng || 0,
          totalArea: farm.totalArea,
          fields: farm.fields.map(field => ({
            name: field.name,
            area: field.area,
            boundaries: field.boundaries,
            centerLat: field.centerLat,
            centerLng: field.centerLng
          }))
        })
      })

      if (response.ok) {
        router.push('/farms')
      } else {
        throw new Error('Failed to create farm')
      }
    } catch (error) {
      console.error('Error creating farm:', error)
      alert('Failed to create farm. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (showMapEditor) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowMapEditor(false)}
              className="mb-4"
            >
              ← Back to Farm Details
            </Button>
            <h1 className="text-3xl font-bold text-sage-800 mb-2">Map Your Fields</h1>
            <p className="text-sage-600">Draw field boundaries and customize your farm layout</p>
          </div>

          <GoogleMapsFieldEditor
            farmLocation={farm.coordinates || { lat: 40.7128, lng: -74.0060 }}
            onFieldsDetected={handleFieldsDetected}
            onClose={() => setShowMapEditor(false)}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sage-800 mb-2">Create New Farm</h1>
          <p className="text-sage-600">Simple setup to get your farm up and running</p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Farm Name */}
          <ModernCard variant="soft">
            <ModernCardHeader>
              <ModernCardTitle>1. Farm Name</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <Label htmlFor="farmName">What's your farm called?</Label>
              <Input
                id="farmName"
                value={farm.name}
                onChange={(e) => setFarm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter farm name"
                className="mt-2"
              />
            </ModernCardContent>
          </ModernCard>

          {/* Step 2: Location */}
          <ModernCard variant="soft">
            <ModernCardHeader>
              <ModernCardTitle>2. Location</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <Label htmlFor="location">Where is your farm located?</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="location"
                  value={farm.location}
                  onChange={(e) => setFarm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter address or location"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (farm.location.trim()) {
                        handleLocationSearch()
                      }
                    }
                  }}
                />
                <Button 
                  variant="outline"
                  onClick={handleLocationSearch}
                  disabled={!farm.location.trim()}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Find & Map
                </Button>
              </div>
              
              <div className="mt-3">
                <Button
                  variant="ghost"
                  onClick={getCurrentLocation}
                  className="text-sage-600"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Use Current Location
                </Button>
              </div>
            </ModernCardContent>
          </ModernCard>

          {/* Step 3: Basic Field Setup (if no map) */}
          {!showMapEditor && (
            <ModernCard variant="soft">
              <ModernCardHeader>
                <ModernCardTitle>3. Quick Field Setup</ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-4">
                  {farm.fields.map((field) => (
                    <div key={field.id} className="flex gap-3 items-center p-3 border rounded-lg bg-sage-50">
                      <div className="flex-1">
                        <Input
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          placeholder="Field name"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          value={field.area || ''}
                          onChange={(e) => {
                            updateField(field.id, { area: parseFloat(e.target.value) || 0 })
                            calculateTotalArea()
                          }}
                          placeholder="Acres"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    onClick={addField}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>

                  {farm.fields.length > 0 && (
                    <div className="bg-sage-100 p-3 rounded-lg">
                      <p className="text-sm font-medium text-sage-800">
                        Total Farm Area: {farm.totalArea.toFixed(1)} acres
                      </p>
                    </div>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveFarm}
              disabled={isLoading || !farm.name || !farm.location}
              size="lg"
              className="bg-sage-600 hover:bg-sage-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Farm
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}