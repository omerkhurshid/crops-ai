'use client'

import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { DashboardLayout } from '../../../components/layout/dashboard-layout'
import { Loader2, CheckCircle, AlertCircle, Satellite } from 'lucide-react'

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const seedSatelliteData = async () => {
    setLoading(true)
    setStatus('idle')
    try {
      const response = await fetch('/api/satellite/seed-demo-data', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setMessage(`Successfully created ${data.recordsCreated} satellite data records for ${data.farms.length} farms`)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to seed data')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error while seeding data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto pt-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Initialize Satellite Data
            </CardTitle>
            <CardDescription>
              Generate initial satellite data for all your fields to enable health monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will generate realistic satellite data for demonstration purposes. 
                In production, this data would come from actual satellite imagery providers.
              </p>
            </div>
            
            <Button
              onClick={seedSatelliteData}
              disabled={loading}
              className="w-full bg-sage-600 hover:bg-sage-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Satellite Data...
                </>
              ) : (
                <>
                  <Satellite className="h-4 w-4 mr-2" />
                  Initialize Satellite Data
                </>
              )}
            </Button>

            {status === 'success' && (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Success!</p>
                  <p className="text-sm text-green-700">{message}</p>
                  <p className="text-sm text-green-700 mt-2">
                    You can now view health data in your farms and crop health tabs.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}