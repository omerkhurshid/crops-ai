'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function ClientFarmsPage() {
  const { data: session, status } = useSession()
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchFarms() {
      if (status === 'loading') return
      
      if (!session) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      try {
        console.log('🔍 Fetching farms for user:', session.user)
        const response = await fetch('/api/farms', {
          credentials: 'include'
        })
        
        console.log('🔍 Farms API response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Farms API error:', errorText)
          throw new Error(`Failed to fetch farms: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('✅ Farms data received:', data)
        
        setFarms(data.farms || data.data?.farms || [])
      } catch (err) {
        console.error('❌ Error fetching farms:', err)
        setError(err instanceof Error ? err.message : 'Failed to load farms')
      } finally {
        setLoading(false)
      }
    }

    fetchFarms()
  }, [session, status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-agricultural flex items-center justify-center">
        <div className="text-white text-xl">Loading farms...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-agricultural flex items-center justify-center">
        <div className="text-white text-xl">Please log in to view farms</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-agricultural flex items-center justify-center">
        <div className="text-red-300 text-xl">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-agricultural">
      <div className="absolute inset-0 agricultural-overlay"></div>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-8 lg:px-16 py-12 sm:px-0">
          {/* Header */}
          <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">My Farms</h1>
              <p className="text-2xl text-white/80 font-light">Manage and monitor your agricultural operations</p>
              <p className="text-lg text-white/60 mt-2">User: {session.user?.email}</p>
            </div>
            <Link href="/farms/create">
              <button className="border-2 border-white/50 bg-transparent text-white hover:bg-white/10 transition-all duration-300 rounded-full px-8 py-4 font-light text-lg">
                + Add New Farm
              </button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Farms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{farms.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {farms.reduce((total: number, farm: any) => total + (farm.totalArea || 0), 0).toFixed(1)} ha
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {farms.reduce((total: number, farm: any) => total + (farm.fieldsCount || 0), 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Regions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {new Set(farms.map((farm: any) => farm.region || 'Unknown').filter((r: string) => r !== 'Unknown')).size || 1}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Info */}
          <div className="mb-6 p-4 bg-white/10 rounded-lg text-white">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <p>Farms count: {farms.length}</p>
            <p>Session user: {JSON.stringify(session.user, null, 2)}</p>
          </div>

          {/* Farms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.length > 0 ? farms.map((farm: any) => (
              <Card key={farm.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{farm.name}</CardTitle>
                      <CardDescription>
                        {farm.address || `${farm.region || 'Unknown'}, ${farm.country || 'Unknown'}`}
                      </CardDescription>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Area:</span>
                      <span className="text-sm font-medium">{farm.totalArea?.toFixed(1) || 0} ha</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fields:</span>
                      <span className="text-sm font-medium">{farm.fieldsCount || 0} fields</span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Created {new Date(farm.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12">
                <div className="text-white">
                  <p className="text-lg font-medium mb-2">No farms found</p>
                  <p className="text-sm mb-4">Create your first farm to get started with agricultural monitoring</p>
                  <Button asChild>
                    <Link href="/farms/create">
                      Create Your First Farm
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}