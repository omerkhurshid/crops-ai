'use client'
import { useState } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Users, Sprout, Heart, TreePine, Target, 
  Shield, User, UserCheck, Clock, MapPin 
} from 'lucide-react'
interface UserAnalyticsProps {
  usersByType: Array<{
    userType: string | null
    _count: number
  }>
  usersByRole: Array<{
    role: string
    _count: number
  }>
  recentActivity: Array<{
    id: string
    name: string
    createdAt: Date
    owner: {
      name: string
      email: string
    }
  }>
}
export function UserAnalytics({ usersByType, usersByRole, recentActivity }: UserAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('demographics')
  const getUserTypeIcon = (type: string | null) => {
    switch (type) {
      case 'CROPS': return <Sprout className="h-4 w-4 text-[#8FBF7F]" />
      case 'LIVESTOCK': return <Heart className="h-4 w-4 text-red-600" />
      case 'ORCHARD': return <TreePine className="h-4 w-4 text-[#7A8F78]" />
      case 'MIXED': return <Target className="h-4 w-4 text-blue-600" />
      default: return <User className="h-4 w-4 text-[#555555]" />
    }
  }
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'FARM_OWNER': return <Shield className="h-4 w-4 text-blue-600" />
      case 'FARM_MANAGER': return <UserCheck className="h-4 w-4 text-[#8FBF7F]" />
      case 'AGRONOMIST': return <User className="h-4 w-4 text-purple-600" />
      default: return <User className="h-4 w-4 text-[#555555]" />
    }
  }
  const getUserTypeName = (type: string | null) => {
    switch (type) {
      case 'CROPS': return 'Crops'
      case 'LIVESTOCK': return 'Livestock'
      case 'ORCHARD': return 'Orchard'
      case 'MIXED': return 'Mixed Operations'
      default: return 'Not Specified'
    }
  }
  const getRoleName = (role: string) => {
    switch (role) {
      case 'FARM_OWNER': return 'Farm Owner'
      case 'FARM_MANAGER': return 'Farm Manager'
      case 'AGRONOMIST': return 'Agronomist'
      default: return role
    }
  }
  const totalUsers = usersByType.reduce((sum, type) => sum + type._count, 0)
  return (
    <ModernCard variant="floating">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Analytics
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="demographics" className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Users by Interest Type</h4>
              <div className="space-y-3">
                {usersByType.map((type) => (
                  <div key={type.userType || 'unspecified'} className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded-lg">
                    <div className="flex items-center gap-3">
                      {getUserTypeIcon(type.userType)}
                      <span className="font-medium">{getUserTypeName(type.userType)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{type._count}</span>
                      <Badge variant="outline">
                        {Math.round((type._count / totalUsers) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="roles" className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Users by Role</h4>
              <div className="space-y-3">
                {usersByRole.map((role) => (
                  <div key={role.role} className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded-lg">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(role.role)}
                      <span className="font-medium">{getRoleName(role.role)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{role._count}</span>
                      <Badge variant="outline">
                        {Math.round((role._count / totalUsers) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="activity" className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Recent Farm Registrations</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between p-3 bg-[#FAFAF7] rounded-lg">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-[#8FBF7F] mt-1" />
                        <div>
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-sm text-[#555555]">
                            by {activity.owner.name} ({activity.owner.email})
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#555555]">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-[#555555]">
                    No recent farm registrations
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ModernCardContent>
    </ModernCard>
  )
}