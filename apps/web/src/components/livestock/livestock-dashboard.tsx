'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Plus, 
  Heart, 
  Activity, 
  Calendar, 
  AlertTriangle,
  Users,
  TrendingUp,
  Stethoscope,
  Award,
  Eye
} from 'lucide-react'
import { HerdRegistry } from './herd-registry'
import { HealthLogs } from './health-logs'
import { LivestockStats } from './livestock-stats'

interface LivestockDashboardProps {
  farmId: string
  showAddButtons?: boolean
}

export function LivestockDashboard({ farmId, showAddButtons = true }: LivestockDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Animals</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">+12 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Alerts</p>
                <p className="text-2xl font-bold text-orange-900">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-orange-600">2 require attention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
                <p className="text-2xl font-bold text-green-900">8.7/10</p>
              </div>
              <Heart className="h-8 w-8 text-green-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600">Excellent condition</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Vaccinations</p>
                <p className="text-2xl font-bold text-blue-900">15</p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-400" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-blue-600">Next 30 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Livestock Management
              </CardTitle>
              <CardDescription>
                Track your herds, monitor health, and manage breeding programs
              </CardDescription>
            </div>
            {showAddButtons && (
              <div className="flex gap-2">
                <Button className="bg-sage-600 hover:bg-sage-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Animal
                </Button>
                <Button variant="outline">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Log Health Event
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Overview
                </div>
              </TabsTrigger>
              <TabsTrigger value="herd">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Herd Registry
                </div>
              </TabsTrigger>
              <TabsTrigger value="health">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Health Logs
                </div>
              </TabsTrigger>
              <TabsTrigger value="breeding">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Breeding
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <LivestockStats farmId={farmId} />
            </TabsContent>

            <TabsContent value="herd" className="space-y-6 mt-6">
              <HerdRegistry farmId={farmId} />
            </TabsContent>

            <TabsContent value="health" className="space-y-6 mt-6">
              <HealthLogs farmId={farmId} />
            </TabsContent>

            <TabsContent value="breeding" className="space-y-6 mt-6">
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Breeding Program Coming Soon
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Advanced breeding management, genetic tracking, and performance analytics will be available in the next update.
                </p>
                <Button variant="outline" className="mt-4">
                  Request Early Access
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}