'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  MapPin, Locate, Search, Loader2, 
  Wheat, Beef, TreePine, Apple, Flower2, 
  ChevronRight, CheckCircle
} from 'lucide-react'

interface Farm {
  name: string
  type: 'crops' | 'livestock' | 'mixed' | 'orchard'
  location: {
    lat: number
    lng: number
    address?: string
  }
}

const farmTypes = [
  {
    id: 'crops',
    name: 'Row Crops',
    description: 'Corn, soybeans, wheat, etc.',
    icon: <Wheat className="h-8 w-8" />,
    color: 'border-green-500 bg-green-50 text-green-700'
  },
  {
    id: 'livestock',
    name: 'Livestock',
    description: 'Cattle, poultry, swine, etc.',
    icon: <Beef className="h-8 w-8" />,
    color: 'border-orange-500 bg-orange-50 text-orange-700'
  },
  {
    id: 'orchard',
    name: 'Orchard',
    description: 'Fruits, nuts, berries',
    icon: <Apple className="h-8 w-8" />,
    color: 'border-red-500 bg-red-50 text-red-700'
  },
  {
    id: 'mixed',
    name: 'Mixed Farm',
    description: 'Multiple operations',
    icon: <TreePine className="h-8 w-8" />,
    color: 'border-blue-500 bg-blue-50 text-blue-700'
  }
]

export function SimpleFarmCreator() {
  const [farm, setFarm] = useState<Farm>({
    name: '',
    type: 'crops',
    location: { lat: 0, lng: 0 }
  })
  const [locationInput, setLocationInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const router = useRouter()

  const getCurrentLocation = () => {
    setDetectingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFarm(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }))
          setDetectingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setDetectingLocation(false)
          alert('Unable to get your location. Please enter it manually.')
        }
      )
    } else {
      setDetectingLocation(false)
      alert('Location services not available in your browser.')
    }
  }

  const parseLocationInput = async () => {
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/
    
    if (coordPattern.test(locationInput.trim())) {
      const [lat, lng] = locationInput.split(',').map(coord => parseFloat(coord.trim()))
      setFarm(prev => ({
        ...prev,
        location: { lat, lng }
      }))
    } else {
      // For address input, use default coordinates (in production would geocode)
      setFarm(prev => ({
        ...prev,
        location: { lat: 40.7128, lng: -74.0060, address: locationInput }
      }))
    }
  }

  const handleSubmit = async () => {
    if (!farm.name || !farm.type || farm.location.lat === 0) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: farm.name,
          latitude: farm.location.lat,
          longitude: farm.location.lng,
          address: farm.location.address || '',
          country: 'US',
          totalArea: 100, // Default area
          primaryProduct: farm.type === 'crops' ? 'corn-field' : 'cattle-beef',
          metadata: {
            farmType: farm.type,
            simplified: true
          }
        })
      })

      if (!response.ok) throw new Error('Failed to create farm')
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating farm:', error)
      alert('Failed to create farm. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValid = farm.name && farm.type && farm.location.lat !== 0

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-light">Create Your Farm</CardTitle>
        <CardDescription>
          Get started with Cropple.ai in just 3 simple steps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Farm Name */}
        <div>
          <Label htmlFor="farm-name" className="text-base font-medium">
            1. What's your farm called?
          </Label>
          <Input
            id="farm-name"
            type="text"
            placeholder="e.g., Smith Family Farm"
            value={farm.name}
            onChange={(e) => setFarm(prev => ({ ...prev, name: e.target.value }))}
            className="mt-2 text-lg h-12"
            autoFocus
          />
        </div>

        {/* Step 2: Farm Type */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            2. What type of farming do you do?
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {farmTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFarm(prev => ({ ...prev, type: type.id as any }))}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  farm.type === type.id
                    ? type.color
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={farm.type === type.id ? '' : 'text-gray-400'}>
                    {type.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{type.name}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Location */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            3. Where is your farm located?
          </Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter address or GPS coordinates (lat, lng)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={parseLocationInput}
                disabled={!locationInput}
                variant="outline"
              >
                <Search className="h-4 w-4 mr-1" />
                Find
              </Button>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-gray-500">or</span>
            </div>
            
            <Button
              onClick={getCurrentLocation}
              disabled={detectingLocation}
              variant="outline"
              className="w-full"
            >
              {detectingLocation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Locate className="h-4 w-4 mr-2" />
              )}
              Use My Current Location
            </Button>
          </div>

          {/* Location Preview */}
          {farm.location.lat !== 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Location set: {farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}
                  </p>
                  {farm.location.address && (
                    <p className="text-sm text-green-700">{farm.location.address}</p>
                  )}
                  <p className="text-xs text-green-600 mt-1">
                    You can add field boundaries and details later from your dashboard
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* What You'll Get */}
        {isValid && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Your farm will be ready with:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Satellite monitoring</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Weather alerts</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>AI recommendations</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Financial tracking</span>
              </div>
            </div>
          </div>
        )}

        {/* Create Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="w-full h-12 text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Farm...
            </>
          ) : (
            <>
              Create Farm & Go to Dashboard
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}