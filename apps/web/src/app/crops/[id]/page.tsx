/**
 * Crop Details Page with Comprehensive Database Information
 */

'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { ArrowLeft, MapPin, Calendar, Thermometer, Droplets, Leaf, TrendingUp, Users, Award } from 'lucide-react'
import Link from 'next/link'

interface CropDetails {
  id: string;
  name: string;
  scientific_name: string;
  common_names: string[];
  crop_type: string;
  growth_habit: string;
  climate_zones: string[];
  days_to_maturity_min: number;
  days_to_maturity_max: number;
  average_yield_kg_per_hectare: number;
  water_requirements: string;
  soil_ph_min: number;
  soil_ph_max: number;
  frost_tolerance: string;
  drought_tolerance: string;
  heat_tolerance: string;
  nutrition_data?: {
    calories_per_100g: number;
    protein_g: number;
    carbohydrates_g: number;
    fiber_g: number;
  };
  varieties?: {
    variety_name: string;
    yield_potential_kg_per_hectare: number;
    disease_resistance: string[];
    maturity_days: number;
  }[];
  companion_plants: string[];
  pest_susceptibilities: string[];
  disease_susceptibilities: string[];
  major_producing_countries: string[];
}

export default function CropDetailPage() {
  const params = useParams()
  const cropId = params.id as string
  const [crop, setCrop] = useState<CropDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load crop data from our comprehensive database
    const loadCropDetails = async () => {
      try {
        setLoading(true)
        
        // For now, load from the JSON file we created
        const response = await fetch('/comprehensive-crops-data.json')
        const data = await response.json()
        
        const foundCrop = data.crops.find((c: any) => 
          c.name.toLowerCase().replace(/\s+/g, '_') === cropId ||
          c.scientific_name.toLowerCase().replace(/\s+/g, '_') === cropId
        )

        if (foundCrop) {
          // Add varieties from the varieties array
          const cropVarieties = data.varieties.filter((v: any) => v.crop_name === foundCrop.name)
          setCrop({
            ...foundCrop,
            id: cropId,
            varieties: cropVarieties.map((v: any) => ({
              variety_name: v.variety_name,
              yield_potential_kg_per_hectare: v.yield_potential_kg_per_hectare,
              disease_resistance: v.disease_resistance,
              maturity_days: v.maturity_days || foundCrop.days_to_maturity_max
            }))
          })
        } else {
          setError('Crop not found in comprehensive database')
        }
      } catch (err) {
        setError('Failed to load crop details')
        console.error('Error loading crop details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (cropId) {
      loadCropDetails()
    }
  }, [cropId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crop details...</p>
        </div>
      </div>
    )
  }

  if (error || !crop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Crop Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested crop could not be found.'}</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{crop.name}</h1>
                <p className="text-lg text-gray-600 italic">{crop.scientific_name}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {crop.crop_type.charAt(0).toUpperCase() + crop.crop_type.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growing">Growing Guide</TabsTrigger>
            <TabsTrigger value="varieties">Varieties</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-sage-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Maturity</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {crop.days_to_maturity_min}-{crop.days_to_maturity_max} days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-sage-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Yield</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(crop.average_yield_kg_per_hectare / 1000).toFixed(1)} t/ha
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-sage-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Water Needs</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">
                        {crop.water_requirements}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-5 w-5 text-sage-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">pH Range</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {crop.soil_ph_min}-{crop.soil_ph_max}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Names & Climate */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Common Names</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {crop.common_names.map((name, index) => (
                      <Badge key={index} variant="outline">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Climate Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {crop.climate_zones.map((zone, index) => (
                      <Badge key={index} variant="secondary">
                        {zone.charAt(0).toUpperCase() + zone.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tolerance Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Environmental Tolerance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Frost Tolerance</p>
                    <Badge variant={crop.frost_tolerance === 'none' ? 'destructive' : 'secondary'}>
                      {crop.frost_tolerance.charAt(0).toUpperCase() + crop.frost_tolerance.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Drought Tolerance</p>
                    <Badge variant={crop.drought_tolerance === 'high' ? 'default' : 'secondary'}>
                      {crop.drought_tolerance.charAt(0).toUpperCase() + crop.drought_tolerance.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Heat Tolerance</p>
                    <Badge variant={crop.heat_tolerance === 'high' ? 'default' : 'secondary'}>
                      {crop.heat_tolerance.charAt(0).toUpperCase() + crop.heat_tolerance.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Data */}
            {crop.nutrition_data && (
              <Card>
                <CardHeader>
                  <CardTitle>Nutritional Information (per 100g)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sage-600">{crop.nutrition_data.calories_per_100g}</p>
                      <p className="text-sm text-gray-600">Calories</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sage-600">{crop.nutrition_data.protein_g}g</p>
                      <p className="text-sm text-gray-600">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sage-600">{crop.nutrition_data.carbohydrates_g}g</p>
                      <p className="text-sm text-gray-600">Carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sage-600">{crop.nutrition_data.fiber_g}g</p>
                      <p className="text-sm text-gray-600">Fiber</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="growing" className="space-y-6">
            {/* Companion Plants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5" />
                  <span>Companion Plants</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {crop.companion_plants.map((plant, index) => (
                    <Badge key={index} variant="outline" className="text-green-700 border-green-300">
                      {plant.charAt(0).toUpperCase() + plant.slice(1)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pest & Disease Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Common Pests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {crop.pest_susceptibilities.map((pest, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-sm">{pest.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Common Diseases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {crop.disease_susceptibilities.map((disease, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-sm">{disease.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="varieties" className="space-y-6">
            {crop.varieties && crop.varieties.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {crop.varieties.map((variety, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-yellow-600" />
                          <span>{variety.variety_name}</span>
                        </CardTitle>
                        <Badge variant="outline">
                          {(variety.yield_potential_kg_per_hectare / 1000).toFixed(1)} t/ha
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Disease Resistance</p>
                          <div className="flex flex-wrap gap-1">
                            {variety.disease_resistance.map((disease, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {disease.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Maturity:</span>
                          <span className="font-medium">{variety.maturity_days} days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No specific varieties available in the database yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="markets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Major Producing Countries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {crop.major_producing_countries.map((country, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{country}</p>
                      <p className="text-sm text-gray-600">#{index + 1} Producer</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Growth Habit</p>
                    <Badge variant="outline">
                      {crop.growth_habit.charAt(0).toUpperCase() + crop.growth_habit.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Global Production</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(crop.global_production_tonnes / 1000000).toFixed(0)}M tonnes/year
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}