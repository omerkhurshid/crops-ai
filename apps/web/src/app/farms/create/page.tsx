'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { MapPin, Plus, Trash2, Save, Loader2 } from 'lucide-react'

interface Field {
  id: string
  name: string
  area: number
}

interface SimpleFarm {
  name: string
  location: string
  totalArea: number
  fields: Field[]
}

export default function CreateFarmPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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
      area: 0
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

  const saveFarm = async () => {
    if (!farm.name || !farm.location || farm.fields.length === 0) {
      alert('Please fill in farm name, location, and add at least one field.')
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
          totalArea: farm.totalArea,
          fields: farm.fields.map(field => ({
            name: field.name,
            area: field.area,
            boundaries: [], // Simple version doesn't need detailed boundaries
            centerLat: 0,
            centerLng: 0
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Farm</h1>
          <p className="text-gray-600">Simple 3-step farm setup</p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Farm Name */}
          <Card>
            <CardHeader>
              <CardTitle>1. Farm Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="farmName">What's your farm called?</Label>
              <Input
                id="farmName"
                value={farm.name}
                onChange={(e) => setFarm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter farm name"
                className="mt-2"
              />
            </CardContent>
          </Card>

          {/* Step 2: Location */}
          <Card>
            <CardHeader>
              <CardTitle>2. Location</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="location">Where is your farm located?</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="location"
                  value={farm.location}
                  onChange={(e) => setFarm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter address or location"
                  className="flex-1"
                />
                <Button variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Map
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Field Splits */}
          <Card>
            <CardHeader>
              <CardTitle>3. Split Your Farm into Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {farm.fields.map((field) => (
                  <div key={field.id} className="flex gap-3 items-center p-3 border rounded-lg">
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
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Total Farm Area: {farm.totalArea} acres
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveFarm}
              disabled={isLoading || !farm.name || !farm.location || farm.fields.length === 0}
              size="lg"
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