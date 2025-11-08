'use client'
import { useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
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
      {/* Note: Stats are now calculated from real data in the parent component */}
      {/* Main Content */}
      <ModernCard variant="soft">
        <ModernCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <ModernCardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Livestock Management
              </ModernCardTitle>
              <ModernCardDescription>
                Track your herds, monitor health, and manage breeding programs
              </ModernCardDescription>
            </div>
            {showAddButtons && (
              <div className="flex gap-2">
                <Button 
                  className="bg-sage-600 hover:bg-sage-700"
                  onClick={() => window.location.href = '/livestock/add-animal'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Animal
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/livestock/add-event'}
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Log Health Event
                </Button>
              </div>
            )}
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
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
        </ModernCardContent>
      </ModernCard>
    </div>
  )
}